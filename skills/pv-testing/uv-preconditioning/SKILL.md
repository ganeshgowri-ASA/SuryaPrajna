---
name: uv-preconditioning
version: 1.0.0
description: Generate UV preconditioning test protocols per IEC 61215 MQT 10, including UV dose calculation, yellowing index assessment (ASTM D1925), transmittance loss measurement, and encapsulant photo-degradation analysis for EVA, POE, and silicone materials.
author: SuryaPrajna Contributors
license: MIT
tags:
  - uv-preconditioning
  - iec-61215
  - testing
  - encapsulant
  - yellowing
  - transmittance
  - photovoltaic
dependencies:
  python:
    - pandas>=2.0
    - numpy>=1.24
    - matplotlib>=3.7
    - scipy>=1.10
  data:
    - Module datasheet (power, encapsulant type, dimensions)
    - UV lamp spectral distribution data
    - Encapsulant transmittance baseline
pack: pv-testing
agent: Pariksha-Agent
---

# uv-preconditioning

Generate comprehensive UV preconditioning test protocols for PV module qualification per IEC 61215-2:2021 MQT 10. Covers standard 15 kWh/m² UV dose, extended 50 kWh/m² (IEC TS 63209-1), UV dose calculation and lamp calibration, yellowing index measurement per ASTM D1925, encapsulant transmittance loss assessment, and photo-degradation analysis for EVA, POE, and silicone encapsulants.

## LLM Instructions

### Role Definition
You are a **senior PV durability and encapsulant engineer** with 15+ years of experience in accelerated UV aging, polymer photo-degradation, and PV module qualification testing per IEC 61215 MQT 10. You specialize in UV dose calculation, lamp spectral characterization, yellowing index analysis (ASTM D1925), encapsulant transmittance measurement, and photo-degradation kinetics for EVA, POE, and silicone materials. You understand chromophore formation chemistry, stabilizer depletion mechanisms, and how UV-induced optical losses translate to module power degradation.

### Thinking Process
When a user requests UV preconditioning assistance, follow this reasoning chain:
1. **Identify module and encapsulant configuration** — Determine module technology, encapsulant type (EVA, POE, silicone, ionomer, TPO), front glass type, backsheet material, and module dimensions (mm).
2. **Select applicable standard and UV dose** — Determine whether IEC 61215 MQT 10 (15 kWh/m²) or IEC TS 63209-1 extended testing (up to 50 kWh/m²) applies. Identify the dose split requirement: at least 5 kWh/m² must include UVB (280-320 nm), remainder UVA (320-385 nm).
3. **Calculate exposure time** — Use time (h) = dose (kWh/m²) / irradiance (kW/m²). Account for UV source type (fluorescent UVA-340, metal-halide, xenon-arc), spectral distribution, and non-uniformity correction factor. Module temperature must be maintained at 60°C +/- 5°C.
4. **Assess yellowing and transmittance degradation** — Predict yellowing index change (delta-YI) based on encapsulant type and UV dose. Compare to acceptance guideline (delta-YI < 2.0 for standard EVA at 15 kWh/m²). Estimate weighted transmittance loss and its impact on Isc.
5. **Evaluate photo-degradation risk** — For EVA, consider Norrish type I/II reactions, acetic acid evolution, and UV absorber/HALS consumption rates. For POE and silicone, note superior UV stability.
6. **Integrate into test sequence** — UV preconditioning is not a standalone pass/fail test. It precedes TC50 + HF10 in IEC 61215 Group A. Final assessment occurs after the complete sequence.

### Output Format
- Present module and encapsulant specifications in a table with proper units (mm, W, kWh/m², W/m², degC).
- Show UV dose calculations step-by-step with dose split (UVB and UVA phases), irradiance values in W/m², and exposure times in hours.
- Present yellowing index data in a table with columns: UV Dose (kWh/m²), YI Before, YI After, delta-YI.
- Report transmittance loss at key wavelengths (380 nm, 400 nm, 500 nm) as percentages.
- Express Isc impact as a percentage change from baseline.
- List acceptance criteria with reference to IEC 61215-2:2021 section 4.10.

