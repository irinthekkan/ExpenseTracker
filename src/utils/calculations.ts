import {
  Expense,
  BudgetPlan,
  MonthSummary,
  CategorySummary,
  AnnualSummary,
  AnnualCategorySummary,
  AnnualMonthBreakdown,
  DEFAULT_CATEGORIES
} from '../types';
import { formatMonthShort, getCurrentDateStr } from './formatters';

export const getMonthFromDate = (dateStr: string): string => {
  if (!dateStr || dateStr.length < 7) return '';
  return dateStr.substring(0, 7);
};

export const getYearFromDate = (dateStr: string): number => {
  if (!dateStr || dateStr.length < 4) return new Date().getFullYear();
  return parseInt(dateStr.substring(0, 4), 10);
};

export const getPreviousMonthKey = (monthKey: string): string => {
  const [yearStr, monthStr] = monthKey.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) - 1;
  if (month < 1) {
    month = 12;
    year -= 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
};

export const getNextMonthKey = (monthKey: string): string => {
  const [yearStr, monthStr] = monthKey.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) + 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
};

export const calculateAvailableBalance = (initialBalance: number, transactions: Expense[]): number => {
  let balance = initialBalance;
  transactions.forEach((tx) => {
    if (tx.type === 'income') {
      balance += tx.amount;
    } else {
      // Default to expense
      balance -= tx.amount;
    }
  });
  return balance;
};

export const prepareBalanceAdjustment = (
  currentAvailableBalance: number,
  targetBalance: number,
  category = 'Miscellaneous',
  customTitle?: string
): {
  difference: number;
  type: 'income' | 'expense' | 'none';
  transaction?: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;
} => {
  const difference = targetBalance - currentAvailableBalance;
  if (Math.abs(difference) < 0.001) {
    return { difference: 0, type: 'none' };
  }

  const today = getCurrentDateStr();

  if (difference > 0) {
    // Current tracked balance is lower than actual -> Add Income
    const title = customTitle || `Balance Adjustment (Surplus to ₹${targetBalance.toLocaleString('en-IN')})`;
    return {
      difference,
      type: 'income',
      transaction: {
        type: 'income',
        title,
        amount: Math.round(difference * 100) / 100,
        category: category.trim() || 'Miscellaneous',
        date: today,
        paymentMethod: 'Other',
        notes: `Adjusted tracked balance to match actual balance ₹${targetBalance.toLocaleString('en-IN')}`
      }
    };
  } else {
    // Current tracked balance is higher than actual -> Add Expense
    const absDiff = Math.abs(difference);
    const title = customTitle || `Balance Adjustment (Difference to ₹${targetBalance.toLocaleString('en-IN')})`;
    return {
      difference,
      type: 'expense',
      transaction: {
        type: 'expense',
        title,
        amount: Math.round(absDiff * 100) / 100,
        category: category.trim() || 'Miscellaneous',
        date: today,
        paymentMethod: 'Other',
        notes: `Adjusted tracked balance to match actual balance ₹${targetBalance.toLocaleString('en-IN')}`
      }
    };
  }
};

export const calculateMonthSummary = (
  expenses: Expense[],
  budgetPlans: Record<string, BudgetPlan>,
  monthKey: string
): MonthSummary => {
  const monthTransactions = expenses.filter(e => getMonthFromDate(e.date) === monthKey);
  const plan = budgetPlans[monthKey] || { monthKey, expectedIncome: 0, categoryBudgets: {} };

  const monthExpenses = monthTransactions.filter(e => !e.type || e.type === 'expense');
  const monthIncomes = monthTransactions.filter(e => e.type === 'income');

  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = monthIncomes.reduce((sum, e) => sum + e.amount, 0);
  const netSavings = totalIncome - totalSpent;

  // Group expenses by category
  const categoryMap: Record<string, { spent: number; count: number }> = {};
  
  DEFAULT_CATEGORIES.forEach(cat => {
    categoryMap[cat] = { spent: 0, count: 0 };
  });

  Object.keys(plan.categoryBudgets || {}).forEach(cat => {
    if (!categoryMap[cat]) {
      categoryMap[cat] = { spent: 0, count: 0 };
    }
  });

  monthExpenses.forEach(exp => {
    if (!categoryMap[exp.category]) {
      categoryMap[exp.category] = { spent: 0, count: 0 };
    }
    categoryMap[exp.category].spent += exp.amount;
    categoryMap[exp.category].count += 1;
  });

  const categories: CategorySummary[] = Object.entries(categoryMap).map(([category, data]) => {
    const budgeted = plan.categoryBudgets?.[category] || 0;
    const remaining = budgeted > 0 ? budgeted - data.spent : 0;
    const percentageOfTotal = totalSpent > 0 ? (data.spent / totalSpent) * 100 : 0;

    return {
      category,
      spent: data.spent,
      budgeted,
      remaining,
      transactionCount: data.count,
      percentageOfTotal
    };
  });

  // Sort categories: default categories first, then highest spent
  categories.sort((a, b) => {
    const aIsDefault = (DEFAULT_CATEGORIES as readonly string[]).includes(a.category);
    const bIsDefault = (DEFAULT_CATEGORIES as readonly string[]).includes(b.category);
    if (aIsDefault && !bIsDefault) return -1;
    if (!aIsDefault && bIsDefault) return 1;
    return b.spent - a.spent;
  });

  return {
    monthKey,
    totalSpent,
    totalIncome,
    netSavings,
    expectedIncome: plan.expectedIncome || 0,
    categories
  };
};

