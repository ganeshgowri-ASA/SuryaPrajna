---
name: grid-integration
version: 1.0.0
description: Perform grid code compliance analysis and interconnection studies for PV plants, including voltage regulation, frequency response, fault ride-through, anti-islanding, power curtailment, ramp rate control, and protection coordination.
author: SuryaPrajna Contributors
license: MIT
tags:
  - grid-code
  - interconnection
  - frt
  - anti-islanding
  - voltage-regulation
  - frequency-response
dependencies:
  python:
    - pandapower>=2.13
    - numpy>=1.24
    - pandas>=2.0
    - matplotlib>=3.7
  data:
    - Single-line diagram or grid topology
    - PV plant specifications (capacity, inverter type)
    - Grid code applicable to the jurisdiction
pack: pv-power-systems
agent: Vidyut-Agent
---

# grid-integration

Perform grid code compliance analysis and interconnection studies for PV plants of all scales. Covers voltage regulation, frequency response, fault ride-through (FRT), anti-islanding protection, power curtailment, ramp rate control, reactive power capability, and protection coordination with relay settings. Supports multi-jurisdictional grid codes including IEEE 1547, IEC 62786, EN 50549, CEA Technical Standards (India), and CERC regulations.

## LLM Instructions

### Role Definition
You are a **senior power systems engineer and grid interconnection specialist** with 15+ years of experience in integrating renewable energy plants into transmission and distribution networks. You hold deep expertise in grid code compliance, protection engineering, power system stability, and inverter-based resource (IBR) interconnection. You think like a utility interconnection engineer who must ensure grid stability, power quality, and regulatory compliance while maximizing PV plant performance.

### Thinking Process
When a user requests grid integration analysis, follow this reasoning chain:
1. **Identify the interconnection context** — What is the plant capacity, voltage level, connection point (distribution vs transmission), and applicable grid code?
2. **Determine grid code requirements** — Map the specific requirements: FRT curves, frequency response bands, reactive power range, power quality limits, ramp rates
3. **Characterize the grid** — Short-circuit ratio (SCR) at the point of common coupling (PCC), grid impedance, existing generation/load, fault levels
4. **Assess voltage regulation** — Steady-state voltage impact, voltage step changes during cloud transients, reactive power compensation requirements
5. **Evaluate frequency response** — Droop settings, active power-frequency response, synthetic inertia requirements (if applicable)
6. **Analyze fault ride-through** — Verify inverter FRT capability against grid code curves, reactive current injection during faults
7. **Design protection scheme** — Anti-islanding detection, overcurrent/undervoltage/underfrequency protection, relay coordination with utility protection
8. **Model power curtailment** — Ramp rate compliance, active power reduction commands, communication requirements
9. **Run compliance verification** — Simulate scenarios with pandapower, verify all grid code clauses, document compliance/non-compliance
10. **Generate interconnection report** — Compile findings into a formal interconnection study format

### Output Format
- Begin with a **plant and grid summary table** listing PV capacity, connection voltage, PCC details, applicable grid code
- Present grid code requirements in **comparison tables** mapping code clauses to plant capabilities
- Use **FRT curve plots** showing voltage-time and frequency-time envelopes
- Include **single-line diagrams** as ASCII art for protection coordination
- Provide **relay settings tables** with pickup values, time delays, and coordination margins
- Include **units** with every value (kV, MVA, Hz, ms, %, p.u., A)
- End with a **compliance matrix** in pass/fail format with clause references

### Quality Criteria
- [ ] Every grid code requirement cites the specific clause number and edition year
- [ ] FRT curves include both undervoltage and overvoltage regions with exact breakpoints
- [ ] Frequency response parameters include deadband, droop, and response time
- [ ] Reactive power capability is specified at multiple active power levels (P = 0, 0.5, 1.0 p.u.)
- [ ] Protection settings include coordination time intervals (CTI) with upstream devices
- [ ] Power factor or reactive power range is verified against inverter capability curves
- [ ] Ramp rate limits are specified in both MW/min and %Prated/min

### Common Pitfalls
- **Do not** apply a single grid code universally — IEEE 1547 (USA), EN 50549 (Europe), CEA (India), and AS/NZS 4777 (Australia) have significantly different requirements
- **Do not** confuse "must disconnect" regions with "must ride through" regions on FRT curves — the boundary is critical for compliance
- **Do not** ignore the short-circuit ratio (SCR) — low SCR (<3) at the PCC creates voltage stability issues and may require grid reinforcement
- **Do not** assume all inverters have the same FRT capability — verify against manufacturer datasheets
- **Do not** set anti-islanding detection timers without coordinating with utility recloser timing — miscoordination causes equipment damage
- **Do not** neglect negative-sequence current injection requirements during asymmetric faults — many modern grid codes require this
- **Always** distinguish between Category I, II, and III performance categories in IEEE 1547-2018 — they have different response requirements
- **Always** verify that the cumulative PV penetration at the feeder does not exceed hosting capacity limits

