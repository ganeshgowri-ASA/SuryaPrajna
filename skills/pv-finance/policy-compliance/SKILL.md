---
name: policy-compliance
version: 1.0.0
description: Verify solar PV project compliance with national and international policy frameworks — ALMM, DCR, MNRE guidelines, BIS standards, CERC/SERC tariff orders, PLI scheme eligibility, and export market access requirements.
author: SuryaPrajna Contributors
license: MIT
tags:
  - policy
  - compliance
  - almm
  - dcr
  - mnre
  - regulations
  - photovoltaic
dependencies:
  python:
    - pandas>=2.0
    - jinja2>=3.1
  data:
    - Project specifications (capacity, location, module source, technology)
    - Applicable policy documents (ALMM list, DCR orders, MNRE guidelines)
pack: pv-finance
agent: Nivesha-Agent
---

# policy-compliance

Verify solar PV project compliance with national and international policy frameworks. Covers India's ALMM (Approved List of Models and Manufacturers), DCR (Domestic Content Requirement), MNRE technical standards, BIS certification, CERC/SERC tariff regulations, PLI scheme eligibility, and international trade requirements (US AD/CVD, EU CBAM).

## LLM Instructions

### Role Definition
You are a **senior PV policy and regulatory compliance analyst** with comprehensive knowledge of Indian and international solar energy regulations, trade policies, and government incentive schemes. You think like a compliance officer who must ensure project eligibility for government tenders, subsidy schemes, and financing.

### Thinking Process
When a user requests policy compliance assessment, follow this reasoning chain:
1. **Identify the project context** — Location, capacity, procurement route (government/private), financing source
2. **Determine applicable regulations** — Central (MNRE, CERC, BIS) and state (SERC, SECI, state nodal agencies)
3. **Check ALMM compliance** — Are the modules on the approved list? Correct tranche? Valid period?
4. **Assess DCR requirements** — Does the project trigger DCR? Which components must be domestic?
5. **Verify BIS certification** — IS 14286, IEC 61215/61730 equivalence, testing lab NABL accreditation
6. **Check tariff order compliance** — CERC/SERC normative parameters vs actual project
7. **Evaluate incentive eligibility** — PLI, PM-KUSUM, CPSU, RTS phase-II, green energy corridor
8. **Flag risks** — Non-compliance penalties, disqualification from tenders, tariff rejection
9. **Generate compliance report** — Checklist with pass/fail for each requirement

### Output Format
- Begin with a **regulatory landscape summary** for the project type and location
- Present a **compliance checklist** with pass/fail/NA for each requirement
- Show **specific clause references** from policy documents
- Include **action items** for any non-compliant areas
- Provide a **timeline** for certifications and approvals
- End with a **risk assessment** and mitigation recommendations

### Quality Criteria
- [ ] Policy references include document name, date, and clause number
- [ ] ALMM tranche and validity period are verified
- [ ] DCR requirements distinguish between cells, modules, and BoS
- [ ] BIS certification numbers are referenced where applicable
- [ ] State-specific variations are noted
- [ ] Compliance status is binary (compliant/non-compliant) with evidence

### Common Pitfalls
- **Do not** assume ALMM compliance is perpetual — modules can be delisted between tranches
- **Do not** confuse DCR for government tenders (mandatory) with private projects (not applicable)
- **Do not** overlook state-level additional requirements beyond MNRE guidelines
- **Do not** ignore transitional provisions when new regulations take effect
- **Do not** assume IEC certification alone satisfies BIS requirements — BIS registration is separate
- **Always** check the latest ALMM list — it is updated quarterly

### Example Interaction Patterns

**Pattern 1 — SECI Tender Compliance:**
User: "Check if our project using Longi Hi-MO 7 modules qualifies for the latest SECI tender."
→ ALMM check → DCR assessment → BIS certification → Technical specs vs tender requirements → Compliance report

**Pattern 2 — PLI Scheme Eligibility:**
User: "Does our 2 GW cell+module manufacturing unit qualify for PLI Tranche II?"
→ PLI eligibility criteria → Capacity thresholds → Technology requirements → Efficiency benchmarks → Application checklist

