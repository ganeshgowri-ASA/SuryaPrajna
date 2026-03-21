---
name: literature-review
version: 1.0.0
description: >
  Conduct systematic literature reviews for PV research using Semantic Scholar,
  Google Scholar, Perplexity AI, and Zotero. Supports PRISMA-style protocols,
  auto-citation in IEEE/APA/Nature styles, bibliography generation, and
  integration with Jenni.ai for writing assistance.
author: SuryaPrajna Contributors
license: MIT
tags:
  - literature-review
  - citations
  - bibliography
  - semantic-scholar
  - zotero
  - systematic-review
  - photovoltaic
dependencies:
  python:
    - requests>=2.31
    - pyzotero>=1.5
    - pandas>=2.0
    - bibtexparser>=1.4
    - pyyaml>=6.0
  apis:
    - Semantic Scholar API (free, key optional for higher rate limits)
    - Zotero API (key required for library access)
    - Perplexity AI API (key required)
    - Scopus/Elsevier API (key required for full metadata)
    - CrossRef API (free, polite pool with email)
    - Jenni.ai API (key required for writing assistance)
  data:
    - Research topic or search query
    - Zotero library ID and API key (for citation management)
pack: pv-scientific-writing
agent: Grantha-Agent
---

# literature-review

Conduct systematic literature reviews for photovoltaic research. This skill integrates multiple academic search APIs, manages references via Zotero, generates formatted citations and bibliographies, and supports PRISMA-style systematic review protocols.

---

## LLM Behavioral Instructions

> **These instructions define HOW you must think, reason, and produce output when this skill is invoked.**

### Core Literature Review Protocol

When asked to conduct a literature review, follow this exact sequence:

1. **Define the Research Question** — Before searching, formulate:
   - Primary research question (PICO format if applicable: Population, Intervention, Comparison, Outcome)
   - PV-specific scope: technology type (c-Si, perovskite, tandem, thin-film), application (utility, rooftop, BIPV), aspect (efficiency, reliability, economics)
   - Time range (default: last 5 years for current state-of-the-art, last 20 years for historical context)
   - Inclusion/exclusion criteria

2. **Execute Multi-Source Search** — Search across multiple databases systematically:
   - Semantic Scholar (primary — open access, good PV coverage)
   - Google Scholar (breadth — captures conference proceedings)
   - Scopus (if API key available — comprehensive metadata)
   - CrossRef (DOI resolution and metadata enrichment)
   - Perplexity AI (for synthesized summaries of recent developments)

3. **Screen and Filter Results** — Apply inclusion/exclusion criteria:
   - Relevance to research question
   - Publication type (journal article, conference paper, review, preprint)
   - Citation count threshold (for established topics)
   - Journal quality (impact factor, quartile)
   - Remove duplicates across databases

4. **Extract and Synthesize** — For each included paper:
   - Key findings (1–2 sentences)
   - Methodology used
   - PV metrics reported (efficiency, degradation rate, LCOE, etc.)
   - Limitations noted by authors
   - How it relates to the research question

5. **Generate Output** — Produce one or more of:
   - Narrative literature review section (for manuscript integration)
   - Summary table of reviewed papers
   - Citation list in requested format
   - Research gaps identification
   - Zotero collection with all references

### Reasoning Approach

When conducting a literature review, think through:
1. **What is the current consensus?** — Identify the mainstream view on the topic.
2. **Where are the disagreements?** — Note conflicting results and methodological differences.
3. **What are the gaps?** — Identify what has NOT been studied or what data is missing.
4. **What is the trajectory?** — Note trends over time (improving efficiencies, new materials, shifting focus).
5. **What are the seminal papers?** — Identify the most-cited foundational works.

### Writing Style for Review Sections

- Use thematic organization, not paper-by-paper summaries
- Group findings by topic, methodology, or chronology
- Use comparative language: "While Smith et al. [1] reported η = 22.3%, subsequent work by Lee et al. [5] achieved η = 24.1% using a modified anti-reflection coating."
- Always include quantitative comparisons where possible
- Cite specific numbers from papers, not vague characterizations

