import { type NextRequest, NextResponse } from "next/server";

interface TestKeys {
  anthropicKey: string;
  openaiKey: string;
  perplexityKey: string;
  pineconeKey: string;
  pineconeEnv: string;
  pineconeIndex: string;
}

function getKey(userKey: string, envVar: string): string {
  return userKey || process.env[envVar] || "";
}

async function testAnthropic(keys: TestKeys) {
  const apiKey = getKey(keys.anthropicKey, "ANTHROPIC_API_KEY");
  if (!apiKey) return { connected: false, error: "No API key provided" };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 10,
      messages: [{ role: "user", content: "Say ok" }],
    }),
  });

  if (res.ok) return { connected: true };
  const err = await res.text();
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

  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [{ role: "user", content: "Say ok" }],
      max_tokens: 10,
    }),
  });

  if (res.ok) return { connected: true };
  const err = await res.text();
  return { connected: false, error: `HTTP ${res.status}: ${err.slice(0, 200)}` };
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

const testers: Record<string, (keys: TestKeys) => Promise<{ connected: boolean; error?: string }>> =
  {
    anthropic: testAnthropic,
    openai: testOpenAI,
    perplexity: testPerplexity,
    pinecone: testPinecone,
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
