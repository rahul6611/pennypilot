import { Participant } from './user';

export interface GroupMember extends Participant {
  role?: 'owner' | 'member';
  joinedAt?: string;
}

export interface SimplifiedDebt {
  fromParticipantId: string;
  fromParticipantName: string;
  toParticipantId: string;
  toParticipantName: string;
  amount: number;
}

export interface MemberBalance {
  participantId: string;
  participantName: string;
  netBalance: number; // positive = owed money, negative = owes money
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  category: 'trip' | 'home' | 'office' | 'friends' | 'family' | 'other';
  members: GroupMember[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
}
