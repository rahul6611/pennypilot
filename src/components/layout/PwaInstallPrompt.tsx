import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Smartphone, Download, Check } from 'lucide-react';

export interface PwaInstallPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
}

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({
  isOpen,
  onClose,
  onInstall
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Install PennyPilot App"
      subtitle="Add to home screen for native mobile performance & offline tracking"
    >
      <div className="space-y-6 pt-2 text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 to-emerald-400 mx-auto flex items-center justify-center shadow-xl shadow-brand-500/30">
          <Smartphone className="w-8 h-8 text-white" />
        </div>

        <div className="space-y-3 text-left bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Fast 1-tap launch from mobile home screen</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Full offline spending entry & balance calculations</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Standalone full-screen mobile app experience</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Not Now
          </Button>
          <Button variant="gradient" className="flex-1" leftIcon={<Download className="w-4 h-4" />} onClick={onInstall}>
            Install App
          </Button>
        </div>
      </div>
    </Modal>
  );
};