---

## API Integration Instructions

### 1. Semantic Scholar API

**Base URL:** `https://api.semanticscholar.org/graph/v1`

**Search for Papers:**
```python
import requests

def search_semantic_scholar(query, limit=50, year_range=None,
                            fields_of_study=None, api_key=None):
    """
    Search Semantic Scholar for PV research papers.

    Parameters
    ----------
    query : str
        Search query (e.g., "perovskite solar cell degradation")
    limit : int
        Maximum results (up to 100 per request)
    year_range : str
        Year filter (e.g., "2020-2025")
    fields_of_study : list
        Filter by field (e.g., ["Materials Science", "Engineering"])
    api_key : str
        Optional API key for higher rate limits
    """
    url = 'https://api.semanticscholar.org/graph/v1/paper/search'
    headers = {}
    if api_key:
        headers['x-api-key'] = api_key

    params = {
        'query': query,
        'limit': min(limit, 100),
        'fields': 'title,authors,year,abstract,citationCount,'
                  'referenceCount,journal,externalIds,url,tldr',
    }
    if year_range:
        params['year'] = year_range
    if fields_of_study:
        params['fieldsOfStudy'] = ','.join(fields_of_study)

    response = requests.get(url, params=params, headers=headers)
    response.raise_for_status()
    return response.json()


def get_paper_details(paper_id, api_key=None):
    """Get detailed info for a specific paper by Semantic Scholar ID or DOI."""
    url = f'https://api.semanticscholar.org/graph/v1/paper/{paper_id}'
    headers = {}
    if api_key:
        headers['x-api-key'] = api_key

    params = {
        'fields': 'title,authors,year,abstract,citationCount,referenceCount,'
                  'journal,externalIds,url,tldr,references,citations,'
                  'fieldsOfStudy,publicationTypes'
    }
    response = requests.get(url, params=params, headers=headers)
    response.raise_for_status()
    return response.json()


def get_citation_network(paper_id, direction='citations', limit=100,
                         api_key=None):
    """
    Get papers that cite or are cited by a given paper.

    Parameters
    ----------
    direction : str
        'citations' (papers citing this one) or 'references' (papers this one cites)
    """
    url = f'https://api.semanticscholar.org/graph/v1/paper/{paper_id}/{direction}'
    headers = {}
    if api_key:
        headers['x-api-key'] = api_key

    params = {
        'fields': 'title,authors,year,citationCount,journal,externalIds',
        'limit': limit,
    }
    response = requests.get(url, params=params, headers=headers)
    response.raise_for_status()
    return response.json()
```

**PV-Specific Search Queries:**
```python
PV_SEARCH_TEMPLATES = {
    'efficiency_records': '"{technology}" solar cell efficiency record',
    'degradation': '"{technology}" PV module degradation {mechanism}',
    'reliability': 'photovoltaic reliability "{test_standard}" field data',
    'manufacturing': '"{technology}" solar cell manufacturing scale-up',
    'lcoe': 'levelized cost solar energy {region} {year}',
    'tandem': 'perovskite silicon tandem solar cell {aspect}',
    'bifacial': 'bifacial PV module {aspect} performance',
    'review': '"{technology}" solar cell review {year}',
}
```

---

### 2. Google Scholar (via Perplexity AI)

Direct Google Scholar scraping is unreliable. Instead, use Perplexity AI for Google Scholar-grade breadth with structured output.

**Perplexity AI Integration:**
```python
def search_perplexity(query, api_key):
    """
    Use Perplexity AI to search and synthesize recent literature.

    Returns a summary with inline citations and source URLs.
    """
    url = 'https://api.perplexity.ai/chat/completions'
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }
    payload = {
        'model': 'sonar',
        'messages': [
            {
                'role': 'system',
                'content': (
                    'You are a PV research literature assistant. '
                    'Search for and summarize recent academic papers. '
                    'Always include: author names, year, journal, '
                    'key quantitative findings (efficiency, degradation rate, '
                    'LCOE values), and DOIs where available.'
                ),
            },
            {
                'role': 'user',
                'content': query,
            },
        ],
    }
    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()
    return response.json()
```

