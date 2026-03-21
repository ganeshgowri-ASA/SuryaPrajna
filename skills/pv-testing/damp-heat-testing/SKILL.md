---
name: damp-heat-testing
version: 1.0.0
description: Generate damp heat test protocols (DH1000/DH2000/DH3000) per IEC 61215 MQT 13, including moisture ingress modeling with Arrhenius acceleration, delamination detection methods, and encapsulant degradation assessment.
author: SuryaPrajna Contributors
license: MIT
tags:
  - damp-heat
  - iec-61215
  - reliability
  - testing
  - humidity
  - moisture-ingress
  - encapsulant
  - photovoltaic
dependencies:
  python:
    - pandas>=2.0
    - numpy>=1.24
    - matplotlib>=3.7
    - scipy>=1.10
  data:
    - Module datasheet (power, dimensions, construction)
    - Encapsulant material data (EVA, POE, silicone)
    - Backsheet moisture vapor transmission rate (MVTR)
pack: pv-testing
agent: Pariksha-Agent
---

# damp-heat-testing

Generate comprehensive damp heat test protocols for PV module qualification per IEC 61215-2:2021 MQT 13. Covers standard DH1000, extended DH2000/DH3000 (IEC TS 63209-1), moisture ingress modeling using Arrhenius acceleration factors, delamination detection, encapsulant degradation assessment (yellowing, gel content loss), and corrosion risk evaluation.

## Capabilities

### 1. Test Protocol Generation
Generate complete damp heat test procedures:
- Chamber conditions: 85°C / 85% RH (standard)
- Duration: 1000h (DH1000), 2000h (DH2000), 3000h (DH3000)
- Module mounting and orientation requirements
- Electrical bias options (unbiased, forward bias, reverse bias)
- Ramp-up/ramp-down procedures to avoid condensation

### 2. Moisture Ingress Modeling
Predict moisture penetration using transport models:
- Fickian diffusion model for encapsulant layers
- Moisture vapor transmission rate (MVTR) through backsheet
- Edge seal effectiveness evaluation
- Arrhenius acceleration factor for temperature-humidity correlation

### 3. Encapsulant Degradation Assessment
Evaluate encapsulant health during and after testing:
- Gel content measurement (Soxhlet extraction per ASTM D2765)
- Yellowing index tracking (ASTM D1925)
- Transmittance loss at 380-1100 nm
- Acetic acid evolution rate for EVA modules
- Peel strength (adhesion) testing per EN 28510

### 4. Delamination Detection
Multi-method delamination identification:
- Visual inspection (bubbles, whitening, discoloration)
- EL imaging (dark areas indicating moisture-related degradation)
- IR thermography (delaminated zones as hot spots)
- Ultrasonic scanning for interfacial delamination
- Peel test at glass-encapsulant and cell-encapsulant interfaces

### 5. Corrosion Risk Evaluation
Assess corrosion susceptibility:
- Cell metallization corrosion (silver finger oxidation)
- Interconnect ribbon corrosion
- Junction box and connector corrosion
- Leakage current monitoring during test
- PID susceptibility under combined DH + voltage bias

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `duration_hours` | int | Yes | Test duration: 1000, 2000, or 3000 hours |
| `temperature` | float | No | Chamber temperature in °C (default: 85) |
| `humidity` | float | No | Relative humidity in % (default: 85) |
| `module_type` | string | Yes | Technology: "c-Si", "HJT", "TOPCon", "thin-film-CdTe", "thin-film-CIGS" |
| `encapsulant_type` | string | Yes | Encapsulant: "EVA", "POE", "silicone", "ionomer", "TPO" |
| `backsheet_type` | string | No | Backsheet: "TPT", "TPE", "KPE", "KPK", "glass" (default: "TPT") |
| `edge_seal_type` | string | No | Edge seal: "none", "PIB", "silicone", "butyl" |
| `module_power` | float | No | Nameplate power at STC in watts |
| `module_dimensions` | object | No | Length x Width x Depth in mm |
| `voltage_bias` | string | No | Electrical bias: "none", "forward", "reverse", "system-voltage" |
| `bifacial` | bool | No | Glass-glass bifacial construction (default: false) |

## Tool Definitions

### Tool: generate_dh_protocol

Generate the complete damp heat test protocol.

**Parameters:**
- `duration_hours` (int, required) — Test duration in hours (1000/2000/3000)
- `temperature` (float, optional) — Chamber temperature in °C
- `humidity` (float, optional) — Relative humidity in %
- `module_type` (string, required) — PV technology type
- `encapsulant_type` (string, required) — Encapsulant material

**Returns:** Complete DH protocol with chamber setup, monitoring schedule, and acceptance criteria.

### Tool: moisture_ingress_model

Model moisture penetration into module construction.

