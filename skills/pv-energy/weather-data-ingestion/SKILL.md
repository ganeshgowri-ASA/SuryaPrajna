---
name: weather-data-ingestion
version: 1.0.0
description: Solar weather data ingestion and quality control — import, validate, and prepare TMY, MERRA-2, ERA5, NSRDB, and ground-measured irradiance data for PV simulation.
author: SuryaPrajna Contributors
license: MIT
tags:
  - weather-data
  - tmy
  - irradiance
  - merra-2
  - era5
  - nsrdb
  - data-quality
dependencies:
  python:
    - pvlib>=0.11.0
    - pandas>=2.0
    - numpy>=1.24
    - requests>=2.28
    - h5py>=3.8
  data:
    - API keys for NSRDB, CDS (ERA5), or SolarGIS (optional)
pack: pv-energy
agent: Megha-Agent
---

# weather-data-ingestion

Solar weather data ingestion and quality control. Imports irradiance and meteorological data from major databases (TMY3, NSRDB, MERRA-2, ERA5, Meteonorm, SolarGIS), validates data quality, fills gaps, and outputs simulation-ready datasets for PV energy modeling.

## LLM Instructions

### Role Definition
You are a **solar resource data specialist** with expertise in meteorological data sources, irradiance measurement, data quality control, and TMY construction. You understand the strengths and limitations of satellite-derived vs. ground-measured data and can recommend the best data source for each project.

### Thinking Process
1. **Identify location** — Latitude, longitude, country, climate zone
2. **Select data source** — Choose appropriate database based on location, data availability, and project requirements
3. **Retrieve data** — API call, file download, or manual import
4. **Quality control** — Check for gaps, outliers, physical limits, consistency
5. **Gap filling** — Interpolation, regression, or surrogate data for missing periods
6. **Format conversion** — Convert to pvlib-compatible DataFrame with correct column names and units
7. **Validate** — Compare GHI annual sum against known benchmarks for the region

### Output Format
- Start with **data source summary**: database, period, resolution, spatial resolution
- Provide **data quality report**: completeness (%), gaps, outliers detected
- Include **annual summary**: GHI, DNI, DHI (kWh/m²/year), ambient temperature range, wind speed
- Show **monthly irradiation table** with all components
- Provide **working Python code** for data retrieval and processing
- Specify output format: pandas DataFrame with DatetimeIndex (timezone-aware)

### Quality Criteria
- [ ] GHI annual total is within expected range for the latitude and climate
- [ ] GHI >= DHI at all timestamps (physical constraint)
- [ ] GHI <= extraterrestrial irradiance at all timestamps
- [ ] DNI + DHI * cos(zenith) ≈ GHI (closure check)
- [ ] No negative irradiance values during daytime
- [ ] Data completeness > 95% before gap filling
- [ ] Timestamps are timezone-aware and consistent

### Common Pitfalls
- **Do not** mix UTC and local time — always verify and document timezone
- **Do not** use satellite data without understanding its spatial resolution (typically 10-30 km)
- **Do not** ignore the difference between TMY and actual year data
- **Do not** use GHI-only data without proper DNI/DHI decomposition
- **Do not** forget to convert units (some sources use W/m², others Wh/m²)
- **Do not** use a single data source without cross-validation for bankable projects

## Capabilities

### 1. Multi-Source Data Retrieval
Access data from NSRDB (PSM3), ERA5 (CDS API), MERRA-2 (NASA POWER), Meteonorm, SolarGIS, and local ground stations.

### 2. Data Quality Control
Apply BSRN-standard quality checks: physical limits, component consistency (GHI/DNI/DHI closure), outlier detection, and gap identification.

### 3. Gap Filling
Fill missing data using temporal interpolation, regression against nearby stations, or surrogate satellite data.

### 4. TMY Construction
Build Typical Meteorological Year from multi-year datasets using Sandia or ISO 15927-4 methods.

### 5. Format Conversion
Convert between common formats (EPW, TMY3 CSV, SAM CSV, pvlib DataFrame, PVsyst) and ensure pvlib compatibility.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `latitude` | float | Yes | Site latitude in decimal degrees |
| `longitude` | float | Yes | Site longitude in decimal degrees |
| `source` | string | Yes | Data source: "nsrdb", "era5", "merra2", "meteonorm", "solargis", "custom" |
| `start_year` | int | No | Start year for multi-year data (default: latest available) |
| `end_year` | int | No | End year for multi-year data |
| `interval` | int | No | Time step in minutes: 30 or 60 (default: 60) |
| `output_format` | string | No | "pvlib", "pvsyst", "sam", "epw" (default: "pvlib") |
| `api_key` | string | No | API key for data source (if required) |
| `quality_checks` | boolean | No | Run BSRN quality checks (default: true) |

## Example Usage

### Retrieve NSRDB Data

```
Prompt: "Download TMY data from NSRDB for a site at latitude 28.61,
longitude 77.21 (New Delhi) and prepare for pvlib simulation."
```

### Example Code

```python
import pvlib
import pandas as pd

# Method 1: Using pvlib's NSRDB interface
from pvlib.iotools import get_psm3

data, metadata = get_psm3(
    latitude=28.61,
    longitude=77.21,
    api_key='your_api_key',
    email='your_email',
    names='tmy',
    map_variables=True,
)

# Method 2: Using NASA POWER (MERRA-2 based, no API key needed)
from pvlib.iotools import get_pvgis_tmy

data, months, inputs, metadata = get_pvgis_tmy(
    latitude=28.61,
    longitude=77.21,
    map_variables=True,
)

# Quality checks
assert (data['ghi'] >= data['dhi']).all(), "GHI must be >= DHI"
assert (data['ghi'] >= 0).all(), "No negative irradiance"

# Annual summary
annual_ghi = data['ghi'].sum() / 1000  # kWh/m²
annual_dni = data['dni'].sum() / 1000
annual_dhi = data['dhi'].sum() / 1000

print(f"Annual GHI: {annual_ghi:.0f} kWh/m²")
print(f"Annual DNI: {annual_dni:.0f} kWh/m²")
print(f"Annual DHI: {annual_dhi:.0f} kWh/m²")
print(f"Data completeness: {1 - data['ghi'].isna().mean():.1%}")
```

## Output Format

The skill produces:
- **Data source metadata**: Provider, period, resolution, coordinates used
- **Quality report**: Completeness, gaps, outliers, closure check results
- **Annual irradiation summary**: GHI, DNI, DHI in kWh/m²/year
- **Monthly irradiation table**: 12-month breakdown with all components
- **Simulation-ready DataFrame**: pvlib-compatible with correct columns and timezone
- **Python code**: Reproducible data retrieval and processing pipeline

## Standards & References

- WMO Guide to Meteorological Instruments and Methods of Observation
- BSRN quality control procedures for solar radiation measurements
- ISO 15927-4: TMY construction methodology
- Sengupta et al. (2018): Best practices for solar irradiance data
- NSRDB documentation: https://nsrdb.nrel.gov/
- ERA5 documentation: https://cds.climate.copernicus.eu/

## Related Skills

- `pvlib-analysis` — Uses ingested weather data for PV simulation
- `irradiance-modeler` — Decomposition and transposition models
- `solar-resource-assessment` — Site resource evaluation using this data
- `energy-yield` — Energy yield estimation from weather data
