import api from "./api";

// =====================================================
// DASHBOARD
// =====================================================

export async function getDashboardStats() {
  const { data } = await api.get("/admin/dashboard");
  return data;
}

// =====================================================
// USER MANAGEMENT
// =====================================================

export async function getUsers(params: {
  page?: number; per_page?: number; search?: string;
  entity_type?: string; status?: string; kyc_status?: string;
} = {}) {
  const { data } = await api.get("/admin/users", { params });
  return data;
}

export async function getUserDetail(userId: number) {
  const { data } = await api.get(`/admin/users/${userId}`);
  return data;
}

export async function updateUser(userId: number, payload: Record<string, any>) {
  const { data } = await api.patch(`/admin/users/${userId}`, payload);
  return data;
}

export async function createUser(payload: {
  full_name: string; phone: string; email?: string;
  password: string; entity_type: string;
}) {
  const { data } = await api.post("/admin/users", payload);
  return data;
}

export async function toggleUserLock(userId: number, lock: boolean) {
  const { data } = await api.patch(`/admin/users/${userId}/lock`, { lock });
  return data;
}

// =====================================================
// WALLET MANAGEMENT
// =====================================================

export async function getWallets(params: {
  page?: number; per_page?: number; user_id?: number; purpose?: string;
} = {}) {
  const { data } = await api.get("/admin/wallets", { params });
  return data;
}

export async function adjustWallet(walletId: number, amount: number, description: string) {
  const { data } = await api.post(`/admin/wallets/${walletId}/adjust`, { amount, description });
  return data;
}

// =====================================================
// TRANSACTION MANAGEMENT
// =====================================================

export async function getTransactions(params: {
  page?: number; per_page?: number; user_id?: number;
  status?: string; service_type?: string; search?: string;
} = {}) {
  const { data } = await api.get("/admin/transactions", { params });
  return data;
}

export async function getTransactionDetail(txnId: number) {
  const { data } = await api.get(`/admin/transactions/${txnId}`);
  return data;
}

// =====================================================
// COMMISSION MANAGEMENT
// =====================================================

export async function getCommissions(params: {
  page?: number; per_page?: number; user_id?: number; is_credited?: boolean;
} = {}) {
  const { data } = await api.get("/admin/commissions", { params });
  return data;
}

export async function getCommissionSummary() {
  const { data } = await api.get("/admin/commissions/summary");
  return data;
}

// =====================================================
// SETTLEMENT MANAGEMENT
// =====================================================

export async function getSettlements(params: {
  page?: number; per_page?: number; status?: string; user_id?: number;
} = {}) {
  const { data } = await api.get("/admin/settlements", { params });
  return data;
}

export async function approveSettlement(id: number, payload: { remarks?: string; bank_reference?: string } = {}) {
  const { data } = await api.post(`/admin/settlements/${id}/approve`, payload);
  return data;
}

export async function rejectSettlement(id: number, payload: { remarks?: string } = {}) {
  const { data } = await api.post(`/admin/settlements/${id}/reject`, payload);
  return data;
}

export async function completeSettlement(id: number, payload: { remarks?: string; bank_reference?: string } = {}) {
  const { data } = await api.post(`/admin/settlements/${id}/complete`, payload);
  return data;
}

// =====================================================
// KYC MANAGEMENT
// =====================================================

export async function getKYCSubmissions(params: {
  page?: number; per_page?: number; status?: string;
} = {}) {
  const { data } = await api.get("/admin/kyc", { params });
  return data;
}

export async function getKYCDetail(kycId: number) {
  const { data } = await api.get(`/admin/kyc/${kycId}`);
  return data;
}

export async function approveKYC(kycId: number, remarks?: string) {
  const { data } = await api.post(`/admin/kyc/${kycId}/approve`, { remarks });
  return data;
}

export async function rejectKYC(kycId: number, remarks?: string) {
  const { data } = await api.post(`/admin/kyc/${kycId}/reject`, { remarks });
  return data;
}

// =====================================================
// SUPPORT TICKETS
// =====================================================

export async function getTickets(params: {
  page?: number; per_page?: number; status?: string;
  priority?: string; user_id?: number;
} = {}) {
  const { data } = await api.get("/admin/tickets", { params });
  return data;
}

export async function getTicketDetail(ticketId: number) {
  const { data } = await api.get(`/admin/tickets/${ticketId}`);
  return data;
}

export async function replyToTicket(ticketId: number, message: string) {
  const { data } = await api.post(`/admin/tickets/${ticketId}/reply`, { message });
  return data;
}

export async function updateTicketStatus(ticketId: number, payload: {
  status: string; priority?: string; assigned_to?: number;
}) {
  const { data } = await api.patch(`/admin/tickets/${ticketId}/status`, payload);
  return data;
}

// =====================================================
// AUDIT LOGS
// =====================================================

export async function getAuditLogs(params: {
  page?: number; per_page?: number; user_id?: number;
  action?: string; resource_type?: string;
} = {}) {
  const { data } = await api.get("/admin/logs", { params });
  return data;
}
