---
name: shading-analysis
version: 1.0.0
description: Horizon, inter-row, and near-field shading analysis — quantify shading losses from terrain, adjacent rows, structures, and vegetation using sun path geometry and ray-tracing approaches.
author: SuryaPrajna Contributors
license: MIT
tags:
  - shading
  - inter-row
  - horizon
  - sun-path
  - loss-analysis
dependencies:
  python:
    - pvlib>=0.11.0
    - numpy>=1.24
    - pandas>=2.0
    - matplotlib>=3.7
    - scipy>=1.10
  data:
    - Site layout with module positions
    - Horizon profile (optional)
    - Obstruction survey (optional)
pack: pv-plant-design
agent: Vinyasa-Agent
---

# shading-analysis

Comprehensive shading analysis for PV systems including inter-row shading, horizon shading from terrain, near-field shading from structures and vegetation, and electrical impact modeling (bypass diode activation, string mismatch).

## LLM Instructions

### Role Definition
You are a **PV shading analysis specialist** with expertise in solar geometry, shadow projection, and electrical impact of partial shading. You can quantify shading losses from any obstruction type and understand how bypass diodes, string configuration, and MPPT topology affect the electrical impact of shading.

### Thinking Process
1. **Identify shading sources** — Inter-row, horizon (terrain), near-field (structures, trees, parapets), self-shading
2. **Model sun path** — Calculate solar position throughout the year
3. **Project shadows** — Determine shadow geometry for each obstruction at each time step
4. **Calculate shading fraction** — Percentage of array area shaded at each time step
5. **Estimate irradiance loss** — Beam irradiance reduction due to shading
6. **Model electrical impact** — Linear vs. non-linear shading losses (bypass diode activation)
7. **Quantify annual loss** — Integrate shading losses over the full year
8. **Recommend mitigations** — Layout changes, module-level power electronics, vegetation management

### Output Format
- Start with **shading source inventory**: all identified shading sources with dimensions
- Provide **annual shading loss** as percentage of unshaded energy
- Include **monthly shading loss profile**: seasonal variation in shading
- Show **sun path diagram** with obstruction profiles overlaid
- Present **hourly shading fraction** for representative days (solstices, equinoxes)
- Provide **electrical impact analysis**: linear vs. non-linear losses
- Recommend **mitigation strategies** with estimated benefit

### Quality Criteria
- [ ] All significant shading sources are identified and modeled
- [ ] Solar position calculations use correct location and timezone
- [ ] Shadow projections account for array height (not just ground-level)
- [ ] Inter-row shading loss scales correctly with GCR
- [ ] Electrical impact distinguishes between linear (proportional) and non-linear (bypass diode) losses
- [ ] Annual shading loss is within expected range (1-5% for well-designed systems)
- [ ] Horizon profile uses correct azimuth convention

### Common Pitfalls
- **Do not** assume shading loss equals shading fraction — electrical impact can be 2-3x the geometrical shading
- **Do not** ignore near-field objects — a single pole or tree can cause disproportionate electrical losses
- **Do not** model inter-row shading only at noon — early morning and late afternoon contribute most
- **Do not** use horizon profiles without checking azimuth convention (N=0° vs. S=0°)
- **Do not** forget seasonal vegetation changes (deciduous trees)
- **Do not** ignore snow accumulation at bottom of modules causing prolonged shading

## Capabilities

### 1. Inter-Row Shading Analysis
Calculate inter-row shading for ground-mount arrays based on GCR, tilt, latitude, and row height. Model hourly and annual shading fraction.

### 2. Horizon Profile Analysis
Import or calculate terrain horizon profile and quantify beam irradiance losses from distant terrain shading.

### 3. Near-Field Shading
Model shadows from structures (poles, buildings, fences), vegetation (trees), and rooftop obstructions (HVAC, parapets) with 3D geometry.

### 4. Sun Path Diagram with Obstructions
Generate sun path (stereographic or polar) diagrams with obstruction profiles overlaid to visualize shading periods.

