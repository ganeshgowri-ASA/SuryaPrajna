"use client";

import { useState, useCallback } from "react";
import ChatPanel from "@/components/workspace/ChatPanel";
import OutputPanel from "@/components/workspace/OutputPanel";
import SkillBrowserPanel from "@/components/workspace/SkillBrowserPanel";
import ConfigPanel from "@/components/workspace/ConfigPanel";
import SessionManager from "@/components/workspace/SessionManager";
import TemplateCards from "@/components/workspace/TemplateCards";

type RightTab = "results" | "skills";

export default function WorkspacePage() {
  const [outputContent, setOutputContent] = useState("");
  const [codeContent, setCodeContent] = useState("");
  const [prefillMessage, setPrefillMessage] = useState("");
  const [rightTab, setRightTab] = useState<RightTab>("results");
  const [configOpen, setConfigOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const [splitPos, setSplitPos] = useState(60); // percentage for left panel
  const [isDragging, setIsDragging] = useState(false);

  const handleOutputUpdate = useCallback((content: string, type: "output" | "code") => {
    if (type === "output") setOutputContent(content);
    if (type === "code") setCodeContent(content);
    setRightTab("results");
    setShowTemplates(false);
  }, []);

  const handleUseSkill = useCallback((prompt: string) => {
    setPrefillMessage(prompt);
    setRightTab("results");
  }, []);

  const handleSelectTemplate = useCallback((prompt: string) => {
    setPrefillMessage(prompt);
    setShowTemplates(false);
  }, []);

  const handlePrefillConsumed = useCallback(() => {
    setPrefillMessage("");
  }, []);

  const handleNewSession = useCallback(() => {
    setOutputContent("");
    setCodeContent("");
    setShowTemplates(true);
  }, []);

  const handleExportSession = useCallback(() => {
    const content = `# SuryaPrajna Workspace Session\n\nExported: ${new Date().toISOString()}\n\n## Output\n\n${outputContent || "No output"}\n\n## Code\n\n\`\`\`python\n${codeContent || "# No code generated"}\n\`\`\`\n`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `suryaprajna-session-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [outputContent, codeContent]);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = (x / rect.width) * 100;
    if (pct >= 35 && pct <= 75) setSplitPos(pct);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800/60 bg-gray-950/80 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-white">PV Scientific Console</h1>
          <span className="text-xs text-gray-600 hidden sm:block">SuryaPrajna Workspace</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowTemplates((v) => !v)}
            className="btn-secondary text-xs py-1 px-3">
            Templates
          </button>
          <button onClick={() => setSessionsOpen(true)}
            className="btn-secondary text-xs py-1 px-3">
            Sessions
          </button>
          <button onClick={() => setConfigOpen(true)}
            className="btn-secondary text-xs py-1 px-3">
            Settings
          </button>
          <button onClick={handleNewSession}
            className="btn-primary text-xs py-1 px-3">
            + New
          </button>
        </div>
      </div>

      {/* Templates bar */}
      {showTemplates && (
        <div className="px-4 py-3 border-b border-gray-800/40 bg-gray-900/30 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Start Templates</h2>
            <button onClick={() => setShowTemplates(false)} className="text-xs text-gray-600 hover:text-gray-400">Hide</button>
          </div>
          <TemplateCards onSelectTemplate={handleSelectTemplate} />
        </div>
      )}

      {/* Main split pane */}
      <div className="flex-1 flex min-h-0"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}>
        {/* Left: Chat panel */}
        <div className="min-h-0 border-r border-gray-800/60 flex flex-col"
          style={{ width: `${splitPos}%` }}>
          <ChatPanel
            onOutputUpdate={handleOutputUpdate}
            prefillMessage={prefillMessage}
            onPrefillConsumed={handlePrefillConsumed}
          />
        </div>

        {/* Drag handle */}
        <div className="w-1 flex-shrink-0 cursor-col-resize hover:bg-amber-500/30 active:bg-amber-500/50 transition-colors relative group"
          onMouseDown={handleMouseDown}>
          <div className="absolute inset-y-0 -left-1 -right-1" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-gray-700 group-hover:bg-amber-500/60 transition-colors" />
        </div>

        {/* Right: Results / Skills */}
        <div className="min-h-0 flex flex-col" style={{ width: `${100 - splitPos}%` }}>
          {/* Right panel tabs */}
          <div className="flex items-center border-b border-gray-800/60 flex-shrink-0">
            <button onClick={() => setRightTab("results")}
              className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                rightTab === "results"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}>
              Results & Output
            </button>
            <button onClick={() => setRightTab("skills")}
              className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                rightTab === "skills"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}>
              Skills Browser
            </button>
          </div>

          {/* Right panel content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {rightTab === "results" ? (
              <OutputPanel outputContent={outputContent} codeContent={codeContent} />
            ) : (
              <SkillBrowserPanel onUseSkill={handleUseSkill} />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfigPanel isOpen={configOpen} onClose={() => setConfigOpen(false)} />
      <SessionManager isOpen={sessionsOpen} onClose={() => setSessionsOpen(false)}
        onNewSession={handleNewSession} onExportSession={handleExportSession} />
    </div>
  );
}
