import api from "./api";

// =====================================================
// ENTITY DASHBOARD
// =====================================================

export async function getEntityDashboard() {
  const { data } = await api.get("/entity/dashboard");
  return data;
}

export async function getEntityProfile() {
  const { data } = await api.get("/entity/profile");
  return data;
}

// =====================================================
// CHILDREN MANAGEMENT
// =====================================================

export async function getChildren(params: {
  page?: number; per_page?: number; entity_type?: string;
  status?: string; search?: string; direct_only?: boolean;
} = {}) {
  const { data } = await api.get("/entity/children", { params });
  return data;
}

export async function getChildDetail(childId: number) {
  const { data } = await api.get(`/entity/children/${childId}`);
  return data;
}

export async function createChild(payload: {
  full_name: string; phone: string; email?: string;
  password: string; entity_type: string;
  address?: string; city?: string; state?: string; pincode?: string;
}) {
  const { data } = await api.post("/entity/children", payload);
  return data;
}

export async function updateChild(childId: number, payload: Record<string, any>) {
  const { data } = await api.patch(`/entity/children/${childId}`, payload);
  return data;
}

export async function toggleChildLock(childId: number, lock: boolean) {
  const { data } = await api.patch(`/entity/children/${childId}/lock`, null, { params: { lock } });
  return data;
}

// =====================================================
// KYC MANAGEMENT (hierarchy-scoped)
// =====================================================

export async function getHierarchyKYC(params: {
  page?: number; per_page?: number; status?: string;
} = {}) {
  const { data } = await api.get("/entity/kyc", { params });
  return data;
}

export async function approveChildKYC(kycId: number, remarks?: string) {
  const { data } = await api.post(`/entity/kyc/${kycId}/approve`, { remarks });
  return data;
}

export async function rejectChildKYC(kycId: number, remarks?: string) {
  const { data } = await api.post(`/entity/kyc/${kycId}/reject`, { remarks });
  return data;
}

// =====================================================
// SERVICE MANAGEMENT
// =====================================================

export async function getChildServices(childId: number) {
  const { data } = await api.get(`/entity/children/${childId}/services`);
  return data;
}

export async function toggleChildService(childId: number, serviceCode: string, enabled: boolean) {
  const { data } = await api.post(`/entity/children/${childId}/services`, {
    service_code: serviceCode,
    enabled,
  });
  return data;
}

// =====================================================
// WALLET LOAD
// =====================================================

export async function loadChildWallet(childId: number, amount: number, description: string) {
  const { data } = await api.post(`/entity/children/${childId}/wallet/load`, { amount, description });
  return data;
}

// =====================================================
// TRANSACTIONS & COMMISSIONS (hierarchy-scoped)
// =====================================================

export async function getHierarchyTransactions(params: {
  page?: number; per_page?: number; user_id?: number;
  status?: string; service_type?: string;
} = {}) {
  const { data } = await api.get("/entity/transactions", { params });
  return data;
}

export async function getHierarchyCommissions(params: {
  page?: number; per_page?: number;
} = {}) {
  const { data } = await api.get("/entity/commissions", { params });
  return data;
}

// =====================================================
// SELF-KYC SUBMISSION
// =====================================================

export async function getMyKYCStatus() {
  const { data } = await api.get("/kyc/status");
  return data;
}

export async function submitMyKYC(formData: FormData) {
  const { data } = await api.post("/kyc/submit", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function resubmitMyKYC(formData: FormData) {
  const { data } = await api.patch("/kyc/resubmit", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
