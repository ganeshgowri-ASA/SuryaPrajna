"use client";

import { useState, useCallback } from "react";

export interface ProjectFile {
  id: string;
  name: string;
  content: string;
  type: "main" | "bib" | "figure" | "table" | "other";
}

export interface Project {
  id: string;
  name: string;
  files: ProjectFile[];
  activeFileId: string;
  mode: "markdown" | "latex";
  createdAt: number;
  updatedAt: number;
}

interface ProjectManagerProps {
  project: Project;
  onProjectChange: (project: Project) => void;
  onFileSelect: (fileId: string) => void;
  onNewProject: (template: string) => void;
  onExport: (format: string) => void;
}

const TEMPLATES = [
  {
    id: "pv-research",
    name: "PV Research Paper",
    description: "IEC journal format with standard sections",
    icon: "☀️",
  },
  {
    id: "technical-report",
    name: "Technical Report",
    description: "Detailed technical documentation",
    icon: "📋",
  },
  {
    id: "conference-paper",
    name: "Conference Paper",
    description: "IEEE conference format",
    icon: "🎤",
  },
  {
    id: "thesis-chapter",
    name: "Thesis Chapter",
    description: "Academic thesis structure",
    icon: "🎓",
  },
  {
    id: "lab-report",
    name: "Lab Report",
    description: "Experimental lab report",
    icon: "🔬",
  },
  {
    id: "patent-draft",
    name: "Patent Draft",
    description: "Patent application structure",
    icon: "📜",
  },
  {
    id: "review-article",
    name: "Review Article",
    description: "Literature review format",
    icon: "📚",
  },
  {
    id: "iec-test-report",
    name: "IEC Test Report",
    description: "IEC 61215/61730 qualification test report",
    icon: "🏗️",
  },
  {
    id: "fmea-report",
    name: "FMEA Report",
    description: "Failure Mode and Effects Analysis",
    icon: "⚠️",
  },
  {
    id: "energy-yield",
    name: "Energy Yield Assessment",
    description: "P50/P90 energy yield report",
    icon: "⚡",
  },
];

export function getTemplateContent(templateId: string, mode: "markdown" | "latex"): string {
  if (mode === "latex") {
    return getLatexTemplate(templateId);
  }
  return getMarkdownTemplate(templateId);
}

