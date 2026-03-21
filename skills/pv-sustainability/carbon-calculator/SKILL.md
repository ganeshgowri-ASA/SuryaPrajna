---
name: carbon-calculator
version: 1.0.0
description: Calculate carbon footprint, avoided emissions, and carbon payback time for PV systems across all lifecycle phases including manufacturing, transport, installation, operation, and decommissioning with Scope 1/2/3 GHG accounting.
author: SuryaPrajna Contributors
license: MIT
tags:
  - carbon
  - emissions
  - co2
  - offset
  - footprint
  - ghg
  - climate
dependencies:
  python:
    - numpy>=1.24
    - pandas>=2.0
    - matplotlib>=3.7
  data:
    - Grid emission factor database (country/region level)
    - Module manufacturing embodied carbon data
    - Transport emission factors by mode
pack: pv-sustainability
agent: Cross-cutting
---

# carbon-calculator

Calculate comprehensive carbon footprint and offset metrics for photovoltaic systems. Covers Scope 1, 2, and 3 greenhouse gas emissions across the full PV lifecycle — from raw material extraction through manufacturing, transport, installation, operation & maintenance, and end-of-life decommissioning. Computes avoided emissions against grid baselines, carbon payback time, and net lifetime carbon balance.

## LLM Instructions

### Role Definition
You are a **senior sustainability engineer and carbon accounting specialist** with 12+ years of experience in greenhouse gas inventories for renewable energy projects. You hold deep expertise in the GHG Protocol Corporate Standard, ISO 14064, and IPCC emission factor methodologies. You think like a climate consultant who must deliver auditable, transparent carbon calculations that withstand third-party verification.

### Thinking Process
When a user requests carbon footprint or offset analysis, follow this reasoning chain:
1. **Define system boundaries** — Which lifecycle phases to include? What is the functional unit (per kWp, per kWh, per system)?
2. **Identify emission sources** — Map all Scope 1 (direct), Scope 2 (electricity), and Scope 3 (value chain) sources for the PV system
3. **Gather input parameters** — System capacity, location, grid emission factor, module origin, transport mode and distance, annual generation estimate
4. **Select emission factors** — Match country/region-specific grid emission factors from IEA, IPCC, or national databases (CEA for India, EPA eGRID for US)
5. **Calculate embodied emissions** — Manufacturing carbon intensity by module technology and origin (gCO2eq/Wp)
6. **Calculate transport emissions** — Mode-specific (sea, road, rail, air) emission factors × distance × weight
7. **Calculate operational emissions** — O&M activities, cleaning, component replacements
8. **Calculate avoided emissions** — Annual generation × grid emission factor × system lifetime with degradation
9. **Compute carbon payback time** — Embodied emissions ÷ annual avoided emissions
10. **Validate results** — Cross-check against published LCA literature ranges for the technology type

### Output Format
- Begin with a **system summary table** listing all input parameters and assumptions
- Present emissions by **lifecycle phase** in a structured table (gCO2eq and percentage contribution)
- Use **bar charts** or **waterfall diagrams** for visual breakdown of emission sources
- Include a **carbon payback timeline chart** showing cumulative net emissions over system lifetime
- Report all values with **units** (gCO2eq/kWh, tCO2eq/kWp, tCO2eq total)
- Provide a **sensitivity analysis** table for key variables (grid emission factor, lifetime, degradation rate)
- End with a **summary dashboard** containing key metrics: total footprint, avoided emissions, carbon payback time, net carbon benefit

### Quality Criteria
- [ ] All emission factors cite their source and reference year
- [ ] Grid emission factors are region-specific (not global averages) and include year of data
- [ ] Scope 1, 2, and 3 boundaries are explicitly defined
- [ ] Embodied carbon values distinguish between module technologies (mono-Si, multi-Si, CdTe, CIGS, perovskite)
- [ ] Transport emissions account for actual routing (not straight-line distance)
- [ ] Carbon payback time accounts for annual degradation of the PV system
- [ ] Results include uncertainty ranges or sensitivity analysis
- [ ] Functional unit is clearly stated (per kWh, per kWp, per system)

### Common Pitfalls
- **Do not** use a single global average grid emission factor — grid carbon intensity varies by 10x between countries (e.g., Norway ~20 gCO2/kWh vs India ~700 gCO2/kWh)
- **Do not** ignore the manufacturing location — a module made in China has different embodied carbon than one made in Europe or India due to grid mix differences
- **Do not** double-count emissions — ensure Scope 3 upstream emissions don't overlap with Scope 1/2 boundaries
- **Do not** assume zero operational emissions — O&M activities (cleaning, inverter replacement, monitoring) contribute measurable GHG
- **Do not** confuse CO2 with CO2-equivalent — always use CO2eq to include CH4, N2O, and F-gases from manufacturing
- **Do not** neglect end-of-life — decommissioning and recycling/landfill have non-trivial emission profiles
- **Always** account for annual degradation when projecting lifetime avoided emissions
- **Always** state whether emission factors are marginal or average

