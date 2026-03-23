import { type NextRequest, NextResponse } from "next/server";

const DEFAULT_SYSTEM =
  "You are a helpful scientific writing assistant specializing in photovoltaic research. Help the user write, edit, and improve their academic documents.";

function chooseProvider(provider: string | undefined, keys: Record<string, string>): string | null {
  const available: Record<string, boolean> = {
    anthropic: !!keys.anthropic,
    openai: !!keys.openai,
    perplexity: !!keys.perplexity,
    openrouter: !!keys.openrouter,
    deepseek: !!keys.deepseek,
    groq: !!keys.groq,
    ollama: true,
  };

  if (provider && available[provider]) return provider;
  // Default priority
  for (const p of [
    "anthropic",
    "openai",
    "openrouter",
    "deepseek",
    "groq",
    "perplexity",
    "ollama",
  ]) {
    if (available[p] && keys[p]) return p;
  }
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

async function callOpenRouter(
  apiKey: string,
  messages: ChatMessage[],
  model: string,
  systemPrompt: string,
) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || "anthropic/claude-sonnet-4-20250514",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 4096,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    return { error: `OpenRouter API error: ${res.status} - ${err}`, status: res.status };
  }
  const data = await res.json();
  return {
    content: data.choices?.[0]?.message?.content || "No response generated.",
    provider: "openrouter",
  };
}

async function callDeepSeek(
  apiKey: string,
  messages: ChatMessage[],
  model: string,
  systemPrompt: string,
) {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || "deepseek-chat",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 4096,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    return { error: `DeepSeek API error: ${res.status} - ${err}`, status: res.status };
  }
  const data = await res.json();
  return {
    content: data.choices?.[0]?.message?.content || "No response generated.",
    provider: "deepseek",
  };
}

async function callGroq(
  apiKey: string,
  messages: ChatMessage[],
  model: string,
  systemPrompt: string,
) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 4096,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    return { error: `Groq API error: ${res.status} - ${err}`, status: res.status };
  }
  const data = await res.json();
  return {
    content: data.choices?.[0]?.message?.content || "No response generated.",
    provider: "groq",
  };
}

async function callOllama(
  baseUrl: string,
  messages: ChatMessage[],
  model: string,
  systemPrompt: string,
) {
  const url = baseUrl || "http://localhost:11434";
  const res = await fetch(`${url}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: model || "llama3",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: false,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    return { error: `Ollama error: ${res.status} - ${err}`, status: res.status };
  }
  const data = await res.json();
  return {
    content: data.message?.content || "No response generated.",
    provider: "ollama",
  };
}

export async function POST(req: NextRequest) {
  try {
    const { messages, model, systemPrompt, provider } = await req.json();

    const providerKeys: Record<string, string> = {
      anthropic: req.headers.get("x-anthropic-key") || process.env.ANTHROPIC_API_KEY || "",
      openai: req.headers.get("x-openai-key") || process.env.OPENAI_API_KEY || "",
      perplexity: req.headers.get("x-perplexity-key") || process.env.PERPLEXITY_API_KEY || "",
      openrouter: req.headers.get("x-openrouter-key") || process.env.OPENROUTER_API_KEY || "",
      deepseek: req.headers.get("x-deepseek-key") || process.env.DEEPSEEK_API_KEY || "",
      groq: req.headers.get("x-groq-key") || process.env.GROQ_API_KEY || "",
    };
    const ollamaBaseUrl =
      req.headers.get("x-ollama-base-url") ||
      process.env.OLLAMA_BASE_URL ||
      "http://localhost:11434";

    const chosen = chooseProvider(provider, providerKeys);
    if (!chosen) {
      return NextResponse.json(
        { error: "No API key configured. Please add your API key in Settings." },
        { status: 401 },
      );
    }

    const system = systemPrompt || DEFAULT_SYSTEM;

    const handlers: Record<string, () => Promise<Record<string, unknown>>> = {
      anthropic: () => callAnthropic(providerKeys.anthropic, messages, model, system),
      openai: () => callOpenAI(providerKeys.openai, messages, model, system),
      perplexity: () => callPerplexity(providerKeys.perplexity, messages, model, system),
      openrouter: () => callOpenRouter(providerKeys.openrouter, messages, model, system),
      deepseek: () => callDeepSeek(providerKeys.deepseek, messages, model, system),
      groq: () => callGroq(providerKeys.groq, messages, model, system),
      ollama: () => callOllama(ollamaBaseUrl, messages, model, system),
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
