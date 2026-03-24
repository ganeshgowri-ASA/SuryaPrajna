export interface ProjectMemory {
  id: string;
  name: string;
  customInstructions: string;
  documents: ProjectDocument[];
  preferences: ProjectPreferences;
  recentSkills: string[];
  lastAccessed: Date;
  createdAt: Date;
}

export interface ProjectDocument {
  id: string;
  name: string;
  path: string;
  type: "markdown" | "latex" | "bibtex" | "csv";
  lastModified: Date;
}

export interface ProjectPreferences {
  preferredProvider: string;
  preferredModel: string;
  autoSave: boolean;
  theme: "dark" | "light" | "system";
  editorFontSize: number;
  showLineNumbers: boolean;
}

const STORAGE_KEY = "suryaprajna_project_memory";
const DEFAULT_PREFERENCES: ProjectPreferences = {
  preferredProvider: "anthropic",
  preferredModel: "claude-sonnet-4-20250514",
  autoSave: true,
  theme: "dark",
  editorFontSize: 14,
  showLineNumbers: true,
};

function generateId(): string {
  return `proj-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

export class ProjectMemoryStore {
  private projects: Map<string, ProjectMemory> = new Map();
  private activeProjectId: string | null = null;

  constructor() {
    this.load();
  }

  private load(): void {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.projects) {
          for (const p of data.projects) {
            this.projects.set(p.id, {
              ...p,
              lastAccessed: new Date(p.lastAccessed),
              createdAt: new Date(p.createdAt),
              documents: (p.documents || []).map((d: ProjectDocument) => ({
                ...d,
                lastModified: new Date(d.lastModified),
              })),
            });
          }
        }
        this.activeProjectId = data.activeProjectId || null;
      }
    } catch {
      this.projects = new Map();
    }
  }

  private save(): void {
    if (typeof window === "undefined") return;
    const data = {
      projects: Array.from(this.projects.values()),
      activeProjectId: this.activeProjectId,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  createProject(name: string): ProjectMemory {
    const project: ProjectMemory = {
      id: generateId(),
      name,
      customInstructions: "",
      documents: [],
      preferences: { ...DEFAULT_PREFERENCES },
      recentSkills: [],
      lastAccessed: new Date(),
      createdAt: new Date(),
    };
    this.projects.set(project.id, project);
    this.activeProjectId = project.id;
    this.save();
    return project;
  }

  getActiveProject(): ProjectMemory | null {
    if (!this.activeProjectId) return null;
    return this.projects.get(this.activeProjectId) || null;
  }

  setActiveProject(projectId: string): void {
    const project = this.projects.get(projectId);
    if (project) {
      project.lastAccessed = new Date();
      this.activeProjectId = projectId;
      this.save();
    }
  }

  updateCustomInstructions(projectId: string, instructions: string): void {
    const project = this.projects.get(projectId);
    if (project) {
      project.customInstructions = instructions;
      this.save();
    }
  }

  updatePreferences(projectId: string, prefs: Partial<ProjectPreferences>): void {
    const project = this.projects.get(projectId);
    if (project) {
      project.preferences = { ...project.preferences, ...prefs };
      this.save();
    }
  }

  addDocument(projectId: string, doc: Omit<ProjectDocument, "id">): ProjectDocument {
    const project = this.projects.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);
    const document: ProjectDocument = { ...doc, id: generateId() };
    project.documents.push(document);
    this.save();
    return document;
  }

  addRecentSkill(projectId: string, skillId: string): void {
    const project = this.projects.get(projectId);
    if (project) {
      project.recentSkills = [skillId, ...project.recentSkills.filter((s) => s !== skillId)].slice(0, 20);
      this.save();
    }
  }

  listProjects(): ProjectMemory[] {
    return Array.from(this.projects.values()).sort(
      (a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime()
    );
  }

  deleteProject(projectId: string): void {
    this.projects.delete(projectId);
    if (this.activeProjectId === projectId) {
      this.activeProjectId = null;
    }
    this.save();
  }

  exportProject(projectId: string): string {
    const project = this.projects.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);
    return JSON.stringify(project, null, 2);
  }

  importProject(json: string): ProjectMemory {
    const project = JSON.parse(json) as ProjectMemory;
    project.id = generateId();
    project.lastAccessed = new Date();
    this.projects.set(project.id, project);
    this.save();
    return project;
  }
}

let instance: ProjectMemoryStore | null = null;
export function getProjectMemory(): ProjectMemoryStore {
  if (!instance) instance = new ProjectMemoryStore();
  return instance;
}