### Example Interaction Patterns

**Pattern 1 — Full Interconnection Study:**
User: "Perform a grid interconnection study for a 50 MWp PV plant connecting at 132 kV in Tamil Nadu, India"
→ Identify CEA/CERC requirements → Grid characterization → Voltage impact → FRT analysis → Protection design → Compliance matrix → Interconnection report

**Pattern 2 — FRT Compliance Check:**
User: "Does our inverter meet IEEE 1547 Category III fault ride-through requirements?"
→ Extract inverter FRT capability → Plot against IEEE 1547 Cat III envelope → Identify margins or gaps → Remediation if needed

**Pattern 3 — Protection Coordination:**
User: "Design the protection scheme for a 10 MWp PV plant connecting to a 33 kV feeder with existing overcurrent protection"
→ Fault level calculation → Relay selection → Settings calculation → Time-current coordination → Anti-islanding verification

**Pattern 4 — Grid Code Comparison:**
User: "Compare Indian CEA and IEEE 1547-2018 requirements for a 100 MW PV plant"
→ Side-by-side comparison → FRT curves → Frequency response → Reactive power → Ramp rates → Key differences highlighted

## Capabilities

### 1. Grid Code Compliance Analysis
Evaluate PV plant design against applicable grid codes:
- **IEEE 1547-2018** — US interconnection standard for DER (Category I/II/III)
- **IEC 62786** — Design requirements for inverter-based DER connection
- **EN 50549-1/2** — European requirements for generating plants at LV/MV
- **CEA Technical Standards** — Indian grid code for solar and wind plants
- **CERC regulations** — Central Electricity Regulatory Commission interconnection norms
- **AS/NZS 4777.2** — Australian/New Zealand inverter requirements
- Clause-by-clause compliance mapping with pass/fail status

### 2. Voltage Regulation Analysis
Assess voltage impact at the point of common coupling:
- Steady-state voltage rise/drop calculation using grid impedance
- Voltage step changes during cloud transients (ramp events)
- Reactive power compensation requirements (capacitor banks, STATCOMs, SVCs)
- Voltage-reactive power (V-Q) droop settings for inverters
- Voltage regulation mode selection: constant PF, constant Q, volt-var, volt-watt
- Flicker assessment due to variable PV generation (Pst, Plt calculation)

### 3. Frequency Response
Configure inverter frequency response per grid code:
- Active power-frequency (P-f) droop settings
- Over-frequency response: power curtailment ramp
- Under-frequency response: power support (if BESS-coupled)
- Frequency deadband configuration
- Rate of change of frequency (RoCoF) ride-through
- Synthetic inertia requirements for large plants (>50 MW)

### 4. Fault Ride-Through (FRT) Analysis
Verify FRT compliance under voltage and frequency disturbances:
- Low-voltage ride-through (LVRT) curve compliance
- High-voltage ride-through (HVRT) curve compliance
- Reactive current injection during faults (k-factor calculation)
- Post-fault active power recovery rate
- Asymmetric fault response (negative-sequence current)
- FRT simulation using pandapower dynamic models

### 5. Anti-Islanding Protection
Design and verify anti-islanding detection:
- Passive methods: over/under voltage (OVP/UVP), over/under frequency (OFP/UFP)
- Active methods: frequency shift, impedance measurement, reactive power variation
- Detection time verification (<2 seconds per IEEE 1547)
- Coordination with utility reclosers and sectionalizers
- Non-detection zone (NDZ) analysis for passive methods

### 6. Protection Coordination
Design protection scheme for PV interconnection:
- Overcurrent relay settings (50/51) at PCC
- Directional overcurrent protection (67) for reverse power flow
- Under/over voltage relay settings (27/59)
- Under/over frequency relay settings (81U/81O)
- Rate of change of frequency relay (81R)
- Ground fault protection (50N/51N/59N)
- Time-current coordination curves with upstream utility protection
- Breaker failure protection and backup clearing times

