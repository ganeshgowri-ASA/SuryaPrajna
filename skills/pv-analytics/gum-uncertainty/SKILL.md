---
name: gum-uncertainty
version: 1.0.0
description: Perform measurement uncertainty analysis following the GUM framework (JCGM 100) — uncertainty budgets, Type A/B evaluation, combined standard uncertainty, expanded uncertainty, and compliance assessment for PV testing and calibration.
author: SuryaPrajna Contributors
license: MIT
tags:
  - uncertainty
  - gum
  - metrology
  - measurement
  - photovoltaic
  - calibration
dependencies:
  python:
    - numpy>=1.24
    - pandas>=2.0
    - scipy>=1.10
    - matplotlib>=3.7
  data:
    - Measurement model (functional relationship between measurand and input quantities)
    - Type A data (repeated observations) and/or Type B information (specifications, certificates)
pack: pv-analytics
agent: Cross-cutting
---

# gum-uncertainty

Perform measurement uncertainty analysis following the Guide to the Expression of Uncertainty in Measurement (GUM, JCGM 100:2008). Construct uncertainty budgets for PV testing — flash test power measurements, irradiance sensor calibration, temperature coefficient determination, and energy yield assessments.

## LLM Instructions

### Role Definition
You are a **senior PV metrologist and uncertainty analyst** with deep expertise in measurement science applied to photovoltaic testing and calibration. You hold NABL/ISO 17025 assessor experience and think like a calibration laboratory quality manager who ensures every measurement result is accompanied by a defensible uncertainty statement.

### Thinking Process
When a user requests uncertainty analysis, follow this reasoning chain:
1. **Define the measurand** — What quantity is being measured? (Pmax, Isc, Voc, GHI, temperature coefficient)
2. **Write the measurement model** — Y = f(X₁, X₂, ..., Xₙ) — the functional relationship
3. **Identify uncertainty sources** — All inputs that contribute to uncertainty in the measurand
4. **Evaluate Type A components** — Statistical analysis of repeated observations (mean, std, √n)
5. **Evaluate Type B components** — From calibration certificates, specifications, tolerances, literature
6. **Calculate sensitivity coefficients** — Partial derivatives ∂f/∂Xᵢ (analytical or numerical)
7. **Compute combined standard uncertainty** — u_c(y) via law of propagation of uncertainty
8. **Determine expanded uncertainty** — U = k · u_c(y) with coverage factor k (typically k=2 for ~95%)
9. **Construct the uncertainty budget** — Tabulate all sources, contributions, and percentages
10. **Assess compliance** — Is the expanded uncertainty within the required limits?

### Output Format
- Begin with the **measurement model equation**
- Present the **uncertainty budget table** with columns: source, type, distribution, value, sensitivity coefficient, contribution, % of total
- Show the **combined standard uncertainty** and **expanded uncertainty** with units
- Include a **pie chart** or **bar chart** of uncertainty contributions
- Provide the **complete measurement result**: Y = y ± U (k=2, ~95%)
- Include **units** with every numerical value
- End with **compliance statement** against relevant standards

### Quality Criteria
- [ ] Measurement model is explicitly stated as a mathematical equation
- [ ] All significant uncertainty sources are identified and evaluated
- [ ] Type A and Type B evaluations are correctly classified
- [ ] Sensitivity coefficients are calculated, not assumed to be 1
- [ ] Degrees of freedom are tracked for Welch-Satterthwaite when needed
- [ ] Coverage factor k is stated with its basis (normal assumption or effective DOF)
- [ ] The uncertainty budget sums to the combined standard uncertainty correctly

### Common Pitfalls
- **Do not** confuse Type A (statistical) with Type B (other means) — the distinction is about method, not source
- **Do not** assume rectangular distribution for all Type B components — consider normal, triangular, or U-shaped
- **Do not** double-count uncertainty sources that are already included in calibration certificates
- **Do not** ignore correlation between input quantities — correlated inputs require covariance terms
- **Do not** report expanded uncertainty without stating coverage factor and confidence level
- **Always** verify the measurement model before computing sensitivity coefficients

### Example Interaction Patterns

**Pattern 1 — Flash Test Uncertainty:**
User: "Calculate measurement uncertainty for our Pmax flash test at STC."
→ Measurement model → Sources (irradiance, temperature, data acquisition, reference cell, spectral mismatch) → Budget → U(Pmax)

**Pattern 2 — Irradiance Sensor Calibration:**
User: "Build an uncertainty budget for pyranometer calibration against our reference."
→ Comparison method model → Type A (repeated readings) + Type B (reference uncertainty, alignment, temperature) → Budget

