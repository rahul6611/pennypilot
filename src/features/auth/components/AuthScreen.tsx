import React, { useState } from 'react';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { signInWithGoogle, loginWithEmail, signupWithEmail } from '../services/authService';
import { UserProfile } from '../../../types/user';
import { Wallet, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export interface AuthScreenProps {
  onSuccess: (user: UserProfile) => void;
  onContinueGuest: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSuccess,
  onContinueGuest
}) => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        onSuccess(user);
      } else {
        onContinueGuest();
      }
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError(null);

    try {
      let user: UserProfile | null = null;
      if (tab === 'login') {
        user = await loginWithEmail(email, password);
      } else {
        if (!displayName.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        user = await signupWithEmail(email, password, displayName);
      }

      if (user) {
        onSuccess(user);
      } else {
        onContinueGuest();
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your details.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please click Log In.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 pt-safe pb-safe sm:p-8 max-w-md mx-auto relative overflow-hidden">
      {/* Glow Backdrop Effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[50%] bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[140%] h-[40%] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="pt-6 text-center space-y-3 z-10">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-emerald-400 mx-auto flex items-center justify-center shadow-xl shadow-brand-500/30 ring-4 ring-slate-900">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            PennyPilot
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            Smart Expense Tracker & Group Splitwise PWA
          </p>
        </div>
      </div>

      {/* Auth Card */}
      <div className="my-auto py-6 space-y-4 z-10">
        {/* Tab Switcher */}
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
              tab === 'login' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
              tab === 'signup' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Auth Button */}
        <Button
          type="button"
          variant="secondary"
          className="w-full justify-center bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-100 py-3"
          isLoading={loading}
          onClick={handleGoogleSignIn}
          leftIcon={
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
          }
        >
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 text-slate-500 my-2">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[10px] uppercase font-semibold">Or email account</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {tab === 'signup' && (
            <Input
              label="Full Name"
              required
              placeholder="e.g. Alex Johnson"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          )}

          <Input
            type="email"
            label="Email Address"
            required
            placeholder="alex@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type="password"
            label="Password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" variant="gradient" className="w-full py-3 text-sm font-semibold" isLoading={loading}>
            {tab === 'login' ? 'Log In to PennyPilot' : 'Create Free Account'}
          </Button>
        </form>
      </div>

      {/* Guest / Demo Option */}
      <div className="pb-4 text-center z-10 space-y-3">
        <button
          onClick={onContinueGuest}
          className="w-full py-2.5 px-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center justify-center gap-1.5"
        >
          <span>Continue as Guest / Local Mode</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Private & Secure Encrypted Storage
        </p>
      </div>
    </div>
  );
};
