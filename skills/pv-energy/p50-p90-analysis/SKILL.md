---
name: p50-p90-analysis
version: 1.0.0
description: Exceedance probability analysis for PV energy yield — calculate P50, P75, P90, and P99 values by quantifying weather variability, model uncertainty, and equipment uncertainty.
author: SuryaPrajna Contributors
license: MIT
tags:
  - p50-p90
  - uncertainty
  - exceedance-probability
  - bankability
  - energy-yield
dependencies:
  python:
    - numpy>=1.24
    - scipy>=1.10
    - pandas>=2.0
    - matplotlib>=3.7
  data:
    - Multi-year irradiance dataset or TMY with uncertainty metadata
pack: pv-energy
agent: Phala-Agent
---

# p50-p90-analysis

Exceedance probability analysis for PV energy yield. Quantifies uncertainty from weather variability, model choices, and equipment performance to calculate P50, P75, P90, and P99 yield values required for project finance.

## LLM Instructions

### Role Definition
You are a **solar energy uncertainty analyst** with deep expertise in probabilistic yield assessment, exceedance probability calculations, and bankability requirements. You understand how lenders and investors use P-values for debt sizing and equity returns, and you can decompose total uncertainty into its constituent components.

### Thinking Process
1. **Start with P50 yield** — The median (50% exceedance) annual energy estimate
2. **Identify uncertainty sources** — Weather inter-annual variability, spatial uncertainty, measurement uncertainty, model uncertainty, degradation uncertainty
3. **Quantify each component** — Standard deviation or coefficient of variation for each source
4. **Combine uncertainties** — Root-sum-square (RSS) for independent sources
5. **Calculate P-values** — Apply normal or fitted distribution to derive P50, P75, P90, P99
6. **Present results** — Exceedance table, probability density curve, tornado chart of uncertainty contributors

### Output Format
- Start with **P50 yield** and combined standard deviation
- Provide **exceedance probability table**: P50, P75, P90, P95, P99
- Show **uncertainty breakdown table**: each source with individual sigma
- Include **tornado chart** showing relative contribution of each uncertainty source
- Provide **probability density plot** with P-values marked
- All energy values in MWh or kWh/kWp

### Quality Criteria
- [ ] P50 is the median (not mean, unless distribution is symmetric)
- [ ] Total uncertainty (sigma) is typically 5-10% for well-characterized sites
- [ ] Weather variability is the dominant source (3-7% sigma)
- [ ] Model uncertainty is 2-4% for established tools
- [ ] P90/P50 ratio is typically 0.85-0.95
- [ ] P99 is not used for debt sizing without explicit justification
- [ ] Uncertainties are combined using RSS, not simple addition

### Common Pitfalls
- **Do not** add uncertainties linearly — use root-sum-square for independent sources
- **Do not** confuse P90 one-year with P90 ten-year (different sigma)
- **Do not** use P50 from a single TMY year without assessing inter-annual variability
- **Do not** ignore long-term trend changes in solar resource
- **Do not** present P-values without stating the assumed distribution (normal, lognormal)
- **Do not** double-count uncertainty sources that are correlated

### Example Interaction Patterns
**Pattern 1 — Bankable P90 Calculation:**
User: "Calculate P90 yield for a 100 MWp plant with P50 of 180 GWh"
-> Identify uncertainty sources -> Quantify each sigma -> RSS combination -> Apply normal distribution -> Report P90

**Pattern 2 — Multi-Year P90:**
User: "What is the 10-year P90 for debt sizing?"
-> Single-year sigma -> Apply sqrt(n) reduction for multi-year -> Calculate 10-year P90

**Pattern 3 — Uncertainty Decomposition:**
User: "Break down the uncertainty budget for our yield estimate"
-> List all sources -> Quantify each -> RSS -> Tornado chart -> Identify dominant sources

## Capabilities

### 1. Uncertainty Source Identification
Catalog and quantify all sources: inter-annual weather variability, spatial interpolation, measurement sensor accuracy, transposition model, PV model, degradation, curtailment.

### 2. Statistical Combination
Combine independent uncertainty sources using root-sum-square (RSS). Handle correlated sources with covariance terms where applicable.

