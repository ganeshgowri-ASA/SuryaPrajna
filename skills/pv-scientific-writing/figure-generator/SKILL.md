---
name: figure-generator
version: 1.0.0
description: >
  Generate publication-quality scientific figures for PV research including
  I-V curves, loss trees, EQE spectra, degradation plots, heatmaps, and
  EL/IR image analysis. Provides matplotlib/plotly code generation, figure
  caption writing, and vision-based defect detection prompts.
author: SuryaPrajna Contributors
license: MIT
tags:
  - figures
  - visualization
  - matplotlib
  - plotly
  - iv-curves
  - electroluminescence
  - scientific-writing
  - photovoltaic
dependencies:
  python:
    - matplotlib>=3.7
    - plotly>=5.15
    - numpy>=1.24
    - pandas>=2.0
    - scipy>=1.10
    - pillow>=10.0
    - scikit-image>=0.21
  data:
    - Measurement data (CSV, Excel, or inline)
    - EL/IR images (PNG, TIFF) for defect analysis
pack: pv-scientific-writing
agent: Grantha-Agent
---

# figure-generator

Generate publication-quality scientific figures for photovoltaic research. This skill produces ready-to-run Python code (matplotlib/plotly), writes figure captions, and provides vision-model prompts for EL/IR image analysis.

---

## LLM Behavioral Instructions

> **These instructions define HOW you must think, reason, and produce output when this skill is invoked.**

### Core Figure Generation Protocol

When asked to create a scientific figure, follow this exact sequence:

1. **Identify Figure Type** — Determine which PV figure type is needed from the categories below. If ambiguous, ask the user.

2. **Gather Data Requirements** — Before generating code, confirm:
   - Data source: CSV file path, inline data, or simulated/example data
   - Units for all axes (always SI: W/m², mA/cm², V, %, kWh, °C)
   - Number of curves/datasets to overlay
   - Any comparison datasets (e.g., literature values)

3. **Generate Production-Ready Code** — Output a complete, runnable Python script that:
   - Imports all required libraries at the top
   - Loads or defines data clearly
   - Sets publication-quality defaults (font sizes, line widths, DPI)
   - Uses a consistent style: `plt.style.use('seaborn-v0_8-paper')` or equivalent
   - Saves to both PNG (300 dpi) and SVG/PDF for vector quality
   - Includes proper axis labels with units, legend, and title (optional per journal)

4. **Write Figure Caption** — Generate a publication-ready caption following this structure:
   - **First sentence**: State what the figure shows (e.g., "Current density–voltage (J-V) characteristics of...")
   - **Body**: Describe key features, conditions, sample identifiers
   - **Units and conditions**: Specify measurement conditions (STC, temperature, illumination)

5. **Suggest Placement** — Recommend where in the manuscript this figure should appear and what it demonstrates.

### Publication Style Defaults

Always apply these defaults unless the user specifies otherwise:

```python
import matplotlib as mpl

# Publication defaults
mpl.rcParams.update({
    'font.family': 'serif',
    'font.serif': ['Times New Roman', 'DejaVu Serif'],
    'font.size': 10,
    'axes.labelsize': 11,
    'axes.titlesize': 12,
    'xtick.labelsize': 9,
    'ytick.labelsize': 9,
    'legend.fontsize': 9,
    'figure.dpi': 300,
    'savefig.dpi': 300,
    'savefig.bbox': 'tight',
    'lines.linewidth': 1.5,
    'axes.linewidth': 0.8,
    'xtick.major.width': 0.8,
    'ytick.major.width': 0.8,
})
```

### Color Standards

Use colorblind-safe palettes. Default PV color scheme:
```python
PV_COLORS = {
    'primary': '#1f77b4',    # Blue — main dataset
    'secondary': '#ff7f0e',  # Orange — comparison
    'tertiary': '#2ca02c',   # Green — reference/baseline
    'quaternary': '#d62728', # Red — highlight/anomaly
    'quinary': '#9467bd',    # Purple — additional
    'senary': '#8c564b',     # Brown — additional
}
```

---

## PV Figure Types

### 1. I-V and J-V Curves

