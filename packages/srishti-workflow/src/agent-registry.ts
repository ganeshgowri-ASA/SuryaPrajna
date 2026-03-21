/**
 * AgentRegistry — discovers and stores PV domain agent definitions
 * by parsing the AGENTS.md file.
 */

import * as fs from "fs";
import * as path from "path";
import { AgentDefinition, AgentDomain } from "./types";

/** Map of recognized domain strings to their canonical AgentDomain values. */
const DOMAIN_MAP: Record<string, AgentDomain> = {
  "pv-materials": "pv-materials",
  "pv-cell-module": "pv-cell-module",
  "pv-testing": "pv-testing",
  "pv-reliability": "pv-reliability",
  "pv-energy": "pv-energy",
  "pv-finance": "pv-finance",
  "pv-plant-design": "pv-plant-design",
  "pv-power-systems": "pv-power-systems",
  "cross-cutting": "cross-cutting",
};

/**
 * Registry that holds all known agent definitions.
 * Agents are discovered by parsing AGENTS.md or registered manually.
 */
export class AgentRegistry {
  private agents: Map<string, AgentDefinition> = new Map();

  /** Return all registered agents. */
  getAll(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  /** Look up an agent by its ID (case-insensitive). */
  get(agentId: string): AgentDefinition | undefined {
    return this.agents.get(agentId.toLowerCase());
  }

  /** Register an agent definition manually. */
  register(agent: AgentDefinition): void {
    this.agents.set(agent.id.toLowerCase(), agent);
  }

  /** Get agents that belong to a specific domain. */
  getByDomain(domain: AgentDomain): AgentDefinition[] {
    return this.getAll().filter((a) => a.domain === domain);
  }

  /** Get agents that possess a given skill. */
  getBySkill(skillId: string): AgentDefinition[] {
    return this.getAll().filter((a) => a.skills.includes(skillId));
  }

  /**
   * Load agent definitions from an AGENTS.md file.
   * This parses the Markdown structure to extract agent metadata.
   */
  async loadFromFile(filePath: string): Promise<void> {
    const resolved = path.resolve(filePath);
    const content = await fs.promises.readFile(resolved, "utf-8");
    this.parseAgentsMd(content);
  }

  /**
   * Load agent definitions synchronously from an AGENTS.md file.
   */
  loadFromFileSync(filePath: string): void {
    const resolved = path.resolve(filePath);
    const content = fs.readFileSync(resolved, "utf-8");
    this.parseAgentsMd(content);
  }

  // -------------------------------------------------------------------------
  // Parsing logic
  // -------------------------------------------------------------------------

  /**
   * Parse the full text of an AGENTS.md file and populate the registry.
   *
   * Expected structure per agent (H2 heading):
   *   ## Name-Agent (Role Description)
   *   **Sanskrit:** _Word_ = meaning
   *   **Domain:** `domain-tag`
   *   **Capabilities:**
   *   - capability 1
   *   **Key skills:** `skill-1`, `skill-2`
   */
  private parseAgentsMd(content: string): void {
    // Split into sections by H2 headings
    const sections = content.split(/^## /m).slice(1); // drop preamble

    for (const section of sections) {
      const agent = this.parseSection(section);
      if (agent) {
        this.agents.set(agent.id.toLowerCase(), agent);
      }
    }
  }

  private parseSection(section: string): AgentDefinition | null {
    const lines = section.split("\n");
    const heading = lines[0]?.trim() ?? "";

    // Skip non-agent headings (e.g. "Adding New Agents", "Agent Architecture")
    if (!heading.includes("Agent") && !heading.includes("Orchestrator")) {
      return null;
    }
    if (heading.startsWith("Adding") || heading.startsWith("Agent")) {
      return null;
    }

    // Extract name and role from heading, e.g. "Dravya-Agent (Materials Science)"
    const headingMatch = heading.match(/^(.+?)\s*\((.+?)\)\s*$/);
    let name: string;
    let role: string;

    if (headingMatch) {
      name = headingMatch[1].trim();
      role = headingMatch[2].trim();
    } else {
      // Orchestrator heading: "Surya-Orchestrator"
      name = heading.trim();
      role = "Master task router and workflow coordinator";
    }

    const id = name.toLowerCase();

    // Extract Sanskrit meaning
    let sanskritMeaning = "";
    const sanskritLine = lines.find((l) => l.includes("**Sanskrit:**"));
    if (sanskritLine) {
      const meaningMatch = sanskritLine.match(/=\s*(.+)$/);
      if (meaningMatch) {
        sanskritMeaning = meaningMatch[1].trim();
      }
    }

    // Extract domain
    let domain: AgentDomain = "cross-cutting";
    const domainLine = lines.find((l) => l.includes("**Domain:**"));
    if (domainLine) {
      const domainMatch = domainLine.match(/`([^`]+)`/);
      if (domainMatch) {
        const raw = domainMatch[1].trim();
        domain = DOMAIN_MAP[raw] ?? "cross-cutting";
      }
    }

    // For the orchestrator, treat domain as cross-cutting
    if (id.includes("orchestrator")) {
      domain = "cross-cutting";
    }

    // Extract capabilities (bulleted list after **Capabilities:**)
    const capabilities: string[] = [];
    let inCapabilities = false;
    for (const line of lines) {
      if (line.includes("**Capabilities:**")) {
        inCapabilities = true;
        continue;
      }
      if (inCapabilities) {
        if (line.startsWith("- ")) {
          capabilities.push(line.replace(/^-\s*/, "").trim());
        } else if (line.trim() === "" || line.startsWith("**")) {
          inCapabilities = false;
        }
      }
    }

    // Extract skills from **Key skills:** line
    const skills: string[] = [];
    const skillsLine = lines.find((l) => l.includes("**Key skills:**"));
    if (skillsLine) {
      const skillMatches = skillsLine.matchAll(/`([^`]+)`/g);
      for (const m of skillMatches) {
        skills.push(m[1]);
      }
    }

    return {
      id,
      name,
      sanskritMeaning,
      role,
      domain,
      capabilities,
      skills,
    };
  }
}
