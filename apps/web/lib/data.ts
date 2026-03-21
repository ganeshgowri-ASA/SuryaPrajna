// SuryaPrajna — lib/data.ts
// Central data registry for skills, agents, and skill packs.

export type SkillStatus = "available" | "in-progress" | "planned";
export type PackStatus = "available" | "in-progress" | "planned";

export interface Skill {
  id: string;
  name: string;
  description: string;
  pack: string;
  packLabel: string;
  status: SkillStatus;
  tags: string[];
  agent: string;
}

export interface Agent {
  id: string;
  name: string;
  icon: string;
  sanskrit: string;
  meaning: string;
  domainLabel: string;
  description: string;
  capabilities: string[];
  skills: string[];
  color: string;
}

export interface SkillPack {
  id: string;
  icon: string;
  label: string;
  skillCount: number;
  status: PackStatus;
  agents: string[];
}

// ---------------------------------------------------------------------------
// Skill Packs
// ---------------------------------------------------------------------------

export const skillPacks: SkillPack[] = [
  {
    id: "pv-materials",
    icon: "⚗️",
    label: "Materials Science",
    skillCount: 6,
    status: "available",
    agents: ["Dravya-Agent"],
  },
  {
    id: "pv-cell-module",
    icon: "🔋",
    label: "Cell & Module",
    skillCount: 8,
    status: "available",
    agents: ["Kosha-Agent", "Shakti-Agent"],
  },
  {
    id: "pv-testing",
    icon: "🧪",
    label: "Testing & Compliance",
    skillCount: 7,
    status: "available",
    agents: ["Pariksha-Agent"],
  },
  {
    id: "pv-reliability",
    icon: "🛡️",
    label: "Reliability & Quality",
    skillCount: 6,
    status: "available",
    agents: ["Nityata-Agent"],
  },
  {
    id: "pv-analytics",
    icon: "📊",
    label: "Statistical Analysis",
    skillCount: 5,
    status: "planned",
    agents: ["Cross-cutting"],
  },
  {
    id: "pv-finance",
    icon: "💰",
    label: "Finance & Economics",
    skillCount: 6,
    status: "planned",
    agents: ["Nivesha-Agent"],
  },
  {
    id: "pv-energy",
    icon: "☀️",
    label: "Energy & Weather",
    skillCount: 10,
    status: "in-progress",
    agents: ["Megha-Agent", "Phala-Agent"],
  },
  {
    id: "pv-plant-design",
    icon: "🏗️",
    label: "Plant Design",
    skillCount: 7,
    status: "planned",
    agents: ["Vinyasa-Agent"],
  },
  {
    id: "pv-power-systems",
    icon: "⚡",
    label: "Power Systems",
    skillCount: 7,
    status: "planned",
    agents: ["Vidyut-Agent"],
  },
  {
    id: "pv-sustainability",
    icon: "🌿",
    label: "Sustainability & ESG",
    skillCount: 5,
    status: "planned",
    agents: ["Cross-cutting"],
  },
];

// Map pack id → human-readable domain label (used by SkillBrowser)
export const PACK_DOMAIN_MAP: Record<string, string> = Object.fromEntries(
  skillPacks.map((p) => [p.id, p.label])
);

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

