"use client";

import { useProviderKeys } from "@/lib/useProviderKeys";
import { useCallback, useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  suggestion?: {
    original: string;
    replacement: string;
  };
}

interface FloatingAIChatProps {
  documentContent: string;
  selectedText?: string;
  onInsertText?: (text: string) => void;
  onReplaceSelection?: (text: string) => void;
}

const REWRITE_KEYWORDS = ["improve", "rewrite", "fix", "simplify"];

function isRewriteSuggestion(messageText: string, selectedText?: string): boolean {
  if (!selectedText) return false;
  const lower = messageText.toLowerCase();
  return REWRITE_KEYWORDS.some((keyword) => lower.includes(keyword));
}

function buildDocContext(documentContent: string): string {
  return documentContent.length > 4000
    ? `${documentContent.slice(0, 4000)}\n...(truncated)`
    : documentContent;
}

const QUICK_ACTIONS = [
  {
    label: "Improve paragraph",
    icon: "✨",
    prompt: "Improve this paragraph for clarity and academic tone",
  },
  {
    label: "Fix grammar",
    icon: "✓",
    prompt: "Fix all grammar and punctuation issues in this text",
  },
  {
    label: "Add citations",
    icon: "📚",
    prompt: "Suggest relevant academic citations for this text",
  },
  { label: "Summarize", icon: "📋", prompt: "Summarize this text concisely" },
  {
    label: "Expand",
    icon: "📖",
    prompt: "Expand this text with more detail and supporting evidence",
  },
  { label: "Simplify", icon: "🔤", prompt: "Simplify this text for a broader audience" },
];

export default function FloatingAIChat({
  documentContent,
  selectedText,
  onInsertText,
  onReplaceSelection,
}: FloatingAIChatProps) {
  const { hasKey, headers, activeProvider } = useProviderKeys();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I can help with your document. Ask me anything, or use the quick actions below.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isLoading || !hasKey) return;

      const userMessage: Message = {
        role: "user",
        content: messageText,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const docContext = buildDocContext(documentContent);
        const selectedContext = selectedText ? `\n\nCurrently selected text:\n${selectedText}` : "";

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({
            messages: [
              ...messages
                .filter((_, i) => i > 0)
                .slice(-4)
                .map((m) => ({ role: m.role, content: m.content })),
              {
                role: "user",
                content: `${messageText}${selectedContext}\n\nDocument context:\n${docContext}`,
              },
            ],
            systemPrompt:
              "You are an academic writing assistant. Provide concise, actionable suggestions. When suggesting text changes, clearly show the improved version. Format suggestions so they can be directly applied.",
          }),
        });

        const data = await res.json();
        const assistantMsg: Message = {
          role: "assistant",
          content: data.content || data.error || "No response received.",
          timestamp: Date.now(),
        };

        if (isRewriteSuggestion(messageText, selectedText)) {
          assistantMsg.suggestion = {
            original: selectedText as string,
            replacement: data.content || "",
          };
        }

        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Error connecting to AI service. Check your API key and connection.",
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, hasKey, messages, headers, documentContent, selectedText],
  );

  const handleQuickAction = (action: (typeof QUICK_ACTIONS)[number]) => {
    const text = selectedText
      ? `${action.prompt}:\n\n${selectedText}`
      : `${action.prompt} (apply to the current document)`;
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
    if (e.key === "Escape") setIsOpen(false);
  };

  const applySuggestion = (msg: Message) => {
    if (msg.suggestion && onReplaceSelection) {
      onReplaceSelection(msg.suggestion.replacement);
    } else if (onInsertText) {
      onInsertText(msg.content);
    }
  };

  return (
    <>
      {/* Floating bubble button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          isOpen
            ? "bg-gray-800 text-gray-400 hover:text-white rotate-45"
            : "bg-amber-500 text-white hover:bg-amber-400 hover:scale-110"
        }`}
        title="AI Chat Assistant (Ctrl+J)"
      >
        {isOpen ? (
          <span className="text-xl">+</span>
        ) : (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <title>Chat</title>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-96 h-[520px] bg-gray-900 border border-gray-700/60 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60 bg-gray-900/95 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-sm">✨</span>
              <span className="text-sm font-semibold text-white">AI Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              {hasKey && activeProvider ? (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {activeProvider.label}
                </span>
              ) : (
                <a href="/settings" className="text-xs text-gray-500 hover:text-amber-400">
                  Configure API key
                </a>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-300 text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>

          {/* Quick actions */}
          {selectedText && (
            <div className="px-3 py-2 border-b border-gray-800/40 flex-shrink-0">
              <p className="text-xs text-gray-500 mb-1.5">Quick actions on selection:</p>
              <div className="flex flex-wrap gap-1">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    type="button"
                    key={action.label}
                    onClick={() => handleQuickAction(action)}
                    disabled={!hasKey || isLoading}
                    className="px-2 py-1 text-xs rounded-md bg-gray-800/60 text-gray-300 hover:bg-amber-500/10 hover:text-amber-300 transition-colors border border-gray-700/40 disabled:opacity-40"
                  >
                    {action.icon} {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-auto p-3 space-y-3 min-h-0">
            {messages.map((msg) => (
              <div
                key={msg.timestamp}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 ${
                    msg.role === "user"
                      ? "bg-amber-500/15 text-amber-200 border border-amber-500/20"
                      : "bg-gray-800/60 text-gray-300 border border-gray-700/40"
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words text-xs leading-relaxed">
                    {msg.content}
                  </div>
                  {msg.role === "assistant" && msg.timestamp !== messages[0]?.timestamp && (
                    <div className="flex gap-2 mt-2 pt-1.5 border-t border-gray-700/30">
                      {msg.suggestion && onReplaceSelection && selectedText ? (
                        <button
                          type="button"
                          onClick={() => applySuggestion(msg)}
                          className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                        >
                          Apply change
                        </button>
                      ) : (
                        onInsertText && (
                          <button
                            type="button"
                            onClick={() => onInsertText(msg.content)}
                            className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
                          >
                            Insert
                          </button>
                        )
                      )}
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(msg.content)}
                        className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800/60 border border-gray-700/40 rounded-lg px-3 py-2">
                  <span className="animate-pulse text-xs text-gray-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-800/60 flex-shrink-0">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  hasKey ? "Ask about your document..." : "Configure API key in Settings first"
                }
                className="flex-1 bg-gray-800/60 border border-gray-700/40 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-amber-500/40"
                rows={2}
                disabled={!hasKey}
              />
              <button
                type="button"
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim() || !hasKey}
                className="self-end px-3 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-medium hover:bg-amber-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
