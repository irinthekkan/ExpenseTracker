import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { MonthlyTracker } from './components/MonthlyTracker';
import { MonthlyPlanning } from './components/MonthlyPlanning';
import { AnnualView } from './components/AnnualView';
import { ExpenseModal } from './components/ExpenseModal';
import { SettingsModal } from './components/SettingsModal';
import { BalanceAdjustmentModal } from './components/BalanceAdjustmentModal';
import { useExpenses } from './context/ExpenseContext';
import { Expense } from './types';

export const AppContent: React.FC = () => {
  const { activeTab } = useExpenses();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const handleOpenAddExpense = () => {
    setExpenseToEdit(null);
    setIsExpenseModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsExpenseModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Navbar */}
      <Navbar
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAddExpense={handleOpenAddExpense}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 pt-4">
        {activeTab === 'monthly' && (
          <div className="animate-fade-in">
            <MonthlyTracker
              onEditExpense={handleEditExpense}
              onOpenAddExpense={handleOpenAddExpense}
              onOpenBalanceModal={() => setIsBalanceModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'planning' && (
          <div className="animate-fade-in">
            <MonthlyPlanning />
          </div>
        )}

        {activeTab === 'annual' && (
          <div className="animate-fade-in">
            <AnnualView />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav onOpenAddExpense={handleOpenAddExpense} />

      {/* Add / Edit Transaction Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setExpenseToEdit(null);
        }}
        expenseToEdit={expenseToEdit}
      />

      {/* Update & Adjust Balance Modal */}
      <BalanceAdjustmentModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
      />

      {/* Settings & Backup Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
