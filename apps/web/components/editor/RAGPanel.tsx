"use client";

import { useProviderKeys } from "@/lib/useProviderKeys";
import { useCallback, useState } from "react";

interface RAGPanelProps {
  onInsertText: (text: string) => void;
}

interface SearchResult {
  id: string;
  score: number;
  metadata: {
    text: string;
    title?: string;
    source?: string;
    [key: string]: unknown;
  };
}

export default function RAGPanel({ onInsertText }: RAGPanelProps) {
  const { keys, headers } = useProviderKeys();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadText, setUploadText] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<"search" | "upload">("search");

  const isConfigured = keys.pineconeKey && keys.pineconeIndex && keys.openaiKey;

  const handleSearch = useCallback(async () => {
    if (!query.trim() || !isConfigured) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/pinecone/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ query, topK: 5 }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResults(data.matches || []);
      }
    } catch {
      setError("Failed to search knowledge base");
    } finally {
      setLoading(false);
    }
  }, [query, headers, isConfigured]);

  const handleUpload = useCallback(async () => {
    if (!uploadText.trim() || !isConfigured) return;
    setUploading(true);
    setError("");

    try {
      // Split text into chunks of ~500 words
      const words = uploadText.split(/\s+/);
      const chunks: string[] = [];
      for (let i = 0; i < words.length; i += 500) {
        chunks.push(words.slice(i, i + 500).join(" "));
      }

      const metadata = chunks.map(() => ({
        title: uploadTitle || "Untitled",
        source: "manual_upload",
        uploadedAt: new Date().toISOString(),
      }));

      const res = await fetch("/api/pinecone/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ texts: chunks, metadata }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setUploadText("");
        setUploadTitle("");
        setError("");
        alert(`Uploaded ${data.upsertedCount} chunks to knowledge base`);
      }
    } catch {
      setError("Failed to upload to knowledge base");
    } finally {
      setUploading(false);
    }
  }, [uploadText, uploadTitle, headers, isConfigured]);

  if (!isConfigured) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-3 py-2 border-b border-gray-800/60 flex-shrink-0">
          <span className="text-xs font-semibold text-white">Knowledge Base (RAG)</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">Knowledge Base Not Configured</p>
            <p className="text-xs text-gray-600">
              Add your Pinecone API key, index name, and OpenAI key in Settings to enable semantic
              search over your documents.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-gray-800/60 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-white">Knowledge Base (RAG)</span>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setTab("search")}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              tab === "search"
                ? "bg-amber-500/15 text-amber-300"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              tab === "upload"
                ? "bg-amber-500/15 text-amber-300"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Upload
          </button>
        </div>
      </div>

      {tab === "search" ? (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="px-3 py-2 flex-shrink-0">
            <div className="flex gap-1.5">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your knowledge base..."
                className="input text-xs py-1 flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={loading}
                className="btn-primary text-xs py-1 px-2 disabled:opacity-50"
              >
                {loading ? "..." : "Search"}
              </button>
            </div>
          </div>

          {error && <div className="px-3 py-1 text-xs text-red-400">{error}</div>}

          <div className="flex-1 overflow-auto min-h-0">
            {results.length === 0 ? (
              <div className="p-4 text-center text-gray-600 text-xs">
                Search your uploaded documents using natural language queries.
              </div>
            ) : (
              <div className="divide-y divide-gray-800/40">
                {results.map((r) => (
                  <div key={r.id} className="px-3 py-2 hover:bg-gray-800/30 group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {r.metadata.title && (
                          <p className="text-xs text-amber-300 font-medium mb-0.5">
                            {r.metadata.title}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 line-clamp-3">{r.metadata.text}</p>
                        <span className="text-xs text-gray-600">
                          Score: {(r.score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onInsertText(r.metadata.text)}
                        className="text-xs text-amber-500 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        Insert
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0 px-3 py-2 space-y-2">
          <input
            type="text"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            placeholder="Document title..."
            className="input text-xs py-1"
          />
          <textarea
            value={uploadText}
            onChange={(e) => setUploadText(e.target.value)}
            placeholder="Paste document text or paper content here..."
            className="input text-xs resize-none flex-1 min-h-[100px]"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || !uploadText.trim()}
            className="btn-primary text-xs py-1.5 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload to Knowledge Base"}
          </button>
          <p className="text-xs text-gray-600">
            Text will be chunked and embedded for semantic search.
          </p>
        </div>
      )}
    </div>
  );
}
