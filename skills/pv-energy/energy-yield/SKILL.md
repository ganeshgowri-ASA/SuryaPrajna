---
name: energy-yield
version: 1.0.0
description: Annual and lifetime energy yield simulation for PV systems — combines weather data, system design, and loss modeling to produce bankable yield estimates.
author: SuryaPrajna Contributors
license: MIT
tags:
  - energy-yield
  - simulation
  - photovoltaic
  - bankability
  - annual-yield
dependencies:
  python:
    - pvlib>=0.11.0
    - pandas>=2.0
    - numpy>=1.24
    - matplotlib>=3.7
  data:
    - TMY or multi-year weather dataset (CSV, EPW, or HDF5)
pack: pv-energy
agent: Phala-Agent
---

# energy-yield

Comprehensive annual and lifetime energy yield simulation for photovoltaic systems. Combines meteorological data, system configuration, and detailed loss modeling to produce bankable yield estimates suitable for financial close.

## LLM Instructions

### Role Definition
You are a **senior energy yield analyst** with expertise in PV performance modeling, bankable yield assessments, and independent engineer (IE) reporting. You produce yield estimates that meet lender requirements for project finance and understand the difference between P50, P75, and P90 yield scenarios.

### Thinking Process
1. **Define project scope** — System capacity (kWp/MWp), location, technology, mounting type
2. **Source weather data** — Identify best available dataset (TMY, satellite, ground-measured), assess data quality
3. **Configure system model** — Module, inverter, array geometry, tracking, DC/AC ratio
4. **Apply loss model** — Soiling, shading, mismatch, wiring, availability, degradation, clipping, transformer
5. **Run simulation** — Hourly or sub-hourly time-step, full year or multi-year
6. **Calculate key metrics** — Annual yield (MWh), specific yield (kWh/kWp), capacity factor (%), PR (%)
7. **Assess uncertainty** — Weather variability, model uncertainty, equipment uncertainty
8. **Report results** — Summary, monthly breakdown, loss waterfall, lifetime projection

### Output Format
- Start with **project summary table**: capacity, location, tilt/azimuth, DC/AC ratio
- Provide **annual yield summary**: gross yield, net yield (P50), specific yield, capacity factor, PR
- Include **monthly energy table** with GHI, POA, and net AC columns
- Show **loss waterfall** from incident irradiance to net AC (percentage and absolute)
- Provide **lifetime yield projection** (25 or 30 years) with annual degradation
- Include **working Python code** with inline comments
- Use SI units: kWh/m² for irradiation, MWh for energy, kWp/MWp for capacity

### Quality Criteria
- [ ] Specific yield is within expected range for location and climate zone
- [ ] Loss stack totals 10-25% for well-designed systems
- [ ] Individual loss categories are within industry norms (soiling 2-5%, temperature 3-8%, mismatch 1-2%)
- [ ] DC/AC ratio is reasonable (1.1-1.4)
- [ ] Annual degradation rate is appropriate for technology (0.4-0.7%/year for c-Si)
- [ ] PR is within expected range (75-85% for fixed-tilt, higher for tracking)
- [ ] Monthly profile follows expected seasonal pattern

### Common Pitfalls
- **Do not** confuse DC yield with AC yield — always specify which is being reported
- **Do not** omit transformer losses for utility-scale projects (1-2%)
- **Do not** use a single loss factor without itemizing component losses
- **Do not** ignore inter-annual variability — single-year TMY is P50 by definition
- **Do not** forget availability losses (typically 1-3%)
- **Do not** apply degradation to Year 1 yield — Year 1 is the reference

### Example Interaction Patterns
**Pattern 1 — Bankable Yield Report:**
User: "Generate energy yield estimate for a 50 MWp plant in Gujarat"
-> Define location -> Source TMY -> Configure system -> Apply losses -> Run simulation -> Produce yield report with P50/P75/P90

**Pattern 2 — Technology Comparison:**
User: "Compare yield for mono-PERC vs bifacial for same site"
-> Same location/weather -> Two module configs -> Run both -> Compare specific yield -> Report bifacial gain

**Pattern 3 — Lifetime Projection:**
User: "Project 25-year cumulative energy for a 10 MWp rooftop"
-> Year 1 simulation -> Apply degradation curve -> Calculate cumulative yield -> Present lifetime table

## Capabilities

### 1. Hourly Energy Simulation
Run time-step simulation using pvlib ModelChain or custom model pipeline for full-year energy calculation.

### 2. Loss Stack Construction
Build comprehensive loss waterfall: irradiance losses (shading, soiling, IAM, spectral), DC losses (temperature, mismatch, wiring, LID), and AC losses (inverter efficiency, clipping, transformer, availability).

