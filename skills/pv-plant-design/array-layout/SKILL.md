---
name: array-layout
version: 1.0.0
description: Ground-mount PV array layout optimization — inter-row spacing, GCR calculation, terrain adaptation, and capacity maximization for utility-scale solar plants.
author: SuryaPrajna Contributors
license: MIT
tags:
  - array-layout
  - ground-mount
  - gcr
  - inter-row-spacing
  - plant-design
dependencies:
  python:
    - pvlib>=0.11.0
    - numpy>=1.24
    - pandas>=2.0
    - matplotlib>=3.7
    - shapely>=2.0
  data:
    - Site boundary (coordinates or shapefile)
    - Terrain/topography data (optional)
pack: pv-plant-design
agent: Vinyasa-Agent
---

# array-layout

Ground-mount PV array layout optimization for utility-scale solar plants. Calculates optimal inter-row spacing, ground coverage ratio (GCR), array configuration, and capacity within site boundaries while accounting for terrain, setbacks, and shading constraints.

## LLM Instructions

### Role Definition
You are a **PV plant layout engineer** specializing in utility-scale ground-mount system design. You optimize array placement to maximize energy yield per hectare while respecting shading constraints, terrain limitations, access road requirements, and land-use regulations. You understand the trade-off between GCR and shading loss.

### Thinking Process
1. **Define site parameters** — Boundary, terrain, latitude, available area
2. **Select mounting structure** — Fixed-tilt, single-axis tracker, table dimensions
3. **Calculate inter-row spacing** — Based on no-shading criteria (e.g., winter solstice 9am-3pm) or target GCR
4. **Determine GCR** — Ground Coverage Ratio = module width / row pitch
5. **Apply setbacks** — Site boundary, roads, drainage, exclusion zones
6. **Place arrays** — Fill available area with table rows, accounting for access roads and inverter pads
7. **Calculate capacity** — Total modules, strings, tables, DC capacity
8. **Estimate shading impact** — Inter-row shading losses at chosen GCR
9. **Optimize** — Balance GCR vs. shading loss for maximum specific yield or LCOE

### Output Format
- Start with **site summary**: area (hectares), latitude, terrain slope
- Provide **layout parameters table**: tilt, GCR, row pitch, table dimensions, number of tables
- Include **capacity summary**: total modules, DC capacity (MWp), AC capacity (MWac)
- Show **area utilization**: active area, roads, setbacks, unused area
- Present **shading analysis**: inter-row shading loss at design GCR
- Provide **layout diagram** (conceptual) or coordinate table
- Include **sensitivity analysis**: yield vs. GCR curve

### Quality Criteria
- [ ] GCR is within typical range (0.3-0.5 for fixed-tilt, 0.25-0.4 for trackers)
- [ ] Inter-row spacing ensures < 2-3% annual shading loss
- [ ] Access roads width is adequate (4-6m minimum)
- [ ] Setbacks comply with local regulations
- [ ] Capacity per hectare is reasonable (0.8-1.2 MWp/ha for fixed, 0.6-0.9 for tracker)
- [ ] Table dimensions match available module and structure sizes

### Common Pitfalls
- **Do not** use 0% shading as the design criteria — some inter-row shading is optimal for LCOE
- **Do not** forget to account for terrain slope in row spacing calculations
- **Do not** ignore east-west row spacing for tracker systems
- **Do not** design without access roads — O&M vehicles need access
- **Do not** place arrays too close to site boundary — respect setbacks
- **Do not** confuse GCR with module coverage ratio

## Capabilities

### 1. Inter-Row Spacing Calculation
Calculate optimal row-to-row pitch based on sun angle at specified no-shade time (e.g., winter solstice, solar altitude angle).

### 2. GCR Optimization
Analyze GCR vs. shading loss trade-off. Generate yield-vs-GCR curve to find optimal balance for maximum energy or minimum LCOE.

### 3. Site Capacity Estimation
Calculate maximum DC capacity within a given site boundary, accounting for setbacks, roads, exclusion zones, and terrain constraints.

### 4. Tracker Layout
Design single-axis tracker layouts with appropriate N-S spacing, tracker row length, and motor/drive spacing.

