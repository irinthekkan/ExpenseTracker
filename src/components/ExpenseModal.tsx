import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  IndianRupee,
  Tag,
  CreditCard,
  AlignLeft,
  Repeat,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle
} from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import {
  Expense,
  DEFAULT_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  PAYMENT_METHODS,
  PaymentMethod,
  TransactionType
} from '../types';
import { getCurrentDateStr } from '../utils/formatters';
import { validateExpense } from '../utils/calculations';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
  defaultType?: TransactionType;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  expenseToEdit,
  defaultType = 'expense'
}) => {
  const {
    addExpense,
    updateExpense,
    customCategories,
    customIncomeCategories,
    addCustomCategory
  } = useExpenses();

  const [txType, setTxType] = useState<TransactionType>(defaultType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('Loan');
  const [date, setDate] = useState(getCurrentDateStr());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [newCustomCat, setNewCustomCat] = useState('');
  const [isAddingCustomCat, setIsAddingCustomCat] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (expenseToEdit) {
      setTxType(expenseToEdit.type || 'expense');
      setTitle(expenseToEdit.title);
      setAmount(expenseToEdit.amount.toString());
      setCategory(expenseToEdit.category);
      setDate(expenseToEdit.date);
      setPaymentMethod(expenseToEdit.paymentMethod);
      setNotes(expenseToEdit.notes || '');
      setIsRecurring(!!expenseToEdit.isRecurring);
    } else {
      setTxType(defaultType);
      setTitle('');
      setAmount('');
      setCategory(defaultType === 'income' ? 'Salary' : 'Loan');
      setDate(getCurrentDateStr());
      setPaymentMethod(defaultType === 'income' ? 'Net Banking' : 'UPI');
      setNotes('');
      setIsRecurring(false);
    }
    setError(null);
    setIsAddingCustomCat(false);
  }, [expenseToEdit, isOpen, defaultType]);

  if (!isOpen) return null;

  const currentCategories = txType === 'income'
    ? Array.from(new Set([...DEFAULT_INCOME_CATEGORIES, ...customIncomeCategories]))
    : Array.from(new Set([...DEFAULT_CATEGORIES, ...customCategories]));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    const validation = validateExpense({
      title: title.trim(),
      amount: parsedAmount,
      category,
      date
    });

    if (!validation.isValid) {
      setError(validation.error || 'Please check your inputs.');
      return;
    }

    if (expenseToEdit) {
      updateExpense(expenseToEdit.id, {
        type: txType,
        title: title.trim(),
        amount: parsedAmount,
        category,
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
        isRecurring
      });
    } else {
      addExpense({
        type: txType,
        title: title.trim(),
        amount: parsedAmount,
        category,
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
        isRecurring
      });
    }

    onClose();
  };

  const handleCreateCustomCategory = () => {
    const trimmed = newCustomCat.trim();
    if (!trimmed) return;
    addCustomCategory(trimmed, txType === 'income');
    setCategory(trimmed);
    setNewCustomCat('');
    setIsAddingCustomCat(false);
  };

  const handleTypeSwitch = (type: TransactionType) => {
    setTxType(type);
    if (type === 'income') {
      setCategory('Salary');
    } else {
      setCategory('Loan');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                txType === 'income' ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
            {expenseToEdit
              ? `Edit ${txType === 'income' ? 'Income' : 'Expense'}`
              : `Record ${txType === 'income' ? 'Received Income' : 'Expense'}`}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold animate-fade-in">
              {error}
            </div>
          )}

          {/* Expense / Income Switcher */}
          {!expenseToEdit && (
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 gap-1">
              <button
                type="button"
                onClick={() => handleTypeSwitch('expense')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  txType === 'expense'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowDownCircle className="w-4 h-4 text-rose-400" />
                <span>Expense</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeSwitch('income')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  txType === 'income'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
                <span>Received Income</span>
              </button>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              Amount (₹)
            </label>
            <div className="relative">
              <span
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold ${
                  txType === 'income' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-8 pr-4 py-3 text-2xl font-black text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              {txType === 'income' ? 'Income Source / Title' : 'Expense Description / Title'}
            </label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder={
                  txType === 'income'
                    ? 'e.g. Monthly Salary, Freelance project, Rental'
                    : 'e.g. Home Loan EMI, Electricity, Grocery'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                Category
              </label>
              <button
                type="button"
                onClick={() => setIsAddingCustomCat(!isAddingCustomCat)}
                className="text-xs text-emerald-400 hover:underline font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                New Category
              </button>
            </div>

            {isAddingCustomCat && (
              <div className="flex items-center gap-2 mb-2 p-2 bg-slate-950 rounded-xl border border-slate-800 animate-fade-in">
                <input
                  type="text"
                  placeholder="Custom category name..."
                  value={newCustomCat}
                  onChange={(e) => setNewCustomCat(e.target.value)}
                  className="flex-1 bg-transparent px-2 py-1 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateCustomCategory}
                  className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-lg"
                >
                  Save
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {currentCategories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    category === cat
                      ? txType === 'income'
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold scale-105'
                        : 'bg-rose-500 text-white shadow-md shadow-rose-500/20 font-bold scale-105'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Payment Method Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                {txType === 'income' ? 'Deposit Method' : 'Payment Method'}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recurring Transaction Checkbox */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <input
              type="checkbox"
              id="recurringCheck"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-emerald-600 focus:ring-0 focus:ring-offset-0 bg-slate-900"
            />
            <label
              htmlFor="recurringCheck"
              className="text-xs text-slate-300 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Repeat className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {txType === 'income'
                  ? 'Recurring Monthly Income (e.g. Salary, Rent)'
                  : 'Recurring Monthly Expense (e.g. Loan EMI, Insurance)'}
              </span>
            </label>
          </div>

          {/* Notes Input */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5 flex items-center gap-1">
              <AlignLeft className="w-3.5 h-3.5 text-slate-500" />
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add details, account reference, deposit notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-2.5 px-4 rounded-xl text-slate-950 text-xs font-bold shadow-lg active:scale-95 transition-all ${
                txType === 'income'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-400 text-white shadow-rose-500/20'
              }`}
            >
              {expenseToEdit ? 'Save Changes' : `Record ${txType === 'income' ? 'Income' : 'Expense'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