export const skills: Skill[] = [
  // pv-materials (all available)
  { id: "silicon-characterization", name: "silicon-characterization", description: "Wafer quality, resistivity, lifetime measurements", pack: "pv-materials", packLabel: "Materials Science", status: "available", tags: ["silicon", "wafer", "resistivity", "lifetime"], agent: "Dravya-Agent" },
  { id: "perovskite-modeler", name: "perovskite-modeler", description: "Composition modeling, bandgap tuning, stability prediction", pack: "pv-materials", packLabel: "Materials Science", status: "available", tags: ["perovskite", "bandgap", "stability", "composition"], agent: "Dravya-Agent" },
  { id: "xrd-analysis", name: "xrd-analysis", description: "X-ray diffraction pattern analysis and phase identification", pack: "pv-materials", packLabel: "Materials Science", status: "available", tags: ["xrd", "diffraction", "phase", "crystallography"], agent: "Dravya-Agent" },
  { id: "sem-interpretation", name: "sem-interpretation", description: "SEM/TEM image analysis for microstructure characterization", pack: "pv-materials", packLabel: "Materials Science", status: "available", tags: ["sem", "tem", "microstructure", "imaging"], agent: "Dravya-Agent" },
  { id: "el-imaging", name: "el-imaging", description: "Electroluminescence image defect detection and classification", pack: "pv-materials", packLabel: "Materials Science", status: "available", tags: ["el", "electroluminescence", "defect", "imaging"], agent: "Dravya-Agent" },
  { id: "defect-classifier", name: "defect-classifier", description: "Material defect classification — LeTID, PID, UV degradation", pack: "pv-materials", packLabel: "Materials Science", status: "available", tags: ["defect", "letid", "pid", "uv", "classification"], agent: "Dravya-Agent" },

  // pv-cell-module (all available)
  { id: "bom-generator", name: "bom-generator", description: "Bill of Materials creation and validation for PV modules", pack: "pv-cell-module", packLabel: "Cell & Module", status: "available", tags: ["bom", "materials", "module", "components"], agent: "Kosha-Agent" },
  { id: "ctm-calculator", name: "ctm-calculator", description: "Cell-to-Module power loss/gain analysis", pack: "pv-cell-module", packLabel: "Cell & Module", status: "available", tags: ["ctm", "cell", "module", "power-loss"], agent: "Kosha-Agent" },
  { id: "iv-curve-modeler", name: "iv-curve-modeler", description: "I-V curve simulation and parameter extraction", pack: "pv-cell-module", packLabel: "Cell & Module", status: "available", tags: ["iv-curve", "simulation", "parameters", "cell"], agent: "Shakti-Agent" },
  { id: "cell-efficiency", name: "cell-efficiency", description: "Cell efficiency analysis at STC and NOCT conditions", pack: "pv-cell-module", packLabel: "Cell & Module", status: "available", tags: ["efficiency", "stc", "noct", "cell"], agent: "Shakti-Agent" },
  { id: "diode-model", name: "diode-model", description: "Single/double diode model parameter fitting", pack: "pv-cell-module", packLabel: "Cell & Module", status: "available", tags: ["diode", "model", "parameters", "equivalent-circuit"], agent: "Shakti-Agent" },
  { id: "temperature-coefficients", name: "temperature-coefficients", description: "Temperature coefficient analysis and modeling", pack: "pv-cell-module", packLabel: "Cell & Module", status: "available", tags: ["temperature", "coefficient", "thermal", "modeling"], agent: "Shakti-Agent" },
  { id: "module-construction", name: "module-construction", description: "Module layup design and material selection", pack: "pv-cell-module", packLabel: "Cell & Module", status: "available", tags: ["module", "layup", "encapsulant", "backsheet", "glass"], agent: "Kosha-Agent" },
  { id: "lamination-params", name: "lamination-params", description: "Lamination process parameter optimization", pack: "pv-cell-module", packLabel: "Cell & Module", status: "available", tags: ["lamination", "process", "encapsulant", "manufacturing"], agent: "Kosha-Agent" },

  // pv-testing (all available)
  { id: "iec-61215-protocol", name: "iec-61215-protocol", description: "IEC 61215 design qualification test protocols — Groups A–D, MQT 01–21", pack: "pv-testing", packLabel: "Testing & Compliance", status: "available", tags: ["iec-61215", "qualification", "protocol", "testing"], agent: "Pariksha-Agent" },
  { id: "iec-61730-safety", name: "iec-61730-safety", description: "IEC 61730 safety qualification — insulation, ground continuity, dielectric withstand", pack: "pv-testing", packLabel: "Testing & Compliance", status: "available", tags: ["iec-61730", "safety", "insulation", "compliance"], agent: "Pariksha-Agent" },
  { id: "thermal-cycling", name: "thermal-cycling", description: "TC200/TC600 thermal stress test protocol and solder joint fatigue analysis", pack: "pv-testing", packLabel: "Testing & Compliance", status: "available", tags: ["thermal-cycling", "tc200", "solder", "fatigue"], agent: "Pariksha-Agent" },
  { id: "damp-heat-testing", name: "damp-heat-testing", description: "DH1000/DH2000/DH3000 moisture ingress and delamination protocols", pack: "pv-testing", packLabel: "Testing & Compliance", status: "available", tags: ["damp-heat", "moisture", "delamination", "humidity"], agent: "Pariksha-Agent" },
  { id: "uv-preconditioning", name: "uv-preconditioning", description: "UV exposure testing per IEC 61215 — yellowing index, transmittance loss", pack: "pv-testing", packLabel: "Testing & Compliance", status: "available", tags: ["uv", "preconditioning", "yellowing", "transmittance"], agent: "Pariksha-Agent" },
  { id: "mechanical-load", name: "mechanical-load", description: "Static/dynamic load testing — wind/snow simulation, cell cracking detection", pack: "pv-testing", packLabel: "Testing & Compliance", status: "available", tags: ["mechanical", "load", "wind", "snow", "cracking"], agent: "Pariksha-Agent" },
  { id: "pv-module-flash-testing", name: "pv-module-flash-testing", description: "IV flash test procedures, STC correction, measurement uncertainty", pack: "pv-testing", packLabel: "Testing & Compliance", status: "available", tags: ["flash-test", "iv", "stc", "uncertainty"], agent: "Pariksha-Agent" },

  // pv-reliability (5 available, 1 planned)
  { id: "fmea-analysis", name: "fmea-analysis", description: "Failure Mode and Effects Analysis for PV modules — RPN calculation and mitigation", pack: "pv-reliability", packLabel: "Reliability & Quality", status: "available", tags: ["fmea", "failure-mode", "rpn", "risk"], agent: "Nityata-Agent" },
  { id: "weibull-reliability", name: "weibull-reliability", description: "Weibull distribution fitting — MTBF, failure rate prediction, bathtub curve", pack: "pv-reliability", packLabel: "Reliability & Quality", status: "available", tags: ["weibull", "mtbf", "failure-rate", "reliability"], agent: "Nityata-Agent" },
  { id: "degradation-modeling", name: "degradation-modeling", description: "LID, LeTID, PID mechanisms — annual degradation rates and lifetime prediction", pack: "pv-reliability", packLabel: "Reliability & Quality", status: "available", tags: ["degradation", "lid", "letid", "pid", "lifetime"], agent: "Nityata-Agent" },
  { id: "root-cause-analysis", name: "root-cause-analysis", description: "5-Why, fishbone diagram, fault tree analysis for PV field failures", pack: "pv-reliability", packLabel: "Reliability & Quality", status: "available", tags: ["rca", "5-why", "fishbone", "fault-tree"], agent: "Nityata-Agent" },
  { id: "cn-rn-documentation", name: "cn-rn-documentation", description: "Change Notice / Release Note generation — revision tracking and ECO workflow", pack: "pv-reliability", packLabel: "Reliability & Quality", status: "available", tags: ["change-notice", "release-note", "ecn", "documentation"], agent: "Nityata-Agent" },
  { id: "warranty-analysis", name: "warranty-analysis", description: "Warranty reserve and claim rate calculation", pack: "pv-reliability", packLabel: "Reliability & Quality", status: "planned", tags: ["warranty", "reserve", "claim-rate", "finance"], agent: "Nityata-Agent" },

  // pv-analytics (all planned)
  { id: "anova-analysis", name: "anova-analysis", description: "Analysis of Variance for PV experiments and process control", pack: "pv-analytics", packLabel: "Statistical Analysis", status: "planned", tags: ["anova", "statistics", "variance", "experiment"], agent: "Cross-cutting" },
  { id: "regression-modeler", name: "regression-modeler", description: "Linear/nonlinear regression for PV data analysis", pack: "pv-analytics", packLabel: "Statistical Analysis", status: "planned", tags: ["regression", "statistics", "modeling", "data"], agent: "Cross-cutting" },
  { id: "spc-charts", name: "spc-charts", description: "Statistical Process Control charts for manufacturing quality", pack: "pv-analytics", packLabel: "Statistical Analysis", status: "planned", tags: ["spc", "control-chart", "quality", "manufacturing"], agent: "Cross-cutting" },
  { id: "monte-carlo", name: "monte-carlo", description: "Monte Carlo simulation for uncertainty quantification", pack: "pv-analytics", packLabel: "Statistical Analysis", status: "planned", tags: ["monte-carlo", "uncertainty", "simulation", "statistics"], agent: "Cross-cutting" },
  { id: "gum-uncertainty", name: "gum-uncertainty", description: "GUM framework uncertainty analysis for PV measurements", pack: "pv-analytics", packLabel: "Statistical Analysis", status: "planned", tags: ["gum", "uncertainty", "measurement", "metrology"], agent: "Cross-cutting" },

  // pv-finance (all planned)
  { id: "lcoe-calculator", name: "lcoe-calculator", description: "Levelized Cost of Energy calculation for PV projects", pack: "pv-finance", packLabel: "Finance & Economics", status: "planned", tags: ["lcoe", "finance", "cost", "energy"], agent: "Nivesha-Agent" },
  { id: "financial-modeler", name: "financial-modeler", description: "IRR, NPV, and payback period analysis for solar investments", pack: "pv-finance", packLabel: "Finance & Economics", status: "planned", tags: ["irr", "npv", "payback", "finance"], agent: "Nivesha-Agent" },
  { id: "carbon-credits", name: "carbon-credits", description: "Carbon credit and REC calculations for solar projects", pack: "pv-finance", packLabel: "Finance & Economics", status: "planned", tags: ["carbon", "rec", "credits", "esg"], agent: "Nivesha-Agent" },
  { id: "policy-compliance", name: "policy-compliance", description: "ALMM, DCR, and MNRE guideline compliance analysis", pack: "pv-finance", packLabel: "Finance & Economics", status: "planned", tags: ["almm", "dcr", "mnre", "policy", "india"], agent: "Nivesha-Agent" },
  { id: "bankability-assessment", name: "bankability-assessment", description: "Project bankability evaluation for lender requirements", pack: "pv-finance", packLabel: "Finance & Economics", status: "planned", tags: ["bankability", "lender", "project-finance", "due-diligence"], agent: "Nivesha-Agent" },
  { id: "ppa-modeler", name: "ppa-modeler", description: "Power Purchase Agreement financial modeling and scenario analysis", pack: "pv-finance", packLabel: "Finance & Economics", status: "planned", tags: ["ppa", "power-purchase", "tariff", "contract"], agent: "Nivesha-Agent" },

  // pv-energy (1 available, rest planned)
  { id: "pvlib-analysis", name: "pvlib-analysis", description: "pvlib-based solar energy modeling — yield simulation and system analysis", pack: "pv-energy", packLabel: "Energy & Weather", status: "available", tags: ["pvlib", "energy-yield", "irradiance", "simulation"], agent: "Phala-Agent" },
  { id: "energy-yield", name: "energy-yield", description: "Annual energy yield simulation with loss model and PR estimation", pack: "pv-energy", packLabel: "Energy & Weather", status: "planned", tags: ["energy-yield", "annual", "pr", "loss-model"], agent: "Phala-Agent" },
  { id: "p50-p90-analysis", name: "p50-p90-analysis", description: "Exceedance probability (P50/P90) analysis for project bankability", pack: "pv-energy", packLabel: "Energy & Weather", status: "planned", tags: ["p50", "p90", "exceedance", "probability", "bankability"], agent: "Phala-Agent" },
  { id: "loss-tree", name: "loss-tree", description: "Energy loss tree construction and waterfall diagram analysis", pack: "pv-energy", packLabel: "Energy & Weather", status: "planned", tags: ["loss-tree", "waterfall", "shading", "soiling", "mismatch"], agent: "Phala-Agent" },
  { id: "pr-monitoring", name: "pr-monitoring", description: "Performance Ratio calculation and operational monitoring", pack: "pv-energy", packLabel: "Energy & Weather", status: "planned", tags: ["pr", "performance-ratio", "monitoring", "kpi"], agent: "Phala-Agent" },
  { id: "weather-data-ingestion", name: "weather-data-ingestion", description: "TMY, MERRA-2, ERA5, and NSRDB weather data ingestion and processing", pack: "pv-energy", packLabel: "Energy & Weather", status: "planned", tags: ["tmy", "merra2", "era5", "nsrdb", "weather"], agent: "Megha-Agent" },
  { id: "irradiance-modeler", name: "irradiance-modeler", description: "GHI/DNI/DHI decomposition and plane-of-array transposition", pack: "pv-energy", packLabel: "Energy & Weather", status: "planned", tags: ["ghi", "dni", "dhi", "irradiance", "transposition"], agent: "Megha-Agent" },
  { id: "solar-resource-assessment", name: "solar-resource-assessment", description: "Site solar resource evaluation and long-term variability analysis", pack: "pv-energy", packLabel: "Energy & Weather", status: "planned", tags: ["solar-resource", "site-assessment", "variability", "climate"], agent: "Megha-Agent" },
  { id: "energy-forecasting", name: "energy-forecasting", description: "Statistical and ML-based energy generation forecasting", pack: "pv-energy", packLabel: "Energy & Weather", status: "planned", tags: ["forecasting", "ml", "statistical", "prediction"], agent: "Phala-Agent" },
  { id: "iv-diagnostics", name: "iv-diagnostics", description: "Field IV curve tracing and fault diagnosis for operating plants", pack: "pv-energy", packLabel: "Energy & Weather", status: "planned", tags: ["iv-curve", "diagnostics", "field", "fault"], agent: "Phala-Agent" },

  // pv-plant-design (all planned)
  { id: "array-layout", name: "array-layout", description: "Ground-mount array layout optimization for maximum yield", pack: "pv-plant-design", packLabel: "Plant Design", status: "planned", tags: ["layout", "ground-mount", "optimization", "gcr"], agent: "Vinyasa-Agent" },
  { id: "rooftop-design", name: "rooftop-design", description: "Rooftop system design and layout for commercial/industrial roofs", pack: "pv-plant-design", packLabel: "Plant Design", status: "planned", tags: ["rooftop", "commercial", "industrial", "design"], agent: "Vinyasa-Agent" },
  { id: "floating-solar", name: "floating-solar", description: "Floating PV (FPV) system design for reservoirs and water bodies", pack: "pv-plant-design", packLabel: "Plant Design", status: "planned", tags: ["floating", "fpv", "reservoir", "aquatic"], agent: "Vinyasa-Agent" },
  { id: "shading-analysis", name: "shading-analysis", description: "Horizon, inter-row, and near-field shading analysis", pack: "pv-plant-design", packLabel: "Plant Design", status: "planned", tags: ["shading", "inter-row", "horizon", "near-field"], agent: "Vinyasa-Agent" },
  { id: "string-sizing", name: "string-sizing", description: "String sizing and inverter matching for optimal MPPT operation", pack: "pv-plant-design", packLabel: "Plant Design", status: "planned", tags: ["string-sizing", "inverter", "mppt", "electrical"], agent: "Vinyasa-Agent" },
  { id: "sld-generator", name: "sld-generator", description: "Single Line Diagram generation for PV plant electrical design", pack: "pv-plant-design", packLabel: "Plant Design", status: "planned", tags: ["sld", "single-line", "diagram", "electrical"], agent: "Vinyasa-Agent" },
  { id: "cable-sizing", name: "cable-sizing", description: "Cable sizing, voltage drop, and routing for DC/AC circuits", pack: "pv-plant-design", packLabel: "Plant Design", status: "planned", tags: ["cable", "voltage-drop", "dc", "ac", "sizing"], agent: "Vinyasa-Agent" },

  // pv-power-systems (all planned)
  { id: "load-flow-analysis", name: "load-flow-analysis", description: "Power flow and load flow studies for grid-connected systems", pack: "pv-power-systems", packLabel: "Power Systems", status: "planned", tags: ["load-flow", "power-flow", "grid", "analysis"], agent: "Vidyut-Agent" },
  { id: "hybrid-modeling", name: "hybrid-modeling", description: "Solar + wind + battery + diesel hybrid system modeling", pack: "pv-power-systems", packLabel: "Power Systems", status: "planned", tags: ["hybrid", "wind", "battery", "diesel", "microgrid"], agent: "Vidyut-Agent" },
  { id: "mppt-analysis", name: "mppt-analysis", description: "MPPT algorithm comparison and performance analysis", pack: "pv-power-systems", packLabel: "Power Systems", status: "planned", tags: ["mppt", "algorithm", "perturb-observe", "incremental-conductance"], agent: "Vidyut-Agent" },
  { id: "inverter-modeling", name: "inverter-modeling", description: "Inverter efficiency curve modeling and sizing optimization", pack: "pv-power-systems", packLabel: "Power Systems", status: "planned", tags: ["inverter", "efficiency", "sizing", "string", "central"], agent: "Vidyut-Agent" },
  { id: "bess-sizing", name: "bess-sizing", description: "Battery Energy Storage System sizing and optimization", pack: "pv-power-systems", packLabel: "Power Systems", status: "planned", tags: ["bess", "battery", "storage", "sizing"], agent: "Vidyut-Agent" },
  { id: "grid-integration", name: "grid-integration", description: "Grid code compliance and interconnection study", pack: "pv-power-systems", packLabel: "Power Systems", status: "planned", tags: ["grid", "interconnection", "grid-code", "compliance"], agent: "Vidyut-Agent" },
  { id: "power-quality", name: "power-quality", description: "Harmonics, THD, and power factor analysis for grid compliance", pack: "pv-power-systems", packLabel: "Power Systems", status: "planned", tags: ["power-quality", "harmonics", "thd", "power-factor"], agent: "Vidyut-Agent" },

  // pv-sustainability (all planned)
  { id: "carbon-calculator", name: "carbon-calculator", description: "Carbon footprint and offset calculations for PV projects", pack: "pv-sustainability", packLabel: "Sustainability & ESG", status: "planned", tags: ["carbon", "footprint", "offset", "emissions"], agent: "Grantha-Agent" },
  { id: "lca-assessment", name: "lca-assessment", description: "Life Cycle Assessment for PV modules and systems", pack: "pv-sustainability", packLabel: "Sustainability & ESG", status: "planned", tags: ["lca", "lifecycle", "embodied-energy", "epbt"], agent: "Grantha-Agent" },
  { id: "esg-reporting", name: "esg-reporting", description: "ESG metrics and reporting for solar project stakeholders", pack: "pv-sustainability", packLabel: "Sustainability & ESG", status: "planned", tags: ["esg", "reporting", "sustainability", "metrics"], agent: "Grantha-Agent" },
  { id: "recycling-planner", name: "recycling-planner", description: "End-of-life recycling and circular economy planning for PV", pack: "pv-sustainability", packLabel: "Sustainability & ESG", status: "planned", tags: ["recycling", "end-of-life", "circular-economy", "waste"], agent: "Grantha-Agent" },
  { id: "policy-framework", name: "policy-framework", description: "National and international solar policy analysis and compliance", pack: "pv-sustainability", packLabel: "Sustainability & ESG", status: "planned", tags: ["policy", "regulation", "mnre", "iec", "bis"], agent: "Grantha-Agent" },
];

