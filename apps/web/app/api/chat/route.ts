import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { message, agent } = await req.json();

  if (!message) {
    return NextResponse.json(
      { error: "Message is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      role: "assistant",
      agent: agent || "Surya-Orchestrator",
      content: [
        "**API Key Not Configured**",
        "",
        "To enable live AI-powered responses, set your `ANTHROPIC_API_KEY` environment variable:",
        "",
        "```bash",
        "# In your .env.local file:",
        "ANTHROPIC_API_KEY=sk-ant-...",
        "```",
        "",
        "Once configured, the workspace will route your queries through the Surya-Orchestrator to the appropriate domain agent and execute PV skills with real computation.",
        "",
        "**Current mode:** Demo (pre-built responses)",
      ].join("\n"),
      demo: true,
    });
  }

  // When API key is available, this would call the Anthropic API
  // For now, return a message indicating the key is present but integration is pending
  return NextResponse.json({
    role: "assistant",
    agent: agent || "Surya-Orchestrator",
    content: `**${agent || "Surya-Orchestrator"}** received your query: "${message.slice(0, 100)}..."\n\nAnthropic API key is configured. Full LLM integration is coming in the next release.`,
    demo: false,
  });
}
