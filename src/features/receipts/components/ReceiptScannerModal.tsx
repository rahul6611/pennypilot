import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Camera, Upload, Sparkles, Check } from 'lucide-react';
import { Expense } from '../../../types/expense';

export interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReceipt: (expenseData: Partial<Expense>) => void;
  currencySymbol?: string;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  onConfirmReceipt,
  currencySymbol = '₹'
}) => {
  const [step, setStep] = useState<'upload' | 'scanning' | 'confirm'>('upload');
  const [extractedMerchant, setExtractedMerchant] = useState('');
  const [extractedAmount, setExtractedAmount] = useState('');
  const [extractedDate, setExtractedDate] = useState('');

  const handleSimulateUpload = () => {
    setStep('scanning');
    setTimeout(() => {
      setExtractedMerchant('Starbucks Coffee');
      setExtractedAmount('840');
      setExtractedDate(new Date().toISOString().split('T')[0]);
      setStep('confirm');
    }, 1500);
  };

  const handleSave = () => {
    onConfirmReceipt({
      description: extractedMerchant,
      amount: parseFloat(extractedAmount) || 0,
      category: 'food',
      date: extractedDate,
      paymentMethod: 'upi',
      splitType: 'exact'
    });
    setStep('upload');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Scan Bill / Receipt"
      subtitle="Extract merchant, total, tax & line items from receipt photos"
    >
      {step === 'upload' && (
        <div className="space-y-4 pt-2 text-center">
          <div
            onClick={handleSimulateUpload}
            className="border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-3xl p-8 cursor-pointer bg-slate-950/60 transition-all flex flex-col items-center justify-center space-y-3"
          >
            <div className="p-4 rounded-full bg-brand-500/20 text-brand-400">
              <Camera className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100">Upload or snap receipt photo</p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG, HEIC up to 10MB</p>
            </div>
            <Button variant="gradient" size="sm" leftIcon={<Upload className="w-4 h-4" />}>
              Select Receipt Image
            </Button>
          </div>
        </div>
      )}

      {step === 'scanning' && (
        <div className="py-12 text-center space-y-3">
          <Sparkles className="w-10 h-10 animate-spin text-brand-400 mx-auto" />
          <h3 className="text-base font-extrabold text-white">Extracting Receipt Data...</h3>
          <p className="text-xs text-slate-400">Analyzing line items, taxes and totals.</p>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-4 pt-1">
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>OCR Extraction complete! Review and edit values before saving.</span>
          </div>

          <Input
            label="Extracted Merchant"
            value={extractedMerchant}
            onChange={(e) => setExtractedMerchant(e.target.value)}
          />

          <Input
            label="Extracted Amount"
            type="number"
            prefixSymbol={currencySymbol}
            value={extractedAmount}
            onChange={(e) => setExtractedAmount(e.target.value)}
          />

          <Input
            label="Receipt Date"
            type="date"
            value={extractedDate}
            onChange={(e) => setExtractedDate(e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep('upload')}>
              Re-scan
            </Button>
            <Button variant="gradient" className="flex-1" onClick={handleSave}>
              Save Expense
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
