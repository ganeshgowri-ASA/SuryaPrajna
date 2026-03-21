"use client";

import { useState, useCallback } from "react";

interface FigureToolsProps {
  mode: "markdown" | "latex";
  onInsert: (text: string) => void;
}

type ActiveTool = "figure" | "table" | "equation" | "pv-template" | null;

const PV_TEMPLATES = [
  {
    id: "iv-curve",
    name: "I-V Curve Data",
    icon: "📈",
    template: (mode: string) =>
      mode === "latex"
        ? `% I-V Curve Data Table
\\begin{table}[htbp]
\\centering
\\caption{I-V Curve Measurements at STC}
\\begin{tabular}{|c|c|c|c|}
\\hline
Voltage (V) & Current (A) & Power (W) & Fill Factor \\\\
\\hline
0.00 & 9.50 & 0.00 & -- \\\\
0.10 & 9.48 & 0.95 & -- \\\\
0.20 & 9.45 & 1.89 & -- \\\\
0.30 & 9.40 & 2.82 & -- \\\\
0.55 & 8.80 & 4.84 & 0.72 \\\\
0.60 & 0.00 & 0.00 & -- \\\\
\\hline
\\end{tabular}
\\end{table}`
        : `| Voltage (V) | Current (A) | Power (W) | Fill Factor |
|-------------|-------------|-----------|-------------|
| 0.00 | 9.50 | 0.00 | -- |
| 0.10 | 9.48 | 0.95 | -- |
| 0.20 | 9.45 | 1.89 | -- |
| 0.30 | 9.40 | 2.82 | -- |
| 0.55 | 8.80 | 4.84 | 0.72 |
| 0.60 | 0.00 | 0.00 | -- |

*Table: I-V Curve Measurements at STC*`,
  },
  {
    id: "eqe-plot",
    name: "EQE Data Table",
    icon: "🌈",
    template: (mode: string) =>
      mode === "latex"
        ? `% External Quantum Efficiency Data
\\begin{table}[htbp]
\\centering
\\caption{External Quantum Efficiency (EQE) Measurements}
\\begin{tabular}{|c|c|}
\\hline
Wavelength (nm) & EQE (\\%) \\\\
\\hline
300 & 45.2 \\\\
400 & 78.5 \\\\
500 & 89.3 \\\\
600 & 91.7 \\\\
700 & 88.4 \\\\
800 & 75.6 \\\\
900 & 52.1 \\\\
1000 & 28.3 \\\\
1100 & 5.8 \\\\
\\hline
\\end{tabular}
\\end{table}`
        : `| Wavelength (nm) | EQE (%) |
|-----------------|---------|
| 300 | 45.2 |
| 400 | 78.5 |
| 500 | 89.3 |
| 600 | 91.7 |
| 700 | 88.4 |
| 800 | 75.6 |
| 900 | 52.1 |
| 1000 | 28.3 |
| 1100 | 5.8 |

*Table: External Quantum Efficiency (EQE) Measurements*`,
  },
  {
    id: "weibull",
    name: "Weibull Distribution",
    icon: "📊",
    template: (mode: string) =>
      mode === "latex"
        ? `% Weibull reliability equation
The module reliability follows a Weibull distribution:
\\begin{equation}
R(t) = e^{-(t/\\eta)^\\beta}
\\end{equation}
where $\\eta$ is the characteristic life (scale parameter) and $\\beta$ is the shape parameter.

For the tested modules: $\\eta = 25$ years, $\\beta = 3.5$.`
        : `The module reliability follows a Weibull distribution:

$$R(t) = e^{-(t/\\eta)^\\beta}$$

where $\\eta$ is the characteristic life (scale parameter) and $\\beta$ is the shape parameter.

For the tested modules: $\\eta = 25$ years, $\\beta = 3.5$.`,
  },
  {
    id: "solar-equations",
    name: "Key Solar Equations",
    icon: "⚡",
    template: (mode: string) =>
      mode === "latex"
        ? `% Key PV equations
\\subsection{Fundamental PV Equations}

Solar cell efficiency:
\\begin{equation}
\\eta = \\frac{P_{max}}{G \\cdot A} = \\frac{V_{OC} \\cdot I_{SC} \\cdot FF}{G \\cdot A}
\\end{equation}

Fill Factor:
\\begin{equation}
FF = \\frac{V_{MPP} \\cdot I_{MPP}}{V_{OC} \\cdot I_{SC}}
\\end{equation}

Temperature-corrected power:
\\begin{equation}
P(T) = P_{STC} \\cdot [1 + \\gamma (T_{cell} - 25°C)]
\\end{equation}
where $\\gamma$ is the temperature coefficient of power (\\%/°C).`
        : `### Fundamental PV Equations

Solar cell efficiency:
$$\\eta = \\frac{P_{max}}{G \\cdot A} = \\frac{V_{OC} \\cdot I_{SC} \\cdot FF}{G \\cdot A}$$

Fill Factor:
$$FF = \\frac{V_{MPP} \\cdot I_{MPP}}{V_{OC} \\cdot I_{SC}}$$

Temperature-corrected power:
$$P(T) = P_{STC} \\cdot [1 + \\gamma (T_{cell} - 25°C)]$$

where $\\gamma$ is the temperature coefficient of power (%/°C).`,
  },
];

