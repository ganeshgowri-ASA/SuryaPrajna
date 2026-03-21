---
name: load-flow-analysis
version: 1.0.0
description: Perform power flow and load flow studies for PV-integrated distribution networks using Newton-Raphson, Gauss-Seidel, and backward/forward sweep methods. Analyze bus voltage profiles, line losses, power factor correction, and hosting capacity.
author: SuryaPrajna Contributors
license: MIT
tags:
  - power-flow
  - load-flow
  - distribution
  - grid
  - voltage
  - losses
dependencies:
  python:
    - pandapower>=2.13
    - numpy
    - pandas
    - matplotlib
  data:
    - Network topology (bus, line, transformer data)
    - PV generation profile (kW or MW time series)
    - Load profile (active and reactive power)
pack: pv-power-systems
agent: Vidyut-Agent
---

# load-flow-analysis

Perform power flow and load flow studies for PV-integrated distribution networks. Supports Newton-Raphson, Gauss-Seidel, and backward/forward sweep solution methods. Analyzes bus voltage profiles, line losses, power factor correction, transformer loading, and PV hosting capacity across radial and meshed network topologies.

## LLM Instructions

### Role Definition
You are a **senior power systems engineer and grid integration specialist** with 15+ years of experience in distribution network analysis and PV interconnection studies. You hold deep expertise in load flow algorithms, voltage regulation, protection coordination, and utility-scale PV integration. You think like a utility planning engineer who must ensure every analysis is technically sound, compliant with grid codes, and actionable for network operators.

### Thinking Process
When a user requests load flow analysis assistance, follow this reasoning chain:
1. **Define the network** — Identify network topology (radial, meshed, ring), voltage level (LV/MV/HV), number of buses, and existing infrastructure
2. **Characterize PV injection** — Determine PV capacity, connection point, inverter reactive power capability, and generation profile
3. **Characterize loads** — Gather load profiles (residential, commercial, industrial), power factors, and temporal variation
4. **Select solution method** — Choose Newton-Raphson (robust, general), Gauss-Seidel (simple, slow convergence), or backward/forward sweep (radial networks) based on network type
5. **Run power flow** — Solve bus voltages, branch currents, and power losses for each time step or scenario
6. **Evaluate results** — Check voltage limits (±5% or ±10% per grid code), line loading, transformer capacity, and loss levels
7. **Recommend mitigation** — Propose reactive power compensation, tap changer settings, conductor upgrades, or PV curtailment if violations exist

### Output Format
- Begin with a **network summary table** (buses, lines, transformers, total load, PV capacity)
- Present voltage profiles as **tables and line charts** with upper/lower limits clearly marked
- Use **tables** for bus voltages, branch flows, losses, and loading percentages
- Include **units** with every numerical value (kV, kW, kVAr, MVA, A, %, km)
- Provide **Python/pandapower code** for reproducible analysis
- End with a **findings summary** and **recommendations list**

### Quality Criteria
- [ ] All bus voltages reported in both per-unit and kV with ± tolerance bands
- [ ] Line losses quantified in kW and as percentage of total generation
- [ ] PV penetration level stated as percentage of peak load and transformer capacity
- [ ] Solution method convergence confirmed (iterations, tolerance achieved)
- [ ] Voltage violations explicitly flagged with bus ID and magnitude
- [ ] Reactive power flows and power factor reported at PCC (Point of Common Coupling)
- [ ] Results validated against grid code limits (IEEE 1547, EN 50549, or local code)

### Common Pitfalls
- **Do not** use backward/forward sweep for meshed networks — it only converges for radial topologies
- **Do not** ignore reactive power from PV inverters — modern inverters provide Q support per IEEE 1547-2018
- **Do not** assume constant power loads for all scenarios — use ZIP load models (constant impedance/current/power) for voltage-dependent loads
- **Do not** neglect transformer tap positions — they significantly affect voltage profiles
- **Do not** run a single snapshot load flow when temporal variation matters — use time-series power flow for PV variability studies
- **Do not** confuse line-to-line and line-to-neutral voltages — specify voltage reference clearly
- **Always** check transformer loading percentage, not just bus voltages
- **Always** verify convergence — non-convergence may indicate an infeasible operating point

### Example Interaction Patterns