Current-voltage characteristics — the most fundamental PV figure.

**Code Template:**
```python
import matplotlib.pyplot as plt
import numpy as np

def plot_jv_curve(voltage, current_density, label='Device',
                  ax=None, show_params=True, **kwargs):
    """
    Plot J-V curve with automatic parameter extraction.

    Parameters
    ----------
    voltage : array-like
        Voltage in volts (V)
    current_density : array-like
        Current density in mA/cm²
    label : str
        Legend label
    show_params : bool
        Annotate Voc, Jsc, FF, PCE on plot
    """
    if ax is None:
        fig, ax = plt.subplots(figsize=(3.5, 3.0))

    ax.plot(voltage, current_density, label=label, **kwargs)

    if show_params:
        jsc = np.interp(0, voltage, current_density)
        voc = np.interp(0, current_density[::-1], voltage[::-1])
        power = voltage * current_density
        pmax = np.max(np.abs(power))
        ff = pmax / (abs(jsc) * voc) * 100
        pce = pmax / 10  # Assuming 100 mW/cm² irradiance

        param_text = (f'$V_{{OC}}$ = {voc:.3f} V\n'
                      f'$J_{{SC}}$ = {abs(jsc):.2f} mA/cm²\n'
                      f'FF = {ff:.1f}%\n'
                      f'PCE = {pce:.2f}%')
        ax.text(0.05, 0.05, param_text, transform=ax.transAxes,
                fontsize=8, verticalalignment='bottom',
                bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

    ax.set_xlabel('Voltage (V)')
    ax.set_ylabel('Current Density (mA/cm²)')
    ax.axhline(y=0, color='gray', linewidth=0.5, linestyle='--')
    ax.axvline(x=0, color='gray', linewidth=0.5, linestyle='--')
    ax.legend()

    return ax

# Example usage with simulated data
V = np.linspace(-0.1, 1.2, 200)
# Single-diode model approximation
J0 = 1e-12  # mA/cm²
Jph = 40.0  # mA/cm²
n = 1.3
Vt = 0.02585  # kT/q at 25°C
J = Jph - J0 * (np.exp(V / (n * Vt)) - 1)
J = np.clip(J, -5, 45)

fig, ax = plt.subplots(figsize=(3.5, 3.0))
plot_jv_curve(V, J, label='Perovskite Cell', ax=ax)
plt.tight_layout()
plt.savefig('jv_curve.png', dpi=300)
plt.savefig('jv_curve.svg')
plt.show()
```

**Caption Template:**
> **Figure X.** Current density–voltage (J-V) characteristics of the [device type] measured under AM1.5G illumination (100 mW/cm²) at 25 °C. Key performance parameters are annotated: V_OC = X.XX V, J_SC = XX.X mA/cm², FF = XX.X%, PCE = XX.X%.

---

### 2. External Quantum Efficiency (EQE)

**Code Template:**
```python
def plot_eqe(wavelength_nm, eqe_percent, label='Device',
             ax=None, show_jsc=True):
    """
    Plot EQE spectrum with integrated Jsc calculation.

    Parameters
    ----------
    wavelength_nm : array-like
        Wavelength in nm (typically 300-1200 nm)
    eqe_percent : array-like
        EQE in percent (0-100)
    show_jsc : bool
        Calculate and display integrated Jsc
    """
    if ax is None:
        fig, ax = plt.subplots(figsize=(3.5, 3.0))

    ax.plot(wavelength_nm, eqe_percent, label=label, linewidth=1.5)

    if show_jsc:
        # Integrate EQE with AM1.5G spectrum for Jsc
        # Jsc = q * integral(EQE(λ) * Φ(λ) dλ)
        ax.text(0.95, 0.95,
                f'$J_{{SC,EQE}}$ = XX.X mA/cm²',
                transform=ax.transAxes, ha='right', va='top', fontsize=8)

    ax.set_xlabel('Wavelength (nm)')
    ax.set_ylabel('EQE (%)')
    ax.set_xlim(300, 1200)
    ax.set_ylim(0, 100)
    ax.legend()

    return ax
```

