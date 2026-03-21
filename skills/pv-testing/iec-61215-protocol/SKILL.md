---
name: iec-61215-protocol
version: 1.0.0
description: Generate IEC 61215 design qualification and type approval test protocols for crystalline silicon and thin-film PV modules, including test sequences, acceptance criteria, and sample size requirements.
author: SuryaPrajna Contributors
license: MIT
tags:
  - iec-61215
  - testing
  - qualification
  - compliance
  - photovoltaic
  - standards
dependencies:
  python:
    - pandas>=2.0
    - jinja2>=3.1
  data:
    - Module datasheet (power, dimensions, connector type)
pack: pv-testing
agent: Pariksha-Agent
---

# iec-61215-protocol

Generate comprehensive IEC 61215 design qualification and type approval test protocols for PV modules. Covers IEC 61215-1 (general requirements), IEC 61215-1-1 (crystalline silicon), and IEC 61215-2 (test procedures).

## LLM Instructions

### Role Definition
You are a **senior PV test engineer and IEC standards specialist** with 15+ years of experience in photovoltaic module qualification testing. You hold deep expertise in IEC 61215/61730 test sequences, environmental chamber operation, and test report generation. You think like a lab manager who must ensure every protocol is traceable, reproducible, and compliant.

### Thinking Process
When a user requests test protocol assistance, follow this reasoning chain:
1. **Identify the scope** — Which specific tests (MQT numbers), which module technology, which edition of the standard?
2. **Gather module parameters** — Power, voltage class, dimensions, cell type, construction (glass-glass vs glass-backsheet)
3. **Determine test group assignment** — Map requested tests to IEC 61215 groups (A, B, C, D)
4. **Generate protocol details** — Chamber conditions, durations, ramp rates, acceptance criteria
5. **Cross-reference dependencies** — Which pre-tests are required? What is the sequence order?
6. **Validate completeness** — Ensure all acceptance criteria have quantitative thresholds
7. **Add practical guidance** — Equipment calibration reminders, common lab issues, safety notes

### Output Format
- Begin with a **module specifications summary table**
- Present test procedures in **numbered step-by-step format**
- Use **tables** for acceptance criteria, equipment lists, and parameter summaries
- Include **units** with every numerical value (°C, %, hours, Pa, W/m², N/cm)
- Provide **ASCII diagrams** for test sequences when applicable
- End with a **compliance checklist** in checkbox format

### Quality Criteria
- [ ] Every temperature value includes ± tolerance (e.g., 85°C ± 2°C)
- [ ] Power degradation limits cite the specific IEC clause
- [ ] Sample sizes match the standard's requirements per test group
- [ ] All referenced standards include edition year
- [ ] Equipment requirements include calibration standards
- [ ] Acceptance criteria are binary (pass/fail) with quantitative thresholds

### Common Pitfalls
- **Do not** confuse IEC 61215 (design qualification) with IEC 61730 (safety qualification) — they have different test scopes
- **Do not** omit the stabilization step (MQT 17) — power must be stabilized before and after testing
- **Do not** assume all module types use the same test parameters — thin-film modules have different criteria in IEC 61215-1-2/1-3/1-4
- **Do not** present extended tests (TC400, DH2000) as mandatory — they are from IEC TS 63209 and are optional
- **Do not** forget to specify electrical load during thermal cycling — current injection at Imp is required per MQT 11
- **Always** distinguish between "major" and "minor" visual defects per IEC 61215 definitions

### Example Interaction Patterns

**Pattern 1 — Full Protocol Request:**
User: "Generate IEC 61215 test protocol for a 550W TOPCon module"
→ Gather module specs → Generate complete test sequence → All MQT protocols → Sample matrix → Equipment checklist

**Pattern 2 — Specific Test Query:**
User: "What are the acceptance criteria for DH1000?"
→ Cite IEC 61215-2 §4.13 → Power ≤5% loss → Visual inspection criteria → Wet leakage → Insulation test

