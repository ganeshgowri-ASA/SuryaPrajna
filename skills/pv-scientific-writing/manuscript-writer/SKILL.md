---
name: manuscript-writer
version: 1.0.0
description: >
  Write publication-ready scientific manuscripts for photovoltaic research.
  Includes publisher-specific formatting for Wiley, Elsevier, IEEE, Springer,
  Nature, and SPIE journals with LaTeX/Markdown templates, structured
  section-by-section authoring, and explicit LLM behavioral instructions.
author: SuryaPrajna Contributors
license: MIT
tags:
  - scientific-writing
  - manuscript
  - publishing
  - latex
  - photovoltaic
  - journal-formatting
dependencies:
  python:
    - jinja2>=3.1
    - pyyaml>=6.0
  data:
    - Research topic or abstract
    - Experimental data and results (optional)
    - Target journal name
pack: pv-scientific-writing
agent: Grantha-Agent
---

# manuscript-writer

Write publication-ready scientific manuscripts for photovoltaic research across all major PV journals. This skill provides the LLM with explicit behavioral instructions, publisher-specific formatting templates, and a structured authoring workflow.

---

## LLM Behavioral Instructions

> **These instructions define HOW you must think, reason, and produce output when this skill is invoked.**

### Core Authoring Protocol

When asked to write a scientific manuscript, follow this exact sequence:

1. **Clarify Scope** — Before writing anything, confirm:
   - Target journal (e.g., "Progress in Photovoltaics", "Solar Energy", "Nature Energy")
   - Manuscript type: original research article, review, letter/communication, conference proceeding
   - Key findings or thesis statement (1–2 sentences)
   - Available data: experimental results, simulation outputs, literature sources

2. **Generate Structured Outline** — Produce a section-by-section outline BEFORE drafting prose:
   ```
   Title: [Descriptive, specific, ≤15 words]
   Authors: [To be filled]
   Abstract: [structured: background → method → results → conclusion, ≤250 words]
   Keywords: [5–8 terms, include standard PV terminology]
   1. Introduction
      1.1 Context and motivation
      1.2 State of the art (cite 10–20 key references)
      1.3 Knowledge gap
      1.4 Objective and contribution statement
   2. Theory / Background (if applicable)
   3. Experimental / Methods
      3.1 Materials and device fabrication
      3.2 Characterization techniques
      3.3 Simulation methodology (if applicable)
   4. Results and Discussion
      4.1 [Result theme 1]
      4.2 [Result theme 2]
      4.3 Comparison with literature
   5. Conclusions
   Acknowledgments
   Data Availability Statement
   References
   Supporting Information / Appendix
   ```

3. **Draft Section-by-Section** — Write each section following these rules:
   - **Introduction**: Start broad (global energy context), narrow to specific PV technology, identify the gap, state contribution. Use present tense for established facts, past tense for prior work.
   - **Methods**: Use past tense, passive voice. Specify ALL parameters with units: "Films were deposited by spin-coating at 3000 rpm for 30 s" not "Films were spin-coated."
   - **Results**: Present data systematically. Reference every figure and table in order. Compare quantitatively: "The PCE improved from 18.2% to 21.7%, a relative increase of 19.2%."
   - **Discussion**: Interpret results, compare with literature values (cite specific numbers), address limitations honestly.
   - **Conclusions**: No new data. Restate key findings and their significance. Suggest future work.

4. **Apply Journal Style** — Format according to the target publisher's requirements (see Publisher Templates below).

5. **Self-Review Checklist** — Before presenting the final manuscript, verify:
   - [ ] All figures and tables referenced in text
   - [ ] All acronyms defined at first use (PV, PCE, EQE, STC, etc.)
   - [ ] Units in SI with proper formatting (kWh/m², W/m², °C, mA/cm²)
   - [ ] Citation format matches journal style
   - [ ] Abstract within word limit
   - [ ] Data availability statement included
   - [ ] Conflict of interest statement included

### Writing Quality Standards

