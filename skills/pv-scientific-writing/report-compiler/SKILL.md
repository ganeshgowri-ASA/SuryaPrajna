---
name: report-compiler
version: 1.0.0
description: >
  Compile multi-section scientific reports and technical documents for PV
  research. Assembles outputs from multiple skills into cohesive reports
  with table of contents, list of figures/tables, cross-references,
  citation linking, and PDF/LaTeX/Word export pipelines.
author: SuryaPrajna Contributors
license: MIT
tags:
  - report
  - compilation
  - latex
  - pdf
  - technical-writing
  - cross-referencing
  - photovoltaic
dependencies:
  python:
    - jinja2>=3.1
    - pyyaml>=6.0
    - pandas>=2.0
    - python-docx>=0.8.11
    - pypandoc>=1.12
    - weasyprint>=60.0
  system:
    - pandoc>=3.0 (for format conversion)
    - texlive (for LaTeX compilation)
  data:
    - Section content from other skills (manuscript-writer, figure-generator, etc.)
    - Report metadata (title, authors, project ID)
pack: pv-scientific-writing
agent: Grantha-Agent
---

# report-compiler

Compile multi-section scientific reports and technical documents for PV research. This skill assembles outputs from multiple SuryaPrajna skills into cohesive, publication-ready documents with automated table of contents, cross-references, and multi-format export.

---

## LLM Behavioral Instructions

> **These instructions define HOW you must think, reason, and produce output when this skill is invoked.**

### Core Compilation Protocol

When asked to compile a report, follow this exact sequence:

1. **Gather Inputs** — Collect all section content, figures, tables, and references:
   - Identify which SuryaPrajna skills produced each section
   - Check for completeness: are all planned sections present?
   - Verify figure files exist and are referenced correctly
   - Collect all BibTeX entries into a unified `.bib` file

2. **Define Report Structure** — Create a document plan:
   ```
   Report Structure:
   ├── Cover Page (title, authors, date, organization, project ID)
   ├── Executive Summary / Abstract
   ├── Table of Contents (auto-generated)
   ├── List of Figures (auto-generated)
   ├── List of Tables (auto-generated)
   ├── List of Abbreviations
   ├── 1. Introduction
   ├── 2. [Technical Section 1]
   ├── 3. [Technical Section 2]
   ├── ...
   ├── N. Conclusions and Recommendations
   ├── References
   ├── Appendix A: [Supporting Data]
   ├── Appendix B: [Detailed Methods]
   └── Appendix C: [Raw Data Tables]
   ```

3. **Assemble and Cross-Reference** — Merge sections while ensuring:
   - All figure references (`Fig. 1`, `Figure 1`) point to correct figures
   - All table references (`Table 1`) are correctly numbered
   - All equation references (`Eq. 1`) are sequential
   - All citations (`[1]`, `(Author, 2023)`) are consistent and resolved
   - Section numbering is continuous across merged content
   - Page numbers are correct (for paginated formats)

4. **Generate Front Matter** — Auto-create:
   - Table of Contents with page numbers
   - List of Figures with captions and page numbers
   - List of Tables with captions and page numbers
   - List of Abbreviations (scan text for PV acronyms, define each)

5. **Generate Back Matter** — Auto-create:
   - Unified reference list (merged from all sections, deduplicated)
   - Appendices with proper numbering (A, B, C...)
   - Document revision history (if applicable)

6. **Export** — Generate the final document in requested format(s).

### Quality Checks Before Export

Before finalizing, verify:
- [ ] All cross-references resolve (no "??" or "[?]" in output)
- [ ] Figure numbering is sequential (no gaps, no duplicates)
- [ ] Table numbering is sequential
- [ ] All citations in text appear in reference list (and vice versa)
- [ ] Units are consistent throughout (SI, with conversions where needed)
- [ ] Page breaks are sensible (no orphan headings, no split tables)
- [ ] Headers/footers contain correct document info
- [ ] Cover page has all required fields

### Reasoning Approach

When compiling a report, think through:
1. **What is the narrative arc?** — Sections should tell a coherent story, not just be concatenated.
2. **What transitions are needed?** — Add bridging text between sections from different skills.
3. **What redundancy exists?** — Remove duplicate explanations when merging sections.
4. **What is missing?** — Flag gaps where sections reference content that does not exist.

---

## Report Templates

### 1. PV Technical Report

Standard technical report for PV projects (feasibility study, site assessment, due diligence).