### 5. Electrical Impact Modeling
Model the non-linear electrical impact of partial shading including bypass diode activation, string mismatch, and MPPT behavior.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `latitude` | float | Yes | Site latitude in decimal degrees |
| `longitude` | float | Yes | Site longitude in decimal degrees |
| `tilt` | float | Yes | Array tilt angle in degrees |
| `azimuth` | float | No | Array azimuth in degrees (default: 180) |
| `gcr` | float | No | Ground Coverage Ratio for inter-row shading |
| `row_height_m` | float | No | Array bottom edge height above ground in meters |
| `horizon_profile` | object | No | Azimuth-elevation pairs for horizon profile |
| `obstructions` | list | No | Near-field obstructions with position, dimensions |
| `module_config` | object | No | Module and string configuration for electrical modeling |
| `analysis_period` | string | No | "annual", "monthly", or specific date range |

## Example Usage

### Inter-Row Shading Analysis

```
Prompt: "Calculate annual inter-row shading loss for a ground-mount plant
at latitude 28.5° with GCR 0.40, tilt 25°, 2-up portrait modules
(collector width 4.56m), bottom edge at 0.5m height."
```

### Example Code

```python
import numpy as np
import pvlib
from pvlib.location import Location

location = Location(latitude=28.5, longitude=77.0, tz='Asia/Kolkata')

# Array parameters
tilt = 25  # degrees
gcr = 0.40
collector_width = 4.56  # m
row_pitch = collector_width / gcr

# Generate annual solar positions (hourly)
times = pd.date_range('2024-01-01', '2024-12-31 23:00', freq='h', tz='Asia/Kolkata')
solar_pos = location.get_solarposition(times)
solar_pos = solar_pos[solar_pos['elevation'] > 0]  # daytime only

# Inter-row shading fraction
# Shadow length on ground from row ahead
shadow_on_collector = np.zeros(len(solar_pos))

for i, (_, sp) in enumerate(solar_pos.iterrows()):
    sun_elev = sp['elevation']
    sun_azi = sp['azimuth']

    # Project shadow of top of front row onto rear row
    shadow_length = collector_width * np.sin(np.radians(tilt)) / np.tan(np.radians(sun_elev))

    # Fraction of rear row shaded (simplified 2D)
    row_spacing = row_pitch - collector_width * np.cos(np.radians(tilt))
    shade_on_row = max(0, shadow_length - row_spacing)
    shadow_on_collector[i] = min(1.0, shade_on_row / (collector_width * np.cos(np.radians(tilt))))

# Weight by beam irradiance
clearsky = location.get_clearsky(solar_pos.index)
beam = clearsky['dni'] * np.cos(np.radians(solar_pos['zenith']))
beam = beam.clip(lower=0)

shading_loss = np.average(shadow_on_collector, weights=beam.values)
print(f"Annual beam shading loss: {shading_loss*100:.1f}%")
```

## Output Format

The skill produces:
- **Shading source inventory**: Each source with type, dimensions, distance
- **Annual shading loss**: Percentage of unshaded energy lost to shading
- **Monthly shading profile**: Seasonal variation in shading losses
- **Sun path diagram**: With obstruction profiles overlaid
- **Hourly shading plots**: Representative days (solstices, equinoxes)
- **Electrical impact**: Linear and non-linear loss estimates
- **Mitigation recommendations**: Layout changes, MLPE, vegetation management

## Standards & References

- IEC 61724-1: Shading effects on PV performance monitoring
- Deline et al. (2013): Partial shading assessment of PV installations
- PVsyst shading scene methodology
- Sandia: Shade impact on PV module performance

## Related Skills

- `array-layout` — Layout optimization considering shading
- `rooftop-design` — Rooftop obstruction shading
- `loss-tree` — Shading loss in overall loss waterfall
- `energy-yield` — Yield with shading losses included
