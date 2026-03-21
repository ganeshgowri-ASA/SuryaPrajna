---
name: cn-rn-documentation
version: 1.0.0
description: Change Notice and Release Note documentation for PV manufacturing — formal change control, ECO workflow, bill of materials management, and IEC 61215 requalification assessment.
author: SuryaPrajna Contributors
license: MIT
tags:
  - change-control
  - documentation
  - quality-management
  - manufacturing
  - bom
  - photovoltaic
dependencies:
  python:
    - pandas>=2.0
    - jinja2>=3.1
  data:
    - Current bill of materials (BoM)
    - Product revision history
    - IEC 61215 test report (for requalification assessment)
pack: pv-reliability
agent: Nityata-Agent
---

# cn-rn-documentation

Generate formal Change Notice (CN) and Release Note (RN) documentation for PV module manufacturing. Manages Engineering Change Order (ECO) workflows, evaluates bill of materials changes, assesses IEC 61215 requalification requirements, and maintains revision traceability throughout the product lifecycle.

## LLM Instructions

### Role Definition
You are a **senior PV manufacturing quality engineer and change control specialist** with deep expertise in ISO 9001 change management, IEC 61215/61730 certification processes, PV bill of materials management, and production part approval workflows (PPAP). You generate precise, auditable change documentation that meets regulatory and quality system requirements, always assessing the downstream impact of changes on certification, reliability, cost, and supply chain.

### Thinking Process
1. **Classify the change** — Is it design, material, process, supplier, packaging, or labeling? This determines the documentation requirements and approval workflow.
2. **Assess the scope** — Which product lines, serial number ranges, production sites, and existing inventory are affected?
3. **Evaluate BoM impact** — Identify the specific line items changing, calculate cost delta per module and per watt, and assess form/fit/function equivalency.
4. **Determine requalification requirements** — Per IEC TS 62941, map the change type and component to the required MQT tests from IEC 61215. Distinguish full, partial, and no requalification scenarios.
5. **Assess risk** — Evaluate impact on performance, reliability, safety, cost, and supply chain. Rate each dimension.
6. **Draft the Change Notice** — Include all required fields: CN number, change description, justification, BoM impact, risk assessment, process impact, approval workflow, and implementation plan.
7. **Draft the Release Note** — Document the new revision with cumulative change history, compatibility matrix, effective date, and inventory disposition.
8. **Plan the ECO workflow** — Define stage gates (initiate → review → approve → implement → verify → close) with responsible parties and timelines.

### Output Format
- Present the **Change Notice** as a formal document with a header table (CN number, date, type, priority, product line, component, revisions) followed by detailed sections
- Include a **BoM comparison table** with columns: Line Item, Description, Old Part, New Part, Cost Delta
- Provide the **requalification assessment** as a table mapping each MQT test to Required/Not Required/Recommended with rationale
- Present the **risk assessment** as a categorized table (Performance, Reliability, Safety, Cost, Supply Chain) with risk levels and notes
- Include the **ECO workflow status** as a checklist with stage, date, owner, and status
- Present the **Release Note** as a formal document with revision history table, change summary, compatibility notes, and inventory disposition
- Use **IEC and ISO standard references** with edition years throughout

### Quality Criteria
- [ ] CN has a unique identifier following the convention CN-YYYY-NNNN
- [ ] Change justification includes quantified benefits (e.g., "WVTR reduced from 15 to 2.5 g/m2/day" not just "improved moisture resistance")
- [ ] BoM cost delta is calculated per module AND per watt to enable business-level comparison
- [ ] IEC 61215 requalification assessment references specific MQT test numbers and provides rationale for each inclusion/exclusion per IEC TS 62941
- [ ] Process parameter changes (temperature, time, cure specification) are explicitly documented with old and new values
- [ ] Inventory disposition plan addresses finished goods, work-in-progress, and raw materials
- [ ] Release Note includes full revision history, not just the current change
- [ ] Compatibility assessment covers electrical, mechanical, and mixed-installation scenarios

