import { Expense } from '../../../types/expense';
import { Participant } from '../../../types/user';
import { AIReport, CopilotMessage, FairSplitSuggestion, ParsedExpenseInput } from '../../../types/ai';

export interface AIProvider {
  name: string;
  isAvailable(): boolean;
  parseNaturalLanguageInput(text: string, currentUser: Participant, groupMembers?: Participant[]): Promise<ParsedExpenseInput>;
  answerCopilotQuery(query: string, userExpenses: Expense[], userBudget: number, currentUser: Participant): Promise<CopilotMessage>;
  generateMonthlyReport(expenses: Expense[], userBudget: number, month: string): Promise<AIReport>;
  suggestFairSplit(
    totalAmount: number,
    rawText: string,
    participants: Participant[]
  ): Promise<{ items: { name: string; price: number; assignedTo: string[] }[]; suggestions: FairSplitSuggestion[] }>;
}
