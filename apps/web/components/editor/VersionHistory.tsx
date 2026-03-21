"use client";

import { useState, useMemo } from "react";
import { diffLines, Change } from "diff";

export interface Version {
  id: string;
  label: string;
  content: string;
  timestamp: number;
  auto: boolean;
}

interface VersionHistoryProps {
  versions: Version[];
  currentContent: string;
  onRestore: (version: Version) => void;
  onSaveManual: (label: string) => void;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - ts;

  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) +
    " " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function DiffView({
  oldContent,
  newContent,
}: {
  oldContent: string;
  newContent: string;
}) {
  const changes = useMemo(
    () => diffLines(oldContent, newContent),
    [oldContent, newContent]
  );

  return (
    <div className="text-xs font-mono overflow-auto max-h-60 bg-gray-900/60 rounded border border-gray-800/40 p-2">
      {changes.map((change: Change, i: number) => {
        const lines = change.value.split("\n").filter((l, idx, arr) =>
          idx < arr.length - 1 || l !== ""
        );
        return lines.map((line: string, j: number) => (
          <div
            key={`${i}-${j}`}
            className={`px-1 ${
              change.added
                ? "bg-emerald-500/10 text-emerald-400"
                : change.removed
                  ? "bg-red-500/10 text-red-400"
                  : "text-gray-500"
            }`}
          >
            <span className="select-none mr-2 text-gray-700">
              {change.added ? "+" : change.removed ? "-" : " "}
            </span>
            {line || " "}
          </div>
        ));
      })}
    </div>
  );
}

export default function VersionHistory({
  versions,
  currentContent,
  onRestore,
  onSaveManual,
}: VersionHistoryProps) {
  const [saveLabel, setSaveLabel] = useState("");
  const [compareId, setCompareId] = useState<string | null>(null);
  const [showSave, setShowSave] = useState(false);

  const compareVersion = versions.find((v) => v.id === compareId);

  const handleSave = () => {
    if (!saveLabel.trim()) return;
    onSaveManual(saveLabel.trim());
    setSaveLabel("");
    setShowSave(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-800/60 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white">
            Version History ({versions.length})
          </span>
          <button
            onClick={() => setShowSave(!showSave)}
            className="text-xs text-amber-400 hover:text-amber-300"
          >
            Save
          </button>
        </div>
      </div>

      {/* Manual save */}
      {showSave && (
        <div className="px-3 py-2 border-b border-gray-800/40 bg-gray-900/30 flex-shrink-0">
          <div className="flex gap-1.5">
            <input
              type="text"
              value={saveLabel}
              onChange={(e) => setSaveLabel(e.target.value)}
              placeholder="Version label..."
              className="input text-xs py-1 flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <button onClick={handleSave} className="btn-primary text-xs py-1 px-2">
              Save
            </button>
          </div>
        </div>
      )}

      {/* Diff view */}
      {compareVersion && (
        <div className="px-3 py-2 border-b border-gray-800/40 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">
              Comparing: {compareVersion.label}
            </span>
            <button
              onClick={() => setCompareId(null)}
              className="text-xs text-gray-600 hover:text-gray-400"
            >
              Close
            </button>
          </div>
          <DiffView
            oldContent={compareVersion.content}
            newContent={currentContent}
          />
        </div>
      )}

      {/* Version list */}
      <div className="flex-1 overflow-auto min-h-0">
        {versions.length === 0 ? (
          <div className="p-4 text-center text-gray-600 text-xs">
            No versions saved yet. Auto-saves happen every 5 minutes.
          </div>
        ) : (
          <div className="divide-y divide-gray-800/40">
            {[...versions].reverse().map((version) => (
              <div
                key={version.id}
                className="px-3 py-2 hover:bg-gray-800/30 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-medium ${
                          version.auto ? "text-gray-400" : "text-amber-300"
                        }`}
                      >
                        {version.label}
                      </span>
                      {version.auto && (
                        <span className="text-xs text-gray-700">auto</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-600">
                      {formatTime(version.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setCompareId(version.id)}
                      className="text-xs text-gray-500 hover:text-amber-400 px-1"
                    >
                      diff
                    </button>
                    <button
                      onClick={() => onRestore(version)}
                      className="text-xs text-gray-500 hover:text-emerald-400 px-1"
                    >
                      restore
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
