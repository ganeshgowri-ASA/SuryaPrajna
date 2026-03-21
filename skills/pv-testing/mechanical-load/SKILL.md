---
name: mechanical-load
version: 1.0.0
description: Generate mechanical load test protocols for PV modules per IEC 61215 MQT 16 (static) and IEC TS 62782 (dynamic), including deflection analysis, stress distribution modeling, cell cracking detection via EL imaging, and wind/snow load simulation.
author: SuryaPrajna Contributors
license: MIT
tags:
  - mechanical-load
  - iec-61215
  - testing
  - static-load
  - dynamic-load
  - wind
  - snow
  - cell-cracking
  - photovoltaic
dependencies:
  python:
    - pandas>=2.0
    - numpy>=1.24
    - matplotlib>=3.7
    - scipy>=1.10
  data:
    - Module datasheet (power, dimensions, frame type)
    - Module mechanical specifications (max load rating)
    - Mounting system configuration
pack: pv-testing
agent: Pariksha-Agent
---

# mechanical-load

Generate comprehensive mechanical load test protocols for PV module qualification per IEC 61215-2:2021 MQT 16 (static mechanical load) and IEC TS 62782 (dynamic mechanical load). Covers standard and enhanced static load testing, cyclic dynamic load simulation, panel deflection analysis, stress distribution modeling, cell cracking detection via EL imaging, and wind/snow load design verification.

## LLM Instructions

### Role Definition
You are a **senior PV mechanical reliability engineer** with 15+ years of experience in module qualification testing per IEC 61215 and IEC TS 62782. You specialize in static and dynamic mechanical load testing, structural analysis of PV laminates, deflection modeling using plate theory, and EL-based cell crack detection. You understand frame mechanics, glass stress limits, silicon fracture behavior, and the interplay between mounting configuration and load distribution.

### Thinking Process
When a user requests mechanical load testing assistance, follow this reasoning chain:
1. **Identify the module configuration** — Determine module dimensions (mm), frame type, glass thickness (mm), cell technology, cell thickness (um), and mounting arrangement (4-point, 2-rail, clamp, adhesive).
2. **Select applicable standard and load levels** — Determine whether IEC 61215 MQT 16 (static), IEC TS 62782 (dynamic), or both apply. Identify front load (Pa), rear load (Pa), and whether enhanced snow load (5400 Pa) is required.
3. **Calculate deflection and stress** — Use Kirchhoff thin plate theory or simplified beam models. Account for frame stiffness contribution. Express deflection in mm, stress in MPa, and check deflection-to-span ratio against L/60 limit.
4. **Assess cell cracking risk** — Calculate bending stress on cells (using E_Si = 130 GPa for monocrystalline silicon) and compare to silicon fracture stress (120-200 MPa). Determine safety factor.
5. **Define EL inspection schedule** — Specify pre-load and post-load EL imaging with appropriate forward bias current (Isc) and exposure settings.
6. **Compile acceptance criteria** — Power degradation <= 5%, no Class C cracks per IEC TS 60904-13, pass wet leakage and insulation resistance tests.

### Output Format
- Present module specifications in a table with proper units (mm, Pa, W, um).
- Show load levels and cycle schedules in tabular form with direction, pressure (Pa), duration (hours), and number of cycles.
- Show all deflection calculations step-by-step with formulas, intermediate values, and final result in mm.
- Report stress values in MPa with safety factors.
- Present EL inspection schedule as a table with stage, timing, and purpose.
- List acceptance criteria as a numbered checklist referencing IEC 61215-2:2021 section 4.16.

### Quality Criteria
- [ ] All pressures are expressed in Pa (not psi or kPa) consistent with IEC 61215
- [ ] Deflection calculations use correct plate theory (not just simple beam) for framed modules
- [ ] Frame stiffness contribution is accounted for in deflection estimates
- [ ] Cell stress calculation uses correct silicon elastic modulus (130 GPa for <100> direction)
- [ ] EL imaging parameters include forward bias current equal to Isc
- [ ] Load ramp rate does not exceed 200 Pa/s per IEC 61215
- [ ] Acceptance criteria reference correct standard clauses (IEC 61215-2:2021 section 4.16)

