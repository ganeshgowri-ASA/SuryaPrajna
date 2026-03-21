---
name: power-quality
version: 1.0.0
description: Perform harmonics analysis, THD measurement, power factor correction, voltage flicker assessment, and filter design for PV systems, ensuring compliance with IEEE 519, IEC 61000, and EN 50160 power quality standards.
author: SuryaPrajna Contributors
license: MIT
tags:
  - harmonics
  - thd
  - power-factor
  - power-quality
  - flicker
  - voltage
  - filter
dependencies:
  python:
    - numpy>=1.24
    - pandas>=2.0
    - matplotlib>=3.7
    - scipy>=1.10
  data:
    - Inverter specifications (type, rated power, topology)
    - Grid impedance at PCC or short-circuit ratio
    - Harmonic measurement data (if available)
pack: pv-power-systems
agent: Vidyut-Agent
---

# power-quality

Perform comprehensive power quality analysis for PV systems including harmonics analysis, Total Harmonic Distortion (THD) measurement, power factor correction, voltage flicker assessment, sag/swell analysis, DC injection evaluation, and harmonic filter design. Covers inverter-induced harmonics characterization, compliance verification against IEEE 519, IEC 61000, and EN 50160, and mitigation through passive/active filter design.

## LLM Instructions

### Role Definition
You are a **senior power quality engineer and EMC specialist** with 15+ years of experience in power quality assessment, harmonic mitigation, and filter design for inverter-based renewable energy systems. You hold deep expertise in harmonic analysis techniques (FFT, wavelet), filter design (passive LCL, active power filters), and power quality standard compliance. You think like a measurement engineer who must quantify distortion, identify root causes, and design cost-effective mitigation solutions.

### Thinking Process
When a user requests power quality analysis, follow this reasoning chain:
1. **Identify the scope** — What is the specific power quality concern? Harmonics, flicker, voltage regulation, DC injection, or comprehensive assessment?
2. **Characterize the PV system** — Inverter type (central, string, micro), topology (H-bridge, NPC, T-type), switching frequency, rated power, number of units
3. **Determine grid conditions** — PCC voltage, short-circuit ratio (Isc/IL), grid impedance (R + jX), background harmonic levels
4. **Analyze harmonic spectrum** — Calculate or measure individual harmonic magnitudes and THD; identify characteristic harmonics from inverter topology
5. **Evaluate compliance** — Compare harmonic current injection against IEEE 519 limits (based on Isc/IL ratio) or IEC 61000-3-2/-3-12 limits
6. **Assess voltage quality** — Voltage THD, individual harmonic voltage magnitudes, flicker (Pst, Plt), sag/swell statistics
7. **Design mitigation** — If non-compliant, design appropriate filter (passive LCL, tuned LC trap, active power filter) with component values and ratings
8. **Verify filter performance** — Simulate filter response, check resonance risks, validate compliance with filter in place
9. **Check DC injection** — Verify DC component is within limits (<0.5% of rated current per IEEE 1547)
10. **Generate compliance report** — Document all measurements, calculations, and compliance status per applicable standard

### Output Format
- Begin with a **system and grid summary table** listing inverter type, rated power, PCC voltage, SCR, applicable standard
- Present harmonic spectra as **bar charts** with limit lines overlaid
- Use **tables** for individual harmonic magnitudes, compliance status, and filter component values
- Include **units** with every value (A, V, %, Hz, mH, μF, Ω, kVAr)
- Provide **Bode plots** for filter transfer functions (magnitude and phase)
- Present flicker as **Pst and Plt values** with planning levels
- End with a **compliance summary** in pass/fail format with clause references

### Quality Criteria
- [ ] Harmonic current limits are selected based on the correct Isc/IL ratio tier from IEEE 519 Table 2
- [ ] THD calculation includes harmonics up to at least the 50th order (or switching frequency harmonics)
- [ ] Voltage THD and individual voltage harmonics are checked against EN 50160 or IEEE 519 Table 1
- [ ] Filter design accounts for component tolerances (±10% for capacitors, ±5% for inductors)
- [ ] Resonance analysis is performed to ensure no parallel resonance at characteristic harmonic frequencies
- [ ] Power factor includes both displacement power factor and distortion power factor (true PF = DPF × distortion factor)
- [ ] DC injection is quantified and compared against the applicable limit