function getMarkdownTemplate(templateId: string): string {
  const templates: Record<string, string> = {
    "pv-research": `# Title: [Your PV Research Paper Title]

**Authors:** [Author 1], [Author 2]
**Affiliation:** [Institution]
**Date:** ${new Date().toISOString().split("T")[0]}

---

## Abstract

[Provide a concise summary of the research (150-250 words)]

## 1. Introduction

[Background and motivation for the research. Include relevant context about photovoltaic technology.]

## 2. Literature Review

[Survey of existing work, standards (IEC 61215, IEC 61730), and gaps in current knowledge.]

## 3. Materials and Methods

### 3.1 PV Module Specifications

| Parameter | Value | Unit |
|-----------|-------|------|
| Cell Type | | |
| Module Power | | W |
| Efficiency | | % |
| Temperature Coefficient | | %/°C |

### 3.2 Experimental Setup

[Describe the experimental methodology, equipment, and conditions.]

### 3.3 Simulation Parameters

[If applicable, describe simulation tools (pvlib, PVsyst) and parameters.]

## 4. Results and Discussion

### 4.1 Performance Analysis

[Present key findings with figures and tables.]

### 4.2 Comparison with Literature

[Compare results with existing studies.]

## 5. Conclusion

[Summarize key findings and their implications for PV technology.]

## Acknowledgments

[Funding sources and acknowledgments]

## References

[References will be generated from your reference library]
`,
    "technical-report": `# Technical Report: [Title]

**Report No:** TR-${Date.now().toString().slice(-6)}
**Authors:** [Author(s)]
**Date:** ${new Date().toISOString().split("T")[0]}
**Classification:** [Internal/Public]

---

## Executive Summary

[Brief overview of the report's purpose and key findings]

## 1. Introduction

### 1.1 Purpose
### 1.2 Scope
### 1.3 Applicable Standards

## 2. System Description

## 3. Analysis

## 4. Test Results

## 5. Recommendations

## 6. Appendices

## References
`,
    "conference-paper": `# [Paper Title]

**Authors:** [Author 1]$^1$, [Author 2]$^2$
$^1$[Affiliation 1], $^2$[Affiliation 2]

---

## Abstract

[Conference abstract, typically 100-200 words]

**Keywords:** photovoltaic, solar energy, [keyword 3], [keyword 4]

## I. Introduction

## II. Methodology

## III. Results

## IV. Discussion

## V. Conclusion

## Acknowledgments

## References
`,
    "thesis-chapter": `# Chapter [N]: [Chapter Title]

## [N].1 Introduction

## [N].2 Background and Literature Review

## [N].3 Methodology

## [N].4 Results

## [N].5 Discussion

## [N].6 Summary

## References
`,
    "lab-report": `# Lab Report: [Experiment Title]

**Date:** ${new Date().toISOString().split("T")[0]}
**Performed by:** [Name]
**Supervisor:** [Name]

## Objective

## Equipment and Materials

## Procedure

## Data and Observations

## Analysis

## Conclusion

## References
`,
    "patent-draft": `# Patent Application Draft

## Title of Invention

[Descriptive title]

## Field of the Invention

[Technical field, e.g., "The present invention relates to photovoltaic systems..."]

## Background

## Summary of the Invention

## Detailed Description

## Claims

1. A method comprising...

## Abstract

[Patent abstract, max 150 words]
`,
    "review-article": `# [Review Title]: A Comprehensive Review

**Authors:** [Author(s)]

## Abstract

## 1. Introduction

## 2. Scope and Methodology

### 2.1 Search Strategy
### 2.2 Selection Criteria

## 3. Historical Development

## 4. Current State of the Art

## 5. Comparative Analysis

## 6. Challenges and Future Directions

## 7. Conclusion

## References
`,
    "iec-test-report": `# IEC Test Report

**Report No:** IEC-TR-${Date.now().toString().slice(-6)}
**Standard:** IEC 61215 / IEC 61730
**Date:** ${new Date().toISOString().split("T")[0]}
**Laboratory:** [Laboratory Name]

---

## 1. Test Object Description

| Parameter | Value |
|-----------|-------|
| Module Type | |
| Manufacturer | |
| Model Number | |
| Serial Number | |
| Rated Power (Pmax) | W |
| Voc | V |
| Isc | A |
| Cell Technology | |

## 2. Test Sequence

### 2.1 Visual Inspection (MQT 01)

### 2.2 Maximum Power Determination (MQT 02)

### 2.3 Insulation Test (MQT 03)

### 2.4 Temperature Coefficients (MQT 04)

### 2.5 Nominal Operating Cell Temperature (MQT 05)

## 3. Results Summary

| Test | Requirement | Result | Pass/Fail |
|------|-------------|--------|-----------|
| MQT 01 | No major defects | | |
| MQT 02 | Pmax ≥ rated | | |
| MQT 03 | Insulation ≥ 40 MΩ·m² | | |

## 4. Conclusion

## Appendices
`,
    "fmea-report": `# FMEA Report: [System/Component Name]

**Date:** ${new Date().toISOString().split("T")[0]}
**Prepared by:** [Name]
**FMEA Type:** Design / Process / System

---

## 1. System Description

[Describe the PV system or component under analysis]

## 2. Scope and Boundaries

## 3. FMEA Worksheet

| Item | Potential Failure Mode | Potential Effect(s) | Severity (1-10) | Potential Cause(s) | Occurrence (1-10) | Current Controls | Detection (1-10) | RPN | Recommended Actions |
|------|----------------------|---------------------|-----------------|--------------------|--------------------|-----------------|-------------------|-----|---------------------|
| PV Module | Cell cracking | Power loss | 7 | Thermal stress | 4 | Visual inspection | 5 | 140 | |
| Junction Box | Water ingress | Ground fault | 9 | Seal degradation | 3 | IP rating test | 4 | 108 | |
| Inverter | MPPT failure | Yield loss | 6 | Firmware bug | 2 | Monitoring | 3 | 36 | |

## 4. Risk Assessment

### 4.1 High-Risk Items (RPN > 100)

### 4.2 Medium-Risk Items (RPN 50-100)

### 4.3 Low-Risk Items (RPN < 50)

## 5. Recommended Actions

## 6. Conclusion
`,
    "energy-yield": `# Energy Yield Assessment

**Project:** [Project Name]
**Location:** [Latitude, Longitude]
**Capacity:** [MWp DC / MWac]
**Date:** ${new Date().toISOString().split("T")[0]}
**Prepared by:** [Name]

---

## 1. Executive Summary

| Parameter | Value |
|-----------|-------|
| Installed Capacity | MWp |
| P50 Annual Yield | MWh/year |
| P90 Annual Yield | MWh/year |
| Specific Yield (P50) | kWh/kWp |
| Performance Ratio | % |
| Capacity Factor | % |

## 2. Site Description

### 2.1 Location and Climate
### 2.2 Solar Resource Assessment

## 3. System Design

### 3.1 Module Specifications
### 3.2 Inverter Specifications
### 3.3 Array Configuration

## 4. Solar Resource Data

| Month | GHI (kWh/m²) | DNI (kWh/m²) | DHI (kWh/m²) | Avg Temp (°C) |
|-------|---------------|---------------|---------------|---------------|
| Jan | | | | |
| Feb | | | | |
| Mar | | | | |

## 5. Energy Loss Waterfall

| Loss Category | Loss (%) |
|--------------|----------|
| Shading | |
| Soiling | |
| Temperature | |
| Module mismatch | |
| DC wiring | |
| Inverter efficiency | |
| AC wiring | |
| Transformer | |
| Availability | |
| Grid curtailment | |
| **Total Losses** | |

## 6. Uncertainty Analysis

## 7. P50/P90 Results

## 8. Conclusion
`,
  };
  return templates[templateId] || templates["pv-research"];
}

