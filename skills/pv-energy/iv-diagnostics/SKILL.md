---
name: iv-diagnostics
version: 1.0.0
description: Field IV curve tracing and fault diagnosis — analyze measured IV curves to detect module-level faults including bypass diode failures, shading, degradation, and series resistance issues.
author: SuryaPrajna Contributors
license: MIT
tags:
  - iv-curve
  - diagnostics
  - fault-detection
  - field-testing
  - module-health
dependencies:
  python:
    - pvlib>=0.11.0
    - pandas>=2.0
    - numpy>=1.24
    - scipy>=1.10
    - matplotlib>=3.7
  data:
    - Field IV curve measurements (V, I pairs)
    - Module datasheet parameters
pack: pv-energy
agent: Phala-Agent
---

# iv-diagnostics

Field IV curve tracing and fault diagnosis for PV modules and strings. Analyzes measured IV curves to detect and classify faults including bypass diode failures, partial shading, cell cracking, PID, increased series resistance, and accelerated degradation.

## LLM Instructions

### Role Definition
You are a **PV field diagnostics engineer** specializing in IV curve analysis, fault detection, and module-level performance assessment. You can interpret IV curve shapes, extract single-diode model parameters, compare against expected performance, and diagnose root causes of underperformance from IV curve signatures.

### Thinking Process
1. **Ingest IV data** — Measured V-I pairs, irradiance, module temperature at time of measurement
2. **Translate to STC** — Correct IV curve to Standard Test Conditions (1000 W/m², 25°C)
3. **Extract key parameters** — Voc, Isc, Vmp, Imp, Pmp, FF from measured curve
4. **Compare to datasheet** — Calculate deviations from nameplate parameters
5. **Analyze curve shape** — Look for signature patterns (steps, notches, slope changes)
6. **Fit diode model** — Extract Rs, Rsh, n, I0, Iph from single-diode model
7. **Diagnose faults** — Map curve features to known fault signatures
8. **Report findings** — Fault classification, severity, recommended actions

### Output Format
- Start with **measurement conditions**: irradiance, temperature, date/time
- Provide **parameter comparison table**: measured vs. datasheet (Voc, Isc, Pmp, FF)
- Show **IV and PV curve plot** with datasheet reference overlay
- Present **fault diagnosis**: identified faults with confidence level
- Include **diode model parameters**: Rs, Rsh, n, I0, Iph
- Recommend **corrective actions** based on diagnosis

### Quality Criteria
- [ ] STC translation uses correct temperature coefficients from datasheet
- [ ] Irradiance correction is applied before comparison
- [ ] Fill Factor is calculated correctly: FF = Pmp / (Voc x Isc)
- [ ] Curve shape analysis considers all characteristic regions (short-circuit, knee, open-circuit)
- [ ] Fault signatures are correctly matched to known patterns
- [ ] Diode model fit R² > 0.99 for healthy modules

### Common Pitfalls
- **Do not** compare field-measured curves directly to datasheet without STC correction
- **Do not** diagnose faults from a single measurement — compare multiple curves
- **Do not** ignore measurement uncertainty of the IV tracer (typically 1-3%)
- **Do not** confuse low irradiance effects with actual faults
- **Do not** attribute all power loss to a single cause — multiple faults can coexist
- **Do not** forget that bypass diode activation creates step patterns, not smooth curves

### Example Interaction Patterns
**Pattern 1 — Module Health Check:**
User: "Analyze this IV curve from a field flash test"
-> Ingest data -> STC correction -> Parameter extraction -> Compare to datasheet -> Diagnose

**Pattern 2 — String Comparison:**
User: "Compare IV curves from 10 strings to find the underperformer"
-> Overlay all curves -> Statistical comparison -> Identify outliers -> Diagnose outlier strings

**Pattern 3 — Degradation Tracking:**
User: "Compare IV curves from commissioning vs. 5 years later"
-> Both curves at STC -> Parameter trends -> Degradation rate -> Root cause assessment

## Capabilities

### 1. IV Curve Parameter Extraction
Extract Voc, Isc, Vmp, Imp, Pmp, and Fill Factor from measured IV data. Calculate series resistance (Rs) and shunt resistance (Rsh) from curve slopes.

### 2. STC Translation
Correct measured IV curves to Standard Test Conditions (1000 W/m², 25°C) using IEC 60891 procedures.

### 3. Single-Diode Model Fitting
Fit five-parameter single-diode model (Iph, I0, Rs, Rsh, n) to measured IV curves for detailed electrical characterization.

### 4. Fault Signature Recognition
Identify characteristic IV curve shapes for common faults:
- **Steps/notches**: Bypass diode activation (shading, cell crack, hot spot)
- **Low Isc, normal Voc**: Soiling, uniform shading, irradiance sensor error
- **Low Voc, normal Isc**: Cell degradation, PID, connection issues
- **Low FF (rounded knee)**: Increased Rs (corroded connections, solder fatigue)
- **Low Rsh (steep slope)**: Shunt defects, PID, moisture ingress
- **Multiple steps**: Multiple substring faults