### 3. Exceedance Probability Calculation
Calculate P-values (P50 through P99) for single-year and multi-year periods using normal or fitted distributions.

### 4. Multi-Year P-Value Adjustment
Convert single-year P-values to multi-year (e.g., 10-year P90 for debt tenor) by reducing weather variability component by 1/sqrt(n).

### 5. Sensitivity & Tornado Analysis
Rank uncertainty contributors by impact and generate tornado charts showing which sources dominate the total uncertainty.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `p50_yield` | float | Yes | P50 annual energy yield in MWh |
| `weather_sigma` | float | No | Inter-annual weather variability sigma (%) (default: 5.0) |
| `model_sigma` | float | No | Model uncertainty sigma (%) (default: 3.0) |
| `measurement_sigma` | float | No | Measurement/data uncertainty sigma (%) (default: 2.0) |
| `degradation_sigma` | float | No | Degradation rate uncertainty sigma (%) (default: 1.0) |
| `curtailment_sigma` | float | No | Curtailment/availability uncertainty sigma (%) (default: 1.0) |
| `custom_sigmas` | object | No | Additional uncertainty sources with sigma values |
| `distribution` | string | No | "normal" or "lognormal" (default: "normal") |
| `multi_year` | int | No | Number of years for multi-year P-value (default: 1) |
| `p_values` | list | No | P-values to calculate (default: [50, 75, 90, 95, 99]) |

## Example Usage

### P50/P90 Yield Assessment

```
Prompt: "Calculate P50 and P90 annual yield for a 100 MWp plant with
estimated P50 yield of 180 GWh. Weather variability 5%, model uncertainty
3%, measurement uncertainty 2%."
```

### Example Code

```python
import numpy as np
from scipy import stats

# P50 yield
p50_yield = 180_000  # MWh

# Uncertainty sources (sigma as fraction)
uncertainties = {
    'weather_variability': 0.05,
    'model_uncertainty': 0.03,
    'measurement_uncertainty': 0.02,
    'degradation_uncertainty': 0.01,
    'curtailment_uncertainty': 0.01,
}

# RSS combination
total_sigma_frac = np.sqrt(sum(s**2 for s in uncertainties.values()))
total_sigma_mwh = p50_yield * total_sigma_frac

# Calculate P-values (exceedance probability)
p_values = {
    'P50': p50_yield,
    'P75': p50_yield - stats.norm.ppf(0.75) * total_sigma_mwh,
    'P90': p50_yield - stats.norm.ppf(0.90) * total_sigma_mwh,
    'P95': p50_yield - stats.norm.ppf(0.95) * total_sigma_mwh,
    'P99': p50_yield - stats.norm.ppf(0.99) * total_sigma_mwh,
}

# Multi-year P90 (e.g., 10-year debt tenor)
n_years = 10
weather_sigma_multiyear = uncertainties['weather_variability'] / np.sqrt(n_years)
other_sigmas = {k: v for k, v in uncertainties.items() if k != 'weather_variability'}
total_sigma_multiyear = np.sqrt(
    weather_sigma_multiyear**2 + sum(s**2 for s in other_sigmas.values())
)
p90_10yr = p50_yield - stats.norm.ppf(0.90) * p50_yield * total_sigma_multiyear
```

## Output Format

The skill produces:
- **Exceedance probability table**: P50, P75, P90, P95, P99 in MWh and kWh/kWp
- **Uncertainty breakdown**: Each source with individual sigma (%) and absolute (MWh)
- **Combined uncertainty**: Total sigma (%) via RSS
- **Tornado chart**: Ranked bar chart of uncertainty contributions
- **Probability density curve**: PDF with P-values marked
- **Multi-year table**: P90 for 1-year, 5-year, 10-year, 20-year periods

## Standards & References

- IEC 61724-3: Energy evaluation by performance testing and monitoring
- PVPS Task 13: Uncertainty in PV yield predictions
- Thevenard & Pelland (2013): Uncertainty in long-term PV yield predictions
- Müller et al. (2016): Review of uncertainties in energy yield prediction

## Related Skills

- `energy-yield` — P50 yield estimation (input to this skill)
- `weather-data-ingestion` — Weather data quality assessment
- `solar-resource-assessment` — Resource uncertainty quantification
- `pvlib-analysis` — Core simulation engine
