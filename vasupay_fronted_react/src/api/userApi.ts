import api from "./api";

// =====================================================
// Shared (customer / agent / entity) self-service APIs
// Backend: app/api/v1/{wallets,transactions,reports,commissions,services}.py
// =====================================================

export interface WalletDTO {
  id: number;
  purpose: string;
  balance: number;
  is_active: boolean;
  created_at: string;
}

export interface WalletTxnDTO {
  id: number;
  type: string;
  amount: number;
  balance_after: number | null;
  description: string | null;
  created_at: string;
}

export interface ServiceTxnDTO {
  id: number;
  transaction_id: string;
  service_type: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

export async function getWalletBalances(): Promise<{ wallets: WalletDTO[] }> {
  const { data } = await api.get("/wallets/balance");
  return data;
}

export async function getWalletTransactions(params: { page?: number; per_page?: number } = {}): Promise<Paginated<WalletTxnDTO>> {
  const { data } = await api.get("/wallets/transactions", { params });
  return data;
}

export async function getMyTransactions(
  params: { page?: number; per_page?: number; service_type?: string; status_filter?: string } = {}
): Promise<Paginated<ServiceTxnDTO>> {
  const { data } = await api.get("/transactions/", { params });
  return data;
}

export interface TransactionSummary {
  summary: Record<string, { count: number; total_amount: number }>;
  user_id: number;
}

export async function getTransactionSummary(): Promise<TransactionSummary> {
  const { data } = await api.get("/reports/transactions/summary");
  return data;
}

export async function getCommissionSummary(): Promise<{ total_earned: number; user_id: number }> {
  const { data } = await api.get("/commissions/summary");
  return data;
}

export async function getServices() {
  const { data } = await api.get("/services/");
  return data;
}

export async function raiseComplaint(transactionId: number | string, payload: { subject?: string; description: string }) {
  const { data } = await api.post(`/transactions/${transactionId}/complaint`, {
    subject: payload.subject || "Transaction complaint",
    description: payload.description,
  });
  return data;
}

// ---- helpers --------------------------------------------------

/** Pick the spendable balance: MAIN wallet if present, else sum of all. */
export function primaryBalance(wallets: WalletDTO[] = []): number {
  const main = wallets.find((w) => (w.purpose || "").toLowerCase() === "main");
  if (main) return main.balance;
  return wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
}

const CREDIT_HINTS = ["credit", "load", "topup", "top_up", "refund", "cashback", "deposit", "in"];

/** Map a wallet transaction type to a list direction. */
export function walletTxnDirection(type: string): "in" | "out" {
  const t = (type || "").toLowerCase();
  return CREDIT_HINTS.some((h) => t.includes(h)) ? "in" : "out";
}

/** Format an ISO timestamp as "15 Jan, 14:30" (IST-agnostic, locale en-IN). */
export function formatTxnDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso.replace(" ", "T"));
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
