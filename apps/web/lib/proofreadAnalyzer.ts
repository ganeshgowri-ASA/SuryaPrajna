// proofreadAnalyzer.ts - Grammar, Style & Academic Writing Coach
// Jenni.ai-inspired proofread engine for SuryaPrajna

export type IssueCategory =
  | 'grammar'
  | 'spelling'
  | 'style'
  | 'clarity'
  | 'academic'
  | 'passive_voice'
  | 'wordiness';

export type IssueSeverity = 'error' | 'warning' | 'suggestion';

export interface ProofreadIssue {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  message: string;
  suggestion: string;
  startIndex: number;
  endIndex: number;
  originalText: string;
  replacementText?: string;
}

export interface ProofreadResult {
  issues: ProofreadIssue[];
  score: number; // 0-100
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  passiveVoiceCount: number;
  readabilityGrade: string;
  summary: string;
}

// Grammar patterns
const GRAMMAR_PATTERNS: Array<{ pattern: RegExp; message: string; suggestion: string; category: IssueCategory; severity: IssueSeverity }> = [
  {
    pattern: /\b(their|there|they're)\b/gi,
    message: 'Check usage of their/there/they\'re',
    suggestion: 'Verify correct form: "their" (possessive), "there" (location), "they\'re" (they are)',
    category: 'grammar',
    severity: 'warning',
  },
  {
    pattern: /\b(its|it's)\b/gi,
    message: 'Check usage of its/it\'s',
    suggestion: '"its" is possessive; "it\'s" means "it is"',
    category: 'grammar',
    severity: 'warning',
  },
  {
    pattern: /\b(your|you're)\b/gi,
    message: 'Check usage of your/you\'re',
    suggestion: '"your" is possessive; "you\'re" means "you are"',
    category: 'grammar',
    severity: 'warning',
  },
  {
    pattern: /\ba\s+[aeiou]/gi,
    message: 'Possible article error: "a" before vowel sound',
    suggestion: 'Use "an" before words starting with a vowel sound',
    category: 'grammar',
    severity: 'error',
  },
];

// Style patterns
const STYLE_PATTERNS: Array<{ pattern: RegExp; message: string; suggestion: string; category: IssueCategory; severity: IssueSeverity }> = [
  {
    pattern: /\b(very|really|quite|rather|somewhat)\s+\w+/gi,
    message: 'Weak intensifier detected',
    suggestion: 'Replace weak intensifiers with stronger, more precise words',
    category: 'style',
    severity: 'suggestion',
  },
  {
    pattern: /\b(thing|stuff|a lot|things)\b/gi,
    message: 'Vague language detected',
    suggestion: 'Use more specific and precise terminology',
    category: 'clarity',
    severity: 'suggestion',
  },
  {
    pattern: /\b(in order to|due to the fact that|in the event that)\b/gi,
    message: 'Wordy phrase detected',
    suggestion: 'Simplify: "in order to" → "to"; "due to the fact that" → "because"',
    category: 'wordiness',
    severity: 'suggestion',
  },
];

// Academic writing patterns
const ACADEMIC_PATTERNS: Array<{ pattern: RegExp; message: string; suggestion: string; category: IssueCategory; severity: IssueSeverity }> = [
  {
    pattern: /\bI think\b|\bI believe\b|\bI feel\b/gi,
    message: 'First-person opinion phrase in academic text',
    suggestion: 'Consider more objective phrasing: "The evidence suggests..." or "It appears that..."',
    category: 'academic',
    severity: 'suggestion',
  },
  {
    pattern: /\bdon't\b|\bcan't\b|\bwon't\b|\bisn't\b|\baren't\b/gi,
    message: 'Contraction in academic writing',
    suggestion: 'Expand contractions in formal academic writing',
    category: 'academic',
    severity: 'warning',
  },
  {
    pattern: /!!+/g,
    message: 'Multiple exclamation marks inappropriate in academic writing',
    suggestion: 'Use a single exclamation mark or rephrase for formal tone',
    category: 'academic',
    severity: 'warning',
  },
];

// Passive voice detection (simplified)
const PASSIVE_VOICE_PATTERN = /\b(is|are|was|were|be|been|being)\s+(\w+ed|\w+en)\b/gi;

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countSentences(text: string): number {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
}

function calculateReadabilityGrade(avgWordsPerSentence: number, wordCount: number): string {
  // Simplified Flesch-Kincaid-like grade
  if (avgWordsPerSentence <= 10 && wordCount < 200) return 'Easy (Grade 6-8)';
  if (avgWordsPerSentence <= 15) return 'Moderate (Grade 9-11)';
  if (avgWordsPerSentence <= 20) return 'Academic (Grade 12-14)';
  return 'Advanced (Graduate Level)';
}

function calculateScore(issues: ProofreadIssue[], wordCount: number): number {
  if (wordCount === 0) return 100;
  const errorPenalty = issues.filter(i => i.severity === 'error').length * 10;
  const warningPenalty = issues.filter(i => i.severity === 'warning').length * 5;
  const suggestionPenalty = issues.filter(i => i.severity === 'suggestion').length * 2;
  const totalPenalty = errorPenalty + warningPenalty + suggestionPenalty;
  return Math.max(0, Math.min(100, 100 - totalPenalty));
}

export function analyzeText(text: string): ProofreadResult {
  const issues: ProofreadIssue[] = [];
  const allPatterns = [...GRAMMAR_PATTERNS, ...STYLE_PATTERNS, ...ACADEMIC_PATTERNS];

  for (const { pattern, message, suggestion, category, severity } of allPatterns) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      issues.push({
        id: generateId(),
        category,
        severity,
        message,
        suggestion,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        originalText: match[0],
      });
    }
  }

  // Passive voice
  const passiveMatches = [...text.matchAll(new RegExp(PASSIVE_VOICE_PATTERN.source, 'gi'))];
  for (const match of passiveMatches) {
    if (match.index !== undefined) {
      issues.push({
        id: generateId(),
        category: 'passive_voice',
        severity: 'suggestion',
        message: 'Passive voice construction',
        suggestion: 'Consider using active voice for stronger, clearer writing',
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        originalText: match[0],
      });
    }
  }

  const wordCount = countWords(text);
  const sentenceCount = countSentences(text);
  const avgWordsPerSentence = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0;
  const passiveVoiceCount = passiveMatches.length;
  const score = calculateScore(issues, wordCount);
  const readabilityGrade = calculateReadabilityGrade(avgWordsPerSentence, wordCount);

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const suggestionCount = issues.filter(i => i.severity === 'suggestion').length;

  let summary = '';
  if (issues.length === 0) {
    summary = 'Excellent! No issues found.';
  } else {
    summary = `Found ${issues.length} issue${issues.length > 1 ? 's' : ''}: ${errorCount} error${errorCount !== 1 ? 's' : ''}, ${warningCount} warning${warningCount !== 1 ? 's' : ''}, ${suggestionCount} suggestion${suggestionCount !== 1 ? 's' : ''}.`;
  }

  return {
    issues,
    score,
    wordCount,
    sentenceCount,
    avgWordsPerSentence,
    passiveVoiceCount,
    readabilityGrade,
    summary,
  };
}

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  grammar: 'Grammar',
  spelling: 'Spelling',
  style: 'Style',
  clarity: 'Clarity',
  academic: 'Academic',
  passive_voice: 'Passive Voice',
  wordiness: 'Wordiness',
};

export const CATEGORY_COLORS: Record<IssueCategory, string> = {
  grammar: '#ef4444',
  spelling: '#f97316',
  style: '#8b5cf6',
  clarity: '#06b6d4',
  academic: '#3b82f6',
  passive_voice: '#f59e0b',
  wordiness: '#10b981',
};
