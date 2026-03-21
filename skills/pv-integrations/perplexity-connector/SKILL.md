---
name: perplexity-connector
version: 1.0.0
description: Real-time literature search and fact verification for PV research using Perplexity AI API. Provides up-to-date answers grounded in web sources, supplementing static knowledge bases with current developments.
author: SuryaPrajna Contributors
license: MIT
tags:
  - perplexity
  - real-time-search
  - fact-verification
  - literature-search
  - web-search
  - api-integration
dependencies:
  python:
    - requests>=2.31
    - anthropic>=0.25
  env:
    - PERPLEXITY_API_KEY
pack: pv-integrations
agent: Viveka-Agent
---

# perplexity-connector

Provides real-time literature search and fact verification for SuryaPrajna by integrating with the Perplexity AI API. Fills the gap between static knowledge bases (Pinecone) and curated reference libraries (Zotero) by enabling live web search with source citations for current PV research developments.

## LLM Behavioral Instructions

**When invoking this skill, the agent MUST:**

1. **Validate API key** — check `PERPLEXITY_API_KEY` is set before any request; halt and instruct user if missing.
2. **Use for recency, not authority** — explicitly frame Perplexity results as "current web sources" not "peer-reviewed literature"; always distinguish from indexed academic databases.
3. **Always return source URLs** — every factual claim from Perplexity MUST be accompanied by the source URL returned by the API; never strip citations.
4. **Verify critical facts with authoritative sources** — for regulatory/standards claims, cross-check against `scholar-gateway` or `pinecone-connector`; note when only Perplexity confirms a fact.
5. **Flag rapidly changing information** — for topics like PV module efficiency records, market prices, or policy updates, note that information may change and provide the retrieval date.
6. **Do not hallucinate beyond retrieved content** — if Perplexity does not return a result for a specific claim, do not supplement with LLM knowledge without explicitly flagging it as "background knowledge, not retrieved."
7. **Restrict to PV/energy domain by default** — always frame queries within solar/PV context to avoid off-topic results; alert user if query is broadened.
8. **Prefer `sonar-pro` model** — use `sonar-pro` for technical queries requiring deeper reasoning; use `sonar` for quick factual lookups.
9. **Deduplicate with indexed knowledge** — after retrieval, note if key results are already in the Pinecone index or Zotero library.
10. **Rate-limit awareness** — do not exceed 5 requests per minute; queue additional requests rather than failing silently.

## Capabilities

### 1. Real-Time Literature Search
- Search for recent PV papers, preprints, and research news
- Discover papers published within the last 6–12 months (beyond static index)
- Find conference proceedings from EUPVSEC, IEEE PVSC, WCPEC
- Track new efficiency records (NREL efficiency chart updates)

### 2. Fact Verification
- Verify specific technical claims (efficiency values, degradation rates, costs)
- Cross-check regulatory/policy information (MNRE guidelines, ITC rates)
- Confirm equipment prices and market benchmarks
- Validate IEC standard edition status (current vs. superseded)

### 3. Technology Trend Monitoring
- Search for recent developments in perovskite, TOPCon, HJT, tandem cells
- Monitor PV module price trends (BNEF, PV Magazine sources)
- Track utility-scale project announcements and records
- Follow inverter and tracker technology developments

### 4. Competitive Intelligence
- Search for recent company announcements and product launches
- Module manufacturer efficiency improvements
- LCOE trends by region and technology

### 5. Standards & Policy Updates
- Search for new or revised IEC/ISO standards
- Check current status of national PV policies (ALMM, PLI, ITC, FiT)
- Verify grid code updates by country

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query or question |
| `model` | string | No | `sonar` or `sonar-pro` (default: `sonar-pro`) |
| `mode` | string | No | `search`, `verify`, `monitor` (default: `search`) |
| `recency_filter` | string | No | `day`, `week`, `month`, `year` — filter by publication recency |
| `domain_restrict` | list | No | Restrict to specific domains (e.g., `["pv-magazine.com", "nrel.gov"]`) |
| `return_sources` | bool | No | Include source URLs in output (default: true, MUST NOT be false) |
| `max_sources` | integer | No | Max number of sources to return (default: 5) |
| `verify_claim` | string | Conditional | Specific claim to verify (required for `verify` mode) |

