'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  analyzeText,
  type ProofreadResult,
  type ProofreadIssue,
  type IssueCategory,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '@/lib/proofreadAnalyzer';

interface ProofreadPanelProps {
  content: string;
  onClose: () => void;
}

const SEVERITY_CONFIG = {
  error: { label: 'Error', bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
  warning: { label: 'Warning', bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
  suggestion: { label: 'Suggestion', bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
};

function ScoreRing({ score }: { score: number }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative flex items-center justify-center" style={{ width: 84, height: 84 }}>
      <svg width="84" height="84" className="-rotate-90">
        <circle cx="42" cy="42" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle
          cx="42" cy="42" r={radius} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <span className="absolute text-lg font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

function IssueCard({ issue }: { issue: ProofreadIssue }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[issue.severity];
  const catColor = CATEGORY_COLORS[issue.category];

  return (
    <div
      className={`${cfg.bg} border-l-4 ${cfg.border} rounded-r-lg p-3 mb-2 cursor-pointer hover:opacity-90 transition-opacity`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: catColor + '22', color: catColor }}
            >
              {CATEGORY_LABELS[issue.category]}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.badge}`}>
              {cfg.label}
            </span>
          </div>
          <p className={`text-sm font-medium ${cfg.text}`}>{issue.message}</p>
          <p className="text-xs text-gray-500 mt-0.5 font-mono truncate">
            &ldquo;{issue.originalText}&rdquo;
          </p>
        </div>
        <span className="text-gray-400 text-xs mt-1">{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-700">
            <span className="font-semibold">Suggestion:</span> {issue.suggestion}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ProofreadPanel({ content, onClose }: ProofreadPanelProps) {
  const [result, setResult] = useState<ProofreadResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<IssueCategory | 'all'>('all');
  const [activeSeverity, setActiveSeverity] = useState<'all' | 'error' | 'warning' | 'suggestion'>('all');
  const analysisRef = useRef<number>(0);

  const runAnalysis = useCallback(() => {
    setIsAnalyzing(true);
    const id = ++analysisRef.current;
    setTimeout(() => {
      if (id !== analysisRef.current) return;
      const res = analyzeText(content);
      setResult(res);
      setIsAnalyzing(false);
    }, 600);
  }, [content]);

  const filteredIssues = result?.issues.filter(issue => {
    const catMatch = activeFilter === 'all' || issue.category === activeFilter;
    const sevMatch = activeSeverity === 'all' || issue.severity === activeSeverity;
    return catMatch && sevMatch;
  }) ?? [];

  const categories = result
    ? ([...new Set(result.issues.map(i => i.category))] as IssueCategory[])
    : [];

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200" style={{ width: 360, minWidth: 320 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center gap-2">
          <span className="text-lg">✍️</span>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Proofread</h2>
            <p className="text-xs text-gray-500">Grammar, Style & Academic Coach</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
      </div>

      {/* Analyze button */}
      {!result && !isAnalyzing && (
        <div className="flex flex-col items-center justify-center p-8 gap-4">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-2xl">🔍</span>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">Ready to analyze</p>
            <p className="text-xs text-gray-500 mt-1">Check grammar, style & academic writing quality</p>
          </div>
          <button
            onClick={runAnalysis}
            disabled={!content.trim()}
            className="px-6 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Analyze Writing
          </button>
        </div>
      )}

      {/* Loading */}
      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center p-8 gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Analyzing your writing...</p>
        </div>
      )}

      {/* Results */}
      {result && !isAnalyzing && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Score summary */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-4">
              <ScoreRing score={result.score} />
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">Writing Score</p>
                <p className="text-xs text-gray-500 mt-0.5">{result.summary}</p>
                <div className="flex gap-3 mt-2 text-xs">
                  <span className="text-red-600 font-medium">{result.issues.filter(i => i.severity === 'error').length} errors</span>
                  <span className="text-yellow-600 font-medium">{result.issues.filter(i => i.severity === 'warning').length} warnings</span>
                  <span className="text-blue-600 font-medium">{result.issues.filter(i => i.severity === 'suggestion').length} suggestions</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[
                { label: 'Words', value: result.wordCount },
                { label: 'Sentences', value: result.sentenceCount },
                { label: 'Avg/Sentence', value: result.avgWordsPerSentence },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded p-2 text-center border border-gray-100">
                  <p className="text-base font-bold text-gray-800">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-2 p-2 bg-white rounded border border-gray-100">
              <p className="text-xs text-gray-500">Readability: <span className="font-semibold text-gray-700">{result.readabilityGrade}</span></p>
              {result.passiveVoiceCount > 0 && (
                <p className="text-xs text-amber-600 mt-0.5">{result.passiveVoiceCount} passive voice instance{result.passiveVoiceCount !== 1 ? 's' : ''} detected</p>
              )}
            </div>
          </div>

          {/* Filters */}
          {result.issues.length > 0 && (
            <div className="px-3 py-2 border-b border-gray-100 space-y-1.5">
              <div className="flex gap-1 flex-wrap">
                {(['all', 'error', 'warning', 'suggestion'] as const).map(sev => (
                  <button
                    key={sev}
                    onClick={() => setActiveSeverity(sev)}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                      activeSeverity === sev
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {sev === 'all' ? 'All' : SEVERITY_CONFIG[sev].label}
                  </button>
                ))}
              </div>
              {categories.length > 1 && (
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                      activeFilter === 'all'
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveFilter(cat)}
                      className={`text-xs px-2 py-0.5 rounded-full border transition-colors`}
                      style={{
                        background: activeFilter === cat ? CATEGORY_COLORS[cat] : 'white',
                        color: activeFilter === cat ? 'white' : CATEGORY_COLORS[cat],
                        borderColor: CATEGORY_COLORS[cat],
                      }}
                    >
                      {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Issue list */}
          <div className="flex-1 overflow-y-auto p-3">
            {filteredIssues.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-3xl">✅</span>
                <p className="text-sm text-gray-500 mt-2">
                  {result.issues.length === 0
                    ? 'No issues found! Great writing.'
                    : 'No issues match the current filter.'}
                </p>
              </div>
            ) : (
              filteredIssues.map(issue => <IssueCard key={issue.id} issue={issue} />)
            )}
          </div>

          {/* Re-analyze */}
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={runAnalysis}
              className="w-full py-2 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
            >
              Re-analyze
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
