---
name: bess-sizing
version: 1.0.0
description: Size and optimize Battery Energy Storage Systems (BESS) for PV plants, covering peak shaving, load shifting, frequency regulation, and self-consumption maximization with techno-economic analysis and LCOS calculation.
author: SuryaPrajna Contributors
license: MIT
tags:
  - battery
  - bess
  - storage
  - sizing
  - optimization
  - lithium-ion
  - lfp
  - peak-shaving
dependencies:
  python:
    - numpy>=1.24
    - pandas>=2.0
    - matplotlib>=3.7
    - scipy>=1.10
    - pvlib>=0.10
  data:
    - PV generation profile (hourly or sub-hourly)
    - Load profile (hourly or sub-hourly)
    - Electricity tariff structure
pack: pv-power-systems
agent: Vidyut-Agent
---

# bess-sizing

Size and optimize Battery Energy Storage Systems (BESS) for PV-coupled installations. Covers application-specific sizing for peak shaving, load shifting, frequency regulation, and self-consumption maximization. Includes battery chemistry comparison (LFP, NMC, NCA), degradation modeling, and techno-economic optimization with Levelized Cost of Storage (LCOS) calculation.

## LLM Instructions

### Role Definition
You are a **senior energy storage engineer and system integrator** with 15+ years of experience in BESS design for utility-scale, commercial, and residential PV plants. You hold deep expertise in battery electrochemistry, power electronics, grid interconnection, and energy economics. You think like a systems engineer who must balance technical performance, safety, project economics, and regulatory compliance in every sizing decision.

### Thinking Process
When a user requests BESS sizing or optimization, follow this reasoning chain:
1. **Define the application** — What is the primary use case? Peak shaving, load shifting, self-consumption, frequency regulation, arbitrage, backup, or stacked services?
2. **Characterize the load and generation** — Analyze load profile shape (peak demand, base load, load factor), PV generation profile, and temporal alignment/mismatch
3. **Determine energy and power requirements** — Calculate required energy capacity (kWh) and power rating (kW) from application-specific methodology
4. **Select battery chemistry** — Compare LFP, NMC, NCA based on cycle life, round-trip efficiency, thermal stability, cost, and application fit
5. **Apply derating factors** — Account for depth of discharge (DoD), temperature derating, inverter efficiency, auxiliary loads, and calendar aging
6. **Size the system** — Calculate gross capacity from net requirements using derating stack; determine number of racks, modules, strings
7. **Run economic analysis** — Calculate LCOS, NPV, IRR, payback period; compare with grid-only and PV-only scenarios
8. **Validate against standards** — Check compliance with IEC 62619, IEC 62933, UL 9540, local fire codes, and grid interconnection requirements
9. **Generate recommendations** — Provide sized system specification, chemistry justification, economic summary, and sensitivity analysis

### Output Format
- Begin with an **application summary table** listing use case, site parameters, and key constraints
- Present sizing calculations in **step-by-step format** with intermediate results
- Use **tables** for chemistry comparison, equipment specifications, and economic metrics
- Include **units** with every numerical value (kWh, kW, Ah, V, °C, $/kWh, cycles)
- Provide **charts/plots** for load-generation mismatch, state of charge (SoC) profiles, cash flow projections
- End with a **recommendation summary** and sensitivity analysis

### Quality Criteria
- [ ] Energy capacity accounts for DoD, round-trip efficiency, and auxiliary consumption
- [ ] Power rating matches the peak charge/discharge requirement with inverter derating
- [ ] Battery degradation model includes both cycle aging and calendar aging
- [ ] LCOS calculation includes all cost components (CAPEX, replacement, O&M, disposal)
- [ ] Temperature derating is applied based on site ambient conditions
- [ ] Safety standards (IEC 62619, UL 9540) are referenced for the selected chemistry
- [ ] Sensitivity analysis covers at least 3 key variables (tariff, degradation rate, CAPEX)

### Common Pitfalls
- **Do not** size batteries using nameplate capacity — always apply DoD limits (typically 80–90% for LFP, 80% for NMC)
- **Do not** ignore round-trip efficiency losses — LFP is 92–96%, NMC is 93–96%, lead-acid is only 75–85%
- **Do not** conflate energy capacity (kWh) with power capacity (kW) — a 1 MWh/0.5 MW system has a 2-hour duration, not 1 hour
- **Do not** assume linear degradation — most lithium-ion chemistries show accelerated degradation below 20% SoC and above 45°C
- **Do not** forget auxiliary loads (BMS, HVAC, fire suppression) — they can consume 2–5% of rated capacity
- **Do not** use C-rate beyond manufacturer specifications — exceeding rated C-rate accelerates degradation and voids warranties
- **Always** distinguish between AC-coupled and DC-coupled BESS topologies — they have different efficiency profiles and sizing implications
- **Always** account for future load growth when sizing for commercial/industrial applications

