"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface AIAssistantPanelProps {
  documentContent: string;
  onInsertText?: (text: string) => void;
}

const SLASH_COMMANDS = [
  { cmd: "/review", label: "Review section for clarity", icon: "🔍" },
  { cmd: "/cite", label: "Find and insert citations", icon: "📚" },
  { cmd: "/rewrite", label: "Rewrite selected text", icon: "✏️" },
  { cmd: "/expand", label: "Expand on selected topic", icon: "📖" },
  { cmd: "/summarize", label: "Summarize current section", icon: "📋" },
  { cmd: "/equations", label: "Help write LaTeX equations", icon: "🧮" },
  { cmd: "/outline", label: "Generate document outline", icon: "📑" },
  { cmd: "/abstract", label: "Generate abstract from content", icon: "📝" },
];

export default function AIAssistantPanel({
  documentContent,
  onInsertText,
}: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "I'm your PV research writing assistant. I can help review, rewrite, expand, and cite your work. Type `/` to see available commands.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSlashCommand = useCallback(
    (cmd: string) => {
      const docSnippet =
        documentContent.length > 2000
          ? documentContent.slice(0, 2000) + "\n...(truncated)"
          : documentContent;

      const commandPrompts: Record<string, string> = {
        "/review": `Please review the following research text for clarity, grammar, scientific accuracy, and structure. Provide specific suggestions:\n\n${docSnippet}`,
        "/cite": `Based on the following text, suggest relevant citations and references that should be included. Format as BibTeX entries where possible:\n\n${docSnippet}`,
        "/rewrite": `Please rewrite the following text to improve clarity, flow, and scientific rigor while maintaining the original meaning:\n\n${docSnippet}`,
        "/expand": `Please expand on the key topics in the following text with additional technical details, supporting evidence, and analysis:\n\n${docSnippet}`,
        "/summarize": `Please provide a concise summary of the following text:\n\n${docSnippet}`,
        "/equations": `Based on the following text, help write relevant LaTeX equations that should be included:\n\n${docSnippet}`,
        "/outline": `Based on the following text, generate a detailed document outline with suggested sections and subsections:\n\n${docSnippet}`,
        "/abstract": `Based on the following content, generate a concise academic abstract (150-250 words) following standard structure (background, methods, results, conclusions):\n\n${docSnippet}`,
      };

      return commandPrompts[cmd] || docSnippet;
    },
    [documentContent]
  );

  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isLoading) return;

      const isCommand = messageText.startsWith("/");
      let displayText = messageText;
      let apiMessage = messageText;

      if (isCommand) {
        const cmd = messageText.split(" ")[0];
        const matchedCmd = SLASH_COMMANDS.find((c) => c.cmd === cmd);
        if (matchedCmd) {
          displayText = `${matchedCmd.icon} ${matchedCmd.label}`;
          apiMessage = handleSlashCommand(cmd);
        }
      }

      const userMessage: Message = {
        role: "user",
        content: displayText,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: apiMessage,
            agent: "Grantha-Agent",
          }),
        });
        const data = await res.json();
        const assistantMessage: Message = {
          role: "assistant",
          content: data.content || "No response received.",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Error: Could not reach the AI service. Please check your API configuration.",
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, handleSlashCommand]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
    if (e.key === "Escape") {
      setShowCommands(false);
    }
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
          <span className="text-amber-400 text-sm">📚</span>
          <span className="text-xs font-semibold text-white">
            Grantha AI Assistant
          </span>
        </div>
        <span className="text-xs text-gray-600">PV Research Writing</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-3 space-y-3 min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-amber-500/15 text-amber-200 border border-amber-500/20"
                  : "bg-gray-800/60 text-gray-300 border border-gray-700/40"
              }`}
            >
              <div className="whitespace-pre-wrap break-words">{msg.content}</div>
              {msg.role === "assistant" && onInsertText && (
                <button
                  onClick={() => onInsertText(msg.content)}
                  className="mt-2 text-xs text-amber-500 hover:text-amber-400 transition-colors"
                >
                  Insert into editor →
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/60 border border-gray-700/40 rounded-lg px-3 py-2 text-sm text-gray-400">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Slash command dropdown */}
      {showCommands && (
        <div className="mx-3 mb-1 bg-gray-900 border border-gray-700/60 rounded-lg overflow-hidden">
          {SLASH_COMMANDS.map((cmd) => (
            <button
              key={cmd.cmd}
              onClick={() => insertCommand(cmd.cmd)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-amber-500/10 hover:text-amber-300 transition-colors"
            >
              <span>{cmd.icon}</span>
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
            placeholder="Ask about your research... (type / for commands)"
            className="input resize-none text-sm flex-1"
            rows={2}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="btn-primary text-xs px-3 self-end disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
