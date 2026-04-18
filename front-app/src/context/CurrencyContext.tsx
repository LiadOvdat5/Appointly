import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { CurrencyCode } from "../hooks/useCurrency";
import { FALLBACK_RATES_FROM_USD, PREFERRED_CURRENCY_KEY, RATES_CACHE_KEY, RATES_TTL_MS, fetchRates } from "../hooks/useCurrency";

interface RatesCache {
  base: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  fetchedAt: number;
}

function readCache(): RatesCache | null {
  try {
    const raw = localStorage.getItem(RATES_CACHE_KEY);
    if (!raw) return null;
    const parsed: RatesCache = JSON.parse(raw);
    if (Date.now() - parsed.fetchedAt > RATES_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(cache: RatesCache) {
  try {
    localStorage.setItem(RATES_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore quota errors
  }
}

interface CurrencyContextValue {
  preferredCurrency: CurrencyCode;
  setPreferredCurrency: (c: CurrencyCode) => void;
  rates: Record<CurrencyCode, number>;
  convert: (amount: number, from: CurrencyCode, to: CurrencyCode) => number;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [preferredCurrency, setPreferredCurrencyState] = useState<CurrencyCode>(
    () => (localStorage.getItem(PREFERRED_CURRENCY_KEY) as CurrencyCode) ?? "ILS",
  );

  const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES_FROM_USD);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setRates(cached.rates);
      return;
    }
    fetchRates().then((fetched) => {
      setRates(fetched);
      writeCache({ base: "USD", rates: fetched, fetchedAt: Date.now() });
    });
  }, []);

  const setPreferredCurrency = useCallback((currency: CurrencyCode) => {
    localStorage.setItem(PREFERRED_CURRENCY_KEY, currency);
    setPreferredCurrencyState(currency);
  }, []);

  const convert = useCallback(
    (amount: number, from: CurrencyCode, to: CurrencyCode): number => {
      if (from === to) return amount;
      const inUsd = amount / rates[from];
      return inUsd * rates[to];
    },
    [rates],
  );

  return (
    <CurrencyContext.Provider value={{ preferredCurrency, setPreferredCurrency, rates, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrencyContext(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrencyContext must be used inside CurrencyProvider");
  return ctx;
}
