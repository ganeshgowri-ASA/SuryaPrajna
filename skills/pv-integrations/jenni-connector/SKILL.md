---
name: jenni-connector
version: 1.0.0
description: AI writing assistance and literature review augmentation for PV scientific content via Jenni.ai API. Enables LLM agents to generate, improve, and complete technical PV writing with citation-grounded AI assistance.
author: SuryaPrajna Contributors
license: MIT
tags:
  - jenni-ai
  - writing-assistance
  - literature-review
  - technical-writing
  - api-integration
  - content-generation
dependencies:
  python:
    - requests>=2.31
    - anthropic>=0.25
  env:
    - JENNI_AI_KEY
    - ANTHROPIC_API_KEY
pack: pv-integrations
agent: Viveka-Agent
---

# jenni-connector

Provides AI writing assistance and literature review augmentation for SuryaPrajna by integrating with Jenni.ai. Helps PV engineers and researchers draft, improve, and complete technical documents including reports, paper sections, executive summaries, and literature reviews with citation support.

## LLM Behavioral Instructions

**When invoking this skill, the agent MUST:**

1. **Validate API key** — check that `JENNI_AI_KEY` is set before proceeding; halt and instruct user if missing.
2. **Scope output to PV domain** — always frame writing tasks within the photovoltaic/solar energy domain; reject or redirect clearly off-topic requests.
3. **Never generate fabricated citations** — only include citations that are explicitly provided or retrieved via `zotero-connector` or `scholar-gateway`; never invent references.
4. **Maintain technical accuracy** — all generated content about PV physics, standards, or performance must be scientifically accurate; flag uncertainty explicitly.
5. **Preserve author voice** — when improving existing text, retain the author's terminology and style unless asked to rewrite completely.
6. **Use SI units** — all generated PV content must use SI units (W, kWh, W/m², °C) as primary; include imperial conversions only if requested.
7. **Cite standards by full designation** — IEC, ISO, ASTM standards must be cited with year (e.g., IEC 61215-2:2021).
8. **Disclose AI generation** — when producing substantial new content, note at the end: "Generated with AI assistance — verify technical claims before publication."
9. **Request context before writing** — for complex sections (e.g., experimental methods), ask for key parameters before generating rather than assuming.
10. **Iterative refinement** — present generated content as a draft; offer to refine specific sections on request.

## Capabilities

### 1. Technical Section Writing
- Abstract, introduction, methodology, results, and conclusion drafting
- Executive summary generation for technical reports
- Discussion section writing with literature context
- Conclusions and recommendations drafting

### 2. Literature Review Augmentation
- Structure literature reviews by theme or chronology
- Synthesize findings from multiple retrieved papers
- Identify research gaps from indexed literature
- Generate transition paragraphs connecting cited works

### 3. Document Improvement
- Grammar, clarity, and flow enhancement for technical PV text
- Passive-to-active voice conversion
- Jargon simplification for non-specialist audiences
- Abstract rewriting for conference/journal submissions

### 4. Citation Integration
- Insert inline citations from Zotero or Scholar Gateway results
- Format reference lists in IEEE, APA, or Vancouver style
- Ensure citation consistency throughout a document
- Flag uncited claims for user review

### 5. Template Population
- Fill SuryaPrajna report templates with user-provided data
- Generate standardized test report narratives from raw data
- Auto-populate compliance document sections

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `task` | string | Yes | `draft`, `improve`, `summarize`, `literature_review`, `complete`, `reformat` |
| `content` | string | Conditional | Existing text to improve/complete (required for `improve`, `complete`) |
| `topic` | string | Conditional | Topic for new content (required for `draft`, `literature_review`) |
| `citations` | list | No | List of citation objects `{title, authors, year, doi}` to include |
| `style` | string | No | Citation style: `ieee`, `apa`, `vancouver` (default: `ieee`) |
| `audience` | string | No | `technical`, `executive`, `general` (default: `technical`) |
| `word_limit` | integer | No | Approximate word count for output (default: varies by task) |
| `tone` | string | No | `formal`, `neutral`, `accessible` (default: `formal`) |
| `domain_focus` | string | No | PV subdomain to focus on: `materials`, `testing`, `energy`, etc. |

## Example Usage

### Draft an Abstract

```
Prompt: "Write a technical abstract for a paper on LeTID degradation
in bifacial PERC modules under outdoor conditions. Include these
findings: 3.2% average power loss after 1000h at 75°C, recovery
observed above 200°C annealing."
```

**Agent behavior:**
1. Confirm domain scope (PV reliability, degradation)
2. Request any missing context (module specs, measurement method)
3. Draft abstract (~250 words) with: background, objective, methods, results, conclusion
4. Offer inline citation placeholders `[1]` for user to populate
5. Append: "Generated with AI assistance — verify technical claims before publication."

### Literature Review Section

```
Prompt: "Write a literature review section on perovskite stability
mechanisms using the 5 papers retrieved from our knowledge base."
```

**Agent behavior:**
1. Receive retrieved papers (title, year, DOI, key findings)
2. Organize by theme: intrinsic degradation, moisture stability, thermal stability
3. Generate cohesive paragraphs with inline citations
4. Identify gaps: "No studies addressed outdoor degradation beyond 2 years..."
5. Return structured text with formatted reference list

### Improve Existing Text

```
Prompt: "Improve the clarity of this methodology section while keeping
all technical details intact. It describes our TC200 thermal cycling
test procedure."
```

**Expected behavior:**
- Preserve all numerical values (temperatures, ramp rates, cycles)
- Improve sentence flow and eliminate redundancy
- Keep passive constructions where required by IEC standard language
- Return improved text with tracked changes highlighted

### Executive Summary Generation

```
Prompt: "Generate a 1-page executive summary of this PV reliability
test report for a non-technical investor audience."
```

**Agent behavior:**
1. Extract key findings: modules tested, pass/fail rates, power loss
2. Replace technical jargon with plain language equivalents
3. Highlight business implications (warranty impact, project risk)
4. Format as: Overview → Key Findings → Recommendations

## Output Quality Guidelines

All generated content MUST:
- Use correct PV terminology (e.g., "STC" not "standard conditions")
- Reference correct standard numbers when applicable
- Include units on all numerical values
- Distinguish between measured and modeled/predicted values
- Not extrapolate beyond provided data

## Integration Workflow

```
User writing task
      │
      ▼
Context gathering (topic, citations, parameters)
      │
      ├── Retrieve context → pinecone-connector / scholar-gateway
      │
      ▼
Jenni.ai API call (with domain-scoped prompt)
      │
      ▼
Post-processing (citation formatting, unit checks)
      │
      ▼
Draft output with improvement suggestions
      │
      ▼
Iterative refinement on request
```

## Error Handling

| Error | Agent Action |
|-------|-------------|
| `JENNI_AI_KEY` missing | Halt; provide setup instructions |
| Off-topic request | Redirect; ask user to clarify PV relevance |
| Fabricated citation risk | Reject citation; request verified source |
| Technical inaccuracy detected | Flag with note; ask user to verify |
| API timeout | Retry once after 5s; report failure |

## Related Skills

- `pinecone-connector` — Retrieve indexed PV literature for context
- `zotero-connector` — Get formatted citations for insertion
- `scholar-gateway` — Discover new papers for literature review
- `perplexity-connector` — Verify recent facts and findings
