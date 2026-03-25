"use client";

import { useCallback } from "react";

interface EditorToolbarProps {
  onFormat: (action: string, value?: string) => void;
  mode: "markdown" | "latex";
  onAIAction: (action: string) => void;
  hasAIKey: boolean;
  onEquationOCR?: () => void;
}

interface ToolbarButton {
  label: string;
  icon: string;
  action: string;
  value?: string;
  title: string;
  separator?: boolean;
}

const MD_BUTTONS: ToolbarButton[] = [
  { label: "B", icon: "B", action: "bold", title: "Bold (Ctrl+B)" },
  { label: "I", icon: "I", action: "italic", title: "Italic (Ctrl+I)" },
  { label: "S", icon: "S", action: "strikethrough", title: "Strikethrough" },
  { label: "Code", icon: "<>", action: "code", title: "Inline Code" },
  { label: "", icon: "", action: "sep-1", title: "", separator: true },
  { label: "H1", icon: "H1", action: "heading", value: "1", title: "Heading 1" },
  { label: "H2", icon: "H2", action: "heading", value: "2", title: "Heading 2" },
  { label: "H3", icon: "H3", action: "heading", value: "3", title: "Heading 3" },
  { label: "", icon: "", action: "sep-2", title: "", separator: true },
  { label: "UL", icon: "*", action: "unordered-list", title: "Bullet List" },
  { label: "OL", icon: "1.", action: "ordered-list", title: "Numbered List" },
  { label: "Task", icon: "[]", action: "task-list", title: "Task List" },
  { label: "Quote", icon: ">", action: "blockquote", title: "Block Quote" },
  { label: "", icon: "", action: "sep-3", title: "", separator: true },
  { label: "Link", icon: "Link", action: "link", title: "Insert Link" },
  { label: "Image", icon: "Img", action: "image", title: "Insert Image" },
  { label: "Table", icon: "Tbl", action: "table", title: "Insert Table" },
  { label: "Math", icon: "Sum", action: "math", title: "Math Equation" },
  { label: "Code Block", icon: "{ }", action: "code-block", title: "Code Block" },
  { label: "HR", icon: "---", action: "horizontal-rule", title: "Horizontal Rule" },
];

const AI_ACTIONS = [
  { label: "AI Write", icon: "AI-W", action: "ai-write", title: "Generate text with AI" },
  { label: "AI Edit", icon: "AI-E", action: "ai-edit", title: "Improve selected text" },
  { label: "Proofread", icon: "Prf", action: "ai-proofread", title: "Check grammar & style" },
  { label: "Literature", icon: "Lit", action: "ai-literature", title: "Search academic papers" },
  { label: "Explain", icon: "Exp", action: "ai-explain", title: "Explain selection" },
  { label: "Summarize", icon: "Sum", action: "ai-summarize", title: "Summarize section" },
    { label: "Generate", icon: "Gen", action: "ai-generate", title: "AI Content Generator (Equations, Graphs, Tables)" },
];

export default function EditorToolbar({
  onFormat,
  mode,
  onAIAction,
  hasAIKey,
  onEquationOCR,
}: EditorToolbarProps) {
  const handleFormat = useCallback(
    (action: string, value?: string) => {
      onFormat(action, value);
    },
    [onFormat],
  );

  const buttons = mode === "markdown" ? MD_BUTTONS : MD_BUTTONS;

  return (
    <div className="flex items-center gap-0.5 px-2 py-1 bg-gray-900/50 border-b border-gray-800 overflow-x-auto">
      {/* Formatting buttons */}
      <div className="flex items-center gap-0.5">
        {buttons.map((btn, i) => {
          if (btn.separator) {
            return <div key={btn.action} className="w-px h-4 bg-gray-700 mx-1" />;
          }
          return (
            <button
              key={btn.action + (btn.value || "")}
              type="button"
              onClick={() => handleFormat(btn.action, btn.value)}
              className="px-1.5 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors font-mono whitespace-nowrap"
              title={btn.title}
            >
              {btn.icon}
            </button>
          );
        })}
      </div>

      {/* Equation OCR button */}
      {onEquationOCR && (
        <>
          <div className="w-px h-4 bg-gray-700 mx-1" />
          <button
            type="button"
            onClick={onEquationOCR}
            className="px-1.5 py-1 text-xs text-teal-400/80 hover:text-teal-300 hover:bg-teal-500/10 rounded transition-colors whitespace-nowrap"
            title="Scan equation from image (MathPix OCR)"
          >
            OCR
          </button>
        </>
      )}

      {/* AI actions */}
      <div className="flex items-center gap-0.5 ml-auto">
        {AI_ACTIONS.map((btn) => (
          <button
            key={btn.action}
            type="button"
            onClick={() => onAIAction(btn.action)}
            className={`px-1.5 py-1 text-xs rounded transition-colors whitespace-nowrap ${
              hasAIKey
                ? "text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10"
                : "text-gray-600 cursor-not-allowed"
            }`}
            title={hasAIKey ? btn.title : "Configure API key in Settings to use AI features"}
            disabled={!hasAIKey}
          >
            {btn.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
