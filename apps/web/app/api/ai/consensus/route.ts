import { type NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: string;
  content: string;
}

interface ProviderResult {
  provider: string;
  content: string;
  error?: string;
}

async function callProvider(
  provider: string,
  apiKey: string,
  messages: ChatMessage[],
  systemPrompt: string,
): Promise<ProviderResult> {
  const endpoints: Record<
    string,
    {
      url: string;
      buildBody: () => object;
      buildHeaders: () => Record<string, string>;
      parseContent: (data: Record<string, unknown>) => string;
    }
  > = {
    anthropic: {
      url: "https://api.anthropic.com/v1/messages",
      buildHeaders: () => ({
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      }),
      buildBody: () => ({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
      parseContent: (data) => {
        const content = data.content as Array<{ text: string }> | undefined;
        return content?.[0]?.text || "";
      },
    },
    openai: {
      url: "https://api.openai.com/v1/chat/completions",
      buildHeaders: () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      }),
      buildBody: () => ({
        model: "gpt-4o",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: 4096,
      }),
      parseContent: (data) => {
        const choices = data.choices as Array<{ message: { content: string } }> | undefined;
        return choices?.[0]?.message?.content || "";
      },
    },
    deepseek: {
      url: "https://api.deepseek.com/chat/completions",
      buildHeaders: () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      }),
      buildBody: () => ({
        model: "deepseek-chat",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: 4096,
      }),
      parseContent: (data) => {
        const choices = data.choices as Array<{ message: { content: string } }> | undefined;
        return choices?.[0]?.message?.content || "";
      },
    },
    groq: {
      url: "https://api.groq.com/openai/v1/chat/completions",
      buildHeaders: () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      }),
      buildBody: () => ({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: 4096,
      }),
      parseContent: (data) => {
        const choices = data.choices as Array<{ message: { content: string } }> | undefined;
        return choices?.[0]?.message?.content || "";
      },
    },
    openrouter: {
      url: "https://openrouter.ai/api/v1/chat/completions",
      buildHeaders: () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      }),
      buildBody: () => ({
        model: "anthropic/claude-sonnet-4-20250514",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: 4096,
      }),
      parseContent: (data) => {
        const choices = data.choices as Array<{ message: { content: string } }> | undefined;
        return choices?.[0]?.message?.content || "";
      },
    },
    perplexity: {
      url: "https://api.perplexity.ai/chat/completions",
      buildHeaders: () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      }),
      buildBody: () => ({
        model: "sonar-pro",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: 4096,
      }),
      parseContent: (data) => {
        const choices = data.choices as Array<{ message: { content: string } }> | undefined;
        return choices?.[0]?.message?.content || "";
      },
    },
  };

  const ep = endpoints[provider];
  if (!ep) return { provider, content: "", error: `Unknown provider: ${provider}` };

  try {
    const res = await fetch(ep.url, {
      method: "POST",
      headers: ep.buildHeaders(),
      body: JSON.stringify(ep.buildBody()),
    });
    if (!res.ok) {
      const errText = await res.text();
      return {
        provider,
        content: "",
        error: `${provider} error ${res.status}: ${errText.slice(0, 200)}`,
      };
    }
    const data = await res.json();
    const content = ep.parseContent(data);
    return { provider, content: content || "No response generated." };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { provider, content: "", error: msg };
  }
}

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: "Claude (Anthropic)",
  openai: "GPT-4o (OpenAI)",
  deepseek: "DeepSeek Chat",
  groq: "Llama 3.3 (Groq)",
  openrouter: "OpenRouter",
  perplexity: "Perplexity",
};

async function synthesize(
  results: ProviderResult[],
  synthProvider: string,
  synthKey: string,
  originalPrompt: string,
): Promise<string> {
  const successful = results.filter((r) => !r.error && r.content);
  if (successful.length === 0) return "All providers failed to respond.";
  if (successful.length === 1) return successful[0].content;

  const responseSummary = successful
    .map((r) => `### ${PROVIDER_LABELS[r.provider] || r.provider}\n${r.content}`)
    .join("\n\n---\n\n");

  const synthPrompt = `You are a meta-analysis assistant. The user asked the following question to multiple AI models simultaneously. Your job is to synthesize a combined answer that highlights where the models agree and where they differ.

Original user question: "${originalPrompt}"

Here are the responses from each model:

${responseSummary}

Please provide:
1. A synthesized answer that combines the best insights from all models
2. Key points of agreement across models
3. Notable differences or unique perspectives from specific models

Be concise and actionable.`;

  const synthResult = await callProvider(
    synthProvider,
    synthKey,
    [{ role: "user", content: synthPrompt }],
    "You synthesize multiple AI model responses into a single coherent answer.",
  );

  if (synthResult.error) {
    return `**Auto-synthesis failed.** Please review individual responses below.\n\n${responseSummary}`;
  }
  return synthResult.content;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json();

    const providerKeys: Record<string, string> = {
      anthropic: req.headers.get("x-anthropic-key") || process.env.ANTHROPIC_API_KEY || "",
      openai: req.headers.get("x-openai-key") || process.env.OPENAI_API_KEY || "",
      perplexity: req.headers.get("x-perplexity-key") || process.env.PERPLEXITY_API_KEY || "",
      openrouter: req.headers.get("x-openrouter-key") || process.env.OPENROUTER_API_KEY || "",
      deepseek: req.headers.get("x-deepseek-key") || process.env.DEEPSEEK_API_KEY || "",
      groq: req.headers.get("x-groq-key") || process.env.GROQ_API_KEY || "",
    };

    const system =
      systemPrompt ||
      "You are a helpful scientific writing assistant specializing in photovoltaic research.";

    // Find all providers with keys
    const availableProviders = Object.entries(providerKeys)
      .filter(([, key]) => !!key)
      .map(([provider]) => provider);

    if (availableProviders.length === 0) {
      return NextResponse.json(
        { error: "No API keys configured. Please add at least one API key in Settings." },
        { status: 401 },
      );
    }

    // Fan out to all available providers simultaneously
    const settled = await Promise.allSettled(
      availableProviders.map((provider) =>
        callProvider(provider, providerKeys[provider], messages, system),
      ),
    );

    const results: ProviderResult[] = settled.map((s, i) =>
      s.status === "fulfilled"
        ? s.value
        : { provider: availableProviders[i], content: "", error: String(s.reason) },
    );

    // Extract the original user prompt for synthesis
    const lastUserMsg = [...messages].reverse().find((m: ChatMessage) => m.role === "user");
    const originalPrompt = lastUserMsg?.content || "";

    // Use the best available provider for synthesis (prefer anthropic > openai > first available)
    const synthPriority = ["anthropic", "openai", "openrouter", "deepseek", "groq", "perplexity"];
    const synthProvider = synthPriority.find((p) => providerKeys[p]) || availableProviders[0];

    const synthesized = await synthesize(
      results,
      synthProvider,
      providerKeys[synthProvider],
      originalPrompt,
    );

    return NextResponse.json({
      synthesized,
      responses: results.map((r) => ({
        provider: r.provider,
        label: PROVIDER_LABELS[r.provider] || r.provider,
        content: r.content,
        error: r.error,
      })),
      provider: "consensus",
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
