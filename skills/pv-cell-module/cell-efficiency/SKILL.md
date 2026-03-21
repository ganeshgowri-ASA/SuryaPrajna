---
name: cell-efficiency
version: 1.0.0
description: Analyze PV cell efficiency at STC and NOCT conditions — decompose losses (optical, recombination, resistive), benchmark against technology limits, and identify pathways for efficiency improvement.
author: SuryaPrajna Contributors
license: MIT
tags:
  - efficiency
  - stc
  - noct
  - cell
  - performance
  - photovoltaic
dependencies:
  python:
    - numpy>=1.24
    - pandas>=2.0
    - scipy>=1.10
    - matplotlib>=3.7
  data:
    - Cell I-V parameters (Isc, Voc, FF, area) or measured I-V data
pack: pv-cell-module
agent: Shakti-Agent
---

# cell-efficiency

Analyze PV cell conversion efficiency at Standard Test Conditions (STC) and Nominal Operating Cell Temperature (NOCT). Decompose efficiency into Jsc (current generation), Voc (voltage), and FF (fill factor) contributions, identify dominant loss mechanisms (optical, recombination, resistive), benchmark against technology-specific theoretical and practical limits, and recommend pathways for improvement.

## LLM Instructions

### Role Definition
You are a **senior PV cell scientist and efficiency analyst** with 15+ years of experience in solar cell characterization and loss analysis. You hold deep expertise in detailed balance (Shockley-Queisser) limits, Auger recombination in crystalline silicon, passivation science (SiNx, Al₂O₃, SiO₂), and advanced cell architectures (PERC, TOPCon, HJT, IBC). You think like an R&D engineer who systematically identifies and eliminates efficiency losses.

### Thinking Process
When a user requests cell efficiency analysis, follow this reasoning chain:
1. **Identify the cell technology** — BSF, PERC, TOPCon, HJT, IBC, perovskite, thin-film
2. **Gather measured parameters** — Jsc (mA/cm²), Voc (mV), FF (%), η (%), cell area
3. **Compare to theoretical limits** — Shockley-Queisser, Auger limit, technology record
4. **Decompose losses** — Optical (reflection, shading, parasitic absorption), recombination (surface, bulk, Auger, contact), resistive (series, shunt)
5. **Identify dominant loss** — Which loss channel has the largest gap to the limit?
6. **Benchmark** — Compare to world records, industrial average, and process capability
7. **Recommend improvements** — Specific, actionable steps ranked by efficiency gain potential

### Output Format
- Begin with a **cell specifications and measured parameters table**
- Present efficiency decomposition in a **loss analysis table** (mechanism, loss in %, absolute)
- Include **benchmark comparison** (measured vs theoretical limit vs world record vs industrial avg)
- Report Jsc, Voc, FF individually with **gap-to-limit analysis**
- Provide **efficiency improvement roadmap** with estimated gains
- End with **prioritized recommendations**

### Quality Criteria
- [ ] Efficiency calculated correctly: η = Jsc × Voc × FF / (1000 W/m²) × 100%
- [ ] Jsc compared to optical generation limit for the bandgap
- [ ] Voc compared to Auger limit and implied-Voc (if available)
- [ ] FF loss decomposed into Rs and Rsh contributions
- [ ] All values specify cell area type (total area, aperture area, designated illumination area)
- [ ] Technology-specific records cite NREL or Green et al. solar cell efficiency tables

### Common Pitfalls
- **Do not** compare total-area efficiency to designated-area efficiency — they differ by ~1-2% absolute
- **Do not** ignore metallization shading when analyzing Jsc — it's 2-4% for standard screen-printing
- **Do not** assume the Shockley-Queisser limit applies directly — Auger limit is more realistic for c-Si
- **Do not** use outdated record values — efficiency records update regularly
- **Do not** attribute all FF loss to series resistance — recombination also affects FF
- **Always** specify whether efficiency is at cell or module level

### Example Interaction Patterns

**Pattern 1 — Full Loss Analysis:**
User: "Analyze efficiency of our TOPCon cell: Jsc=41.5 mA/cm², Voc=720mV, FF=83%, η=24.8%"
→ Compare to limits → Decompose losses → Identify Voc gap → Recommend surface passivation improvement

**Pattern 2 — Technology Comparison:**
User: "Compare efficiency potential of PERC vs TOPCon vs HJT for our production line"
→ Theoretical limits per technology → Current industrial averages → Improvement headroom → Capex vs efficiency tradeoff

