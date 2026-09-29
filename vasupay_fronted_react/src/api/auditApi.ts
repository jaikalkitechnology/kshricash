import api from "./api";

// =====================================================
// Integration Audit Logs (BBPS / OTP / WALLET / SMS)
// Backend: app/api/v1/audit.py
// =====================================================

export interface AuditLogItem {
  id: number;
  uuid: string;
  created_at: string | null;
  channel: string;
  action: string;
  status: string;
  provider?: string | null;
  environment?: string | null;
  user_id?: number | null;
  actor_name?: string | null;
  actor_phone?: string | null;
  mobile_number?: string | null;
  reference_id?: string | null;
  biller_id?: string | null;
  amount?: number | null;
  endpoint?: string | null;
  http_status?: number | null;
  response_code?: string | null;
  response_message?: string | null;
  latency_ms?: number | null;
  ip_address?: string | null;
  request_data?: any;
  response_data?: any;
  error?: string | null;
}

export interface AuditLogsResponse {
  items: AuditLogItem[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface AuditSummary {
  channels: string[];
  by_channel: Record<string, number>;
  by_status: Record<string, number>;
  total: number;
}

export interface AuditFilters {
  channel?: string;
  status?: string;
  action?: string;
  user_id?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export const AUDIT_CHANNELS = ["BBPS", "OTP", "WALLET", "SMS"] as const;
export const AUDIT_STATUSES = ["SUCCESS", "FAILED", "PENDING", "INITIATED"] as const;

function cleanParams(obj: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && v !== "" && v !== "all") out[k] = v;
  }
  return out;
}

export async function getAuditLogs(
  filters: AuditFilters,
  page = 1,
  per_page = 25
): Promise<AuditLogsResponse> {
  const { data } = await api.get("/audit/logs", { params: { ...cleanParams(filters), page, per_page } });
  return data;
}

export async function getAuditSummary(filters: AuditFilters = {}): Promise<AuditSummary> {
  const { data } = await api.get("/audit/summary", { params: cleanParams(filters) });
  return data;
}

/** Download an export (CSV/JSON) with the current filters as an attachment. */
export async function downloadAuditExport(format: "csv" | "json", filters: AuditFilters): Promise<void> {
  const res = await api.get("/audit/logs/export", {
    params: { ...cleanParams(filters), format },
    responseType: "blob",
  });
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "");
  const blob = new Blob([res.data], { type: format === "csv" ? "text/csv" : "application/json" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vasupay_audit_${stamp}.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
