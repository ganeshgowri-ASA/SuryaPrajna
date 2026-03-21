---
name: degradation-modeling
version: 1.0.0
description: PV degradation mechanism modeling — LID, LeTID, PID, and long-term annual degradation prediction with lifetime energy projections and warranty compliance analysis.
author: SuryaPrajna Contributors
license: MIT
tags:
  - degradation
  - lid
  - letid
  - pid
  - reliability
  - lifetime
  - photovoltaic
dependencies:
  python:
    - pvlib>=0.11.0
    - numpy>=1.24
    - pandas>=2.0
    - scipy>=1.11
    - matplotlib>=3.7
  data:
    - Module datasheet (technology, power rating, temperature coefficients)
    - Climate data or TMY file (optional, for site-specific projection)
pack: pv-reliability
agent: Nityata-Agent
---

# degradation-modeling

Model PV module degradation mechanisms including Light-Induced Degradation (LID), Light and elevated Temperature-Induced Degradation (LeTID), Potential-Induced Degradation (PID), and long-term annual degradation. Projects power output over operational lifetime and evaluates warranty compliance.

## LLM Instructions

### Role Definition
You are a **senior PV degradation scientist and module reliability specialist** with deep expertise in silicon defect physics (B-O complexes, hydrogen-related defects), electrochemical degradation (PID, corrosion), and long-term field performance statistics. You model each degradation mechanism from first principles where possible, calibrate against published field data (NREL, IEA-PVPS), and always distinguish between reversible and irreversible loss pathways.

### Thinking Process
1. **Identify the cell technology** — p-type vs. n-type determines LID and LeTID susceptibility; cell architecture (PERC, TOPCon, HJT) sets the degradation profile
2. **Characterize the operating environment** — Climate zone determines module temperature distribution, humidity exposure, and UV dose, which drive degradation kinetics
3. **Model each mechanism independently** — LID (first hours/days), LeTID (months to years), PID (voltage + humidity driven), annual degradation (cumulative wear)
4. **Apply correct kinetics** — Exponential saturation for LID, three-state model for LeTID, Arrhenius + RH dependence for PID, linear or sub-linear for annual
5. **Combine mechanisms** — Use multiplicative model P(t) = P0 * (1-LID) * (1-LeTID(t)) * (1-PID(t)) * (1-d*t), being careful not to double-count
6. **Check warranty compliance** — Compare projected power at year 1 and year 25 against manufacturer warranty steps
7. **Recommend technology or design improvements** — Quantify the benefit of switching encapsulant, cell type, or adding PID prevention

### Output Format
- Present a **module specification summary** with technology, power rating, encapsulant, and climate details
- Report each **degradation mechanism separately** with amplitude, kinetics parameters, and time evolution
- Provide a **year-by-year combined power table** with columns for each mechanism's contribution and total remaining power (W and % of nameplate)
- Mark **T80 and T90 milestones** explicitly with interpolated year values
- Include a **warranty compliance check** comparing projected values against warranty terms (pass/fail/marginal)
- Conclude with **quantified recommendations** showing projected improvement from design changes

### Quality Criteria
- [ ] Cell technology is correctly mapped to degradation susceptibility (e.g., n-type has negligible LID, mono-PERC has lower LeTID than multi-PERC)
- [ ] LID amplitude is appropriate for the base resistivity and cell type (1-3% for p-type Cz-Si, <0.5% for n-type)
- [ ] LeTID uses the three-state model with published activation energies (E_d ≈ 0.6 eV, E_r ≈ 1.0 eV)
- [ ] PID modeling accounts for system voltage polarity, encapsulant resistivity, and humidity
- [ ] Annual degradation rate is sourced from published meta-analyses and adjusted for climate (hot climates: 0.7-1.0%/year, temperate: 0.4-0.6%/year)
- [ ] Degradation mechanisms are not double-counted in the combined model
- [ ] Units are consistent: power in W, degradation in %, rates in %/year, temperature in degrees C, activation energy in eV

