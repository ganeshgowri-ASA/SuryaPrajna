---
name: root-cause-analysis
version: 1.0.0
description: Root Cause Analysis for PV field failures — systematic investigation using 5-Why, Ishikawa, and Fault Tree Analysis methods with failure pattern recognition and corrective action planning.
author: SuryaPrajna Contributors
license: MIT
tags:
  - root-cause
  - failure-analysis
  - fault-tree
  - ishikawa
  - reliability
  - photovoltaic
dependencies:
  python:
    - pandas>=2.0
    - numpy>=1.24
    - matplotlib>=3.7
    - graphviz>=0.20
  data:
    - Failure observation data (IR images, EL images, visual inspection)
    - Module information (datasheet, age, installation details)
    - Site conditions (climate, mounting configuration)
pack: pv-reliability
agent: Nityata-Agent
---

# root-cause-analysis

Systematic Root Cause Analysis (RCA) for PV module and system field failures. Applies structured investigation methodologies — 5-Why analysis, Ishikawa (fishbone) diagrams, and Fault Tree Analysis (FTA) — to identify underlying causes, quantify failure probabilities, and develop corrective/preventive actions.

## Capabilities

### 1. 5-Why Analysis
Structured questioning methodology to trace symptoms to root causes:
- Iterative "Why?" questioning (typically 3–7 levels deep)
- Distinguishes contributing factors from root cause
- Maps causal chain from observable symptom to actionable root cause
- Categorizes root causes: design, material, process, handling, environment, maintenance

### 2. Ishikawa (Fishbone) Diagram Generation
Organize potential causes into six standard categories (6M):
- **Man**: Installation workmanship, maintenance practices, training gaps
- **Machine**: Equipment defects, tooling issues, mounting hardware
- **Material**: Cell quality, encapsulant properties, solder alloy, glass composition
- **Method**: Installation procedure, design specification, commissioning process
- **Measurement**: Monitoring gaps, inspection frequency, calibration errors
- **Milieu (Environment)**: Climate stress, soiling, animal/vegetation damage, pollution

### 3. Fault Tree Analysis (FTA)
Boolean logic-based top-down failure analysis:
- **Top event**: Observable system failure (e.g., string power loss > 10%)
- **Gate logic**: AND gates (multiple conditions required), OR gates (any condition sufficient)
- **Basic events**: Component-level failure modes with individual probabilities
- **Minimal cut sets**: Smallest combinations of basic events causing the top event
- **Quantitative FTA**: Calculate top-event probability from basic event probabilities
- **Importance measures**: Fussell-Vesely, Birnbaum importance for each basic event

### 4. Failure Pattern Recognition
Identify common PV failure signatures from inspection data:
- **Hot spots**: Localized heating from cell cracks, shunts, or bypass diode activation
- **Snail trails**: Discoloration along cell cracks from silver acetate migration
- **Delamination**: Encapsulant separation visible as bubbling or whitening
- **Corrosion**: Cell metallization corrosion (finger/busbar), connector oxidation
- **PID patterns**: Typically affects modules at string ends near high voltage
- **Backsheet defects**: Cracking, chalking, yellowing patterns
- **Mechanical damage**: Cell breakage patterns from wind, snow, hail, handling

### 5. Corrective and Preventive Action (CAPA)
Develop structured response to identified root causes:
- **Containment**: Immediate actions to prevent further damage
- **Corrective action**: Fix the specific instance
- **Preventive action**: Systemic changes to prevent recurrence
- **Verification**: Testing/monitoring to confirm effectiveness
- **Effectiveness review**: Timeline for follow-up assessment

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `failure_type` | string | Yes | Primary failure category: "hot_spot", "cracking", "delamination", "corrosion", "pid", "arc_fault", "ground_fault", "string_loss", "inverter_fault" |
| `failure_data` | object | Yes | Failure observation: {description, ir_temperature, el_findings, visual_notes, iv_curve_data} |
| `module_info` | object | Yes | Module details: {manufacturer, model, power, cell_type, age_years, serial_number} |
| `site_conditions` | object | Yes | Site environment: {climate_zone, mounting_type, tilt, azimuth, system_voltage, altitude} |
| `inspection_data` | object | No | Inspection results: {ir_images, el_images, iv_curves, visual_photos} |
| `rca_method` | string | No | Analysis method: "5why", "ishikawa", "fta", "all" (default: "all") |
| `fleet_data` | object | No | Fleet-level data: {total_modules, affected_count, failure_distribution} |
| `history` | list | No | Previous failure history for the same site or module batch |

## Tool Definitions

### Tool 1: run_5why_analysis

Perform structured 5-Why analysis for a specific failure observation.

**Inputs:**
- `failure_type` (string): Type of failure observed
- `failure_data` (object): Detailed failure observation
- `module_info` (object): Module specifications
- `site_conditions` (object): Environmental and installation details

**Output:** 5-Why chain with numbered levels, root cause classification, evidence at each level, confidence rating

### Tool 2: generate_ishikawa

