import { describe, it, expect } from 'vitest';
import { exportToJson, exportToCsv, parseJsonBackup } from '../exportImport';
import { Expense, BudgetPlan } from '../../types';

describe('Export and Import Utility', () => {
  const sampleExpenses: Expense[] = [
    {
      id: 'e1',
      title: 'Car Loan',
      amount: 14500,
      category: 'Loan',
      date: '2026-10-01',
      paymentMethod: 'Net Banking',
      notes: 'Car EMI for October',
      isRecurring: true,
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z'
    }
  ];

  const sampleBudgets: Record<string, BudgetPlan> = {
    '2026-10': {
      monthKey: '2026-10',
      totalBudget: 50000,
      categoryBudgets: { 'Loan': 15000 }
    }
  };

  it('exports valid JSON and parses it back faithfully', () => {
    const jsonStr = exportToJson(sampleExpenses, sampleBudgets);
    const result = parseJsonBackup(jsonStr);

    expect(result.success).toBe(true);
    expect(result.data?.expenses).toHaveLength(1);
    expect(result.data?.expenses[0].title).toBe('Car Loan');
    expect(result.data?.expenses[0].amount).toBe(14500);
    expect(result.data?.budgets['2026-10'].totalBudget).toBe(50000);
  });

  it('exports properly structured CSV content', () => {
    const csvStr = exportToCsv(sampleExpenses);
    expect(csvStr).toContain('Date,Title,Category,Amount (INR),Payment Method,Recurring,Notes');
    expect(csvStr).toContain('"Car Loan","Loan",14500.00,"Net Banking",Yes,"Car EMI for October"');
  });

  it('handles invalid JSON gracefully', () => {
    const result = parseJsonBackup('{ bad json ');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();

    const result2 = parseJsonBackup(JSON.stringify({ notExpenses: true }));
    expect(result2.success).toBe(false);
  });
});
