/**
 * Workflow definition and execution — wave-based task decomposition.
 *
 * The Srishti pattern decomposes complex PV tasks into waves of steps.
 * Steps within a wave run concurrently; waves execute sequentially.
 * Dependencies between steps are respected via the dependsOn field.
 */

import {
  WorkflowDefinition,
  WorkflowStep,
  WorkflowTemplate,
  Wave,
  StepStatus,
  AgentContext,
  AgentExecutor,
} from "./types";

/** Generate a simple UUID v4-like identifier. */
function generateId(): string {
  const hex = "0123456789abcdef";
  const segments = [8, 4, 4, 4, 12];
  return segments
    .map((len) =>
      Array.from({ length: len }, () =>
        hex[Math.floor(Math.random() * 16)],
      ).join(""),
    )
    .join("-");
}

// ---------------------------------------------------------------------------
// Predefined workflow templates for common PV tasks
// ---------------------------------------------------------------------------

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "ground-mount-plant-design",
    name: "Ground-Mount Plant Design",
    description:
      "End-to-end design of a ground-mount solar plant: layout, performance modeling, energy yield, financial analysis, and documentation.",
    triggerKeywords: [
      "ground-mount",
      "ground mount",
      "plant design",
      "solar plant",
      "utility-scale",
      "utility scale",
      "mw plant",
    ],
    pipeline: [
      "vinyasa-agent",
      "shakti-agent",
      "phala-agent",
      "nivesha-agent",
      "grantha-agent",
    ],
    stepDescriptions: [
      "Design array layout, string sizing, and SLD",
      "Model cell and module performance parameters",
      "Simulate energy yield and loss tree",
      "Perform financial analysis (LCOE, IRR, NPV)",
      "Generate project documentation and compliance reports",
    ],
  },
  {
    id: "rooftop-system-design",
    name: "Rooftop System Design",
    description:
      "Design a rooftop PV system including shading analysis, performance, and economics.",
    triggerKeywords: [
      "rooftop",
      "roof-top",
      "roof top",
      "rooftop system",
      "rooftop solar",
    ],
    pipeline: [
      "vinyasa-agent",
      "megha-agent",
      "shakti-agent",
      "phala-agent",
      "nivesha-agent",
    ],
    stepDescriptions: [
      "Design rooftop layout with shading analysis",
      "Assess solar resource and irradiance at location",
      "Model module performance characteristics",
      "Simulate energy yield and performance ratio",
      "Calculate LCOE, payback, and financial metrics",
    ],
  },
  {
    id: "module-qualification",
    name: "Module Qualification",
    description:
      "Complete IEC qualification workflow: testing, reliability assessment, and compliance documentation.",
    triggerKeywords: [
      "module qualification",
      "iec qualification",
      "iec 61215",
      "iec 61730",
      "type approval",
      "certification",
    ],
    pipeline: [
      "kosha-agent",
      "shakti-agent",
      "pariksha-agent",
      "nityata-agent",
      "grantha-agent",
    ],
    stepDescriptions: [
      "Review module BoM and construction",
      "Verify electrical performance parameters",
      "Generate test protocols and evaluate test results",
      "Assess reliability with FMEA and degradation modeling",
      "Compile qualification documentation package",
    ],
  },
  {
    id: "performance-assessment",
    name: "Performance Assessment",
    description:
      "Assess field performance: weather data, energy yield, diagnostics, and reporting.",
    triggerKeywords: [
      "performance assessment",
      "performance ratio",
      "yield analysis",
      "field performance",
      "pr monitoring",
      "energy audit",
    ],
    pipeline: [
      "megha-agent",
      "phala-agent",
      "nityata-agent",
      "grantha-agent",
    ],
    stepDescriptions: [
      "Ingest and analyze weather and irradiance data",
      "Calculate energy yield, PR, and loss tree",
      "Assess degradation rates and reliability metrics",
      "Generate performance assessment report",
    ],
  },
  {
    id: "hybrid-system-design",
    name: "Hybrid System Design",
    description:
      "Design a hybrid solar+storage system with grid integration analysis.",
    triggerKeywords: [
      "hybrid",
      "solar storage",
      "solar battery",
      "bess",
      "microgrid",
      "off-grid",
      "solar wind",
    ],
    pipeline: [
      "vinyasa-agent",
      "vidyut-agent",
      "megha-agent",
      "phala-agent",
      "nivesha-agent",
    ],
    stepDescriptions: [
      "Design solar array layout and sizing",
      "Size BESS, inverters, and grid interconnection",
      "Model weather and irradiance profiles",
      "Simulate hybrid energy yield",
      "Analyze financial viability and LCOE",
    ],
  },
  {
    id: "material-analysis",
    name: "Material Analysis & Characterization",
    description:
      "Comprehensive material analysis pipeline: characterization, defect detection, and reliability.",
    triggerKeywords: [
      "material analysis",
      "characterization",
      "defect analysis",
      "material qualification",
      "wafer quality",
    ],
    pipeline: [
      "dravya-agent",
      "pariksha-agent",
      "nityata-agent",
      "grantha-agent",
    ],
    stepDescriptions: [
      "Perform material characterization (XRD, SEM, EL)",
      "Run material qualification tests",
      "Assess reliability and degradation behavior",
      "Document findings and compliance",
    ],
  },
];

