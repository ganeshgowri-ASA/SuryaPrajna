"use client";

import { useState } from "react";

interface Session {
  id: string;
  name: string;
  timestamp: Date;
  messageCount: number;
}

interface SessionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onNewSession: () => void;
  onExportSession: () => void;
}

export default function SessionManager({ isOpen, onClose, onNewSession, onExportSession }: SessionManagerProps) {
  const [sessions] = useState<Session[]>([
    { id: "current", name: "Current Session", timestamp: new Date(), messageCount: 0 },
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md mx-4 p-6 border-gray-700/60">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Sessions</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors text-lg">x</button>
        </div>

        <div className="space-y-2 mb-4">
          {sessions.map((session) => (
            <div key={session.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-800/40 border border-gray-700/30">
              <div>
                <div className="text-sm text-white">{session.name}</div>
                <div className="text-xs text-gray-500">
                  {session.timestamp.toLocaleDateString()} &middot; {session.messageCount} messages
                </div>
              </div>
              {session.id === "current" && (
                <span className="badge-available text-xs">Active</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={() => { onNewSession(); onClose(); }} className="btn-primary flex-1 text-sm justify-center">
            New Session
          </button>
          <button onClick={() => { onExportSession(); onClose(); }} className="btn-secondary flex-1 text-sm justify-center">
            Export as Markdown
          </button>
        </div>
      </div>
    </div>
  );
}
