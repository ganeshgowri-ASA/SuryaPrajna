---
name: zotero-connector
version: 1.0.0
description: Reference management, citation import/export, and bibliography generation for PV scientific literature via the Zotero Web API. Enables LLM agents to manage, cite, and format references from a Zotero library.
author: SuryaPrajna Contributors
license: MIT
tags:
  - zotero
  - references
  - citations
  - bibliography
  - reference-management
  - api-integration
  - literature
dependencies:
  python:
    - requests>=2.31
    - pyzotero>=1.5
    - bibtexparser>=2.0
    - pandas>=2.0
  env:
    - ZOTERO_API_KEY
    - ZOTERO_LIBRARY_ID
    - ZOTERO_LIBRARY_TYPE
pack: pv-integrations
agent: Viveka-Agent
---

# zotero-connector

Provides reference management capabilities for SuryaPrajna by integrating with Zotero Web API. Enables agents to search, retrieve, import, and export PV scientific references, generate formatted bibliographies, and maintain a curated literature database.

## LLM Behavioral Instructions

**When invoking this skill, the agent MUST:**

1. **Validate API credentials** — verify `ZOTERO_API_KEY` and `ZOTERO_LIBRARY_ID` are set before any operation; halt and instruct user if missing.
2. **Confirm library scope** — always state whether operating on a personal library or group library (`ZOTERO_LIBRARY_TYPE`: `user` or `group`).
3. **Never duplicate references** — before adding any item, search by DOI or title to check for duplicates; report if already exists.
4. **Always format citations correctly** — when generating in-text citations or bibliographies, strictly follow the specified style (APA, IEEE, Vancouver, or custom).
5. **Cite IEC/ISO standards by full designation** — standards must include year: "IEC 61215-2:2021", not just "IEC 61215".
6. **Preserve existing tags** — when updating Zotero items, never remove existing tags unless explicitly instructed.
7. **Report collection path** — when adding items, always state which collection they are being added to.
8. **Return DOIs whenever possible** — every reference output must include DOI or URL where available.
9. **Flag retractions** — if a retrieved paper is marked as retracted in metadata, prominently flag this before using it.
10. **Limit bulk operations** — default to processing ≤50 items per batch; ask for confirmation before larger operations.

## Capabilities

### 1. Library Search
- Full-text search across Zotero library
- Filter by collection, tag, item type, or date
- Author-specific and journal-specific queries
- Tag-based filtering (e.g., `#IEC-standard`, `#perovskite`, `#FMEA`)

### 2. Citation Import
- Import papers by DOI, ISBN, URL, or arXiv ID
- Batch import from BibTeX, RIS, or CSV files
- Auto-fetch metadata from CrossRef, PubMed, or Semantic Scholar
- Organize imports into designated collections

### 3. Citation Export
- Export in BibTeX, RIS, APA, IEEE, Vancouver, or Chicago formats
- Collection-level export (entire domain collections)
- Tag-filtered export (e.g., all `#reviewed` items)
- CSL (Citation Style Language) support for custom formats

### 4. Bibliography Generation
- Generate formatted reference lists for reports and papers
- In-text citation formatting (author-year or numbered)
- Automatic deduplication in generated bibliographies
- LaTeX and Markdown output formats

### 5. Collection Management
- Create, rename, and organize collections
- Move items between collections
- Bulk-tag items by domain or status
- Sync collection structure with SuryaPrajna skill domains

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `operation` | string | Yes | `search`, `get`, `add`, `update`, `delete`, `export`, `bibliography` |
| `query` | string | Conditional | Search query string (required for `search`) |
| `item_key` | string | Conditional | Zotero item key (required for `get`, `update`, `delete`) |
| `doi` | string | Conditional | DOI for import (used with `add`) |
| `collection` | string | No | Collection name or key to scope operation |
| `tags` | list | No | Tags to filter by or apply |
| `format` | string | No | Export format: `bibtex`, `ris`, `apa`, `ieee`, `vancouver` (default: `bibtex`) |
| `limit` | integer | No | Max results for search (default: 25, max: 100) |
| `sort` | string | No | Sort order: `dateAdded`, `dateModified`, `title`, `creator`, `date` |

## Example Usage

### Search Library

```
Prompt: "Find all papers on PERC degradation in our Zotero library
and export them as a BibTeX file."
```

**Agent behavior:**
1. Search Zotero library with query `PERC degradation`
2. Return list of matching items with titles, authors, years, DOIs
3. Export results as BibTeX to `references/perc-degradation.bib`

### Import Paper by DOI

```
Prompt: "Add the paper with DOI 10.1016/j.solmat.2023.112345 to our
Zotero library under the 'pv-reliability' collection with tag #degradation."
```

**Agent behavior:**
1. Check for duplicate by DOI
2. Fetch metadata from CrossRef
3. Create Zotero item with all metadata fields
4. Add to `pv-reliability` collection
5. Apply tag `#degradation`
6. Confirm addition with item key and formatted citation

### Generate Bibliography

```
Prompt: "Generate an IEEE-formatted reference list for all papers tagged
#IEC-standard in our Zotero library."
```

**Expected output:**

```
[1] IEC, "Terrestrial photovoltaic (PV) modules — Design qualification and type
    approval — Part 1: Test requirements," IEC 61215-1:2021, 2021.
[2] IEC, "PV module safety qualification — Part 1: Requirements for construction,"
    IEC 61730-1:2023, 2023.
...
```

### Batch Import from BibTeX

```
Prompt: "Import all references from this BibTeX file into the
'pv-materials' collection in Zotero."
```

**Agent behavior:**
1. Parse BibTeX file (validate syntax)
2. For each entry: check duplicate by DOI or title
3. Skip duplicates (report count)
4. Import unique entries with metadata
5. Report: N imported, M skipped (duplicates), K failed

## Collection Structure (Recommended)

```
SuryaPrajna Zotero Library
├── pv-materials/
│   ├── silicon
│   ├── perovskite
│   └── thin-film
├── pv-testing/
│   ├── IEC-standards
│   └── test-protocols
├── pv-reliability/
│   ├── degradation
│   └── failure-analysis
├── pv-energy/
│   ├── irradiance-modeling
│   └── energy-yield
├── pv-finance/
└── reference-standards/
    ├── IEC
    ├── ISO
    └── ASTM
```

## Tag Conventions

| Tag | Meaning |
|-----|---------|
| `#reviewed` | Peer-reviewed; verified for use |
| `#IEC-standard` | IEC standard document |
| `#key-reference` | Foundational reference for domain |
| `#retracted` | Paper has been retracted — do not cite |
| `#preprint` | Not yet peer-reviewed |
| `#open-access` | Freely available |

## Error Handling

| Error | Agent Action |
|-------|-------------|
| `ZOTERO_API_KEY` missing | Halt; provide setup instructions |
| `ZOTERO_LIBRARY_ID` missing | Halt; ask user to provide library ID |
| Duplicate DOI found | Skip import; report existing item key |
| Invalid BibTeX | Report parse errors with line numbers |
| API rate limit | Retry with 5s backoff; max 3 retries |
| Item not found | Report `item_key` not found; suggest search |

## Related Skills

- `pinecone-connector` — Vector search over indexed literature
- `scholar-gateway` — External paper discovery
- `perplexity-connector` — Real-time literature search
- `jenni-connector` — AI-assisted writing with citation integration
