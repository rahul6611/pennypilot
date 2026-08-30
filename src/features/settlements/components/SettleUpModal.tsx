import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { PAYMENT_METHODS } from '../../../config/constants';
import { SimplifiedDebt } from '../../../types/group';
import { SettlementMethod } from '../../../types/settlement';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: SimplifiedDebt | null;
  currency: string;
  onConfirmSettlement: (data: {
    fromParticipantId: string;
    fromParticipantName: string;
    toParticipantId: string;
    toParticipantName: string;
    amount: number;
    paymentMethod: SettlementMethod;
    notes?: string;
  }) => void;
}

export const SettleUpModal: React.FC<SettleUpModalProps> = ({
  isOpen,
  onClose,
  debt,
  currency,
  onConfirmSettlement
}) => {
  const [paymentMethod, setPaymentMethod] = useState<SettlementMethod>('upi');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!debt) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSettlement({
      fromParticipantId: debt.fromParticipantId,
      fromParticipantName: debt.fromParticipantName,
      toParticipantId: debt.toParticipantId,
      toParticipantName: debt.toParticipantName,
      amount: debt.amount,
      paymentMethod,
      notes
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settle Up Debt"
      subtitle="Log a formal payment transaction without modifying historical expense records"
    >
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-extrabold text-white">Settlement Recorded!</h3>
          <p className="text-xs text-slate-400">Debt status updated & transaction logged.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-brand-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="text-rose-400">{debt.fromParticipantName}</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="text-emerald-400">{debt.toParticipantName}</span>
            </div>
            <span className="text-xl font-extrabold text-white">
              {currency} {debt.amount.toLocaleString()}
            </span>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  type="button"
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id as SettlementMethod)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                    paymentMethod === pm.id
                      ? 'border-brand-500 bg-brand-500/20 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Notes (Optional)"
            placeholder="e.g. GPay reference #91823"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex gap-3 pt-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" className="flex-1">
              Confirm Settlement
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
