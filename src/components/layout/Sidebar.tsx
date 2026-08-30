import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Receipt, Plus, Users, BarChart3, User, Wallet } from 'lucide-react';
import { clsx } from 'clsx';
import { NavTab } from './BottomNav';

export interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAddExpense: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddExpense
}) => {
  const items = [
    { id: 'home' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses' as NavTab, label: 'All Expenses', icon: Receipt },
    { id: 'groups' as NavTab, label: 'Split Groups', icon: Users },
    { id: 'analytics' as NavTab, label: 'Spending Charts', icon: BarChart3 },
    { id: 'profile' as NavTab, label: 'My Account', icon: User }
  ];

  return (
    <aside aria-label="Desktop Sidebar" className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-2xl min-h-screen p-4 shrink-0 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-4 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-500/30">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            PennyPilot
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Smart Expense & Splitwise</p>
        </div>
      </div>

      {/* Primary Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onOpenAddExpense}
        className="w-full mb-6 py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
      >
        <Plus className="w-5 h-5" />
        <span>+ Add Expense</span>
      </motion.button>

      {/* Nav List */}
      <nav className="space-y-1.5 flex-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all relative',
                isActive
                  ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              )}
            >
              <Icon className={clsx('w-5 h-5', isActive ? 'text-brand-400' : 'text-slate-400')} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-500 px-3">
        <p className="font-semibold text-slate-400">PennyPilot 2026 PWA</p>
        <p className="text-[11px] mt-0.5">Offline-first & Smart Split</p>
      </div>
    </aside>
  );
};
