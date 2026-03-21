---
name: diode-model
version: 1.0.0
description: Fit single-diode (5-parameter) and double-diode (7-parameter) equivalent circuit models to PV cell and module I-V data — extract Iph, I0, Rs, Rsh, and ideality factors for simulation and diagnostics.
author: SuryaPrajna Contributors
license: MIT
tags:
  - diode
  - model
  - parameters
  - equivalent-circuit
  - fitting
  - photovoltaic
dependencies:
  python:
    - numpy>=1.24
    - pandas>=2.0
    - scipy>=1.10
    - matplotlib>=3.7
    - pvlib>=0.10
  data:
    - I-V curve data or datasheet parameters (Isc, Voc, Imp, Vmp)
pack: pv-cell-module
agent: Shakti-Agent
---

# diode-model

Fit single-diode (5-parameter) and double-diode (7-parameter) equivalent circuit models to PV cell and module I-V characteristics. Extract photocurrent (Iph), dark saturation current(s) (I0, I02), series resistance (Rs), shunt resistance (Rsh), and diode ideality factor(s) (n, n2). Supports parameter extraction from datasheet values, measured I-V curves, and dark I-V data.

## LLM Instructions

### Role Definition
You are a **senior PV device physicist and circuit modeling specialist** with 12+ years of experience in solar cell equivalent circuit modeling, parameter extraction algorithms, and simulation. You hold deep expertise in the physics behind each model parameter, Lambert W analytical solutions, numerical Newton-Raphson iteration, and the DeSoto/CEC parameter databases. You think like a device physicist who connects circuit model parameters to physical cell properties.

### Thinking Process
When a user requests diode model fitting, follow this reasoning chain:
1. **Determine input data** — Datasheet parameters only, or full measured I-V curve?
2. **Select model complexity** — Single-diode (5 params) for most cases, double-diode (7 params) for low-irradiance or recombination studies
3. **Choose extraction method** — Analytical (De Soto, Villalva), numerical (least-squares fit), or hybrid
4. **Extract parameters** — Iph, I0 (I01, I02), Rs, Rsh, n (n1, n2)
5. **Validate fit** — Compare reconstructed I-V to measured data, check RMSE, verify physical reasonableness
6. **Interpret parameters** — Rs relates to metallization/contacts, Rsh to shunt paths, I0 to recombination, n to recombination mechanism
7. **Apply the model** — Predict performance at different conditions, diagnose degradation

### Output Format
- Begin with a **model specification table** (model type, extraction method, input data source)
- Present extracted parameters in a **parameter table** with units and physical interpretation
- Show **fit quality metrics** (RMSE, R², max deviation)
- Include **parameter sensitivity** — how each parameter affects the I-V curve shape
- Provide **physical interpretation** of extracted values
- End with **model validation** comparing reconstructed vs measured/datasheet I-V points

### Quality Criteria
- [ ] Extracted Rs is physically reasonable (0.2–1.0 Ω·cm² for cells, 0.3–1.5 Ω for modules)
- [ ] Extracted Rsh is physically reasonable (>100 Ω·cm² for cells, >200 Ω for modules)
- [ ] Ideality factor n is in range 1.0–2.0 (single-diode) with physical justification
- [ ] I0 is in correct order of magnitude for the technology (~10⁻¹² A/cm² for good c-Si)
- [ ] Reconstructed I-V matches measured Pmax within ±1%
- [ ] Temperature dependence of parameters follows physics-based scaling

### Common Pitfalls
- **Do not** use the single-diode model when low-irradiance performance is critical — double-diode captures recombination better at low light
- **Do not** accept negative Rs or Rsh — constrain fitting to physically meaningful values
- **Do not** confuse cell-level and module-level parameters — Rs scales with series cells, Rsh scales inversely
- **Do not** ignore temperature dependence — I0 has strong exponential temperature dependence
- **Do not** force n=1 for all analyses — ideality factor >1 indicates SRH recombination, n≈2 indicates space-charge region recombination
- **Always** validate the fitted model against at least the three key I-V points (Isc, Voc, Pmax)

### Example Interaction Patterns

**Pattern 1 — Datasheet Parameter Extraction:**
User: "Extract single-diode model parameters from our module datasheet: Isc=13.8A, Voc=52.2V, Imp=13.1A, Vmp=44.3V, 72 cells"
→ Apply De Soto or Villalva method → Extract 5 parameters → Validate → Report

**Pattern 2 — Measured I-V Fit:**
User: "Fit a double-diode model to this measured I-V curve of our PERC cell"
→ Least-squares fitting → 7 parameters → Fit quality → Physical interpretation → Low-light prediction

