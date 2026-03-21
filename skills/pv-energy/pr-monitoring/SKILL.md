---
name: pr-monitoring
version: 1.0.0
description: Performance Ratio calculation and monitoring for operational PV plants — track PR trends, detect degradation, and identify underperformance.
author: SuryaPrajna Contributors
license: MIT
tags:
  - performance-ratio
  - monitoring
  - operations
  - kpi
  - photovoltaic
dependencies:
  python:
    - pvlib>=0.11.0
    - pandas>=2.0
    - numpy>=1.24
    - matplotlib>=3.7
  data:
    - Plant SCADA/monitoring data (power, irradiance, temperature)
pack: pv-energy
agent: Phala-Agent
---

# pr-monitoring

Performance Ratio (PR) calculation and monitoring for operational PV plants. Tracks PR trends over time, detects degradation and underperformance, and supports temperature-corrected PR analysis per IEC 61724.

## LLM Instructions

### Role Definition
You are a **PV plant performance analyst** specializing in operational monitoring, performance ratio analysis, and degradation detection. You interpret SCADA data, calculate KPIs per IEC 61724, and identify root causes of underperformance. You understand the difference between raw PR, temperature-corrected PR, and weather-corrected PR.

### Thinking Process
1. **Ingest monitoring data** — Verify data quality, check for gaps, filter outliers
2. **Calculate reference yield** — POA irradiation / reference irradiance (1000 W/m²)
3. **Calculate final yield** — Net AC energy / rated capacity
4. **Compute PR** — Final yield / reference yield
5. **Apply temperature correction** — Correct to 25°C reference using temperature coefficient
6. **Analyze trends** — Monthly/quarterly/annual PR, rolling averages
7. **Detect anomalies** — Compare against expected PR, flag deviations > threshold
8. **Report** — PR dashboard, trend charts, degradation rate estimation

### Output Format
- Start with **plant summary**: capacity, location, monitoring period
- Provide **PR summary table**: daily, monthly, annual PR (raw and temperature-corrected)
- Include **PR time-series chart** with rolling average and baseline
- Show **degradation rate** estimated from PR trend (if multi-year data)
- Flag **underperformance periods** with possible root causes
- Report key IEC 61724 metrics: Yr, Ya, Yf, PR, CUF

### Quality Criteria
- [ ] PR values are within physical limits (typically 60-90%)
- [ ] Temperature correction uses correct module temperature coefficient
- [ ] Data quality filters are applied (minimum irradiance threshold, e.g., > 50 W/m²)
- [ ] Nighttime data is excluded
- [ ] PR calculation follows IEC 61724-1 methodology
- [ ] Degradation rate is calculated using appropriate statistical method (e.g., year-on-year, linear regression)

### Common Pitfalls
- **Do not** calculate PR using hourly average power without proper integration — use energy values
- **Do not** include low-irradiance periods (< 50 W/m²) in PR calculation — sensor noise dominates
- **Do not** confuse PR with capacity utilization factor (CUF)
- **Do not** report raw PR without noting that it includes temperature effects
- **Do not** estimate degradation from less than 2 years of data
- **Do not** ignore soiling events or scheduled maintenance in trend analysis

## Capabilities

### 1. IEC 61724 PR Calculation
Calculate Performance Ratio per IEC 61724-1: PR = Yf / Yr, where Yf = final yield, Yr = reference yield.

### 2. Temperature-Corrected PR
Apply temperature correction to normalize PR to 25°C reference conditions, removing seasonal temperature effects.

### 3. Trend Analysis
Track PR over time with daily, monthly, and annual granularity. Apply rolling averages and detect step changes.

### 4. Degradation Rate Estimation
Estimate annual degradation rate from multi-year PR data using year-on-year comparison or linear regression methods.

### 5. Anomaly Detection
Identify periods where PR deviates significantly from expected baseline and suggest probable causes (soiling, equipment failure, shading, snow).

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `capacity_kwp` | float | Yes | Rated DC capacity in kWp |
| `monitoring_data` | file | Yes | SCADA data with timestamp, power (kW), POA irradiance (W/m²), module temperature (°C) |
| `temperature_coeff` | float | No | Module power temperature coefficient in %/°C (default: -0.35) |
| `irradiance_threshold` | float | No | Minimum POA irradiance for PR calculation in W/m² (default: 50) |
| `reference_temperature` | float | No | Reference temperature for correction in °C (default: 25) |
| `expected_pr` | float | No | Expected/baseline PR for anomaly detection (default: 0.80) |
| `degradation_method` | string | No | "yoy" (year-on-year) or "regression" (default: "yoy") |

## Example Usage

### Monthly PR Report

```
Prompt: "Calculate monthly PR for our 5 MWp plant from January to December
2025. Data is in SCADA export CSV with columns: timestamp, ac_power_kw,
poa_irradiance_wm2, module_temp_c."
```

### Example Code

```python
import pandas as pd
import numpy as np

# Load SCADA data
data = pd.read_csv('scada_export.csv', parse_dates=['timestamp'])
data = data.set_index('timestamp')

capacity_kwp = 5000
reference_irradiance = 1000  # W/m²
temp_coeff = -0.0035  # per °C
ref_temp = 25  # °C

# Filter low irradiance
data = data[data['poa_irradiance_wm2'] > 50]

# Hourly energy (kWh) and irradiation (kWh/m²)
hourly = data.resample('h').mean()
hourly['energy_kwh'] = hourly['ac_power_kw']  # hourly avg power ≈ energy in kWh
hourly['irradiation_kwh_m2'] = hourly['poa_irradiance_wm2'] / 1000

# Monthly aggregation
monthly = hourly.resample('ME').sum()

# PR calculation
monthly['Yr'] = monthly['irradiation_kwh_m2']  # Reference yield (hours)
monthly['Yf'] = monthly['energy_kwh'] / capacity_kwp  # Final yield (hours)
monthly['PR'] = monthly['Yf'] / monthly['Yr']

# Temperature-corrected PR
monthly_avg_temp = hourly['module_temp_c'].resample('ME').mean()
monthly['PR_corrected'] = monthly['PR'] / (1 + temp_coeff * (monthly_avg_temp - ref_temp))

print(monthly[['Yr', 'Yf', 'PR', 'PR_corrected']])
```

## Output Format

The skill produces:
- **IEC 61724 metrics table**: Yr, Ya, Yf, PR, temperature-corrected PR, CUF
- **Monthly PR table**: 12-month breakdown with raw and corrected PR
- **PR trend chart**: Time-series with rolling average and baseline
- **Degradation estimate**: Annual degradation rate (%/year) with confidence interval
- **Anomaly report**: Dates and durations of significant PR deviations

## Standards & References

- IEC 61724-1: PV system performance monitoring
- IEC 61724-2: Capacity evaluation method
- IEC 61724-3: Energy evaluation by performance testing
- Lindig et al. (2018): Review of statistical and analytical degradation methods
- Jordan & Kurtz (2013): Photovoltaic degradation rates

## Related Skills

- `loss-tree` — Detailed loss breakdown explaining PR
- `energy-yield` — Predicted yield to compare against actual
- `pvlib-analysis` — Simulation for expected performance modeling
- `iv-diagnostics` — Module-level diagnostics when PR drops
