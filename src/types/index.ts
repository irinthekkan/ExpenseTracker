export const DEFAULT_CATEGORIES = [
  'Loan',
  'Credit Card',
  'Utilities',
  'Family',
  'Insurance',
  'Miscellaneous'
] as const;

export type StandardCategory = typeof DEFAULT_CATEGORIES[number];

export const DEFAULT_INCOME_CATEGORIES = [
  'Salary',
  'Business',
  'Investments',
  'Rental',
  'Bonus',
  'Miscellaneous'
] as const;

export type StandardIncomeCategory = typeof DEFAULT_INCOME_CATEGORIES[number];

export type TransactionType = 'expense' | 'income';

export const PAYMENT_METHODS = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash',
  'Other'
] as const;

export type PaymentMethod = typeof PAYMENT_METHODS[number];

export interface Expense {
  id: string;
  type?: TransactionType; // Defaults to 'expense'
  title: string;
  amount: number;
  category: string;
  date: string; // ISO 'YYYY-MM-DD'
  paymentMethod: PaymentMethod;
  notes?: string;
  isRecurring?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetPlan {
  monthKey: string; // 'YYYY-MM'
  expectedIncome?: number;
  totalBudget?: number; // Kept optional for backward compatibility
  categoryBudgets: Record<string, number>;
}

export interface CategorySummary {
  category: string;
  spent: number;
  budgeted: number;
  remaining: number;
  transactionCount: number;
  percentageOfTotal: number;
}

export interface MonthSummary {
  monthKey: string;
  totalSpent: number;
  totalIncome: number;
  netSavings: number;
  expectedIncome: number;
  categories: CategorySummary[];
}

export interface AnnualMonthBreakdown {
  monthKey: string;
  monthName: string;
  totalExpenses: number;
  totalIncome: number;
  netSavings: number;
  categories: Record<string, number>;
}

export interface AnnualCategorySummary {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface AnnualSummary {
  year: number;
  totalSpent: number;
  totalIncome: number;
  netSavings: number;
  monthlyAverage: number;
  highestCategory: { category: string; amount: number } | null;
  highestMonth: { monthKey: string; monthName: string; amount: number } | null;
  categories: AnnualCategorySummary[];
  monthlyBreakdown: AnnualMonthBreakdown[];
}

export type ActiveTab = 'monthly' | 'planning' | 'annual' | 'settings';
