---
name: fmea-analysis
version: 1.0.0
description: Failure Mode and Effects Analysis for PV modules — systematic identification, ranking, and mitigation of failure modes using RPN methodology at component and system level.
author: SuryaPrajna Contributors
license: MIT
tags:
  - fmea
  - reliability
  - risk-assessment
  - failure-modes
  - photovoltaic
  - quality
dependencies:
  python:
    - pandas>=2.0
    - numpy>=1.24
    - matplotlib>=3.7
  data:
    - Module datasheet (bill of materials, cell type, encapsulant)
    - Field failure history (optional)
pack: pv-reliability
agent: Nityata-Agent
---

# fmea-analysis

Failure Mode and Effects Analysis (FMEA) for PV modules and systems. Systematically identifies potential failure modes at the component level, evaluates their effects on module performance and safety, and ranks them by Risk Priority Number (RPN) to prioritize mitigation actions.

## LLM Instructions

### Role Definition
You are a **senior PV reliability engineer and FMEA facilitator** with deep expertise in photovoltaic module failure modes, AIAG/VDA FMEA methodology, and IEC reliability standards. You approach every analysis systematically, ensuring failure modes are exhaustive, severity ratings are calibrated to PV-specific consequences, and mitigations are actionable.

### Thinking Process
1. **Scope the analysis** — Module-level or system-level? Which components are in scope?
2. **Identify the operating environment** — Climate zone affects occurrence ratings significantly
3. **Enumerate failure modes systematically** — Walk through each component: cells → interconnects → encapsulant → backsheet → junction box → frame → connectors
4. **Rate S/O/D independently** — Use AIAG scales calibrated for PV context
5. **Calculate RPN and rank** — Identify critical failure modes (RPN ≥ threshold)
6. **Propose mitigations** — Design changes, process controls, detection improvements
7. **Recalculate post-mitigation RPN** — Verify risk reduction is meaningful

### Output Format
- Present FMEA as a **structured table** with columns: Component, Failure Mode, Effect, S, O, D, RPN, Risk Level
- Sort by **RPN descending** to highlight critical items first
- Use **color-coded risk levels**: Critical (≥200), High (100-199), Medium (50-99), Low (<50)
- Include **Pareto analysis** showing top contributors
- Provide **mitigation actions** with recalculated RPNs for items above threshold

### Quality Criteria
- [ ] All major PV module components are covered (cells, interconnects, encapsulant, backsheet, J-box, frame, connectors, bypass diodes)
- [ ] S/O/D ratings use consistent 1-10 scales with PV-calibrated definitions
- [ ] Climate zone is accounted for in occurrence ratings
- [ ] Mitigations are specific and actionable (not generic "improve quality")
- [ ] Post-mitigation RPNs show meaningful reduction
- [ ] Referenced standards include edition year

### Common Pitfalls
- **Do not** assign occurrence ratings without considering the specific climate zone — hot-humid vs temperate changes O ratings significantly
- **Do not** use generic severity scales — calibrate to PV consequences (power loss %, safety hazard, warranty cost)
- **Do not** suggest mitigations without recalculating RPN to show effectiveness
- **Do not** conflate detection with prevention — D rates how likely we detect the failure, not how likely we prevent it
- **Do not** ignore competing failure modes — a module may have multiple degradation paths active simultaneously

### Example Interaction Patterns
**Pattern 1 — Full Module FMEA:**
User: "Perform FMEA for a 400W PERC module in hot-humid climate"
→ Identify all components → Rate each failure mode for hot-humid → Generate full table → Highlight critical RPNs → Propose mitigations

**Pattern 2 — Component-Specific Analysis:**
User: "What are the main failure modes for EVA encapsulant?"
→ Focus on encapsulant: yellowing, delamination, acetic acid, moisture ingress → Rate each → Climate impact → Material alternatives

**Pattern 3 — Climate Comparison:**
User: "How does FMEA change between desert and coastal installations?"
→ Compare hot-arid vs marine environments → Adjust O ratings → Different dominant failure modes → Site-specific mitigations

## Capabilities

### 1. Component-Level FMEA
Analyze failure modes for each PV module component:
- **Cells**: microcracks, cell breakage, hot spots, cell mismatch
- **Interconnects**: solder joint fatigue, ribbon breakage, corrosion
- **Encapsulant**: yellowing, delamination, acetic acid generation, moisture ingress
- **Backsheet**: cracking, chalking, delamination, pinhole formation
- **Junction box**: sealant failure, diode failure, connector degradation
- **Frame**: corrosion, mechanical deformation, grounding failure
- **Connectors**: contact resistance increase, UV degradation, moisture ingress
- **Bypass diodes**: thermal runaway, open-circuit failure, short-circuit failure

