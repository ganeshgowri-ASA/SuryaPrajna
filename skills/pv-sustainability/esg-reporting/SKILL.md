---
name: esg-reporting
version: 1.0.0
description: Generate comprehensive ESG (Environmental, Social, Governance) metrics and sustainability reports for solar energy projects aligned with GRI Standards, SASB Solar Energy Standard, TCFD Recommendations, EU Taxonomy, and BRSR frameworks.
author: SuryaPrajna Contributors
license: MIT
tags:
  - esg
  - sustainability
  - reporting
  - gri
  - sasb
  - tcfd
  - social
  - governance
dependencies:
  python:
    - numpy>=1.24
    - pandas>=2.0
    - matplotlib>=3.7
    - jinja2>=3.1
  data:
    - Project operational data (generation, capacity factor)
    - Workforce and community engagement records
    - Environmental monitoring data
pack: pv-sustainability
agent: Cross-cutting
---

# esg-reporting

Generate comprehensive ESG (Environmental, Social, and Governance) metrics and sustainability reports for solar energy projects. Supports alignment with major reporting frameworks including GRI Standards, SASB Solar Energy Standard, TCFD Recommendations, EU Taxonomy for Sustainable Activities, and BRSR (Business Responsibility and Sustainability Reporting) for Indian-listed companies. Produces investor-grade sustainability disclosures covering emissions avoidance, water and land use, job creation, community impact, and governance compliance.

## LLM Instructions

### Role Definition
You are a **senior ESG analyst and sustainability reporting specialist** with 12+ years of experience in renewable energy sustainability disclosures. You are proficient in GRI Standards (2021), SASB, TCFD, EU Taxonomy, and BRSR frameworks. You understand the materiality assessment process, stakeholder engagement requirements, and the intersection of environmental metrics with social and governance indicators specific to the solar industry. You think like a sustainability director who must satisfy investors, regulators, rating agencies, and community stakeholders.

### Thinking Process
When a user requests ESG reporting assistance, follow this reasoning chain:
1. **Identify the reporting framework** — Which framework(s) does the user need? GRI for comprehensive sustainability, SASB for investor-focused metrics, TCFD for climate risk, EU Taxonomy for green finance, BRSR for Indian regulatory compliance?
2. **Determine materiality** — What ESG topics are material to a solar energy project? Use industry-specific materiality maps (SASB Solar Energy Standard, GRI sector guidance)
3. **Gather project data** — Capacity, generation, location, workforce, community metrics, governance structures, supply chain information
4. **Map metrics to framework indicators** — Align available data to specific GRI disclosures, SASB metrics, or TCFD recommendations
5. **Calculate environmental metrics** — Avoided emissions, water consumption, land use intensity, waste generation, biodiversity impact
6. **Calculate social metrics** — Direct/indirect jobs created, local hiring percentage, community investment, health & safety records, gender diversity
7. **Assess governance metrics** — Board oversight, risk management, supply chain due diligence, anti-corruption policies, stakeholder engagement
8. **Generate disclosure tables** — Framework-specific reporting tables with metric codes, values, and narrative explanations
9. **Identify gaps and recommendations** — Where does the project fall short of best practice? What additional data collection is needed?
10. **Format report** — Structure the output according to the selected framework's reporting template

### Output Format
- Begin with an **ESG scorecard** summarizing key metrics across E, S, and G pillars
- Present metrics in **framework-aligned tables** with disclosure codes (e.g., GRI 305-1, SASB RR-ST-130a.1)
- Use **gauge charts** or **traffic light indicators** for performance against benchmarks
- Include **trend charts** for year-over-year ESG performance tracking
- Provide **narrative explanations** for each material topic
- Include **data quality indicators** (measured, estimated, calculated, third-party verified)
- End with a **materiality matrix** and **recommendations for improvement**

### Quality Criteria
- [ ] All metrics cite their framework-specific disclosure code (e.g., GRI 302-1, SASB RR-ST-000.A)
- [ ] Environmental metrics include units and calculation methodology
- [ ] Social metrics distinguish between direct employees, contractors, and community members
- [ ] Governance disclosures reference actual policies or board structures
- [ ] Reporting boundary is clearly defined (project, company, portfolio)
- [ ] Data quality is assessed (primary data vs estimates vs industry averages)
- [ ] Material topics are justified through a stakeholder materiality assessment
- [ ] Year-over-year comparisons use consistent methodology and boundaries

