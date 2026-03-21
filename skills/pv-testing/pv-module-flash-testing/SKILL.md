---
name: pv-module-flash-testing
version: 1.0.0
description: Generate PV module I-V flash test protocols under STC conditions, including temperature and irradiance correction per IEC 60891, measurement uncertainty analysis (GUM method), spectral mismatch correction, and full IV curve parameter extraction.
author: SuryaPrajna Contributors
license: MIT
tags:
  - flash-testing
  - iv-characterization
  - stc
  - iec-60904
  - temperature-correction
  - uncertainty
  - photovoltaic
dependencies:
  python:
    - pandas>=2.0
    - numpy>=1.24
    - matplotlib>=3.7
    - scipy>=1.10
  data:
    - Module datasheet (power, temperature coefficients)
    - Solar simulator calibration certificate
    - Reference cell calibration data
pack: pv-testing
agent: Pariksha-Agent
---

# pv-module-flash-testing

Generate comprehensive PV module I-V flash test protocols for module characterization under Standard Test Conditions (STC: 1000 W/m², 25°C, AM1.5G). Covers I-V curve measurement, STC correction using temperature and irradiance coefficients per IEC 60891, measurement uncertainty analysis using the GUM method, spectral mismatch correction, and complete parameter extraction (Pmax, Isc, Voc, FF, Imp, Vmp).

## Capabilities

### 1. Flash Test Protocol Design
Generate complete I-V measurement procedures:
- Solar simulator classification (IEC 60904-9): Class AAA, ABA, etc.
- Flash duration requirements (≥10 ms for multi-crystalline, ≥1 ms for c-Si)
- Reference cell selection and calibration requirements
- Module preconditioning (light soaking per IEC 61215 MQT 19)
- Multi-flash vs. single-flash measurement strategies

### 2. STC Correction Procedures
Correct measured data to Standard Test Conditions:
- Temperature correction using α (Isc), β (Voc), γ (Pmax) coefficients
- Irradiance correction (linear for current, logarithmic for voltage)
- IEC 60891 Procedure 1 (translation) and Procedure 2 (interpolation)
- Series resistance correction for large temperature deviations

### 3. Uncertainty Analysis (GUM Method)
Complete measurement uncertainty budget:
- Type A (statistical) and Type B (systematic) uncertainty components
- Irradiance measurement uncertainty
- Temperature measurement uncertainty
- Data acquisition system uncertainty
- Reference cell calibration uncertainty
- Combined standard uncertainty and expanded uncertainty (k=2)

### 4. Spectral Mismatch Correction
Account for simulator-to-AM1.5G spectral differences:
- Spectral mismatch factor (M) calculation per IEC 60904-7
- Spectral responsivity of test module and reference cell
- Simulator spectral irradiance characterization
- Correction for different cell technologies (c-Si, HJT, CdTe, CIGS)

### 5. IV Curve Parameter Extraction
Extract and validate all electrical parameters:
- Pmax, Imp, Vmp — Maximum power point
- Isc — Short-circuit current
- Voc — Open-circuit voltage
- FF — Fill factor
- Rs, Rsh — Series and shunt resistance estimates
- Diode ideality factor and single-diode model fitting

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `module_power_stc` | float | Yes | Nameplate power at STC in watts |
| `module_type` | string | Yes | Technology: "c-Si", "mc-Si", "HJT", "TOPCon", "CdTe", "CIGS" |
| `cell_type` | string | No | Specific cell type for spectral mismatch |
| `num_cells` | int | No | Number of cells in series |
| `irradiance` | float | No | Measured irradiance in W/m² (for correction) |
| `module_temperature` | float | No | Measured module temperature in °C (for correction) |
| `alpha_isc` | float | No | Temperature coefficient of Isc in %/°C (default varies by technology) |
| `beta_voc` | float | No | Temperature coefficient of Voc in %/°C (default varies by technology) |
| `gamma_pmax` | float | No | Temperature coefficient of Pmax in %/°C (default varies by technology) |
| `flash_duration` | float | No | Flash pulse duration in ms (default: 10) |
| `spectral_class` | string | No | Simulator spectral class: "A", "B", "C" per IEC 60904-9 |
| `simulator_class` | string | No | Overall simulator class: "AAA", "ABA", "ABB", etc. |