---

### 3. Zotero Library Management

**Setup:**
```python
from pyzotero import zotero

def init_zotero(library_id, library_type='user', api_key=None):
    """
    Initialize Zotero connection.

    Parameters
    ----------
    library_id : str
        Zotero user ID or group ID
    library_type : str
        'user' or 'group'
    api_key : str
        Zotero API key (generate at zotero.org/settings/keys)
    """
    return zotero.Zotero(library_id, library_type, api_key)
```

**Add References to Zotero:**
```python
def add_paper_to_zotero(zot, paper_metadata, collection_key=None):
    """
    Add a paper to Zotero library from Semantic Scholar metadata.

    Parameters
    ----------
    zot : pyzotero.Zotero
        Initialized Zotero client
    paper_metadata : dict
        Paper metadata from Semantic Scholar
    collection_key : str
        Optional Zotero collection to add to
    """
    template = zot.item_template('journalArticle')
    template['title'] = paper_metadata.get('title', '')
    template['abstractNote'] = paper_metadata.get('abstract', '')
    template['date'] = str(paper_metadata.get('year', ''))

    # Set authors
    authors = paper_metadata.get('authors', [])
    template['creators'] = [
        {'creatorType': 'author',
         'firstName': a.get('name', '').split(' ')[0],
         'lastName': ' '.join(a.get('name', '').split(' ')[1:])}
        for a in authors
    ]

    # Set journal
    journal = paper_metadata.get('journal', {})
    if journal:
        template['publicationTitle'] = journal.get('name', '')
        template['volume'] = journal.get('volume', '')
        template['pages'] = journal.get('pages', '')

    # Set DOI
    ext_ids = paper_metadata.get('externalIds', {})
    if 'DOI' in ext_ids:
        template['DOI'] = ext_ids['DOI']

    # Set collections
    if collection_key:
        template['collections'] = [collection_key]

    resp = zot.create_items([template])
    return resp
```

**Search Zotero Library:**
```python
def search_zotero(zot, query, limit=25):
    """Search existing Zotero library for papers matching query."""
    items = zot.items(q=query, limit=limit)
    results = []
    for item in items:
        data = item['data']
        results.append({
            'key': item['key'],
            'title': data.get('title', ''),
            'authors': [c.get('lastName', '') for c in data.get('creators', [])],
            'year': data.get('date', ''),
            'journal': data.get('publicationTitle', ''),
            'doi': data.get('DOI', ''),
            'abstract': data.get('abstractNote', ''),
        })
    return results
```

**Generate Bibliography from Zotero Collection:**
```python
def export_bibliography(zot, collection_key, style='ieee'):
    """
    Export formatted bibliography from a Zotero collection.

    Parameters
    ----------
    style : str
        Citation style: 'ieee', 'apa', 'nature', 'elsevier-harvard',
        'springer-basic-author-date', 'chicago-author-date'
    """
    style_map = {
        'ieee': 'ieee',
        'apa': 'apa-7th-edition',
        'nature': 'nature',
        'elsevier-harvard': 'elsevier-harvard',
        'springer': 'springer-basic-author-date',
    }
    csl_style = style_map.get(style, style)

    items = zot.collection_items(collection_key, format='bib',
                                  style=csl_style)
    return items
```

---

### 4. Jenni.ai Writing Assistance

**Integration for paragraph-level writing support:**
```python
def jenni_assist(text, instruction, api_key):
    """
    Use Jenni.ai to improve or extend a literature review paragraph.

    Parameters
    ----------
    text : str
        Existing text to improve or extend
    instruction : str
        What to do: 'improve clarity', 'add transitions',
        'expand with more citations', 'simplify language'
    """
    url = 'https://api.jenni.ai/v1/assist'
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }
    payload = {
        'text': text,
        'instruction': instruction,
        'context': 'academic scientific writing, photovoltaic research',
    }
    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()
    return response.json()
```