- **Precision over elegance**: Use exact numbers, uncertainties, and units. "η = 23.4 ± 0.3%" not "high efficiency."
- **Active voice preferred** for clarity: "We measured the I-V curves" over "The I-V curves were measured" (except in Methods where passive is conventional).
- **Avoid vague qualifiers**: Replace "significant improvement" with "a 2.3 percentage point improvement (p < 0.01)."
- **PV-specific terminology**: Use standard terms — "power conversion efficiency (PCE)" not "solar cell efficiency," "short-circuit current density (J_SC)" not "current."
- **Figure references**: Always "(Fig. 1a)" or "(Figure 1a)" depending on journal style, never "the figure below."

### Reasoning Approach

When generating manuscript content, think through:
1. **What claim am I making?** — Every paragraph should support a clear claim.
2. **What evidence supports it?** — Cite data (yours or literature).
3. **What are the limitations?** — Acknowledge measurement uncertainty, sample size, scope.
4. **How does this connect?** — Each paragraph should logically flow from the previous one.

---

## Publisher Templates

### 1. Wiley — Progress in Photovoltaics / Solar RRL

**Formatting Rules:**
- Double-spaced, 12pt Times New Roman
- Abstract: ≤250 words (unstructured for Prog. PV; structured for Solar RRL)
- References: numbered in order of appearance, Vancouver style
- Figures: submitted as separate high-resolution files (300 dpi minimum)
- Keywords: 5–6 terms
- Sections: Introduction, Experimental, Results and Discussion, Conclusions
- Supporting Information referenced as "Supporting Information, Figure S1"

**LaTeX Template:**
```latex
\documentclass[12pt]{article}
\usepackage[utf8]{inputenc}
\usepackage{times}
\usepackage[margin=1in]{geometry}
\usepackage{setspace}
\usepackage{graphicx}
\usepackage{amsmath}
\usepackage{siunitx}
\usepackage[numbers,sort&compress]{natbib}
\usepackage{hyperref}

\doublespacing

\title{Title of the Manuscript}
\author{Author One\textsuperscript{1*}, Author Two\textsuperscript{2} \\
  \textsuperscript{1}Department, University, City, Country \\
  \textsuperscript{2}Department, University, City, Country \\
  *Corresponding author: email@example.com}
\date{}

\begin{document}
\maketitle

\begin{abstract}
% ≤250 words. Background, methods, key results, conclusions.
\end{abstract}

\noindent\textbf{Keywords:} keyword1, keyword2, keyword3, keyword4, keyword5

\section{Introduction}
\section{Experimental}
  \subsection{Materials and Device Fabrication}
  \subsection{Characterization}
\section{Results and Discussion}
\section{Conclusions}

\section*{Acknowledgments}
\section*{Data Availability Statement}
\section*{Conflict of Interest}
The authors declare no conflict of interest.

\bibliographystyle{unsrtnat}
\bibliography{references}

\end{document}
```

**BibTeX Style:** `unsrtnat` (numbered, order of appearance)

**Markdown Export:**
```markdown
# Title of the Manuscript

**Authors:** Author One¹*, Author Two²
¹Department, University, City, Country
²Department, University, City, Country
*Corresponding author: email@example.com

## Abstract
[≤250 words]

**Keywords:** keyword1, keyword2, keyword3, keyword4, keyword5

## 1. Introduction
## 2. Experimental
### 2.1 Materials and Device Fabrication
### 2.2 Characterization
## 3. Results and Discussion
## 4. Conclusions
## Acknowledgments
## Data Availability Statement
## Conflict of Interest
## References
```

---

### 2. Elsevier — Solar Energy / Solar Energy Materials & Solar Cells

**Formatting Rules:**
- Single-column, double-spaced for review
- Abstract: ≤300 words (highlights required: 3–5 bullet points, ≤85 characters each)
- References: numbered, Elsevier Harvard style (author-year in text, numbered in reference list)
- Graphical abstract required (dimensions: 531 × 1328 pixels)
- Keywords: 4–6 terms from Elsevier keyword list
- CRediT author statement required