**LaTeX Template:**
```latex
\documentclass[12pt,a4paper]{report}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{times}
\usepackage[margin=2.5cm]{geometry}
\usepackage{setspace}
\usepackage{graphicx}
\usepackage{amsmath}
\usepackage{siunitx}
\usepackage{booktabs}
\usepackage{longtable}
\usepackage{hyperref}
\usepackage[numbers,sort&compress]{natbib}
\usepackage{fancyhdr}
\usepackage{titlesec}
\usepackage{tocloft}
\usepackage{appendix}
\usepackage{glossaries}

\onehalfspacing

% Header/Footer
\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{\leftmark}
\fancyhead[R]{Project ID: XXXX}
\fancyfoot[C]{\thepage}
\fancyfoot[R]{Confidential}

% Glossary / Abbreviations
\makeglossaries
\newacronym{pv}{PV}{Photovoltaic}
\newacronym{stc}{STC}{Standard Test Conditions}
\newacronym{pr}{PR}{Performance Ratio}
\newacronym{lcoe}{LCOE}{Levelized Cost of Energy}
\newacronym{ghi}{GHI}{Global Horizontal Irradiance}
\newacronym{bos}{BOS}{Balance of System}
\newacronym{el}{EL}{Electroluminescence}

\begin{document}

% ── Cover Page ──
\begin{titlepage}
\centering
\vspace*{2cm}
{\Huge\bfseries Report Title \par}
\vspace{1cm}
{\Large Subtitle or Project Name \par}
\vspace{2cm}
{\large Prepared by: \par}
{\large Author One, Author Two \par}
\vspace{1cm}
{\large Organization Name \par}
\vspace{1cm}
{\large Project ID: XXXX \par}
{\large Date: \today \par}
\vspace{2cm}
{\large Document Revision: 1.0 \par}
{\large Classification: Confidential \par}
\end{titlepage}

% ── Front Matter ──
\pagenumbering{roman}

\chapter*{Executive Summary}
\addcontentsline{toc}{chapter}{Executive Summary}

\tableofcontents
\listoffigures
\listoftables
\printglossary[type=\acronymtype, title=List of Abbreviations]

% ── Main Body ──
\pagenumbering{arabic}

\chapter{Introduction}
  \section{Project Background}
  \section{Scope of Work}
  \section{Methodology}

\chapter{Site Assessment}
  \section{Location and Geography}
  \section{Solar Resource Analysis}
  \section{Weather Data Summary}

\chapter{System Design}
  \section{Module Selection}
  \section{Inverter Selection}
  \section{Array Layout}
  \section{Electrical Design}

\chapter{Energy Yield Analysis}
  \section{Simulation Methodology}
  \section{Loss Tree}
  \section{P50/P90 Results}
  \section{Monthly and Annual Yield}

\chapter{Financial Analysis}
  \section{CAPEX Breakdown}
  \section{OPEX Estimates}
  \section{LCOE Calculation}
  \section{IRR and Payback Period}

\chapter{Risk Assessment}
  \section{Technical Risks}
  \section{Financial Risks}
  \section{Mitigation Measures}

\chapter{Conclusions and Recommendations}

% ── Back Matter ──
\bibliographystyle{unsrtnat}
\bibliography{references}

\begin{appendices}
\chapter{Detailed Simulation Parameters}
\chapter{Module and Inverter Datasheets}
\chapter{Meteorological Data Tables}
\end{appendices}

\end{document}
```

---

### 2. PV Research Lab Report

For lab-scale research results documentation.

**LaTeX Template:**
```latex
\documentclass[12pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage{times}
\usepackage[margin=2.5cm]{geometry}
\usepackage{graphicx}
\usepackage{amsmath}
\usepackage{siunitx}
\usepackage{booktabs}
\usepackage{hyperref}
\usepackage[numbers]{natbib}
\usepackage{float}

\title{Lab Report: [Title]}
\author{[Authors] \\ [Laboratory / Institution]}
\date{\today}

\begin{document}
\maketitle

\begin{abstract}
Brief summary of experiment objectives, methods, and key results.
\end{abstract}

\section{Objective}
\section{Background}
\section{Materials and Equipment}
  \subsection{Samples}
  \subsection{Instruments}
\section{Procedure}
\section{Results}
  \subsection{I-V Characterization}
  \subsection{Spectral Response}
  \subsection{Imaging Results}
\section{Analysis and Discussion}
\section{Conclusions}
\section{References}

\appendix
\section{Raw Data}
\section{Calibration Certificates}
\end{document}
```