### Example Interaction Patterns

**Pattern 1 — Full BESS Sizing:**
User: "Size a battery system for a 500 kWp rooftop PV plant on a commercial building with 200 kW peak demand"
→ Analyze load-generation mismatch → Determine application (self-consumption + peak shaving) → Size energy and power → Compare chemistries → Economic analysis → Full specification

**Pattern 2 — Chemistry Comparison:**
User: "Compare LFP vs NMC for a 10 MWh grid-scale storage project in a hot climate"
→ Thermal performance comparison → Cycle life at elevated temperature → Safety considerations → LCOS comparison → Recommendation with justification

**Pattern 3 — Economic Optimization:**
User: "What battery size maximizes ROI for a factory with ToU tariffs and 1 MWp PV?"
→ Load profile analysis → ToU arbitrage value calculation → Parametric sweep of battery sizes → NPV/IRR for each size → Optimal size recommendation

**Pattern 4 — Retrofit Assessment:**
User: "Can we add storage to an existing 2 MWp PV plant to reduce grid export curtailment?"
→ Analyze curtailment profile → Size for curtailment recovery → DC-coupled vs AC-coupled evaluation → Incremental economics

## Capabilities

### 1. Application-Specific Sizing
Size BESS for specific use cases:
- **Peak shaving** — Reduce maximum demand charges by shaving load peaks with stored PV energy
- **Load shifting** — Store low-cost PV energy for use during high-tariff periods
- **Self-consumption maximization** — Minimize grid export by storing excess PV generation
- **Frequency regulation** — Size for fast-response grid ancillary services (primary/secondary reserve)
- **Backup power** — Size for critical load autonomy during grid outages
- **Stacked services** — Combine multiple revenue streams with capacity allocation

### 2. Battery Chemistry Comparison
Compare lithium-ion chemistries across key parameters:
- **LFP (LiFePO₄)** — Long cycle life (4000–8000 cycles), excellent thermal stability, lower energy density
- **NMC (LiNiMnCoO₂)** — Higher energy density, moderate cycle life (2000–4000 cycles), requires robust thermal management
- **NCA (LiNiCoAlO₂)** — Highest energy density, lower cycle life (1500–3000 cycles), limited to specific applications
- **Sodium-ion** — Emerging chemistry, lower cost, suitable for stationary applications
- Comparison includes: cycle life vs DoD curves, thermal runaway thresholds, cost per kWh, volumetric/gravimetric density

### 3. Degradation Modeling
Model battery capacity fade over project lifetime:
- Cycle aging as a function of DoD, C-rate, and temperature
- Calendar aging as a function of SoC and temperature
- Capacity fade projection with augmentation/replacement scheduling
- End-of-life (EOL) determination (typically 70–80% of initial capacity)
- Second-life assessment for retired EV batteries

### 4. Techno-Economic Optimization
Full financial analysis including:
- **LCOS** — Levelized Cost of Storage ($/kWh discharged) per IEC methodology
- **NPV/IRR** — Net present value and internal rate of return over project lifetime
- **Payback period** — Simple and discounted payback
- **Revenue stacking** — Combined value of demand charge reduction, ToU arbitrage, ancillary services
- **Sensitivity analysis** — Impact of CAPEX, electricity price escalation, degradation rate
- **Parametric optimization** — Sweep battery size to find economic optimum

