# SuryaPrajna Skills Registry

> Master registry of all PV scientific skill packs. Each pack contains domain-specific skills following the [Agent Skills](https://agentskills.io) standard.

## Overview

| Pack | Domain | Skills | Status | Agent(s) |
|------|--------|--------|--------|----------|
| `pv-materials` | Materials Science | 6 | Planning | Dravya-Agent |
| `pv-cell-module` | Cell & Module | 8 | Planning | Kosha-Agent, Shakti-Agent |
| `pv-testing` | Testing & Compliance | 7 | **In Progress** | Pariksha-Agent |
| `pv-reliability` | Reliability & Quality | 6 | Planning | Nityata-Agent |
| `pv-analytics` | Statistical Analysis | 5 | Planning | Cross-cutting |
| `pv-finance` | Finance & Economics | 6 | Planning | Nivesha-Agent |
| `pv-energy` | Energy & Weather | 10 | **In Progress** | Megha-Agent, Phala-Agent |
| `pv-plant-design` | Plant Design | 7 | Planning | Vinyasa-Agent |
| `pv-power-systems` | Power Systems | 7 | Planning | Vidyut-Agent |
| `pv-sustainability` | Sustainability & ESG | 5 | Planning | Cross-cutting |

**Total planned skills: ~67** across 10 packs

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
| `iec-61730-protocol` | IEC 61730 safety qualification test protocols | Planned |
| `flash-test-analysis` | Flash test data analysis and STC translation | Planned |
| `field-testing` | Field PR ratio, soiling, degradation measurement | Planned |
| `thermal-cycling` | Thermal cycling test evaluation (TC200/TC400/TC600) | Planned |
| `damp-heat` | Damp heat test evaluation (DH1000/DH2000/DH3000) | Planned |
| `nabl-compliance` | NABL/BIS laboratory compliance checklists | Planned |

---

## Pack 4: pv-reliability

Reliability engineering, failure analysis, and quality management.

| Skill | Description | Status |
|-------|-------------|--------|
| `fmea-generator` | FMEA document generation for PV components | Planned |
| `weibull-analysis` | Weibull distribution fitting for lifetime prediction | Planned |
| `rca-facilitator` | Root Cause Analysis workflow and documentation | Planned |
| `cn-rn-automation` | Change Notice / Release Note automation | Planned |
| `degradation-modeler` | Long-term degradation rate modeling | Planned |
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
| `load-flow-analysis` | Power flow and load flow studies | Planned |
| `hybrid-modeling` | Solar+wind+battery+diesel hybrid modeling | Planned |
| `mppt-analysis` | MPPT algorithm comparison and analysis | Planned |
| `inverter-modeling` | Inverter efficiency and sizing modeling | Planned |
| `bess-sizing` | Battery storage sizing and optimization | Planned |
| `grid-integration` | Grid code compliance and interconnection | Planned |
| `power-quality` | Harmonics, THD, power factor analysis | Planned |

---

## Pack 10: pv-sustainability

Environmental impact, lifecycle, and policy.

| Skill | Description | Status |
|-------|-------------|--------|
| `carbon-calculator` | Carbon footprint and offset calculations | Planned |
| `lca-assessment` | Life Cycle Assessment for PV systems | Planned |
| `esg-reporting` | ESG metrics and reporting for solar projects | Planned |
| `recycling-planner` | End-of-life recycling and circular economy | Planned |
| `policy-framework` | National/international policy analysis | Planned |

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
