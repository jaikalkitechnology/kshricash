import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { UserShell } from "@/components/shells/UserShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Search, History, MessageSquareWarning, CheckCircle2, FileText } from "lucide-react";
import { LoadingState, ErrorState, EmptyState } from "@/components/vasu";
import { useMyTransactions } from "@/hooks/useVasuData";
import { formatTxnDate, raiseComplaint, type ServiceTxnDTO } from "@/api/userApi";

const statusVariant = (s: string) => {
  const v = (s || "").toLowerCase();
  if (v === "success" || v === "successful" || v === "completed") return "default" as const;
  if (v === "failed" || v === "reversed") return "destructive" as const;
  return "secondary" as const;
};

const UserTransactions = () => {
  const [page] = useState(1);
  const [q, setQ] = useState("");
  const [complaintFor, setComplaintFor] = useState<ServiceTxnDTO | null>(null);
  const [invoiceFor, setInvoiceFor] = useState<ServiceTxnDTO | null>(null);
  const { data, isLoading, isError, error, refetch } = useMyTransactions({ page, per_page: 50 });

  const items: ServiceTxnDTO[] = data?.items || [];
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(
      (t) =>
        t.transaction_id?.toLowerCase().includes(needle) ||
        t.service_type?.toLowerCase().includes(needle)
    );
  }, [items, q]);

  return (
    <UserShell title="Transactions">
      <div className="mx-auto max-w-5xl">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display">All Transactions</CardTitle>
              <Button size="sm" variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="Search by Transaction ID or Service..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="flex-1"
              />
              <Button variant="secondary">
                <Search className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>

            {isLoading ? (
              <LoadingState rows={6} />
            ) : isError ? (
              <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
            ) : filtered.length === 0 ? (
              <EmptyState
                title={q ? "No matches" : "No transactions yet"}
                message={q ? "Try a different search term." : "Your service transactions will appear here."}
                icon={<History className="h-6 w-6" />}
              />
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bharat Connect Txn ID</TableHead>
                        <TableHead>Date &amp; Time</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-mono text-xs">{t.transaction_id}</TableCell>
                          <TableCell className="text-sm">{formatTxnDate(t.created_at)}</TableCell>
                          <TableCell className="capitalize">{t.service_type}</TableCell>
                          <TableCell className="text-right font-semibold">₹{t.amount.toLocaleString("en-IN")}</TableCell>
                          <TableCell><Badge variant={statusVariant(t.status)}>{t.status}</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="ghost" onClick={() => setInvoiceFor(t)}>
                                <FileText className="mr-1 h-4 w-4" /> Invoice
                              </Button>
                              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive"
                                onClick={() => setComplaintFor(t)}>
                                <MessageSquareWarning className="mr-1 h-4 w-4" /> Complaint
                              </Button>
                            </div>
                          </TableCell>
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
                      <div className="mt-2 flex gap-3">
                        <Button size="sm" variant="ghost" className="h-7 px-2"
                          onClick={() => setInvoiceFor(t)}>
                          <FileText className="mr-1 h-4 w-4" /> Invoice
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:text-destructive"
                          onClick={() => setComplaintFor(t)}>
                          <MessageSquareWarning className="mr-1 h-4 w-4" /> Complaint
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <ComplaintDialog txn={complaintFor} onClose={() => setComplaintFor(null)} />
      <InvoiceDialog txn={invoiceFor} onClose={() => setInvoiceFor(null)} />
    </UserShell>
  );
};

function InvoiceDialog({ txn, onClose }: { txn: ServiceTxnDTO | null; onClose: () => void }) {
  return (
    <Dialog open={!!txn} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-end">
            <img src="/bharat-connect/logo.svg" alt="Bharat Connect" className="h-6 w-auto" />
          </div>
          <DialogTitle className="font-display">Payment Receipt</DialogTitle>
        </DialogHeader>
        {txn && (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-2xl font-display font-semibold text-vasu-deep">₹{txn.amount.toLocaleString("en-IN")}</p>
              <Badge variant={statusVariant(txn.status)} className="mt-1 capitalize">{txn.status}</Badge>
            </div>
            <div className="space-y-2 rounded-xl bg-secondary/40 p-4 text-sm">
              {[
                ["Service", txn.service_type],
                ["Bharat Connect Txn ID", txn.transaction_id],
                ["Date & Time", formatTxnDate(txn.created_at)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="break-all text-right font-medium">{v}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-[11px] text-muted-foreground">Powered by Bharat Connect · Airtel Payments Bank</p>
            <Button className="w-full" variant="outline" onClick={() => window.print()}>
              <Download className="mr-2 h-4 w-4" /> Print / Save
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ComplaintDialog({ txn, onClose }: { txn: ServiceTxnDTO | null; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const mut = useMutation({ mutationFn: (desc: string) => raiseComplaint(txn!.id, { description: desc }) });
  const done = mut.isSuccess;

  const submit = () => mut.mutate(reason.trim());
  const close = () => { mut.reset(); setReason(""); onClose(); };

  return (
    <Dialog open={!!txn} onOpenChange={(o) => !o && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Raise a Complaint</DialogTitle>
        </DialogHeader>
        {done ? (
          <div className="space-y-3 py-2 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
            <p className="font-medium text-success">Complaint submitted</p>
            <p className="text-sm text-muted-foreground">
              Reference: <span className="font-mono">{(mut.data as any)?.ticket_id}</span>. Our team will review it shortly.
            </p>
            <Button className="w-full" onClick={close}>Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {txn && (
              <div className="rounded-lg bg-secondary/40 p-3 text-sm">
                <p className="capitalize">{txn.service_type} · ₹{txn.amount.toLocaleString("en-IN")}</p>
                <p className="font-mono text-xs text-muted-foreground">{txn.transaction_id}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Describe the issue</Label>
              <Textarea rows={4} placeholder="e.g. Amount debited but bill not paid…"
                value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            {mut.isError && <p className="text-sm text-destructive">{(mut.error as Error)?.message}</p>}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={close} disabled={mut.isPending}>Cancel</Button>
              <Button className="flex-1" onClick={submit} disabled={reason.trim().length < 3 || mut.isPending}>
                {mut.isPending ? "Submitting…" : "Submit Complaint"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default UserTransactions;
