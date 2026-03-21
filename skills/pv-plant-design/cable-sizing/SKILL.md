---
name: cable-sizing
version: 1.0.0
description: PV cable sizing, voltage drop calculation, and routing — select DC and AC cable sizes based on current capacity, voltage drop limits, and installation conditions per IEC/NEC standards.
author: SuryaPrajna Contributors
license: MIT
tags:
  - cable-sizing
  - voltage-drop
  - electrical-design
  - dc-cable
  - ac-cable
dependencies:
  python:
    - numpy>=1.24
    - pandas>=2.0
  data:
    - System electrical design (string sizing, inverter selection)
    - Cable manufacturer datasheets
    - Installation conditions (temperature, grouping, conduit type)
pack: pv-plant-design
agent: Vinyasa-Agent
---

# cable-sizing

PV cable sizing, voltage drop calculation, and routing design for DC string cables, DC main cables, and AC cables. Selects cable cross-sections based on current-carrying capacity (ampacity), voltage drop limits, and short-circuit ratings, accounting for installation conditions per IEC 60364 or NEC standards.

## LLM Instructions

### Role Definition
You are a **PV electrical design engineer** specializing in cable sizing, voltage drop analysis, and power cable installation. You select cables that are safe (adequate ampacity with derating), efficient (within voltage drop limits), and cost-effective. You understand derating factors for temperature, grouping, and installation method.

### Thinking Process
1. **Determine design current** — Isc x 1.25 for DC strings (NEC) or Isc x 1.25 x 1.25 (NEC with continuous load)
2. **Apply derating factors** — Temperature, grouping, installation method (conduit, tray, direct burial)
3. **Select cable size** — Minimum cross-section for derated ampacity ≥ design current
4. **Check voltage drop** — Calculate voltage drop at design current; must be < limit (typically 1-2% for DC, 2-3% for AC)
5. **Verify short-circuit rating** — Cable must withstand prospective fault current for clearing time
6. **Select cable type** — UV-resistant for outdoor DC, XLPE/PVC for AC, armored if required
7. **Optimize routing** — Minimize cable lengths, balance voltage drop across strings

### Output Format
- Start with **cable schedule table**: cable ID, from-to, type, size (mm²), length (m), current (A), voltage drop (V, %)
- Provide **derating factor table**: temperature, grouping, installation factors
- Include **voltage drop calculation** for each cable segment
- Show **total system voltage drop**: DC + AC as percentage
- Present **cable specification**: type, insulation, voltage rating, conductor material
- Flag **warnings**: oversized cables, excessive voltage drop, thermal concerns

### Quality Criteria
- [ ] Design current uses appropriate safety factors (Isc x 1.25 minimum)
- [ ] Derating factors are correctly applied for actual installation conditions
- [ ] Voltage drop is within limits: DC string < 1%, DC main < 1%, AC < 2%
- [ ] Total voltage drop (DC + AC) < 3-5% from array to meter
- [ ] Cable insulation temperature rating matches installation environment
- [ ] Short-circuit withstand capacity exceeds prospective fault current
- [ ] Cable type is appropriate for installation (UV-resistant outdoor, fire-rated indoor)

### Common Pitfalls
- **Do not** size cables on ampacity alone — voltage drop often governs for long runs
- **Do not** forget temperature derating — cables in hot climates or roof-mounted need significant derating
- **Do not** use non-UV-resistant cables for outdoor DC runs
- **Do not** ignore grouping derating — multiple cables in same conduit/tray reduce ampacity
- **Do not** forget that DC cables must be rated for 1500V (or 1000V) system voltage
- **Do not** use copper cable costs without comparing aluminum for large AC cables

## Capabilities

### 1. DC String Cable Sizing
Size PV string cables (module to string combiner/inverter) based on Isc, cable length, and voltage drop limits.

### 2. DC Main Cable Sizing
Size DC main cables (combiner box to inverter) for aggregated string currents with appropriate derating.

### 3. AC Cable Sizing
Size LT and HT AC cables from inverter to transformer and transformer to grid connection point.

### 4. Voltage Drop Analysis
Calculate voltage drop for each cable segment and total system voltage drop, ensuring compliance with design limits.

### 5. Derating Factor Calculation
Apply cable ampacity derating factors for: ambient temperature, soil temperature (buried), grouping/bundling, installation method, and solar radiation exposure.

