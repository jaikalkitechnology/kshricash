import { useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Download, Search, RefreshCw, ChevronLeft, ChevronRight, FileJson, FileSpreadsheet,
  Network, Wallet, MessageSquare, KeyRound, X,
} from "lucide-react";
import {
  getAuditLogs, getAuditSummary, downloadAuditExport,
  AUDIT_CHANNELS, AUDIT_STATUSES, type AuditFilters, type AuditLogItem,
} from "@/api/auditApi";

const CHANNEL_META: Record<string, { icon: any; tone: string; label: string }> = {
  BBPS: { icon: Network, tone: "bg-emerald-500/10 text-emerald-600", label: "Bharat Connect" },
  WALLET: { icon: Wallet, tone: "bg-saffron/10 text-saffron", label: "Wallet" },
  SMS: { icon: MessageSquare, tone: "bg-sky-500/10 text-sky-600", label: "SMS" },
  OTP: { icon: KeyRound, tone: "bg-violet-500/10 text-violet-600", label: "OTP" },
};

const statusVariant = (s: string): "default" | "secondary" | "destructive" | "outline" => {
  if (s === "SUCCESS") return "default";
  if (s === "FAILED") return "destructive";
  if (s === "INITIATED" || s === "PENDING") return "secondary";
  return "outline";
};