## Example Usage

### Recent Research Discovery

```
Prompt: "Search for papers or announcements about perovskite-silicon
tandem solar cells achieving over 30% efficiency published in 2024 or 2025."
```

**Agent behavior:**
1. Perplexity sonar-pro query with recency filter `year`
2. Return findings with: source title, URL, date, key efficiency value reported
3. Flag: "These are web-sourced results; verify in peer-reviewed databases via scholar-gateway."

**Expected output:**

> **Result 1** — "LONGi claims 34.6% perovskite-silicon tandem efficiency record" (PV Magazine, Nov 2024)
> Source: https://www.pv-magazine.com/...
> Key claim: 34.6% certified efficiency for 1cm² cell.
>
> ⚠️ Note: Retrieval date 2026-03-21. Efficiency records change frequently. Verify with NREL efficiency chart.

### Fact Verification

```
Prompt: "Verify: Is IEC 61730-1:2023 the current edition of the PV
module safety standard, or has a newer edition been published?"
```

**Agent behavior:**
1. Perplexity search: "IEC 61730-1 current edition 2024 2025"
2. Return sources confirming or contradicting the claim
3. Cross-check against `scholar-gateway` CrossRef results for IEC publications
4. Report: "Confirmed current as of [retrieval date]" OR "Superseded by [edition]"

### Policy Update Monitoring

```
Prompt: "What are the latest MNRE policy updates for solar manufacturing
incentives in India published in 2025?"
```

**Agent behavior:**
1. Perplexity search with domain focus on MNRE, PIB, and Indian policy sources
2. Return policy announcements with publication dates
3. Flag: "Policy information is time-sensitive; verify at official MNRE portal."

### Efficiency Record Check

```
Prompt: "What is the current world record efficiency for single-junction
crystalline silicon solar cells?"
```

**Agent behavior:**
1. Perplexity query: "world record silicon solar cell efficiency NREL 2025"
2. Return latest NREL chart reference and record value
3. Include source URL, record holder, and date certified
4. Note: "Records are updated continuously; check NREL chart directly."

## Source Trust Hierarchy

When evaluating Perplexity-returned sources, apply this trust ranking:

| Trust Level | Sources |
|-------------|---------|
| **High** | nrel.gov, iea.org, iec.ch, nature.com, sciencedirect.com, ieee.org |
| **Medium** | pv-magazine.com, pv-tech.org, bnef.com, energymonitor.ai |
| **Low** | Press releases, company blogs, unverified news sites |
| **Verify separately** | Wikipedia, forums, social media |

Always report source trust level alongside results.

## Complementary Search Strategy

```
Query type                    Recommended source
─────────────────────────────────────────────────
Foundational theory           → pinecone-connector (indexed papers)
Peer-reviewed research        → scholar-gateway (Semantic Scholar/Scopus)
Curated references            → zotero-connector (library)
Recent news (< 6 months)      → perplexity-connector ← THIS SKILL
Real-time standards status    → perplexity-connector + crossref
```

## Error Handling

| Error | Agent Action |
|-------|-------------|
| `PERPLEXITY_API_KEY` missing | Halt; provide setup instructions |
| No results returned | Suggest rephrasing query; try broader terms |
| Sources below trust threshold | Flag low-trust sources prominently |
| Rate limit hit | Queue request; retry after 12s |
| API timeout | Retry once after 5s; fall back to scholar-gateway |
| Claim not verifiable | Report "Cannot verify from web sources"; note uncertainty |

## Related Skills

- `pinecone-connector` — Semantic search over static indexed corpus
- `scholar-gateway` — Authoritative peer-reviewed paper search
- `zotero-connector` — Reference library management
- `jenni-connector` — Write with retrieved current knowledge