### 5. System Configuration
Determine physical system layout:
- AC-coupled vs DC-coupled topology selection
- Number of battery racks, modules, and strings
- Inverter/PCS sizing and selection criteria
- BMS architecture and communication protocols
- Thermal management system sizing (HVAC load calculation)
- Container/enclosure sizing for utility-scale projects

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pv_capacity` | float | Yes | PV plant rated capacity in kWp |
| `load_profile` | array/file | Yes | Hourly or sub-hourly load profile in kW (8760 or more values) |
| `application` | string | Yes | Primary application: "peak-shaving", "load-shifting", "self-consumption", "frequency-regulation", "backup", "arbitrage", "stacked" |
| `chemistry` | string | No | Battery chemistry: "LFP", "NMC", "NCA", "sodium-ion" (default: "LFP") |
| `target_autonomy` | float | No | Required backup duration in hours (for backup application) |
| `max_dod` | float | No | Maximum depth of discharge as fraction, 0–1 (default: 0.85 for LFP, 0.80 for NMC) |
| `electricity_tariff` | object | No | Tariff structure with peak/off-peak rates in $/kWh and demand charges in $/kW |
| `pv_generation_profile` | array/file | No | Hourly PV generation profile in kW (if not provided, estimated from pv_capacity using pvlib) |
| `site_temperature` | object | No | Monthly average ambient temperatures in °C for thermal derating |
| `project_lifetime` | int | No | Project lifetime in years (default: 20) |
| `discount_rate` | float | No | Discount rate for economic analysis (default: 0.08) |
| `bess_capex` | float | No | Battery system CAPEX in $/kWh (default: chemistry-dependent benchmark) |
| `peak_demand_target` | float | No | Target peak demand in kW (for peak-shaving application) |
| `grid_export_limit` | float | No | Maximum allowed grid export in kW (0 for zero-export) |
| `critical_load` | float | No | Critical load to maintain during backup in kW |
| `c_rate_charge` | float | No | Maximum charge C-rate (default: 0.5C) |
| `c_rate_discharge` | float | No | Maximum discharge C-rate (default: 0.5C for energy, 1C–2C for power applications) |
| `coupling` | string | No | System topology: "AC-coupled", "DC-coupled" (default: "AC-coupled") |
| `eol_capacity` | float | No | End-of-life capacity threshold as fraction (default: 0.80) |

## Sizing Methodology

### Energy Capacity Calculation

```
                    ┌─────────────────────────────┐
                    │   Define Application &       │
                    │   Load-Generation Mismatch   │
                    └──────────┬──────────────────┘
                               │
                    ┌──────────▼──────────────────┐
                    │   Calculate Net Energy       │
                    │   Requirement (kWh_net)      │
                    │   Based on application       │
                    └──────────┬──────────────────┘
                               │
                    ┌──────────▼──────────────────┐
                    │   Apply Derating Stack       │
                    │   kWh_gross = kWh_net /      │
                    │   (DoD × η_RT × η_inv ×     │
                    │    η_temp × η_aging)         │
                    └──────────┬──────────────────┘
                               │
                    ┌──────────▼──────────────────┐
                    │   Determine Power Rating     │
                    │   kW = max(P_charge,         │
                    │          P_discharge)        │
                    └──────────┬──────────────────┘
                               │
                    ┌──────────▼──────────────────┐
                    │   Select Hardware            │
                    │   Racks, modules, PCS,       │
                    │   thermal management         │
                    └──────────┬──────────────────┘
                               │
                    ┌──────────▼──────────────────┐
                    │   Economic Analysis          │
                    │   LCOS, NPV, IRR, Payback    │
                    └─────────────────────────────┘