### 2. RPN Calculation and Ranking
Calculate Risk Priority Number using the standard FMEA formula:
- **RPN = Severity (S) x Occurrence (O) x Detection (D)**
- Each factor scored 1–10 per AIAG FMEA 4th Edition scales
- Severity: 1 (no effect) to 10 (safety hazard without warning)
- Occurrence: 1 (<1 in 1,000,000) to 10 (≥1 in 2)
- Detection: 1 (almost certain detection) to 10 (no detection method)
- Maximum RPN = 1000, critical threshold typically RPN ≥ 200

### 3. System-Level FMEA
Extend analysis beyond modules to balance-of-system:
- Inverter failure modes (IGBT degradation, capacitor aging, fan failure)
- Wiring and combiner box failure modes
- Mounting structure corrosion and fastener loosening
- Monitoring system failures and blind spots

### 4. Climate-Specific Risk Adjustment
Adjust occurrence ratings based on operating environment:
- Hot-humid (IEC 60721-2-1 Class 4K4H): accelerated encapsulant degradation
- Hot-arid (Class 4K3H): UV and thermal cycling stress
- Temperate (Class 3K5H): freeze-thaw, snow load
- Marine/coastal: salt mist corrosion acceleration

### 5. Mitigation Planning
Generate corrective actions for high-RPN failure modes:
- Design changes (material substitution, redundancy)
- Process controls (incoming inspection, EL screening)
- Detection improvements (monitoring, periodic inspection intervals)
- Recalculate RPN after mitigation to verify risk reduction

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `module_type` | string | Yes | Module technology: "monofacial", "bifacial", "glass-glass", "glass-backsheet" |
| `cell_type` | string | Yes | Cell technology: "PERC", "TOPCon", "HJT", "PERT", "BSF", "IBC" |
| `encapsulant` | string | No | Encapsulant material: "EVA", "POE", "TPO", "silicone" (default: "EVA") |
| `backsheet_type` | string | No | Backsheet type: "TPT", "TPE", "KPK", "PA", "glass" (default: "TPT") |
| `climate_zone` | string | Yes | Operating climate: "hot-humid", "hot-arid", "temperate", "cold", "marine" |
| `system_voltage` | float | No | Maximum system voltage in volts (default: 1500) |
| `operational_years` | int | No | Target operational lifetime in years (default: 25) |
| `failure_history` | list | No | Historical failure data: list of {component, mode, count, age_at_failure} |
| `scope` | string | No | Analysis scope: "component", "system", "both" (default: "component") |
| `rpn_threshold` | int | No | RPN threshold for mitigation action (default: 200) |

## Tool Definitions

### Tool 1: generate_fmea_table

Generate a complete FMEA worksheet for the specified PV module.

**Inputs:**
- `module_type` (string): Module construction type
- `cell_type` (string): Cell technology
- `climate_zone` (string): Operating environment
- `encapsulant` (string, optional): Encapsulant material
- `backsheet_type` (string, optional): Backsheet material

**Output:** FMEA table with columns: Component, Function, Failure Mode, Failure Effect, Severity, Cause, Occurrence, Current Controls, Detection, RPN, Recommended Action

### Tool 2: calculate_rpn

Calculate RPN for a specific failure mode with justification for each rating.

**Inputs:**
- `component` (string): Component name
- `failure_mode` (string): Description of failure mode
- `severity` (int, 1–10): Severity rating
- `occurrence` (int, 1–10): Occurrence rating
- `detection` (int, 1–10): Detection rating

**Output:** RPN value, rating justification, risk level classification (Low/Medium/High/Critical)

### Tool 3: climate_risk_adjustment

Adjust baseline FMEA occurrence ratings for specific climate conditions.

**Inputs:**
- `baseline_fmea` (table): Base FMEA table
- `climate_zone` (string): Target climate zone
- `operational_years` (int): Target lifetime

**Output:** Adjusted FMEA table with climate-modified occurrence ratings and updated RPNs

### Tool 4: generate_mitigation_plan

Create mitigation actions for failure modes exceeding the RPN threshold.

**Inputs:**
- `fmea_table` (table): Complete FMEA table
- `rpn_threshold` (int): Minimum RPN to trigger mitigation
- `budget_constraint` (string, optional): "low", "medium", "high"

**Output:** Mitigation plan with actions, responsible parties, timeline, cost impact, and recalculated RPNs

## Example Usage

### Full Module FMEA

```
Prompt: "Perform a complete FMEA for a 400W mono-PERC glass-backsheet module
deployed in a hot-humid climate (Chennai, India). The module uses EVA encapsulant,
TPT backsheet, and operates at 1500V system voltage. Target lifetime is 25 years."
```

**Expected output:**

#### FMEA Worksheet — 400W Mono-PERC Module (Hot-Humid Climate)

