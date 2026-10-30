import { describe, it, expect } from 'vitest';
import { exportToJson, exportToCsv, parseJsonBackup } from '../exportImport';
import { Expense, BudgetPlan } from '../../types';

describe('Export and Import Utility', () => {
  const sampleTransactions: Expense[] = [
    {
      id: 'e1',
      type: 'income',
      title: 'October Salary',
      amount: 85000,
      category: 'Salary',
      date: '2026-10-01',
      paymentMethod: 'Net Banking',
      notes: 'Monthly salary deposit',
      isRecurring: true,
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z'
    },
    {
      id: 'e2',
      type: 'expense',
      title: 'Car Loan',
      amount: 14500,
      category: 'Loan',
      date: '2026-10-05',
      paymentMethod: 'Net Banking',
      notes: 'Car EMI for October',
      isRecurring: true,
      createdAt: '2026-10-05T00:00:00Z',
      updatedAt: '2026-10-05T00:00:00Z'
    }
  ];

  const sampleBudgets: Record<string, BudgetPlan> = {
    '2026-10': {
      monthKey: '2026-10',
      expectedIncome: 85000,
      categoryBudgets: { 'Loan': 15000 }
    }
  };

  it('exports valid JSON and parses it back faithfully including initialBalance and transaction types', () => {
    const jsonStr = exportToJson(sampleTransactions, sampleBudgets, 25000);
    const result = parseJsonBackup(jsonStr);

    expect(result.success).toBe(true);
    expect(result.data?.initialBalance).toBe(25000);
    expect(result.data?.expenses).toHaveLength(2);
    expect(result.data?.expenses[0].type).toBe('income');
    expect(result.data?.expenses[0].title).toBe('October Salary');
    expect(result.data?.expenses[1].type).toBe('expense');
    expect(result.data?.budgets['2026-10'].expectedIncome).toBe(85000);
  });

  it('exports properly structured CSV content with Type column', () => {
    const csvStr = exportToCsv(sampleTransactions);
    expect(csvStr).toContain('Date,Type,Title,Category,Amount (INR),Payment Method,Recurring,Notes');
    expect(csvStr).toContain('2026-10-01,Income,"October Salary","Salary",85000.00,"Net Banking",Yes,"Monthly salary deposit"');
    expect(csvStr).toContain('2026-10-05,Expense,"Car Loan","Loan",14500.00,"Net Banking",Yes,"Car EMI for October"');
  });

  it('handles invalid JSON gracefully', () => {
    const result = parseJsonBackup('{ bad json ');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();

    const result2 = parseJsonBackup(JSON.stringify({ notExpenses: true }));
    expect(result2.success).toBe(false);
  });
});
