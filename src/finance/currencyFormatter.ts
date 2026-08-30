import { CURRENCIES } from '../config/constants';

export function formatCurrency(
  amount: number,
  currencyCode: string = 'INR',
  compact: boolean = false
): string {
  const currencyObj = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];
  const symbol = currencyObj.symbol;

  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${symbol}0`;
  }

  const absAmount = Math.abs(amount);
  
  if (compact && absAmount >= 100000) {
    const lakh = absAmount / 100000;
    return `${amount < 0 ? '-' : ''}${symbol}${lakh.toFixed(1)}L`;
  }
  
  if (compact && absAmount >= 1000) {
    const k = absAmount / 1000;
    return `${amount < 0 ? '-' : ''}${symbol}${k.toFixed(1)}k`;
  }

  const formatted = absAmount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });

  return `${amount < 0 ? '-' : ''}${symbol}${formatted}`;
}
