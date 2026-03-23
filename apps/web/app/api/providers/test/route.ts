import { type NextRequest, NextResponse } from "next/server";

interface TestKeys {
  anthropicKey: string;
  openaiKey: string;
  perplexityKey: string;
  pineconeKey: string;
  pineconeEnv: string;
  pineconeIndex: string;
  openrouterKey: string;
  deepseekKey: string;
  groqKey: string;
  ollamaBaseUrl: string;
}

function getKey(userKey: string, envVar: string): string {
  return userKey || process.env[envVar] || "";
}

async function testAnthropic(keys: TestKeys) {
  const apiKey = getKey(keys.anthropicKey, "ANTHROPIC_API_KEY");
  if (!apiKey) return { connected: false, error: "No API key provided" };

  // Use the cheaper claude-3-haiku model for testing to avoid credit issues
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 1,
      messages: [{ role: "user", content: "Hi" }],
    }),
  });

  if (res.ok) return { connected: true };

  const err = await res.text();
  // A 400 with "credit" or "billing" in the error still means auth worked
  if (res.status === 400 && /credit|billing|balance/i.test(err)) {
    return { connected: true, error: "Connected but account may have low credits" };
  }
  return { connected: false, error: `HTTP ${res.status}: ${err.slice(0, 200)}` };
}

async function testOpenAI(keys: TestKeys) {
  const apiKey = getKey(keys.openaiKey, "OPENAI_API_KEY");
  if (!apiKey) return { connected: false, error: "No API key provided" };

  const res = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (res.ok) return { connected: true };
  const err = await res.text();
  return { connected: false, error: `HTTP ${res.status}: ${err.slice(0, 200)}` };
}

async function testPerplexity(keys: TestKeys) {
  const apiKey = getKey(keys.perplexityKey, "PERPLEXITY_API_KEY");
  if (!apiKey) return { connected: false, error: "No API key provided" };

  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 1,
      }),
    });

    if (res.ok) return { connected: true };
    const err = await res.text();
    if (res.status === 401) {
      return {
        connected: false,
        error:
          "Invalid API key (HTTP 401). Check your Perplexity key at https://www.perplexity.ai/settings/api",
      };
    }
    return { connected: false, error: `HTTP ${res.status}: ${err.slice(0, 200)}` };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Connection failed";
    return { connected: false, error: msg };
  }
}

async function testPinecone(keys: TestKeys) {
  const apiKey = getKey(keys.pineconeKey, "PINECONE_API_KEY");
  if (!apiKey) return { connected: false, error: "No API key provided" };

  const index = keys.pineconeIndex || process.env.PINECONE_INDEX || "";
  if (!index) return { connected: false, error: "No index name provided" };

  const res = await fetch("https://api.pinecone.io/indexes", {
    headers: { "Api-Key": apiKey },
  });

  if (res.ok) return { connected: true };
  const err = await res.text();
  return { connected: false, error: `HTTP ${res.status}: ${err.slice(0, 200)}` };
}

async function testOpenRouter(keys: TestKeys) {
  const apiKey = getKey(keys.openrouterKey, "OPENROUTER_API_KEY");
  if (!apiKey) return { connected: false, error: "No API key provided" };

  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (res.ok) return { connected: true };
  const err = await res.text();
  return { connected: false, error: `HTTP ${res.status}: ${err.slice(0, 200)}` };
}

async function testDeepSeek(keys: TestKeys) {
  const apiKey = getKey(keys.deepseekKey, "DEEPSEEK_API_KEY");
  if (!apiKey) return { connected: false, error: "No API key provided" };

  const res = await fetch("https://api.deepseek.com/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (res.ok) return { connected: true };
  const err = await res.text();
  return { connected: false, error: `HTTP ${res.status}: ${err.slice(0, 200)}` };
}

async function testGroq(keys: TestKeys) {
  const apiKey = getKey(keys.groqKey, "GROQ_API_KEY");
  if (!apiKey) return { connected: false, error: "No API key provided" };

  const res = await fetch("https://api.groq.com/openai/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (res.ok) return { connected: true };
  const err = await res.text();
  return { connected: false, error: `HTTP ${res.status}: ${err.slice(0, 200)}` };
}

async function testOllama(keys: TestKeys) {
  const baseUrl = keys.ollamaBaseUrl || "http://localhost:11434";

  try {
    const res = await fetch(`${baseUrl}/api/tags`);
    if (res.ok) return { connected: true };
    const err = await res.text();
    return { connected: false, error: `HTTP ${res.status}: ${err.slice(0, 200)}` };
  } catch {
    return {
      connected: false,
      error: `Cannot connect to Ollama at ${baseUrl}. Is Ollama running?`,
    };
  }
}

const testers: Record<string, (keys: TestKeys) => Promise<{ connected: boolean; error?: string }>> =
  {
    anthropic: testAnthropic,
    openai: testOpenAI,
    perplexity: testPerplexity,
    pinecone: testPinecone,
    openrouter: testOpenRouter,
    deepseek: testDeepSeek,
    groq: testGroq,
    ollama: testOllama,
  };

export async function POST(req: NextRequest) {
  try {
    const { provider, keys } = await req.json();

    const tester = testers[provider];
    if (!tester) {
      return NextResponse.json({ connected: false, error: "Unknown provider" });
    }

    const result = await tester(keys);
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ connected: false, error: msg });
  }
}
