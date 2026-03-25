"use client";
import { useState, useMemo } from "react";
import {
  ClaimResult,
  ClaimAnalysisReport,
  ClaimCategory,
  getCategoryConfig,
  analyzeClaims,
} from "../../lib/claimAnalyzer";

interface ClaimConfidencePanelProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  bibContent: string;
  apiKey: string;
  aiModel: string;
  onNavigateToLine?: (line: number) => void;
  onApplyFix?: (lineNumber: number, fix: string) => void;
}

const FILTER_OPTIONS: { key: ClaimCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unsupported", label: "Unsupported" },
  { key: "overstated", label: "Overstated" },
  { key: "contradicted", label: "Contradicted" },
  { key: "misrepresented", label: "Misrepresented" },
  { key: "unverifiable", label: "Unverifiable" },
  { key: "supported", label: "Supported" },
];

export default function ClaimConfidencePanel({
  isOpen,
  onClose,
  content,
  bibContent,
  apiKey,
  aiModel,
  onNavigateToLine,
  onApplyFix,
}: ClaimConfidencePanelProps) {
  const [report, setReport] = useState<ClaimAnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filter, setFilter] = useState<ClaimCategory | "all">("all");
  const [results, setResults] = useState<ClaimResult[]>([]);

  const filteredResults = useMemo(() => {
    if (filter === "all") return results;
    return results.filter((r) => r.category === filter);
  }, [results, filter]);

  const runReview = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeClaims(content, bibContent, apiKey, aiModel);
      setReport(analysis);
      setResults(analysis.results);
    } catch (e) {
      console.error("Claim analysis failed:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAccept = (id: string) => {
    setResults((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          if (r.suggestedFix && onApplyFix) {
            onApplyFix(r.lineNumber, r.suggestedFix);
          }
          return { ...r, status: "accepted" as const };
        }
        return r;
      })
    );
  };

  const handleReject = (id: string) => {
    setResults((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" as const } : r))
    );
  };

  if (!isOpen) return null;

  const scoreColor =
    (report?.overallScore ?? 0) >= 80
      ? "#22c55e"
      : (report?.overallScore ?? 0) >= 50
        ? "#f97316"
        : "#ef4444";

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-gray-900/95 border-l border-gray-700 shadow-2xl z-50 flex flex-col backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">\ud83d\udee1\ufe0f</span>
          <h2 className="text-sm font-bold text-amber-300">Claim Confidence</h2>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-lg">\u00d7</button>
      </div>

      {/* Score Summary */}
      {report && (
        <div className="px-4 py-3 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">
              {report.totalClaims} claims analyzed, {report.issuesFound} issues
            </span>
            <span
              className="text-2xl font-bold"
              style={{ color: scoreColor }}
            >
              {report.overallScore}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${report.overallScore}%`,
                backgroundColor: scoreColor,
              }}
            />
          </div>
        </div>
      )}

      {/* Run Review Button */}
      {!report && (
        <div className="px-4 py-6 flex flex-col items-center gap-3">
          <p className="text-xs text-gray-400 text-center">
            Scan your document to verify claims against cited sources.
            {!apiKey && " (Heuristic mode - add API key for AI analysis)"}
          </p>
          <button
            onClick={runReview}
            disabled={isAnalyzing}
            className="px-6 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-sm font-medium hover:bg-amber-500/30 transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? "Analyzing..." : "Run Review"}
          </button>
        </div>
      )}

      {/* Analyzing Progress */}
      {isAnalyzing && (
        <div className="px-4 py-6 flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-xs text-gray-400">Analyzing claims...</p>
        </div>
      )}

      {/* Filter Tabs */}
      {report && !isAnalyzing && (
        <div className="px-2 py-2 border-b border-gray-800 flex flex-wrap gap-1">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                filter === f.key
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "text-gray-500 hover:text-gray-300 border border-transparent"
              }`}
            >
              {f.label}
              {f.key !== "all" && (
                <span className="ml-1 opacity-60">
                  ({results.filter((r) => r.category === f.key).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Results List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {filteredResults.map((result) => {
          const config = getCategoryConfig(result.category);
          return (
            <div
              key={result.id}
              className={`p-3 rounded-lg border transition-all cursor-pointer hover:border-gray-600 ${
                result.status === "accepted"
                  ? "border-green-800/30 bg-green-900/10 opacity-60"
                  : result.status === "rejected"
                    ? "border-gray-800 bg-gray-900/30 opacity-40"
                    : "border-gray-800 bg-gray-900/30"
              }`}
              onClick={() => onNavigateToLine?.(result.lineNumber)}
            >
              {/* Category Badge + Line */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor: config.color + "20",
                    color: config.color,
                    border: `1px solid ${config.color}30`,
                  }}
                >
                  {config.icon} {config.label}
                </span>
                <span className="text-xs text-gray-500">Line {result.lineNumber}</span>
              </div>

              {/* Claim Text */}
              <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                {result.claimText}
              </p>

              {/* Explanation */}
              <p className="text-xs text-gray-500 mt-1 italic">
                {result.explanation}
              </p>

              {/* Confidence */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1 bg-gray-800 rounded-full">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${result.confidence}%`,
                      backgroundColor: config.color,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500">{result.confidence}%</span>
              </div>

              {/* Suggested Fix */}
              {result.suggestedFix && result.status === "pending" && (
                <div className="mt-2 p-2 bg-gray-800/50 rounded text-xs">
                  <span className="text-gray-500">Suggested: </span>
                  <span className="text-green-400">{result.suggestedFix}</span>
                </div>
              )}

              {/* Accept/Reject */}
              {result.status === "pending" && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAccept(result.id);
                    }}
                    className="flex-1 px-2 py-1 bg-green-900/30 text-green-400 border border-green-800/30 rounded text-xs hover:bg-green-900/50"
                  >
                    Accept
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(result.id);
                    }}
                    className="flex-1 px-2 py-1 bg-gray-800 text-gray-400 border border-gray-700 rounded text-xs hover:bg-gray-700"
                  >
                    Reject
                  </button>
                </div>
              )}

              {/* Status Badge */}
              {result.status !== "pending" && (
                <div className="mt-2 text-xs text-gray-600">
                  {result.status === "accepted" ? "\u2713 Accepted" : "\u2717 Rejected"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {report && (
        <div className="px-4 py-2 border-t border-gray-800 flex justify-between">
          <button
            onClick={() => {
              setReport(null);
              setResults([]);
              setFilter("all");
            }}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            Re-scan
          </button>
          <span className="text-xs text-gray-600">
            {results.filter((r) => r.status === "accepted").length} accepted,{" "}
            {results.filter((r) => r.status === "rejected").length} rejected
          </span>
        </div>
      )}
    </div>
  );
}
