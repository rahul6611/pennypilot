export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares' | 'itemized';

export interface IndividualSplit {
  participantId: string;
  participantName: string;
  amount: number;
  percentage?: number;
  shares?: number;
}

export interface ItemizedSplitItem {
  id: string;
  name: string;
  price: number;
  assignedToParticipantIds: string[];
}

export interface Expense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: string;
  date: string; // ISO date string YYYY-MM-DD
  paymentMethod: string;
  notes?: string;
  groupId?: string;
  groupName?: string;
  paidBy: string; // participantId / userId
  paidByName: string;
  splitType: SplitType;
  splits: IndividualSplit[];
  items?: ItemizedSplitItem[];
  taxAndFees?: number;
  receiptUrl?: string;
  isSettlement?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFilter {
  searchQuery: string;
  category: string;
  groupId: string;
  paymentMethod: string;
  startDate: string;
  endDate: string;
  minAmount: number | null;
  maxAmount: number | null;
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}
