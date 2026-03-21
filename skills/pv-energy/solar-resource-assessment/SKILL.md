---
name: solar-resource-assessment
version: 1.0.0
description: Site solar resource evaluation — analyze long-term irradiance data, assess resource quality, compare data sources, and determine optimal tilt/orientation for PV project development.
author: SuryaPrajna Contributors
license: MIT
tags:
  - solar-resource
  - site-assessment
  - ghi
  - dni
  - project-development
dependencies:
  python:
    - pvlib>=0.11.0
    - pandas>=2.0
    - numpy>=1.24
    - matplotlib>=3.7
    - scipy>=1.10
  data:
    - Multi-year irradiance data (satellite or ground-measured)
pack: pv-energy
agent: Megha-Agent
---

# solar-resource-assessment

Comprehensive site solar resource evaluation for PV project development. Analyzes long-term irradiance data from multiple sources, assesses resource quality and variability, determines optimal array orientation, and produces resource reports suitable for project feasibility studies.

## LLM Instructions

### Role Definition
You are a **solar resource analyst** with expertise in site prospecting, irradiance data analysis, and resource characterization for PV project development. You can evaluate the solar potential of any location worldwide and produce resource assessments that inform go/no-go decisions for project development.

### Thinking Process
1. **Identify site** — Location coordinates, terrain, climate zone
2. **Gather resource data** — Multiple sources (NSRDB, ERA5, SolarGIS, ground measurements)
3. **Assess data quality** — Period of record, completeness, known biases
4. **Cross-validate sources** — Compare GHI/DNI from different databases
5. **Characterize resource** — Annual totals, monthly profiles, inter-annual variability
6. **Optimize orientation** — Determine optimal tilt and azimuth for maximum yield
7. **Classify resource quality** — Compare against regional and global benchmarks
8. **Report findings** — Resource summary, data source comparison, recommendation

### Output Format
- Start with **site identification**: coordinates, elevation, climate zone, nearest city
- Provide **resource summary table**: GHI, DNI, DHI annual totals, mean temperature, wind speed
- Include **monthly irradiation profile** (table and chart)
- Show **inter-annual variability** (if multi-year data): CoV, min/max years
- Present **optimal tilt analysis**: yield vs. tilt curve, recommended tilt
- Provide **data source comparison** table (if multiple sources used)
- Include **resource classification**: excellent / good / moderate / marginal
- All irradiation values in kWh/m²/year

### Quality Criteria
- [ ] At least 10 years of satellite data used for long-term average
- [ ] Multiple data sources compared and reconciled
- [ ] GHI is consistent with latitude and climate zone
- [ ] Monthly pattern follows expected seasonal cycle
- [ ] Inter-annual CoV is typically 3-8%
- [ ] Optimal tilt is close to latitude for fixed-tilt systems
- [ ] DNI/GHI ratio is climate-appropriate (higher for arid, lower for humid)

### Common Pitfalls
- **Do not** rely on a single data source for bankable assessments
- **Do not** use less than 10 years for long-term resource estimation
- **Do not** ignore elevation effects on irradiance
- **Do not** confuse GHI with GTI (Global Tilted Irradiance)
- **Do not** present resource data without specifying the period of record
- **Do not** extrapolate ground measurements without satellite correlation

## Capabilities

### 1. Multi-Source Resource Analysis
Retrieve and compare solar resource data from NSRDB, ERA5, MERRA-2, PVGIS, SolarGIS, and ground measurements.

### 2. Long-Term Resource Estimation
Calculate long-term average irradiance from multi-year datasets and quantify inter-annual variability.

### 3. Optimal Tilt & Orientation
Determine optimal array tilt and azimuth by analyzing POA irradiance vs. tilt curves. Support for fixed-tilt, seasonal tilt, and tracking systems.

### 4. Resource Classification
Classify solar resource quality against global and regional benchmarks (DNV, World Bank solar atlas).