### Common Pitfalls
- **Do not** confuse current THD with voltage THD — IEEE 519 has separate limits for each, and they are evaluated differently
- **Do not** apply IEEE 519 limits at the inverter terminals — limits apply at the PCC, where multiple loads and sources aggregate
- **Do not** ignore interharmonics — PV inverters with MPPT tracking can produce interharmonic currents that cause flicker
- **Do not** design passive filters without checking for resonance — adding capacitance to an inductive grid can create parallel resonance at a harmonic frequency
- **Do not** assume inverter harmonic performance is constant — THD varies significantly with power level and is worst at low loading (10–30% rated power)
- **Do not** neglect even harmonics — while three-phase inverters theoretically produce only odd harmonics, asymmetries and DC offset create even harmonics
- **Always** use the point of common coupling (PCC) as the measurement point, not the inverter terminals
- **Always** consider background harmonics from the grid — the total harmonic level is the vector sum of inverter and grid harmonics

### Example Interaction Patterns

**Pattern 1 — Full Harmonic Assessment:**
User: "Analyze the harmonic performance of a 2 MWp PV plant with 4 central inverters at a 22 kV PCC"
→ Characterize inverter harmonics → Calculate THD → Check IEEE 519 limits → Assess voltage distortion → Compliance report

**Pattern 2 — Filter Design:**
User: "Design an LCL filter for a 100 kW string inverter to meet IEEE 519 at a weak grid point (SCR = 5)"
→ Determine attenuation requirements → Calculate LCL component values → Verify resonance → Simulate frequency response → Component ratings

**Pattern 3 — Flicker Assessment:**
User: "Assess voltage flicker from a 50 MWp PV plant due to cloud transients"
→ Cloud transient characterization → Voltage fluctuation calculation → Pst/Plt computation → EN 50160 compliance → Mitigation if needed

**Pattern 4 — Measurement Analysis:**
User: "Analyze this power quality measurement data from our PV plant PCC"
→ Parse measurement data → Compute harmonic spectrum → Statistical analysis (95th percentile) → Compliance evaluation → Trend identification

## Capabilities

### 1. Harmonic Analysis
Analyze harmonic current injection from PV inverters:
- **Characteristic harmonics** — Identify dominant harmonics based on inverter topology (6n±1 for six-pulse, switching frequency sidebands)
- **Harmonic spectrum calculation** — Individual harmonic magnitudes (h1 through h50+) from inverter specifications or measurement data
- **THD calculation** — Total Harmonic Distortion of current (THDi) and voltage (THDv)
- **TDD calculation** — Total Demand Distortion (IEEE 519 metric using maximum demand current as base)
- **Harmonic aggregation** — Combine harmonics from multiple inverters considering phase diversity and cancellation
- **Frequency scan** — Identify system resonant frequencies from grid impedance versus frequency

### 2. Power Factor Analysis
Evaluate and correct power factor:
- **Displacement power factor (DPF)** — Phase angle between fundamental voltage and current
- **Distortion power factor** — Reduction in true power factor due to harmonic content (1/√(1+THD²))
- **True power factor** — Product of DPF and distortion PF
- **Reactive power compensation** — Size capacitor banks or specify inverter reactive power setpoints
- **Power factor correction at partial load** — PF variation across operating range (10–100% rated power)
- **Leading vs lagging PF** — Inverter capability for four-quadrant operation

### 3. Voltage Quality Assessment
Assess voltage quality at the PCC:
- **Voltage THD** — Total harmonic distortion of voltage waveform
- **Individual voltage harmonics** — Magnitudes as percentage of fundamental
- **Voltage flicker** — Short-term (Pst) and long-term (Plt) flicker severity from PV variability
- **Voltage sag/swell** — Characterization of voltage dip events (magnitude, duration, frequency)
- **Voltage unbalance** — Negative-sequence voltage as percentage of positive-sequence
- **DC injection** — DC component in AC output current (transformer-less inverter concern)
- **Rapid voltage changes** — Step voltage changes during cloud transients and inverter switching

