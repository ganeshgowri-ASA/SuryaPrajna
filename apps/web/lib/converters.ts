/**
 * Client-side file conversion utilities for the editor import/export system.
 * Handles LaTeX, BibTeX, RTF, and plain text conversions.
 * Heavy conversions (DOCX, PDF) are delegated to the /api/convert route.
 */

export interface ImportResult {
  markdown: string;
  bibtex?: string;
  metadata: {
    wordCount: number;
    sectionCount: number;
    referenceCount: number;
    title?: string;
    format: string;
  };
}

// ─── LaTeX → Markdown ───────────────────────────────────────────────────────

export function latexToMarkdown(latex: string): ImportResult {
  let md = latex;

  // Extract preamble metadata
  const titleMatch = md.match(/\\title\{([^}]*)\}/);
  const title = titleMatch?.[1] || undefined;

  // Extract bibliography if embedded
  let bibtex: string | undefined;
  const bibMatch = md.match(/\\begin\{thebibliography\}[\s\S]*?\\end\{thebibliography\}/);
  if (bibMatch) {
    bibtex = convertThebibliographyToBibtex(bibMatch[0]);
    md = md.replace(bibMatch[0], "");
  }

  // Remove preamble
  const beginDoc = md.indexOf("\\begin{document}");
  if (beginDoc !== -1) {
    md = md.slice(beginDoc + "\\begin{document}".length);
  }
  md = md.replace(/\\end\{document\}[\s\S]*$/, "");

  // Remove common preamble commands that may remain
  md = md.replace(/\\documentclass(\[.*?\])?\{.*?\}/g, "");
  md = md.replace(/\\usepackage(\[.*?\])?\{.*?\}/g, "");
  md = md.replace(/\\(author|date|affiliation|institute)\{[^}]*\}/g, "");
  md = md.replace(/\\maketitle/g, "");
  md = md.replace(/\\bibliographystyle\{.*?\}/g, "");
  md = md.replace(/\\bibliography\{.*?\}/g, "");

  // Title
  if (title) {
    md = `# ${title}\n\n${md}`;
  } else if (titleMatch) {
    md = md.replace(/\\title\{([^}]*)\}/g, "# $1\n");
  }

  // Abstract
  md = md.replace(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/g, "\n## Abstract\n\n$1\n");

  // Sections
  md = md.replace(/\\section\*?\{([^}]*)\}/g, "\n## $1\n");
  md = md.replace(/\\subsection\*?\{([^}]*)\}/g, "\n### $1\n");
  md = md.replace(/\\subsubsection\*?\{([^}]*)\}/g, "\n#### $1\n");
  md = md.replace(/\\paragraph\*?\{([^}]*)\}/g, "\n**$1** ");

  // Text formatting
  md = md.replace(/\\textbf\{([^}]*)\}/g, "**$1**");
  md = md.replace(/\\textit\{([^}]*)\}/g, "*$1*");
  md = md.replace(/\\emph\{([^}]*)\}/g, "*$1*");
  md = md.replace(/\\underline\{([^}]*)\}/g, "$1");
  md = md.replace(/\\texttt\{([^}]*)\}/g, "`$1`");
  md = md.replace(/\\textsc\{([^}]*)\}/g, "$1");

  // Math environments
  md = md.replace(/\\begin\{equation\*?\}([\s\S]*?)\\end\{equation\*?\}/g, "\n$$\n$1\n$$\n");
  md = md.replace(/\\begin\{align\*?\}([\s\S]*?)\\end\{align\*?\}/g, "\n$$\n$1\n$$\n");
  md = md.replace(/\\begin\{displaymath\}([\s\S]*?)\\end\{displaymath\}/g, "\n$$\n$1\n$$\n");
  md = md.replace(/\\\[([\s\S]*?)\\\]/g, "\n$$\n$1\n$$\n");
  md = md.replace(/\\\((.*?)\\\)/g, "$$$1$$");

  // Lists
  md = md.replace(/\\begin\{itemize\}/g, "");
  md = md.replace(/\\end\{itemize\}/g, "");
  md = md.replace(/\\begin\{enumerate\}/g, "");
  md = md.replace(/\\end\{enumerate\}/g, "");
  md = md.replace(/\\item\s*/g, "- ");

  // Figures
  md = md.replace(
    /\\begin\{figure\}[\s\S]*?\\includegraphics(?:\[.*?\])?\{([^}]*)\}[\s\S]*?\\caption\{([^}]*)\}[\s\S]*?\\end\{figure\}/g,
    "\n![$2]($1)\n",
  );
  md = md.replace(/\\includegraphics(?:\[.*?\])?\{([^}]*)\}/g, "![]($1)");

  // Tables
  md = convertLatexTables(md);

  // Citations
  md = md.replace(/\\cite\{([^}]*)\}/g, (_, keys: string) => {
    return keys
      .split(",")
      .map((k: string) => `[@${k.trim()}]`)
      .join("");
  });
  md = md.replace(/\\citep\{([^}]*)\}/g, (_, keys: string) => {
    return keys
      .split(",")
      .map((k: string) => `[@${k.trim()}]`)
      .join("");
  });
  md = md.replace(/\\citet\{([^}]*)\}/g, (_, keys: string) => {
    return keys
      .split(",")
      .map((k: string) => `@${k.trim()}`)
      .join(", ");
  });

  // References
  md = md.replace(/\\ref\{([^}]*)\}/g, "[$1]");
  md = md.replace(/\\label\{([^}]*)\}/g, "");
  md = md.replace(/\\eqref\{([^}]*)\}/g, "([$1])");

  // Footnotes
  md = md.replace(/\\footnote\{([^}]*)\}/g, "[^fn]: $1\n");

  // Special characters
  md = md.replace(/\\&/g, "&");
  md = md.replace(/\\%/g, "%");
  md = md.replace(/\\\$/g, "$");
  md = md.replace(/\\#/g, "#");
  md = md.replace(/\\_/g, "_");
  md = md.replace(/\\{/g, "{");
  md = md.replace(/\\}/g, "}");
  md = md.replace(/~/g, " ");
  md = md.replace(/``/g, '"');
  md = md.replace(/''/g, '"');
  md = md.replace(/---/g, "—");
  md = md.replace(/--/g, "–");

  // Line breaks
  md = md.replace(/\\\\/g, "  \n");
  md = md.replace(/\\newline/g, "  \n");
  md = md.replace(/\\newpage/g, "\n---\n");
  md = md.replace(/\\clearpage/g, "\n---\n");

  // Remove remaining LaTeX commands
  md = md.replace(/\\[a-zA-Z]+\*?(\{[^}]*\})?/g, "");

  // Clean up whitespace
  md = md.replace(/\n{3,}/g, "\n\n");
  md = md.trim();

  const referenceCount = (md.match(/\[@[^\]]+\]/g) || []).length;
  const sectionCount = (md.match(/^#{1,4}\s/gm) || []).length;
  const wordCount = md.trim().split(/\s+/).length;

  return {
    markdown: md,
    bibtex,
    metadata: {
      wordCount,
      sectionCount,
      referenceCount,
      title,
      format: "LaTeX",
    },
  };
}

function convertLatexTables(md: string): string {
  return md.replace(
    /\\begin\{tabular\}\{([^}]*)\}([\s\S]*?)\\end\{tabular\}/g,
    (_, colSpec: string, body: string) => {
      const cols =
        colSpec.replace(/[|lcrp{^}]/g, "").length || colSpec.replace(/[^lcr|p]/g, "").length;
      const colCount = Math.max(cols, (colSpec.match(/[lcr]/g) || []).length, 2);

      const rows = body
        .split(/\\\\/)
        .map((row) => row.trim())
        .filter(
          (row) =>
            row &&
            !row.startsWith("\\hline") &&
            !row.startsWith("\\toprule") &&
            !row.startsWith("\\midrule") &&
            !row.startsWith("\\bottomrule"),
        );

      if (rows.length === 0) return "";

      const mdRows = rows.map((row) => {
        const cells = row
          .replace(/\\hline|\\toprule|\\midrule|\\bottomrule|\\cline\{.*?\}/g, "")
          .split("&")
          .map((cell) => cell.trim());
        while (cells.length < colCount) cells.push("");
        return `| ${cells.join(" | ")} |`;
      });

      if (mdRows.length > 0) {
        const separator = `| ${Array(colCount).fill("---").join(" | ")} |`;
        mdRows.splice(1, 0, separator);
      }

      return `\n${mdRows.join("\n")}\n`;
    },
  );
}