export default function FigureTools({ mode, onInsert }: FigureToolsProps) {
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [figUrl, setFigUrl] = useState("");
  const [figCaption, setFigCaption] = useState("");
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [equationInput, setEquationInput] = useState("");

  const insertFigure = useCallback(() => {
    if (!figUrl) return;
    const caption = figCaption || "Figure caption here";
    const text =
      mode === "latex"
        ? `\\begin{figure}[htbp]\n\\centering\n\\includegraphics[width=0.8\\textwidth]{${figUrl}}\n\\caption{${caption}}\n\\label{fig:label}\n\\end{figure}`
        : `![${caption}](${figUrl})\n\n*Figure: ${caption}*`;
    onInsert("\n" + text + "\n");
    setFigUrl("");
    setFigCaption("");
    setActiveTool(null);
  }, [figUrl, figCaption, mode, onInsert]);

  const insertTable = useCallback(() => {
    let text = "";
    if (mode === "latex") {
      const cols = Array(tableCols).fill("c").join("|");
      const header = Array(tableCols)
        .map((_, i) => `Col ${i + 1}`)
        .join(" & ");
      const rows = Array(tableRows)
        .fill(null)
        .map(() => Array(tableCols).fill(" ").join(" & "))
        .join(" \\\\\n");
      text = `\\begin{table}[htbp]\n\\centering\n\\caption{Table caption}\n\\begin{tabular}{|${cols}|}\n\\hline\n${header} \\\\\n\\hline\n${rows} \\\\\n\\hline\n\\end{tabular}\n\\end{table}`;
    } else {
      const header = Array(tableCols)
        .map((_, i) => `Col ${i + 1}`)
        .join(" | ");
      const sep = Array(tableCols).fill("---").join(" | ");
      const rows = Array(tableRows)
        .fill(null)
        .map(() => Array(tableCols).fill(" ").join(" | "))
        .join("\n| ");
      text = `| ${header} |\n| ${sep} |\n| ${rows} |`;
    }
    onInsert("\n" + text + "\n");
    setActiveTool(null);
  }, [tableRows, tableCols, mode, onInsert]);

  const insertEquation = useCallback(() => {
    if (!equationInput.trim()) return;
    const text =
      mode === "latex"
        ? `\\begin{equation}\n${equationInput}\n\\end{equation}`
        : `$$\n${equationInput}\n$$`;
    onInsert("\n" + text + "\n");
    setEquationInput("");
    setActiveTool(null);
  }, [equationInput, mode, onInsert]);

  return (
    <div className="border-t border-gray-800/60 bg-gray-950/80">
      {/* Tool buttons */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-gray-800/40">
        <span className="text-xs text-gray-600 mr-2">Insert:</span>
        {(
          [
            { key: "figure" as const, label: "Figure", icon: "🖼️" },
            { key: "table" as const, label: "Table", icon: "📊" },
            { key: "equation" as const, label: "Equation", icon: "∑" },
            { key: "pv-template" as const, label: "PV Templates", icon: "☀️" },
          ] as const
        ).map((tool) => (
          <button
            key={tool.key}
            onClick={() =>
              setActiveTool(activeTool === tool.key ? null : tool.key)
            }
            className={`text-xs px-2 py-1 rounded transition-colors ${
              activeTool === tool.key
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/40 border border-transparent"
            }`}
          >
            {tool.icon} {tool.label}
          </button>
        ))}
      </div>

      {/* Tool panels */}
      {activeTool === "figure" && (
        <div className="px-3 py-2 space-y-2">
          <input
            type="text"
            value={figUrl}
            onChange={(e) => setFigUrl(e.target.value)}
            placeholder="Image URL or file path..."
            className="input text-xs py-1"
          />
          <input
            type="text"
            value={figCaption}
            onChange={(e) => setFigCaption(e.target.value)}
            placeholder="Figure caption..."
            className="input text-xs py-1"
          />
          <button onClick={insertFigure} className="btn-primary text-xs py-1 px-3">
            Insert Figure
          </button>
        </div>
      )}

      {activeTool === "table" && (
        <div className="px-3 py-2 space-y-2">
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-400">
              Rows:{" "}
              <input
                type="number"
                min={1}
                max={20}
                value={tableRows}
                onChange={(e) => setTableRows(parseInt(e.target.value) || 3)}
                className="input text-xs py-0.5 w-16 inline-block ml-1"
              />
            </label>
            <label className="text-xs text-gray-400">
              Cols:{" "}
              <input
                type="number"
                min={1}
                max={10}
                value={tableCols}
                onChange={(e) => setTableCols(parseInt(e.target.value) || 3)}
                className="input text-xs py-0.5 w-16 inline-block ml-1"
              />
            </label>
          </div>
          <button onClick={insertTable} className="btn-primary text-xs py-1 px-3">
            Insert Table
          </button>
        </div>
      )}

      {activeTool === "equation" && (
        <div className="px-3 py-2 space-y-2">
          <textarea
            value={equationInput}
            onChange={(e) => setEquationInput(e.target.value)}
            placeholder="Enter LaTeX equation... (e.g., E = mc^2)"
            className="input text-xs resize-none font-mono"
            rows={3}
          />
          {equationInput && (
            <div className="text-xs text-gray-500 bg-gray-900/60 rounded p-2 border border-gray-800/40">
              Preview: ${equationInput}$
            </div>
          )}
          <button onClick={insertEquation} className="btn-primary text-xs py-1 px-3">
            Insert Equation
          </button>
        </div>
      )}

      {activeTool === "pv-template" && (
        <div className="px-3 py-2 max-h-48 overflow-auto">
          <div className="space-y-1">
            {PV_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  onInsert("\n" + t.template(mode) + "\n");
                  setActiveTool(null);
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-amber-500/10 transition-colors flex items-center gap-2"
              >
                <span>{t.icon}</span>
                <span className="text-xs text-gray-300">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
