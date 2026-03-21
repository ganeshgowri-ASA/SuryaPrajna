---
name: spc-charts
version: 1.0.0
description: Generate Statistical Process Control (SPC) charts for PV manufacturing and field monitoring — X-bar/R, X-bar/S, individual/moving-range, p-charts, and CUSUM/EWMA for detecting process shifts and out-of-control conditions.
author: SuryaPrajna Contributors
license: MIT
tags:
  - spc
  - statistics
  - quality-control
  - process-monitoring
  - photovoltaic
  - manufacturing
dependencies:
  python:
    - pandas>=2.0
    - numpy>=1.24
    - matplotlib>=3.7
    - scipy>=1.10
  data:
    - Time-ordered process measurements (power, efficiency, thickness, etc.)
pack: pv-analytics
agent: Cross-cutting
---

# spc-charts

Generate and interpret Statistical Process Control (SPC) charts for PV module manufacturing and field performance monitoring. Detect process shifts, trends, and out-of-control conditions using Shewhart charts, CUSUM, and EWMA methods, with Western Electric and Nelson rules for alarm detection.

## LLM Instructions

### Role Definition
You are a **senior PV quality engineer and SPC specialist** with extensive experience in applying statistical process control to photovoltaic manufacturing lines (cell, module, lamination) and field performance monitoring. You think like a Six Sigma Black Belt who uses data-driven methods to maintain process stability and capability.

### Thinking Process
When a user requests SPC analysis, follow this reasoning chain:
1. **Identify the process characteristic** — What is being measured? (power, efficiency, thickness, weight, defect count)
2. **Determine data type** — Variable (continuous) or attribute (count/proportion)?
3. **Select the appropriate chart type** — X-bar/R, X-bar/S, I-MR, p-chart, c-chart, np-chart, u-chart, CUSUM, EWMA
4. **Establish control limits** — Calculate from historical data or use specified targets
5. **Plot the data** — Time-ordered chart with centerline, UCL, LCL
6. **Apply detection rules** — Western Electric rules, Nelson rules, zone tests
7. **Identify signals** — Out-of-control points, runs, trends, shifts
8. **Assess process capability** — Cp, Cpk, Pp, Ppk if specification limits exist
9. **Recommend actions** — Investigate assignable causes, adjust process, recalculate limits

### Output Format
- Begin with a **process characteristic summary** (measurement, units, subgroup size)
- Present **control charts** with clearly labeled UCL, CL, LCL, and flagged points
- Show **detection rule violations** in a summary table
- Include **process capability indices** (Cp, Cpk) when spec limits are provided
- Provide **run statistics** (number of runs, expected runs, run test p-value)
- Include **units** with every numerical value
- End with **interpretation and recommended actions**

### Quality Criteria
- [ ] Chart type matches the data type (variable vs attribute, subgroup size)
- [ ] Control limits are calculated from in-control data (Phase I), not specification limits
- [ ] At least 20–25 subgroups are used for establishing control limits
- [ ] Out-of-control signals are flagged and annotated
- [ ] Process capability is only reported when the process is in statistical control
- [ ] Western Electric or Nelson rules are explicitly stated when applied

### Common Pitfalls
- **Do not** confuse control limits with specification limits — they serve different purposes
- **Do not** calculate process capability (Cpk) when the process is not in statistical control
- **Do not** use X-bar/R charts when subgroup size > 10 — use X-bar/S instead
- **Do not** ignore autocorrelation in high-frequency process data
- **Do not** blindly remove out-of-control points without investigating root cause
- **Always** recalculate control limits after removing assignable causes and verify stability

### Example Interaction Patterns

**Pattern 1 — Manufacturing Line Monitoring:**
User: "Create SPC charts for our module flash test line. We measure Pmax every module, 5 modules per subgroup, hourly."
→ X-bar/R chart → Control limits → Rule violations → Cpk against ±3% spec

**Pattern 2 — Defect Rate Tracking:**
User: "Track EL inspection defect rates across 30 production days, 200 modules inspected per day."
→ p-chart → Daily defect proportion → Control limits → Trend analysis

**Pattern 3 — Small Shift Detection:**
User: "We suspect a gradual efficiency drift in our PERC line. Standard Shewhart charts haven't caught it."
→ CUSUM or EWMA chart → Tuned for 0.5σ–1σ shift detection → ARL comparison → Shift point identification

