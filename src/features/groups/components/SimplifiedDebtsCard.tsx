import React from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { SimplifiedDebt } from '../../../types/group';
import { formatCurrency } from '../../../finance/currencyFormatter';
import { ArrowRight, CheckCircle, Scale } from 'lucide-react';

export interface SimplifiedDebtsCardProps {
  debts: SimplifiedDebt[];
  currency: string;
  currentUserId: string;
  onOpenSettleUp: (debt: SimplifiedDebt) => void;
}

export const SimplifiedDebtsCard: React.FC<SimplifiedDebtsCardProps> = ({
  debts,
  currency,
  currentUserId,
  onOpenSettleUp
}) => {
  return (
    <Card variant="glass" className="space-y-3 border-brand-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">Simplified Debt Plan</h4>
            <p className="text-[11px] text-slate-400">Minimum payments to settle entire group</p>
          </div>
        </div>
      </div>

      {debts.length === 0 ? (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>All group balances are completely settled!</span>
        </div>
      ) : (
        <div className="space-y-2.5 pt-1">
          {debts.map((debt, index) => {
            const isUserDebtor = debt.fromParticipantId === currentUserId;
            const isUserCreditor = debt.toParticipantId === currentUserId;

            return (
              <div
                key={index}
                className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className={`font-semibold ${isUserDebtor ? 'text-rose-400' : 'text-slate-200'}`}>
                    {debt.fromParticipantName}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className={`font-semibold ${isUserCreditor ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {debt.toParticipantName}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-slate-100">
                    {formatCurrency(debt.amount, currency)}
                  </span>
                  {(isUserDebtor || isUserCreditor) && (
                    <Button
                      size="sm"
                      variant={isUserDebtor ? 'gradient' : 'outline'}
                      onClick={() => onOpenSettleUp(debt)}
                    >
                      Settle Up
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
