import React from 'react';
import { Card } from '../../../components/common/Card';
import { Expense } from '../../../types/expense';
import { CATEGORIES } from '../../../config/constants';
import { formatCurrency } from '../../../finance/currencyFormatter';
import { detectAnomalies } from '../services/anomalyDetector';
import { predictMonthEndSpending } from '../services/spendingPredictor';
import { AnomalyAlertCard } from './AnomalyAlertCard';
import { FutureProjectionCard } from './FutureProjectionCard';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

export interface AnalyticsViewProps {
  expenses: Expense[];
  monthlyBudget: number;
  currency: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  expenses,
  monthlyBudget,
  currency
}) => {
  const anomalies = detectAnomalies(expenses);
  const projection = predictMonthEndSpending(expenses, monthlyBudget);

  // Calculate daily spending totals for chart visualization
  const dailyTotals: Record<string, number> = {};
  expenses.slice(0, 14).forEach((e) => {
    dailyTotals[e.date] = (dailyTotals[e.date] || 0) + e.amount;
  });

  const dailySorted = Object.entries(dailyTotals)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-7);

  const maxDaily = Math.max(...dailySorted.map((d) => d[1]), 1000);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-100">Financial Analytics & Forecasts</h2>
        <p className="text-xs text-slate-400">Velocity predictions, anomaly alerts & spending trends</p>
      </div>

      {/* Spending Anomaly Card */}
      <AnomalyAlertCard alerts={anomalies} currency={currency} />

      {/* Spending Projection Card */}
      <FutureProjectionCard projection={projection} currency={currency} />

      {/* Daily Velocity Chart */}
      <Card variant="glass" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Recent Daily Velocity</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Last 7 Days</span>
        </div>

        <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2">
          {dailySorted.map(([dateStr, amt]) => {
            const heightPct = Math.min(100, Math.round((amt / maxDaily) * 100));
            const dayLabel = new Date(dateStr).toLocaleDateString([], { weekday: 'short' });

            return (
              <div key={dateStr} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-bold text-brand-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatCurrency(amt, currency, true)}
                </span>
                <div className="w-full bg-slate-800 rounded-t-xl overflow-hidden flex items-end h-full max-h-[100px]">
                  <div
                    className="w-full bg-gradient-to-t from-brand-600 to-emerald-400 rounded-t-xl transition-all duration-500"
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{dayLabel}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
