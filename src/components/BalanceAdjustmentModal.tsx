import React, { useState } from 'react';
import { X, Wallet, ArrowUpRight, ArrowDownRight, CheckCircle2, Tag } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { formatRupee } from '../utils/formatters';
import { DEFAULT_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../types';

interface BalanceAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BalanceAdjustmentModal: React.FC<BalanceAdjustmentModalProps> = ({ isOpen, onClose }) => {
  const { availableBalance, adjustBalance, customCategories, customIncomeCategories } = useExpenses();
  const [targetBalanceInput, setTargetBalanceInput] = useState('');
  const [category, setCategory] = useState('Miscellaneous');
  const [customCatInput, setCustomCatInput] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const parsedTarget = parseFloat(targetBalanceInput);
  const isValidTarget = !isNaN(parsedTarget) && parsedTarget >= 0;
  const difference = isValidTarget ? parsedTarget - availableBalance : 0;
  const isSurplus = difference > 0;
  const absDifference = Math.abs(difference);

  const selectedCategory = isCustomCategory ? (customCatInput.trim() || 'Miscellaneous') : category;

  const handleProceedToConfirm = () => {
    if (!isValidTarget) return;
    if (Math.abs(difference) < 0.01) {
      alert('Your actual balance matches your current tracked balance. No adjustment needed.');
      return;
    }
    setStep('confirm');
  };

  const handleExecuteAdjustment = () => {
    const res = adjustBalance(
      parsedTarget,
      selectedCategory,
      notes.trim() || undefined
    );

    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        setSuccessMessage(null);
        setStep('input');
        setTargetBalanceInput('');
        onClose();
      }, 1800);
    }
  };

  const handleResetAndClose = () => {
    setStep('input');
    setTargetBalanceInput('');
    setCategory('Miscellaneous');
    setIsCustomCategory(false);
    setCustomCatInput('');
    setNotes('');
    setSuccessMessage(null);
    onClose();
  };

  const categoryOptions = isSurplus
    ? Array.from(new Set([...DEFAULT_INCOME_CATEGORIES, ...customIncomeCategories, 'Miscellaneous']))
    : Array.from(new Set([...DEFAULT_CATEGORIES, ...customCategories, 'Miscellaneous']));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            Update & Adjust Current Balance
          </h3>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {successMessage ? (
            <div className="py-8 text-center space-y-3 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white">Balance Adjusted!</h4>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">{successMessage}</p>
            </div>
          ) : step === 'input' ? (
            <>
              {/* Current Tracked Balance */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Current Tracked Balance
                  </span>
                  <div className="text-2xl font-black text-slate-100 mt-0.5">
                    {formatRupee(availableBalance)}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
                  <Wallet className="w-6 h-6 text-emerald-400" />
                </div>
              </div>

              {/* Target / Actual Balance Input */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Actual Balance in your Bank / Wallet (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-emerald-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="Enter actual balance..."
                    value={targetBalanceInput}
                    onChange={(e) => setTargetBalanceInput(e.target.value)}
                    autoFocus
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-8 pr-4 py-3 text-2xl font-black text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Live Difference Indicator */}
              {isValidTarget && Math.abs(difference) > 0.01 && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs space-y-1.5 animate-fade-in ${
                    isSurplus
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      {isSurplus ? (
                        <>
                          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                          Surplus to Add to Income:
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="w-4 h-4 text-rose-400" />
                          Difference to Add to Expenses:
                        </>
                      )}
                    </span>
                    <span className="text-sm">
                      {isSurplus ? '+' : '-'} {formatRupee(absDifference)}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80">
                    {isSurplus
                      ? `Your actual balance is higher by ${formatRupee(absDifference)}. After confirmation, this will be recorded as Income to balance your accounts.`
                      : `Your actual balance is lower by ${formatRupee(absDifference)}. This unrecorded spending will be added to your Expenses to balance your accounts.`}
                  </p>
                </div>
              )}

              {/* Category Selection */}
              {isValidTarget && Math.abs(difference) > 0.01 && (
                <div className="space-y-2 pt-1 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      Adjustment Category (Defaults to Miscellaneous)
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomCategory(!isCustomCategory)}
                      className="text-xs text-emerald-400 hover:underline font-medium"
                    >
                      {isCustomCategory ? 'Select from list' : '+ Custom Category'}
                    </button>
                  </div>

                  {isCustomCategory ? (
                    <input
                      type="text"
                      placeholder="Type custom category name..."
                      value={customCatInput}
                      onChange={(e) => setCustomCatInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {categoryOptions.map((cat) => (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            category === cat
                              ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                              : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProceedToConfirm}
                  disabled={!isValidTarget || Math.abs(difference) < 0.01}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all"
                >
                  Review & Adjust
                </button>
              </div>
            </>
          ) : (
            /* Confirmation Step */
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-2">
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  Confirm Balance Adjustment
                </h4>
                <p>
                  Please confirm adjusting your tracked balance from{' '}
                  <span className="font-bold text-white">{formatRupee(availableBalance)}</span> to{' '}
                  <span className="font-bold text-emerald-400">{formatRupee(parsedTarget)}</span>.
                </p>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1 text-slate-200">
                  <div className="flex justify-between">
                    <span>Adjustment Type:</span>
                    <span className="font-bold text-white uppercase">{isSurplus ? 'Income' : 'Expense'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Adjustment Amount:</span>
                    <span className="font-bold text-emerald-400">{formatRupee(absDifference)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span className="font-bold text-white">{selectedCategory}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  Optional Note / Memo
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bank reconciliation, cash unaccounted"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleExecuteAdjustment}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  Confirm & Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
