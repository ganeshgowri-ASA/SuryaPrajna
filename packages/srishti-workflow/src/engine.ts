/**
 * SrishtiEngine — main workflow orchestration engine for PV domain agents.
 *
 * Srishti (Sanskrit: "creation") ties together agent discovery, intent routing,
 * session management, and wave-based workflow execution into a single API surface.
 *
 * Usage:
 *   const engine = new SrishtiEngine({ agentsMdPath: "./AGENTS.md" });
 *   await engine.initialize();
 *
 *   const session = engine.createSession();
 *   const result = await engine.run(session.id, "design a 10MW ground-mount plant");
 */

import {
  AgentContext,
  AgentDefinition,
  AgentExecutor,
  EngineConfig,
  RouteResult,
  WorkflowDefinition,
  WorkflowStep,
  WorkflowTemplate,
  Session,
} from "./types";
import { AgentRegistry } from "./agent-registry";
import { IntentRouter } from "./router";
import { SessionManager } from "./session";
import {
  createWorkflowFromPipeline,
  createWorkflowFromTemplate,
  executeWorkflow,
  matchTemplate,
  WORKFLOW_TEMPLATES,
} from "./workflow";

/** Default engine configuration. */
const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  agentsMdPath: "./AGENTS.md",
  maxConcurrency: 5,
  stepTimeoutMs: 300_000,
};

/**
 * Central orchestration engine that ties together all Srishti subsystems.
 */
export class SrishtiEngine {
  private config: EngineConfig;
  private registry: AgentRegistry;
  private router: IntentRouter;
  private sessionManager: SessionManager;
  private executors: Map<string, AgentExecutor> = new Map();
  private initialized = false;

  constructor(config?: Partial<EngineConfig>) {
    this.config = { ...DEFAULT_ENGINE_CONFIG, ...config };
    this.registry = new AgentRegistry();
    this.router = new IntentRouter(this.registry, this.config.router);
    this.sessionManager = new SessionManager();
  }

  // -------------------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------------------

  /**
   * Initialize the engine by loading agent definitions from AGENTS.md.
   * Must be called before any other operations.
   */
  async initialize(): Promise<void> {
    await this.registry.loadFromFile(this.config.agentsMdPath);
    this.initialized = true;
  }

  /**
   * Initialize synchronously (loads AGENTS.md using readFileSync).
   */
  initializeSync(): void {
    this.registry.loadFromFileSync(this.config.agentsMdPath);
    this.initialized = true;
  }

  // -------------------------------------------------------------------------
  // Agent management
  // -------------------------------------------------------------------------

  /**
   * Register an executor function for a given agent.
   * The executor is called when a workflow step targets that agent.
   */
  registerExecutor(agentId: string, executor: AgentExecutor): void {
    this.executors.set(agentId.toLowerCase(), executor);
  }

  /**
   * Register a default passthrough executor that echoes inputs as outputs.
   * Useful for testing or when agents are not yet implemented.
   */
  registerPassthroughExecutor(agentId: string): void {
    this.executors.set(agentId.toLowerCase(), async (step: WorkflowStep) => ({
      agentId: step.agentId,
      description: step.description,
      status: "completed",
      params: step.params,
      message: `[${step.agentId}] Passthrough executed: ${step.description}`,
    }));
  }

  /**
   * Register passthrough executors for all discovered agents.
   * Convenient for development/testing when real executors are unavailable.
   */
  registerAllPassthroughExecutors(): void {
    for (const agent of this.registry.getAll()) {
      if (!this.executors.has(agent.id.toLowerCase())) {
        this.registerPassthroughExecutor(agent.id);
      }
    }
  }

  /** Get the agent registry for direct queries. */
  getRegistry(): AgentRegistry {
    return this.registry;
  }

  /** Get an agent definition by ID. */
  getAgent(agentId: string): AgentDefinition | undefined {
    this.ensureInitialized();
    return this.registry.get(agentId);
  }

  /** List all discovered agents. */
  listAgents(): AgentDefinition[] {
    this.ensureInitialized();
    return this.registry.getAll();
  }

  // -------------------------------------------------------------------------
  // Routing
  // -------------------------------------------------------------------------

  /**
   * Route a user query to candidate agents.
   * Returns ranked results with confidence scores.
   */
  route(query: string): RouteResult[] {
    this.ensureInitialized();
    return this.router.route(query);
  }

  /**
   * Route a query and return only the best matching agent.
   */
  routeBest(query: string): RouteResult | undefined {
    this.ensureInitialized();
    return this.router.routeBest(query);
  }

  // -------------------------------------------------------------------------
  // Session management
  // -------------------------------------------------------------------------

  /** Create a new session and return it. */
  createSession(): Session {
    return this.sessionManager.createSession();
  }

  /** Retrieve a session by ID. */
  getSession(sessionId: string): Session | undefined {
    return this.sessionManager.getSession(sessionId);
  }

  /** Get the session manager for advanced operations. */
  getSessionManager(): SessionManager {
    return this.sessionManager;
  }

  // -------------------------------------------------------------------------
  // Workflow creation
  // -------------------------------------------------------------------------

