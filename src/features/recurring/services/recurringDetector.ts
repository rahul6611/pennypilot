import { Expense } from '../../../types/expense';
import { RecurringExpense } from '../../../types/recurring';

export function detectRecurringExpenses(expenses: Expense[]): RecurringExpense[] {
  const merchantMap: Record<string, { amounts: number[]; dates: string[]; category: string }> = {};

  expenses.forEach((e) => {
    const key = e.description.trim().toLowerCase();
    if (!merchantMap[key]) {
      merchantMap[key] = { amounts: [], dates: [], category: e.category };
    }
    merchantMap[key].amounts.push(e.amount);
    merchantMap[key].dates.push(e.date);
  });

  const recurringList: RecurringExpense[] = [];

  Object.entries(merchantMap).forEach(([merchantKey, data]) => {
    const { amounts, dates, category } = data;
    
    // Explicit known subscription patterns or repeat frequencies
    const knownSubs = ['netflix', 'spotify', 'airtel', 'jio', 'rent', 'gym', 'amazon prime', 'disney+', 'cloud storage', 'youtube premium'];
    const isKnown = knownSubs.some((sub) => merchantKey.includes(sub));

    if (isKnown || amounts.length >= 2) {
      const avgAmount = Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length);
      const formattedMerchant = merchantKey.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

      recurringList.push({
        id: `rec-${merchantKey.replace(/\s+/g, '-')}`,
        merchant: formattedMerchant,
        category,
        estimatedAmount: avgAmount,
        frequency: 'monthly',
        confidence: isKnown ? 0.98 : 0.85,
        lastDetectedDate: dates.sort().reverse()[0] || new Date().toISOString().split('T')[0],
        isConfirmed: true,
        status: 'active'
      });
    }
  });

  return recurringList;
}

export function computeTotalRecurringCommitments(recurringItems: RecurringExpense[]): { monthlyTotal: number; yearlyTotal: number } {
  const active = recurringItems.filter((item) => item.status === 'active');
  const monthlyTotal = active.reduce((sum, item) => {
    if (item.frequency === 'monthly') return sum + item.estimatedAmount;
    if (item.frequency === 'yearly') return sum + Math.round(item.estimatedAmount / 12);
    if (item.frequency === 'weekly') return sum + item.estimatedAmount * 4;
    return sum + item.estimatedAmount;
  }, 0);

  return {
    monthlyTotal,
    yearlyTotal: monthlyTotal * 12
  };
}
