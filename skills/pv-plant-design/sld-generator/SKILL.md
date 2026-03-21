---
name: sld-generator
version: 1.0.0
description: Single Line Diagram (SLD) generation for PV systems — create standard electrical single-line diagrams showing PV arrays, inverters, protection devices, transformers, and grid connection.
author: SuryaPrajna Contributors
license: MIT
tags:
  - sld
  - single-line-diagram
  - electrical-design
  - protection
  - grid-connection
dependencies:
  python:
    - matplotlib>=3.7
    - numpy>=1.24
  data:
    - System electrical design (string sizing, inverter selection, transformer rating)
    - Protection device specifications
pack: pv-plant-design
agent: Vinyasa-Agent
---

# sld-generator

Single Line Diagram (SLD) generation for PV power plants and rooftop systems. Creates standardized electrical single-line diagrams showing PV arrays, string combiner boxes, inverters, AC distribution panels, transformers, protection devices, metering, and grid interconnection points.

## LLM Instructions

### Role Definition
You are a **PV electrical design engineer** specializing in power system single-line diagrams and protection coordination. You create clear, standards-compliant SLDs that communicate the complete electrical architecture from PV modules to grid connection, including all protection devices, metering points, and disconnection means.

### Thinking Process
1. **Define system architecture** — Central inverter, string inverter, or micro-inverter topology
2. **DC side design** — PV strings, string combiner boxes (SCBs), DC cabling, DC disconnect
3. **Inverter section** — Inverter(s), MPPT inputs, AC output
4. **AC collection** — AC combiner panels, LT switchgear
5. **Step-up transformer** — LT to HT transformation (for utility-scale)
6. **Protection devices** — Fuses, MCBs, ACBs, surge protection (SPD), RCDs, circuit breakers
7. **Metering** — Energy meters, CTs, PTs, SCADA connection points
8. **Grid connection** — Point of common coupling (PCC), grid protection relay, interlock
9. **Generate diagram** — Text-based or matplotlib-based SLD with standard symbols

### Output Format
- Start with **system summary**: topology, capacity, voltage levels
- Provide **component list table**: all major electrical components with ratings
- Generate **SLD diagram** using text art or matplotlib
- Include **protection coordination table**: device ratings, trip settings
- List **applicable standards** for each protection device
- Note **metering requirements**: import/export meters, CT/PT ratios

### Quality Criteria
- [ ] All disconnection means are shown (DC isolator, AC breaker, main breaker)
- [ ] Surge protection devices (SPDs) are shown on both DC and AC sides
- [ ] Earthing/grounding system is indicated
- [ ] Metering point is correctly located per utility requirements
- [ ] Protection device ratings match cable and equipment ratings
- [ ] Voltage levels are clearly labeled at each stage
- [ ] SLD flows logically from DC (left/top) to AC/grid (right/bottom)

### Common Pitfalls
- **Do not** omit DC isolators — required for safe inverter maintenance
- **Do not** forget anti-islanding protection for grid-connected systems
- **Do not** skip surge protection devices — required per IEC 62305
- **Do not** ignore neutral-earth bonding requirements
- **Do not** omit the main AC disconnect required by utility
- **Do not** forget residual current devices (RCDs) where required by code

## Capabilities

### 1. Topology Design
Design electrical topology for various system types: residential (single-phase), commercial (three-phase), utility-scale (central inverter, MV collection).

### 2. Protection Scheme Design
Select and coordinate protection devices: string fuses, DC MCBs, AC circuit breakers, surge protection, residual current devices, grid protection relays.

### 3. SLD Generation
Generate single-line diagrams using text-based representation or matplotlib graphics with standard electrical symbols.

### 4. Component Specification
Specify ratings for all electrical components: cables, fuses, breakers, transformers, meters, CTs, PTs.

### 5. Grid Connection Design
Design grid interconnection including point of common coupling, anti-islanding, export limiting, and utility metering requirements.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `capacity_kwp` | float | Yes | System DC capacity in kWp |
| `topology` | string | No | "string_inverter", "central_inverter", "micro_inverter" (default: "string_inverter") |
| `inverter_model` | string | Yes | Inverter model name and rating |
| `n_inverters` | int | Yes | Number of inverters |
| `strings_per_inverter` | int | Yes | Number of strings per inverter |
| `modules_per_string` | int | Yes | Number of modules per string |
| `system_voltage_dc` | float | No | Maximum DC system voltage (default: 1500) |
| `ac_voltage` | float | No | AC output voltage in volts (default: 415) |
| `transformer_rating` | float | No | Step-up transformer rating in kVA (for utility-scale) |
| `grid_voltage` | float | No | Grid connection voltage in kV |
| `phase` | string | No | "single" or "three" (default: "three") |
| `metering` | string | No | "net", "gross", "bidirectional" (default: "bidirectional") |

