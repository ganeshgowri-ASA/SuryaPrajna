"use client";

import { useMemo, useState } from "react";

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

export default function OutlinePanel({ content, mode, onNavigate }: OutlinePanelProps) {
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [activeHeading, setActiveHeading] = useState<number | null>(null);

  const headings = useMemo(() => {
    const lines = content.split("\n");
    const items: HeadingItem[] = [];

    lines.forEach((line, i) => {
      if (mode === "markdown") {
        const match = line.match(/^(#{1,6})\s+(.+)/);
        if (match) {
          items.push({
            level: match[1].length,
            text: match[2].replace(/[*_`\[\]]/g, ""),
            line: i + 1,
          });
        }
      } else {
        const sectionMatch = line.match(
          /\\(part|chapter|section|subsection|subsubsection|paragraph|subparagraph)\*?\{([^}]+)\}/,
        );
        if (sectionMatch) {
          const levelMap: Record<string, number> = {
            part: 1,
            chapter: 1,
            section: 2,
            subsection: 3,
            subsubsection: 4,
            paragraph: 5,
            subparagraph: 6,
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

  const handleClick = (heading: HeadingItem) => {
    setActiveHeading(heading.line);
    onNavigate?.(heading.line);
  };

  const toggleCollapse = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Determine which headings are visible (not collapsed by a parent)
  const visibleHeadings = useMemo(() => {
    const visible: { heading: HeadingItem; index: number; hasChildren: boolean }[] = [];
    const collapsedParents: { level: number; index: number }[] = [];

    headings.forEach((h, i) => {
      // Check if any collapsed parent hides this heading
      while (
        collapsedParents.length > 0 &&
        collapsedParents[collapsedParents.length - 1].level >= h.level
      ) {
        collapsedParents.pop();
      }

      const isHidden = collapsedParents.length > 0;

      // Check if this heading has children
      const hasChildren = i < headings.length - 1 && headings[i + 1].level > h.level;

      if (!isHidden) {
        visible.push({ heading: h, index: i, hasChildren });
      }

      if (collapsed.has(i)) {
        collapsedParents.push({ level: h.level, index: i });
      }
    });

    return visible;
  }, [headings, collapsed]);

  const minLevel = headings.length > 0 ? Math.min(...headings.map((h) => h.level)) : 1;

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-gray-800/60 flex-shrink-0 flex items-center justify-between">
        <span className="text-xs font-semibold text-white">Document Outline</span>
        <span className="text-xs text-gray-600">
          {headings.length} heading{headings.length !== 1 ? "s" : ""}
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
          visibleHeadings.map(({ heading: h, index: i, hasChildren }) => (
            <button
              type="button"
              key={`${i}-${h.line}`}
              onClick={() => handleClick(h)}
              className={`w-full text-left px-2 py-1 text-xs transition-colors truncate flex items-center gap-1 ${
                activeHeading === h.line
                  ? "bg-amber-500/10 text-amber-300"
                  : "text-gray-400 hover:bg-gray-800/40 hover:text-amber-300"
              }`}
              style={{ paddingLeft: `${(h.level - minLevel) * 14 + 8}px` }}
            >
              {hasChildren ? (
                <button
                  type="button"
                  onClick={(e) => toggleCollapse(i, e as unknown as React.MouseEvent)}
                  className="text-gray-600 hover:text-gray-400 w-3 text-center flex-shrink-0 cursor-pointer bg-transparent border-none p-0"
                >
                  {collapsed.has(i) ? "▸" : "▾"}
                </button>
              ) : (
                <span className="w-3 flex-shrink-0" />
              )}
              <span className="text-gray-700 mr-1 flex-shrink-0 text-[10px]">
                {mode === "markdown" ? `H${h.level}` : "§"}
              </span>
              <span className="truncate">{h.text}</span>
              <span className="ml-auto text-gray-700 text-[10px] flex-shrink-0 pl-1">{h.line}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
