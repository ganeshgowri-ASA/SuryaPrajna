import { skills, agents, skillPacks } from "@/lib/data";
import Link from "next/link";

export const metadata = {
  title: "Docs — SuryaPrajna",
  description: "Documentation for SuryaPrajna skills, agents, and API reference",
};

const sections = [
  { id: "overview", label: "Overview" },
  { id: "getting-started", label: "Getting Started" },
  { id: "skills-reference", label: "Skills Reference" },
  { id: "agents-reference", label: "Agents Reference" },
  { id: "skill-packs", label: "Skill Packs" },
  { id: "api-reference", label: "API Reference" },
  { id: "contributing", label: "Contributing" },
];

export default function DocsPage() {
  const availableSkills = skills.filter((s) => s.status === "available");

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar TOC */}
        <aside className="lg:w-52 flex-shrink-0">
          <div className="sticky top-20 card p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              On this page
            </h3>
            <nav className="space-y-0.5">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block px-3 py-1.5 rounded-md text-sm text-gray-400 hover:text-amber-400 hover:bg-gray-800/60 transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-12">
          {/* Overview */}
          <section id="overview">
            <h1 className="text-4xl font-bold text-white mb-4">
              Documentation
            </h1>
            <div className="card p-6 border-amber-500/20 bg-amber-500/5 mb-6">
              <p className="text-amber-400/80 font-medium mb-1">
                SuryaPrajna — सूर्यप्रज्ञा — &ldquo;Solar Wisdom&rdquo;
              </p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Universal PV scientific skills workspace following the open{" "}
                <a
                  href="https://agentskills.io"
                  className="text-amber-400 hover:text-amber-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Agent Skills standard
                </a>
                . Compatible with Claude Code, Cursor, Codex, Gemini CLI, and
                any LLM agent.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: "📦", title: "10 Skill Packs", desc: "67+ skills covering the full PV value chain" },
                { icon: "🤖", title: "12 Agents", desc: "Sanskrit-named domain experts for each PV specialty" },
                { icon: "🔌", title: "Agent-Agnostic", desc: "Works with any LLM agent via the Skills standard" },
              ].map((item) => (
                <div key={item.title} className="card p-4">
                  <div className="text-xl mb-2">{item.icon}</div>
                  <div className="font-medium text-white text-sm">{item.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Getting Started */}
          <section id="getting-started">
            <h2 className="text-2xl font-bold text-white mb-4">Getting Started</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-3">
                  Claude Code
                </h3>
                <div className="card p-4 font-mono text-sm text-gray-300 space-y-2">
                  <div className="text-gray-500"># Clone the repository</div>
                  <div>git clone https://github.com/ganeshgowri-ASA/SuryaPrajna</div>
                  <div>cd SuryaPrajna</div>
                  <div className="text-gray-500 mt-2"># Open in Claude Code</div>
                  <div>claude .</div>
                  <div className="text-gray-500 mt-2"># The .claude/ directory provides agent and skill discovery</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-3">
                  Web Application
                </h3>
                <div className="card p-4 font-mono text-sm text-gray-300 space-y-2">
                  <div>cd apps/web</div>
                  <div>npm install</div>
                  <div className="text-gray-500"># Configure environment variables</div>
                  <div>cp .env.example .env.local</div>
                  <div className="text-gray-500"># Edit .env.local with your API keys</div>
                  <div>npm run dev</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-3">
                  Environment Variables
                </h3>
                <div className="card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800/60">
                        <th className="px-4 py-2 text-left text-xs text-gray-500 font-medium">Variable</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-500 font-medium">Required</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-500 font-medium">Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/40">
                      {[
                        { name: "ANTHROPIC_API_KEY", required: true, purpose: "Claude agent execution" },
                        { name: "OPENAI_API_KEY", required: false, purpose: "Embeddings fallback" },
                        { name: "PINECONE_API_KEY", required: false, purpose: "Vector knowledge retrieval" },
                        { name: "ZOTERO_API_KEY", required: false, purpose: "Academic reference management" },
                        { name: "OPENWEATHER_API_KEY", required: false, purpose: "Weather data connector" },
                      ].map((env) => (
                        <tr key={env.name}>
                          <td className="px-4 py-2.5 font-mono text-amber-400/80 text-xs">{env.name}</td>
                          <td className="px-4 py-2.5">
                            {env.required ? (
                              <span className="badge-available">Required</span>
                            ) : (
                              <span className="badge-planned">Optional</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-gray-400 text-xs">{env.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Skills Reference */}
          <section id="skills-reference">
            <h2 className="text-2xl font-bold text-white mb-4">Skills Reference</h2>
            <p className="text-gray-400 mb-6">
              Skills follow the{" "}
              <a href="https://agentskills.io" className="text-amber-400 hover:text-amber-300" target="_blank" rel="noopener noreferrer">
                Agent Skills standard
              </a>{" "}
              — each skill lives in{" "}
              <code className="tag">skills/&lt;pack&gt;/&lt;skill-name&gt;/SKILL.md</code> with YAML
              frontmatter.
            </p>

            <div className="card p-4 font-mono text-sm text-gray-300 mb-6 leading-relaxed">
              <div className="text-gray-500">--- # SKILL.md frontmatter</div>
              <div>name: pvlib-analysis</div>
              <div>version: 1.0.0</div>
              <div>description: pvlib-based solar energy modeling</div>
              <div>author: ASA</div>
              <div>license: MIT</div>
              <div>tags: [pvlib, energy-yield, irradiance]</div>
              <div>dependencies:</div>
              <div className="pl-4">- pvlib&gt;=0.11.0</div>
              <div className="pl-4">- pandas&gt;=2.0</div>
              <div className="text-gray-500">---</div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Available Skills ({availableSkills.length})
              </h3>
              {availableSkills.map((skill) => (
                <div key={skill.id} className="card p-4 flex items-start justify-between gap-4">
                  <div>
                    <code className="text-sm text-amber-400">{skill.name}</code>
                    <div className="text-xs text-gray-600 font-mono mt-0.5">skills/{skill.pack}/{skill.name}/SKILL.md</div>
                    <p className="text-sm text-gray-400 mt-1">{skill.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {skill.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                    </div>
                  </div>
                  <span className="badge-available flex-shrink-0">Available</span>
                </div>
              ))}
            </div>
          </section>

          {/* Agents Reference */}
          <section id="agents-reference">
            <h2 className="text-2xl font-bold text-white mb-4">Agents Reference</h2>
            <p className="text-gray-400 mb-6">
              12 Sanskrit-named agents orchestrated by Surya-Orchestrator. Agent
              definitions live in <code className="tag">.claude/agents/</code>.
            </p>
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800/60">
                    <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">Agent</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">Sanskrit</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">Meaning</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">Domain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {agents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-800/20 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-amber-400/80 text-xs">{agent.name}</td>
                      <td className="px-4 py-2.5 text-gray-400 text-sm">{agent.sanskrit}</td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs italic">{agent.meaning}</td>
                      <td className="px-4 py-2.5 text-gray-400 text-xs">{agent.domainLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Skill Packs */}
          <section id="skill-packs">
            <h2 className="text-2xl font-bold text-white mb-4">Skill Packs</h2>
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800/60">
                    <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">Pack</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">Domain</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">Skills</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">Status</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">Agents</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {skillPacks.map((pack) => (
                    <tr key={pack.id} className="hover:bg-gray-800/20 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-amber-400/80 text-xs">
                        <Link href={`/skills?pack=${pack.id}`} className="hover:text-amber-300 transition-colors">
                          {pack.id}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-gray-300 text-xs">{pack.label}</td>
                      <td className="px-4 py-2.5 text-gray-400 text-xs">{pack.skillCount}</td>
                      <td className="px-4 py-2.5">
                        <span className={
                          pack.status === "available" ? "badge-available" :
                          pack.status === "in-progress" ? "badge-in-progress" :
                          "badge-planned"
                        }>
                          {pack.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">{pack.agents.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* API Reference */}
          <section id="api-reference">
            <h2 className="text-2xl font-bold text-white mb-4">API Reference</h2>
            <p className="text-gray-400 mb-6">
              The SuryaPrajna web API (planned) will expose skill execution via
              REST endpoints.
            </p>
            <div className="space-y-3">
              {[
                { method: "GET", path: "/api/skills", desc: "List all skills with status" },
                { method: "GET", path: "/api/skills/:id", desc: "Get skill details and SKILL.md" },
                { method: "POST", path: "/api/skills/:id/run", desc: "Execute a skill with parameters" },
                { method: "GET", path: "/api/agents", desc: "List all agents and capabilities" },
                { method: "POST", path: "/api/chat", desc: "Chat with Surya-Orchestrator" },
              ].map((ep) => (
                <div key={ep.path} className="card p-4 flex items-center gap-4">
                  <span className={`font-mono text-xs px-2 py-1 rounded font-bold flex-shrink-0 ${
                    ep.method === "GET"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {ep.method}
                  </span>
                  <code className="text-sm text-amber-400/80 flex-1">{ep.path}</code>
                  <span className="text-xs text-gray-500">{ep.desc}</span>
                </div>
              ))}
            </div>
            <div className="card p-4 mt-4 border-amber-500/20 bg-amber-500/5">
              <p className="text-xs text-amber-400/70">
                🔄 API endpoints are planned for a future release. The current workspace uses
                client-side skill routing.
              </p>
            </div>
          </section>

          {/* Contributing */}
          <section id="contributing">
            <h2 className="text-2xl font-bold text-white mb-4">Contributing</h2>
            <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
              <div className="card p-5">
                <h3 className="text-white font-semibold mb-2">Adding a New Skill</h3>
                <ol className="space-y-1 list-decimal list-inside">
                  <li>Create directory: <code className="tag">skills/&lt;pack&gt;/&lt;skill-name&gt;/</code></li>
                  <li>Write <code className="tag">SKILL.md</code> with YAML frontmatter</li>
                  <li>Add supporting code/templates as needed</li>
                  <li>Register in <code className="tag">SKILLS.md</code></li>
                  <li>Link to responsible agent in <code className="tag">AGENTS.md</code></li>
                </ol>
              </div>
              <div className="card p-5">
                <h3 className="text-white font-semibold mb-2">Code Style</h3>
                <ul className="space-y-1">
                  <li>Python: PEP 8, type hints preferred, docstrings for public functions</li>
                  <li>TypeScript: ESLint + Prettier, strict TypeScript</li>
                  <li>File naming: kebab-case for directories and files</li>
                  <li>Commits: conventional commits (<code className="tag">feat:</code>, <code className="tag">fix:</code>, <code className="tag">docs:</code>)</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