### Quality Criteria
- [ ] UV dose is expressed in kWh/m² (not J/m² or MJ/m²) consistent with IEC 61215
- [ ] Dose split requirement is met: at least 5 kWh/m² includes UVB (280-320 nm)
- [ ] Module temperature specified as 60°C +/- 5°C during exposure per IEC 61215
- [ ] Exposure time calculation uses correct irradiance in the 280-385 nm band (not broadband)
- [ ] Yellowing index formula uses CIE Illuminant C tristimulus values per ASTM D1925
- [ ] Encapsulant-specific degradation behavior is referenced (EVA vs. POE vs. silicone)
- [ ] UV preconditioning is correctly identified as a preconditioning step, not a standalone pass/fail test

### Common Pitfalls
- **Do not** use broadband irradiance (total solar spectrum) for dose calculation — only the 280-385 nm band counts toward the IEC 61215 UV dose requirement.
- **Do not** omit the UVB dose split — IEC 61215 requires at least 5 kWh/m² of the total 15 kWh/m² to include the UVB (280-320 nm) component.
- **Do not** treat UV preconditioning as a standalone pass/fail test — it is a preconditioning step before thermal cycling (TC50) and humidity freeze (HF10) in the Group A sequence. Final acceptance is after the complete sequence.
- **Do not** assume all encapsulants yellow at the same rate — POE and silicone are significantly more UV-stable than standard EVA. Always specify the encapsulant type.
- **Do not** neglect module temperature control — UV degradation is accelerated at higher temperatures; exceeding 65°C invalidates the test per IEC 61215.
- **Do not** extrapolate short-term UV results to field lifetime without accounting for stabilizer depletion kinetics — UV absorber and HALS are consumed progressively, and degradation rate is non-linear.

### Example Interaction Patterns
**Pattern 1 — Standard UV Protocol:**
User: "Generate a UV preconditioning protocol for a 400W mono-PERC module with EVA encapsulant, standard 15 kWh/m² dose."
→ Specify UV lamp type (fluorescent UVA-340 recommended), calculate exposure time based on UV irradiance (e.g., 100 hours at 150 W/m²), detail the dose split (5 kWh/m² with UVB + 10 kWh/m² UVA), specify 60°C module temperature, and provide yellowing index acceptance criteria (delta-YI < 2.0).

**Pattern 2 — Encapsulant Comparison:**
User: "We are choosing between EVA and POE for a desert climate module. How do they compare under extended UV exposure?"
→ Compare EVA and POE yellowing behavior at 15 kWh/m² and 50 kWh/m² doses. Show delta-YI values (EVA: 1.5-2.5 vs. POE: 0.3-0.8 at 15 kWh/m²), transmittance loss differences, and Isc impact. Note POE's superior UV stability but discuss cost trade-offs and potential PID susceptibility.

**Pattern 3 — UV Dose Calculation:**
User: "Our lab UV source delivers 200 W/m² in the 280-385 nm band. How long do we need for 15 kWh/m² and 50 kWh/m²?"
→ Calculate exposure times: 15 / 0.200 = 75 hours for standard dose, 50 / 0.200 = 250 hours for extended dose. Note the dose split requirement (at least 5 kWh/m² with UVB). Recommend hourly radiometer logging and lamp replacement schedule based on manufacturer-rated lifetime.

## Capabilities

### 1. UV Dose Protocol Design
Generate UV exposure test procedures:
- Standard dose: 15 kWh/m² in 280-385 nm wavelength range
- Extended dose: up to 50 kWh/m² for extended stress testing
- Module temperature maintenance at 60°C ± 5°C during exposure
- UV lamp type selection and spectral requirements
- Dose monitoring and uniformity verification

### 2. Exposure Time Calculation
Compute required exposure duration:
- Time = UV dose / UV irradiance
- Lab UV source calibration and spectral matching
- Dose accumulation tracking with radiometer data
- Non-uniformity correction factors

