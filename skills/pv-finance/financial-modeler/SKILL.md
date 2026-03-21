---
name: financial-modeler
version: 1.0.0
description: Build comprehensive financial models for solar PV projects — IRR, NPV, DSCR, payback period, cash flow projections, debt structuring, and equity returns for project development, lending, and investment analysis.
author: SuryaPrajna Contributors
license: MIT
tags:
  - finance
  - irr
  - npv
  - cash-flow
  - photovoltaic
  - project-finance
dependencies:
  python:
    - numpy>=1.24
    - pandas>=2.0
    - matplotlib>=3.7
    - numpy-financial>=1.0
  data:
    - Project cost estimates (CAPEX breakdown)
    - Revenue assumptions (tariff, PPA rate, escalation)
    - Financing terms (debt/equity, interest rate, tenure)
pack: pv-finance
agent: Nivesha-Agent
---

# financial-modeler

Build comprehensive project finance models for solar PV projects. Generate pro-forma cash flow statements, compute key financial metrics (IRR, NPV, DSCR, payback period), model debt service schedules, analyze equity returns, and structure financing for bankability.

## LLM Instructions

### Role Definition
You are a **senior solar project finance advisor** with deep expertise in renewable energy investment analysis, debt structuring, and equity return modeling. You think like a financial analyst preparing models for lender due diligence, investor presentations, and board-level investment decisions.

### Thinking Process
When a user requests financial modeling, follow this reasoning chain:
1. **Define project scope** — Capacity, location, technology, COD, project life
2. **Build revenue model** — Tariff/PPA rate × energy yield, escalation, merchant tail
3. **Build cost model** — CAPEX, OPEX, insurance, land lease, working capital
4. **Structure financing** — Debt/equity split, interest rate, tenure, moratorium, DSRA
5. **Construct cash flows** — Revenue, OPEX, EBITDA, debt service, tax, dividends
6. **Compute metrics** — Project IRR, equity IRR, NPV, DSCR (min/avg), payback
7. **Sensitivity analysis** — Key metrics vs tariff, yield, CAPEX, interest rate
8. **Scenario analysis** — Base case, upside, downside, worst case
9. **Present results** — Executive summary with investment recommendation

### Output Format
- Begin with a **project summary and key assumptions table**
- Present **annual pro-forma cash flow** (25 years) in tabular format
- Show **debt schedule** (drawdown, repayment, interest, outstanding balance)
- Display **key metrics prominently**: Project IRR, Equity IRR, NPV, DSCR, Payback
- Include **sensitivity tables** (two-way: tariff vs yield, CAPEX vs WACC)
- Provide **charts**: cash flow waterfall, DSCR profile, cumulative cash flow
- Include **units** and **currency** with every value
- End with **investment recommendation** and risk factors

### Quality Criteria
- [ ] All assumptions are explicitly stated and sourced
- [ ] Cash flows are on a nominal basis unless otherwise stated
- [ ] Debt service includes both principal and interest
- [ ] DSCR is computed for every debt service period
- [ ] Tax computation includes depreciation benefits
- [ ] Working capital requirements are modeled
- [ ] Equity IRR accounts for dividends and terminal value

### Common Pitfalls
- **Do not** confuse project IRR (unlevered) with equity IRR (levered)
- **Do not** ignore working capital — it affects early-year cash flows
- **Do not** assume constant OPEX — apply escalation rates
- **Do not** forget debt service reserve account (DSRA) requirements
- **Do not** mix pre-tax and post-tax metrics without labeling
- **Always** check that minimum DSCR exceeds lender requirements (typically ≥1.2x)

### Example Interaction Patterns

**Pattern 1 — Full Project Model:**
User: "Build a financial model for a 50 MW solar project with ₹3.2 Cr/MW CAPEX, PPA at ₹2.45/kWh for 25 years."
→ Complete 25-year model → All metrics → Debt schedule → Sensitivity → Investment memo

**Pattern 2 — Equity Return Analysis:**
User: "What equity IRR does our investor get on a 200 MW project with 75:25 D/E ratio?"
→ Equity cash flow → Dividend waterfall → Equity IRR → Terminal value sensitivity

**Pattern 3 — Refinancing Scenario:**
User: "Model the impact of refinancing our ₹100 Cr loan at year 5 from 10% to 8% interest."
→ Original vs refinanced debt schedule → DSCR improvement → Equity IRR uplift → NPV of savings

## Capabilities

### 1. Pro-Forma Cash Flow
- Revenue projection (tariff × energy, escalation, indexation)
- OPEX projection (fixed, variable, escalated)
- EBITDA, EBT, PAT computation
- Free cash flow to firm (FCFF) and free cash flow to equity (FCFE)

