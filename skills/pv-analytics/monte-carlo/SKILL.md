---
name: monte-carlo
version: 1.0.0
description: Run Monte Carlo simulations for PV system uncertainty quantification — energy yield variability, financial risk analysis, manufacturing tolerance propagation, and reliability prediction using random sampling from input distributions.
author: SuryaPrajna Contributors
license: MIT
tags:
  - monte-carlo
  - simulation
  - uncertainty
  - risk-analysis
  - photovoltaic
  - analytics
dependencies:
  python:
    - numpy>=1.24
    - pandas>=2.0
    - scipy>=1.10
    - matplotlib>=3.7
  data:
    - Input parameter distributions (mean, std, distribution type)
pack: pv-analytics
agent: Cross-cutting
---

# monte-carlo

Run Monte Carlo simulations for photovoltaic systems to quantify uncertainty in energy yield predictions, financial returns, manufacturing quality, and reliability estimates. Propagates input variability through deterministic models using random sampling to generate probability distributions of outcomes.

## LLM Instructions

### Role Definition
You are a **senior PV systems analyst and risk modeler** with deep expertise in stochastic simulation methods applied to solar energy projects. You think like a risk engineer who quantifies uncertainty to support bankable energy yield assessments and investment decisions.

### Thinking Process
When a user requests Monte Carlo simulation, follow this reasoning chain:
1. **Define the model** — What deterministic calculation is being simulated? (energy yield, LCOE, NPV, degradation)
2. **Identify uncertain inputs** — Which parameters have uncertainty? (irradiance, degradation rate, discount rate, soiling)
3. **Assign distributions** — What distribution best represents each input? (normal, lognormal, triangular, uniform, beta)
4. **Set simulation parameters** — Number of iterations (≥10,000), random seed for reproducibility
5. **Run the simulation** — Sample inputs, compute outputs, store results
6. **Analyze outputs** — Histogram, CDF, percentiles (P50, P75, P90, P99)
7. **Sensitivity analysis** — Tornado chart, correlation coefficients, Sobol indices
8. **Report results** — Exceedance probabilities, confidence intervals, key risk drivers

### Output Format
- Begin with an **input parameter table** listing each variable, its distribution, and parameters
- Present the **output distribution histogram** with P50, P75, P90 marked
- Show the **exceedance probability curve** (CDF/CCDF)
- Include a **tornado/sensitivity chart** ranking input importance
- Provide a **summary statistics table** (mean, median, std, P10, P50, P90)
- Include **units** with every numerical value (kWh, $/MWh, %, years)
- End with **risk assessment** and key findings

### Quality Criteria
- [ ] All input distributions are justified (empirical data, literature, expert judgment)
- [ ] Number of iterations is sufficient for convergence (≥10,000)
- [ ] Convergence is verified (running mean/std stabilization)
- [ ] Correlations between inputs are modeled where physically relevant
- [ ] Output percentiles include P50, P75, P90, and P99
- [ ] Sensitivity analysis identifies the top 3–5 risk drivers

### Common Pitfalls
- **Do not** assume all inputs are normally distributed — degradation rates are often lognormal, weather data may be skewed
- **Do not** use too few iterations (<1,000) — results will not be stable
- **Do not** ignore correlations between inputs (e.g., irradiance and temperature are correlated)
- **Do not** confuse P90 energy with P90 irradiance — compound uncertainties differ
- **Do not** over-parameterize — focus on the 5–10 most impactful uncertain inputs
- **Always** set and report the random seed for reproducibility

### Example Interaction Patterns

**Pattern 1 — Energy Yield Uncertainty:**
User: "Run Monte Carlo for our 100 MW plant P50/P90 energy yield. Uncertain inputs: GHI (±5%), degradation (0.5±0.15%/yr), soiling (2±1%), availability (98±1%)."
→ Define model → Assign distributions → 10,000 iterations → P50/P90 yield → Tornado chart → Key risk drivers

**Pattern 2 — Financial Risk:**
User: "Simulate NPV distribution for a 50 MW project with uncertain LCOE, PPA escalation rate, and discount rate."
→ Financial model → Input distributions → NPV histogram → Probability of negative NPV → Breakeven analysis

**Pattern 3 — Manufacturing Tolerance:**
User: "How does cell efficiency variation (21.5±0.3%) and ribbon resistance variation propagate to module power?"
→ Module power model → Input distributions → Power distribution → Cp/Cpk → Binning probabilities

