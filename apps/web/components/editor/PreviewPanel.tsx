"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

interface PreviewPanelProps {
  content: string;
  mode: "markdown" | "latex";
  onLineClick?: (line: number) => void;
  twoColumn?: boolean;
}

function LatexPreview({ content }: { content: string }) {
  const rendered = useMemo(() => {
    let html = content;

    html = html.replace(/\\documentclass\{[^}]*\}/g, "");
    html = html.replace(/\\usepackage(\[[^\]]*\])?\{[^}]*\}/g, "");
    html = html.replace(/\\begin\{document\}/g, "");
    html = html.replace(/\\end\{document\}/g, "");

    const titleMatch = html.match(/\\title\{([^}]*)\}/);
    const authorMatch = html.match(/\\author\{([^}]*)\}/);
    html = html.replace(/\\title\{[^}]*\}/g, "");
    html = html.replace(/\\author\{[^}]*\}/g, "");
    html = html.replace(/\\date\{[^}]*\}/g, "");
    html = html.replace(/\\maketitle/g, "");

    html = html.replace(/\\section\*?\{([^}]*)\}/g, "\n## $1\n");
    html = html.replace(/\\subsection\*?\{([^}]*)\}/g, "\n### $1\n");
    html = html.replace(/\\subsubsection\*?\{([^}]*)\}/g, "\n#### $1\n");

    html = html.replace(/\\textbf\{([^}]*)\}/g, "**$1**");
    html = html.replace(/\\textit\{([^}]*)\}/g, "*$1*");
    html = html.replace(/\\emph\{([^}]*)\}/g, "*$1*");
    html = html.replace(/\\underline\{([^}]*)\}/g, "<u>$1</u>");
    html = html.replace(/\\texttt\{([^}]*)\}/g, "`$1`");

    html = html.replace(/\\begin\{itemize\}/g, "");
    html = html.replace(/\\end\{itemize\}/g, "");
    html = html.replace(/\\begin\{enumerate\}/g, "");
    html = html.replace(/\\end\{enumerate\}/g, "");
    html = html.replace(/\\item\s/g, "- ");

    html = html.replace(/\\begin\{equation\*?\}([\s\S]*?)\\end\{equation\*?\}/g, "\n$$\n$1\n$$\n");
    html = html.replace(/\\begin\{align\*?\}([\s\S]*?)\\end\{align\*?\}/g, "\n$$\n$1\n$$\n");

    html = html.replace(
      /\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/g,
      "\n> **Abstract:** $1\n",
    );

    html = html.replace(
      /\\begin\{figure\}[\s\S]*?\\caption\{([^}]*)\}[\s\S]*?\\end\{figure\}/g,
      "\n*Figure: $1*\n",
    );
    html = html.replace(
      /\\begin\{table\}[\s\S]*?\\caption\{([^}]*)\}[\s\S]*?\\end\{table\}/g,
      "\n*Table: $1*\n",
    );

    html = html.replace(/\\cite\{([^}]*)\}/g, "[$1]");
    html = html.replace(/\\label\{[^}]*\}/g, "");
    html = html.replace(/\\ref\{([^}]*)\}/g, "[$1]");

    html = html.replace(/\\\\/g, "\n");
    html = html.replace(/\\newline/g, "\n");
    html = html.replace(/\\par\b/g, "\n\n");

    let prefix = "";
    if (titleMatch) prefix += `# ${titleMatch[1]}\n`;
    if (authorMatch) prefix += `*${authorMatch[1]}*\n\n`;

    return prefix + html;
  }, [content]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex, rehypeHighlight]}
    >
      {rendered}
    </ReactMarkdown>
  );
}