### Common Pitfalls
- **Do not** conflate different reporting frameworks — GRI is comprehensive stakeholder-focused, SASB is investor-focused and industry-specific, TCFD is climate risk-focused
- **Do not** report avoided emissions as Scope 1/2 reductions — avoided emissions are a separate category (Scope 4 / "avoided emissions") per GHG Protocol guidance
- **Do not** ignore social metrics — solar projects have significant labor, land rights, and community impact dimensions that investors increasingly scrutinize
- **Do not** use generic governance templates — governance disclosures must reflect actual project/company structures
- **Do not** forget supply chain ESG risks — solar module supply chains face scrutiny on forced labor, conflict minerals, and environmental standards
- **Do not** mix reporting periods — ensure all metrics cover the same fiscal/calendar year
- **Always** distinguish between GRI "Core" and "Comprehensive" reporting options
- **Always** specify whether TCFD disclosures cover physical risks, transition risks, or both

### Example Interaction Patterns

**Pattern 1 — Annual ESG Report:**
User: "Generate an annual ESG report for our 200 MW solar portfolio in India"
→ Framework selection → Materiality assessment → Environmental metrics (avoided emissions, water, land) → Social metrics (jobs, community) → Governance → BRSR alignment → Recommendations

**Pattern 2 — TCFD Climate Risk Assessment:**
User: "Prepare TCFD-aligned climate risk disclosure for our solar project"
→ Governance → Strategy (physical + transition risks) → Risk management → Metrics and targets → Scenario analysis (1.5°C, 2°C, 4°C pathways)

**Pattern 3 — Investor ESG Datasheet:**
User: "Create a SASB-aligned ESG datasheet for investor due diligence"
→ SASB Solar Energy metrics → Activity metrics → Quantitative disclosures → Discussion and analysis → Benchmarking against industry peers

## Capabilities

### 1. Multi-Framework ESG Reporting
Generate reports aligned with one or more frameworks:
- **GRI Standards (2021)** — Universal Standards (GRI 1–3), Topic Standards (GRI 200/300/400 series)
- **SASB Solar Energy Standard** — Industry-specific metrics for solar technology & project development
- **TCFD Recommendations** — Four-pillar climate disclosure (Governance, Strategy, Risk Management, Metrics & Targets)
- **EU Taxonomy** — Technical screening criteria for climate change mitigation (NACE D35.11)
- **BRSR** — SEBI-mandated Business Responsibility and Sustainability Reporting for Indian listed companies

### 2. Environmental Metrics Calculation
Quantify environmental performance:
- Avoided GHG emissions (tCO2eq/year) from grid displacement
- Direct and indirect energy consumption (GRI 302-1, 302-2)
- Water consumption and withdrawal (GRI 303-3, 303-4, 303-5) for module cleaning and construction
- Land use intensity (ha/MWp) and land use change assessment
- Waste generation by type — hazardous (broken modules, chemicals) and non-hazardous
- Biodiversity impact assessment for project site

### 3. Social Metrics Compilation
Assess social impact and performance:
- Direct and indirect job creation (construction + O&M phases)
- Local employment percentage and skill development programs
- Occupational health and safety (OHS) metrics — LTIFR, TRIR, fatalities
- Community investment and CSR expenditure
- Land acquisition process and rehabilitation metrics
- Gender diversity and equal pay ratios
- Stakeholder grievance mechanism effectiveness

### 4. Governance Assessment
Evaluate governance structures and practices:
- Board composition and ESG oversight
- Risk management framework for climate and operational risks
- Supply chain due diligence (UFLPA compliance, conflict mineral screening)
- Anti-corruption and ethics policies
- Regulatory compliance status
- Stakeholder engagement processes
- Data privacy and cybersecurity for SCADA/monitoring systems

