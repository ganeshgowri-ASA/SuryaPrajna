"use client";

import { useCallback, useRef, useState } from "react";

export interface Reference {
  id: string;
  key: string;
  type: string;
  title: string;
  authors: string;
  year: string;
  journal?: string;
  doi?: string;
  volume?: string;
  pages?: string;
  publisher?: string;
    bibtex?: string;
}

interface ReferenceManagerProps {
  references: Reference[];
  onReferencesChange: (refs: Reference[]) => void;
  onInsertCitation: (key: string, mode: "markdown" | "latex") => void;
  mode: "markdown" | "latex";
  citationFormat: string;
  onCitationFormatChange?: (format: string) => void;
}

const CITATION_FORMATS = ["APA", "IEEE", "MLA", "Chicago", "Nature", "Custom"];

function generateKey(title: string, year: string): string {
  const firstWord =
    title
      .split(/\s+/)[0]
      ?.toLowerCase()
      .replace(/[^a-z]/g, "") || "ref";
  return `${firstWord}${year}`;
}

function formatReference(ref: Reference, format: string): string {
  switch (format) {
    case "APA":
      return `${ref.authors} (${ref.year}). ${ref.title}.${ref.journal ? ` *${ref.journal}*` : ""}${ref.volume ? `, ${ref.volume}` : ""}${ref.pages ? `, ${ref.pages}` : ""}.${ref.doi ? ` https://doi.org/${ref.doi}` : ""}`;
    case "IEEE":
      return `${ref.authors}, "${ref.title},"${ref.journal ? ` *${ref.journal}*` : ""}${ref.volume ? `, vol. ${ref.volume}` : ""}${ref.pages ? `, pp. ${ref.pages}` : ""}, ${ref.year}.`;
    case "MLA":
      return `${ref.authors}. "${ref.title}."${ref.journal ? ` *${ref.journal}*` : ""}${ref.volume ? `, vol. ${ref.volume}` : ""}${ref.pages ? `, pp. ${ref.pages}` : ""}, ${ref.year}.`;
    case "Chicago":
      return `${ref.authors}. "${ref.title}."${ref.journal ? ` *${ref.journal}*` : ""}${ref.volume ? ` ${ref.volume}` : ""}${ref.pages ? `: ${ref.pages}` : ""} (${ref.year}).${ref.doi ? ` https://doi.org/${ref.doi}` : ""}`;
    case "Nature":
      return `${ref.authors}. ${ref.title}.${ref.journal ? ` *${ref.journal}*` : ""}${ref.volume ? ` **${ref.volume}**` : ""}${ref.pages ? `, ${ref.pages}` : ""} (${ref.year}).`;
    default:
      return `${ref.authors}. "${ref.title}." ${ref.year}.`;
  }
}

function toBibtex(ref: Reference): string {
  const lines = [`@${ref.type}{${ref.key},`];
  lines.push(`  title = {${ref.title}},`);
  lines.push(`  author = {${ref.authors}},`);
  lines.push(`  year = {${ref.year}},`);
  if (ref.journal) lines.push(`  journal = {${ref.journal}},`);
  if (ref.volume) lines.push(`  volume = {${ref.volume}},`);
  if (ref.pages) lines.push(`  pages = {${ref.pages}},`);
  if (ref.doi) lines.push(`  doi = {${ref.doi}},`);
  if (ref.publisher) lines.push(`  publisher = {${ref.publisher}},`);
  lines.push("}");
  return lines.join("\n");
}