### 7. Power Curtailment and Ramp Rate Control
Configure active power management:
- Ramp rate limits (MW/min) for cloud transient smoothing
- Remote curtailment response to grid operator commands
- Automatic generation control (AGC) integration
- Curtailment estimation and energy loss calculation
- Communication protocol requirements (IEC 61850, DNP3, Modbus)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `plant_capacity` | float | Yes | PV plant rated capacity in MWp (DC) or MWac |
| `grid_voltage` | float | Yes | Nominal voltage at the connection point in kV |
| `connection_point` | string | Yes | Connection level: "LV" (<1 kV), "MV" (1–36 kV), "HV" (36–220 kV), "EHV" (>220 kV) |
| `grid_code` | string | Yes | Applicable grid code: "IEEE-1547", "IEC-62786", "EN-50549", "CEA-India", "CERC", "AS-NZS-4777" |
| `frt_requirements` | string | No | FRT category or performance level (e.g., "Cat-III" for IEEE 1547) |
| `power_factor_range` | object | No | Required power factor range (e.g., {"leading": 0.90, "lagging": 0.90}) |
| `scr` | float | No | Short-circuit ratio at PCC (if known) |
| `fault_level` | float | No | Three-phase fault level at PCC in MVA |
| `grid_impedance` | object | No | Grid Thevenin impedance: {"r": ohms, "x": ohms} or X/R ratio |
| `inverter_model` | string | No | Inverter manufacturer and model for capability verification |
| `inverter_count` | int | No | Number of inverters in the plant |
| `transformer_rating` | float | No | Interconnection transformer rating in MVA |
| `transformer_impedance` | float | No | Transformer impedance in percent |
| `ramp_rate_limit` | float | No | Maximum ramp rate in %Prated/min (default: grid code specified) |
| `existing_generation` | float | No | Existing generation at the feeder/substation in MW |
| `feeder_load` | float | No | Feeder minimum and maximum load in MW |
| `protection_devices` | list | No | Existing utility protection devices for coordination |
| `study_type` | string | No | Type of study: "full", "frt-only", "protection", "voltage", "compliance-check" |

## Grid Code Comparison

### FRT Requirements Summary

```
Voltage (p.u.)
    │
1.3 ┤─────────────────────────── HVRT Limit
    │
1.2 ┤     ╔═══════════════════ IEEE 1547 Cat III HVRT
    │     ║
1.1 ┤     ╠═══╗
    │     ║   ║               Continuous Operating Region
1.0 ┤─────╨───╨───────────────────────────────────────
    │
0.9 ┤
    │
0.7 ┤─────╦───╗               IEEE 1547 Cat III LVRT
    │     ║   ╚═══════════════
0.5 ┤     ║
    │     ║
0.3 ┤     ║
    │     ║
0.1 ┤     ║
    │     ║
0.0 ┤─────╨───────────────────
    └──┬──┬───┬───┬───┬───┬──→ Time
       0  0.16 1   2   5  10   (seconds)
```

### Frequency Response Modes

| Parameter | IEEE 1547-2018 | CEA India | EN 50549 |
|-----------|---------------|-----------|----------|
| Over-frequency droop | 2–5% | 3–6% | 2–12% |
| Under-frequency droop | 2–5% (Cat III) | Not required (PV) | 2–12% |
| Deadband | ±0.017–0.036 Hz | ±0.03 Hz | ±0.01–0.05 Hz |
| Response time | <5 s (Cat III) | <10 s | <2 s |
| RoCoF ride-through | 3 Hz/s (Cat III) | 1 Hz/s | 2 Hz/s |
| Frequency range (continuous) | 58.8–61.2 Hz | 49.5–50.5 Hz | 49.0–51.0 Hz |
| Frequency range (ride-through) | 57.0–61.8 Hz | 47.5–51.5 Hz | 47.5–51.5 Hz |

## Example Usage

### Full Interconnection Study

```
Prompt: "Perform a grid interconnection study for a 50 MWp PV plant
connecting at 132 kV through a 132/33 kV substation in Tamil Nadu, India.
The grid fault level at 132 kV is 2500 MVA. The plant uses 100 units of
string inverters rated 500 kW each. Apply CEA Technical Standards and
CERC regulations."
```

**Expected output:**
1. Plant and grid summary table (50 MWp, 132 kV, SCR = 50, X/R = 10)
2. CEA grid code requirements mapped to plant capabilities
3. Voltage impact assessment at 132 kV and 33 kV buses
4. FRT compliance analysis with CEA LVRT/HVRT curves plotted
5. Frequency response configuration (over-frequency droop 5%, deadband ±0.03 Hz)
6. Reactive power capability verification (0.95 leading to 0.95 lagging at rated power)
7. Ramp rate analysis (Indian grid code: ≤10% Prated/min for solar)
8. Protection scheme design: relay types, settings, coordination curves
9. Anti-islanding verification with utility recloser coordination
10. Compliance matrix: all CEA clauses with pass/fail/not-applicable status
11. Recommendations for grid reinforcement if any non-compliance found
12. pandapower model setup for detailed simulation

### FRT Compliance Verification

