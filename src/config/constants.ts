export const CATEGORIES = [
  { id: 'food', name: 'Food & Dining', icon: 'Utensils', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
  { id: 'transport', name: 'Transport', icon: 'Car', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'Receipt', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Film', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
  { id: 'health', name: 'Health & Fitness', icon: 'HeartPulse', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
  { id: 'travel', name: 'Travel', icon: 'Plane', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
  { id: 'groceries', name: 'Groceries', icon: 'ShoppingCart', color: '#84cc16', bg: 'rgba(132, 204, 22, 0.15)' },
  { id: 'other', name: 'Other', icon: 'MoreHorizontal', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' }
] as const;

export const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI / GPay / PhonePe', icon: 'Smartphone' },
  { id: 'card', label: 'Credit / Debit Card', icon: 'CreditCard' },
  { id: 'cash', label: 'Cash', icon: 'Banknote' },
  { id: 'bank', label: 'Bank Transfer', icon: 'Building2' }
] as const;

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' }
] as const;

export const SPLIT_TYPES = [
  { id: 'equal', label: 'Split Equally', description: 'Divide expense equally among all members' },
  { id: 'exact', label: 'Custom Amounts', description: 'Enter exact monetary amount per person' },
  { id: 'percentage', label: 'By Percentage (%)', description: 'Split by percentage share per person' },
  { id: 'shares', label: 'By Parts / Shares', description: 'Split by number of parts per person' },
  { id: 'itemized', label: 'By Items', description: 'Assign specific items to specific people' }
] as const;
