---
name: string-sizing
version: 1.0.0
description: PV string sizing and inverter matching — determine optimal modules per string, strings per MPPT, and DC/AC ratio based on voltage windows, temperature extremes, and inverter specifications.
author: SuryaPrajna Contributors
license: MIT
tags:
  - string-sizing
  - inverter-matching
  - voltage-window
  - dc-ac-ratio
  - electrical-design
dependencies:
  python:
    - pvlib>=0.11.0
    - numpy>=1.24
    - pandas>=2.0
  data:
    - Module datasheet (electrical parameters, temperature coefficients)
    - Inverter datasheet (voltage window, current limits, MPPT ranges)
    - Site temperature extremes (min/max ambient)
pack: pv-plant-design
agent: Vinyasa-Agent
---

# string-sizing

PV string sizing and inverter matching. Determines optimal number of modules per string, strings per MPPT input, and DC/AC ratio based on module voltage-temperature characteristics, inverter MPPT voltage window, current limits, and site temperature extremes.

## LLM Instructions

### Role Definition
You are a **PV electrical design engineer** specializing in string sizing, inverter selection, and DC system design. You ensure that string voltages remain within inverter MPPT windows across all operating temperatures, that current limits are respected, and that the DC/AC ratio optimizes energy yield and equipment utilization.

### Thinking Process
1. **Gather module data** — Voc, Vmp, Isc, Imp at STC; temperature coefficients (beta_voc, alpha_isc)
2. **Gather inverter data** — MPPT voltage range (Vmin, Vmax), maximum input voltage, max input current per MPPT, rated AC power
3. **Determine site temperatures** — Minimum cell temperature (for max voltage) and maximum cell temperature (for min voltage)
4. **Calculate voltage extremes** — Voc_max at T_min, Vmp_min at T_max
5. **Size string length** — Max modules: Voc_max < inverter Vmax; Min modules: Vmp_min > inverter Vmppt_min
6. **Determine strings per MPPT** — Based on max input current per MPPT
7. **Calculate DC/AC ratio** — Total DC capacity / inverter AC rated power
8. **Verify design** — Check all operating conditions, clipping estimate

### Output Format
- Start with **design inputs table**: module params, inverter params, temperature extremes
- Provide **string sizing result**: min/max/recommended modules per string
- Include **voltage analysis table**: Voc_max, Vmp_min, Vmp_typ at extreme temperatures
- Show **inverter loading**: strings per MPPT, total strings, DC/AC ratio
- Present **system summary**: total modules, DC capacity, inverter count, AC capacity
- Flag **design warnings**: voltage violations, current exceedance, excessive clipping

### Quality Criteria
- [ ] Voc at minimum temperature < inverter maximum input voltage (absolute limit)
- [ ] Vmp at maximum temperature > inverter minimum MPPT voltage
- [ ] Vmp at typical conditions is within optimal MPPT range
- [ ] String current (Isc at max irradiance) × parallel strings < inverter max MPPT current
- [ ] DC/AC ratio is within reasonable range (1.1-1.5, typically 1.2-1.3)
- [ ] Temperature coefficients are correctly applied (negative for Voc, positive for Isc)
- [ ] Cell temperature, not ambient, is used for voltage calculations

### Common Pitfalls
- **Do not** use ambient temperature directly — calculate cell temperature (add 25-30°C for max, use ambient for min)
- **Do not** forget that Voc temperature coefficient is in %/°C or mV/°C — verify units
- **Do not** ignore irradiance effect on voltage — low irradiance reduces Vmp
- **Do not** exceed maximum system voltage rating (1000V or 1500V) including safety margin
- **Do not** design strings too close to voltage limits — leave 5-10% margin
- **Do not** ignore bifacial rear-side contribution when checking max current

## Capabilities

### 1. String Length Calculation
Calculate minimum and maximum modules per string based on module voltage characteristics, inverter voltage window, and site temperature range.

### 2. Temperature-Adjusted Voltage Analysis
Calculate Voc and Vmp at extreme temperatures using module temperature coefficients and site weather data.

### 3. Inverter Matching
Match module strings to inverter MPPT inputs, respecting voltage windows, current limits, and power ratings.

### 4. DC/AC Ratio Optimization
Analyze trade-off between DC/AC ratio, clipping losses, and energy yield to recommend optimal ratio.