### 6. Cable Bill of Quantities
Generate cable schedule with quantities, lengths, and specifications for procurement.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `system_voltage_dc` | float | Yes | DC system voltage in volts |
| `isc_string` | float | Yes | String short-circuit current in amps |
| `imp_string` | float | Yes | String maximum power current in amps |
| `n_strings` | int | Yes | Number of parallel strings |
| `string_cable_length_m` | float | Yes | Average string cable length in meters |
| `dc_main_cable_length_m` | float | No | DC main cable length in meters |
| `ac_voltage` | float | No | AC voltage in volts (default: 415) |
| `ac_current` | float | No | AC rated current in amps |
| `ac_cable_length_m` | float | No | AC cable length in meters |
| `ambient_temp_c` | float | No | Maximum ambient temperature in °C (default: 45) |
| `installation_method` | string | No | "conduit", "tray", "direct_burial", "free_air" (default: "tray") |
| `conductor` | string | No | "copper" or "aluminum" (default: "copper") |
| `vdrop_limit_dc` | float | No | DC voltage drop limit in % (default: 2.0) |
| `vdrop_limit_ac` | float | No | AC voltage drop limit in % (default: 2.0) |
| `standard` | string | No | "iec" or "nec" (default: "iec") |

## Example Usage

### DC and AC Cable Sizing

```
Prompt: "Size cables for a 1 MWp PV plant: 40 strings of Isc=18.4A at
1500V DC, average string cable run 80m, DC main 50m to inverter, AC cable
100m from inverter (800V, 720A) to transformer. Ambient 45°C, cables in
perforated tray."
```

### Example Code

```python
import numpy as np

# --- DC String Cable Sizing ---
Isc = 18.4  # A
design_current_dc = Isc * 1.25  # 23.0 A (NEC safety factor)

# Derating factors
temp_derating = 0.87  # 45°C ambient, 90°C rated insulation
grouping_derating = 0.80  # Multiple cables in tray
total_derating = temp_derating * grouping_derating

required_ampacity = design_current_dc / total_derating  # 33.0 A

# Standard copper cable ampacities (IEC 60364, in tray)
cable_sizes = {
    2.5: 27, 4: 36, 6: 46, 10: 65, 16: 87, 25: 114, 35: 141,
    50: 175, 70: 222, 95: 269, 120: 312, 150: 356, 185: 407, 240: 471
}

# Select minimum cable size
for size, ampacity in cable_sizes.items():
    if ampacity >= required_ampacity:
        selected_dc_size = size
        break

# Voltage drop check
string_voltage = 38.8 * 38  # Vmp * modules_per_string = 1474.4 V
cable_length = 80  # m (one-way)
resistivity_cu = 0.0175  # ohm.mm²/m at 20°C (adjust for temp)
temp_factor = 1 + 0.00393 * (45 - 20)  # temperature correction
resistance = resistivity_cu * temp_factor * 2 * cable_length / selected_dc_size
vdrop_v = design_current_dc * resistance
vdrop_pct = vdrop_v / string_voltage * 100

print(f"DC string cable: {selected_dc_size} mm² Cu")
print(f"Required ampacity: {required_ampacity:.1f} A")
print(f"Voltage drop: {vdrop_v:.1f} V ({vdrop_pct:.2f}%)")

# --- AC Cable Sizing ---
ac_current = 720  # A
ac_voltage = 800  # V (3-phase)
ac_length = 100  # m
design_current_ac = ac_current * 1.0  # Already rated current

# For large currents, use multiple parallel cables
cables_parallel = 4  # 4 x 185mm² per phase
per_cable_current = design_current_ac / cables_parallel

ac_resistance = resistivity_cu * temp_factor * 2 * ac_length / 185
ac_vdrop_per_cable = per_cable_current * ac_resistance
ac_vdrop_total = ac_vdrop_per_cable  # Parallel cables share current
ac_vdrop_pct = ac_vdrop_total / ac_voltage * 100

print(f"\nAC cable: {cables_parallel}x 185 mm² Cu per phase")
print(f"AC voltage drop: {ac_vdrop_total:.1f} V ({ac_vdrop_pct:.2f}%)")
```

## Output Format

The skill produces:
- **Cable schedule**: Complete table with cable ID, route, size, length, type
- **Derating analysis**: Temperature, grouping, and installation derating factors
- **Voltage drop table**: Each segment with current, resistance, voltage drop (V and %)
- **Total system voltage drop**: DC + AC combined
- **Cable specification**: Insulation type, voltage rating, conductor, armor
- **Bill of quantities**: Cable lengths by type and size for procurement

## Standards & References

- IEC 60364-5-52: Selection and erection of electrical equipment — wiring systems
- IEC 60228: Conductors of insulated cables
- NEC Article 310: Conductors for general wiring (ampacity tables)
- NEC Article 690: Solar PV systems
- IS 694: PVC insulated cables (India)
- IS 7098: XLPE insulated cables (India)

## Related Skills

- `string-sizing` — String design informing cable current requirements
- `sld-generator` — SLD showing cable routes and sizes
- `array-layout` — Physical layout determining cable lengths
- `loss-tree` — Wiring losses in energy loss waterfall