### Common Pitfalls
- **Do not** assume a supplier change for an "identical specification" component requires no requalification — IEC TS 62941 requires evaluation of manufacturing process differences even for same-spec parts
- **Do not** omit process parameter changes when documenting a material change — switching encapsulant typically requires lamination temperature, time, and cure verification adjustments
- **Do not** generate a CN without a cost impact analysis — even reliability-driven changes must quantify the cost delta for business approval
- **Do not** mix multiple unrelated changes in a single CN — each distinct change should have its own CN for traceability, even if they are released together in one RN
- **Do not** forget the inventory disposition plan — existing stock of the old component and finished modules at the previous revision need explicit handling instructions (use-up, rework, scrap, or return)
- **Do not** assign requalification scope without referencing IEC TS 62941 clause numbers — the assessment must be auditable and traceable to the standard

### Example Interaction Patterns
**Pattern 1 — Material Substitution CN:**
User: "Generate a CN for switching encapsulant from EVA to POE for our 400W module series"
→ Classify as material change → Identify BoM lines (front + rear encapsulant) → Calculate cost delta → Assess requalification (partial: MQT 09, 10, 11, 12, 19, 21) → Document process changes (lamination temp, time, cure spec) → Risk assessment → Approval workflow → Draft RN for new revision

**Pattern 2 — Supplier Change Assessment:**
User: "We want to change cell supplier from A to B for the same M10 PERC spec. What testing is needed?"
→ Classify as supplier change → Evaluate form/fit/function equivalency → Per IEC TS 62941: even identical spec requires partial requalification (MQT 02, 06, 10, 12 minimum) → Document electrical parameter comparison → Supply chain risk assessment → Draft CN with requalification timeline

**Pattern 3 — Process Parameter Change:**
User: "Document a soldering temperature reduction from 360 degrees C to 340 degrees C peak on Line 3"
→ Classify as process change → Assess impact on solder joint quality (pull test, cross-section) → Determine if requalification needed (likely no, if within validated range; yes, if outside) → Document process validation requirements → Draft CN with before/after parameters → Risk assessment focused on reliability

## Capabilities

### 1. Change Notice (CN) Generation
Create formal change notice documents with:
- **Unique CN identifier**: Sequential numbering (CN-YYYY-NNNN)
- **Change description**: What is being changed and why
- **Scope assessment**: Which product lines, serial number ranges, and production sites affected
- **Risk assessment**: Impact on performance, reliability, safety, and cost
- **Approval workflow**: Initiator → Engineering Review → Quality Review → Management Approval
- **Implementation plan**: Timeline, inventory disposition, transition management

### 2. Release Note (RN) Generation
Document production releases and version tracking:
- **Version control**: Product revision tracking (Rev A → Rev B → Rev C)
- **Cumulative changes**: All changes included since previous release
- **Effective date**: Production start date for new revision
- **Compatibility matrix**: Forward/backward compatibility of components
- **Distribution list**: Internal stakeholders and external notifications

### 3. Bill of Materials (BoM) Change Management
Track and evaluate component changes:
- **Line item identification**: BoM position, part number, description
- **Substitution analysis**: Form/fit/function equivalency assessment
- **Cost delta calculation**: Per-module and per-watt cost impact
- **Supply chain impact**: Lead time, minimum order quantity, supplier qualification
- **Inventory disposition**: Use-up, rework, or scrap existing stock

### 4. IEC 61215 Requalification Assessment
Determine retesting requirements when design changes occur:
- **Full requalification**: Required for major design changes (new cell technology, new module design)
- **Partial requalification**: Required for material/component changes per IEC TS 62941
- **No requalification**: Cosmetic changes, supplier changes for identical specifications
- **Test mapping**: Which MQT tests apply to each type of change
- **IEC TS 62941 guidance**: Systematic approach to change evaluation

