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
};

export { DEFAULT_SETTINGS };

export default function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  if (!isOpen) return null;

  const update = (key: keyof EditorSettings, value: EditorSettings[keyof EditorSettings]) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onSettingsChange(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700/60 rounded-xl w-full max-w-lg max-h-[80vh] overflow-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/60">
          <h2 className="text-lg font-semibold text-white">Editor Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-xl"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Editor Preferences */}
          <section>
            <h3 className="text-sm font-semibold text-amber-400 mb-3">
              Editor Preferences
            </h3>
            <div className="space-y-3">
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
            </div>
          </section>

          {/* Auto-save */}
          <section>
            <h3 className="text-sm font-semibold text-amber-400 mb-3">
              Auto-save
            </h3>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">
                Interval (minutes)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={localSettings.autoSaveInterval}
                onChange={(e) =>
                  update("autoSaveInterval", parseInt(e.target.value) || 5)
                }
                className="input w-20 text-sm py-1 text-center"
              />
            </div>
          </section>

          {/* Citation Format */}
          <section>
            <h3 className="text-sm font-semibold text-amber-400 mb-3">
              Citation Format
            </h3>
            <div className="flex gap-2">
              {["APA", "IEEE", "Nature", "Custom"].map((fmt) => (
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
          </section>

          {/* API Keys */}
          <section>
            <h3 className="text-sm font-semibold text-amber-400 mb-3">
              API Keys
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  Anthropic API Key
                </label>
                <input
                  type="password"
                  value={localSettings.anthropicKey}
                  onChange={(e) => update("anthropicKey", e.target.value)}
                  placeholder="sk-ant-..."
                  className="input text-sm py-1.5"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={localSettings.openaiKey}
                  onChange={(e) => update("openaiKey", e.target.value)}
                  placeholder="sk-..."
                  className="input text-sm py-1.5"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  Pinecone API Key
                </label>
                <input
                  type="password"
                  value={localSettings.pineconeKey}
                  onChange={(e) => update("pineconeKey", e.target.value)}
                  placeholder="pc-..."
                  className="input text-sm py-1.5"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800/60 flex justify-end gap-2">
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
