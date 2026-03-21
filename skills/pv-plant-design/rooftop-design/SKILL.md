---
name: rooftop-design
version: 1.0.0
description: Rooftop PV system design and layout — module placement, structural assessment, shading avoidance, and system sizing for commercial and residential rooftops.
author: SuryaPrajna Contributors
license: MIT
tags:
  - rooftop
  - system-design
  - layout
  - residential
  - commercial
dependencies:
  python:
    - pvlib>=0.11.0
    - numpy>=1.24
    - pandas>=2.0
    - matplotlib>=3.7
    - shapely>=2.0
  data:
    - Roof dimensions and orientation
    - Structural load capacity (optional)
    - Shading obstruction survey (optional)
pack: pv-plant-design
agent: Vinyasa-Agent
---

# rooftop-design

Rooftop PV system design and layout for commercial and residential buildings. Handles module placement optimization, structural load assessment, shading avoidance from parapets and rooftop obstructions, setback compliance, and system sizing to match load profiles or net metering limits.

## LLM Instructions

### Role Definition
You are a **rooftop solar design engineer** with expertise in commercial and residential PV system layout, structural assessment, and electrical design. You optimize module placement on complex roof geometries while respecting fire codes, structural limits, shading constraints, and electrical regulations.

### Thinking Process
1. **Assess roof** — Dimensions, orientation, tilt (flat/sloped), material, structural capacity
2. **Identify constraints** — Parapets, HVAC units, vents, skylights, fire code setbacks, access pathways
3. **Calculate usable area** — Subtract setbacks, obstructions, access paths, and shading zones
4. **Select mounting** — Ballasted, attached, flush-mount (sloped roof), tilt frames (flat roof)
5. **Place modules** — Optimize placement for maximum capacity within usable area
6. **Size system** — Match to load profile, net metering limit, or maximum capacity
7. **Check structural loads** — Dead load (modules + mounting) vs. roof capacity
8. **Design electrical** — String sizing, inverter selection, AC connection point

### Output Format
- Start with **roof summary**: dimensions, area, orientation, tilt, type
- Provide **design layout**: module count, rows, orientation (portrait/landscape)
- Include **system sizing table**: DC capacity, module count, inverter(s), DC/AC ratio
- Show **area utilization**: gross area, usable area, covered area, utilization %
- Present **structural assessment**: added dead load (kg/m²) vs. capacity
- Include **setback compliance**: fire code, parapet shading, access pathway
- Report **estimated yield**: annual energy (kWh), specific yield, self-consumption ratio

### Quality Criteria
- [ ] Module placement respects all setbacks (fire code, parapet shading, access paths)
- [ ] Added structural load is within roof capacity (typically 15-25 kg/m² for modules + mounting)
- [ ] Tilt angle for flat roof ballasted systems accounts for wind uplift
- [ ] System size matches customer requirement (load offset, net metering limit, or maximum)
- [ ] No modules in shaded zones from parapets, HVAC, or adjacent buildings
- [ ] Electrical design is code-compliant (NEC, IEC, or local standards)

### Common Pitfalls
- **Do not** ignore parapet shading — parapets cast shadows especially at low sun angles
- **Do not** exceed structural load capacity — always verify with structural engineer
- **Do not** forget fire code setbacks (IFC/NEC: ridge, hip, valley, perimeter setbacks)
- **Do not** design without maintenance access pathways (minimum 0.6-1.0m)
- **Do not** ignore wind uplift for ballasted systems — ballast weight must resist design wind speed
- **Do not** assume all roof area is usable — typical utilization is 60-80%

## Capabilities

### 1. Roof Area Assessment
Calculate usable area from gross roof dimensions after subtracting setbacks, obstructions, shading zones, and access pathways.

### 2. Module Placement Optimization
Optimize module placement in portrait or landscape orientation, with or without tilt frames, to maximize capacity within usable area.

### 3. Structural Load Check
Calculate added dead load (modules + mounting + ballast) and compare against typical roof structural capacities.

### 4. Parapet & Obstruction Shading
Calculate shading zones from parapets, HVAC equipment, and rooftop obstructions using sun angle analysis.

### 5. System Sizing
Size the system to match load profile (self-consumption optimization), net metering limits, or maximum roof capacity.