### Common Pitfalls
- **Do not** use simple beam deflection formulas alone for framed modules — they dramatically overestimate deflection; use plate theory with frame stiffness correction.
- **Do not** confuse static load (MQT 16, sustained pressure) with dynamic load (IEC TS 62782, cyclic loading) — they have different load amplitudes, durations, and cycle counts.
- **Do not** omit the rear (negative) load phase — wind suction loads are critical for adhesive-mounted and frameless modules.
- **Do not** assume all cell technologies have the same fracture stress — thinner cells (< 160 um) and half-cut cells have different cracking thresholds.
- **Do not** skip pre-load EL baseline imaging — without it, post-load crack analysis is meaningless.
- **Do not** apply snow load (5400 Pa) unless the module is specifically rated for heavy snow regions.

### Example Interaction Patterns
**Pattern 1 — Static Load Protocol:**
User: "Generate a static load test protocol for a frameless glass-glass module, 2100 x 1050 mm, 3.2 mm front glass, 2.0 mm rear glass, clamp mounting."
→ Identify that frameless modules require special attention to deflection limits. Use plate theory for glass-glass laminate. Specify clamp positions and calculate stress concentrations at clamp points. Note that frameless modules may show higher deflection than framed equivalents.

**Pattern 2 — Dynamic Load Assessment:**
User: "How many dynamic load cycles should I run for a module destined for a high-wind coastal installation?"
→ Recommend IEC TS 62782 with extended cycling (up to 10,000 cycles at +/-1000 Pa). Discuss cycle frequency (1-3 per minute), inspection intervals at 1000, 5000, and 10,000 cycles, and the importance of EL imaging at each interval to track crack propagation.

**Pattern 3 — Post-Load Failure Analysis:**
User: "My module lost 7% power after mechanical load testing. EL shows diagonal cracks near mounting points. What happened?"
→ Analyze stress concentration at mounting points. Check if mounting configuration matches manufacturer specification. Assess whether load exceeded rated capacity. Classify cracks per IEC TS 60904-13 and correlate crack pattern with power loss. Recommend re-testing with correct mounting or evaluating alternative mounting configurations.

## Capabilities

### 1. Static Load Test Protocol (IEC 61215 MQT 16)
Generate static mechanical load test procedures:
- Standard front load: 2400 Pa (positive pressure — wind/snow)
- Standard rear load: 2400 Pa (negative pressure — wind suction)
- Enhanced snow load: 5400 Pa front (heavy snow regions)
- Three 1-hour cycles per face (front and rear)
- Uniform pressure application via airbag or dead weight

### 2. Dynamic Load Test Protocol (IEC TS 62782)
Cyclic mechanical load testing:
- Cyclic load amplitude: ±1000 Pa (standard)
- Number of cycles: 1000 (standard), up to 10,000 (extended)
- Cycle frequency: 1-3 cycles per minute
- Load application via pneumatic actuator or suction cup array

### 3. Deflection Analysis
Predict panel deflection under load:
- Simply-supported beam model for frameless modules
- Frame-supported panel model with multiple support points
- Glass deflection calculation using plate theory
- Maximum deflection limits and safety factors

### 4. Stress Distribution Modeling
Analyze mechanical stress on cells and interconnects:
- Cell bending stress calculation
- Interconnect strain from module flex
- Frame stress concentration at mounting points
- Backsheet/glass stress distribution maps

### 5. Cell Cracking Detection
EL imaging-based crack identification:
- Pre-load and post-load EL comparison
- Crack classification per IEC TS 60904-13
- Crack density mapping and power impact estimation
- Statistical analysis of crack initiation locations

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `front_load` | float | Yes | Front (positive) static load in Pa (default: 2400) |
| `rear_load` | float | Yes | Rear (negative) static load in Pa (default: 2400) |
| `num_cycles` | int | No | Number of dynamic load cycles (default: 1000) |
| `load_duration` | float | No | Static load hold duration in hours (default: 1) |
| `module_dimensions` | object | Yes | Length x Width x Depth in mm |
| `frame_type` | string | No | Frame: "aluminum-35mm", "aluminum-40mm", "steel", "frameless" |
| `mounting_type` | string | No | Mounting: "4-point", "2-rail", "clamp", "adhesive" |
| `cell_type` | string | No | Cell technology: "mono-PERC", "HJT", "TOPCon", "mc-Si" |
| `cell_thickness` | float | No | Cell thickness in μm (default: 170) |
| `glass_thickness` | float | No | Front glass thickness in mm (default: 3.2) |
| `module_power` | float | No | Nameplate power at STC in watts |
| `num_cells` | int | No | Number of cells in module |
| `snow_rated` | bool | No | Whether module is rated for heavy snow loads (default: false) |

