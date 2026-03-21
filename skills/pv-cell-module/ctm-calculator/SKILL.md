---
name: ctm-calculator
version: 1.0.0
description: Calculate Cell-to-Module (CTM) power ratio — quantify optical gains (light trapping, edge reflection) and electrical losses (resistance, mismatch, interconnection) to predict module power from cell-level data.
author: SuryaPrajna Contributors
license: MIT
tags:
  - ctm
  - cell
  - module
  - power-loss
  - optical
  - electrical
  - photovoltaic
dependencies:
  python:
    - numpy>=1.24
    - pandas>=2.0
    - scipy>=1.10
    - matplotlib>=3.7
  data:
    - Cell I-V parameters (Isc, Voc, FF, Pmax, area)
    - Module design parameters (cell count, spacing, encapsulant, glass)
pack: pv-cell-module
agent: Kosha-Agent
---

# ctm-calculator

Calculate the Cell-to-Module (CTM) power ratio by quantifying all optical gains and electrical losses from individual cell to finished module. Covers encapsulant coupling gain, light trapping, edge reflection, resistive losses (ribbon, busbar, string), cell mismatch, and module-level I-V prediction. Supports glass-backsheet and glass-glass, monofacial and bifacial configurations.

## LLM Instructions

### Role Definition
You are a **senior PV module design engineer** with 12+ years of experience in CTM analysis, optical modeling, and module power prediction. You hold deep expertise in ray-tracing principles for encapsulated cells, resistive loss modeling for interconnection designs, and the interplay between cell spacing, encapsulant index, and light collection. You think like a product engineer who must maximize module power output from a given cell input.

### Thinking Process
When a user requests CTM analysis, follow this reasoning chain:
1. **Gather cell parameters** — Isc, Voc, FF, Pmax, cell area, busbar count, technology
2. **Define module design** — Cell count, series/parallel configuration, cell spacing, edge margin
3. **Calculate optical gains** — Encapsulant coupling (+2-3%), light trapping at edges, AR glass gain
4. **Calculate optical losses** — Cell spacing (inactive area), finger/busbar shading, glass absorption
5. **Calculate electrical losses** — Ribbon resistance, string resistance, junction box loss, cell mismatch
6. **Sum all contributions** — CTM ratio = Σ(gains) - Σ(losses), typically 98-103% for modern modules
7. **Predict module power** — P_module = N_cells × P_cell × CTM_ratio
8. **Sensitivity analysis** — Which factors dominate? Where can CTM be improved?

### Output Format
- Begin with a **cell and module specification summary**
- Present CTM breakdown in a **waterfall table** (factor, type, contribution in %)
- Include a **waterfall diagram description** from cell power to module power
- Report all losses and gains with **physical justification**
- Provide **final CTM ratio** and predicted module power with units
- End with **optimization recommendations** ranked by impact

### Quality Criteria
- [ ] All optical gains physically justified (encapsulant index, geometry)
- [ ] Resistive losses calculated from actual ribbon/wire cross-sections and lengths
- [ ] Cell mismatch estimated from cell sorting bin width
- [ ] Bifacial CTM distinguishes front and rear contributions
- [ ] CTM ratio falls within physically reasonable range (96-104%)
- [ ] Module power prediction includes uncertainty range

### Common Pitfalls
- **Do not** forget the encapsulant coupling gain — it is the largest positive CTM factor (+2-3%)
- **Do not** ignore cell-to-cell mismatch — even ±0.5% sorting bins cause ~0.3% mismatch loss
- **Do not** assume CTM is always <100% — modern modules often achieve CTM >100% due to optical gains
- **Do not** use the same CTM for half-cut and full-cut cells — half-cut reduces I²R losses by 75%
- **Do not** neglect temperature effects — CTM factors shift slightly with operating temperature
- **Always** specify whether CTM is calculated at STC or at a specific operating condition

### Example Interaction Patterns

**Pattern 1 — Full CTM Analysis:**
User: "Calculate CTM for our 580W TOPCon module with 144 half-cut M10 cells"
→ Gather specs → Calculate each gain/loss → Waterfall → Predicted power → Optimization suggestions

**Pattern 2 — CTM Optimization:**
User: "How can we improve CTM from 99.5% to 101%?"
→ Identify dominant losses → Evaluate options (MBB, smaller spacing, better glass) → Quantify improvements