---

### 3. IEC Test Report

For IEC 61215/61730 qualification test documentation.

**Structure (Markdown outline for flexibility):**
```markdown
# IEC [61215/61730] Test Report

**Report Number:** TR-YYYY-NNNN
**Date:** YYYY-MM-DD
**Test Laboratory:** [Lab Name, NABL/A2LA accreditation number]

## 1. Module Under Test
| Parameter | Value |
|-----------|-------|
| Manufacturer | |
| Model | |
| Serial Numbers | |
| Rated Power (Pmax) | W |
| Voc | V |
| Isc | A |
| Module Type | c-Si / thin-film / bifacial |

## 2. Test Sequence
[Reference IEC 61215-2 test sequence diagram]

## 3. Test Results
### 3.1 Initial Characterization
### 3.2 [Test Name] — MQT XX
### 3.3 [Test Name] — MQT XX
...

## 4. Summary of Results
| Test | Requirement | Result | Pass/Fail |
|------|-------------|--------|-----------|

## 5. Conclusion
## 6. Annexes
### Annex A: Calibration Certificates
### Annex B: Environmental Chamber Logs
### Annex C: I-V Curve Data
```

---

## Export Pipelines

### LaTeX → PDF

```python
import subprocess

def compile_latex_to_pdf(tex_file, output_dir='.', engine='pdflatex'):
    """
    Compile LaTeX to PDF.

    Parameters
    ----------
    tex_file : str
        Path to .tex file
    output_dir : str
        Output directory for PDF
    engine : str
        'pdflatex', 'xelatex', or 'lualatex'
    """
    # Run twice for cross-references, once for bibliography
    for _ in range(2):
        subprocess.run(
            [engine, '-output-directory', output_dir,
             '-interaction=nonstopmode', tex_file],
            check=True, capture_output=True,
        )

    # Run bibtex if .bib file exists
    aux_file = tex_file.replace('.tex', '.aux')
    subprocess.run(
        ['bibtex', aux_file],
        capture_output=True,
    )

    # Final two passes
    for _ in range(2):
        subprocess.run(
            [engine, '-output-directory', output_dir,
             '-interaction=nonstopmode', tex_file],
            check=True, capture_output=True,
        )

    pdf_path = tex_file.replace('.tex', '.pdf')
    return pdf_path
```

### Markdown → Word (via Pandoc)

```python
def markdown_to_word(md_file, output_file, template=None,
                     bib_file=None, csl_file=None):
    """
    Convert Markdown to Word (.docx) using Pandoc.

    Parameters
    ----------
    md_file : str
        Path to Markdown file
    output_file : str
        Output .docx path
    template : str
        Optional Word template (.dotx) for styling
    bib_file : str
        Optional bibliography file (.bib)
    csl_file : str
        Optional CSL citation style file
    """
    cmd = [
        'pandoc', md_file,
        '-o', output_file,
        '--from=markdown',
        '--to=docx',
        '--toc',
        '--toc-depth=3',
        '--number-sections',
    ]

    if template:
        cmd.extend(['--reference-doc', template])
    if bib_file:
        cmd.extend(['--bibliography', bib_file, '--citeproc'])
    if csl_file:
        cmd.extend(['--csl', csl_file])

    subprocess.run(cmd, check=True, capture_output=True)
    return output_file
```

### Markdown → PDF (via WeasyPrint)

```python
def markdown_to_pdf_weasy(md_file, output_file, css_file=None):
    """
    Convert Markdown to PDF via HTML using WeasyPrint.
    Useful when LaTeX is not available.
    """
    import pypandoc
    from weasyprint import HTML

    # Markdown → HTML
    html_content = pypandoc.convert_file(md_file, 'html',
                                          extra_args=['--standalone',
                                                      '--toc',
                                                      '--number-sections'])

    # HTML → PDF
    html = HTML(string=html_content)
    if css_file:
        html.write_pdf(output_file, stylesheets=[css_file])
    else:
        html.write_pdf(output_file)

    return output_file
```

### Multi-Section Assembly

