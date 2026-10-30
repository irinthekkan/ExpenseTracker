import { Expense, BudgetPlan } from '../types';

export interface BackupData {
  version: string;
  exportDate: string;
  initialBalance?: number;
  expenses: Expense[];
  budgets: Record<string, BudgetPlan>;
}

export const exportToJson = (
  expenses: Expense[],
  budgets: Record<string, BudgetPlan>,
  initialBalance = 0
): string => {
  const payload: BackupData = {
    version: '1.1.0',
    exportDate: new Date().toISOString(),
    initialBalance,
    expenses,
    budgets
  };
  return JSON.stringify(payload, null, 2);
};

export const exportToCsv = (expenses: Expense[]): string => {
  const headers = ['Date', 'Type', 'Title', 'Category', 'Amount (INR)', 'Payment Method', 'Recurring', 'Notes'];
  const rows = expenses.map(e => [
    e.date,
    e.type === 'income' ? 'Income' : 'Expense',
    `"${(e.title || '').replace(/"/g, '""')}"`,
    `"${(e.category || '').replace(/"/g, '""')}"`,
    e.amount.toFixed(2),
    `"${(e.paymentMethod || '').replace(/"/g, '""')}"`,
    e.isRecurring ? 'Yes' : 'No',
    `"${(e.notes || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
};

export const parseJsonBackup = (
  jsonStr: string
): { success: boolean; data?: { expenses: Expense[]; budgets: Record<string, BudgetPlan>; initialBalance?: number }; error?: string } => {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Invalid JSON file format' };
    }

    if (!Array.isArray(parsed.expenses)) {
      return { success: false, error: 'Backup does not contain a valid expenses array' };
    }

    const validExpenses: Expense[] = parsed.expenses.filter((e: unknown): e is Expense => {
      const exp = e as Partial<Expense>;
      return (
        typeof exp.id === 'string' &&
        typeof exp.title === 'string' &&
        typeof exp.amount === 'number' &&
        typeof exp.category === 'string' &&
        typeof exp.date === 'string'
      );
    });

    const budgets = (parsed.budgets && typeof parsed.budgets === 'object') ? parsed.budgets : {};
    const initialBalance = typeof parsed.initialBalance === 'number' ? parsed.initialBalance : 0;

    return {
      success: true,
      data: {
        expenses: validExpenses,
        budgets,
        initialBalance
      }
    };
  } catch (err) {
    return { success: false, error: 'Failed to parse JSON file: ' + (err instanceof Error ? err.message : 'Unknown error') };
  }
};

export const triggerFileDownload = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
