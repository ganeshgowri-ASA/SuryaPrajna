---
name: thermal-cycling
version: 1.0.0
description: Generate thermal cycling test protocols (TC200/TC400/TC600) per IEC 61215 MQT 11, including cycle profile design, solder joint fatigue modeling with Coffin-Manson equations, current injection parameters, and EL imaging inspection intervals.
author: SuryaPrajna Contributors
license: MIT
tags:
  - thermal-cycling
  - iec-61215
  - reliability
  - testing
  - solder-fatigue
  - coffin-manson
  - photovoltaic
dependencies:
  python:
    - pandas>=2.0
    - numpy>=1.24
    - matplotlib>=3.7
    - scipy>=1.10
  data:
    - Module datasheet (power, cell type, dimensions)
    - Solder alloy specification
    - EL baseline images
pack: pv-testing
agent: Pariksha-Agent
---

# thermal-cycling

Generate comprehensive thermal cycling test protocols for PV module qualification per IEC 61215-2:2021 MQT 11. Covers standard TC200, extended TC400/TC600 (IEC TS 63209-1), cycle profile design, solder joint fatigue modeling using Coffin-Manson relationships, current injection requirements, intermediate inspection schedules, and acceptance criteria.

## Capabilities

### 1. Cycle Profile Design
Generate optimized thermal cycle profiles:
- Temperature range: -40°C to +85°C (standard) or custom
- Ramp rate control: minimum 100°C/h, maximum 200°C/h
- Dwell time optimization: minimum 10 minutes at extremes
- Total cycle duration calculation
- Chamber loading and airflow requirements

### 2. Solder Joint Fatigue Modeling
Predict interconnect reliability using thermal fatigue models:
- Coffin-Manson equation: Nf = C × (ΔT)^(-n)
- Strain energy density approach for lead-free solders
- CTE mismatch stress calculation between cell and ribbon
- Acceleration factor computation for field correlation

### 3. Current Injection Protocol
Define forward-bias current injection during cycling:
- Current level: Imp at STC
- Injection timing during hot dwell phase
- Power supply requirements and monitoring
- Effect on solder joint degradation acceleration

### 4. Inspection Schedule and Criteria
Plan intermediate and final inspections:
- EL imaging at TC50, TC100, TC200 (and TC400, TC600 for extended)
- Visual inspection per IEC 61215-2 MQT 01
- STC power measurement at intervals
- IR thermography for hot-spot detection

### 5. Extended Stress Testing
Protocols beyond standard qualification:
- TC400 and TC600 per IEC TS 63209-1
- Combined TC + humidity freeze sequences
- Differentiated cycling for HJT, TOPCon, shingled modules
- Statistical analysis of multi-module test groups

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `num_cycles` | int | Yes | Number of thermal cycles: 200, 400, or 600 |
| `temp_low` | float | No | Lower temperature extreme in °C (default: -40) |
| `temp_high` | float | No | Upper temperature extreme in °C (default: +85) |
| `ramp_rate` | float | No | Temperature ramp rate in °C/h (default: 100, max: 200) |
| `dwell_time` | float | No | Minimum dwell time at extremes in minutes (default: 10) |
| `current_injection` | bool | No | Enable forward-bias current injection (default: true) |
| `module_power` | float | Yes | Nameplate power at STC in watts |
| `cell_type` | string | Yes | Cell technology: "mono-PERC", "HJT", "TOPCon", "mc-Si", "shingled" |
| `module_dimensions` | object | No | Length x Width x Depth in mm |
| `num_cells` | int | No | Number of cells in module |
| `solder_type` | string | No | Solder alloy: "SnPb", "SAC305", "SnBi", "ECA" (default: "SAC305") |
| `ribbon_width` | float | No | Interconnect ribbon width in mm |
| `inspection_intervals` | list | No | Cycle counts for intermediate inspections |

## Tool Definitions

### Tool: generate_tc_protocol

Generate the complete thermal cycling test protocol.

**Parameters:**
- `num_cycles` (int, required) — Target number of cycles (200/400/600)
- `temp_low` (float, optional) — Lower temperature in °C
- `temp_high` (float, optional) — Upper temperature in °C
- `module_power` (float, required) — STC power in watts
- `cell_type` (string, required) — Cell technology type

**Returns:** Complete TC protocol with cycle profile, current injection, inspection schedule, and acceptance criteria.

### Tool: calculate_cycle_profile

Compute detailed cycle timing and chamber requirements.

