import React from 'react';
import { Calendar, Target, BarChart3, Plus } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { ActiveTab } from '../types';

interface BottomNavProps {
  onOpenAddExpense: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenAddExpense }) => {
  const { activeTab, setActiveTab } = useExpenses();

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'monthly', label: 'Monthly', icon: Calendar },
    { id: 'planning', label: 'Planning', icon: Target },
    { id: 'annual', label: 'Annual', icon: BarChart3 }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1 px-4">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-400 font-semibold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5"></span>
              )}
            </button>
          );
        })}

        {/* Floating Quick-Add button in nav */}
        <button
          onClick={onOpenAddExpense}
          className="flex flex-col items-center justify-center p-2 -mt-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/30 hover:brightness-110 active:scale-90 transition-all"
          title="Add Expense"
        >
          <Plus className="w-6 h-6 stroke-[2.8]" />
        </button>
      </div>
    </div>
  );
};
