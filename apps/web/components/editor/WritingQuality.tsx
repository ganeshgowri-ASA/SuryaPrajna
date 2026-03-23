"use client";

import { useMemo } from "react";

interface WritingQualityProps {
  content: string;
  wordCountGoal?: number;
}

interface QualityMetrics {
  readability: number; // 0-100
  avgSentenceLength: number;
  avgWordLength: number;
  passiveVoiceCount: number;
  adverbCount: number;
  complexWordCount: number;
  spellingIssues: SpellingIssue[];
  grammarIssues: GrammarIssue[];
}

interface SpellingIssue {
  word: string;
  line: number;
  suggestion?: string;
}

interface GrammarIssue {
  text: string;
  line: number;
  message: string;
  type: "grammar" | "style" | "clarity";
}

// Common misspellings in academic writing
const COMMON_MISSPELLINGS: Record<string, string> = {
  teh: "the",
  recieve: "receive",
  occured: "occurred",
  seperate: "separate",
  definately: "definitely",
  occurence: "occurrence",
  accomodate: "accommodate",
  apparant: "apparent",
  calender: "calendar",
  concensus: "consensus",
  enviroment: "environment",
  flourescent: "fluorescent",
  guage: "gauge",
  harrass: "harass",
  innoculate: "inoculate",
  millenium: "millennium",
  neccessary: "necessary",
  occurrance: "occurrence",
  persistant: "persistent",
  preceed: "precede",
  priviledge: "privilege",
  recomend: "recommend",
  refered: "referred",
  relevent: "relevant",
  seize: "seize",
  supercede: "supersede",
  threshhold: "threshold",
  untill: "until",
  wierd: "weird",
  yeild: "yield",
  photovoltiac: "photovoltaic",
  effeciency: "efficiency",
  irradience: "irradiance",
  temperture: "temperature",
  degredation: "degradation",
  crystaline: "crystalline",
  amorphus: "amorphous",
};

// Passive voice indicators
const PASSIVE_INDICATORS = [
  /\b(is|are|was|were|been|being)\s+(being\s+)?\w+ed\b/gi,
  /\b(is|are|was|were|been|being)\s+(being\s+)?\w+en\b/gi,
];

// Wordy phrases
const WORDY_PHRASES: [RegExp, string][] = [
  [/\bin order to\b/gi, "to"],
  [/\bdue to the fact that\b/gi, "because"],
  [/\bat this point in time\b/gi, "now"],
  [/\bin the event that\b/gi, "if"],
  [/\bhas the ability to\b/gi, "can"],
  [/\bit is important to note that\b/gi, "(omit)"],
  [/\ba large number of\b/gi, "many"],
  [/\bin spite of the fact that\b/gi, "although"],
  [/\bfor the purpose of\b/gi, "to"],
  [/\bwith regard to\b/gi, "regarding"],
];

function computeMetrics(content: string): QualityMetrics {
  const lines = content.split("\n");
  const textLines = lines.filter(
    (l) =>
      l.trim() &&
      !l.startsWith("#") &&
      !l.startsWith("\\") &&
      !l.startsWith("|") &&
      !l.startsWith("```"),
  );
  const text = textLines.join(" ");
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
  const avgWordLength =
    words.length > 0
      ? words.reduce((sum, w) => sum + w.replace(/[^a-zA-Z]/g, "").length, 0) / words.length
      : 0;

  // Flesch-Kincaid readability (simplified)
  const syllableCount = words.reduce((sum, w) => {
    const cleaned = w.replace(/[^a-zA-Z]/g, "").toLowerCase();
    if (cleaned.length <= 3) return sum + 1;
    const vowels = cleaned.match(/[aeiouy]+/g) || [];
    return sum + Math.max(1, vowels.length);
  }, 0);

  const readability =
    words.length > 0 && sentences.length > 0
      ? Math.max(
          0,
          Math.min(
            100,
            206.835 -
              1.015 * (words.length / sentences.length) -
              84.6 * (syllableCount / words.length),
          ),
        )
      : 0;

  // Passive voice
  let passiveVoiceCount = 0;
  for (const pattern of PASSIVE_INDICATORS) {
    const matches = text.match(pattern);
    if (matches) passiveVoiceCount += matches.length;
  }

  // Adverbs (words ending in -ly)
  const adverbCount = words.filter((w) => /\w{4,}ly$/i.test(w)).length;

  // Complex words (3+ syllables)
  const complexWordCount = words.filter((w) => {
    const cleaned = w.replace(/[^a-zA-Z]/g, "").toLowerCase();
    if (cleaned.length <= 4) return false;
    const vowels = cleaned.match(/[aeiouy]+/g) || [];
    return vowels.length >= 3;
  }).length;

  // Spelling
  const spellingIssues: SpellingIssue[] = [];
  lines.forEach((line, i) => {
    const lineWords = line.split(/\s+/);
    for (const w of lineWords) {
      const lower = w.replace(/[^a-zA-Z]/g, "").toLowerCase();
      if (COMMON_MISSPELLINGS[lower]) {
        spellingIssues.push({
          word: lower,
          line: i + 1,
          suggestion: COMMON_MISSPELLINGS[lower],
        });
      }
    }
  });

  // Grammar/style issues
  const grammarIssues: GrammarIssue[] = [];
  lines.forEach((line, i) => {
    for (const [pattern, suggestion] of WORDY_PHRASES) {
      if (pattern.test(line)) {
        grammarIssues.push({
          text: line.match(pattern)?.[0] || "",
          line: i + 1,
          message: `Consider replacing with "${suggestion}"`,
          type: "style",
        });
      }
    }
    // Double space
    if (/ {2,}/.test(line) && !line.startsWith("|")) {
      grammarIssues.push({
        text: "  ",
        line: i + 1,
        message: "Extra whitespace detected",
        type: "grammar",
      });
    }
  });

  return {
    readability: Math.round(readability),
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    avgWordLength: Math.round(avgWordLength * 10) / 10,
    passiveVoiceCount,
    adverbCount,
    complexWordCount,
    spellingIssues,
    grammarIssues,
  };
}

function getReadabilityLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Easy", color: "text-emerald-400" };
  if (score >= 60) return { label: "Standard", color: "text-blue-400" };
  if (score >= 40) return { label: "Academic", color: "text-amber-400" };
  if (score >= 20) return { label: "Complex", color: "text-orange-400" };
  return { label: "Very Complex", color: "text-red-400" };
}

export default function WritingQuality({ content, wordCountGoal }: WritingQualityProps) {
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const metrics = useMemo(() => computeMetrics(content), [content]);
  const readabilityInfo = getReadabilityLabel(metrics.readability);
  const goalProgress = wordCountGoal ? Math.min(100, (wordCount / wordCountGoal) * 100) : null;

  const totalIssues = metrics.spellingIssues.length + metrics.grammarIssues.length;

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-gray-800/60 flex-shrink-0">
        <span className="text-xs font-semibold text-white">Writing Quality</span>
      </div>

      <div className="flex-1 overflow-auto min-h-0 p-3 space-y-4">
        {/* Readability score */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Readability</span>
            <span className={`text-xs font-medium ${readabilityInfo.color}`}>
              {metrics.readability}/100 {readabilityInfo.label}
            </span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 transition-all"
              style={{ width: `${metrics.readability}%` }}
            />
          </div>
        </div>

        {/* Word count goal */}
        {goalProgress !== null && wordCountGoal && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Word Count Goal</span>
              <span className="text-xs text-gray-300">
                {wordCount.toLocaleString()} / {wordCountGoal.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  goalProgress >= 100 ? "bg-emerald-500" : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(100, goalProgress)}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-800/30 rounded p-2">
            <p className="text-xs text-gray-500">Avg sentence</p>
            <p
              className={`text-sm font-medium ${metrics.avgSentenceLength > 25 ? "text-amber-400" : "text-gray-300"}`}
            >
              {metrics.avgSentenceLength} words
            </p>
          </div>
          <div className="bg-gray-800/30 rounded p-2">
            <p className="text-xs text-gray-500">Avg word length</p>
            <p className="text-sm font-medium text-gray-300">{metrics.avgWordLength} chars</p>
          </div>
          <div className="bg-gray-800/30 rounded p-2">
            <p className="text-xs text-gray-500">Passive voice</p>
            <p
              className={`text-sm font-medium ${metrics.passiveVoiceCount > 5 ? "text-amber-400" : "text-gray-300"}`}
            >
              {metrics.passiveVoiceCount}
            </p>
          </div>
          <div className="bg-gray-800/30 rounded p-2">
            <p className="text-xs text-gray-500">Adverbs</p>
            <p
              className={`text-sm font-medium ${metrics.adverbCount > 10 ? "text-amber-400" : "text-gray-300"}`}
            >
              {metrics.adverbCount}
            </p>
          </div>
        </div>

        {/* Issues */}
        {totalIssues > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 mb-2">Issues ({totalIssues})</h4>
            <div className="space-y-1 max-h-48 overflow-auto">
              {metrics.spellingIssues.map((issue) => (
                <div
                  key={`spell-${issue.line}-${issue.word}`}
                  className="flex items-center gap-2 px-2 py-1 bg-red-500/5 rounded text-xs"
                >
                  <span className="text-red-400 flex-shrink-0">~</span>
                  <span className="text-gray-500 font-mono w-8">L{issue.line}</span>
                  <span className="text-red-300 line-through">{issue.word}</span>
                  {issue.suggestion && (
                    <span className="text-emerald-400">→ {issue.suggestion}</span>
                  )}
                </div>
              ))}
              {metrics.grammarIssues.map((issue) => (
                <div
                  key={`gram-${issue.line}-${issue.text}`}
                  className="flex items-center gap-2 px-2 py-1 bg-blue-500/5 rounded text-xs"
                >
                  <span
                    className={`flex-shrink-0 ${issue.type === "grammar" ? "text-blue-400" : "text-amber-400"}`}
                  >
                    {issue.type === "grammar" ? "G" : "S"}
                  </span>
                  <span className="text-gray-500 font-mono w-8">L{issue.line}</span>
                  <span className="text-gray-300 truncate">{issue.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalIssues === 0 && wordCount > 0 && (
          <div className="text-center py-2">
            <span className="text-xs text-emerald-500">No issues detected</span>
          </div>
        )}
      </div>
    </div>
  );
}
