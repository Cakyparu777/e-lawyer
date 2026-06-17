import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/api/client";
import type {
  Appointment,
  AuthResponse,
  Category,
  ChatMessage,
  ChatThread,
  ChatThreadSummary,
  CheckoutResponse,
  Lawyer,
  Review
} from "@/types/domain";

export function useCategories() {
  return useQuery({ queryKey: ["categories"], queryFn: () => apiFetch<Category[]>("/categories") });
}

export function useLawyers(categoryId?: string, search?: string) {
  return useQuery({
    queryKey: ["lawyers", categoryId, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (categoryId) params.set("category_id", categoryId);
      if (search) params.set("search", search);
      return apiFetch<Lawyer[]>(`/lawyers?${params.toString()}`);
    }
  });
}

export function useLawyer(lawyerId: string) {
  return useQuery({
    queryKey: ["lawyer", lawyerId],
    queryFn: () => apiFetch<Lawyer>(`/lawyers/${lawyerId}`),
    enabled: Boolean(lawyerId)
  });
}

export function useAppointments() {
  return useQuery({ queryKey: ["appointments"], queryFn: () => apiFetch<Appointment[]>("/appointments") });
}

export function useChatThread(appointmentId: string) {
  return useQuery({
    queryKey: ["chat", appointmentId],
    queryFn: () => apiFetch<ChatThread>(`/chats/appointments/${appointmentId}`),
    enabled: Boolean(appointmentId),
    refetchInterval: 5000
  });
}

export function useChatThreads() {
  return useQuery({
    queryKey: ["chat", "threads"],
    queryFn: () => apiFetch<ChatThreadSummary[]>("/chats"),
    refetchInterval: 8000
  });
}

export function useReviews(lawyerId: string) {
  return useQuery({
    queryKey: ["reviews", lawyerId],
    queryFn: () => apiFetch<Review[]>(`/reviews/lawyers/${lawyerId}`),
    enabled: Boolean(lawyerId)
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      apiFetch<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body), auth: false })
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (body: {
      role: "CLIENT" | "LAWYER";
      username: string;
      email: string;
      phone_number: string;
      password: string;
    }) => apiFetch<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(body), auth: false })
  });
}

export function useCheckout() {
  return useMutation({
    mutationFn: (body: { lawyer_id: string; category_id: string; date_time: string; provider: string }) =>
      apiFetch<CheckoutResponse>("/payments/checkout", { method: "POST", body: JSON.stringify(body) })
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) =>
      apiFetch(`/payments/${paymentId}/confirm`, { method: "POST", body: JSON.stringify({ mock_success: true }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["chat"] });
    }
  });
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { thread_id: string; appointment_id: string; text: string }) =>
      apiFetch<ChatMessage>(`/chats/${body.thread_id}/messages`, {
        method: "POST",
        body: JSON.stringify({ body: body.text })
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chat", variables.appointment_id] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    }
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { appointment_id: string; rating: number; text: string }) =>
      apiFetch<Review>("/reviews", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    }
  });
}