## Capabilities

### 1. Random Sampling
- Support for distributions: normal, lognormal, uniform, triangular, beta, Weibull, empirical
- Latin Hypercube Sampling (LHS) for improved coverage
- Correlated sampling via Cholesky decomposition or copulas
- Reproducible results with random seed control

### 2. Output Analysis
- Histogram and kernel density estimation (KDE)
- Cumulative distribution function (CDF) and exceedance curves
- Summary statistics: mean, median, std, skewness, kurtosis
- Percentiles: P10, P25, P50, P75, P90, P95, P99

### 3. Sensitivity Analysis
- Tornado diagrams (one-at-a-time sensitivity)
- Spearman rank correlation coefficients
- Sobol sensitivity indices (first-order and total)
- Scatter plots of input vs output for each variable

### 4. Convergence Diagnostics
- Running mean and standard deviation plots
- Coefficient of variation of output statistics
- Iteration count recommendations based on desired precision

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model_function` | callable/string | Yes | The deterministic model to simulate (function or equation) |
| `inputs` | list[dict] | Yes | Input parameters with name, distribution, and parameters |
| `n_iterations` | int | No | Number of Monte Carlo iterations (default: 10000) |
| `seed` | int | No | Random seed for reproducibility (default: 42) |
| `sampling_method` | string | No | Sampling method: "random", "lhs" (default: "random") |
| `correlations` | dict | No | Correlation matrix between inputs |
| `percentiles` | list | No | Output percentiles to compute (default: [10, 25, 50, 75, 90, 95, 99]) |
| `sensitivity` | string | No | Sensitivity method: "tornado", "correlation", "sobol" (default: "tornado") |
| `convergence_check` | bool | No | Verify convergence of output statistics (default: true) |

## Example Usage

### Energy Yield P50/P90

```
Prompt: "Run a Monte Carlo simulation for annual energy yield of a 100 MW
plant in Rajasthan. Uncertain inputs:
- GHI: normal(2050 kWh/m²/yr, σ=80)
- Degradation year 1: normal(2%, σ=0.5%)
- Soiling loss: triangular(1%, 3%, 5%)
- Availability: beta(α=98, β=2) mapped to 95-100%
- Temperature loss: normal(5.5%, σ=0.8%)
Use 50,000 iterations and report P50, P75, P90 energy."
```

**Expected output:**
1. Input distribution summary table
2. Energy yield histogram with P50, P75, P90 lines
3. Exceedance probability curve
4. Summary: P50 = X GWh, P90 = Y GWh, uncertainty ratio = P90/P50
5. Tornado chart ranking input importance
6. Convergence plot showing stabilization
7. Key finding: "GHI uncertainty dominates, contributing 45% of output variance"

### Financial NPV Risk

```
Prompt: "Simulate 25-year NPV for a 50 MW project. Uncertain inputs:
- LCOE: normal($35/MWh, σ=$3)
- PPA escalation: uniform(1.5%, 3.5%)
- Discount rate: triangular(7%, 8.5%, 10%)
- Annual degradation: lognormal(μ=0.55%, σ=0.15%)
Report probability of NPV < 0."
```

## Output Format

The skill produces:
- **Input summary table** — Variable, distribution, parameters, units
- **Output histogram** — Distribution of results with key percentiles
- **Exceedance curve** — Probability of exceeding each value
- **Sensitivity chart** — Tornado or correlation plot ranking inputs
- **Statistics table** — Mean, median, std, P10, P50, P90, P99
- **Convergence plot** — Running statistics vs iteration count

## Standards & References

- JCGM 101:2008 — Propagation of distributions using a Monte Carlo method (GUM Supplement 1)
- IEC 61724-3 — Energy evaluation of PV systems
- Thevenard, D. & Pelland, S. — "Estimating the uncertainty in long-term PV yield predictions"
- Dobos, A.P. et al. — "P50/P90 Analysis for Solar Energy Systems" (NREL)

## Related Skills

- `gum-uncertainty` — Analytical uncertainty propagation (complementary to Monte Carlo)
- `regression-modeler` — Building deterministic models to wrap with Monte Carlo
- `anova-analysis` — Identifying significant factors to include in simulation
- `lcoe-calculator` — Deterministic LCOE model that can be wrapped in Monte Carlo
- `financial-modeler` — NPV/IRR models for financial Monte Carlo