// ---------------------------------------------------------------------------
// Agents
// ---------------------------------------------------------------------------

export const agents: Agent[] = [
  {
    id: "surya-orchestrator",
    name: "Surya-Orchestrator",
    icon: "☀️",
    sanskrit: "सूर्य",
    meaning: "Sun",
    domainLabel: "Master Router & Orchestrator",
    description: "Routes incoming requests to the appropriate domain agent and coordinates multi-agent workflows via the Srishti workflow engine. Handles ambiguous queries by decomposing them into domain-specific sub-tasks.",
    capabilities: [
      "Route PV queries to appropriate domain specialist",
      "Coordinate multi-agent workflows via Srishti engine",
      "Manage context passing between agents",
      "Decompose complex cross-domain tasks",
    ],
    skills: [],
    color: "amber",
  },
  {
    id: "dravya-agent",
    name: "Dravya-Agent",
    icon: "⚗️",
    sanskrit: "द्रव्य",
    meaning: "Substance / Material",
    domainLabel: "Materials Science",
    description: "Domain expert for PV material characterization, defect analysis, and degradation physics. Handles silicon, perovskite, thin-film, and advanced PV material analysis.",
    capabilities: [
      "Silicon characterization and wafer quality analysis",
      "Perovskite composition modeling and stability prediction",
      "Thin-film (CdTe, CIGS, a-Si) material property analysis",
      "XRD, SEM, EL, and IR image interpretation",
      "Defect classification — LeTID, PID, UV degradation",
      "Material degradation physics modeling",
    ],
    skills: ["xrd-analysis", "sem-interpretation", "el-imaging", "defect-classifier", "perovskite-modeler", "silicon-characterization"],
    color: "purple",
  },
  {
    id: "kosha-agent",
    name: "Kosha-Agent",
    icon: "📦",
    sanskrit: "कोश",
    meaning: "Sheath / Enclosure",
    domainLabel: "Bill of Materials & Components",
    description: "Manages module bill of materials, cell-to-module calculations, lamination process parameters, and component selection for PV module manufacturing.",
    capabilities: [
      "BoM generation and validation",
      "CTM (Cell-to-Module) loss/gain calculations",
      "Component specification comparison",
      "Lamination process parameter optimization",
      "Module construction design review",
      "Encapsulant, backsheet, glass, and frame selection",
    ],
    skills: ["bom-generator", "ctm-calculator", "module-construction", "lamination-params"],
    color: "blue",
  },
  {
    id: "shakti-agent",
    name: "Shakti-Agent",
    icon: "⚡",
    sanskrit: "शक्ति",
    meaning: "Power / Energy / Strength",
    domainLabel: "Cell & Module Performance",
    description: "Analyzes PV cell and module electrical performance — I-V curves, efficiency, temperature coefficients, and diode model parameter extraction.",
    capabilities: [
      "I-V curve modeling and analysis",
      "Cell efficiency calculations at STC and NOCT",
      "Temperature coefficient analysis",
      "Series/shunt resistance extraction",
      "Diode model parameter fitting (single/double)",
      "Module power rating verification",
    ],
    skills: ["iv-curve-modeler", "cell-efficiency", "diode-model", "temperature-coefficients"],
    color: "yellow",
  },
  {
    id: "pariksha-agent",
    name: "Pariksha-Agent",
    icon: "🧪",
    sanskrit: "परीक्षा",
    meaning: "Examination / Test",
    domainLabel: "Testing & Compliance",
    description: "Generates IEC 61215/61730 test protocols, analyzes flash test data, and supports field testing. Expert in PV module qualification and compliance testing.",
    capabilities: [
      "IEC 61215 / IEC 61730 test protocol generation",
      "Flash testing data analysis and STC correction",
      "EL (Electroluminescence) test interpretation",
      "Thermal cycling and damp heat test evaluation",
      "Field testing — PR ratio, soiling loss, degradation rate",
      "NABL/BIS compliance checklists",
    ],
    skills: ["iec-61215-protocol", "iec-61730-safety", "thermal-cycling", "damp-heat-testing", "uv-preconditioning", "mechanical-load", "pv-module-flash-testing"],
    color: "green",
  },
  {
    id: "nityata-agent",
    name: "Nityata-Agent",
    icon: "🛡️",
    sanskrit: "नित्यता",
    meaning: "Permanence / Reliability",
    domainLabel: "Reliability & Quality",
    description: "Applies reliability engineering methods — FMEA, Weibull analysis, root cause analysis — for PV module and plant quality management.",
    capabilities: [
      "FMEA (Failure Mode and Effects Analysis)",
      "Weibull distribution analysis for lifetime prediction",
      "MTBF and failure rate calculation",
      "Root cause analysis facilitation (5-Why, fishbone)",
      "CN/RN document automation and ECO workflow",
      "Degradation rate and warranty reserve modeling",
    ],
    skills: ["fmea-analysis", "weibull-reliability", "degradation-modeling", "root-cause-analysis", "cn-rn-documentation", "warranty-analysis"],
    color: "indigo",
  },
  {
    id: "megha-agent",
    name: "Megha-Agent",
    icon: "☁️",
    sanskrit: "मेघ",
    meaning: "Cloud",
    domainLabel: "Weather & Irradiance",
    description: "Ingests and processes weather and irradiance data from global datasets (TMY, MERRA-2, ERA5, NSRDB) for solar resource assessment and energy modeling.",
    capabilities: [
      "Weather data ingestion — TMY, MERRA-2, ERA5, NSRDB",
      "GHI/DNI/DHI decomposition and transposition",
      "Irradiance modeling — Perez, Hay-Davies, isotropic",
      "Solar resource assessment for new sites",
      "Climate zone classification",
      "Long-term variability and uncertainty analysis",
    ],
    skills: ["weather-data-ingestion", "irradiance-modeler", "solar-resource-assessment"],
    color: "sky",
  },
  {
    id: "phala-agent",
    name: "Phala-Agent",
    icon: "🌱",
    sanskrit: "फल",
    meaning: "Fruit / Result / Yield",
    domainLabel: "Energy Yield & Diagnostics",
    description: "Simulates PV energy yield using pvlib and industry tools, performs P50/P90 analysis, builds loss trees, and monitors operational performance ratios.",
    capabilities: [
      "Energy yield simulation with pvlib and SAM",
      "P50/P90 exceedance probability analysis",
      "Loss tree construction and waterfall analysis",
      "PR (Performance Ratio) monitoring",
      "Soiling and degradation impact assessment",
      "Statistical and ML-based energy forecasting",
    ],
    skills: ["pvlib-analysis", "energy-yield", "p50-p90-analysis", "loss-tree", "pr-monitoring", "energy-forecasting"],
    color: "emerald",
  },
  {
    id: "nivesha-agent",
    name: "Nivesha-Agent",
    icon: "💰",
    sanskrit: "निवेश",
    meaning: "Investment",
    domainLabel: "Finance & Economics",
    description: "Financial modeling for solar projects — LCOE, IRR, NPV, policy compliance, bankability, and PPA structuring for Indian and global markets.",
    capabilities: [
      "LCOE (Levelized Cost of Energy) calculation",
      "IRR, NPV, and payback period analysis",
      "Carbon credit and REC calculations",
      "Policy compliance — ALMM, DCR, MNRE guidelines",
      "Bankability assessment for lenders",
      "PPA and lease financing structure analysis",
    ],
    skills: ["lcoe-calculator", "financial-modeler", "carbon-credits", "policy-compliance", "bankability-assessment"],
    color: "orange",
  },
  {
    id: "vinyasa-agent",
    name: "Vinyasa-Agent",
    icon: "🏗️",
    sanskrit: "विन्यास",
    meaning: "Arrangement / Layout",
    domainLabel: "Plant Design & Layout",
    description: "Designs PV plant layouts — ground-mount, rooftop, floating solar — with shading analysis, string sizing, SLD generation, and cable routing.",
    capabilities: [
      "Ground-mount array layout optimization",
      "Rooftop and BIPV system design",
      "Floating solar (FPV) design",
      "Shading analysis — horizon, inter-row, near-field",
      "String sizing and inverter matching",
      "SLD generation and cable sizing",
    ],
    skills: ["array-layout", "shading-analysis", "string-sizing", "sld-generator", "rooftop-design", "floating-solar"],
    color: "teal",
  },
  {
    id: "vidyut-agent",
    name: "Vidyut-Agent",
    icon: "🔌",
    sanskrit: "विद्युत्",
    meaning: "Electricity",
    domainLabel: "Power Systems & Grid",
    description: "Power systems specialist for grid integration, inverter modeling, BESS sizing, hybrid generation, and power quality analysis.",
    capabilities: [
      "Load flow analysis and power flow studies",
      "Hybrid generation modeling — solar + wind + battery + diesel",
      "MPPT algorithm analysis and comparison",
      "Inverter modeling — string, central, micro",
      "BESS (Battery Energy Storage) sizing",
      "Grid integration, harmonics, and THD compliance",
    ],
    skills: ["load-flow-analysis", "hybrid-modeling", "mppt-analysis", "bess-sizing", "grid-integration", "inverter-modeling"],
    color: "violet",
  },
  {
    id: "grantha-agent",
    name: "Grantha-Agent",
    icon: "📚",
    sanskrit: "ग्रन्थ",
    meaning: "Book / Document / Treatise",
    domainLabel: "Documentation & Compliance",
    description: "Cross-cutting documentation agent that generates technical reports, datasheets, compliance documents, ESG reports, and regulatory filings for PV projects.",
    capabilities: [
      "Technical report generation",
      "Datasheet creation and validation",
      "IEC / BIS standards compliance documentation",
      "Environmental compliance — EIA and ESG reports",
      "LCA (Life Cycle Assessment) report generation",
      "Regulatory filing preparation",
    ],
    skills: ["report-generator", "datasheet-creator", "compliance-docs", "lca-report", "esg-reporting"],
    color: "rose",
  },
];