## Tool Definitions

### Tool: generate_static_load_protocol

Generate the static mechanical load test protocol per IEC 61215 MQT 16.

**Parameters:**
- `front_load` (float, required) — Front load in Pa
- `rear_load` (float, required) — Rear load in Pa
- `module_dimensions` (object, required) — L x W x D in mm
- `frame_type` (string, optional) — Frame type
- `snow_rated` (bool, optional) — Snow rating flag

**Returns:** Complete static load test protocol with setup, procedure, and acceptance criteria.

### Tool: generate_dynamic_load_protocol

Generate the dynamic mechanical load test protocol per IEC TS 62782.

**Parameters:**
- `load_amplitude` (float, required) — Cyclic load amplitude in Pa
- `num_cycles` (int, required) — Number of load cycles
- `module_dimensions` (object, required) — L x W x D in mm
- `cycle_frequency` (float, optional) — Cycles per minute (default: 2)

**Returns:** Dynamic load protocol with cycle parameters, inspection intervals, and acceptance criteria.

### Tool: calculate_deflection

Calculate panel deflection under uniform pressure load.

**Parameters:**
- `load` (float, required) — Applied pressure in Pa
- `module_length` (float, required) — Span length in mm
- `module_width` (float, required) — Module width in mm
- `glass_thickness` (float, required) — Glass thickness in mm
- `frame_type` (string, optional) — Frame and support type
- `support_config` (string, optional) — "simply-supported", "4-clamp", "2-rail"

**Returns:** Maximum deflection, deflection-to-span ratio, and stress values.

### Tool: cell_crack_analysis

Analyze EL images for load-induced cell cracking.

**Parameters:**
- `el_image_before` (string, optional) — Path to pre-load EL image
- `el_image_after` (string, optional) — Path to post-load EL image
- `cell_type` (string, required) — Cell technology type
- `cell_thickness` (float, optional) — Cell thickness in μm

**Returns:** Crack count, classification, location map, and estimated power impact.

## Example Usage

### Static Load Test for Snow-Rated Module

```
Prompt: "Generate a static mechanical load test protocol for a snow-rated
PV module: 2m × 1m, 72-cell mono-PERC, aluminum frame (40mm), 5400 Pa
front / 2400 Pa rear. Include deflection calculation and EL inspection."
```

**Expected output:**

#### Module Under Test

| Specification | Value |
|---------------|-------|
| Technology | Mono-PERC (c-Si) |
| Power (STC) | 400 W |
| Dimensions | 2000 × 1000 × 35 mm |
| Module area | 2.0 m² |
| Weight | 22.5 kg |
| Frame | Aluminum alloy 6063-T5, 40 mm height |
| Glass | 3.2 mm low-iron tempered |
| Cells | 72 (6×12), 166mm M6 mono-PERC |
| Cell thickness | 170 μm |
| Backsheet | TPT (Tedlar-PET-Tedlar) |

#### Test Configuration

**Mounting setup:**
- Module mounted horizontally on rigid test frame
- 4-point support at frame mounting holes (per manufacturer spec)
- Support span: long side = 1800 mm, short side = 800 mm
- Load application: uniform pressure via air bag (inflatable membrane)
- Pressure measurement: calibrated manometer, accuracy ±2%

**Load levels:**

| Test Phase | Direction | Load (Pa) | Duration | Cycles |
|------------|-----------|-----------|----------|--------|
| Phase 1 — Front | Positive (front) | +5400 Pa | 1 hour | 3 |
| Phase 2 — Rear | Negative (rear) | -2400 Pa | 1 hour | 3 |
| Phase 3 — Front (uniform) | Positive | +2400 Pa | 1 hour | 3 |

