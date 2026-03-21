import type { Agent } from "@/lib/data";

interface AgentPanelProps {
  agent: Agent;
  compact?: boolean;
}

const colorMap: Record<string, string> = {
  amber: "border-amber-500/30 bg-amber-500/5",
  purple: "border-purple-500/30 bg-purple-500/5",
  blue: "border-blue-500/30 bg-blue-500/5",
  yellow: "border-yellow-500/30 bg-yellow-500/5",
  green: "border-green-500/30 bg-green-500/5",
  indigo: "border-indigo-500/30 bg-indigo-500/5",
  sky: "border-sky-500/30 bg-sky-500/5",
  orange: "border-orange-500/30 bg-orange-500/5",
  emerald: "border-emerald-500/30 bg-emerald-500/5",
  teal: "border-teal-500/30 bg-teal-500/5",
  violet: "border-violet-500/30 bg-violet-500/5",
  rose: "border-rose-500/30 bg-rose-500/5",
};

const dotColorMap: Record<string, string> = {
  amber: "bg-amber-500",
  purple: "bg-purple-500",
  blue: "bg-blue-500",
  yellow: "bg-yellow-500",
  green: "bg-green-500",
  indigo: "bg-indigo-500",
  sky: "bg-sky-500",
  orange: "bg-orange-500",
  emerald: "bg-emerald-500",
  teal: "bg-teal-500",
  violet: "bg-violet-500",
  rose: "bg-rose-500",
};

const textColorMap: Record<string, string> = {
  amber: "text-amber-400",
  purple: "text-purple-400",
  blue: "text-blue-400",
  yellow: "text-yellow-400",
  green: "text-green-400",
  indigo: "text-indigo-400",
  sky: "text-sky-400",
  orange: "text-orange-400",
  emerald: "text-emerald-400",
  teal: "text-teal-400",
  violet: "text-violet-400",
  rose: "text-rose-400",
};

export default function AgentPanel({ agent, compact = false }: AgentPanelProps) {
  const borderBg = colorMap[agent.color] ?? "border-gray-700/40 bg-gray-800/20";
  const dotColor = dotColorMap[agent.color] ?? "bg-gray-500";
  const textColor = textColorMap[agent.color] ?? "text-gray-400";

  if (compact) {
    return (
      <div className={`rounded-lg border p-4 transition-all hover:brightness-110 ${borderBg}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{agent.icon}</span>
          <span className={`font-mono text-sm font-semibold ${textColor}`}>
            {agent.name}
          </span>
        </div>
        <div className="text-xs text-gray-500 italic mb-1">
          {agent.sanskrit} &mdash; &ldquo;{agent.meaning}&rdquo;
        </div>
        <div className="text-xs text-gray-400">{agent.domainLabel}</div>
      </div>
    );
  }

  return (
    <div id={agent.id} className={`rounded-xl border p-6 ${borderBg}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{agent.icon}</span>
          <div>
            <h3 className={`font-mono text-lg font-bold ${textColor}`}>
              {agent.name}
            </h3>
            <div className="text-sm text-gray-500 italic mt-0.5">
              {agent.sanskrit} &mdash; &ldquo;{agent.meaning}&rdquo;
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
          {agent.domainLabel}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 leading-relaxed mb-4">
        {agent.description}
      </p>

      {/* Capabilities */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Capabilities
        </h4>
        <ul className="space-y-1">
          {agent.capabilities.map((cap) => (
            <li key={cap} className="flex items-start gap-2 text-sm text-gray-400">
              <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${dotColor}`} />
              {cap}
            </li>
          ))}
        </ul>
      </div>

      {/* Skills */}
      {agent.skills.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Key Skills
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {agent.skills.map((skill) => (
              <span key={skill} className="tag">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
