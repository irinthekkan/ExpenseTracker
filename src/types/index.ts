export const DEFAULT_CATEGORIES = [
  'Loan',
  'Credit Card',
  'Utilities',
  'Family',
  'Insurance'
] as const;

export type StandardCategory = typeof DEFAULT_CATEGORIES[number];

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
  totalBudget: number;
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
  totalBudget: number;
  remaining: number;
  categories: CategorySummary[];
}

export interface AnnualMonthBreakdown {
  monthKey: string;
  monthName: string;
  total: number;
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
  monthlyAverage: number;
  highestCategory: { category: string; amount: number } | null;
  highestMonth: { monthKey: string; monthName: string; amount: number } | null;
  categories: AnnualCategorySummary[];
  monthlyBreakdown: AnnualMonthBreakdown[];
}

export type ActiveTab = 'monthly' | 'planning' | 'annual' | 'settings';