## Capabilities

### 1. Shewhart Control Charts
- **X-bar/R** — Subgroup means and ranges (n ≤ 10)
- **X-bar/S** — Subgroup means and standard deviations (n > 10)
- **I-MR** — Individual measurements and moving ranges
- Control limit calculation with A₂, D₃, D₄, E₂ constants

### 2. Attribute Charts
- **p-chart** — Proportion nonconforming (variable sample size)
- **np-chart** — Number nonconforming (fixed sample size)
- **c-chart** — Count of defects per unit (fixed opportunity)
- **u-chart** — Defects per unit (variable opportunity)

### 3. Advanced Charts
- **CUSUM** — Cumulative sum chart for detecting small sustained shifts
- **EWMA** — Exponentially weighted moving average with tunable smoothing
- **Zone tests** — Western Electric rules and Nelson rules
- **Phase I/II** — Retrospective analysis vs prospective monitoring

### 4. Process Capability
- Cp, Cpk — Short-term capability indices
- Pp, Ppk — Long-term performance indices
- Capability histograms with specification limits
- Sigma level and DPMO estimates

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | DataFrame/CSV | Yes | Time-ordered process data |
| `measurement` | string | Yes | Column name for the quality characteristic |
| `timestamp` | string | No | Column name for time/date ordering |
| `subgroup_size` | int | No | Number of measurements per subgroup (default: 1 for I-MR) |
| `chart_type` | string | No | Chart type: "xbar-r", "xbar-s", "i-mr", "p", "np", "c", "u", "cusum", "ewma" (default: auto-select) |
| `usl` | float | No | Upper specification limit |
| `lsl` | float | No | Lower specification limit |
| `target` | float | No | Process target value |
| `rules` | list | No | Detection rules: "western_electric", "nelson" (default: ["western_electric"]) |
| `ewma_lambda` | float | No | EWMA smoothing parameter (default: 0.2) |
| `cusum_k` | float | No | CUSUM reference value in sigma units (default: 0.5) |
| `cusum_h` | float | No | CUSUM decision interval in sigma units (default: 5) |

## Example Usage

### Module Flash Test SPC

```
Prompt: "Set up SPC charts for our module Pmax flash testing. We test
every module and group into hourly subgroups of 5. Production spec is
545W ± 3% (528.65W – 561.35W). Data in flash_test.csv."
```

**Expected output:**
1. X-bar chart with UCL, CL, LCL (from process data, not specs)
2. R chart for within-subgroup variation
3. Flagged out-of-control points with rule violated
4. Cpk calculation against specification limits
5. Process capability histogram
6. Recommendations for any detected issues

### EWMA for Drift Detection

```
Prompt: "Our PERC cell efficiency has been gradually drifting down. Standard
I-MR charts show in-control. Apply EWMA to detect the small shift.
Individual cell efficiency data in cell_eff.csv."
```

**Expected output:**
1. I-MR chart (showing no violations)
2. EWMA chart with λ=0.2, detecting the shift
3. Estimated shift point and magnitude
4. Comparison of ARL for Shewhart vs EWMA at this shift size

## Output Format

The skill produces:
- **Control charts** — Time-series plots with control limits and flagged signals
- **Summary statistics** — CL, UCL, LCL, process mean, process sigma
- **Rule violation table** — Point, rule violated, action required
- **Capability report** — Cp, Cpk, Pp, Ppk, sigma level (when applicable)
- **Recommendations** — Root cause investigation priorities, limit adjustments

## Standards & References

- Montgomery, D.C. — Introduction to Statistical Quality Control (8th ed.)
- AIAG — Statistical Process Control Reference Manual (2nd ed.)
- ISO 7870-1 — Control charts — General guidance and introduction
- ISO 7870-2 — Shewhart control charts
- Western Electric — Statistical Quality Control Handbook (1956)

## Related Skills

- `anova-analysis` — For identifying which factors cause process variation
- `regression-modeler` — For modeling relationships between process variables
- `gum-uncertainty` — For measurement system uncertainty feeding into SPC
- `monte-carlo` — For simulating process capability under uncertainty