// Add figure/table numbering and citation rendering
function preprocessContent(content: string): string {
  let processed = content;
  let figNum = 0;
  let tableNum = 0;

  // Number figures: ![caption](url) → Figure N: caption
  processed = processed.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, () => {
    figNum++;
    return `![Figure ${figNum}]($2)\n\n*Figure ${figNum}: $1*`;
  });

  // Simple citation rendering: [@key] → [N]
  const citations: string[] = [];
  processed = processed.replace(/\[@([^\]]+)\]/g, (_, key) => {
    let idx = citations.indexOf(key);
    if (idx === -1) {
      citations.push(key);
      idx = citations.length - 1;
    }
    return `[${idx + 1}]`;
  });

  // Number tables (look for table headers after a caption-like line)
  processed = processed.replace(/\*\*Table:?\s*([^*]+)\*\*/g, () => {
    tableNum++;
    return `**Table ${tableNum}: $1**`;
  });

  return processed;
}

export default function PreviewPanel({ content, mode, twoColumn }: PreviewPanelProps) {
  const [showPageBreaks, setShowPageBreaks] = useState(true);
  const processedContent = useMemo(() => preprocessContent(content), [content]);

  return (
    <div className="h-full overflow-auto">
      {/* Preview controls */}
      <div className="sticky top-0 z-10 flex items-center gap-2 px-4 py-1.5 bg-gray-950/95 border-b border-gray-800/40 backdrop-blur-sm">
        <span className="text-xs text-gray-500">Preview</span>
        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={() => setShowPageBreaks(!showPageBreaks)}
            className={`text-xs px-2 py-0.5 rounded transition-colors ${
              showPageBreaks
                ? "text-amber-400 bg-amber-500/10"
                : "text-gray-600 hover:text-gray-400"
            }`}
          >
            Pages
          </button>
        </div>
      </div>

      {/* Paper-style container */}
      <div className={`p-6 ${showPageBreaks ? "max-w-[800px] mx-auto" : ""}`}>
        <div
          className={`${
            showPageBreaks
              ? "bg-white text-gray-900 shadow-xl rounded-sm px-12 py-10 min-h-[1056px]"
              : ""
          } ${twoColumn ? "columns-2 gap-6" : ""}`}
        >
          <div
            className={`prose max-w-none ${
              showPageBreaks
                ? "prose-gray prose-sm prose-headings:text-gray-900 prose-headings:font-serif prose-p:text-gray-800 prose-p:leading-relaxed prose-p:text-justify prose-a:text-blue-700 prose-strong:text-gray-900 prose-code:text-red-700 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-blockquote:border-gray-300 prose-blockquote:bg-gray-50 prose-table:border-gray-300 prose-th:text-gray-900 prose-th:bg-gray-100 prose-th:border-gray-300 prose-td:border-gray-200 prose-h1:text-2xl prose-h1:text-center prose-h1:font-serif prose-h2:text-lg prose-h2:font-serif prose-h3:text-base prose-h3:font-serif"
                : "prose-invert prose-sm prose-headings:text-amber-400 prose-headings:font-semibold prose-h1:text-2xl prose-h1:border-b prose-h1:border-gray-700 prose-h1:pb-2 prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-code:text-amber-300 prose-code:bg-gray-800/60 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900/80 prose-pre:border prose-pre:border-gray-700/60 prose-blockquote:border-amber-500/40 prose-blockquote:bg-amber-500/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-table:border-gray-700 prose-th:text-amber-400 prose-th:border-gray-700 prose-td:border-gray-700/60 prose-img:rounded-lg prose-img:border prose-img:border-gray-700/60 prose-hr:border-gray-700 prose-li:text-gray-300"
            }`}
          >
            {mode === "latex" ? (
              <LatexPreview content={content} />
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex, rehypeHighlight]}
              >
                {processedContent}
              </ReactMarkdown>
            )}
            {!content.trim() && (
              <div
                className={`text-center mt-20 ${showPageBreaks ? "text-gray-400" : "text-gray-600"}`}
              >
                <p className="text-lg">Start writing to see preview</p>
                <p className="text-sm mt-2">
                  Supports Markdown, LaTeX math ($...$), tables, and code blocks
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
