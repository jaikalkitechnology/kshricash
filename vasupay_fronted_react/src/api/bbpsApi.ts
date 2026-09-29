import api from "./api";

// =====================================================
// BBPS (Airtel Payments Bank / Bharat Connect)
// Backend: app/api/v1/bbps.py
// =====================================================

export interface BbpsServiceItem {
  id: string;
  name: string;
  icon: string;
  group: string;
}

export interface BbpsServicesResponse {
  provider: string;
  powered_by: string;
  environment: string;
  logos: { airtel: string; bharat_connect: string };
  services: BbpsServiceItem[];
}

/** Generic decrypted provider envelope: { meta:{status,code,description}, data, errors } */
export interface BbpsEnvelope<T = any> {
  meta?: { status?: number; code?: string; description?: string };
  data?: T;
  errors?: any;
  _http_status?: number;
  _elapsed_ms?: number;
  _wallet?: { balance: number; debited: boolean };
}

export async function getBbpsServices(): Promise<BbpsServicesResponse> {
  const { data } = await api.get("/bbps/services");
  return data;
}

export async function getBillerCategories(): Promise<BbpsEnvelope> {
  const { data } = await api.get("/bbps/biller-categories");
  return data;
}

export async function getBillers(categoryId: string): Promise<BbpsEnvelope> {
  const { data } = await api.get(`/bbps/billers/${encodeURIComponent(categoryId)}`);
  return data;
}

export async function fetchBill(payload: {
  biller_id: string;
  references: Record<string, string>;
  mobile_number: string;
  customer_name?: string;
}): Promise<BbpsEnvelope> {
  const { data } = await api.post("/bbps/bill/fetch", payload);
  return data;
}

export async function validateBill(payload: {
  biller_id: string;
  references: Record<string, string>;
  mobile_number: string;
  customer_name?: string;
}): Promise<BbpsEnvelope> {
  const { data } = await api.post("/bbps/bill/validate", payload);
  return data;
}

export async function payBill(payload: {
  bbpou_ref_id?: string;
  biller_id: string;
  references: Record<string, string>;
  payment_amount: string;
  mobile_number: string;
  customer_name?: string;
  payment_mode?: string;
  payment_mode_info?: string;
  from_wallet?: boolean;
  service?: string;
  notify_sms?: boolean;
  notify_mobile?: string;
}): Promise<BbpsEnvelope> {
  const { data } = await api.post("/bbps/bill/pay", payload);
  return data;
}

export async function billInquiry(bbpou_ref_id: string): Promise<BbpsEnvelope> {
  const { data } = await api.post("/bbps/bill/inquiry", { bbpou_ref_id });
  return data;
}

/** v2: provider (partner/agent) available balance -> data.availableBalance */
export async function bbpsBalanceCheck(): Promise<BbpsEnvelope> {
  const { data } = await api.get("/bbps/balance-check");
  return data;
}

// ---- BBPS API version (v1 / v2) — admin selectable -----------

export interface BbpsVersionInfo {
  version: string; // active
  default?: string;
  supported: string[];
  bases?: { v1: string; v2: string };
}

export async function getBbpsVersion(): Promise<BbpsVersionInfo> {
  const { data } = await api.get("/bbps/version");
  return data;
}

export async function setBbpsVersion(version: string): Promise<BbpsVersionInfo> {
  const { data } = await api.put("/bbps/version", { version });
  return data;
}

// ---- BBPS agent registration (admin) -------------------------

export interface AgentRegisterPayload {
  mobile_number: string;
  pan: string;
  dob: string; // dd/mm/yyyy
  agent_name: string;
  agent_shop_name: string;
  address_line1: string;
  address_line2?: string;
  state: string;
  city: string;
  pin_code: number;
  latitude?: string;
  longitude?: string;
}

export async function registerAgent(payload: AgentRegisterPayload): Promise<BbpsEnvelope> {
  const { data } = await api.post("/bbps/agent/register", payload);
  return data;
}

export async function agentInquiry(mobile_number: string): Promise<BbpsEnvelope> {
  const { data } = await api.post("/bbps/agent/inquiry", { mobile_number });
  return data;
}

// ---- helpers --------------------------------------------------

/** A BBPS provider response is successful when meta.status === 0. */
export function isBbpsOk(env?: BbpsEnvelope): boolean {
  return env?.meta?.status === 0;
}

export interface BillerRef {
  key: string; // reference1..reference5
  label: string;
  type?: string; // AN | NUM | ...
  validations?: {
    minLength?: { value?: string };
    maxLength?: { value?: string };
    fixedLength?: { value?: string };
    regex?: { value?: string; errorMessage?: string };
  };
}