**Parameters:**
- `temp_low` (float, required) — Lower temperature in °C
- `temp_high` (float, required) — Upper temperature in °C
- `ramp_rate` (float, required) — Ramp rate in °C/h
- `dwell_time` (float, required) — Dwell time at extremes in minutes
- `num_modules` (int, optional) — Number of modules in chamber (affects thermal mass)

**Returns:** Cycle timing breakdown, total test duration, and chamber specifications.

### Tool: solder_fatigue_model

Predict solder joint fatigue life using Coffin-Manson relationship.

**Parameters:**
- `delta_T` (float, required) — Temperature swing in °C
- `solder_type` (string, required) — Solder alloy type
- `cell_type` (string, optional) — Cell technology for CTE data
- `ribbon_width` (float, optional) — Ribbon width in mm

**Returns:** Predicted cycles to failure, acceleration factor, and field life estimate.

### Tool: el_inspection_analysis

Define EL imaging inspection parameters and crack classification.

**Parameters:**
- `num_cycles` (int, required) — Total test cycles
- `cell_type` (string, required) — Cell technology type
- `module_power` (float, required) — Module power for current setting

**Returns:** EL inspection schedule, camera settings, crack classification criteria (A/B/C per IEC TS 60904-13).

## Example Usage

### TC200 Protocol for 400W Mono-PERC Module

```
Prompt: "Generate a TC200 thermal cycling protocol for a 400W mono-PERC
module with SAC305 solder joints, including cycle profile, solder fatigue
analysis, and EL inspection schedule."
```

**Expected output:**

#### Module Under Test

| Specification | Value |
|---------------|-------|
| Technology | Mono-PERC (c-Si) |
| Power (STC) | 400 W |
| Imp | 10.25 A |
| Vmp | 39.0 V |
| Cell type | 182mm M10 mono-PERC |
| Num cells | 108 (half-cut) |
| Solder alloy | SAC305 (Sn96.5Ag3.0Cu0.5) |
| Ribbon | 0.3mm × 1.0mm Cu, Sn-coated |
| Module dimensions | 1722 × 1134 × 30 mm |

#### Cycle Profile

**Temperature profile parameters:**
- Temperature range: -40°C to +85°C (ΔT = 125°C)
- Ramp rate: 100°C/h (1.67°C/min)
- Dwell at -40°C: 10 minutes minimum
- Dwell at +85°C: 10 minutes minimum
- Current injection: Imp = 10.25 A during hot dwell

**Single cycle timing:**

| Phase | From | To | Duration |
|-------|------|----|----------|
| Cold ramp | +25°C | -40°C | 39 min |
| Cold dwell | -40°C | -40°C | 10 min |
| Hot ramp | -40°C | +85°C | 75 min |
| Hot dwell | +85°C | +85°C | 10 min |
| Cool ramp | +85°C | +25°C | 36 min |
| **Total cycle** | | | **~170 min (~2.83 h)** |

**Total test duration:**
- TC200: 200 × 2.83 h = **566 hours ≈ 23.6 days**
- TC400: 400 × 2.83 h = **1132 hours ≈ 47.2 days**
- TC600: 600 × 2.83 h = **1698 hours ≈ 70.8 days**

```
Temperature (°C)
  +85 ──────────╮                    ╭──────────╮
                │                    │          │
                │     Ramp 100°C/h   │          │
  +25 ─────────╯╲                  ╱╰──────────╯──
                  ╲              ╱
                   ╲           ╱
  -40 ──────────────╰─────────╯
       0    39  49          124  134        170 min
```

#### Solder Joint Fatigue Analysis (Coffin-Manson Model)

**Coffin-Manson equation:**

```
Nf = C × (ΔT)^(-n)
```

Where:
- Nf = number of cycles to failure
- C = material constant
- ΔT = temperature swing (°C)
- n = fatigue exponent

**SAC305 solder parameters:**
- C = 4.8 × 10⁴ (typical for SAC lead-free solder joints)
- n = 1.9

**Calculation:**
```
Nf = 4.8 × 10⁴ × (125)^(-1.9)
Nf = 4.8 × 10⁴ × (125)^(-1.9)
Nf = 4.8 × 10⁴ × (1 / 125^1.9)
125^1.9 = e^(1.9 × ln(125)) = e^(1.9 × 4.828) = e^(9.174) = 9654
Nf = 48000 / 9654 = 4.97 cycles ← lab accelerated failure point
```

