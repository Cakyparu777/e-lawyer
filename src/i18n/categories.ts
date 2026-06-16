export type Locale = "en" | "mn";

export const locale: Locale = "mn";

export function pickLocalized(value: Record<string, string> | undefined, fallback = "") {
  return value?.[locale] || value?.en || fallback;
}