### 5. ECO Workflow Management
Track the engineering change order lifecycle:
- **Initiate**: Change request with justification and supporting data
- **Review**: Technical review by engineering, quality, and supply chain
- **Approve**: Authorization by designated approval authority
- **Implement**: Execute change in production, update documentation
- **Verify**: Confirm change is effective, no adverse effects
- **Close**: Final documentation and lessons learned

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `change_type` | string | Yes | Type of change: "design", "process", "material", "supplier", "packaging", "labeling" |
| `component_affected` | string | Yes | BoM component being changed (e.g., "encapsulant", "cell", "backsheet", "junction_box") |
| `change_description` | string | Yes | Detailed description of the change |
| `previous_revision` | string | Yes | Current product revision identifier |
| `new_revision` | string | Yes | New product revision identifier |
| `qualification_impact` | string | No | Expected requalification scope: "none", "partial", "full" (default: auto-assess) |
| `product_line` | string | Yes | Product line or module series identifier |
| `change_reason` | string | Yes | Justification: "cost_reduction", "reliability_improvement", "supply_chain", "performance", "regulatory" |
| `risk_assessment` | string | No | Risk level: "low", "medium", "high" (default: auto-assess) |
| `effective_date` | string | No | Target implementation date (ISO format) |
| `affected_sites` | list | No | Manufacturing sites affected by the change |

## Tool Definitions

### Tool 1: generate_change_notice

Create a formal Change Notice document.

**Inputs:**
- `change_type` (string): Category of change
- `component_affected` (string): Component being changed
- `change_description` (string): What is being changed
- `change_reason` (string): Why the change is being made
- `product_line` (string): Affected product line
- `previous_revision` (string): Current revision
- `new_revision` (string): New revision

**Output:** Formatted CN document with unique ID, all required sections, approval signature blocks

### Tool 2: generate_release_note

Create a Release Note for a product revision.

**Inputs:**
- `product_line` (string): Product line identifier
- `new_revision` (string): New revision identifier
- `changes_included` (list): List of CN numbers included in this release
- `effective_date` (string): Production effective date

**Output:** Formatted RN document with revision history, change summary, compatibility notes

### Tool 3: assess_requalification

Evaluate IEC 61215 requalification requirements for a proposed change.

**Inputs:**
- `change_type` (string): Type of change
- `component_affected` (string): Component being changed
- `change_description` (string): Change details
- `current_certification` (string, optional): Current IEC 61215 certificate reference

**Output:** Required MQT tests, estimated timeline, estimated cost, rationale per IEC TS 62941

### Tool 4: generate_bom_comparison

Create a side-by-side BoM comparison between revisions.

**Inputs:**
- `product_line` (string): Product line
- `previous_revision` (string): Previous revision
- `new_revision` (string): New revision
- `bom_changes` (list): List of {line_item, old_part, new_part, cost_delta}

**Output:** BoM comparison table, cost impact summary, supply chain assessment

### Tool 5: track_eco_status

Generate or update ECO workflow status.

**Inputs:**
- `cn_number` (string): Change Notice number
- `current_stage` (string): Current ECO stage
- `action` (string): "initiate", "submit_review", "approve", "implement", "verify", "close"
- `comments` (string, optional): Stage-specific notes

**Output:** Updated ECO status, next required actions, responsible parties, timeline

## Example Usage

### Encapsulant Change — EVA to POE

```
Prompt: "Generate a Change Notice for switching encapsulant from EVA (Brand X,
450μm) to POE (Brand Y, 450μm) for Module Series A. The change is for
reliability improvement — better moisture resistance and lower PID susceptibility.
Current revision is Rev C. Assess IEC 61215 requalification requirements and
generate the Release Note for Rev D."
```

**Expected output:**

#### Change Notice CN-2024-0087

| Field | Details |
|-------|---------|
| **CN Number** | CN-2024-0087 |
| **Date Issued** | 2024-02-15 |
| **Change Type** | Material |
| **Priority** | High |
| **Product Line** | Module Series A (MSA-400, MSA-410, MSA-420) |
| **Component Affected** | Encapsulant — BoM Line Item 4.2 |
| **Previous Specification** | EVA, Brand X Model EF-450, 450μm, 89% transmittance |
| **New Specification** | POE, Brand Y Model PO-450, 450μm, 91% transmittance |
| **Revision Change** | Rev C → Rev D |
| **Change Reason** | Reliability improvement |