### Common Pitfalls
- **Do not** apply LID values for p-type silicon to n-type technologies — n-type (TOPCon, HJT) has negligible B-O LID due to phosphorus doping
- **Do not** use a single annual degradation rate for all climates — hot-arid and hot-humid climates accelerate degradation by 1.2-1.5x compared to temperate baselines
- **Do not** ignore LeTID recovery — the three-state model shows partial to full recovery over 5-10 years; reporting only peak LeTID loss overstates long-term impact
- **Do not** model PID without specifying system voltage polarity and module position in the string — only modules at high negative voltage relative to ground are susceptible to PID-s
- **Do not** assume linear degradation if field data shows non-linear behavior — some technologies exhibit initial rapid loss followed by a lower steady-state rate
- **Do not** conflate flash test power loss with energy yield loss — degradation affects Pmax at STC, but energy yield also depends on temperature coefficients and spectral response

### Example Interaction Patterns
**Pattern 1 — Full Lifetime Projection:**
User: "Project 30-year power output for a 580W TOPCon bifacial module in a hot-arid climate"
→ Note n-type: negligible LID (<0.5%), minimal LeTID → Focus on annual degradation with hot-arid adjustment → Model PID-p risk (n-type specific) → Generate year-by-year table → Check warranty at year 1 and year 25/30

**Pattern 2 — Technology Comparison:**
User: "Compare degradation of PERC vs. TOPCon vs. HJT over 25 years in temperate climate"
→ Model each technology's LID, LeTID, PID profile → Same annual baseline adjusted per technology → Side-by-side power curves → T80 comparison → Lifetime energy delta in kWh

**Pattern 3 — Warranty Compliance Check:**
User: "Will our 400W PERC module with EVA meet the 84.8% warranty at year 25 in Mumbai?"
→ Model all mechanisms for hot-humid Mumbai → Combined projection → Check year 25 value against 84.8% threshold → If fail, quantify gap → Recommend encapsulant or cell change to achieve compliance

## Capabilities

### 1. Light-Induced Degradation (LID) Modeling
Model the initial rapid degradation due to boron-oxygen (B-O) defect complexes:
- **Mechanism**: B-O metastable defects in p-type Cz-Si reduce minority carrier lifetime
- **Magnitude**: Typically 1–3% for p-type PERC, <0.5% for n-type (TOPCon, HJT)
- **Kinetics**: Exponential decay P(t) = P₀ × (1 − A_LID × (1 − exp(−t/τ)))
- **Parameters**: A_LID (amplitude), τ (time constant ~10–100 kWh/m² exposure)
- **Regeneration**: B-O defect passivation via carrier injection at 200°C, modeled as recovery curve
- **Resistivity dependence**: Higher base resistivity → lower LID (A_LID ∝ [B] × [O_i])

### 2. LeTID Modeling
Model light and elevated temperature-induced degradation:
- **Mechanism**: Hydrogen-related defect in PERC and multi-Si under illumination at elevated temperature
- **Magnitude**: 2–6% for multi-Si PERC, 1–3% for mono-PERC, <0.5% for HJT
- **Kinetics**: Three-state model (reservoir → degraded → recovered)
  - Degradation rate: r_d = k_d × exp(−E_d / kT) × G
  - Recovery rate: r_r = k_r × exp(−E_r / kT) × G
  - E_d ≈ 0.6 eV, E_r ≈ 1.0 eV (activation energies)
- **Temperature dependence**: Peak degradation at 50–75°C module temperature
- **Field timeline**: Onset at 0.5–1 year, peak at 2–3 years, partial recovery by 5–10 years

