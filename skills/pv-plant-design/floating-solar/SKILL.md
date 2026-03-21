---
name: floating-solar
version: 1.0.0
description: Floating PV (FPV) system design — pontoon layout, mooring design, water body assessment, cooling benefit estimation, and environmental considerations for floating solar installations.
author: SuryaPrajna Contributors
license: MIT
tags:
  - floating-solar
  - fpv
  - pontoon
  - water-body
  - mooring
dependencies:
  python:
    - pvlib>=0.11.0
    - numpy>=1.24
    - pandas>=2.0
    - matplotlib>=3.7
  data:
    - Water body dimensions and bathymetry
    - Wind and wave data
    - Water level variation data
pack: pv-plant-design
agent: Vinyasa-Agent
---

# floating-solar

Floating PV (FPV) system design for reservoirs, lakes, and industrial water bodies. Covers pontoon platform layout, mooring and anchoring design, water body suitability assessment, cooling benefit quantification, and environmental impact considerations.

## LLM Instructions

### Role Definition
You are a **floating solar design engineer** with expertise in FPV system layout, pontoon selection, mooring engineering, and hydrology. You understand the unique advantages (cooling, reduced evaporation, no land use) and challenges (corrosion, wave loads, water level variation, environmental permits) of floating PV systems.

### Thinking Process
1. **Assess water body** — Area, depth, water level variation, wind/wave exposure, water quality
2. **Determine coverage** — Maximum coverage ratio (typically 10-70% depending on ecological requirements)
3. **Select pontoon system** — HDPE, metal, or concrete pontoons; tilt angle; module mounting method
4. **Design layout** — Pontoon block size, walkway spacing, cable routing channels
5. **Design mooring** — Anchoring method (bottom anchors, shoreline anchors, piles), mooring lines, accommodate water level changes
6. **Estimate cooling benefit** — Quantify yield gain from water cooling effect (3-10% vs. ground-mount)
7. **Assess environmental impact** — Water quality, aquatic life, evaporation reduction
8. **Calculate capacity** — Modules, capacity, expected yield

### Output Format
- Start with **water body summary**: area, depth, location, water level variation
- Provide **FPV design table**: coverage ratio, pontoon type, tilt, capacity
- Include **mooring design**: anchor type, number, mooring line specifications
- Show **yield comparison**: FPV vs. equivalent ground-mount (cooling benefit)
- Present **evaporation reduction** estimate
- Address **environmental considerations**
- Provide **cost premium estimate** vs. ground-mount (typically 10-25%)

### Quality Criteria
- [ ] Water body coverage is within ecological limits (typically < 50% for natural water bodies)
- [ ] Mooring system accommodates full water level variation range
- [ ] Wind and wave loads are considered in mooring design
- [ ] Cooling benefit is reasonable (3-10% yield gain for tropical/subtropical)
- [ ] Cable routing accounts for water conditions (UV-resistant, waterproof)
- [ ] Minimum water depth requirement is met (typically > 1m at lowest level)
- [ ] Environmental clearances are identified

### Common Pitfalls
- **Do not** ignore water level variation — mooring must accommodate full range
- **Do not** assume same albedo as land — water albedo is lower (0.06-0.10 vs. 0.2 for land)
- **Do not** forget about wave-induced tilt oscillation reducing yield
- **Do not** underestimate corrosion in saline or polluted water bodies
- **Do not** skip environmental impact assessment for natural water bodies
- **Do not** use standard land-based cable specifications — marine-grade required

## Capabilities

### 1. Water Body Assessment
Evaluate suitability of water body for FPV: area, depth, water level variation, wind exposure, access, grid proximity.

### 2. Pontoon Layout Design
Design pontoon platform layout with optimal module placement, walkways, cable channels, and block sizing.

### 3. Mooring System Design
Size mooring system: anchor type selection, mooring line calculation, accommodation of water level variation and wind/wave loads.

### 4. Cooling Benefit Estimation
Quantify yield improvement from water cooling effect using ambient temperature comparison and cell temperature modeling.

### 5. Evaporation Reduction
Estimate water savings from reduced evaporation due to FPV coverage.

