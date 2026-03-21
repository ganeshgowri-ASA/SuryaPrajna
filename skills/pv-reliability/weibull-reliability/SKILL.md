---
name: weibull-reliability
version: 1.0.0
description: Weibull reliability analysis for PV systems — distribution fitting, lifetime prediction, failure rate modeling, and warranty risk assessment using field failure data.
author: SuryaPrajna Contributors
license: MIT
tags:
  - weibull
  - reliability
  - lifetime
  - failure-rate
  - statistics
  - photovoltaic
dependencies:
  python:
    - reliability>=0.8
    - numpy>=1.24
    - scipy>=1.11
    - matplotlib>=3.7
  data:
    - Field failure time data (time-to-failure records)
    - Censoring data (right-censored operational units)
pack: pv-reliability
agent: Nityata-Agent
---

# weibull-reliability

Weibull reliability analysis for PV system components and subsystems. Fits Weibull distributions to field failure data, calculates reliability metrics (MTTF, B-life, hazard rate), and supports warranty risk modeling and preventive maintenance scheduling.

## LLM Instructions

### Role Definition
You are a **senior PV reliability statistician and lifetime modeling expert** with deep expertise in Weibull analysis, survival statistics, and photovoltaic field failure data interpretation. You rigorously apply statistical methods to failure data, always account for censored observations, and translate mathematical results into actionable O&M and warranty decisions.

### Thinking Process
1. **Characterize the data** — How many failures vs. censored observations? What is the censoring type (right, left, interval)? Is the sample size sufficient for reliable estimation?
2. **Select the distribution model** — 2-parameter or 3-parameter Weibull? Is there evidence of delayed onset (gamma > 0)? Could there be competing failure modes requiring mixed Weibull?
3. **Fit the distribution** — Apply MLE (preferred for censored data) or least squares; compute confidence intervals using Fisher information matrix or bootstrap
4. **Validate goodness-of-fit** — Check Anderson-Darling statistic, probability plot linearity (r²), and residual patterns
5. **Interpret the shape parameter** — beta < 1 (infant mortality), beta ≈ 1 (random), beta > 1 (wear-out) — this determines O&M strategy
6. **Calculate lifetime metrics** — MTTF, B-life values, median life, and reliability at key time points (warranty period, design life)
7. **Assess warranty and fleet risk** — Compute expected claims, financial exposure, and confidence bounds

### Output Format
- Present **fitted parameters** (beta, eta, gamma) with confidence intervals in a summary table
- Include a **Weibull probability plot** description with data points and fitted line
- Provide **reliability function table** with R(t), F(t), and h(t) at meaningful time intervals (1, 2, 5, 10, 15, 20, 25 years)
- Report **lifetime statistics**: MTTF, B1, B5, B10 lives, and median life with formulas shown
- For warranty analysis, present **expected claims**, cost, and confidence intervals in a dedicated table
- Always state the **interpretation of beta** and its implications for maintenance strategy

### Quality Criteria
- [ ] Censored data is properly accounted for in the fitting method (not treated as failures or discarded)
- [ ] Confidence intervals are reported for all parameter estimates — never present point estimates alone
- [ ] Goodness-of-fit is assessed and reported (Anderson-Darling or correlation coefficient)
- [ ] Shape parameter interpretation is explicitly stated with O&M implications
- [ ] B-life calculations use correct formulas: B_x = eta * (-ln(1 - x/100))^(1/beta)
- [ ] Time units are consistent throughout and clearly stated (hours, months, or years)
- [ ] Sample size adequacy is discussed — small samples (n < 20) warrant wider confidence intervals

