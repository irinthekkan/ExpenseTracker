import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Expense,
  BudgetPlan,
  ActiveTab,
  DEFAULT_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES
} from '../types';
import { getCurrentMonthKey, getCurrentDateStr } from '../utils/formatters';
import { exportToJson, exportToCsv, parseJsonBackup } from '../utils/exportImport';
import {
  getPreviousMonthKey,
  calculateAvailableBalance,
  prepareBalanceAdjustment
} from '../utils/calculations';

interface ExpenseContextType {
  expenses: Expense[];
  budgets: Record<string, BudgetPlan>;
  initialBalance: number;
  availableBalance: number;
  currentMonthKey: string;
  currentYear: number;
  activeTab: ActiveTab;
  customCategories: string[];
  customIncomeCategories: string[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  setMonthlyBudget: (plan: BudgetPlan) => void;
  copyBudgetFromPreviousMonth: (targetMonthKey: string) => boolean;
  adjustBalance: (
    targetBalance: number,
    category?: string,
    customTitle?: string
  ) => { success: boolean; difference: number; type: 'income' | 'expense' | 'none'; message: string };
  setInitialBalance: (amount: number) => void;
  setCurrentMonthKey: (key: string) => void;
  setCurrentYear: (year: number) => void;
  setActiveTab: (tab: ActiveTab) => void;
  addCustomCategory: (cat: string, isIncome?: boolean) => void;
  exportBackup: () => string;
  exportCsvData: () => string;
  importBackup: (jsonStr: string) => { success: boolean; message: string };
  clearAllData: () => void;
}

const STORAGE_KEYS = {
  EXPENSES: 'expensetracker_expenses_v1',
  BUDGETS: 'expensetracker_budgets_v1',
  CUSTOM_CATS: 'expensetracker_custom_cats_v1',
  CUSTOM_INCOME_CATS: 'expensetracker_custom_income_cats_v1',
  INITIAL_BALANCE: 'expensetracker_initial_bal_v1'
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMonthKey, setCurrentMonthKey] = useState<string>(getCurrentMonthKey());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<ActiveTab>('monthly');

