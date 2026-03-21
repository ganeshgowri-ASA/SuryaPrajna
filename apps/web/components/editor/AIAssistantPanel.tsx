"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface AIAssistantPanelProps {
  documentContent: string;
  selectedText?: string;
  onInsertText?: (text: string) => void;
  onReplaceSelection?: (text: string) => void;
  settings: {
    anthropicKey: string;
    openaiKey: string;
    perplexityKey: string;
  };
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

export default function AIAssistantPanel({
  documentContent,
  selectedText,
  onInsertText,
  onReplaceSelection,
  settings,
}: AIAssistantPanelProps) {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasKey = !!(settings.anthropicKey || settings.openaiKey);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildSystemPrompt = useCallback(
    (cmd?: string) => {
      const base =
        "You are a scientific writing assistant for photovoltaic (PV) research. You help with writing, editing, citations, and analysis of solar energy papers.";
      const docContext = documentContent.length > 3000
        ? documentContent.slice(0, 3000) + "\n...(truncated)"
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
    [documentContent]
  );

  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isLoading) return;

      const isCommand = messageText.startsWith("/");
      let displayText = messageText;
      let userContent = messageText;
      let cmd: string | undefined;

      if (isCommand) {
        cmd = messageText.split(" ")[0];
        const matchedCmd = SLASH_COMMANDS.find((c) => c.cmd === cmd);
        if (matchedCmd) {
          displayText = `${matchedCmd.icon} ${matchedCmd.label}`;
          const extra = messageText.slice(cmd.length).trim();
          userContent = extra
            ? `${matchedCmd.label}: ${extra}`
            : matchedCmd.label;
        }
      }

      if (selectedText && (cmd === "/rewrite" || cmd === "/expand" || cmd === "/proofread")) {
        userContent += `\n\nSelected text:\n${selectedText}`;
      }

      const userMessage: Message = {
        role: "user",
        content: displayText,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      if (!hasKey) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Please configure your API key (Anthropic or OpenAI) in Settings to use AI features.",
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

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-anthropic-key": settings.anthropicKey,
            "x-openai-key": settings.openaiKey,
          },
          body: JSON.stringify({
            messages: apiMessages,
            systemPrompt: system,
          }),
        });

        const data = await res.json();
        if (data.error) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Error: ${data.error}`,
              timestamp: Date.now(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: data.content || "No response received.",
              timestamp: Date.now(),
            },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Error: Could not reach the AI service. Please check your connection and API key.",
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, hasKey, messages, settings, selectedText, buildSystemPrompt]
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
    setInput(cmd + " ");
    setShowCommands(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-gray-950/50">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800/60 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-sm">✨</span>
          <span className="text-xs font-semibold text-white">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          {hasKey ? (
            <span className="text-xs text-emerald-500">Connected</span>
          ) : (
            <span className="text-xs text-gray-600">No API key</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-3 space-y-3 min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-amber-500/15 text-amber-200 border border-amber-500/20"
                  : "bg-gray-800/60 text-gray-300 border border-gray-700/40"
              }`}
            >
              <div className="whitespace-pre-wrap break-words text-xs leading-relaxed">
                {msg.content}
              </div>
              {msg.role === "assistant" && i > 0 && (
                <div className="flex gap-2 mt-2 pt-1 border-t border-gray-700/30">
                  {onInsertText && (
                    <button
                      onClick={() => onInsertText(msg.content)}
                      className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
                    >
                      Insert
                    </button>
                  )}
                  {onReplaceSelection && selectedText && (
                    <button
                      onClick={() => onReplaceSelection(msg.content)}
                      className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
                    >
                      Replace Selection
                    </button>
                  )}
                  <button
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
              <span className="animate-pulse text-xs">Thinking...</span>
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

      {/* Input */}
      <div className="p-3 border-t border-gray-800/60 flex-shrink-0">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasKey ? "Ask AI... (type / for commands)" : "Configure API key in Settings..."}
            className="input resize-none text-xs flex-1"
            rows={2}
            disabled={!hasKey}
          />
          <button
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
