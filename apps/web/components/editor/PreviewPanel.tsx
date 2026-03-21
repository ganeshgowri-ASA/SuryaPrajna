"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";

interface PreviewPanelProps {
  content: string;
  mode: "markdown" | "latex";
  onLineClick?: (line: number) => void;
}

function LatexPreview({ content }: { content: string }) {
  const rendered = useMemo(() => {
    // Convert common LaTeX structures to displayable format
    let html = content;

    // Handle document class, packages (hide them)
    html = html.replace(/\\documentclass\{[^}]*\}/g, "");
    html = html.replace(/\\usepackage(\[[^\]]*\])?\{[^}]*\}/g, "");
    html = html.replace(/\\begin\{document\}/g, "");
    html = html.replace(/\\end\{document\}/g, "");

    // Title, author, date
    const titleMatch = html.match(/\\title\{([^}]*)\}/);
    const authorMatch = html.match(/\\author\{([^}]*)\}/);
    html = html.replace(/\\title\{[^}]*\}/g, "");
    html = html.replace(/\\author\{[^}]*\}/g, "");
    html = html.replace(/\\date\{[^}]*\}/g, "");
    html = html.replace(/\\maketitle/g, "");

    // Sections
    html = html.replace(/\\section\*?\{([^}]*)\}/g, "\n## $1\n");
    html = html.replace(/\\subsection\*?\{([^}]*)\}/g, "\n### $1\n");
    html = html.replace(/\\subsubsection\*?\{([^}]*)\}/g, "\n#### $1\n");

    // Text formatting
    html = html.replace(/\\textbf\{([^}]*)\}/g, "**$1**");
    html = html.replace(/\\textit\{([^}]*)\}/g, "*$1*");
    html = html.replace(/\\emph\{([^}]*)\}/g, "*$1*");
    html = html.replace(/\\underline\{([^}]*)\}/g, "<u>$1</u>");
    html = html.replace(/\\texttt\{([^}]*)\}/g, "`$1`");

    // Lists
    html = html.replace(/\\begin\{itemize\}/g, "");
    html = html.replace(/\\end\{itemize\}/g, "");
    html = html.replace(/\\begin\{enumerate\}/g, "");
    html = html.replace(/\\end\{enumerate\}/g, "");
    html = html.replace(/\\item\s/g, "- ");

    // Math environments -> keep as $$ for react-markdown
    html = html.replace(/\\begin\{equation\*?\}([\s\S]*?)\\end\{equation\*?\}/g, "\n$$\n$1\n$$\n");
    html = html.replace(/\\begin\{align\*?\}([\s\S]*?)\\end\{align\*?\}/g, "\n$$\n$1\n$$\n");

    // Abstract
    html = html.replace(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/g, "\n> **Abstract:** $1\n");

    // Figure
    html = html.replace(/\\begin\{figure\}[\s\S]*?\\caption\{([^}]*)\}[\s\S]*?\\end\{figure\}/g, "\n*Figure: $1*\n");

    // Table
    html = html.replace(/\\begin\{table\}[\s\S]*?\\caption\{([^}]*)\}[\s\S]*?\\end\{table\}/g, "\n*Table: $1*\n");

    // Citations
    html = html.replace(/\\cite\{([^}]*)\}/g, "[$1]");

    // References
    html = html.replace(/\\label\{[^}]*\}/g, "");
    html = html.replace(/\\ref\{([^}]*)\}/g, "[$1]");

    // Newlines
    html = html.replace(/\\\\/g, "\n");
    html = html.replace(/\\newline/g, "\n");
    html = html.replace(/\\par\b/g, "\n\n");

    // Add title back as heading
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

export default function PreviewPanel({ content, mode }: PreviewPanelProps) {
  return (
    <div className="h-full overflow-auto p-6">
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
      />
      <div className="prose prose-invert prose-sm max-w-none
        prose-headings:text-amber-400 prose-headings:font-semibold
        prose-h1:text-2xl prose-h1:border-b prose-h1:border-gray-700 prose-h1:pb-2
        prose-h2:text-xl prose-h3:text-lg
        prose-p:text-gray-300 prose-p:leading-relaxed
        prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-white
        prose-code:text-amber-300 prose-code:bg-gray-800/60 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
        prose-pre:bg-gray-900/80 prose-pre:border prose-pre:border-gray-700/60
        prose-blockquote:border-amber-500/40 prose-blockquote:bg-amber-500/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1
        prose-table:border-gray-700
        prose-th:text-amber-400 prose-th:border-gray-700
        prose-td:border-gray-700/60
        prose-img:rounded-lg prose-img:border prose-img:border-gray-700/60
        prose-hr:border-gray-700
        prose-li:text-gray-300
      ">
        {mode === "latex" ? (
          <LatexPreview content={content} />
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[rehypeKatex, rehypeHighlight]}
          >
            {content}
          </ReactMarkdown>
        )}
        {!content.trim() && (
          <div className="text-gray-600 text-center mt-20">
            <p className="text-lg">Start writing to see preview</p>
            <p className="text-sm mt-2">
              Supports Markdown, LaTeX math ($...$), tables, and code blocks
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