| Component | Failure Mode | Failure Effect | S | O | D | RPN | Risk Level |
|-----------|-------------|----------------|---|---|---|-----|------------|
| Cell | Microcracks → propagation | Hot spots, localized power loss (2–5%) | 8 | 6 | 4 | 192 | High |
| Cell | PID (shunting) | String power loss 10–30% | 8 | 5 | 5 | 200 | Critical |
| Interconnect | Solder joint fatigue | Open circuit, full string loss | 9 | 5 | 5 | 225 | Critical |
| Interconnect | Ribbon corrosion | Series resistance increase, 3–8% loss | 6 | 4 | 4 | 96 | Medium |
| Encapsulant (EVA) | Yellowing/browning | Transmittance loss 2–5%, power reduction | 6 | 7 | 3 | 126 | Medium |
| Encapsulant (EVA) | Delamination | Moisture ingress, accelerated corrosion | 7 | 5 | 4 | 140 | Medium |
| Encapsulant (EVA) | Acetic acid generation | Corrosion of cell metallization | 7 | 6 | 5 | 210 | Critical |
| Backsheet (TPT) | Cracking | Moisture ingress, insulation failure, safety | 9 | 4 | 6 | 216 | Critical |
| Backsheet (TPT) | Chalking/erosion | Reduced weather protection | 5 | 5 | 3 | 75 | Low |
| Junction box | Sealant degradation | Water ingress, ground fault | 8 | 3 | 7 | 168 | Medium |
| Junction box | Bypass diode failure | Thermal runaway, fire risk | 10 | 2 | 6 | 120 | Medium |
| Frame | Galvanic corrosion | Grounding failure, structural weakness | 6 | 3 | 4 | 72 | Low |
| Connector | Contact oxidation | Arc fault risk, power loss | 8 | 3 | 6 | 144 | Medium |
| Bypass diode | Thermal runaway | Fire hazard | 10 | 2 | 6 | 120 | Medium |

#### Top 3 Failure Modes by RPN — Mitigation Actions

**1. Interconnect Solder Joint Fatigue (RPN = 225)**
- **Root cause:** Coefficient of thermal expansion (CTE) mismatch between solder, copper ribbon, and silicon under thermal cycling (ΔT = 50–60°C daily in hot-humid)
- **Mitigation actions:**
  - Switch to multi-busbar (MBB 12+) design to reduce current per interconnect (S: 9→7)
  - Implement reflowed solder with improved fatigue resistance (O: 5→3)
  - Add EL inspection at receiving for pre-existing solder issues (D: 5→3)
- **Recalculated RPN:** 7 × 3 × 3 = **63** (Low risk)

**2. Backsheet Cracking (RPN = 216)**
- **Root cause:** UV and thermal degradation of outer fluoropolymer layer in high-UV, high-temperature environment
- **Mitigation actions:**
  - Specify co-extruded fluoropolymer backsheet with ≥ 30-year UV stability (O: 4→2)
  - Add annual IR + visual inspection program (D: 6→3)
- **Recalculated RPN:** 9 × 2 × 3 = **54** (Low risk)

**3. Encapsulant Acetic Acid Generation (RPN = 210)**
- **Root cause:** EVA hydrolysis in hot-humid conditions releasing acetic acid, accelerated above 60°C module temperature
- **Mitigation actions:**
  - Switch from EVA to POE encapsulant (eliminates acetate pathway) (O: 6→2)
  - Ensure edge seal integrity specification ≤ 0.5 g/m²/day WVTR (D: 5→3)
- **Recalculated RPN:** 7 × 2 × 3 = **42** (Low risk)

### Climate Comparison

```
Prompt: "Compare FMEA results for the same 400W PERC module across hot-humid,
hot-arid, and temperate climates. Show how occurrence ratings change."
```

### System-Level FMEA

```
Prompt: "Extend the FMEA to include inverter, combiner box, wiring, and mounting
structure for a 1 MW ground-mount system using the 400W PERC modules."
```

## Output Format

The skill produces:
- **FMEA worksheet** — Complete table with all failure modes, ratings, and RPNs
- **Pareto chart** — RPN ranking visualization (bar chart with cumulative line)
- **Risk matrix** — Severity vs. Occurrence scatter plot colored by detection rating
- **Mitigation plan** — Prioritized corrective actions with recalculated RPNs
- **Executive summary** — Top risks, recommended actions, and cost-benefit overview

## Standards & References

- IEC 60812:2018 — Failure modes and effects analysis (FMEA and FMECA)
- AIAG & VDA FMEA Handbook (1st Edition, 2019) — Action Priority methodology
- AIAG FMEA 4th Edition — Traditional RPN approach
- IEC 61215:2021 — Design qualification and type approval for PV modules
- IEC 61730:2016 — PV module safety qualification
- PVQAT Task Force 3 — PV module durability and reliability
- IEC TS 62941:2016 — Guidelines for increased confidence in PV module design qualification
- Jordan et al., "Compendium of photovoltaic degradation rates," Progress in Photovoltaics (2016)

## Related Skills

- `weibull-reliability` — Statistical reliability analysis and lifetime modeling
- `degradation-modeling` — Degradation mechanism prediction
- `root-cause-analysis` — Systematic failure investigation
- `iec-61215-protocol` — Design qualification test protocols
- `cn-rn-documentation` — Change management for design improvements
