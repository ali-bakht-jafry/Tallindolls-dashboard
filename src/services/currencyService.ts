// ============================================================
// Agentic Dashboard — Currency Exchange Mock Data Service
// ============================================================

import { delay } from "@/lib/utils";
import type { ExchangeRateData, ExchangeRateHistoryEntry, CurrencyConversion } from "@/types";

function randomBetween(min: number, max: number, decimals = 0): number {
  const val = Math.random() * (max - min) + min;
  return decimals > 0
    ? Math.round(val * 10 ** decimals) / 10 ** decimals
    : Math.round(val);
}

// ---------------------------------------------------------------------------
// 12-month exchange rate history (EUR per 1 USD)
// ---------------------------------------------------------------------------

const rateHistory: ExchangeRateHistoryEntry[] = [
  { month: "2025-07", rate: 0.91 },
  { month: "2025-08", rate: 0.90 },
  { month: "2025-09", rate: 0.89 },
  { month: "2025-10", rate: 0.88 },
  { month: "2025-11", rate: 0.90 },
  { month: "2025-12", rate: 0.91 },
  { month: "2026-01", rate: 0.92 },
  { month: "2026-02", rate: 0.93 },
  { month: "2026-03", rate: 0.92 },
  { month: "2026-04", rate: 0.91 },
  { month: "2026-05", rate: 0.93 },
  { month: "2026-06", rate: 0.92 },
];

// ---------------------------------------------------------------------------
// getCurrentExchangeRate
// ---------------------------------------------------------------------------

export async function getCurrentExchangeRate(): Promise<ExchangeRateData> {
  await delay(randomBetween(200, 400));

  return {
    currentRate: 0.92,
    from: "USD",
    to: "EUR",
    timestamp: new Date().toISOString(),
    history: rateHistory,
  };
}

// ---------------------------------------------------------------------------
// getExchangeRateHistory
// ---------------------------------------------------------------------------

export async function getExchangeRateHistory(): Promise<ExchangeRateHistoryEntry[]> {
  await delay(randomBetween(250, 450));
  return rateHistory;
}

// ---------------------------------------------------------------------------
// convertUsdToEur
// ---------------------------------------------------------------------------

export async function convertUsdToEur(usdAmount: number): Promise<CurrencyConversion> {
  await delay(randomBetween(200, 400));

  const rate = 0.92;
  const eurAmount = Math.round(usdAmount * rate * 100) / 100;

  return {
    usdAmount,
    eurAmount,
    exchangeRate: rate,
    timestamp: new Date().toISOString(),
  };
}
