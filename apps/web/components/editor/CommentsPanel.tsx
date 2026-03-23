"use client";

import { useCallback, useState } from "react";

export interface Comment {
  id: string;
  selectedText: string;
  comment: string;
  author: string;
  timestamp: number;
  resolved: boolean;
  line?: number;
}

interface CommentsPanelProps {
  comments: Comment[];
  onCommentsChange: (comments: Comment[]) => void;
  selectedText?: string;
  onNavigateToText?: (text: string) => void;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - ts;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function CommentsPanel({
  comments,
  onCommentsChange,
  selectedText,
  onNavigateToText,
}: CommentsPanelProps) {
  const [newComment, setNewComment] = useState("");
  const [showResolved, setShowResolved] = useState(false);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");

  const addComment = useCallback(() => {
    if (!newComment.trim() || !selectedText?.trim()) return;
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      selectedText: selectedText,
      comment: newComment.trim(),
      author: "You",
      timestamp: Date.now(),
      resolved: false,
    };
    onCommentsChange([...comments, comment]);
    setNewComment("");
  }, [newComment, selectedText, comments, onCommentsChange]);

  const toggleResolve = useCallback(
    (id: string) => {
      onCommentsChange(comments.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c)));
    },
    [comments, onCommentsChange],
  );

  const deleteComment = useCallback(
    (id: string) => {
      onCommentsChange(comments.filter((c) => c.id !== id));
    },
    [comments, onCommentsChange],
  );

  const filteredComments = comments.filter((c) => {
    if (filter === "open") return !c.resolved;
    if (filter === "resolved") return c.resolved;
    return showResolved || !c.resolved;
  });

  const openCount = comments.filter((c) => !c.resolved).length;
  const resolvedCount = comments.filter((c) => c.resolved).length;

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-gray-800/60 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-white">
            Comments ({openCount} open{resolvedCount > 0 ? `, ${resolvedCount} resolved` : ""})
          </span>
        </div>
        <div className="flex gap-1">
          {(["all", "open", "resolved"] as const).map((f) => (
            <button
              type="button"
              key={f}
              onClick={() => {
                setFilter(f);
                if (f === "resolved") setShowResolved(true);
              }}
              className={`px-2 py-0.5 rounded text-xs capitalize transition-colors ${
                filter === f
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Add comment */}
      {selectedText && (
        <div className="px-3 py-2 border-b border-gray-800/40 flex-shrink-0 bg-gray-900/30">
          <p className="text-xs text-gray-500 mb-1 truncate">
            On: &ldquo;{selectedText.slice(0, 60)}
            {selectedText.length > 60 ? "..." : ""}&rdquo;
          </p>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addComment()}
              placeholder="Add a comment..."
              className="flex-1 bg-gray-800/60 border border-gray-700/40 rounded px-2 py-1 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/40"
            />
            <button
              type="button"
              onClick={addComment}
              disabled={!newComment.trim()}
              className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs hover:bg-amber-500/30 disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Comments list */}
      <div className="flex-1 overflow-auto min-h-0">
        {filteredComments.length === 0 ? (
          <div className="p-4 text-center text-gray-600 text-xs">
            {comments.length === 0
              ? "No comments yet. Select text and add a comment."
              : "No matching comments."}
          </div>
        ) : (
          <div className="divide-y divide-gray-800/40">
            {filteredComments.map((c) => (
              <div key={c.id} className={`px-3 py-2 group ${c.resolved ? "opacity-60" : ""}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-300">{c.author}</span>
                    <span className="text-xs text-gray-700">{formatTime(c.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => toggleResolve(c.id)}
                      className={`text-xs px-1 ${
                        c.resolved
                          ? "text-amber-400 hover:text-amber-300"
                          : "text-emerald-500 hover:text-emerald-400"
                      }`}
                    >
                      {c.resolved ? "Reopen" : "Resolve"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteComment(c.id)}
                      className="text-xs text-gray-600 hover:text-red-400 px-1"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateToText?.(c.selectedText)}
                  className="text-xs text-amber-500/60 italic truncate block text-left w-full hover:text-amber-400"
                >
                  &ldquo;{c.selectedText.slice(0, 80)}
                  {c.selectedText.length > 80 ? "..." : ""}&rdquo;
                </button>
                <p className="text-xs text-gray-300 mt-1">{c.comment}</p>
                {c.resolved && (
                  <span className="text-xs text-emerald-600 mt-0.5 inline-block">Resolved</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
