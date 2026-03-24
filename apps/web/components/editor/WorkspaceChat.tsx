"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getChatMemory, type ChatMessage, type ChatSession } from "@/lib/chatMemory";

interface WorkspaceChatProps {
  projectId?: string;
  onInsertText?: (text: string) => void;
}

export default function WorkspaceChat({ projectId, onInsertText }: WorkspaceChatProps) {
  const memory = getChatMemory();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const allSessions = memory.listSessions();
    setSessions(allSessions);
    if (allSessions.length > 0) {
      setActiveSessionId(allSessions[0].id);
    }
  }, []);

  const activeSession = activeSessionId ? memory.getSession(activeSessionId) : null;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages.length, scrollToBottom]);

  const handleNewChat = useCallback(() => {
    const session = memory.createSession(projectId);
    setSessions(memory.listSessions());
    setActiveSessionId(session.id);
  }, [memory, projectId]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    let sid = activeSessionId;
    if (!sid) {
      const session = memory.createSession(projectId);
      sid = session.id;
      setActiveSessionId(sid);
    }
    memory.addMessage(sid, { role: "user", content: input.trim() });
    setInput("");
    setSessions(memory.listSessions());
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: memory.getSession(sid)?.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      const data = await res.json();
      const reply = data.content || data.message || "No response.";
      memory.addMessage(sid, { role: "assistant", content: reply });
    } catch {
      memory.addMessage(sid, { role: "assistant", content: "Error: could not reach AI." });
    } finally {
      setIsLoading(false);
      setSessions(memory.listSessions());
    }
  }, [input, isLoading, activeSessionId, memory, projectId]);

  const handleDelete = useCallback(
    (id: string) => {
      memory.deleteSession(id);
      const updated = memory.listSessions();
      setSessions(updated);
      if (activeSessionId === id) {
        setActiveSessionId(updated[0]?.id || null);
      }
    },
    [memory, activeSessionId],
  );

  return (
    <div className="flex h-full bg-gray-950 text-gray-200">
      {/* Sidebar */}
      <div className="w-56 border-r border-gray-800 flex flex-col">
        <button
          type="button"
          onClick={handleNewChat}
          className="m-2 px-3 py-1.5 text-xs bg-amber-600 hover:bg-amber-500 text-white rounded"
        >
          + New Chat
        </button>
        <div className="flex-1 overflow-y-auto">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`flex items-center px-2 py-1.5 text-xs cursor-pointer hover:bg-gray-800 ${
                s.id === activeSessionId ? "bg-gray-800 border-l-2 border-amber-500" : ""
              }`}
            >
              <button
                type="button"
                className="flex-1 text-left truncate"
                onClick={() => setActiveSessionId(s.id)}
              >
                {s.title}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(s.id)}
                className="ml-1 text-gray-600 hover:text-red-400 text-xs"
              >
                x
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {activeSession?.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                  msg.role === "user"
                    ? "bg-amber-600/20 text-amber-100"
                    : "bg-gray-800 text-gray-200"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.role === "assistant" && onInsertText && (
                  <button
                    type="button"
                    onClick={() => onInsertText(msg.content)}
                    className="mt-1 text-[10px] text-teal-400 hover:text-teal-300"
                  >
                    Insert into editor
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="text-xs text-gray-500 animate-pulse">Thinking...</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-800 p-2 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about your research..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-3 py-1.5 text-xs bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