```
Prompt: "Verify that our SMA Sunny Highpower PEAK3 inverters meet
IEEE 1547-2018 Category III LVRT and HVRT requirements. The PCC voltage
is 12.47 kV and the plant is rated 5 MWp."
```

**Expected output:**

#### IEEE 1547-2018 Category III FRT Compliance

**LVRT Requirements:**

| Voltage Range (p.u.) | Required Ride-Through Time | Inverter Capability | Status |
|----------------------|---------------------------|-------------------|--------|
| 0.00–0.50 | 1.0 second | 1.0 second | PASS |
| 0.50–0.70 | 10.0 seconds | >10.0 seconds | PASS |
| 0.70–0.88 | 20.0 seconds | Continuous | PASS |
| 0.88–1.10 | Continuous | Continuous | PASS |

**Reactive Current Injection:**
- k-factor: 2.0 (required: ≥2.0) — PASS
- Response time: <30 ms (required: <150 ms) — PASS
- Reactive current contribution: proportional to voltage deviation below 0.9 p.u.

**HVRT Requirements:**

| Voltage Range (p.u.) | Required Ride-Through Time | Inverter Capability | Status |
|----------------------|---------------------------|-------------------|--------|
| 1.10–1.20 | 12.0 seconds | 12.0 seconds | PASS |
| >1.20 | 0.16 seconds | 0.16 seconds | PASS |

**Post-Fault Recovery:**
- Active power recovery to 90% within 1.0 second — PASS

**Overall FRT Compliance: PASS (all criteria met)**

### Protection Coordination

```
Prompt: "Design the protection scheme for a 10 MWp PV plant connected
to a 33 kV feeder. The existing feeder has a 600A overcurrent relay
at the substation with 0.5s time delay. The PV plant connects through
a 12 MVA 33/0.69 kV transformer."
```

**Expected output:**
1. Fault current contribution analysis (PV inverter limited to 1.1–1.5× rated current)
2. Single-line diagram with protection devices
3. PCC relay settings:
   - 50/51 Overcurrent: pickup 250A, time dial 0.3, curve: IEC Very Inverse
   - 67 Directional OC: pickup 200A, forward direction, time dial 0.2
   - 27 Undervoltage: Stage 1: 0.88 p.u., 2.0s; Stage 2: 0.50 p.u., 0.16s
   - 59 Overvoltage: Stage 1: 1.10 p.u., 2.0s; Stage 2: 1.20 p.u., 0.16s
   - 81U/81O Frequency: Under: 49.0 Hz, 0.5s; Over: 51.0 Hz, 0.5s
4. Time-current coordination curve showing PV relay, transformer fuse, and utility relay
5. Coordination time interval (CTI): 0.3s minimum between PV and utility relay
6. Anti-islanding detection time: <2.0 seconds verified
7. Breaker duty: fault current interrupting capacity verification

## Output Format

The skill produces:
- **Compliance matrix** — Grid code clause-by-clause pass/fail assessment
- **FRT curves** — Voltage-time and frequency-time plots with inverter capability overlaid
- **Protection settings table** — Relay types, pickup values, time delays, curves
- **Coordination curves** — Time-current plots showing relay coordination
- **Voltage impact report** — Steady-state and transient voltage analysis at PCC
- **Frequency response configuration** — Droop settings, deadbands, response times
- **Single-line diagram** — Protection device placement and configuration
- **pandapower model** — Python code for detailed simulation

## Standards & References

- IEEE 1547-2018 — Standard for Interconnection and Interoperability of DER with EPS
- IEEE 1547.1-2020 — Conformance Test Procedures for IEEE 1547
- IEEE 2800-2022 — Standard for Interconnection of Inverter-Based Resources (transmission)
- IEC 62786:2017 — Design requirements for connecting DER with distribution networks
- EN 50549-1:2019 — Requirements for generating plants connected at LV
- EN 50549-2:2019 — Requirements for generating plants connected at MV
- CEA (India) Technical Standards for Connectivity to the Grid — 2019 Amendment
- CERC (India) Indian Electricity Grid Code (IEGC) — 2023
- CERC (India) Regulations on Ancillary Services — 2022
- IEC 61850 — Communication networks and systems for power utility automation
- IEEE C37.112 — Standard for Inverse-Time Characteristics of Overcurrent Relays
- AS/NZS 4777.2:2020 — Grid connection of energy systems via inverters (Australia/NZ)

## Related Skills

- `load-flow-analysis` — Detailed power flow simulation for grid impact assessment
- `power-quality` — Harmonics and power quality compliance at PCC
- `inverter-modeling` — Inverter capability verification and control mode simulation
- `bess-sizing` — BESS integration for frequency response and voltage support
- `hybrid-modeling` — Hybrid PV-wind-BESS grid integration studies
