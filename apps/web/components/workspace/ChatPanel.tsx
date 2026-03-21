"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { agents } from "@/lib/data";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent?: string;
  timestamp: Date;
  skillUsed?: string;
}

interface ChatPanelProps {
  onOutputUpdate?: (content: string, type: "output" | "code") => void;
  prefillMessage?: string;
  onPrefillConsumed?: () => void;
}

const EXAMPLE_QUERIES = [
  { label: "Energy Yield Analysis", query: "Run pvlib analysis for Mumbai (19.07N, 72.87E) with a 500 kWp ground-mount system" },
  { label: "IEC 61215 Protocol", query: "Generate IEC 61215 test protocol for a 400W bifacial module" },
  { label: "LCOE Calculation", query: "Calculate LCOE for a 1 MW rooftop solar project in Rajasthan" },
  { label: "Weibull Analysis", query: "Perform Weibull analysis for module failure rate prediction over 25 years" },
  { label: "Shading Study", query: "Run shading analysis for a ground-mount array with 25 degree tilt and 1.5 GCR" },
  { label: "Material Defects", query: "Classify EL imaging defects for a p-type PERC module batch" },
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const routeToAgent = (query: string): string => {
  const q = query.toLowerCase();
  if (q.includes("pvlib") || q.includes("energy yield") || q.includes("p50") || q.includes("p90") || q.includes("pr ratio") || q.includes("loss tree"))
    return "Phala-Agent";
  if (q.includes("weather") || q.includes("irradiance") || q.includes("ghi") || q.includes("tmy") || q.includes("solar resource"))
    return "Megha-Agent";
  if (q.includes("iec") || q.includes("test protocol") || q.includes("qualification") || q.includes("flash test") || q.includes("thermal cycling") || q.includes("damp heat"))
    return "Pariksha-Agent";
  if (q.includes("lcoe") || q.includes("irr") || q.includes("npv") || q.includes("finance") || q.includes("ppa") || q.includes("bankability"))
    return "Nivesha-Agent";
  if (q.includes("material") || q.includes("silicon") || q.includes("perovskite") || q.includes("el imaging") || q.includes("xrd") || q.includes("sem"))
    return "Dravya-Agent";
  if (q.includes("fmea") || q.includes("weibull") || q.includes("reliability") || q.includes("degradation") || q.includes("root cause"))
    return "Nityata-Agent";
  if (q.includes("layout") || q.includes("shading") || q.includes("string sizing") || q.includes("rooftop") || q.includes("floating") || q.includes("cable"))
    return "Vinyasa-Agent";
  if (q.includes("grid") || q.includes("inverter") || q.includes("bess") || q.includes("power quality") || q.includes("hybrid") || q.includes("mppt"))
    return "Vidyut-Agent";
  if (q.includes("bom") || q.includes("module construction") || q.includes("lamination") || q.includes("ctm"))
    return "Kosha-Agent";
  if (q.includes("iv curve") || q.includes("efficiency") || q.includes("diode") || q.includes("temperature coefficient"))
    return "Shakti-Agent";
  if (q.includes("carbon") || q.includes("lca") || q.includes("esg") || q.includes("recycl") || q.includes("sustainability"))
    return "Grantha-Agent";
  return "Surya-Orchestrator";
};

const AGENT_RESPONSES: Record<string, (q: string) => { text: string; code?: string; output?: string }> = {
  "Phala-Agent": (q) => ({
    text: `**Phala-Agent** (Yield/Result) responding.\n\nInvoking \`pvlib-analysis\` skill for your query.\n\n**Skill:** \`pv-energy/pvlib-analysis\`\n**Status:** Ready\n\nFor this analysis I need:\n- Location coordinates (lat/lon)\n- System capacity and configuration\n- Module and inverter specs\n- Loss assumptions\n\n**Expected outputs:**\n- Annual energy yield (kWh)\n- Monthly generation profile\n- Loss waterfall diagram\n- Performance ratio estimate`,
    code: `import pvlib\nimport pandas as pd\nfrom pvlib.pvsystem import PVSystem\nfrom pvlib.location import Location\nfrom pvlib.modelchain import ModelChain\n\n# Site: Mumbai, India\nsite = Location(\n    latitude=19.07, longitude=72.87,\n    tz='Asia/Kolkata', altitude=14\n)\n\n# System configuration\nmodule_params = pvlib.pvsystem.retrieve_sam('CECMod')\ninverter_params = pvlib.pvsystem.retrieve_sam('cecinverter')\n\nsystem = PVSystem(\n    surface_tilt=19, surface_azimuth=180,\n    module_parameters=module_params.iloc[0],\n    inverter_parameters=inverter_params.iloc[0],\n    modules_per_string=20, strings_per_inverter=25\n)\n\nmc = ModelChain(system, site)\nweather = site.get_clearsky(pd.date_range(\n    '2024-01-01', '2024-12-31', freq='h'\n))\nmc.run_model(weather)\n\nprint(f"Annual Yield: {mc.results.ac.sum()/1000:.0f} kWh")`,
    output: `System Configuration:\n  Location: Mumbai (19.07N, 72.87E)\n  Capacity: 500 kWp\n  Tilt: 19 deg | Azimuth: 180 deg\n\nSimulation Results:\n  Annual GHI: 1,847 kWh/m2\n  Annual Energy Yield: 782,500 kWh\n  Specific Yield: 1,565 kWh/kWp\n  Performance Ratio: 81.2%\n  Capacity Utilization: 17.9%\n\nMonthly Breakdown (MWh):\n  Jan: 62.1 | Feb: 61.8 | Mar: 73.2 | Apr: 71.5\n  May: 68.9 | Jun: 48.2 | Jul: 42.1 | Aug: 45.6\n  Sep: 55.3 | Oct: 68.4 | Nov: 64.2 | Dec: 61.2`,
  }),
  "Pariksha-Agent": (q) => ({
    text: `**Pariksha-Agent** (Examination) responding.\n\nInvoking \`iec-61215-protocol\` skill.\n\n**Skill:** \`pv-testing/iec-61215-protocol\`\n**Status:** Ready\n\nGenerating test protocol for module qualification.\n\n**IEC 61215 Test Groups:**\n\n| Group | Tests | Focus |\n|-------|-------|-------|\n| A | MQT 01-04 | Visual & Electrical |\n| B | MQT 05-10 | Environmental Stress |\n| C | MQT 11-16 | Mechanical Stress |\n| D | MQT 17-21 | Extended Qualification |`,
    output: `IEC 61215 Design Qualification Protocol\nModule: 400W Bifacial (n-type TOPCon)\n\nGroup A - Visual & Performance:\n  MQT 01: Visual inspection (pre/post)\n  MQT 02: Maximum power determination (STC)\n  MQT 03: Insulation resistance test\n  MQT 04: Temperature coefficient measurement\n\nGroup B - Environmental:\n  MQT 05: Thermal cycling TC200 (-40 to +85C)\n  MQT 06: Humidity-freeze HF10\n  MQT 07: Damp heat DH1000 (85C/85%RH)\n  MQT 08: UV preconditioning (15 kWh/m2)\n\nSample Requirements: 8 modules minimum\nTest Duration: ~6 months\nLab Accreditation: NABL / IEC 17025`,
  }),
  "Nivesha-Agent": (q) => ({
    text: `**Nivesha-Agent** (Investment) responding.\n\nInvoking \`lcoe-calculator\` and \`financial-modeler\` skills.\n\n**Skills:** \`pv-finance/lcoe-calculator\`, \`pv-finance/financial-modeler\`\n**Status:** Ready\n\nFinancial model parameters for Indian market:\n\n- CAPEX: 3.5-4.5 Cr/MW (utility-scale)\n- O&M: 8-12 Lakhs/MW/year\n- CUF: 18-23%\n- Project life: 25 years\n- Discount rate: 8-10%`,
    code: `import numpy as np\n\n# LCOE Calculator\ndef calculate_lcoe(\n    capex_per_mw=4.0e7,  # INR 4 Cr/MW\n    opex_per_mw=1.0e6,   # INR 10 Lakhs/MW/yr\n    capacity_mw=1.0,\n    cuf=0.20,\n    lifetime=25,\n    discount_rate=0.09,\n    degradation=0.005\n):\n    total_capex = capex_per_mw * capacity_mw\n    annual_gen = capacity_mw * 1000 * cuf * 8760  # kWh\n    \n    lcoe_num = total_capex\n    lcoe_den = 0\n    for yr in range(1, lifetime + 1):\n        factor = (1 + discount_rate) ** yr\n        gen = annual_gen * (1 - degradation) ** yr\n        lcoe_num += (opex_per_mw * capacity_mw) / factor\n        lcoe_den += gen / factor\n    \n    return lcoe_num / lcoe_den\n\nlcoe = calculate_lcoe()\nprint(f"LCOE: INR {lcoe:.2f}/kWh")`,
    output: `Financial Analysis - 1 MW Rooftop Solar (Rajasthan)\n\nProject Parameters:\n  Capacity: 1,000 kWp\n  CAPEX: INR 4.0 Cr (INR 40/Wp)\n  Annual O&M: INR 10 Lakhs\n  CUF: 21.5% (Rajasthan avg)\n  Degradation: 0.5%/yr\n\nResults:\n  LCOE: INR 2.45/kWh\n  25-yr IRR: 14.2%\n  NPV (9% disc): INR 1.82 Cr\n  Payback Period: 5.8 years\n  Lifetime Generation: 44.2 GWh\n\nSensitivity:\n  LCOE range: INR 2.15 - 2.78/kWh\n  (across +/-15% CAPEX variation)`,
  }),
  "Nityata-Agent": (q) => ({
    text: `**Nityata-Agent** (Reliability) responding.\n\nInvoking \`weibull-reliability\` and \`fmea-analysis\` skills.\n\n**Skills:** \`pv-reliability/weibull-reliability\`, \`pv-reliability/fmea-analysis\`\n**Status:** Ready\n\nI'll perform reliability analysis with:\n- Weibull distribution fitting\n- MTBF calculation\n- Failure rate prediction\n- Bathtub curve generation`,
    code: `import numpy as np\nfrom scipy.stats import weibull_min\nimport matplotlib.pyplot as plt\n\n# Field failure data (years to failure)\nfailures = np.array([3.2, 5.1, 7.8, 8.4, 10.2, 11.5,\n                     12.8, 15.1, 18.3, 22.4, 24.1])\n\n# Fit Weibull distribution\nshape, loc, scale = weibull_min.fit(failures, floc=0)\n\nprint(f"Weibull Parameters:")\nprint(f"  Shape (beta): {shape:.2f}")\nprint(f"  Scale (eta):  {scale:.1f} years")\nprint(f"  MTBF: {scale * np.exp(np.log(np.pi/shape)/shape):.1f} years")\n\n# Reliability at 25 years\nR_25 = 1 - weibull_min.cdf(25, shape, loc, scale)\nprint(f"  R(25yr): {R_25*100:.1f}%")`,
    output: `Weibull Reliability Analysis\n\nDistribution Fit:\n  Shape (beta): 2.14 (wear-out mode)\n  Scale (eta): 28.6 years\n  MTBF: 25.3 years\n\nReliability Predictions:\n  R(10 yr): 96.2%\n  R(15 yr): 91.8%\n  R(20 yr): 83.5%\n  R(25 yr): 71.2%\n  R(30 yr): 55.8%\n\nFailure Mode: Wear-out (beta > 1)\nRecommendation: Schedule preventive maintenance\nat year 20 to maintain >85% fleet reliability.`,
  }),
};

const getResponse = (query: string, agent: string): { text: string; code?: string; output?: string } => {
  const handler = AGENT_RESPONSES[agent];
  if (handler) return handler(query);
  return {
    text: `**${agent}** received your query.\n\nRouting: Surya-Orchestrator -> ${agent}\n\nThe relevant skills have been identified and are ready for execution. Configure your \`ANTHROPIC_API_KEY\` for live AI-powered responses with real computation.\n\n**Current mode:** Demo with pre-built responses`,
  };
};

export default function ChatPanel({ onOutputUpdate, prefillMessage, onPrefillConsumed }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Namaste! I am **Surya-Orchestrator**. I route your PV engineering queries to the appropriate domain agent.\n\nI can connect you with:\n- **Phala-Agent** — Energy yield modeling with pvlib\n- **Pariksha-Agent** — IEC 61215/61730 test protocols\n- **Nivesha-Agent** — LCOE, IRR, NPV financial modeling\n- **Dravya-Agent** — Material characterization\n- **Vinyasa-Agent** — Plant layout and design\n- And 7 more specialists across all 10 skill packs\n\nSelect an agent manually or let me auto-route. What PV challenge can I help with?",
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

  useEffect(() => {
    if (prefillMessage) {
      setInput(prefillMessage);
      onPrefillConsumed?.();
    }
  }, [prefillMessage, onPrefillConsumed]);

  const handleSubmit = useCallback(async (query?: string) => {
    const q = query ?? input.trim();
    if (!q || isLoading) return;

    setInput("");

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: q,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

    const routedAgent = selectedAgent === "auto" ? routeToAgent(q) : selectedAgent;
    const response = getResponse(q, routedAgent);

    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: response.text,
      agent: routedAgent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);

    if (onOutputUpdate) {
      if (response.output) onOutputUpdate(response.output, "output");
      if (response.code) onOutputUpdate(response.code, "code");
    }
  }, [input, isLoading, selectedAgent, onOutputUpdate]);

  const agentIcon = (name: string) => {
    const a = agents.find((ag) => ag.name === name);
    return a?.icon || "☀️";
  };

  const renderContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("| ") || line.startsWith("|--")) {
        const cells = line.split("|").filter(Boolean).map((c) => c.trim());
        if (line.startsWith("|--")) return null;
        return (
          <div key={i} className="flex gap-4 text-xs font-mono text-gray-400">
            {cells.map((cell, j) => (
              <span key={j} className="min-w-[60px]">{cell}</span>
            ))}
          </div>
        );
      }
      if (line.startsWith("- ")) {
        const parts = line.slice(2).split(/\*\*(.*?)\*\*/g);
        return (
          <li key={i} className="ml-4 text-gray-300 text-sm">
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part
            )}
          </li>
        );
      }
      if (line.trim() === "") return <div key={i} className="h-2" />;
      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
      return (
        <p key={i} className="text-sm text-gray-300 leading-relaxed">
          {parts.map((part, j) => {
            if (part.startsWith("**") && part.endsWith("**"))
              return <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
            if (part.startsWith("`") && part.endsWith("`"))
              return <code key={j} className="text-amber-400 bg-gray-800 px-1 rounded text-xs">{part.slice(1, -1)}</code>;
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">☀️</span>
          <span className="font-medium text-sm text-white">SuryaPrajna Console</span>
          <span className="badge-available text-xs">Interactive</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Agent:</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-300 focus:outline-none focus:border-amber-500/60"
          >
            <option value="auto">Auto-route</option>
            {agents.map((a) => (
              <option key={a.id} value={a.name}>{a.icon} {a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[90%] rounded-xl px-4 py-3 ${
              msg.role === "user"
                ? "bg-amber-500/10 border border-amber-500/20"
                : "bg-gray-800/40 border border-gray-700/30"
            }`}>
              {msg.role === "assistant" && msg.agent && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700/30">
                  <span>{agentIcon(msg.agent)}</span>
                  <span className="text-xs font-mono text-amber-400">{msg.agent}</span>
                  <span className="text-xs text-gray-600">{formatTime(msg.timestamp)}</span>
                </div>
              )}
              <div className="space-y-1">
                {msg.role === "assistant" ? renderContent(msg.content) : (
                  <p className="text-sm text-gray-200">{msg.content}</p>
                )}
              </div>
              {msg.role === "user" && (
                <div className="text-xs text-gray-600 mt-1 text-right">{formatTime(msg.timestamp)}</div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/40 border border-gray-700/30 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="animate-pulse">Routing to agent</span>
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
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
            <button key={eq.label} onClick={() => handleSubmit(eq.query)}
              className="text-xs text-gray-500 hover:text-amber-400 whitespace-nowrap px-2.5 py-1.5 rounded-lg border border-gray-800/40 hover:border-amber-500/30 hover:bg-gray-800/40 transition-all flex-shrink-0">
              {eq.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-800/60 flex-shrink-0">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a PV engineering question..."
            className="input flex-1 text-sm" disabled={isLoading} />
          <button type="submit" disabled={!input.trim() || isLoading}
            className="btn-primary text-sm px-5 disabled:opacity-50 disabled:cursor-not-allowed">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
