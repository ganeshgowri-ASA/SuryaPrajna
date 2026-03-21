import WorkspaceChat from "@/components/WorkspaceChat";
import { skills, agents, skillPacks } from "@/lib/data";
import Link from "next/link";

export const metadata = {
  title: "Workspace — SuryaPrajna",
  description: "Interactive workspace to run PV skills and chat with domain agents",
};

export default function WorkspacePage() {
  const availableSkills = skills.filter((s) => s.status === "available");

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-3">Workspace</h1>
        <p className="text-gray-400 max-w-2xl">
          Run PV skills interactively, chat with domain agents, and view
          results. Surya-Orchestrator automatically routes your queries to the
          right specialist.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat - takes 2/3 */}
        <div className="lg:col-span-2">
          <WorkspaceChat />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Available skills */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
              ✅ Available Skills
            </h3>
            <div className="space-y-2">
              {availableSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-start justify-between gap-2 p-2 rounded-lg bg-gray-800/40 border border-gray-700/40"
                >
                  <div>
                    <code className="text-xs text-amber-400">{skill.name}</code>
                    <div className="text-xs text-gray-600 mt-0.5">{skill.pack}</div>
                  </div>
                  <span className="badge-available text-xs flex-shrink-0">Ready</span>
                </div>
              ))}
            </div>
            <Link
              href="/skills"
              className="block text-center text-xs text-gray-600 hover:text-amber-400 mt-3 transition-colors"
            >
              View all {skills.length} skills →
            </Link>
          </div>

          {/* Active agents */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
              🤖 Domain Agents
            </h3>
            <div className="space-y-1.5">
              {agents.slice(0, 6).map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800/40 transition-colors"
                >
                  <span className="text-sm">{agent.icon}</span>
                  <div>
                    <div className="text-xs font-mono text-amber-400/80">
                      {agent.name}
                    </div>
                    <div className="text-xs text-gray-600">{agent.meaning}</div>
                  </div>
                </div>
              ))}
              <Link
                href="/agents"
                className="block text-center text-xs text-gray-600 hover:text-amber-400 mt-1 transition-colors"
              >
                View all 12 agents →
              </Link>
            </div>
          </div>

          {/* Env vars notice */}
          <div className="card p-4 border-amber-500/20 bg-amber-500/5">
            <h3 className="text-sm font-semibold text-amber-400/80 mb-2">
              🔑 Configuration
            </h3>
            <p className="text-xs text-gray-500 mb-2">
              For live skill execution, configure your environment variables:
            </p>
            <div className="space-y-1 font-mono">
              {["ANTHROPIC_API_KEY", "PINECONE_API_KEY", "OPENAI_API_KEY"].map(
                (env) => (
                  <div
                    key={env}
                    className="text-xs text-gray-600 bg-gray-900/60 rounded px-2 py-1"
                  >
                    {env}
                  </div>
                )
              )}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              See <code className="text-amber-600/70">.env.example</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
