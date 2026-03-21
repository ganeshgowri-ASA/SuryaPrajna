---
name: loss-tree
version: 1.0.0
description: Energy loss tree construction and analysis — itemize, quantify, and visualize all losses from incident solar resource to net AC energy output.
author: SuryaPrajna Contributors
license: MIT
tags:
  - loss-tree
  - energy-losses
  - performance-ratio
  - waterfall
  - photovoltaic
dependencies:
  python:
    - numpy>=1.24
    - pandas>=2.0
    - matplotlib>=3.7
    - plotly>=5.0
  data:
    - System monitoring data or simulation output
pack: pv-energy
agent: Phala-Agent
---

# loss-tree

Energy loss tree construction and analysis for PV systems. Itemizes, quantifies, and visualizes all losses from incident solar resource (GHI) to net AC energy delivered, enabling performance diagnostics and design optimization.

## LLM Instructions

### Role Definition
You are a **PV performance engineer** specializing in energy loss analysis and performance diagnostics. You can decompose total system losses into individual categories, identify abnormal losses, and recommend corrective actions. You understand the physics behind each loss mechanism and industry-standard benchmarks.

### Thinking Process
1. **Define system boundaries** — From GHI/POA to meter (or grid injection point)
2. **Categorize losses** — Optical, thermal, electrical DC, inverter/AC, external
3. **Quantify each loss** — As percentage of previous stage and absolute energy (kWh/MWh)
4. **Build sequential waterfall** — Each loss reduces the remaining energy
5. **Compare to benchmarks** — Flag losses outside normal ranges
6. **Identify optimization opportunities** — Which losses can be reduced cost-effectively
7. **Visualize** — Waterfall chart, Sankey diagram, or stacked bar chart

### Output Format
- Start with **system summary**: capacity, location, period analyzed
- Provide **loss waterfall table** with columns: stage, energy (MWh), loss (%), cumulative loss (%)
- Include **waterfall chart** (matplotlib/plotly code)
- Flag **abnormal losses** with comparison to industry benchmarks
- Recommend **optimization actions** for top 3 reducible losses
- Report final **Performance Ratio** and **specific yield**

### Quality Criteria
- [ ] All major loss categories are included (no gaps in the chain)
- [ ] Losses sum correctly from GHI to net AC
- [ ] Individual loss percentages are within plausible ranges
- [ ] Temperature losses are calculated, not assumed (if data available)
- [ ] Performance Ratio is consistent with the loss stack
- [ ] Waterfall chart clearly shows the energy flow

### Common Pitfalls
- **Do not** forget incidence angle modifier (IAM) losses — typically 2-4%
- **Do not** lump all losses into one "system losses" factor
- **Do not** confuse "loss as % of incident" with "loss as % of previous stage"
- **Do not** omit grid curtailment or availability losses for operational plants
- **Do not** double-count shading in both POA and DC loss categories

### Example Interaction Patterns
**Pattern 1 — Design-Stage Loss Tree:**
User: "Build a loss tree for a 10 MWp plant in Rajasthan"
-> Define system -> Apply standard loss assumptions -> Build waterfall -> Calculate PR

**Pattern 2 — Operational Diagnostics:**
User: "Our PR is 72%, expected 80%. Where are the losses?"
-> Analyze monitoring data -> Compare actual vs expected losses -> Identify anomalies -> Recommend actions

## Capabilities

### 1. Loss Categorization
Organize losses into standard categories: optical (shading, soiling, IAM, spectral), thermal (cell temperature), DC electrical (mismatch, wiring, LID/LeTID), conversion (inverter efficiency, clipping, MPPT), AC (wiring, transformer), and external (availability, curtailment, degradation).

### 2. Waterfall Construction
Build sequential loss waterfall from GHI through POA, effective irradiance, DC power, AC power, to net energy delivered.

### 3. Benchmark Comparison
Compare each loss category against industry benchmarks and flag losses that exceed normal ranges.

### 4. Visualization
Generate waterfall charts, Sankey diagrams, and stacked bar charts for loss visualization.

