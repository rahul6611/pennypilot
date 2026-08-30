import React from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Group, MemberBalance, SimplifiedDebt } from '../../../types/group';
import { Expense } from '../../../types/expense';
import { Settlement } from '../../../types/settlement';
import { formatCurrency } from '../../../finance/currencyFormatter';
import { SimplifiedDebtsCard } from './SimplifiedDebtsCard';
import { ArrowLeft, Users, Plus, Receipt } from 'lucide-react';

export interface GroupDetailViewProps {
  group: Group;
  expenses: Expense[];
  settlements: Settlement[];
  memberBalances: MemberBalance[];
  simplifiedDebts: SimplifiedDebt[];
  currency: string;
  currentUserId: string;
  onBack: () => void;
  onOpenAddExpense: () => void;
  onOpenSettleUp: (debt: SimplifiedDebt) => void;
}

export const GroupDetailView: React.FC<GroupDetailViewProps> = ({
  group,
  expenses,
  memberBalances,
  simplifiedDebts,
  currency,
  currentUserId,
  onBack,
  onOpenAddExpense,
  onOpenSettleUp
}) => {
  const groupExpenses = expenses.filter((e) => e.groupId === group.id);
  const totalGroupSpent = groupExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-5">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Groups</span>
        </button>

        <Button variant="gradient" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={onOpenAddExpense}>
          Add Group Expense
        </Button>
      </div>

      {/* Group Header Card */}
      <Card variant="glow" className="relative overflow-hidden bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 capitalize inline-block mb-1.5">
              {group.category} Group
            </span>
            <h2 className="text-2xl font-extrabold text-white">{group.name}</h2>
            {group.description && <p className="text-xs text-slate-400 mt-1">{group.description}</p>}
          </div>

          <div className="sm:text-right bg-slate-950/60 p-3 rounded-2xl border border-slate-800 shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Group Spend
            </span>
            <span className="text-2xl font-extrabold text-emerald-400 block mt-0.5">
              {formatCurrency(totalGroupSpent, currency)}
            </span>
          </div>
        </div>
      </Card>

      {/* Simplified Debt Solver Plan */}
      <SimplifiedDebtsCard
        debts={simplifiedDebts}
        currency={currency}
        currentUserId={currentUserId}
        onOpenSettleUp={onOpenSettleUp}
      />

      {/* Member Balances Grid */}
      <Card variant="default">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-400" /> Member Standings
          </h3>
          <span className="text-xs text-slate-400">{memberBalances.length} members</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {memberBalances.map((mb) => {
            const isPositive = mb.netBalance > 0.01;
            const isNegative = mb.netBalance < -0.01;
            const isCurrentUser = mb.participantId === currentUserId;

            return (
              <div
                key={mb.participantId}
                className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-800 font-bold text-xs text-slate-200 flex items-center justify-center border border-slate-700">
                    {mb.participantName.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-100 block">
                      {mb.participantName} {isCurrentUser && '(You)'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isPositive ? 'gets back' : isNegative ? 'owes group' : 'settled up'}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-sm font-extrabold ${
                    isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-slate-400'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {formatCurrency(mb.netBalance, currency)}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Group Expenses Feed */}
      <Card variant="default">
        <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-brand-400" /> Group Expenses Feed
        </h3>

        {groupExpenses.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No expenses in this group yet.</p>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {groupExpenses.map((expense) => (
              <div key={expense.id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">{expense.description}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {expense.date} • Paid by <span className="text-slate-200 font-medium">{expense.paidByName}</span>
                  </p>
                </div>
                <span className="text-sm font-extrabold text-white">
                  {formatCurrency(expense.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