---

### 5. CrossRef API (DOI Resolution & Metadata)

```python
def resolve_doi(doi):
    """Get full metadata for a paper from its DOI via CrossRef."""
    url = f'https://api.crossref.org/works/{doi}'
    headers = {
        'User-Agent': 'SuryaPrajna/1.0 (mailto:contact@suryaprajna.org)',
    }
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()['message']


def search_crossref(query, rows=25, filter_type=None):
    """
    Search CrossRef for papers.

    Parameters
    ----------
    filter_type : str
        Filter by type: 'journal-article', 'proceedings-article'
    """
    url = 'https://api.crossref.org/works'
    params = {
        'query': query,
        'rows': rows,
        'sort': 'relevance',
    }
    if filter_type:
        params['filter'] = f'type:{filter_type}'

    headers = {
        'User-Agent': 'SuryaPrajna/1.0 (mailto:contact@suryaprajna.org)',
    }
    response = requests.get(url, params=params, headers=headers)
    response.raise_for_status()
    return response.json()['message']['items']
```

---

### 6. Scopus API (Elsevier)

```python
def search_scopus(query, api_key, count=25):
    """
    Search Scopus for PV research papers.

    Requires an Elsevier API key (developer.elsevier.com).
    """
    url = 'https://api.elsevier.com/content/search/scopus'
    headers = {
        'X-ELS-APIKey': api_key,
        'Accept': 'application/json',
    }
    params = {
        'query': query,
        'count': count,
        'sort': '-citedby-count',
        'field': 'dc:title,dc:creator,prism:coverDate,'
                 'prism:publicationName,citedby-count,prism:doi,'
                 'dc:description',
    }
    response = requests.get(url, params=params, headers=headers)
    response.raise_for_status()
    return response.json()
```

---

## Auto-Citation Formatting

### Citation Style Templates

When inserting citations into manuscript text, format according to the target style:

**IEEE Style:**
```
In-text: "Recent advances in perovskite solar cells [1], [2] have demonstrated..."
Reference list:
[1] A. B. Author, C. D. Author, and E. F. Author, "Title of article,"
    J. Photovolt., vol. 12, no. 3, pp. 456–462, May 2022.
[2] G. Author, "Title," in Proc. IEEE PVSC, 2023, pp. 100–103.
```

**APA 7th Edition:**
```
In-text: "Recent studies (Author et al., 2022; Smith & Jones, 2023) show..."
Reference list:
Author, A. B., Author, C. D., & Author, E. F. (2022). Title of article.
    IEEE Journal of Photovoltaics, 12(3), 456–462.
    https://doi.org/10.1109/JPHOTOV.2022.XXXXXXX
```

**Nature Style:**
```
In-text: "Efficiency records continue to improve¹⁻³, with recent..."
Reference list:
1. Author, A. B., Author, C. D. & Author, E. F. Title of article.
   Nat. Energy 7, 456–462 (2022).
2. Author, G. Title. Science 380, 100–103 (2023).
```

**BibTeX Generation:**
```python
def paper_to_bibtex(paper, cite_key=None):
    """Convert Semantic Scholar paper metadata to BibTeX entry."""
    if cite_key is None:
        first_author = paper.get('authors', [{}])[0].get('name', 'Unknown')
        last_name = first_author.split()[-1] if first_author else 'Unknown'
        year = paper.get('year', 'XXXX')
        title_word = paper.get('title', 'untitled').split()[0].lower()
        cite_key = f'{last_name}{year}{title_word}'

    authors = ' and '.join(
        a.get('name', '') for a in paper.get('authors', [])
    )
    journal = paper.get('journal', {})

    entry = f"""@article{{{cite_key},
  title     = {{{paper.get('title', '')}}},
  author    = {{{authors}}},
  journal   = {{{journal.get('name', '')}}},
  volume    = {{{journal.get('volume', '')}}},
  pages     = {{{journal.get('pages', '')}}},
  year      = {{{paper.get('year', '')}}},
  doi       = {{{paper.get('externalIds', {}).get('DOI', '')}}},
}}"""
    return entry
```

