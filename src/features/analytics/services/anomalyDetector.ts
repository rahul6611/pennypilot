import { Expense } from '../../../types/expense';

export interface AnomalyAlert {
  expenseId: string;
  merchant: string;
  amount: number;
  category: string;
  multiplier: number; // e.g. 3.2x
  averageAmount: number;
  message: string;
  date: string;
  status: 'active' | 'ignored' | 'normal';
}

export function detectAnomalies(expenses: Expense[]): AnomalyAlert[] {
  if (expenses.length < 5) return [];

  // Group amounts by category
  const categoryStats: Record<string, { amounts: number[]; sum: number }> = {};

  expenses.forEach((e) => {
    if (!categoryStats[e.category]) {
      categoryStats[e.category] = { amounts: [], sum: 0 };
    }
    categoryStats[e.category].amounts.push(e.amount);
    categoryStats[e.category].sum += e.amount;
  });

  const alerts: AnomalyAlert[] = [];

  expenses.forEach((e) => {
    const stats = categoryStats[e.category];
    if (!stats || stats.amounts.length < 3) return;

    const avg = stats.sum / stats.amounts.length;
    // Standard deviation
    const variance = stats.amounts.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / stats.amounts.length;
    const stdDev = Math.sqrt(variance);

    // Anomaly if amount > avg + 2.0 * stdDev AND amount > avg * 2.2
    if (e.amount > avg + 1.8 * stdDev && e.amount >= avg * 2.0 && e.amount > 2000) {
      const multiplier = Math.round((e.amount / avg) * 10) / 10;
      alerts.push({
        expenseId: e.id,
        merchant: e.description,
        amount: e.amount,
        category: e.category,
        multiplier,
        averageAmount: Math.round(avg),
        message: `This is ${multiplier}× higher than your normal ${e.category} average of ₹${Math.round(avg)}.`,
        date: e.date,
        status: 'active'
      });
    }
  });

  return alerts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
