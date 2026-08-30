import { Expense } from '../../../types/expense';

export interface SpendingProjection {
  currentSpent: number;
  predictedMonthEnd: number;
  monthlyBudget: number;
  dailyVelocity: number;
  remainingDays: number;
  statusText: 'Likely within budget' | 'Likely to exceed budget' | 'Budget severely exceeded';
  statusColor: 'emerald' | 'amber' | 'rose';
}

export function predictMonthEndSpending(expenses: Expense[], monthlyBudget: number): SpendingProjection {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  const thisMonthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthPrefix));
  const currentSpent = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const currentDay = now.getDate();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const remainingDays = totalDaysInMonth - currentDay;

  const dailyVelocity = currentSpent / Math.max(1, currentDay);
  const predictedMonthEnd = Math.round(currentSpent + dailyVelocity * remainingDays);

  let statusText: 'Likely within budget' | 'Likely to exceed budget' | 'Budget severely exceeded' = 'Likely within budget';
  let statusColor: 'emerald' | 'amber' | 'rose' = 'emerald';

  if (predictedMonthEnd > monthlyBudget * 1.15) {
    statusText = 'Budget severely exceeded';
    statusColor = 'rose';
  } else if (predictedMonthEnd > monthlyBudget) {
    statusText = 'Likely to exceed budget';
    statusColor = 'amber';
  }

  return {
    currentSpent: Math.round(currentSpent),
    predictedMonthEnd,
    monthlyBudget,
    dailyVelocity: Math.round(dailyVelocity),
    remainingDays,
    statusText,
    statusColor
  };
}