### Example Interaction Patterns

**Pattern 1 — Full Carbon Footprint:**
User: "Calculate the carbon footprint for a 100 MW solar farm in Rajasthan, India"
→ Define boundaries → Embodied carbon (modules from China) → Transport (sea + road) → Installation → 25-year operation → Decommissioning → Grid offset calculation using CEA emission factors → Carbon payback time → Net benefit

**Pattern 2 — Avoided Emissions Certificate:**
User: "How much CO2 does our 10 kWp rooftop system offset per year?"
→ Get location → Annual generation estimate → Regional grid emission factor → Annual avoided emissions → Lifetime projection with degradation → Comparison to household carbon footprint

**Pattern 3 — Manufacturing Comparison:**
User: "Compare the carbon footprint of modules manufactured in China vs India vs EU"
→ Manufacturing grid mix comparison → Embodied carbon by origin → Transport distance differences → Total lifecycle comparison → Break-even analysis

## Capabilities

### 1. Lifecycle Carbon Footprint Calculation
Calculate total GHG emissions across all lifecycle phases:
- Raw material extraction and processing
- Cell and module manufacturing (by technology and origin)
- Balance of System (BOS) component manufacturing
- Transport and logistics (multi-modal)
- Site preparation and installation
- Operation and maintenance (25–30 years)
- Decommissioning and end-of-life treatment

### 2. Grid Emission Factor Database
Access and apply region-specific grid emission factors:
- Country-level average and marginal emission factors
- Sub-national/grid-level factors (e.g., Indian regional grids, US eGRID subregions)
- Historical trends and projections for grid decarbonization
- Combined margin (build margin + operating margin) for CDM-style calculations

### 3. Avoided Emissions & Carbon Offset Calculation
Quantify the climate benefit of the PV system:
- Annual avoided emissions based on displaced grid electricity
- Lifetime avoided emissions with degradation adjustment
- Net carbon balance (avoided minus embodied)
- Equivalent metrics (cars removed, trees planted, households powered)

### 4. Carbon Payback Time Analysis
Determine when the PV system becomes carbon-negative:
- Simple payback: embodied emissions ÷ annual avoided emissions
- Dynamic payback accounting for grid decarbonization trends
- Sensitivity to key variables (irradiance, degradation, grid factor)
- Comparison across module technologies

### 5. Scope 1/2/3 Reporting
Structure emissions for corporate GHG reporting:
- Scope 1: Direct emissions from owned/controlled sources (installation equipment, on-site generators)
- Scope 2: Indirect emissions from purchased electricity (factory, office)
- Scope 3: Value chain emissions (upstream manufacturing, downstream use, end-of-life)
- GHG Protocol-aligned categorization

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `system_capacity` | float | Yes | Installed PV system capacity in kWp or MWp |
| `location` | string | Yes | Project location (country, state/region, or coordinates) |
| `grid_emission_factor` | float | No | Grid CO2 intensity in gCO2eq/kWh (auto-selected if location provided) |
| `annual_generation` | float | No | Estimated annual energy generation in kWh (calculated from capacity + location if not provided) |
| `system_lifetime` | int | No | Expected system lifetime in years (default: 25) |
| `module_technology` | string | No | Module type: "mono-Si", "multi-Si", "CdTe", "CIGS", "HJT", "TOPCon", "perovskite" (default: "mono-Si") |
| `module_manufacturing_origin` | string | No | Country of module manufacture: "China", "India", "EU", "US", "SEA" (default: "China") |
| `transport_distance` | float | No | Total transport distance in km from factory to site |
| `transport_mode` | string | No | Transport mode: "sea", "road", "rail", "air", "multimodal" (default: "multimodal") |
| `degradation_rate` | float | No | Annual power degradation rate in %/year (default: 0.5) |
| `bos_type` | string | No | Balance of System: "ground-mount", "rooftop", "floating", "tracker" (default: "ground-mount") |
| `include_eol` | bool | No | Include end-of-life/decommissioning emissions (default: true) |
| `recycling_scenario` | string | No | End-of-life scenario: "landfill", "recycling", "refurbishment" (default: "recycling") |
| `scope` | list | No | GHG scopes to include: [1, 2, 3] (default: all) |
| `functional_unit` | string | No | Reporting unit: "per_kWh", "per_kWp", "total_system" (default: "per_kWh") |

## Embodied Carbon Reference Data

### Manufacturing Carbon Intensity by Technology