export const calculateAnnualSummary = (
  expenses: Expense[],
  year: number
): AnnualSummary => {
  const yearTransactions = expenses.filter(e => getYearFromDate(e.date) === year);
  const yearExpenses = yearTransactions.filter(e => !e.type || e.type === 'expense');
  const yearIncomes = yearTransactions.filter(e => e.type === 'income');

  const totalSpent = yearExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = yearIncomes.reduce((sum, e) => sum + e.amount, 0);
  const netSavings = totalIncome - totalSpent;

  // Category Aggregates for Expenses
  const catTotals: Record<string, { amount: number; count: number }> = {};
  
  DEFAULT_CATEGORIES.forEach(cat => {
    catTotals[cat] = { amount: 0, count: 0 };
  });

  yearExpenses.forEach(exp => {
    if (!catTotals[exp.category]) {
      catTotals[exp.category] = { amount: 0, count: 0 };
    }
    catTotals[exp.category].amount += exp.amount;
    catTotals[exp.category].count += 1;
  });

  const categories: AnnualCategorySummary[] = Object.entries(catTotals).map(([cat, val]) => ({
    category: cat,
    amount: val.amount,
    percentage: totalSpent > 0 ? (val.amount / totalSpent) * 100 : 0,
    count: val.count
  })).sort((a, b) => b.amount - a.amount);

  let highestCategory: { category: string; amount: number } | null = null;
  const nonZeroCats = categories.filter(c => c.amount > 0);
  if (nonZeroCats.length > 0) {
    highestCategory = { category: nonZeroCats[0].category, amount: nonZeroCats[0].amount };
  }

  // Monthly Breakdown (Jan - Dec)
  const monthlyBreakdown: AnnualMonthBreakdown[] = [];
  let highestMonth: { monthKey: string; monthName: string; amount: number } | null = null;
  let maxMonthExpense = -1;

  for (let m = 1; m <= 12; m++) {
    const monthKey = `${year}-${String(m).padStart(2, '0')}`;
    const monthName = formatMonthShort(monthKey);
    const mTransactions = yearTransactions.filter(e => getMonthFromDate(e.date) === monthKey);
    const mExpenses = mTransactions.filter(e => !e.type || e.type === 'expense');
    const mIncomes = mTransactions.filter(e => e.type === 'income');

    const mExpenseTotal = mExpenses.reduce((sum, e) => sum + e.amount, 0);
    const mIncomeTotal = mIncomes.reduce((sum, e) => sum + e.amount, 0);

    const mCatBreakdown: Record<string, number> = {};
    mExpenses.forEach(e => {
      mCatBreakdown[e.category] = (mCatBreakdown[e.category] || 0) + e.amount;
    });

    monthlyBreakdown.push({
      monthKey,
      monthName,
      totalExpenses: mExpenseTotal,
      totalIncome: mIncomeTotal,
      netSavings: mIncomeTotal - mExpenseTotal,
      categories: mCatBreakdown
    });

    if (mExpenseTotal > maxMonthExpense) {
      maxMonthExpense = mExpenseTotal;
      if (mExpenseTotal > 0) {
        highestMonth = { monthKey, monthName, amount: mExpenseTotal };
      }
    }
  }

  const activeMonths = monthlyBreakdown.filter(m => m.totalExpenses > 0 || m.totalIncome > 0).length || 1;
  const monthlyAverage = totalSpent / Math.max(1, activeMonths);

  return {
    year,
    totalSpent,
    totalIncome,
    netSavings,
    monthlyAverage,
    highestCategory,
    highestMonth,
    categories,
    monthlyBreakdown
  };
};

export const validateExpense = (expense: Partial<Expense>): { isValid: boolean; error?: string } => {
  if (!expense.title || expense.title.trim().length === 0) {
    return { isValid: false, error: 'Please enter a title or description' };
  }
  if (typeof expense.amount !== 'number' || isNaN(expense.amount) || expense.amount <= 0) {
    return { isValid: false, error: 'Please enter a valid amount greater than ₹0' };
  }
  if (!expense.category || expense.category.trim().length === 0) {
    return { isValid: false, error: 'Please select or enter a category' };
  }
  if (!expense.date || !/^\d{4}-\d{2}-\d{2}$/.test(expense.date)) {
    return { isValid: false, error: 'Please select a valid date (YYYY-MM-DD)' };
  }
  return { isValid: true };
};
