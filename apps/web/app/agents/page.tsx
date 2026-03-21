import AgentPanel from "@/components/AgentPanel";
import { agents } from "@/lib/data";

export const metadata = {
  title: "Agents — SuryaPrajna",
  description: "12 Sanskrit-named AI agents covering the full PV value chain",
};

export default function AgentsPage() {
  const orchestrator = agents.find((a) => a.id === "surya-orchestrator")!;
  const domainAgents = agents.filter((a) => a.id !== "surya-orchestrator");

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-3">
          Sanskrit Agents
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          12 domain-expert AI agents, each named in Sanskrit to reflect its
          domain essence. Surya-Orchestrator routes all queries to the
          appropriate specialist via the Srishti workflow engine.
        </p>
      </div>

      {/* Architecture diagram (text) */}
      <div className="card p-6 mb-10 overflow-x-auto">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Agent Architecture
        </h2>
        <div className="flex flex-col items-center gap-4">
          {/* Orchestrator */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-6 py-3 text-center">
            <div className="text-sm font-mono font-bold text-amber-400">
              ☀️ Surya-Orchestrator
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              सूर्य — Master Router
            </div>
          </div>

          {/* Arrow */}
          <div className="text-gray-700 text-lg">↓ routes to ↓</div>

          {/* Domain agents grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 w-full">
            {domainAgents.map((agent) => (
              <a
                key={agent.id}
                href={`#${agent.id}`}
                className="card px-3 py-2 text-center hover:border-amber-500/30 transition-colors"
              >
                <div className="text-lg">{agent.icon}</div>
                <div className="text-xs font-mono text-gray-400 mt-1 truncate">
                  {agent.name.replace("-Agent", "")}
                </div>
                <div className="text-xs text-gray-600 truncate">
                  {agent.sanskrit}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Orchestrator */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">
          🎯 Orchestration Layer
        </h2>
        <AgentPanel agent={orchestrator} />
      </div>

      {/* Domain Agents */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6">
          🧠 Domain Agents ({domainAgents.length})
        </h2>
        <div className="grid lg:grid-cols-2 gap-4">
          {domainAgents.map((agent) => (
            <AgentPanel key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      {/* Future agents */}
      <div className="mt-12 card p-6 border-dashed">
        <h2 className="text-lg font-semibold text-gray-400 mb-3">
          🔮 Future Agents (Roadmap)
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { name: "Saura-Agent", sanskrit: "सौर", meaning: "Solar", domain: "pv-ev-charging", icon: "🔌" },
            { name: "Jala-Agent", sanskrit: "जल", meaning: "Water", domain: "pv-hydrogen", icon: "💧" },
            { name: "Krishi-Agent", sanskrit: "कृषि", meaning: "Agriculture", domain: "pv-agrivoltaics", icon: "🌾" },
          ].map((future) => (
            <div key={future.name} className="card p-4 opacity-60">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{future.icon}</span>
                <span className="font-mono text-sm text-gray-400">{future.name}</span>
              </div>
              <div className="text-xs text-gray-600 italic">
                {future.sanskrit} — &ldquo;{future.meaning}&rdquo;
              </div>
              <div className="text-xs text-gray-600 mt-1">{future.domain}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
