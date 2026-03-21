"use client";

import { useState } from "react";

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfigPanel({ isOpen, onClose }: ConfigPanelProps) {
  const [apiKeys, setApiKeys] = useState({
    anthropic: "",
    openai: "",
    pinecone: "",
  });
  const [model, setModel] = useState("claude-sonnet-4");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md mx-4 p-6 border-gray-700/60">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Configuration</h2>
          <button onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors text-lg">
            x
          </button>
        </div>

        <div className="space-y-5">
          {/* Model selector */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Model</label>
            <select value={model} onChange={(e) => setModel(e.target.value)}
              className="w-full text-sm bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 focus:outline-none focus:border-amber-500/60">
              <option value="claude-sonnet-4">Claude Sonnet 4</option>
              <option value="claude-opus-4">Claude Opus 4</option>
              <option value="gpt-4o">GPT-4o</option>
            </select>
          </div>

          {/* API Keys */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">ANTHROPIC_API_KEY</label>
            <input type="password" value={apiKeys.anthropic}
              onChange={(e) => setApiKeys((p) => ({ ...p, anthropic: e.target.value }))}
              placeholder="sk-ant-..."
              className="input text-sm" />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">OPENAI_API_KEY</label>
            <input type="password" value={apiKeys.openai}
              onChange={(e) => setApiKeys((p) => ({ ...p, openai: e.target.value }))}
              placeholder="sk-..."
              className="input text-sm" />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">PINECONE_API_KEY</label>
            <input type="password" value={apiKeys.pinecone}
              onChange={(e) => setApiKeys((p) => ({ ...p, pinecone: e.target.value }))}
              placeholder="pc-..."
              className="input text-sm" />
          </div>

          <p className="text-xs text-gray-600">
            API keys are stored in your browser session only and are never sent to our servers.
            For production use, set them as environment variables in your <code className="text-amber-600/70">.env.local</code> file.
          </p>

          <div className="flex gap-3">
            <button onClick={handleSave} className="btn-primary flex-1 text-sm justify-center">
              {saved ? "Saved!" : "Save Settings"}
            </button>
            <button onClick={onClose} className="btn-secondary text-sm">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
