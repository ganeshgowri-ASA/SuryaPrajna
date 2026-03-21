"use client";

import { useMemo } from "react";

interface Problem {
  line: number;
  type: "error" | "warning" | "info";
  message: string;
}

interface ProblemsPanelProps {
  content: string;
  mode: "markdown" | "latex";
  isOpen: boolean;
  onToggle: () => void;
}

export default function ProblemsPanel({
  content,
  mode,
  isOpen,
  onToggle,
}: ProblemsPanelProps) {
  const problems = useMemo(() => {
    const items: Problem[] = [];
    const lines = content.split("\n");

    if (mode === "latex") {
      let beginCount = 0;
      let endCount = 0;
      let hasDocumentClass = false;
      let hasBeginDoc = false;
      let hasEndDoc = false;

      lines.forEach((line, i) => {
        const beginMatches = line.match(/\\begin\{/g);
        const endMatches = line.match(/\\end\{/g);
        if (beginMatches) beginCount += beginMatches.length;
        if (endMatches) endCount += endMatches.length;

        if (line.includes("\\documentclass")) hasDocumentClass = true;
        if (line.includes("\\begin{document}")) hasBeginDoc = true;
        if (line.includes("\\end{document}")) hasEndDoc = true;

        // Unmatched braces on line
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;
        if (openBraces !== closeBraces) {
          items.push({
            line: i + 1,
            type: "warning",
            message: `Unmatched braces: ${openBraces} open, ${closeBraces} close`,
          });
        }

        // Common typos
        if (line.match(/\\begin\{([^}]+)\}/) && line.match(/\\end\{([^}]+)\}/)) {
          const beginEnv = line.match(/\\begin\{([^}]+)\}/)?.[1];
          const endEnv = line.match(/\\end\{([^}]+)\}/)?.[1];
          if (beginEnv && endEnv && beginEnv !== endEnv) {
            items.push({
              line: i + 1,
              type: "error",
              message: `Environment mismatch: \\begin{${beginEnv}} with \\end{${endEnv}}`,
            });
          }
        }
      });

      if (hasDocumentClass && !hasBeginDoc) {
        items.push({
          line: 1,
          type: "error",
          message: "Missing \\begin{document}",
        });
      }
      if (hasBeginDoc && !hasEndDoc) {
        items.push({
          line: lines.length,
          type: "error",
          message: "Missing \\end{document}",
        });
      }
      if (beginCount !== endCount) {
        items.push({
          line: 1,
          type: "warning",
          message: `Unmatched environments: ${beginCount} \\begin vs ${endCount} \\end`,
        });
      }
    } else {
      // Markdown checks
      lines.forEach((line, i) => {
        // Broken links
        const linkMatch = line.match(/\[([^\]]*)\]\(\s*\)/);
        if (linkMatch) {
          items.push({
            line: i + 1,
            type: "warning",
            message: `Empty link URL: [${linkMatch[1]}]()`,
          });
        }

        // Unclosed code blocks
        if (line.trim() === "```") {
          const isOpening =
            lines.slice(0, i).filter((l) => l.trim().startsWith("```")).length % 2 === 0;
          if (!isOpening) {
            // This is a closing tag, check if there's a matching opening
          }
        }

        // Missing alt text on images
        if (line.match(/!\[\]\(/)) {
          items.push({
            line: i + 1,
            type: "info",
            message: "Image missing alt text",
          });
        }

        // Heading without space
        if (line.match(/^#+[^# ]/)) {
          items.push({
            line: i + 1,
            type: "warning",
            message: "Heading missing space after #",
          });
        }
      });

      // Check for unclosed code fences
      const fenceCount = lines.filter((l) => l.trim().startsWith("```")).length;
      if (fenceCount % 2 !== 0) {
        items.push({
          line: lines.length,
          type: "error",
          message: "Unclosed code fence (```) detected",
        });
      }
    }

    return items;
  }, [content, mode]);

  const errorCount = problems.filter((p) => p.type === "error").length;
  const warnCount = problems.filter((p) => p.type === "warning").length;
  const infoCount = problems.filter((p) => p.type === "info").length;

  return (
    <div className="border-t border-gray-800/60 bg-gray-950/90 flex-shrink-0">
      {/* Toggle bar */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-1 text-xs hover:bg-gray-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-gray-500 font-medium">Problems</span>
          {errorCount > 0 && (
            <span className="text-red-400">
              {errorCount} error{errorCount > 1 ? "s" : ""}
            </span>
          )}
          {warnCount > 0 && (
            <span className="text-yellow-400">
              {warnCount} warning{warnCount > 1 ? "s" : ""}
            </span>
          )}
          {infoCount > 0 && (
            <span className="text-blue-400">
              {infoCount} info
            </span>
          )}
          {problems.length === 0 && (
            <span className="text-emerald-500">No problems</span>
          )}
        </div>
        <span className="text-gray-600">{isOpen ? "▼" : "▲"}</span>
      </button>

      {/* Problem list */}
      {isOpen && problems.length > 0 && (
        <div className="max-h-32 overflow-auto border-t border-gray-800/40">
          {problems.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1 text-xs hover:bg-gray-800/20"
            >
              <span
                className={
                  p.type === "error"
                    ? "text-red-400"
                    : p.type === "warning"
                      ? "text-yellow-400"
                      : "text-blue-400"
                }
              >
                {p.type === "error" ? "●" : p.type === "warning" ? "▲" : "ℹ"}
              </span>
              <span className="text-gray-500 font-mono w-12">Ln {p.line}</span>
              <span className="text-gray-300 flex-1">{p.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
