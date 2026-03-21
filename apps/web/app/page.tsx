import Link from "next/link";
import { skillPacks, skills, agents } from "@/lib/data";

const features = [
  {
    icon: "🧠",
    title: "12 Sanskrit Agents",
    description:
      "Domain-expert AI agents named in Sanskrit, each covering a specialized slice of the PV value chain from materials to grid integration.",
  },
  {
    icon: "📦",
    title: "10 Skill Packs",
    description:
      "67+ domain skills covering materials science, cell/module design, testing, reliability, finance, energy yield, and sustainability.",
  },
  {
    icon: "🔌",
    title: "Agent-Agnostic",
    description:
      "Follows the open Agent Skills standard (agentskills.io) — compatible with Claude Code, Cursor, Codex, Gemini CLI, and any LLM agent.",
  },
  {
    icon: "⚡",
    title: "pvlib + IEC Standards",
    description:
      "Built on industry-standard tools and references — pvlib for solar modeling, IEC 61215/61730 for qualification, BIS for India compliance.",
  },
  {
    icon: "🔗",
    title: "Srishti Workflow Engine",
    description:
      "Chain multiple skills into multi-step workflows with parallel/sequential execution, checkpointing, and inter-agent data flow.",
  },
  {
    icon: "🌐",
    title: "Full Value Chain",
    description:
      "From silicon wafer characterization and module manufacturing through energy yield forecasting, grid integration, and ESG reporting.",
  },
];

const valueChainSteps = [
  { label: "Materials", icon: "⚗️", agent: "Dravya" },
  { label: "Cell/Module", icon: "🔋", agent: "Kosha + Shakti" },
  { label: "Testing", icon: "🧪", agent: "Pariksha" },
  { label: "Reliability", icon: "🛡️", agent: "Nityata" },
  { label: "Energy", icon: "☀️", agent: "Phala + Megha" },
  { label: "Design", icon: "🏗️", agent: "Vinyasa" },
  { label: "Grid", icon: "⚡", agent: "Vidyut" },
  { label: "Finance", icon: "💰", agent: "Nivesha" },
];

export default function HomePage() {
  const availableSkills = skills.filter((s) => s.status === "available");
  const totalSkills = skills.length;

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20">
      {/* Hero */}
      <section className="pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Agent Skills Standard &mdash; agentskills.io
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
          <span className="text-white">Surya</span>
          <span className="text-amber-400 solar-glow">Prajna</span>
        </h1>

        <p className="text-2xl text-gray-500 font-light mb-2 tracking-widest">
          सूर्यप्रज्ञा
        </p>

        <p className="text-lg text-gray-400 max-w-2xl mx-auto mt-6 leading-relaxed">
          Universal PV scientific skills workspace &mdash;{" "}
          <em className="text-amber-400/80">Solar Wisdom</em> across the entire
          photovoltaic value chain. Domain-expert AI agents for engineers,
          researchers, and project developers.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <Link href="/workspace" className="btn-primary text-base px-6 py-3">
            ☀️ Open Workspace
          </Link>
          <Link href="/skills" className="btn-secondary text-base px-6 py-3">
            Browse Skills
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-2xl mx-auto">
          {[
            { value: "12", label: "Agents" },
            { value: "10", label: "Skill Packs" },
            { value: "67+", label: "Skills" },
            { value: "2", label: "Available Now" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card px-4 py-5 text-center"
            >
              <div className="text-3xl font-bold text-amber-400">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Value Chain */}
      <section className="mb-20">
        <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">
          Full Solar Energy Value Chain
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          {valueChainSteps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className="card px-4 py-3 text-center min-w-[90px]">
                <div className="text-xl mb-1">{step.icon}</div>
                <div className="text-xs font-medium text-gray-300">
                  {step.label}
                </div>
                <div className="text-xs text-amber-500/70 font-mono mt-0.5">
                  {step.agent}
                </div>
              </div>
              {i < valueChainSteps.length - 1 && (
                <span className="text-gray-700 text-lg hidden sm:block">→</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">
          Why SuryaPrajna?
        </h2>
        <p className="text-gray-500 text-center mb-10">
          Deep domain expertise packaged as reusable, agent-agnostic skills
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="card-hover p-6">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Skill Packs overview */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Skill Packs</h2>
          <Link href="/skills" className="btn-secondary text-sm">
            View All Skills →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {skillPacks.map((pack) => (
            <Link
              key={pack.id}
              href={`/skills?pack=${pack.id}`}
              className="card-hover p-4 group"
            >
              <div className="text-2xl mb-2">{pack.icon}</div>
              <div className="font-medium text-sm text-gray-200 group-hover:text-white transition-colors">
                {pack.label}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {pack.skillCount} skills
                </span>
                <span
                  className={
                    pack.status === "available"
                      ? "badge-available"
                      : pack.status === "in-progress"
                      ? "badge-in-progress"
                      : "badge-planned"
                  }
                >
                  {pack.status === "in-progress"
                    ? "Active"
                    : pack.status === "available"
                    ? "Ready"
                    : "Soon"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Agents preview */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Sanskrit Agents</h2>
            <p className="text-sm text-gray-500 mt-1">
              Each agent named for its Sanskrit domain essence
            </p>
          </div>
          <Link href="/agents" className="btn-secondary text-sm">
            All 12 Agents →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {agents.slice(0, 8).map((agent) => (
            <Link
              key={agent.id}
              href={`/agents#${agent.id}`}
              className="card-hover p-4 group"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xl">{agent.icon}</span>
                <span className="text-xs font-mono text-amber-600/70">
                  {agent.sanskrit}
                </span>
              </div>
              <div className="font-mono text-sm text-amber-400 group-hover:text-amber-300 transition-colors">
                {agent.name}
              </div>
              <div className="text-xs text-gray-600 italic mt-0.5">
                &ldquo;{agent.meaning}&rdquo;
              </div>
              <div className="text-xs text-gray-500 mt-2 leading-relaxed">
                {agent.domainLabel}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <div className="card p-10 max-w-2xl mx-auto border-amber-500/20">
          <div className="text-3xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Ready to harness Solar Wisdom?
          </h2>
          <p className="text-gray-400 mb-6 text-sm leading-relaxed">
            Open the interactive workspace to run skills, chat with domain
            agents, and explore the full PV knowledge base.
          </p>
          <Link href="/workspace" className="btn-primary text-base px-8 py-3">
            Launch Workspace
          </Link>
        </div>
      </section>
    </div>
  );
}