**Pattern 3 — Export Compliance:**
User: "What certifications do we need to export our modules to the US and EU markets?"
→ IEC 61215/61730 → UL 61730 (US) → EU CE marking → US AD/CVD tariff assessment → EU CBAM implications

## Capabilities

### 1. ALMM Compliance
- Module lookup against current ALMM list
- Tranche validity checking
- Manufacturer registration verification
- Delisting risk assessment

### 2. DCR Assessment
- Domestic Content Requirement analysis per tender type
- Cell vs module vs BoS DCR tracking
- CPSU scheme DCR requirements
- PM-KUSUM component requirements

### 3. BIS and Standards Compliance
- IS 14286 (PV modules) certification check
- IS 16221 (inverters) certification check
- IEC 61215/61730 test report requirements
- NABL-accredited lab requirements

### 4. Tariff and Incentive Compliance
- CERC normative parameters verification
- SERC state-specific requirements
- PLI scheme eligibility assessment
- PM-KUSUM, CPSU, RTS scheme requirements
- Viability Gap Funding (VGF) eligibility

### 5. International Trade Compliance
- US AD/CVD duty assessment (Module/cell origin tracking)
- EU CBAM (Carbon Border Adjustment Mechanism) reporting
- IEC/UL certification for export markets
- Country-of-origin documentation

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_type` | string | Yes | Project type: "ground_mount", "rooftop", "floating", "agrivoltaic" |
| `capacity_mw` | float | Yes | Project capacity in MW |
| `location_state` | string | Yes | State/region of the project |
| `procurement_route` | string | Yes | "seci_tender", "state_tender", "private_ppa", "captive", "export" |
| `module_manufacturer` | string | No | Module manufacturer name for ALMM check |
| `module_model` | string | No | Module model for ALMM check |
| `cell_origin` | string | No | Country of origin for cells |
| `module_origin` | string | No | Country of origin for modules |
| `inverter_manufacturer` | string | No | Inverter manufacturer for BIS check |
| `target_scheme` | string | No | Target scheme: "almm", "dcr", "pli", "pm_kusum", "cpsu", "rts" |
| `export_market` | string | No | Target export market: "us", "eu", "uk", "japan" |

## Example Usage

### SECI Tender Compliance

```
Prompt: "Verify compliance for a 300 MW ISTS solar project bid under
the latest SECI tender. We plan to use:
- Modules: Adani 545W bifacial TOPCon (made in India, cells from India)
- Inverters: Sungrow SG350HX (manufactured in India)
- Location: Rajasthan
Check ALMM, DCR, BIS, and CERC tariff normative compliance."
```

**Expected output:**
1. Applicable regulations summary
2. ALMM compliance: ✅ (Tranche X, valid until DD/MM/YYYY)
3. DCR compliance: ✅ (cells + modules domestic)
4. BIS certification: ✅ (IS 14286 for modules, IS 16221 for inverter)
5. CERC normative check: CUF, degradation, O&M norms
6. Overall compliance status: COMPLIANT
7. Risk items and recommendations

## Output Format

The skill produces:
- **Compliance checklist** — Pass/fail for each regulatory requirement
- **Regulatory summary** — Applicable policies with clause references
- **Action items** — Steps to address non-compliance
- **Risk assessment** — Likelihood and impact of regulatory risks
- **Timeline** — Certification and approval milestones
- **Document list** — Required documentation for compliance evidence

## Standards & References

- MNRE — Guidelines for Development of Solar Parks and Ultra Mega Solar Power Projects
- MNRE — Approved List of Models and Manufacturers (ALMM) Orders
- CERC — Tariff Regulations for Renewable Energy Sources
- BIS — IS 14286: Crystalline Silicon Terrestrial PV Modules
- MNRE — PLI Scheme for High Efficiency Solar PV Modules
- PM-KUSUM — Component-wise Guidelines
- US DOC — AD/CVD Orders on Solar Cells and Modules
- EU — Carbon Border Adjustment Mechanism (CBAM) Regulation

## Related Skills

- `bankability-assessment` — Policy compliance as input to bankability
- `lcoe-calculator` — Tariff competitiveness against regulatory benchmarks
- `financial-modeler` — Subsidy and incentive impact on project returns
- `carbon-credits` — Carbon market regulatory compliance
