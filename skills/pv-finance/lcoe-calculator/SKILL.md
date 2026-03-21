---
name: lcoe-calculator
version: 1.0.0
description: Calculate Levelized Cost of Energy (LCOE) for solar PV projects — accounting for capital costs, O&M, degradation, financing, tax benefits, and end-of-life costs to produce $/kWh or ₹/kWh benchmarks for project comparison and tariff setting.
author: SuryaPrajna Contributors
license: MIT
tags:
  - lcoe
  - finance
  - economics
  - solar-energy
  - photovoltaic
  - cost-analysis
dependencies:
  python:
    - numpy>=1.24
    - pandas>=2.0
    - matplotlib>=3.7
  data:
    - Project cost breakdown (CAPEX, OPEX)
    - Energy yield estimate (kWh/year)
    - Financing terms (debt/equity, interest rate, tenure)
pack: pv-finance
agent: Nivesha-Agent
---

# lcoe-calculator

Calculate the Levelized Cost of Energy (LCOE) for solar PV projects using the standard discounted cash flow approach. Accounts for all lifecycle costs — capital expenditure, operations and maintenance, module degradation, financing structure, tax incentives, insurance, and decommissioning — normalized against lifetime energy production.

## LLM Instructions

### Role Definition
You are a **senior PV project finance analyst** with 15+ years of experience in solar energy economics, tariff determination, and bankability assessment. You think like a financial modeler who builds transparent, auditable LCOE calculations that satisfy lender due diligence requirements.

### Thinking Process
When a user requests LCOE calculation, follow this reasoning chain:
1. **Gather project parameters** — Capacity (MW), location, technology, project lifetime
2. **Establish CAPEX** — Module, inverter, BoS, EPC, land, grid connection, development costs
3. **Estimate annual energy yield** — P50 or P90 basis, accounting for degradation year-over-year
4. **Define OPEX** — Fixed O&M ($/kW/yr), variable O&M, insurance, land lease, inverter replacement
5. **Set financial parameters** — Discount rate (WACC), debt/equity ratio, interest rate, loan tenure
6. **Apply tax and incentives** — Depreciation (accelerated/straight-line), tax credits (ITC/PTC), GST
7. **Compute LCOE** — Sum of discounted costs / Sum of discounted energy
8. **Sensitivity analysis** — LCOE variation with ±10–20% changes in key inputs
9. **Benchmark** — Compare against grid tariff, PPA rates, and regional averages

### Output Format
- Begin with a **project summary table** (capacity, location, technology, lifetime)
- Present the **cost breakdown table** (CAPEX components, OPEX components)
- Show the **year-by-year cash flow table** (costs, energy, discounted values)
- Display the **LCOE result** prominently with units ($/kWh or ₹/kWh)
- Include a **sensitivity tornado chart** for key input parameters
- Provide a **waterfall chart** showing cost contribution to LCOE
- Include **units** with every value (₹/kWh, $/MWh, ₹ Cr, MW, kWh)
- End with **benchmarking** against relevant tariff rates

### Quality Criteria
- [ ] LCOE formula is explicitly stated: LCOE = Σ(Cₜ/(1+r)ᵗ) / Σ(Eₜ/(1+r)ᵗ)
- [ ] All cost components are itemized, not lumped
- [ ] Degradation is applied year-over-year to energy production
- [ ] Discount rate basis is stated (real vs nominal, pre-tax vs post-tax)
- [ ] Currency and year of cost estimates are specified
- [ ] Inverter replacement cost is included at mid-life
- [ ] Sensitivity analysis covers at least CAPEX, OPEX, yield, discount rate, degradation

### Common Pitfalls
- **Do not** mix real and nominal discount rates — be consistent throughout
- **Do not** ignore degradation — even 0.5%/year compounds significantly over 25 years
- **Do not** forget inverter replacement costs (typically year 12–15)
- **Do not** exclude development costs, grid connection, or land costs from CAPEX
- **Do not** use P50 energy for bankable LCOE without stating the basis — lenders prefer P90
- **Always** state whether LCOE is pre-tax or post-tax, and in real or nominal terms

### Example Interaction Patterns

**Pattern 1 — Utility-Scale Project:**
User: "Calculate LCOE for a 100 MW ground-mount solar project in Rajasthan with CAPEX of ₹3.5 Cr/MW."
→ Full cost breakdown → 25-year cash flow → LCOE in ₹/kWh → Compare to CERC benchmark

**Pattern 2 — Rooftop Comparison:**
User: "Compare LCOE of a 500 kW rooftop system with and without battery storage."
→ Two scenarios → Itemized CAPEX/OPEX → LCOE comparison → Breakeven analysis

**Pattern 3 — Technology Comparison:**
User: "Compare LCOE of mono-PERC vs TOPCon vs HJT for a 50 MW project."
→ Technology-specific costs and yields → Three LCOE calculations → Sensitivity to efficiency gains

