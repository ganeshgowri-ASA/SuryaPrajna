---
name: iec-61730-safety
version: 1.0.0
description: Generate IEC 61730 safety qualification test protocols for PV modules, covering construction evaluation (Part 1) and test methods (Part 2) including insulation, ground continuity, dielectric withstand, accessibility, and fire classification.
author: SuryaPrajna Contributors
license: MIT
tags:
  - iec-61730
  - safety
  - qualification
  - testing
  - insulation
  - fire-class
  - photovoltaic
dependencies:
  python:
    - pandas>=2.0
    - numpy>=1.24
    - jinja2>=3.1
  data:
    - Module datasheet (power, dimensions, system voltage)
    - Connector specifications
    - Encapsulant and backsheet material data
pack: pv-testing
agent: Pariksha-Agent
---

# iec-61730-safety

Generate comprehensive IEC 61730 safety qualification test protocols for PV modules. Covers IEC 61730-1:2016 (construction requirements for safety) and IEC 61730-2:2016 (test methods), including application class determination, insulation coordination, fire classification, and all mandatory safety tests (MST).

## Capabilities

### 1. Application Class Determination
Evaluate module suitability based on installation context:
- **Class A** — General application, accessible to the public (most common)
- **Class B** — Restricted access, qualified personnel only
- **Class C** — Not freely accessible (e.g., building-integrated, rooftop only)
- System voltage classification and insulation coordination

### 2. Safety Test Protocol Generation
Detailed test procedures for all mandatory safety tests:
- MST 11: Accessibility test — Sharp edge and point evaluation
- MST 12: Cut susceptibility test — Backsheet and cable resistance to cutting
- MST 13: Ground continuity test — Equipment grounding path verification
- MST 14: Impulse voltage test — Lightning/switching surge withstand
- MST 15: Dielectric withstand test — AC/DC high-voltage insulation
- MST 16: Insulation resistance test — Wet and dry conditions
- MST 17: Temperature test — Maximum operating temperature
- MST 21: Flammability test — Fire classification per local codes
- MST 22: Reverse current overload — Bypass diode safety
- MST 25: Bypass diode thermal — Junction temperature limits
- MST 26: Hot-spot endurance — Cell-level safety

### 3. Fire Classification Assessment
- Class A (IEC), Type 1 (UL) — Spread of flame, burning brands, flying embers
- Class B (IEC), Type 2 (UL) — Spread of flame, burning brands
- Class C (IEC), Type 3 (UL) — Spread of flame only
- Roof-mount fire testing per UL 61730 and local building codes

### 4. Compliance Documentation
- Construction evaluation checklist per IEC 61730-1
- Bill of materials compliance verification
- Marking and labeling requirements
- Test report template generation

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `module_type` | string | Yes | Module technology: "c-Si", "mc-Si", "HJT", "TOPCon", "thin-film-CdTe", "thin-film-CIGS" |
| `system_voltage` | float | Yes | Maximum system voltage in volts (e.g., 600, 1000, 1500) |
| `application_class` | string | Yes | Application class: "A", "B", or "C" |
| `fire_class` | string | No | Fire classification: "Class-A", "Class-B", "Class-C" (default: "Class-A") |
| `connector_type` | string | No | Connector type (e.g., "MC4", "MC4-EVO2", "Amphenol H4") |
| `encapsulant_type` | string | No | Encapsulant material: "EVA", "POE", "silicone", "ionomer" |
| `module_power` | float | No | Nameplate power at STC in watts |
| `module_dimensions` | object | No | Length x Width x Depth in mm |
| `backsheet_type` | string | No | Backsheet material: "TPT", "TPE", "KPE", "glass" |
| `frame_material` | string | No | Frame material: "aluminum", "steel", "frameless" |
| `edition` | string | No | Standard edition: "2016", "2023" (default: "2016") |

## Tool Definitions

### Tool: generate_safety_protocol

Generate the complete IEC 61730 safety test protocol.

**Parameters:**
- `module_type` (string, required) — PV technology type
- `system_voltage` (float, required) — Maximum system voltage (V)
- `application_class` (string, required) — "A", "B", or "C"
- `fire_class` (string, optional) — Fire classification target

