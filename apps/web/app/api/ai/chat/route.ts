import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, model, systemPrompt } = await req.json();

    const anthropicKey = req.headers.get("x-anthropic-key") || "";
    const openaiKey = req.headers.get("x-openai-key") || "";

    if (!anthropicKey && !openaiKey) {
      return NextResponse.json(
        { error: "No API key configured. Please add your API key in Settings." },
        { status: 401 }
      );
    }

    // Prefer Anthropic (Claude), fall back to OpenAI
    if (anthropicKey) {
      const body = {
        model: model || "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt || "You are a helpful scientific writing assistant specializing in photovoltaic research. Help the user write, edit, and improve their academic documents.",
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      };

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json(
          { error: `Anthropic API error: ${res.status} - ${err}` },
          { status: res.status }
        );
      }

      const data = await res.json();
      const text = data.content?.[0]?.text || "No response generated.";
      return NextResponse.json({ content: text, provider: "anthropic" });
    }

    // OpenAI fallback
    const body = {
      model: model || "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt || "You are a helpful scientific writing assistant specializing in photovoltaic research.",
        },
        ...messages,
      ],
      max_tokens: 4096,
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `OpenAI API error: ${res.status} - ${err}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "No response generated.";
    return NextResponse.json({ content: text, provider: "openai" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
