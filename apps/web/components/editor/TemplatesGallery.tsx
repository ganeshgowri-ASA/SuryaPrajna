"use client";

import { useState } from "react";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

interface TemplatesGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => void;
}

const TEMPLATES: Template[] = [
  {
    id: "pv-research",
    name: "PV Research Paper",
    description: "IEC journal format with standard sections for PV research",
    icon: "☀️",
    category: "Research",
  },
  {
    id: "conference-paper",
    name: "IEEE Conference Paper",
    description: "IEEE conference format with two-column layout support",
    icon: "🎤",
    category: "Research",
  },
  {
    id: "ieee-journal",
    name: "IEEE Journal Paper",
    description: "IEEE Transactions journal format with structured sections",
    icon: "📰",
    category: "Research",
  },
  {
    id: "elsevier-journal",
    name: "Elsevier Journal",
    description: "Elsevier journal article with highlights and graphical abstract",
    icon: "📄",
    category: "Research",
  },
  {
    id: "springer-nature",
    name: "Springer Nature",
    description: "Springer Nature journal format with data availability statement",
    icon: "🌿",
    category: "Research",
  },
  {
    id: "mdpi-journal",
    name: "MDPI Journal",
    description: "MDPI open-access journal format (Energies, Sustainability, etc.)",
    icon: "🔓",
    category: "Research",
  },
  {
    id: "review-article",
    name: "Literature Review",
    description: "Comprehensive review article with systematic methodology",
    icon: "📚",
    category: "Research",
  },
  {
    id: "technical-report",
    name: "Technical Report",
    description: "Detailed technical documentation with executive summary",
    icon: "📋",
    category: "Reports",
  },
  {
    id: "iec-test-report",
    name: "IEC Test Report",
    description: "IEC 61215/61730 qualification test report template",
    icon: "🏗️",
    category: "Standards",
  },
  {
    id: "fmea-report",
    name: "FMEA Report",
    description: "Failure Mode and Effects Analysis for PV systems",
    icon: "⚠️",
    category: "Reliability",
  },
  {
    id: "energy-yield",
    name: "Energy Yield Analysis Report",
    description: "P50/P90 energy yield report with loss waterfall analysis",
    icon: "⚡",
    category: "Engineering",
  },
  {
    id: "pv-datasheet",
    name: "PV Module Datasheet",
    description: "Photovoltaic module technical datasheet with electrical specs",
    icon: "📊",
    category: "Engineering",
  },
  {
    id: "thesis-chapter",
    name: "Thesis / Dissertation",
    description: "Academic thesis chapter with literature review framework",
    icon: "🎓",
    category: "Academic",
  },
  {
    id: "lab-report",
    name: "Lab Report",
    description: "Experimental lab report with data tables and analysis",
    icon: "🔬",
    category: "Academic",
  },
  {
    id: "technical-note",
    name: "Technical Note",
    description: "Brief technical communication for quick findings dissemination",
    icon: "📝",
    category: "Academic",
  },
  {
    id: "patent-draft",
    name: "Patent Draft",
    description: "Patent application structure with claims and figures",
    icon: "📜",
    category: "Legal",
  },
];

export default function TemplatesGallery({ isOpen, onClose, onSelect }: TemplatesGalleryProps) {
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const categories = ["all", ...Array.from(new Set(TEMPLATES.map((t) => t.category)))];
  const filtered = TEMPLATES.filter((t) => {
    const matchesCategory = filter === "all" || t.category === filter;
    const matchesSearch =
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700/60 rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/60 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">Template Gallery</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {TEMPLATES.length} templates for academic papers, reports, and technical documents
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Search and filters */}
        <div className="px-6 py-3 border-b border-gray-800/40 flex-shrink-0 space-y-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full bg-gray-800/60 border border-gray-700/40 rounded-lg px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/40"
          />
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                  filter === cat
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-gray-800/60 text-gray-400 border border-gray-700/40 hover:border-gray-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filtered.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => {
                  onSelect(t.id);
                  onClose();
                }}
                className="text-left p-4 rounded-lg border border-gray-700/40 bg-gray-800/30 hover:bg-gray-800/60 hover:border-amber-500/30 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{t.icon}</span>
                  <div>
                    <h3 className="text-sm font-medium text-white group-hover:text-amber-300 transition-colors">
                      {t.name}
                    </h3>
                    <span className="text-xs text-gray-600">{t.category}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400">{t.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