**Returns:** Complete safety test protocol document with all applicable MSTs.

### Tool: evaluate_insulation

Calculate insulation resistance requirements and test voltages.

**Parameters:**
- `system_voltage` (float, required) — Maximum system voltage (V)
- `module_area` (float, required) — Module area in m²
- `application_class` (string, required) — "A", "B", or "C"
- `test_condition` (string, optional) — "dry" or "wet" (default: "dry")

**Returns:** Required insulation resistance (MO-m²), test voltage levels, and acceptance criteria.

### Tool: ground_continuity_check

Define ground continuity test parameters and acceptance criteria.

**Parameters:**
- `frame_material` (string, required) — Frame material type
- `grounding_points` (int, optional) — Number of grounding points (default: 1)
- `test_current` (float, optional) — Test current in amps (default: 2xIsc)

**Returns:** Ground continuity test procedure and pass/fail thresholds.

### Tool: impulse_voltage_test

Determine impulse voltage test levels based on system voltage and application class.

**Parameters:**
- `system_voltage` (float, required) — Maximum system voltage (V)
- `application_class` (string, required) — "A", "B", or "C"
- `altitude` (float, optional) — Installation altitude in meters for correction

**Returns:** Impulse voltage level (kV), waveform parameters, and test procedure.

### Tool: fire_classification_test

Generate fire classification test protocol.

**Parameters:**
- `fire_class` (string, required) — Target fire classification
- `mounting_type` (string, required) — "roof-flush", "roof-tilted", "ground", "BIPV"
- `roofing_material` (string, optional) — Underlying roof material

**Returns:** Fire test protocol, specimen preparation, and acceptance criteria.

## Example Usage

### Complete Safety Qualification Protocol

```
Prompt: "Generate the IEC 61730 safety qualification test protocol for a
600V system, Class A mono-PERC module (400W, glass-backsheet, EVA encapsulant,
MC4 connectors, aluminum frame). Target Fire Class A."
```

**Expected output:**

#### Module Under Test

| Specification | Value |
|---------------|-------|
| Technology | Mono-PERC (c-Si) |
| Power (STC) | 400 W |
| System voltage | 600 V DC |
| Application class | Class A (general access) |
| Fire classification | Class A |
| Encapsulant | EVA |
| Backsheet | TPT (Tedlar-PET-Tedlar) |
| Connectors | MC4 |
| Frame | Anodized aluminum |
| Dimensions | 1755 x 1038 x 35 mm |
| Module area | 1.82 m² |

#### MST 16: Insulation Resistance Test

**Test conditions (dry):**
- Applied voltage: 600V DC + 1000V = 1600V DC (for Class A, V_system + 1000V)
- Minimum insulation resistance requirement: 40 MO-m²
- For module area 1.82 m²: minimum resistance = 40 / 1.82 = **22.0 MO**

**Test conditions (wet):**
- Module submerged in resistivity-controlled water (max 3500 O-cm)
- Applied voltage: 500V DC
- Minimum insulation resistance: 40 MO-m²
- For module area 1.82 m²: minimum resistance = 40 / 1.82 = **22.0 MO**

**Procedure:**
1. Short-circuit all output terminals together
2. Connect negative terminal of insulation tester to shorted terminals
3. Connect positive terminal to module frame/accessible conductive parts
4. Apply test voltage for 2 minutes
5. Record insulation resistance
6. Acceptance: measured resistance >= 22.0 MO (dry), >= 22.0 MO (wet)

**Measured result (example):** 485 MO (dry), 112 MO (wet) — **PASS**

#### MST 13: Ground Continuity Test

**Procedure:**
1. Apply test current of 2 x Isc (2 x 10.5A = 21.0 A) or 2.5A (whichever greater)
2. Test between each grounding point and all exposed conductive parts
3. Measure voltage drop across grounding path
4. Calculate resistance: R = V_drop / I_test

**Acceptance criteria:**
- Ground path resistance: **<= 0.1 O**
- No visible damage to grounding connection

