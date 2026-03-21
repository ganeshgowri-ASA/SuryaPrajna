/**
 * @suryaprajna/srishti-workflow
 *
 * Workflow orchestration engine for PV domain agents.
 * Srishti (Sanskrit: "creation") supports intent routing, multi-step workflows,
 * wave-based task decomposition, and session state management.
 *
 * @example
 * ```ts
 * import { SrishtiEngine, createWorkflow, runAgent, getSkill } from "@suryaprajna/srishti-workflow";
 *
 * const engine = new SrishtiEngine({ agentsMdPath: "./AGENTS.md" });
 * await engine.initialize();
 *
 * // Quick run — creates session, builds workflow, and executes
 * const { session, workflow } = await engine.run("design a 10MW ground-mount plant");
 * ```
 */

// Core engine
export { SrishtiEngine } from "./engine";

// Subsystems
export { AgentRegistry } from "./agent-registry";
export { IntentRouter } from "./router";
export { SessionManager } from "./session";

// Workflow utilities
export {
  createWorkflowFromPipeline,
  createWorkflowFromTemplate,
  executeWorkflow,
  matchTemplate,
  WORKFLOW_TEMPLATES,
} from "./workflow";

// All types
export type {
  AgentDomain,
  AgentDefinition,
  RouteResult,
  RouterConfig,
  StepStatus,
  WorkflowStep,
  Wave,
  WorkflowDefinition,
  AgentContext,
  ContextMessage,
  Session,
  AgentExecutor,
  EngineConfig,
  WorkflowTemplate,
} from "./types";

// ---------------------------------------------------------------------------
// Convenience factory functions (top-level API)
// ---------------------------------------------------------------------------

import { SrishtiEngine } from "./engine";
import type {
  AgentDefinition,
  EngineConfig,
  RouteResult,
  WorkflowDefinition,
  Session,
} from "./types";

/**
 * Create and initialize a SrishtiEngine in one call.
 *
 * @param config Partial engine configuration.
 * @returns An initialized engine ready for use.
 *
 * @example
 * ```ts
 * const engine = await createWorkflow({ agentsMdPath: "./AGENTS.md" });
 * const result = await engine.run("calculate LCOE for a 5MW plant");
 * ```
 */
export async function createWorkflow(
  config?: Partial<EngineConfig>,
): Promise<SrishtiEngine> {
  const engine = new SrishtiEngine(config);
  await engine.initialize();
  return engine;
}

/**
 * Route a query to the best agent and execute it within a new session.
 * This is a shorthand that creates an engine, initializes it, and runs the query.
 *
 * @param agentsMdPath Path to the AGENTS.md file.
 * @param query The user query to process.
 * @returns The session and completed workflow.
 *
 * @example
 * ```ts
 * const { session, workflow } = await runAgent("./AGENTS.md", "analyze I-V curves");
 * ```
 */
export async function runAgent(
  agentsMdPath: string,
  query: string,
): Promise<{ session: Session; workflow: WorkflowDefinition }> {
  const engine = new SrishtiEngine({ agentsMdPath });
  await engine.initialize();
  engine.registerAllPassthroughExecutors();
  return engine.run(query);
}

/**
 * Look up which agent(s) provide a given skill.
 *
 * @param agentsMdPath Path to the AGENTS.md file.
 * @param skillId The skill identifier to search for.
 * @returns Object with the skillId and matching agents, or undefined.
 *
 * @example
 * ```ts
 * const result = await getSkill("./AGENTS.md", "iv-curve-modeler");
 * // result?.agents[0].name → "Shakti-Agent"
 * ```
 */
export async function getSkill(
  agentsMdPath: string,
  skillId: string,
): Promise<{ skillId: string; agents: AgentDefinition[] } | undefined> {
  const engine = new SrishtiEngine({ agentsMdPath });
  await engine.initialize();
  return engine.getSkill(skillId);
}
