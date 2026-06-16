import Constants from "expo-constants";
import { useAuthStore } from "@/state/authStore";

const extraApiUrl = Constants.expoConfig?.extra?.apiUrl as string | undefined;
export const API_URL = process.env.EXPO_PUBLIC_API_URL || extraApiUrl || "http://localhost:8000/api";

type ApiOptions = RequestInit & {
  auth?: boolean;
};

function parseResponseBody(text: string) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(data: unknown, fallback: string) {
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object" && "detail" in data) {
    const detail = (data as { detail?: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (item && typeof item === "object" && "msg" in item) return String((item as { msg: unknown }).msg);
          return String(item);
        })
        .join("\n");
    }
  }
  return fallback;
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (options.auth !== false && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const text = await response.text();
  const data = parseResponseBody(text);
  if (!response.ok) {
    throw new Error(getErrorMessage(data, `Хүсэлт амжилтгүй боллоо (${response.status})`));
  }
  return data as T;
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: formData
  });
  const text = await response.text();
  const data = parseResponseBody(text);
  if (!response.ok) throw new Error(getErrorMessage(data, `Файл оруулахад алдаа гарлаа (${response.status})`));
  return data as T;
}
