---
name: irradiance-modeler
version: 1.0.0
description: GHI/DNI/DHI decomposition and transposition modeling — convert horizontal irradiance to plane-of-array using industry-standard models (Perez, Hay-Davies, Erbs, DISC).
author: SuryaPrajna Contributors
license: MIT
tags:
  - irradiance
  - decomposition
  - transposition
  - perez
  - plane-of-array
dependencies:
  python:
    - pvlib>=0.11.0
    - pandas>=2.0
    - numpy>=1.24
    - matplotlib>=3.7
  data:
    - Horizontal irradiance data (GHI minimum; DNI/DHI preferred)
pack: pv-energy
agent: Megha-Agent
---

# irradiance-modeler

GHI/DNI/DHI decomposition and plane-of-array (POA) transposition modeling. Implements industry-standard irradiance models for converting horizontal measurements to tilted surface irradiance, a critical step in PV energy yield estimation.

## LLM Instructions

### Role Definition
You are a **solar irradiance specialist** with deep knowledge of radiometric physics, irradiance decomposition models, and transposition algorithms. You understand the strengths and limitations of each model and can recommend the best approach based on data availability, climate, and application.

### Thinking Process
1. **Assess available data** — GHI only? GHI + DNI + DHI? Measured or modeled?
2. **Select decomposition model** (if needed) — Erbs, DISC, DIRINT, BRL for GHI -> DNI/DHI
3. **Calculate solar position** — Zenith, azimuth for all timestamps
4. **Select transposition model** — Perez (recommended), Hay-Davies, isotropic, Klucher
5. **Compute POA components** — Beam, sky diffuse, ground-reflected
6. **Apply corrections** — IAM (incidence angle modifier), spectral correction if applicable
7. **Validate results** — POA > GHI for optimally tilted surfaces, check seasonal patterns

### Output Format
- Start with **model selection rationale**
- Provide **POA irradiation summary**: annual total (kWh/m²), monthly breakdown
- Show **POA components**: beam, sky diffuse, ground-reflected (annual and monthly)
- Include **transposition gain/loss** vs. GHI
- Provide **working pvlib code** with model parameters
- Include **comparison plot**: GHI vs. POA time series or monthly bars

### Quality Criteria
- [ ] POA annual total is reasonable relative to GHI (typically 5-20% gain for optimal tilt)
- [ ] Beam + diffuse + ground-reflected = total POA
- [ ] Ground-reflected component is small (2-8% of POA for typical albedo)
- [ ] Diffuse fraction is climate-appropriate (30-50% for humid, 20-35% for arid)
- [ ] Decomposition closure: reconstructed GHI from DNI + DHI matches original GHI
- [ ] No POA values during nighttime

### Common Pitfalls
- **Do not** use isotropic transposition for accurate yield estimates — Perez is standard
- **Do not** forget ground albedo — it affects ground-reflected component (typical 0.2, snow 0.6-0.8)
- **Do not** apply Perez model without proper solar position inputs
- **Do not** ignore the clearness index (Kt) range when selecting decomposition models
- **Do not** use sub-hourly decomposition models on hourly data without adjustment
- **Do not** confuse POA irradiance (W/m²) with POA irradiation (kWh/m²)

## Capabilities

### 1. Irradiance Decomposition
Convert GHI-only data to DNI and DHI using: Erbs (simple, Kt-based), DISC (NREL, Kt + zenith), DIRINT (improved DISC), BRL (Boland-Ridley-Lauret).

### 2. Transposition to POA
Calculate plane-of-array irradiance from GHI/DNI/DHI using: Perez (anisotropic, industry standard), Hay-Davies (anisotropic, simpler), isotropic (conservative), Klucher (all-weather).

### 3. Incidence Angle Effects
Model incidence angle modifier (IAM) using physical, ASHRAE, Martin-Ruiz, or Sandia models. Accounts for reflection losses at high angles of incidence.

### 4. Spectral Corrections
Apply spectral mismatch corrections for different module technologies (c-Si, CdTe, a-Si) based on atmospheric conditions.

