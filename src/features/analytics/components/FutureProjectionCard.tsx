import React from 'react';
import { Card } from '../../../components/common/Card';
import { SpendingProjection } from '../services/spendingPredictor';
import { formatCurrency } from '../../../finance/currencyFormatter';
import { TrendingUp, Target, Clock } from 'lucide-react';

export interface FutureProjectionCardProps {
  projection: SpendingProjection;
  currency: string;
}

export const FutureProjectionCard: React.FC<FutureProjectionCardProps> = ({
  projection,
  currency
}) => {
  return (
    <Card variant="glass" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Month-End Spending Projection</h3>
            <p className="text-[11px] text-slate-400">Based on historical velocity & current month pace</p>
          </div>
        </div>

        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
            projection.statusColor === 'emerald'
              ? 'bg-emerald-500/20 text-emerald-300'
              : projection.statusColor === 'amber'
              ? 'bg-amber-500/20 text-amber-300'
              : 'bg-rose-500/20 text-rose-300'
          }`}
        >
          {projection.statusText}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 pt-1">
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Current Spent</span>
          <span className="text-sm font-extrabold text-white block mt-0.5">
            {formatCurrency(projection.currentSpent, currency, true)}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/70 border border-brand-500/40 text-center">
          <span className="text-[10px] text-brand-300 font-semibold uppercase block">Predicted End</span>
          <span className="text-sm font-extrabold text-brand-300 block mt-0.5">
            {formatCurrency(projection.predictedMonthEnd, currency, true)}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Budget Limit</span>
          <span className="text-sm font-extrabold text-slate-200 block mt-0.5">
            {formatCurrency(projection.monthlyBudget, currency, true)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{projection.remainingDays} days remaining in month</span>
        </div>
        <span>Velocity: {formatCurrency(projection.dailyVelocity, currency)}/day</span>
      </div>
    </Card>
  );
};
