"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import PreviewPanel from "@/components/editor/PreviewPanel";
import AIAssistantPanel from "@/components/editor/AIAssistantPanel";
import ReferenceManager, { type Reference } from "@/components/editor/ReferenceManager";
import ProjectManager, {
  type Project,
  type ProjectFile,
  getTemplateContent,
} from "@/components/editor/ProjectManager";
import FigureTools from "@/components/editor/FigureTools";
import VersionHistory, { type Version } from "@/components/editor/VersionHistory";
import OutlinePanel from "@/components/editor/OutlinePanel";
import SettingsPanel, {
  type EditorSettings,
  DEFAULT_SETTINGS,
} from "@/components/editor/SettingsPanel";
import EditorToolbar from "@/components/editor/EditorToolbar";
import ProblemsPanel from "@/components/editor/ProblemsPanel";
import RAGPanel from "@/components/editor/RAGPanel";
import TemplatesGallery from "@/components/editor/TemplatesGallery";

// Dynamic import for CodeMirror (client-only)
const CodeMirrorEditor = dynamic(
  () => import("@/components/editor/CodeMirrorEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center text-gray-600 text-sm">
        Loading editor...
      </div>
    ),
  }
);

type SidebarTab = "files" | "refs" | "outline" | "history" | "rag";
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

