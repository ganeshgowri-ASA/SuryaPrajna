"use client";

import { useState, useRef, useEffect } from "react";
import { agents } from "@/lib/data";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent?: string;
  timestamp: Date;
}

const EXAMPLE_QUERIES = [
  "Run pvlib analysis for Mumbai (19.07°N, 72.87°E) with a 500 kWp ground-mount system",
  "Generate IEC 61215 test protocol for a 400W bifacial module",
  "Calculate LCOE for a 1 MW rooftop solar project in Rajasthan",
  "Perform Weibull analysis for module failure rate prediction",
  "What is the P90 energy yield for a 5 MW project in Tamil Nadu?",
  "Run shading analysis for a ground-mount array with 25° tilt",
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function WorkspaceChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Namaste! I am **Surya-Orchestrator** (सूर्य). I route your PV engineering queries to the appropriate domain agent.\n\nI can help you with:\n- **Energy yield** modeling with pvlib (Phala-Agent)\n- **Testing protocols** for IEC 61215/61730 (Pariksha-Agent)\n- **Financial modeling** — LCOE, IRR, NPV (Nivesha-Agent)\n- **Material analysis** for silicon, perovskite (Dravya-Agent)\n- **Plant design** — layout, shading, string sizing (Vinyasa-Agent)\n- And much more across all 10 skill packs!\n\nWhat PV challenge can I help you solve today?",
      agent: "Surya-Orchestrator",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const routeToAgent = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes("pvlib") || q.includes("energy yield") || q.includes("p50") || q.includes("p90") || q.includes("pr ratio"))
      return "Phala-Agent";
    if (q.includes("weather") || q.includes("irradiance") || q.includes("ghi") || q.includes("tmy"))
      return "Megha-Agent";
    if (q.includes("iec") || q.includes("test") || q.includes("qualification") || q.includes("flash"))
      return "Pariksha-Agent";
    if (q.includes("lcoe") || q.includes("irr") || q.includes("npv") || q.includes("finance") || q.includes("ppa"))
      return "Nivesha-Agent";
    if (q.includes("material") || q.includes("silicon") || q.includes("perovskite") || q.includes("el imaging"))
      return "Dravya-Agent";
    if (q.includes("fmea") || q.includes("weibull") || q.includes("reliability") || q.includes("degradation"))
      return "Nityata-Agent";
    if (q.includes("layout") || q.includes("shading") || q.includes("string") || q.includes("rooftop"))
      return "Vinyasa-Agent";
    if (q.includes("grid") || q.includes("inverter") || q.includes("bess") || q.includes("power quality"))
      return "Vidyut-Agent";
    if (q.includes("bom") || q.includes("module construction") || q.includes("lamination"))
      return "Kosha-Agent";
    if (q.includes("iv curve") || q.includes("efficiency") || q.includes("diode"))
      return "Shakti-Agent";
    return "Surya-Orchestrator";
  };

  const generateResponse = (query: string, agent: string): string => {
    const responses: Record<string, string> = {
      "Phala-Agent": `**Phala-Agent** (फल — Yield/Result) here.\n\nI'll invoke the \`pvlib-analysis\` skill for your query.\n\n**Skill:** \`pv-energy/pvlib-analysis\`\n**Status:** ✅ Available\n\nTo run this analysis, I would need:\n- Location coordinates (lat/lon/altitude)\n- System parameters (capacity, tilt, azimuth)\n- Module and inverter specifications\n- Loss model assumptions\n\n**Expected outputs:**\n- Annual energy yield (kWh)\n- Monthly generation profile\n- Loss waterfall diagram\n- Performance ratio estimate\n\n*Note: In the full deployment, this executes pvlib Python code and returns real simulation results. Connect your \`ANTHROPIC_API_KEY\` to enable live skill execution.*`,
      "Pariksha-Agent": `**Pariksha-Agent** (परीक्षा — Examination) here.\n\nI'll invoke the \`iec-61215-protocol\` skill for your query.\n\n**Skill:** \`pv-testing/iec-61215-protocol\`\n**Status:** ✅ Available\n\nThis skill generates:\n- Complete test sequence (Groups A–D)\n- Individual protocols for MQT 01–21\n- Sample size requirements\n- Equipment and calibration checklists\n- Report templates\n\n**IEC 61215 Test Groups:**\n| Group | Tests | Purpose |\n|-------|-------|--------|\n| A | MQT 01-04 | Visual & Electrical |\n| B | MQT 05-10 | Environmental Stress |\n| C | MQT 11-16 | Mechanical Stress |\n| D | MQT 17-21 | Extended Tests |\n\n*Ready to generate full protocol — specify module type and power class.*`,
      "Nivesha-Agent": `**Nivesha-Agent** (निवेश — Investment) here.\n\nI'll invoke the \`lcoe-calculator\` and \`financial-modeler\` skills.\n\n**Skills:** \`pv-finance/lcoe-calculator\`, \`pv-finance/financial-modeler\`\n**Status:** 🔄 In Development\n\nFor a typical utility-scale project in India:\n\n**LCOE Components:**\n- CAPEX: ₹3.5–4.5 Cr/MW (utility-scale)\n- O&M: ₹8–12 Lakhs/MW/year\n- Capacity Utilization Factor: 18–23%\n- Project life: 25 years\n- Discount rate: 8–10%\n\n**Typical LCOE:** ₹2.2–2.8/kWh (competitive with grid)\n\n*Provide project-specific parameters for detailed analysis.*`,
    };

    const defaultResponse = `**${agent}** received your query.\n\nI've identified this as a ${agent.replace("-Agent", "")} domain task. The relevant skill pack has been identified.\n\n**Routing:** Surya-Orchestrator → ${agent}\n\nTo execute this skill with real computation:\n1. Ensure \`ANTHROPIC_API_KEY\` is configured\n2. The skill will invoke appropriate Python libraries (pvlib, pandas, numpy)\n3. Results will be returned as structured data + visualizations\n\nThis workspace is a preview of the full SuryaPrajna capability. Deploy with your API keys for live skill execution.`;

    return responses[agent] ?? defaultResponse;
  };

  const handleSubmit = async (query?: string) => {
    const q = query ?? input.trim();
    if (!q || isLoading) return;

    setInput("");

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: q,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate routing delay
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

    const routedAgent =
      selectedAgent === "auto" ? routeToAgent(q) : selectedAgent;
    const response = generateResponse(q, routedAgent);

    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: response,
      agent: routedAgent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const renderContent = (content: string) => {
    // Simple markdown-like rendering
    const lines = content.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <p key={i} className="font-semibold text-white">
            {line.slice(2, -2)}
          </p>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li key={i} className="ml-4 text-gray-300">
            {line.slice(2).replace(/\*\*(.*?)\*\*/g, (_, t) => t)}
          </li>
        );
      }
      if (line.startsWith("#")) {
        return null;
      }
      if (line.trim() === "") {
        return <br key={i} />;
      }
      // Inline bold
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="text-gray-300 leading-relaxed">
          {parts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="text-white font-semibold">
                {part}
              </strong>
            ) : (
              part
            )
          )}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-[600px] card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
        <div className="flex items-center gap-2">
          <span className="text-lg">☀️</span>
          <span className="font-medium text-sm text-gray-300">
            SuryaPrajna Workspace
          </span>
          <span className="badge-available text-xs">Live Preview</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Agent:</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-300 focus:outline-none"
          >
            <option value="auto">Auto-route</option>
            {agents.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
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
              className={`max-w-[85%] rounded-xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-amber-500/15 border border-amber-500/20 text-gray-200"
                  : "bg-gray-800/60 border border-gray-700/40"
              }`}
            >
              {msg.role === "assistant" && msg.agent && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700/40">
                  <span className="text-xs font-mono text-amber-400">
                    {msg.agent}
                  </span>
                  <span className="text-xs text-gray-600">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              )}
              <div className="text-sm space-y-1">
                {msg.role === "assistant"
                  ? renderContent(msg.content)
                  : msg.content}
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
            <div className="bg-gray-800/60 border border-gray-700/40 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="animate-pulse">Routing to agent</span>
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1 h-1 rounded-full bg-amber-500 animate-bounce"
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

      {/* Example queries */}
      <div className="px-4 py-2 border-t border-gray-800/40 flex gap-2 overflow-x-auto">
        {EXAMPLE_QUERIES.slice(0, 3).map((q) => (
          <button
            key={q}
            onClick={() => handleSubmit(q)}
            className="text-xs text-gray-500 hover:text-amber-400 whitespace-nowrap px-2 py-1 rounded hover:bg-gray-800/60 transition-colors flex-shrink-0"
          >
            {q.slice(0, 45)}…
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-800/60">
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
            placeholder="Ask a PV engineering question…"
            className="input flex-1 text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn-primary text-sm px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
