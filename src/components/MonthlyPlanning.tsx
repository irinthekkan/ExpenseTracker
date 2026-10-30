import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Save,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Landmark,
  CreditCard,
  Zap,
  Users,
  ShieldCheck,
  Tag,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank
} from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { calculateMonthSummary, getPreviousMonthKey, getNextMonthKey } from '../utils/calculations';
import { formatRupee, formatMonthYear } from '../utils/formatters';
import { DEFAULT_CATEGORIES, BudgetPlan } from '../types';

export const MonthlyPlanning: React.FC = () => {
  const {
    expenses,
    budgets,
    currentMonthKey,
    setCurrentMonthKey,
    setMonthlyBudget,
    copyBudgetFromPreviousMonth,
    customCategories,
    addCustomCategory
  } = useExpenses();

  const currentPlan = budgets[currentMonthKey] || {
    monthKey: currentMonthKey,
    expectedIncome: 0,
    categoryBudgets: {}
  };

  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>({});
  const [expectedIncomeInput, setExpectedIncomeInput] = useState<string>('');
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [newCatInput, setNewCatInput] = useState<string>('');
  const [showAddCat, setShowAddCat] = useState<boolean>(false);

  const summary = calculateMonthSummary(expenses, budgets, currentMonthKey);

  // Sync state whenever month or budget updates
  useEffect(() => {
    setCategoryBudgets(currentPlan.categoryBudgets || {});
    setExpectedIncomeInput(
      currentPlan.expectedIncome !== undefined && currentPlan.expectedIncome > 0
        ? currentPlan.expectedIncome.toString()
        : ''
    );
  }, [currentMonthKey, budgets]);

  const handlePrevMonth = () => {
    setCurrentMonthKey(getPreviousMonthKey(currentMonthKey));
  };

  const handleNextMonth = () => {
    setCurrentMonthKey(getNextMonthKey(currentMonthKey));
  };

  const handleCategoryAmountChange = (category: string, value: string) => {
    const num = parseFloat(value) || 0;
    setCategoryBudgets(prev => ({
      ...prev,
      [category]: Math.max(0, num)
    }));
  };

  const handleSavePlan = () => {
    const parsedExpectedIncome = parseFloat(expectedIncomeInput) || 0;

    const plan: BudgetPlan = {
      monthKey: currentMonthKey,
      expectedIncome: parsedExpectedIncome,
      categoryBudgets
    };

    setMonthlyBudget(plan);
    setSavedMessage('Monthly income & expense plan saved!');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const handleCopyPrevious = () => {
    const success = copyBudgetFromPreviousMonth(currentMonthKey);
    if (success) {
      setSavedMessage('Copied plan from previous month!');
      setTimeout(() => setSavedMessage(null), 3000);
    } else {
      alert('No budget plan found in the previous month to copy.');
    }
  };

  const handleAddCategory = () => {
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    addCustomCategory(trimmed);
    setCategoryBudgets(prev => ({ ...prev, [trimmed]: 0 }));
    setNewCatInput('');
    setShowAddCat(false);
  };

  const allPlanningCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...customCategories]));

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

  const sumOfPlannedExpenses = Object.values(categoryBudgets).reduce((a, b) => a + b, 0);
  const parsedExpectedIncome = parseFloat(expectedIncomeInput) || 0;
  const plannedNetSavings = parsedExpectedIncome - sumOfPlannedExpenses;

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
          <span className="text-[11px] text-slate-400 font-medium">Monthly Financial Planning</span>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Next Month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Expected Income Input Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              Expected Income this Month
            </span>
            <div className="relative mt-2">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-black text-emerald-400">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="1000"
                placeholder="Enter expected salary/income..."
                value={expectedIncomeInput}
                onChange={(e) => setExpectedIncomeInput(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-8 pr-4 py-2.5 text-2xl font-black text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <span>Received so far:</span>
              <span className="font-bold text-emerald-400">{formatRupee(summary.totalIncome)}</span>
              {parsedExpectedIncome > 0 && (
                <span className="text-[11px] text-slate-500">
                  ({Math.round((summary.totalIncome / parsedExpectedIncome) * 100)}% received)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Planned Net Savings Row */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
              Planned Category Expenses
            </span>
            <div className="text-base font-black text-white mt-0.5">
              {formatRupee(sumOfPlannedExpenses)}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Actual spent: {formatRupee(summary.totalSpent)}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <PiggyBank className="w-3.5 h-3.5 text-emerald-400" />
              Expected Net Savings
            </span>
            <div
              className={`text-base font-black mt-0.5 ${
                plannedNetSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {plannedNetSavings >= 0 ? `+${formatRupee(plannedNetSavings)}` : formatRupee(plannedNetSavings)}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              (Expected Income - Planned Expenses)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80">
          <button
            onClick={handleCopyPrevious}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>Copy Prev Month Plan</span>
          </button>

          <button
            onClick={handleSavePlan}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Monthly Plan</span>
          </button>
        </div>

        {savedMessage && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-medium justify-center bg-emerald-950/40 border border-emerald-500/20 py-1.5 px-3 rounded-xl animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{savedMessage}</span>
          </div>
        )}
      </div>

      {/* Category Expense Allocations */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-emerald-400" />
            Planned Category Expenses
          </h3>

          <button
            onClick={() => setShowAddCat(!showAddCat)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Custom Category
          </button>
        </div>

        {showAddCat && (
          <div className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl animate-fade-in">
            <input
              type="text"
              placeholder="e.g. Subscriptions, Travel"
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleAddCategory}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg"
            >
              Add
            </button>
          </div>
        )}

        <div className="space-y-2.5">
          {allPlanningCategories.map((category) => {
            const currentCatSpent = summary.categories.find(c => c.category === category)?.spent || 0;
            const plannedAmount = categoryBudgets[category] || 0;
            const diff = plannedAmount > 0 ? plannedAmount - currentCatSpent : 0;
            const isExceeded = plannedAmount > 0 && currentCatSpent > plannedAmount;
            const percentSpent = plannedAmount > 0 ? Math.min(100, (currentCatSpent / plannedAmount) * 100) : 0;

            return (
              <div
                key={category}
                className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                      {getCategoryIcon(category)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100">{category}</h4>
                      <p className="text-[11px] text-slate-400">
                        Spent so far:{' '}
                        <span className="font-semibold text-slate-300">{formatRupee(currentCatSpent)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="w-36">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        placeholder="0"
                        value={categoryBudgets[category] !== undefined ? categoryBudgets[category] : ''}
                        onChange={(e) => handleCategoryAmountChange(category, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-6 pr-3 py-1.5 text-xs font-bold text-right text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {plannedAmount > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">
                        {Math.round((currentCatSpent / plannedAmount) * 100)}% utilized
                      </span>
                      <span
                        className={`font-semibold flex items-center gap-1 ${
                          isExceeded ? 'text-rose-400' : 'text-slate-400'
                        }`}
                      >
                        {isExceeded ? (
                          <>
                            <TrendingUp className="w-3 h-3 text-rose-400" />
                            Over by {formatRupee(Math.abs(diff))}
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3 h-3 text-emerald-400" />
                            {formatRupee(diff)} remaining
                          </>
                        )}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isExceeded ? 'bg-rose-500' : percentSpent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, percentSpent)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
