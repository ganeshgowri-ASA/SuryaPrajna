"use client";

import { useState } from "react";
import { skills, skillPacks } from "@/lib/data";

interface SkillBrowserPanelProps {
  onUseSkill: (prompt: string) => void;
}

export default function SkillBrowserPanel({ onUseSkill }: SkillBrowserPanelProps) {
  const [selectedPack, setSelectedPack] = useState<string>("all");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = skills.filter((s) => {
    const matchesPack = selectedPack === "all" || s.pack === selectedPack;
    const matchesSearch = !search || s.name.includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
    return matchesPack && matchesSearch;
  });

  const activeSkill = selectedSkill ? skills.find((s) => s.id === selectedSkill) : null;

  const SKILL_PROMPTS: Record<string, string> = {
    "pvlib-analysis": "Run pvlib energy yield analysis for a 500 kWp system at latitude 19.07, longitude 72.87 with 20-degree tilt",
    "iec-61215-protocol": "Generate complete IEC 61215 test protocol for a 400W bifacial n-type TOPCon module",
    "iv-curve-modeler": "Model IV curve for a 166mm M6 PERC cell with Voc=0.68V, Isc=10.2A, FF=80%",
    "fmea-analysis": "Perform FMEA analysis for potential failure modes in a 500MW module manufacturing line",
    "lcoe-calculator": "Calculate LCOE for a 100 MW utility-scale project in Rajasthan with 4.2 Cr/MW CAPEX",
    "weibull-reliability": "Fit Weibull distribution to field failure data and predict 25-year module reliability",
    "shading-analysis": "Analyze inter-row shading for a ground-mount array with 25-degree tilt and 1.5 GCR",
    "bom-generator": "Generate Bill of Materials for a 400W bifacial glass-glass module with n-type TOPCon cells",
    "xrd-analysis": "Analyze XRD pattern to identify crystalline phases in a perovskite thin film sample",
    "energy-yield": "Simulate annual energy yield for a 5 MW plant in Tamil Nadu with P50/P90 analysis",
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-800/60 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Skills Browser</h3>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search skills..."
          className="input text-xs w-full mb-2" />
        <select value={selectedPack} onChange={(e) => { setSelectedPack(e.target.value); setSelectedSkill(null); }}
          className="w-full text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-gray-300 focus:outline-none focus:border-amber-500/60">
          <option value="all">All Packs ({skills.length})</option>
          {skillPacks.map((p) => (
            <option key={p.id} value={p.id}>{p.icon} {p.label} ({p.skillCount})</option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeSkill ? (
          /* Skill detail view */
          <div className="p-4">
            <button onClick={() => setSelectedSkill(null)}
              className="text-xs text-gray-500 hover:text-amber-400 mb-3 transition-colors">
              &larr; Back to list
            </button>
            <div className="space-y-3">
              <div>
                <code className="text-amber-400 text-sm font-semibold">{activeSkill.name}</code>
                <div className="text-xs text-gray-500 mt-1">{activeSkill.packLabel}</div>
              </div>
              <p className="text-sm text-gray-300">{activeSkill.description}</p>
              <div>
                <div className="text-xs text-gray-500 mb-1">Agent</div>
                <span className="text-xs font-mono text-amber-400/80">{activeSkill.agent}</span>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {activeSkill.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-emerald-400">Ready</span>
              </div>
              <button onClick={() => onUseSkill(SKILL_PROMPTS[activeSkill.id] || `Use the ${activeSkill.name} skill to analyze...`)}
                className="btn-primary w-full text-xs mt-2">
                Use this skill
              </button>
            </div>
          </div>
        ) : (
          /* Skill list */
          <div className="p-2 space-y-0.5">
            {filtered.map((skill) => (
              <button key={skill.id} onClick={() => setSelectedSkill(skill.id)}
                className="w-full text-left p-2.5 rounded-lg hover:bg-gray-800/40 transition-colors group">
                <div className="flex items-center justify-between">
                  <code className="text-xs text-amber-400 group-hover:text-amber-300">{skill.name}</code>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                </div>
                <div className="text-xs text-gray-600 mt-0.5 line-clamp-1">{skill.description}</div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-gray-600 text-center py-8">No skills match your search</p>
            )}
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-gray-800/60 flex-shrink-0">
        <div className="text-xs text-gray-600 text-center">
          {filtered.length} of {skills.length} skills
        </div>
      </div>
    </div>
  );
}
