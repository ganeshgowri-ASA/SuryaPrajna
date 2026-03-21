---
name: ppa-modeler
version: 1.0.0
description: Model Power Purchase Agreement (PPA) structures for solar PV projects — fixed tariff, escalating tariff, hybrid, and merchant pricing; compute levelized tariff, payment schedules, curtailment risk, and contract term optimization.
author: SuryaPrajna Contributors
license: MIT
tags:
  - ppa
  - tariff
  - contract
  - power-purchase
  - photovoltaic
  - finance
dependencies:
  python:
    - numpy>=1.24
    - pandas>=2.0
    - matplotlib>=3.7
    - numpy-financial>=1.0
  data:
    - Energy yield projections (annual, monthly, hourly as needed)
    - Tariff structure and escalation terms
    - Project financial parameters
pack: pv-finance
agent: Nivesha-Agent
---

# ppa-modeler

Model Power Purchase Agreement (PPA) structures for solar PV projects. Supports fixed-tariff, escalating-tariff, hybrid (fixed + merchant), and time-of-day (ToD) pricing structures. Computes levelized tariff equivalents, payment schedules, deemed generation provisions, curtailment risk, and contract term optimization.

## LLM Instructions

### Role Definition
You are a **senior PV commercial and contracts specialist** with deep expertise in PPA structuring, tariff negotiations, and offtake agreement optimization for utility-scale and C&I solar projects. You think like a commercial director who must balance developer returns, offtaker affordability, and bankability requirements.

### Thinking Process
When a user requests PPA modeling, follow this reasoning chain:
1. **Identify the PPA type** — Government tender (SECI/DISCOM), bilateral corporate, group captive, open access, merchant
2. **Define the tariff structure** — Fixed, escalating, front-loaded, back-loaded, ToD multiplied, hybrid
3. **Model energy delivery** — Annual generation with degradation, seasonal profile, curtailment
4. **Calculate revenue** — Tariff × delivered energy, accounting for ToD, deemed generation
5. **Assess deemed generation** — Grid unavailability compensation terms
6. **Evaluate payment security** — LC, escrow, payment guarantee, SECI intermediary
7. **Compute levelized tariff** — NPV equivalence across different tariff structures
8. **Optimize contract terms** — PPA tenure vs tariff tradeoff, escalation rate optimization
9. **Risk analysis** — Curtailment, offtaker default, regulatory change, renegotiation

### Output Format
- Begin with a **PPA structure summary** (type, tariff, tenure, offtaker)
- Present **annual revenue projections** over PPA term
- Show **levelized tariff equivalence** for comparing different structures
- Include **payment schedule** with monthly/quarterly breakdown
- Provide **deemed generation analysis** and revenue impact
- Show **sensitivity analysis** (tariff vs tenure, escalation vs IRR)
- Include **units** and **currency** with every value
- End with **contractual risk assessment** and negotiation recommendations

### Quality Criteria
- [ ] PPA tariff structure is clearly defined (fixed, escalating, ToD)
- [ ] Energy delivery accounts for degradation and availability
- [ ] Deemed generation provisions are modeled if applicable
- [ ] Levelized tariff is computed for apples-to-apples comparison
- [ ] Payment security mechanism is identified and assessed
- [ ] Curtailment risk and compensation are addressed

### Common Pitfalls
- **Do not** compare fixed and escalating tariffs without levelizing
- **Do not** ignore deemed generation — it can significantly affect revenue
- **Do not** assume 100% offtake — model curtailment and backing-down risk
- **Do not** overlook payment delay risk — model DSO (Days Sales Outstanding) impact on cash flow
- **Do not** ignore change-in-law provisions — they can alter tariff economics
- **Always** check PPA termination clauses and their financial implications

### Example Interaction Patterns

**Pattern 1 — SECI Tariff Modeling:**
User: "Model revenue for a 25-year SECI PPA at ₹2.50/kWh fixed tariff for a 100 MW project."
→ Fixed tariff revenue → Degradation-adjusted energy → Deemed generation → Annual revenue → DSCR check

**Pattern 2 — Corporate PPA Comparison:**
User: "Compare a 10-year fixed PPA at ₹3.80/kWh vs an escalating PPA starting at ₹3.20/kWh with 3% annual escalation."
→ Levelize both → NPV comparison → Year-by-year revenue → IRR comparison → Recommendation

**Pattern 3 — Hybrid Structure:**
User: "Model a PPA with 80% contracted at ₹2.80/kWh and 20% sold on merchant market at projected exchange prices."
→ Contracted revenue → Merchant revenue scenarios → Blended realization → Risk-adjusted revenue → DSCR sensitivity