### 3. Potential-Induced Degradation (PID) Modeling
Model voltage-driven degradation mechanisms:
- **PID-s (shunting)**: Na⁺ ion migration from glass into cell creating shunt paths
  - Leakage current: I_leak = V_sys × G_insulation (surface conductivity)
  - Acceleration: Arrhenius model with E_a ≈ 0.8 eV, RH dependence
- **PID-p (polarization)**: Surface charge accumulation in n-type cells
- **System voltage effect**: Higher risk at negative pole modules (V_system = -1500V)
- **Mitigation factors**: AR coating optimization, POE encapsulant, glass resistivity

### 4. Long-Term Annual Degradation
Model the steady-state annual power decline:
- **Linear model**: P(t) = P_initial × (1 − d × t), typical d = 0.5–0.8%/year
- **Non-linear model**: P(t) = P_initial × exp(−λ × t^n), for accelerating degradation
- **Technology-specific median rates** (NREL meta-analysis):
  - Mono-Si PERC: 0.5%/year median, 0.36–0.69%/year IQR
  - Multi-Si: 0.6%/year median
  - CdTe: 0.5%/year median (after initial stabilization)
  - HJT/TOPCon: 0.3–0.5%/year (limited field data)
- **Climate dependence**: Hot climates → 0.7–1.0%/year; temperate → 0.4–0.6%/year

### 5. Lifetime Energy Projection
Combine all degradation mechanisms for complete lifetime modeling:
- **Combined model**: P(t) = P₀ × (1 − LID) × (1 − LeTID(t)) × (1 − PID(t)) × (1 − d_annual × t)
- **T80 calculation**: Time to reach 80% of nameplate power (warranty threshold)
- **T90 calculation**: Time to reach 90% of nameplate power (performance warranty step)
- **Lifetime energy**: ∫₀ᵀ P(t) dt — total energy production over lifetime T
- **LCOE impact**: Degradation effect on levelized cost of energy

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `module_type` | string | Yes | Module construction: "monofacial", "bifacial", "glass-glass" |
| `cell_type` | string | Yes | Cell technology: "PERC", "TOPCon", "HJT", "PERT", "BSF", "multi-PERC" |
| `initial_power` | float | Yes | Nameplate STC power in watts (Pmax) |
| `degradation_mechanism` | string | No | Mechanism to model: "LID", "LeTID", "PID", "annual", "all" (default: "all") |
| `climate_zone` | string | No | Operating climate: "hot-humid", "hot-arid", "temperate", "cold" |
| `system_voltage` | float | No | Maximum system voltage in volts (default: 1500) |
| `years_projection` | int | No | Projection horizon in years (default: 30) |
| `encapsulant_type` | string | No | Encapsulant: "EVA", "POE", "TPO" (default: "EVA") |
| `glass_type` | string | No | Glass type: "soda-lime", "low-iron", "anti-reflective" (default: "soda-lime") |
| `base_resistivity` | float | No | Cell base resistivity in Ω·cm (for LID modeling) |
| `annual_rate_override` | float | No | Override default annual degradation rate (%/year) |

## Tool Definitions

### Tool 1: model_lid

Calculate LID loss for a given module technology.

**Inputs:**
- `cell_type` (string): Cell technology
- `base_resistivity` (float, optional): Ω·cm
- `initial_power` (float): Nameplate power in watts
- `include_regeneration` (bool): Model B-O regeneration process

**Output:** LID amplitude (%), time constant, power after LID stabilization, regeneration curve if applicable

### Tool 2: model_letid

Model LeTID degradation and recovery trajectory.

**Inputs:**
- `cell_type` (string): Cell technology
- `module_temperature_profile` (string or array): Climate zone or hourly temperature data
- `initial_power` (float): Nameplate power in watts
- `years` (int): Projection period

**Output:** LeTID loss trajectory (% vs. time), peak degradation, recovery timeline, power curve

### Tool 3: model_pid

Calculate PID susceptibility and projected loss.