---

### 3. Energy Loss Tree (Waterfall Chart)

**Code Template:**
```python
def plot_loss_tree(loss_categories, loss_values_kwh, total_available,
                   ax=None):
    """
    Plot energy loss waterfall chart.

    Parameters
    ----------
    loss_categories : list of str
        Loss category names
    loss_values_kwh : list of float
        Loss values in kWh (positive = loss)
    total_available : float
        Total available energy in kWh (GHI × area)
    """
    if ax is None:
        fig, ax = plt.subplots(figsize=(5, 4))

    cumulative = total_available
    starts = []
    for loss in loss_values_kwh:
        starts.append(cumulative - loss)
        cumulative -= loss

    colors = ['#d62728' if v > 0 else '#2ca02c' for v in loss_values_kwh]

    ax.barh(range(len(loss_categories)), loss_values_kwh,
            left=starts, color=colors, edgecolor='black', linewidth=0.5)
    ax.set_yticks(range(len(loss_categories)))
    ax.set_yticklabels(loss_categories)
    ax.set_xlabel('Energy (kWh)')
    ax.invert_yaxis()

    return ax

# Example
categories = ['Shading', 'Soiling', 'Temperature', 'Mismatch',
              'Wiring', 'Inverter', 'Clipping', 'Availability']
losses = [45, 30, 85, 20, 15, 35, 10, 8]
plot_loss_tree(categories, losses, total_available=1500)
```

---

### 4. Degradation Rate Plots

**Code Template:**
```python
def plot_degradation(years, power_values, fit_type='linear',
                     confidence=0.95, ax=None):
    """
    Plot power degradation over time with trend line.

    Parameters
    ----------
    years : array-like
        Time in years
    power_values : array-like
        Normalized power (fraction of initial, 0-1)
    fit_type : str
        'linear' or 'exponential'
    confidence : float
        Confidence interval level
    """
    from scipy import stats

    if ax is None:
        fig, ax = plt.subplots(figsize=(4, 3))

    ax.scatter(years, power_values * 100, s=15, alpha=0.6, label='Measured')

    if fit_type == 'linear':
        slope, intercept, r, p, se = stats.linregress(years, power_values * 100)
        fit_line = slope * np.array(years) + intercept
        ax.plot(years, fit_line, 'r-', linewidth=1.5,
                label=f'Fit: {slope:.2f} %/year (R² = {r**2:.3f})')

    ax.set_xlabel('Time (years)')
    ax.set_ylabel('Normalized Power (%)')
    ax.set_ylim(70, 105)
    ax.legend(fontsize=8)
    ax.axhline(y=80, color='gray', linestyle='--', linewidth=0.5,
               label='80% warranty threshold')

    return ax
```

---

### 5. Heatmaps (Module Temperature, Irradiance, Performance)

**Code Template:**
```python
def plot_heatmap(data_2d, x_labels, y_labels, cbar_label='',
                 cmap='YlOrRd', ax=None):
    """
    Plot heatmap for PV data (monthly performance, temperature, etc.).

    Parameters
    ----------
    data_2d : 2D array
        Data matrix (e.g., 12 months × 24 hours)
    x_labels : list
        X-axis labels (e.g., hours)
    y_labels : list
        Y-axis labels (e.g., months)
    cbar_label : str
        Colorbar label with units
    """
    if ax is None:
        fig, ax = plt.subplots(figsize=(5, 3.5))

    im = ax.imshow(data_2d, aspect='auto', cmap=cmap, interpolation='nearest')
    cbar = plt.colorbar(im, ax=ax, shrink=0.8)
    cbar.set_label(cbar_label)

    ax.set_xticks(range(len(x_labels)))
    ax.set_xticklabels(x_labels, rotation=45, ha='right', fontsize=7)
    ax.set_yticks(range(len(y_labels)))
    ax.set_yticklabels(y_labels, fontsize=7)

    return ax
```

---

### 6. EL/IR Image Analysis (Vision Model Integration)

For electroluminescence and infrared thermography image analysis, use vision-capable models (Claude Vision, GPT-4o) with these structured prompts.