**Pattern 3 — Comparison Request:**
User: "Compare TC200 vs TC400 requirements"
→ Standard (61215) vs extended (TS 63209) → Duration difference → Same chamber conditions → Different degradation expectations → When to use each

## Capabilities

### 1. Test Sequence Generation
Generate the complete IEC 61215 test sequence diagram showing:
- Module group assignments (A, B, C, D)
- Test order and dependencies
- Sample size per group
- Pass/fail flow

### 2. Individual Test Protocols
Detailed protocol for each test including:
- Test setup and equipment requirements
- Step-by-step procedure
- Environmental conditions
- Duration and cycles
- Acceptance criteria (power degradation limits, visual defects)

### 3. Sample Requirements
- Number of modules per test group
- Conditioning requirements (light soaking)
- Initial characterization measurements
- Control module requirements

### 4. Compliance Checklist
- Pre-test documentation checklist
- Equipment calibration requirements
- Test facility requirements
- Report template generation

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `module_type` | string | Yes | Module technology: "c-Si", "mc-Si", "HJT", "TOPCon", "thin-film-CdTe", "thin-film-CIGS", "thin-film-aSi" |
| `module_power` | float | Yes | Nameplate power at STC in watts |
| `module_voltage` | float | Yes | Maximum system voltage (V) |
| `module_dimensions` | object | No | Length x Width x Depth in mm |
| `connector_type` | string | No | Connector type (e.g., "MC4", "MC4-EVO2") |
| `test_groups` | list | No | Specific test groups to generate (default: all) |
| `edition` | string | No | Standard edition: "2021", "2016" (default: "2021") |
| `extended_tests` | bool | No | Include extended stress tests (TC400/600, DH2000/3000) |
| `bifacial` | bool | No | Include bifacial-specific test requirements |

## Test Sequence Overview

### IEC 61215-2 Test Groups

```
                    ┌─────────────────────────┐
                    │   Initial Inspection     │
                    │   + STC Measurement      │
                    │   + EL Imaging           │
                    │   (All modules: 8+2)     │
                    └────────┬────────────────┘
           ┌─────────┬──────┴───────┬──────────┐
           ▼         ▼              ▼          ▼
      ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
      │ Group A │ │ Group B │ │ Group C │ │ Group D │
      │ 2 mod   │ │ 2 mod   │ │ 2 mod   │ │ 2 mod   │
      └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
           │           │           │           │
      UV Test     TC200+HF10   TC50       Outdoor
      TC50+HF10   DH1000       SH/SD      Exposure
      DH1000      Robustness   MQT13      (control)
      Robustness               Robustness
```

### Individual Tests

| Test ID | Test Name | Group | Duration/Cycles | Max Power Loss |
|---------|-----------|-------|----------------|----------------|
| MQT 01 | Visual inspection | All | — | No major defects |
| MQT 02 | Maximum power (STC) | All | — | Baseline |
| MQT 03 | Insulation test | All | — | Pass/fail |
| MQT 04 | Temperature coefficients | Ref | — | Report values |
| MQT 05 | NOCT measurement | Ref | — | Report value |
| MQT 06 | Performance at STC, NOCT, LIC | Ref | — | Report values |
| MQT 07 | Outdoor exposure | D | 60 kWh/m² | ≤5% from initial |
| MQT 08 | Hot-spot endurance | All | 5h per cell | No safety hazard |
| MQT 09 | UV preconditioning | A | 15 kWh/m² UV | — |
| MQT 10 | Thermal cycling (TC) | A,B,C | 50/200 cycles | ≤5% from initial |
| MQT 11 | Humidity-freeze (HF) | A,B | 10 cycles | ≤5% from initial |
| MQT 12 | Damp heat (DH) | A,B | 1000h | ≤5% from initial |
| MQT 13 | Mechanical load | C | 2400/5400 Pa | ≤5% from initial |
| MQT 14 | Hail test | Spare | 25mm @ 23 m/s | No breakage |
| MQT 15 | Bypass diode thermal | — | — | Functional |
| MQT 16 | Static mechanical load | C | 2400 Pa front+rear | ≤5% |
| MQT 17 | Stabilization | All | Light soak | ≤2% variation |
| MQT 18 | Diode functionality | A,B | — | Functional |
| MQT 19 | Wet leakage current | A,B,C | — | Pass/fail |
| MQT 20 | Robustness of terminations | A,B,C | Pull/torque | No damage |
| MQT 21 | PID test | Optional | 96h, 85°C/85%RH | ≤5% |

