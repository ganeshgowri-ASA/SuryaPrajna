# SuryaPrajna Skills Registry

> Master registry of all PV scientific skill packs. Each pack contains domain-specific skills following the [Agent Skills](https://agentskills.io) standard.

## Overview

| Pack | Domain | Skills | Status | Agent(s) |
|------|--------|--------|--------|----------|
| `pv-materials` | Materials Science | 6 | Planning | Dravya-Agent |
| `pv-cell-module` | Cell & Module | 8 | Planning | Kosha-Agent, Shakti-Agent |
| `pv-testing` | Testing & Compliance | 7 | **Available** | Pariksha-Agent |
| `pv-reliability` | Reliability & Quality | 6 | **Available** | Nityata-Agent |
| `pv-analytics` | Statistical Analysis | 5 | Planning | Cross-cutting |
| `pv-finance` | Finance & Economics | 6 | Planning | Nivesha-Agent |
| `pv-energy` | Energy & Weather | 10 | **In Progress** | Megha-Agent, Phala-Agent |
| `pv-plant-design` | Plant Design | 7 | Planning | Vinyasa-Agent |
| `pv-power-systems` | Power Systems | 7 | **Available** | Vidyut-Agent |
| `pv-sustainability` | Sustainability & ESG | 5 | **Available** | Cross-cutting |
| `pv-scientific-writing` | Scientific Writing & Publishing | 4 | **Available** | Grantha-Agent |

**Total planned skills: ~71** across 11 packs
| `pv-integrations` | API Integrations | 5 | **Available** | Viveka-Agent |

**Total planned skills: ~72** across 11 packs

---

## Pack 1: pv-materials

Materials science skills for PV research and manufacturing.

| Skill | Description | Status |
|-------|-------------|--------|
| `silicon-characterization` | Wafer quality, resistivity, lifetime measurements | Planned |
| `perovskite-modeler` | Composition modeling, bandgap tuning, stability | Planned |
| `xrd-analysis` | X-ray diffraction pattern analysis and phase identification | Planned |
| `sem-interpretation` | SEM/TEM image analysis for microstructure | Planned |
| `el-imaging` | Electroluminescence image defect detection | Planned |
| `defect-classifier` | Material defect classification (LeTID, PID, UV) | Planned |

---

## Pack 2: pv-cell-module

Cell design, module construction, and BoM management.

| Skill | Description | Status |
|-------|-------------|--------|
| `bom-generator` | Bill of Materials creation and validation | Planned |
| `ctm-calculator` | Cell-to-Module power loss/gain analysis | Planned |
| `iv-curve-modeler` | I-V curve simulation and parameter extraction | Planned |
| `cell-efficiency` | Cell efficiency analysis at STC/NOCT conditions | Planned |
| `diode-model` | Single/double diode model parameter fitting | Planned |
| `temperature-coefficients` | Temperature coefficient analysis and modeling | Planned |
| `module-construction` | Module layup design and material selection | Planned |
| `lamination-params` | Lamination process parameter optimization | Planned |

---

## Pack 3: pv-testing

Testing protocols, lab workflows, and field measurements.

| Skill | Description | Status |
|-------|-------------|--------|
| `iec-61215-protocol` | IEC 61215 design qualification test protocols | **Available** |
| `iec-61730-safety` | IEC 61730 safety qualification testing — insulation, ground continuity, dielectric withstand | **Available** |
| `thermal-cycling` | TC200/TC600 thermal stress test protocol, solder joint fatigue analysis | **Available** |
| `damp-heat-testing` | DH1000/DH2000/DH3000 moisture ingress and delamination protocols | **Available** |
| `uv-preconditioning` | UV exposure testing per IEC 61215, yellowing index, transmittance loss | **Available** |
| `mechanical-load` | Static/dynamic load testing, wind/snow simulation, cell cracking detection | **Available** |
| `pv-module-flash-testing` | IV flash test procedures, STC correction, measurement uncertainty | **Available** |

---

## Pack 4: pv-reliability

Reliability engineering, failure analysis, and quality management.

| Skill | Description | Status |
|-------|-------------|--------|
| `fmea-analysis` | Failure Mode and Effects Analysis for PV modules, RPN calculation, mitigation | **Available** |
| `weibull-reliability` | Weibull distribution fitting, MTBF, failure rate prediction, bathtub curve | **Available** |
| `degradation-modeling` | LID, LeTID, PID mechanisms, annual degradation rates, lifetime prediction | **Available** |
| `root-cause-analysis` | 5-Why, fishbone diagram, fault tree analysis for PV field failures | **Available** |
| `cn-rn-documentation` | Change Notice / Release Note generation, revision tracking, ECO workflow | **Available** |
| `warranty-analysis` | Warranty reserve and claim rate calculation | Planned |

---

## Pack 5: pv-analytics

Cross-cutting statistical and data analysis skills.

| Skill | Description | Status |
|-------|-------------|--------|
| `anova-analysis` | Analysis of Variance for PV experiments | Planned |
| `regression-modeler` | Linear/nonlinear regression for PV data | Planned |
| `spc-charts` | Statistical Process Control charts | Planned |
| `monte-carlo` | Monte Carlo simulation for uncertainty | Planned |
| `gum-uncertainty` | GUM framework uncertainty analysis | Planned |

---

## Pack 6: pv-finance

Financial modeling and policy compliance.

| Skill | Description | Status |
|-------|-------------|--------|
| `lcoe-calculator` | Levelized Cost of Energy calculation | Planned |
| `financial-modeler` | IRR, NPV, payback period analysis | Planned |
| `carbon-credits` | Carbon credit and REC calculations | Planned |
| `policy-compliance` | ALMM, DCR, MNRE guideline compliance | Planned |
| `bankability-assessment` | Project bankability evaluation | Planned |
| `ppa-modeler` | Power Purchase Agreement financial modeling | Planned |

---

## Pack 7: pv-energy

Energy yield, weather data, diagnostics, and forecasting.

| Skill | Description | Status |
|-------|-------------|--------|
| `pvlib-analysis` | pvlib-based solar energy modeling | **Available** |
| `energy-yield` | Annual energy yield simulation | Planned |
| `p50-p90-analysis` | Exceedance probability (P50/P90) analysis | Planned |
| `loss-tree` | Energy loss tree construction and analysis | Planned |
| `pr-monitoring` | Performance Ratio calculation and monitoring | Planned |
| `weather-data-ingestion` | TMY, MERRA-2, ERA5, NSRDB data ingestion | Planned |
| `irradiance-modeler` | GHI/DNI/DHI decomposition and transposition | Planned |
| `solar-resource-assessment` | Site solar resource evaluation | Planned |
| `energy-forecasting` | Statistical and ML-based energy forecasting | Planned |
| `iv-diagnostics` | Field IV curve tracing and fault diagnosis | Planned |

---

## Pack 8: pv-plant-design

System design, layout, and engineering.

| Skill | Description | Status |
|-------|-------------|--------|
| `array-layout` | Ground-mount array layout optimization | Planned |
| `rooftop-design` | Rooftop system design and layout | Planned |
| `floating-solar` | Floating PV (FPV) system design | Planned |
| `shading-analysis` | Horizon, inter-row, and near-field shading | Planned |
| `string-sizing` | String sizing and inverter matching | Planned |
| `sld-generator` | Single Line Diagram generation | Planned |
| `cable-sizing` | Cable sizing, voltage drop, and routing | Planned |

---

## Pack 9: pv-power-systems

Power electronics, grid integration, and hybrid systems.

| Skill | Description | Status |
|-------|-------------|--------|
| `load-flow-analysis` | Power flow and load flow studies | **Available** |
| `hybrid-modeling` | Solar+wind+battery+diesel hybrid modeling | **Available** |
| `mppt-analysis` | MPPT algorithm comparison and analysis | **Available** |
| `inverter-modeling` | Inverter efficiency and sizing modeling | **Available** |
| `bess-sizing` | Battery storage sizing and optimization | **Available** |
| `grid-integration` | Grid code compliance and interconnection | **Available** |
| `power-quality` | Harmonics, THD, power factor analysis | **Available** |

---

## Pack 10: pv-sustainability

Environmental impact, lifecycle, and policy.

| Skill | Description | Status |
|-------|-------------|--------|
| `carbon-calculator` | Carbon footprint and offset calculations | **Available** |
| `lca-assessment` | Life Cycle Assessment for PV systems | **Available** |
| `esg-reporting` | ESG metrics and reporting for solar projects | **Available** |
| `recycling-planner` | End-of-life recycling and circular economy | **Available** |
| `policy-framework` | National/international policy analysis | **Available** |

---

## Pack 11: pv-scientific-writing

Scientific manuscript authoring, literature review, figure generation, and report compilation.

| Skill | Description | Status |
|-------|-------------|--------|
| `manuscript-writer` | Scientific manuscript authoring with publisher-specific templates (Wiley, Elsevier, IEEE, Springer, Nature, SPIE) | **Available** |
| `literature-review` | Systematic literature review with Semantic Scholar, Zotero, Perplexity AI, and auto-citation | **Available** |
| `figure-generator` | Publication-quality PV figures: I-V curves, loss trees, EQE, degradation plots, EL/IR analysis | **Available** |
| `report-compiler` | Multi-section report assembly with TOC, cross-references, and PDF/LaTeX/Word export | **Available** |
---

## Pack 11: pv-integrations

API integration layer for knowledge retrieval, reference management, AI writing assistance, and academic literature discovery.

| Skill | Description | Status |
|-------|-------------|--------|
| `pinecone-connector` | Vector DB knowledge retrieval via Pinecone API; semantic search and RAG over indexed PV literature | **Available** |
| `zotero-connector` | Reference management, citation import/export, bibliography generation via Zotero Web API | **Available** |
| `jenni-connector` | AI writing assistance and literature review augmentation via Jenni.ai | **Available** |
| `scholar-gateway` | Multi-source academic paper search and citation analysis via Semantic Scholar, CrossRef, Scopus | **Available** |
| `perplexity-connector` | Real-time literature search and fact verification via Perplexity AI | **Available** |

---

## Adding New Skills

### Within an existing pack

1. Create a directory under `skills/<pack-name>/<skill-name>/`
2. Add a `SKILL.md` file with YAML frontmatter following the Agent Skills spec
3. Include any supporting files (Python scripts, templates, data)
4. Register the skill in this file under the appropriate pack table

### Creating a new pack

1. Create `skills/<pack-name>/` directory
2. Add skills following the steps above
3. Add a new section to this registry
4. Define the responsible agent in `AGENTS.md`
5. Update the overview table

### Future packs (roadmap)

| Pack | Domain | Description |
|------|--------|-------------|
| `pv-ev-charging` | EV Integration | Solar-powered EV charging infrastructure |
| `pv-hydrogen` | Green Hydrogen | PV-to-hydrogen electrolysis systems |
| `pv-agrivoltaics` | Agriculture + PV | Dual-use land for farming and solar |
| `pv-desalination` | Water + PV | Solar-powered water treatment |
| `pv-smart-grid` | Smart Grid | Demand response, VPP, prosumer models |
