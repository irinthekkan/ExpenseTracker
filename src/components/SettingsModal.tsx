import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Tag,
  ShieldCheck,
  IndianRupee
} from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { triggerFileDownload } from '../utils/exportImport';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    exportBackup,
    exportCsvData,
    importBackup,
    clearAllData,
    customCategories
  } = useExpenses();

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleExportJson = () => {
    const jsonStr = exportBackup();
    const filename = `ExpenseTracker_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    triggerFileDownload(jsonStr, filename, 'application/json');
    showNotice('success', 'Backup JSON downloaded successfully');
  };

  const handleExportCsv = () => {
    const csvStr = exportCsvData();
    const filename = `ExpenseTracker_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    triggerFileDownload(csvStr, filename, 'text/csv');
    showNotice('success', 'CSV report downloaded successfully');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importBackup(content);
        if (result.success) {
          showNotice('success', result.message);
        } else {
          showNotice('error', result.message);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAll = () => {
    if (
      window.confirm('Are you sure you want to delete ALL expenses and budget plans? This action cannot be undone.')
    ) {
      if (window.confirm('Final confirmation: Click OK to completely wipe local data.')) {
        clearAllData();
        showNotice('success', 'All local expense data cleared.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Data Management & Settings
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {notification && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold animate-fade-in ${
                notification.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
          )}

          {/* Currency Info */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Currency</h4>
                <p className="text-[11px] text-slate-400">Indian Rupee (₹ INR)</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-slate-800 text-emerald-400 px-2.5 py-1 rounded-lg">
              Active
            </span>
          </div>

          {/* Backup & Export Section */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Backup & Reports
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleExportJson}
                className="flex items-center gap-3 p-3.5 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 rounded-2xl text-left transition-all group"
              >
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-200">Export JSON Backup</h5>
                  <p className="text-[10px] text-slate-500">Full backup of expenses & plans</p>
                </div>
              </button>

              <button
                onClick={handleExportCsv}
                className="flex items-center gap-3 p-3.5 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 rounded-2xl text-left transition-all group"
              >
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-200">Export CSV Report</h5>
                  <p className="text-[10px] text-slate-500">Spreadsheet for Excel/Sheets</p>
                </div>
              </button>
            </div>

            {/* Restore from JSON */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 p-3 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 rounded-2xl text-slate-200 text-xs font-semibold transition-colors"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Restore from JSON Backup File</span>
              </button>
            </div>
          </div>

          {/* Custom Categories Section */}
          {customCategories.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                Your Custom Categories ({customCategories.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {customCategories.map((c) => (
                  <span
                    key={c}
                    className="text-xs bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-xl"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Privacy & Offline Guarantee */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-slate-300 space-y-1">
            <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              100% Offline & Private
            </p>
            <p className="text-slate-400">
              Your financial records never leave this device. No telemetry, no remote servers, no cloud dependency.
            </p>
          </div>

          {/* Danger Zone */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={handleClearAll}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Expenses & Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
