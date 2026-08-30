import { Expense } from '../types/expense';
import { Settlement } from '../types/settlement';

export interface UserFinancialOverview {
  totalSpentThisMonth: number;
  lastMonthSpent: number;
  spendingChangePct: number; // e.g. 12 (%)
  youOwe: number;
  youAreOwed: number;
  netBalance: number;
}

export function computeUserOverview(
  currentUserId: string,
  expenses: Expense[],
  settlements: Settlement[] = []
): UserFinancialOverview {
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Previous month calculation
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthPrefix = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

  let totalSpentThisMonth = 0;
  let lastMonthSpent = 0;
  let youOwe = 0;
  let youAreOwed = 0;

  expenses.forEach((expense) => {
    const isPayer = expense.paidBy === currentUserId;
    const userSplit = expense.splits?.find((s) => s.participantId === currentUserId);
    // If exact split is found, use it. Otherwise, if the user paid or it's a personal expense, use the total amount.
    const userShareAmount = userSplit
      ? userSplit.amount
      : (isPayer || !expense.splits || expense.splits.length === 0 ? expense.amount : 0);

    // Track monthly personal share of spending
    if (expense.date.startsWith(currentMonthPrefix)) {
      totalSpentThisMonth += userShareAmount;
    } else if (expense.date.startsWith(lastMonthPrefix)) {
      lastMonthSpent += userShareAmount;
    }

    // Track debts and credits for non-settlement group/shared expenses
    if (isPayer) {
      // User paid $X for the group. The user is owed (totalAmount - userShareAmount)
      const othersShare = (expense.splits || [])
        .filter((s) => s.participantId !== currentUserId)
        .reduce((sum, s) => sum + s.amount, 0);
      youAreOwed += othersShare;
    } else if (userSplit) {
      // Someone else paid $X. Current user owes userShareAmount
      youOwe += userShareAmount;
    }
  });

  // Adjust debts & credits with settlements
  settlements.forEach((s) => {
    if (s.fromParticipantId === currentUserId) {
      // User settled their debt by paying someone
      youOwe = Math.max(0, youOwe - s.amount);
    } else if (s.toParticipantId === currentUserId) {
      // User received payment from someone
      youAreOwed = Math.max(0, youAreOwed - s.amount);
    }
  });

  const round = (val: number) => Math.round(val * 100) / 100;
  totalSpentThisMonth = round(totalSpentThisMonth);
  lastMonthSpent = round(lastMonthSpent);
  youOwe = round(youOwe);
  youAreOwed = round(youAreOwed);
  const netBalance = round(youAreOwed - youOwe);

  let spendingChangePct = 0;
  if (lastMonthSpent > 0) {
    spendingChangePct = round(((totalSpentThisMonth - lastMonthSpent) / lastMonthSpent) * 100);
  } else if (totalSpentThisMonth > 0) {
    spendingChangePct = 100;
  }

  return {
    totalSpentThisMonth,
    lastMonthSpent,
    spendingChangePct,
    youOwe,
    youAreOwed,
    netBalance
  };
}
