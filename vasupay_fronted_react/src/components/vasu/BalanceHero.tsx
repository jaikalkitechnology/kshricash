import { ReactNode, useState } from "react";
import { Eye, EyeOff, ShieldCheck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BalanceAction {
  label: string;
  icon?: LucideIcon;
  primary?: boolean;
  onClick?: () => void;
}

interface BalanceHeroProps {
  /** Small mono label above the amount, e.g. "VASU WALLET" */
  label?: string;
  /** Amount in rupees (number) — rendered with ₹ and grouping */
  amount: number;
  actions?: BalanceAction[];
  kycVerified?: boolean;
  className?: string;
  /** Use the green→deep gradient variant (wallet screen) instead of solid deep */
  variant?: "deep" | "gradient";
  children?: ReactNode;
}

/**
 * Deep emerald-teal balance card with saffron radial glow.
 * Mirrors `.hero-balance` / `.wallet-hero` from designed/vasu-pay-design.html.
 */
export function BalanceHero({
  label = "VASU WALLET",
  amount,
  actions = [],
  kycVerified,
  className,
  variant = "deep",
  children,
}: BalanceHeroProps) {
  const [hidden, setHidden] = useState(false);
  const formatted = amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const [whole, fraction] = formatted.split(".");

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl p-6 text-cream shadow-lg",
        variant === "gradient"
          ? "bg-gradient-to-br from-vasu-green to-vasu-deep"
          : "bg-vasu-deep",
        className
      )}
    >
      {/* radial brand glows */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,107,53,0.35),transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(111,197,176,0.25),transparent_70%)]" />

      <div className="relative z-10">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-vasu-mint">{label}</span>
          <div className="flex items-center gap-2">
            {kycVerified && (
              <span className="inline-flex items-center gap-1 rounded-full border border-success/50 bg-success/25 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                <ShieldCheck className="h-3 w-3" /> KYC
              </span>
            )}
            <button
              type="button"
              onClick={() => setHidden((v) => !v)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              aria-label={hidden ? "Show balance" : "Hide balance"}
            >
              {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <div className="mb-4 font-display text-4xl font-medium leading-none tracking-tight">
          <span className="align-super text-lg text-saffron-light">₹</span>
          {hidden ? (
            <span>••••••</span>
          ) : (
            <>
              {whole}
              <span className="text-lg text-vasu-mint">.{fraction}</span>
            </>
          )}
        </div>

        {actions.length > 0 && (
          <div className="flex gap-2">
            {actions.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.label}
                  type="button"
                  onClick={a.onClick}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition",
                    a.primary
                      ? "border-saffron bg-saffron text-white hover:brightness-105"
                      : "border-white/15 bg-white/10 text-cream hover:bg-white/20"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {a.label}
                </button>
              );
            })}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
