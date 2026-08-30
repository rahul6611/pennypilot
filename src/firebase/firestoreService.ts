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
  if (!env.firebase.isConfigured || !auth.currentUser) return;
  try {
    const expRef = doc(db, 'users', userId, 'expenses', expense.id);
    await setDoc(expRef, expense);

    // If group expense, sync to group subcollection as well
    if (expense.groupId) {
      const groupExpRef = doc(db, 'groups', expense.groupId, 'expenses', expense.id);
      await setDoc(groupExpRef, expense);
    }
  } catch (err) {
    console.warn('Could not save expense to Firestore:', err);
  }
}

export async function deleteExpenseFromFirestore(userId: string, expenseId: string, groupId?: string): Promise<void> {
  if (!env.firebase.isConfigured || !auth.currentUser) return;
  try {
    const expRef = doc(db, 'users', userId, 'expenses', expenseId);
    await deleteDoc(expRef);

    if (groupId) {
      const groupExpRef = doc(db, 'groups', groupId, 'expenses', expenseId);
      await deleteDoc(groupExpRef);
    }
  } catch (err) {
    console.warn('Could not delete expense from Firestore:', err);
  }
}

export function subscribeUserExpenses(userId: string, callback: (expenses: Expense[]) => void) {
  if (!env.firebase.isConfigured || !auth.currentUser) {
    return () => {};
  }

  try {
    const q = query(collection(db, 'users', userId, 'expenses'));
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
        console.warn(`Firestore user expenses subscription warning for ${userId}:`, error.message);
      }
    );
  } catch (err) {
    console.warn('Could not subscribe to Firestore user expenses:', err);
    return () => {};
  }
}

// Groups Firestore Methods
export async function saveGroupToFirestore(group: Group): Promise<void> {
  if (!env.firebase.isConfigured || !auth.currentUser) return;
  try {
    const groupRef = doc(db, 'groups', group.id);
    await setDoc(groupRef, group);
  } catch (err) {
    console.warn('Could not save group to Firestore:', err);
  }
}

export function subscribeUserGroups(userId: string, callback: (groups: Group[]) => void) {
  if (!env.firebase.isConfigured || !auth.currentUser) {
    return () => {};
  }

  try {
    const q = query(collection(db, 'groups'));
    return onSnapshot(
      q,
      (snapshot) => {
        const groupList: Group[] = [];
        snapshot.forEach((docSnap) => {
          const g = docSnap.data() as Group;
          if (g.members && g.members.some((m) => m.id === userId)) {
            groupList.push(g);
          }
        });
        callback(groupList);
      },
      (error) => {
        console.warn(`Firestore groups subscription warning for ${userId}:`, error.message);
      }
    );
  } catch (err) {
    console.warn('Could not subscribe to Firestore groups:', err);
    return () => {};
  }
}

// Settlements Firestore Methods
export async function saveSettlementToFirestore(userId: string, settlement: Settlement): Promise<void> {
  if (!env.firebase.isConfigured || !auth.currentUser) return;
  try {
    const setRef = doc(db, 'users', userId, 'settlements', settlement.id);
    await setDoc(setRef, settlement);
  } catch (err) {
    console.warn('Could not save settlement to Firestore:', err);
  }
}

export function subscribeUserSettlements(userId: string, callback: (settlements: Settlement[]) => void) {
  if (!env.firebase.isConfigured || !auth.currentUser) {
    return () => {};
  }

  try {
    const q = query(collection(db, 'users', userId, 'settlements'));
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
        console.warn(`Firestore settlements subscription warning for ${userId}:`, error.message);
      }
    );
  } catch (err) {
    console.warn('Could not subscribe to Firestore settlements:', err);
    return () => {};
  }
}
