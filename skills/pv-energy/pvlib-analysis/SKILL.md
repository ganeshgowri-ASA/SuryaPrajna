---
name: pvlib-analysis
version: 1.0.0
description: Solar energy modeling and simulation using pvlib-python — calculate irradiance, model PV systems, and estimate energy yield with industry-standard algorithms.
author: SuryaPrajna Contributors
license: MIT
tags:
  - solar-energy
  - pvlib
  - irradiance
  - energy-yield
  - simulation
  - photovoltaic
dependencies:
  python:
    - pvlib>=0.11.0
    - pandas>=2.0
    - numpy>=1.24
    - matplotlib>=3.7
  data:
    - TMY weather file (CSV or EPW format)
pack: pv-energy
agent: Phala-Agent
---

# pvlib-analysis

Solar energy modeling and simulation using [pvlib-python](https://pvlib-python.readthedocs.io/), the open-source library for simulating photovoltaic energy systems.

## Capabilities

### 1. Solar Position Calculation
Calculate solar zenith, azimuth, and equation of time for any location and timestamp.

### 2. Irradiance Decomposition & Transposition
- Decompose GHI into DNI and DHI (Erbs, DISC, DIRINT models)
- Transpose to plane-of-array irradiance (Perez, Hay-Davies, isotropic, Klucher)

### 3. PV System Modeling
- Define PV system: module parameters, inverter parameters, array configuration
- Model DC output using single-diode model (CEC, De Soto)
- Model AC output with inverter efficiency curves
- Support for fixed-tilt, single-axis tracker, and dual-axis tracker

### 4. Energy Yield Estimation
- Hourly/sub-hourly energy simulation
- Annual energy yield (kWh) calculation
- Specific yield (kWh/kWp) computation
- Capacity factor estimation

### 5. Loss Modeling
- Temperature losses (Faiman, SAPM, PVsyst models)
- Soiling losses
- Shading losses (linear, non-linear)
- Wiring and mismatch losses
- Inverter clipping

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `latitude` | float | Yes | Site latitude in decimal degrees |
| `longitude` | float | Yes | Site longitude in decimal degrees |
| `altitude` | float | No | Site altitude in meters (default: 0) |
| `tilt` | float | Yes | Array tilt angle in degrees |
| `azimuth` | float | Yes | Array azimuth in degrees (180 = south) |
| `module` | string | Yes | Module name from CEC database or custom params |
| `inverter` | string | Yes | Inverter name from CEC database or custom params |
| `strings_per_inverter` | int | No | Number of strings per inverter (default: 1) |
| `modules_per_string` | int | No | Modules per string (default: 1) |
| `weather_data` | file | Yes | TMY or measured weather data (GHI, DNI, DHI, temp, wind) |
| `losses` | object | No | Loss parameters (soiling, mismatch, wiring, etc.) |
| `tracking` | string | No | Tracking type: "fixed", "single_axis", "dual_axis" (default: "fixed") |

## Example Usage

### Basic Energy Yield Simulation

```
Prompt: "Calculate annual energy yield for a 100 kWp ground-mount system at
latitude 17.385, longitude 78.487 (Hyderabad, India) using Canadian Solar
CS6W-550MS modules and Sungrow SG110CX inverter, 20° tilt, south-facing."
```

**Expected workflow:**
1. Load TMY weather data for Hyderabad
2. Configure PV system with specified module and inverter
3. Run hourly simulation for full year
4. Calculate annual yield, specific yield, and capacity factor
5. Generate monthly energy bar chart and loss waterfall

### Example Code

```python
import pvlib
import pandas as pd
from pvlib.pvsystem import PVSystem
from pvlib.modelchain import ModelChain
from pvlib.location import Location

# Define location
location = Location(
    latitude=17.385,
    longitude=78.487,
    tz='Asia/Kolkata',
    altitude=542,
    name='Hyderabad'
)

# Get module and inverter parameters from CEC database
cec_modules = pvlib.pvsystem.retrieve_sam('CECMod')
cec_inverters = pvlib.pvsystem.retrieve_sam('CECInverter')

module_params = cec_modules['Canadian_Solar_Inc__CS6W_550MS']
inverter_params = cec_inverters['Sungrow_Power_Supply_Co___Ltd__SG110CX__800V_']

# Define temperature model parameters
temperature_params = pvlib.temperature.TEMPERATURE_MODEL_PARAMETERS['sapm']['open_rack_glass_glass']

# Create PV system
system = PVSystem(
    surface_tilt=20,
    surface_azimuth=180,
    module_parameters=module_params,
    inverter_parameters=inverter_params,
    temperature_model_parameters=temperature_params,
    modules_per_string=20,
    strings_per_inverter=10
)

# Create and run ModelChain
mc = ModelChain(system, location)
# mc.run_model(weather_data)  # Pass TMY DataFrame

# Results
# mc.results.ac  → AC power output (W) timeseries
# mc.results.ac.sum() / 1000  → Annual energy (kWh)
```

### Irradiance Transposition

```
Prompt: "Transpose horizontal irradiance data to a 25° tilted surface
facing south using the Perez model for a site in Rajasthan."
```

### Tracking System Comparison

```
Prompt: "Compare energy yield between fixed-tilt (20°), single-axis tracking,
and dual-axis tracking for a 5 MWp plant in Tamil Nadu."
```

## Output Format

The skill produces:
- **Summary table**: Annual yield (kWh), specific yield (kWh/kWp), capacity factor (%), PR (%)
- **Monthly breakdown**: 12-month energy production table and bar chart
- **Loss waterfall**: Categorized losses from GHI to net AC output
- **Hourly profile**: Representative day power curves (summer/winter/equinox)

## Standards & References

- IEC 61853-1: Irradiance and temperature performance measurements
- IEC 61853-2: Spectral responsivity, incidence angle, module temperature
- IEC 61853-3: Energy rating of PV modules
- IEC 61724-1: PV system performance monitoring
- pvlib documentation: https://pvlib-python.readthedocs.io/

## Related Skills

- `weather-data-ingestion` — Prepare weather data inputs
- `p50-p90-analysis` — Uncertainty analysis on yield estimates
- `loss-tree` — Detailed loss categorization
- `energy-forecasting` — Time-series energy prediction