### 5. Albedo Modeling
Configure ground albedo for different surface types (grass, concrete, snow, water) and seasonal variations.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `latitude` | float | Yes | Site latitude in decimal degrees |
| `longitude` | float | Yes | Site longitude in decimal degrees |
| `tilt` | float | Yes | Surface tilt angle in degrees |
| `azimuth` | float | Yes | Surface azimuth in degrees (180 = south) |
| `ghi` | series | Yes | Global Horizontal Irradiance time series (W/m²) |
| `dni` | series | No | Direct Normal Irradiance (W/m²), decomposed from GHI if not provided |
| `dhi` | series | No | Diffuse Horizontal Irradiance (W/m²), decomposed from GHI if not provided |
| `decomposition_model` | string | No | "erbs", "disc", "dirint", "brl" (default: "disc") |
| `transposition_model` | string | No | "perez", "haydavies", "isotropic", "klucher" (default: "perez") |
| `albedo` | float | No | Ground albedo (default: 0.2) |
| `iam_model` | string | No | "physical", "ashrae", "martin_ruiz" (default: "physical") |

## Example Usage

### GHI to POA Transposition

```
Prompt: "Transpose horizontal irradiance to a 25° south-facing tilted
surface for a site in Jaipur using the Perez model."
```

### Example Code

```python
import pvlib
import pandas as pd
from pvlib.location import Location
from pvlib.irradiance import get_total_irradiance

# Define location
location = Location(latitude=26.9, longitude=75.8, tz='Asia/Kolkata', altitude=431)

# Solar position
solar_position = location.get_solarposition(weather_data.index)

# Decompose GHI to DNI/DHI (if not available)
dni_dhi = pvlib.irradiance.disc(
    ghi=weather_data['ghi'],
    solar_zenith=solar_position['apparent_zenith'],
    datetime_or_doy=weather_data.index,
)

# Transpose to POA using Perez model
poa = get_total_irradiance(
    surface_tilt=25,
    surface_azimuth=180,
    solar_zenith=solar_position['apparent_zenith'],
    solar_azimuth=solar_position['azimuth'],
    dni=dni_dhi['dni'],
    ghi=weather_data['ghi'],
    dhi=weather_data['ghi'] - dni_dhi['dni'] * np.cos(np.radians(solar_position['apparent_zenith'])),
    model='perez',
    albedo=0.2,
)

annual_poa = poa['poa_global'].sum() / 1000  # kWh/m²
annual_ghi = weather_data['ghi'].sum() / 1000  # kWh/m²
transposition_gain = (annual_poa - annual_ghi) / annual_ghi * 100

print(f"Annual GHI: {annual_ghi:.0f} kWh/m²")
print(f"Annual POA: {annual_poa:.0f} kWh/m²")
print(f"Transposition gain: {transposition_gain:.1f}%")
```

## Output Format

The skill produces:
- **POA irradiation summary**: Annual total (kWh/m²) with beam, diffuse, ground components
- **Monthly irradiation table**: GHI, POA (beam, diffuse, ground, total) for each month
- **Transposition gain/loss**: Percentage difference POA vs. GHI
- **IAM loss estimate**: Annual incidence angle losses
- **Comparison charts**: GHI vs. POA monthly bar chart, daily profile comparison

## Standards & References

- Perez et al. (1990): Modeling daylight availability and irradiance components from direct and global irradiance
- Hay & Davies (1980): Calculation of the solar radiation incident on an inclined surface
- Erbs et al. (1982): Estimation of the diffuse radiation fraction
- Maxwell (1987): DISC model for DNI estimation
- IEC 61853-2: Spectral responsivity and incidence angle effects

## Related Skills

- `weather-data-ingestion` — Source data for irradiance modeling
- `pvlib-analysis` — Core simulation using transposed irradiance
- `solar-resource-assessment` — Resource evaluation with irradiance analysis
- `energy-yield` — Energy yield using POA irradiance
