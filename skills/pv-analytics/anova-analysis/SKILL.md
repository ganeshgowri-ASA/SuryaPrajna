---
name: anova-analysis
version: 1.0.0
description: Perform Analysis of Variance (ANOVA) for PV experiments — one-way, two-way, and factorial designs — to determine statistically significant effects of process parameters, materials, or environmental conditions on module performance metrics.
author: SuryaPrajna Contributors
license: MIT
tags:
  - anova
  - statistics
  - design-of-experiments
  - hypothesis-testing
  - photovoltaic
  - analytics
dependencies:
  python:
    - pandas>=2.0
    - numpy>=1.24
    - scipy>=1.10
    - statsmodels>=0.14
    - matplotlib>=3.7
  data:
    - Experimental data (CSV/Excel) with factor levels and response variables
pack: pv-analytics
agent: Cross-cutting
---

# anova-analysis

Perform Analysis of Variance (ANOVA) for PV experiments to determine whether differences in process parameters, materials, environmental conditions, or manufacturing batches produce statistically significant effects on module performance metrics such as power output, efficiency, degradation rate, or defect counts.

## LLM Instructions

### Role Definition
You are a **senior PV statistician and Design of Experiments (DoE) specialist** with deep expertise in applying ANOVA methods to photovoltaic manufacturing and field performance data. You think like an industrial statistician who ensures experimental designs are balanced, assumptions are validated, and conclusions are actionable.