Generate an Ishikawa (fishbone) diagram for the failure mode.

**Inputs:**
- `failure_type` (string): Top-level failure effect
- `module_info` (object): Module details
- `site_conditions` (object): Site details
- `known_factors` (list, optional): Already-identified contributing factors

**Output:** Fishbone diagram (text and graphviz), categorized potential causes, investigation priorities

### Tool 3: build_fault_tree

Construct a quantitative fault tree for the failure scenario.

**Inputs:**
- `top_event` (string): Top-level failure event description
- `failure_type` (string): Failure category
- `basic_event_probabilities` (object, optional): Known component failure probabilities
- `system_configuration` (object, optional): String/array layout

**Output:** Fault tree diagram (graphviz), minimal cut sets, top event probability, importance measures

### Tool 4: identify_failure_pattern

Classify the failure based on inspection data signatures.

**Inputs:**
- `ir_data` (object): IR thermography findings (temperatures, patterns)
- `el_data` (object): EL image findings (dark areas, crack patterns)
- `visual_data` (object): Visual inspection notes
- `iv_data` (object, optional): I-V curve measurements

**Output:** Pattern classification, confidence score, matching known failure modes, recommended further testing

### Tool 5: generate_capa

Develop a Corrective and Preventive Action plan based on RCA findings.

**Inputs:**
- `root_cause` (string): Identified root cause
- `failure_type` (string): Failure type
- `scope` (string): "single_module", "string", "array", "fleet"
- `urgency` (string): "safety_critical", "performance", "cosmetic"

**Output:** CAPA plan with containment, correction, prevention, verification steps, timeline, and responsibility matrix

## Example Usage

### Hot Spot Failure Investigation

```
Prompt: "Investigate a hot spot failure on Module #247, string 5, in a 5-year-old
1 MW ground-mount installation. IR scan shows 142°C hot spot on cell position
(3,4). The module is a 370W mono-PERC, installed at 20° tilt in a hot-arid
climate with 45°C diurnal temperature swing. System voltage is 1500V. Perform
complete RCA using all three methods."
```

**Expected output:**

#### Failure Summary
- **Module:** #247, String 5, 370W mono-PERC
- **Age:** 5 years (commissioned 2021)
- **Observation:** IR thermography — 142°C hot spot at cell (3,4), ambient 38°C
- **ΔT from ambient:** 104°C (critical: ΔT > 20°C indicates severe defect)
- **Location in string:** Module 8 of 20 (mid-string, V_module ≈ −600V to ground)

#### 5-Why Analysis

| Level | Question | Answer | Evidence |
|-------|----------|--------|----------|
| 1 | Why is there a hot spot? | Cell (3,4) is reverse-biased at approximately −12V | IR scan: localized 142°C; I-V curve: step in reverse characteristic |
| 2 | Why is the cell reverse-biased? | Cell current is significantly below string current due to crack | EL image: dark region covering ~40% of cell (3,4) |
| 3 | Why is the cell cracked? | Pre-existing microcrack propagated under thermomechanical stress | EL comparison: initial EL (commissioning) shows hairline crack; current EL shows propagated fracture |
| 4 | Why did microcrack propagate? | High thermal cycling stress (ΔT = 45°C daily × 1825 cycles in 5 years) combined with mechanical stress from clamp mounting | Site data: 45°C diurnal swing; mounting analysis: clamp at 25% from edge creates bending moment |
| 5 | Why was there a pre-existing microcrack? | Transport/handling damage — no EL inspection performed at receiving | Shipping records: 2400 km road transport; QC records: no incoming EL inspection protocol |

**Root cause:** Handling/transport damage (microcrack) combined with inadequate incoming quality control (no EL inspection) and accelerated propagation from high thermal cycling and suboptimal mounting.

**Root cause category:** Process (incoming inspection gap) + Environment (thermal cycling)

#### Ishikawa (Fishbone) Diagram

```
                        ┌─────────────────────┐
         Man            │  HOT SPOT FAILURE    │       Material
    ┌──────────────┐    │  Module #247         │  ┌──────────────────┐
    │ No EL at     │    │  Cell (3,4) 142°C    │  │ Cell thickness   │
    │  receiving   ├────┤                      ├──┤  160μm (fragile) │
    │ Installer    │    └──────────┬───────────┘  │ Solder alloy     │
    │  training    │               │              │  fatigue life     │
    └──────────────┘               │              └──────────────────┘
                                   │
         Method                    │              Machine
    ┌──────────────┐               │         ┌──────────────────┐
    │ No incoming  │               │         │ Clamp mounting   │
    │  QC protocol ├───────────────┼─────────┤  at 25% from edge│
    │ Transport    │               │         │ creates stress   │
    │  packaging   │               │         │  concentration   │
    └──────────────┘               │         └──────────────────┘
                                   │
         Measurement               │              Milieu
    ┌──────────────┐               │         ┌──────────────────┐
    │ No baseline  │               │         │ ΔT = 45°C daily  │
    │  EL record   ├───────────────┴─────────┤ High wind site   │
    │ IR inspection│                         │ UV index > 10    │
    │  only annual │                         │  (hot-arid)      │
    └──────────────┘                         └──────────────────┘
```

