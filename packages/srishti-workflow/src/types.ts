/**
 * Core type definitions for the Srishti workflow engine.
 *
 * Srishti (Sanskrit: "creation") orchestrates PV domain agents
 * through wave-based task decomposition and multi-step workflows.
 */

// ---------------------------------------------------------------------------
// Agent types
// ---------------------------------------------------------------------------

/** Domains recognized by the PV agent ecosystem. */
export type AgentDomain =
  | "pv-materials"
  | "pv-cell-module"
  | "pv-testing"
  | "pv-reliability"
  | "pv-energy"
  | "pv-finance"
  | "pv-plant-design"
  | "pv-power-systems"
  | "cross-cutting";

/** Definition of a single PV domain agent parsed from AGENTS.md. */
export interface AgentDefinition {
  /** Unique identifier, e.g. "dravya-agent". */
  id: string;
  /** Display name, e.g. "Dravya-Agent". */
  name: string;
  /** Sanskrit meaning, e.g. "substance, material". */
  sanskritMeaning: string;
  /** Role description, e.g. "Materials Science". */
  role: string;
  /** Domain tag used for routing. */
  domain: AgentDomain;
  /** Free-text capability descriptions. */
  capabilities: string[];
  /** Skill identifiers the agent can invoke. */
  skills: string[];
}

// ---------------------------------------------------------------------------
// Routing types
// ---------------------------------------------------------------------------

/** Result of intent classification for a user query. */
export interface RouteResult {
  /** The agent best matching the query intent. */
  agentId: string;
  /** Confidence score between 0 and 1. */
  confidence: number;
  /** Domains that matched, ordered by relevance. */
  matchedDomains: AgentDomain[];
  /** Keywords from the query that contributed to matching. */
  matchedKeywords: string[];
}

/** Configuration for the intent router. */
export interface RouterConfig {
  /** Minimum confidence to accept a route (0-1). Default 0.1 */
  minConfidence: number;
  /** Maximum number of candidate agents returned. Default 3 */
  maxCandidates: number;
}

// ---------------------------------------------------------------------------
// Workflow types
// ---------------------------------------------------------------------------

/** Status of a workflow step or wave. */
export type StepStatus = "pending" | "running" | "completed" | "failed" | "skipped";

/** A single executable step within a wave. */
export interface WorkflowStep {
  /** Unique step identifier. */
  id: string;
  /** Agent to execute this step. */
  agentId: string;
  /** Human-readable description of the task. */
  description: string;
  /** Skill to invoke (optional — agent may decide). */
  skillId?: string;
  /** Input parameters for the step. */
  params: Record<string, unknown>;
  /** Current execution status. */
  status: StepStatus;
  /** Output produced by the step, if completed. */
  output?: Record<string, unknown>;
  /** Error message if the step failed. */
  error?: string;
  /** IDs of steps this step depends on (must complete first). */
  dependsOn: string[];
}

/**
 * A wave groups steps that can run in parallel.
 * Waves execute sequentially; steps within a wave execute concurrently.
 */
export interface Wave {
  /** Zero-based wave index. */
  index: number;
  /** Steps to execute in this wave (all in parallel). */
  steps: WorkflowStep[];
  /** Overall wave status derived from step statuses. */
  status: StepStatus;
}

/** Complete workflow definition. */
export interface WorkflowDefinition {
  /** Unique workflow identifier (UUID). */
  id: string;
  /** Human-readable name. */
  name: string;
  /** Original user query that spawned this workflow. */
  query: string;
  /** Ordered waves of execution. */
  waves: Wave[];
  /** Overall workflow status. */
  status: StepStatus;
  /** Timestamp when the workflow was created (ISO 8601). */
  createdAt: string;
  /** Timestamp of last status change (ISO 8601). */
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Session types
// ---------------------------------------------------------------------------

/** Context that flows between agents across steps. */
export interface AgentContext {
  /** Accumulated key-value data shared across agents. */
  data: Record<string, unknown>;
  /** Ordered log of messages exchanged. */
  messages: ContextMessage[];
}

/** A single message in the agent context log. */
export interface ContextMessage {
  /** Which agent sent the message. */
  agentId: string;
  /** Role in the conversation. */
  role: "user" | "agent" | "system";
  /** Message content. */
  content: string;
  /** ISO 8601 timestamp. */
  timestamp: string;
}

/** A user session encompassing one or more workflows. */
export interface Session {
  /** Unique session identifier (UUID). */
  id: string;
  /** Workflows executed within this session. */
  workflows: WorkflowDefinition[];
  /** Shared context that persists across workflows in the session. */
  context: AgentContext;
  /** ISO 8601 creation timestamp. */
  createdAt: string;
  /** ISO 8601 last-activity timestamp. */
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Engine types
// ---------------------------------------------------------------------------

/**
 * Handler function that an agent executor must implement.
 * Receives the step definition and current context, returns output data.
 */
export type AgentExecutor = (
  step: WorkflowStep,
  context: AgentContext,
) => Promise<Record<string, unknown>>;

/** Configuration for the Srishti workflow engine. */
export interface EngineConfig {
  /** Path to AGENTS.md file for auto-discovery. */
  agentsMdPath: string;
  /** Router configuration overrides. */
  router?: Partial<RouterConfig>;
  /** Maximum concurrent steps within a wave. Default 5 */
  maxConcurrency: number;
  /** Step execution timeout in milliseconds. Default 300_000 (5 min) */
  stepTimeoutMs: number;
}

/** Predefined workflow template for common multi-step tasks. */
export interface WorkflowTemplate {
  /** Template identifier. */
  id: string;
  /** Human-readable name. */
  name: string;
  /** Description of what this template does. */
  description: string;
  /** Keywords that trigger this template. */
  triggerKeywords: string[];
  /** Ordered agent IDs forming the workflow pipeline. */
  pipeline: string[];
  /** Step descriptions corresponding to each pipeline entry. */
  stepDescriptions: string[];
}
