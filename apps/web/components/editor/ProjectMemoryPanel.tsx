"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getProjectMemory,
  type ProjectMemory,
  type ProjectPreferences,
} from "@/lib/projectMemory";

interface ProjectMemoryPanelProps {
  projectId?: string;
  onPreferencesChange?: (prefs: ProjectPreferences) => void;
}

export default function ProjectMemoryPanel({
  projectId,
  onPreferencesChange,
}: ProjectMemoryPanelProps) {
  const store = getProjectMemory();
  const [project, setProject] = useState<ProjectMemory | null>(null);
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    if (projectId) {
      const p = store.getProject(projectId);
      if (p) {
        setProject(p);
        setName(p.name);
        setInstructions(p.customInstructions);
      }
    } else {
      const active = store.getActiveProject();
      if (active) {
        setProject(active);
        setName(active.name);
        setInstructions(active.customInstructions);
      }
    }
  }, [projectId, store]);

  const handleSave = useCallback(() => {
    if (!project) return;
    store.updateProject(project.id, {
      name,
      customInstructions: instructions,
    });
    const updated = store.getProject(project.id);
    if (updated) setProject(updated);
  }, [project, name, instructions, store]);

  const handlePrefChange = useCallback(
    (key: keyof ProjectPreferences, value: string | boolean | number) => {
      if (!project) return;
      store.updatePreferences(project.id, { [key]: value });
      const updated = store.getProject(project.id);
      if (updated) {
        setProject(updated);
        onPreferencesChange?.(updated.preferences);
      }
    },
    [project, store, onPreferencesChange],
  );

  const handleNewProject = useCallback(() => {
    const p = store.createProject("New Research Project");
    setProject(p);
    setName(p.name);
    setInstructions(p.customInstructions);
  }, [store]);

  if (!project) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p className="text-sm mb-3">No active project</p>
        <button
          type="button"
          onClick={handleNewProject}
          className="px-3 py-1.5 text-xs bg-amber-600 hover:bg-amber-500 text-white rounded"
        >
          Create Project
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4 text-sm">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Project Memory
      </h3>

      {/* Project Name */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Project Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSave}
          className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-gray-200 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Custom Instructions */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Custom Instructions</label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          onBlur={handleSave}
          rows={4}
          placeholder="e.g. Always use IEC 60904 standard references..."
          className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500 resize-none"
        />
      </div>

      {/* Preferences */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">AI Provider</label>
        <select
          value={project.preferences.preferredProvider}
          onChange={(e) => handlePrefChange("preferredProvider", e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-gray-200 focus:outline-none focus:border-amber-500"
        >
          <option value="anthropic">Anthropic (Claude)</option>
          <option value="openai">OpenAI</option>
          <option value="perplexity">Perplexity</option>
          <option value="deepseek">DeepSeek</option>
          <option value="gemini">Google Gemini</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Theme</label>
        <select
          value={project.preferences.theme}
          onChange={(e) => handlePrefChange("theme", e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-gray-200 focus:outline-none focus:border-amber-500"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="system">System</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-xs text-gray-500">Auto-save</label>
        <button
          type="button"
          onClick={() => handlePrefChange("autoSave", !project.preferences.autoSave)}
          className={`w-8 h-4 rounded-full transition-colors ${
            project.preferences.autoSave ? "bg-amber-500" : "bg-gray-700"
          }`}
        >
          <div
            className={`w-3 h-3 rounded-full bg-white transition-transform ${
              project.preferences.autoSave ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-xs text-gray-500">Line Numbers</label>
        <button
          type="button"
          onClick={() => handlePrefChange("showLineNumbers", !project.preferences.showLineNumbers)}
          className={`w-8 h-4 rounded-full transition-colors ${
            project.preferences.showLineNumbers ? "bg-amber-500" : "bg-gray-700"
          }`}
        >
          <div
            className={`w-3 h-3 rounded-full bg-white transition-transform ${
              project.preferences.showLineNumbers ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* Recent Skills */}
      {project.recentSkills.length > 0 && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">Recent Skills</label>
          <div className="flex flex-wrap gap-1">
            {project.recentSkills.map((skill) => (
              <span
                key={skill}
                className="px-1.5 py-0.5 text-[10px] bg-gray-800 text-gray-400 rounded"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      {project.documents.length > 0 && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">Documents ({project.documents.length})</label>
          <div className="space-y-1">
            {project.documents.map((doc) => (
              <div key={doc.id} className="flex items-center text-xs text-gray-400">
                <span className="mr-1 text-gray-600">{doc.type === "latex" ? "TEX" : doc.type.toUpperCase()}</span>
                <span className="truncate">{doc.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
