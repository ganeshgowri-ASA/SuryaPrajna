"use client";

import AIAssistantPanel from "@/components/editor/AIAssistantPanel";
import CitationSearch from "@/components/editor/CitationSearch";
import type { CodeMirrorEditorHandle } from "@/components/editor/CodeMirrorEditor";
import CommentsPanel, { type Comment } from "@/components/editor/CommentsPanel";
import EditorToolbar from "@/components/editor/EditorToolbar";
import EquationOCR from "@/components/editor/EquationOCR";
import ClaimConfidencePanel from "@/components/editor/ClaimConfidencePanel";
import FigureTools from "@/components/editor/FigureTools";
import FloatingAIChat from "@/components/editor/FloatingAIChat";
import ImportDialog from "@/components/editor/ImportDialog";
import InlineAIMenu from "@/components/editor/InlineAIMenu";
import AIContentGenerator from "@/components/editor/AIContentGenerator";
import OutlinePanel from "@/components/editor/OutlinePanel";
import PreviewPanel from "@/components/editor/PreviewPanel";
import ProblemsPanel from "@/components/editor/ProblemsPanel";
import ProjectManager, {
  type Project,
  type ProjectFile,
  getTemplateContent,
} from "@/components/editor/ProjectManager";
import RAGPanel from "@/components/editor/RAGPanel";
import ReferenceManager, { type Reference } from "@/components/editor/ReferenceManager";
import SettingsPanel, {
  type EditorSettings,
  DEFAULT_SETTINGS,
} from "@/components/editor/SettingsPanel";
import TemplatesGallery from "@/components/editor/TemplatesGallery";
import VersionHistory, { type Version } from "@/components/editor/VersionHistory";
import WritingQuality from "@/components/editor/WritingQuality";
import {
  type ImportResult,
  latexToMarkdown,
  markdownToLatex,
  parseBibtex,
  referencesToBibtex,
  rtfToMarkdown,
  structurePdfText,
  textToImportResult,
} from "@/lib/converters";
import { useProviderKeys } from "@/lib/useProviderKeys";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

// Dynamic import for CodeMirror (client-only)
const CodeMirrorEditor = dynamic(() => import("@/components/editor/CodeMirrorEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center text-gray-600 text-sm">
      Loading editor...
    </div>
  ),
});

/** Strip wrapping markdown code fences from AI responses */
function stripMarkdownFences(text: string): string {
  const trimmed = text.trim();
  const fencePattern = /^```[\w]*\n?([\s\S]*?)\n?```$/;
  const match = trimmed.match(fencePattern);
  return match ? match[1] : trimmed;
}

/** Map AI toolbar action names to prompts */
const AI_ACTION_PROMPTS: Record<string, { prompt: string; useSelection: boolean }> = {
  "ai-write": {
    prompt:
      "Write content for this section of the document. Generate well-formatted Markdown with proper headings, paragraphs, and structure. If the document is academic, use formal tone with citations where appropriate.",
    useSelection: false,
  },
  "ai-edit": {
    prompt:
      "Improve the following text for clarity, flow, and academic tone. Return ONLY the improved text.",
    useSelection: true,
  },
  "ai-proofread": {
    prompt:
      "Proofread the following text. Fix all grammar, punctuation, spelling, and style issues. Return ONLY the corrected text.",
    useSelection: true,
  },
  "ai-explain": {
    prompt: "Explain the following text in simple terms. Provide a clear, concise explanation.",
    useSelection: true,
  },
  "ai-summarize": {
    prompt: "Summarize the following text concisely. Return ONLY the summary.",
    useSelection: true,
  },
};

type SidebarTab = "files" | "refs" | "outline" | "history" | "rag" | "comments" | "quality";
type RightPanelMode = "preview" | "ai" | "split";

function createDefaultProject(): Project {
  const mainFile: ProjectFile = {
    id: "main",
    name: "main.md",
    content: getTemplateContent("pv-research", "markdown"),
    type: "main",
  };
  const bibFile: ProjectFile = {
    id: "bib",
    name: "references.bib",
    content: "% Add your BibTeX references here\n",
    type: "bib",
  };
  return {
    id: `proj-${Date.now()}`,
    name: "PV Research Paper",
    files: [mainFile, bibFile],
    activeFileId: "main",
    mode: "markdown",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

async function processDroppedFile(
  ext: string,
  file: File,
  onImport: (result: ImportResult) => void,
  onImportBibtex: (bibtex: string) => void,
  setNotice: (msg: string) => void,
) {
  if (ext === ".bib") {
    const text = await file.text();
    onImportBibtex(text);
    const parsed = parseBibtex(text);
    setNotice(`Imported ${parsed.entries.length} references from BibTeX`);
    setTimeout(() => setNotice(""), 5000);
    return;
  }

  const clientFormats = [".md", ".txt", ".tex", ".rtf"];
  if (clientFormats.includes(ext)) {
    const text = await file.text();
    const converters: Record<string, () => ImportResult> = {
      ".md": () => textToImportResult(text, "Markdown"),
      ".txt": () => textToImportResult(text, "Plain Text"),
      ".tex": () => latexToMarkdown(text),
      ".rtf": () => rtfToMarkdown(text),
    };
    const result = converters[ext]();
    onImport(result);
    if (ext === ".tex" && result.bibtex) onImportBibtex(result.bibtex);
    return;
  }

  setNotice(ext === ".docx" ? "Converting Word document..." : "Extracting text from PDF...");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("format", ext.slice(1));

  const response = await fetch("/api/convert", { method: "POST", body: formData });
  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || "Conversion failed");
  }

  const data = await response.json();
  const result =
    ext === ".pdf"
      ? structurePdfText(data.markdown)
      : textToImportResult(data.markdown, "Word Document");
  onImport(result);
}