## Example Usage

### Utility-Scale SLD

```
Prompt: "Generate a single line diagram for a 5 MWp ground-mount PV plant
with 20x Sungrow SG250HX string inverters, 2x 2.5 MVA step-up transformers
(0.8kV/33kV), connecting to 33kV grid."
```

### Example Code

```python
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

fig, ax = plt.subplots(1, 1, figsize=(16, 10))
ax.set_xlim(0, 16)
ax.set_ylim(0, 10)
ax.set_aspect('equal')
ax.axis('off')
ax.set_title('Single Line Diagram — 5 MWp PV Plant', fontsize=14, fontweight='bold')

# PV Array block
ax.add_patch(mpatches.Rectangle((1, 7), 2, 2, fill=True, facecolor='lightyellow', edgecolor='black'))
ax.text(2, 8, 'PV Array\n5 MWp\n1500V DC', ha='center', va='center', fontsize=8)

# DC Disconnect
ax.plot([3, 4], [8, 8], 'k-', linewidth=2)
ax.plot([3.4, 3.6], [8.3, 7.7], 'k-', linewidth=2)  # switch symbol
ax.text(3.5, 8.5, 'DC\nDisconnect', ha='center', fontsize=7)

# Inverter
ax.add_patch(mpatches.Rectangle((4.5, 7), 2, 2, fill=True, facecolor='lightblue', edgecolor='black'))
ax.text(5.5, 8, 'Inverters\n20x SG250HX\n250kW each\n800V AC', ha='center', va='center', fontsize=7)

# AC Breaker
ax.plot([6.5, 7.5], [8, 8], 'k-', linewidth=2)
ax.text(7, 8.5, 'AC CB', ha='center', fontsize=7)

# Transformer
ax.plot([8, 8.5], [8.5, 8.5], 'k-')
ax.plot([8, 8.5], [7.5, 7.5], 'k-')
circle1 = plt.Circle((8.7, 8.3), 0.3, fill=False, edgecolor='black')
circle2 = plt.Circle((8.7, 7.7), 0.3, fill=False, edgecolor='black')
ax.add_patch(circle1)
ax.add_patch(circle2)
ax.text(8.7, 8.9, '2x 2.5MVA\n0.8/33kV', ha='center', fontsize=7)

# HT Breaker
ax.plot([9.2, 10.5], [8, 8], 'k-', linewidth=2)
ax.text(10, 8.5, 'VCB\n33kV', ha='center', fontsize=7)

# Metering
ax.add_patch(mpatches.Rectangle((11, 7.5), 1, 1, fill=True, facecolor='lightgreen', edgecolor='black'))
ax.text(11.5, 8, 'Meter\nCT/PT', ha='center', va='center', fontsize=7)

# Grid
ax.plot([12, 13.5], [8, 8], 'k-', linewidth=2)
ax.plot([14, 14], [7, 9], 'k-', linewidth=3)
ax.text(14, 9.3, '33kV Grid', ha='center', fontsize=9, fontweight='bold')

plt.tight_layout()
# plt.savefig('sld_5mwp.png', dpi=150, bbox_inches='tight')
```

## Output Format

The skill produces:
- **System architecture summary**: Topology, capacity, voltage levels
- **Component schedule**: All electrical components with ratings
- **SLD diagram**: Visual single-line diagram (text or graphic)
- **Protection schedule**: Device types, ratings, trip settings
- **Metering specification**: Meter types, CT/PT ratios, accuracy class
- **Earthing scheme**: Grounding configuration and electrode specifications

## Standards & References

- IEC 62548: Design requirements for PV arrays
- IEC 62109-1/2: Safety of power converters for PV systems
- IEC 61936-1: Power installations exceeding 1 kV AC
- IEEE 1547: Standard for interconnection of distributed resources
- IS 732: Code of practice for electrical wiring installations (India)
- CEA Technical Standards for grid connectivity (India)

## Related Skills

- `string-sizing` — String and inverter configuration input
- `cable-sizing` — Cable sizing for SLD components
- `array-layout` — Physical layout informing electrical design
- `energy-yield` — System performance with designed configuration
