import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Receipt, Plus, Users, BarChart3, User } from 'lucide-react';
import { clsx } from 'clsx';

export type NavTab = 'home' | 'expenses' | 'groups' | 'analytics' | 'profile';

export interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAddExpense: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddExpense
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: LayoutDashboard },
    { id: 'expenses' as NavTab, label: 'Expenses', icon: Receipt },
    { id: 'add' as const, label: 'Add', icon: Plus, isAction: true },
    { id: 'groups' as NavTab, label: 'Split', icon: Users },
    { id: 'analytics' as NavTab, label: 'Charts', icon: BarChart3 },
    { id: 'profile' as NavTab, label: 'Profile', icon: User }
  ];

  return (
    <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2 pb-safe select-none">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {tabs.map((tab) => {
          if (tab.isAction) {
            return (
              <div key="action-add" className="relative -top-5 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={onOpenAddExpense}
                  className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 via-indigo-500 to-emerald-400 text-white flex items-center justify-center shadow-lg shadow-brand-500/40 ring-4 ring-slate-950 transition-transform"
                  aria-label="Add Expense"
                >
                  <Plus className="w-7 h-7 stroke-[2.5]" />
                </motion.button>
              </div>
            );
          }

          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id as NavTab)}
              className={clsx(
                'flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl min-w-[56px] min-h-[44px] transition-colors relative',
                isActive ? 'text-brand-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Icon className={clsx('w-5 h-5 transition-transform', isActive && 'scale-110')} />
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -bottom-1 w-5 h-1 rounded-full bg-brand-400"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
