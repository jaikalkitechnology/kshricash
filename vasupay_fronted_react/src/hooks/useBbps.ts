import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBbpsServices, getBillerCategories, getBillers, bbpsBalanceCheck,
  getBbpsVersion, setBbpsVersion,
} from "@/api/bbpsApi";

export function useBbpsServices() {
  return useQuery({ queryKey: ["bbps-services"], queryFn: getBbpsServices, staleTime: 5 * 60_000 });
}

export function useBillerCategories() {
  return useQuery({ queryKey: ["bbps-categories"], queryFn: getBillerCategories, staleTime: 5 * 60_000 });
}

export function useBillers(categoryId?: string) {
  return useQuery({
    queryKey: ["bbps-billers", categoryId],
    queryFn: () => getBillers(categoryId as string),
    enabled: !!categoryId,
    staleTime: 5 * 60_000,
  });
}

/** On-demand provider (partner/agent) available-balance check. */
export function useBbpsBalance() {
  return useMutation({ mutationKey: ["bbps-balance"], mutationFn: bbpsBalanceCheck });
}

/** Active BBPS API version (v1/v2). */
export function useBbpsVersion() {
  return useQuery({ queryKey: ["bbps-version"], queryFn: getBbpsVersion, staleTime: 60_000 });
}

/** Switch the active BBPS API version (v1/v2). */
export function useSetBbpsVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["bbps-version-set"],
    mutationFn: setBbpsVersion,
    onSuccess: (data) => qc.setQueryData(["bbps-version"], data),
  });
}