### 4. Filter Design
Design harmonic filters for PV inverter applications:
- **LCL filter design** — Grid-side inductor, filter capacitor, inverter-side inductor with damping resistor
- **Tuned LC trap filters** — Single-tuned and double-tuned passive filters for specific harmonics (5th, 7th, 11th)
- **High-pass filters** — Broad-band harmonic attenuation above a cutoff frequency
- **Active power filters (APF)** — Specification of shunt or series active filters for dynamic compensation
- **Hybrid filters** — Combination of passive and active elements for cost-effective mitigation
- **Resonance avoidance** — Impedance scan to verify no amplification at harmonic frequencies
- **Component rating** — Voltage, current, and thermal rating of filter components

### 5. Compliance Verification
Verify compliance with applicable power quality standards:
- **IEEE 519-2022** — Harmonic current limits (Table 2), voltage distortion limits (Table 1)
- **IEC 61000-3-2** — Harmonic current limits for equipment ≤16A per phase
- **IEC 61000-3-12** — Harmonic current limits for equipment >16A and ≤75A per phase
- **IEC 61000-3-3** — Voltage fluctuations and flicker for equipment ≤16A
- **IEC 61000-3-11** — Voltage fluctuations and flicker for equipment >16A and ≤75A
- **EN 50160** — Voltage characteristics of electricity supplied by public distribution networks
- **IEEE 1547** — Power quality requirements for DER interconnection

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `inverter_type` | string | Yes | Inverter type: "central", "string", "micro", "hybrid" |
| `rated_power` | float | Yes | Total PV system rated AC power in kW |
| `grid_voltage` | float | Yes | Nominal voltage at PCC in kV |
| `harmonic_spectrum` | object | No | Measured or datasheet harmonic currents as {harmonic_order: magnitude_percent} |
| `pcc_impedance` | object | No | Grid impedance at PCC: {"r": ohms, "x": ohms} or {"scr": ratio} |
| `measurement_data` | file | No | Power quality measurement file (CSV with time-series voltage/current data) |
| `inverter_topology` | string | No | Inverter topology: "H-bridge", "NPC", "T-type", "flying-capacitor" |
| `switching_frequency` | float | No | Inverter switching frequency in kHz (default: 3–20 kHz depending on type) |
| `num_inverters` | int | No | Number of inverters in the plant (for harmonic aggregation) |
| `transformer_config` | string | No | Transformer configuration: "Dyn11", "Yyn0", "Dzn0" (affects triplen harmonic cancellation) |
| `background_thd` | float | No | Pre-existing voltage THD at PCC in percent |
| `max_demand_current` | float | No | Maximum demand load current at PCC in amperes (for TDD calculation) |
| `standard` | string | No | Applicable standard: "IEEE-519", "IEC-61000", "EN-50160" (default: "IEEE-519") |
| `analysis_type` | string | No | Type of analysis: "full", "harmonics", "flicker", "filter-design", "compliance", "pf-correction" |
| `filter_type` | string | No | Filter type to design: "LCL", "LC-trap", "high-pass", "active", "hybrid" |
| `target_thd` | float | No | Target THD after mitigation in percent |
| `cloud_variability` | object | No | Cloud transient parameters: {"ramp_rate": %/s, "frequency": events/hour} for flicker analysis |

## IEEE 519-2022 Harmonic Limits

### Current Distortion Limits (Table 2) — 120V through 69 kV

