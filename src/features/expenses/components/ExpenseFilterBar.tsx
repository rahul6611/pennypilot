import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { CATEGORIES, PAYMENT_METHODS } from '../../../config/constants';
import { ExpenseFilter } from '../../../types/expense';
import { Group } from '../../../types/group';

export interface ExpenseFilterBarProps {
  filter: ExpenseFilter;
  onChangeFilter: (filter: ExpenseFilter) => void;
  groups: Group[];
}

export const ExpenseFilterBar: React.FC<ExpenseFilterBarProps> = ({
  filter,
  onChangeFilter,
  groups
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const activeFilterCount =
    (filter.category ? 1 : 0) +
    (filter.groupId ? 1 : 0) +
    (filter.paymentMethod ? 1 : 0) +
    (filter.searchQuery ? 1 : 0);

  const handleReset = () => {
    onChangeFilter({
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
  };

  return (
    <div className="space-y-3">
      {/* Search Input & Toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search expenses, merchants, notes..."
            value={filter.searchQuery}
            onChange={(e) => onChangeFilter({ ...filter, searchQuery: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-100 placeholder-slate-500 pl-10 pr-4 py-2.5 focus:outline-none focus:border-brand-500"
          />
          {filter.searchQuery && (
            <button
              onClick={() => onChangeFilter({ ...filter, searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`p-2.5 rounded-2xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
            showAdvanced || activeFilterCount > 0
              ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Filter className="w-4 h-4" />
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filter Panel */}
      {showAdvanced && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Filter Options</span>
            {activeFilterCount > 0 && (
              <button onClick={handleReset} className="text-brand-400 hover:underline text-[11px]">
                Reset All
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Category Select */}
            <select
              value={filter.category}
              onChange={(e) => onChangeFilter({ ...filter, category: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 p-2 focus:outline-none"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Group Select */}
            <select
              value={filter.groupId}
              onChange={(e) => onChangeFilter({ ...filter, groupId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 p-2 focus:outline-none"
            >
              <option value="">All Groups</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            {/* Payment Method */}
            <select
              value={filter.paymentMethod}
              onChange={(e) => onChangeFilter({ ...filter, paymentMethod: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 p-2 focus:outline-none"
            >
              <option value="">All Payment Modes</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  {pm.label}
                </option>
              ))}
            </select>

            {/* Sorting */}
            <select
              value={filter.sortBy}
              onChange={(e) => onChangeFilter({ ...filter, sortBy: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 p-2 focus:outline-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
