import React from 'react';
import { Search, Sparkles, WifiOff, RefreshCw, Wallet, Download, LogIn, User as UserIcon } from 'lucide-react';
import { Badge } from '../common/Badge';
import { UserProfile } from '../../types/user';

export interface HeaderProps {
  isOffline: boolean;
  onOpenSearch: () => void;
  onOpenInstallPrompt: () => void;
  canInstallPwa: boolean;
  onRefreshData?: () => void;
  currency: string;
  user: UserProfile;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOffline,
  onOpenSearch,
  onOpenInstallPrompt,
  canInstallPwa,
  onRefreshData,
  currency,
  user,
  onOpenAuthModal
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 pt-safe pb-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Mobile Brand */}
        <div className="flex items-center gap-2.5 md:hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-md shadow-brand-500/20">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              PennyPilot
            </span>
          </div>
        </div>

        {/* Desktop left title placeholder */}
        <div className="hidden md:flex items-center gap-3">
          <Badge variant="brand" icon={<Sparkles className="w-3.5 h-3.5" />}>
            Fintech 2026 Edition
          </Badge>
          <span className="text-xs font-semibold text-slate-400">Currency: {currency} (₹)</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {isOffline && (
            <Badge variant="warning" icon={<WifiOff className="w-3.5 h-3.5" />}>
              Offline
            </Badge>
          )}

          {canInstallPwa && (
            <button
              onClick={onOpenInstallPrompt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-semibold hover:bg-brand-500/25 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}

          <button
            onClick={onOpenSearch}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label="Search Expenses"
          >
            <Search className="w-5 h-5" />
          </button>

          {onRefreshData && (
            <button
              onClick={onRefreshData}
              className="p-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              title="Refresh Data"
              aria-label="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {/* User Auth Pill Button */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold hover:border-brand-500/40 transition-colors"
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="w-5 h-5 rounded-full" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                {user.displayName.charAt(0)}
              </div>
            )}
            <span className="max-w-[80px] truncate hidden sm:inline">{user.displayName}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
