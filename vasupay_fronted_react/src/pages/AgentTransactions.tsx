import { useMemo, useState } from "react";
import { AgentShell } from "@/components/shells/AgentShell";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { History } from "lucide-react";
import { LoadingState, ErrorState, EmptyState } from "@/components/vasu";
import { useMyTransactions } from "@/hooks/useVasuData";
import { formatTxnDate, type ServiceTxnDTO } from "@/api/userApi";

const statusVariant = (s: string) => {
  const v = (s || "").toLowerCase();
  if (v === "success" || v === "successful" || v === "completed") return "default" as const;
  if (v === "failed" || v === "reversed") return "destructive" as const;
  return "secondary" as const;
};

const AgentTransactions = () => {
  const [q, setQ] = useState("");
  const { data, isLoading, isError, error, refetch } = useMyTransactions({ page: 1, per_page: 50 });

  const items: ServiceTxnDTO[] = data?.items || [];
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(
      (t) => t.transaction_id?.toLowerCase().includes(needle) || t.service_type?.toLowerCase().includes(needle)
    );
  }, [items, q]);

  return (
    <AgentShell title="Transactions">
      <Card className="p-4 sm:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Transaction History</h2>
            <p className="mt-1 text-sm text-muted-foreground">View all BBPS transactions</p>
          </div>
          <Input className="w-full sm:w-64" placeholder="Search transactions..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        {isLoading ? (
          <LoadingState rows={6} />
        ) : isError ? (
          <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={q ? "No matches" : "No transactions yet"}
            message={q ? "Try a different search term." : "Collected payments will appear here."}
            icon={<History className="h-6 w-6" />}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date &amp; Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.transaction_id}</TableCell>
                      <TableCell className="capitalize">{t.service_type}</TableCell>
                      <TableCell className="text-right font-semibold">₹{t.amount.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-muted-foreground">{formatTxnDate(t.created_at)}</TableCell>
                      <TableCell><Badge variant={statusVariant(t.status)}>{t.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {filtered.map((t) => (
                <div key={t.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold capitalize text-ink">{t.service_type}</p>
                      <p className="font-mono text-[11px] text-stone">{t.transaction_id}</p>
                    </div>
                    <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="text-xs text-muted-foreground">{formatTxnDate(t.created_at)}</span>
                    <span className="font-display text-lg font-semibold">₹{t.amount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </AgentShell>
  );
};

export default AgentTransactions;
