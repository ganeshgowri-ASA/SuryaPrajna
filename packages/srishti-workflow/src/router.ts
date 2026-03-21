/**
 * IntentRouter — classifies user queries and routes them to the
 * appropriate PV domain agent(s) using keyword matching on domains,
 * capabilities, and skills.
 */

import { AgentDefinition, AgentDomain, RouteResult, RouterConfig } from "./types";
import { AgentRegistry } from "./agent-registry";

/** Default router configuration. */
const DEFAULT_CONFIG: RouterConfig = {
  minConfidence: 0.1,
  maxCandidates: 3,
};

/**
 * Keyword groups mapped to domains for first-pass classification.
 * Each entry lists terms (lowercased) that signal a domain.
 */
const DOMAIN_KEYWORDS: Record<AgentDomain, string[]> = {
  "pv-materials": [
    "material", "silicon", "perovskite", "thin-film", "cdte", "cigs",
    "wafer", "xrd", "sem", "electroluminescence", "el imaging",
    "defect", "letid", "pid", "degradation physics", "characterization",
    "crystal", "amorphous", "encapsulant", "backsheet",
  ],
  "pv-cell-module": [
    "cell", "module", "bom", "bill of materials", "ctm", "cell-to-module",
    "lamination", "construction", "i-v curve", "iv curve", "efficiency",
    "temperature coefficient", "diode model", "shunt resistance",
    "series resistance", "stc", "noct", "power rating", "glass", "frame",
  ],
  "pv-testing": [
    "test", "testing", "iec 61215", "iec 61730", "iec61215", "iec61730",
    "flash test", "thermal cycling", "damp heat", "humidity freeze",
    "uv preconditioning", "nabl", "bis", "compliance", "protocol",
    "qualification", "certification", "field test",
  ],
  "pv-reliability": [
    "reliability", "fmea", "failure mode", "weibull", "mtbf",
    "root cause", "rca", "degradation rate", "warranty",
    "lifetime", "quality", "change notice", "release note",
  ],
  "pv-energy": [
    "energy yield", "irradiance", "weather", "ghi", "dni", "dhi",
    "tmy", "merra", "era5", "nsrdb", "perez", "solar resource",
    "climate", "pvlib", "pvsyst", "sam", "p50", "p90",
    "performance ratio", "pr ", "loss tree", "soiling",
    "forecasting", "exceedance",
  ],
  "pv-finance": [
    "lcoe", "irr", "npv", "payback", "finance", "cost", "investment",
    "carbon credit", "rec ", "almm", "dcr", "mnre", "bankability",
    "ppa", "lease", "loan", "sensitivity", "scenario", "economics",
    "tariff", "revenue",
  ],
  "pv-plant-design": [
    "plant design", "layout", "ground-mount", "ground mount", "rooftop",
    "floating solar", "fpv", "bipv", "vipv", "facade", "shading",
    "string sizing", "inverter matching", "sld", "single line diagram",
    "cable sizing", "array", "tracker", "fixed tilt",
  ],
  "pv-power-systems": [
    "power system", "grid", "transmission", "switchgear", "load flow",
    "hybrid", "mppt", "inverter", "battery", "bess", "storage",
    "round-trip", "harmonic", "thd", "power quality", "transformer",
    "diesel", "microgrid", "off-grid",
  ],
  "cross-cutting": [
    "report", "document", "datasheet", "compliance", "eia", "esg",
    "lca", "life cycle", "proposal", "regulatory", "filing",
    "documentation",
  ],
};

export class IntentRouter {
  private config: RouterConfig;
  private registry: AgentRegistry;

  constructor(registry: AgentRegistry, config?: Partial<RouterConfig>) {
    this.registry = registry;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Classify a user query and return ranked candidate agents.
   * Uses a scoring approach that combines domain keyword matching
   * with capability and skill term matching.
   */
  route(query: string): RouteResult[] {
    const normalizedQuery = query.toLowerCase();
    const agents = this.registry.getAll();

    // Skip the orchestrator from routing targets — it delegates, not executes.
    const routeableAgents = agents.filter(
      (a) => !a.id.includes("orchestrator"),
    );

    const scored: RouteResult[] = routeableAgents.map((agent) => {
      const { score, matchedDomains, matchedKeywords } = this.scoreAgent(
        normalizedQuery,
        agent,
      );
      return {
        agentId: agent.id,
        confidence: score,
        matchedDomains,
        matchedKeywords,
      };
    });

    // Sort descending by confidence, filter by minimum, and cap at maxCandidates
    return scored
      .filter((r) => r.confidence >= this.config.minConfidence)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, this.config.maxCandidates);
  }

  /**
   * Route and return only the single best agent.
   * Returns undefined if no agent exceeds the minimum confidence.
   */
  routeBest(query: string): RouteResult | undefined {
    const results = this.route(query);
    return results[0];
  }

  // -------------------------------------------------------------------------
  // Scoring
  // -------------------------------------------------------------------------

  private scoreAgent(
    query: string,
    agent: AgentDefinition,
  ): {
    score: number;
    matchedDomains: AgentDomain[];
    matchedKeywords: string[];
  } {
    const matchedKeywords: string[] = [];
    const matchedDomains: AgentDomain[] = [];

    let score = 0;

    // 1. Domain keyword matching (weight: 1.0 per keyword hit)
    const domainTerms = DOMAIN_KEYWORDS[agent.domain] ?? [];
    for (const term of domainTerms) {
      if (query.includes(term)) {
        score += 1.0;
        matchedKeywords.push(term);
        if (!matchedDomains.includes(agent.domain)) {
          matchedDomains.push(agent.domain);
        }
      }
    }

    // 2. Capability matching (weight: 0.8 per match)
    for (const cap of agent.capabilities) {
      const capWords = this.extractSignificantWords(cap.toLowerCase());
      for (const word of capWords) {
        if (word.length > 3 && query.includes(word)) {
          score += 0.8;
          if (!matchedKeywords.includes(word)) {
            matchedKeywords.push(word);
          }
        }
      }
    }

    // 3. Skill ID matching (weight: 1.5 — very specific signal)
    for (const skill of agent.skills) {
      const skillWords = skill.split("-");
      const fullMatch = query.includes(skill);
      if (fullMatch) {
        score += 1.5;
        matchedKeywords.push(skill);
      } else {
        // Partial match on skill name segments
        for (const sw of skillWords) {
          if (sw.length > 3 && query.includes(sw)) {
            score += 0.5;
            if (!matchedKeywords.includes(sw)) {
              matchedKeywords.push(sw);
            }
          }
        }
      }
    }

    // 4. Role matching (weight: 0.6)
    const roleWords = this.extractSignificantWords(agent.role.toLowerCase());
    for (const rw of roleWords) {
      if (rw.length > 3 && query.includes(rw)) {
        score += 0.6;
        if (!matchedKeywords.includes(rw)) {
          matchedKeywords.push(rw);
        }
      }
    }

    // Normalize score to 0-1 range using a sigmoid-like function
    const normalizedScore = 1 - 1 / (1 + score / 3);

    return {
      score: Math.round(normalizedScore * 1000) / 1000,
      matchedDomains,
      matchedKeywords: [...new Set(matchedKeywords)],
    };
  }

  /** Extract words longer than 3 characters, stripping punctuation. */
  private extractSignificantWords(text: string): string[] {
    return text
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3);
  }
}
