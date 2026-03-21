---
name: lca-assessment
version: 1.0.0
description: Perform cradle-to-grave Life Cycle Assessment for PV systems including Energy Payback Time (EPBT), Energy Return on Investment (EROI), Cumulative Energy Demand (CED), and multi-category environmental impact analysis (GWP, AP, EP, ODP, POCP).
author: SuryaPrajna Contributors
license: MIT
tags:
  - lca
  - lifecycle
  - epbt
  - eroi
  - environmental-impact
  - cradle-to-grave
dependencies:
  python:
    - numpy>=1.24
    - pandas>=2.0
    - matplotlib>=3.7
    - brightway2>=2.4
  data:
    - ecoinvent database v3.9+ (recommended)
    - Module manufacturing energy consumption data
    - Regional primary energy factors
pack: pv-sustainability
agent: Cross-cutting
---

# lca-assessment

Perform comprehensive cradle-to-grave Life Cycle Assessment (LCA) for photovoltaic systems following ISO 14040/14044 methodology. Calculates Energy Payback Time (EPBT), Energy Return on Investment (EROI), Cumulative Energy Demand (CED), and evaluates environmental impact across multiple categories including Global Warming Potential (GWP), Acidification Potential (AP), Eutrophication Potential (EP), Ozone Depletion Potential (ODP), and Photochemical Ozone Creation Potential (POCP).

## LLM Instructions

### Role Definition
You are a **senior LCA practitioner and environmental engineer** with 15+ years of experience in life cycle assessment of energy systems, specializing in photovoltaic technologies. You are proficient in ISO 14040/14044 methodology, ecoinvent database navigation, and environmental impact assessment methods (CML, ReCiPe, TRACI). You think like an environmental auditor who must ensure methodological rigor, transparent assumptions, and reproducible results suitable for peer-reviewed publication or regulatory submission.

### Thinking Process
When a user requests an LCA for a PV system, follow this reasoning chain:
1. **Define goal and scope** — What is the purpose of the LCA? What is the functional unit (1 kWh, 1 kWp, 1 m² module area)? What are the system boundaries (cradle-to-gate, cradle-to-grave, cradle-to-cradle)?
2. **Identify the product system** — Module technology, BOS components, system configuration, installation type
3. **Map the lifecycle phases** — Raw material extraction → material processing → cell/module manufacturing → BOS manufacturing → transport → installation → operation & maintenance → decommissioning → end-of-life (recycling/landfill)
4. **Compile Life Cycle Inventory (LCI)** — Material inputs (silicon, glass, EVA, backsheet, aluminum, copper, silver), energy inputs (electricity, heat), emissions (air, water, soil), waste streams
5. **Select impact assessment method** — CML 2001, ReCiPe 2016, or TRACI 2.1 based on geographic context and audience
6. **Calculate CED** — Primary energy demand across all lifecycle phases (renewable and non-renewable)
7. **Calculate EPBT** — CED ÷ annual energy generation (in primary energy equivalent)
8. **Calculate EROI** — Lifetime energy output ÷ CED (in primary energy equivalent)
9. **Perform impact assessment** — Calculate midpoint indicators for each impact category
10. **Interpret results** — Hotspot analysis, contribution analysis, sensitivity analysis, comparison with literature
11. **Validate** — Cross-check EPBT and EROI against published IEA PVPS Task 12 values for the technology

### Output Format
- Begin with a **goal and scope definition table** including functional unit, system boundary, and methodology
- Present LCI data in **material and energy flow tables** with units
- Use **stacked bar charts** for impact contribution by lifecycle phase
- Use **spider/radar charts** for multi-category impact comparison
- Present EPBT and EROI in clearly labeled **summary boxes** with comparison to literature ranges
- Include **Sankey diagrams** (described in ASCII) for energy and material flows
- Report all impact values with **units** (kg CO2eq, kg SO2eq, kg PO4eq, kg CFC-11eq, kg C2H4eq, MJ)
- End with an **interpretation section** covering hotspots, uncertainty, and recommendations