### 6. Flat Roof Tilt Optimization
Optimize tilt angle and row spacing for flat roof installations, balancing yield gain vs. inter-row shading and wind loads.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `roof_length_m` | float | Yes | Roof length in meters |
| `roof_width_m` | float | Yes | Roof width in meters |
| `roof_orientation` | float | No | Roof azimuth in degrees (default: 180) |
| `roof_tilt` | float | No | Roof slope in degrees (default: 0 for flat) |
| `latitude` | float | Yes | Site latitude |
| `parapet_height_m` | float | No | Parapet height in meters (default: 0) |
| `obstructions` | list | No | List of obstruction locations and dimensions |
| `module_power_w` | float | Yes | Module rated power in watts |
| `module_length_m` | float | Yes | Module length in meters |
| `module_width_m` | float | Yes | Module width in meters |
| `mounting_type` | string | No | "flush", "tilt_frame", "ballasted" (default: "ballasted" for flat) |
| `tilt` | float | No | Module tilt for flat roofs in degrees (default: 10) |
| `fire_code` | string | No | Fire code standard: "ifc_2018", "nec_2020", "none" (default: "ifc_2018") |
| `max_capacity_kwp` | float | No | Maximum system size limit (net metering, sanctioned load) |
| `structural_capacity_kgm2` | float | No | Roof structural capacity for additional dead load in kg/m² |

## Example Usage

### Commercial Rooftop Design

```
Prompt: "Design a rooftop solar system for a 50m x 30m flat commercial roof
in Chennai (latitude 13.08). 1m parapets on all sides. Target maximum
capacity using 550W modules (2278mm x 1134mm). Ballasted mounting at 10° tilt."
```

### Example Code

```python
import numpy as np

# Roof parameters
roof_length = 50  # m
roof_width = 30  # m
roof_area = roof_length * roof_width  # 1500 m²
parapet_height = 1.0  # m
latitude = 13.08

# Module parameters
module_length = 2.278  # m
module_width = 1.134  # m
module_power = 550  # W
tilt = 10  # degrees

# Setbacks
fire_setback = 1.8  # m from edge (IFC)
parapet_shade_dist = parapet_height / np.tan(np.radians(20))  # shade at 20° sun elevation
effective_setback = max(fire_setback, parapet_shade_dist)

# Usable area
usable_length = roof_length - 2 * effective_setback
usable_width = roof_width - 2 * effective_setback
access_path = 1.0  # m between every 2 rows

# Module placement (landscape, tilted)
collector_width = module_length * np.sin(np.radians(tilt)) + module_length * np.cos(np.radians(tilt))
row_pitch = module_length * np.cos(np.radians(tilt)) + module_length * np.sin(np.radians(tilt)) / np.tan(np.radians(25))

n_rows = int(usable_width / (row_pitch + access_path / 2))
modules_per_row = int(usable_length / module_width)
total_modules = n_rows * modules_per_row

capacity_kwp = total_modules * module_power / 1000

# Structural load
module_weight = 28  # kg per module
mounting_weight = 8  # kg per module (ballast + frame)
dead_load = (module_weight + mounting_weight) * total_modules / (usable_length * usable_width)

print(f"Usable area: {usable_length * usable_width:.0f} m²")
print(f"Total modules: {total_modules}")
print(f"DC Capacity: {capacity_kwp:.1f} kWp")
print(f"Added dead load: {dead_load:.1f} kg/m²")
```

## Output Format

The skill produces:
- **Roof assessment**: Gross area, usable area, setbacks, obstructions
- **Module layout**: Rows, modules per row, orientation, total count
- **System sizing**: DC capacity, inverter selection, DC/AC ratio
- **Structural check**: Added load (kg/m²) vs. capacity
- **Area utilization**: Percentage of roof covered
- **Yield estimate**: Annual energy, specific yield, savings estimate
- **Layout diagram**: Top-down module placement with setbacks marked

## Standards & References

- IFC 2018: International Fire Code — rooftop solar setbacks
- NEC 2020 Article 690: Solar PV systems
- IEC 62548: Design requirements for PV arrays
- IS 875 (Part 3): Wind loads for structural design
- MNRE rooftop solar guidelines (India)

## Related Skills

- `array-layout` — Ground-mount layout design
- `shading-analysis` — Detailed shading from parapets and obstructions
- `string-sizing` — String and inverter configuration
- `cable-sizing` — Cable routing for rooftop systems