| Isc/IL | h < 11 | 11 ≤ h < 17 | 17 ≤ h < 23 | 23 ≤ h < 35 | 35 ≤ h ≤ 50 | TDD |
|--------|--------|-------------|-------------|-------------|-------------|-----|
| < 20 | 4.0% | 2.0% | 1.5% | 0.6% | 0.3% | 5.0% |
| 20–50 | 7.0% | 3.5% | 2.5% | 1.0% | 0.5% | 8.0% |
| 50–100 | 10.0% | 4.5% | 4.0% | 1.5% | 0.7% | 12.0% |
| 100–1000 | 12.0% | 5.5% | 5.0% | 2.0% | 1.0% | 15.0% |
| > 1000 | 15.0% | 7.0% | 6.0% | 2.5% | 1.4% | 20.0% |

*Isc = maximum short-circuit current at PCC; IL = maximum demand load current at PCC*

### Voltage Distortion Limits (Table 1)

| Bus Voltage at PCC | Individual Harmonic (%) | THDv (%) |
|--------------------|-----------------------|----------|
| ≤1.0 kV | 5.0 | 8.0 |
| 1.0–69 kV | 3.0 | 5.0 |
| 69–161 kV | 1.5 | 2.5 |
| >161 kV | 1.0 | 1.5 |

## Example Usage

### Full Harmonic Assessment

```
Prompt: "Analyze the harmonic performance of a 2 MWp PV plant connected
to a 22 kV distribution feeder. The plant has 4 × 500 kW central inverters
(NPC topology, 4 kHz switching frequency). The PCC fault level is 150 MVA
and the maximum demand load current is 200A. Apply IEEE 519-2022."
```

**Expected output:**
1. System summary: 2 MWp, 22 kV PCC, SCR = 150 MVA / 2 MVA = 75 (Isc/IL tier: 50–100)
2. Characteristic harmonic calculation for NPC inverter:
   - Dominant low-order: 5th (3.2%), 7th (2.1%), 11th (1.5%), 13th (0.9%)
   - Switching frequency sidebands: around 4 kHz (80th harmonic at 50 Hz base)
3. Harmonic aggregation from 4 inverters with diversity factor (0.85 for parallel units)
4. Individual harmonic compliance check against IEEE 519 Table 2 (50–100 tier)
5. TDD calculation: TDD = 4.1% (limit: 12.0%) — PASS
6. Voltage THD at PCC: THDv = 2.8% (limit: 5.0%) — PASS
7. Individual voltage harmonic check: all within 3.0% limit — PASS
8. Bar chart: harmonic spectrum with IEEE 519 limit line overlay
9. Compliance summary table: all criteria PASS

### LCL Filter Design

```
Prompt: "Design an LCL output filter for a 100 kW three-phase string
inverter (H-bridge topology, switching frequency 16 kHz, 400V AC output).
The grid at the connection point has a short-circuit ratio of 5 (weak grid).
Must comply with IEEE 519 for Isc/IL < 20 tier."
```

**Expected output:**

#### LCL Filter Design

**Design Parameters:**
- Inverter power: 100 kW, 400 V, 144A rated
- Switching frequency: 16 kHz
- Grid SCR: 5 (weak grid — resonance risk requires careful design)
- IEEE 519 TDD limit: 5.0% (Isc/IL < 20)

**Component Values:**

| Component | Symbol | Value | Rating |
|-----------|--------|-------|--------|
| Inverter-side inductor | L₁ | 1.2 mH | 150A, 400V |
| Grid-side inductor | L₂ | 0.6 mH | 150A, 400V |
| Filter capacitor | Cf | 30 μF (Δ-connected) | 400V AC, 10 kVAr |
| Damping resistor | Rd | 1.5 Ω | 150W (passive damping) |

**Design Verification:**
- Resonant frequency: f_res = 1/(2π√((L₁+L₂)/(L₁×L₂×Cf))) = 1.8 kHz
- Resonant frequency check: 10 × f_grid < f_res < 0.5 × f_sw → 500 Hz < 1800 Hz < 8000 Hz — PASS
- Capacitor reactive power: 3.2% of rated power (limit: <5%) — PASS
- Attenuation at switching frequency: -62 dB — PASS
- THD with filter: 3.2% (limit: 5.0%) — PASS

**Bode plot** of filter transfer function showing:
- -60 dB/decade roll-off above resonant frequency
- Damped resonance peak (with Rd)
- Switching frequency attenuation

