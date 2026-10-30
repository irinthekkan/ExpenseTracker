import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  Repeat,
  Landmark,
  CreditCard,
  Zap,
  Users,
  ShieldCheck,
  Tag,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { calculateMonthSummary, getPreviousMonthKey, getNextMonthKey } from '../utils/calculations';
import { formatRupee, formatMonthYear, formatDateDisplay, getCurrentMonthKey } from '../utils/formatters';
import { Expense } from '../types';

interface MonthlyTrackerProps {
  onEditExpense: (expense: Expense) => void;
  onOpenAddExpense: () => void;
  onOpenBalanceModal: () => void;
}

export const MonthlyTracker: React.FC<MonthlyTrackerProps> = ({
  onEditExpense,
  onOpenAddExpense,
  onOpenBalanceModal
}) => {
  const {
    expenses,
    budgets,
    availableBalance,
    currentMonthKey,
    setCurrentMonthKey,
    deleteExpense
  } = useExpenses();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');
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

  // Filter transactions for current month
  const monthTransactions = expenses.filter(e => {
    const matchesMonth = e.date.startsWith(currentMonthKey);
    if (!matchesMonth) return false;

    if (typeFilter === 'EXPENSE' && e.type === 'income') return false;
    if (typeFilter === 'INCOME' && (!e.type || e.type === 'expense')) return false;

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
  monthTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getCategoryIcon = (category: string, isIncome = false) => {
    if (isIncome) {
      return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
    }
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

      {/* Available Balance Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />

        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" />
              Available Balance
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white mt-1.5 tracking-tight">
              {formatRupee(availableBalance)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Current total balance across accounts
            </p>
          </div>

          <button
            onClick={onOpenBalanceModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-xs font-semibold text-emerald-400 shadow-md transition-all active:scale-95"
            title="Update actual balance & auto-adjust difference"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Update Balance</span>
          </button>
        </div>

        {/* Monthly Cashflow Metrics */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-800/80">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              Received Income
            </span>
            <div className="text-sm sm:text-base font-extrabold text-emerald-400 mt-0.5">
              {formatRupee(summary.totalIncome)}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3 text-rose-400" />
              Total Expenses
            </span>
            <div className="text-sm sm:text-base font-extrabold text-rose-400 mt-0.5">
              {formatRupee(summary.totalSpent)}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Net Savings
            </span>
            <div
              className={`text-sm sm:text-base font-extrabold mt-0.5 ${
                summary.netSavings >= 0 ? 'text-emerald-300' : 'text-rose-400'
              }`}
            >
              {summary.netSavings >= 0 ? `+${formatRupee(summary.netSavings)}` : formatRupee(summary.netSavings)}
            </div>
          </div>
        </div>
      </div>

      {/* Category Overview Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Expenses by Category
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {summary.categories.filter(c => c.spent > 0).length} active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {summary.categories.map((cat) => (
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
                  <span>Target: {formatRupee(cat.budgeted)}</span>
                  <span className={cat.remaining < 0 ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                    {cat.remaining < 0 ? `+${formatRupee(Math.abs(cat.remaining))}` : `${formatRupee(cat.remaining)} left`}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-2 pt-1">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              typeFilter === 'ALL'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setTypeFilter('EXPENSE')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              typeFilter === 'EXPENSE'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Expenses Only
          </button>
          <button
            onClick={() => setTypeFilter('INCOME')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              typeFilter === 'INCOME'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Income Only
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, note, or category..."
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
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Transactions ({monthTransactions.length})
          </h3>
        </div>

        {monthTransactions.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2.5" />
            <p className="text-sm font-semibold text-slate-300">No transactions found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {searchTerm || selectedCategoryFilter !== 'ALL' || typeFilter !== 'ALL'
                ? 'No transactions matched your current filters.'
                : 'No transactions recorded for this month yet.'}
            </p>
            <button
              onClick={onOpenAddExpense}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Record Transaction
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {monthTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={tx.id}
                  className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-800'
                      }`}
                    >
                      {getCategoryIcon(tx.category, isIncome)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-100 truncate">
                          {tx.title}
                        </h4>
                        {tx.isRecurring && (
                          <span title="Recurring monthly transaction">
                            <Repeat className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span>{formatDateDisplay(tx.date)}</span>
                        <span>•</span>
                        <span className="font-medium text-slate-300">{tx.category}</span>
                        <span>•</span>
                        <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px]">
                          {tx.paymentMethod}
                        </span>
                      </div>

                      {tx.notes && (
                        <p className="text-xs text-slate-500 mt-1 truncate italic">
                          {tx.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-sm font-bold tracking-tight ${
                        isIncome ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {isIncome ? `+ ${formatRupee(tx.amount)}` : `- ${formatRupee(tx.amount)}`}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditExpense(tx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${tx.title}" (${formatRupee(tx.amount)})?`)) {
                            deleteExpense(tx.id);
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