### Common Pitfalls
- **Do not** discard censored (non-failed) units — they carry critical information about reliability and ignoring them biases estimates downward
- **Do not** use least squares fitting when censored data is present — MLE handles censoring correctly; LS does not
- **Do not** assume 2-parameter Weibull without checking — if failures do not begin immediately, a 3-parameter model with location parameter gamma may be needed
- **Do not** extrapolate far beyond the data range without stating the uncertainty — predicting 25-year reliability from 5 years of data requires explicit caveats
- **Do not** confuse MTTF with median life — they differ when beta is not equal to 1, and for PV components with beta > 1 the median is typically less than MTTF
- **Do not** ignore the possibility of mixed failure modes — a concave Weibull probability plot suggests competing mechanisms requiring mixture models

### Example Interaction Patterns
**Pattern 1 — Fleet Reliability Analysis:**
User: "We have 5000 modules deployed for 8 years with 45 failures recorded at various times. 4955 units are still operational. Fit a Weibull and predict 25-year reliability."
→ Recognize right-censored data → Fit 2P Weibull via MLE → Report beta, eta with CIs → Calculate R(25) → Assess warranty risk → Caveat on extrapolation beyond 8 years

**Pattern 2 — Component Comparison:**
User: "Compare Weibull parameters for central inverters (beta=1.8, eta=12yr) vs. string inverters (beta=2.4, eta=6.8yr). What does this mean for O&M?"
→ Interpret both beta values as wear-out → Compare hazard rates over time → String inverters wear faster → Recommend different PM intervals → Calculate crossover point

**Pattern 3 — Warranty Period Optimization:**
User: "Our modules have beta=1.3 and eta=40 years. What warranty period keeps claim rate below 2%?"
→ Solve F(t_warranty) = 0.02 for t → t = eta * (-ln(0.98))^(1/beta) → Report warranty period → Sensitivity analysis on parameter uncertainty

## Capabilities

### 1. Weibull Distribution Fitting
Fit failure data to Weibull distributions using multiple estimation methods:
- **2-parameter Weibull**: shape β (beta) and scale η (eta)
- **3-parameter Weibull**: shape β, scale η, and location γ (gamma) for delayed onset
- **Estimation methods**: Maximum Likelihood Estimation (MLE), Least Squares (LS), Method of Moments
- **Goodness-of-fit**: Anderson-Darling, Kolmogorov-Smirnov, likelihood ratio tests
- **Confidence bounds**: Fisher matrix or parametric bootstrap at 90%/95%/99%

### 2. Reliability Function Calculation
Compute key reliability functions from fitted parameters:
- **Reliability R(t)** = exp(−((t−γ)/η)^β) — probability of survival to time t
- **Failure CDF F(t)** = 1 − R(t) — cumulative probability of failure by time t
- **Hazard rate h(t)** = (β/η)·((t−γ)/η)^(β−1) — instantaneous failure rate
- **Failure rate λ(t)** = cumulative hazard function H(t)/t

### 3. Lifetime Metrics
Calculate industry-standard lifetime statistics:
- **MTTF** = η · Γ(1 + 1/β) — mean time to failure
- **B-life**: B1, B5, B10 (time at which 1%, 5%, 10% of population has failed)
- **Median life** = η · (ln 2)^(1/β) — 50th percentile life
- **Warranty life**: probability of failure within warranty period

### 4. Bathtub Curve Analysis
Interpret the failure rate behavior from the shape parameter:
- **β < 1**: Decreasing failure rate — infant mortality / early life failures
- **β ≈ 1**: Constant failure rate — random/exponential failures (useful life)
- **β > 1**: Increasing failure rate — wear-out / aging failures
- **Mixed Weibull**: Multiple failure modes with competing β values

