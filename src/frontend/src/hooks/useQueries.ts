import type { CashfreeOrder, Payment } from "@/backend";
import { useActor } from "@/hooks/useActor";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useCreateCashfreeOrder() {
  const { actor } = useActor();
  return useMutation<
    CashfreeOrder,
    Error,
    { customerName: string; email: string; phone: string; amount: bigint }
  >({
    mutationFn: async ({ customerName, email, phone, amount }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createCashfreeOrder(customerName, email, phone, amount);
    },
  });
}

export function useGetPaymentStatus(orderId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Payment | null>({
    queryKey: ["payment", orderId],
    queryFn: async () => {
      if (!actor || !orderId) return null;
      return actor.getPaymentStatus(orderId);
    },
    enabled: !!actor && !isFetching && !!orderId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && data.status === "SUCCESS") return false;
      return 3000;
    },
  });
}

export function useGetAllPayments() {
  const { actor, isFetching } = useActor();
  return useQuery<Payment[]>({
    queryKey: ["payments", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFilteredPayments(filter: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Payment[]>({
    queryKey: ["payments", "filtered", filter],
    queryFn: async () => {
      if (!actor) return [];
      if (filter === "ALL") return actor.getAllPayments();
      return actor.getFilteredPayments(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
