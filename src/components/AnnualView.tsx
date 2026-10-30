import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Calendar,
  Landmark,
  CreditCard,
  Zap,
  Users,
  ShieldCheck,
  Tag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { calculateAnnualSummary } from '../utils/calculations';
import { formatRupee, getCategoryColor } from '../utils/formatters';

export const AnnualView: React.FC = () => {
  const { expenses, currentYear, setCurrentYear, setCurrentMonthKey, setActiveTab } = useExpenses();
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const annual = calculateAnnualSummary(expenses, currentYear);

  const handlePrevYear = () => {
    setCurrentYear(currentYear - 1);
  };

  const handleNextYear = () => {
    setCurrentYear(currentYear + 1);
  };

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

  const maxMonthSpend = Math.max(...annual.monthlyBreakdown.map(m => m.total), 1);

  return (
    <div className="space-y-4 pb-20">
      {/* Year Selector */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5">
        <button
          onClick={handlePrevYear}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Previous Year"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-base font-extrabold text-slate-100 tracking-tight">
            Year {currentYear}
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">Annual Expense Overview</span>
        </div>

        <button
          onClick={handleNextYear}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Next Year"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-4 shadow-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Annual Spend
          </span>
          <div className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
            {formatRupee(annual.totalSpent)}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">For all 12 months</span>
        </div>

        <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-4 shadow-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Monthly Average
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 tracking-tight">
            {formatRupee(annual.monthlyAverage)}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Active months avg</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Top Category</span>
          </div>
          <div className="text-sm font-bold text-slate-100 mt-1 truncate">
            {annual.highestCategory ? annual.highestCategory.category : 'N/A'}
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {annual.highestCategory ? formatRupee(annual.highestCategory.amount) : '₹0'}
          </span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
            <span>Peak Month</span>
          </div>
          <div className="text-sm font-bold text-slate-100 mt-1 truncate">
            {annual.highestMonth ? annual.highestMonth.monthName : 'N/A'}
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {annual.highestMonth ? formatRupee(annual.highestMonth.amount) : '₹0'}
          </span>
        </div>
      </div>

      {/* Annual Category Breakdown */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4.5 space-y-3.5 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Expenses by Category ({currentYear})
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {annual.categories.filter(c => c.amount > 0).length} active
          </span>
        </div>

        <div className="space-y-3">
          {annual.categories.map((cat) => {
            const colors = getCategoryColor(cat.category);
            return (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center">
                      {getCategoryIcon(cat.category)}
                    </div>
                    <span className="font-semibold text-slate-200">{cat.category}</span>
                    {cat.count > 0 && (
                      <span className="text-[10px] text-slate-400">({cat.count} txns)</span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-white mr-2">{formatRupee(cat.amount)}</span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {cat.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                    style={{ width: `${Math.min(100, cat.percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 12-Month Trends Breakdown */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Monthly Distribution (Jan - Dec)
          </h3>
        </div>

        <div className="space-y-2">
          {annual.monthlyBreakdown.map((m) => {
            const isExpanded = expandedMonth === m.monthKey;
            const percentageOfPeak = maxMonthSpend > 0 ? (m.total / maxMonthSpend) * 100 : 0;
            const hasData = m.total > 0;

            return (
              <div
                key={m.monthKey}
                className="bg-slate-900/70 border border-slate-800/80 rounded-2xl overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedMonth(isExpanded ? null : m.monthKey)}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-300 w-10">
                      {m.monthName}
                    </span>

                    <div className="w-24 sm:w-36 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, percentageOfPeak)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {formatRupee(m.total)}
                    </span>
                    {hasData && (
                      <span className="text-slate-500">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Month Details */}
                {isExpanded && hasData && (
                  <div className="p-3.5 bg-slate-950/60 border-t border-slate-800/80 space-y-2.5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase">
                        Category Breakdown for {m.monthName}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentMonthKey(m.monthKey);
                          setActiveTab('monthly');
                        }}
                        className="text-[11px] text-emerald-400 hover:underline font-medium"
                      >
                        Open in Monthly Tracker →
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(m.categories).map(([category, amount]) => (
                        <div
                          key={category}
                          className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            {getCategoryIcon(category)}
                            <span className="text-xs text-slate-300 truncate">{category}</span>
                          </div>
                          <span className="text-xs font-bold text-white shrink-0">
                            {formatRupee(amount)}
                          </span>
                        </div>
                      ))}
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