```python
import os
import re

def assemble_report(sections, output_format='latex', metadata=None):
    """
    Assemble multiple section files into a single report.

    Parameters
    ----------
    sections : list of dict
        Each dict: {'title': str, 'file': str, 'type': 'markdown'|'latex'}
    output_format : str
        'latex', 'markdown', 'word', 'pdf'
    metadata : dict
        Report metadata: title, authors, date, project_id, classification

    Returns
    -------
    str
        Path to assembled report file
    """
    if metadata is None:
        metadata = {}

    # Read all section files
    content_blocks = []
    figures = []
    tables = []
    references = set()

    for i, section in enumerate(sections, 1):
        with open(section['file'], 'r') as f:
            content = f.read()

        # Renumber figures: Fig. X → Fig. {offset + X}
        # Track figure count for list of figures
        fig_pattern = r'(Fig(?:ure)?\.?\s*)(\d+)'
        fig_matches = re.findall(fig_pattern, content)
        for prefix, num in fig_matches:
            figures.append({
                'number': len(figures) + 1,
                'section': i,
                'original': f'{prefix}{num}',
            })

        content_blocks.append({
            'title': section['title'],
            'content': content,
            'index': i,
        })

    # Merge and output
    if output_format == 'markdown':
        return _assemble_markdown(content_blocks, metadata)
    elif output_format == 'latex':
        return _assemble_latex(content_blocks, metadata)


def _assemble_markdown(blocks, metadata):
    """Assemble sections into a single Markdown document."""
    lines = []

    # Title block
    lines.append(f"# {metadata.get('title', 'Technical Report')}\n")
    lines.append(f"**Authors:** {metadata.get('authors', 'TBD')}\n")
    lines.append(f"**Date:** {metadata.get('date', 'TBD')}\n")
    lines.append(f"**Project ID:** {metadata.get('project_id', 'N/A')}\n")
    lines.append('---\n')

    # Table of Contents placeholder
    lines.append('## Table of Contents\n')
    for block in blocks:
        lines.append(f"- [{block['index']}. {block['title']}]"
                      f"(#{block['title'].lower().replace(' ', '-')})\n")
    lines.append('\n---\n')

    # Sections
    for block in blocks:
        lines.append(f"\n## {block['index']}. {block['title']}\n")
        lines.append(block['content'])
        lines.append('\n')

    output = '\n'.join(lines)
    output_path = 'assembled_report.md'
    with open(output_path, 'w') as f:
        f.write(output)
    return output_path
```

---

## Cross-Referencing System

### LaTeX Cross-References

```latex
% Label definitions (in source sections)
\label{fig:jv-curve}        % For figures
\label{tab:efficiency}       % For tables
\label{eq:shockley}          % For equations
\label{sec:methods}          % For sections

% Reference usage
See Figure~\ref{fig:jv-curve} for the J-V characteristics.
Table~\ref{tab:efficiency} summarizes the results.
Using the Shockley diode equation (Eq.~\ref{eq:shockley}).
As described in Section~\ref{sec:methods}.
```

### Markdown Cross-References (Pandoc-Compatible)

```markdown
<!-- Label definitions -->
![J-V curve of the champion device.](figures/jv-curve.png){#fig:jv-curve}

| Metric | Value |
|--------|-------|
| PCE    | 24.1% |

: Efficiency summary of tested devices. {#tbl:efficiency}

$$J = J_0 \left[\exp\left(\frac{qV}{nkT}\right) - 1\right] - J_{ph}$$ {#eq:shockley}

<!-- Reference usage -->
See [@fig:jv-curve] for J-V characteristics.
[@tbl:efficiency] summarizes the results.
Using the Shockley equation ([@eq:shockley]).
```

---

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `report_type` | string | Yes | "technical", "lab", "iec-test", "feasibility", "due-diligence", "custom" |
| `sections` | list | Yes | List of section definitions with title and content source |
| `title` | string | Yes | Report title |
| `authors` | list | No | List of author names |
| `project_id` | string | No | Project identifier for header/footer |
| `classification` | string | No | "public", "internal", "confidential" (default: "internal") |
| `output_format` | string | No | "latex", "markdown", "word", "pdf", or "all" (default: "latex") |
| `template` | string | No | Custom template file path |
| `bib_file` | string | No | Path to unified BibTeX file |
| `include_toc` | bool | No | Generate table of contents (default: true) |
| `include_lof` | bool | No | Generate list of figures (default: true) |
| `include_lot` | bool | No | Generate list of tables (default: true) |
| `include_abbreviations` | bool | No | Generate abbreviation list (default: true) |
| `number_sections` | bool | No | Auto-number sections (default: true) |