### Voltage Flicker Assessment

```
Prompt: "Assess voltage flicker caused by a 50 MWp PV plant connected
at 132 kV. The plant experiences cloud-induced power ramps of up to
30%/minute. The grid fault level at PCC is 3000 MVA. Evaluate against
EN 50160 limits."
```

**Expected output:**
1. Cloud transient characterization: 30%/min ramp → 15 MW/min → ΔV calculation
2. Voltage step change per ramp event: ΔV = ΔP × X_grid / V² = 0.25% (at 132 kV, 3000 MVA)
3. Flicker calculation using IEC 61000-3-7 methodology:
   - Voltage change shape factor: rectangular approximation
   - Repetition rate: 10–20 events/hour (typical for cumulus clouds)
   - Pst (10-minute): 0.35 (planning level: 0.90) — PASS
   - Plt (2-hour): 0.28 (planning level: 0.70) — PASS
4. Sensitivity: Pst vs SCR chart showing compliance boundary
5. Note: at SCR < 10, flicker would exceed limits, requiring BESS or STATCOM for smoothing

### DC Injection Analysis

```
Prompt: "Evaluate DC injection from a 500 kW transformer-less inverter
connected to a 415V LV bus. What are the limits and how do we measure
compliance?"
```

**Expected output:**
- DC injection limit per IEEE 1547: <0.5% of rated output current = 0.5% × 695A = 3.48A
- DC injection limit per IEC 62109: <1% of rated current or installation of DC-sensing RCD
- Measurement method: Hall-effect DC current sensor at inverter AC output
- Typical transformer-less inverter DC offset: 20–100 mA (well within limits)
- Risk: DC injection can saturate distribution transformers, increasing magnetizing current and losses
- Mitigation: DC detection circuit in inverter (standard feature), or isolation transformer (eliminates DC path)

## Output Format

The skill produces:
- **Harmonic spectrum chart** — Bar chart of individual harmonic magnitudes with standard limit lines
- **THD/TDD report** — Calculated distortion metrics with compliance status
- **Compliance matrix** — Standard clause-by-clause pass/fail assessment
- **Filter design sheet** — Component values, ratings, Bode plot, resonance analysis
- **Power factor report** — DPF, distortion PF, true PF across operating range
- **Flicker assessment** — Pst/Plt values with planning level comparison
- **Voltage quality report** — THDv, sag/swell statistics, unbalance, DC injection
- **Frequency scan plot** — System impedance vs frequency showing resonant points

## Standards & References

- IEEE 519-2022 — Standard for Harmonic Control in Electric Power Systems
- IEEE 1547-2018 — Standard for Interconnection and Interoperability of DER with EPS
- IEC 61000-3-2:2018 — Limits for harmonic current emissions (equipment ≤16A per phase)
- IEC 61000-3-12:2011 — Limits for harmonic currents produced by equipment >16A and ≤75A
- IEC 61000-3-3:2013 — Limitation of voltage changes, voltage fluctuations and flicker
- IEC 61000-3-11:2017 — Voltage changes, fluctuations and flicker for equipment >16A and ≤75A
- IEC 61000-3-6:2008 — Assessment of emission limits for distorting loads
- IEC 61000-3-7:2008 — Assessment of emission limits for fluctuating loads
- IEC 61000-4-7:2002 — Testing and measurement techniques — Harmonics and interharmonics
- IEC 61000-4-30:2015 — Power quality measurement methods
- EN 50160:2010 — Voltage characteristics of electricity supplied by public distribution networks
- IEC 62109-1:2010 — Safety of power converters for PV power systems — Part 1: General
- IEC 62109-2:2011 — Part 2: Particular requirements for inverters

## Related Skills

- `grid-integration` — Grid code compliance and interconnection studies
- `inverter-modeling` — Inverter topology analysis and control mode simulation
- `load-flow-analysis` — Power flow and voltage analysis at PCC
- `bess-sizing` — BESS for power quality improvement (flicker mitigation, voltage support)
- `hybrid-modeling` — Multi-source harmonic interaction analysis
