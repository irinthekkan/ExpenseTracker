import React from 'react';
import { IndianRupee, SlidersHorizontal, Plus } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenAddExpense: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings, onOpenAddExpense }) => {
  const { activeTab } = useExpenses();

  const getTitle = () => {
    switch (activeTab) {
      case 'monthly':
        return 'Monthly Expenses';
      case 'planning':
        return 'Budget Planning';
      case 'annual':
        return 'Annual Analytics';
      case 'settings':
        return 'Data & Settings';
      default:
        return 'Expense Tracker';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <IndianRupee className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight leading-none">
              Expense Tracker
            </h1>
            <p className="text-xs text-emerald-400 font-medium mt-0.5">
              {getTitle()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            title="Add Expense"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all active:scale-95"
            title="Settings and Backup"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
