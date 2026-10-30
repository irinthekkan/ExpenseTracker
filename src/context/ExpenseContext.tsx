import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Expense,
  BudgetPlan,
  ActiveTab,
  DEFAULT_CATEGORIES
} from '../types';
import { getCurrentMonthKey, getCurrentDateStr } from '../utils/formatters';
import { exportToJson, exportToCsv, parseJsonBackup } from '../utils/exportImport';
import { getPreviousMonthKey } from '../utils/calculations';

interface ExpenseContextType {
  expenses: Expense[];
  budgets: Record<string, BudgetPlan>;
  currentMonthKey: string;
  currentYear: number;
  activeTab: ActiveTab;
  customCategories: string[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  setMonthlyBudget: (plan: BudgetPlan) => void;
  copyBudgetFromPreviousMonth: (targetMonthKey: string) => boolean;
  setCurrentMonthKey: (key: string) => void;
  setCurrentYear: (year: number) => void;
  setActiveTab: (tab: ActiveTab) => void;
  addCustomCategory: (cat: string) => void;
  exportBackup: () => string;
  exportCsvData: () => string;
  importBackup: (jsonStr: string) => { success: boolean; message: string };
  clearAllData: () => void;
}

const STORAGE_KEYS = {
  EXPENSES: 'expensetracker_expenses_v1',
  BUDGETS: 'expensetracker_budgets_v1',
  CUSTOM_CATS: 'expensetracker_custom_cats_v1'
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMonthKey, setCurrentMonthKey] = useState<string>(getCurrentMonthKey());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<ActiveTab>('monthly');

  // Initial Seed Data generator for first launch
  const getInitialSeed = (): { expenses: Expense[]; budgets: Record<string, BudgetPlan> } => {
    const today = getCurrentDateStr();
    const thisMonth = getCurrentMonthKey();
    const seedExpenses: Expense[] = [
      {
        id: 'seed-1',
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
        id: 'seed-2',
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
        id: 'seed-3',
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
        id: 'seed-4',
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
        id: 'seed-5',
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
        totalBudget: 85000,
        categoryBudgets: {
          'Loan': 35000,
          'Credit Card': 18000,
          'Utilities': 5000,
          'Family': 15000,
          'Insurance': 10000
        }
      }
    };

    return { expenses: seedExpenses, budgets: seedBudgets };
  };

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return getInitialSeed().expenses;
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
    return getInitialSeed().budgets;
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

  // Save to localStorage whenever state changes
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
      localStorage.setItem(STORAGE_KEYS.CUSTOM_CATS, JSON.stringify(customCategories));
    } catch {
      // ignore
    }
  }, [customCategories]);

  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setExpenses(prev => [newExpense, ...prev]);

    // Check if category is not in default or custom list
    const isDefault = (DEFAULT_CATEGORIES as readonly string[]).includes(newExpense.category);
    if (!isDefault && !customCategories.includes(newExpense.category)) {
      setCustomCategories(prev => [...prev, newExpense.category]);
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
        totalBudget: prevBudget.totalBudget,
        categoryBudgets: { ...prevBudget.categoryBudgets }
      }
    }));
    return true;
  };

  const addCustomCategory = (cat: string) => {
    const trimmed = cat.trim();
    if (!trimmed) return;
    if (!customCategories.includes(trimmed) && !(DEFAULT_CATEGORIES as readonly string[]).includes(trimmed)) {
      setCustomCategories(prev => [...prev, trimmed]);
    }
  };

  const exportBackup = (): string => {
    return exportToJson(expenses, budgets);
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

    // Extract any custom categories
    const foundCustom = new Set<string>();
    res.data.expenses.forEach(e => {
      if (!(DEFAULT_CATEGORIES as readonly string[]).includes(e.category)) {
        foundCustom.add(e.category);
      }
    });
    setCustomCategories(Array.from(foundCustom));

    return {
      success: true,
      message: `Restored ${res.data.expenses.length} expenses and ${Object.keys(res.data.budgets).length} budget plans.`
    };
  };

  const clearAllData = () => {
    setExpenses([]);
    setBudgets({});
    setCustomCategories([]);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_CATS);
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        budgets,
        currentMonthKey,
        currentYear,
        activeTab,
        customCategories,
        addExpense,
        updateExpense,
        deleteExpense,
        setMonthlyBudget,
        copyBudgetFromPreviousMonth,
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
