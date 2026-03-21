"use client";

import { useState } from "react";

interface OutputPanelProps {
  outputContent: string;
  codeContent: string;
}

const SAMPLE_FILES = [
  { name: "workspace/", type: "dir" as const, children: [
    { name: "analysis.py", type: "file" as const, size: "2.4 KB" },
    { name: "results.csv", type: "file" as const, size: "14.1 KB" },
    { name: "config.yaml", type: "file" as const, size: "0.8 KB" },
  ]},
  { name: "reports/", type: "dir" as const, children: [
    { name: "energy-yield-report.md", type: "file" as const, size: "5.2 KB" },
    { name: "iec-61215-protocol.pdf", type: "file" as const, size: "128 KB" },
  ]},
  { name: "data/", type: "dir" as const, children: [
    { name: "weather-tmy.csv", type: "file" as const, size: "2.1 MB" },
    { name: "iv-curves.json", type: "file" as const, size: "45 KB" },
  ]},
];

type TabType = "output" | "code" | "files";

export default function OutputPanel({ outputContent, codeContent }: OutputPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("output");
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(["workspace/"]));

  const toggleDir = (name: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "output", label: "Output", icon: ">" },
    { id: "code", label: "Code", icon: "#" },
    { id: "files", label: "Files", icon: "~" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center border-b border-gray-800/60 flex-shrink-0">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? "border-amber-500 text-amber-400 bg-gray-800/30"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}>
            <span className="font-mono mr-1.5 opacity-60">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "output" && (
          <div>
            {outputContent ? (
              <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">{outputContent}</pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 py-20">
                <div className="text-3xl mb-3 opacity-40">{">"}_</div>
                <p className="text-sm">Output will appear here</p>
                <p className="text-xs mt-1 text-gray-700">Send a query to see results</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "code" && (
          <div>
            {codeContent ? (
              <div className="relative">
                <div className="absolute top-2 right-2">
                  <button onClick={() => navigator.clipboard.writeText(codeContent)}
                    className="text-xs text-gray-500 hover:text-amber-400 px-2 py-1 rounded bg-gray-800/60 border border-gray-700/40 transition-colors">
                    Copy
                  </button>
                </div>
                <pre className="text-sm font-mono text-gray-300 bg-gray-900/40 rounded-lg p-4 overflow-x-auto">
                  <code>{codeContent}</code>
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 py-20">
                <div className="text-3xl mb-3 opacity-40">{"{}"}</div>
                <p className="text-sm">Generated code will appear here</p>
                <p className="text-xs mt-1 text-gray-700">Python, pvlib, numpy, pandas code</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "files" && (
          <div className="space-y-1">
            <div className="text-xs text-gray-500 mb-3 font-mono">~/suryaprajna-workspace/</div>
            {SAMPLE_FILES.map((dir) => (
              <div key={dir.name}>
                <button onClick={() => toggleDir(dir.name)}
                  className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded hover:bg-gray-800/40 transition-colors text-sm">
                  <span className="text-xs text-gray-600 font-mono w-4">
                    {expandedDirs.has(dir.name) ? "v" : ">"}
                  </span>
                  <span className="text-amber-400/80">{dir.name}</span>
                </button>
                {expandedDirs.has(dir.name) && dir.children && (
                  <div className="ml-6 space-y-0.5">
                    {dir.children.map((file) => (
                      <div key={file.name}
                        className="flex items-center justify-between px-2 py-1 rounded hover:bg-gray-800/30 transition-colors group">
                        <span className="text-sm text-gray-400 group-hover:text-gray-200">{file.name}</span>
                        <span className="text-xs text-gray-700">{file.size}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
