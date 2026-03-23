"use client";

import { agents, skills } from "@/lib/data";
import { type AllProviderKeys, getProviderHeaders, loadProviderKeys } from "@/lib/providers";
import { useCallback, useEffect, useRef, useState } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent?: string;
  timestamp: Date;
  skillUsed?: string;
  provider?: string;
}

interface ChatPanelProps {
  onOutputUpdate?: (content: string, type: "output" | "code") => void;
  prefillMessage?: string;
  onPrefillConsumed?: () => void;
}

const EXAMPLE_QUERIES = [
  {
    label: "Energy Yield Analysis",
    query: "Run pvlib analysis for Mumbai (19.07N, 72.87E) with a 500 kWp ground-mount system",
  },
  {
    label: "IEC 61215 Protocol",
    query: "Generate IEC 61215 test protocol for a 400W bifacial module",
  },
  {
    label: "LCOE Calculation",
    query: "Calculate LCOE for a 1 MW rooftop solar project in Rajasthan",
  },
  {
    label: "Weibull Analysis",
    query: "Perform Weibull analysis for module failure rate prediction over 25 years",
  },
  {
    label: "Shading Study",
    query: "Run shading analysis for a ground-mount array with 25 degree tilt and 1.5 GCR",
  },
  {
    label: "Material Defects",
    query: "Classify EL imaging defects for a p-type PERC module batch",
  },
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: keyword matching needs many branches
const routeToAgent = (query: string): string => {
  const q = query.toLowerCase();
  if (
    q.includes("pvlib") ||
    q.includes("energy yield") ||
    q.includes("p50") ||
    q.includes("p90") ||
    q.includes("pr ratio") ||
    q.includes("loss tree")
  )
    return "Phala-Agent";
  if (
    q.includes("weather") ||
    q.includes("irradiance") ||
    q.includes("ghi") ||
    q.includes("tmy") ||
    q.includes("solar resource")
  )
    return "Megha-Agent";
  if (
    q.includes("iec") ||
    q.includes("test protocol") ||
    q.includes("qualification") ||
    q.includes("flash test") ||
    q.includes("thermal cycling") ||
    q.includes("damp heat")
  )
    return "Pariksha-Agent";
  if (
    q.includes("lcoe") ||
    q.includes("irr") ||
    q.includes("npv") ||
    q.includes("finance") ||
    q.includes("ppa") ||
    q.includes("bankability")
  )
    return "Nivesha-Agent";
  if (
    q.includes("material") ||
    q.includes("silicon") ||
    q.includes("perovskite") ||
    q.includes("el imaging") ||
    q.includes("xrd") ||
    q.includes("sem")
  )
    return "Dravya-Agent";
  if (
    q.includes("fmea") ||
    q.includes("weibull") ||
    q.includes("reliability") ||
    q.includes("degradation") ||
    q.includes("root cause")
  )
    return "Nityata-Agent";
  if (
    q.includes("layout") ||
    q.includes("shading") ||
    q.includes("string sizing") ||
    q.includes("rooftop") ||
    q.includes("floating") ||
    q.includes("cable")
  )
    return "Vinyasa-Agent";
  if (
    q.includes("grid") ||
    q.includes("inverter") ||
    q.includes("bess") ||
    q.includes("power quality") ||
    q.includes("hybrid") ||
    q.includes("mppt")
  )
    return "Vidyut-Agent";
  if (
    q.includes("bom") ||
    q.includes("module construction") ||
    q.includes("lamination") ||
    q.includes("ctm")
  )
    return "Kosha-Agent";
  if (
    q.includes("iv curve") ||
    q.includes("efficiency") ||
    q.includes("diode") ||
    q.includes("temperature coefficient")
  )
    return "Shakti-Agent";
  if (
    q.includes("carbon") ||
    q.includes("lca") ||
    q.includes("esg") ||
    q.includes("recycl") ||
    q.includes("sustainability")
  )
    return "Grantha-Agent";
  return "Surya-Orchestrator";
};

const routeToSkill = (query: string, agent: string): string | null => {
  const agentDef = agents.find((a) => a.name === agent);
  if (!agentDef || agentDef.skills.length === 0) return null;

  const q = query.toLowerCase();
  // Find best matching skill based on query keywords
  for (const skillId of agentDef.skills) {
    const skill = skills.find((s) => s.id === skillId);
    if (skill) {
      const matchesTag = skill.tags.some((tag) => q.includes(tag.replace(/-/g, " ")));
      const matchesName = q.includes(skill.name.replace(/-/g, " "));
      if (matchesTag || matchesName) return skillId;
    }
  }
  // Default to first skill in the agent's skill list
  return agentDef.skills[0] || null;
};

export default function ChatPanel({
  onOutputUpdate,
  prefillMessage,
  onPrefillConsumed,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Namaste! I am **Surya-Orchestrator**. I route your PV engineering queries to the appropriate domain agent.\n\nI can connect you with:\n- **Phala-Agent** — Energy yield modeling with pvlib\n- **Pariksha-Agent** — IEC 61215/61730 test protocols\n- **Nivesha-Agent** — LCOE, IRR, NPV financial modeling\n- **Dravya-Agent** — Material characterization\n- **Vinyasa-Agent** — Plant layout and design\n- And 7 more specialists across all 10 skill packs\n\nConfigure your API keys in **Settings** to enable live AI responses.\n\nWhat PV challenge can I help with?",
      agent: "Surya-Orchestrator",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const [providerKeys, setProviderKeys] = useState<AllProviderKeys | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (prefillMessage) {
      setInput(prefillMessage);
      onPrefillConsumed?.();
    }
  }, [prefillMessage, onPrefillConsumed]);

  // Load provider keys on mount
  useEffect(() => {
    setProviderKeys(loadProviderKeys());
  }, []);

  const hasKeys =
    providerKeys &&
    (providerKeys.anthropicKey || providerKeys.openaiKey || providerKeys.perplexityKey);

  const getPreferredModel = useCallback((keys: AllProviderKeys) => {
    if (keys.anthropicKey) return keys.anthropicModel;
    if (keys.openaiKey) return keys.openaiModel;
    return keys.perplexityModel;
  }, []);

  const executeSkill = useCallback(
    async (
      q: string,
      skillId: string | null,
      routedAgent: string,
      keys: AllProviderKeys,
      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: skill execution with response parsing
    ): Promise<ChatMessage> => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...getProviderHeaders(keys),
      };
      const res = await fetch("/api/skills/execute", {
        method: "POST",
        headers,
        body: JSON.stringify({
          skill_id: skillId || "general",
          input_data: q,
          model: getPreferredModel(keys),
        }),
      });
      const data = await res.json();

      if (data.error) {
        return {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: `**${routedAgent}** encountered an error:\n\n${data.error}`,
          agent: routedAgent,
          timestamp: new Date(),
          skillUsed: skillId || undefined,
        };
      }

      const content = data.content || "";
      const codeMatch = content.match(/```(?:python|py)\n([\s\S]*?)```/);
      const outputLines = content
        .split("\n")
        .filter((line: string) => /^\s*([\w\s]+:|\||\d+\.)/.test(line) && !line.startsWith("```"));
      if (onOutputUpdate) {
        if (outputLines.length > 3) onOutputUpdate(outputLines.join("\n"), "output");
        if (codeMatch) onOutputUpdate(codeMatch[1], "code");
      }

      return {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: `**${data.agent || routedAgent}** responding via ${data.provider || "AI"}.\n\n${skillId ? `**Skill:** \`${skillId}\`\n\n` : ""}${content}`,
        agent: data.agent || routedAgent,
        timestamp: new Date(),
        skillUsed: skillId || undefined,
        provider: data.provider,
      };
    },
    [getPreferredModel, onOutputUpdate],
  );

  const buildDemoResponse = useCallback(
    (routedAgent: string, skillId: string | null): ChatMessage => ({
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: `**${routedAgent}** received your query.\n\n${skillId ? `**Skill identified:** \`${skillId}\`\n\n` : ""}To get live AI-powered responses, configure your API keys in **[Settings](/settings)**.\n\nSupported providers:\n- **Anthropic** (Claude) — Primary AI for skill execution\n- **OpenAI** — Embeddings and GPT-4 fallback\n- **Perplexity** — Research and literature search`,
      agent: routedAgent,
      timestamp: new Date(),
      skillUsed: skillId || undefined,
    }),
    [],
  );

  const handleSubmit = useCallback(
    async (query?: string) => {
      const q = query ?? input.trim();
      if (!q || isLoading) return;
      setInput("");

      setMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, role: "user", content: q, timestamp: new Date() },
      ]);
      setIsLoading(true);

      const routedAgent = selectedAgent === "auto" ? routeToAgent(q) : selectedAgent;
      const skillId = routeToSkill(q, routedAgent);

      if (hasKeys && providerKeys) {
        try {
          const msg = await executeSkill(q, skillId, routedAgent, providerKeys);
          setMessages((prev) => [...prev, msg]);
        } catch {
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: `**${routedAgent}** — Error connecting to AI service. Check your API keys in Settings.`,
              agent: routedAgent,
              timestamp: new Date(),
            },
          ]);
        }
      } else {
        await new Promise((r) => setTimeout(r, 500));
        setMessages((prev) => [...prev, buildDemoResponse(routedAgent, skillId)]);
      }

      setIsLoading(false);
    },
    [input, isLoading, selectedAgent, hasKeys, providerKeys, executeSkill, buildDemoResponse],
  );

  const agentIcon = (name: string) => {
    const a = agents.find((ag) => ag.name === name);
    return a?.icon || "☀️";
  };

  const renderContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      const key = `line-${i}-${line.slice(0, 20)}`;
      if (line.startsWith("```") || line.startsWith("|--")) return null;
      if (line.startsWith("| ")) {
        const cells = line
          .split("|")
          .filter(Boolean)
          .map((c) => c.trim());
        return (
          <div key={key} className="flex gap-4 text-xs font-mono text-gray-400">
            {cells.map((cell) => (
              <span key={`${key}-${cell}`} className="min-w-[60px]">
                {cell}
              </span>
            ))}
          </div>
        );
      }
      if (line.startsWith("- ")) {
        return renderListItem(line, key);
      }
      if (line.trim() === "") {
        return <div key={key} className="h-2" />;
      }
      return renderParagraph(line, key);
    });
  };

  const renderListItem = (line: string, key: string) => {
    const parts = line.slice(2).split(/\*\*(.*?)\*\*/g);
    return (
      <li key={key} className="ml-4 text-gray-300 text-sm">
        {parts.map((part, j) =>
          j % 2 === 1 ? (
            <strong key={`${key}-b-${part}`} className="text-white">
              {part}
            </strong>
          ) : (
            part
          ),
        )}
      </li>
    );
  };

  const renderParagraph = (line: string, key: string) => {
    const parts = line.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);
    return (
      <p key={key} className="text-sm text-gray-300 leading-relaxed">
        {parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**"))
            return (
              <strong key={`${key}-b-${part}`} className="text-white font-semibold">
                {part.slice(2, -2)}
              </strong>
            );
          if (part.startsWith("`") && part.endsWith("`"))
            return (
              <code
                key={`${key}-c-${part}`}
                className="text-amber-400 bg-gray-800 px-1 rounded text-xs"
              >
                {part.slice(1, -1)}
              </code>
            );
          const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
          if (linkMatch)
            return (
              <a
                key={`${key}-a-${linkMatch[2]}`}
                href={linkMatch[2]}
                className="text-amber-400 hover:text-amber-300 underline"
              >
                {linkMatch[1]}
              </a>
            );
          return part;
        })}
      </p>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">☀️</span>
          <span className="font-medium text-sm text-white">SuryaPrajna Console</span>
          {hasKeys ? (
            <span className="px-1.5 py-0.5 rounded text-xs bg-emerald-500/15 text-emerald-400">
              Live
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded text-xs bg-gray-800 text-gray-500">Demo</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500" htmlFor="agent-select">
            Agent:
          </label>
          <select
            id="agent-select"
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-300 focus:outline-none focus:border-amber-500/60"
          >
            <option value="auto">Auto-route</option>
            {agents.map((a) => (
              <option key={a.id} value={a.name}>
                {a.icon} {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] rounded-xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-amber-500/10 border border-amber-500/20"
                  : "bg-gray-800/40 border border-gray-700/30"
              }`}
            >
              {msg.role === "assistant" && msg.agent && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700/30">
                  <span>{agentIcon(msg.agent)}</span>
                  <span className="text-xs font-mono text-amber-400">{msg.agent}</span>
                  {msg.provider && (
                    <span className="text-xs text-gray-600">via {msg.provider}</span>
                  )}
                  <span className="text-xs text-gray-600 ml-auto">{formatTime(msg.timestamp)}</span>
                </div>
              )}
              <div className="space-y-1">
                {msg.role === "assistant" ? (
                  renderContent(msg.content)
                ) : (
                  <p className="text-sm text-gray-200">{msg.content}</p>
                )}
              </div>
              {msg.role === "user" && (
                <div className="text-xs text-gray-600 mt-1 text-right">
                  {formatTime(msg.timestamp)}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/40 border border-gray-700/30 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="animate-pulse">
                  {hasKeys ? "Executing skill" : "Routing to agent"}
                </span>
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      <div className="px-4 py-2 border-t border-gray-800/30 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {EXAMPLE_QUERIES.map((eq) => (
            <button
              type="button"
              key={eq.label}
              onClick={() => handleSubmit(eq.query)}
              className="text-xs text-gray-500 hover:text-amber-400 whitespace-nowrap px-2.5 py-1.5 rounded-lg border border-gray-800/40 hover:border-amber-500/30 hover:bg-gray-800/40 transition-all flex-shrink-0"
            >
              {eq.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-800/60 flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a PV engineering question..."
            className="input flex-1 text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn-primary text-sm px-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