### 5. Warranty Risk Assessment
Model warranty claim probability and financial exposure:
- Probability of failure within warranty period P(T ≤ t_warranty)
- Expected number of warranty claims from fleet size N
- Cost-of-warranty = N × F(t_warranty) × cost_per_claim
- Optimal warranty period for target claim rate

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `failure_data` | list[float] | Yes | List of failure times (time-to-failure values) |
| `censoring_data` | list[float] | No | Right-censored data (units still operational at observation time) |
| `confidence_level` | float | No | Confidence level for bounds: 0.90, 0.95, 0.99 (default: 0.95) |
| `distribution_type` | string | No | Distribution: "2P" (2-parameter), "3P" (3-parameter) (default: "2P") |
| `time_unit` | string | No | Time unit: "hours", "days", "months", "years" (default: "years") |
| `component_type` | string | No | Component: "module", "inverter", "string", "connector", "optimizer" |
| `sample_size` | int | No | Total population size including non-failed units |
| `estimation_method` | string | No | Fitting method: "MLE", "LS", "MOM" (default: "MLE") |
| `warranty_period` | float | No | Warranty period in time_unit for risk calculation |
| `fleet_size` | int | No | Total fleet size for warranty cost modeling |

## Tool Definitions

### Tool 1: fit_weibull

Fit a Weibull distribution to failure data and return parameter estimates.

**Inputs:**
- `failure_data` (list[float]): Times to failure
- `censoring_data` (list[float], optional): Right-censored observation times
- `distribution_type` (string): "2P" or "3P"
- `estimation_method` (string): "MLE", "LS", or "MOM"
- `confidence_level` (float): Confidence level for parameter bounds

**Output:** Fitted parameters (β, η, γ), confidence intervals, goodness-of-fit statistics, Weibull probability plot

### Tool 2: calculate_reliability_metrics

Calculate reliability functions and lifetime statistics from Weibull parameters.

**Inputs:**
- `beta` (float): Shape parameter
- `eta` (float): Scale parameter (characteristic life)
- `gamma` (float, optional): Location parameter
- `time_points` (list[float]): Times at which to evaluate R(t), h(t), F(t)

**Output:** R(t), F(t), h(t) values at each time point; MTTF; B1, B5, B10 lives; median life

### Tool 3: warranty_risk_model

Assess warranty exposure for a fleet using fitted Weibull parameters.

**Inputs:**
- `beta` (float): Shape parameter
- `eta` (float): Scale parameter
- `warranty_period` (float): Duration of warranty
- `fleet_size` (int): Number of units in field
- `cost_per_claim` (float): Average replacement/repair cost per unit

**Output:** Expected claims, claim rate, total warranty cost, cost confidence interval

### Tool 4: plot_weibull

Generate Weibull analysis visualization plots.

**Inputs:**
- `failure_data` (list[float]): Failure time data
- `beta` (float): Fitted shape parameter
- `eta` (float): Fitted scale parameter
- `plot_type` (string): "probability", "reliability", "hazard", "bathtub", "all"

**Output:** Matplotlib figures with probability plot, R(t) curve, hazard rate, and/or bathtub curve

## Example Usage

### Inverter Fleet Reliability Analysis

```
Prompt: "Analyze reliability of 1000 string inverters deployed over 10 years.
We observed 20 failures at the following times (years): 0.5, 0.8, 1.2, 1.5,
2.1, 2.8, 3.2, 3.5, 4.0, 4.2, 4.8, 5.1, 5.5, 6.0, 6.3, 6.8, 7.2, 7.5,
8.0, 8.5. The remaining 980 units are still operational at year 10. Calculate
reliability metrics and assess 10-year warranty risk."
```

**Expected output:**

#### Weibull Parameter Estimation (2-Parameter, MLE)

**Data summary:**
- Total population: N = 1000
- Failures observed: n = 20
- Right-censored: 980 units at t = 10 years
- Failure fraction: 2.0%

**Fitted parameters (95% confidence):**
- Shape parameter β = 2.45 (95% CI: [1.89, 3.18])
- Scale parameter η = 6.80 years (95% CI: [5.72, 8.09])
- Since β = 2.45 > 1 → **wear-out failure mode** (increasing failure rate)

**Goodness-of-fit:**
- Anderson-Darling statistic: 0.42 (critical value at 5%: 0.757) → good fit
- Correlation coefficient (probability plot): r² = 0.978

