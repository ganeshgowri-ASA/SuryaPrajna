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
    id: "technical-report",
    name: "Technical Report",
    description: "Detailed technical documentation with executive summary",
    icon: "📋",
    category: "Reports",
  },
  {
    id: "conference-paper",
    name: "Conference Paper (IEEE)",
    description: "IEEE conference format with two-column layout support",
    icon: "🎤",
    category: "Research",
  },
  {
    id: "thesis-chapter",
    name: "Thesis Chapter",
    description: "Academic thesis chapter with literature review",
    icon: "🎓",
    category: "Academic",
  },
  {
    id: "lab-report",
    name: "Lab Report",
    description: "Experimental lab report with data tables",
    icon: "🔬",
    category: "Reports",
  },
  {
    id: "patent-draft",
    name: "Patent Draft",
    description: "Patent application structure with claims",
    icon: "📜",
    category: "Legal",
  },
  {
    id: "review-article",
    name: "Literature Review",
    description: "Comprehensive review article format",
    icon: "📚",
    category: "Research",
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
    name: "Energy Yield Assessment",
    description: "P50/P90 energy yield report with loss waterfall",
    icon: "⚡",
    category: "Engineering",
  },
];

export default function TemplatesGallery({
  isOpen,
  onClose,
  onSelect,
}: TemplatesGalleryProps) {
  const [filter, setFilter] = useState<string>("all");

  if (!isOpen) return null;

  const categories = ["all", ...Array.from(new Set(TEMPLATES.map((t) => t.category)))];
  const filtered = filter === "all" ? TEMPLATES : TEMPLATES.filter((t) => t.category === filter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700/60 rounded-xl w-full max-w-3xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/60 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">Template Gallery</h2>
            <p className="text-xs text-gray-500 mt-0.5">Choose a starting template for your document</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-800/40 flex gap-2 flex-wrap flex-shrink-0">
          {categories.map((cat) => (
            <button
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

        {/* Templates Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((t) => (
              <button
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