**Parameters:**
- `encapsulant_type` (string, required) — Encapsulant material
- `backsheet_type` (string, required) — Backsheet material
- `module_thickness` (float, optional) — Total module thickness in mm
- `edge_seal_type` (string, optional) — Edge seal material
- `temperature` (float, required) — Test temperature in °C
- `humidity` (float, required) — Relative humidity in %

**Returns:** Moisture concentration profile, ingress timeline, and saturation estimate.

### Tool: arrhenius_acceleration

Calculate Arrhenius acceleration factor for field-to-lab correlation.

**Parameters:**
- `T_test` (float, required) — Test temperature in °C
- `T_field` (float, required) — Field average temperature in °C
- `RH_test` (float, required) — Test relative humidity in %
- `RH_field` (float, required) — Field average relative humidity in %
- `Ea` (float, optional) — Activation energy in eV (default: 0.9 for EVA)

**Returns:** Acceleration factor, equivalent field exposure time, and sensitivity analysis.

### Tool: delamination_assessment

Evaluate delamination risk and detection methods.

**Parameters:**
- `module_type` (string, required) — PV technology type
- `encapsulant_type` (string, required) — Encapsulant material
- `duration_hours` (int, required) — DH exposure time
- `inspection_method` (string, optional) — "visual", "EL", "IR", "ultrasonic", "all"

**Returns:** Delamination risk score, recommended inspection methods, and detection criteria.

## Example Usage

### DH1000 Protocol for Glass-Glass Bifacial Module

```
Prompt: "Generate a DH1000 damp heat test protocol for a 500W glass-glass
bifacial TOPCon module with POE encapsulant. Include moisture ingress
modeling and Arrhenius acceleration factor calculation for Mumbai climate."
```

**Expected output:**

#### Module Under Test

| Specification | Value |
|---------------|-------|
| Technology | TOPCon (n-type, bifacial) |
| Power (STC) | 500 W |
| Construction | Glass-glass (2mm+2mm tempered) |
| Encapsulant | POE (polyolefin elastomer) |
| Backsheet | Glass (bifacial, no backsheet) |
| Edge seal | PIB (polyisobutylene) |
| Dimensions | 2278 × 1134 × 30 mm |
| Module area | 2.583 m² |
| Isc | 13.8 A |

#### Chamber Setup

**Environmental conditions:**
- Temperature: 85°C ± 2°C
- Relative humidity: 85% ± 5% RH
- Duration: 1000 hours continuous
- Air circulation: uniform within ±2°C across module surface

**Ramp-up procedure (avoid condensation):**
1. Place module in chamber at ambient temperature
2. Raise temperature to 85°C at ≤1°C/min (60 min ramp)
3. Once at 85°C, slowly increase humidity to 85% RH over 30 min
4. Begin test timer when both conditions are stable

**Ramp-down procedure:**
1. Reduce humidity to <50% RH while maintaining 85°C (30 min)
2. Cool chamber to ambient at ≤1°C/min
3. Allow module to equilibrate 2 hours before measurements

**Module orientation:**
- Mounted vertically or at slight angle (5-15°) to prevent pooling
- Minimum 100mm spacing between modules
- Electrical connections accessible for monitoring

#### Moisture Ingress Analysis

**Fickian diffusion parameters for POE:**

| Property | POE | EVA (comparison) |
|----------|-----|-------------------|
| Diffusion coefficient D (85°C) | 2.1 × 10⁻⁸ cm²/s | 8.5 × 10⁻⁸ cm²/s |
| Equilibrium moisture content | 0.04 wt% | 0.45 wt% |
| MVTR (38°C, 90% RH) | 2.5 g/m²·day | 35 g/m²·day |

**Glass-glass advantage:** With glass on both sides, moisture ingress is limited to edge permeation through the PIB edge seal. Center-of-module moisture concentration after DH1000:

```
For edge seal width w = 12 mm, PIB permeability P_PIB = 1.2 × 10⁻⁹ cm²/s:
Penetration depth L = 2 × √(D × t)
L = 2 × √(1.2 × 10⁻⁹ × 3.6 × 10⁶) = 2 × √(4.32 × 10⁻³)
L = 2 × 0.0657 = 0.131 cm ≈ 1.3 mm from edge
```

**Result:** After DH1000, moisture penetrates only ~1.3 mm from the edge in a glass-glass module with PIB seal. The active cell area remains essentially dry.

#### Arrhenius Acceleration Factor

**Arrhenius model for temperature-humidity acceleration:**

```
AF = exp[Ea/k × (1/T_use - 1/T_test)] × (RH_test/RH_use)^n
```

Where:
- Ea = activation energy for degradation mechanism
- k = Boltzmann constant = 8.617 × 10⁻⁵ eV/K
- T in Kelvin
- n = humidity exponent (typically 2-3)

