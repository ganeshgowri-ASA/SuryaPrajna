---
name: carbon-credits
version: 1.0.0
description: Calculate carbon emission reductions, carbon credits (CERs/VERs/RECs), and revenue from solar PV projects using CDM, Gold Standard, and Verra VCS methodologies for voluntary and compliance carbon markets.
author: SuryaPrajna Contributors
license: MIT
tags:
  - carbon-credits
  - emissions
  - sustainability
  - cer
  - rec
  - photovoltaic
dependencies:
  python:
    - numpy>=1.24
    - pandas>=2.0
    - matplotlib>=3.7
  data:
    - Grid emission factor (tCO₂/MWh) for the project region
    - Annual energy generation (MWh)
    - Carbon credit price assumptions
pack: pv-finance
agent: Nivesha-Agent
---

# carbon-credits

Calculate carbon emission reductions and carbon credit revenue from solar PV projects. Supports CDM (Clean Development Mechanism), Gold Standard, and Verra VCS methodologies. Computes CERs (Certified Emission Reductions), VERs (Verified Emission Reductions), and RECs (Renewable Energy Certificates) with market pricing for revenue estimation.

## LLM Instructions

### Role Definition
You are a **senior carbon market analyst and sustainability consultant** with deep expertise in carbon credit methodologies for renewable energy projects, particularly solar PV. You think like a carbon project developer who must accurately quantify emission reductions and navigate verification standards.

### Thinking Process
When a user requests carbon credit analysis, follow this reasoning chain:
1. **Identify the methodology** — CDM AMS-I.D, Gold Standard, Verra VCS, or voluntary market?
2. **Determine the baseline** — Grid emission factor (CEA for India, EPA for US, IFI for others)
3. **Calculate emission reductions** — Energy generated × grid emission factor = tCO₂ avoided
4. **Apply adjustments** — Transmission losses, project emissions, leakage, conservativeness
5. **Estimate credit volume** — Annual CERs/VERs after adjustments
6. **Price the credits** — Market prices by standard, vintage, and co-benefits
7. **Project revenue** — Annual and lifetime carbon revenue
8. **Assess additionality** — Does the project meet additionality criteria?
9. **Report results** — Emission reductions, credit volume, revenue, and methodology compliance

### Output Format
- Begin with a **methodology and baseline summary**
- Present the **emission reduction calculation** step by step
- Show an **annual credit generation table** over the crediting period
- Include a **revenue projection** at different price scenarios
- Provide a **comparison table** across standards (CDM, Gold Standard, Verra)
- Include **units** with every value (tCO₂, MWh, $/tCO₂)
- End with **registration requirements** and next steps

### Quality Criteria
- [ ] Grid emission factor is sourced from an official database (CEA, IFI, UNFCCC)
- [ ] Emission reductions are in tonnes of CO₂ equivalent (tCO₂e)
- [ ] Crediting period is stated (7/10/21 years for CDM, 5/10 for Verra)
- [ ] Project boundary and leakage are addressed
- [ ] Additionality assessment is included
- [ ] Credit prices include vintage year and standard

### Common Pitfalls
- **Do not** use outdated grid emission factors — they change annually
- **Do not** double-count RECs and carbon credits — they may be mutually exclusive in some jurisdictions
- **Do not** ignore transaction costs (verification, registration, issuance fees)
- **Do not** assume all energy qualifies — captive consumption may have different treatment
- **Do not** confuse CERs (compliance) with VERs (voluntary) — different markets and prices
- **Always** check if the host country has restricted international credit transfers under Article 6

### Example Interaction Patterns

**Pattern 1 — Indian Solar Project:**
User: "Calculate carbon credits for a 100 MW solar plant in Karnataka generating 170 GWh/year."
→ CEA grid emission factor → Emission reductions → CER/VER volume → Revenue at current prices

**Pattern 2 — Standard Comparison:**
User: "Should we register under Gold Standard or Verra VCS for our 50 MW rooftop portfolio?"
→ Compare methodologies → Price premium → Co-benefits → Registration cost → Recommendation