**Note:** This extremely low Nf reflects that the Coffin-Manson model with these parameters applies to bulk solder fatigue crack initiation. For ribbon solder joints in PV modules with typical geometry, empirical data shows:

**Adjusted model (PV ribbon interconnect):**
- C = 3.5 × 10⁷ (PV-specific empirical constant)
- n = 2.0

```
Nf = 3.5 × 10⁷ × (125)^(-2.0)
Nf = 3.5 × 10⁷ / 15625
Nf ≈ 2240 cycles to failure
```

**Acceleration factor (field vs. lab):**

Field conditions (typical continental climate):
- ΔT_field ≈ 50°C (diurnal cycle)
- Cycles per year ≈ 365

```
AF = (ΔT_test / ΔT_field)^n = (125/50)^2.0 = (2.5)^2.0 = 6.25
```

**Field life prediction:**
```
Nf_field = Nf_lab × AF = 2240 × 6.25 = 14,000 field cycles
Field years = 14,000 / 365 = 38.4 years
```

**Conclusion:** TC200 (200 cycles) represents approximately 200 × 6.25 / 365 = **3.4 years** of field exposure for this solder type and temperature swing.

#### Power Degradation Expectations

| Checkpoint | Expected Pmax Loss | Accept/Reject Threshold |
|------------|-------------------|------------------------|
| TC50 | < 1.0% | ≤ 5% (IEC 61215) |
| TC100 | < 2.0% | ≤ 5% |
| TC200 | < 3.5% | **≤ 5%** |
| TC400 (ext) | < 6.0% | ≤ 8% (IEC TS 63209) |
| TC600 (ext) | < 9.0% | ≤ 10% |

#### EL Imaging Inspection Schedule

| Cycle Count | Inspection Type | Criteria |
|-------------|----------------|----------|
| TC0 (baseline) | Full EL + power | Reference image and Pmax |
| TC50 | EL forward bias | Class A/B cracks per IEC TS 60904-13 |
| TC100 | EL + visual | No Class C cracks, no delamination |
| TC200 | Full EL + power + visual | Final acceptance per IEC 61215 |
| TC400 | Full EL + power + IR | Extended stress assessment |
| TC600 | Full EL + power + IR | Extended stress final |

**EL imaging settings:**
- Forward bias current: Isc = 10.8 A
- Exposure time: 5-15 seconds (adjust for camera sensitivity)
- Camera: cooled Si-CCD or InGaAs, resolution ≥ 100 μm/pixel

#### Acceptance Criteria (IEC 61215-2:2021 §4.11)

1. **Power degradation:** ≤ 5% from pre-test stabilized value
2. **Visual inspection:** No major defects per MQT 01 (no broken cells, delamination, open circuits, ground faults, broken interconnects)
3. **Wet leakage current:** Must pass MQT 15 post-test
4. **EL imaging:** No new Class C cracks (complete cell fractures with inactive areas)
5. **Insulation:** Must pass dry insulation test post-TC

## Output Format

The skill produces:
- **Cycle profile document** — Temperature-time profile with ramp rates, dwell times, and cycle duration
- **Current injection specification** — Power supply requirements and injection timing
- **Fatigue analysis report** — Coffin-Manson modeling with field life prediction
- **Inspection schedule** — EL, visual, and power measurement timing
- **Power degradation tracking** — Expected vs. measured power loss at each checkpoint
- **Acceptance criteria summary** — Pass/fail thresholds per IEC 61215

## Standards & References

- IEC 61215-2:2021 — Terrestrial PV modules — Design qualification — Part 2: Test procedures, §4.11 (MQT 11)
- IEC TS 63209-1:2021 — Extended-stress testing of PV modules — Part 1: Modules
- IEC TS 60904-13 — Electroluminescence of PV devices — Part 13: Crack classification
- IEC 60068-2-14 — Environmental testing — Change of temperature
- ASTM E1171 — Standard Test Method for Photovoltaic Modules in Cyclic Temperature Environments
- Bosco, N. et al., "Accelerated Testing of PV Module Solder Joints," PVSC 2018

## Related Skills

- `iec-61215-protocol` — Complete IEC 61215 test sequence including TC test
- `damp-heat-testing` — Complementary humidity stress test (DH1000)
- `el-imaging` — Electroluminescence image interpretation and crack classification
- `pv-module-flash-testing` — STC power measurement for pre/post TC comparison
- `uv-preconditioning` — UV exposure test often preceding TC in test sequence
