export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent?: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
}

const STORAGE_KEY = "suryaprajna_chat_sessions";
const MAX_SESSIONS = 50;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim().slice(0, 60);
  return trimmed.length < firstMessage.trim().length ? `${trimmed}...` : trimmed;
}

export class ChatMemoryStore {
  private sessions: ChatSession[] = [];

  constructor() {
    this.load();
  }

  private load(): void {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.sessions = parsed.map((s: ChatSession) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
          messages: s.messages.map((m: ChatMessage) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        }));
      }
    } catch {
      this.sessions = [];
    }
  }

  private save(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sessions));
    } catch {
      // Storage full - prune oldest
      this.pruneOldest();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sessions));
    }
  }

  private pruneOldest(): void {
    if (this.sessions.length > MAX_SESSIONS) {
      this.sessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      this.sessions = this.sessions.slice(0, MAX_SESSIONS);
    }
  }

  createSession(projectId?: string): ChatSession {
    const session: ChatSession = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId,
    };
    this.sessions.unshift(session);
    this.pruneOldest();
    this.save();
    return session;
  }

  addMessage(sessionId: string, message: Omit<ChatMessage, "id" | "timestamp">): ChatMessage {
    const session = this.sessions.find((s) => s.id === sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    const msg: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: new Date(),
    };
    session.messages.push(msg);
    session.updatedAt = new Date();
    if (session.messages.length === 1 && message.role === "user") {
      session.title = generateTitle(message.content);
    }
    this.save();
    return msg;
  }

  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.find((s) => s.id === sessionId);
  }

  listSessions(): ChatSession[] {
    return [...this.sessions].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  deleteSession(sessionId: string): void {
    this.sessions = this.sessions.filter((s) => s.id !== sessionId);
    this.save();
  }

  searchSessions(query: string): ChatSession[] {
    const q = query.toLowerCase();
    return this.sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }

  clearAll(): void {
    this.sessions = [];
    this.save();
  }
}

// Singleton instance
let instance: ChatMemoryStore | null = null;
export function getChatMemory(): ChatMemoryStore {
  if (!instance) instance = new ChatMemoryStore();
  return instance;
}
