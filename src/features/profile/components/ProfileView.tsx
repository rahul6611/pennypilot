import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Modal } from '../../../components/common/Modal';
import { CURRENCIES } from '../../../config/constants';
import { UserProfile } from '../../../types/user';
import { User, Shield, CreditCard, Trash2, LogOut, Sparkles, AlertTriangle } from 'lucide-react';

export interface ProfileViewProps {
  user: UserProfile;
  onUpdateCurrency: (currency: string) => void;
  onUpdateBudget: (budget: number) => void;
  onDeleteAccount: () => void;
  onResetDemoData: () => void;
  onClearData?: () => void;
  onLogout?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateCurrency,
  onUpdateBudget,
  onDeleteAccount,
  onResetDemoData,
  onClearData,
  onLogout
}) => {
  const [budgetInput, setBudgetInput] = useState(user.monthlyBudget.toString());
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) {
      onUpdateBudget(val);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-100">Account & Preferences</h2>
        <p className="text-xs text-slate-400">Manage currency, budget thresholds & data privacy</p>
      </div>

      {/* User Card */}
      <Card variant="glow" className="flex items-center justify-between gap-4 bg-slate-900">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 font-bold text-xl text-white flex items-center justify-center shadow-lg">
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white">{user.displayName}</h3>
              {user.isDemoUser && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300">
                  Demo Account
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user.email || 'guest@pennypilot.app'}</p>
          </div>
        </div>

        {onLogout && (
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:text-white"
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            Log Out
          </Button>
        )}
      </Card>

      {/* Currency & Budget Preferences */}
      <Card variant="glass" className="space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-brand-400" /> Financial Settings
        </h3>

        <div className="space-y-3">
          {/* Currency */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Default Currency</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {CURRENCIES.map((c) => (
                <button
                  type="button"
                  key={c.code}
                  onClick={() => onUpdateCurrency(c.code)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center transition-all ${
                    user.currency === c.code
                      ? 'border-brand-500 bg-brand-500/20 text-white shadow-md'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm font-extrabold">{c.symbol}</span>
                  <span className="text-[10px]">{c.code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Monthly Budget Form */}
          <form onSubmit={handleBudgetSubmit} className="space-y-2 pt-2 border-t border-slate-800">
            <Input
              label="Monthly Spending Target"
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
            />
            <Button type="submit" variant="secondary" size="sm">
              Save Budget Limit
            </Button>
          </form>
        </div>
      </Card>

      {/* Reset & Privacy Actions */}
      <Card variant="glass" className="space-y-3 border-rose-500/20">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-rose-400" /> Data Privacy & Reset
        </h3>

        <div className="space-y-2 pt-1">
          {onClearData && (
            <Button variant="outline" className="w-full text-xs justify-start border-slate-700 hover:bg-slate-800" onClick={onClearData}>
              Clear All Data & Start Fresh (₹0)
            </Button>
          )}

          <Button variant="outline" className="w-full text-xs justify-start" onClick={onResetDemoData}>
            Load Sample Demo Dataset
          </Button>

          <Button
            variant="danger"
            className="w-full text-xs justify-start"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete My Account & Erase All Data
          </Button>
        </div>
      </Card>

      {/* Account Deletion Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account & Erase Data"
        subtitle="This action is permanent and will wipe all local and cloud stored financial records."
      >
        <div className="space-y-4 pt-2 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-300">
            Are you sure you want to permanently delete your account and reset all stored expenses, groups, and settlements?
          </p>

          <div className="flex gap-3 pt-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => {
                setShowDeleteModal(false);
                onDeleteAccount();
              }}
            >
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
