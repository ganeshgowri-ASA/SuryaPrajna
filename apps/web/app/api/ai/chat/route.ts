import { type NextRequest, NextResponse } from "next/server";

const DEFAULT_SYSTEM =
  "You are a helpful scientific writing assistant specializing in photovoltaic research. Help the user write, edit, and improve their academic documents.";

function chooseProvider(
  provider: string | undefined,
  anthropicKey: string,
  openaiKey: string,
  perplexityKey: string,
): string | null {
  if (provider === "perplexity" && perplexityKey) return "perplexity";
  if (provider === "openai" && openaiKey) return "openai";
  if (provider === "anthropic" && anthropicKey) return "anthropic";
  if (anthropicKey) return "anthropic";
  if (openaiKey) return "openai";
  if (perplexityKey) return "perplexity";
  return null;
}

interface ChatMessage {
  role: string;
  content: string;
}

async function callAnthropic(
  apiKey: string,
  messages: ChatMessage[],
  model: string,
  systemPrompt: string,
) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: model || "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    return { error: `Anthropic API error: ${res.status} - ${err}`, status: res.status };
  }
  const data = await res.json();
  return { content: data.content?.[0]?.text || "No response generated.", provider: "anthropic" };
}

async function callOpenAI(
  apiKey: string,
  messages: ChatMessage[],
  model: string,
  systemPrompt: string,
) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 4096,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    return { error: `OpenAI API error: ${res.status} - ${err}`, status: res.status };
  }
  const data = await res.json();
  return {
    content: data.choices?.[0]?.message?.content || "No response generated.",
    provider: "openai",
  };
}

async function callPerplexity(
  apiKey: string,
  messages: ChatMessage[],
  model: string,
  systemPrompt: string,
) {
  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || "sonar-pro",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 4096,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    return { error: `Perplexity API error: ${res.status} - ${err}`, status: res.status };
  }
  const data = await res.json();
  return {
    content: data.choices?.[0]?.message?.content || "No response generated.",
    provider: "perplexity",
    citations: data.citations,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { messages, model, systemPrompt, provider } = await req.json();

    const anthropicKey = req.headers.get("x-anthropic-key") || process.env.ANTHROPIC_API_KEY || "";
    const openaiKey = req.headers.get("x-openai-key") || process.env.OPENAI_API_KEY || "";
    const perplexityKey =
      req.headers.get("x-perplexity-key") || process.env.PERPLEXITY_API_KEY || "";

    const chosen = chooseProvider(provider, anthropicKey, openaiKey, perplexityKey);
    if (!chosen) {
      return NextResponse.json(
        { error: "No API key configured. Please add your API key in Settings." },
        { status: 401 },
      );
    }

    const system = systemPrompt || DEFAULT_SYSTEM;
    const handlers: Record<string, () => Promise<Record<string, unknown>>> = {
      anthropic: () => callAnthropic(anthropicKey, messages, model, system),
      openai: () => callOpenAI(openaiKey, messages, model, system),
      perplexity: () => callPerplexity(perplexityKey, messages, model, system),
    };

    const result = await handlers[chosen]();
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: (result.status as number) || 500 },
      );
    }
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