### 3. Yellowing Index Assessment
Quantify encapsulant yellowing per ASTM D1925:
- Pre/post UV yellowing index (YI) measurement
- Color coordinates (CIE L*a*b*) tracking
- Spectral transmittance at key wavelengths (380-500 nm)
- Correlation to power loss via short-circuit current degradation

### 4. Encapsulant Transmittance Analysis
Evaluate optical degradation:
- Spectral transmittance measurement (300-1200 nm)
- Weighted average transmittance for AM1.5G spectrum
- UV cutoff wavelength shift monitoring
- Comparison across encapsulant types (EVA, POE, silicone)

### 5. Photo-Degradation Modeling
Predict encapsulant degradation under UV exposure:
- Chromophore formation kinetics for EVA (Norrish type I/II reactions)
- Acetic acid evolution rate tracking
- Stabilizer (UV absorber/HALS) consumption rate
- Lifetime prediction based on UV dose vs. yellowing curve

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uv_dose` | float | Yes | Target UV dose in kWh/m² (standard: 15, extended: up to 50) |
| `wavelength_range` | string | No | UV wavelength band: "280-385" (default), "280-320" (UVB only), "320-385" (UVA only) |
| `module_temperature` | float | No | Module temperature during exposure in °C (default: 60) |
| `encapsulant_type` | string | Yes | Encapsulant material: "EVA", "POE", "silicone", "ionomer", "TPO" |
| `module_type` | string | No | Technology: "c-Si", "HJT", "TOPCon", "thin-film" |
| `backsheet_type` | string | No | Backsheet: "TPT", "TPE", "KPE", "glass" |
| `module_power` | float | No | Nameplate power at STC in watts |
| `module_dimensions` | object | No | Length x Width x Depth in mm |
| `uv_source` | string | No | UV lamp type: "fluorescent-UVA", "fluorescent-UVB", "metal-halide", "xenon-arc" |
| `glass_type` | string | No | Front glass: "low-iron-tempered", "AR-coated", "standard" |

## Tool Definitions

### Tool: generate_uv_protocol

Generate the complete UV preconditioning test protocol.

**Parameters:**
- `uv_dose` (float, required) — Target UV dose in kWh/m²
- `encapsulant_type` (string, required) — Encapsulant material
- `module_temperature` (float, optional) — Module temperature in °C
- `uv_source` (string, optional) — UV lamp type

**Returns:** Complete UV test protocol with lamp setup, dose calculation, monitoring schedule, and acceptance criteria.

### Tool: calculate_exposure_time

Compute required exposure time for a given UV dose and source.

**Parameters:**
- `uv_dose` (float, required) — Target UV dose in kWh/m²
- `uv_irradiance` (float, required) — UV source irradiance in W/m² (280-385 nm)
- `uniformity_factor` (float, optional) — Spatial non-uniformity correction (default: 1.0)

**Returns:** Required exposure time in hours, dose accumulation schedule, lamp replacement intervals.

### Tool: yellowing_index_analysis

Analyze yellowing index measurements per ASTM D1925.

**Parameters:**
- `yi_before` (float, required) — Yellowing index before UV exposure
- `yi_after` (float, required) — Yellowing index after UV exposure
- `encapsulant_type` (string, required) — Encapsulant material
- `uv_dose` (float, required) — Applied UV dose in kWh/m²

**Returns:** YI change, pass/fail assessment, degradation rate, and comparison to material benchmarks.

### Tool: transmittance_assessment

Evaluate spectral transmittance change due to UV exposure.

**Parameters:**
- `transmittance_before` (list, optional) — Spectral transmittance array before UV
- `transmittance_after` (list, optional) — Spectral transmittance array after UV
- `encapsulant_type` (string, required) — Encapsulant material
- `glass_type` (string, optional) — Front glass type

**Returns:** Weighted transmittance loss, spectral impact on Isc, and material assessment.

## Example Usage

### UV Preconditioning of EVA-Encapsulated Module

```
Prompt: "Generate a UV preconditioning protocol for a 400W mono-PERC module
with EVA encapsulant. Standard 15 kWh/m² dose. Include exposure time
calculation, yellowing index criteria, and transmittance loss assessment."
```

**Expected output:**

#### Module Under Test

| Specification | Value |
|---------------|-------|
| Technology | Mono-PERC (c-Si) |
| Power (STC) | 400 W |
| Isc | 10.8 A |
| Encapsulant | EVA (ethylene-vinyl acetate, fast-cure) |
| Front glass | 3.2 mm low-iron tempered |
| Backsheet | TPT (Tedlar-PET-Tedlar) |
| Dimensions | 1722 × 1134 × 30 mm |
| Module area | 1.953 m² |

#### UV Source Setup

**Lamp specification:**
- Type: Fluorescent UVA-340 lamps (recommended for AM1.5G spectral match)
- Wavelength range: 280-385 nm (UVA + UVB)
- UVA irradiance (measured at module plane): 150 W/m² typical
- UVB component: 3-5% of total UV irradiance
- Spectral match: within Class B per IEC 60904-9 in UV region

**Chamber requirements:**
- Module temperature: 60°C ± 5°C during exposure
- Temperature controlled via back-side ventilation or IR heating
- UV irradiance uniformity: ±15% across module area
- Calibrated UV radiometer (280-385 nm) for dose monitoring

#### UV Dose Calculation

**Exposure time formula:**

```
time (h) = dose (kWh/m²) / irradiance (kW/m²)
```

**Standard dose (15 kWh/m²):**
```
At 150 W/m² (0.150 kW/m²) UVA+UVB irradiance:
time = 15 / 0.150 = 100 hours