  // Initial Seed Data generator for first launch
  const getInitialSeed = (): {
    expenses: Expense[];
    budgets: Record<string, BudgetPlan>;
    initialBalance: number;
  } => {
    const today = getCurrentDateStr();
    const thisMonth = getCurrentMonthKey();
    const seedExpenses: Expense[] = [
      {
        id: 'seed-inc-1',
        type: 'income',
        title: 'Monthly Salary Credit',
        amount: 95000,
        category: 'Salary',
        date: today,
        paymentMethod: 'Net Banking',
        isRecurring: true,
        notes: 'Monthly employer direct deposit',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'seed-exp-1',
        type: 'expense',
        title: 'Home Loan EMI',
        amount: 32500,
        category: 'Loan',
        date: today,
        paymentMethod: 'Net Banking',
        isRecurring: true,
        notes: 'Monthly apartment mortgage EMI',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'seed-exp-2',
        type: 'expense',
        title: 'Credit Card Statement',
        amount: 14200,
        category: 'Credit Card',
        date: today,
        paymentMethod: 'UPI',
        isRecurring: true,
        notes: 'HDFC Millennia card bill payment',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'seed-exp-3',
        type: 'expense',
        title: 'Electricity & Water Bill',
        amount: 3850,
        category: 'Utilities',
        date: today,
        paymentMethod: 'UPI',
        isRecurring: false,
        notes: 'Monthly power and municipal water charges',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'seed-exp-4',
        type: 'expense',
        title: 'Family Groceries & Provisions',
        amount: 12500,
        category: 'Family',
        date: today,
        paymentMethod: 'Credit Card',
        isRecurring: false,
        notes: 'Supermarket supplies & pantry restock',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'seed-exp-5',
        type: 'expense',
        title: 'Health & Life Insurance Premium',
        amount: 8500,
        category: 'Insurance',
        date: today,
        paymentMethod: 'Net Banking',
        isRecurring: true,
        notes: 'Family health floater quarterly installment',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const seedBudgets: Record<string, BudgetPlan> = {
      [thisMonth]: {
        monthKey: thisMonth,
        expectedIncome: 95000,
        categoryBudgets: {
          'Loan': 35000,
          'Credit Card': 18000,
          'Utilities': 5000,
          'Family': 15000,
          'Insurance': 10000,
          'Miscellaneous': 5000
        }
      }
    };

    return {
      expenses: seedExpenses,
      budgets: seedBudgets,
      initialBalance: 50000
    };
  };

  const seed = getInitialSeed();

  const [initialBalance, setInitialBalanceState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INITIAL_BALANCE);
      if (saved !== null) {
        return parseFloat(saved) || 0;
      }
    } catch {
      // fallback
    }
    return seed.initialBalance;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return seed.expenses;
  });

  const [budgets, setBudgets] = useState<Record<string, BudgetPlan>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return seed.budgets;
  });

  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_CATS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [customIncomeCategories, setCustomIncomeCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_INCOME_CATS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Calculate live available balance
  const availableBalance = calculateAvailableBalance(initialBalance, expenses);

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch {
      // ignore
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    } catch {
      // ignore
    }
  }, [budgets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INITIAL_BALANCE, initialBalance.toString());
    } catch {
      // ignore
    }
  }, [initialBalance]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_CATS, JSON.stringify(customCategories));
    } catch {
      // ignore
    }
  }, [customCategories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_INCOME_CATS, JSON.stringify(customIncomeCategories));
    } catch {
      // ignore
    }
  }, [customIncomeCategories]);

  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      type: expenseData.type || 'expense',
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setExpenses(prev => [newExpense, ...prev]);

    if (newExpense.type === 'income') {
      const isDefault = (DEFAULT_INCOME_CATEGORIES as readonly string[]).includes(newExpense.category);
      if (!isDefault && !customIncomeCategories.includes(newExpense.category)) {
        setCustomIncomeCategories(prev => [...prev, newExpense.category]);
      }
    } else {
      const isDefault = (DEFAULT_CATEGORIES as readonly string[]).includes(newExpense.category);
      if (!isDefault && !customCategories.includes(newExpense.category)) {
        setCustomCategories(prev => [...prev, newExpense.category]);
      }
    }
  };

  const updateExpense = (id: string, updatedFields: Partial<Expense>) => {
    setExpenses(prev =>
      prev.map(e => (e.id === id ? { ...e, ...updatedFields, updatedAt: new Date().toISOString() } : e))
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const setMonthlyBudget = (plan: BudgetPlan) => {
    setBudgets(prev => ({
      ...prev,
      [plan.monthKey]: plan
    }));
  };

  const copyBudgetFromPreviousMonth = (targetMonthKey: string): boolean => {
    const prevKey = getPreviousMonthKey(targetMonthKey);
    const prevBudget = budgets[prevKey];
    if (!prevBudget) return false;

    setBudgets(prev => ({
      ...prev,
      [targetMonthKey]: {
        monthKey: targetMonthKey,
        expectedIncome: prevBudget.expectedIncome,
        totalBudget: prevBudget.totalBudget,
        categoryBudgets: { ...prevBudget.categoryBudgets }
      }
    }));
    return true;
  };

  const adjustBalance = (
    targetBalance: number,
    category = 'Miscellaneous',
    customTitle?: string
  ) => {
    const adj = prepareBalanceAdjustment(availableBalance, targetBalance, category, customTitle);
    if (adj.type === 'none' || !adj.transaction) {
      return {
        success: true,
        difference: 0,
        type: 'none' as const,
        message: 'Current tracked balance already matches target balance.'
      };
    }

    addExpense(adj.transaction);

    const diffStr = `₹${Math.abs(adj.difference).toLocaleString('en-IN')}`;
    const actionStr = adj.type === 'income' ? `added to Income (${adj.transaction.category})` : `added to Expenses (${adj.transaction.category})`;

    return {
      success: true,
      difference: adj.difference,
      type: adj.type,
      message: `Adjusted balance: ${diffStr} ${actionStr}. Tracked balance is now ₹${targetBalance.toLocaleString('en-IN')}.`
    };
  };

  const setInitialBalance = (amount: number) => {
    setInitialBalanceState(amount);
  };

  const addCustomCategory = (cat: string, isIncome = false) => {
    const trimmed = cat.trim();
    if (!trimmed) return;
    if (isIncome) {
      if (!customIncomeCategories.includes(trimmed) && !(DEFAULT_INCOME_CATEGORIES as readonly string[]).includes(trimmed)) {
        setCustomIncomeCategories(prev => [...prev, trimmed]);
      }
    } else {
      if (!customCategories.includes(trimmed) && !(DEFAULT_CATEGORIES as readonly string[]).includes(trimmed)) {
        setCustomCategories(prev => [...prev, trimmed]);
      }
    }
  };

  const exportBackup = (): string => {
    return exportToJson(expenses, budgets, initialBalance);
  };

  const exportCsvData = (): string => {
    return exportToCsv(expenses);
  };

  const importBackup = (jsonStr: string): { success: boolean; message: string } => {
    const res = parseJsonBackup(jsonStr);
    if (!res.success || !res.data) {
      return { success: false, message: res.error || 'Failed to parse backup' };
    }

    setExpenses(res.data.expenses);
    setBudgets(res.data.budgets);
    if (typeof res.data.initialBalance === 'number') {
      setInitialBalanceState(res.data.initialBalance);
    }

    // Extract custom categories
    const foundExpCustom = new Set<string>();
    const foundIncCustom = new Set<string>();
    res.data.expenses.forEach(e => {
      if (e.type === 'income') {
        if (!(DEFAULT_INCOME_CATEGORIES as readonly string[]).includes(e.category)) {
          foundIncCustom.add(e.category);
        }
      } else {
        if (!(DEFAULT_CATEGORIES as readonly string[]).includes(e.category)) {
          foundExpCustom.add(e.category);
        }
      }
    });

    setCustomCategories(Array.from(foundExpCustom));
    setCustomIncomeCategories(Array.from(foundIncCustom));

    return {
      success: true,
      message: `Restored ${res.data.expenses.length} transactions and ${Object.keys(res.data.budgets).length} budget plans.`
    };
  };

  const clearAllData = () => {
    setExpenses([]);
    setBudgets({});
    setInitialBalanceState(0);
    setCustomCategories([]);
    setCustomIncomeCategories([]);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.INITIAL_BALANCE);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_CATS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_INCOME_CATS);
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        budgets,
        initialBalance,
        availableBalance,
        currentMonthKey,
        currentYear,
        activeTab,
        customCategories,
        customIncomeCategories,
        addExpense,
        updateExpense,
        deleteExpense,
        setMonthlyBudget,
        copyBudgetFromPreviousMonth,
        adjustBalance,
        setInitialBalance,
        setCurrentMonthKey,
        setCurrentYear,
        setActiveTab,
        addCustomCategory,
        exportBackup,
        exportCsvData,
        importBackup,
        clearAllData
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = (): ExpenseContextType => {
  const ctx = useContext(ExpenseContext);
  if (!ctx) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return ctx;
};