**Note:** 5400 Pa corresponds to a snow load of approximately 550 kg/m² (5.5 kN/m²).

#### Deflection Calculation

**Simply-supported panel deflection formula:**

```
δ_max = (q × L⁴) / (384 × E × I)
```

Where:
- q = distributed load per unit length (N/mm)
- L = span length (mm)
- E = elastic modulus of glass (GPa)
- I = second moment of area (mm⁴)

**Glass properties:**
- E_glass = 70 GPa = 70,000 MPa
- Glass thickness t = 3.2 mm
- Width b = 1000 mm

**Second moment of area (rectangular cross-section):**
```
I = b × t³ / 12 = 1000 × (3.2)³ / 12 = 1000 × 32.768 / 12 = 2730.7 mm⁴
```

**Distributed load (5400 Pa over 1000 mm width):**
```
q = 5400 Pa × 1.0 m = 5400 N/m = 5.4 N/mm
```

**Maximum deflection at 5400 Pa (using support span L = 1800 mm):**
```
δ_max = (5.4 × 1800⁴) / (384 × 70,000 × 2730.7)
      = (5.4 × 1.050 × 10¹³) / (384 × 70,000 × 2730.7)
      = 5.670 × 10¹³ / (7.340 × 10¹⁰)
      = 772.5 mm
```

**Note:** The above simple beam calculation significantly overestimates deflection because it ignores:
1. Plate stiffness (2D bending resistance)
2. Frame contribution to structural rigidity
3. Encapsulant laminate composite stiffness

**Corrected plate model (Kirchhoff thin plate, simply-supported edges):**
```
δ_max = α × q × a⁴ / D

Where:
- α = coefficient depending on aspect ratio (a/b)
- a = long span = 1800 mm
- b = short span = 800 mm
- D = E × t³ / [12 × (1-ν²)] = 70000 × 3.2³ / [12 × (1-0.22²)]
- D = 70000 × 32.768 / 11.42 = 200,900 N·mm
- ν = 0.22 (Poisson's ratio for glass)
- a/b = 1800/800 = 2.25 → α ≈ 0.0133 (from plate theory tables)
```

```
δ_max = 0.0133 × 0.0054 × 1800⁴ / 200,900
      = 0.0133 × 0.0054 × 1.050 × 10¹³ / 200,900
      = 7.54 × 10⁸ / 200,900
      = 3,752 mm
```

**With frame stiffness included (40mm aluminum frame, I_frame ≈ 85,000 mm⁴):**

The aluminum frame dramatically increases bending stiffness. Effective composite panel stiffness reduces deflection to approximately:

```
δ_max ≈ 15-25 mm (typical for framed module at 5400 Pa)
Deflection ratio: δ/L = 22/1800 = 1/82 (acceptable, limit is typically L/60)
```

#### Cell Stress Analysis

**Bending stress on cells:**
```
σ_cell = E_Si × t_cell × κ / 2

Where:
- E_Si = 130 GPa (silicon elastic modulus, <100> direction)
- t_cell = 170 μm = 0.17 mm
- κ = curvature = 8 × δ_max / L² (for uniform load)
- κ = 8 × 22 / 1800² = 5.43 × 10⁻⁵ mm⁻¹

σ_cell = 130,000 × 0.17 × 5.43 × 10⁻⁵ / 2
       = 0.60 MPa
```

**Silicon fracture stress:** ~120-200 MPa (depending on edge defects)
**Safety factor:** 200/0.60 = 333 — **adequate margin**

#### EL Imaging Inspection

**Inspection schedule:**

| Stage | Timing | Purpose |
|-------|--------|---------|
| EL-1 | Before any loading | Baseline crack map |
| EL-2 | After Phase 1 (5400 Pa front) | Detect front-side stress cracks |
| EL-3 | After Phase 2 (2400 Pa rear) | Detect rear-side stress cracks |
| EL-4 | After all phases complete | Final crack assessment |

