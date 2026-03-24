"use client";

import { useCallback, useState } from "react";

type ContentType = "equation" | "graph" | "table" | "literature" | "infographic" | "figure-caption";

interface GeneratorAction {
  type: ContentType;
  label: string;
  icon: string;
  placeholder: string;
  systemPrompt: string;
}

const GENERATORS: GeneratorAction[] = [
  {
    type: "equation",
    label: "Equation",
    icon: "fx",
    placeholder: "e.g. Shockley diode equation for PV cell, or IV curve equation...",
    systemPrompt: "You are a LaTeX equation expert for photovoltaic science. Generate ONLY the LaTeX equation wrapped in $$ delimiters for display math or $ for inline. Include brief comments. Use standard PV notation (Isc, Voc, FF, eta, etc.).",
  },
  {
    type: "graph",
    label: "Graph / Chart",
    icon: "chart",
    placeholder: "e.g. IV curve plot for a 400W monocrystalline module at STC...",
    systemPrompt: "You are a scientific visualization expert. Generate a Markdown table of data points suitable for plotting, plus a Mermaid or ASCII chart if possible. Include axis labels, units, and a figure caption. For PV: use standard test conditions (STC), realistic values.",
  },
  {
    type: "table",
    label: "Table",
    icon: "grid",
    placeholder: "e.g. Comparison table of PV cell technologies (mono-Si, poly-Si, CdTe, CIGS)...",
    systemPrompt: "You are a scientific table generator. Generate a well-formatted Markdown table with proper headers, alignment, and units. For PV tables, include standard parameters (efficiency, Voc, Isc, FF, degradation rate, temperature coefficient). Add a table caption.",
  },
  {
    type: "literature",
    label: "Literature Review",
    icon: "book",
    placeholder: "e.g. Recent advances in perovskite-silicon tandem solar cells (2023-2025)...",
    systemPrompt: "You are an academic literature review writer for photovoltaic research. Write a structured literature review section with proper academic tone. Include hypothetical but realistic citation placeholders like [@Author2024]. Organize by themes or chronology. Reference IEC standards where relevant.",
  },
  {
    type: "infographic",
    label: "Infographic / Diagram",
    icon: "layers",
    placeholder: "e.g. PV module manufacturing process flow diagram...",
    systemPrompt: "You are a technical diagram creator. Generate a Mermaid.js diagram (flowchart, sequence, or class diagram) that can be rendered in Markdown. For PV: include standard process steps, testing stages per IEC standards. Wrap in ```mermaid code blocks.",
  },
  {
    type: "figure-caption",
    label: "Figure Caption",
    icon: "tag",
    placeholder: "Describe the figure content for a proper academic caption...",
    systemPrompt: "You are an academic figure caption writer. Generate a formal, concise figure caption suitable for a Wiley/Elsevier/IEEE journal. Include figure number placeholder, description of what is shown, key observations, and measurement conditions if applicable.",
  },
];

interface AIContentGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (content: string) => void;
  apiHeaders?: Record<string, string>;
}

export default function AIContentGenerator({
  isOpen,
  onClose,
  onInsert,
  apiHeaders = {},
}: AIContentGeneratorProps) {
  const [activeType, setActiveType] = useState<ContentType>("equation");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"markdown" | "latex">("markdown");

  const activeGen = GENERATORS.find((g) => g.type === activeType) || GENERATORS[0];

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...apiHeaders },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          systemPrompt: activeGen.systemPrompt + (mode === "latex" ? " Output in LaTeX format." : " Output in Markdown format."),
        }),
      });
      const data = await res.json();
      setResult(data.content || data.error || "No response.");
    } catch {
      setResult("Error: Could not reach AI service.");
    } finally {
      setLoading(false);
    }
  }, [prompt, loading, activeGen, mode, apiHeaders]);

  const handleInsert = useCallback(() => {
    if (result) {
      onInsert(result);
      onClose();
    }
  }, [result, onInsert, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-[750px] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">AI Content Generator</h2>
          <div className="flex items-center gap-2">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as "markdown" | "latex")}
              className="text-xs bg-gray-800 border border-gray-700 rounded px-2 py-0.5 text-gray-300"
            >
              <option value="markdown">Markdown</option>
              <option value="latex">LaTeX</option>
            </select>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-300">
              X
            </button>
          </div>
        </div>

        {/* Type tabs */}
        <div className="flex gap-1 px-3 py-2 border-b border-gray-800 overflow-x-auto">
          {GENERATORS.map((gen) => (
            <button
              key={gen.type}
              type="button"
              onClick={() => { setActiveType(gen.type); setResult(""); }}
              className={`px-2.5 py-1 text-xs rounded whitespace-nowrap transition-colors ${
                activeType === gen.type
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              }`}
            >
              {gen.icon} {gen.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={activeGen.placeholder}
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500 resize-none"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="mt-2 px-4 py-1.5 text-xs bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded"
          >
            {loading ? "Generating..." : `Generate ${activeGen.label}`}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="flex-1 overflow-y-auto px-4 pb-3">
            <div className="bg-gray-950 border border-gray-800 rounded p-3">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">{result}</pre>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={handleInsert}
                className="px-4 py-1.5 text-xs bg-teal-600 hover:bg-teal-500 text-white rounded"
              >
                Insert into Editor
              </button>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(result)}
                className="px-4 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