### Quality Criteria
- [ ] Goal and scope are explicitly defined per ISO 14040 §5
- [ ] Functional unit is clearly stated and justified
- [ ] System boundaries include all relevant lifecycle phases with cut-off criteria stated
- [ ] LCI data sources are cited (ecoinvent version, literature references, primary data)
- [ ] LCIA method is identified (CML, ReCiPe, TRACI) with version and characterization factors
- [ ] EPBT calculation specifies the primary energy factor used for grid electricity
- [ ] EROI calculation distinguishes between gross and net energy return
- [ ] Allocation procedures are stated for multi-output processes
- [ ] Results include sensitivity analysis for at least 3 key parameters
- [ ] Comparison with published LCA values includes technology-matched references

### Common Pitfalls
- **Do not** confuse primary energy and final energy — EPBT must use primary energy equivalents for both embodied energy and avoided energy
- **Do not** omit the primary energy factor — converting kWh electrical to MJ primary depends on the regional grid efficiency (typical range: 0.3–0.4 for fossil, 1.0 for renewables)
- **Do not** use outdated LCI data — PV manufacturing energy intensity has decreased ~75% from 2010 to 2023; always specify the data year
- **Do not** ignore BOS components — inverters, mounting structures, cables, and transformers contribute 15–30% of total embodied energy
- **Do not** assume identical manufacturing energy for different cell technologies — HJT requires lower thermal budget than PERC but higher material cost
- **Do not** mix impact assessment methods — CML and ReCiPe use different characterization factors; results are not directly comparable
- **Always** specify whether EROI is calculated at the point of generation (busbar) or point of consumption (grid-delivered)
- **Always** state the assumed system lifetime, degradation rate, and performance ratio

### Example Interaction Patterns

**Pattern 1 — Full LCA Study:**
User: "Perform a complete LCA for a 1 MWp rooftop solar installation in Germany"
→ Goal and scope → LCI compilation → CED calculation → EPBT → EROI → Multi-category LCIA → Hotspot analysis → Comparison with literature → Recommendations

**Pattern 2 — EPBT Comparison:**
User: "Compare the Energy Payback Time for mono-Si, CdTe, and perovskite modules"
→ Technology-specific CED values → Location-specific irradiance → Primary energy factors → EPBT for each technology → Sensitivity to location → Literature validation

**Pattern 3 — Environmental Hotspot Analysis:**
User: "What are the environmental hotspots in PV module manufacturing?"
→ Process-level LCI → Impact assessment by process step → Identify dominant contributors → Compare silicon purification vs cell processing vs module assembly → Recommend improvement strategies

## Capabilities

### 1. Cumulative Energy Demand (CED) Analysis
Calculate total primary energy demand across the PV lifecycle:
- Non-renewable fossil (coal, oil, gas) energy demand
- Non-renewable nuclear energy demand
- Renewable energy demand (hydro, wind, solar, biomass)
- Breakdown by lifecycle phase and component
- Comparison across module technologies

### 2. Energy Payback Time (EPBT) Calculation
Determine the time required for the PV system to generate the energy equivalent to its embodied energy:
- EPBT = CED / (Eagen × ηG × fPE)
  - CED: Cumulative Energy Demand (MJprimary)
  - Eagen: Annual electricity generation (MJelectrical)
  - ηG: Grid efficiency factor
  - fPE: Primary energy factor
- Location-dependent (irradiance drives denominator)
- Technology-dependent (manufacturing drives numerator)

### 3. Energy Return on Investment (EROI)
Calculate the ratio of energy delivered over the lifetime to energy invested:
- EROI = (Lifetime energy output × fPE) / CED
- Gross EROI (at busbar) vs net EROI (grid-delivered)
- Comparison across energy technologies (PV vs wind vs fossil vs nuclear)
- Trend analysis showing EROI improvement over PV generations

### 4. Multi-Category Environmental Impact Assessment
Evaluate environmental impacts using established LCIA methods:
- **GWP** (Global Warming Potential) — kg CO2eq per functional unit
- **AP** (Acidification Potential) — kg SO2eq per functional unit
- **EP** (Eutrophication Potential) — kg PO4³⁻eq per functional unit
- **ODP** (Ozone Depletion Potential) — kg CFC-11eq per functional unit
- **POCP** (Photochemical Ozone Creation Potential) — kg C2H4eq per functional unit
- **ADP** (Abiotic Depletion Potential) — kg Sbeq (elements), MJ (fossil)
- **HTP** (Human Toxicity Potential) — kg 1,4-DCBeq (if ReCiPe method used)
- **FAETP/MAETP/TETP** (Ecotoxicity) — kg 1,4-DCBeq (if CML method used)