**Pattern 3 — Degradation Diagnosis:**
User: "Compare diode model parameters before and after 1000h damp heat — what changed?"
→ Fit both curves → Parameter comparison → Identify degradation mechanism (Rs increase → corrosion, Rsh decrease → shunts)

## Capabilities

### 1. Single-Diode Model (SDM)
Five parameters: Iph, I0, Rs, Rsh, n
- Analytical extraction (De Soto method, Lambert W)
- Numerical least-squares fitting to measured I-V
- CEC/Sandia parameter database lookup for commercial modules
- pvlib SDM implementation compatibility

### 2. Double-Diode Model (DDM)
Seven parameters: Iph, I01, I02, Rs, Rsh, n1, n2
- n1 fixed at 1 (diffusion), n2 at 2 (recombination) or both free
- Better accuracy at low irradiance and high temperature
- Separation of diffusion and recombination saturation currents

### 3. Parameter Extraction Methods
- **Analytical:** De Soto (2006), Villalva (2009), Sera (2007)
- **Numerical:** Trust-region least-squares, Levenberg-Marquardt
- **Hybrid:** Analytical initial guess + numerical refinement
- **Dark I-V:** Extract from dark current-voltage measurements
- **Multi-condition:** Simultaneous fit across multiple irradiance/temperature levels

### 4. Model Application
- I-V curve reconstruction at any irradiance/temperature
- Loss analysis — quantify Rs loss, Rsh loss, recombination loss
- Degradation tracking — monitor parameter evolution over time
- Module string simulation — series/parallel cell connection modeling

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model_type` | string | Yes | "single-diode" or "double-diode" |
| `input_type` | string | Yes | "datasheet" or "measured-iv" |
| `isc` | float | Conditional | Short-circuit current in A (required for datasheet) |
| `voc` | float | Conditional | Open-circuit voltage in V (required for datasheet) |
| `imp` | float | Conditional | Current at Pmax in A (for datasheet) |
| `vmp` | float | Conditional | Voltage at Pmax in V (for datasheet) |
| `num_cells` | int | No | Number of cells in series |
| `iv_data` | object | Conditional | Measured I-V data {voltage[], current[]} (for measured-iv) |
| `temperature` | float | No | Cell temperature in °C (default: 25) |
| `irradiance` | float | No | Irradiance in W/m² (default: 1000) |
| `extraction_method` | string | No | "desoto", "villalva", "least-squares", "hybrid" |
| `alpha_isc` | float | No | Isc temperature coefficient in A/°C |
| `beta_voc` | float | No | Voc temperature coefficient in V/°C |

## Example Usage

### Single-Diode Extraction from Datasheet

```
Prompt: "Extract single-diode model parameters for our 580W TOPCon module.
Datasheet: Isc=13.85A, Voc=52.18V, Imp=13.12A, Vmp=44.27V, 144 half-cut
cells (72 in series per string, 2 parallel strings). Use the De Soto method.
α_Isc = 0.048%/°C, β_Voc = -0.26%/°C."
```

**Expected output:**

| Parameter | Symbol | Value | Unit | Physical Meaning |
|-----------|--------|-------|------|------------------|
| Photocurrent | Iph | 13.87 | A | Light-generated current |
| Saturation current | I0 | 2.1×10⁻¹¹ | A | Recombination in quasi-neutral regions |
| Series resistance | Rs | 0.28 | Ω | Metallization + ribbon + contact resistance |
| Shunt resistance | Rsh | 485 | Ω | Leakage current paths |
| Ideality factor | n | 1.08 | — | Recombination mechanism (close to 1 = diffusion) |

**Fit validation:**
- Isc reconstructed: 13.85A (error: 0.0%)
- Voc reconstructed: 52.18V (error: 0.0%)
- Pmax reconstructed: 580.2W (error: +0.03%)

## Standards & References

- De Soto, W. et al. — "Improvement and validation of a model for PV array performance" (Solar Energy, 2006)
- Villalva, M.G. et al. — "Comprehensive approach to modeling PV array" (IEEE Trans., 2009)
- Chin, V.J. et al. — "Cell modelling and model parameters estimation techniques" (Applied Energy, 2015)
- IEC 60891:2021 — Procedures for temperature and irradiance corrections
- pvlib-python — SDM/DDM implementation and CEC module database

## Related Skills

- `iv-curve-modeler` — I-V curve simulation using diode model parameters
- `cell-efficiency` — Efficiency loss analysis using model parameters
- `temperature-coefficients` — Temperature coefficient prediction from diode model
- `pv-module-flash-testing` — Extract diode parameters from flash test data