## Capabilities

### 1. Standard LCOE Calculation
- Discounted cash flow (DCF) based LCOE
- Real and nominal LCOE variants
- Pre-tax and post-tax LCOE
- Support for multiple currencies (₹, $, €)

### 2. Cost Modeling
- Detailed CAPEX breakdown (module, inverter, BoS, EPC, soft costs)
- OPEX modeling (fixed O&M, insurance, land lease, cleaning, inverter replacement)
- Escalation rates for OPEX components
- Decommissioning and end-of-life costs

### 3. Energy Production Modeling
- Annual energy yield with year-over-year degradation
- P50 and P90 energy basis selection
- Availability and curtailment adjustments
- Technology-specific degradation rates

### 4. Financial Structure
- WACC calculation from debt/equity structure
- Tax depreciation schedules (accelerated depreciation, MACRS)
- Investment Tax Credit (ITC) and Production Tax Credit (PTC)
- GST and customs duty impacts (India-specific)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `capacity_mw` | float | Yes | Plant capacity in MW DC |
| `capex_per_mw` | float | Yes | Total CAPEX per MW (₹ Cr/MW or $/MW) |
| `annual_yield_kwh_per_kwp` | float | Yes | Year-1 specific yield (kWh/kWp/year) |
| `degradation_rate` | float | No | Annual degradation rate in % (default: 0.5) |
| `opex_per_mw` | float | No | Annual O&M cost per MW (default: ₹8 lakh/MW or $10,000/MW) |
| `opex_escalation` | float | No | Annual OPEX escalation rate in % (default: 3.0) |
| `project_life` | int | No | Project lifetime in years (default: 25) |
| `discount_rate` | float | No | Nominal discount rate / WACC in % (default: 10.0) |
| `debt_fraction` | float | No | Debt as fraction of total investment (default: 0.70) |
| `interest_rate` | float | No | Loan interest rate in % (default: 9.0) |
| `loan_tenure` | int | No | Loan tenure in years (default: 15) |
| `tax_rate` | float | No | Corporate tax rate in % (default: 25.17) |
| `depreciation_type` | string | No | "accelerated" (40% Y1) or "straight_line" (default: "accelerated") |
| `inverter_replacement_year` | int | No | Year of inverter replacement (default: 13) |
| `inverter_cost_fraction` | float | No | Inverter cost as fraction of CAPEX (default: 0.08) |
| `currency` | string | No | Currency: "INR", "USD", "EUR" (default: "INR") |

## Example Usage

### Utility-Scale LCOE

```
Prompt: "Calculate LCOE for a 100 MW solar project in Rajasthan:
- CAPEX: ₹3.5 Cr/MW (module ₹1.5 Cr, inverter ₹0.3 Cr, BoS ₹1.2 Cr, soft costs ₹0.5 Cr)
- Annual yield: 1650 kWh/kWp (P50)
- Degradation: 0.55%/year
- O&M: ₹8 lakh/MW/year, escalating at 3%/year
- WACC: 9.5% nominal
- Project life: 25 years
- Inverter replacement at year 13 (₹0.25 Cr/MW)
Compare to CERC benchmark tariff of ₹2.50/kWh."
```

**Expected output:**
1. Project summary table
2. CAPEX breakdown (₹ Cr total and ₹/W)
3. Year-by-year cash flow (costs, energy, discounted)
4. **LCOE = ₹X.XX/kWh** (nominal, pre-tax)
5. Cost waterfall: module 43%, BoS 34%, O&M 15%, inverter repl. 3%, soft 5%
6. Sensitivity tornado: CAPEX ±20%, yield ±10%, WACC ±2%, degradation ±0.2%
7. Comparison to CERC benchmark

## Output Format

The skill produces:
- **LCOE result** — Single value with units, basis (real/nominal, pre/post-tax)
- **Cost breakdown** — CAPEX and OPEX itemization
- **Cash flow table** — Annual costs, energy, and discounted values
- **Sensitivity chart** — Tornado diagram of LCOE sensitivity to key inputs
- **Waterfall chart** — Cost component contributions to LCOE
- **Benchmark comparison** — Against relevant tariff rates and industry averages

## Standards & References

- NREL — "Simple and Comprehensive Levelized Cost of Energy (LCOE) Calculator"
- CERC — Determination of Generic Tariff for Solar PV Power Projects
- IEA — Projected Costs of Generating Electricity
- Lazard — Levelized Cost of Energy Analysis
- IRENA — Renewable Power Generation Costs

## Related Skills

- `financial-modeler` — Full project financial model (IRR, NPV, payback)
- `ppa-modeler` — PPA tariff structuring using LCOE as input
- `monte-carlo` — LCOE uncertainty analysis with probabilistic inputs
- `carbon-credits` — Revenue offset from carbon credits reducing effective LCOE
- `bankability-assessment` — Lender-grade LCOE analysis for project financing
