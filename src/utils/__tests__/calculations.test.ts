import { describe, it, expect } from 'vitest';
import {
  calculateMonthSummary,
  calculateAnnualSummary,
  getPreviousMonthKey,
  getNextMonthKey,
  validateExpense
} from '../calculations';
import { Expense, BudgetPlan } from '../../types';

describe('Calculations Utility', () => {
  const sampleExpenses: Expense[] = [
    {
      id: '1',
      title: 'Home Loan EMI',
      amount: 25000,
      category: 'Loan',
      date: '2026-10-05',
      paymentMethod: 'Net Banking',
      createdAt: '2026-10-05T10:00:00Z',
      updatedAt: '2026-10-05T10:00:00Z'
    },
    {
      id: '2',
      title: 'Electricity Bill',
      amount: 2800,
      category: 'Utilities',
      date: '2026-10-10',
      paymentMethod: 'UPI',
      createdAt: '2026-10-10T10:00:00Z',
      updatedAt: '2026-10-10T10:00:00Z'
    },
    {
      id: '3',
      title: 'Credit Card Bill',
      amount: 15400,
      category: 'Credit Card',
      date: '2026-10-15',
      paymentMethod: 'UPI',
      createdAt: '2026-10-15T10:00:00Z',
      updatedAt: '2026-10-15T10:00:00Z'
    },
    {
      id: '4',
      title: 'Family Groceries',
      amount: 9500,
      category: 'Family',
      date: '2026-10-18',
      paymentMethod: 'Credit Card',
      createdAt: '2026-10-18T10:00:00Z',
      updatedAt: '2026-10-18T10:00:00Z'
    },
    {
      id: '5',
      title: 'Term Life Insurance',
      amount: 12000,
      category: 'Insurance',
      date: '2026-10-22',
      paymentMethod: 'Net Banking',
      createdAt: '2026-10-22T10:00:00Z',
      updatedAt: '2026-10-22T10:00:00Z'
    },
    {
      id: '6',
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
      totalBudget: 70000,
      categoryBudgets: {
        'Loan': 25000,
        'Credit Card': 20000,
        'Utilities': 4000,
        'Family': 12000,
        'Insurance': 12000
      }
    }
  };

  it('calculates monthly summary correctly for a given month', () => {
    const summary = calculateMonthSummary(sampleExpenses, sampleBudgets, '2026-10');
    // 25000 + 2800 + 15400 + 9500 + 12000 = 64700
    expect(summary.totalSpent).toBe(64700);
    expect(summary.totalBudget).toBe(70000);
    expect(summary.remaining).toBe(5300);

    const loanSummary = summary.categories.find(c => c.category === 'Loan');
    expect(loanSummary).toBeDefined();
    expect(loanSummary?.spent).toBe(25000);
    expect(loanSummary?.budgeted).toBe(25000);
    expect(loanSummary?.remaining).toBe(0);

    const utilitiesSummary = summary.categories.find(c => c.category === 'Utilities');
    expect(utilitiesSummary?.spent).toBe(2800);
    expect(utilitiesSummary?.budgeted).toBe(4000);
    expect(utilitiesSummary?.remaining).toBe(1200);
  });

  it('calculates annual summary across all categories and 12 months', () => {
    const annual = calculateAnnualSummary(sampleExpenses, 2026);
    expect(annual.year).toBe(2026);
    // 64700 in Oct + 2500 in Sep = 67200
    expect(annual.totalSpent).toBe(67200);
    expect(annual.highestCategory?.category).toBe('Loan');
    expect(annual.highestCategory?.amount).toBe(25000);
    expect(annual.highestMonth?.monthKey).toBe('2026-10');
    expect(annual.highestMonth?.amount).toBe(64700);

    const sepMonth = annual.monthlyBreakdown.find(m => m.monthKey === '2026-09');
    expect(sepMonth?.total).toBe(2500);
    expect(sepMonth?.categories['Utilities']).toBe(2500);
  });

  it('computes next and previous month keys accurately across year transitions', () => {
    expect(getPreviousMonthKey('2026-01')).toBe('2025-12');
    expect(getNextMonthKey('2026-12')).toBe('2027-01');
    expect(getPreviousMonthKey('2026-10')).toBe('2026-09');
    expect(getNextMonthKey('2026-10')).toBe('2026-11');
  });

  it('validates expense inputs reliably', () => {
    expect(validateExpense({ title: '', amount: 100, category: 'Loan', date: '2026-10-10' }).isValid).toBe(false);
    expect(validateExpense({ title: 'EMI', amount: -5, category: 'Loan', date: '2026-10-10' }).isValid).toBe(false);
    expect(validateExpense({ title: 'EMI', amount: 100, category: '', date: '2026-10-10' }).isValid).toBe(false);
    expect(validateExpense({ title: 'EMI', amount: 100, category: 'Loan', date: 'invalid' }).isValid).toBe(false);
    expect(validateExpense({ title: 'EMI', amount: 5000, category: 'Loan', date: '2026-10-10' }).isValid).toBe(true);
  });
});
