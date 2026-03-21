import Link from "next/link";
import type { Skill } from "@/lib/data";
import clsx from "clsx";

interface SkillCardProps {
  skill: Skill;
  compact?: boolean;
}

const statusConfig = {
  available: {
    label: "Available",
    className: "badge-available",
    dot: "bg-emerald-500",
  },
  "in-progress": {
    label: "In Progress",
    className: "badge-in-progress",
    dot: "bg-amber-500",
  },
  planned: {
    label: "Planned",
    className: "badge-planned",
    dot: "bg-gray-600",
  },
};

export default function SkillCard({ skill, compact = false }: SkillCardProps) {
  const status = statusConfig[skill.status];

  return (
    <div className={clsx("card-hover", compact ? "p-3" : "p-5")}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <code className="text-sm font-mono text-amber-400 break-all leading-tight">
          {skill.name}
        </code>
        <span className={status.className}>{status.label}</span>
      </div>

      {/* Pack */}
      <div className="text-xs text-gray-600 mb-2 font-mono">{skill.pack}</div>

      {!compact && (
        <>
          {/* Description */}
          <p className="text-sm text-gray-400 leading-relaxed mb-3">
            {skill.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {skill.tags.slice(0, 5).map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>

          {/* Agent */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">
              Agent:{" "}
              <span className="text-amber-600/80 font-mono">{skill.agent}</span>
            </span>
            <span className="text-gray-600">{skill.packLabel}</span>
          </div>
        </>
      )}

      {compact && (
        <p className="text-xs text-gray-500 leading-snug line-clamp-2">
          {skill.description}
        </p>
      )}
    </div>
  );
}