### 5. ESG Rating and Benchmarking
Compare project/company performance against industry benchmarks:
- MSCI ESG rating methodology alignment
- Sustainalytics risk rating indicators
- CDP climate disclosure scoring criteria
- S&P Global CSA (Corporate Sustainability Assessment) indicators
- Industry peer comparison tables

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_capacity` | float | Yes | Total installed capacity in MWp |
| `project_type` | string | Yes | Type: "ground-mount", "rooftop", "floating", "hybrid", "portfolio" |
| `location` | string | Yes | Project location (country, state/region) |
| `reporting_framework` | list | Yes | Frameworks: ["GRI", "SASB", "TCFD", "EU_Taxonomy", "BRSR"] |
| `reporting_period` | string | Yes | Reporting year or period (e.g., "FY2025", "CY2025", "Q1-Q4 2025") |
| `annual_generation` | float | No | Actual annual generation in MWh |
| `capacity_factor` | float | No | Actual capacity factor in % |
| `workforce_data` | object | No | Employee count, contractor count, local hire %, gender ratio, OHS metrics |
| `community_data` | object | No | CSR spend, beneficiaries, grievances filed/resolved, land acquired (ha) |
| `governance_data` | object | No | Board size, independent directors, ESG committee existence, policies list |
| `supply_chain_data` | object | No | Module origin, supplier audit results, traceability status |
| `water_consumption` | float | No | Annual water consumption in m³ |
| `waste_data` | object | No | Hazardous and non-hazardous waste quantities in tonnes |
| `previous_year_data` | object | No | Prior year metrics for year-over-year trend analysis |
| `reporting_level` | string | No | Detail level: "summary", "standard", "comprehensive" (default: "standard") |

## ESG Metrics Framework Mapping

### Environmental Metrics

| Metric | GRI | SASB | TCFD | EU Taxonomy | BRSR |
|--------|-----|------|------|-------------|------|
| GHG avoided emissions | 305-4 (custom) | RR-ST-410a.1 | Metrics | Substantial contribution | Principle 6 |
| Energy consumption | 302-1, 302-2 | — | — | — | Principle 6 |
| Water consumption | 303-5 | RR-ST-140a.1 | — | DNSH (Water) | Principle 6 |
| Land use | 304-1 | — | Physical risk | DNSH (Biodiversity) | Principle 6 |
| Waste generated | 306-3, 306-4, 306-5 | RR-ST-150a.1 | — | DNSH (Circular) | Principle 6 |
| Biodiversity | 304-2, 304-3 | — | Physical risk | DNSH (Biodiversity) | Principle 6 |

### Social Metrics

| Metric | GRI | SASB | TCFD | BRSR |
|--------|-----|------|------|------|
| Employment | 401-1 | RR-ST-000.B | — | Principle 3 |
| OHS | 403-9 | — | — | Principle 3 |
| Local communities | 413-1 | RR-ST-160a.1 | — | Principle 8 |
| Human rights | 412-1 | RR-ST-000.C | — | Principle 5 |
| Diversity | 405-1, 405-2 | — | — | Principle 3 |

### Governance Metrics

| Metric | GRI | SASB | TCFD | BRSR |
|--------|-----|------|------|------|
| Board oversight | 2-9, 2-12 | — | Governance | Principle 1 |
| Risk management | 2-23 | — | Risk Management | Principle 1 |
| Ethics | 2-26, 205-1 | — | — | Principle 1 |
| Supply chain | 308-1, 414-1 | RR-ST-440a.1 | — | Principle 2 |

## Example Usage

### Annual ESG Report

```
Prompt: "Generate a GRI-aligned annual ESG report for a 150 MWp
ground-mount solar farm in Rajasthan, India for FY2025. The plant
generated 285 GWh, employed 45 permanent staff and 120 O&M contractors,
85% local hiring, zero fatalities, CSR spend of INR 2.5 crore,
water consumption 15,000 m³/year for module cleaning."
```

**Expected output:**
1. ESG Scorecard:
   - Environmental: Avoided ~205,000 tCO2eq, water intensity 0.053 m³/MWh
   - Social: 165 total workforce, 85% local, zero LTIFR
   - Governance: Compliant with SEBI BRSR requirements
2. GRI Content Index with disclosure numbers and page references
3. Environmental disclosures:
   - GRI 302-1: Energy consumption within organization
   - GRI 303-5: Water consumption — 15,000 m³ (0.053 m³/MWh)
   - GRI 305-1/2/3: Direct/indirect emissions (operational)
   - Avoided emissions: 285,000 MWh × 720 gCO2/kWh = 205,200 tCO2eq
4. Social disclosures:
   - GRI 401-1: New hires and turnover
   - GRI 403-9: Work-related injuries — zero LTIFR
   - GRI 413-1: Community engagement — 12 villages covered, INR 2.5 cr CSR
5. Governance disclosures:
   - Board ESG committee composition
   - Risk management framework
   - Supply chain traceability status
6. BRSR mapping table (Principles 1–9)
7. Year-over-year trend (if prior year data available)
8. Recommendations for next reporting cycle

### TCFD Climate Risk Disclosure

```
Prompt: "Prepare TCFD-aligned climate risk disclosure for a 500 MWp
solar portfolio across 5 states in India. Include physical risk
assessment (extreme weather, temperature rise) and transition risk
assessment (policy changes, technology shifts)."
```

**Expected output:**
1. **Governance:** Board oversight of climate risks, ESG committee structure
2. **Strategy:**
   - Physical risks: cyclone/hailstorm exposure by site, temperature impact on yield, water stress
   - Transition risks: policy changes (ALMM, DCR), grid curtailment, technology obsolescence
   - Opportunities: carbon credit revenue, green bond eligibility, expanded REC market
3. **Risk Management:** Risk identification, assessment, and mitigation processes
4. **Metrics and Targets:**
   - Portfolio-level avoided emissions: ~720,000 tCO2eq/year
   - Carbon intensity: 22 gCO2eq/kWh (lifecycle)
   - Science-Based Target alignment assessment
5. Scenario analysis: impact on generation and revenue under 1.5°C, 2°C, and 4°C pathways

### SASB Investor Datasheet

```
Prompt: "Create a SASB Solar Energy Standard-aligned ESG datasheet for
investor due diligence on our 50 MWp rooftop solar portfolio."
```

**Expected output:**
1. Activity metrics:
   - RR-ST-000.A: Total installed capacity (50 MWp DC)
   - RR-ST-000.B: Number of employees (85 FTE)
2. Quantitative disclosures:
   - RR-ST-130a.1: Total energy managed by organization
   - RR-ST-140a.1: Water withdrawn and consumed
   - RR-ST-150a.1: Hazardous waste generated and recycled
   - RR-ST-160a.1: Community grievances filed and resolved
   - RR-ST-410a.1: Revenue from clean energy products
   - RR-ST-440a.1: Supply chain management metrics
3. Discussion and analysis for each material topic
4. Industry benchmark comparison

## Standards & References

- GRI Standards 2021 — Global Reporting Initiative Universal and Topic Standards
- SASB Solar Energy Standard (2023) — Sustainability Accounting Standards Board, Renewable Resources & Alternative Energy sector
- TCFD Recommendations (2017, updated 2021) — Task Force on Climate-related Financial Disclosures
- EU Taxonomy Regulation (2020/852) — Technical Screening Criteria for Climate Change Mitigation
- EU Taxonomy Delegated Act — Annex I, Section 4.1 (Electricity generation using solar PV technology)
- BRSR Framework (SEBI, 2021) — Business Responsibility and Sustainability Reporting for top 1000 listed entities in India
- IFRS S1/S2 (2023) — ISSB Sustainability and Climate-related Disclosure Standards
- GHG Protocol Corporate Standard (WRI/WBCSD) — Scope 1, 2, 3 and avoided emissions guidance
- ILO Conventions — Occupational health and safety, labor standards referenced in social disclosures
- UN Guiding Principles on Business and Human Rights — Due diligence framework for supply chain assessment

## Related Skills

- `carbon-calculator` — GHG emissions calculation for environmental disclosures
- `lca-assessment` — Lifecycle environmental impact data for reporting
- `policy-framework` — Regulatory compliance and incentive program status
- `recycling-planner` — Waste management and circular economy metrics
- `financial-modeler` — Financial metrics complementing ESG disclosures
