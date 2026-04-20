import type { StepType } from "@/data/presets";
import { cn } from "@/lib/utils";

const STYLES: Record<StepType, string> = {
  GOAL: "bg-[color-mix(in_oklab,var(--step-goal)_15%,transparent)] text-[var(--step-goal)] ring-1 ring-inset ring-[color-mix(in_oklab,var(--step-goal)_30%,transparent)]",
  PLAN: "bg-[color-mix(in_oklab,var(--step-plan)_15%,transparent)] text-[var(--step-plan)] ring-1 ring-inset ring-[color-mix(in_oklab,var(--step-plan)_30%,transparent)]",
  ACTION: "bg-[color-mix(in_oklab,var(--step-action)_15%,transparent)] text-[var(--step-action)] ring-1 ring-inset ring-[color-mix(in_oklab,var(--step-action)_30%,transparent)]",
  OBSERVATION: "bg-[color-mix(in_oklab,var(--step-observation)_15%,transparent)] text-[var(--step-observation)] ring-1 ring-inset ring-[color-mix(in_oklab,var(--step-observation)_30%,transparent)]",
  EXTRACTION: "bg-[color-mix(in_oklab,var(--step-extraction)_15%,transparent)] text-[var(--step-extraction)] ring-1 ring-inset ring-[color-mix(in_oklab,var(--step-extraction)_30%,transparent)]",
  VERIFY: "bg-[color-mix(in_oklab,var(--step-verify)_15%,transparent)] text-[var(--step-verify)] ring-1 ring-inset ring-[color-mix(in_oklab,var(--step-verify)_30%,transparent)]",
};

export function StepBadge({ type, className }: { type: StepType; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        STYLES[type],
        className,
      )}
    >
      {type}
    </span>
  );
}
