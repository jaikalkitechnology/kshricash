import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuickTone = "teal" | "saffron" | "gold" | "sky";

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  tone?: QuickTone;
  onClick?: () => void;
}

const toneStyles: Record<QuickTone, string> = {
  teal: "bg-vasu-pale text-vasu-deep",
  saffron: "bg-saffron-glow text-saffron",
  gold: "bg-gold-soft text-[#8A5F00]",
  sky: "bg-[#D4ECF5] text-[#1F5F7E]",
};

interface QuickActionGridProps {
  actions: QuickAction[];
  /** tiles per row on mobile (default 4) */
  columns?: 3 | 4;
  className?: string;
}

/**
 * Grid of rounded quick-action tiles with tinted icon chips.
 * Mirrors `.quick-grid` / `.q-tile` from the design system.
 */
export function QuickActionGrid({ actions, columns = 4, className }: QuickActionGridProps) {
  return (
    <div
      className={cn(
        "grid gap-2 sm:gap-3",
        columns === 4 ? "grid-cols-4" : "grid-cols-3",
        className
      )}
    >
      {actions.map((a, i) => {
        const Icon = a.icon;
        return (
          <button
            key={`${a.label}-${i}`}
            type="button"
            onClick={a.onClick}
            className="flex flex-col items-center rounded-2xl border border-border bg-card px-1.5 py-3 text-center transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span
              className={cn(
                "mb-1.5 flex h-10 w-10 items-center justify-center rounded-xl",
                toneStyles[a.tone ?? "teal"]
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-[10px] font-semibold leading-tight text-graphite sm:text-xs">
              {a.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