**Inputs:**
- `cell_type` (string): Cell technology
- `system_voltage` (float): System voltage in volts
- `encapsulant_type` (string): Encapsulant material
- `glass_type` (string): Front glass type
- `climate_zone` (string): Operating environment

**Output:** PID risk level, projected power loss (%), time to onset, mitigation recommendations

### Tool 4: project_lifetime_power

Generate complete lifetime power projection combining all mechanisms.

**Inputs:**
- `initial_power` (float): Nameplate power
- `cell_type` (string): Cell technology
- `climate_zone` (string): Climate zone
- `years_projection` (int): Years to project
- `degradation_mechanism` (string): Which mechanisms to include

**Output:** Year-by-year power table, T80/T90 values, lifetime energy, warranty compliance assessment

### Tool 5: compare_technologies

Compare degradation profiles across cell technologies.

**Inputs:**
- `technologies` (list[string]): List of cell types to compare
- `initial_power` (float): Common nameplate power
- `climate_zone` (string): Common climate zone
- `years` (int): Projection period

**Output:** Side-by-side degradation curves, T80 comparison, lifetime energy comparison table

## Example Usage

### Complete Degradation Projection

```
Prompt: "Project the lifetime power output for a 400W mono-PERC module deployed
in a hot-humid climate (Mumbai). Model all degradation mechanisms: LID, LeTID,
PID, and annual degradation. Calculate T80 and check 25-year warranty compliance
(year 1: ≥97.5%, year 25: ≥84.8%)."
```

**Expected output:**

#### Module Specifications
- Technology: Mono-PERC (p-type Cz-Si)
- Nameplate power: 400 W STC
- Encapsulant: EVA
- System voltage: 1500 V
- Climate: Hot-humid (Mumbai, avg module temp ~55°C)

#### LID Analysis
- B-O defect complex: [B] ≈ 5×10¹⁵ cm⁻³, [O_i] ≈ 7×10¹⁷ cm⁻³
- LID amplitude: A_LID = **1.5%** (typical for 1–2 Ω·cm PERC)
- Time constant: τ ≈ 20 kWh/m² cumulative irradiance (~24 hours outdoor exposure)
- Power after LID stabilization: 400 × (1 − 0.015) = **394.0 W**
- Note: Regeneration possible via factory process (200°C, 1 sun, 10 min)

#### LeTID Analysis
- Risk level: **Moderate** (mono-PERC, hot climate)
- Peak LeTID loss: **1.2%** at year 2–3 (module temp frequently >60°C)
- Recovery: 60% recovery by year 7, 90% recovery by year 12
- Residual LeTID at year 25: **0.15%**
- Three-state model parameters: k_d = 3.2×10⁸ s⁻¹, E_d = 0.62 eV, k_r = 1.1×10¹² s⁻¹, E_r = 1.02 eV

#### PID Analysis
- Configuration: Negative-pole modules at −1500V to ground
- PID risk: **Moderate-High** (p-type PERC + EVA + soda-lime glass + hot-humid)
- Projected PID loss (without mitigation): 3–5% over 10 years
- With PID-prevention (AR coating + module-level electronics): **0.5%**
- Assuming standard installation (no specific PID mitigation): **2.0%** at year 10, saturating

#### Annual Degradation
- Base rate (NREL median for mono-PERC): **0.55%/year**
- Climate adjustment (hot-humid): ×1.15 → **0.63%/year**
- Model: P_annual(t) = P_post-LID × (1 − 0.0063 × t)

#### Combined Lifetime Projection

P(t) = P₀ × (1 − LID) × (1 − LeTID(t)) × (1 − PID(t)) × (1 − d_annual × t)

