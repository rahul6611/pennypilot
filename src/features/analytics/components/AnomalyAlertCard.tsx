import React from 'react';
import { Card } from '../../../components/common/Card';
import { AnomalyAlert } from '../services/anomalyDetector';
import { formatCurrency } from '../../../finance/currencyFormatter';
import { AlertTriangle, Check, Eye } from 'lucide-react';

export interface AnomalyAlertCardProps {
  alerts: AnomalyAlert[];
  currency: string;
  onDismissAlert?: (id: string) => void;
}

export const AnomalyAlertCard: React.FC<AnomalyAlertCardProps> = ({
  alerts,
  currency,
  onDismissAlert
}) => {
  if (alerts.length === 0) return null;

  return (
    <Card variant="glass" className="space-y-3 border-amber-500/30 bg-amber-500/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h3 className="text-sm font-bold text-slate-100">Spending Anomaly Detected</h3>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
          {alerts.length} Flagged
        </span>
      </div>

      <div className="space-y-2.5">
        {alerts.map((alert) => (
          <div
            key={alert.expenseId}
            className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100">{alert.merchant}</span>
                <span className="font-extrabold text-amber-400">
                  {formatCurrency(alert.amount, currency)}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">{alert.message}</p>
            </div>

            {onDismissAlert && (
              <button
                onClick={() => onDismissAlert(alert.expenseId)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Mark as normal"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
