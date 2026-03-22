import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const format = formData.get("format") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    switch (format) {
      case "docx": {
        const mammoth = await import("mammoth");
        // Convert to HTML first, then to simple markdown
        const result = await mammoth.convertToHtml({ buffer });
        const markdown = htmlToMarkdown(result.value);
        return NextResponse.json({
          markdown,
          warnings: result.messages
            .filter((m: { type: string }) => m.type === "warning")
            .map((m: { message: string }) => m.message),
        });
      }

      case "pdf": {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require("pdf-parse") as (
          buffer: Buffer,
        ) => Promise<{ text: string; numpages: number; info: Record<string, unknown> }>;
        const data = await pdfParse(buffer);
        return NextResponse.json({
          markdown: data.text,
          metadata: {
            pages: data.numpages,
            info: data.info,
          },
        });
      }

      default:
        return NextResponse.json({ error: `Unsupported format: ${format}` }, { status: 400 });
    }
  } catch (error) {
    console.error("Conversion error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Conversion failed",
      },
      { status: 500 },
    );
  }
}

/**
 * Convert HTML (from mammoth) to Markdown.
 * Handles common HTML elements produced by Word documents.
 */
function htmlToMarkdown(html: string): string {
  let md = html;

  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n# $1\n\n");
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n## $1\n\n");
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n### $1\n\n");
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n#### $1\n\n");
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "\n##### $1\n\n");
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "\n###### $1\n\n");

  // Bold and italic
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**");
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*");

  // Code
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, "\n```\n$1\n```\n");

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");

  // Images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, "![$2]($1)");
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, "![]($1)");

  // Lists
  md = md.replace(/<ul[^>]*>/gi, "\n");
  md = md.replace(/<\/ul>/gi, "\n");
  md = md.replace(/<ol[^>]*>/gi, "\n");
  md = md.replace(/<\/ol>/gi, "\n");
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n");

  // Tables
  md = convertHtmlTableToMarkdown(md);

  // Paragraphs and line breaks
  md = md.replace(/<br\s*\/?>/gi, "  \n");
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n$1\n");
  md = md.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, "\n$1\n");

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content: string) => {
    return content
      .split("\n")
      .map((line: string) => `> ${line}`)
      .join("\n");
  });

  // Superscript and subscript
  md = md.replace(/<sup[^>]*>([\s\S]*?)<\/sup>/gi, "^$1^");
  md = md.replace(/<sub[^>]*>([\s\S]*?)<\/sub>/gi, "~$1~");

  // Remove remaining HTML tags
  md = md.replace(/<[^>]+>/g, "");

  // Decode HTML entities
  md = md.replace(/&amp;/g, "&");
  md = md.replace(/&lt;/g, "<");
  md = md.replace(/&gt;/g, ">");
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, " ");

  // Clean up whitespace
  md = md.replace(/\n{3,}/g, "\n\n");
  md = md.trim();

  return md;
}

function convertHtmlTableToMarkdown(html: string): string {
  return html.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, tableContent: string) => {
    const rows: string[][] = [];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch: RegExpExecArray | null;

    for (
      rowMatch = rowRegex.exec(tableContent);
      rowMatch !== null;
      rowMatch = rowRegex.exec(tableContent)
    ) {
      const cells: string[] = [];
      const cellRegex = /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi;
      let cellMatch: RegExpExecArray | null;

      for (
        cellMatch = cellRegex.exec(rowMatch[1]);
        cellMatch !== null;
        cellMatch = cellRegex.exec(rowMatch[1])
      ) {
        cells.push(cellMatch[1].replace(/<[^>]+>/g, "").trim());
      }

      if (cells.length > 0) {
        rows.push(cells);
      }
    }

    if (rows.length === 0) return "";

    const colCount = Math.max(...rows.map((r) => r.length));
    const normalizedRows = rows.map((r) => {
      while (r.length < colCount) r.push("");
      return `| ${r.join(" | ")} |`;
    });

    const separator = `| ${Array(colCount).fill("---").join(" | ")} |`;
    normalizedRows.splice(1, 0, separator);

    return `\n${normalizedRows.join("\n")}\n`;
  });
}
