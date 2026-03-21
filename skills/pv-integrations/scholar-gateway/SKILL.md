---
name: scholar-gateway
version: 1.0.0
description: Multi-source academic paper search and citation analysis for PV literature via Semantic Scholar, CrossRef, and Scopus APIs. Enables discovery, ranking, and citation network analysis of solar energy research.
author: SuryaPrajna Contributors
license: MIT
tags:
  - semantic-scholar
  - crossref
  - scopus
  - paper-search
  - citation-analysis
  - literature-discovery
  - api-integration
dependencies:
  python:
    - requests>=2.31
    - pandas>=2.0
    - semanticscholar>=0.8
    - habanero>=1.2
  env:
    - SEMANTIC_SCHOLAR_API_KEY
    - SCOPUS_API_KEY
    - CROSSREF_API_KEY
pack: pv-integrations
agent: Viveka-Agent
---

# scholar-gateway

Provides unified access to academic paper discovery and citation analysis across Semantic Scholar, CrossRef, and Scopus APIs. Enables SuryaPrajna agents to search PV literature, analyze citation networks, identify key authors and journals, and retrieve full metadata for references.

## LLM Behavioral Instructions

**When invoking this skill, the agent MUST:**

1. **Select the appropriate API source** — use Semantic Scholar for open-access AI-enhanced search; CrossRef for DOI resolution and publisher metadata; Scopus for citation counts and journal rankings. State which source is being queried.
2. **Always include search scope** — specify search fields: title, abstract, keywords. Never perform unbounded searches.
3. **Return structured metadata** — every result must include: title, authors (first + last if >3), year, journal/venue, DOI, citation count (if available), and open-access status.
4. **Distinguish open-access from paywalled** — flag whether each result has a freely accessible PDF; provide OA link when available.
5. **Never present search results as comprehensive** — explicitly state: "This search returned N results from [source]. More results may exist."
6. **Sort by relevance by default** — when multiple ranking strategies are available, default to relevance; offer to re-sort by citations or recency on request.
7. **Handle Scopus rate limits gracefully** — Scopus is rate-limited; if quota exceeded, fall back to Semantic Scholar and note the fallback.
8. **Validate DOIs before reporting** — resolve all DOIs via CrossRef before including in results; flag unresolvable DOIs.
9. **Filter to PV domain** — apply domain keywords (photovoltaic, solar cell, PV module, solar energy) unless user explicitly broadens scope.
10. **Cite h-index and impact factor with caveats** — when reporting journal metrics, note the year of the metric and its limitations.

## Capabilities

### 1. Semantic Scholar Search
- Full-text semantic search over 200M+ academic papers
- Field-of-study filtering (Energy, Materials Science, Engineering)
- Citation count, influential citation, and recommendation features
- Author disambiguation and profile lookup
- AI-generated paper summaries (tldr)

### 2. CrossRef DOI Resolution
- Resolve DOIs to full bibliographic metadata
- Publisher, journal, ISSN, and license information
- Open-access status and full-text links
- Funder and grant information
- Event/conference metadata

### 3. Scopus Citation Analysis
- Cited-by analysis for key PV papers
- Journal Impact Factor and CiteScore lookup
- Author h-index retrieval
- Institution-level publication analysis
- Scopus Subject Classification (ASJC) filtering

### 4. Citation Network Analysis
- Co-citation analysis to find related research clusters
- Bibliographic coupling for related papers
- Most-cited papers in a subfield
- Author collaboration networks
- Temporal citation trends

### 5. Unified Paper Discovery
- Cross-source deduplication (same paper from multiple APIs)
- Ranked merged results with source attribution
- Gap detection: recent papers not yet indexed in Pinecone

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query (keywords, title phrase, or author name) |
| `source` | string | No | `semantic_scholar`, `crossref`, `scopus`, `all` (default: `semantic_scholar`) |
| `fields_of_study` | list | No | Discipline filter (e.g., `["Energy", "Materials Science"]`) |
| `year_range` | object | No | `{"start": 2018, "end": 2025}` |
| `limit` | integer | No | Max results per source (default: 10, max: 50) |
| `sort` | string | No | `relevance`, `citations`, `recency` (default: `relevance`) |
| `open_access_only` | bool | No | Filter to open-access papers only (default: false) |
| `doi` | string | Conditional | DOI for direct resolution (CrossRef operation) |
| `author_id` | string | No | Semantic Scholar author ID for author-specific search |
| `include_tldr` | bool | No | Include AI-generated summaries (Semantic Scholar only, default: false) |
| `citation_analysis` | bool | No | Fetch citation network for top results (default: false) |