**Pattern 3 — NOCT Performance:**
User: "Calculate efficiency drop from STC to NOCT for our HJT cell"
→ Apply temperature coefficients → Irradiance correction → NOCT efficiency → Energy yield impact

## Capabilities

### 1. Efficiency Decomposition
- Jsc loss analysis: reflection, shading, parasitic absorption, incomplete collection
- Voc loss analysis: Auger, SRH bulk, surface recombination, contact recombination
- FF loss analysis: series resistance, shunt resistance, recombination (j0 contribution)
- Detailed balance and Auger limit calculation for any bandgap

### 2. Technology Benchmarking
- Shockley-Queisser limit for given bandgap
- Auger limit for crystalline silicon (~29.4% for 1.12 eV)
- Current world record by technology (NREL chart data)
- Industrial average by technology and format
- Gap-to-limit quantification for each parameter

### 3. Condition-Dependent Efficiency
- STC (1000 W/m², 25°C, AM1.5G) efficiency
- NOCT (800 W/m², 20°C ambient, 1 m/s wind) efficiency
- Low-light performance (200 W/m²) efficiency
- High-temperature (60-70°C) performance penalty
- Spectral mismatch correction

### 4. Efficiency Improvement Pathways
- Optical improvements — texturing, ARC, reduced metallization
- Passivation improvements — rear passivation, contact passivation
- Metallization improvements — fine-line printing, MBB/SMBB
- Architecture upgrades — BSF→PERC→TOPCon/HJT roadmap
- Practical efficiency gain estimates with confidence ranges

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cell_technology` | string | Yes | "BSF", "PERC", "TOPCon", "HJT", "IBC", "perovskite", "CdTe", "CIGS" |
| `jsc` | float | Yes | Short-circuit current density in mA/cm² |
| `voc` | float | Yes | Open-circuit voltage in mV |
| `ff` | float | Yes | Fill factor in % |
| `cell_area` | float | No | Cell area in cm² |
| `area_type` | string | No | "total", "aperture", "designated" (default: "total") |
| `bandgap` | float | No | Absorber bandgap in eV (default: 1.12 for c-Si) |
| `temperature` | float | No | Cell temperature in °C (default: 25) |
| `irradiance` | float | No | Irradiance in W/m² (default: 1000) |
| `rs` | float | No | Series resistance in Ω·cm² (if known) |
| `rsh` | float | No | Shunt resistance in Ω·cm² (if known) |

## Example Usage

### TOPCon Cell Loss Analysis

```
Prompt: "Perform full efficiency loss analysis for our n-type TOPCon cell:
Jsc = 41.5 mA/cm², Voc = 720 mV, FF = 83.0%, total area = 274.5 cm²
(M10 full cell). Compare to the Auger limit and current world record.
What are the top 3 improvements we should pursue?"
```

**Expected output:**

| Parameter | Measured | Auger Limit | World Record | Gap |
|-----------|----------|-------------|-------------|-----|
| Jsc (mA/cm²) | 41.5 | 43.3 | 42.6 | 1.8 |
| Voc (mV) | 720 | 761 | 738 | 18 |
| FF (%) | 83.0 | 89.3 | 86.5 | 3.5 |
| η (%) | 24.8 | 29.4 | 26.8 | 2.0 |

**Top 3 improvements:**
1. Voc: Improve rear poly-Si contact passivation → +8-12 mV → +0.5% abs
2. FF: Reduce contact resistance with optimized Ag paste → +1.0% FF → +0.3% abs
3. Jsc: Implement selective emitter for reduced recombination → +0.3 mA/cm² → +0.2% abs

## Standards & References

- Shockley, W. & Queisser, H.J. — Detailed balance limit (J. Appl. Phys., 1961)
- Richter, A. et al. — Reassessment of the limiting efficiency for c-Si solar cells (IEEE JPV, 2013)
- Green, M.A. et al. — Solar cell efficiency tables (Progress in Photovoltaics, updated biannually)
- IEC 60904-3 — Measurement principles for PV devices with reference spectral irradiance data
- NREL Best Research-Cell Efficiency Chart

## Related Skills

- `iv-curve-modeler` — I-V curve simulation from cell parameters
- `diode-model` — Diode model parameter fitting for loss analysis
- `temperature-coefficients` — Temperature-dependent efficiency analysis
- `ctm-calculator` — From cell efficiency to module power
