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

// Utility to strip undefined properties before saving to Firebase Firestore
function sanitizeFirestoreData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const sanitized: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        sanitized[key] = sanitizeFirestoreData(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map((item) =>
          item && typeof item === 'object' ? sanitizeFirestoreData(item) : item
        );
      } else {
        sanitized[key] = value;
      }
    }
  });
  return sanitized;
}

// Users Firestore Methods
export async function saveUserProfile(user: UserProfile): Promise<void> {
  if (!env.firebase.isConfigured || user.isDemoUser || !auth.currentUser) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, sanitizeFirestoreData(user), { merge: true });
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
    const rawData = { ...expense, id: expId, userId: activeUid };
    const expenseData = sanitizeFirestoreData(rawData);

    // 1. Save to top-level expenses collection (visible immediately in Firebase Console)
    const globalExpRef = doc(db, 'expenses', expId);
    await setDoc(globalExpRef, expenseData, { merge: true });

    // 2. Save to user subcollection
    const expRef = doc(db, 'users', activeUid, 'expenses', expId);
    await setDoc(expRef, expenseData, { merge: true });

    // 3. Sync to group subcollection if applicable
    if (expense.groupId) {
      const groupExpRef = doc(db, 'groups', expense.groupId, 'expenses', expId);
      await setDoc(groupExpRef, expenseData, { merge: true });
    }
    console.log('Successfully saved expense to Firebase Firestore:', expId);
  } catch (err) {
    console.error('Could not save expense to Firestore:', err);
  }
}

export async function syncExpensesToFirestore(userId: string, expenses: Expense[]): Promise<void> {
  if (!env.firebase.isConfigured || expenses.length === 0) return;
  const activeUid = auth.currentUser?.uid || userId;

  for (const exp of expenses) {
    try {
      const expId = exp.id || `exp-${Date.now()}`;
      const rawData = { ...exp, id: expId, userId: activeUid };
      const expenseData = sanitizeFirestoreData(rawData);

      // Write to top-level expenses collection
      await setDoc(doc(db, 'expenses', expId), expenseData, { merge: true });

      // Write to user subcollection
      await setDoc(doc(db, 'users', activeUid, 'expenses', expId), expenseData, { merge: true });

      if (exp.groupId) {
        await setDoc(doc(db, 'groups', exp.groupId, 'expenses', expId), expenseData, { merge: true });
      }
    } catch (err) {
      console.warn(`Could not sync expense ${exp.id} to Firestore:`, err);
    }
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
        expensesList.sort((a, b) => {
          const timeA = new Date(a.createdAt || a.date).getTime();
          const timeB = new Date(b.createdAt || b.date).getTime();
          if (timeB !== timeA) return timeB - timeA;
          return b.id.localeCompare(a.id);
        });
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