// ---------------------------------------------------------------------------
// Workflow builder
// ---------------------------------------------------------------------------

/**
 * Create a workflow definition from a list of pipeline steps.
 * Steps are grouped into sequential waves — each wave contains one step
 * by default (fully sequential). Use groupIntoWaves() for parallelism.
 */
export function createWorkflowFromPipeline(
  name: string,
  query: string,
  pipeline: Array<{ agentId: string; description: string; skillId?: string; params?: Record<string, unknown> }>,
): WorkflowDefinition {
  const now = new Date().toISOString();
  const steps: WorkflowStep[] = pipeline.map((entry, i) => ({
    id: `step-${i}`,
    agentId: entry.agentId,
    description: entry.description,
    skillId: entry.skillId,
    params: entry.params ?? {},
    status: "pending" as StepStatus,
    dependsOn: i > 0 ? [`step-${i - 1}`] : [],
  }));

  const waves = groupStepsIntoWaves(steps);

  return {
    id: generateId(),
    name,
    query,
    waves,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Create a workflow from a predefined template.
 * The query and optional params are injected into the step context.
 */
export function createWorkflowFromTemplate(
  template: WorkflowTemplate,
  query: string,
  params?: Record<string, unknown>,
): WorkflowDefinition {
  const pipeline = template.pipeline.map((agentId, i) => ({
    agentId,
    description: template.stepDescriptions[i] ?? `Execute ${agentId}`,
    params: params ?? {},
  }));

  return createWorkflowFromPipeline(template.name, query, pipeline);
}

/**
 * Match a query against workflow templates and return the best match,
 * or undefined if no template matches.
 */
export function matchTemplate(query: string): WorkflowTemplate | undefined {
  const normalizedQuery = query.toLowerCase();
  let bestMatch: WorkflowTemplate | undefined;
  let bestScore = 0;

  for (const template of WORKFLOW_TEMPLATES) {
    let score = 0;
    for (const keyword of template.triggerKeywords) {
      if (normalizedQuery.includes(keyword)) {
        score += keyword.split(/\s+/).length; // multi-word keywords score higher
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = template;
    }
  }

  return bestScore > 0 ? bestMatch : undefined;
}

// ---------------------------------------------------------------------------
// Wave grouping
// ---------------------------------------------------------------------------

/**
 * Group steps into waves based on dependency analysis.
 * Steps with no unmet dependencies are placed in the earliest possible wave.
 */
function groupStepsIntoWaves(steps: WorkflowStep[]): Wave[] {
  const waves: Wave[] = [];
  const completed = new Set<string>();
  const remaining = [...steps];

  while (remaining.length > 0) {
    const waveSteps: WorkflowStep[] = [];
    const newlyCompleted: string[] = [];

    for (let i = remaining.length - 1; i >= 0; i--) {
      const step = remaining[i];
      const depsMetOrEmpty =
        step.dependsOn.length === 0 ||
        step.dependsOn.every((dep) => completed.has(dep));

      if (depsMetOrEmpty) {
        waveSteps.push(step);
        newlyCompleted.push(step.id);
        remaining.splice(i, 1);
      }
    }

    if (waveSteps.length === 0) {
      // Circular dependency or unresolvable — force remaining into one wave
      waves.push({
        index: waves.length,
        steps: remaining.splice(0),
        status: "pending",
      });
      break;
    }

    // Reverse so steps appear in original order within the wave
    waveSteps.reverse();

    waves.push({
      index: waves.length,
      steps: waveSteps,
      status: "pending",
    });

    for (const id of newlyCompleted) {
      completed.add(id);
    }
  }

  return waves;
}

// ---------------------------------------------------------------------------
// Workflow execution
// ---------------------------------------------------------------------------

/**
 * Execute a workflow by running waves sequentially and steps within each
 * wave concurrently. Returns the completed workflow definition.
 *
 * @param workflow  The workflow to execute (mutated in-place).
 * @param executors Map of agentId -> executor function.
 * @param context   Shared agent context for data passing.
 * @param options   Execution options.
 */
export async function executeWorkflow(
  workflow: WorkflowDefinition,
  executors: Map<string, AgentExecutor>,
  context: AgentContext,
  options: { maxConcurrency?: number; stepTimeoutMs?: number } = {},
): Promise<WorkflowDefinition> {
  const { maxConcurrency = 5, stepTimeoutMs = 300_000 } = options;

  workflow.status = "running";
  workflow.updatedAt = new Date().toISOString();

  for (const wave of workflow.waves) {
    wave.status = "running";

    // Execute steps in batches of maxConcurrency
    const batches = chunkArray(wave.steps, maxConcurrency);

    for (const batch of batches) {
      const promises = batch.map((step) =>
        executeStep(step, executors, context, stepTimeoutMs),
      );
      await Promise.all(promises);
    }

    // Determine wave status from step results
    const hasFailure = wave.steps.some((s) => s.status === "failed");
    const allCompleted = wave.steps.every(
      (s) => s.status === "completed" || s.status === "skipped",
    );

    if (hasFailure) {
      wave.status = "failed";
      workflow.status = "failed";
      workflow.updatedAt = new Date().toISOString();
      break; // Stop processing subsequent waves
    } else if (allCompleted) {
      wave.status = "completed";
    }
  }

  // If all waves completed, mark workflow as completed
  if (workflow.status === "running") {
    const allWavesDone = workflow.waves.every(
      (w) => w.status === "completed",
    );
    workflow.status = allWavesDone ? "completed" : "failed";
  }

  workflow.updatedAt = new Date().toISOString();
  return workflow;
}

/**
 * Execute a single workflow step using the registered executor for its agent.
 */
async function executeStep(
  step: WorkflowStep,
  executors: Map<string, AgentExecutor>,
  context: AgentContext,
  timeoutMs: number,
): Promise<void> {
  const executor = executors.get(step.agentId);
  if (!executor) {
    step.status = "skipped";
    step.error = `No executor registered for agent: ${step.agentId}`;
    return;
  }

  step.status = "running";

  try {
    const result = await Promise.race([
      executor(step, context),
      createTimeout(timeoutMs, step.id),
    ]);

    step.output = result;
    step.status = "completed";

    // Merge step output into shared context
    if (result && typeof result === "object") {
      Object.assign(context.data, result);
    }
  } catch (err) {
    step.status = "failed";
    step.error =
      err instanceof Error ? err.message : String(err);
  }
}

function createTimeout(ms: number, stepId: string): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error(`Step ${stepId} timed out after ${ms}ms`)),
      ms,
    ),
  );
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
