import React, { useState, useEffect } from 'react';
import { NavTab, BottomNav } from '../components/layout/BottomNav';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { OfflineBanner } from '../components/layout/OfflineBanner';
import { PwaInstallPrompt } from '../components/layout/PwaInstallPrompt';
import { Toast } from '../components/common/Toast';

import { SummaryCards } from '../features/dashboard/components/SummaryCards';
import { SpendingOverview } from '../features/dashboard/components/SpendingOverview';
import { ExpenseList } from '../features/expenses/components/ExpenseList';
import { AddExpenseModal } from '../features/expenses/components/AddExpenseModal';
import { GroupList } from '../features/groups/components/GroupList';
import { GroupDetailView } from '../features/groups/components/GroupDetailView';
import { CreateGroupModal } from '../features/groups/components/CreateGroupModal';
import { SettleUpModal } from '../features/settlements/components/SettleUpModal';
import { CopilotChat } from '../features/ai/components/CopilotChat';
import { MonthlyReportView } from '../features/ai/components/MonthlyReportView';
import { AnalyticsView } from '../features/analytics/components/AnalyticsView';
import { RecurringList } from '../features/recurring/components/RecurringList';
import { ProfileView } from '../features/profile/components/ProfileView';
import { initThemeListener } from '../utils/themeService';

import { AuthModal } from '../features/auth/components/AuthModal';
import { AuthScreen } from '../features/auth/components/AuthScreen';
import { PullToRefresh } from '../components/common/PullToRefresh';
import { subscribeToAuth, logoutUser } from '../features/auth/services/authService';
import {
  saveExpenseToFirestore,
  syncExpensesToFirestore,
  deleteExpenseFromFirestore,
  subscribeUserExpenses,
  saveGroupToFirestore,
  subscribeUserGroups,
  saveSettlementToFirestore,
  subscribeUserSettlements,
  saveUserProfile
} from '../firebase/firestoreService';

import { collection, getDocs, query } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { env } from '../config/env';
import { computeUserOverview } from '../finance/balanceCalculator';
import { calculateGroupBalances, simplifyDebts } from '../finance/debtSimplifier';
import { detectRecurringExpenses } from '../features/recurring/services/recurringDetector';
import {
  CURRENT_USER,
  DEMO_MEMBERS,
  DEMO_GROUPS,
  DEMO_EXPENSES,
  DEMO_SETTLEMENTS
} from '../store/useDemoStore';

import { Expense } from '../types/expense';
import { Group, SimplifiedDebt } from '../types/group';
import { Settlement } from '../types/settlement';
import { UserProfile } from '../types/user';
import { Camera, Sparkles } from 'lucide-react';
import { ReceiptScannerModal } from '../features/receipts/components/ReceiptScannerModal';