function getLatexTemplate(templateId: string): string {
  if (templateId === "conference-paper") {
    return `\\documentclass[conference]{IEEEtran}
\\usepackage{amsmath,amssymb}
\\usepackage{graphicx}
\\usepackage{cite}

\\title{[Paper Title]}
\\author{
  \\IEEEauthorblockN{Author 1}
  \\IEEEauthorblockA{Affiliation 1}
  \\and
  \\IEEEauthorblockN{Author 2}
  \\IEEEauthorblockA{Affiliation 2}
}

\\begin{document}
\\maketitle

\\begin{abstract}
[Your abstract here]
\\end{abstract}

\\begin{IEEEkeywords}
photovoltaic, solar energy
\\end{IEEEkeywords}

\\section{Introduction}

\\section{Methodology}

\\section{Results}

\\section{Discussion}

\\section{Conclusion}

\\bibliographystyle{IEEEtran}
\\bibliography{references}

\\end{document}`;
  }

  return `\\documentclass[12pt]{article}
\\usepackage{amsmath,amssymb}
\\usepackage{graphicx}
\\usepackage[margin=1in]{geometry}
\\usepackage{cite}
\\usepackage{hyperref}
\\usepackage{siunitx}

\\title{[Your Paper Title]}
\\author{[Author Name] \\\\ [Affiliation]}
\\date{${new Date().toISOString().split("T")[0]}}

\\begin{document}
\\maketitle

\\begin{abstract}
[Your abstract here, 150--250 words]
\\end{abstract}

\\section{Introduction}

\\section{Materials and Methods}

\\section{Results and Discussion}

\\section{Conclusion}

\\section*{Acknowledgments}

\\bibliographystyle{plain}
\\bibliography{references}

\\end{document}`;
}