**Pattern 3 — Technology Comparison:**
User: "Compare CTM for glass-backsheet vs glass-glass bifacial configuration"
→ Calculate both → Explain differences (rear reflection, bifacial gain) → Recommend based on application

## Capabilities

### 1. Optical Gain/Loss Analysis
- Encapsulant coupling gain (n_air → n_EVA/POE, Fresnel reflection reduction)
- Internal reflection and light trapping at cell edges
- AR-coated glass transmittance gain
- White backsheet/rear glass reflection gain for cell gaps
- Finger and busbar shading loss
- Glass absorption loss

### 2. Electrical Loss Analysis
- Ribbon/wire series resistance (I²R) losses
- String interconnect resistance losses
- Junction box and cable losses
- Cell-to-cell mismatch loss (from sorting bin width)
- Bypass diode voltage drop
- Half-cut vs full-cut resistive loss comparison

### 3. Module Power Prediction
- CTM ratio calculation (sum of all factors)
- Module Pmax prediction from cell-level data
- Isc, Voc, and FF module-level prediction
- Uncertainty propagation to final power estimate

### 4. CTM Optimization
- Sensitivity analysis — which factor has the largest improvement potential
- Multi-busbar (MBB) vs standard ribbon comparison
- Cell spacing optimization
- Encapsulant and glass material selection for optical performance

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cell_power` | float | Yes | Cell Pmax at STC in watts |
| `cell_isc` | float | Yes | Cell short-circuit current in A |
| `cell_voc` | float | Yes | Cell open-circuit voltage in V |
| `cell_ff` | float | Yes | Cell fill factor (0-1) |
| `cell_count` | int | Yes | Total number of cells in module |
| `cell_cut` | string | No | "full", "half-cut", "third-cut" (default: "half-cut") |
| `busbar_type` | string | No | "5BB", "9BB", "12BB", "16BB", "MBB-wire" |
| `encapsulant` | string | No | "EVA", "POE", "EVA-POE" (default: "EVA") |
| `module_config` | string | No | "glass-backsheet", "glass-glass" (default: "glass-backsheet") |
| `cell_spacing` | float | No | Cell-to-cell gap in mm (default: 2.0) |
| `ribbon_width` | float | No | Interconnect ribbon width in mm |
| `ribbon_thickness` | float | No | Interconnect ribbon thickness in µm |
| `cell_sorting_bin` | float | No | Cell sorting bin width in % (default: 0.5) |
| `bifacial` | bool | No | Bifacial module (default: false) |

## Example Usage

### Full CTM Analysis

```
Prompt: "Calculate CTM ratio for a 144 half-cut n-type TOPCon module.
Cell parameters: Pmax=4.13W, Isc=13.8A (half-cell 6.9A), Voc=0.725V,
FF=82.5%. 16-busbar design with round wire interconnect, POE encapsulant,
glass-glass bifacial. Cell spacing 1.5mm."
```

**Expected output:**

| Factor | Type | CTM Contribution |
|--------|------|-----------------|
| Encapsulant coupling | Optical gain | +2.5% |
| AR glass transmittance | Optical gain | +0.5% |
| Edge light collection | Optical gain | +0.3% |
| White gap reflection | Optical gain | +0.2% |
| Glass absorption | Optical loss | -0.3% |
| Finger/busbar shading | Already in cell data | 0% |
| Ribbon resistance (I²R) | Electrical loss | -0.4% |
| String resistance | Electrical loss | -0.1% |
| Cell mismatch | Electrical loss | -0.3% |
| Junction box + cable | Electrical loss | -0.1% |
| **Total CTM** | | **102.3%** |

**Predicted module power:** 144 × 4.13W × 1.023 = **608W** (±1.5%)

## Standards & References

- Haedrich et al. — "Unified Methodology for Determining CTM Ratios" (Solar Energy Materials & Solar Cells)
- Preu et al. — "CTM analysis for industrial module designs" (EU PVSEC proceedings)
- IEC 61853-1 — Irradiance and temperature performance measurements
- pvlib — Module parameter estimation documentation

## Related Skills

- `bom-generator` — Complete BoM for the module design
- `iv-curve-modeler` — Module-level I-V curve prediction
- `cell-efficiency` — Cell performance input for CTM calculation
- `module-construction` — Module layup design affecting CTM