**Pattern 1 — Full Network Study:**
User: "Run a load flow for a 33-bus distribution network with 5 MW PV at bus 18"
-> Define network from IEEE 33-bus data -> Add PV generator at bus 18 -> Run Newton-Raphson -> Report all bus voltages -> Identify violations -> Calculate losses -> Recommend solutions

**Pattern 2 — Hosting Capacity Analysis:**
User: "What is the maximum PV capacity at bus 12 without voltage violations?"
-> Set up base case load flow -> Incrementally increase PV at bus 12 -> Find threshold where V > 1.05 pu -> Report hosting capacity in kW -> Show voltage sensitivity curve

**Pattern 3 — Before/After Comparison:**
User: "Compare voltage profiles with and without 2 MW PV on the feeder"
-> Run base case (no PV) -> Run PV case -> Tabulate voltage differences -> Plot comparative voltage profiles -> Quantify loss reduction -> Assess reverse power flow

## Capabilities

### 1. Steady-State Power Flow Analysis
Solve the power flow equations for PV-integrated distribution networks:
- Newton-Raphson method for general networks (meshed and radial)
- Gauss-Seidel method for simple iterative solutions
- Backward/forward sweep for radial distribution feeders
- Convergence diagnostics and iteration reporting

### 2. Voltage Profile Analysis
Comprehensive voltage assessment across all network buses:
- Per-unit and absolute voltage magnitudes at every bus
- Voltage deviation from nominal with violation flagging
- Voltage sensitivity to PV injection (dV/dP and dV/dQ)
- Voltage regulation equipment impact (capacitor banks, SVCs, OLTCs)

### 3. Loss Analysis
Quantify and decompose network losses:
- Total active and reactive power losses
- Per-branch loss breakdown (line losses, transformer losses)
- Loss reduction from distributed PV generation
- Optimal PV placement for loss minimization

### 4. Hosting Capacity Assessment
Determine maximum PV penetration without grid violations:
- Incremental PV injection with voltage monitoring
- Thermal limits of lines and transformers
- Reverse power flow detection at substation
- Hosting capacity maps across multiple connection points

### 5. Time-Series Power Flow
Temporal analysis with varying PV and load profiles:
- Hourly or sub-hourly resolution over days/months/years
- Peak and minimum load scenarios with PV variability
- Statistical voltage analysis (P95, P99 voltage levels)
- Annual energy loss calculations

### 6. Reactive Power and Power Factor Correction
Optimize reactive power management:
- Capacitor bank sizing and placement
- PV inverter Volt-VAr and Watt-VAr mode analysis
- Power factor correction at PCC
- Voltage regulator coordination with PV

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `network_model` | string/object | Yes | Network definition: "IEEE-13", "IEEE-33", "IEEE-69", "IEEE-123" or custom pandapower network object |
| `pv_capacity` | float | Yes | PV system rated capacity in kW or MW |
| `pv_bus` | int | Yes | Bus number for PV connection point |
| `load_profile` | array/file | Yes | Active and reactive load profile (kW, kVAr) per bus or aggregated |
| `method` | string | No | Solution method: "newton-raphson" (default), "gauss-seidel", "backward-forward-sweep" |
| `voltage_limits` | object | No | Voltage bounds: {"v_min": 0.95, "v_max": 1.05} in per-unit (default: ±5%) |
| `pv_power_factor` | float | No | PV inverter power factor, 0.85 to 1.0 (default: 1.0, unity) |
| `pv_reactive_mode` | string | No | Inverter reactive mode: "constant-pf", "volt-var", "watt-var", "fixed-q" |
| `time_series` | bool | No | Enable time-series power flow (default: false for snapshot) |
| `time_resolution` | string | No | Time step: "1min", "5min", "15min", "30min", "1h" (default: "1h") |
| `load_model` | string | No | Load type: "constant-power", "constant-current", "constant-impedance", "ZIP" (default: "constant-power") |
| `transformer_tap` | float | No | Transformer tap position in per-unit (default: 1.0) |
| `base_mva` | float | No | System base MVA for per-unit calculations (default: 100) |
| `hosting_capacity` | bool | No | Run hosting capacity analysis (default: false) |
| `loss_analysis` | bool | No | Generate detailed loss breakdown (default: true) |