**Change Justification:**
1. POE demonstrates superior moisture barrier properties (WVTR: 2.5 g/m²/day vs. EVA 15 g/m²/day)
2. Eliminates acetic acid generation pathway (EVA hydrolysis byproduct corrodes metallization)
3. Higher volume resistivity (POE: 2×10¹⁴ Ω·cm vs. EVA: 1×10¹³ Ω·cm) reduces PID susceptibility
4. Improved UV stability — no yellowing after 200 kWh/m² UV exposure (vs. EVA ΔYI > 2)
5. Field data from comparable modules shows 0.1%/year lower degradation rate with POE

**BoM Impact:**

| Line Item | Description | Old Part | New Part | Cost Delta |
|-----------|-------------|----------|----------|------------|
| 4.2 | Front encapsulant | EF-450 (EVA) | PO-450 (POE) | +$0.08/m² |
| 4.3 | Rear encapsulant | EF-450 (EVA) | PO-450 (POE) | +$0.08/m² |
| — | Total per module (2.78 m²) | — | — | **+$0.44/module** |
| — | Cost per watt impact | — | — | +$0.0011/Wp |

**Process Impact:**
- Lamination temperature: 145°C → 140°C (POE lower melting point)
- Lamination time: 18 min → 20 min (POE requires longer crosslinking)
- Cure verification: Update gel content test from EVA spec (≥75%) to POE spec (≥80%)
- No change to trimming, framing, or junction box attachment processes

**Risk Assessment:**

| Risk Category | Level | Notes |
|--------------|-------|-------|
| Performance | Low | POE has equal or better optical transmittance |
| Reliability | Low (improvement) | Better moisture barrier, no acetic acid, lower PID |
| Safety | Low | Volume resistivity higher, insulation performance improved |
| Cost | Low | +$0.44/module, offset by expected lower warranty claims |
| Supply chain | Medium | Single supplier initially; qualify second source within 6 months |

#### IEC 61215 Requalification Assessment

Per IEC TS 62941:2016 and IEC 61215:2021, encapsulant material change requires **partial requalification**:

| MQT Test | Required? | Rationale |
|----------|-----------|-----------|
| MQT 01 — Visual inspection | Yes | Verify lamination quality with new material |
| MQT 02 — STC power measurement | Yes | Baseline with new encapsulant |
| MQT 03 — Insulation test | Yes | Different dielectric properties |
| MQT 09 — UV preconditioning | **Yes** | Different UV aging behavior |
| MQT 10 — Thermal cycling (TC200) | **Yes** | Different CTE, adhesion under thermal stress |
| MQT 11 — Humidity-freeze (HF10) | **Yes** | Different moisture transport properties |
| MQT 12 — Damp heat (DH1000) | **Yes** | Primary driver — moisture resistance is changed |
| MQT 13 — Mechanical load | Not required | No structural change, same thickness |
| MQT 14 — Hail test | Not required | Encapsulant not primary impact resistance |
| MQT 15 — Bypass diode thermal | Not required | No electrical change |
| MQT 16 — Static mechanical load | Not required | No structural change |
| MQT 19 — Wet leakage current | **Yes** | Different insulation properties |
| MQT 21 — PID test | **Recommended** | Key improvement to verify |

**Estimated requalification:**
- Sample requirement: 8 modules (2 per group A, B, C + 2 control)
- Timeline: 16–20 weeks (TC200 is critical path: 200 cycles × 6h = 1200h)
- Estimated cost: $35,000–$45,000 (test lab fees + module samples)

#### ECO Workflow Status