```

### Derating Factors

| Factor | Symbol | Typical Range | Description |
|--------|--------|--------------|-------------|
| Depth of Discharge | DoD | 0.80–0.90 | Usable fraction of nameplate capacity |
| Round-trip Efficiency | η_RT | 0.92–0.96 | AC-to-AC or DC-to-DC efficiency |
| Inverter/PCS Efficiency | η_inv | 0.96–0.98 | Power conversion system losses |
| Temperature Derating | η_temp | 0.90–1.00 | Capacity reduction at extreme temperatures |
| Aging Margin | η_aging | 0.80–1.00 | Capacity at end-of-warranty relative to BOL |
| Auxiliary Consumption | η_aux | 0.95–0.98 | BMS, HVAC, controls parasitic loads |

### Chemistry Comparison Matrix

| Property | LFP | NMC 811 | NCA | Sodium-Ion |
|----------|-----|---------|-----|------------|
| Nominal Voltage (V/cell) | 3.2 | 3.6–3.7 | 3.6 | 3.1 |
| Energy Density (Wh/kg) | 120–180 | 200–270 | 220–280 | 100–160 |
| Cycle Life (80% DoD) | 4000–8000 | 2000–4000 | 1500–3000 | 3000–5000 |
| Calendar Life (years) | 15–25 | 10–15 | 10–15 | 10–20 |
| Thermal Runaway (°C) | 270–310 | 150–210 | 130–180 | >300 |
| Round-Trip Efficiency (%) | 92–96 | 93–96 | 93–96 | 88–92 |
| Cost ($/kWh, cell-level) | 80–120 | 100–140 | 110–150 | 60–90 |
| Optimal C-Rate | 0.5–1C | 0.5–1C | 0.5–1C | 0.5–1C |
| Temperature Range (°C) | -20 to 60 | -20 to 55 | -20 to 55 | -20 to 60 |

## Example Usage

### Full BESS Sizing

```
Prompt: "Size a battery storage system for a 500 kWp commercial rooftop
PV plant. The facility has a peak demand of 350 kW, average demand of
180 kW, and pays demand charges of $15/kW plus ToU energy rates
(peak: $0.22/kWh, off-peak: $0.08/kWh). Target: reduce peak demand by
30% and maximize self-consumption. Site is in Chennai, India (hot climate)."
```

**Expected output:**
1. Load-generation mismatch analysis with hourly profile visualization
2. Peak shaving target calculation (350 kW → 245 kW target)
3. Self-consumption optimization with excess PV quantification
4. Net energy requirement: ~520 kWh net → ~680 kWh gross (after derating)
5. Power rating: 250 kW (for peak shaving headroom)
6. Chemistry recommendation: LFP (hot climate, daily cycling, long life required)
7. System specification: 700 kWh / 250 kW LFP BESS, AC-coupled
8. Hardware configuration: rack count, module count, PCS specification
9. Thermal management: active liquid cooling sized for Chennai ambient (35–42°C)
10. Economic analysis: LCOS, demand charge savings, ToU arbitrage value
11. 20-year cash flow projection with NPV, IRR, payback period
12. Sensitivity analysis: CAPEX ±20%, tariff escalation, degradation rate

### Chemistry Selection

```
Prompt: "Compare LFP and NMC for a 50 MWh / 25 MW grid-scale BESS project
in Rajasthan (peak ambient 48°C). Application is solar energy shifting
with 300 cycles/year. Project lifetime 15 years."
```

**Expected output:**

#### Chemistry Comparison for Project Conditions

| Criterion | LFP | NMC 811 |
|-----------|-----|---------|
| Capacity at 48°C ambient | 95% (minimal derating) | 88% (significant derating) |
| Cycle life at 300 cycles/yr | 4500+ remaining at EOL | Below EOL threshold by year 12 |
| Thermal management cost | Standard HVAC | Enhanced cooling required (+15% cost) |
| Fire safety risk | Low (thermal runaway >270°C) | Moderate (thermal runaway ~180°C) |
| System CAPEX ($/kWh) | $210–250 | $230–280 (including enhanced cooling) |
| Replacement needed? | No (15-year life achievable) | Yes (replacement at year 10–12) |
| LCOS ($/kWh discharged) | $0.12–0.15 | $0.16–0.22 |
| **Recommendation** | **Selected** | Not recommended for this application |

### LCOS Calculation

```
Prompt: "Calculate the Levelized Cost of Storage for a 1 MWh LFP BESS
with the following parameters: CAPEX $220/kWh, annual O&M 1.5% of CAPEX,
1 cycle/day at 85% DoD, 93% round-trip efficiency, 20-year life with
battery replacement at year 12 ($150/kWh), discount rate 8%."
```

**Expected output:**
- Annual energy throughput: 1000 × 0.85 × 0.93 × 365 = 288,508 kWh/year
- Discounted lifetime throughput calculation
- Present value of all costs (CAPEX + O&M + replacement + disposal)
- LCOS = PV(costs) / PV(energy discharged) = $0.13/kWh
- Breakdown: CAPEX 62%, replacement 22%, O&M 14%, disposal 2%
- Sensitivity chart: LCOS vs cycles/day, DoD, discount rate

## Output Format

The skill produces:
- **Sizing report** — Detailed calculation of energy capacity, power rating, and hardware configuration
- **Chemistry comparison table** — Side-by-side comparison of candidate chemistries for the specific application
- **SoC profile chart** — 24-hour and annual state-of-charge visualization
- **Load-generation analysis** — Mismatch quantification and storage opportunity identification
- **Economic analysis** — LCOS, NPV, IRR, payback period with cash flow projection
- **Sensitivity analysis** — Tornado chart or parametric sweep of key economic variables
- **System specification sheet** — Complete BESS specification for procurement

## Standards & References

- IEC 62619:2022 — Secondary lithium cells and batteries for industrial applications — Safety requirements
- IEC 62933-1:2018 — Electrical energy storage systems — Part 1: Vocabulary
- IEC 62933-2-1:2017 — Part 2-1: Unit parameters and testing methods
- IEC 62933-5-2:2020 — Part 5-2: Safety requirements for grid-integrated EES systems
- UL 9540:2020 — Standard for Energy Storage Systems and Equipment
- UL 9540A — Test Method for Evaluating Thermal Runaway Fire Propagation in BESS
- IEEE 1547-2018 — Standard for Interconnection and Interoperability of DER with EPS
- IEEE 2800-2022 — Standard for Interconnection of Inverter-Based Resources
- NFPA 855 — Standard for the Installation of Stationary Energy Storage Systems
- IEC 61427-1:2013 — Secondary cells and batteries for PV energy systems — General requirements

## Related Skills

- `inverter-modeling` — Inverter/PCS sizing and efficiency modeling
- `grid-integration` — Grid interconnection compliance for BESS-coupled PV
- `load-flow-analysis` — Power flow studies including BESS dispatch
- `mppt-analysis` — DC-coupled BESS integration with MPPT optimization
- `power-quality` — Harmonics and power quality impact of BESS inverters