export default function EditorPage() {
  // Core state
  const [project, setProject] = useState<Project>(() =>
    loadFromStorage("sp-editor-project", createDefaultProject())
  );
  const [references, setReferences] = useState<Reference[]>(() =>
    loadFromStorage("sp-editor-refs", [])
  );
  const [versions, setVersions] = useState<Version[]>(() =>
    loadFromStorage("sp-editor-versions", [])
  );
  const [settings, setSettings] = useState<EditorSettings>(() =>
    loadFromStorage("sp-editor-settings", DEFAULT_SETTINGS)
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

  const autoSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAutoSave = useRef<number>(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);

  // Get active file
  const activeFile =
    project.files.find((f) => f.id === project.activeFileId) || project.files[0];
  const content = activeFile?.content || "";

  // Word count
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const lineCount = content.split("\n").length;

  // Has AI key
  const hasAIKey = !!(settings.anthropicKey || settings.openaiKey);

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

  // Auto-save versions
  useEffect(() => {
    autoSaveTimer.current = setInterval(() => {
      const now = Date.now();
      if (now - lastAutoSave.current >= settings.autoSaveInterval * 60 * 1000) {
        lastAutoSave.current = now;
        setVersions((prev) => [
          ...prev,
          {
            id: `auto-${now}`,
            label: "Auto-save",
            content,
            timestamp: now,
            auto: true,
          },
        ]);
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
        f.id === prev.activeFileId ? { ...f, content: newContent } : f
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
        "thesis-chapter": "Thesis Chapter",
        "lab-report": "Lab Report",
        "patent-draft": "Patent Draft",
        "review-article": "Review Article",
        "iec-test-report": "IEC Test Report",
        "fmea-report": "FMEA Report",
        "energy-yield": "Energy Yield Assessment",
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
    [project.mode]
  );

  // Insert citation
  const handleInsertCitation = useCallback(
    (key: string, mode: "markdown" | "latex") => {
      const citation = mode === "latex" ? `\\cite{${key}}` : `[@${key}]`;
      handleContentChange(content + citation);
    },
    [content, handleContentChange]
  );

  // Insert text at end
  const handleInsertText = useCallback(
    (text: string) => {
      handleContentChange(content + "\n" + text);
    },
    [content, handleContentChange]
  );

  // Version restore
  const handleRestore = useCallback(
    (version: Version) => {
      handleContentChange(version.content);
    },
    [handleContentChange]
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
    [content]
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

      switch (format) {
        case "md":
          blob = new Blob([content], { type: "text/markdown" });
          filename = `${project.name}.md`;
          break;
        case "tex":
          blob = new Blob([content], { type: "text/x-tex" });
          filename = `${project.name}.tex`;
          break;
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
          // Simple DOCX-compatible HTML for Word
          const docContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
<head><meta charset="utf-8"><style>body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.6}
h1{font-size:16pt;font-weight:bold}h2{font-size:14pt;font-weight:bold}h3{font-size:12pt;font-weight:bold}
table{border-collapse:collapse;width:100%}td,th{border:1px solid #000;padding:6px}</style></head>
<body>${content.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</body></html>`;
          blob = new Blob([docContent], {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          });
          filename = `${project.name}.doc`;
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
    [content, project.name]
  );

  // Format action from toolbar
  const handleFormat = useCallback(
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
        const hashes = "#".repeat(parseInt(value || "1"));
        handleContentChange(content + `\n${hashes} `);
        return;
      }

      if (action === "unordered-list") {
        handleContentChange(content + "\n- Item 1\n- Item 2\n- Item 3\n");
        return;
      }

      if (action === "ordered-list") {
        handleContentChange(content + "\n1. Item 1\n2. Item 2\n3. Item 3\n");
        return;
      }

      if (action === "task-list") {
        handleContentChange(content + "\n- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3\n");
        return;
      }

      if (action === "table") {
        handleContentChange(
          content +
            "\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| | | |\n| | | |\n"
        );
        return;
      }

      const fmt = formatMap[action];
      if (fmt) {
        if (selectedText && !fmt.block) {
          handleContentChange(
            content.replace(selectedText, `${fmt.prefix}${selectedText}${fmt.suffix}`)
          );
        } else {
          handleContentChange(content + `${fmt.prefix}text${fmt.suffix}`);
        }
      }
    },
    [content, handleContentChange, selectedText]
  );

  // AI action from toolbar
  const handleAIAction = useCallback(
    (action: string) => {
      if (!hasAIKey) {
        setSettingsOpen(true);
        return;
      }
      setAiPanelOpen(true);
      // The AI panel will handle the actual action via its slash commands
    },
    [hasAIKey]
  );

  // Drag handlers for resizable panels
  const handleMouseMove = useCallback(
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
    [isDragging, isDraggingSidebar, isDraggingAI, sidebarOpen, sidebarWidth, aiPanelOpen, aiPanelWidth]
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
    { key: "history", label: "History", icon: "🕒" },
    { key: "rag", label: "KB", icon: "🧠" },
  ];

  // Keyboard shortcuts
  useEffect(() => {
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
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        setAiPanelOpen((v) => !v);
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
          <div
            className={`w-px h-4 mx-1 ${
              settings.theme === "light" ? "bg-gray-300" : "bg-gray-700/50"
            }`}
          />
          {/* Export dropdown */}
          <div className="relative group">
            <button
              className={`text-xs px-2 py-1 rounded transition-colors ${
                settings.theme === "light"
                  ? "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
              }`}
            >
              Export
            </button>
            <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-gray-700/60 rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 py-1 min-w-[140px]">
              {[
                { fmt: "md", label: "Markdown (.md)" },
                { fmt: "tex", label: "LaTeX (.tex)" },
                { fmt: "html", label: "HTML (.html)" },
                { fmt: "docx", label: "Word (.doc)" },
                { fmt: "pdf", label: "PDF (Print)" },
              ].map(({ fmt, label }) => (
                <button
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
                  />
                )}
                {sidebarTab === "outline" && (
                  <OutlinePanel content={content} mode={project.mode} />
                )}
                {sidebarTab === "history" && (
                  <VersionHistory
                    versions={versions}
                    currentContent={content}
                    onRestore={handleRestore}
                    onSaveManual={handleSaveManual}
                  />
                )}
                {sidebarTab === "rag" && (
                  <RAGPanel
                    onInsertText={handleInsertText}
                    settings={{
                      openaiKey: settings.openaiKey,
                      pineconeKey: settings.pineconeKey,
                      pineconeEnv: settings.pineconeEnv,
                      pineconeIndex: settings.pineconeIndex,
                    }}
                  />
                )}
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
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
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
                  content={content}
                  onChange={handleContentChange}
                  mode={project.mode}
                  onCursorChange={(line, col) => setCursorPos({ line, col })}
                />
              </div>

              {/* Figure tools */}
              {showFigureTools && (
                <FigureTools mode={project.mode} onInsert={handleInsertText} />
              )}
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
            <div
              className="min-h-0 flex flex-col"
              style={{ width: `${100 - splitPos}%` }}
            >
              <PreviewPanel content={content} mode={project.mode} />
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
              <span>
                {wordCount} words
              </span>
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
                onInsertText={handleInsertText}
                onReplaceSelection={
                  selectedText
                    ? (text: string) =>
                        handleContentChange(content.replace(selectedText, text))
                    : undefined
                }
                settings={{
                  anthropicKey: settings.anthropicKey,
                  openaiKey: settings.openaiKey,
                  perplexityKey: settings.perplexityKey,
                }}
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
    </div>
  );
}
