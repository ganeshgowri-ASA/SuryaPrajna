"use client";

import { PROVIDER_INFO, type ProviderName, type loadProviderKeys } from "@/lib/providers";
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
  provider?: string;
  isConsensus?: boolean;
  consensusResponses?: Array<{
    provider: string;
    label: string;
    content: string;
    error?: string;
  }>;
  attachments?: AttachedFile[];
}

interface AttachedFile {
  name: string;
  type: string;
  content: string;
  size: number;
}

interface FloatingAIChatProps {
  documentContent: string;
  selectedText?: string;
  onInsertText?: (text: string) => void;
  onReplaceSelection?: (text: string) => void;
}

interface ModelOption {
  id: string;
  label: string;
  provider: ProviderName | "consensus";
  icon: string;
  available: boolean;
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

const ACCEPTED_FILE_TYPES = ".pdf,.docx,.txt,.md,.tex,.csv";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const VALID_EXTENSIONS = new Set(["pdf", "docx", "txt", "md", "tex", "csv"]);
const BINARY_EXTENSIONS = new Set(["pdf", "docx"]);

function getModelOptions(keys: ReturnType<typeof loadProviderKeys>): ModelOption[] {
  const options: ModelOption[] = [
    {
      id: "anthropic",
      label: "Claude",
      provider: "anthropic",
      icon: PROVIDER_INFO.anthropic.icon,
      available: !!keys.anthropicKey,
    },
    {
      id: "openai",
      label: "GPT-4o",
      provider: "openai",
      icon: PROVIDER_INFO.openai.icon,
      available: !!keys.openaiKey,
    },
    {
      id: "deepseek",
      label: "DeepSeek Chat",
      provider: "deepseek",
      icon: PROVIDER_INFO.deepseek.icon,
      available: !!keys.deepseekKey,
    },
    {
      id: "groq",
      label: "Groq Llama",
      provider: "groq",
      icon: PROVIDER_INFO.groq.icon,
      available: !!keys.groqKey,
    },
    {
      id: "openrouter",
      label: "OpenRouter",
      provider: "openrouter",
      icon: PROVIDER_INFO.openrouter.icon,
      available: !!keys.openrouterKey,
    },
    {
      id: "perplexity",
      label: "Perplexity",
      provider: "perplexity",
      icon: PROVIDER_INFO.perplexity.icon,
      available: !!keys.perplexityKey,
    },
  ];
  const availableCount = options.filter((o) => o.available).length;
  options.push({
    id: "consensus",
    label: "Consensus (All)",
    provider: "consensus",
    icon: "🌐",
    available: availableCount >= 2,
  });
  return options;
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsText(file);
  });
}

function readBinaryFile(file: File, ext: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(
        `[Attached ${ext.toUpperCase()} file: ${file.name}]\n(Binary content - ${(file.size / 1024).toFixed(1)}KB)`,
      );
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

async function readSingleFile(file: File): Promise<AttachedFile | null> {
  if (file.size > MAX_FILE_SIZE) return null;
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!VALID_EXTENSIONS.has(ext)) return null;
  const content = BINARY_EXTENSIONS.has(ext)
    ? await readBinaryFile(file, ext)
    : await readFileAsText(file);
  return { name: file.name, type: ext, content, size: file.size };
}

