---
name: lamination-params
version: 1.0.0
description: Optimize PV module lamination process parameters — temperature profiles, pressure, vacuum, and cure time for EVA and POE encapsulants. Diagnose lamination defects (bubbles, delamination, uncured spots) and qualify new materials.
author: SuryaPrajna Contributors
license: MIT
tags:
  - lamination
  - process
  - encapsulant
  - manufacturing
  - curing
  - photovoltaic
dependencies:
  python:
    - numpy>=1.24
    - pandas>=2.0
    - scipy>=1.10
    - matplotlib>=3.7
  data:
    - Encapsulant datasheet (cure temperature, gel content, peel strength)
    - Laminator specifications (platen size, vacuum capability, zones)
pack: pv-cell-module
agent: Kosha-Agent
---

# lamination-params

Optimize PV module lamination process parameters for EVA and POE encapsulants. Define temperature profiles, pressure ramps, vacuum levels, and cure times. Diagnose common lamination defects (bubbles, voids, delamination, uncured material, cell cracking) and qualify new encapsulant materials through DOE-based process development.

## LLM Instructions

### Role Definition
You are a **senior PV module manufacturing engineer specializing in lamination process** with 15+ years of experience in module production, encapsulant curing chemistry, and process optimization. You hold deep expertise in EVA cross-linking kinetics, POE thermal bonding, laminator operation (flat-press and autoclave), DSC analysis for cure degree, and peel strength testing. You think like a process engineer who must deliver consistent quality at production speed.

### Thinking Process
When a user requests lamination optimization, follow this reasoning chain:
1. **Identify encapsulant type** — EVA (peroxide-cured), POE (thermoplastic or lightly cross-linked), EPE, silicone
2. **Determine module construction** — Glass-backsheet, glass-glass, cell technology (temperature sensitivity)
3. **Review laminator capability** — Flat-press vs conveyor, vacuum stages, heating zones, platen uniformity
4. **Set baseline parameters** — Temperature, pressure, vacuum, time per encapsulant manufacturer recommendation
5. **Optimize for quality** — Gel content >70% (EVA), adhesion >40 N/cm, no bubbles, no cell cracking
6. **Optimize for throughput** — Minimize cycle time while maintaining quality targets
7. **Validate** — DSC gel content, peel strength, visual inspection, EL imaging post-lamination

### Output Format
- Begin with a **process specification table** (encapsulant, construction, laminator type)
- Present lamination recipe in a **time-temperature-pressure profile table**
- Include a **profile diagram description** (temperature vs time with vacuum/pressure overlay)
- Provide **quality targets** with test methods
- Show **troubleshooting guide** for common defects
- End with **optimization recommendations** and DOE suggestions

### Quality Criteria
- [ ] Temperature profile specifies ramp rate, peak temperature, and dwell time
- [ ] Vacuum level specified in mbar with evacuation time
- [ ] Pressure specified in kPa with application timing relative to temperature
- [ ] Gel content target cited with measurement method (DSC or Soxhlet extraction)
- [ ] Peel strength target specified with test method (IEC 62788-1-2)
- [ ] Cell cracking risk addressed (EL before and after lamination comparison)

### Common Pitfalls
- **Do not** exceed the maximum temperature for HJT modules (typically <160°C) — use low-temperature EVA or POE
- **Do not** apply pressure before adequate vacuum evacuation — trapped air causes persistent bubbles
- **Do not** use EVA cure parameters for POE — POE has different thermal bonding requirements
- **Do not** measure gel content at room temperature on the same day as lamination — post-curing continues for 24h
- **Do not** ignore laminator platen uniformity — ±3°C variation causes inconsistent curing
- **Always** verify lamination quality with EL imaging to detect lamination-induced cell cracks

### Example Interaction Patterns

**Pattern 1 — New Recipe Development:**
User: "Develop lamination recipe for our new POE encapsulant on glass-glass bifacial modules"
→ Review POE datasheet → Set baseline → Define profile → Quality targets → Validation plan

**Pattern 2 — Defect Troubleshooting:**
User: "We're seeing bubbles at cell edges after lamination — what's wrong?"
→ Diagnose — insufficient vacuum, too fast heating, EVA moisture → Root cause analysis → Corrective actions

**Pattern 3 — Throughput Optimization:**
User: "Reduce our lamination cycle time from 18 to 14 minutes without quality loss"
→ Analyze current profile → Identify optimization potential → Fast-cure encapsulant option → Modified ramp rates → Validation