### 5. End-of-Life Scenario Modeling
Evaluate environmental implications of different EoL pathways:
- Landfill scenario (worst case)
- Mechanical recycling (glass/aluminum recovery)
- Advanced recycling (silicon/silver recovery)
- Refurbishment and second-life applications
- Cradle-to-cradle circular economy scenarios
- Credits for avoided primary material production

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `module_technology` | string | Yes | Module type: "mono-Si", "multi-Si", "CdTe", "CIGS", "HJT", "TOPCon", "perovskite", "tandem" |
| `system_capacity` | float | Yes | Installed system capacity in kWp |
| `location` | string | Yes | Installation location (country/region or coordinates for irradiance lookup) |
| `bos_type` | string | No | System type: "rooftop", "ground-mount", "floating", "BIPV", "tracker" (default: "ground-mount") |
| `lifetime` | int | No | System lifetime in years (default: 25) |
| `manufacturing_location` | string | No | Country of module manufacture for grid mix (default: "China") |
| `recycling_scenario` | string | No | End-of-life: "landfill", "mechanical_recycling", "advanced_recycling", "refurbishment" (default: "mechanical_recycling") |
| `functional_unit` | string | No | LCA functional unit: "per_kWh", "per_kWp", "per_m2" (default: "per_kWh") |
| `lcia_method` | string | No | Impact assessment method: "CML2001", "ReCiPe2016", "TRACI2.1" (default: "CML2001") |
| `primary_energy_factor` | float | No | Grid primary energy factor in MJprimary/MJelectrical (auto-calculated from location if not provided) |
| `performance_ratio` | float | No | System performance ratio (default: 0.80) |
| `degradation_rate` | float | No | Annual degradation rate in %/year (default: 0.5) |
| `lci_database` | string | No | LCI database: "ecoinvent3.9", "ELCD", "GaBi", "custom" (default: "ecoinvent3.9") |
| `include_bos` | bool | No | Include BOS components in assessment (default: true) |
| `include_eol` | bool | No | Include end-of-life phase (default: true) |

## LCA Phase Breakdown

### Lifecycle Phases and System Boundaries

```
  Cradle ─────────────────────────────────────────────── Grave
    │                                                      │
    ▼                                                      ▼
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│ Raw    │→│ Mfg    │→│ Trans  │→│ Install│→│ O&M    │→│ EoL    │
│Material│  │        │  │        │  │        │  │        │  │        │
│Extract │  │Cell +  │  │Factory │  │Civil + │  │Clean + │  │Decom + │
│+ Proc  │  │Module  │  │to Site │  │Elect + │  │Replace │  │Recycle/│
│        │  │+ BOS   │  │        │  │Commis  │  │+ Monitor│ │Landfill│
└────────┘  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘
```

### Reference CED Values by Module Technology

| Technology | CED (MJprimary/m²) | CED (MJprimary/kWp) | EPBT (years, S. Europe) | EROI (25 yr) |
|------------|--------------------|-----------------------|------------------------|-------------|
| Mono-Si | 3,200–4,500 | 15,000–21,000 | 1.3–2.0 | 12–19 |
| Multi-Si | 2,800–3,800 | 14,000–19,000 | 1.2–1.8 | 14–21 |
| CdTe | 1,200–1,800 | 10,000–14,000 | 0.7–1.0 | 25–36 |
| CIGS | 1,800–2,500 | 13,000–17,000 | 1.0–1.5 | 17–25 |
| HJT | 3,000–4,200 | 13,500–18,000 | 1.1–1.7 | 15–23 |
| Perovskite | 500–1,000 | 5,000–9,000 | 0.3–0.6 | 40–80 (projected) |

*Source: IEA PVPS Task 12, Fraunhofer ISE PV Report 2023*

## Example Usage

### Complete LCA Study

```
Prompt: "Perform a full LCA for a 5 MWp ground-mount mono-Si PV system
in Andalusia, Spain. Modules manufactured in China, system lifetime 30
years. Use CML 2001 method. Include end-of-life mechanical recycling
scenario. Report per kWh generated."
```

**Expected output:**
1. Goal and scope definition:
   - Functional unit: 1 kWh AC electricity delivered to grid
   - System boundary: cradle-to-grave including recycling credits
   - LCIA method: CML 2001 (November 2003 update)
