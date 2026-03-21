# Product Requirements Document — SuryaPrajna

## Vision

SuryaPrajna ("Solar Wisdom") is the first universal, open-standard scientific skills workspace purpose-built for the photovoltaic industry. It provides LLM agents with deep domain expertise across the entire solar energy value chain — from material science to plant commissioning, from lab testing to financial modeling.

## Problem Statement

PV engineers, researchers, and project developers spend significant time on repetitive analytical tasks:
- Generating test protocols and compliance checklists
- Running energy yield simulations and financial models
- Performing failure analysis and reliability calculations
- Creating standardized reports and documentation

These tasks require deep domain knowledge but follow well-defined methodologies. Current AI tools lack PV-specific expertise, leading to generic outputs that require heavy manual correction.

## Solution

A curated library of PV-specific scientific skills that:

1. **Follow an open standard** — Agent Skills (agentskills.io) format ensures skills work with any LLM agent (Claude Code, Cursor, Codex, Gemini CLI)
2. **Cover the full value chain** — 10 skill packs spanning materials, testing, reliability, energy, finance, design, and power systems
3. **Are scientifically rigorous** — Skills encode IEC standards, established PV models, and industry best practices
4. **Scale horizontally** — New packs (EV charging, hydrogen, agrivoltaics) can be added without modifying existing skills

## Target Users

### Primary
- **PV Module Engineers** — Testing, reliability, BoM, CTM calculations
- **Solar Energy Engineers** — Yield analysis, plant design, performance monitoring
- **PV Researchers** — Materials characterization, cell modeling, degradation studies

### Secondary
- **Project Developers** — Financial modeling, bankability, site assessment
- **Quality Engineers** — FMEA, SPC, compliance documentation
- **O&M Managers** — Diagnostics, degradation tracking, loss analysis

## Skill Packs

| # | Pack | Primary Use Cases |
|---|------|-------------------|
| 1 | pv-materials | Silicon/perovskite characterization, defect analysis, imaging |
| 2 | pv-cell-module | BoM automation, CTM calculator, IV modeling |
| 3 | pv-testing | IEC test protocols, flash testing, field measurements |
| 4 | pv-reliability | FMEA, Weibull analysis, RCA, CN/RN automation |
| 5 | pv-analytics | ANOVA, regression, SPC, Monte Carlo, uncertainty |
| 6 | pv-finance | LCOE, IRR/NPV, carbon credits, policy compliance |
| 7 | pv-energy | pvlib modeling, P50/P90, weather data, forecasting |
| 8 | pv-plant-design | Array layout, shading, string sizing, SLD |
| 9 | pv-power-systems | Load flow, hybrid modeling, BESS, MPPT, grid |
| 10 | pv-sustainability | LCA, carbon footprint, ESG, circular economy |

## Architecture

### Monorepo Structure
- `skills/` — Domain skill packs with SKILL.md definitions
- `packages/` — Shared connectors, workflow engine, UI components
- `apps/` — Web (Next.js) and desktop (Tauri) applications
- `knowledge/` — Reference standards and indexed documentation
- `templates/` — Report and datasheet templates

### Srishti Workflow Engine
Sanskrit: _Srishti_ = creation

The orchestration engine that:
- Chains multiple skills into multi-step workflows
- Manages data flow between skill invocations
- Handles parallel and sequential execution
- Provides checkpointing and resume capability

Example workflow: "Full Project Assessment"
1. Megha-Agent → Solar resource assessment
2. Vinyasa-Agent → Preliminary plant design
3. Phala-Agent → Energy yield simulation
4. Nivesha-Agent → Financial modeling
5. Grantha-Agent → Combined report generation

### Agent System
Sanskrit-named agents (see AGENTS.md) provide:
- Domain-specific reasoning and context
- Skill selection and parameter mapping
- Multi-step task decomposition
- Cross-domain coordination via Surya-Orchestrator

### Connectors
- **Pinecone** — Vector storage for PV knowledge retrieval
- **Zotero** — Academic reference management
- **Weather APIs** — MERRA-2, ERA5, NSRDB, OpenWeather
- **pvlib/PVsyst/SAM** — Simulation engine integration

## Non-Functional Requirements

### Compatibility
- Skills must work with any LLM agent supporting Agent Skills standard
- No vendor lock-in to any specific AI provider
- Python 3.10+ for computational skills
- Node.js 18+ for web application

### Scalability
- New skill packs can be added independently
- Skills are self-contained with explicit dependencies
- Registry-based discovery (SKILLS.md)
- No circular dependencies between packs

### Quality
- Skills reference IEC/IEEE/BIS standards where applicable
- Calculations include uncertainty quantification
- Units are always explicit
- Example inputs/outputs in every SKILL.md

## Milestones

### Phase 1 — Foundation (Current)
- Monorepo architecture and tooling
- Sample skills (pvlib-analysis, iec-61215-protocol)
- Agent definitions and orchestration design
- Documentation and contribution guidelines

### Phase 2 — Core Skills
- Complete pv-energy pack (10 skills)
- Complete pv-testing pack (7 skills)
- Complete pv-reliability pack (6 skills)
- Srishti workflow engine MVP

### Phase 3 — Full Coverage
- All 10 packs with ~67 skills
- Web application for non-CLI users
- Connector integrations
- Knowledge base population

### Phase 4 — Extensions
- Community-contributed skill packs
- Advanced workflows (full project lifecycle)
- Desktop application
- Enterprise features (team, permissions, audit)

## Success Metrics

- Number of skills available and validated
- Cross-agent compatibility (tested on 4+ LLM platforms)
- Time saved per task vs. manual workflow
- Community contributions and adoption
