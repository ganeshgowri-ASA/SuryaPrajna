// Claim Confidence Analyzer - Jenni.ai-inspired Citation Verification
// Analyzes claims in research papers and verifies them against cited sources

export type ClaimCategory =
  | "supported"
  | "unsupported"
  | "overstated"
  | "contradicted"
  | "misrepresented"
  | "unverifiable";

export type ClaimSeverity = "info" | "warning" | "error";

export interface ClaimResult {
  id: string;
  lineNumber: number;
  claimText: string;
  category: ClaimCategory;
  severity: ClaimSeverity;
  confidence: number; // 0-100
  sourceRef?: string;
  explanation: string;
  suggestedFix?: string;
  status: "pending" | "accepted" | "rejected";
}

export interface ClaimAnalysisReport {
  totalClaims: number;
  issuesFound: number;
  overallScore: number; // 0-100
  results: ClaimResult[];
  analyzedAt: string;
}

const CATEGORY_CONFIG: Record<
  ClaimCategory,
  { label: string; color: string; severity: ClaimSeverity; icon: string }
> = {
  supported: { label: "Supported", color: "#22c55e", severity: "info", icon: "\u2713" },
  unsupported: { label: "Unsupported", color: "#ef4444", severity: "error", icon: "\u2717" },
  overstated: { label: "Overstated", color: "#f97316", severity: "warning", icon: "\u26A0" },
  contradicted: { label: "Contradicted", color: "#ef4444", severity: "error", icon: "\u2717" },
  misrepresented: { label: "Misrepresented", color: "#eab308", severity: "warning", icon: "\u26A0" },
  unverifiable: { label: "Unverifiable", color: "#6b7280", severity: "info", icon: "?" },
};

export function getCategoryConfig(category: ClaimCategory) {
  return CATEGORY_CONFIG[category];
}

// Extract claims (sentences with citations or factual assertions) from markdown
export function extractClaims(content: string): { text: string; line: number }[] {
  const lines = content.split("\n");
  const claims: { text: string; line: number }[] = [];
  const claimPatterns = [
    /\[\d+\]/,           // numbered citations [1], [2]
    /\[@\w+/,            // bibtex citations [@author
    /\\cite\{/,          // latex citations
    /(?:studies? show|research (?:indicates|suggests|demonstrates)|according to|it (?:has been|was) (?:shown|found|demonstrated|reported))/i,
    /(?:significantly|approximately|typically|generally|always|never|all|every|no )\s/i,
    /(?:increases?|decreases?|improves?|reduces?|enhances?)\s.*(?:by|to|from)\s+\d/i,
    /(?:efficiency|performance|degradation|reliability)\s.*(?:is|was|are|were)\s/i,
  ];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (
      trimmed.length > 20 &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("---") &&
      !trimmed.startsWith("$$") &&
      !trimmed.startsWith("|") &&
      !trimmed.startsWith("```")
    ) {
      const sentences = trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed];
      for (const sentence of sentences) {
        if (claimPatterns.some((p) => p.test(sentence))) {
          claims.push({ text: sentence.trim(), line: idx + 1 });
        }
      }
    }
  });
  return claims;
}

// Parse BibTeX references
export function parseReferences(bibContent: string): Record<string, string> {
  const refs: Record<string, string> = {};
  const entries = bibContent.match(/@\w+\{[^}]+,([\s\S]*?)\}/g) || [];
  for (const entry of entries) {
    const keyMatch = entry.match(/@\w+\{([^,]+),/);
    const titleMatch = entry.match(/title\s*=\s*\{([^}]+)\}/i);
    if (keyMatch) {
      refs[keyMatch[1].trim()] = titleMatch ? titleMatch[1].trim() : "Unknown title";
    }
  }
  return refs;
}

