import React, { useEffect, useState } from 'react';
import { Card } from '../../../components/common/Card';
import { AIReport } from '../../../types/ai';
import { Expense } from '../../../types/expense';
import { formatCurrency } from '../../../finance/currencyFormatter';
import { AIProviderFactory } from '../providers/AIProviderFactory';
import { Sparkles, TrendingUp, Award, Lightbulb, PieChart } from 'lucide-react';

export interface MonthlyReportViewProps {
  expenses: Expense[];
  userBudget: number;
  currency: string;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  expenses,
  userBudget,
  currency
}) => {
  const [report, setReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const provider = AIProviderFactory.getProvider();
        const rep = await provider.generateMonthlyReport(expenses, userBudget, '2026-08');
        setReport(rep);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [expenses, userBudget]);

  if (loading || !report) {
    return (
      <Card variant="glass" className="p-6 text-center text-slate-400">
        <Sparkles className="w-6 h-6 animate-spin mx-auto text-brand-400 mb-2" />
        <p className="text-xs">Generating your monthly intelligence report...</p>
      </Card>
    );
  }

  return (
    <Card variant="glow" className="space-y-4 border-indigo-500/30">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Your Month in Review</h3>
            <p className="text-xs text-slate-400">Executive financial snapshot & actionable insights</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300">
          August 2026
        </span>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold uppercase block">Total Spent</span>
          <span className="text-lg font-bold text-white block mt-0.5">
            {formatCurrency(report.totalSpent, currency)}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold uppercase block">vs Prev Month</span>
          <span className="text-lg font-bold text-amber-400 flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-4 h-4" /> +{report.comparedToLastMonthPct}%
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold uppercase block">Top Category</span>
          <span className="text-lg font-bold text-brand-300 block capitalize mt-0.5">
            {report.topCategory}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold uppercase block">Potential Savings</span>
          <span className="text-lg font-bold text-emerald-400 block mt-0.5">
            {formatCurrency(report.estimatedPotentialSavings.min, currency)}
          </span>
        </div>
      </div>

      {/* Actionable Insights */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-amber-400" /> Actionable Insights
        </h4>

        <div className="space-y-2">
          {report.insights.map((insight, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
              <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                {idx + 1}
              </span>
              <p className="leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
