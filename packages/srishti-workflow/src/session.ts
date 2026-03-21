/**
 * SessionManager — manages session state and context passing between agents.
 *
 * Sessions persist across multiple workflows within a single user interaction,
 * allowing agents to share data and build on previous results.
 */

import {
  Session,
  AgentContext,
  ContextMessage,
  WorkflowDefinition,
} from "./types";

/** Generate a simple UUID v4-like identifier. */
function generateId(): string {
  const hex = "0123456789abcdef";
  const segments = [8, 4, 4, 4, 12];
  return segments
    .map((len) =>
      Array.from({ length: len }, () =>
        hex[Math.floor(Math.random() * 16)],
      ).join(""),
    )
    .join("-");
}

/**
 * In-memory session store with context management.
 *
 * Each session holds an AgentContext that accumulates shared data
 * and a message log as agents execute workflow steps.
 */
export class SessionManager {
  private sessions: Map<string, Session> = new Map();

  /** Create a new session and return its ID. */
  createSession(): Session {
    const now = new Date().toISOString();
    const session: Session = {
      id: generateId(),
      workflows: [],
      context: {
        data: {},
        messages: [],
      },
      createdAt: now,
      updatedAt: now,
    };
    this.sessions.set(session.id, session);
    return session;
  }

  /** Retrieve a session by ID. Returns undefined if not found. */
  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  /** List all active session IDs. */
  listSessions(): string[] {
    return Array.from(this.sessions.keys());
  }

  /** Delete a session. Returns true if the session existed. */
  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Attach a workflow definition to a session.
   * The workflow is added to the session's workflow list.
   */
  addWorkflow(sessionId: string, workflow: WorkflowDefinition): void {
    const session = this.requireSession(sessionId);
    session.workflows.push(workflow);
    session.updatedAt = new Date().toISOString();
  }

  /**
   * Get the shared context for a session.
   * This is the context that flows between agents across steps.
   */
  getContext(sessionId: string): AgentContext {
    const session = this.requireSession(sessionId);
    return session.context;
  }

  /**
   * Merge new data into the session context.
   * Existing keys are overwritten by incoming values (shallow merge).
   */
  updateContextData(
    sessionId: string,
    data: Record<string, unknown>,
  ): void {
    const session = this.requireSession(sessionId);
    session.context.data = { ...session.context.data, ...data };
    session.updatedAt = new Date().toISOString();
  }

  /**
   * Append a message to the session context log.
   */
  addMessage(
    sessionId: string,
    agentId: string,
    role: ContextMessage["role"],
    content: string,
  ): void {
    const session = this.requireSession(sessionId);
    session.context.messages.push({
      agentId,
      role,
      content,
      timestamp: new Date().toISOString(),
    });
    session.updatedAt = new Date().toISOString();
  }

  /**
   * Get messages filtered by agent ID.
   */
  getMessagesByAgent(
    sessionId: string,
    agentId: string,
  ): ContextMessage[] {
    const session = this.requireSession(sessionId);
    return session.context.messages.filter((m) => m.agentId === agentId);
  }

  /**
   * Create a scoped context snapshot for a specific workflow step.
   * This is a shallow copy so that step execution does not mutate
   * the session context directly — use updateContextData() afterward.
   */
  createStepContext(sessionId: string): AgentContext {
    const session = this.requireSession(sessionId);
    return {
      data: { ...session.context.data },
      messages: [...session.context.messages],
    };
  }

  /**
   * Clear all data and messages from a session context,
   * useful for resetting between unrelated workflows.
   */
  clearContext(sessionId: string): void {
    const session = this.requireSession(sessionId);
    session.context = { data: {}, messages: [] };
    session.updatedAt = new Date().toISOString();
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  private requireSession(sessionId: string): Session {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    return session;
  }
}
