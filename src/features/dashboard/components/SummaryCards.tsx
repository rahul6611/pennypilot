import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Wallet, Scale } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { UserFinancialOverview } from '../../../finance/balanceCalculator';
import { formatCurrency } from '../../../finance/currencyFormatter';

export interface SummaryCardsProps {
  overview: UserFinancialOverview;
  monthlyBudget: number;
  currency: string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  overview,
  monthlyBudget,
  currency
}) => {
  const budgetPct = Math.min(100, Math.round((overview.totalSpentThisMonth / monthlyBudget) * 100));

  return (
    <div className="space-y-4">
      {/* Main Hero Card - Total Monthly Spending */}
      <Card variant="glow" className="overflow-hidden relative bg-gradient-to-br from-slate-900 via-slate-900/90 to-brand-950/40 border-brand-500/30">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Spent This Month
            </span>
          </div>

          <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
            overview.spendingChangePct >= 0 ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'
          }`}>
            {overview.spendingChangePct >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{Math.abs(overview.spendingChangePct)}% vs last month</span>
          </div>
        </div>

        <div className="my-3">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {formatCurrency(overview.totalSpentThisMonth, currency)}
          </span>
        </div>

        {/* Budget Progress Bar */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-400">Monthly Budget</span>
            <span className="text-slate-200 font-semibold">
              {formatCurrency(overview.totalSpentThisMonth, currency)} / {formatCurrency(monthlyBudget, currency)}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${budgetPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                budgetPct > 90 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-brand-500 to-emerald-400'
              }`}
            />
          </div>
        </div>
      </Card>

      {/* 3 Grid Mini Balance Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* You Owe */}
        <Card variant="glass" className="p-3.5 text-center">
          <div className="flex justify-center mb-1 text-rose-400">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">You Owe</span>
          <span className="text-base sm:text-lg font-bold text-rose-400 block mt-0.5">
            {formatCurrency(overview.youOwe, currency, true)}
          </span>
        </Card>

        {/* You are Owed */}
        <Card variant="glass" className="p-3.5 text-center">
          <div className="flex justify-center mb-1 text-emerald-400">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">You are Owed</span>
          <span className="text-base sm:text-lg font-bold text-emerald-400 block mt-0.5">
            {formatCurrency(overview.youAreOwed, currency, true)}
          </span>
        </Card>

        {/* Net Balance */}
        <Card variant="glass" className="p-3.5 text-center">
          <div className="flex justify-center mb-1 text-indigo-400">
            <Scale className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Net Balance</span>
          <span className={`text-base sm:text-lg font-bold block mt-0.5 ${
            overview.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {overview.netBalance >= 0 ? '+' : ''}{formatCurrency(overview.netBalance, currency, true)}
          </span>
        </Card>
      </div>
    </div>
  );
};