// AI-powered claim analysis using configured provider
export async function analyzeClaims(
  content: string,
  bibContent: string,
  apiKey: string,
  model: string = "claude-sonnet-4-20250514"
): Promise<ClaimAnalysisReport> {
  const claims = extractClaims(content);
  const references = parseReferences(bibContent);

  if (claims.length === 0) {
    return {
      totalClaims: 0,
      issuesFound: 0,
      overallScore: 100,
      results: [],
      analyzedAt: new Date().toISOString(),
    };
  }

  // If no API key, use heuristic analysis
  if (!apiKey) {
    return heuristicAnalysis(claims, references);
  }

  try {
    const isAnthropic = model.startsWith("claude");
    const endpoint = isAnthropic
      ? "https://api.anthropic.com/v1/messages"
      : "https://api.openai.com/v1/chat/completions";

    const systemPrompt = `You are a scientific claim verifier for PV (photovoltaic) research papers. Analyze each claim and categorize it as: supported, unsupported, overstated, contradicted, misrepresented, or unverifiable. For each claim, provide: category, confidence (0-100), explanation, and suggested fix if needed. Return valid JSON array.`;

    const userPrompt = `Analyze these claims from a PV research paper:\n\n${claims.map((c, i) => `${i + 1}. [Line ${c.line}] "${c.text}"`).join("\n")}\n\nAvailable references: ${JSON.stringify(references)}\n\nReturn JSON array with objects: {index, category, confidence, explanation, suggestedFix}`;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    let body: string;

    if (isAnthropic) {
      headers["x-api-key"] = apiKey;
      headers["anthropic-version"] = "2023-06-01";
      body = JSON.stringify({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });
    } else {
      headers["Authorization"] = `Bearer ${apiKey}`;
      body = JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 4096,
        response_format: { type: "json_object" },
      });
    }

    const response = await fetch(endpoint, { method: "POST", headers, body });
    const data = await response.json();

    const responseText = isAnthropic
      ? data.content?.[0]?.text || ""
      : data.choices?.[0]?.message?.content || "";

    const jsonMatch = responseText.match(/\[([\s\S]*?)\]/);
    if (jsonMatch) {
      const aiResults = JSON.parse(`[${jsonMatch[1]}]`);
      const results: ClaimResult[] = claims.map((claim, i) => {
        const ai = aiResults[i] || {};
        const cat = (ai.category || "unverifiable") as ClaimCategory;
        return {
          id: `claim-${i}`,
          lineNumber: claim.line,
          claimText: claim.text,
          category: cat,
          severity: getCategoryConfig(cat).severity,
          confidence: ai.confidence || 50,
          explanation: ai.explanation || "Could not verify this claim.",
          suggestedFix: ai.suggestedFix,
          status: "pending" as const,
        };
      });

      const issues = results.filter((r) => r.category !== "supported");
      return {
        totalClaims: results.length,
        issuesFound: issues.length,
        overallScore: Math.round(
          (results.filter((r) => r.category === "supported").length / results.length) * 100
        ),
        results,
        analyzedAt: new Date().toISOString(),
      };
    }
  } catch (e) {
    console.error("AI claim analysis failed, falling back to heuristic:", e);
  }

  return heuristicAnalysis(claims, references);
}

// Fallback heuristic analysis when no API key is available
function heuristicAnalysis(
  claims: { text: string; line: number }[],
  references: Record<string, string>
): ClaimAnalysisReport {
  const refKeys = Object.keys(references);
  const results: ClaimResult[] = claims.map((claim, i) => {
    const hasCitation =
      /\[\d+\]/.test(claim.text) ||
      /\[@\w+/.test(claim.text) ||
      /\\cite\{/.test(claim.text);
    const hasQuantifier =
      /(?:all|every|always|never|no |significantly|dramatically)/i.test(claim.text);
    const hasHedging =
      /(?:may|might|could|suggest|indicate|appear|seem)/i.test(claim.text);

    let category: ClaimCategory;
    let confidence: number;
    let explanation: string;
    let suggestedFix: string | undefined;

    if (hasCitation && !hasQuantifier) {
      category = "supported";
      confidence = 75;
      explanation = "Claim has a citation and uses measured language.";
    } else if (hasCitation && hasQuantifier) {
      category = "overstated";
      confidence = 60;
      explanation = "Claim has a citation but uses absolute language that may overstate findings.";
      suggestedFix = claim.text.replace(
        /(?:all|every|always|never|no |significantly|dramatically)/gi,
        (m) => {
          const hedges: Record<string, string> = {
            all: "most", every: "many", always: "typically",
            never: "rarely", "no ": "minimal ",
            significantly: "notably", dramatically: "substantially",
          };
          return hedges[m.toLowerCase()] || m;
        }
      );
    } else if (!hasCitation && !hasHedging) {
      category = "unsupported";
      confidence = 40;
      explanation = "This factual claim lacks a supporting citation.";
      suggestedFix = claim.text + " [citation needed]";
    } else if (!hasCitation && hasHedging) {
      category = "unverifiable";
      confidence = 50;
      explanation = "Claim uses hedging language but has no citation to verify against.";
    } else {
      category = "unverifiable";
      confidence = 50;
      explanation = "Unable to fully verify this claim with available information.";
    }

    return {
      id: `claim-${i}`,
      lineNumber: claim.line,
      claimText: claim.text,
      category,
      severity: getCategoryConfig(category).severity,
      confidence,
      explanation,
      suggestedFix,
      status: "pending" as const,
    };
  });

  const supported = results.filter((r) => r.category === "supported").length;
  return {
    totalClaims: results.length,
    issuesFound: results.length - supported,
    overallScore: results.length > 0 ? Math.round((supported / results.length) * 100) : 100,
    results,
    analyzedAt: new Date().toISOString(),
  };
}