### 5. Degradation Assessment
Compare current IV parameters against commissioning baseline or datasheet to quantify power degradation and identify dominant degradation mechanism.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `voltage` | array | Yes | Measured voltage array in volts |
| `current` | array | Yes | Measured current array in amps |
| `irradiance` | float | Yes | POA irradiance at measurement time in W/m² |
| `temperature` | float | Yes | Module/cell temperature at measurement in °C |
| `module_params` | object | Yes | Datasheet: Voc_stc, Isc_stc, Vmp_stc, Imp_stc, alpha_sc, beta_oc, cells_in_series |
| `correction_method` | string | No | STC correction: "iec60891_1", "iec60891_2" (default: "iec60891_1") |
| `fit_model` | boolean | No | Fit single-diode model (default: true) |
| `baseline_curve` | object | No | Previous IV curve for degradation comparison |

## Example Usage

### Field IV Curve Analysis

```
Prompt: "Analyze this field IV curve from a Canadian Solar 550W module.
Measured at 850 W/m² and 45°C. The module is 3 years old and showing
lower power than expected."
```

### Example Code

```python
import numpy as np
import pandas as pd
from scipy.optimize import curve_fit
import matplotlib.pyplot as plt

# Measured IV data
voltage = np.array([0, 5, 10, 15, 20, 25, 30, 35, 38, 40, 42, 44, 46, 48, 49, 49.5])
current = np.array([13.2, 13.2, 13.1, 13.0, 12.9, 12.7, 12.3, 11.5, 10.2, 8.5, 6.2, 3.8, 1.5, 0.3, 0.1, 0])

# Measurement conditions
irradiance = 850  # W/m²
temperature = 45  # °C

# Datasheet parameters (STC)
ds = {
    'Voc_stc': 49.9, 'Isc_stc': 13.85,
    'Vmp_stc': 42.0, 'Imp_stc': 13.10,
    'alpha_sc': 0.05,  # %/°C
    'beta_oc': -0.28,  # %/°C
    'cells_in_series': 72,
}

# STC correction (simplified IEC 60891)
delta_T = temperature - 25
irr_ratio = 1000 / irradiance

current_stc = current * irr_ratio * (1 + ds['alpha_sc']/100 * delta_T)
voltage_stc = voltage * irr_ratio + ds['beta_oc']/100 * ds['Voc_stc'] * delta_T

# Extract parameters at STC
Isc = current_stc[0]
Voc = voltage_stc[-1]
power_stc = voltage_stc * current_stc
Pmp = power_stc.max()
idx_mp = power_stc.argmax()
Vmp = voltage_stc[idx_mp]
Imp = current_stc[idx_mp]
FF = Pmp / (Voc * Isc)

# Compare to datasheet
degradation = (1 - Pmp / (ds['Vmp_stc'] * ds['Imp_stc'])) * 100

print(f"Measured Pmp (STC): {Pmp:.1f} W | Datasheet: {ds['Vmp_stc']*ds['Imp_stc']:.1f} W")
print(f"Fill Factor: {FF:.3f}")
print(f"Power degradation: {degradation:.1f}%")

# Plot IV and PV curves
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
ax1.plot(voltage_stc, current_stc, 'b-', label='Measured (STC)')
ax1.set_xlabel('Voltage (V)')
ax1.set_ylabel('Current (A)')
ax1.set_title('IV Curve')
ax1.legend()
ax2.plot(voltage_stc, power_stc, 'r-', label='Power')
ax2.set_xlabel('Voltage (V)')
ax2.set_ylabel('Power (W)')
ax2.set_title('PV Curve')
ax2.legend()
plt.tight_layout()
```

## Output Format

The skill produces:
- **Measurement summary**: Date, irradiance, temperature, module ID
- **Parameter table**: Measured vs. datasheet (Voc, Isc, Vmp, Imp, Pmp, FF) at STC
- **IV and PV curve plots**: With datasheet reference overlay
- **Diode model parameters**: Rs, Rsh, n, I0, Iph (if fitted)
- **Fault diagnosis**: Identified faults with confidence level and evidence
- **Degradation assessment**: Power loss (%), dominant mechanism
- **Recommended actions**: Repair, replace, monitor, or accept

## Standards & References

- IEC 60891: Procedures for temperature and irradiance corrections to measured IV characteristics
- IEC 61215-2: Design qualification — performance testing
- IEC 62446-1: Grid-connected PV systems — commissioning tests
- IEC TS 62446-3: Outdoor infrared thermography of PV modules
- Sato et al. (2019): Review of PV module field failures and detection methods

## Related Skills

- `pvlib-analysis` — Single-diode model reference
- `pr-monitoring` — System-level performance tracking
- `loss-tree` — Quantifying mismatch and degradation losses
- `energy-yield` — Impact of module degradation on yield