### 3. Specific Yield & Performance Ratio
Calculate key bankability metrics: specific yield (kWh/kWp), capacity factor (%), and performance ratio (%).

### 4. Multi-Year & Lifetime Projection
Project energy generation over 25-30 year lifetime with configurable annual degradation rates and component replacement schedules.

### 5. Bifacial Yield Modeling
Model rear-side irradiance gain for bifacial modules using view factor or ray-tracing approaches.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `capacity_kwp` | float | Yes | System DC capacity in kWp |
| `latitude` | float | Yes | Site latitude in decimal degrees |
| `longitude` | float | Yes | Site longitude in decimal degrees |
| `tilt` | float | Yes | Array tilt angle in degrees |
| `azimuth` | float | Yes | Array azimuth in degrees (180 = south) |
| `module` | string | Yes | Module name or parameters |
| `inverter` | string | Yes | Inverter name or parameters |
| `dc_ac_ratio` | float | No | DC to AC capacity ratio (default: 1.2) |
| `weather_data` | file | Yes | Weather data file (TMY, EPW, CSV) |
| `losses` | object | No | Itemized loss parameters |
| `degradation_rate` | float | No | Annual degradation rate in %/year (default: 0.5) |
| `project_life` | int | No | Project lifetime in years (default: 25) |
| `tracking` | string | No | "fixed", "single_axis", "dual_axis" (default: "fixed") |
| `bifacial` | boolean | No | Enable bifacial modeling (default: false) |

## Example Usage

### Bankable Energy Yield Estimate

```
Prompt: "Calculate annual energy yield for a 50 MWp ground-mount plant at
latitude 23.0, longitude 72.6 (Gujarat, India). Mono-PERC modules, fixed tilt
22 degrees, south-facing, DC/AC ratio 1.25. Include full loss stack."
```

**Expected workflow:**
1. Load TMY weather data for Gujarat
2. Configure 50 MWp system with specified parameters
3. Apply full loss stack (soiling, temperature, mismatch, wiring, inverter, transformer, availability)
4. Run hourly simulation
5. Calculate P50 annual yield, specific yield, capacity factor, PR
6. Generate monthly breakdown and loss waterfall
7. Project 25-year lifetime yield with 0.5%/year degradation

### Example Code

```python
import pvlib
import pandas as pd
import numpy as np
from pvlib.location import Location
from pvlib.pvsystem import PVSystem
from pvlib.modelchain import ModelChain

# Define location
location = Location(
    latitude=23.0, longitude=72.6,
    tz='Asia/Kolkata', altitude=55, name='Gujarat'
)

# System configuration
system = PVSystem(
    surface_tilt=22,
    surface_azimuth=180,
    module_parameters=module_params,
    inverter_parameters=inverter_params,
    temperature_model_parameters=temp_params,
    modules_per_string=28,
    strings_per_inverter=400
)

# Run simulation
mc = ModelChain(system, location)
# mc.run_model(weather_data)

# Post-processing losses
losses = {
    'soiling': 0.03,
    'shading': 0.02,
    'mismatch': 0.015,
    'wiring_dc': 0.015,
    'wiring_ac': 0.005,
    'transformer': 0.015,
    'availability': 0.02,
}

# Apply losses to get net yield
total_loss_factor = np.prod([1 - v for v in losses.values()])
# net_yield = mc.results.ac.sum() / 1e6 * total_loss_factor  # MWh

# Lifetime projection
degradation = 0.005  # 0.5%/year
lifetime_years = 25
# annual_yields = [net_yield * (1 - degradation) ** year for year in range(lifetime_years)]
```

## Output Format

The skill produces:
- **Project summary**: Capacity, location, configuration, DC/AC ratio
- **Yield summary table**: Gross yield, net yield, specific yield, capacity factor, PR
- **Monthly breakdown**: GHI, POA irradiation, DC energy, AC energy (net) by month
- **Loss waterfall**: Each loss category as percentage and absolute (MWh)
- **Lifetime projection**: Year-by-year yield with cumulative total

## Standards & References

- IEC 61724-1: PV system performance monitoring
- IEC 61853-3: Energy rating of PV modules
- IEC 62446-1: Grid-connected PV systems — documentation, commissioning, inspection
- PVPS Task 13: Uncertainty in yield assessments

## Related Skills

- `pvlib-analysis` — Core pvlib simulation engine
- `p50-p90-analysis` — Uncertainty and exceedance probability
- `loss-tree` — Detailed loss categorization and analysis
- `weather-data-ingestion` — Weather data sourcing and quality control
- `solar-resource-assessment` — Site solar resource evaluation
