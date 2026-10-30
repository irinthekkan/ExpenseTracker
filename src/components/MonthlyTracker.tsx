import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  Repeat,
  Landmark,
  CreditCard,
  Zap,
  Users,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { calculateMonthSummary, getPreviousMonthKey, getNextMonthKey } from '../utils/calculations';
import { formatRupee, formatMonthYear, formatDateDisplay, getCurrentMonthKey } from '../utils/formatters';
import { Expense } from '../types';

interface MonthlyTrackerProps {
  onEditExpense: (expense: Expense) => void;
  onOpenAddExpense: () => void;
}

export const MonthlyTracker: React.FC<MonthlyTrackerProps> = ({ onEditExpense, onOpenAddExpense }) => {
  const { expenses, budgets, currentMonthKey, setCurrentMonthKey, deleteExpense } = useExpenses();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

  const summary = calculateMonthSummary(expenses, budgets, currentMonthKey);

  const handlePrevMonth = () => {
    setCurrentMonthKey(getPreviousMonthKey(currentMonthKey));
  };

  const handleNextMonth = () => {
    setCurrentMonthKey(getNextMonthKey(currentMonthKey));
  };

  const handleCurrentMonth = () => {
    setCurrentMonthKey(getCurrentMonthKey());
  };

  // Filter expenses for current month
  const monthExpenses = expenses.filter(e => {
    const matchesMonth = e.date.startsWith(currentMonthKey);
    if (!matchesMonth) return false;

    if (selectedCategoryFilter !== 'ALL' && e.category !== selectedCategoryFilter) {
      return false;
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchesTitle = e.title.toLowerCase().includes(term);
      const matchesNotes = e.notes ? e.notes.toLowerCase().includes(term) : false;
      const matchesCategory = e.category.toLowerCase().includes(term);
      const matchesPayment = e.paymentMethod.toLowerCase().includes(term);
      return matchesTitle || matchesNotes || matchesCategory || matchesPayment;
    }

    return true;
  });

  // Sort by date descending
  monthExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Percentage of budget spent
  const budgetPercent = summary.totalBudget > 0
    ? Math.min(100, Math.round((summary.totalSpent / summary.totalBudget) * 100))
    : 0;

  const isOverBudget = summary.totalBudget > 0 && summary.totalSpent > summary.totalBudget;

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'loan':
        return <Landmark className="w-4 h-4 text-rose-400" />;
      case 'credit card':
        return <CreditCard className="w-4 h-4 text-amber-400" />;
      case 'utilities':
        return <Zap className="w-4 h-4 text-cyan-400" />;
      case 'family':
        return <Users className="w-4 h-4 text-emerald-400" />;
      case 'insurance':
        return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      default:
        return <Tag className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Previous Month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-sm font-bold text-slate-100">
            {formatMonthYear(currentMonthKey)}
          </h2>
          {currentMonthKey !== getCurrentMonthKey() && (
            <button
              onClick={handleCurrentMonth}
              className="text-[11px] text-emerald-400 hover:underline font-medium"
            >
              Back to Current Month
            </button>
          )}
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Next Month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Main Budget & Spending Summary Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Spent
            </span>
            <div className="text-3xl font-extrabold text-white mt-1 tracking-tight">
              {formatRupee(summary.totalSpent)}
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Monthly Budget
            </span>
            <div className="text-base font-bold text-slate-300 mt-1">
              {summary.totalBudget > 0 ? formatRupee(summary.totalBudget) : 'Not set'}
            </div>
          </div>
        </div>

        {/* Budget Progress Bar */}
        {summary.totalBudget > 0 && (
          <div className="mt-5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className={`font-semibold ${isOverBudget ? 'text-rose-400 flex items-center gap-1' : 'text-slate-300'}`}>
                {isOverBudget ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    Over by {formatRupee(Math.abs(summary.remaining))}
                  </>
                ) : (
                  `Remaining: ${formatRupee(summary.remaining)}`
                )}
              </span>
              <span className="text-slate-400 font-medium">
                {Math.round((summary.totalSpent / summary.totalBudget) * 100)}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverBudget
                    ? 'bg-rose-500'
                    : budgetPercent > 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (summary.totalSpent / summary.totalBudget) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Category Overview Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Category Breakdown
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {summary.categories.filter(c => c.spent > 0).length} active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {summary.categories.map((cat) => {
            return (
              <div
                key={cat.category}
                onClick={() => setSelectedCategoryFilter(selectedCategoryFilter === cat.category ? 'ALL' : cat.category)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  selectedCategoryFilter === cat.category
                    ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {getCategoryIcon(cat.category)}
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {cat.category}
                    </span>
                  </div>
                  {cat.transactionCount > 0 && (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded-full">
                      {cat.transactionCount}
                    </span>
                  )}
                </div>

                <div className="text-sm font-bold text-white">
                  {formatRupee(cat.spent)}
                </div>

                {cat.budgeted > 0 && (
                  <div className="mt-1 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Plan: {formatRupee(cat.budgeted)}</span>
                    <span className={cat.remaining < 0 ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                      {cat.remaining < 0 ? `+${formatRupee(Math.abs(cat.remaining))}` : `${formatRupee(cat.remaining)} left`}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-2 pt-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {selectedCategoryFilter !== 'ALL' && (
          <button
            onClick={() => setSelectedCategoryFilter('ALL')}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{selectedCategoryFilter} ✕</span>
          </button>
        )}
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Expenses ({monthExpenses.length})
          </h3>
        </div>

        {monthExpenses.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2.5" />
            <p className="text-sm font-semibold text-slate-300">No expenses found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {searchTerm || selectedCategoryFilter !== 'ALL'
                ? 'No transactions matched your search or category filter.'
                : 'No expenses recorded for this month yet.'}
            </p>
            <button
              onClick={onOpenAddExpense}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              + Record Expense
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {monthExpenses.map((expense) => (
              <div
                key={expense.id}
                className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                    {getCategoryIcon(expense.category)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-100 truncate">
                        {expense.title}
                      </h4>
                      {expense.isRecurring && (
                        <span title="Recurring monthly expense">
                          <Repeat className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span>{formatDateDisplay(expense.date)}</span>
                      <span>•</span>
                      <span className="font-medium text-slate-300">{expense.category}</span>
                      <span>•</span>
                      <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px]">
                        {expense.paymentMethod}
                      </span>
                    </div>

                    {expense.notes && (
                      <p className="text-xs text-slate-500 mt-1 truncate italic">
                        {expense.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-white tracking-tight">
                    {formatRupee(expense.amount)}
                  </span>

                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditExpense(expense)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${expense.title}" (${formatRupee(expense.amount)})?`)) {
                          deleteExpense(expense.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