function convertThebibliographyToBibtex(thebib: string): string {
  const entries: string[] = [];
  const bibitemRegex =
    /\\bibitem(?:\[([^\]]*)\])?\{([^}]*)\}\s*([\s\S]*?)(?=\\bibitem|\\end\{thebibliography\})/g;
  let match: RegExpExecArray | null;

  for (match = bibitemRegex.exec(thebib); match !== null; match = bibitemRegex.exec(thebib)) {
    const key = match[2];
    const text = match[3].trim().replace(/\n/g, " ");
    entries.push(`@article{${key},\n  note = {${text}}\n}`);
  }

  return entries.join("\n\n");
}

// ─── BibTeX Parser ──────────────────────────────────────────────────────────

export function parseBibtex(bib: string): {
  entries: Array<{ key: string; type: string; fields: Record<string, string> }>;
  raw: string;
} {
  const entries: Array<{
    key: string;
    type: string;
    fields: Record<string, string>;
  }> = [];

  const entryRegex = /@(\w+)\s*\{([^,]*),\s*([\s\S]*?)(?=\n@|\n*$)/g;
  let match: RegExpExecArray | null;

  for (match = entryRegex.exec(bib); match !== null; match = entryRegex.exec(bib)) {
    const type = match[1].toLowerCase();
    const key = match[2].trim();
    const fieldsStr = match[3];
    const fields: Record<string, string> = {};

    const fieldRegex = /(\w+)\s*=\s*[{"]([\s\S]*?)(?:[}"](?:\s*,|\s*$))/g;
    let fieldMatch: RegExpExecArray | null;
    for (
      fieldMatch = fieldRegex.exec(fieldsStr);
      fieldMatch !== null;
      fieldMatch = fieldRegex.exec(fieldsStr)
    ) {
      fields[fieldMatch[1].toLowerCase()] = fieldMatch[2].trim();
    }

    entries.push({ key, type, fields });
  }

  return { entries, raw: bib };
}

// ─── RTF → Markdown ─────────────────────────────────────────────────────────

export function rtfToMarkdown(rtf: string): ImportResult {
  let text = rtf;

  // Remove RTF header and groups
  text = text.replace(/\{\\rtf1[\s\S]*?(?=\\pard|[^\\{])/g, "");

  // Remove font tables, color tables, etc.
  text = text.replace(/\{\\fonttbl[\s\S]*?\}/g, "");
  text = text.replace(/\{\\colortbl[\s\S]*?\}/g, "");
  text = text.replace(/\{\\stylesheet[\s\S]*?\}/g, "");
  text = text.replace(/\{\\info[\s\S]*?\}/g, "");

  // Convert formatting
  text = text.replace(/\\b\s+(.*?)\\b0/g, "**$1**");
  text = text.replace(/\\i\s+(.*?)\\i0/g, "*$1*");
  text = text.replace(/\\ul\s+(.*?)\\ulnone/g, "$1");

  // Paragraphs
  text = text.replace(/\\par\s*/g, "\n\n");
  text = text.replace(/\\pard\s*/g, "");
  text = text.replace(/\\line\s*/g, "  \n");
  text = text.replace(/\\tab\s*/g, "\t");

  // Remove remaining RTF commands
  text = text.replace(/\\[a-z]+\d*\s?/gi, "");
  text = text.replace(/[{}]/g, "");

  // Special characters
  text = text.replace(/\\'([0-9a-f]{2})/gi, (_, hex: string) =>
    String.fromCharCode(Number.parseInt(hex, 16)),
  );

  // Clean up
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();

  const wordCount = text.trim().split(/\s+/).length;
  const sectionCount = (text.match(/^#{1,4}\s/gm) || []).length;

  return {
    markdown: text,
    metadata: {
      wordCount,
      sectionCount,
      referenceCount: 0,
      format: "RTF",
    },
  };
}

// ─── Plain text / Markdown → ImportResult ────────────────────────────────────

export function textToImportResult(text: string, format: string): ImportResult {
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sectionCount = (text.match(/^#{1,4}\s/gm) || []).length;
  const referenceCount = (text.match(/\[@[^\]]+\]/g) || []).length;

  return {
    markdown: text,
    metadata: {
      wordCount,
      sectionCount,
      referenceCount,
      format,
    },
  };
}

// ─── Markdown → LaTeX (for enhanced export) ─────────────────────────────────

export function markdownToLatex(md: string, projectName: string, bibContent?: string): string {
  let tex = md;

  // Extract title from first heading
  const titleMatch = tex.match(/^#\s+(.+)$/m);
  const title = titleMatch?.[1] || projectName;
  if (titleMatch) {
    tex = tex.replace(titleMatch[0], "");
  }

  // Headings
  tex = tex.replace(/^####\s+(.+)$/gm, "\\subsubsection{$1}");
  tex = tex.replace(/^###\s+(.+)$/gm, "\\subsection{$1}");
  tex = tex.replace(/^##\s+(.+)$/gm, "\\section{$1}");

  // Bold and italic
  tex = tex.replace(/\*\*\*(.+?)\*\*\*/g, "\\textbf{\\textit{$1}}");
  tex = tex.replace(/\*\*(.+?)\*\*/g, "\\textbf{$1}");
  tex = tex.replace(/\*(.+?)\*/g, "\\textit{$1}");

  // Inline code
  tex = tex.replace(/`([^`]+)`/g, "\\texttt{$1}");

  // Code blocks
  tex = tex.replace(/```(\w*)\n([\s\S]*?)```/g, "\\begin{verbatim}\n$2\\end{verbatim}");

  // Math (already in $ or $$)

  // Citations
  tex = tex.replace(/\[@([^\]]+)\]/g, (_, keys: string) => {
    return `\\cite{${keys.replace(/@/g, "")}}`;
  });

  // Images
  tex = tex.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    "\\begin{figure}[htbp]\n\\centering\n\\includegraphics[width=0.8\\textwidth]{$2}\n\\caption{$1}\n\\end{figure}",
  );

  // Links
  tex = tex.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "\\href{$2}{$1}");

  // Lists
  tex = tex.replace(/^- (.+)$/gm, "\\item $1");
  // Wrap consecutive \\item lines in itemize
  tex = tex.replace(/((?:^\\item .+$\n?)+)/gm, "\\begin{itemize}\n$1\\end{itemize}\n");

  // Numbered lists
  tex = tex.replace(/^\d+\.\s+(.+)$/gm, "\\item $1");

  // Blockquotes
  tex = tex.replace(/^>\s+(.+)$/gm, "\\begin{quote}\n$1\n\\end{quote}");

  // Horizontal rules
  tex = tex.replace(/^---+$/gm, "\\noindent\\rule{\\textwidth}{0.4pt}");

  // Tables
  tex = convertMarkdownTablesToLatex(tex);

  // Special characters
  tex = tex.replace(/&/g, "\\&");
  tex = tex.replace(/%/g, "\\%");
  tex = tex.replace(/#(?!{)/g, "\\#");
  // Undo double-escaping from our own conversions
  tex = tex.replace(/\\\\&/g, "\\&");

  // Build document
  const hasBib = bibContent && bibContent.trim().length > 10;
  const bibRef = hasBib ? "\\bibliographystyle{plain}\n\\bibliography{references}\n" : "";

  return `\\documentclass[12pt,a4paper]{article}

\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath,amssymb}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{booktabs}
\\usepackage{geometry}
\\geometry{margin=2.5cm}

\\title{${title}}
\\author{}
\\date{\\today}

\\begin{document}

\\maketitle

${tex.trim()}

${bibRef}
\\end{document}
`;
}

function convertMarkdownTablesToLatex(md: string): string {
  return md.replace(/((?:\|[^\n]+\|\n)+)/g, (tableBlock) => {
    const lines = tableBlock.trim().split("\n").filter(Boolean);
    if (lines.length < 2) return tableBlock;

    // Skip separator line
    const dataLines = lines.filter((l) => !l.match(/^\|[\s-:|]+\|$/));
    if (dataLines.length === 0) return tableBlock;

    const firstRow = dataLines[0].split("|").filter((c) => c.trim() !== "");
    const colCount = firstRow.length;
    const colSpec = Array(colCount).fill("l").join(" ");

    const rows = dataLines.map((line) => {
      const cells = line.split("|").filter((c) => c.trim() !== "");
      return `${cells.map((c) => c.trim()).join(" & ")} \\\\`;
    });

    return `\n\\begin{tabular}{${colSpec}}\n\\toprule\n${rows[0]}\n\\midrule\n${rows.slice(1).join("\n")}\n\\bottomrule\n\\end{tabular}\n`;
  });
}

// ─── PDF text → Markdown structure ──────────────────────────────────────────

export function structurePdfText(text: string): ImportResult {
  let md = text;

  // Try to detect title (first non-empty line, often in caps or larger)
  const lines = md.split("\n").filter((l) => l.trim());
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    if (
      firstLine.length < 200 &&
      (firstLine === firstLine.toUpperCase() || !firstLine.includes("."))
    ) {
      md = `# ${firstLine}\n\n${lines.slice(1).join("\n")}`;
    }
  }

  // Detect common section patterns
  md = md.replace(
    /^(\d+\.)\s+(INTRODUCTION|METHODOLOGY|METHODS|RESULTS|DISCUSSION|CONCLUSION|REFERENCES|ABSTRACT|BACKGROUND|LITERATURE REVIEW|EXPERIMENTAL|ACKNOWLEDGMENTS?)/gim,
    "\n## $1 $2\n",
  );
  md = md.replace(
    /^(INTRODUCTION|METHODOLOGY|METHODS|RESULTS|DISCUSSION|CONCLUSION|REFERENCES|ABSTRACT|BACKGROUND|LITERATURE REVIEW|EXPERIMENTAL|ACKNOWLEDGMENTS?)$/gim,
    "\n## $1\n",
  );
  md = md.replace(/^(\d+\.\d+)\s+(.+)$/gm, "\n### $1 $2\n");

  // Clean up artifacts
  md = md.replace(/\f/g, "\n---\n"); // Form feeds → horizontal rules
  md = md.replace(/ {2,}/g, " ");
  md = md.replace(/\n{3,}/g, "\n\n");
  md = md.trim();

  const wordCount = md.trim().split(/\s+/).length;
  const sectionCount = (md.match(/^#{1,4}\s/gm) || []).length;
  const referenceCount = (md.match(/\[\d+\]/g) || []).length;

  return {
    markdown: md,
    metadata: {
      wordCount,
      sectionCount,
      referenceCount,
      format: "PDF",
    },
  };
}

// ─── Export: BibTeX from references ──────────────────────────────────────────

export function referencesToBibtex(
  references: Array<{
    id: string;
    title: string;
    authors: string[];
    year: number;
    journal?: string;
    doi?: string;
    bibtexKey?: string;
  }>,
): string {
  return references
    .map((ref) => {
      const key = ref.bibtexKey || ref.id;
      const fields = [
        `  title = {${ref.title}}`,
        `  author = {${ref.authors.join(" and ")}}`,
        `  year = {${ref.year}}`,
      ];
      if (ref.journal) fields.push(`  journal = {${ref.journal}}`);
      if (ref.doi) fields.push(`  doi = {${ref.doi}}`);
      return `@article{${key},\n${fields.join(",\n")}\n}`;
    })
    .join("\n\n");
}