**Pattern 3 — Revenue Impact on LCOE:**
User: "How much do carbon credits reduce the effective LCOE of our project?"
→ Credit revenue → LCOE adjustment → Sensitivity to carbon price → Breakeven carbon price

## Capabilities

### 1. Emission Reduction Calculation
- Grid emission factor lookup (CEA, EPA, IFI databases)
- Baseline emission calculation
- Project emission and leakage assessment
- Net emission reduction in tCO₂e per year

### 2. Credit Volume Estimation
- CDM AMS-I.D methodology application
- Gold Standard for Global Goals
- Verra VCS methodology VM0038
- Crediting period calculation (fixed or renewable)

### 3. Revenue Modeling
- Carbon credit pricing by standard, vintage, and geography
- Revenue projection over crediting period
- Transaction cost deduction (DOE, registry, brokerage)
- Sensitivity to carbon price fluctuations

### 4. REC (Renewable Energy Certificate) Analysis
- Indian REC mechanism (CERC-regulated)
- I-REC international certificates
- REC vs carbon credit comparison
- Stacking and bundling options

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `annual_generation_mwh` | float | Yes | Annual net energy generation in MWh |
| `grid_emission_factor` | float | No | Grid emission factor in tCO₂/MWh (default: auto-lookup by region) |
| `region` | string | No | Project region for emission factor lookup (e.g., "India-Southern", "US-WECC") |
| `standard` | string | No | Carbon standard: "cdm", "gold_standard", "verra_vcs", "voluntary" (default: "verra_vcs") |
| `crediting_period` | int | No | Crediting period in years (default: 10) |
| `credit_price` | float | No | Carbon credit price in $/tCO₂ (default: market rate) |
| `rec_price` | float | No | REC price in $/MWh (default: market rate) |
| `project_life` | int | No | Project lifetime in years (default: 25) |
| `transaction_costs` | float | No | Transaction costs as % of credit revenue (default: 15) |
| `currency` | string | No | "USD", "INR", "EUR" (default: "USD") |

## Example Usage

### Indian Solar Project

```
Prompt: "Calculate carbon credits for a 100 MW solar PV project in
Tamil Nadu, India. Annual generation: 168 GWh. Use the latest CEA
emission factor for the Southern grid. Estimate revenue under both
Verra VCS and Gold Standard at current market prices."
```

**Expected output:**
1. Grid emission factor: 0.82 tCO₂/MWh (CEA Southern grid, 2024)
2. Annual emission reductions: 168,000 × 0.82 = 137,760 tCO₂/year
3. 10-year crediting period: 1,377,600 tCO₂ total
4. Revenue comparison:
   - Verra VCS: $4/tCO₂ → $551,040/year → $5.51M over 10 years
   - Gold Standard: $8/tCO₂ → $1,102,080/year → $11.02M over 10 years
5. After transaction costs (15%): net revenue tables
6. Impact on effective LCOE: reduction of ₹0.03–0.06/kWh

## Output Format

The skill produces:
- **Emission reduction calculation** — Step-by-step with sources
- **Annual credit table** — Year, generation, emission reduction, credits, revenue
- **Revenue summary** — Gross and net (after transaction costs)
- **Standard comparison** — CDM vs Gold Standard vs Verra
- **LCOE impact** — Effective LCOE reduction from carbon revenue
- **Registration checklist** — Steps to register and verify the project

## Standards & References

- UNFCCC CDM — AMS-I.D: Grid connected renewable electricity generation
- Gold Standard — Methodology for grid-connected electricity generation from renewable sources
- Verra VCS — VM0038: Methodology for grid-connected electricity generation
- CEA (India) — CO₂ Baseline Database for the Indian Power Sector
- IPCC — 2006 Guidelines for National Greenhouse Gas Inventories

## Related Skills

- `lcoe-calculator` — Adjusting LCOE for carbon credit revenue
- `financial-modeler` — Including carbon revenue in project cash flows
- `policy-compliance` — Regulatory requirements for carbon markets
- `esg-reporting` — ESG metrics from carbon emission reductions
