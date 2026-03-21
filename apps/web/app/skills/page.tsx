import { Suspense } from "react";
import SkillBrowser from "@/components/SkillBrowser";
import { skills } from "@/lib/data";

export const metadata = {
  title: "Skills — SuryaPrajna",
  description: "Browse all PV scientific skills across 10 domain packs",
};

function SkillBrowserWrapper({
  searchParams,
}: {
  searchParams: { pack?: string };
}) {
  return <SkillBrowser initialPack={searchParams.pack} />;
}

export default function SkillsPage({
  searchParams,
}: {
  searchParams: { pack?: string };
}) {
  const availableCount = skills.filter((s) => s.status === "available").length;
  const inProgressCount = skills.filter(
    (s) => s.status === "in-progress"
  ).length;
  const plannedCount = skills.filter((s) => s.status === "planned").length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-3">Skills Library</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Browse the complete registry of PV scientific skills across 10 domain
          packs. Each skill follows the open{" "}
          <a
            href="https://agentskills.io"
            className="text-amber-400 hover:text-amber-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Agent Skills standard
          </a>{" "}
          for agent-agnostic compatibility.
        </p>

        {/* Status summary */}
        <div className="flex flex-wrap gap-3 mt-6">
          <div className="flex items-center gap-2 card px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm text-gray-300">
              <strong className="text-white">{availableCount}</strong> Available
            </span>
          </div>
          <div className="flex items-center gap-2 card px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-sm text-gray-300">
              <strong className="text-white">{inProgressCount}</strong> In
              Progress
            </span>
          </div>
          <div className="flex items-center gap-2 card px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-gray-600" />
            <span className="text-sm text-gray-300">
              <strong className="text-white">{plannedCount}</strong> Planned
            </span>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="text-gray-500">Loading skills…</div>}>
        <SkillBrowserWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
