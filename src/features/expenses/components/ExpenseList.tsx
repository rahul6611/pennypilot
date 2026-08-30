import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { EmptyState } from '../../../components/common/EmptyState';
import { CATEGORIES } from '../../../config/constants';
import { Expense, ExpenseFilter } from '../../../types/expense';
import { Group } from '../../../types/group';
import { formatCurrency } from '../../../finance/currencyFormatter';
import { ExpenseFilterBar } from './ExpenseFilterBar';
import { Receipt, Users, Utensils, ShoppingBag, Car, Film, HeartPulse, Plane, ShoppingCart, MoreHorizontal, Trash2 } from 'lucide-react';

export interface ExpenseListProps {
  expenses: Expense[];
  groups: Group[];
  currency: string;
  onDeleteExpense?: (id: string) => void;
  onSelectExpense?: (expense: Expense) => void;
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

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  groups,
  currency,
  onDeleteExpense,
  onSelectExpense
}) => {
  const [filter, setFilter] = useState<ExpenseFilter>({
    searchQuery: '',
    category: '',
    groupId: '',
    paymentMethod: '',
    startDate: '',
    endDate: '',
    minAmount: null,
    maxAmount: null,
    sortBy: 'date-desc'
  });

  // Apply filters
  const filtered = expenses.filter((e) => {
    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      const matchDesc = e.description.toLowerCase().includes(q);
      const matchNotes = e.notes ? e.notes.toLowerCase().includes(q) : false;
      const matchPayer = e.paidByName.toLowerCase().includes(q);
      if (!matchDesc && !matchNotes && !matchPayer) return false;
    }
    if (filter.category && e.category !== filter.category) return false;
    if (filter.groupId && e.groupId !== filter.groupId) return false;
    if (filter.paymentMethod && e.paymentMethod !== filter.paymentMethod) return false;
    return true;
  });

  // Apply sorting
  const sorted = [...filtered].sort((a, b) => {
    if (filter.sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (filter.sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (filter.sortBy === 'amount-desc') return b.amount - a.amount;
    if (filter.sortBy === 'amount-asc') return a.amount - b.amount;
    return 0;
  });

  return (
    <div className="space-y-4">
      <ExpenseFilterBar filter={filter} onChangeFilter={setFilter} groups={groups} />

      {sorted.length === 0 ? (
        <EmptyState
          icon={<Receipt className="w-8 h-8" />}
          title="No expenses found"
          description="Try broadening your search filters or add a new expense."
        />
      ) : (
        <div className="space-y-2.5">
          {sorted.map((expense) => {
            const catObj = CATEGORIES.find((c) => c.id === expense.category) || CATEGORIES[8];
            const IconComp = iconMap[catObj.icon] || MoreHorizontal;

            return (
              <Card
                key={expense.id}
                variant="default"
                className="p-3.5 flex items-center justify-between hover:border-slate-700 transition-colors cursor-pointer group"
                onClick={() => onSelectExpense && onSelectExpense(expense)}
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
                      <span>•</span>
                      <span>Paid by {expense.paidByName}</span>
                      {expense.groupName && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300">
                          <Users className="w-2.5 h-2.5" />
                          {expense.groupName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-100 block">
                      {formatCurrency(expense.amount, currency)}
                    </span>
                    <span className="text-[11px] text-slate-400 uppercase tracking-tight">
                      {expense.paymentMethod}
                    </span>
                  </div>

                  {onDeleteExpense && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteExpense(expense.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
