export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL?: string | null;
  currency: string; // e.g. 'INR'
  monthlyBudget: number;
  isDemoUser?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  isCurrentUser?: boolean;
}