const DEFAULT_USER: UserProfile = {
  uid: 'user-me-101',
  email: null,
  displayName: 'My Account',
  currency: 'INR',
  monthlyBudget: 50000,
  isDemoUser: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export function App() {
  const { isOffline, wasOffline } = useOfflineStatus();
  const { canInstall, promptInstall } = usePwaInstall();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Scroll to top when switching navigation tabs
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

  // User Auth State & Protected Route
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('pennypilot_logged_in') === 'true';
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('pennypilot_user');
    if (saved) {
      const u = JSON.parse(saved);
      if (u.email === 'alex@pennypilot.app' || (u.isDemoUser && !localStorage.getItem('pennypilot_explicit_demo'))) {
        const clean = { ...DEFAULT_USER };
        localStorage.setItem('pennypilot_user', JSON.stringify(clean));
        localStorage.removeItem('pennypilot_expenses');
        return clean;
      }
      return u;
    }
    return DEFAULT_USER;
  });

  const [groups, setGroups] = useState<Group[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);

  // Clear any legacy local storage expense caches so data ONLY comes from Firebase
  useEffect(() => {
    localStorage.removeItem('pennypilot_expenses');
    localStorage.removeItem('pennypilot_groups');
    localStorage.removeItem('pennypilot_settlements');
  }, []);

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeDebtToSettle, setActiveDebtToSettle] = useState<SimplifiedDebt | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: 'success' | 'info' | 'warning' }>({
    isVisible: false,
    message: '',
    type: 'info'
  });

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, isVisible: false })), 3500);
  };

  // Initialize theme mode preference (Dark / Light / System)
  useEffect(() => {
    return initThemeListener();
  }, []);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuth((authProfile) => {
      if (authProfile) {
        // Authenticated real user
        setUser(authProfile);
        setIsLoggedIn(true);
        setActiveTab('home');
        localStorage.setItem('pennypilot_logged_in', 'true');
        localStorage.setItem('pennypilot_user', JSON.stringify(authProfile));
        showToast(`Signed in as ${authProfile.displayName}`, 'success');
      } else {
        setExpenses([]);
        localStorage.removeItem('pennypilot_expenses');
      }
    });
    return () => unsubscribe();
  }, []);

  // Firebase Real-time Firestore Sync for Authenticated User OR Demo fallback
  useEffect(() => {
    if (user.isDemoUser) {
      // Demo Mode fallback
      setExpenses(DEMO_EXPENSES);
      setGroups(DEMO_GROUPS);
      setSettlements(DEMO_SETTLEMENTS);
      return;
    }

    if (env.firebase.isConfigured) {
      const activeUid = (auth.currentUser && auth.currentUser.uid) ? auth.currentUser.uid : user.uid;

      // Real Firebase User - Subscribe to Firebase Cloud Firestore collections
      const unsubExpenses = subscribeUserExpenses(activeUid, (data) => {
        setExpenses(data);
      });

      const unsubGroups = subscribeUserGroups(activeUid, (data) => {
        setGroups(data);
      });

      const unsubSettlements = subscribeUserSettlements(activeUid, (data) => {
        setSettlements(data);
      });

      return () => {
        unsubExpenses();
        unsubGroups();
        unsubSettlements();
      };
    }
  }, [user.uid, user.isDemoUser]);

  // Save User to Local Storage whenever updated
  useEffect(() => {
    localStorage.setItem('pennypilot_user', JSON.stringify(user));
  }, [user]);

  // Derived financial calculations
  const overview = computeUserOverview(user.uid, expenses, settlements);
  const recurringItems = detectRecurringExpenses(expenses);

  const activeGroupExpenses = selectedGroup ? expenses.filter((e) => e.groupId === selectedGroup.id) : [];
  const activeGroupSettlements = selectedGroup ? settlements.filter((s) => s.groupId === selectedGroup.id) : [];
  const groupMemberBalances = selectedGroup
    ? calculateGroupBalances(selectedGroup.members, activeGroupExpenses, activeGroupSettlements)
    : [];

  const simplifiedDebts = simplifyDebts(groupMemberBalances);

  // Handlers
  const handleSaveExpense = async (newExpenseData: Partial<Expense>) => {
    const activeUid = (auth.currentUser && auth.currentUser.uid) ? auth.currentUser.uid : user.uid;
    const activeName = (auth.currentUser && auth.currentUser.displayName) ? auth.currentUser.displayName : user.displayName;

    const created: Expense = {
      id: `exp-${Date.now()}`,
      userId: activeUid,
      description: newExpenseData.description || 'Expense',
      amount: Number(newExpenseData.amount) || 0,
      category: newExpenseData.category || 'other',
      date: newExpenseData.date || new Date().toISOString().split('T')[0],
      paymentMethod: newExpenseData.paymentMethod || 'upi',
      notes: newExpenseData.notes || '',
      groupId: newExpenseData.groupId,
      groupName: newExpenseData.groupName,
      paidBy: newExpenseData.paidBy || activeUid,
      paidByName: newExpenseData.paidByName || activeName,
      splitType: newExpenseData.splitType || 'exact',
      splits: newExpenseData.splits && newExpenseData.splits.length > 0 ? newExpenseData.splits : [
        { participantId: activeUid, participantName: activeName, amount: Number(newExpenseData.amount) || 0 }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setExpenses((prev) => [created, ...prev]);

    if (env.firebase.isConfigured) {
      await saveExpenseToFirestore(activeUid, created);
    }

    showToast(`Expense "${created.description}" saved!`);
  };

  const handleDeleteExpense = async (id: string) => {
    const target = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));

    if (env.firebase.isConfigured) {
      await deleteExpenseFromFirestore(user.uid, id, target?.groupId);
    }
    showToast('Expense deleted', 'info');
  };

  const handleSaveGroup = async (newGroup: Group) => {
    setGroups((prev) => [newGroup, ...prev]);
    if (env.firebase.isConfigured) {
      await saveGroupToFirestore(newGroup);
    }
    showToast(`Group "${newGroup.name}" created!`, 'success');
  };

  const handleConfirmSettlement = async (data: any) => {
    const settlement: Settlement = {
      id: `set-${Date.now()}`,
      groupId: selectedGroup ? selectedGroup.id : undefined,
      fromParticipantId: data.fromParticipantId,
      fromParticipantName: data.fromParticipantName,
      toParticipantId: data.toParticipantId,
      toParticipantName: data.toParticipantName,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    setSettlements((prev) => {
      const updated = [settlement, ...prev];
      if (!user.isDemoUser) {
        localStorage.setItem('pennypilot_settlements', JSON.stringify(updated));
      }
      return updated;
    });

    if (!user.isDemoUser && env.firebase.isConfigured) {
      await saveSettlementToFirestore(user.uid, settlement);
    }

    showToast(`Settled ₹${data.amount.toLocaleString()} with ${data.toParticipantName}!`, 'success');
  };

  const handleRefreshData = async () => {
    if (env.firebase.isConfigured) {
      try {
        const activeUid = auth.currentUser ? auth.currentUser.uid : user.uid;
        await syncExpensesToFirestore(activeUid, expenses);

        const freshExp = await getDocs(query(collection(db, 'users', activeUid, 'expenses')));
        const expList: Expense[] = [];
        freshExp.forEach((d) => expList.push(d.data() as Expense));
        expList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (expList.length > 0) {
          setExpenses(expList);
        }
        showToast('Synced latest data from Firebase DB!', 'success');
      } catch (err) {
        showToast('Data refreshed', 'info');
      }
    } else {
      showToast('Data refreshed!', 'info');
    }
  };

  const handleResetDemoData = () => {
    const demoUser = { ...CURRENT_USER, isDemoUser: true };
    setUser(demoUser);
    localStorage.setItem('pennypilot_explicit_demo', 'true');
    localStorage.setItem('pennypilot_user', JSON.stringify(demoUser));
    setGroups(DEMO_GROUPS);
    setExpenses(DEMO_EXPENSES);
    setSettlements(DEMO_SETTLEMENTS);
    setSelectedGroup(null);
    showToast('Sample demo dataset loaded.', 'info');
  };

  const handleClearData = () => {
    const cleanUser = { ...DEFAULT_USER, displayName: user.displayName || 'My Account' };
    setUser(cleanUser);
    localStorage.removeItem('pennypilot_explicit_demo');
    localStorage.setItem('pennypilot_user', JSON.stringify(cleanUser));
    localStorage.removeItem('pennypilot_expenses');
    localStorage.removeItem('pennypilot_groups');
    localStorage.removeItem('pennypilot_settlements');
    setExpenses([]);
    setGroups([]);
    setSettlements([]);
    setSelectedGroup(null);
    showToast('Account reset to ₹0 clean state.', 'info');
  };

  const handleDeleteAccount = async () => {
    await logoutUser();
    localStorage.clear();
    setUser({ ...DEFAULT_USER, displayName: 'Guest User', email: null });
    setExpenses([]);
    setGroups([]);
    setSettlements([]);
    setIsLoggedIn(false);
    showToast('Signed out & local state cleared.', 'warning');
  };

  const handleLogout = async () => {
    await logoutUser();
    localStorage.removeItem('pennypilot_logged_in');
    localStorage.removeItem('pennypilot_user');
    localStorage.removeItem('pennypilot_expenses');
    setUser({ ...DEFAULT_USER, displayName: 'Guest User', email: null });
    setExpenses([]);
    setGroups([]);
    setSettlements([]);
    setIsLoggedIn(false);
    showToast('Logged out successfully.', 'info');
  };

  if (!isLoggedIn) {
    return (
      <AuthScreen
        onSuccess={(profile) => {
          setUser(profile);
          setIsLoggedIn(true);
          setActiveTab('home');
          localStorage.setItem('pennypilot_logged_in', 'true');
          localStorage.setItem('pennypilot_user', JSON.stringify(profile));
          showToast(`Welcome ${profile.displayName}!`, 'success');
        }}
        onContinueGuest={() => {
          setIsLoggedIn(true);
          setActiveTab('home');
          localStorage.setItem('pennypilot_logged_in', 'true');
          showToast('Continuing in Guest Mode', 'info');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#080d1a] light:bg-[#f8fafc] text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setSelectedGroup(null);
          setActiveTab(tab);
        }}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-8">
        <Header
          isOffline={isOffline}
          onOpenSearch={() => setActiveTab('expenses')}
          onOpenInstallPrompt={() => setIsInstallOpen(true)}
          canInstallPwa={canInstall}
          onRefreshData={handleRefreshData}
          currency={user.currency}
          user={user}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenProfile={() => setActiveTab('profile')}
          onLogout={handleLogout}
        />

        <OfflineBanner isOffline={isOffline} wasOffline={wasOffline} />

        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
          <PullToRefresh onRefresh={handleRefreshData}>
            {/* HOME DASHBOARD TAB */}
            {activeTab === 'home' && (
              <div className="space-y-6">
                <SummaryCards overview={overview} monthlyBudget={user.monthlyBudget} currency={user.currency} />

                {/* Quick AI & Scanner Banner */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsAddExpenseOpen(true)}
                    className="p-4 rounded-2xl bg-gradient-to-br from-brand-600/30 to-indigo-600/20 border border-brand-500/30 hover:border-brand-500 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-xl bg-brand-500/20 text-brand-300">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-brand-300 transition-colors">
                      AI Natural Entry
                    </h4>
                    <p className="text-[11px] text-slate-400">Type & auto-split</p>
                  </button>

                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                        <Camera className="w-5 h-5" />
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                      Scan Receipt
                    </h4>
                    <p className="text-[11px] text-slate-400">OCR bill parsing</p>
                  </button>
                </div>

                <SpendingOverview
                  expenses={expenses}
                  currency={user.currency}
                  onViewAllExpenses={() => setActiveTab('expenses')}
                  onSelectExpense={() => setActiveTab('expenses')}
                  onOpenAddExpense={() => setIsAddExpenseOpen(true)}
                />
              </div>
            )}

            {/* EXPENSES TAB */}
            {activeTab === 'expenses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100">All Expenses</h2>
                    <p className="text-xs text-slate-400">{expenses.length} total transactions logged</p>
                  </div>
                </div>

                <ExpenseList
                  expenses={expenses}
                  groups={groups}
                  currency={user.currency}
                  onDeleteExpense={handleDeleteExpense}
                />
              </div>
            )}

            {/* GROUPS TAB */}
            {activeTab === 'groups' && (
              <div>
                {selectedGroup ? (
                  <GroupDetailView
                    group={selectedGroup}
                    expenses={expenses}
                    settlements={settlements}
                    memberBalances={groupMemberBalances}
                    simplifiedDebts={simplifiedDebts}
                    currency={user.currency}
                    currentUserId={user.uid}
                    onBack={() => setSelectedGroup(null)}
                    onOpenAddExpense={() => setIsAddExpenseOpen(true)}
                    onOpenSettleUp={(debt) => {
                      setActiveDebtToSettle(debt);
                      setIsSettleOpen(true);
                    }}
                  />
                ) : (
                  <GroupList
                    groups={groups}
                    onSelectGroup={(g) => setSelectedGroup(g)}
                    onCreateGroup={() => setIsCreateGroupOpen(true)}
                  />
                )}
              </div>
            )}

            {/* SPENDING CHARTS & INSIGHTS TAB */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <AnalyticsView expenses={expenses} monthlyBudget={user.monthlyBudget} currency={user.currency} />

                <MonthlyReportView expenses={expenses} userBudget={user.monthlyBudget} currency={user.currency} />

                <CopilotChat
                  expenses={expenses}
                  userBudget={user.monthlyBudget}
                  currentUser={{ id: user.uid, name: user.displayName }}
                  currency={user.currency}
                />

                <RecurringList items={recurringItems} currency={user.currency} />
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <ProfileView
                user={user}
                onUpdateCurrency={async (curr) => {
                  const updated = { ...user, currency: curr };
                  setUser(updated);
                  await saveUserProfile(updated);
                }}
                onUpdateBudget={async (b) => {
                  const updated = { ...user, monthlyBudget: b };
                  setUser(updated);
                  await saveUserProfile(updated);
                }}
                onDeleteAccount={handleDeleteAccount}
                onResetDemoData={handleResetDemoData}
                onClearData={handleClearData}
                onLogout={handleLogout}
              />
            )}
          </PullToRefresh>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setSelectedGroup(null);
          setActiveTab(tab);
        }}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(profile) => {
          setUser(profile);
          showToast(`Logged in as ${profile.displayName}!`, 'success');
        }}
      />

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onSaveExpense={handleSaveExpense}
        groups={groups}
        currentUser={{ id: user.uid, name: user.displayName }}
        allParticipants={DEMO_MEMBERS}
        currencySymbol={user.currency === 'INR' ? '₹' : '$'}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onSaveGroup={handleSaveGroup}
        currentUser={{ id: user.uid, name: user.displayName }}
      />

      {/* Settle Up Modal */}
      <SettleUpModal
        isOpen={isSettleOpen}
        onClose={() => setIsSettleOpen(false)}
        debt={activeDebtToSettle}
        currency={user.currency === 'INR' ? '₹' : '$'}
        onConfirmSettlement={handleConfirmSettlement}
      />

      {/* PWA Custom Installation Modal */}
      <PwaInstallPrompt
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
        onInstall={promptInstall}
      />

      {/* Receipt Scanner Modal */}
      <ReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onConfirmReceipt={handleSaveExpense}
        currencySymbol={user.currency === 'INR' ? '₹' : '$'}
      />

      {/* Toast Notification */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, isVisible: false }))}
      />
    </div>
  );
}
