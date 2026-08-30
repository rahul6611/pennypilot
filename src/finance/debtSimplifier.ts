import { Expense } from '../types/expense';
import { GroupMember, MemberBalance, SimplifiedDebt } from '../types/group';
import { Settlement } from '../types/settlement';

export function calculateGroupBalances(
  members: GroupMember[],
  expenses: Expense[],
  settlements: Settlement[] = []
): MemberBalance[] {
  const balanceMap: Record<string, number> = {};

  members.forEach((m) => {
    balanceMap[m.id] = 0;
  });

  // 1. Process Expenses
  expenses.forEach((expense) => {
    const payerId = expense.paidBy;
    const totalAmount = expense.amount;

    if (balanceMap[payerId] !== undefined) {
      balanceMap[payerId] += totalAmount;
    }

    expense.splits.forEach((split) => {
      if (balanceMap[split.participantId] !== undefined) {
        balanceMap[split.participantId] -= split.amount;
      }
    });
  });

  // 2. Process Settlements (A pays B $100 -> A's balance increases by 100, B's balance decreases by 100)
  settlements.forEach((s) => {
    if (balanceMap[s.fromParticipantId] !== undefined) {
      balanceMap[s.fromParticipantId] += s.amount;
    }
    if (balanceMap[s.toParticipantId] !== undefined) {
      balanceMap[s.toParticipantId] -= s.amount;
    }
  });

  return members.map((m) => ({
    participantId: m.id,
    participantName: m.name,
    netBalance: Math.round((balanceMap[m.id] || 0) * 100) / 100
  }));
}

/**
 * Greedy Minimum Cash Flow Algorithm to simplify group debts into minimum transactions.
 */
export function simplifyDebts(memberBalances: MemberBalance[]): SimplifiedDebt[] {
  // Filter members with non-zero balances
  const creditors: { id: string; name: string; amount: number }[] = [];
  const debtors: { id: string; name: string; amount: number }[] = [];

  memberBalances.forEach((mb) => {
    const rounded = Math.round(mb.netBalance * 100) / 100;
    if (rounded > 0.01) {
      creditors.push({ id: mb.participantId, name: mb.participantName, amount: rounded });
    } else if (rounded < -0.01) {
      debtors.push({ id: mb.participantId, name: mb.participantName, amount: Math.abs(rounded) });
    }
  });

  // Sort descending by amount
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const simplified: SimplifiedDebt[] = [];
  let cIdx = 0;
  let dIdx = 0;

  while (cIdx < creditors.length && dIdx < debtors.length) {
    const creditor = creditors[cIdx];
    const debtor = debtors[dIdx];

    const settledAmount = Math.min(creditor.amount, debtor.amount);
    const roundedSettled = Math.round(settledAmount * 100) / 100;

    if (roundedSettled > 0.01) {
      simplified.push({
        fromParticipantId: debtor.id,
        fromParticipantName: debtor.name,
        toParticipantId: creditor.id,
        toParticipantName: creditor.name,
        amount: roundedSettled
      });
    }

    creditor.amount = Math.round((creditor.amount - settledAmount) * 100) / 100;
    debtor.amount = Math.round((debtor.amount - settledAmount) * 100) / 100;

    if (creditor.amount <= 0.01) {
      cIdx++;
    }
    if (debtor.amount <= 0.01) {
      dIdx++;
    }
  }

  return simplified;
}
