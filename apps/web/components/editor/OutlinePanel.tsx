"use client";

import { useMemo } from "react";

interface OutlinePanelProps {
  content: string;
  mode: "markdown" | "latex";
  onNavigate?: (line: number) => void;
}

interface HeadingItem {
  level: number;
  text: string;
  line: number;
}

export default function OutlinePanel({ content, mode }: OutlinePanelProps) {
  const headings = useMemo(() => {
    const lines = content.split("\n");
    const items: HeadingItem[] = [];

    lines.forEach((line, i) => {
      if (mode === "markdown") {
        const match = line.match(/^(#{1,6})\s+(.+)/);
        if (match) {
          items.push({
            level: match[1].length,
            text: match[2].replace(/[*_`]/g, ""),
            line: i + 1,
          });
        }
      } else {
        // LaTeX
        const sectionMatch = line.match(
          /\\(section|subsection|subsubsection|chapter)\*?\{([^}]+)\}/
        );
        if (sectionMatch) {
          const levelMap: Record<string, number> = {
            chapter: 1,
            section: 2,
            subsection: 3,
            subsubsection: 4,
          };
          items.push({
            level: levelMap[sectionMatch[1]] || 2,
            text: sectionMatch[2],
            line: i + 1,
          });
        }
      }
    });

    return items;
  }, [content, mode]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-gray-800/60 flex-shrink-0">
        <span className="text-xs font-semibold text-white">
          Document Outline
        </span>
      </div>
      <div className="flex-1 overflow-auto min-h-0 py-1">
        {headings.length === 0 ? (
          <div className="p-4 text-center text-gray-600 text-xs">
            {content.trim()
              ? "No headings found. Use # for Markdown or \\section{} for LaTeX."
              : "Start writing to see the document outline."}
          </div>
        ) : (
          headings.map((h, i) => (
            <button
              key={i}
              className="w-full text-left px-3 py-1 text-xs hover:bg-gray-800/40 transition-colors text-gray-400 hover:text-amber-300 truncate"
              style={{ paddingLeft: `${(h.level - 1) * 12 + 12}px` }}
            >
              <span className="text-gray-700 mr-1.5">
                {mode === "markdown" ? "#".repeat(h.level) : "§"}
              </span>
              {h.text}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
