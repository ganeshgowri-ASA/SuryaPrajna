"use client";

import { useProviderKeys } from "@/lib/useProviderKeys";
import { useCallback, useState } from "react";

interface InlineAIMenuProps {
  selectedText: string;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onApply: (replacement: string) => void;
}

const INLINE_ACTIONS = [
  {
    label: "Rewrite",
    icon: "✏️",
    prompt:
      "Rewrite this text to improve clarity and flow. Return ONLY the improved text, nothing else.",
  },
  {
    label: "Simplify",
    icon: "🔤",
    prompt: "Simplify this text for a broader audience. Return ONLY the simplified text.",
  },
  {
    label: "Expand",
    icon: "📖",
    prompt: "Expand this text with more detail. Return ONLY the expanded text.",
  },
  {
    label: "Fix Grammar",
    icon: "✓",
    prompt: "Fix all grammar, punctuation, and spelling issues. Return ONLY the corrected text.",
  },
  {
    label: "Make Academic",
    icon: "🎓",
    prompt: "Rewrite this in formal academic tone. Return ONLY the rewritten text.",
  },
  {
    label: "Add Citation",
    icon: "📚",
    prompt:
      "Suggest where citations should be added and provide example BibTeX entries. Include the text with citation markers.",
  },
  {
    label: "Translate to EN",
    icon: "🌐",
    prompt: "Translate this text to English. Return ONLY the translated text.",
  },
];

export default function InlineAIMenu({
  selectedText,
  position,
  onClose,
  onApply,
}: InlineAIMenuProps) {
  const { hasKey, headers, activeProvider } = useProviderKeys();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const executeAction = useCallback(
    async (action: (typeof INLINE_ACTIONS)[number]) => {
      if (!hasKey || isLoading) return;

      setActiveAction(action.label);
      setIsLoading(true);
      setResult(null);

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `${action.prompt}\n\nText:\n${selectedText}`,
              },
            ],
            systemPrompt:
              "You are a precise text editing assistant. Follow the instruction exactly. Return only the requested output with no preamble or explanation.",
          }),
        });

        const data = await res.json();
        const content = data.content || data.error || "No response";
        setResult(content);
      } catch {
        setResult("Error: Could not reach AI service.");
      } finally {
        setIsLoading(false);
      }
    },
    [hasKey, isLoading, selectedText, headers],
  );

  if (!position || !selectedText) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60]"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
      />

      {/* Menu */}
      <div
        className="fixed z-[61] bg-gray-900 border border-gray-700/60 rounded-lg shadow-2xl overflow-hidden"
        style={{
          left: Math.min(position.x, window.innerWidth - 320),
          top: Math.min(position.y, window.innerHeight - 400),
          minWidth: result ? "360px" : "200px",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-400">AI Actions</span>
            {hasKey && activeProvider && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {activeProvider.label}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-400 text-sm"
          >
            ×
          </button>
        </div>

        {/* Actions */}
        {!result && (
          <div className="py-1">
            {INLINE_ACTIONS.map((action) => (
              <button
                type="button"
                key={action.label}
                onClick={() => executeAction(action)}
                disabled={!hasKey || isLoading}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition-colors ${
                  isLoading && activeAction === action.label
                    ? "bg-amber-500/10 text-amber-300"
                    : "text-gray-300 hover:bg-gray-800/60 hover:text-white"
                } disabled:opacity-40`}
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
                {isLoading && activeAction === action.label && (
                  <span className="ml-auto animate-pulse text-amber-400">...</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-gray-500">{activeAction} result:</span>
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setActiveAction(null);
                }}
                className="text-xs text-gray-600 hover:text-gray-400"
              >
                Back
              </button>
            </div>

            {/* Diff-style display */}
            <div className="space-y-1.5 mb-3">
              <div className="bg-red-500/5 border border-red-500/20 rounded px-2 py-1.5">
                <p className="text-xs text-red-400/60 mb-0.5 font-medium">Original:</p>
                <p className="text-xs text-red-300/80 whitespace-pre-wrap">{selectedText}</p>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded px-2 py-1.5">
                <p className="text-xs text-emerald-400/60 mb-0.5 font-medium">Suggested:</p>
                <p className="text-xs text-emerald-300/80 whitespace-pre-wrap">{result}</p>
              </div>
            </div>

            {/* Accept / Reject */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onApply(result);
                  onClose();
                }}
                className="flex-1 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded text-xs font-medium hover:bg-emerald-500/30 transition-colors"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-3 py-1.5 bg-gray-800 text-gray-400 rounded text-xs font-medium hover:bg-gray-700 transition-colors"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(result)}
                className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded text-xs hover:bg-gray-700 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {!hasKey && (
          <div className="px-3 py-2 border-t border-gray-800/40">
            <p className="text-xs text-gray-600">
              <a href="/settings" className="text-amber-500 hover:text-amber-400">
                Configure API key in Settings
              </a>{" "}
              to use AI features.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
