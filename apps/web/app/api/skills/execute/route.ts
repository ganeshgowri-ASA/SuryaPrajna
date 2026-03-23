import { type NextRequest, NextResponse } from "next/server";

// Skill registry — maps skill IDs to system prompts
const SKILL_PROMPTS: Record<string, { system: string; agent: string }> = {
  "pvlib-analysis": {
    system:
      "You are Phala-Agent, a PV energy yield specialist. Perform pvlib-based solar energy modeling including yield simulation, system analysis, and performance estimation. Write Python code using pvlib. Provide results with proper units (kWh, kWh/kWp, %). Include monthly breakdown, Performance Ratio, CUF, and Specific Yield. Reference IEC 61724.",
    agent: "Phala-Agent",
  },
  "iec-61215-protocol": {
    system:
      "You are Pariksha-Agent, a PV testing specialist. Generate IEC 61215 design qualification test protocols. List test groups (A-D) and MQT sequences. Specify sample requirements, test conditions, pass/fail criteria per IEC 61215:2021, and duration estimates.",
    agent: "Pariksha-Agent",
  },
  "lcoe-calculator": {
    system:
      "You are Nivesha-Agent, a PV financial modeling specialist. Calculate LCOE with discounted cash flows. Include CAPEX, OPEX, degradation, discount rate. Provide IRR, NPV, payback period, and sensitivity analysis. Use region-appropriate cost benchmarks. Provide Python code.",
    agent: "Nivesha-Agent",
  },
  "weibull-reliability": {
    system:
      "You are Nityata-Agent, a PV reliability specialist. Perform Weibull analysis: fit distribution, calculate shape/scale parameters, determine failure mode, predict reliability at time horizons, provide MTBF. Include Python code using scipy.stats.weibull_min.",
    agent: "Nityata-Agent",
  },
  "shading-analysis": {
    system:
      "You are Vinyasa-Agent, a PV plant design specialist. Perform shading analysis: calculate inter-row shading based on tilt, GCR, latitude. Determine shading loss, suggest optimal row spacing, consider horizon effects, provide seasonal patterns. Use pvlib shading models.",
    agent: "Vinyasa-Agent",
  },
  "el-imaging": {
    system:
      "You are Dravya-Agent, a PV materials specialist. Analyze EL imaging for defects: classify types (cracks, inactive areas, shunts, PID), assess severity and performance impact, recommend corrective actions. Reference IEC TS 60904-13.",
    agent: "Dravya-Agent",
  },
};

function buildGenericPrompt(skillId: string): string {
  const skillName = skillId.replace(/-/g, " ");
  return `You are a domain specialist in the SuryaPrajna PV scientific workspace executing the "${skillName}" skill. Provide detailed, technically accurate responses about ${skillName} in photovoltaic engineering. Include calculations, Python code (pvlib, numpy, pandas, scipy), SI units, and IEC standard references.`;
}

function getKeys(req: NextRequest) {
  return {
    anthropic: req.headers.get("x-anthropic-key") || process.env.ANTHROPIC_API_KEY || "",
    openai: req.headers.get("x-openai-key") || process.env.OPENAI_API_KEY || "",
    perplexity: req.headers.get("x-perplexity-key") || process.env.PERPLEXITY_API_KEY || "",
  };
}

function selectProvider(
  provider: string | undefined,
  keys: { anthropic: string; openai: string; perplexity: string },
) {
  if (provider === "perplexity" && keys.perplexity) return "perplexity";
  if (provider === "openai" && keys.openai) return "openai";
  if (provider === "anthropic" && keys.anthropic) return "anthropic";
  if (keys.anthropic) return "anthropic";
  if (keys.openai) return "openai";
  if (keys.perplexity) return "perplexity";
  return null;
}

async function callProvider(
  chosen: string,
  keys: { anthropic: string; openai: string; perplexity: string },
  systemPrompt: string,
  userMessage: string,
  model?: string,
): Promise<{
  content?: string;
  error?: string;
  provider?: string;
  citations?: unknown;
  status?: number;
}> {
  if (chosen === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": keys.anthropic,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
    if (!res.ok) return { error: await res.text(), status: res.status };
    const data = await res.json();
    return { content: data.content?.[0]?.text || "No response.", provider: "anthropic" };
  }

  if (chosen === "perplexity") {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${keys.perplexity}` },
      body: JSON.stringify({
        model: model || "sonar-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 4096,
      }),
    });
    if (!res.ok) return { error: await res.text(), status: res.status };
    const data = await res.json();
    return {
      content: data.choices?.[0]?.message?.content || "No response.",
      provider: "perplexity",
      citations: data.citations,
    };
  }

  // OpenAI
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${keys.openai}` },
    body: JSON.stringify({
      model: model || "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 4096,
    }),
  });
  if (!res.ok) return { error: await res.text(), status: res.status };
  const data = await res.json();
  return { content: data.choices?.[0]?.message?.content || "No response.", provider: "openai" };
}

export async function POST(req: NextRequest) {
  try {
    const { skill_id, input_data, provider, model } = await req.json();

    const keys = getKeys(req);
    const skillDef = SKILL_PROMPTS[skill_id];
    const systemPrompt = skillDef?.system || buildGenericPrompt(skill_id);
    const agentName = skillDef?.agent || "Surya-Orchestrator";

    const chosen = selectProvider(provider, keys);
    if (!chosen) {
      return NextResponse.json(
        {
          error: "No API key configured. Go to Settings to add your API keys.",
          agent: agentName,
          skillId: skill_id,
        },
        { status: 401 },
      );
    }

    const userMessage = typeof input_data === "string" ? input_data : JSON.stringify(input_data);
    const result = await callProvider(chosen, keys, systemPrompt, userMessage, model);

    if (result.error) {
      return NextResponse.json(
        { error: result.error, agent: agentName },
        { status: result.status || 500 },
      );
    }

    return NextResponse.json({
      content: result.content,
      provider: result.provider,
      agent: agentName,
      skillId: skill_id,
      citations: result.citations,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
