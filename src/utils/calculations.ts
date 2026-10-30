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
import { formatMonthShort } from './formatters';

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

export const calculateMonthSummary = (
  expenses: Expense[],
  budgetPlans: Record<string, BudgetPlan>,
  monthKey: string
): MonthSummary => {
  const monthExpenses = expenses.filter(e => getMonthFromDate(e.date) === monthKey);
  const plan = budgetPlans[monthKey] || { monthKey, totalBudget: 0, categoryBudgets: {} };

  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category
  const categoryMap: Record<string, { spent: number; count: number }> = {};
  
  // Ensure default categories are represented
  DEFAULT_CATEGORIES.forEach(cat => {
    categoryMap[cat] = { spent: 0, count: 0 };
  });

  // Also include any categories that have budgets set
  Object.keys(plan.categoryBudgets || {}).forEach(cat => {
    if (!categoryMap[cat]) {
      categoryMap[cat] = { spent: 0, count: 0 };
    }
  });

  // Aggregate expenses
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

  const effectiveBudget = plan.totalBudget > 0 
    ? plan.totalBudget 
    : Object.values(plan.categoryBudgets || {}).reduce((a, b) => a + b, 0);

  return {
    monthKey,
    totalSpent,
    totalBudget: effectiveBudget,
    remaining: effectiveBudget - totalSpent,
    categories
  };
};

export const calculateAnnualSummary = (
  expenses: Expense[],
  year: number
): AnnualSummary => {
  const yearExpenses = expenses.filter(e => getYearFromDate(e.date) === year);
  const totalSpent = yearExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Category Aggregates
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
  let maxMonthAmount = -1;

  for (let m = 1; m <= 12; m++) {
    const monthKey = `${year}-${String(m).padStart(2, '0')}`;
    const monthName = formatMonthShort(monthKey);
    const mExpenses = yearExpenses.filter(e => getMonthFromDate(e.date) === monthKey);
    const monthTotal = mExpenses.reduce((sum, e) => sum + e.amount, 0);

    const mCatBreakdown: Record<string, number> = {};
    mExpenses.forEach(e => {
      mCatBreakdown[e.category] = (mCatBreakdown[e.category] || 0) + e.amount;
    });

    monthlyBreakdown.push({
      monthKey,
      monthName,
      total: monthTotal,
      categories: mCatBreakdown
    });

    if (monthTotal > maxMonthAmount) {
      maxMonthAmount = monthTotal;
      if (monthTotal > 0) {
        highestMonth = { monthKey, monthName, amount: monthTotal };
      }
    }
  }

  // Active months with spending for realistic average, or divide by 12
  const activeMonths = monthlyBreakdown.filter(m => m.total > 0).length || 1;
  const monthlyAverage = totalSpent / Math.max(1, activeMonths);

  return {
    year,
    totalSpent,
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