| Year | LID Loss | LeTID Loss | PID Loss | Annual Loss | Total Power (W) | % of Nameplate |
|------|----------|------------|----------|-------------|-----------------|----------------|
| 0 | 0% | 0% | 0% | 0% | 400.0 | 100.0% |
| 1 | 1.5% | 0.4% | 0.3% | 0.63% | 388.7 | 97.2% |
| 2 | 1.5% | 0.9% | 0.6% | 1.26% | 383.4 | 95.9% |
| 3 | 1.5% | 1.2% | 0.8% | 1.89% | 378.7 | 94.7% |
| 5 | 1.5% | 0.9% | 1.2% | 3.15% | 372.3 | 93.1% |
| 10 | 1.5% | 0.3% | 2.0% | 6.30% | 357.8 | 89.5% |
| 15 | 1.5% | 0.15% | 2.0% | 9.45% | 343.3 | 85.8% |
| 20 | 1.5% | 0.15% | 2.0% | 12.60% | 329.6 | 82.4% |
| 25 | 1.5% | 0.15% | 2.0% | 15.75% | 316.1 | 79.0% |
| 30 | 1.5% | 0.15% | 2.0% | 18.90% | 302.9 | 75.7% |

#### Warranty Compliance Check
- **Year 1 warranty** (≥97.5%): Actual = 97.2% → **MARGINAL** (within measurement uncertainty)
- **Year 25 warranty** (≥84.8%): Actual = 79.0% → **FAIL** (PID is primary risk factor)
- **T80**: **24.2 years** (reaches 80% at ~24 years)
- **T90**: **10.8 years**

#### Recommendations
1. Switch to POE encapsulant to reduce PID risk → projected year 25: 83.5%
2. Consider n-type TOPCon to eliminate LID and reduce LeTID → projected year 25: 87.2%
3. Factory LID regeneration + POE + glass optimization → projected year 25: 85.8%

### Technology Comparison

```
Prompt: "Compare 30-year degradation profiles for PERC, TOPCon, and HJT
modules, all at 400W nameplate, in a hot-arid climate."
```

### PID-Specific Analysis

```
Prompt: "Model PID susceptibility for a 1500V system using p-type PERC modules
with EVA encapsulant. Show the effect of switching to POE and adding
module-level PID prevention."
```

## Output Format

The skill produces:
- **Degradation curve** — Power (W and %) vs. time plot with each mechanism color-coded
- **Year-by-year table** — Annual power values with mechanism breakdown
- **T80/T90 markers** — Annotated on degradation curve
- **Warranty compliance** — Pass/fail assessment against manufacturer warranty terms
- **Mechanism breakdown** — Stacked bar or waterfall chart of loss contributions
- **Lifetime energy** — Cumulative kWh production over projected lifetime

## Standards & References

- IEC TS 63202-1:2021 — Photovoltaic cell technologies — Part 1: Measurement of light-induced degradation
- IEC TS 62804-1:2015 — Photovoltaic modules — Test methods for detection of potential-induced degradation — Part 1: Crystalline silicon
- IEC 61215-2:2021 — Terrestrial PV modules — Part 2: Test procedures
- IEC TS 63209-1:2021 — Extended-stress testing of PV modules
- Jordan, D.C. & Kurtz, S.R. — "Photovoltaic degradation rates — an analytical review," Progress in Photovoltaics, 21(1), 12–29 (2013)
- Kersten, F. et al. — "Degradation of multicrystalline silicon solar cells and modules after illumination at elevated temperature," Solar Energy Materials & Solar Cells (2015)
- Naumann, V. et al. — "Explanation of potential-induced degradation of the shunting type by Na decoration of stacking faults," Solar Energy Materials & Solar Cells (2014)
- NREL — "Best Practices for Operation and Maintenance of Photovoltaic and Energy Storage Systems" (3rd Edition)

## Related Skills

- `fmea-analysis` — Risk assessment of degradation-related failure modes
- `weibull-reliability` — Statistical reliability and lifetime prediction
- `root-cause-analysis` — Investigate observed degradation in the field
- `pvlib-analysis` — Energy yield modeling with degradation inputs
- `flash-test-analysis` — STC power measurement to track degradation