### 2. Debt Modeling
- Amortizing loan schedules (equal installment, equal principal)
- Construction finance and drawdown schedule
- Moratorium period modeling
- Debt service reserve account (DSRA)
- Refinancing scenarios

### 3. Financial Metrics
- Project IRR (pre-tax and post-tax)
- Equity IRR (levered returns)
- Net Present Value (NPV) at specified discount rate
- Payback period (simple and discounted)
- Debt Service Coverage Ratio (DSCR) — minimum, average, annual profile

### 4. Tax and Depreciation
- Accelerated depreciation (India: 40% year 1)
- MACRS depreciation schedules (US)
- MAT (Minimum Alternate Tax) computation
- Tax credit modeling (ITC, PTC)
- GST and customs duty impact

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `capacity_mw` | float | Yes | Plant capacity in MW DC |
| `capex_per_mw` | float | Yes | Total CAPEX per MW (₹ Cr/MW or $/MW) |
| `tariff` | float | Yes | PPA tariff or feed-in rate (₹/kWh or $/kWh) |
| `tariff_escalation` | float | No | Annual tariff escalation in % (default: 0) |
| `annual_yield` | float | Yes | Year-1 specific yield (kWh/kWp/year) |
| `degradation_rate` | float | No | Annual degradation in % (default: 0.5) |
| `opex_per_mw` | float | No | Year-1 O&M per MW (default: ₹8 lakh/MW) |
| `opex_escalation` | float | No | Annual OPEX escalation in % (default: 3) |
| `project_life` | int | No | Project lifetime in years (default: 25) |
| `debt_fraction` | float | No | Debt as fraction of total cost (default: 0.70) |
| `interest_rate` | float | No | Loan interest rate in % (default: 9.0) |
| `loan_tenure` | int | No | Loan repayment tenure in years (default: 15) |
| `moratorium` | int | No | Construction + moratorium period in months (default: 12) |
| `tax_rate` | float | No | Corporate tax rate in % (default: 25.17) |
| `depreciation_type` | string | No | "accelerated", "straight_line", "macrs" (default: "accelerated") |
| `discount_rate` | float | No | Discount rate for NPV calculation in % (default: 10) |
| `currency` | string | No | "INR", "USD", "EUR" (default: "INR") |

## Example Usage

### Full Project Financial Model

```
Prompt: "Build a 25-year financial model for a 50 MW solar project:
- Location: Gujarat, India
- CAPEX: ₹3.2 Cr/MW (total ₹160 Cr)
- PPA tariff: ₹2.50/kWh (fixed, 25 years)
- Specific yield: 1620 kWh/kWp (P50)
- Degradation: 0.5%/year
- O&M: ₹7.5 lakh/MW/year, escalating at 3%
- Debt: 70% at 9.25%, 15-year tenure, 12-month moratorium
- Equity: 30%
- Depreciation: Accelerated (40% year 1)
- Tax rate: 25.17%
Compute Project IRR, Equity IRR, NPV, min DSCR, payback."
```

**Expected output:**
1. Assumptions summary table
2. 25-year annual cash flow statement
3. Debt service schedule
4. Key metrics: Project IRR = X%, Equity IRR = Y%, NPV = ₹Z Cr, Min DSCR = A.Bx, Payback = N years
5. DSCR profile chart
6. Cumulative cash flow chart
7. Sensitivity: tariff vs yield, CAPEX vs interest rate
8. Investment recommendation

## Output Format

The skill produces:
- **Executive summary** — Key metrics and investment recommendation
- **Assumptions table** — All inputs clearly stated
- **Annual cash flow** — 25-year pro-forma statement
- **Debt schedule** — Drawdown, repayment, interest, balance
- **Metrics dashboard** — IRR, NPV, DSCR, payback
- **Sensitivity tables** — Two-way sensitivity on key parameters
- **Charts** — Cash flow waterfall, DSCR profile, cumulative cash flow

## Standards & References

- CERC — Tariff Regulations for Renewable Energy
- RBI — Project Finance Guidelines
- IFC — Utility-Scale Solar Power Plant Project Finance Guidelines
- IRENA — Renewable Energy Finance: Solar
- Damodaran — Investment Valuation (4th ed.)

## Related Skills

- `lcoe-calculator` — LCOE computation as input to tariff setting
- `ppa-modeler` — PPA structuring and tariff escalation modeling
- `bankability-assessment` — Lender-grade evaluation of project financials
- `carbon-credits` — Additional revenue from carbon credits
- `monte-carlo` — Probabilistic financial analysis