**For EVA degradation (comparison): Ea ≈ 0.9 eV**
**For POE degradation: Ea ≈ 0.7 eV**

**Mumbai climate conditions:**
- Average module temperature: 45°C (318.15 K)
- Average relative humidity: 72%

**Calculation (POE, Ea = 0.7 eV):**
```
T_test = 85°C = 358.15 K
T_use = 45°C = 318.15 K
RH_test = 85%, RH_use = 72%, n = 2.5

AF_temp = exp[0.7 / (8.617 × 10⁻⁵) × (1/318.15 - 1/358.15)]
       = exp[8122.5 × (3.143 × 10⁻³ - 2.792 × 10⁻³)]
       = exp[8122.5 × 3.51 × 10⁻⁴]
       = exp[2.851]
       = 17.3

AF_humidity = (85/72)^2.5 = (1.181)^2.5 = 1.50

AF_total = 17.3 × 1.50 = 25.9
```

**Field equivalent:**
```
DH1000 = 1000 hours × 25.9 = 25,900 hours field exposure
       = 25,900 / 8760 = 2.96 years of Mumbai outdoor exposure
DH2000 = 2000 × 25.9 / 8760 = 5.91 years
DH3000 = 3000 × 25.9 / 8760 = 8.87 years
```

#### Expected Power Degradation

| Checkpoint | Glass-backsheet EVA | Glass-glass POE |
|------------|--------------------|--------------------|
| DH500 | < 2.0% | < 0.5% |
| DH1000 | < 5.0% | < 2.0% |
| DH2000 | < 8.0% | < 3.5% |
| DH3000 | < 12.0% | < 5.0% |

#### Detection Methods Schedule

| Hours | Visual | EL Imaging | IR Thermo | Peel Strength | Gel Content |
|-------|--------|------------|-----------|---------------|-------------|
| 0 (baseline) | Yes | Yes | Yes | Coupon | Coupon |
| 500 | Yes | Yes | Optional | — | — |
| 1000 | Yes | Yes | Yes | Coupon | Coupon |
| 2000 | Yes | Yes | Yes | Coupon | Coupon |
| 3000 | Yes | Yes | Yes | Coupon | Coupon |

**Gel content measurement (Soxhlet, ASTM D2765):**
- Baseline EVA gel content: 85-92%
- Minimum acceptable after DH1000: >70%
- POE baseline: N/A (thermoplastic, no crosslinking)

**Peel strength (EN 28510-1):**
- Glass-encapsulant: minimum 40 N/cm (initial), >20 N/cm after DH1000
- Cell-encapsulant: minimum 20 N/cm (initial), >10 N/cm after DH1000

#### Acceptance Criteria (IEC 61215-2:2021 §4.13)

1. **Power degradation:** ≤ 5% from pre-test stabilized value
2. **Visual inspection:** No major defects — no delamination >10% of cell area, no bubble formation, no discoloration indicating safety hazard
3. **Wet leakage current:** Must pass MQT 15 post-test
4. **Insulation resistance:** Must pass dry and wet insulation test
5. **EL imaging:** No new inactive cell areas exceeding 5% of any single cell

## Output Format

The skill produces:
- **Test protocol document** — Chamber setup, ramp procedures, monitoring schedule
- **Moisture ingress report** — Diffusion modeling, penetration depth, saturation timeline
- **Acceleration factor analysis** — Arrhenius calculation with field correlation
- **Degradation tracking** — Power loss, gel content, peel strength at each checkpoint
- **Detection results** — Visual, EL, IR, and material test findings
- **Acceptance summary** — Pass/fail determination per IEC 61215

## Standards & References

- IEC 61215-2:2021 — Terrestrial PV modules — Design qualification — Part 2: Test procedures, §4.13 (MQT 13)
- IEC TS 63209-1:2021 — Extended-stress testing of PV modules — Part 1: Modules
- ASTM D2765 — Standard Test Methods for Determination of Gel Content of Crosslinked Polymers
- ASTM D3418 — Standard Test Method for Transition Temperatures of Polymers (DSC)
- EN 28510-1 — Adhesives — Peel test for flexible-to-rigid bonded assemblies
- IEC 62788-1-4 — Measurement procedures for materials — Part 1-4: Encapsulants
- Kempe, M.D., "Modeling of rates of moisture ingress into photovoltaic modules," Solar Energy Materials & Solar Cells, 2006

## Related Skills

- `iec-61215-protocol` — Complete IEC 61215 test sequence including DH test
- `thermal-cycling` — Complementary thermal stress test (often sequenced with DH)
- `uv-preconditioning` — UV exposure preceding DH in Group A test sequence
- `el-imaging` — Electroluminescence image interpretation for DH degradation
- `pv-module-flash-testing` — STC power measurement for pre/post DH comparison
