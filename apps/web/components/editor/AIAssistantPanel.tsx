"use client";

import { PROVIDER_INFO, type ProviderName, type loadProviderKeys } from "@/lib/providers";
import { useProviderKeys } from "@/lib/useProviderKeys";
import { useCallback, useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
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

interface AIAssistantPanelProps {
  documentContent: string;
  selectedText?: string;
  onInsertText?: (text: string) => void;
  onReplaceSelection?: (text: string) => void;
}

const SLASH_COMMANDS = [
  { cmd: "/review", label: "Review for clarity & accuracy", icon: "🔍" },
  { cmd: "/cite", label: "Find and suggest citations", icon: "📚" },
  { cmd: "/rewrite", label: "Rewrite selected text", icon: "✏️" },
  { cmd: "/expand", label: "Expand on topic", icon: "📖" },
  { cmd: "/summarize", label: "Summarize section", icon: "📋" },
  { cmd: "/equations", label: "Help with LaTeX equations", icon: "∑" },
  { cmd: "/outline", label: "Generate document outline", icon: "📑" },
  { cmd: "/abstract", label: "Generate abstract", icon: "📝" },
  { cmd: "/proofread", label: "Grammar & style check", icon: "✓" },
  { cmd: "/literature", label: "Search academic papers", icon: "🔬" },
];

interface ModelOption {
  id: string;
  label: string;
  provider: ProviderName | "consensus";
  icon: string;
  available: boolean;
}

const ACCEPTED_FILE_TYPES = ".pdf,.docx,.txt,.md,.tex,.csv";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

const VALID_EXTENSIONS = new Set(["pdf", "docx", "txt", "md", "tex", "csv"]);
const BINARY_EXTENSIONS = new Set(["pdf", "docx"]);

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
    reader.onload = () => {
      resolve(
        `[Attached ${ext.toUpperCase()} file: ${file.name}]\n(Binary content - ${(file.size / 1024).toFixed(1)}KB)`,
      );
    };
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

function PaperclipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" role="img">
      <title>Attachment</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
      />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" role="img">
      <title>Select model</title>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" role="img">
      <title>Toggle</title>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function parseCommand(messageText: string) {
  const cmd = messageText.split(" ")[0];
  const matchedCmd = SLASH_COMMANDS.find((c) => c.cmd === cmd);
  if (!matchedCmd) return { displayText: messageText, userContent: messageText, cmd };
  const extra = messageText.slice(cmd.length).trim();
  return {
    displayText: `${matchedCmd.icon} ${matchedCmd.label}`,
    userContent: extra ? `${matchedCmd.label}: ${extra}` : matchedCmd.label,
    cmd,
  };
}

export default function AIAssistantPanel({
  documentContent,
  selectedText,
  onInsertText,
  onReplaceSelection,
}: AIAssistantPanelProps) {
  const { hasKey, headers, keys } = useProviderKeys();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "I'm your PV research writing assistant. I can help review, rewrite, expand, and cite your work. Type `/` to see commands, or ask anything about your document.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("auto");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [expandedConsensus, setExpandedConsensus] = useState<Record<number, boolean>>({});
  const [isDragOver, setIsDragOver] = useState(false);
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

  const buildSystemPrompt = useCallback(
    (cmd?: string) => {
      const base =
        "You are a scientific writing assistant for photovoltaic (PV) research. You help with writing, editing, citations, and analysis of solar energy papers.";
      const docContext =
        documentContent.length > 3000
          ? `${documentContent.slice(0, 3000)}\n...(truncated)`
          : documentContent;

      const prompts: Record<string, string> = {
        "/review": `${base} Review the document for clarity, grammar, scientific accuracy, and structure. Provide specific, actionable suggestions.`,
        "/cite": `${base} Suggest relevant citations for the text. Format as BibTeX entries. Include DOI when possible.`,
        "/rewrite": `${base} Rewrite the provided text to improve clarity, flow, and scientific rigor. Return only the improved text.`,
        "/expand": `${base} Expand on the topics with additional technical details, data, and supporting evidence.`,
        "/summarize": `${base} Provide a concise academic summary of the text.`,
        "/equations": `${base} Help write LaTeX equations relevant to the content. Include proper formatting and brief explanations.`,
        "/outline": `${base} Generate a detailed document outline with sections and subsections.`,
        "/abstract": `${base} Generate a concise academic abstract (150-250 words) with background, methods, results, and conclusions.`,
        "/proofread": `${base} Check for grammar, punctuation, spelling, style, and consistency. List all issues found with corrections.`,
        "/literature": `${base} Search for and suggest relevant academic papers on the topic.`,
      };

      return {
        system: prompts[cmd || ""] || base,
        context: `\n\nCurrent document:\n${docContext}`,
      };
    },
    [documentContent],
  );

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const results = await Promise.all(
      Array.from(files).map((file) => readSingleFile(file).catch(() => null)),
    );
    const newFiles = results.filter((f): f is AttachedFile => f !== null);
    if (newFiles.length > 0) {
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect],
  );

  const callConsensus = useCallback(
    async (
      apiMessages: Array<{ role: string; content: string }>,
      system: string,
    ): Promise<Message> => {
      const res = await fetch("/api/ai/consensus", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ messages: apiMessages, systemPrompt: system }),
      });
      const data = await res.json();
      if (data.error) {
        return { role: "assistant", content: `Error: ${data.error}`, timestamp: Date.now() };
      }
      return {
        role: "assistant",
        content: data.synthesized || "No consensus generated.",
        timestamp: Date.now(),
        provider: "consensus",
        isConsensus: true,
        consensusResponses: data.responses,
      };
    },
    [headers],
  );

  const callSingleProvider = useCallback(
    async (
      apiMessages: Array<{ role: string; content: string }>,
      system: string,
    ): Promise<Message> => {
      const provider = selectedModel === "auto" ? undefined : selectedModel;
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ messages: apiMessages, systemPrompt: system, provider }),
      });
      const data = await res.json();
      if (data.error) {
        return { role: "assistant", content: `Error: ${data.error}`, timestamp: Date.now() };
      }
      return {
        role: "assistant",
        content: data.content || "No response received.",
        timestamp: Date.now(),
        provider: data.provider,
      };
    },
    [headers, selectedModel],
  );

  const prepareMessage = useCallback(
    (messageText: string) => {
      const isCommand = messageText.startsWith("/");
      const parsed = isCommand
        ? parseCommand(messageText)
        : { displayText: messageText, userContent: messageText, cmd: undefined };

      let { userContent } = parsed;
      const { displayText, cmd } = parsed;

      const textCmds = new Set(["/rewrite", "/expand", "/proofread"]);
      if (selectedText && cmd && textCmds.has(cmd)) {
        userContent += `\n\nSelected text:\n${selectedText}`;
      }

      const currentAttachments = [...attachedFiles];
      if (currentAttachments.length > 0) {
        userContent += currentAttachments
          .map((f) => `\n\n--- Attached file: ${f.name} ---\n${f.content}`)
          .join("");
      }

      return { displayText, userContent, cmd, currentAttachments };
    },
    [selectedText, attachedFiles],
  );

  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isLoading) return;

      const { displayText, userContent, cmd, currentAttachments } = prepareMessage(messageText);

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: displayText,
          timestamp: Date.now(),
          attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
        },
      ]);
      setInput("");
      setAttachedFiles([]);
      setIsLoading(true);

      if (!hasKey) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Please configure your API key in Settings.",
            timestamp: Date.now(),
          },
        ]);
        setIsLoading(false);
        return;
      }

      try {
        const { system, context } = buildSystemPrompt(cmd);
        const apiMessages = [
          ...messages
            .filter((m) => m.role !== "assistant" || messages.indexOf(m) !== 0)
            .slice(-6)
            .map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: userContent + context },
        ];
        const reply =
          selectedModel === "consensus"
            ? await callConsensus(apiMessages, system)
            : await callSingleProvider(apiMessages, system);
        setMessages((prev) => [...prev, reply]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Error: Could not reach the AI service.",
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
      buildSystemPrompt,
      selectedModel,
      prepareMessage,
      callConsensus,
      callSingleProvider,
    ],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
    if (e.key === "Escape") setShowCommands(false);
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    setShowCommands(val === "/");
  };

  const insertCommand = (cmd: string) => {
    setInput(`${cmd} `);
    setShowCommands(false);
    inputRef.current?.focus();
  };

  const toggleConsensusDetail = (timestamp: number) => {
    setExpandedConsensus((prev) => ({ ...prev, [timestamp]: !prev[timestamp] }));
  };

  return (
    <div
      className="flex flex-col h-full bg-gray-950/50"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header with Model Selector */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800/60 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-sm">✨</span>
          <span className="text-xs font-semibold text-white">AI Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Model Selector Dropdown */}
          {hasKey && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowModelDropdown((v) => !v)}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-700/60 bg-gray-800/60 hover:bg-gray-700/60 transition-colors text-gray-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="truncate max-w-[100px]">
                  {selectedModel === "auto" ? "Auto" : activeModel?.label || selectedModel}
                </span>
                <ChevronDownIcon className="w-3 h-3 text-gray-500 flex-shrink-0" />
              </button>

              {showModelDropdown && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-gray-900 border border-gray-700/60 rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="px-3 py-1.5 text-xs text-gray-500 border-b border-gray-800/60 font-medium">
                    Select Model
                  </div>
                  {/* Auto option */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedModel("auto");
                      setShowModelDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-800/80 transition-colors ${
                      selectedModel === "auto" ? "bg-amber-500/10 text-amber-300" : "text-gray-300"
                    }`}
                  >
                    <span className="text-sm w-5 text-center">⚡</span>
                    <span className="flex-1 text-left">Auto (Best Available)</span>
                    {selectedModel === "auto" && <span className="text-amber-400 text-xs">✓</span>}
                  </button>

                  <div className="border-t border-gray-800/40" />

                  {/* Provider options */}
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
          )}
          {!hasKey && (
            <a href="/settings" className="text-xs text-gray-500 hover:text-amber-400">
              Configure API key
            </a>
          )}
        </div>
      </div>

      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-40 bg-amber-500/10 border-2 border-dashed border-amber-500/50 rounded-lg flex items-center justify-center">
          <div className="text-amber-300 text-sm font-medium">Drop files here</div>
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
              className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-amber-500/15 text-amber-200 border border-amber-500/20"
                  : "bg-gray-800/60 text-gray-300 border border-gray-700/40"
              }`}
            >
              {/* Attachment badges for user messages */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {msg.attachments.map((f) => (
                    <span
                      key={f.name}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs"
                    >
                      <PaperclipIcon className="w-3 h-3" />
                      {f.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Provider badge for assistant messages */}
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
                    <ChevronRightIcon
                      className={`w-3 h-3 transition-transform ${expandedConsensus[msg.timestamp] ? "rotate-90" : ""}`}
                    />
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
                          <div className="text-xs text-gray-400 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                            {r.error ? r.error : r.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {msg.role === "assistant" && msg.timestamp !== messages[0]?.timestamp && (
                <div className="flex gap-2 mt-2 pt-1 border-t border-gray-700/30">
                  {onInsertText && (
                    <button
                      type="button"
                      onClick={() => onInsertText(msg.content)}
                      className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
                    >
                      Insert
                    </button>
                  )}
                  {onReplaceSelection && selectedText && (
                    <button
                      type="button"
                      onClick={() => onReplaceSelection(msg.content)}
                      className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
                    >
                      Replace Selection
                    </button>
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
            <div className="bg-gray-800/60 border border-gray-700/40 rounded-lg px-3 py-2 text-sm text-gray-400">
              <span className="animate-pulse text-xs">
                {selectedModel === "consensus" ? "Querying all models..." : "Thinking..."}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Slash command dropdown */}
      {showCommands && (
        <div className="mx-3 mb-1 bg-gray-900 border border-gray-700/60 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
          {SLASH_COMMANDS.map((cmd) => (
            <button
              type="button"
              key={cmd.cmd}
              onClick={() => insertCommand(cmd.cmd)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-amber-500/10 hover:text-amber-300 transition-colors"
            >
              <span className="text-sm">{cmd.icon}</span>
              <span className="font-mono text-amber-400 text-xs">{cmd.cmd}</span>
              <span className="text-gray-500 text-xs ml-auto">{cmd.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Attached files chips */}
      {attachedFiles.length > 0 && (
        <div className="mx-3 mb-1 flex flex-wrap gap-1">
          {attachedFiles.map((f, i) => (
            <span
              key={`${f.name}-${i}`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs border border-amber-500/20"
            >
              <PaperclipIcon className="w-3 h-3" />
              {f.name}
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

      {/* Input */}
      <div className="p-3 border-t border-gray-800/60 flex-shrink-0">
        <div className="flex gap-2">
          {/* File attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!hasKey}
            className="self-end p-2 text-gray-500 hover:text-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Attach file (.pdf, .docx, .txt, .md, .tex, .csv)"
          >
            <PaperclipIcon className="w-4 h-4" />
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
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              hasKey ? "Ask AI... (type / for commands)" : "Configure API key in Settings..."
            }
            className="input resize-none text-xs flex-1"
            rows={2}
            disabled={!hasKey}
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim() || !hasKey}
            className="btn-primary text-xs px-3 self-end disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
