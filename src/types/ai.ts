import { SplitType, IndividualSplit } from './expense';

export interface ParsedExpenseInput {
  merchant: string;
  amount: number;
  category: string;
  date: string;
  participants: string[];
  splitType: SplitType;
  suggestedSplits: IndividualSplit[];
  confidence: number;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  referencedData?: {
    totalSpent?: number;
    topCategory?: string;
    anomalyCount?: number;
  };
}

export interface AIReport {
  month: string;
  totalSpent: number;
  comparedToLastMonthPct: number;
  topCategory: string;
  biggestIncreaseCategory: string;
  biggestDecreaseCategory: string;
  estimatedPotentialSavings: { min: number; max: number };
  insights: string[];
}

export interface FairSplitSuggestion {
  participantId: string;
  participantName: string;
  assignedItems: string[];
  itemTotal: number;
  proportionalTaxAndTip: number;
  finalTotal: number;
}