## Tool Definitions

### Tool: generate_flash_protocol

Generate the complete I-V flash test protocol.

**Parameters:**
- `module_power_stc` (float, required) — Nameplate STC power in watts
- `module_type` (string, required) — PV technology type
- `simulator_class` (string, optional) — Solar simulator classification

**Returns:** Complete flash test protocol with equipment setup, procedure, and measurement requirements.

### Tool: correct_to_stc

Correct measured I-V parameters to Standard Test Conditions.

**Parameters:**
- `Pmax_meas` (float, required) — Measured maximum power in watts
- `Isc_meas` (float, required) — Measured short-circuit current in amps
- `Voc_meas` (float, required) — Measured open-circuit voltage in volts
- `G_meas` (float, required) — Measured irradiance in W/m²
- `T_meas` (float, required) — Measured module temperature in °C
- `alpha_isc` (float, required) — Isc temperature coefficient in %/°C
- `beta_voc` (float, required) — Voc temperature coefficient in %/°C
- `gamma_pmax` (float, required) — Pmax temperature coefficient in %/°C

**Returns:** STC-corrected Pmax, Isc, Voc, FF, and correction factors applied.

### Tool: uncertainty_budget

Calculate measurement uncertainty per GUM method.

**Parameters:**
- `u_irradiance` (float, required) — Irradiance measurement uncertainty in %
- `u_temperature` (float, required) — Temperature measurement uncertainty in °C
- `u_daq` (float, required) — DAQ system uncertainty in %
- `u_ref_cell` (float, optional) — Reference cell calibration uncertainty in %
- `gamma_pmax` (float, required) — Pmax temperature coefficient in %/°C

**Returns:** Uncertainty budget table, combined standard uncertainty, and expanded uncertainty (k=2).

### Tool: spectral_mismatch

Calculate spectral mismatch correction factor.

**Parameters:**
- `module_type` (string, required) — PV technology type
- `ref_cell_type` (string, required) — Reference cell type
- `simulator_spectrum` (string, optional) — Path to simulator spectral data

**Returns:** Spectral mismatch factor M, corrected irradiance, and spectral correction uncertainty.

## Example Usage

### Flash Test with STC Correction

```
Prompt: "Perform STC correction for a 400W mono-PERC module measured at
1050 W/m² and 28°C. Temperature coefficient gamma = -0.34%/°C. Include
full uncertainty budget."
```

**Expected output:**

#### Module Under Test

| Specification | Value |
|---------------|-------|
| Technology | Mono-PERC (c-Si) |
| Nameplate power | 400 W (STC) |
| Num cells | 144 (half-cut, 72 × 2) |
| Isc (datasheet) | 10.8 A |
| Voc (datasheet) | 49.5 V |
| Imp (datasheet) | 10.25 A |
| Vmp (datasheet) | 39.0 V |
| α (Isc) | +0.048 %/°C |
| β (Voc) | -0.272 %/°C |
| γ (Pmax) | -0.34 %/°C |

#### Measurement Conditions

| Parameter | Measured Value | STC Target |
|-----------|---------------|------------|
| Irradiance (G) | 1050 W/m² | 1000 W/m² |
| Module temperature (T) | 28.0°C | 25.0°C |
| Spectrum | AM1.5G (Class A simulator) | AM1.5G |

#### Raw Measured Parameters

| Parameter | Measured Value |
|-----------|---------------|
| Pmax_meas | 410.0 W |
| Isc_meas | 11.42 A |
| Voc_meas | 48.9 V |
| Imp_meas | 10.75 A |
| Vmp_meas | 38.14 V |
| FF_meas | 73.4% |

#### STC Correction (IEC 60891 Procedure 1)

**Step 1: Power correction using γ (Pmax)**

The simplified correction for Pmax:

```
Pmax_STC = Pmax_meas × (G_STC / G_meas) × [1 + γ × (T_STC - T_meas)]
```