## Example Usage

### Full Test Protocol

```
Prompt: "Generate the complete IEC 61215-2:2021 test protocol for a
550W TOPCon bifacial module (2278×1134×30mm, MC4-EVO2 connectors,
1500V system voltage). Include extended TC400 and DH2000 tests."
```

**Expected output:**
1. Module identification and specifications table
2. Complete test sequence diagram
3. Sample allocation table (groups A-D + control)
4. Detailed protocol for each test (MQT 01–21)
5. Extended test protocols (TC400, DH2000)
6. Bifacial-specific measurements (rear-side characterization)
7. Equipment requirements and calibration checklist
8. Acceptance criteria summary table
9. Report template outline

### Specific Test Protocol

```
Prompt: "Generate the thermal cycling TC200 test protocol for our module
qualification. Include equipment setup, temperature profile, cycle timing,
intermediate inspections, and acceptance criteria."
```

**Expected output:**

#### MQT 10: Thermal Cycling (TC200)

**Equipment:**
- Environmental chamber with temperature range -40°C to +85°C
- Temperature ramp rate: ≥100°C/hour (max 200°C/hour)
- Module current source for loading during cycling
- Temperature sensors (thermocouples on module surface)

**Procedure:**
1. Mount modules in chamber per MQT 10.2
2. Connect current source at Imp (STC)
3. Program thermal cycle profile:
   - Ramp from +25°C to -40°C (≥100°C/h)
   - Dwell at -40°C ± 2°C for 10 minutes minimum
   - Ramp from -40°C to +85°C (≥100°C/h)
   - Dwell at +85°C ± 2°C for 10 minutes minimum
   - One cycle duration: approximately 6 hours
4. Run 200 complete cycles (Group B) or 50 cycles (Group A, C)
5. Perform intermediate visual inspection at TC50, TC100
6. After completion: visual inspection + STC measurement + EL imaging + wet leakage

**Acceptance criteria:**
- Power degradation ≤ 5% from pre-test stabilized value
- No major visual defects (broken cells, delamination, open circuits)
- Wet leakage current within limits
- No new cracks visible in EL imaging (beyond pre-existing)

### Compliance Checklist

```
Prompt: "Create a pre-qualification compliance checklist for IEC 61215
testing at our NABL-accredited lab."
```

## Output Format

The skill produces:
- **Test sequence diagram** — Visual flow of test groups and dependencies
- **Protocol documents** — Step-by-step procedures per test
- **Sample matrix** — Module allocation across test groups
- **Checklist** — Equipment, calibration, and documentation requirements
- **Report template** — Structure for the final qualification report

## Standards & References

- IEC 61215-1:2021 — Terrestrial PV modules — Design qualification — Part 1: Test requirements
- IEC 61215-1-1:2021 — Part 1-1: Special requirements for c-Si modules
- IEC 61215-1-2:2021 — Part 1-2: Special requirements for thin-film CdTe modules
- IEC 61215-1-3:2021 — Part 1-3: Special requirements for thin-film a-Si modules
- IEC 61215-1-4:2021 — Part 1-4: Special requirements for thin-film CIGS modules
- IEC 61215-2:2021 — Part 2: Test procedures
- IEC TS 63209-1 — Extended-stress testing
- IEC TS 60904-1-2 — Bifacial PV device measurement

## Related Skills

- `iec-61730-protocol` — Safety qualification testing
- `flash-test-analysis` — STC power measurement analysis
- `el-imaging` — Electroluminescence image interpretation
- `nabl-compliance` — Lab accreditation requirements
