"use client";

import { useState, useEffect, useRef } from "react";

interface FloatingToolbarProps {
  position: { x: number; y: number } | null;
  onFormat: (action: string) => void;
  onAIAction: (action: string) => void;
  hasAIKey: boolean;
}

export default function FloatingToolbar({
  position,
  onFormat,
  onAIAction,
  hasAIKey,
}: FloatingToolbarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (position) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [position]);

  if (!visible || !position) return null;

  return (
    <div
      ref={ref}
      className="fixed z-50 flex items-center gap-0.5 bg-gray-900 border border-gray-700/60 rounded-lg shadow-xl px-1 py-0.5 animate-in fade-in"
      style={{
        left: `${position.x}px`,
        top: `${position.y - 40}px`,
        transform: "translateX(-50%)",
      }}
    >
      <button
        onClick={() => onFormat("bold")}
        className="px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700/50 rounded font-bold"
        title="Bold"
      >
        B
      </button>
      <button
        onClick={() => onFormat("italic")}
        className="px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700/50 rounded italic"
        title="Italic"
      >
        I
      </button>
      <button
        onClick={() => onFormat("code")}
        className="px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700/50 rounded font-mono"
        title="Code"
      >
        {"<>"}
      </button>
      <button
        onClick={() => onFormat("link")}
        className="px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700/50 rounded"
        title="Link"
      >
        🔗
      </button>
      <div className="w-px h-4 bg-gray-700/50 mx-0.5" />
      {hasAIKey && (
        <>
          <button
            onClick={() => onAIAction("ai-edit")}
            className="px-2 py-1 text-xs text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10 rounded"
            title="AI Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onAIAction("ai-explain")}
            className="px-2 py-1 text-xs text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10 rounded"
            title="Explain"
          >
            💡
          </button>
        </>
      )}
    </div>
  );
}
