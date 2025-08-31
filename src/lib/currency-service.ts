import { Currency } from './types';

// Simple currency conversion rates (base: DKK)
const EXCHANGE_RATES = {
  DKK: 1,
  EUR: 0.134,
  USD: 0.146,
  BDT: 16.4,
};

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) return amount;
  
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();
  
  // Convert from source currency to DKK, then to target currency
  const inDKK = amount / (EXCHANGE_RATES[from as keyof typeof EXCHANGE_RATES] || 1);
  const result = inDKK * (EXCHANGE_RATES[to as keyof typeof EXCHANGE_RATES] || 1);
  
  return Math.round(result * 100) / 100;
}

/**
 * Format currency with proper symbol and locale
 */
export function formatCurrency(
  amount: number,
  currency: Currency,
  options?: { showDecimals?: boolean }
): string {
  const showDecimals = options?.showDecimals !== false;
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    const symbols = { DKK: 'kr', EUR: '€', USD: '$' };
    const symbol = symbols[currency] || currency;
    const formatted = showDecimals ? amount.toFixed(2) : Math.round(amount).toString();
    return `${symbol}${formatted.toLocaleString()}`;
  }
}

/**
 * Get supported currencies
 */
export function getSupportedCurrencies(): Currency[] {
  return ['DKK', 'EUR', 'USD'];
}