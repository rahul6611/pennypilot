import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { CATEGORIES, PAYMENT_METHODS, SPLIT_TYPES } from '../../../config/constants';
import { Group } from '../../../types/group';
import { Participant } from '../../../types/user';
import { Expense, SplitType } from '../../../types/expense';
import { AIProviderFactory } from '../../ai/providers/AIProviderFactory';
import { Sparkles, Calendar, Tag, Users, Check, AlertCircle } from 'lucide-react';
import { calculateSplits } from '../../../finance/splitCalculator';

export interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expense: Partial<Expense>) => void;
  groups: Group[];
  currentUser: Participant;
  allParticipants: Participant[];
  currencySymbol?: string;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
  groups,
  currentUser,
  allParticipants,
  currencySymbol = '₹'
}) => {
  const [activeMode, setActiveMode] = useState<'manual' | 'ai'>('manual');

  // Manual Form State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [notes, setNotes] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [splitType, setSplitType] = useState<SplitType>('equal');

  // Natural Language State
  const [nlText, setNlText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [aiParsePreview, setAiParsePreview] = useState<string | null>(null);

  // Split Strategy custom inputs state
  const [customExacts, setCustomExacts] = useState<Record<string, number>>({});
  const [customPercentages, setCustomPercentages] = useState<Record<string, number>>({});
  const [customShares, setCustomShares] = useState<Record<string, number>>({});

  // Group members if group selected, otherwise personal currentUser
  const activeGroup = groups.find((g) => g.id === selectedGroupId);
  const currentParticipants = selectedGroupId && activeGroup
    ? activeGroup.members
    : [currentUser];

  // Natural Language Parser Handler
  const handleParseNL = async () => {
    if (!nlText.trim()) return;
    setIsParsing(true);
    try {
      const provider = AIProviderFactory.getProvider();
      const result = await provider.parseNaturalLanguageInput(nlText, currentUser, currentParticipants);

      setAmount(result.amount.toString());
      setDescription(result.merchant);
      setCategory(result.category);
      setSplitType(result.splitType);
      setAiParsePreview(`Parsed: "${result.merchant}" (${currencySymbol}${result.amount}) split ${result.splitType} across ${result.participants.join(', ')}.`);
      setActiveMode('manual');
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !description.trim()) {
      return;
    }

    const calculatedSplits = calculateSplits({
      totalAmount: parsedAmount,
      participants: currentParticipants,
      splitType,
      customExacts,
      customPercentages,
      customShares
    });

    onSaveExpense({
      amount: parsedAmount,
      description,
      category,
      date,
      paymentMethod,
      notes,
      groupId: selectedGroupId || undefined,
      groupName: activeGroup ? activeGroup.name : undefined,
      paidBy: currentUser.id,
      paidByName: currentUser.name,
      splitType,
      splits: calculatedSplits
    });

    // Reset & close
    setAmount('');
    setDescription('');
    setNotes('');
    setAiParsePreview(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Expense"
      subtitle="Fast entry, natural language, and Splitwise group splitting"
      maxWidth="lg"
    >
      <div className="space-y-4 pt-1">
        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveMode('manual')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeMode === 'manual' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Quick Form
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('ai')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeMode === 'ai' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Natural Language AI
          </button>
        </div>

        {/* AI Natural Language Mode */}
        {activeMode === 'ai' && (
          <div className="space-y-3 p-4 rounded-2xl bg-slate-950/70 border border-brand-500/30">
            <label className="block text-xs font-semibold text-brand-300">
              Type in natural language (e.g. "Dinner at Honest 850, me and Rahul 50/50"):
            </label>
            <textarea
              value={nlText}
              onChange={(e) => setNlText(e.target.value)}
              placeholder="Dinner at Honest 850, me and Rahul 50/50..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 min-h-[90px]"
            />
            <Button
              variant="gradient"
              className="w-full"
              isLoading={isParsing}
              leftIcon={<Sparkles className="w-4 h-4" />}
              onClick={handleParseNL}
            >
              Parse Into Form
            </Button>
          </div>
        )}

        {/* AI Parse Preview Banner */}
        {aiParsePreview && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{aiParsePreview}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Large Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Amount ({currencySymbol})
            </label>
            <Input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              prefixSymbol={currencySymbol}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-2xl font-bold text-emerald-400 tracking-tight"
            />
          </div>

          {/* Description / Merchant */}
          <Input
            label="Description / Merchant"
            required
            placeholder="e.g., Honest Restaurant, Uber, Groceries"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                    category === cat.id
                      ? 'border-brand-500 bg-brand-500/20 text-white shadow-md'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="Date"
              leftIcon={<Calendar className="w-4 h-4" />}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl text-slate-100 text-sm px-3 py-3 focus:outline-none focus:border-brand-500"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.id} value={pm.id} className="bg-slate-900">
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Group Assignment & Split Strategy */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-400" /> Group & Split
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Assign to Group</label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 p-2.5 focus:outline-none"
                >
                  <option value="">Personal (No Group)</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.members.length} members)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Split Strategy</label>
                <select
                  value={splitType}
                  onChange={(e) => setSplitType(e.target.value as SplitType)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 p-2.5 focus:outline-none"
                >
                  {SPLIT_TYPES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interactive Split Breakdown Inputs */}
            {currentParticipants.length > 1 && (
              <div className="pt-2 text-xs text-slate-300 border-t border-slate-800/80 space-y-2">
                {splitType === 'equal' && (
                  <p className="text-slate-400">
                    Splitting {currencySymbol}
                    {amount || '0'} equally across {currentParticipants.length} people ({currencySymbol}
                    {(parseFloat(amount || '0') / currentParticipants.length).toFixed(2)} each).
                  </p>
                )}

                {splitType === 'exact' && (
                  <div className="space-y-1.5 pt-1">
                    <span className="block text-[11px] font-semibold text-brand-300">Enter custom amount for each person ({currencySymbol}):</span>
                    {currentParticipants.map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-300 truncate">{p.name}</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={customExacts[p.id] ?? ''}
                          onChange={(e) =>
                            setCustomExacts((prev) => ({
                              ...prev,
                              [p.id]: parseFloat(e.target.value) || 0
                            }))
                          }
                          className="w-24 bg-slate-900 border border-slate-800 rounded-lg text-xs text-right p-1.5 focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {splitType === 'percentage' && (
                  <div className="space-y-1.5 pt-1">
                    <span className="block text-[11px] font-semibold text-brand-300">Enter percentage share for each person (%):</span>
                    {currentParticipants.map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-300 truncate">{p.name}</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            placeholder="0"
                            value={customPercentages[p.id] ?? ''}
                            onChange={(e) =>
                              setCustomPercentages((prev) => ({
                                ...prev,
                                [p.id]: parseFloat(e.target.value) || 0
                              }))
                            }
                            className="w-20 bg-slate-900 border border-slate-800 rounded-lg text-xs text-right p-1.5 focus:border-brand-500 focus:outline-none"
                          />
                          <span className="text-slate-400 text-xs">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {splitType === 'shares' && (
                  <div className="space-y-1.5 pt-1">
                    <span className="block text-[11px] font-semibold text-brand-300">Enter share parts for each person (e.g. 1, 2):</span>
                    {currentParticipants.map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-300 truncate">{p.name}</span>
                        <input
                          type="number"
                          placeholder="1"
                          value={customShares[p.id] ?? 1}
                          onChange={(e) =>
                            setCustomShares((prev) => ({
                              ...prev,
                              [p.id]: parseInt(e.target.value, 10) || 1
                            }))
                          }
                          className="w-20 bg-slate-900 border border-slate-800 rounded-lg text-xs text-right p-1.5 focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {splitType === 'itemized' && (
                  <p className="text-slate-400 text-[11px]">
                    Itemized split divides total amount evenly across selected items per person.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" className="flex-1">
              Save Expense
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
