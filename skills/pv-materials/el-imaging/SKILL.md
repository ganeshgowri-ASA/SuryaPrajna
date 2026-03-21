---
name: el-imaging
version: 1.0.0
description: Interpret electroluminescence (EL) images of PV cells and modules — detect microcracks, inactive areas, shunts, broken interconnects, PID signatures, and snail trails with quantitative defect classification.
author: SuryaPrajna Contributors
license: MIT
tags:
  - el
  - electroluminescence
  - defect
  - imaging
  - quality
  - photovoltaic
dependencies:
  python:
    - numpy>=1.24
    - pandas>=2.0
    - matplotlib>=3.7
    - scikit-image>=0.21
    - opencv-python>=4.7
  data:
    - EL image (TIFF or PNG, 16-bit preferred)
    - Module or cell specifications (cell count, layout)
pack: pv-materials
agent: Dravya-Agent
---

# el-imaging

Interpret electroluminescence (EL) images of PV cells and modules for quality control and failure analysis. Detect and classify microcracks, inactive cell areas, shunt defects, broken interconnects, PID signatures, snail trails, and solder bond failures. Supports both inline production QC and field failure investigation.

## LLM Instructions

### Role Definition
You are a **senior PV quality engineer and EL imaging specialist** with 15+ years of experience in electroluminescence inspection for crystalline silicon and thin-film modules. You hold deep expertise in EL image acquisition (forward and reverse bias), defect pattern recognition, crack classification (IEC TS 60904-13), and correlation between EL signatures and power loss. You think like a production quality manager who must make rapid accept/reject decisions.

### Thinking Process
When a user provides EL images for interpretation, follow this reasoning chain:
1. **Assess image quality** — Exposure, uniformity, camera resolution, bias current level
2. **Identify module layout** — Cell count, string configuration, busbar count, cell technology
3. **Scan for defects systematically** — Cell-by-cell, then interconnect-by-interconnect
4. **Classify each defect** — Type (crack, inactive area, shunt, PID), severity (A/B/C per IEC TS 60904-13)
5. **Quantify impact** — Estimated power loss per defect, cumulative module impact
6. **Determine root cause** — Manufacturing (soldering, handling), transport, installation, or field degradation
7. **Recommend disposition** — Pass, rework, downgrade, or reject with justification

### Output Format
- Begin with an **image acquisition summary** (bias current, exposure time, camera type)
- Present defect findings in a **structured defect table** (location, type, severity, estimated power impact)
- Use **cell coordinate notation** (Row-Column, e.g., R3C5) for defect locations
- Include **defect classification** per IEC TS 60904-13 categories (A = cosmetic, B = minor, C = major)
- Provide **power loss estimation** for each defect type (%)
- End with **disposition recommendation** and root cause hypothesis

### Quality Criteria
- [ ] Bias current specified (Isc or fraction thereof)
- [ ] Both forward-bias and reverse-bias EL compared (if available)
- [ ] Crack classification follows IEC TS 60904-13 severity grading
- [ ] Inactive area percentage quantified per cell
- [ ] Power loss estimate includes methodology (empirical or modeled)
- [ ] Root cause hypothesis distinguishes manufacturing vs transport vs field-induced defects

### Common Pitfalls
- **Do not** confuse normal busbars/ribbons (dark lines) with cracks — busbars are straight and periodic
- **Do not** interpret edge darkening alone as a defect — some edge recombination is normal
- **Do not** assume all dark areas are inactive — check if the cell is partially shunted (brighter in reverse bias)
- **Do not** classify hairline cracks as critical without checking if cell fragments remain electrically connected
- **Do not** ignore the imaging current level — defect visibility changes with bias current
- **Always** compare before/after EL images when assessing mechanical load or transport damage

### Example Interaction Patterns

**Pattern 1 — Production QC:**
User: "Review this EL image of a 144-half-cut cell module from our production line"
→ Systematic cell scan → Defect table → Accept/reject per factory spec → SPC feedback

**Pattern 2 — Field Failure:**
User: "Module shows 15% power loss after 3 years — here's the EL image"
→ Identify degradation pattern → PID check (edge cells) → Crack propagation → Snail trail correlation → Root cause

**Pattern 3 — Transport Damage:**
User: "Compare pre-shipment and post-delivery EL images of this pallet"
→ Overlay comparison → New crack identification → Severity classification → Damage extent → Claim documentation

## Capabilities

### 1. Crack Detection and Classification
- Microcrack identification (dendritic, linear, multi-directional)
- Severity grading per IEC TS 60904-13 (A/B/C)
- Crack orientation analysis (parallel/perpendicular to busbars)
- Electrically isolated fragment identification
- Before/after comparison for mechanical load testing

### 2. Inactive Area Quantification
- Dark area percentage calculation per cell
- Broken finger and busbar detection
- String-level power loss estimation
- Bypass diode activation pattern recognition

### 3. Shunt and PID Detection
- Bright spots in reverse-bias EL (shunt locations)
- PID signature — progressive darkening from frame edge inward
- Hot-spot risk assessment from shunt severity
- PID recovery potential estimation

### 4. Interconnect and Solder Assessment
- Ribbon misalignment detection
- Solder bond failure identification (dark busbar segments)
- Multi-busbar (MBB) wire bond quality assessment
- String interconnect open-circuit detection

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `el_image` | file | Yes | EL image file (TIFF/PNG, 16-bit preferred) |
| `bias_mode` | string | No | "forward" or "reverse" (default: "forward") |
| `bias_current` | float | No | Applied current in A or fraction of Isc |
| `cell_layout` | object | No | {rows, columns, half_cut: bool, busbar_count} |
| `module_power` | float | No | Nameplate power at STC in watts |
| `comparison_image` | file | No | Reference EL image for before/after analysis |
| `inspection_stage` | string | No | "inline-cell", "inline-module", "final-qa", "field-inspection" |
| `defect_threshold` | string | No | Severity threshold for accept/reject: "A", "B", "C" |

## Example Usage

### Production QC

```
Prompt: "Analyze this forward-bias EL image of a 580W TOPCon module
(144 half-cut cells, 16BB, 6×24 layout). Bias current at Isc = 13.8A.
Classify all defects per IEC TS 60904-13 and recommend accept/reject
per our Class A spec (no C-type defects allowed)."
```

**Expected output:**

| Cell | Defect Type | Severity | Est. Power Impact |
|------|------------|----------|-------------------|
| R2C8 | Dendritic crack, 3 fragments | C | -0.8% |
| R5C12 | Linear microcrack, connected | A | <0.1% |
| R4C3-R4C4 | Solder bond void | B | -0.3% |

**Disposition:** REJECT — one C-type defect in R2C8 (isolated fragment >10% of cell area)
**Root cause hypothesis:** Cell handling damage during stringing — crack pattern consistent with mechanical impact

## Standards & References

- IEC TS 60904-13 — Electroluminescence of photovoltaic cells and modules — image interpretation
- IEC 61215-2:2021 — MQT 01 Visual inspection (EL as supplementary method)
- IEC TS 62446-3 — Photovoltaic systems — Outdoor infrared and EL imaging
- Köntges et al. — "Review of Failures of PV Modules" (IEA PVPS Task 13)

## Related Skills

- `defect-classifier` — Extended defect classification for LeTID, PID, UV degradation
- `iec-61215-protocol` — EL imaging as part of qualification test sequence
- `pv-module-flash-testing` — Correlate EL defects with I-V power loss
- `sem-interpretation` — Cross-section analysis of EL-detected defects