#### Fault Tree Analysis

**Top event:** Hot spot failure (ΔT > 20°C) on cell

```
                    ┌─────────────────────┐
                    │ HOT SPOT > 20°C ΔT  │
                    │   (Top Event)       │
                    └────────┬────────────┘
                          [AND]
                    ┌────────┴────────────┐
              ┌─────┴─────┐        ┌─────┴──────┐
              │ Reduced   │        │ No bypass  │
              │ cell Isc  │        │ protection │
              │ (cracked) │        │ (partial)  │
              └─────┬─────┘        └─────┬──────┘
                  [OR]                 [OR]
           ┌───────┴──────┐      ┌─────┴──────┐
     ┌─────┴────┐  ┌──────┴──┐ ┌┴──────┐ ┌───┴────┐
     │Transport │  │Thermal  │ │Diode  │ │Crack   │
     │damage    │  │cycling  │ │margin │ │< 1/3   │
     │P=0.08   │  │crack    │ │low    │ │cell    │
     └──────────┘  │P=0.05  │ │P=0.10 │ │P=0.60  │
                   └─────────┘ └───────┘ └────────┘
```

**Quantitative analysis:**
- P(reduced cell Isc) = 1 − (1−0.08)(1−0.05) = 0.126
- P(no bypass protection) = 1 − (1−0.10)(1−0.60) = 0.64
- P(hot spot) = P(crack) × P(no bypass) = 0.126 × 0.64 = **0.081 per module**
- Fleet impact: 2700 modules × 0.081 = **~219 modules at risk**

**Minimal cut sets:**
1. {Transport damage, Diode margin low} — P = 0.008
2. {Transport damage, Crack < 1/3 cell} — P = 0.048
3. {Thermal cycling crack, Diode margin low} — P = 0.005
4. {Thermal cycling crack, Crack < 1/3 cell} — P = 0.030

#### CAPA Plan

| Action Type | Action | Responsible | Timeline |
|-------------|--------|-------------|----------|
| **Containment** | IR scan all modules in String 5; de-rate affected module | O&M team | 48 hours |
| **Containment** | IR scan 10% random sample across plant | O&M team | 2 weeks |
| **Corrective** | Replace Module #247 | O&M team | 1 week |
| **Corrective** | EL + IR inspection of modules with transport from same batch | Quality | 1 month |
| **Preventive** | Implement incoming EL inspection for all future deliveries | Procurement + QC | Immediate |
| **Preventive** | Change clamp position to rail-mount or clamp at ≤15% from edge | Engineering | Next install |
| **Preventive** | Require transport EL comparison (factory vs. site arrival) | Procurement | Next PO |
| **Verification** | Follow-up IR scan at 6 months for replaced module | O&M team | 6 months |

### Fleet-Wide Pattern Analysis

```
Prompt: "We are seeing snail trails on 15% of modules after 3 years in a coastal
installation. Perform RCA to determine if this is cosmetic or indicates
performance degradation."
```

### Arc Fault Investigation

```
Prompt: "Investigate a DC arc fault event that triggered the inverter AFCI.
String 12 tripped twice in the last month. Perform FTA to identify the most
likely arc fault source."
```

## Output Format

The skill produces:
- **5-Why table** — Numbered causal chain with evidence and confidence levels
- **Ishikawa diagram** — Text-based or graphviz fishbone with categorized causes
- **Fault tree** — Boolean logic diagram with quantified basic event probabilities
- **Failure classification** — Pattern type, severity, safety implications
- **CAPA plan** — Structured corrective/preventive action table with timelines
- **Fleet risk estimate** — Extrapolated failure count and financial impact

## Standards & References

- IEC 62446-3:2017 — Photovoltaic (PV) systems — Requirements for testing, documentation and maintenance — Part 3: Photovoltaic modules and plants — Outdoor infrared thermography
- IEC TS 60904-13:2018 — Photovoltaic devices — Part 13: Electroluminescence of photovoltaic modules
- IEC 63126:2020 — Guidelines for qualifying PV modules, components and materials for operation at high temperatures
- IEC 61025:2006 — Fault tree analysis (FTA)
- IEC 62740:2015 — Root cause analysis (RCA)
- NREL — "Assessment of Photovoltaic Module Failures in the Field" (Technical Report, 2017)
- Köntges, M. et al. — "Review of Failures of Photovoltaic Modules," IEA-PVPS Task 13 Report T13-01:2014
- TÜV Rheinland — "PV Module Reliability Scorecard" (annual reports)

## Related Skills

- `fmea-analysis` — Proactive failure mode identification and risk ranking
- `weibull-reliability` — Statistical lifetime analysis from failure data
- `degradation-modeling` — Degradation mechanism quantification
- `el-imaging` — Electroluminescence image interpretation
- `ir-thermography` — Infrared inspection and thermal analysis
- `cn-rn-documentation` — Document corrective design changes
