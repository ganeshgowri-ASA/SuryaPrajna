"use client";

import { useState } from "react";

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  autoSaveInterval: number;
  citationFormat: string;
  theme: "dark" | "light";
  anthropicKey: string;
  openaiKey: string;
  pineconeKey: string;
  pineconeEnv: string;
  pineconeIndex: string;
  perplexityKey: string;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  onSettingsChange: (settings: EditorSettings) => void;
}

const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  autoSaveInterval: 5,
  citationFormat: "APA",
  theme: "dark",
  anthropicKey: "",
  openaiKey: "",
  pineconeKey: "",
  pineconeEnv: "",
  pineconeIndex: "",
  perplexityKey: "",
};

export { DEFAULT_SETTINGS };

export default function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeSection, setActiveSection] = useState<"editor" | "ai" | "citations">("editor");

  if (!isOpen) return null;

  const update = (key: keyof EditorSettings, value: EditorSettings[keyof EditorSettings]) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onSettingsChange(updated);
  };

  const sections = [
    { key: "editor" as const, label: "Editor", icon: "⚙" },
    { key: "ai" as const, label: "AI & APIs", icon: "🤖" },
    { key: "citations" as const, label: "Citations", icon: "📚" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700/60 rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/60 flex-shrink-0">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Section nav */}
          <div className="w-40 border-r border-gray-800/60 py-2 flex-shrink-0">
            {sections.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  activeSection === s.key
                    ? "bg-amber-500/10 text-amber-300 border-r-2 border-amber-500"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/30"
                }`}
              >
                <span className="mr-2">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>

          {/* Section content */}
          <div className="flex-1 overflow-auto px-6 py-4">
            {activeSection === "editor" && (
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-amber-400 mb-3">Editor Preferences</h3>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300">Font Size</label>
                  <input
                    type="number"
                    min={10}
                    max={24}
                    value={localSettings.fontSize}
                    onChange={(e) => update("fontSize", parseInt(e.target.value) || 14)}
                    className="input w-20 text-sm py-1 text-center"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300">Tab Size</label>
                  <select
                    value={localSettings.tabSize}
                    onChange={(e) => update("tabSize", parseInt(e.target.value))}
                    className="input w-20 text-sm py-1"
                  >
                    <option value={2}>2</option>
                    <option value={4}>4</option>
                    <option value={8}>8</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300">Word Wrap</label>
                  <button
                    onClick={() => update("wordWrap", !localSettings.wordWrap)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      localSettings.wordWrap
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-gray-800 text-gray-400 border border-gray-700"
                    }`}
                  >
                    {localSettings.wordWrap ? "On" : "Off"}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300">Theme</label>
                  <div className="flex gap-1">
                    {(["dark", "light"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => update("theme", t)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors capitalize ${
                          localSettings.theme === t
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300">Auto-save Interval (min)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={localSettings.autoSaveInterval}
                    onChange={(e) => update("autoSaveInterval", parseInt(e.target.value) || 5)}
                    className="input w-20 text-sm py-1 text-center"
                  />
                </div>
              </div>
            )}

            {activeSection === "ai" && (
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-amber-400 mb-1">AI API Keys</h3>
                <p className="text-xs text-gray-500 mb-3">
                  Keys are stored in your browser&apos;s localStorage and sent to API routes via headers. Never stored on the server.
                </p>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Anthropic API Key (Claude)
                  </label>
                  <input
                    type="password"
                    value={localSettings.anthropicKey}
                    onChange={(e) => update("anthropicKey", e.target.value)}
                    placeholder="sk-ant-..."
                    className="input text-sm py-1.5"
                  />
                  <p className="text-xs text-gray-600 mt-1">For AI Write, Edit, Proofread, Explain, Summarize</p>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    OpenAI API Key (GPT-4 / DALL-E)
                  </label>
                  <input
                    type="password"
                    value={localSettings.openaiKey}
                    onChange={(e) => update("openaiKey", e.target.value)}
                    placeholder="sk-..."
                    className="input text-sm py-1.5"
                  />
                  <p className="text-xs text-gray-600 mt-1">For image generation, embeddings, and fallback chat</p>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Perplexity API Key (Literature Search)
                  </label>
                  <input
                    type="password"
                    value={localSettings.perplexityKey}
                    onChange={(e) => update("perplexityKey", e.target.value)}
                    placeholder="pplx-..."
                    className="input text-sm py-1.5"
                  />
                  <p className="text-xs text-gray-600 mt-1">Optional. Falls back to Semantic Scholar (free) if not set</p>
                </div>

                <div className="pt-2 border-t border-gray-800/60">
                  <h3 className="text-sm font-semibold text-amber-400 mb-3">Pinecone (Knowledge Base / RAG)</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Pinecone API Key</label>
                      <input
                        type="password"
                        value={localSettings.pineconeKey}
                        onChange={(e) => update("pineconeKey", e.target.value)}
                        placeholder="pc-..."
                        className="input text-sm py-1.5"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-gray-400 mb-1 block">Environment</label>
                        <input
                          type="text"
                          value={localSettings.pineconeEnv}
                          onChange={(e) => update("pineconeEnv", e.target.value)}
                          placeholder="us-east-1-aws"
                          className="input text-sm py-1.5"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-400 mb-1 block">Index Name</label>
                        <input
                          type="text"
                          value={localSettings.pineconeIndex}
                          onChange={(e) => update("pineconeIndex", e.target.value)}
                          placeholder="my-index"
                          className="input text-sm py-1.5"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "citations" && (
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-amber-400 mb-3">Citation Format</h3>
                <div className="flex gap-2 flex-wrap">
                  {["APA", "IEEE", "Nature", "Chicago", "Harvard", "Custom"].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => update("citationFormat", fmt)}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        localSettings.citationFormat === fmt
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  <h4 className="text-xs text-gray-400 mb-2">Format Preview</h4>
                  <div className="bg-gray-800/40 rounded p-3 text-xs text-gray-300">
                    {localSettings.citationFormat === "APA" &&
                      "Smith, J., & Doe, A. (2024). Title of the paper. Journal Name, 1(2), 100-110."}
                    {localSettings.citationFormat === "IEEE" &&
                      'J. Smith and A. Doe, "Title of the paper," Journal Name, vol. 1, no. 2, pp. 100-110, 2024.'}
                    {localSettings.citationFormat === "Nature" &&
                      "Smith, J. & Doe, A. Title of the paper. Journal Name 1, 100-110 (2024)."}
                    {localSettings.citationFormat === "Chicago" &&
                      'Smith, John, and Alice Doe. "Title of the Paper." Journal Name 1, no. 2 (2024): 100-110.'}
                    {localSettings.citationFormat === "Harvard" &&
                      "Smith, J. and Doe, A. (2024) 'Title of the paper', Journal Name, 1(2), pp. 100-110."}
                    {localSettings.citationFormat === "Custom" &&
                      "Configure your custom citation format in the template."}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800/60 flex justify-end gap-2 flex-shrink-0">
          <button
            onClick={() => {
              setLocalSettings(DEFAULT_SETTINGS);
              onSettingsChange(DEFAULT_SETTINGS);
            }}
            className="btn-secondary text-xs"
          >
            Reset Defaults
          </button>
          <button onClick={onClose} className="btn-primary text-xs">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