```
Pmax_STC = 410.0 × (1000/1050) × [1 + (-0.0034) × (25 - 28)]
         = 410.0 × 0.9524 × [1 + (-0.0034) × (-3)]
         = 410.0 × 0.9524 × [1 + 0.0102]
         = 410.0 × 0.9524 × 1.0102
         = 390.5 × 1.0102
         = **394.5 W**
```

**Step 2: Current correction using α (Isc)**

```
Isc_STC = Isc_meas × (G_STC / G_meas) × [1 + α × (T_STC - T_meas)]
        = 11.42 × (1000/1050) × [1 + 0.00048 × (25 - 28)]
        = 11.42 × 0.9524 × [1 + (-0.00144)]
        = 10.877 × 0.99856
        = **10.86 A**
```

**Step 3: Voltage correction using β (Voc)**

```
Voc_STC = Voc_meas × [1 + β × (T_STC - T_meas)]
        = 48.9 × [1 + (-0.00272) × (25 - 28)]
        = 48.9 × [1 + 0.00816]
        = 48.9 × 1.00816
        = **49.30 V**
```

**Step 4: Fill factor and corrected Imp, Vmp**

```
FF_STC = Pmax_STC / (Isc_STC × Voc_STC)
       = 394.5 / (10.86 × 49.30)
       = 394.5 / 535.4
       = 73.7%

Imp_STC ≈ Imp_meas × (G_STC/G_meas) × [1 + α × (T_STC - T_meas)]
        = 10.75 × 0.9524 × 0.99856 = 10.22 A

Vmp_STC ≈ Vmp_meas × [1 + β × (T_STC - T_meas)]
        = 38.14 × 1.00816 = 38.45 V
```

#### STC-Corrected Results Summary

| Parameter | Measured | STC Corrected | Datasheet |
|-----------|----------|---------------|-----------|
| Pmax | 410.0 W | **394.5 W** | 400 W |
| Isc | 11.42 A | **10.86 A** | 10.8 A |
| Voc | 48.9 V | **49.30 V** | 49.5 V |
| Imp | 10.75 A | **10.22 A** | 10.25 A |
| Vmp | 38.14 V | **38.45 V** | 39.0 V |
| FF | 73.4% | **73.7%** | 74.7% |

**Deviation from nameplate:** (394.5 - 400) / 400 = **-1.4%** (within typical ±3% binning tolerance)

#### Measurement Uncertainty Budget (GUM Method)

**Uncertainty sources and contributions:**

| Source | Type | Distribution | Value | Sensitivity | Contribution to u(Pmax) |
|--------|------|-------------|-------|-------------|------------------------|
| Irradiance (G) | B | Rectangular | ±1.5% | 1.0 | 1.50% |
| Temperature (T) | B | Rectangular | ±0.5°C | 0.34%/°C | 0.17% |
| DAQ voltage | B | Rectangular | ±0.1% | 1.0 | 0.10% |
| DAQ current | B | Rectangular | ±0.1% | 1.0 | 0.10% |
| Reference cell calibration | B | Normal (k=2) | ±1.0% | 1.0 | 0.50% |
| Spectral mismatch | B | Rectangular | ±0.5% | 1.0 | 0.50% |
| Non-uniformity | B | Rectangular | ±1.0% | 0.5 | 0.50% |
| Temporal instability | B | Rectangular | ±0.5% | 1.0 | 0.50% |
| Temperature correction | B | Rectangular | ±0.02%/°C | 3°C | 0.06% |

**Combined standard uncertainty (RSS method):**

```
u_c(Pmax) = √(1.50² + 0.17² + 0.10² + 0.10² + 0.50² + 0.50² + 0.50² + 0.50² + 0.06²)
          = √(2.250 + 0.029 + 0.010 + 0.010 + 0.250 + 0.250 + 0.250 + 0.250 + 0.004)
          = √3.303
          = **1.82%**
```

**Expanded uncertainty (coverage factor k=2, ~95% confidence):**

```
U(Pmax) = k × u_c = 2 × 1.82% = **±3.64%**
```

**Pmax with uncertainty:**
```
Pmax_STC = 394.5 W ± 14.4 W (k=2, 95% confidence)
         = 394.5 W ± 3.64%
```

#### Solar Simulator Requirements

**IEC 60904-9 Classification (AAA simulator):**

