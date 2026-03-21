---
name: pinecone-connector
version: 1.0.0
description: Vector database knowledge retrieval for PV scientific literature and domain knowledge using Pinecone API. Enables semantic search, similarity matching, and RAG (Retrieval-Augmented Generation) over indexed PV research corpora.
author: SuryaPrajna Contributors
license: MIT
tags:
  - pinecone
  - vector-database
  - knowledge-retrieval
  - rag
  - semantic-search
  - embeddings
  - api-integration
dependencies:
  python:
    - pinecone-client>=3.0
    - openai>=1.0
    - anthropic>=0.25
    - numpy>=1.24
    - pandas>=2.0
  env:
    - PINECONE_API_KEY
    - ANTHROPIC_API_KEY
    - OPENAI_API_KEY
pack: pv-integrations
agent: Viveka-Agent
---

# pinecone-connector

Provides semantic knowledge retrieval over PV scientific literature, standards documents, test reports, and domain knowledge bases using Pinecone vector database. Supports RAG workflows to ground LLM responses in indexed PV research.

## LLM Behavioral Instructions

**When invoking this skill, the agent MUST:**

1. **Always validate the API key** — check that `PINECONE_API_KEY` is set before proceeding; if missing, instruct the user to set it and stop.
2. **Specify the index and namespace** — always identify which Pinecone index and namespace to query (e.g., `surya-prajna-pv`, namespace `standards` or `research`).
3. **State the retrieval intent** — clearly describe what knowledge is being retrieved and why before issuing a query.
4. **Return sources with every answer** — every retrieved result MUST include: document title, source (DOI, URL, or filename), publication year, and relevance score.
5. **Apply a relevance threshold** — discard results with cosine similarity score below 0.75 unless explicitly asked for broader results.
6. **Limit response size** — default to top-5 results; expand to top-10 only when explicitly requested.
7. **Never fabricate citations** — if no relevant documents are retrieved, say so explicitly; do NOT invent references.
8. **Chunk-aware retrieval** — when source documents are chunked, reassemble context from adjacent chunks before generating a response.
9. **Cite IEC standards by number** — when retrieving standards content, always cite the full standard number (e.g., IEC 61215-2:2021).
10. **Flag outdated knowledge** — if retrieved documents are older than 3 years, note this and suggest the user verify against current standards.

## Capabilities

### 1. Semantic Search
- Natural language queries over indexed PV literature
- Multi-vector similarity search (dense + sparse hybrid)
- Namespace filtering by domain (materials, testing, reliability, energy)
- Metadata filtering by year, author, standard number, or journal

### 2. RAG (Retrieval-Augmented Generation)
- Retrieve context chunks → augment LLM prompt → generate grounded answer
- Source-attributed answers with inline citations
- Confidence scoring based on retrieval similarity

### 3. Knowledge Base Management
- Upsert new documents into designated namespaces
- Embed PV papers, standards, test reports, and datasheets
- Batch ingestion pipeline for large document collections
- Deduplication check before insertion

### 4. Similarity Matching
- Find papers similar to a given abstract or query
- Identify duplicate or near-duplicate standards content
- Cross-namespace knowledge discovery

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Natural language query or search phrase |
| `index_name` | string | No | Pinecone index name (default: `surya-prajna-pv`) |
| `namespace` | string | No | Namespace to search: `standards`, `research`, `reports`, `all` (default: `all`) |
| `top_k` | integer | No | Number of results to return (default: 5, max: 20) |
| `score_threshold` | float | No | Minimum cosine similarity (default: 0.75) |
| `filter` | object | No | Metadata filters (e.g., `{"year": {"$gte": 2020}, "standard": "IEC"}`) |
| `include_metadata` | bool | No | Return full metadata with results (default: true) |
| `rerank` | bool | No | Apply cross-encoder reranking to top results (default: false) |

## Example Usage

### Basic Knowledge Retrieval

```
Prompt: "Find the most relevant research on LeTID degradation mechanisms
in PERC modules indexed in our knowledge base."
```

**Agent behavior:**
1. Embed query using `text-embedding-3-large`
2. Query `surya-prajna-pv` index, namespace `research`, top_k=5
3. Filter to score ≥ 0.75
4. Return: title, authors, year, DOI, similarity score, relevant excerpt

**Expected output:**

| # | Title | Authors | Year | Score | DOI |
|---|-------|---------|------|-------|-----|
| 1 | "Light and elevated Temperature Induced Degradation..." | Lim et al. | 2022 | 0.92 | 10.xxxx |
| 2 | "LeTID in Cz-Si PERC modules..." | Mülhardt et al. | 2021 | 0.88 | 10.xxxx |

> **Excerpt (Doc 1):** "LeTID manifests as a carrier lifetime reduction occurring at temperatures between 50–150°C under illumination, particularly affecting boron-doped Czochralski silicon..."

### Standards Retrieval

```
Prompt: "Retrieve IEC 61215 acceptance criteria for damp heat testing
from our indexed standards."
```

**Agent behavior:**
1. Query namespace `standards` with metadata filter `{"standard": "IEC 61215"}`
2. Retrieve relevant chunks and reassemble context
3. Present acceptance criteria with clause references

### Upsert New Document

```
Prompt: "Index this new paper on HJT module degradation into the
knowledge base under namespace 'research'."
```

**Agent behavior:**
1. Extract text and metadata from provided document
2. Check for duplicates (title + DOI match)
3. Chunk document into 512-token segments with 50-token overlap
4. Embed all chunks and upsert to Pinecone with metadata

## Index Schema

### Recommended Metadata Fields

```json
{
  "title": "string",
  "authors": ["string"],
  "year": "integer",
  "doi": "string",
  "source_type": "research_paper | standard | test_report | datasheet | patent",
  "domain": "materials | cell_module | testing | reliability | energy | finance | design",
  "standard_number": "string",
  "journal": "string",
  "chunk_index": "integer",
  "total_chunks": "integer",
  "language": "string"
}
```

## Integration Architecture

```
User Query
    │
    ▼
Embed Query (text-embedding-3-large)
    │
    ▼
Pinecone Query (top_k=5, score≥0.75)
    │
    ▼
Metadata Filter + Rerank (optional)
    │
    ▼
Chunk Reassembly
    │
    ▼
LLM Prompt Augmentation
    │
    ▼
Source-Attributed Answer
```

## Error Handling

| Error | Agent Action |
|-------|-------------|
| `PINECONE_API_KEY` missing | Stop; instruct user to set environment variable |
| Index not found | Stop; list available indexes; suggest creating index |
| No results above threshold | Report "no relevant documents found"; do not fabricate |
| Rate limit exceeded | Wait 10s and retry once; report failure if persists |
| Embedding API failure | Fall back to keyword search or report failure |

## Related Skills

- `zotero-connector` — Reference management and citation export
- `scholar-gateway` — External paper search via Semantic Scholar, CrossRef
- `perplexity-connector` — Real-time web search for recent literature
- `jenni-connector` — AI writing assistance with retrieved context