**LaTeX Template:**
```latex
\documentclass[review,authoryear]{elsarticle}
\usepackage[utf8]{inputenc}
\usepackage{graphicx}
\usepackage{amsmath}
\usepackage{siunitx}
\usepackage{hyperref}
\usepackage{lineno}
\modulolinenumbers[5]

\journal{Solar Energy}

\begin{document}

\begin{frontmatter}

\title{Title of the Manuscript}

\author[aff1]{Author One\corref{cor1}}
\ead{email@example.com}
\author[aff2]{Author Two}

\cortext[cor1]{Corresponding author}
\affiliation[aff1]{organization={Department, University},
  city={City}, country={Country}}
\affiliation[aff2]{organization={Department, University},
  city={City}, country={Country}}

\begin{abstract}
% ≤300 words
\end{abstract}

\begin{keyword}
keyword1 \sep keyword2 \sep keyword3 \sep keyword4
\end{keyword}

\begin{highlights}
\item Highlight 1 (≤85 characters)
\item Highlight 2
\item Highlight 3
\end{highlights}

\end{frontmatter}

\linenumbers

\section{Introduction}
\section{Materials and Methods}
  \subsection{Materials}
  \subsection{Device Fabrication}
  \subsection{Characterization}
\section{Results and Discussion}
\section{Conclusions}

\section*{CRediT Author Statement}
% e.g., Author One: Conceptualization, Methodology, Writing – original draft.

\section*{Declaration of Competing Interest}
\section*{Acknowledgments}
\section*{Data Availability}

\bibliographystyle{elsarticle-harv}
\bibliography{references}

\end{document}
```

**BibTeX Style:** `elsarticle-harv` or `elsarticle-num`

**Markdown Export:**
```markdown
# Title of the Manuscript

**Authors:** Author One¹*, Author Two²

## Highlights
- Highlight 1 (≤85 characters)
- Highlight 2
- Highlight 3

## Abstract
[≤300 words]

**Keywords:** keyword1, keyword2, keyword3, keyword4

## 1. Introduction
## 2. Materials and Methods
### 2.1 Materials
### 2.2 Device Fabrication
### 2.3 Characterization
## 3. Results and Discussion
## 4. Conclusions
## CRediT Author Statement
## Declaration of Competing Interest
## Acknowledgments
## Data Availability
## References
```

---

### 3. IEEE — Journal of Photovoltaics (JPHOTOV) / PVSC Proceedings

**Formatting Rules:**
- Two-column format, 10pt Times New Roman
- Abstract: ≤200 words
- References: IEEE numbered style [1], [2], [3]
- Index terms (not keywords)
- Figures embedded in columns
- PVSC proceedings: 4–6 pages; journal: no strict limit

**LaTeX Template:**
```latex
\documentclass[journal]{IEEEtran}
\usepackage[utf8]{inputenc}
\usepackage{graphicx}
\usepackage{amsmath}
\usepackage{siunitx}
\usepackage{cite}
\usepackage{hyperref}

\begin{document}

\title{Title of the Manuscript}

\author{Author~One,~\IEEEmembership{Member,~IEEE,}
  and~Author~Two
  \thanks{Author One is with the Department, University, City, Country
    (e-mail: email@example.com).}
  \thanks{Author Two is with the Department, University, City, Country.}}

\markboth{IEEE Journal of Photovoltaics, Vol.~XX, No.~X, Month~Year}
{Author One \MakeLowercase{\textit{et al.}}: Short Title}

\maketitle

\begin{abstract}
% ≤200 words
\end{abstract}

\begin{IEEEkeywords}
Photovoltaic, solar cell, keyword3, keyword4.
\end{IEEEkeywords}

\section{Introduction}
\IEEEPARstart{T}{he} first letter is a drop cap...

\section{Experimental Setup}
\section{Results}
\section{Discussion}
\section{Conclusion}

\appendices
\section{Supplementary Data}

\section*{Acknowledgment}

\bibliographystyle{IEEEtran}
\bibliography{references}

\end{document}
```

**BibTeX Style:** `IEEEtran`

**Markdown Export (PVSC Proceedings):**
```markdown
# Title of the Manuscript

**Authors:** Author One¹, Author Two²

## Abstract
[≤200 words]

**Index Terms:** Photovoltaic, solar cell, keyword3, keyword4

## I. Introduction
## II. Experimental Setup
## III. Results
## IV. Discussion
## V. Conclusion
## Acknowledgment
## References
[1] A. Author, "Title," *Journal*, vol. X, no. Y, pp. Z–Z, Year.
```

