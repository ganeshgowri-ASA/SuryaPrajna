"use client";

import { useState, useEffect } from "react";
import { getChatMemory } from "@/lib/chatMemory";
import type { ChatSession } from "@/lib/chatMemory";

interface ChatHistoryProps {
  onSelectSession: (session: ChatSession) => void;
  onNewChat: () => void;
  activeSessionId?: string;
}

export default function ChatHistory({ onSelectSession, onNewChat, activeSessionId }: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const memory = getChatMemory();
    setSessions(memory.listSessions());
  }, [activeSessionId]);

  const filteredSessions = searchQuery
    ? getChatMemory().searchSessions(searchQuery)
    : sessions;

  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    getChatMemory().deleteSession(sessionId);
    setSessions(getChatMemory().listSessions());
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 transition-colors"
        title="Chat History"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        History ({sessions.length})
      </button>
    );
  }

  return (
    <div className="absolute top-0 left-0 w-80 h-full bg-zinc-900 border-r border-zinc-700 z-50 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-zinc-700">
        <h3 className="text-sm font-semibold text-zinc-200">Chat History</h3>
        <div className="flex gap-2">
          <button
            onClick={() => { onNewChat(); setIsOpen(false); }}
            className="px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 rounded text-white"
          >
            + New
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded text-zinc-300"
          >
            Close
          </button>
        </div>
      </div>

      <div className="p-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search conversations..."
          className="w-full px-3 py-1.5 text-sm bg-zinc-800 border border-zinc-600 rounded text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredSessions.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-8">No conversations yet</p>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => { onSelectSession(session); setIsOpen(false); }}
              className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-zinc-800 border-b border-zinc-800 ${
                session.id === activeSessionId ? "bg-zinc-800 border-l-2 border-l-emerald-500" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-200 truncate">{session.title}</p>
                <p className="text-xs text-zinc-500">
                  {session.messages.length} messages &middot; {formatDate(session.updatedAt)}
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(e, session.id)}
                className="ml-2 p-1 text-zinc-500 hover:text-red-400 rounded"
                title="Delete session"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
