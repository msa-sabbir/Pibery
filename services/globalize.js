/**
 * Pibery Platform - Global Expansion Engine (Multi-Currency & Multi-Language)
 * Prepares the platform for worldwide launch after dominating the BD market.
 */

const EXCHANGE_RATES = {
  BDT: 1,
  USD: 0.0085, // 1 BDT = ~0.0085 USD (approx)
  EUR: 0.0078,
  GBP: 0.0067,
  INR: 0.71,
};

const SUPPORTED_CURRENCIES = ['BDT', 'USD', 'EUR', 'GBP', 'INR'];

exports.convertCurrency = (amount, fromCurrency = 'BDT', toCurrency = 'USD') => {
  const baseInBdt = amount / (EXCHANGE_RATES[fromCurrency] || 1);
  const converted = baseInBdt * (EXCHANGE_RATES[toCurrency] || 1);
  return Number(converted.toFixed(2));
};

exports.formatPrice = (amount, currency = 'BDT') => {
  const symbols = { BDT: '৳', USD: '$', EUR: '€', GBP: '£', INR: '₹' };
  const symbol = symbols[currency] || currency;
  return `${symbol}${Number(amount).toLocaleString()}`;
};

exports.getSupportedCurrencies = () => SUPPORTED_CURRENCIES;