### 5. Terrain & Horizon Analysis
Assess horizon shading effects from terrain on available solar resource.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `latitude` | float | Yes | Site latitude in decimal degrees |
| `longitude` | float | Yes | Site longitude in decimal degrees |
| `altitude` | float | No | Site altitude in meters (auto-detected if not provided) |
| `data_sources` | list | No | Sources to query: ["nsrdb", "era5", "pvgis", "merra2"] (default: ["pvgis"]) |
| `years` | int | No | Number of years for long-term average (default: 10) |
| `tilt_range` | list | No | Tilt range for optimization [min, max, step] in degrees (default: [0, 45, 5]) |
| `azimuth` | float | No | Fixed azimuth for tilt optimization in degrees (default: 180 for north hemisphere) |
| `include_horizon` | boolean | No | Include horizon profile analysis (default: false) |

## Example Usage

### Site Solar Resource Assessment

```
Prompt: "Assess the solar resource for a potential PV project site at
latitude 26.9, longitude 75.8 (Jaipur, Rajasthan). Compare NSRDB and
PVGIS data, determine optimal tilt, and classify the resource quality."
```

### Example Code

```python
import pvlib
import pandas as pd
import numpy as np
from pvlib.iotools import get_pvgis_tmy, get_pvgis_hourly

# Get PVGIS TMY data
tmy_data, months, inputs, metadata = get_pvgis_tmy(
    latitude=26.9, longitude=75.8, map_variables=True
)

# Annual resource summary
annual_ghi = tmy_data['ghi'].sum() / 1000  # kWh/m²
annual_dni = tmy_data['dni'].sum() / 1000
annual_dhi = tmy_data['dhi'].sum() / 1000

# Monthly profile
monthly = tmy_data.resample('ME').sum() / 1000  # kWh/m²

# Optimal tilt analysis
from pvlib.irradiance import get_total_irradiance
from pvlib.location import Location

location = Location(26.9, 75.8, tz='Asia/Kolkata', altitude=431)
solar_pos = location.get_solarposition(tmy_data.index)

tilts = range(0, 46, 5)
annual_poa = {}
for tilt in tilts:
    poa = get_total_irradiance(
        surface_tilt=tilt, surface_azimuth=180,
        solar_zenith=solar_pos['apparent_zenith'],
        solar_azimuth=solar_pos['azimuth'],
        dni=tmy_data['dni'], ghi=tmy_data['ghi'], dhi=tmy_data['dhi'],
        model='perez'
    )
    annual_poa[tilt] = poa['poa_global'].sum() / 1000

optimal_tilt = max(annual_poa, key=annual_poa.get)
print(f"Annual GHI: {annual_ghi:.0f} kWh/m²")
print(f"Optimal tilt: {optimal_tilt}°")
print(f"POA at optimal tilt: {annual_poa[optimal_tilt]:.0f} kWh/m²")

# Resource classification
if annual_ghi > 2000:
    resource_class = "Excellent"
elif annual_ghi > 1700:
    resource_class = "Good"
elif annual_ghi > 1400:
    resource_class = "Moderate"
else:
    resource_class = "Marginal"
```

## Output Format

The skill produces:
- **Site summary**: Coordinates, altitude, climate zone, nearest weather station
- **Resource summary**: GHI, DNI, DHI annual totals (kWh/m²/year)
- **Monthly irradiation table and chart**: All components by month
- **Data source comparison**: Side-by-side comparison with bias analysis
- **Optimal tilt curve**: POA vs. tilt plot with recommended tilt
- **Inter-annual variability**: CoV and year-to-year variation
- **Resource classification**: Rating against benchmarks

## Standards & References

- World Bank Global Solar Atlas methodology
- ESMAP Solar Resource and PV Power Potential
- IEC 61724-1: Performance monitoring and resource assessment
- Sengupta et al. (2018): Best practices handbook for solar irradiance
- PVGIS documentation: https://joint-research-centre.ec.europa.eu/pvgis_en

## Related Skills

- `weather-data-ingestion` — Data retrieval from multiple sources
- `irradiance-modeler` — Transposition to tilted surface
- `energy-yield` — Energy yield estimation from resource data
- `p50-p90-analysis` — Uncertainty quantification of resource
