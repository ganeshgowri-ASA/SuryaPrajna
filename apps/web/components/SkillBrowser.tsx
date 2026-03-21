"use client";

import { useState, useMemo } from "react";
import { skills, skillPacks, PACK_DOMAIN_MAP, type Skill } from "@/lib/data";
import SkillCard from "./SkillCard";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "available", label: "Available" },
  { value: "in-progress", label: "In Progress" },
  { value: "planned", label: "Planned" },
];

interface SkillBrowserProps {
  initialPack?: string;
}

export default function SkillBrowser({ initialPack }: SkillBrowserProps) {
  const [search, setSearch] = useState("");
  const [selectedPack, setSelectedPack] = useState(initialPack ?? "all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [compact, setCompact] = useState(false);

  const filtered = useMemo(() => {
    return skills.filter((skill) => {
      const matchesPack =
        selectedPack === "all" || skill.pack === selectedPack;
      const matchesStatus =
        selectedStatus === "all" || skill.status === selectedStatus;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        skill.name.includes(q) ||
        skill.description.toLowerCase().includes(q) ||
        skill.tags.some((t) => t.toLowerCase().includes(q)) ||
        skill.pack.includes(q);
      return matchesPack && matchesStatus && matchesSearch;
    });
  }, [search, selectedPack, selectedStatus]);

  const packCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    skills.forEach((s) => {
      counts[s.pack] = (counts[s.pack] ?? 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <aside className="lg:w-56 flex-shrink-0">
        <div className="card p-4 sticky top-20">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Skill Packs
          </h3>
          <div className="space-y-0.5">
            <button
              onClick={() => setSelectedPack("all")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex justify-between items-center ${
                selectedPack === "all"
                  ? "bg-amber-500/10 text-amber-400"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/60"
              }`}
            >
              <span>All Packs</span>
              <span className="text-xs text-gray-600">{skills.length}</span>
            </button>
            {skillPacks.map((pack) => (
              <button
                key={pack.id}
                onClick={() => setSelectedPack(pack.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex justify-between items-center gap-2 ${
                  selectedPack === pack.id
                    ? "bg-amber-500/10 text-amber-400"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/60"
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span>{pack.icon}</span>
                  <span className="truncate">{pack.label}</span>
                </span>
                <span className="text-xs text-gray-600 flex-shrink-0">
                  {packCounts[pack.id] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search skills, tags, descriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input flex-1"
          />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input sm:w-40"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setCompact((c) => !c)}
            className="btn-secondary text-sm flex-shrink-0"
          >
            {compact ? "Expanded" : "Compact"}
          </button>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {filtered.length} skill{filtered.length !== 1 ? "s" : ""}
            {selectedPack !== "all" && (
              <span className="text-gray-600">
                {" "}
                in{" "}
                <span className="text-amber-600/70">
                  {PACK_DOMAIN_MAP[selectedPack] ?? selectedPack}
                </span>
              </span>
            )}
          </p>
          {(search || selectedPack !== "all" || selectedStatus !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedPack("all");
                setSelectedStatus("all");
              }}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-3xl mb-3">🔍</div>
            <p className="text-gray-500">No skills match your filters.</p>
          </div>
        ) : (
          <div
            className={`grid gap-3 ${
              compact
                ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-2"
            }`}
          >
            {filtered.map((skill) => (
              <SkillCard key={skill.id} skill={skill} compact={compact} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
