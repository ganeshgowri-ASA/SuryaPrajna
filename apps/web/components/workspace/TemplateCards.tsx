"use client";

interface TemplateCardsProps {
  onSelectTemplate: (prompt: string) => void;
}

const TEMPLATES = [
  {
    title: "IEC 61215 Test Protocol",
    icon: "🧪",
    agent: "Pariksha-Agent",
    description: "Generate complete qualification test protocol",
    prompt: "Generate IEC 61215 design qualification test protocol for a 400W bifacial n-type TOPCon module, including all MQT sequences, sample requirements, and acceptance criteria",
    color: "green",
  },
  {
    title: "Energy Yield Analysis",
    icon: "☀️",
    agent: "Phala-Agent",
    description: "Simulate annual PV energy production",
    prompt: "Run comprehensive energy yield analysis using pvlib for a 1 MW ground-mount system at latitude 26.9, longitude 75.8 (Jaipur). Include monthly breakdown, loss waterfall, and P50/P90 estimates",
    color: "emerald",
  },
  {
    title: "LCOE Calculator",
    icon: "💰",
    agent: "Nivesha-Agent",
    description: "Levelized cost of energy analysis",
    prompt: "Calculate LCOE for a 50 MW utility-scale PV project in Rajasthan with CAPEX of INR 4.0 Cr/MW, 25-year lifetime, and compare with current grid tariff",
    color: "orange",
  },
  {
    title: "Plant Design Review",
    icon: "🏗️",
    agent: "Vinyasa-Agent",
    description: "Layout optimization and shading study",
    prompt: "Design optimal array layout for a 10 MW ground-mount plant with GCR 0.4, bifacial modules at 25-degree tilt, including inter-row shading analysis and string sizing",
    color: "teal",
  },
  {
    title: "Reliability FMEA",
    icon: "🛡️",
    agent: "Nityata-Agent",
    description: "Failure mode and effects analysis",
    prompt: "Perform comprehensive FMEA for a 400W bifacial glass-glass module, covering cell cracking, interconnect fatigue, encapsulant degradation, and junction box failures with RPN calculation",
    color: "indigo",
  },
  {
    title: "Material Characterization",
    icon: "⚗️",
    agent: "Dravya-Agent",
    description: "Silicon wafer and cell material analysis",
    prompt: "Characterize n-type monocrystalline silicon wafer quality: analyze resistivity uniformity, minority carrier lifetime mapping, and oxygen/carbon impurity levels for 182mm M10 wafers",
    color: "purple",
  },
];

const colorMap: Record<string, string> = {
  green: "border-green-500/20 hover:border-green-500/40",
  emerald: "border-emerald-500/20 hover:border-emerald-500/40",
  orange: "border-orange-500/20 hover:border-orange-500/40",
  teal: "border-teal-500/20 hover:border-teal-500/40",
  indigo: "border-indigo-500/20 hover:border-indigo-500/40",
  purple: "border-purple-500/20 hover:border-purple-500/40",
};

const textColorMap: Record<string, string> = {
  green: "text-green-400",
  emerald: "text-emerald-400",
  orange: "text-orange-400",
  teal: "text-teal-400",
  indigo: "text-indigo-400",
  purple: "text-purple-400",
};

export default function TemplateCards({ onSelectTemplate }: TemplateCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {TEMPLATES.map((t) => (
        <button key={t.title} onClick={() => onSelectTemplate(t.prompt)}
          className={`card-hover p-3 text-left ${colorMap[t.color] || ""}`}>
          <div className="flex items-start gap-2 mb-1.5">
            <span className="text-base">{t.icon}</span>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{t.title}</div>
              <div className={`text-xs font-mono ${textColorMap[t.color] || "text-gray-400"} opacity-70`}>{t.agent}</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2">{t.description}</p>
        </button>
      ))}
    </div>
  );
}