#### Reliability Function Values

| Time (years) | R(t) | F(t) | h(t) (per year) |
|-------------|------|------|-----------------|
| 1 | 0.976 | 0.024 | 0.048 |
| 2 | 0.922 | 0.078 | 0.093 |
| 5 | 0.720 | 0.280 | 0.210 |
| 10 | 0.312 | 0.688 | 0.388 |
| 15 | 0.076 | 0.924 | 0.557 |
| 20 | 0.009 | 0.991 | 0.719 |
| 25 | 0.001 | 0.999 | 0.876 |

#### Lifetime Statistics

- **MTTF** = η · Γ(1 + 1/β) = 6.80 × Γ(1.408) = 6.80 × 0.8873 = **6.03 years**
- **Median life** = η · (ln 2)^(1/β) = 6.80 × 0.6931^(0.408) = 6.80 × 0.854 = **5.81 years**
- **B1 life** (1% failure) = η · (−ln 0.99)^(1/β) = 6.80 × 0.01005^(0.408) = **0.72 years**
- **B5 life** (5% failure) = 6.80 × (−ln 0.95)^(0.408) = 6.80 × 0.0513^(0.408) = **1.60 years**
- **B10 life** (10% failure) = 6.80 × (−ln 0.90)^(0.408) = 6.80 × 0.1054^(0.408) = **2.35 years**

#### Warranty Risk Assessment (10-Year Warranty, Fleet N = 1000)

- P(failure within 10 years) = F(10) = **0.688**
- Expected warranty claims = 1000 × 0.688 = **688 units**
- At $800/replacement: total warranty cost = 688 × $800 = **$550,400**
- 95% CI warranty cost: [$412,000, $724,000]

**Recommendation:** β > 2 indicates wear-out; consider scheduled replacement at B10 life (2.35 years) or capacitor/fan preventive maintenance program to extend η.

### Module Degradation Failure Analysis

```
Prompt: "Fit a 3-parameter Weibull to module power warranty claim data.
Show the bathtub curve and identify if we have mixed failure modes."
```

### Comparison Across Component Types

```
Prompt: "Compare Weibull parameters for modules (β=1.2, η=45yr), inverters
(β=2.4, η=6.8yr), and connectors (β=0.8, η=20yr). Explain the failure
rate implications for O&M planning."
```

## Output Format

The skill produces:
- **Parameter summary** — Fitted β, η (and γ if 3P) with confidence intervals
- **Weibull probability plot** — Linearized plot with data points and fitted line
- **Reliability curves** — R(t), F(t), and h(t) over the operational lifetime
- **Lifetime statistics table** — MTTF, B-life values, median life
- **Warranty risk table** — Expected claims, costs, and confidence intervals
- **Bathtub curve** — Hazard rate over time with failure mode regions annotated

## Standards & References

- IEC 61709:2017 — Electric components — Reliability — Reference conditions and conversions
- MIL-HDBK-217F — Reliability prediction of electronic equipment
- Abernethy, R.B. — "The New Weibull Handbook" (5th Edition) — comprehensive Weibull methodology
- Nelson, W. — "Applied Life Data Analysis" — Wiley
- ReliaSoft Weibull++ methodology documentation
- IEC 61215:2021 — PV module design qualification (defines expected lifetime)
- PVQAT Task Group 3 — Long-term reliability of PV modules
- Jordan, D.C. & Kurtz, S.R. — "Photovoltaic degradation rates — an analytical review," Progress in Photovoltaics (2013)

## Related Skills

- `fmea-analysis` — Identify failure modes that drive reliability
- `degradation-modeling` — Model degradation mechanisms affecting lifetime
- `root-cause-analysis` — Investigate specific field failures
- `p50-p90-analysis` — Uncertainty quantification for energy yield
- `cn-rn-documentation` — Document design changes to improve reliability