export default function ProjectManager({
  project,
  onProjectChange,
  onFileSelect,
  onNewProject,
  onExport,
}: ProjectManagerProps) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const addFile = useCallback(() => {
    const ext = project.mode === "latex" ? ".tex" : ".md";
    const name = `untitled${ext}`;
    const newFile: ProjectFile = {
      id: `${Date.now()}`,
      name,
      content: "",
      type: "other",
    };
    onProjectChange({
      ...project,
      files: [...project.files, newFile],
      activeFileId: newFile.id,
      updatedAt: Date.now(),
    });
  }, [project, onProjectChange]);

  const deleteFile = useCallback(
    (fileId: string) => {
      if (project.files.length <= 1) return;
      const newFiles = project.files.filter((f) => f.id !== fileId);
      const newActiveId =
        project.activeFileId === fileId ? newFiles[0].id : project.activeFileId;
      onProjectChange({
        ...project,
        files: newFiles,
        activeFileId: newActiveId,
        updatedAt: Date.now(),
      });
    },
    [project, onProjectChange]
  );

  const startRename = (file: ProjectFile) => {
    setRenamingId(file.id);
    setRenameValue(file.name);
  };

  const finishRename = () => {
    if (!renamingId || !renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    onProjectChange({
      ...project,
      files: project.files.map((f) =>
        f.id === renamingId ? { ...f, name: renameValue.trim() } : f
      ),
      updatedAt: Date.now(),
    });
    setRenamingId(null);
  };

  const getFileIcon = (file: ProjectFile) => {
    if (file.name.endsWith(".bib")) return "📚";
    if (file.name.endsWith(".tex")) return "📄";
    if (file.name.endsWith(".md")) return "📝";
    if (file.type === "figure") return "🖼️";
    if (file.type === "table") return "📊";
    return "📎";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-800/60 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-white truncate">
            {project.name}
          </span>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="text-xs text-amber-400 hover:text-amber-300"
          >
            New
          </button>
        </div>
        <span className="text-xs text-gray-600">
          {project.mode === "latex" ? "LaTeX" : "Markdown"} •{" "}
          {project.files.length} files
        </span>
      </div>

      {/* Template Gallery */}
      {showTemplates && (
        <div className="px-3 py-2 border-b border-gray-800/40 bg-gray-900/30 flex-shrink-0 max-h-60 overflow-auto">
          <p className="text-xs text-gray-500 mb-2">New Project Template:</p>
          <div className="space-y-1">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  onNewProject(t.id);
                  setShowTemplates(false);
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-amber-500/10 transition-colors group"
              >
                <span className="text-sm">{t.icon}</span>{" "}
                <span className="text-xs text-white group-hover:text-amber-300">
                  {t.name}
                </span>
                <p className="text-xs text-gray-600 ml-6">{t.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* File Tree */}
      <div className="flex-1 overflow-auto min-h-0">
        <div className="px-1 py-1">
          {project.files.map((file) => (
            <div
              key={file.id}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs cursor-pointer group ${
                file.id === project.activeFileId
                  ? "bg-amber-500/10 text-amber-300"
                  : "text-gray-400 hover:bg-gray-800/40 hover:text-gray-200"
              }`}
              onClick={() => onFileSelect(file.id)}
            >
              <span className="text-xs">{getFileIcon(file)}</span>
              {renamingId === file.id ? (
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={finishRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") finishRename();
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  className="bg-gray-800 border border-gray-600 rounded px-1 py-0 text-xs text-white flex-1 outline-none"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className="flex-1 truncate"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    startRename(file);
                  }}
                >
                  {file.name}
                </span>
              )}
              {project.files.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(file.id);
                  }}
                  className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-3 py-2 border-t border-gray-800/60 space-y-1 flex-shrink-0">
        <button
          onClick={addFile}
          className="w-full text-left text-xs text-gray-400 hover:text-amber-300 px-2 py-1 rounded hover:bg-gray-800/40"
        >
          + New File
        </button>
        <div className="flex gap-1">
          <button
            onClick={() => onExport("md")}
            className="flex-1 text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-800/40"
          >
            .md
          </button>
          <button
            onClick={() => onExport("tex")}
            className="flex-1 text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-800/40"
          >
            .tex
          </button>
          <button
            onClick={() => onExport("pdf")}
            className="flex-1 text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-800/40"
          >
            PDF
          </button>
          <button
            onClick={() => onExport("html")}
            className="flex-1 text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-800/40"
          >
            HTML
          </button>
        </div>
      </div>
    </div>
  );
}