### 6. Environmental Assessment
Evaluate ecological impact: shading of water body, water quality effects, aquatic habitat considerations.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `latitude` | float | Yes | Site latitude in decimal degrees |
| `longitude` | float | Yes | Site longitude in decimal degrees |
| `water_area_ha` | float | Yes | Total water body area in hectares |
| `coverage_ratio` | float | No | Target fraction of water body to cover (default: 0.3) |
| `water_depth_m` | float | Yes | Average water depth in meters |
| `water_level_variation_m` | float | No | Annual water level variation in meters (default: 2.0) |
| `module_power_w` | float | Yes | Module rated power in watts |
| `tilt` | float | No | Module tilt angle in degrees (default: 5 for FPV) |
| `pontoon_type` | string | No | "hdpe", "metal", "concrete" (default: "hdpe") |
| `max_wind_speed_ms` | float | No | Design wind speed in m/s (default: 35) |
| `water_type` | string | No | "freshwater", "brackish", "treated_wastewater" (default: "freshwater") |

## Example Usage

### Floating Solar Design

```
Prompt: "Design a floating solar system on a 100-hectare reservoir in
Karnataka (latitude 14.5) with 30% coverage. Average depth 5m, water level
varies 3m seasonally. Use 550W bifacial modules on HDPE pontoons."
```

### Example Code

```python
import numpy as np

# Water body parameters
water_area_ha = 100
coverage_ratio = 0.30
fpv_area_ha = water_area_ha * coverage_ratio  # 30 ha
fpv_area_m2 = fpv_area_ha * 10000

# Module parameters
module_power = 550  # W
module_area = 2.278 * 1.134  # m²

# Pontoon layout
pontoon_efficiency = 0.85  # Module area / pontoon area (walkways, gaps)
module_area_available = fpv_area_m2 * pontoon_efficiency
total_modules = int(module_area_available / module_area)
capacity_mwp = total_modules * module_power / 1e6

# Cooling benefit estimation
# Ground-mount cell temp: ambient + 25°C (typical)
# FPV cell temp: ambient + 15°C (water cooling effect)
temp_coeff = -0.0035  # %/°C for c-Si
delta_temp = 10  # °C cooler on water
cooling_benefit = -temp_coeff * delta_temp * 100  # % yield gain

# Evaporation reduction
evaporation_rate = 1800  # mm/year for Karnataka reservoir
evaporation_reduction = 0.70  # FPV reduces evaporation by ~70% under panels
water_saved_m3 = fpv_area_m2 * evaporation_rate / 1000 * evaporation_reduction

# Mooring design
water_level_var = 3.0  # m
mooring_line_length = np.sqrt(5**2 + 15**2)  # catenary approximation
n_anchors = int(np.ceil(fpv_area_m2**0.5 / 50) * 4)  # perimeter anchors every 50m

print(f"FPV area: {fpv_area_ha:.0f} ha ({coverage_ratio*100:.0f}% coverage)")
print(f"Capacity: {capacity_mwp:.1f} MWp")
print(f"Cooling benefit: +{cooling_benefit:.1f}% yield")
print(f"Water saved: {water_saved_m3:.0f} m³/year")
print(f"Mooring anchors: {n_anchors}")
```

## Output Format

The skill produces:
- **Water body assessment**: Area, depth, suitability rating
- **FPV layout**: Coverage area, pontoon blocks, walkways, cable routes
- **Capacity summary**: Modules, DC capacity, AC capacity
- **Mooring design**: Anchor type, count, mooring line specifications
- **Performance comparison**: FPV yield vs. ground-mount (with cooling benefit)
- **Evaporation savings**: Annual water saved (m³)
- **Environmental notes**: Ecological considerations and required permits

## Standards & References

- IEC TS 63049: Terrestrial PV systems — guidelines for floating PV
- CERC/MNRE floating solar guidelines (India)
- World Bank: Where Sun Meets Water — Floating Solar Handbook
- DNV-RP-0584: Design, development, and operation of floating solar PV

## Related Skills

- `array-layout` — Ground-mount alternative design
- `shading-analysis` — Shading analysis for pontoon layout
- `energy-yield` — Yield estimation with cooling benefit
- `cable-sizing` — Marine-grade cable design