---

### 4. Springer — Nature Energy / Scientific Reports

**Formatting Rules:**
- **Nature Energy**: ≤3000 words (Article), ≤1500 words (Letter); ≤150 word abstract
- **Scientific Reports**: no strict word limit; ≤200 word abstract
- References: Nature style — numbered superscript in text, numbered list
- Methods section at end (Nature Energy) or inline (Scientific Reports)
- Data availability and code availability statements mandatory
- Competing interests statement mandatory

**LaTeX Template (Nature-style):**
```latex
\documentclass[12pt]{article}
\usepackage[utf8]{inputenc}
\usepackage{times}
\usepackage[margin=1in]{geometry}
\usepackage{setspace}
\usepackage{graphicx}
\usepackage{amsmath}
\usepackage{siunitx}
\usepackage[super,sort&compress]{natbib}
\usepackage{hyperref}

\doublespacing

\title{Title of the Manuscript}
\author{Author One\textsuperscript{1*}, Author Two\textsuperscript{2}}
\date{}

\begin{document}
\maketitle

\noindent\textsuperscript{1}Department, University, City, Country \\
\textsuperscript{2}Department, University, City, Country \\
*e-mail: email@example.com

\begin{abstract}
% Nature Energy: ≤150 words. Scientific Reports: ≤200 words.
% Single paragraph, no references.
\end{abstract}

\section*{Introduction}  % Nature: unnumbered sections
\section*{Results}
  \subsection*{Subsection Title}
\section*{Discussion}

\section*{Methods}  % Nature Energy: Methods at end
  \subsection*{Device Fabrication}
  \subsection*{Characterization}
  \subsection*{Statistical Analysis}

\section*{Data Availability}
\section*{Code Availability}
\section*{Acknowledgments}
\section*{Author Contributions}
\section*{Competing Interests}
The authors declare no competing interests.

\section*{Additional Information}
Supplementary information is available for this paper.

\bibliographystyle{naturemag}
\bibliography{references}

\end{document}
```

**BibTeX Style:** `naturemag`

**Markdown Export:**
```markdown
# Title of the Manuscript

**Authors:** Author One¹*, Author Two²

## Abstract
[≤150 words for Nature Energy / ≤200 words for Scientific Reports]

## Introduction
## Results
### Subsection Title
## Discussion
## Methods
### Device Fabrication
### Characterization
### Statistical Analysis
## Data Availability
## Code Availability
## Acknowledgments
## Author Contributions
## Competing Interests
## References
```

---

### 5. SPIE — Journal of Photonics for Energy

**Formatting Rules:**
- Single-column for review, two-column for publication
- Abstract: ≤250 words
- References: numbered in order of citation
- Keywords: 5–8 terms
- SPIE proceedings: 8–12 pages typical

**LaTeX Template:**
```latex
\documentclass[]{spiejour}
\usepackage{graphicx}
\usepackage{amsmath}
\usepackage{siunitx}

\title{Title of the Manuscript}

\author[a]{Author One}
\author[b]{Author Two}
\affil[a]{Department, University, City, Country}
\affil[b]{Department, University, City, Country}

\authorinfo{Further author information: E-mail: email@example.com}

\begin{document}
\maketitle

\begin{abstract}
% ≤250 words
\end{abstract}

\keywords{photovoltaic, solar energy, keyword3, keyword4, keyword5}

\section{INTRODUCTION}
\section{METHODOLOGY}
\section{RESULTS AND DISCUSSION}
\section{CONCLUSIONS}

\acknowledgments
Text of acknowledgments.

\bibliography{references}
\bibliographystyle{spiejour}

\end{document}
```

**BibTeX Style:** `spiejour`

---

### 6. Nature (Main Journal + Nature Sustainability)