### Thinking Process
When a user requests ANOVA assistance, follow this reasoning chain:
1. **Clarify the research question** — What effect is being tested? Which factors and levels are involved?
2. **Identify the experimental design** — One-way, two-way, factorial, nested, or repeated measures?
3. **Check data requirements** — Sample sizes per group, balanced vs unbalanced design, replication
4. **Validate assumptions** — Normality (Shapiro-Wilk), homogeneity of variance (Levene's test), independence
5. **Select the appropriate ANOVA model** — Fixed effects, random effects, or mixed model
6. **Run the analysis** — Sum of squares, degrees of freedom, F-statistic, p-value
7. **Post-hoc testing** — Tukey HSD, Bonferroni, or Dunnett's test if ANOVA is significant
8. **Interpret results** — Effect sizes (η², ω²), practical significance, interaction plots
9. **Recommend actions** — Which factor levels optimize the response?

### Output Format
- Begin with an **experimental design summary table** (factors, levels, sample sizes)
- Present the **ANOVA table** with SS, df, MS, F, p-value columns
- Include **assumption check results** (normality, homoscedasticity)
- Show **post-hoc comparison tables** with grouping letters
- Provide **interaction plots** or **box plots** as appropriate
- Include **units** with every numerical value (W, %, °C, kWh/m²)
- End with **conclusions and recommendations**

### Quality Criteria
- [ ] Experimental design is clearly identified (one-way, two-way, factorial)
- [ ] All assumptions are tested and reported before interpreting results
- [ ] Significance level (α) is stated explicitly (default α = 0.05)
- [ ] Effect sizes are reported alongside p-values
- [ ] Post-hoc tests are only applied when ANOVA is significant
- [ ] Practical significance is discussed, not just statistical significance

### Common Pitfalls
- **Do not** run ANOVA on severely non-normal data without considering Kruskal-Wallis as an alternative
- **Do not** ignore unequal variances — use Welch's ANOVA or transform the data
- **Do not** interpret main effects when significant interactions are present
- **Do not** confuse statistical significance with practical significance — a 0.1 W difference may be significant but not meaningful
- **Do not** apply ANOVA to time-series data without accounting for autocorrelation
- **Always** report confidence intervals alongside point estimates

### Example Interaction Patterns

**Pattern 1 — Manufacturing Process Comparison:**
User: "Compare power output across three lamination temperatures (140°C, 145°C, 150°C), 30 modules each."
→ One-way ANOVA → Check assumptions → F-test → Tukey HSD → Optimal temperature recommendation

**Pattern 2 — Two-Factor Experiment:**
User: "Analyze effects of encapsulant type (EVA, POE) and backsheet material (glass, polymer) on DH1000 power retention."
→ Two-way ANOVA → Main effects + interaction → Interaction plot → Best combination

**Pattern 3 — Multi-Factor Screening:**
User: "We ran a 2³ factorial experiment on cell interconnection: solder alloy, ribbon width, and soldering temperature."
→ Factorial ANOVA → Main effects + two-way interactions + three-way interaction → Pareto of effects → Significant factors

## Capabilities

### 1. One-Way ANOVA
- Single factor with 2+ levels
- F-test for overall effect
- Post-hoc pairwise comparisons (Tukey HSD, Bonferroni, Dunnett)
- Effect size calculation (η², ω²)

### 2. Two-Way and Factorial ANOVA
- Two or more factors with interaction effects
- Main effects and interaction F-tests
- Interaction plots for visualization
- Simple effects analysis when interactions are significant

### 3. Assumption Validation
- Normality testing (Shapiro-Wilk, Q-Q plots)
- Homogeneity of variance (Levene's test, Bartlett's test)
- Residual analysis and diagnostic plots
- Recommendations for non-parametric alternatives when assumptions fail

### 4. Post-Hoc Analysis
- Tukey HSD for all pairwise comparisons
- Dunnett's test for comparison against a control
- Bonferroni correction for multiple comparisons
- Compact letter display for grouping

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | DataFrame/CSV | Yes | Experimental data with factor columns and response variable(s) |
| `factors` | list | Yes | Column names for independent variables (factors) |
| `response` | string | Yes | Column name for the dependent variable (e.g., "power_w", "efficiency_pct") |
| `design_type` | string | No | ANOVA type: "one-way", "two-way", "factorial", "nested" (default: auto-detect) |
| `alpha` | float | No | Significance level (default: 0.05) |
| `post_hoc` | string | No | Post-hoc method: "tukey", "bonferroni", "dunnett" (default: "tukey") |
| `check_assumptions` | bool | No | Run normality and homoscedasticity tests (default: true) |
| `effect_size` | string | No | Effect size measure: "eta_squared", "omega_squared" (default: "eta_squared") |

## Example Usage

### One-Way ANOVA

```
Prompt: "Compare the STC power output (W) of modules from three different
cell suppliers (A, B, C). We have 25 modules from each supplier. Data is
in supplier_comparison.csv with columns: supplier, power_stc_w."
```

**Expected output:**
1. Descriptive statistics per supplier (mean, SD, n)
2. Assumption checks (Shapiro-Wilk per group, Levene's test)
3. ANOVA table (SS, df, MS, F, p)
4. Effect size (η²)
5. Tukey HSD pairwise comparisons with grouping letters
6. Box plot of power by supplier
7. Conclusion and recommendation

### Two-Way Factorial

```
Prompt: "Analyze the effect of encapsulant material (EVA vs POE) and
cell interconnection method (soldering vs shingling) on thermal cycling
TC200 power retention (%). 15 modules per combination."
```

**Expected output:**
1. 2×2 factorial design summary
2. Descriptive statistics per cell
3. Two-way ANOVA table with main effects and interaction
4. Interaction plot
5. Simple effects analysis if interaction is significant
6. Practical recommendations

## Output Format

The skill produces:
- **ANOVA summary table** — Standard ANOVA table with SS, df, MS, F, p
- **Assumption diagnostics** — Normality and variance test results
- **Post-hoc comparisons** — Pairwise comparison table with p-values and grouping
- **Visualizations** — Box plots, interaction plots, residual plots
- **Interpretation** — Plain-language summary of findings with effect sizes

## Standards & References

- Montgomery, D.C. — Design and Analysis of Experiments (9th ed.)
- NIST/SEMATECH e-Handbook of Statistical Methods
- ISO 3534-3 — Design of experiments
- IEC 61853-1 — PV module performance testing and energy rating

## Related Skills

- `regression-modeler` — When relationships are continuous rather than categorical
- `spc-charts` — For ongoing process monitoring after ANOVA identifies key factors
- `monte-carlo` — For propagating uncertainty from ANOVA-identified parameters
- `gum-uncertainty` — For measurement uncertainty in experimental responses