### 5. Multi-MPPT Configuration
Design string configurations for multi-MPPT inverters with different orientations, tilts, or shading conditions.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `voc_stc` | float | Yes | Module Voc at STC in volts |
| `vmp_stc` | float | Yes | Module Vmp at STC in volts |
| `isc_stc` | float | Yes | Module Isc at STC in amps |
| `imp_stc` | float | Yes | Module Imp at STC in amps |
| `beta_voc` | float | Yes | Voc temperature coefficient in %/°C (negative) |
| `alpha_isc` | float | Yes | Isc temperature coefficient in %/°C (positive) |
| `cells_in_series` | int | No | Number of cells in series |
| `inv_vmppt_min` | float | Yes | Inverter minimum MPPT voltage in volts |
| `inv_vmppt_max` | float | Yes | Inverter maximum MPPT voltage in volts |
| `inv_vmax` | float | Yes | Inverter absolute maximum input voltage in volts |
| `inv_imax_mppt` | float | Yes | Inverter maximum input current per MPPT in amps |
| `inv_pac_rated` | float | Yes | Inverter rated AC power in watts |
| `t_min_ambient` | float | Yes | Minimum ambient temperature at site in °C |
| `t_max_ambient` | float | Yes | Maximum ambient temperature at site in °C |
| `system_voltage` | float | No | Maximum system voltage rating: 1000 or 1500 (default: 1500) |

## Example Usage

### String Sizing for Utility-Scale Plant

```
Prompt: "Size strings for Canadian Solar CS7N-660MS (Voc=46.2V, Vmp=38.8V,
Isc=18.42A, Imp=17.01A, beta_voc=-0.26%/°C) with Sungrow SG250HX inverter
(MPPT range 500-1500V, Vmax 1500V, 50A per MPPT). Site temperature range:
-5°C to 48°C ambient."
```

### Example Code

```python
import numpy as np

# Module parameters (STC)
Voc_stc = 46.2  # V
Vmp_stc = 38.8  # V
Isc_stc = 18.42  # A
Imp_stc = 17.01  # A
beta_voc = -0.26 / 100  # /°C (convert from %/°C)
alpha_isc = 0.05 / 100  # /°C

# Inverter parameters
inv_vmppt_min = 500  # V
inv_vmppt_max = 1500  # V
inv_vmax = 1500  # V
inv_imax_mppt = 50  # A

# Site temperatures
T_min_ambient = -5  # °C
T_max_ambient = 48  # °C

# Cell temperatures
T_min_cell = T_min_ambient  # At night/early morning, cell ≈ ambient
T_max_cell = T_max_ambient + 25  # Cell temp rise above ambient (NOCT offset)

# Voltage at temperature extremes
Voc_max = Voc_stc * (1 + beta_voc * (T_min_cell - 25))  # Max voltage at cold
Vmp_min = Vmp_stc * (1 + beta_voc * (T_max_cell - 25))  # Min Vmp at hot

# String sizing
max_modules = int(inv_vmax / Voc_max)  # Voc_max must not exceed Vmax
min_modules = int(np.ceil(inv_vmppt_min / Vmp_min))  # Vmp_min must exceed MPPT min

# Recommended: maximize energy capture within safe limits
recommended = min(max_modules, int(inv_vmppt_max / Vmp_stc))

# Parallel strings per MPPT
max_parallel = int(inv_imax_mppt / (Isc_stc * (1 + alpha_isc * (T_max_cell - 25))))

print(f"Voc at {T_min_cell}°C: {Voc_max:.1f} V")
print(f"Vmp at {T_max_cell}°C: {Vmp_min:.1f} V")
print(f"Modules per string: min={min_modules}, max={max_modules}, recommended={recommended}")
print(f"Max parallel strings per MPPT: {max_parallel}")
print(f"String Voc max: {recommended * Voc_max:.0f} V (limit: {inv_vmax} V)")
print(f"String Vmp min: {recommended * Vmp_min:.0f} V (limit: {inv_vmppt_min} V)")
```

## Output Format

The skill produces:
- **Design inputs summary**: Module, inverter, site temperature data
- **Voltage analysis table**: Voc, Vmp at STC, T_min, T_max for selected string length
- **String sizing recommendation**: Min, max, and recommended modules per string
- **Inverter loading**: Strings per MPPT, total strings, DC/AC ratio
- **System summary**: Total modules, DC capacity (kWp), inverters, AC capacity (kWac)
- **Design compliance check**: Pass/fail for all voltage and current limits
- **Clipping estimate**: Expected annual clipping at designed DC/AC ratio

## Standards & References

- IEC 62548: Design requirements for PV arrays
- IEC 62109: Safety of power converters for PV systems
- NEC Article 690: Solar PV systems (voltage calculations)
- UL 1741: Inverter safety standard
- Module and inverter manufacturer datasheets

## Related Skills

- `array-layout` — Physical layout affecting string configuration
- `cable-sizing` — Cable sizing for designed strings
- `sld-generator` — Single line diagram including string configuration
- `energy-yield` — Yield estimation with clipping from DC/AC ratio