### 5. Optimization Recommendations
Identify which losses have the highest reduction potential and recommend cost-effective mitigation strategies.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `capacity_kwp` | float | Yes | System DC capacity in kWp |
| `annual_ghi` | float | Yes | Annual GHI at site in kWh/m² |
| `annual_poa` | float | No | Annual POA irradiation in kWh/m² (calculated if not provided) |
| `shading_loss` | float | No | Shading loss in % (default: 2.0) |
| `soiling_loss` | float | No | Soiling loss in % (default: 3.0) |
| `iam_loss` | float | No | Incidence angle modifier loss in % (default: 3.0) |
| `spectral_loss` | float | No | Spectral mismatch loss in % (default: 1.0) |
| `temperature_loss` | float | No | Temperature loss in % (default: 5.0) |
| `mismatch_loss` | float | No | Module mismatch loss in % (default: 1.5) |
| `wiring_dc_loss` | float | No | DC wiring loss in % (default: 1.5) |
| `lid_loss` | float | No | Light Induced Degradation loss in % (default: 1.5) |
| `inverter_loss` | float | No | Inverter conversion loss in % (default: 2.5) |
| `clipping_loss` | float | No | Inverter clipping loss in % (default: 1.0) |
| `wiring_ac_loss` | float | No | AC wiring loss in % (default: 0.5) |
| `transformer_loss` | float | No | Transformer loss in % (default: 1.5) |
| `availability_loss` | float | No | System availability loss in % (default: 2.0) |
| `curtailment_loss` | float | No | Grid curtailment loss in % (default: 0.0) |
| `degradation_loss` | float | No | Annual degradation loss in % (default: 0.0 for Year 1) |

## Example Usage

### Design-Stage Loss Tree

```
Prompt: "Build a complete energy loss tree for a 50 MWp ground-mount plant
in Rajasthan with GHI of 2050 kWh/m²/year, fixed tilt 22 degrees."
```

### Example Code

```python
import numpy as np
import matplotlib.pyplot as plt

# System parameters
capacity_kwp = 50_000
ghi = 2050  # kWh/m²/year

# Loss chain (sequential)
losses = [
    ('GHI to POA (transposition gain)', -0.05),  # gain
    ('Shading', 0.02),
    ('Soiling', 0.03),
    ('IAM', 0.03),
    ('Spectral', 0.01),
    ('Temperature', 0.06),
    ('Mismatch', 0.015),
    ('DC wiring', 0.015),
    ('LID/LeTID', 0.015),
    ('Inverter efficiency', 0.025),
    ('Inverter clipping', 0.01),
    ('AC wiring', 0.005),
    ('Transformer', 0.015),
    ('Availability', 0.02),
]

# Calculate energy at each stage
reference_yield = ghi * capacity_kwp / 1000  # MWh (at STC efficiency = 1)
# Note: actual calculation uses module efficiency
energy = ghi  # Start with irradiation
stages = [('Incident GHI', ghi)]

for name, loss in losses:
    energy = energy * (1 - loss)
    stages.append((name, energy))

pr = stages[-1][1] / ghi
print(f"Performance Ratio: {pr:.1%}")

# Waterfall chart
fig, ax = plt.subplots(figsize=(12, 6))
# ... waterfall plotting code
```

## Output Format

The skill produces:
- **Loss waterfall table**: Stage, irradiation/energy remaining, loss (%), cumulative loss (%)
- **Waterfall chart**: Visual bar chart showing energy reduction at each stage
- **Performance Ratio**: Final PR = net energy / (GHI x capacity)
- **Benchmark comparison**: Each loss vs. industry typical range
- **Optimization recommendations**: Top loss reduction opportunities

## Standards & References

- IEC 61724-1: PV system performance monitoring — performance ratio
- IEC 61724-3: Energy evaluation
- PVsyst loss diagram methodology
- SolarGIS loss tree framework

## Related Skills

- `energy-yield` — Total energy yield incorporating loss tree
- `pr-monitoring` — Performance ratio tracking over time
- `pvlib-analysis` — Simulation engine for loss calculation
- `shading-analysis` — Detailed shading loss quantification