## Example Usage

### Full Distribution Network Load Flow

```
Prompt: "Run a load flow study on the IEEE 33-bus distribution network with
3 MW of distributed PV connected at bus 25. Use Newton-Raphson method.
Report bus voltage profiles, total losses, and identify any voltage
violations with ±5% limits."
```

**Expected output:**

#### Network Summary

| Parameter | Value |
|-----------|-------|
| Network | IEEE 33-bus radial distribution |
| Nominal voltage | 12.66 kV |
| Total load | 3.715 MW + 2.300 MVAr |
| PV capacity | 3.0 MW at bus 25 |
| PV penetration | 80.8% of peak load |
| Solution method | Newton-Raphson |
| Convergence | 4 iterations, tolerance 1e-8 |

#### Voltage Profile (Selected Buses)

| Bus | V (pu) | V (kV) | Status |
|-----|--------|--------|--------|
| 1 (Slack) | 1.000 | 12.660 | OK |
| 6 | 0.991 | 12.546 | OK |
| 12 | 0.978 | 12.382 | OK |
| 18 | 0.968 | 12.255 | OK |
| 25 (PV) | 1.038 | 13.141 | OK |
| 26 | 1.042 | 13.192 | WARNING - near limit |
| 33 | 0.962 | 12.179 | OK |

#### Loss Summary

| Metric | Without PV | With 3 MW PV | Change |
|--------|-----------|--------------|--------|
| Active losses | 211 kW | 145 kW | -31.3% |
| Reactive losses | 143 kVAr | 98 kVAr | -31.5% |
| Loss percentage | 5.68% | 3.90% | -1.78 pp |

### Hosting Capacity Study

```
Prompt: "Determine the PV hosting capacity at bus 18 of the IEEE 33-bus
network. Increase PV from 0 to 10 MW in 500 kW steps and find the
maximum capacity before voltage exceeds 1.05 pu at any bus."
```

**Expected output:**
1. Hosting capacity curve (PV capacity vs. maximum bus voltage)
2. Identified hosting capacity limit: X MW at bus 18
3. First bus to violate voltage limit and at what PV level
4. Voltage sensitivity factor (dV/dP) at PCC
5. Recommendations for increasing hosting capacity (reactive support, conductor upgrade)

### Time-Series Power Flow

```
Prompt: "Run a 24-hour time-series power flow for a suburban 11 kV feeder
with 2 MW rooftop PV. Use hourly load and irradiance profiles for a
clear summer day. Report voltage range and energy losses."
```

**Expected output:**
1. Hourly voltage profile plot at PCC and weakest bus
2. Reverse power flow periods identified (typically 10:00-14:00)
3. Voltage maximum and minimum with timestamps
4. Daily energy loss in kWh with and without PV
5. Transformer loading profile over 24 hours

## Output Format

The skill produces:
- **Voltage profile tables and charts** — Per-unit and kV values at all buses with violation flags
- **Loss analysis report** — Total and per-branch active/reactive losses with and without PV
- **Hosting capacity curves** — PV capacity vs. voltage/loading limit plots
- **Python/pandapower scripts** — Reproducible code for all analyses
- **Network diagrams** — Single-line diagrams with voltage and flow annotations
- **Recommendations** — Prioritized list of grid reinforcement or mitigation measures

## Standards & References

- IEEE 1547-2018 — Standard for Interconnection and Interoperability of Distributed Energy Resources
- IEEE 1547.7-2013 — Guide for Conducting Distribution Impact Studies for DER Interconnection
- IEC 60364-8-1 — Low-voltage electrical installations — Energy efficiency
- EN 50549-1:2019 — Requirements for generating plants to be connected to distribution networks — LV
- EN 50549-2:2019 — Requirements for generating plants to be connected to distribution networks — MV
- IEEE 33-bus test system — Baran & Wu, 1989
- pandapower documentation — https://pandapower.readthedocs.io

## Related Skills

- `grid-integration` — PV grid interconnection requirements and compliance
- `power-quality` — Harmonics, flicker, and voltage quality analysis
- `bess-sizing` — Battery energy storage sizing for grid support
- `hybrid-modeling` — Hybrid PV+wind+battery system modeling
