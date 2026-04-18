export type CurrencyCode = "ILS" | "EUR" | "USD";

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  ILS: "₪",
  EUR: "€",
  USD: "$",
};

export const PREFERRED_CURRENCY_KEY = "preferredCurrency";
export const RATES_CACHE_KEY = "exchangeRatesCache";
export const RATES_TTL_MS = 24 * 60 * 60 * 1000; // 24 h

export const FALLBACK_RATES_FROM_USD: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  ILS: 3.7,
};

export async function fetchRates(): Promise<Record<CurrencyCode, number>> {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    return {
      USD: 1,
      EUR: data.rates.EUR ?? FALLBACK_RATES_FROM_USD.EUR,
      ILS: data.rates.ILS ?? FALLBACK_RATES_FROM_USD.ILS,
    };
  } catch {
    return FALLBACK_RATES_FROM_USD;
  }
}

// Re-export from context so callers just import from this file
export { useCurrencyContext as useCurrency } from "../context/CurrencyContext";