function markdownToDocxHtml(md: string): string {
  let html = md;
  // Headings
  html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");
  // Bold, italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<b><i>$1</i></b>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  html = html.replace(/\*(.+?)\*/g, "<i>$1</i>");
  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Lists
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>");
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // Line breaks for paragraphs
  html = html.replace(/\n\n/g, "</p><p>");
  html = html.replace(/\n/g, "<br>");
  html = `<p>${html}</p>`;
  return html;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: large editor component with many interactive features
export default function EditorPage() {
  // Core state
  const [project, setProject] = useState<Project>(() =>
    loadFromStorage("sp-editor-project", createDefaultProject()),
  );
  const [references, setReferences] = useState<Reference[]>(() =>
    loadFromStorage("sp-editor-refs", []),
  );
  const [versions, setVersions] = useState<Version[]>(() =>
    loadFromStorage("sp-editor-versions", []),
  );
  const [settings, setSettings] = useState<EditorSettings>(() =>
    loadFromStorage("sp-editor-settings", DEFAULT_SETTINGS),
  );

  // UI state
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("files");
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>("preview");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [splitPos, setSplitPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [showFigureTools, setShowFigureTools] = useState(false);
  const [problemsOpen, setProblemsOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [aiPanelWidth, setAiPanelWidth] = useState(320);
  const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);
  const [isDraggingAI, setIsDraggingAI] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [importOpen, setImportOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>(() =>
    loadFromStorage("sp-editor-comments", []),
  );
  const [citationSearchOpen, setCitationSearchOpen] = useState(false);
  const [showEquationOCR, setShowEquationOCR] = useState(false);
    const [showClaimReview, setShowClaimReview] = useState(false);
  const [inlineAIPos, setInlineAIPos] = useState<{ x: number; y: number } | null>(null);
  const [twoColumnPreview, setTwoColumnPreview] = useState(false);
  const [isDragOverEditor, setIsDragOverEditor] = useState(false);
  const [importNotice, setImportNotice] = useState("");
    const [showAIContentGen, setShowAIContentGen] = useState(false);

  const autoSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAutoSave = useRef<number>(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<CodeMirrorEditorHandle | null>(null);

  // Get active file
  const activeFile = project.files.find((f) => f.id === project.activeFileId) || project.files[0];
  const content = activeFile?.content || "";

  // Word count
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const lineCount = content.split("\n").length;

  // Has AI key — use the shared provider-keys store (not the legacy settings fields)
  const { hasKey: hasAIKey, headers } = useProviderKeys();

  // Persist to localStorage
  useEffect(() => {
    setSaveStatus("saving");
    const t = setTimeout(() => {
      saveToStorage("sp-editor-project", project);
      setSaveStatus("saved");
    }, 300);
    return () => clearTimeout(t);
  }, [project]);

  useEffect(() => {
    saveToStorage("sp-editor-refs", references);
  }, [references]);

  useEffect(() => {
    saveToStorage("sp-editor-versions", versions);
  }, [versions]);

  useEffect(() => {
    saveToStorage("sp-editor-settings", settings);
  }, [settings]);

  useEffect(() => {
    saveToStorage("sp-editor-comments", comments);
  }, [comments]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: interval needs to restart when settings change
  useEffect(() => {
    autoSaveTimer.current = setInterval(() => {
      const now = Date.now();
      if (now - lastAutoSave.current >= 30000) {
        lastAutoSave.current = now;
        setVersions((prev) => {
          // Skip if content hasn't changed from last auto-save
          const lastVersion = prev.length > 0 ? prev[prev.length - 1] : null;
          if (lastVersion && lastVersion.content === content) return prev;
          return [
            ...prev,
            {
              id: `auto-${now}`,
              label: "Auto-save",
              content,
              timestamp: now,
              auto: true,
            },
          ];
        });
      }
    }, 30000);

    return () => {
      if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);
    };
  }, [content, settings.autoSaveInterval]);

  // Content change handler
  const handleContentChange = useCallback((newContent: string) => {
    setProject((prev) => ({
      ...prev,
      files: prev.files.map((f) =>
        f.id === prev.activeFileId ? { ...f, content: newContent } : f,
      ),
      updatedAt: Date.now(),
    }));
  }, []);

  // File selection
  const handleFileSelect = useCallback((fileId: string) => {
    setProject((prev) => ({ ...prev, activeFileId: fileId }));
  }, []);

  // New project from template
  const handleNewProject = useCallback(
    (templateId: string) => {
      const ext = project.mode === "latex" ? ".tex" : ".md";
      const mainFile: ProjectFile = {
        id: `main-${Date.now()}`,
        name: `main${ext}`,
        content: getTemplateContent(templateId, project.mode),
        type: "main",
      };
      const bibFile: ProjectFile = {
        id: `bib-${Date.now()}`,
        name: "references.bib",
        content: "% References\n",
        type: "bib",
      };
      const templateNames: Record<string, string> = {
        "pv-research": "PV Research Paper",
        "technical-report": "Technical Report",
        "conference-paper": "Conference Paper",
        "ieee-journal": "IEEE Journal Paper",
        "elsevier-journal": "Elsevier Journal",
        "springer-nature": "Springer Nature",
        "mdpi-journal": "MDPI Journal",
        "thesis-chapter": "Thesis / Dissertation",
        "lab-report": "Lab Report",
        "patent-draft": "Patent Draft",
        "review-article": "Literature Review",
        "iec-test-report": "IEC Test Report",
        "fmea-report": "FMEA Report",
        "energy-yield": "Energy Yield Analysis",
        "pv-datasheet": "PV Module Datasheet",
        "technical-note": "Technical Note",
      };
      setProject({
        id: `proj-${Date.now()}`,
        name: templateNames[templateId] || "New Project",
        files: [mainFile, bibFile],
        activeFileId: mainFile.id,
        mode: project.mode,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      setVersions([]);
    },
    [project.mode],
  );

  // Insert citation
  const handleInsertCitation = useCallback(
    (key: string, mode: "markdown" | "latex") => {
      const citation = mode === "latex" ? `\\cite{${key}}` : `[@${key}]`;
      handleContentChange(content + citation);
    },
    [content, handleContentChange],
  );

  // Insert text at cursor position in the CodeMirror editor
  const insertAtCursor = useCallback(
    (text: string) => {
      const cleaned = stripMarkdownFences(text);
      if (editorRef.current) {
        editorRef.current.insertAtCursor(cleaned);
      } else {
        // Fallback: append to end
        handleContentChange(`${content}\n${cleaned}`);
      }
    },
    [content, handleContentChange],
  );

  // Replace current selection in the CodeMirror editor
  const replaceSelection = useCallback(
    (text: string) => {
      const cleaned = stripMarkdownFences(text);
      if (editorRef.current && selectedText) {
        editorRef.current.replaceSelection(cleaned);
      } else {
        // Fallback: replace first occurrence in content
        if (selectedText) {
          handleContentChange(content.replace(selectedText, cleaned));
        } else {
          insertAtCursor(cleaned);
        }
      }
    },
    [content, handleContentChange, selectedText, insertAtCursor],
  );

  // Legacy insert at end (for components that don't need cursor position)
  const handleInsertText = useCallback(
    (text: string) => {
      insertAtCursor(text);
    },
    [insertAtCursor],
  );

  // Version restore
  const handleRestore = useCallback(
    (version: Version) => {
      handleContentChange(version.content);
    },
    [handleContentChange],
  );

  // Manual version save
  const handleSaveManual = useCallback(
    (label: string) => {
      setVersions((prev) => [
        ...prev,
        {
          id: `manual-${Date.now()}`,
          label,
          content,
          timestamp: Date.now(),
          auto: false,
        },
      ]);
    },
    [content],
  );

  // Import handler
  const handleImport = useCallback(
    (result: ImportResult) => {
      if (!result.markdown) return;
      handleContentChange(result.markdown);
      const summary = [
        `${result.metadata.wordCount.toLocaleString()} words`,
        result.metadata.sectionCount > 0 ? `${result.metadata.sectionCount} sections` : null,
        result.metadata.referenceCount > 0 ? `${result.metadata.referenceCount} references` : null,
      ]
        .filter(Boolean)
        .join(", ");
      setImportNotice(`Imported ${summary} from ${result.metadata.format}`);
      setTimeout(() => setImportNotice(""), 5000);
    },
    [handleContentChange],
  );

  // Import BibTeX into references.bib file
  const handleImportBibtex = useCallback((bibtex: string) => {
    setProject((prev) => {
      const bibFile = prev.files.find((f) => f.type === "bib");
      if (bibFile) {
        return {
          ...prev,
          files: prev.files.map((f) =>
            f.type === "bib"
              ? {
                  ...f,
                  content: f.content.trim() ? `${f.content}\n\n${bibtex}` : bibtex,
                }
              : f,
          ),
          updatedAt: Date.now(),
        };
      }
      return {
        ...prev,
        files: [
          ...prev.files,
          {
            id: `bib-${Date.now()}`,
            name: "references.bib",
            content: bibtex,
            type: "bib" as const,
          },
        ],
        updatedAt: Date.now(),
      };
    });
  }, []);

  // Drag-and-drop on editor area
  const handleEditorDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragOverEditor(true);
    }
  }, []);

  const handleEditorDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverEditor(false);
  }, []);

  const handleEditorDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOverEditor(false);

      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      const supported = [".md", ".txt", ".tex", ".bib", ".docx", ".pdf", ".rtf"];

      if (!supported.includes(ext)) {
        setImportNotice(`Unsupported format: ${ext}`);
        setTimeout(() => setImportNotice(""), 3000);
        return;
      }

      try {
        await processDroppedFile(ext, file, handleImport, handleImportBibtex, setImportNotice);
      } catch (err) {
        setImportNotice(`Import failed: ${err instanceof Error ? err.message : "Unknown error"}`);
        setTimeout(() => setImportNotice(""), 5000);
      }
    },
    [handleImport, handleImportBibtex],
  );

  // Toggle mode
  const toggleMode = useCallback(() => {
    const newMode = project.mode === "markdown" ? "latex" : "markdown";
    setProject((prev) => ({ ...prev, mode: newMode }));
  }, [project.mode]);

  // Export
  const handleExport = useCallback(
    (format: string) => {
      let blob: Blob;
      let filename: string;

      const bibFile = project.files.find((f) => f.type === "bib");
      const bibContent = bibFile?.content || "";

      switch (format) {
        case "md":
          blob = new Blob([content], { type: "text/markdown" });
          filename = `${project.name}.md`;
          break;
        case "tex": {
          // Convert Markdown to proper LaTeX document if in markdown mode
          const texContent =
            project.mode === "markdown"
              ? markdownToLatex(content, project.name, bibContent)
              : content;
          blob = new Blob([texContent], { type: "text/x-tex" });
          filename = `${project.name}.tex`;
          break;
        }
        case "html": {
          const htmlContent = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${project.name}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<style>
body{font-family:'Times New Roman',Georgia,serif;max-width:800px;margin:2em auto;padding:0 2em;line-height:1.8;color:#333;font-size:12pt}
h1,h2,h3{color:#1a1a1a;margin-top:1.5em}h1{font-size:1.5em;text-align:center}h2{font-size:1.25em}
code{background:#f4f4f4;padding:2px 6px;border-radius:3px;font-size:0.9em}
pre{background:#f4f4f4;padding:1em;border-radius:4px;overflow-x:auto}
table{border-collapse:collapse;width:100%;margin:1em 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}
th{background:#f8f8f8;font-weight:bold}blockquote{border-left:4px solid #ddd;margin:0;padding:0 1em;color:#666}
@media print{body{margin:0;padding:2cm}@page{margin:2.5cm;size:A4}}
</style>
</head><body><pre>${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre></body></html>`;
          blob = new Blob([htmlContent], { type: "text/html" });
          filename = `${project.name}.html`;
          break;
        }
        case "docx": {
          // Word-compatible HTML with proper markdown-to-HTML conversion
          const docHtml = markdownToDocxHtml(content);
          const docContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
<head><meta charset="utf-8"><style>body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.6}
h1{font-size:16pt;font-weight:bold}h2{font-size:14pt;font-weight:bold}h3{font-size:12pt;font-weight:bold}
table{border-collapse:collapse;width:100%}td,th{border:1px solid #000;padding:6px}</style></head>
<body>${docHtml}</body></html>`;
          blob = new Blob([docContent], {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          });
          filename = `${project.name}.doc`;
          break;
        }
        case "bib": {
          const bibExport = bibContent || "% No references found\n";
          blob = new Blob([bibExport], { type: "application/x-bibtex" });
          filename = `${project.name}-references.bib`;
          break;
        }
        case "pdf":
          window.print();
          return;
        default:
          return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    [content, project.name, project.mode, project.files],
  );

  // Format action from toolbar
  const handleFormat = useCallback(
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: formatting needs many branches
    (action: string, value?: string) => {
      const formatMap: Record<string, { prefix: string; suffix: string; block?: boolean }> = {
        bold: { prefix: "**", suffix: "**" },
        italic: { prefix: "*", suffix: "*" },
        strikethrough: { prefix: "~~", suffix: "~~" },
        code: { prefix: "`", suffix: "`" },
        link: { prefix: "[", suffix: "](url)" },
        image: { prefix: "![alt](", suffix: ")" },
        math: { prefix: "$", suffix: "$" },
        "code-block": { prefix: "\n```\n", suffix: "\n```\n", block: true },
        blockquote: { prefix: "\n> ", suffix: "\n", block: true },
        "horizontal-rule": { prefix: "\n---\n", suffix: "", block: true },
      };

      if (action === "heading") {
        const hashes = "#".repeat(Number.parseInt(value || "1"));
        handleContentChange(`${content}\n${hashes} `);
        return;
      }

      if (action === "unordered-list") {
        handleContentChange(`${content}\n- Item 1\n- Item 2\n- Item 3\n`);
        return;
      }

      if (action === "ordered-list") {
        handleContentChange(`${content}\n1. Item 1\n2. Item 2\n3. Item 3\n`);
        return;
      }

      if (action === "task-list") {
        handleContentChange(`${content}\n- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3\n`);
        return;
      }

      if (action === "table") {
        handleContentChange(
          `${content}\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| | | |\n| | | |\n`,
        );
        return;
      }

      const fmt = formatMap[action];
      if (fmt) {
        if (selectedText && !fmt.block) {
          handleContentChange(
            content.replace(selectedText, `${fmt.prefix}${selectedText}${fmt.suffix}`),
          );
        } else {
          handleContentChange(`${content}${fmt.prefix}text${fmt.suffix}`);
        }
      }
    },
    [content, handleContentChange, selectedText],
  );

  // AI action from toolbar — call AI and insert result at cursor
  const handleAIAction = useCallback(
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: AI action handler with multiple action types
    async (action: string) => {
      if (!hasAIKey) {
        setSettingsOpen(true);
        return;
      }

      // Literature search opens the citation panel
      if (action === "ai-literature") {
        setCitationSearchOpen(true);
        return;
      }
      
              // AI Content Generator opens the rich modal
      if (action === "ai-generate") {
        setShowAIContentGen(true);
        return;
      }


      const actionConfig = AI_ACTION_PROMPTS[action];
      if (!actionConfig) {
        // Unknown action — just open AI panel
        setAiPanelOpen(true);
        setRightPanelMode("ai");
        return;
      }

      const currentSelection = editorRef.current?.getSelectedText() || selectedText;

      // If action needs selection but none exists, open AI panel instead
      if (actionConfig.useSelection && !currentSelection) {
        setAiPanelOpen(true);
        setRightPanelMode("ai");
        return;
      }

      const textContext = actionConfig.useSelection ? currentSelection : content.slice(0, 4000);

      setImportNotice("AI generating...");

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `${actionConfig.prompt}\n\nText:\n${textContext}`,
              },
            ],
            systemPrompt:
              "You are an academic writing assistant. Return well-formatted Markdown. For tables use | Header | syntax. For math use $...$ or $$...$$. For code use ```lang blocks. Be concise and actionable.",
          }),
        });
        const data = await res.json();
        const responseText = data.content || data.error || "No response received.";

        if (data.error) {
          setImportNotice(`AI error: ${data.error}`);
          setTimeout(() => setImportNotice(""), 5000);
          return;
        }

        const cleaned = stripMarkdownFences(responseText);

        if (actionConfig.useSelection && currentSelection) {
          replaceSelection(cleaned);
        } else {
          insertAtCursor(cleaned);
        }

        setImportNotice("");
      } catch {
        setImportNotice("AI error: Could not reach AI service.");
        setTimeout(() => setImportNotice(""), 5000);
      }
    },
    [hasAIKey, selectedText, content, headers, replaceSelection, insertAtCursor],
  );

  // Drag handlers for resizable panels
  const handleMouseMove = useCallback(
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: drag logic with panel boundaries
    (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      if (isDragging) {
        const leftOffset = sidebarOpen ? sidebarWidth : 0;
        const rightOffset = aiPanelOpen ? aiPanelWidth : 0;
        const x = e.clientX - rect.left - leftOffset;
        const availableWidth = rect.width - leftOffset - rightOffset;
        const pct = (x / availableWidth) * 100;
        if (pct >= 25 && pct <= 80) setSplitPos(pct);
      }

      if (isDraggingSidebar) {
        const w = e.clientX - rect.left;
        if (w >= 180 && w <= 400) setSidebarWidth(w);
      }

      if (isDraggingAI) {
        const w = rect.right - e.clientX;
        if (w >= 260 && w <= 500) setAiPanelWidth(w);
      }
    },
    [
      isDragging,
      isDraggingSidebar,
      isDraggingAI,
      sidebarOpen,
      sidebarWidth,
      aiPanelOpen,
      aiPanelWidth,
    ],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsDraggingSidebar(false);
    setIsDraggingAI(false);
  }, []);

  useEffect(() => {
    if (isDragging || isDraggingSidebar || isDraggingAI) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isDraggingSidebar, isDraggingAI, handleMouseMove, handleMouseUp]);

  const sidebarTabs: { key: SidebarTab; label: string; icon: string }[] = [
    { key: "files", label: "Files", icon: "📁" },
    { key: "outline", label: "Outline", icon: "📑" },
    { key: "refs", label: "Refs", icon: "📚" },
    { key: "comments", label: "Comments", icon: "💬" },
    { key: "quality", label: "Quality", icon: "📊" },
    { key: "history", label: "History", icon: "🕒" },
    { key: "rag", label: "KB", icon: "🧠" },
  ];

  // Keyboard shortcuts
  // biome-ignore lint/correctness/useExhaustiveDependencies: selectedText used in closure for inline AI
  useEffect(() => {
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: keyboard shortcuts require many branches
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        handleFormat("bold");
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "i") {
        e.preventDefault();
        handleFormat("italic");
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        setSidebarOpen((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "j") {
        e.preventDefault();
        // Inline AI on selection
        if (selectedText) {
          setInlineAIPos({ x: window.innerWidth / 2 - 150, y: window.innerHeight / 3 });
        }
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        setAiPanelOpen((v) => !v);
      }
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "e") {
        e.preventDefault();
        setShowEquationOCR(true);
      }
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "r") {
        e.preventDefault();
        setShowClaimReview((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [handleFormat]);

  return (
    <div
      ref={containerRef}
      className={`h-[calc(100vh-3.5rem)] flex flex-col ${
        settings.theme === "light" ? "bg-white text-gray-900" : "bg-gray-950 text-gray-100"
      }`}
    >
      {/* Top toolbar */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 border-b flex-shrink-0 ${
          settings.theme === "light"
            ? "border-gray-200 bg-gray-50"
            : "border-gray-800/60 bg-gray-950/90"
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`text-sm px-1.5 py-0.5 rounded transition-colors ${
              settings.theme === "light"
                ? "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
            }`}
            title="Toggle sidebar (Ctrl+\)"
          >
            ☰
          </button>
          <h1
            className={`text-sm font-semibold ${
              settings.theme === "light" ? "text-gray-900" : "text-white"
            }`}
          >
            {project.name}
          </h1>
          <button
            type="button"
            onClick={toggleMode}
            className={`text-xs px-2 py-0.5 rounded border transition-colors ${
              settings.theme === "light"
                ? "border-gray-300 text-gray-600 hover:text-amber-600 hover:border-amber-400"
                : "border-gray-700/60 text-gray-400 hover:text-amber-300 hover:border-amber-500/30"
            }`}
          >
            {project.mode === "markdown" ? "MD" : "TeX"}
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTemplatesOpen(true)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              settings.theme === "light"
                ? "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
            }`}
            title="New from template"
          >
            + New
          </button>
          <button
            type="button"
            onClick={() => setShowFigureTools(!showFigureTools)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              showFigureTools
                ? "bg-amber-500/15 text-amber-400"
                : settings.theme === "light"
                  ? "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
            }`}
          >
            Insert
          </button>
          <div
            className={`w-px h-4 mx-1 ${
              settings.theme === "light" ? "bg-gray-300" : "bg-gray-700/50"
            }`}
          />
          <button
            type="button"
            onClick={() => {
              setRightPanelMode("preview");
              setAiPanelOpen(false);
            }}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              rightPanelMode === "preview" && !aiPanelOpen
                ? "bg-amber-500/15 text-amber-400"
                : settings.theme === "light"
                  ? "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
            }`}
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => setAiPanelOpen(!aiPanelOpen)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              aiPanelOpen
                ? "bg-amber-500/15 text-amber-400"
                : settings.theme === "light"
                  ? "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
            }`}
            title="AI Assistant (Ctrl+J)"
          >
            AI
          </button>
          <button
            type="button"
            onClick={() => setCitationSearchOpen(true)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              settings.theme === "light"
                ? "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
            }`}
            title="Search academic literature"
          >
            Cite
          </button>
          <button
            type="button"
            onClick={() => setTwoColumnPreview(!twoColumnPreview)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              twoColumnPreview
                ? "bg-amber-500/15 text-amber-400"
                : settings.theme === "light"
                  ? "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
            }`}
            title="Two-column preview (IEEE style)"
          >
            2-Col
          </button>
          <div
            className={`w-px h-4 mx-1 ${
              settings.theme === "light" ? "bg-gray-300" : "bg-gray-700/50"
            }`}
          />
          {/* Import button */}
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
              settings.theme === "light"
                ? "text-amber-700 bg-amber-100 hover:bg-amber-200"
                : "text-amber-300 bg-amber-500/15 hover:bg-amber-500/25"
            }`}
            title="Import document (.docx, .pdf, .tex, .md, .txt, .bib, .rtf)"
          >
            Import
          </button>
          {/* Export dropdown */}
          <div className="relative group">
            <button
              type="button"
              className={`text-xs px-2 py-1 rounded transition-colors ${
                settings.theme === "light"
                  ? "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
              }`}
            >
              Export
            </button>
            <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-gray-700/60 rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 py-1 min-w-[160px]">
              {[
                { fmt: "md", label: "Markdown (.md)" },
                { fmt: "tex", label: "LaTeX (.tex)" },
                { fmt: "html", label: "HTML (.html)" },
                { fmt: "docx", label: "Word (.doc)" },
                { fmt: "bib", label: "BibTeX (.bib)" },
                { fmt: "pdf", label: "PDF (Print)" },
              ].map(({ fmt, label }) => (
                <button
                  type="button"
                  key={fmt}
                  onClick={() => handleExport(fmt)}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-amber-500/10 hover:text-amber-300 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              settings.theme === "light"
                ? "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
            }`}
          >
            ⚙
          </button>
        </div>
      </div>

      {/* Editor Toolbar */}
      <EditorToolbar
        onFormat={handleFormat}
        mode={project.mode}
        onAIAction={handleAIAction}
        hasAIKey={hasAIKey}
            onEquationOCR={() => setShowEquationOCR(true)}
                      onClaimReview={() => setShowClaimReview((v) => !v)}
      />

      {/* Main area */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        {sidebarOpen && (
          <>
            <div
              className={`flex-shrink-0 flex flex-col ${
                settings.theme === "light"
                  ? "border-r border-gray-200 bg-gray-50"
                  : "border-r border-gray-800/60 bg-gray-950/50"
              }`}
              style={{ width: `${sidebarWidth}px` }}
            >
              {/* Sidebar tabs */}
              <div
                className={`flex border-b flex-shrink-0 ${
                  settings.theme === "light" ? "border-gray-200" : "border-gray-800/60"
                }`}
              >
                {sidebarTabs.map((tab) => (
                  <button
                    type="button"
                    key={tab.key}
                    onClick={() => setSidebarTab(tab.key)}
                    className={`flex-1 py-2 text-xs text-center transition-colors ${
                      sidebarTab === tab.key
                        ? "text-amber-400 border-b-2 border-amber-500"
                        : settings.theme === "light"
                          ? "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
                          : "text-gray-600 hover:text-gray-400 border-b-2 border-transparent"
                    }`}
                    title={tab.label}
                  >
                    {tab.icon}
                  </button>
                ))}
              </div>

              {/* Sidebar content */}
              <div className="flex-1 min-h-0 overflow-hidden">
                {sidebarTab === "files" && (
                  <ProjectManager
                    project={project}
                    onProjectChange={setProject}
                    onFileSelect={handleFileSelect}
                    onNewProject={handleNewProject}
                    onExport={handleExport}
                  />
                )}
                {sidebarTab === "refs" && (
                  <ReferenceManager
                    references={references}
                    onReferencesChange={setReferences}
                    onInsertCitation={handleInsertCitation}
                    mode={project.mode}
                    citationFormat={settings.citationFormat}
                    onCitationFormatChange={(fmt) =>
                      setSettings((s) => ({ ...s, citationFormat: fmt }))
                    }
                  />
                )}
                {sidebarTab === "outline" && (
                  <OutlinePanel
                    content={content}
                    mode={project.mode}
                    onNavigate={(line) => {
                      // Navigate to line in editor - scroll to position
                      setCursorPos({ line, col: 1 });
                    }}
                  />
                )}
                {sidebarTab === "history" && (
                  <VersionHistory
                    versions={versions}
                    currentContent={content}
                    onRestore={handleRestore}
                    onSaveManual={handleSaveManual}
                  />
                )}
                {sidebarTab === "comments" && (
                  <CommentsPanel
                    comments={comments}
                    onCommentsChange={setComments}
                    selectedText={selectedText || undefined}
                  />
                )}
                {sidebarTab === "quality" && (
                  <WritingQuality
                    content={content}
                    wordCountGoal={settings.wordCountGoal || undefined}
                  />
                )}
                {sidebarTab === "rag" && <RAGPanel onInsertText={handleInsertText} />}
              </div>
            </div>

            {/* Sidebar resize handle */}
            <div
              className="w-1 flex-shrink-0 cursor-col-resize hover:bg-amber-500/30 active:bg-amber-500/50 transition-colors relative group"
              onMouseDown={() => setIsDraggingSidebar(true)}
            >
              <div className="absolute inset-y-0 -left-1 -right-1" />
            </div>
          </>
        )}

        {/* Editor + Preview split */}
        <div
          className="flex-1 flex flex-col min-h-0 min-w-0 relative"
          onDragOver={handleEditorDragOver}
          onDragLeave={handleEditorDragLeave}
          onDrop={handleEditorDrop}
        >
          {/* Drag overlay */}
          {isDragOverEditor && (
            <div className="absolute inset-0 z-40 bg-amber-500/10 border-2 border-dashed border-amber-500 rounded-lg flex items-center justify-center pointer-events-none">
              <div className="bg-gray-900/90 px-6 py-4 rounded-lg border border-amber-500/40 text-center">
                <p className="text-amber-400 text-sm font-medium">Drop file to import</p>
                <p className="text-gray-500 text-xs mt-1">
                  .docx, .pdf, .tex, .md, .txt, .bib, .rtf
                </p>
              </div>
            </div>
          )}

          {/* Import notification toast */}
          {importNotice && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 bg-gray-800 border border-gray-700/60 rounded-lg shadow-xl px-4 py-2 text-xs text-gray-300 flex items-center gap-2">
              <span
                className={
                  importNotice.includes("failed") || importNotice.includes("Unsupported")
                    ? "text-red-400"
                    : "text-amber-400"
                }
              >
                {importNotice.includes("failed") || importNotice.includes("Unsupported")
                  ? "✗"
                  : importNotice.includes("Converting") || importNotice.includes("Extracting")
                    ? "⟳"
                    : "✓"}
              </span>
              {importNotice}
              <button
                type="button"
                onClick={() => setImportNotice("")}
                className="text-gray-500 hover:text-gray-300 ml-1"
              >
                ×
              </button>
            </div>
          )}

          <div className="flex-1 flex min-h-0">
            {/* Editor pane */}
            <div
              className={`min-h-0 flex flex-col ${
                settings.theme === "light"
                  ? "border-r border-gray-200"
                  : "border-r border-gray-800/60"
              }`}
              style={{ width: `${splitPos}%` }}
            >
              <div className="flex-1 min-h-0">
                <CodeMirrorEditor
                  ref={editorRef}
                  content={content}
                  onChange={handleContentChange}
                  mode={project.mode}
                  onCursorChange={(line, col) => setCursorPos({ line, col })}
                  onSelectionChange={setSelectedText}
                />
              </div>

              {/* Figure tools */}
              {showFigureTools && <FigureTools mode={project.mode} onInsert={handleInsertText} />}
            </div>

            {/* Drag handle */}
            <div
              className="w-1 flex-shrink-0 cursor-col-resize hover:bg-amber-500/30 active:bg-amber-500/50 transition-colors relative group"
              onMouseDown={() => setIsDragging(true)}
            >
              <div className="absolute inset-y-0 -left-1 -right-1" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-gray-700 group-hover:bg-amber-500/60 transition-colors" />
            </div>

            {/* Right pane (Preview) */}
            <div className="min-h-0 flex flex-col" style={{ width: `${100 - splitPos}%` }}>
              <PreviewPanel content={content} mode={project.mode} twoColumn={twoColumnPreview} />
            </div>
          </div>

          {/* Problems panel */}
          <ProblemsPanel
            content={content}
            mode={project.mode}
            isOpen={problemsOpen}
            onToggle={() => setProblemsOpen(!problemsOpen)}
          />

          {/* Status bar */}
          <div
            className={`flex items-center justify-between px-4 py-1 border-t flex-shrink-0 text-xs ${
              settings.theme === "light"
                ? "border-gray-200 bg-gray-50 text-gray-500"
                : "border-gray-800/60 bg-gray-950/90 text-gray-600"
            }`}
          >
            <div className="flex items-center gap-4">
              <span>{wordCount} words</span>
              <span>{charCount} chars</span>
              <span>{lineCount} lines</span>
              <span>
                Ln {cursorPos.line}, Col {cursorPos.col}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>{project.mode === "markdown" ? "Markdown" : "LaTeX"}</span>
              <span>{project.files.length} files</span>
              <span>{references.length} refs</span>
              <span
                className={
                  saveStatus === "saved"
                    ? "text-emerald-600"
                    : saveStatus === "saving"
                      ? "text-amber-500"
                      : "text-gray-500"
                }
              >
                {saveStatus === "saved"
                  ? "Saved"
                  : saveStatus === "saving"
                    ? "Saving..."
                    : "Unsaved"}
              </span>
            </div>
          </div>
        </div>

        {/* AI Panel (collapsible right side) */}
        {aiPanelOpen && (
          <>
            {/* AI panel resize handle */}
            <div
              className="w-1 flex-shrink-0 cursor-col-resize hover:bg-amber-500/30 active:bg-amber-500/50 transition-colors relative group"
              onMouseDown={() => setIsDraggingAI(true)}
            >
              <div className="absolute inset-y-0 -left-1 -right-1" />
            </div>

            <div
              className={`flex-shrink-0 ${
                settings.theme === "light"
                  ? "border-l border-gray-200 bg-gray-50"
                  : "border-l border-gray-800/60 bg-gray-950/50"
              }`}
              style={{ width: `${aiPanelWidth}px` }}
            >
              <AIAssistantPanel
                documentContent={content}
                selectedText={selectedText}
                onInsertText={insertAtCursor}
                onReplaceSelection={selectedText ? replaceSelection : undefined}
              />
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />

      <TemplatesGallery
        isOpen={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onSelect={handleNewProject}
      />

      <ImportDialog
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
        onImportBibtex={handleImportBibtex}
      />

      <CitationSearch
        isOpen={citationSearchOpen}
        onClose={() => setCitationSearchOpen(false)}
        onAddReference={(ref) => setReferences((prev) => [...prev, ref])}
        onInsertCitation={(key) => {
          const citation = project.mode === "latex" ? `\\cite{${key}}` : `[@${key}]`;
          handleContentChange(content + citation);
        }}
        existingKeys={new Set(references.map((r) => r.key))}
      />

      <EquationOCR
          isOpen={showEquationOCR}
          onClose={() => setShowEquationOCR(false)}
          onInsert={insertAtCursor}
        />

                <ClaimConfidencePanel
            isOpen={showClaimReview}
            onClose={() => setShowClaimReview(false)}
            content={content}
            bibContent={references.map((r) => r.bibtex || "").join("\n")}
            apiKey={settings.anthropicKey || settings.openaiKey || ""}
            aiModel={settings.aiModel}
            onNavigateToLine={(line) => editorRef.current?.scrollToLine?.(line)}
          />
              <AIContentGenerator
          isOpen={showAIContentGen}
          onClose={() => setShowAIContentGen(false)}
          onInsert={insertAtCursor}
          apiHeaders={headers}
        />
        <InlineAIMenu
        selectedText={selectedText}
        position={inlineAIPos}
        onClose={() => setInlineAIPos(null)}
        onApply={(replacement) => {
          replaceSelection(stripMarkdownFences(replacement));
        }}
      />

      <FloatingAIChat
        documentContent={content}
        selectedText={selectedText || undefined}
        onInsertText={insertAtCursor}
        onReplaceSelection={selectedText ? replaceSelection : undefined}
      />
    </div>
  );
}