**EL settings:**
- Forward bias current: Isc = 10.8 A
- Exposure time: 5-15 seconds
- Camera: cooled Si-CCD, resolution ≥ 100 μm/pixel

**Typical crack patterns after mechanical load:**
- Cell edge cracks (most common) — originate from laser-cut edges
- Diagonal cracks from mounting point stress concentration
- Multi-busbar cells show less power loss per crack than 3BB/5BB

**Crack classification (IEC TS 60904-13):**
- Class A: Crack with no inactive area — acceptable
- Class B: Crack with <2% inactive area per cell — acceptable for qualification
- Class C: Crack with >2% inactive area — rejectable if power loss >5%

#### Test Procedure (Step-by-Step)

1. **Pre-test characterization:**
   - Visual inspection per MQT 01
   - STC power measurement (Pmax, Isc, Voc, FF)
   - EL imaging (baseline)
   - Record mounting bolt torque values

2. **Phase 1 — Front load (5400 Pa):**
   - Apply positive pressure uniformly to front surface
   - Increase pressure at ≤200 Pa/s to 5400 Pa
   - Hold at 5400 Pa ± 100 Pa for 1 hour
   - Release pressure at ≤200 Pa/s
   - Repeat for 3 cycles
   - Perform visual inspection between cycles

3. **Phase 2 — Rear load (2400 Pa):**
   - Apply negative pressure uniformly to rear surface
   - Hold at -2400 Pa ± 100 Pa for 1 hour, 3 cycles
   - Visually inspect between cycles

4. **Phase 3 — Front standard load (2400 Pa):**
   - Apply +2400 Pa for 1 hour, 3 cycles

5. **Post-test characterization:**
   - Visual inspection (check for glass cracks, frame distortion, delamination)
   - STC power measurement
   - EL imaging (compare to baseline)
   - Wet leakage current test
   - Insulation resistance test

#### Acceptance Criteria (IEC 61215-2:2021 §4.16)

1. **Power degradation:** ≤ 5% from pre-test stabilized value
2. **Visual inspection:** No major visible defects:
   - No cracked, broken, or deformed glass
   - No frame distortion or separation
   - No delamination or bubble formation
   - No backsheet cracking or tearing
3. **EL imaging:** No new Class C cracks (power-affecting fractures)
4. **Wet leakage current:** Must pass post-test (MQT 15)
5. **Insulation resistance:** Must pass post-test (MQT 03)
6. **Mechanical integrity:** Frame mounting points undamaged, no permanent deflection

## Output Format

The skill produces:
- **Static load protocol** — Setup, load levels, cycle schedule, and procedure
- **Dynamic load protocol** — Cyclic parameters, actuator requirements, inspection intervals
- **Deflection analysis** — Calculated deflection, stress values, safety factors
- **EL comparison report** — Before/after crack maps, classification, power impact
- **Stress distribution map** — Cell and frame stress visualization
- **Acceptance summary** — Pass/fail determination per IEC 61215

## Standards & References

- IEC 61215-2:2021 — Terrestrial PV modules — Design qualification — Part 2: Test procedures, §4.16 (MQT 16)
- IEC 61215-2:2021 — §4.17 (MQT 17 — Hail test, complementary)
- IEC TS 62782:2016 — Dynamic mechanical load testing for PV modules
- IEC TS 60904-13 — Electroluminescence of PV devices — Crack classification
- IEC 61215-2:2021 — §4.13 (MQT 13 — Static load for Group C)
- EN 1991-1-3 — Eurocode 1: Snow loads on structures
- EN 1991-1-4 — Eurocode 1: Wind loads on structures
- Sander, M. et al., "Systematic investigation of cracks in encapsulated solar cells after mechanical loading," Solar Energy Materials & Solar Cells, 2013

## Related Skills

- `iec-61215-protocol` — Complete IEC 61215 test sequence including mechanical load
- `thermal-cycling` — Thermal stress testing (often reveals load-induced micro-cracks)
- `el-imaging` — Electroluminescence imaging for crack detection and classification
- `pv-module-flash-testing` — STC power measurement for pre/post load comparison
- `iec-61730-safety` — Safety qualification includes mechanical integrity requirements
