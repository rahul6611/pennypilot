export type SettlementMethod = 'upi' | 'cash' | 'bank' | 'other';

export interface Settlement {
  id: string;
  groupId?: string;
  fromParticipantId: string;
  fromParticipantName: string;
  toParticipantId: string;
  toParticipantName: string;
  amount: number;
  paymentMethod: SettlementMethod;
  notes?: string;
  date: string;
  createdAt: string;
}
