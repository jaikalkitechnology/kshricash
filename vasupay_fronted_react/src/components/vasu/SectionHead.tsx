import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadProps {
  title: ReactNode;
  /** optional right-aligned link/action */
  action?: ReactNode;
  className?: string;
}

/**
 * Section header with Fraunces display title + optional "view all" link.
 * Mirrors `.sec-head` from the design system.
 */
export function SectionHead({ title, action, className }: SectionHeadProps) {
  return (
    <div className={cn("flex items-center justify-between px-1 py-2", className)}>
      <h3 className="font-display text-lg font-semibold text-vasu-deep">{title}</h3>
      {action && (
        <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-saffron">
          {action}
        </div>
      )}
    </div>
  );
}