**Formatting Rules:**
- **Nature (main)**: Article ≤5000 words, Letter ≤3000 words; abstract ≤150 words (no references in abstract)
- **Nature Sustainability**: Article ≤4000 words; abstract ≤150 words
- Sections unnumbered: Introduction → Results → Discussion → Methods (end)
- Extended Data (up to 10 figures/tables)
- Supplementary Information as separate file
- Online Methods section separate from main text

Uses the same LaTeX template as Springer/Nature Energy above with `naturemag` bibliography style.

---

## Example Prompts and Expected Outputs

### Example 1: Starting a Manuscript

**Prompt:**
> Write a manuscript for Progress in Photovoltaics on bifacial perovskite/silicon tandem solar cells achieving 30% efficiency.

**Expected Output Flow:**
1. Confirm target: Progress in Photovoltaics (Wiley), original research article
2. Generate outline with PV-specific sections
3. Draft each section with:
   - Introduction citing recent tandem efficiency records (Helmholtz-Zentrum Berlin 32.5%, LONGi 33.9%)
   - Methods specifying perovskite composition (e.g., Cs₀.₀₅FA₀.₈MA₀.₁₅PbI₂.₅₅Br₀.₄₅), deposition parameters
   - Results with J-V curves, EQE data, bifaciality factor
   - Discussion comparing with state-of-the-art
4. Format in Wiley style with `unsrtnat` bibliography

### Example 2: Review Article

**Prompt:**
> Write a review article for Solar Energy Materials & Solar Cells on degradation mechanisms in perovskite solar cells.

**Expected Output Flow:**
1. Confirm target: SEMSC (Elsevier), review article
2. Comprehensive outline covering: moisture, thermal, light-induced, ion migration degradation
3. Systematic literature survey structure with comparison tables
4. Elsevier formatting with highlights, graphical abstract description, CRediT statement

### Example 3: Conference Paper

**Prompt:**
> Write a 5-page PVSC proceedings paper on machine learning for PV fault detection using EL imaging.

**Expected Output Flow:**
1. Confirm target: IEEE PVSC proceedings, 5 pages, two-column
2. Concise outline (4 sections max for page limit)
3. Draft with IEEE formatting, `\IEEEPARstart`, index terms
4. Focus on methodology and results (limited space for background)

---

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `target_journal` | string | Yes | Target journal or conference name |
| `manuscript_type` | string | Yes | "article", "review", "letter", "proceedings", "communication" |
| `topic` | string | Yes | Research topic or thesis statement |
| `data_available` | bool | No | Whether experimental/simulation data is provided (default: false) |
| `word_limit` | int | No | Override default word limit for the target journal |
| `sections` | list | No | Custom section list (overrides default structure) |
| `output_format` | string | No | "latex", "markdown", or "both" (default: "latex") |
| `include_bib_template` | bool | No | Include a BibTeX template file (default: true) |

---

## PV-Specific Writing Guidance

### Common PV Metrics to Report
| Metric | Symbol | Unit | Context |
|--------|--------|------|---------|
| Power Conversion Efficiency | PCE or η | % | Always at STC unless stated |
| Short-circuit Current Density | J_SC | mA/cm² | Normalized to cell area |
| Open-circuit Voltage | V_OC | V or mV | |
| Fill Factor | FF | % or fraction | |
| External Quantum Efficiency | EQE | % | Wavelength-dependent |
| Series Resistance | R_S | Ω·cm² | From light/dark J-V |
| Shunt Resistance | R_SH | Ω·cm² | From light/dark J-V |
| Degradation Rate | R_d | %/year | Specify LID, LeTID, PID |
| Performance Ratio | PR | % or fraction | System-level metric |
| Specific Yield | Y_f | kWh/kWp | Annual or period-specific |

### Standard Test Conditions (STC)
Always state measurement conditions: irradiance (1000 W/m²), cell temperature (25 °C), AM1.5G spectrum. For module-level: specify NOCT or NMOT conditions.

### Common Abbreviations (Define at First Use)
PV, PCE, EQE, IQE, J-V, STC, NOCT, NMOT, AM1.5G, BOS, LCOE, PR, GHI, DNI, DHI, LID, LeTID, PID, FMEA, MTBF, BoM, CTM, EL, IR, XRD, SEM, TEM, AFM, PL, TRPL, UPS, XPS
