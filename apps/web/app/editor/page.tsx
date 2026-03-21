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

// Dynamic import for CodeMirror (client-only)
const CodeMirrorEditor = dynamic(
  () => import("@/components/editor/CodeMirrorEditor"),
  { ssr: false, loading: () => <div className="h-full flex items-center justify-center text-gray-600 text-sm">Loading editor...</div> }
);

type SidebarTab = "files" | "refs" | "outline" | "history";
type RightTab = "preview" | "ai";

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
  const [rightTab, setRightTab] = useState<RightTab>("preview");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [splitPos, setSplitPos] = useState(55);
  const [isDragging, setIsDragging] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [showFigureTools, setShowFigureTools] = useState(false);

  const autoSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAutoSave = useRef<number>(Date.now());

  // Get active file
  const activeFile = project.files.find((f) => f.id === project.activeFileId) || project.files[0];
  const content = activeFile?.content || "";

  // Word count
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  // Persist to localStorage
  useEffect(() => {
    saveToStorage("sp-editor-project", project);
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
            label: `Auto-save`,
            content,
            timestamp: now,
            auto: true,
          },
        ]);
      }
    }, 30000); // Check every 30s

    return () => {
      if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);
    };
  }, [content, settings.autoSaveInterval]);

  // Content change handler
  const handleContentChange = useCallback(
    (newContent: string) => {
      setProject((prev) => ({
        ...prev,
        files: prev.files.map((f) =>
          f.id === prev.activeFileId ? { ...f, content: newContent } : f
        ),
        updatedAt: Date.now(),
      }));
    },
    []
  );

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
<style>body{font-family:Georgia,serif;max-width:800px;margin:2em auto;padding:0 1em;line-height:1.6;color:#333}
h1,h2,h3{color:#1a1a1a}code{background:#f4f4f4;padding:2px 6px;border-radius:3px}
pre{background:#f4f4f4;padding:1em;border-radius:4px;overflow-x:auto}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}
blockquote{border-left:4px solid #ddd;margin:0;padding:0 1em;color:#666}</style>
</head><body><pre>${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre></body></html>`;
          blob = new Blob([htmlContent], { type: "text/html" });
          filename = `${project.name}.html`;
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

  // Drag handler for split pane
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const container = e.currentTarget;
      const rect = container.getBoundingClientRect();
      const sidebarWidth = sidebarOpen ? 220 : 0;
      const x = e.clientX - rect.left - sidebarWidth;
      const availableWidth = rect.width - sidebarWidth;
      const pct = (x / availableWidth) * 100;
      if (pct >= 30 && pct <= 75) setSplitPos(pct);
    },
    [isDragging, sidebarOpen]
  );

  const sidebarTabs: { key: SidebarTab; label: string; icon: string }[] = [
    { key: "files", label: "Files", icon: "📁" },
    { key: "refs", label: "Refs", icon: "📚" },
    { key: "outline", label: "Outline", icon: "📑" },
    { key: "history", label: "History", icon: "🕒" },
  ];

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-gray-950">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-800/60 bg-gray-950/90 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-300 text-sm px-1"
            title="Toggle sidebar"
          >
            ☰
          </button>
          <h1 className="text-sm font-semibold text-white">
            {project.name}
          </h1>
          <button
            onClick={toggleMode}
            className="text-xs px-2 py-0.5 rounded border border-gray-700/60 text-gray-400 hover:text-amber-300 hover:border-amber-500/30 transition-colors"
          >
            {project.mode === "markdown" ? "MD" : "TeX"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFigureTools(!showFigureTools)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              showFigureTools
                ? "bg-amber-500/15 text-amber-300"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Insert
          </button>
          <button
            onClick={() => setRightTab("preview")}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              rightTab === "preview"
                ? "bg-amber-500/15 text-amber-300"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setRightTab("ai")}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              rightTab === "ai"
                ? "bg-amber-500/15 text-amber-300"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            AI
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1"
          >
            ⚙
          </button>
        </div>
      </div>

      {/* Main area */}
      <div
        className="flex-1 flex min-h-0"
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-[220px] flex-shrink-0 border-r border-gray-800/60 flex flex-col bg-gray-950/50">
            {/* Sidebar tabs */}
            <div className="flex border-b border-gray-800/60 flex-shrink-0">
              {sidebarTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSidebarTab(tab.key)}
                  className={`flex-1 py-2 text-xs text-center transition-colors ${
                    sidebarTab === tab.key
                      ? "text-amber-400 border-b-2 border-amber-500"
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
            </div>
          </div>
        )}

        {/* Editor + Preview split */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="flex-1 flex min-h-0">
            {/* Editor pane */}
            <div
              className="min-h-0 flex flex-col border-r border-gray-800/60"
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

            {/* Right pane */}
            <div
              className="min-h-0 flex flex-col"
              style={{ width: `${100 - splitPos}%` }}
            >
              {rightTab === "preview" ? (
                <PreviewPanel content={content} mode={project.mode} />
              ) : (
                <AIAssistantPanel
                  documentContent={content}
                  onInsertText={handleInsertText}
                />
              )}
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-1 border-t border-gray-800/60 bg-gray-950/90 flex-shrink-0 text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span>
                {wordCount} words · {charCount} chars
              </span>
              <span>
                Ln {cursorPos.line}, Col {cursorPos.col}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>{project.mode === "markdown" ? "Markdown" : "LaTeX"}</span>
              <span>{project.files.length} files</span>
              <span>{references.length} refs</span>
              <span className="text-emerald-600">Auto-saved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  );
}
