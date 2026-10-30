import { describe, it, expect } from 'vitest';
import {
  calculateMonthSummary,
  calculateAnnualSummary,
  calculateAvailableBalance,
  prepareBalanceAdjustment,
  getPreviousMonthKey,
  getNextMonthKey,
  validateExpense
} from '../calculations';
import { Expense, BudgetPlan } from '../../types';

describe('Calculations Utility', () => {
  const sampleTransactions: Expense[] = [
    {
      id: 'tx-inc-1',
      type: 'income',
      title: 'October Salary',
      amount: 90000,
      category: 'Salary',
      date: '2026-10-01',
      paymentMethod: 'Net Banking',
      createdAt: '2026-10-01T10:00:00Z',
      updatedAt: '2026-10-01T10:00:00Z'
    },
    {
      id: 'tx-1',
      type: 'expense',
      title: 'Home Loan EMI',
      amount: 25000,
      category: 'Loan',
      date: '2026-10-05',
      paymentMethod: 'Net Banking',
      createdAt: '2026-10-05T10:00:00Z',
      updatedAt: '2026-10-05T10:00:00Z'
    },
    {
      id: 'tx-2',
      type: 'expense',
      title: 'Electricity Bill',
      amount: 2800,
      category: 'Utilities',
      date: '2026-10-10',
      paymentMethod: 'UPI',
      createdAt: '2026-10-10T10:00:00Z',
      updatedAt: '2026-10-10T10:00:00Z'
    },
    {
      id: 'tx-3',
      type: 'expense',
      title: 'Credit Card Bill',
      amount: 15400,
      category: 'Credit Card',
      date: '2026-10-15',
      paymentMethod: 'UPI',
      createdAt: '2026-10-15T10:00:00Z',
      updatedAt: '2026-10-15T10:00:00Z'
    },
    {
      id: 'tx-4',
      type: 'expense',
      title: 'Family Groceries',
      amount: 9500,
      category: 'Family',
      date: '2026-10-18',
      paymentMethod: 'Credit Card',
      createdAt: '2026-10-18T10:00:00Z',
      updatedAt: '2026-10-18T10:00:00Z'
    },
    {
      id: 'tx-5',
      type: 'expense',
      title: 'Term Life Insurance',
      amount: 12000,
      category: 'Insurance',
      date: '2026-10-22',
      paymentMethod: 'Net Banking',
      createdAt: '2026-10-22T10:00:00Z',
      updatedAt: '2026-10-22T10:00:00Z'
    },
    {
      id: 'tx-6',
      type: 'expense',
      title: 'September Electricity',
      amount: 2500,
      category: 'Utilities',
      date: '2026-09-10',
      paymentMethod: 'UPI',
      createdAt: '2026-09-10T10:00:00Z',
      updatedAt: '2026-09-10T10:00:00Z'
    }
  ];

  const sampleBudgets: Record<string, BudgetPlan> = {
    '2026-10': {
      monthKey: '2026-10',
      expectedIncome: 95000,
      categoryBudgets: {
        'Loan': 25000,
        'Credit Card': 20000,
        'Utilities': 4000,
        'Family': 12000,
        'Insurance': 12000
      }
    }
  };

  it('calculates available balance accurately including incomes and expenses', () => {
    // Initial balance: 10,000 + 90,000 (income) - (25,000 + 2,800 + 15,400 + 9,500 + 12,000 + 2,500) = 100,000 - 67,200 = 32,800
    const balance = calculateAvailableBalance(10000, sampleTransactions);
    expect(balance).toBe(32800);
  });

  it('prepares balance adjustments correctly for surplus and deficit', () => {
    // Current is 30,000, target is 35,000 -> difference is +5,000 -> income
    const surplusAdj = prepareBalanceAdjustment(30000, 35000, 'Miscellaneous');
    expect(surplusAdj.type).toBe('income');
    expect(surplusAdj.difference).toBe(5000);
    expect(surplusAdj.transaction?.amount).toBe(5000);
    expect(surplusAdj.transaction?.category).toBe('Miscellaneous');

    // Current is 30,000, target is 28,000 -> difference is -2,000 -> expense
    const deficitAdj = prepareBalanceAdjustment(30000, 28000, 'Custom Adjustment');
    expect(deficitAdj.type).toBe('expense');
    expect(deficitAdj.difference).toBe(-2000);
    expect(deficitAdj.transaction?.amount).toBe(2000);
    expect(deficitAdj.transaction?.category).toBe('Custom Adjustment');

    // No difference
    const zeroAdj = prepareBalanceAdjustment(30000, 30000);
    expect(zeroAdj.type).toBe('none');
  });

  it('calculates monthly summary with income, expense, and net savings', () => {
    const summary = calculateMonthSummary(sampleTransactions, sampleBudgets, '2026-10');
    expect(summary.totalIncome).toBe(90000);
    expect(summary.totalSpent).toBe(64700);
    expect(summary.netSavings).toBe(25300);
    expect(summary.expectedIncome).toBe(95000);

    const loanSummary = summary.categories.find(c => c.category === 'Loan');
    expect(loanSummary?.spent).toBe(25000);
  });

  it('calculates annual summary across all categories, incomes, and expenses', () => {
    const annual = calculateAnnualSummary(sampleTransactions, 2026);
    expect(annual.year).toBe(2026);
    expect(annual.totalIncome).toBe(90000);
    expect(annual.totalSpent).toBe(67200);
    expect(annual.netSavings).toBe(22800);
    expect(annual.highestCategory?.category).toBe('Loan');
    expect(annual.highestCategory?.amount).toBe(25000);
  });

  it('computes next and previous month keys accurately across year transitions', () => {
    expect(getPreviousMonthKey('2026-01')).toBe('2025-12');
    expect(getNextMonthKey('2026-12')).toBe('2027-01');
    expect(getPreviousMonthKey('2026-10')).toBe('2026-09');
    expect(getNextMonthKey('2026-10')).toBe('2026-11');
  });

  it('validates transaction inputs reliably', () => {
    expect(validateExpense({ title: '', amount: 100, category: 'Loan', date: '2026-10-10' }).isValid).toBe(false);
    expect(validateExpense({ title: 'EMI', amount: -5, category: 'Loan', date: '2026-10-10' }).isValid).toBe(false);
    expect(validateExpense({ title: 'EMI', amount: 100, category: '', date: '2026-10-10' }).isValid).toBe(false);
    expect(validateExpense({ title: 'EMI', amount: 100, category: 'Loan', date: 'invalid' }).isValid).toBe(false);
    expect(validateExpense({ title: 'Salary', amount: 50000, category: 'Salary', date: '2026-10-10' }).isValid).toBe(true);
  });
});