| Characteristic | Class A Requirement | Typical Value |
|---------------|-------------------|---------------|
| Spectral match | 0.75-1.25 (each band) | 0.90-1.10 |
| Non-uniformity | ≤ ±2% | ±1.0% |
| Temporal instability | ≤ ±2% (short-term) | ±0.5% |
| Flash duration | ≥ 1 ms (c-Si) | 10 ms |
| Test area | ≥ module area | 2.2 × 1.3 m |

**Spectral bands (IEC 60904-9:2020):**

| Band | Wavelength Range | AM1.5G Fraction | Acceptable Range |
|------|-----------------|-----------------|-----------------|
| 1 | 300-400 nm | 3.2% | 2.4-4.0% |
| 2 | 400-500 nm | 16.0% | 12.0-20.0% |
| 3 | 500-600 nm | 15.7% | 11.8-19.6% |
| 4 | 600-700 nm | 14.4% | 10.8-18.0% |
| 5 | 700-800 nm | 12.2% | 9.2-15.3% |
| 6 | 800-900 nm | 10.0% | 7.5-12.5% |
| 7 | 900-1100 nm | 15.5% | 11.6-19.4% |
| 8 | 1100-1400 nm | 13.0% | 9.8-16.3% |

#### Test Procedure (Step-by-Step)

1. **Module preconditioning:**
   - Light soak per IEC 61215-2 MQT 19 (5 kWh/m² minimum)
   - Allow module to stabilize (power variation <2% over consecutive measurements)

2. **Setup:**
   - Mount module on temperature-controlled plate
   - Attach calibrated reference cell (matched technology)
   - Connect 4-wire sensing leads to module terminals
   - Verify simulator classification (spectral, uniformity, stability)

3. **Temperature stabilization:**
   - Cool module to 25°C ± 1°C
   - Monitor rear-surface thermocouple (centered)
   - Wait for temperature equilibrium (drift <0.5°C/min)

4. **Flash measurement:**
   - Trigger flash and sweep I-V curve from Isc to Voc
   - Capture ≥100 I-V data points across curve
   - Record irradiance (reference cell) and temperature simultaneously
   - Repeat measurement 3-5 times for statistical averaging

5. **Data processing:**
   - Average multiple sweeps
   - Apply STC corrections per IEC 60891
   - Extract parameters: Pmax, Isc, Voc, FF, Imp, Vmp
   - Calculate measurement uncertainty
   - Compare to nameplate specifications

## Output Format

The skill produces:
- **Flash test protocol** — Equipment setup, simulator requirements, step-by-step procedure
- **STC correction worksheet** — Raw measurements, correction factors, corrected values
- **Uncertainty budget** — Complete GUM analysis with combined and expanded uncertainty
- **I-V curve report** — Plotted I-V and P-V curves with extracted parameters
- **Spectral mismatch report** — Mismatch factor and correction (if applicable)
- **Comparison table** — Measured vs. datasheet vs. tolerance limits

## Standards & References

- IEC 60904-1:2020 — PV devices — Part 1: Measurement of PV current-voltage characteristics
- IEC 60904-7:2019 — Part 7: Computation of the spectral mismatch correction
- IEC 60904-9:2020 — Part 9: Classification and requirements of solar simulators
- IEC 60891:2021 — PV devices — Procedures for temperature and irradiance corrections
- IEC 61853-1:2011 — PV module performance testing — Irradiance and temperature dependence
- JCGM 100:2008 (GUM) — Evaluation of measurement data — Guide to the expression of uncertainty
- IEC 61215-2:2021 — §4.2 (MQT 02, Maximum power determination)
- IEC 61215-2:2021 — §4.19 (MQT 19, Stabilization procedure)

## Related Skills

- `iec-61215-protocol` — Complete IEC 61215 test sequence (flash test is MQT 02)
- `thermal-cycling` — STC measurement used pre/post thermal cycling
- `damp-heat-testing` — STC measurement used pre/post damp heat
- `mechanical-load` — STC measurement used pre/post mechanical load
- `iec-61730-safety` — Post-safety-test power verification
- `el-imaging` — Complementary EL imaging for defect identification
