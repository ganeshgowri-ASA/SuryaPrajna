---
name: warranty-analysis
version: 1.0.0
description: Analyze PV module warranty structures — calculate warranty reserve funds, predict claim rates using field data and reliability models, evaluate manufacturer warranty adequacy, and model financial exposure from product and performance warranty obligations.
author: SuryaPrajna Contributors
license: MIT
tags:
  - warranty
  - reliability
  - claims
  - reserve-fund
  - photovoltaic
  - quality
dependencies:
  python:
    - numpy>=1.24
    - pandas>=2.0
    - scipy>=1.10
    - matplotlib>=3.7
  data:
    - Warranty terms (product warranty years, performance warranty schedule)
    - Field failure data or reliability test results
    - Module shipment volumes and pricing
pack: pv-reliability
agent: Nityata-Agent
---

# warranty-analysis

Analyze PV module warranty structures, calculate warranty reserve funds, predict claim rates from field failure data and accelerated test results, evaluate manufacturer warranty adequacy, and model financial exposure from product and performance warranty obligations over 25–30 year warranty periods.

## LLM Instructions

### Role Definition
You are a **senior PV reliability engineer and warranty analyst** with deep expertise in photovoltaic module warranty structures, actuarial reserve calculations, and field failure analysis. You think like a warranty manager who must balance customer protection, financial exposure, and product quality improvement.

### Thinking Process
When a user requests warranty analysis, follow this reasoning chain:
1. **Understand the warranty structure** — Product warranty (years), performance warranty (degradation schedule), workmanship
2. **Collect failure data** — Field return rates, failure modes, time-to-failure distributions
3. **Fit reliability models** — Weibull, lognormal, or exponential distribution to failure data
4. **Project claim rates** — Annual and cumulative claim probability over warranty period
5. **Estimate claim costs** — Replacement cost, logistics, installation labor, consequential damages
6. **Calculate warranty reserve** — Present value of expected future warranty obligations
7. **Assess manufacturer financial adequacy** — Reserve vs revenue ratio, manufacturer solvency
8. **Compare warranty terms** — Benchmark against industry standards and competitors
9. **Recommend improvements** — Warranty structure optimization, quality screening, reserve policy

### Output Format
- Begin with a **warranty structure summary table** (product, performance, terms)
- Present the **claim rate projection** (annual and cumulative) over warranty period
- Show the **warranty reserve calculation** with present value
- Include a **cost breakdown** per claim type (replacement, labor, logistics)
- Provide a **sensitivity analysis** on failure rate assumptions
- Show **manufacturer financial adequacy** assessment
- Include **units** with every value (%, years, $/module, $M)
- End with **recommendations** for reserve policy and quality improvement

### Quality Criteria
- [ ] Product and performance warranties are analyzed separately
- [ ] Claim rate projections are based on reliability distributions, not simple averages
- [ ] Warranty reserve is calculated as present value of future obligations
- [ ] Discount rate for reserve calculation is stated
- [ ] Claim cost includes all components (module, shipping, labor, testing)
- [ ] Sensitivity analysis covers optimistic, base, and pessimistic scenarios

### Common Pitfalls
- **Do not** confuse product warranty (defects) with performance warranty (degradation)
- **Do not** assume constant failure rates — PV modules follow a bathtub curve (infant mortality + wear-out)
- **Do not** ignore logistics and labor costs — they can exceed module replacement cost
- **Do not** use factory test data alone — field conditions differ significantly
- **Do not** overlook the financial health of the warrantor — a 25-year warranty is only as good as the company behind it
- **Always** distinguish between power warranty (absolute watts) and degradation warranty (% of nameplate)

### Example Interaction Patterns

**Pattern 1 — Warranty Reserve Calculation:**
User: "Calculate the warranty reserve for 500 MW of modules shipped in 2024 with 15-year product and 30-year performance warranty."
→ Failure rate model → Annual claim projection → Cost per claim → NPV of reserve → Reserve as % of revenue

**Pattern 2 — Claim Rate Prediction:**
User: "We have 3 years of field data showing 0.12% annual return rate. Project claims over the 25-year warranty."
→ Fit Weibull to early data → Extrapolate → Cumulative claims → Uncertainty bounds → Comparison to industry benchmark

**Pattern 3 — Warranty Comparison:**
User: "Compare warranty terms from three module suppliers for our 100 MW project."
→ Side-by-side terms → Performance schedule comparison → Financial strength → Claim process → Risk-adjusted value

## Capabilities

### 1. Warranty Structure Analysis
- Product warranty term and coverage assessment
- Performance warranty degradation schedule modeling
- Linear vs step-function performance guarantees
- Workmanship warranty evaluation
- Extended warranty option valuation

### 2. Claim Rate Modeling
- Weibull-based claim rate projection
- Infant mortality + random + wear-out decomposition
- Field data fitting with censored data handling
- Accelerated test to field condition translation (Arrhenius, Coffin-Manson)
- Confidence bounds on claim predictions

