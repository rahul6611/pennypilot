import React from 'react';
import { Card } from '../../../components/common/Card';
import { Expense } from '../../../types/expense';
import { CATEGORIES } from '../../../config/constants';
import { formatCurrency } from '../../../finance/currencyFormatter';
import { ArrowRight, Utensils, ShoppingBag, Car, Receipt, Film, HeartPulse, Plane, ShoppingCart, MoreHorizontal, Users } from 'lucide-react';

export interface SpendingOverviewProps {
  expenses: Expense[];
  currency: string;
  onViewAllExpenses: () => void;
  onSelectExpense: (expense: Expense) => void;
  onOpenAddExpense?: () => void;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Utensils,
  ShoppingBag,
  Car,
  Receipt,
  Film,
  HeartPulse,
  Plane,
  ShoppingCart,
  MoreHorizontal
};

export const SpendingOverview: React.FC<SpendingOverviewProps> = ({
  expenses,
  currency,
  onViewAllExpenses,
  onSelectExpense,
  onOpenAddExpense
}) => {
  // Category totals
  const categoryTotals: Record<string, number> = {};
  let monthTotal = 0;

  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    monthTotal += e.amount;
  });

  const sortedCategories = CATEGORIES.map((cat) => ({
    ...cat,
    amount: categoryTotals[cat.id] || 0,
    pct: monthTotal > 0 ? Math.round(((categoryTotals[cat.id] || 0) / monthTotal) * 100) : 0
  })).sort((a, b) => b.amount - a.amount);

  const topCategories = sortedCategories.filter((c) => c.amount > 0).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Category Spending Breakdown */}
      <Card variant="default">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-100">Top Spending Categories</h3>
          <span className="text-xs text-slate-400 font-medium">{topCategories.length} categories active</span>
        </div>

        {topCategories.length === 0 ? (
          <div className="py-6 text-center space-y-1">
            <p className="text-xs font-semibold text-slate-300">No category spending recorded yet</p>
            <p className="text-[11px] text-slate-400">All amounts start at {formatCurrency(0, currency)}. Add an expense to see your category breakdown.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topCategories.map((cat) => {
              const IconComp = iconMap[cat.icon] || MoreHorizontal;
              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-100"
                        style={{ backgroundColor: cat.bg, color: cat.color }}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-slate-200">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-100 font-bold">{formatCurrency(cat.amount, currency)}</span>
                      <span className="text-slate-500 text-[11px] ml-1">({cat.pct}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Recent Transactions List */}
      <Card variant="default">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-100">Recent Transactions</h3>
          <button
            onClick={onViewAllExpenses}
            className="flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">No transactions recorded yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Start by adding your first expense to build your timeline.</p>
            </div>
            {onOpenAddExpense && (
              <button
                onClick={onOpenAddExpense}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                + Add First Expense
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {[...expenses]
              .sort((a, b) => {
                const timeA = new Date(a.createdAt || a.date).getTime();
                const timeB = new Date(b.createdAt || b.date).getTime();
                if (timeB !== timeA) return timeB - timeA;
                return b.id.localeCompare(a.id);
              })
              .slice(0, 5)
              .map((expense) => {
              const catObj = CATEGORIES.find((c) => c.id === expense.category) || CATEGORIES[8];
              const IconComp = iconMap[catObj.icon] || MoreHorizontal;

              return (
                <div
                  key={expense.id}
                  onClick={() => onSelectExpense(expense)}
                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 rounded-xl px-2 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: catObj.bg, color: catObj.color }}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100 group-hover:text-brand-300 transition-colors">
                        {expense.description}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{expense.date}</span>
                        {expense.groupName && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300">
                            <Users className="w-2.5 h-2.5" />
                            {expense.groupName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-100 block">
                      {formatCurrency(expense.amount, currency)}
                    </span>
                    <span className="text-[11px] text-slate-400 capitalize">
                      {expense.splitType === 'equal' ? 'Shared' : 'Personal'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