### 5. Terrain Adaptation
Adjust row spacing and table placement for sloped terrain, including east-facing, west-facing, and north-south slopes.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `latitude` | float | Yes | Site latitude in decimal degrees |
| `site_area_ha` | float | Yes | Available site area in hectares |
| `tilt` | float | Yes | Array tilt angle in degrees |
| `azimuth` | float | No | Array azimuth in degrees (default: 180 for northern hemisphere) |
| `module_length` | float | Yes | Module length in meters (portrait/landscape) |
| `module_width` | float | Yes | Module width in meters |
| `modules_per_table_up` | int | No | Modules in portrait per table height (default: 2) |
| `modules_per_table_across` | int | No | Modules across per table (default: 28) |
| `target_gcr` | float | No | Target GCR, or auto-optimize if not specified |
| `no_shade_hours` | string | No | No-shade window, e.g., "9:00-15:00 winter_solstice" (default) |
| `road_width_m` | float | No | Access road width in meters (default: 5.0) |
| `setback_m` | float | No | Boundary setback in meters (default: 10.0) |
| `terrain_slope` | float | No | Average terrain slope in degrees (default: 0) |
| `tracking` | string | No | "fixed" or "single_axis" (default: "fixed") |

## Example Usage

### Ground-Mount Layout Design

```
Prompt: "Design array layout for a 50 MWp ground-mount plant on 60 hectares
at latitude 26.5° in Rajasthan. Fixed tilt, 2-up portrait tables using
550W modules (2278mm x 1134mm). Optimize GCR for maximum annual yield."
```

### Example Code

```python
import numpy as np
import pvlib

latitude = 26.5

# Module dimensions (portrait, 2-up)
module_h = 2.278  # m (length in portrait)
modules_up = 2
collector_width = module_h * modules_up  # 4.556 m

# No-shade criteria: winter solstice, solar noon ± 3h
# Winter solstice solar elevation at lat 26.5°
declination = -23.45  # degrees
solar_elevation_noon = 90 - latitude + declination  # 40.05°
# At 9am/3pm, elevation is lower — use hour angle = 45°
hour_angle = 45  # degrees
solar_elevation_9am = np.degrees(np.arcsin(
    np.sin(np.radians(declination)) * np.sin(np.radians(latitude)) +
    np.cos(np.radians(declination)) * np.cos(np.radians(latitude)) * np.cos(np.radians(hour_angle))
))

# Row pitch for no shading at 9am winter solstice
tilt = 22  # degrees
shade_length = collector_width * np.sin(np.radians(tilt)) / np.tan(np.radians(solar_elevation_9am))
row_pitch = collector_width * np.cos(np.radians(tilt)) + shade_length

# GCR
gcr = collector_width / row_pitch

# Site capacity
site_area_m2 = 60 * 10000  # 60 hectares
setback = 10  # m
road_area_fraction = 0.08  # 8% for roads
usable_area = site_area_m2 * (1 - road_area_fraction)

n_rows = usable_area / (row_pitch * 1)  # simplified
module_power = 550  # W
modules_per_table = modules_up * 28
table_width = 1.134 * 28  # m

print(f"Row pitch: {row_pitch:.1f} m")
print(f"GCR: {gcr:.3f}")
print(f"Solar elevation at 9am winter solstice: {solar_elevation_9am:.1f}°")
```

## Output Format

The skill produces:
- **Layout parameter table**: Tilt, GCR, row pitch, collector width, table size
- **Capacity summary**: Modules, tables, strings, DC capacity, AC capacity
- **Area breakdown**: Active array, roads, setbacks, inverter/transformer pads
- **Shading analysis**: Annual shading loss at design GCR
- **GCR optimization curve**: Specific yield vs. GCR
- **Layout diagram**: Conceptual site plan with array blocks and roads

## Standards & References

- IS 875 (Part 3): Wind loads on structures (for mounting design)
- IEC 62548: Design requirements for PV arrays
- MNRE guidelines for solar park development (India)
- Sandia National Laboratories: Optimal GCR analysis

## Related Skills

- `shading-analysis` — Detailed inter-row and near-field shading
- `string-sizing` — String and inverter configuration
- `rooftop-design` — Rooftop layout alternative
- `energy-yield` — Yield estimation for designed layout
