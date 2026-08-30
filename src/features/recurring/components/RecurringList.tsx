import React from 'react';
import { Card } from '../../../components/common/Card';
import { RecurringExpense } from '../../../types/recurring';
import { formatCurrency } from '../../../finance/currencyFormatter';
import { RefreshCw, Calendar, Sparkles } from 'lucide-react';

export interface RecurringListProps {
  items: RecurringExpense[];
  currency: string;
  onToggleStatus?: (id: string) => void;
}

export const RecurringList: React.FC<RecurringListProps> = ({
  items,
  currency,
  onToggleStatus
}) => {
  const activeItems = items.filter((i) => i.status === 'active');
  const monthlyTotal = activeItems.reduce((sum, item) => sum + item.estimatedAmount, 0);

  return (
    <Card variant="glass" className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Subscription Intelligence</h3>
            <p className="text-xs text-slate-400">Detected recurring billing commitments</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Monthly Commitments</span>
          <span className="text-lg font-extrabold text-purple-300 block">
            {formatCurrency(monthlyTotal, currency)}/mo
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {activeItems.map((item) => {
          const yearlyCost = item.estimatedAmount * 12;

          return (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 font-bold flex items-center justify-center text-xs border border-purple-500/20">
                  {item.merchant.charAt(0)}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-100">{item.merchant}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="capitalize">{item.frequency}</span>
                    <span>•</span>
                    <span>Last seen {item.lastDetectedDate}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-extrabold text-white block">
                  {formatCurrency(item.estimatedAmount, currency)}/mo
                </span>
                <span className="text-[10px] text-slate-500 font-medium block">
                  {formatCurrency(yearlyCost, currency)}/yr
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
