"use client";

import {
  type ImportResult,
  latexToMarkdown,
  parseBibtex,
  rtfToMarkdown,
  structurePdfText,
  textToImportResult,
} from "@/lib/converters";
import { useCallback, useRef, useState } from "react";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (result: ImportResult) => void;
  onImportBibtex: (bibtex: string) => void;
}

type ImportStatus = "idle" | "reading" | "converting" | "done" | "error";

const SUPPORTED_EXTENSIONS = [".md", ".txt", ".tex", ".bib", ".docx", ".pdf", ".rtf"];

const ACCEPT_STRING =
  ".md,.txt,.tex,.bib,.docx,.pdf,.rtf,text/markdown,text/plain,application/x-tex,application/x-bibtex,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,application/rtf";

function buildSummary(result: ImportResult): string {
  const parts: string[] = [];
  parts.push(`${result.metadata.wordCount.toLocaleString()} words`);
  if (result.metadata.sectionCount > 0) {
    parts.push(`${result.metadata.sectionCount} sections`);
  }
  if (result.metadata.referenceCount > 0) {
    parts.push(`${result.metadata.referenceCount} references`);
  }
  return `Imported ${parts.join(", ")} from ${result.metadata.format}`;
}

function processClientSideText(
  ext: string,
  text: string,
): { result: ImportResult; bibtexToImport?: string } | null {
  if (ext === ".md" || ext === ".txt") {
    return {
      result: textToImportResult(text, ext === ".md" ? "Markdown" : "Plain Text"),
    };
  }
  if (ext === ".tex") {
    const r = latexToMarkdown(text);
    return { result: r, bibtexToImport: r.bibtex };
  }
  if (ext === ".rtf") {
    return { result: rtfToMarkdown(text) };
  }
  return null;
}

async function processServerSide(ext: string, file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("format", ext.slice(1));

  const response = await fetch("/api/convert", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || "Conversion failed");
  }

  const data = await response.json();
  return ext === ".pdf"
    ? structurePdfText(data.markdown)
    : textToImportResult(data.markdown, "Word Document");
}