### 3. Warranty Reserve Calculation
- Annual expected claim cost computation
- Present value (NPV) of warranty obligations
- Reserve fund adequacy assessment
- Reserve accrual schedule (per-module, per-watt basis)
- Scenario-based reserve sensitivity

### 4. Financial Exposure Assessment
- Total warranty liability estimation
- Reserve-to-revenue ratio benchmarking
- Manufacturer financial health indicators
- Insurance and reinsurance options
- Warranty bond and letter of credit requirements

### 5. Performance Warranty Modeling
- Year-by-year degradation schedule
- Power output at warranty threshold check
- Measurement uncertainty in performance claims
- Fleet-level vs individual module warranty assessment
- Temperature and irradiance correction for claims

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `shipment_volume_mw` | float | Yes | Total module shipment volume in MW |
| `module_price_per_w` | float | Yes | Module selling price in $/W or ₹/W |
| `product_warranty_years` | int | No | Product warranty term (default: 15) |
| `performance_warranty_years` | int | No | Performance warranty term (default: 30) |
| `year1_degradation` | float | No | First-year degradation in % (default: 2.0) |
| `annual_degradation` | float | No | Annual linear degradation after year 1 in % (default: 0.45) |
| `end_of_life_power_pct` | float | No | Guaranteed power at end of performance warranty in % (default: 84.8) |
| `field_return_rate` | float | No | Observed annual field return rate in % (if available) |
| `failure_data` | DataFrame | No | Time-to-failure data for Weibull fitting |
| `claim_cost_per_module` | float | No | Average total cost per warranty claim (default: 1.5× module cost) |
| `discount_rate` | float | No | Discount rate for reserve NPV calculation in % (default: 5) |
| `weibull_beta` | float | No | Weibull shape parameter (if known, default: fit from data) |
| `weibull_eta` | float | No | Weibull scale parameter in years (if known, default: fit from data) |
| `currency` | string | No | "USD", "INR", "EUR" (default: "USD") |

## Example Usage

### Warranty Reserve Calculation

```
Prompt: "Calculate the warranty reserve for our 2024 module shipments:
- Volume: 2 GW shipped at $0.22/W (total revenue $440M)
- Product warranty: 15 years
- Performance warranty: 30 years (Year 1: -2%, then -0.45%/year, 84.8% at year 30)
- Historical field return rate: 0.08%/year (3 years of data)
- Average claim cost: $85/module (module $55 + shipping $15 + labor $15)
What reserve should we set aside?"
```

**Expected output:**
1. Warranty structure summary
2. Weibull model fit: β=0.85, η=180 years (infant mortality dominated)
3. Projected annual claim rate (years 1–30)
4. Cumulative claims: ~2.5% of modules over 30 years
5. Annual warranty cost projection
6. NPV of warranty obligation: $X.X M
7. Reserve as % of revenue: X.X%
8. Reserve per watt shipped: $0.0XX/W
9. Sensitivity: ±50% on failure rate → reserve range
10. Industry benchmark comparison (1–3% of revenue)

### Supplier Warranty Comparison

```
Prompt: "Compare warranty terms from three module suppliers for a 200 MW project:
- Supplier A: 12-year product, 25-year performance (80% at year 25), Tier 1
- Supplier B: 15-year product, 30-year performance (84.8% at year 30), Tier 1
- Supplier C: 25-year product, 30-year performance (87% at year 30), Tier 2
Assess warranty value and risk for each."
```

**Expected output:**
1. Side-by-side warranty comparison table
2. Performance guarantee curves plotted together
3. Expected energy shortfall under each warranty
4. Financial strength assessment per supplier
5. Risk-adjusted warranty value
6. Recommendation considering both terms and counterparty risk

## Output Format

The skill produces:
- **Warranty summary** — Product and performance terms
- **Claim projection** — Annual and cumulative claim rates and costs
- **Reserve calculation** — NPV of warranty obligations, per-watt accrual
- **Financial assessment** — Reserve adequacy, revenue ratio, manufacturer health
- **Comparison tables** — Side-by-side supplier warranty benchmarking
- **Recommendations** — Reserve policy, quality improvement, contract negotiations

## Standards & References

- IEC 61215 — Design qualification relating to warranty expectations
- IEC TS 63209 — Extended stress testing for warranty period validation
- NREL — "PV Module Reliability Scorecard" methodology
- Wohlgemuth, J.H. — "Photovoltaic Module Reliability" (Wiley)
- ISO 22400 — Key performance indicators for manufacturing management
- ASTM E2026 — Standard Guide for the Estimation of Building Maintenance Costs

## Related Skills

- `weibull-reliability` — Reliability distribution fitting for claim rate modeling
- `degradation-modeling` — Degradation mechanisms underlying performance warranty
- `fmea-analysis` — Failure modes driving product warranty claims
- `financial-modeler` — Warranty reserve impact on project financial model
- `bankability-assessment` — Warranty adequacy as bankability criterion
