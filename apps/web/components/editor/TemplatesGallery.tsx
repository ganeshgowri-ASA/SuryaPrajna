"use client";

import { useState } from "react";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  publisher?: string;
  badge?: string;
}

interface TemplatesGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => void;
}

const TEMPLATES: Template[] = [
  // === PV JOURNAL PUBLISHERS ===
  {
    id: "wiley-pip",
    name: "Progress in Photovoltaics (Wiley)",
    description: "Wiley journal format for Progress in Photovoltaics: Research and Applications",
    icon: "📗",
    category: "PV Journals",
    publisher: "Wiley",
    badge: "IF: 7.9",
  },
  {
    id: "wiley-aem",
    name: "Advanced Energy Materials (Wiley)",
    description: "High-impact Wiley journal for advanced energy research including PV",
    icon: "⚡",
    category: "PV Journals",
    publisher: "Wiley",
    badge: "IF: 27.8",
  },
  {
    id: "nature-energy",
    name: "Nature Energy",
    description: "Nature portfolio journal for energy research with strict formatting",
    icon: "🌍",
    category: "PV Journals",
    publisher: "Nature",
    badge: "IF: 56.7",
  },
  {
    id: "science-aaas",
    name: "Science (AAAS)",
    description: "AAAS Science journal format for breakthrough PV research",
    icon: "🔬",
    category: "PV Journals",
    publisher: "AAAS",
    badge: "IF: 56.9",
  },
  {
    id: "acs-energy-letters",
    name: "ACS Energy Letters",
    description: "American Chemical Society letter format for rapid PV communications",
    icon: "🧪",
    category: "PV Journals",
    publisher: "ACS",
    badge: "IF: 19.3",
  },
  {
    id: "solar-energy-elsevier",
    name: "Solar Energy (Elsevier)",
    description: "Elsevier Solar Energy journal with highlights and graphical abstract",
    icon: "☀️",
    category: "PV Journals",
    publisher: "Elsevier",
    badge: "IF: 6.7",
  },
  {
    id: "ieee-jpv",
    name: "IEEE Journal of Photovoltaics",
    description: "IEEE journal dedicated to photovoltaic device and system research",
    icon: "📰",
    category: "PV Journals",
    publisher: "IEEE",
    badge: "IF: 2.8",
  },
  {
    id: "joule-cell-press",
    name: "Joule (Cell Press)",
    description: "Cell Press journal for sustainable energy research and policy",
    icon: "🔋",
    category: "PV Journals",
    publisher: "Cell Press",
    badge: "IF: 39.8",
  },
  // === GENERAL RESEARCH ===
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
  // === REPORTS ===
  {
    id: "technical-report",
    name: "Technical Report",
    description: "Detailed technical documentation with executive summary",
    icon: "📋",
    category: "Reports",
  },
  // === STANDARDS ===
  {
    id: "iec-test-report",
    name: "IEC Test Report",
    description: "IEC 61215/61730 qualification test report template",
    icon: "🏗️",
    category: "Standards",
  },
  // === RELIABILITY ===
  {
    id: "fmea-report",
    name: "FMEA Report",
    description: "Failure Mode and Effects Analysis for PV systems",
    icon: "⚠️",
    category: "Reliability",
  },
  // === ENGINEERING ===
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
  // === ACADEMIC ===
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
  // === LEGAL ===
  {
    id: "patent-draft",
    name: "Patent Draft",
    description: "Patent application structure with claims and figures",
    icon: "📜",
    category: "Legal",
  },
];

const PUBLISHER_COLORS: Record<string, string> = {
  Wiley: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Nature: "bg-red-500/15 text-red-400 border-red-500/30",
  AAAS: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  ACS: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Elsevier: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  IEEE: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  "Cell Press": "bg-green-500/15 text-green-400 border-green-500/30",
};

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
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.publisher && t.publisher.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700/60 rounded-xl w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/60 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">Template Gallery</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {TEMPLATES.length} templates — PV journals, academic papers, reports & technical documents
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Search and filters */}
        <div className="px-6 py-3 border-b border-gray-800/40 flex-shrink-0 space-y-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates or publishers (Wiley, Nature, IEEE...)"
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{t.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white group-hover:text-amber-300 transition-colors truncate">
                      {t.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-gray-600">{t.category}</span>
                      {t.publisher && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${
                            PUBLISHER_COLORS[t.publisher] || "bg-gray-700/30 text-gray-400 border-gray-600/30"
                          }`}
                        >
                          {t.publisher}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">{t.description}</p>
                {t.badge && (
                  <div className="mt-2 text-[10px] text-amber-500/70 font-mono">{t.badge}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