export default function ImportDialog({
  isOpen,
  onClose,
  onImport,
  onImportBibtex,
}: ImportDialogProps) {
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setStatus("idle");
    setStatusMessage("");
    setResult(null);
    setError("");
    setIsDragOver(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const finishImport = useCallback(
    (importResult: ImportResult, bibtexToImport?: string) => {
      setResult(importResult);
      if (importResult.markdown) onImport(importResult);
      if (bibtexToImport) onImportBibtex(bibtexToImport);
      setStatus("done");
      setStatusMessage(buildSummary(importResult));
    },
    [onImport, onImportBibtex],
  );

  const handleBibImport = useCallback(
    async (file: File) => {
      const text = await file.text();
      const parsed = parseBibtex(text);
      onImportBibtex(text);
      setResult({
        markdown: "",
        bibtex: text,
        metadata: {
          wordCount: 0,
          sectionCount: 0,
          referenceCount: parsed.entries.length,
          format: "BibTeX",
        },
      });
      setStatus("done");
      setStatusMessage(`Imported ${parsed.entries.length} references from BibTeX`);
    },
    [onImportBibtex],
  );

  const processConvertible = useCallback(
    async (ext: string, file: File) => {
      setStatus("converting");
      const clientFormats = [".md", ".txt", ".tex", ".rtf"];
      if (clientFormats.includes(ext)) {
        setStatusMessage("Processing...");
        const text = await file.text();
        const processed = processClientSideText(ext, text);
        if (processed) finishImport(processed.result, processed.bibtexToImport);
        return;
      }
      setStatusMessage(
        ext === ".docx" ? "Converting Word document..." : "Extracting text from PDF...",
      );
      finishImport(await processServerSide(ext, file));
    },
    [finishImport],
  );

  const processFile = useCallback(
    async (file: File) => {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (!SUPPORTED_EXTENSIONS.includes(ext)) {
        setError(`Unsupported file format: ${ext}. Supported: ${SUPPORTED_EXTENSIONS.join(", ")}`);
        setStatus("error");
        return;
      }
      setStatus("reading");
      setStatusMessage(`Reading ${file.name}...`);
      try {
        if (ext === ".bib") {
          await handleBibImport(file);
        } else {
          await processConvertible(ext, file);
        }
      } catch (err) {
        console.error("Import error:", err);
        setError(err instanceof Error ? err.message : "Failed to import file");
        setStatus("error");
      }
    },
    [handleBibImport, processConvertible],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        resetState();
        processFile(file);
      }
    },
    [processFile, resetState],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        resetState();
        processFile(file);
      }
    },
    [processFile, resetState],
  );

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openFilePicker();
      }
    },
    [openFilePicker],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700/60 rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800/60">
          <h2 className="text-sm font-semibold text-white">Import Document</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-300 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Drop zone */}
          {/* biome-ignore lint/a11y/useSemanticElements: drop zone needs div for drag events */}
          <div
            role="button"
            tabIndex={0}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFilePicker}
            onKeyDown={handleKeyDown}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
              isDragOver
                ? "border-amber-500 bg-amber-500/10"
                : "border-gray-700 hover:border-gray-500 hover:bg-gray-800/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_STRING}
              onChange={handleFileChange}
              className="hidden"
            />

            {status === "idle" && (
              <>
                <div className="text-3xl mb-3">📄</div>
                <p className="text-sm text-gray-300 mb-1">Click to browse or drag & drop a file</p>
                <p className="text-xs text-gray-500">
                  Supports: .docx, .pdf, .tex, .md, .txt, .bib, .rtf
                </p>
              </>
            )}

            {(status === "reading" || status === "converting") && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-amber-400">{statusMessage}</p>
              </div>
            )}

            {status === "done" && result && (
              <div className="text-left">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-emerald-400 text-lg">✓</span>
                  <span className="text-sm font-medium text-emerald-400">Import Successful</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{statusMessage}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-gray-800 rounded px-3 py-2">
                    <div className="text-gray-500">Words</div>
                    <div className="text-white font-medium">
                      {result.metadata.wordCount.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded px-3 py-2">
                    <div className="text-gray-500">Sections</div>
                    <div className="text-white font-medium">{result.metadata.sectionCount}</div>
                  </div>
                  <div className="bg-gray-800 rounded px-3 py-2">
                    <div className="text-gray-500">References</div>
                    <div className="text-white font-medium">{result.metadata.referenceCount}</div>
                  </div>
                </div>
                {result.bibtex && (
                  <p className="text-xs text-amber-400 mt-2">
                    BibTeX references imported to references.bib
                  </p>
                )}
              </div>
            )}

            {status === "error" && (
              <div className="text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-400 text-lg">✗</span>
                  <span className="text-sm font-medium text-red-400">Import Failed</span>
                </div>
                <p className="text-sm text-red-300">{error}</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetState();
                  }}
                  className="mt-3 text-xs text-amber-400 hover:text-amber-300 underline"
                >
                  Try again
                </button>
              </div>
            )}
          </div>

          {/* Format details */}
          <div className="mt-4 space-y-1">
            <p className="text-xs text-gray-500 font-medium mb-2">Supported formats:</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
              <span>
                <span className="text-gray-400">.docx</span> — Word document
              </span>
              <span>
                <span className="text-gray-400">.pdf</span> — PDF text extraction
              </span>
              <span>
                <span className="text-gray-400">.tex</span> — LaTeX source
              </span>
              <span>
                <span className="text-gray-400">.md</span> — Markdown
              </span>
              <span>
                <span className="text-gray-400">.txt</span> — Plain text
              </span>
              <span>
                <span className="text-gray-400">.bib</span> — BibTeX references
              </span>
              <span>
                <span className="text-gray-400">.rtf</span> — Rich Text Format
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-800/60">
          {status === "done" && (
            <button
              type="button"
              onClick={resetState}
              className="px-3 py-1.5 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded transition-colors"
            >
              Import Another
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="px-3 py-1.5 text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 rounded transition-colors"
          >
            {status === "done" ? "Done" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