**EL Image Defect Detection Prompt:**
```
You are analyzing an electroluminescence (EL) image of a PV module.

Examine the image systematically:

1. CELL-LEVEL SCAN: Inspect each cell in the module grid.
   For each cell, note:
   - Uniform luminescence (healthy) or dark regions (inactive areas)
   - Crack patterns: linear (mechanical), branching (thermal), edge (handling)
   - Intensity variations: gradual (shunt) vs. sharp boundaries (cracks)

2. MODULE-LEVEL PATTERNS:
   - String-level differences (bypass diode activation)
   - Systematic patterns suggesting manufacturing defects
   - Edge effects or frame-related damage

3. DEFECT CLASSIFICATION:
   For each defect found, report:
   - Location: Row X, Column Y (counting from top-left)
   - Type: micro-crack / cell crack / inactive cell / shunt / finger defect /
           interconnect failure / PID / snail trail / hot spot precursor
   - Severity: minor (cosmetic) / moderate (performance impact) / severe (safety risk)
   - Estimated power loss contribution: X% of cell power

4. QUANTITATIVE SUMMARY:
   - Total cells inspected: N
   - Defective cells: M (M/N = X%)
   - Estimated module power impact: X%
   - Recommended action: pass / monitor / reject / rework

Output a structured table of findings.
```

**IR Thermography Analysis Prompt:**
```
You are analyzing an infrared (IR) thermography image of a PV module or array.

Examine systematically:

1. TEMPERATURE DISTRIBUTION:
   - Identify the temperature range (min, max, ΔT)
   - Note the ambient temperature if visible
   - Flag any cell with ΔT > 10°C above neighbors (potential hot spot)

2. HOT SPOT IDENTIFICATION:
   - Location of each hot spot
   - Temperature differential from surrounding cells
   - Pattern: single cell, string, cluster, edge

3. ROOT CAUSE ANALYSIS:
   - Single hot cell: likely shading, bypass diode, cell defect
   - String pattern: possible string failure, connector issue
   - Edge heating: frame grounding issue, delamination
   - Uniform but elevated: soiling, high irradiance conditions

4. SEVERITY CLASSIFICATION:
   - ΔT < 10°C: Normal variation
   - ΔT 10-20°C: Monitor, schedule inspection
   - ΔT 20-40°C: Service required, potential safety concern
   - ΔT > 40°C: Immediate action required, fire risk

Output findings with recommended maintenance actions.
```

---

## Figure Sizing Guidelines by Journal

| Publisher | Single Column | Double Column | Full Page |
|-----------|---------------|---------------|-----------|
| Wiley | 8.3 cm (3.27") | 17.1 cm (6.73") | 23.4 cm height max |
| Elsevier | 9 cm (3.54") | 18 cm (7.09") | 24 cm height max |
| IEEE | 8.8 cm (3.46") | 18.1 cm (7.13") | 23.5 cm height max |
| Springer/Nature | 8.9 cm (3.50") | 18.3 cm (7.20") | 24.7 cm height max |
| SPIE | 8.5 cm (3.35") | 17 cm (6.69") | — |

### Size in Code

```python
# Convert cm to inches for matplotlib
def cm_to_inch(cm):
    return cm / 2.54

# Single-column Elsevier figure
fig, ax = plt.subplots(figsize=(cm_to_inch(9), cm_to_inch(7)))
```

---

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `figure_type` | string | Yes | One of: "jv_curve", "eqe", "loss_tree", "degradation", "heatmap", "el_analysis", "ir_analysis", "custom" |
| `data_source` | string | No | Path to CSV/Excel file or "inline" or "simulate" |
| `target_journal` | string | No | Journal name for sizing (default: generic publication quality) |
| `output_format` | string | No | "png", "svg", "pdf", or "all" (default: "png") |
| `colormap` | string | No | Matplotlib colormap name (default: colorblind-safe) |
| `n_datasets` | int | No | Number of datasets to overlay (default: 1) |
| `caption` | bool | No | Generate figure caption (default: true) |
| `interactive` | bool | No | Use plotly for interactive HTML output (default: false) |