---

## PRISMA-Style Systematic Review Protocol

For rigorous systematic reviews of PV research, follow this adapted PRISMA 2020 protocol:

### Phase 1: Identification

```
┌─────────────────────────────────────────────────────┐
│                  IDENTIFICATION                      │
│                                                      │
│  Semantic Scholar ──→ n = ___                        │
│  Scopus           ──→ n = ___                        │
│  Web of Science   ──→ n = ___                        │
│  IEEE Xplore      ──→ n = ___                        │
│  Other sources    ──→ n = ___                        │
│                                                      │
│  Total records identified: n = ___                   │
│  Duplicates removed:       n = ___                   │
└─────────────────────────┬───────────────────────────┘
                          │
```

### Phase 2: Screening

```
                          │
┌─────────────────────────▼───────────────────────────┐
│                    SCREENING                         │
│                                                      │
│  Records after duplicate removal: n = ___            │
│                                                      │
│  Title/abstract screening:                           │
│    Excluded — not PV related:     n = ___            │
│    Excluded — wrong technology:   n = ___            │
│    Excluded — wrong application:  n = ___            │
│    Excluded — not English:        n = ___            │
│    Excluded — preprint only:      n = ___            │
│                                                      │
│  Records passed screening: n = ___                   │
└─────────────────────────┬───────────────────────────┘
                          │
```

### Phase 3: Eligibility

```
                          │
┌─────────────────────────▼───────────────────────────┐
│                   ELIGIBILITY                        │
│                                                      │
│  Full-text articles assessed: n = ___                │
│                                                      │
│  Excluded — insufficient data:   n = ___             │
│  Excluded — methodology issues:  n = ___             │
│  Excluded — duplicate dataset:   n = ___             │
│  Excluded — out of scope:        n = ___             │
│                                                      │
│  Articles eligible: n = ___                          │
└─────────────────────────┬───────────────────────────┘
                          │
```

### Phase 4: Inclusion

```
                          │
┌─────────────────────────▼───────────────────────────┐
│                    INCLUDED                          │
│                                                      │
│  Studies included in qualitative synthesis:  n = ___ │
│  Studies included in quantitative synthesis: n = ___ │
│  (meta-analysis, if applicable)                      │
└─────────────────────────────────────────────────────┘
```

### Data Extraction Template

For each included paper, extract:

| Field | Description |
|-------|-------------|
| Citation | First author, year, journal |
| Technology | c-Si, perovskite, CdTe, CIGS, tandem, etc. |
| Scale | Cell / module / string / system |
| Sample Size | Number of devices/modules tested |
| Key Metric | Primary outcome (efficiency, degradation rate, LCOE, etc.) |
| Value ± Uncertainty | Quantitative result with error bounds |
| Test Conditions | STC, outdoor, accelerated, etc. |
| Duration | Test or monitoring period |
| Location | Geographic location (for field studies) |
| Methodology | Measurement technique, simulation tool |
| Limitations | Noted by authors |
| Quality Score | 1-5 based on methodology rigor |

---

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | string | Yes | Research topic or search query |
| `review_type` | string | No | "narrative", "systematic", "scoping", "meta-analysis" (default: "narrative") |
| `year_range` | string | No | Year range for search (e.g., "2020-2025", default: last 5 years) |
| `max_papers` | int | No | Maximum papers to include (default: 50) |
| `citation_style` | string | No | "ieee", "apa", "nature", "elsevier-harvard" (default: "ieee") |
| `databases` | list | No | Which databases to search (default: all available) |
| `output_format` | string | No | "narrative", "table", "bibtex", "zotero", "all" (default: "narrative") |
| `zotero_library_id` | string | No | Zotero library ID for reference management |
| `zotero_collection` | string | No | Zotero collection name to create/update |
| `include_prisma` | bool | No | Generate PRISMA flow diagram data (default: false for narrative) |
| `technology_filter` | string | No | PV technology to focus on |