export default function FloatingAIChat({
  documentContent,
  selectedText,
  onInsertText,
  onReplaceSelection,
}: FloatingAIChatProps) {
  const { hasKey, headers, keys } = useProviderKeys();
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
  const [selectedModel, setSelectedModel] = useState<string>("auto");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [expandedConsensus, setExpandedConsensus] = useState<Record<number, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const modelOptions = getModelOptions(keys);
  const activeModel = modelOptions.find((m) => m.id === selectedModel);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowModelDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const results = await Promise.all(
      Array.from(files).map((file) => readSingleFile(file).catch(() => null)),
    );
    const newFiles = results.filter((f): f is AttachedFile => f !== null);
    if (newFiles.length > 0) setAttachedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isLoading || !hasKey) return;

      const currentAttachments = [...attachedFiles];
      let userContent = messageText;
      if (currentAttachments.length > 0) {
        userContent += currentAttachments
          .map((f) => `\n\n--- Attached file: ${f.name} ---\n${f.content}`)
          .join("");
      }

      const userMessage: Message = {
        role: "user",
        content: messageText,
        timestamp: Date.now(),
        attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setAttachedFiles([]);
      setIsLoading(true);

      try {
        const docContext = buildDocContext(documentContent);
        const selectedContext = selectedText ? `\n\nCurrently selected text:\n${selectedText}` : "";

        const apiMessages = [
          ...messages
            .filter((_, i) => i > 0)
            .slice(-4)
            .map((m) => ({ role: m.role, content: m.content })),
          {
            role: "user",
            content: `${userContent}${selectedContext}\n\nDocument context:\n${docContext}`,
          },
        ];

        const systemPrompt =
          "You are an academic writing assistant. Provide concise, actionable suggestions. When suggesting text changes, clearly show the improved version. Format suggestions so they can be directly applied.";

        let assistantMsg: Message;

        if (selectedModel === "consensus") {
          // Consensus mode: query all providers
          const res = await fetch("/api/ai/consensus", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...headers },
            body: JSON.stringify({ messages: apiMessages, systemPrompt }),
          });
          const data = await res.json();
          if (data.error) {
            assistantMsg = {
              role: "assistant",
              content: `Error: ${data.error}`,
              timestamp: Date.now(),
            };
          } else {
            assistantMsg = {
              role: "assistant",
              content: data.synthesized || "No consensus generated.",
              timestamp: Date.now(),
              provider: "consensus",
              isConsensus: true,
              consensusResponses: data.responses,
            };
          }
        } else {
          // Single provider
          const provider = selectedModel === "auto" ? undefined : selectedModel;
          const res = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...headers },
            body: JSON.stringify({ messages: apiMessages, systemPrompt, provider }),
          });
          const data = await res.json();
          assistantMsg = {
            role: "assistant",
            content: data.content || data.error || "No response received.",
            timestamp: Date.now(),
            provider: data.provider,
          };

          if (isRewriteSuggestion(messageText, selectedText)) {
            assistantMsg.suggestion = {
              original: selectedText as string,
              replacement: data.content || "",
            };
          }
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
    [
      isLoading,
      hasKey,
      messages,
      headers,
      documentContent,
      selectedText,
      selectedModel,
      attachedFiles,
    ],
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

  const toggleConsensusDetail = (timestamp: number) => {
    setExpandedConsensus((prev) => ({ ...prev, [timestamp]: !prev[timestamp] }));
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
          {/* Header with model selector */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60 bg-gray-900/95 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-sm">✨</span>
              <span className="text-sm font-semibold text-white">AI Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              {hasKey ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowModelDropdown((v) => !v)}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-700/60 bg-gray-800/60 hover:bg-gray-700/60 transition-colors text-gray-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="truncate max-w-[90px]">
                      {selectedModel === "auto" ? "Auto" : activeModel?.label || selectedModel}
                    </span>
                    <svg
                      className="w-3 h-3 text-gray-500 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      role="img"
                    >
                      <title>Select model</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {showModelDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-52 bg-gray-900 border border-gray-700/60 rounded-lg shadow-xl z-50 overflow-hidden">
                      <div className="px-3 py-1.5 text-xs text-gray-500 border-b border-gray-800/60 font-medium">
                        Select Model
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedModel("auto");
                          setShowModelDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-800/80 transition-colors ${
                          selectedModel === "auto"
                            ? "bg-amber-500/10 text-amber-300"
                            : "text-gray-300"
                        }`}
                      >
                        <span className="text-sm w-5 text-center">⚡</span>
                        <span className="flex-1 text-left">Auto (Best Available)</span>
                        {selectedModel === "auto" && (
                          <span className="text-amber-400 text-xs">✓</span>
                        )}
                      </button>
                      <div className="border-t border-gray-800/40" />
                      {modelOptions.map((opt) => (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => {
                            if (opt.available) {
                              setSelectedModel(opt.id);
                              setShowModelDropdown(false);
                            }
                          }}
                          disabled={!opt.available}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                            !opt.available
                              ? "text-gray-600 cursor-not-allowed"
                              : selectedModel === opt.id
                                ? "bg-amber-500/10 text-amber-300"
                                : "text-gray-300 hover:bg-gray-800/80"
                          }`}
                        >
                          <span className="text-sm w-5 text-center">{opt.icon}</span>
                          <span className="flex-1 text-left">{opt.label}</span>
                          {!opt.available && <span className="text-gray-600 text-xs">No key</span>}
                          {opt.available && selectedModel === opt.id && (
                            <span className="text-amber-400 text-xs">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
                  {/* Attachment badges */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {msg.attachments.map((f) => (
                        <span
                          key={f.name}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs"
                        >
                          📎 {f.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Provider badge */}
                  {msg.role === "assistant" && msg.provider && (
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs text-gray-500">
                        via {msg.isConsensus ? "🌐 Consensus" : msg.provider}
                      </span>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap break-words text-xs leading-relaxed">
                    {msg.content}
                  </div>

                  {/* Consensus individual responses */}
                  {msg.isConsensus && msg.consensusResponses && (
                    <div className="mt-2 pt-2 border-t border-gray-700/30">
                      <button
                        type="button"
                        onClick={() => toggleConsensusDetail(msg.timestamp)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-400 transition-colors"
                      >
                        <svg
                          className={`w-3 h-3 transition-transform ${expandedConsensus[msg.timestamp] ? "rotate-90" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          role="img"
                        >
                          <title>Toggle</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        Individual model responses (
                        {msg.consensusResponses.filter((r) => !r.error).length} models)
                      </button>
                      {expandedConsensus[msg.timestamp] && (
                        <div className="mt-2 space-y-2">
                          {msg.consensusResponses.map((r) => (
                            <div
                              key={r.provider}
                              className="rounded border border-gray-700/30 bg-gray-900/50 p-2"
                            >
                              <div className="flex items-center gap-1 mb-1">
                                <span className="text-xs font-medium text-gray-400">{r.label}</span>
                                {r.error && <span className="text-xs text-red-400">(failed)</span>}
                              </div>
                              <div className="text-xs text-gray-400 whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                                {r.error ? r.error : r.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

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
                  <span className="animate-pulse text-xs text-gray-400">
                    {selectedModel === "consensus" ? "Querying all models..." : "Thinking..."}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attached files chips */}
          {attachedFiles.length > 0 && (
            <div className="mx-3 mb-1 flex flex-wrap gap-1">
              {attachedFiles.map((f, i) => (
                <span
                  key={`${f.name}-${i}`}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs border border-amber-500/20"
                >
                  📎 {f.name}
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="ml-0.5 hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Input with attachment button */}
          <div className="p-3 border-t border-gray-800/60 flex-shrink-0">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!hasKey}
                className="self-end p-2 text-gray-500 hover:text-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Attach file (.pdf, .docx, .txt, .md, .tex, .csv)"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                >
                  <title>Attachment</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                multiple
                className="hidden"
                onChange={(e) => {
                  handleFileSelect(e.target.files);
                  e.target.value = "";
                }}
              />
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
