export interface Budget {
  id: string;
  userId: string;
  monthlyLimit: number;
  categoryLimits: Record<string, number>; // categoryId -> limit amount
  period: string; // e.g. "2026-08"
  updatedAt: string;
}

export interface BudgetStatus {
  category: string;
  categoryName: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}
