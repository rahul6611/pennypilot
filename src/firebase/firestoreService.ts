import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from './config';
import { env } from '../config/env';
import { Expense } from '../types/expense';
import { Group } from '../types/group';
import { Settlement } from '../types/settlement';
import { UserProfile } from '../types/user';

// Users Firestore Methods
export async function saveUserProfile(user: UserProfile): Promise<void> {
  if (!env.firebase.isConfigured || user.isDemoUser || !auth.currentUser) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, user, { merge: true });
  } catch (err) {
    console.warn('Could not save user profile to Firestore:', err);
  }
}

// Expenses Firestore Methods
export async function saveExpenseToFirestore(userId: string, expense: Expense): Promise<void> {
  if (!env.firebase.isConfigured) return;

  // Ensure active Firebase Auth session before writing
  let activeUid = auth.currentUser?.uid;
  if (!activeUid) {
    try {
      const anonRes = await signInAnonymously(auth);
      activeUid = anonRes.user.uid;
    } catch (e) {
      activeUid = userId;
    }
  }

  const expId = expense.id || `exp-${Date.now()}`;

  try {
    const expenseData = { ...expense, id: expId, userId: activeUid };

    // 1. Save to top-level expenses collection (visible immediately in Firebase Console)
    const globalExpRef = doc(db, 'expenses', expId);
    await setDoc(globalExpRef, expenseData);

    // 2. Save to user subcollection
    const expRef = doc(db, 'users', activeUid, 'expenses', expId);
    await setDoc(expRef, expenseData);

    // 3. Sync to group subcollection if applicable
    if (expense.groupId) {
      const groupExpRef = doc(db, 'groups', expense.groupId, 'expenses', expId);
      await setDoc(groupExpRef, expenseData);
    }
    console.log('Successfully saved expense to Firebase Firestore:', expId);
  } catch (err) {
    console.error('Could not save expense to Firestore:', err);
  }
}

export async function deleteExpenseFromFirestore(userId: string, expenseId: string, groupId?: string): Promise<void> {
  if (!env.firebase.isConfigured) return;
  const currentUid = auth.currentUser ? auth.currentUser.uid : userId;

  try {
    const globalExpRef = doc(db, 'expenses', expenseId);
    await deleteDoc(globalExpRef);

    const expRef = doc(db, 'users', currentUid, 'expenses', expenseId);
    await deleteDoc(expRef);

    if (groupId) {
      const groupExpRef = doc(db, 'groups', groupId, 'expenses', expenseId);
      await deleteDoc(groupExpRef);
    }
  } catch (err) {
    console.error('Could not delete expense from Firestore:', err);
  }
}

export function subscribeUserExpenses(userId: string, callback: (expenses: Expense[]) => void) {
  if (!env.firebase.isConfigured) {
    return () => {};
  }

  const activeUid = auth.currentUser ? auth.currentUser.uid : userId;

  try {
    const q = query(collection(db, 'users', activeUid, 'expenses'));
    return onSnapshot(
      q,
      (snapshot) => {
        const expensesList: Expense[] = [];
        snapshot.forEach((docSnap) => {
          expensesList.push(docSnap.data() as Expense);
        });
        expensesList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        callback(expensesList);
      },
      (error) => {
        console.warn(`Firestore user expenses subscription warning for ${activeUid}:`, error.message);
      }
    );
  } catch (err) {
    console.warn('Could not subscribe to Firestore user expenses:', err);
    return () => {};
  }
}

// Groups Firestore Methods
export async function saveGroupToFirestore(group: Group): Promise<void> {
  if (!env.firebase.isConfigured) return;
  try {
    const groupRef = doc(db, 'groups', group.id);
    await setDoc(groupRef, group);
  } catch (err) {
    console.warn('Could not save group to Firestore:', err);
  }
}

export function subscribeUserGroups(userId: string, callback: (groups: Group[]) => void) {
  if (!env.firebase.isConfigured) {
    return () => {};
  }

  const activeUid = auth.currentUser ? auth.currentUser.uid : userId;

  try {
    const q = query(collection(db, 'groups'));
    return onSnapshot(
      q,
      (snapshot) => {
        const groupList: Group[] = [];
        snapshot.forEach((docSnap) => {
          const g = docSnap.data() as Group;
          if (!g.members || g.members.some((m) => m.id === activeUid || m.id === userId)) {
            groupList.push(g);
          }
        });
        callback(groupList);
      },
      (error) => {
        console.warn(`Firestore groups subscription warning for ${activeUid}:`, error.message);
      }
    );
  } catch (err) {
    console.warn('Could not subscribe to Firestore groups:', err);
    return () => {};
  }
}

// Settlements Firestore Methods
export async function saveSettlementToFirestore(userId: string, settlement: Settlement): Promise<void> {
  if (!env.firebase.isConfigured) return;
  const currentUid = auth.currentUser ? auth.currentUser.uid : userId;
  try {
    const setRef = doc(db, 'users', currentUid, 'settlements', settlement.id);
    await setDoc(setRef, settlement);
  } catch (err) {
    console.warn('Could not save settlement to Firestore:', err);
  }
}

export function subscribeUserSettlements(userId: string, callback: (settlements: Settlement[]) => void) {
  if (!env.firebase.isConfigured) {
    return () => {};
  }

  const activeUid = auth.currentUser ? auth.currentUser.uid : userId;

  try {
    const q = query(collection(db, 'users', activeUid, 'settlements'));
    return onSnapshot(
      q,
      (snapshot) => {
        const setList: Settlement[] = [];
        snapshot.forEach((docSnap) => {
          setList.push(docSnap.data() as Settlement);
        });
        callback(setList);
      },
      (error) => {
        console.warn(`Firestore settlements subscription warning for ${activeUid}:`, error.message);
      }
    );
  } catch (err) {
    console.warn('Could not subscribe to Firestore settlements:', err);
    return () => {};
  }
}
