import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../../../firebase/config';
import { env } from '../../../config/env';
import { UserProfile } from '../../../types/user';

export async function signInWithGoogle(): Promise<UserProfile | null> {
  if (!env.firebase.isConfigured) return null;
  const credential = await signInWithPopup(auth, googleProvider);
  const fbUser = credential.user;
  return await syncUserProfile(fbUser);
}

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile | null> {
  if (!env.firebase.isConfigured) return null;
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  return await syncUserProfile(credential.user);
}

export async function signupWithEmail(email: string, pass: string, name: string): Promise<UserProfile | null> {
  if (!env.firebase.isConfigured) return null;
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: name });
  }
  return await syncUserProfile(credential.user, name);
}

export async function logoutUser(): Promise<void> {
  if (env.firebase.isConfigured) {
    await signOut(auth);
  }
}

export function subscribeToAuth(callback: (user: UserProfile | null) => void) {
  if (!env.firebase.isConfigured) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      const profile = await syncUserProfile(fbUser);
      callback(profile);
    } else {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.warn('Anonymous auth sign-in error:', err);
        callback(null);
      }
    }
  });
}

async function syncUserProfile(fbUser: FirebaseUser, customName?: string): Promise<UserProfile> {
  const userRef = doc(db, 'users', fbUser.uid);
  let userDoc;
  try {
    userDoc = await getDoc(userRef);
  } catch (err) {
    console.warn('Firestore offline fallback for user profile.');
  }

  if (userDoc && userDoc.exists()) {
    return userDoc.data() as UserProfile;
  }

  const newProfile: UserProfile = {
    uid: fbUser.uid,
    email: fbUser.email,
    displayName: customName || fbUser.displayName || 'PennyPilot User',
    photoURL: fbUser.photoURL || null,
    currency: 'INR',
    monthlyBudget: 50000,
    isDemoUser: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(userRef, newProfile, { merge: true });
  } catch (err) {
    console.warn('Could not sync user profile to Firestore offline:', err);
  }

  return newProfile;
}