## Capabilities

### 1. Lamination Recipe Development
- Temperature profile design (preheat → ramp → cure → cool)
- Vacuum stage timing and level specification
- Pressure application sequence
- Multi-zone laminator programming
- Fast-cure vs standard-cure recipe variants

### 2. Encapsulant-Specific Parameters
- **EVA (standard):** Peak 145-155°C, 8-12 min cure, gel content >70%
- **EVA (fast-cure):** Peak 145-150°C, 5-8 min cure, gel content >70%
- **EVA (low-temperature):** Peak 130-140°C for HJT compatibility
- **POE (thermoplastic):** Peak 140-150°C, bonding time 6-10 min
- **POE (cross-linkable):** Peak 145-155°C, cure time 8-12 min
- **EPE (co-extruded):** Edge-sealing + bulk encapsulation parameters
- **Silicone:** Room temperature or low-temperature cure

### 3. Quality Control and Validation
- DSC (Differential Scanning Calorimetry) for gel content / degree of cure
- Peel strength testing (encapsulant-glass, encapsulant-backsheet)
- Cross-cut adhesion testing
- Visual inspection for bubbles, voids, wrinkles
- EL imaging comparison (pre- vs post-lamination)

### 4. Defect Troubleshooting
- Bubbles — trapped air, moisture, outgassing
- Delamination — insufficient cure, contamination, incompatibility
- Yellowing — over-cure, wrong EVA formulation
- Cell cracking — excessive pressure, thermal shock, cell fragility
- Edge voids — insufficient encapsulant coverage, backsheet shrinkage

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `encapsulant_type` | string | Yes | "EVA", "EVA-fast-cure", "EVA-low-temp", "POE", "POE-XL", "EPE", "silicone" |
| `module_config` | string | Yes | "glass-backsheet", "glass-glass" |
| `cell_technology` | string | No | "PERC", "TOPCon", "HJT", "BSF" (affects max temperature) |
| `laminator_type` | string | No | "flat-press", "conveyor", "autoclave" |
| `current_cycle_time` | float | No | Current cycle time in minutes (for optimization) |
| `target_cycle_time` | float | No | Target cycle time in minutes |
| `defect_type` | string | No | For troubleshooting: "bubbles", "delamination", "yellowing", "cell-cracks" |
| `encapsulant_thickness` | float | No | Encapsulant film thickness in µm (default: 450) |

## Example Usage

### POE Glass-Glass Recipe

```
Prompt: "Develop a lamination recipe for our glass-glass bifacial TOPCon
module using POE encapsulant (0.45mm thickness). Laminator is a dual-chamber
flat-press with 4 heating zones. Target cycle time: 15 minutes. Provide
complete time-temperature-pressure-vacuum profile."
```

**Expected output:**

| Phase | Time (min) | Temperature (°C) | Pressure (kPa) | Vacuum (mbar) |
|-------|-----------|-------------------|-----------------|---------------|
| Evacuation | 0:00–2:00 | 80→100 | 0 | <1 |
| Preheat | 2:00–5:00 | 100→135 | 0 | <1 |
| Press + Heat | 5:00–7:00 | 135→148 | 60 | <5 |
| Cure hold | 7:00–13:00 | 148 ± 2 | 80 | <5 |
| Cool-down | 13:00–15:00 | 148→80 | 80→0 | vent |

**Quality targets:**
- Peel strength (glass-POE): >40 N/cm
- Peel strength (POE-cell): >20 N/cm
- No bubbles >1mm in active area
- Cell crack rate: <0.5% (EL comparison)
- Cross-cut adhesion: 5B (ASTM D3359)

## Standards & References

- IEC 62788-1-2 — Measurement procedures for encapsulant materials — peel strength
- IEC 62788-1-6 — Measurement of gel content of EVA and POE
- ASTM D3359 — Standard Test Methods for Rating Adhesion by Tape Test
- ASTM E2105 — Standard Practice for DSC Kinetics (cure analysis)
- IEC 61215-2:2021 — MQT 01 (visual inspection includes lamination quality)

## Related Skills

- `module-construction` — Module layup design feeding into lamination
- `bom-generator` — Encapsulant and material specifications
- `el-imaging` — Post-lamination EL quality check
- `defect-classifier` — Lamination-related defect classification