function parseBibtex(bib: string): Reference[] {
  const refs: Reference[] = [];
  const entries = bib.match(/@\w+\{[\s\S]*?\n\}/g) || [];
  for (const entry of entries) {
    const typeMatch = entry.match(/@(\w+)\{(\w+),/);
    if (!typeMatch) continue;
    const getField = (field: string) => {
      const m = entry.match(new RegExp(`${field}\\s*=\\s*\\{([^}]*)\\}`));
      return m ? m[1] : "";
    };
    refs.push({
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      key: typeMatch[2],
      type: typeMatch[1],
      title: getField("title"),
      authors: getField("author"),
      year: getField("year"),
      journal: getField("journal") || undefined,
      doi: getField("doi") || undefined,
      volume: getField("volume") || undefined,
      pages: getField("pages") || undefined,
      publisher: getField("publisher") || undefined,
    });
  }
  return refs;
}

function parseRIS(ris: string): Reference[] {
  const refs: Reference[] = [];
  const entries = ris.split(/\nER\s*-/).filter((e) => e.trim());
  for (const entry of entries) {
    const fields: Record<string, string[]> = {};
    const lines = entry.split("\n");
    for (const line of lines) {
      const match = line.match(/^([A-Z][A-Z0-9])\s+-\s+(.*)/);
      if (match) {
        const tag = match[1];
        const value = match[2].trim();
        if (!fields[tag]) fields[tag] = [];
        fields[tag].push(value);
      }
    }
    const title = fields.TI?.[0] || fields.T1?.[0] || "";
    if (!title) continue;
    const authors = (fields.AU || fields.A1 || []).join(" and ");
    const year = (fields.PY?.[0] || fields.Y1?.[0] || fields.DA?.[0] || "").replace(/\/.*/, "");
    const journal = fields.JO?.[0] || fields.JF?.[0] || fields.T2?.[0] || "";
    const volume = fields.VL?.[0] || "";
    const pages = fields.SP?.[0]
      ? fields.EP?.[0]
        ? `${fields.SP[0]}-${fields.EP[0]}`
        : fields.SP[0]
      : "";
    const doi = fields.DO?.[0] || "";
    const publisher = fields.PB?.[0] || "";
    const typeMap: Record<string, string> = {
      JOUR: "article",
      BOOK: "book",
      CONF: "inproceedings",
      THES: "phdthesis",
      RPRT: "techreport",
    };
    const type = typeMap[fields.TY?.[0] || ""] || "article";
    const key = generateKey(title, year);

    refs.push({
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      key,
      type,
      title,
      authors,
      year,
      journal: journal || undefined,
      doi: doi || undefined,
      volume: volume || undefined,
      pages: pages || undefined,
      publisher: publisher || undefined,
    });
  }
  return refs;
}

export default function ReferenceManager({
  references,
  onReferencesChange,
  onInsertCitation,
  mode,
  citationFormat,
  onCitationFormatChange,
}: ReferenceManagerProps) {
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportBib, setShowImportBib] = useState(false);
  const [doiInput, setDoiInput] = useState("");
  const [doiLoading, setDoiLoading] = useState(false);
  const [bibInput, setBibInput] = useState("");
  const [activeFormat, setActiveFormat] = useState(citationFormat);
  const [newRef, setNewRef] = useState<Partial<Reference>>({
    type: "article",
    title: "",
    authors: "",
    year: "",
    journal: "",
    doi: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredRefs = references.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.authors.toLowerCase().includes(search.toLowerCase()) ||
      r.year.includes(search),
  );

  const addReference = useCallback(() => {
    if (!newRef.title || !newRef.authors || !newRef.year) return;
    const key = generateKey(newRef.title, newRef.year);
    const ref: Reference = {
      id: `${Date.now()}-${Math.random()}`,
      key,
      type: newRef.type || "article",
      title: newRef.title,
      authors: newRef.authors,
      year: newRef.year,
      journal: newRef.journal || undefined,
      doi: newRef.doi || undefined,
      volume: newRef.volume || undefined,
      pages: newRef.pages || undefined,
    };
    onReferencesChange([...references, ref]);
    setNewRef({ type: "article", title: "", authors: "", year: "", journal: "", doi: "" });
    setShowAddForm(false);
  }, [newRef, references, onReferencesChange]);

  const lookupDoi = useCallback(async () => {
    if (!doiInput.trim()) return;
    setDoiLoading(true);
    try {
      const doi = doiInput.replace(/^https?:\/\/doi\.org\//, "");
      const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
      const data = await res.json();
      const work = data.message;
      const authors = (work.author || [])
        .map((a: { family?: string; given?: string }) => `${a.family || ""}, ${a.given || ""}`)
        .join(" and ");
      const year = work.published?.["date-parts"]?.[0]?.[0]?.toString() || "";
      const title = work.title?.[0] || "";
      const journal = work["container-title"]?.[0] || "";
      const volume = work.volume || "";
      const pages = work.page || "";

      const key = generateKey(title, year);
      const ref: Reference = {
        id: `${Date.now()}-${Math.random()}`,
        key,
        type: "article",
        title,
        authors,
        year,
        journal: journal || undefined,
        doi: doi,
        volume: volume || undefined,
        pages: pages || undefined,
      };
      onReferencesChange([...references, ref]);
      setDoiInput("");
    } catch {
      alert("Could not resolve DOI. Please check the DOI and try again.");
    } finally {
      setDoiLoading(false);
    }
  }, [doiInput, references, onReferencesChange]);

  const importBibtex = useCallback(() => {
    const parsed = parseBibtex(bibInput);
    if (parsed.length === 0) {
      alert("No valid BibTeX entries found.");
      return;
    }
    onReferencesChange([...references, ...parsed]);
    setBibInput("");
    setShowImportBib(false);
  }, [bibInput, references, onReferencesChange]);

  const handleFileImport = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      const text = await file.text();
      const ext = file.name.split(".").pop()?.toLowerCase();

      let parsed: Reference[] = [];
      if (ext === "ris") {
        parsed = parseRIS(text);
      } else if (ext === "bib" || ext === "bibtex") {
        parsed = parseBibtex(text);
      }

      if (parsed.length === 0) {
        alert(`No valid references found in ${file.name}`);
        return;
      }
      onReferencesChange([...references, ...parsed]);
    },
    [references, onReferencesChange],
  );

  const removeReference = useCallback(
    (id: string) => {
      onReferencesChange(references.filter((r) => r.id !== id));
    },
    [references, onReferencesChange],
  );

  const exportBibtex = useCallback(() => {
    const bib = references.map(toBibtex).join("\n\n");
    const blob = new Blob([bib], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "references.bib";
    a.click();
    URL.revokeObjectURL(url);
  }, [references]);

  const generateBibliography = useCallback(() => {
    return references.map((r, i) => `${i + 1}. ${formatReference(r, activeFormat)}`).join("\n\n");
  }, [references, activeFormat]);

  const handleFormatChange = useCallback(
    (format: string) => {
      setActiveFormat(format);
      onCitationFormatChange?.(format);
    },
    [onCitationFormatChange],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-800/60 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-white">References ({references.length})</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(!showAddForm);
                setShowImportBib(false);
              }}
              className="text-xs text-amber-400 hover:text-amber-300 px-1.5 py-0.5 rounded hover:bg-amber-500/10"
            >
              + Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowImportBib(!showImportBib);
                setShowAddForm(false);
              }}
              className="text-xs text-gray-400 hover:text-gray-300 px-1.5 py-0.5 rounded hover:bg-gray-700/40"
            >
              Import
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-gray-400 hover:text-gray-300 px-1.5 py-0.5 rounded hover:bg-gray-700/40"
              title="Upload .ris or .bib file (Zotero export)"
            >
              📁 File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".ris,.bib,.bibtex"
              className="hidden"
              onChange={(e) => {
                handleFileImport(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={exportBibtex}
              className="text-xs text-gray-400 hover:text-gray-300 px-1.5 py-0.5 rounded hover:bg-gray-700/40"
            >
              Export
            </button>
          </div>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search references..."
          className="input text-xs py-1"
        />
      </div>

      {/* Citation Format Selector */}
      <div className="px-3 py-1.5 border-b border-gray-800/40 flex-shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-1">Format:</span>
          {CITATION_FORMATS.map((fmt) => (
            <button
              type="button"
              key={fmt}
              onClick={() => handleFormatChange(fmt)}
              className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                activeFormat === fmt
                  ? "bg-amber-500/15 text-amber-300"
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-700/40"
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* DOI Lookup */}
      <div className="px-3 py-2 border-b border-gray-800/40 flex-shrink-0">
        <div className="flex gap-1.5">
          <input
            type="text"
            value={doiInput}
            onChange={(e) => setDoiInput(e.target.value)}
            placeholder="Paste DOI to import..."
            className="input text-xs py-1 flex-1"
            onKeyDown={(e) => e.key === "Enter" && lookupDoi()}
          />
          <button
            type="button"
            onClick={lookupDoi}
            disabled={doiLoading}
            className="btn-primary text-xs py-1 px-2 disabled:opacity-50"
          >
            {doiLoading ? "..." : "DOI"}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="px-3 py-2 border-b border-gray-800/40 space-y-1.5 flex-shrink-0 bg-gray-900/30">
          <input
            type="text"
            placeholder="Title *"
            value={newRef.title || ""}
            onChange={(e) => setNewRef({ ...newRef, title: e.target.value })}
            className="input text-xs py-1"
          />
          <input
            type="text"
            placeholder="Authors * (Last, First and Last, First)"
            value={newRef.authors || ""}
            onChange={(e) => setNewRef({ ...newRef, authors: e.target.value })}
            className="input text-xs py-1"
          />
          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="Year *"
              value={newRef.year || ""}
              onChange={(e) => setNewRef({ ...newRef, year: e.target.value })}
              className="input text-xs py-1 w-20"
            />
            <input
              type="text"
              placeholder="Journal"
              value={newRef.journal || ""}
              onChange={(e) => setNewRef({ ...newRef, journal: e.target.value })}
              className="input text-xs py-1 flex-1"
            />
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="DOI"
              value={newRef.doi || ""}
              onChange={(e) => setNewRef({ ...newRef, doi: e.target.value })}
              className="input text-xs py-1 flex-1"
            />
            <button type="button" onClick={addReference} className="btn-primary text-xs py-1 px-3">
              Add
            </button>
          </div>
        </div>
      )}

      {/* BibTeX / RIS Import */}
      {showImportBib && (
        <div className="px-3 py-2 border-b border-gray-800/40 space-y-1.5 flex-shrink-0 bg-gray-900/30">
          <textarea
            value={bibInput}
            onChange={(e) => setBibInput(e.target.value)}
            placeholder="Paste BibTeX or RIS entries here..."
            className="input text-xs resize-none"
            rows={6}
          />
          <div className="flex gap-1.5">
            <button type="button" onClick={importBibtex} className="btn-primary text-xs py-1 px-3">
              Import BibTeX
            </button>
            <button
              type="button"
              onClick={() => {
                const parsed = parseRIS(bibInput);
                if (parsed.length === 0) {
                  alert("No valid RIS entries found.");
                  return;
                }
                onReferencesChange([...references, ...parsed]);
                setBibInput("");
                setShowImportBib(false);
              }}
              className="btn-primary text-xs py-1 px-3 bg-gray-700 hover:bg-gray-600"
            >
              Import RIS
            </button>
          </div>
        </div>
      )}

      {/* Reference List */}
      <div className="flex-1 overflow-auto min-h-0">
        {filteredRefs.length === 0 ? (
          <div className="p-4 text-center text-gray-600 text-xs">
            {references.length === 0
              ? "No references yet. Add via DOI, manual entry, BibTeX/RIS import, or upload a .ris/.bib file."
              : "No matching references."}
          </div>
        ) : (
          <div className="divide-y divide-gray-800/40">
            {filteredRefs.map((ref) => (
              <div key={ref.id} className="px-3 py-2 hover:bg-gray-800/30 group">
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onInsertCitation(ref.key, mode)}
                    className="text-left flex-1 min-w-0"
                    title="Click to insert citation at cursor"
                  >
                    <p className="text-xs text-white font-medium truncate">{ref.title}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {ref.authors} ({ref.year}){ref.journal && ` — ${ref.journal}`}
                    </p>
                    <span className="text-xs text-amber-500/60 font-mono">[{ref.key}]</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeReference(ref.id)}
                    className="text-gray-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bibliography Preview */}
      {references.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-800/60 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              const bib = generateBibliography();
              navigator.clipboard.writeText(bib);
            }}
            className="text-xs text-amber-400 hover:text-amber-300 w-full text-left"
          >
            Copy formatted bibliography ({activeFormat})
          </button>
        </div>
      )}
    </div>
  );
}