const fmtTime = (t?: string | null) => (t ? new Date(t).toLocaleString("en-IN") : "—");
const fmtAmt = (a?: number | null) =>
  a == null ? "—" : `₹${a.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const AdminAuditLogs = () => {
  const { toast } = useToast();
  const [draft, setDraft] = useState<AuditFilters>({});
  const [filters, setFilters] = useState<AuditFilters>({});
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<AuditLogItem | null>(null);
  const [downloading, setDownloading] = useState<"csv" | "json" | null>(null);

  const perPage = 25;

  const logs = useQuery({
    queryKey: ["audit-logs", filters, page],
    queryFn: () => getAuditLogs(filters, page, perPage),
    placeholderData: keepPreviousData,
  });
  const summary = useQuery({
    queryKey: ["audit-summary", filters.date_from, filters.date_to],
    queryFn: () => getAuditSummary({ date_from: filters.date_from, date_to: filters.date_to }),
  });

  const apply = () => { setPage(1); setFilters(draft); };
  const reset = () => { setDraft({}); setFilters({}); setPage(1); };

  const runExport = async (format: "csv" | "json") => {
    try {
      setDownloading(format);
      await downloadAuditExport(format, filters);
      toast({ title: "Export ready", description: `Audit logs downloaded as ${format.toUpperCase()}.` });
    } catch {
      toast({ title: "Export failed", description: "Could not generate the export.", variant: "destructive" });
    } finally {
      setDownloading(null);
    }
  };

  const items = logs.data?.items ?? [];
  const total = logs.data?.total ?? 0;
  const pages = logs.data?.pages ?? 1;

  const cards = useMemo(() => {
    const byCh = summary.data?.by_channel ?? {};
    return AUDIT_CHANNELS.map((c) => ({ channel: c, count: byCh[c] ?? 0 }));
  }, [summary.data]);

  return (
    <DashboardLayout sidebar={<AdminSidebar />} title="Integration Logs" userRole="Super Admin">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Intro */}
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl font-semibold text-ink">Integration Audit Logs</h2>
          <p className="text-sm text-stone">
            Immutable trail of BBPS, OTP, wallet and SMS activity — saved in the database and
            exportable (CSV/JSON) for reconciliation with Airtel Payments Bank.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cards.map(({ channel, count }) => {
            const meta = CHANNEL_META[channel];
            const Icon = meta.icon;
            return (
              <button
                key={channel}
                onClick={() => { setDraft((d) => ({ ...d, channel })); setFilters((f) => ({ ...f, channel })); setPage(1); }}
                className={`rounded-2xl border p-4 text-left transition hover:shadow-md ${
                  filters.channel === channel ? "border-saffron bg-saffron/5" : "border-border bg-card"
                }`}
              >
                <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl ${meta.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold text-ink">{count.toLocaleString("en-IN")}</p>
                <p className="text-xs text-stone">{meta.label}</p>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="shadow-sm">
          <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <label className="text-xs text-stone">Channel</label>
              <Select value={draft.channel ?? "all"} onValueChange={(v) => setDraft((d) => ({ ...d, channel: v === "all" ? undefined : v }))}>
                <SelectTrigger><SelectValue placeholder="All channels" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All channels</SelectItem>
                  {AUDIT_CHANNELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-stone">Status</label>
              <Select value={draft.status ?? "all"} onValueChange={(v) => setDraft((d) => ({ ...d, status: v === "all" ? undefined : v }))}>
                <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {AUDIT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-stone">From date</label>
              <Input type="date" value={draft.date_from ?? ""} onChange={(e) => setDraft((d) => ({ ...d, date_from: e.target.value || undefined }))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-stone">To date</label>
              <Input type="date" value={draft.date_to ?? ""} onChange={(e) => setDraft((d) => ({ ...d, date_to: e.target.value || undefined }))} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-stone">Search (mobile / reference / biller / actor / message)</label>
              <Input value={draft.search ?? ""} placeholder="Search…"
                onChange={(e) => setDraft((d) => ({ ...d, search: e.target.value || undefined }))}
                onKeyDown={(e) => e.key === "Enter" && apply()} />
            </div>
            <div className="flex items-end gap-2 sm:col-span-2">
              <Button onClick={apply} className="flex-1 bg-saffron text-white hover:brightness-105">
                <Search className="mr-2 h-4 w-4" /> Apply
              </Button>
              <Button variant="outline" onClick={reset}>
                <X className="mr-2 h-4 w-4" /> Reset
              </Button>
              <Button variant="outline" onClick={() => logs.refetch()} title="Refresh">
                <RefreshCw className={`h-4 w-4 ${logs.isFetching ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Toolbar: count + export */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-stone">
            {logs.isLoading ? "Loading…" : `${total.toLocaleString("en-IN")} record${total === 1 ? "" : "s"}`}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => runExport("csv")} disabled={downloading !== null}>
              {downloading === "csv" ? <Download className="mr-2 h-4 w-4 animate-pulse" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => runExport("json")} disabled={downloading !== null}>
              {downloading === "json" ? <Download className="mr-2 h-4 w-4 animate-pulse" /> : <FileJson className="mr-2 h-4 w-4" />}
              JSON
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card className="shadow-sm">
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 9 }).map((__, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-sm text-stone">
                      No audit entries match these filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((r) => {
                    const meta = CHANNEL_META[r.channel] ?? CHANNEL_META.BBPS;
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="whitespace-nowrap text-xs text-stone">{fmtTime(r.created_at)}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${meta.tone}`}>
                            {r.channel}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{r.action}</TableCell>
                        <TableCell><Badge variant={statusVariant(r.status)}>{r.status}</Badge></TableCell>
                        <TableCell className="max-w-[140px] truncate text-sm">{r.actor_name || (r.user_id ? `#${r.user_id}` : "—")}</TableCell>
                        <TableCell className="font-mono text-xs">{r.mobile_number || "—"}</TableCell>
                        <TableCell className="max-w-[160px] truncate font-mono text-xs">{r.reference_id || r.biller_id || "—"}</TableCell>
                        <TableCell className="text-right text-sm">{fmtAmt(r.amount)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setDetail(r)}>View</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-display">
              {detail?.channel} · {detail?.action}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {([
                  ["Time", fmtTime(detail.created_at)],
                  ["Status", detail.status],
                  ["Provider", detail.provider || "—"],
                  ["Environment", detail.environment || "—"],
                  ["Actor", detail.actor_name || (detail.user_id ? `#${detail.user_id}` : "—")],
                  ["Actor phone", detail.actor_phone || "—"],
                  ["Mobile", detail.mobile_number || "—"],
                  ["Reference", detail.reference_id || "—"],
                  ["Biller", detail.biller_id || "—"],
                  ["Amount", fmtAmt(detail.amount)],
                  ["HTTP status", detail.http_status ?? "—"],
                  ["Response code", detail.response_code || "—"],
                  ["Latency", detail.latency_ms != null ? `${detail.latency_ms} ms` : "—"],
                  ["IP", detail.ip_address || "—"],
                  ["UUID", detail.uuid],
                  ["Endpoint", detail.endpoint || "—"],
                ] as [string, any][]).map(([k, v]) => (
                  <div key={k} className="flex flex-col">
                    <span className="text-xs text-stone">{k}</span>
                    <span className="break-all font-medium text-ink">{v}</span>
                  </div>
                ))}
              </div>
              {detail.response_message && (
                <div>
                  <p className="text-xs text-stone">Message</p>
                  <p className="rounded-lg bg-secondary/40 p-2 text-ink">{detail.response_message}</p>
                </div>
              )}
              {detail.error && (
                <div>
                  <p className="text-xs text-stone">Error</p>
                  <p className="rounded-lg bg-destructive/5 p-2 text-destructive">{detail.error}</p>
                </div>
              )}
              {(detail.request_data || detail.response_data) && (
                <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                  <details open className="rounded-lg border border-border p-2">
                    <summary className="cursor-pointer text-xs font-medium text-emerald-700">
                      ▶ Request sent to Bharat Connect (redacted)
                    </summary>
                    <pre className="mt-2 max-h-72 overflow-auto rounded bg-secondary/40 p-2 text-[11px] leading-snug">
                      {detail.request_data ? JSON.stringify(detail.request_data, null, 2) : "—"}
                    </pre>
                  </details>
                  <details open className="rounded-lg border border-border p-2">
                    <summary className="cursor-pointer text-xs font-medium text-sky-700">
                      ◀ Response received from Bharat Connect
                    </summary>
                    <pre className="mt-2 max-h-72 overflow-auto rounded bg-secondary/40 p-2 text-[11px] leading-snug">
                      {detail.response_data ? JSON.stringify(detail.response_data, null, 2) : "—"}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminAuditLogs;