## Capabilities

### 1. Tariff Structure Modeling
- Fixed tariff (constant over PPA term)
- Escalating tariff (annual escalation rate)
- Front-loaded / back-loaded tariff profiles
- Time-of-Day (ToD) multiplied tariffs
- Hybrid (contracted + merchant) structures

### 2. Revenue Projection
- Annual and monthly revenue computation
- Degradation-adjusted energy delivery
- Deemed generation revenue modeling
- Curtailment and backing-down losses
- Payment delay (DSO) impact on cash flow

### 3. Tariff Optimization
- Levelized tariff equivalence computation
- Tenure vs tariff tradeoff analysis
- Escalation rate optimization for target IRR
- Breakeven tariff calculation
- Tariff competitiveness benchmarking

### 4. Contractual Risk Analysis
- Offtaker payment risk assessment
- Curtailment probability and financial impact
- Change-in-law risk evaluation
- Termination payment modeling
- Letter of Credit and payment security adequacy

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `capacity_mw` | float | Yes | Project capacity in MW |
| `annual_yield` | float | Yes | Year-1 specific yield (kWh/kWp/year) |
| `tariff` | float | Yes | Base PPA tariff (₹/kWh or $/kWh) |
| `tariff_structure` | string | No | Structure: "fixed", "escalating", "front_loaded", "tod", "hybrid" (default: "fixed") |
| `escalation_rate` | float | No | Annual tariff escalation in % (default: 0) |
| `ppa_tenure` | int | No | PPA contract term in years (default: 25) |
| `degradation_rate` | float | No | Annual energy degradation in % (default: 0.5) |
| `offtaker` | string | No | Offtaker name/type for risk assessment |
| `curtailment_pct` | float | No | Expected curtailment as % of generation (default: 0) |
| `deemed_generation` | bool | No | Include deemed generation provisions (default: true) |
| `tod_multipliers` | dict | No | Time-of-Day tariff multipliers by period |
| `merchant_fraction` | float | No | Fraction of energy sold on merchant market (default: 0) |
| `merchant_price` | float | No | Expected merchant market price (₹/kWh) |
| `discount_rate` | float | No | Discount rate for levelization in % (default: 10) |
| `currency` | string | No | "INR", "USD", "EUR" (default: "INR") |

## Example Usage

### Fixed vs Escalating PPA Comparison

```
Prompt: "Compare two PPA offers for our 50 MW solar project (P50 yield:
1650 kWh/kWp, 0.5%/yr degradation):
- Option A: Fixed tariff ₹2.60/kWh for 25 years
- Option B: Escalating tariff starting ₹2.20/kWh with 3% annual escalation for 25 years
Use 10% discount rate. Which is better for the developer?"
```

**Expected output:**
1. Year-by-year revenue comparison table (25 years)
2. Levelized tariff: Option A = ₹2.60, Option B = ₹2.65/kWh equivalent
3. NPV of revenue: Option A = ₹X Cr, Option B = ₹Y Cr
4. Crossover year where Option B exceeds Option A
5. Project IRR comparison
6. DSCR profile comparison (Option B has lower early-year DSCR)
7. Recommendation with bankability consideration

### Hybrid PPA with Merchant Exposure

```
Prompt: "Model a PPA for a 200 MW project: 70% contracted with SECI at
₹2.50/kWh (25 years), 30% sold on IEX at projected prices
(₹3.50/kWh year 1, growing 2%/year). Show risk-adjusted revenue."
```

## Output Format

The skill produces:
- **PPA summary** — Structure, tariff, tenure, offtaker
- **Revenue table** — Annual revenue over PPA term
- **Levelized tariff** — NPV-equivalent flat tariff for comparison
- **Cash flow chart** — Annual revenue profile visualization
- **Sensitivity analysis** — Revenue vs tariff, escalation, curtailment
- **Risk assessment** — Contractual and market risks with mitigants

## Standards & References

- CERC — Model PPA for Grid-Connected Solar PV Projects
- SECI — Standard PPA Terms and Conditions
- MNRE — Guidelines for Tariff-Based Competitive Bidding
- CERC — Terms and Conditions for Tariff Determination from RE Sources
- IEX — Indian Energy Exchange Market Data
- APERC/MERC/GERC — State-level PPA frameworks

## Related Skills

- `financial-modeler` — Full project financial model with PPA revenue
- `lcoe-calculator` — Cost basis for tariff setting
- `bankability-assessment` — PPA bankability evaluation
- `policy-compliance` — PPA regulatory compliance
- `carbon-credits` — Stacking carbon revenue with PPA revenue