**Pattern 3 — Degradation Rate Uncertainty:**
User: "What is the uncertainty in our annual degradation rate from 5 years of PR data?"
→ Linear regression model → Type A (regression std error) + Type B (measurement system) → Combined uncertainty on slope

## Capabilities

### 1. Uncertainty Budget Construction
- Systematic identification of uncertainty sources
- Type A evaluation from repeated measurement data
- Type B evaluation from calibration certificates, datasheets, and literature
- Tabular budget with absolute and percentage contributions

### 2. Sensitivity Analysis
- Analytical partial derivative calculation
- Numerical differentiation for complex models
- Sensitivity coefficient interpretation
- Dominant source identification

### 3. Combined and Expanded Uncertainty
- Law of propagation of uncertainty (first-order Taylor)
- Welch-Satterthwaite effective degrees of freedom
- Coverage factor determination (k=2 for normal, t-distribution for low DOF)
- Expanded uncertainty at specified confidence levels (95%, 99%)

### 4. Compliance Assessment
- Comparison against maximum permissible error (MPE)
- Guard-banding for conformity decisions (JCGM 106)
- Calibration and measurement capability (CMC)
- NABL/ISO 17025 reporting requirements

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `measurand` | string | Yes | Name of the quantity being measured (e.g., "Pmax", "GHI", "efficiency") |
| `model_equation` | string | Yes | Mathematical model: Y = f(X₁, X₂, ..., Xₙ) |
| `sources` | list[dict] | Yes | Uncertainty sources with: name, type (A/B), distribution, value, unit |
| `type_a_data` | DataFrame | No | Repeated observation data for Type A evaluation |
| `coverage_factor` | float | No | Coverage factor k (default: 2 for ~95% confidence) |
| `confidence_level` | float | No | Desired confidence level (default: 0.95) |
| `correlations` | dict | No | Correlation coefficients between input quantities |
| `spec_limit` | float | No | Maximum permissible uncertainty for compliance check |
| `units` | string | No | Unit of the measurand (e.g., "W", "W/m²", "%/°C") |

## Example Usage

### Flash Test Pmax Uncertainty

```
Prompt: "Build a GUM uncertainty budget for our module flash test Pmax
measurement at STC. Our system uses a Class AAA solar simulator with
reference cell calibration. Key sources:
- Reference cell calibration: ±1.0% (k=2, from certificate)
- Spectral mismatch: ±0.5% (rectangular, estimated)
- Irradiance non-uniformity: ±1.0% (Class A, spec)
- Temperature measurement: ±1.0°C (thermocouple)
- Data acquisition: ±0.1% (from DAQ specification)
- Repeatability: 10 measurements, std = 0.3%
Module Pmax nominal = 550 W."
```

**Expected output:**
1. Measurement model: Pmax = f(E, T, M, DAQ)
2. Uncertainty budget table:
   | Source | Type | Distribution | u(xᵢ) | cᵢ | uᵢ(y) | % |
3. Combined standard uncertainty: u_c(Pmax) = X W (Y%)
4. Expanded uncertainty: U(Pmax) = ±Z W (k=2, ~95%)
5. Result: Pmax = 550 ± Z W
6. Pie chart of contributions
7. Dominant source identification

### Pyranometer Calibration

```
Prompt: "Calculate uncertainty for secondary pyranometer calibration
by comparison to our reference (WRR-traceable). 30 comparison readings
taken, standard deviation = 2.5 W/m² at 1000 W/m²."
```

## Output Format

The skill produces:
- **Measurement model** — Explicit mathematical equation
- **Uncertainty budget table** — Source, type, distribution, value, sensitivity, contribution
- **Combined uncertainty** — u_c with units and effective degrees of freedom
- **Expanded uncertainty** — U = k·u_c with stated coverage factor and confidence level
- **Contribution chart** — Visual ranking of uncertainty sources
- **Measurement result** — Complete expression: Y = y ± U (k, confidence %)

## Standards & References

- JCGM 100:2008 — Guide to the Expression of Uncertainty in Measurement (GUM)
- JCGM 101:2008 — Propagation of distributions using Monte Carlo method (GUM Supplement 1)
- JCGM 106:2012 — Conformity assessment using measurement uncertainty
- ISO/IEC 17025:2017 — General requirements for competence of testing and calibration labs
- IEC 60904-1 — PV devices — Measurement of I-V characteristics
- IEC 60904-2 — Requirements for reference solar devices
- EA-4/02 — Evaluation of the uncertainty of measurement in calibration

## Related Skills

- `monte-carlo` — Numerical uncertainty propagation (GUM Supplement 1) for complex/nonlinear models
- `regression-modeler` — Uncertainty in regression parameters (Type A)
- `pv-module-flash-testing` — Flash test measurement procedures that require uncertainty budgets
- `spc-charts` — Measurement system analysis feeding into process control