```
ECO-2024-0087 Status:

[✓] Initiate    — 2024-02-15 — Engineering (J. Patel)
[✓] Review      — 2024-02-22 — Engineering Lead (S. Reddy)
[→] Approve     — Pending     — Quality Manager (R. Kumar)
[ ] Implement   — Target: 2024-03-15 (post requalification)
[ ] Verify      — Target: 2024-04-01 (first production batch inspection)
[ ] Close       — Target: 2024-04-15
```

**Approval signatures required:**
1. Engineering Lead — Technical review ☑ Complete
2. Quality Manager — Quality impact ☐ Pending
3. Supply Chain Manager — Procurement ☐ Pending
4. Plant Manager — Production impact ☐ Pending

#### Release Note RN-2024-v3.2

| Field | Details |
|-------|---------|
| **Product** | Module Series A (MSA-400, MSA-410, MSA-420) |
| **Revision** | Rev C → **Rev D** |
| **Effective Date** | 2024-03-15 |
| **CN Reference** | CN-2024-0087 |

**Changes in this release:**
1. Encapsulant material changed from EVA (Brand X EF-450) to POE (Brand Y PO-450)
2. Lamination temperature adjusted from 145°C to 140°C
3. Lamination time adjusted from 18 min to 20 min
4. Gel content specification updated from ≥75% to ≥80%

**Revision History:**

| Revision | Date | CN Reference | Summary |
|----------|------|-------------|---------|
| Rev A | 2022-01-15 | — | Initial release |
| Rev B | 2022-09-01 | CN-2022-0041 | Cell upgrade from BSF to PERC |
| Rev C | 2023-04-10 | CN-2023-0063 | Junction box supplier change |
| Rev D | 2024-03-15 | CN-2024-0087 | Encapsulant change EVA → POE |

**Compatibility:**
- Electrical: Fully compatible with Rev C (same electrical specifications)
- Mechanical: Fully compatible with Rev C (same dimensions, mounting)
- Mixed installation: Rev C and Rev D can be used in same string

**Inventory disposition:**
- Rev C modules in finished goods: Ship as normal (no quality concern)
- Rev C encapsulant (EVA) remaining stock: Use for other product lines or return to supplier
- Transition: Hard cutover at effective date (no mixing within production lot)

### Cell Supplier Change

```
Prompt: "Generate a CN for changing cell supplier from Supplier A to Supplier B
for the same PERC cell specification (182mm M10, 23.5% efficiency). Assess
whether IEC 61215 retesting is needed."
```

### Process Parameter Change

```
Prompt: "Document a soldering temperature change from 360°C to 340°C peak
for the stringer process on Line 3. Generate CN and assess qualification impact."
```

## Output Format

The skill produces:
- **Change Notice document** — Formal CN with all required fields, risk assessment, and approval blocks
- **Release Note document** — Version tracking with cumulative change history
- **Requalification matrix** — MQT test applicability table with rationale
- **BoM comparison** — Side-by-side old vs. new with cost impact
- **ECO tracker** — Workflow status with stage gates and responsible parties
- **Inventory disposition plan** — Handling of existing stock during transition

## Standards & References

- ISO 9001:2015 — Quality management systems — §8.5.6 Control of changes
- IEC TS 62941:2016 — Terrestrial photovoltaic (PV) modules — Guidelines for increased confidence in PV module design qualification and type approval
- IEC 61215:2021 — Terrestrial PV modules — Design qualification and type approval
- IEC 61730:2016 — PV module safety qualification and type approval
- IATF 16949:2016 — Quality management system for automotive (reference for PPAP/change control methodology)
- AIAG PPAP 4th Edition — Production Part Approval Process (industry reference for change control rigor)
- ISO 10007:2017 — Quality management — Guidelines for configuration management
- IPC-9592B — Requirements for power conversion assemblies (reference for electronics change control)

## Related Skills

- `fmea-analysis` — Risk assessment for proposed changes
- `iec-61215-protocol` — Generate requalification test protocols
- `degradation-modeling` — Evaluate reliability impact of material changes
- `root-cause-analysis` — Investigate issues that trigger design changes
- `bill-of-materials` — Detailed BoM management and costing
