import { useQuery } from "@tanstack/react-query";
import {
  getWalletBalances,
  getWalletTransactions,
  getMyTransactions,
  getTransactionSummary,
  getCommissionSummary,
} from "@/api/userApi";

const STALE = 30_000; // 30s

export function useWalletBalances() {
  return useQuery({ queryKey: ["wallet-balances"], queryFn: getWalletBalances, staleTime: STALE });
}

export function useWalletTransactions(page = 1, per_page = 10) {
  return useQuery({
    queryKey: ["wallet-transactions", page, per_page],
    queryFn: () => getWalletTransactions({ page, per_page }),
    staleTime: STALE,
  });
}

export function useMyTransactions(params: { page?: number; per_page?: number; service_type?: string; status_filter?: string } = {}) {
  return useQuery({
    queryKey: ["my-transactions", params],
    queryFn: () => getMyTransactions(params),
    staleTime: STALE,
  });
}

export function useTransactionSummary() {
  return useQuery({ queryKey: ["txn-summary"], queryFn: getTransactionSummary, staleTime: STALE });
}

export function useCommissionSummary() {
  return useQuery({ queryKey: ["commission-summary"], queryFn: getCommissionSummary, staleTime: STALE });
}