## Example Usage

### Multi-Source Paper Search

```
Prompt: "Find the most cited papers on bifacial PV module energy yield
published between 2019 and 2024. Sort by citation count."
```

**Agent behavior:**
1. Query Semantic Scholar: `bifacial photovoltaic module energy yield`, year 2019–2024
2. Query Scopus: same query with ASJC filter `2208` (Electrical Engineering)
3. Deduplicate by DOI
4. Sort by citation count (descending)
5. Return top 10 with metadata table

**Expected output:**

| # | Title | Authors | Year | Venue | Citations | DOI | OA |
|---|-------|---------|------|-------|-----------|-----|----|
| 1 | "Bifacial module..." | Sun et al. | 2021 | Sol. Energy | 347 | 10.xxxx | ✓ |
| 2 | "Energy yield..." | Kreinin et al. | 2020 | Prog. PV | 289 | 10.xxxx | ✗ |

> Search returned 10 results from Semantic Scholar + Scopus (combined). More results may exist.

### DOI Resolution

```
Prompt: "Resolve DOI 10.1016/j.solmat.2023.112345 and give me full
metadata including journal impact factor."
```

**Agent behavior:**
1. CrossRef: resolve DOI → title, authors, journal, volume, pages, year
2. Scopus: retrieve journal CiteScore and Impact Factor
3. Return unified metadata record with license and OA status

### Citation Analysis

```
Prompt: "Find all papers that cite the seminal Jordan & Kurtz (2013)
PV degradation rate paper and identify the most influential ones."
```

**Agent behavior:**
1. Resolve Jordan & Kurtz 2013 DOI via CrossRef
2. Semantic Scholar: fetch citing papers list
3. Filter by `influential_citation_count > 5`
4. Return top 10 influential citing papers sorted by influence count

### Author H-Index Lookup

```
Prompt: "What is the h-index of a PV researcher and list their 5
most-cited papers on degradation?"
```

**Agent behavior:**
1. Search Semantic Scholar author disambiguation
2. Retrieve author profile: h-index, citation count, paper count
3. Filter papers by keyword `degradation`
4. Return top 5 by citation count

## API Fallback Strategy

```
Primary: Semantic Scholar (free, high coverage, AI features)
      │
      ▼ (if rate limited or no results)
Fallback: CrossRef (DOI resolution, publisher metadata)
      │
      ▼ (for citation metrics)
Supplement: Scopus (journal rankings, h-index, citation counts)
```

## Domain Keyword Filters (Auto-Applied)

When no explicit domain filter is set, these terms are automatically included in queries:

```
photovoltaic OR "solar cell" OR "PV module" OR "solar energy" OR
"solar panel" OR "solar irradiance" OR "perovskite solar"
```

Override with `domain_filter: false` parameter if broader search needed.

## Error Handling

| Error | Agent Action |
|-------|-------------|
| `SEMANTIC_SCHOLAR_API_KEY` missing | Use unauthenticated Semantic Scholar (rate limited) |
| `SCOPUS_API_KEY` missing | Skip Scopus; note missing metrics |
| `CROSSREF_API_KEY` missing | Use unauthenticated CrossRef (polite pool) |
| DOI unresolvable | Flag as "DOI not found"; provide raw search result |
| Scopus quota exceeded | Fall back to Semantic Scholar; log warning |
| No results found | Suggest broader query terms; check spelling |
| API timeout (>10s) | Retry once; fall back to available source |

## Related Skills

- `pinecone-connector` — Index discovered papers into vector database
- `zotero-connector` — Import discovered papers into reference library
- `perplexity-connector` — Real-time search for very recent papers
- `jenni-connector` — Draft literature reviews from discovered papers
