export type Frequency = 'monthly' | 'weekly' | 'yearly';

export interface RecurringExpense {
  id: string;
  merchant: string;
  category: string;
  estimatedAmount: number;
  frequency: Frequency;
  billingDay?: number; // e.g. 5th of every month
  confidence: number; // 0 to 1
  lastDetectedDate: string;
  isConfirmed: boolean;
  status: 'active' | 'ignored' | 'cancelled';
}