export interface BillerConfig {
  id: string;
  name: string;
  references: BillerRef[];
  fetchAndPay: boolean;
  validateAndPay: boolean;
  amountExactness?: string; // "Exact" | "Exact and below" | ...
}

/** Parse a biller-config item per the APBL doc (references.values + billPayType). */
export function normalizeBillerConfig(b: any): BillerConfig {
  const refsRaw = b?.references?.values || b?.references || [];
  const references: BillerRef[] = (Array.isArray(refsRaw) ? refsRaw : []).map((r: any) => ({
    key: r?.parameterKey || r?.key || "reference1",
    label: r?.label || r?.parameterKey || "Reference",
    type: r?.type,
    validations: r?.validations,
  }));
  const bpt = b?.billPayType || {};
  return {
    // Airtel biller configs identify billers by `billerCode`.
    id: b?.billerCode || b?.billerId || b?.billerCoBillerId || b?.id || "",
    name: b?.billerName || b?.name || b?.billerCode || "Unknown biller",
    references: references.length ? references : [{ key: "reference1", label: "Consumer Number" }],
    fetchAndPay: bpt?.fetchAndPay ?? true,
    validateAndPay: bpt?.validateAndPay ?? false,
    amountExactness: bpt?.amountExactness,
  };
}

/** Flatten the `billers` payload, which may be a flat array OR grouped by region
 *  ({ "Delhi": [...], "Mumbai": [...] }) OR a single biller object. */
function flattenBillers(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    if (raw.billerCode || raw.billerId || raw.billerName) return [raw];
    return Object.values(raw).flatMap((v) => (Array.isArray(v) ? v : []));
  }
  return [];
}

/** Extract full biller configs from a biller-configs envelope (defensive).
 *  Region-grouped categories (e.g. ELECTRICITY) can repeat the same biller
 *  across groups, so we de-duplicate by id (billerCode). */
export function extractBillerConfigs(env?: BbpsEnvelope): BillerConfig[] {
  const raw = env?.data?.billers ?? env?.data?.billerConfigs ?? env?.data;
  const seen = new Set<string>();
  const out: BillerConfig[] = [];
  for (const b of flattenBillers(raw)) {
    const cfg = normalizeBillerConfig(b);
    if (!cfg.id || seen.has(cfg.id)) continue;
    seen.add(cfg.id);
    out.push(cfg);
  }
  return out;
}

/** Decide the flow for a biller: fetch -> validate -> direct recharge. */
export function billerFlow(b: BillerConfig): "fetch" | "validate" | "direct" {
  if (b.fetchAndPay) return "fetch";
  if (b.validateAndPay) return "validate";
  return "direct";
}

export interface BillPlan {
  label: string;
  raw: string;
  amount: number; // rupees
}

/**
 * Extract selectable plan/amount options from a bill's additionalInfos
 * (e.g. prepaid "Liv Premium 12 months Amount": "99900"). Integer values are
 * treated as paise (BBPS convention) and converted to rupees; decimal values
 * are taken as rupees. Skips limits/balances/revised/min-max/due entries.
 */
export function extractPlans(infos?: { name?: string; value?: string }[]): BillPlan[] {
  const skip = /(revised|allowable|balance|minimum|maximum|\bdue\b|date)/i;
  return (infos || [])
    .filter(
      (ai) =>
        /amount/i.test(ai?.name || "") &&
        !skip.test(ai?.name || "") &&
        /^\d+(\.\d+)?$/.test(String(ai?.value)) &&
        Number(ai?.value) > 0
    )
    .map((ai) => {
      const raw = String(ai!.value);
      const amount = raw.includes(".") ? Number(raw) : Number(raw) / 100;
      return { label: (ai!.name || "").replace(/\s*amount$/i, "").trim() || ai!.name!, raw, amount };
    });
}

/**
 * If a reference's validation regex is an enumeration of fixed values, return
 * the option list (so the UI can render a dropdown). Handles both shapes:
 *   ^(A)$|^(B)$|^(C)$        and        ^(A|B|C)$
 * Returns null for free-text/pattern regexes.
 */
export function parseEnumOptions(regex?: string): string[] | null {
  if (!regex) return null;
  const s = regex.trim();
  // Shape 1: ^(A)$|^(B)$|^(C)$
  const alts = s.split("|").map((x) => x.trim());
  if (alts.length >= 2 && alts.every((a) => /^\^\([^()^$|]+\)\$$/.test(a))) {
    return alts.map((a) => a.replace(/^\^\(/, "").replace(/\)\$$/, "").trim());
  }
  // Shape 2: ^(A|B|C)$
  const m = s.match(/^\^\(([^()^$]+)\)\$$/);
  if (m && m[1].includes("|")) {
    return m[1].split("|").map((x) => x.trim()).filter(Boolean);
  }
  return null;
}
