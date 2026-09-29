import { ReactNode } from "react";
import { ArrowDownLeft, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type TxnDirection = "in" | "out" | "util";

export interface TxnItem {
  id?: string;
  name: string;
  meta?: string;
  amount: number;
  direction: TxnDirection;
  /** optional custom icon/emoji; falls back to direction arrow */
  icon?: LucideIcon;
  emoji?: ReactNode;
}

const iconWrap: Record<TxnDirection, string> = {
  in: "bg-success/15 text-success",
  out: "bg-destructive/12 text-destructive",
  util: "bg-saffron-glow text-saffron",
};

function TxnRow({ txn }: { txn: TxnItem }) {
  const Icon = txn.icon ?? (txn.direction === "in" ? ArrowDownLeft : ArrowUpRight);
  const isCredit = txn.direction === "in";
  const amt = txn.amount.toLocaleString("en-IN");
  return (
    <div className="flex items-center gap-3 border-b border-dashed border-border py-3 last:border-0">
      <span className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm", iconWrap[txn.direction])}>
        {txn.emoji ?? <Icon className="h-4 w-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-ink">{txn.name}</div>
        {txn.meta && (
          <div className="font-mono text-[10px] uppercase tracking-wide text-stone">{txn.meta}</div>
        )}
      </div>
      <div className={cn("font-display text-sm font-semibold", isCredit ? "text-success" : "text-ink")}>
        {isCredit ? "+" : "−"}₹{amt}
      </div>
    </div>
  );
}

interface TransactionListProps {
  items: TxnItem[];
  /** wrap rows in a card surface (default true) */
  card?: boolean;
  emptyLabel?: string;
  className?: string;
}

/** Transaction list with dashed-separated rows. Mirrors `.txn-row`/`.txn`. */
export function TransactionList({ items, card = true, emptyLabel = "No transactions yet", className }: TransactionListProps) {
  const body =
    items.length === 0 ? (
      <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>
    ) : (
      items.map((t, i) => <TxnRow key={t.id ?? `${t.name}-${i}`} txn={t} />)
    );

  if (!card) return <div className={className}>{body}</div>;
  return <Card className={cn("px-4 py-1 shadow-sm", className)}>{body}</Card>;
}