**Measured result (example):** R = 0.023 O at 21.0 A — **PASS**

#### MST 14: Impulse Voltage Test

**Test parameters (Class A, 600V system):**
- Impulse voltage level: **8 kV** (1.2/50 us waveform)
- Number of pulses: 3 positive + 3 negative
- Interval between pulses: >= 1 second
- Apply between shorted terminals and frame

**Acceptance criteria:**
- No flashover or breakdown during any pulse
- Insulation resistance after test: >= 22.0 MO
- No visible arcing marks

**Measured result (example):** No flashover at 8 kV, 6/6 pulses passed — **PASS**

#### MST 15: Dielectric Withstand Test

**Test parameters (Class A, 600V system):**
- Test voltage: 2 x V_system + 1000V = 2 x 600 + 1000 = **2200V AC** (or 3100V DC)
- Duration: 1 minute
- Leakage current limit: <= 50 uA per m² of module area
- For 1.82 m²: max leakage = 91 uA

**Procedure:**
1. Apply voltage gradually (ramp over 5 seconds)
2. Hold at test voltage for 60 seconds
3. Monitor leakage current continuously
4. No breakdown, flashover, or excessive leakage permitted

**Measured result (example):** Leakage = 12.3 uA at 2200V AC — **PASS**

#### MST 11: Accessibility Test

**Procedure:**
1. Apply standard test finger (IEC 61032, Test probe B) to all accessible surfaces
2. Verify no contact with live parts at any point
3. Apply rigid test probe to gaps and openings in enclosure
4. Check junction box IP rating (minimum IP65 for Class A)

**Acceptance:** No contact with live parts possible — **PASS**

#### MST 12: Cut Susceptibility Test

**Procedure:**
1. Apply 1.0 N cutting force using standard blade on backsheet
2. Cut length: 50 mm at 3 locations on backsheet surface
3. Perform insulation test after cutting
4. Insulation resistance must remain above minimum threshold

**Acceptance:** No exposure of live parts, insulation intact — **PASS**

#### MST 21: Fire Classification (Class A)

**Test protocol:**
1. Spread of flame test — Apply burning brand (Class A: 2000g) to module surface
2. Burning brand test — Module on roof deck assembly at 5:12 slope
3. Flying ember test — Wind-driven embers at 5.4 m/s
4. Monitor for: flame spread, falling particles, structural failure

**Acceptance criteria (Class A):**
- Flame spread shall not exceed 1.83 m (6 ft) beyond brand
- No falling burning particles that ignite underlying material
- Module shall not develop openings exposing roof deck

## Output Format

The skill produces:
- **Safety test matrix** — All applicable MSTs with test levels and criteria
- **Test voltage summary** — Calculated test voltages for insulation, impulse, dielectric
- **Protocol documents** — Step-by-step procedures for each MST
- **Construction evaluation** — IEC 61730-1 Part 1 checklist for design review
- **Fire classification report** — Fire test protocol and acceptance criteria
- **Compliance certificate template** — Final report structure per IEC 61730

## Standards & References

- IEC 61730-1:2016 — PV module safety qualification — Part 1: Requirements for construction
- IEC 61730-2:2016 — PV module safety qualification — Part 2: Requirements for testing
- UL 61730 — UL Standard for PV module safety (harmonized with IEC 61730)
- IEC 62790:2020 — Junction boxes for PV modules — Safety requirements and tests
- IEC 62852:2014 — Connectors for DC-application in PV systems — Safety requirements
- IEC 61032 — Protection of persons — Test probes (accessibility testing)
- UL 790 — Standard Test Methods for Fire Tests of Roof Coverings
- IEC 61215-2:2021 — Cross-reference for design qualification testing

## Related Skills

- `iec-61215-protocol` — Design qualification testing (complementary to safety)
- `flash-test-analysis` — STC power measurement for pre/post safety test comparison
- `el-imaging` — Electroluminescence imaging for detecting safety-related cell damage
- `nabl-compliance` — Lab accreditation requirements for safety testing
- `pv-module-flash-testing` — I-V characterization post safety tests