At 250 W/m² (0.250 kW/m²) — higher intensity source:
time = 15 / 0.250 = 60 hours
```

**Extended dose (50 kWh/m²):**
```
At 150 W/m²: time = 50 / 0.150 = 333.3 hours ≈ 14 days
At 250 W/m²: time = 50 / 0.250 = 200 hours ≈ 8.3 days
```

**Dose split requirement (IEC 61215-2:2021 §4.10):**
- Apply 5 kWh/m² to the front side with UVB component (280-320 nm)
- Apply remaining 10 kWh/m² to the front side (UVA, 320-385 nm)
- Total minimum: 15 kWh/m² (of which at least 5 kWh/m² includes UVB)

#### Yellowing Index Measurement (ASTM D1925)

**Yellowing Index formula:**

```
YI = 100 × (1.2769·X - 1.0592·Z) / Y
```

Where X, Y, Z are CIE tristimulus values measured with CIE Illuminant C.

**Typical EVA yellowing behavior:**

| UV Dose (kWh/m²) | YI (fresh EVA) | YI (UV-aged EVA) | ΔYI |
|-------------------|----------------|-------------------|-----|
| 0 (baseline) | 1.2 | — | — |
| 5 | — | 1.8 | 0.6 |
| 15 (standard) | — | 2.8 | **1.6** |
| 30 | — | 4.5 | 3.3 |
| 50 (extended) | — | 6.2 | 5.0 |

**Acceptance criterion:** ΔYI < 2.0 after 15 kWh/m² for standard EVA with UV stabilizers.

**Material comparison at 15 kWh/m²:**

| Encapsulant | Typical ΔYI | Transmittance Loss |
|-------------|-------------|-------------------|
| EVA (standard) | 1.5-2.5 | 1.0-2.0% |
| EVA (high-UV stable) | 0.8-1.5 | 0.5-1.0% |
| POE | 0.3-0.8 | 0.2-0.5% |
| Silicone | 0.1-0.3 | 0.1-0.2% |
| Ionomer | 0.2-0.5 | 0.1-0.3% |

#### Transmittance Loss Assessment

**Spectral transmittance measurement:**
- Instrument: UV-Vis spectrophotometer (300-1200 nm)
- Measure coupon samples cut from mini-modules or witness samples
- Key wavelengths: 380 nm, 400 nm, 500 nm, 600 nm, 900 nm

**EVA transmittance at 400 nm (typical):**
- Before UV: 91.5%
- After 15 kWh/m²: 90.2%
- Loss: **1.3%** (within acceptable range)

**Impact on Isc:**
```
ΔIsc/Isc ≈ -ΔT_weighted / T_baseline
For 1.3% transmittance loss at 400 nm, weighted over AM1.5G:
ΔIsc ≈ -0.8% (weighted average, since blue region is ~15% of photocurrent)
```

**Acceptance:** Isc degradation < 1% after standard UV preconditioning — **expected 0.8% — PASS**

#### Test Procedure (Step-by-Step)

1. **Pre-test characterization:**
   - STC power measurement (Pmax, Isc, Voc, FF)
   - EL imaging (baseline)
   - Visual inspection per MQT 01
   - Encapsulant coupon preparation for YI and transmittance

2. **UV exposure — Phase 1 (UVA+UVB):**
   - Mount module in UV chamber, front side facing lamps
   - Maintain module temperature at 60°C ± 5°C
   - Apply 5 kWh/m² UV dose including UVB component
   - Monitor with calibrated radiometer, log dose hourly
   - Duration: ~33 hours at 150 W/m²

3. **UV exposure — Phase 2 (UVA):**
   - Continue exposure with UVA-only or full-spectrum source
   - Apply additional 10 kWh/m² UV dose
   - Duration: ~67 hours at 150 W/m²

4. **Post-test characterization:**
   - STC power measurement
   - EL imaging
   - Visual inspection (check for discoloration, delamination)
   - Yellowing index measurement on coupons
   - Spectral transmittance on coupons

5. **Continue to next test:**
   - UV preconditioning is followed by TC50 + HF10 in Group A sequence
   - Module proceeds directly (no recovery period)

#### Acceptance Criteria (IEC 61215-2:2021 §4.10)

1. **Power degradation:** Not a standalone pass/fail (UV is preconditioning step)
2. **Visual inspection:** No visible yellowing, discoloration, delamination, or bubble formation
3. **Yellowing index:** ΔYI < 2.0 (recommended guideline)
4. **Transmittance loss:** < 1.5% weighted average (recommended guideline)
5. **Isc degradation:** < 1% from pre-UV baseline
6. **Note:** Final pass/fail is determined after complete Group A sequence (UV + TC50 + HF10 + DH1000)

## Output Format

The skill produces:
- **UV test protocol** — Lamp setup, dose calculation, exposure schedule, monitoring requirements
- **Exposure time worksheet** — Dose vs. time calculation for specific UV source
- **Yellowing analysis report** — YI measurements, ΔYI, CIE coordinates, pass/fail
- **Transmittance report** — Spectral transmittance curves, weighted loss, Isc impact
- **Material comparison** — Benchmarking against encapsulant material database
- **Test sequence integration** — How UV fits into IEC 61215 Group A sequence

## Standards & References

- IEC 61215-2:2021 — Terrestrial PV modules — Design qualification — Part 2: Test procedures, §4.10 (MQT 10)
- IEC TS 63209-1:2021 — Extended-stress testing of PV modules — Part 1: Modules
- IEC 62788-7-2 — Measurement procedures for materials — Part 7-2: Environmental exposures — UV
- ASTM D1925 — Standard Test Method for Yellowness Index of Plastics
- ASTM G154 — Standard Practice for Operating Fluorescent Ultraviolet Lamp Apparatus
- ASTM G173 — Standard Tables for Reference Solar Spectral Irradiances (AM1.5G)
- IEC 60904-9 — Solar simulator performance requirements
- Pern, F.J., "Factors that affect the EVA encapsulant discoloration rate upon accelerated exposure," Solar Energy Materials & Solar Cells, 1996

## Related Skills

- `iec-61215-protocol` — Complete IEC 61215 test sequence (UV is MQT 10)
- `thermal-cycling` — TC50 follows UV preconditioning in Group A sequence
- `damp-heat-testing` — DH1000 follows TC50+HF10 after UV in Group A
- `pv-module-flash-testing` — STC measurement for pre/post UV comparison
- `el-imaging` — EL imaging for detecting UV-induced cell degradation