  /**
   * Create a workflow definition by analyzing a user query.
   *
   * Strategy:
   * 1. Try to match a predefined workflow template.
   * 2. If no template matches, route to the best agent for a single-step workflow.
   * 3. Returns the workflow definition (not yet executed).
   */
  createWorkflow(
    query: string,
    params?: Record<string, unknown>,
  ): WorkflowDefinition {
    this.ensureInitialized();

    // 1. Try template matching
    const template = matchTemplate(query);
    if (template) {
      return createWorkflowFromTemplate(template, query, params);
    }

    // 2. Fall back to single-agent routing
    const bestRoute = this.router.routeBest(query);
    if (!bestRoute) {
      // No agent matched — create a workflow targeting the orchestrator
      return createWorkflowFromPipeline(
        "Unrouted Query",
        query,
        [
          {
            agentId: "surya-orchestrator",
            description: `Process query: ${query}`,
            params: params ?? {},
          },
        ],
      );
    }

    return createWorkflowFromPipeline(
      `${bestRoute.agentId} task`,
      query,
      [
        {
          agentId: bestRoute.agentId,
          description: `Process query: ${query}`,
          params: params ?? {},
        },
      ],
    );
  }

  /**
   * Create a workflow from a specific template ID.
   * Throws if the template is not found.
   */
  createWorkflowFromTemplate(
    templateId: string,
    query: string,
    params?: Record<string, unknown>,
  ): WorkflowDefinition {
    const template = WORKFLOW_TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      throw new Error(`Workflow template not found: ${templateId}`);
    }
    return createWorkflowFromTemplate(template, query, params);
  }

  /**
   * Create a custom workflow from explicit pipeline steps.
   */
  createCustomWorkflow(
    name: string,
    query: string,
    pipeline: Array<{
      agentId: string;
      description: string;
      skillId?: string;
      params?: Record<string, unknown>;
    }>,
  ): WorkflowDefinition {
    return createWorkflowFromPipeline(name, query, pipeline);
  }

  /** List available workflow templates. */
  listTemplates(): WorkflowTemplate[] {
    return WORKFLOW_TEMPLATES;
  }

  // -------------------------------------------------------------------------
  // Workflow execution
  // -------------------------------------------------------------------------

  /**
   * Execute a workflow within a session.
   *
   * The workflow is attached to the session, and the session's shared context
   * is used for data passing between steps.
   *
   * @param sessionId ID of the session.
   * @param workflow  The workflow definition to execute.
   * @returns The completed workflow definition.
   */
  async executeWorkflow(
    sessionId: string,
    workflow: WorkflowDefinition,
  ): Promise<WorkflowDefinition> {
    this.ensureInitialized();
    this.sessionManager.addWorkflow(sessionId, workflow);

    const context = this.sessionManager.createStepContext(sessionId);

    // Log the start
    this.sessionManager.addMessage(
      sessionId,
      "surya-orchestrator",
      "system",
      `Starting workflow "${workflow.name}" with ${workflow.waves.length} wave(s).`,
    );

    const result = await executeWorkflow(
      workflow,
      this.executors,
      context,
      {
        maxConcurrency: this.config.maxConcurrency,
        stepTimeoutMs: this.config.stepTimeoutMs,
      },
    );

    // Merge final context data back into session
    this.sessionManager.updateContextData(sessionId, context.data);

    // Log completion
    this.sessionManager.addMessage(
      sessionId,
      "surya-orchestrator",
      "system",
      `Workflow "${workflow.name}" ${result.status}. Executed ${
        workflow.waves.flatMap((w) => w.steps).length
      } step(s).`,
    );

    return result;
  }

  /**
   * Convenience method: create a session, build a workflow from a query,
   * and execute it. Returns both the session and the completed workflow.
   */
  async run(
    query: string,
    params?: Record<string, unknown>,
  ): Promise<{ session: Session; workflow: WorkflowDefinition }> {
    this.ensureInitialized();

    const session = this.createSession();
    this.sessionManager.addMessage(
      session.id,
      "surya-orchestrator",
      "user",
      query,
    );

    const workflow = this.createWorkflow(query, params);
    const completed = await this.executeWorkflow(session.id, workflow);

    return {
      session: this.sessionManager.getSession(session.id)!,
      workflow: completed,
    };
  }

  /**
   * Run a workflow within an existing session.
   */
  async runInSession(
    sessionId: string,
    query: string,
    params?: Record<string, unknown>,
  ): Promise<WorkflowDefinition> {
    this.ensureInitialized();

    this.sessionManager.addMessage(
      sessionId,
      "surya-orchestrator",
      "user",
      query,
    );

    const workflow = this.createWorkflow(query, params);
    return this.executeWorkflow(sessionId, workflow);
  }

  // -------------------------------------------------------------------------
  // Skill lookup
  // -------------------------------------------------------------------------

  /**
   * Find which agent(s) provide a given skill.
   */
  getSkill(
    skillId: string,
  ): { skillId: string; agents: AgentDefinition[] } | undefined {
    this.ensureInitialized();
    const agents = this.registry.getBySkill(skillId);
    if (agents.length === 0) return undefined;
    return { skillId, agents };
  }

  /**
   * List all skills across all agents.
   */
  listSkills(): Array<{ skillId: string; agentId: string; agentName: string }> {
    this.ensureInitialized();
    const skills: Array<{ skillId: string; agentId: string; agentName: string }> = [];
    for (const agent of this.registry.getAll()) {
      for (const skillId of agent.skills) {
        skills.push({
          skillId,
          agentId: agent.id,
          agentName: agent.name,
        });
      }
    }
    return skills;
  }

  // -------------------------------------------------------------------------
  // Internal
  // -------------------------------------------------------------------------

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        "SrishtiEngine not initialized. Call initialize() or initializeSync() first.",
      );
    }
  }
}