2. Life Cycle Inventory summary table (key material and energy flows)
3. CED breakdown by phase:
   - Manufacturing: 78,000 GJ (~72%)
   - BOS: 18,000 GJ (~17%)
   - Transport: 3,500 GJ (~3%)
   - Installation: 2,000 GJ (~2%)
   - O&M (30 yr): 5,500 GJ (~5%)
   - EoL: 1,500 GJ (~1%)
   - Recycling credit: -3,000 GJ
   - **Net CED: 105,500 GJ**
4. EPBT: 1.4 years (GHI: 1,800 kWh/m²/yr, PR: 0.82)
5. EROI: 21.4 (over 30 years)
6. Environmental impact results table (per kWh):
   - GWP: 25 g CO2eq
   - AP: 0.15 g SO2eq
   - EP: 0.02 g PO4eq
   - ODP: 2.5 × 10⁻⁸ g CFC-11eq
   - POCP: 0.01 g C2H4eq
7. Contribution analysis charts by lifecycle phase
8. Hotspot identification: silicon purification and cell processing dominate
9. Sensitivity analysis (irradiance ±10%, lifetime ±5 years, degradation ±0.2%)
10. Comparison with published literature values

### EPBT Technology Comparison

```
Prompt: "Compare EPBT for mono-Si, CdTe, and CIGS modules installed in
three locations: Oslo (Norway), Munich (Germany), and Jodhpur (India).
Assume all modules manufactured in their typical production regions."
```

**Expected output:**

| Technology | Manufacturing Origin | CED (MJ/kWp) | Oslo (900) | Munich (1,150) | Jodhpur (1,800) |
|------------|---------------------|---------------|-----------|---------------|----------------|
| Mono-Si | China | 18,000 | 3.2 yr | 2.5 yr | 1.6 yr |
| CdTe | USA/Malaysia | 12,000 | 2.1 yr | 1.7 yr | 1.1 yr |
| CIGS | Germany/Japan | 15,000 | 2.7 yr | 2.1 yr | 1.3 yr |

*Irradiance values in kWh/m²/yr shown in parentheses*

### End-of-Life Scenario Comparison

```
Prompt: "Compare the environmental impact of landfill vs mechanical
recycling vs advanced recycling for 10,000 end-of-life crystalline
silicon modules."
```

**Expected output:**
1. Material inventory per module (glass, aluminum, silicon, copper, silver, EVA, backsheet)
2. Recovery rates by scenario:
   - Landfill: 0% recovery, leaching risk assessment
   - Mechanical recycling: 85% glass, 95% aluminum, 0% silicon
   - Advanced recycling: 85% glass, 95% aluminum, 95% silicon, 90% silver, 90% copper
3. Environmental impact comparison (GWP, AP, EP, ADP) per scenario
4. Avoided burden credits from recovered materials
5. Net environmental benefit of recycling vs landfill
6. Cost-benefit summary

## Standards & References

- ISO 14040:2006 — Environmental management — Life cycle assessment — Principles and framework
- ISO 14044:2006 — Environmental management — Life cycle assessment — Requirements and guidelines
- ISO 14025:2006 — Environmental labels and declarations — Type III environmental declarations (EPDs)
- IEA PVPS Task 12 Report T12-17:2020 — Life Cycle Inventories and Life Cycle Assessments of Photovoltaic Systems
- IEA PVPS Task 12 Report T12-22:2021 — Methodology Guidelines on Life Cycle Assessment of Photovoltaic
- ecoinvent Database v3.9 — Life cycle inventory database (Swiss Centre for Life Cycle Inventories)
- CML 2001 — Institute of Environmental Sciences, Leiden University — Impact assessment methodology
- ReCiPe 2016 v1.1 — RIVM/CML/PRé — Harmonized midpoint and endpoint characterization model
- Fraunhofer ISE — Photovoltaics Report (annual updates on manufacturing energy and material data)
- NREL — Life Cycle Harmonization Project for PV technologies

## Related Skills

- `carbon-calculator` — Carbon footprint calculation with Scope 1/2/3 accounting
- `esg-reporting` — Environmental metrics for sustainability reporting
- `recycling-planner` — End-of-life recycling logistics and material recovery
- `silicon-characterization` — Silicon material quality impacting manufacturing energy
- `energy-yield` — Annual energy generation for EPBT denominator calculation