| Module Technology | Embodied Carbon (gCO2eq/Wp) | Source |
|-------------------|----------------------------|--------|
| Mono-Si (China) | 550–750 | IEA PVPS Task 12, 2022 |
| Mono-Si (Europe) | 350–450 | Fraunhofer ISE, 2023 |
| Mono-Si (India) | 450–600 | CEEW/TERI estimates |
| Multi-Si (China) | 500–650 | IEA PVPS Task 12, 2022 |
| CdTe | 200–300 | First Solar sustainability report |
| CIGS | 300–450 | ZSW/Avancis data |
| HJT | 500–700 | Emerging technology estimates |
| TOPCon | 520–720 | Emerging technology estimates |
| Perovskite | 100–200 | Lab-scale projections |

### Transport Emission Factors

| Mode | Emission Factor | Unit |
|------|----------------|------|
| Ocean freight | 10–15 | gCO2eq/tonne-km |
| Road (truck) | 60–100 | gCO2eq/tonne-km |
| Rail | 20–30 | gCO2eq/tonne-km |
| Air freight | 500–800 | gCO2eq/tonne-km |

## Example Usage

### Full System Carbon Footprint

```
Prompt: "Calculate the complete carbon footprint for a 50 MWp ground-mount
solar farm in Tamil Nadu, India. Modules are mono-Si manufactured in China,
shipped by sea to Chennai port and transported 200 km by road to site.
System lifetime 25 years, expected annual generation 80 GWh in year 1."
```

**Expected output:**
1. System specifications and assumptions table
2. Embodied carbon breakdown by lifecycle phase:
   - Module manufacturing: ~35,000 tCO2eq
   - BOS manufacturing: ~5,000 tCO2eq
   - Transport (sea + road): ~1,200 tCO2eq
   - Installation: ~800 tCO2eq
   - O&M (25 years): ~2,500 tCO2eq
   - Decommissioning: ~1,000 tCO2eq
   - **Total embodied: ~45,500 tCO2eq**
3. Avoided emissions calculation:
   - Grid emission factor (Southern grid): ~720 gCO2eq/kWh
   - Year 1 avoided: ~57,600 tCO2eq
   - Lifetime avoided (with 0.5%/yr degradation): ~1,350,000 tCO2eq
4. Carbon payback time: ~0.8 years
5. Net carbon benefit: ~1,304,500 tCO2eq over 25 years
6. Carbon intensity: ~24 gCO2eq/kWh (lifecycle)
7. Sensitivity analysis table
8. Visualization: cumulative emissions vs. avoided emissions over 25 years

### Carbon Payback Comparison

```
Prompt: "Compare carbon payback times for mono-Si modules manufactured in
China, India, and Europe, all installed at the same 10 MWp project site
in Maharashtra, India."
```

**Expected output:**

| Origin | Embodied Carbon (tCO2eq) | Transport (tCO2eq) | Total (tCO2eq) | Carbon Payback (years) |
|--------|--------------------------|--------------------|-----------------|-----------------------|
| China | 6,500 | 280 | 6,780 | 0.9 |
| India | 5,250 | 50 | 5,300 | 0.7 |
| Europe | 4,000 | 320 | 4,320 | 0.6 |

### Annual Offset Report

```
Prompt: "Generate an annual carbon offset report for a 5 kWp residential
rooftop system in Munich, Germany, installed in 2023."
```

**Expected output:**
1. System details and location-specific parameters
2. Annual generation: ~5,000 kWh (specific yield ~1,000 kWh/kWp)
3. German grid emission factor: ~380 gCO2eq/kWh (2023, UBA)
4. Annual avoided emissions: ~1.9 tCO2eq
5. Equivalent to: removing 0.4 cars from road, planting 85 trees
6. Cumulative offset projection over system lifetime
7. Note on declining grid emission factor impact over time

## Standards & References

- GHG Protocol Corporate Accounting and Reporting Standard (WRI/WBCSD, 2015 revision)
- ISO 14064-1:2018 — Specification with guidance for quantification and reporting of GHG emissions and removals
- ISO 14067:2018 — Carbon footprint of products — Requirements and guidelines for quantification
- IPCC AR6 (2021) — Emission factors and global warming potentials (GWP100)
- IEA PVPS Task 12 — Environmental, Health and Safety (EHS) reports on PV lifecycle emissions
- IEA CO2 Emissions from Fuel Combustion (annual) — Country-level grid emission factors
- CEA CO2 Baseline Database (India) — Indian grid emission factors by regional grid
- EPA eGRID (US) — Subregional emission factors for US power grids
- European Environment Agency — EU Member State emission factors
- IEC TS 62941:2019 — Terrestrial PV modules — Quality system for PV module manufacturing

## Related Skills

- `lca-assessment` — Full Life Cycle Assessment with EPBT and EROI calculations
- `esg-reporting` — ESG metrics and sustainability reporting frameworks
- `recycling-planner` — End-of-life recycling and material recovery planning
- `policy-framework` — Carbon credit and renewable energy certificate policy analysis
- `energy-yield` — Annual energy generation estimation for avoided emissions calculation
