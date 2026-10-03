import { Expense } from '../../../types/expense';

export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTH_FULL_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Month index = year * 12 + month (0-based), so month arithmetic is a plain +/- 1.
export const toMonthIndex = (dateStr: string): number => {
  const [y, m] = dateStr.split('-').map(Number);
  return y * 12 + (m - 1);
};

export const monthLabel = (idx: number, withYear = false): string => {
  const name = MONTH_NAMES[idx % 12];
  return withYear ? `${name} ${Math.floor(idx / 12)}` : name;
};

export const sumAmount = (list: Expense[] = []): number => list.reduce((s, e) => s + e.amount, 0);

export const groupByMonth = (expenses: Expense[]): Record<number, Expense[]> => {
  const byMonth: Record<number, Expense[]> = {};
  expenses.forEach((e) => {
    if (!e.date) return;
    const idx = toMonthIndex(e.date);
    (byMonth[idx] = byMonth[idx] || []).push(e);
  });
  return byMonth;
};
