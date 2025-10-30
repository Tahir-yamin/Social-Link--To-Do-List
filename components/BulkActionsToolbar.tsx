import React from 'react';
import { LinkStatus } from '../types';
import { TrashIcon, CheckCircleIcon, ClockIcon, TagIcon, CancelIcon } from './icons';

interface BulkActionsToolbarProps {
  selectedCount: number;
  categories: string[];
  onBulkAction: (action: 'delete' | 'setStatus' | 'setCategory', payload?: any) => void;
  onClearSelection: () => void;
}

const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({ 
    selectedCount, 
    categories, 
    onBulkAction, 
    onClearSelection 
}) => {
  if (selectedCount === 0) {
    return null;
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      onBulkAction('setCategory', e.target.value);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 animate-fade-in-up">
      <div className="container mx-auto max-w-3xl">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
                <span className="text-sm font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 px-3 py-1 rounded-full">
                    {selectedCount} selected
                </span>
                <button
                    onClick={onClearSelection}
                    className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    aria-label="Clear selection"
                >
                    <CancelIcon className="w-5 h-5" />
                </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
                 <button 
                    onClick={() => onBulkAction('setStatus', LinkStatus.PENDING)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                    aria-label="Mark selected as pending"
                >
                    <ClockIcon className="w-4 h-4 text-orange-500" />
                    <span>Pending</span>
                </button>
                <button 
                    onClick={() => onBulkAction('setStatus', LinkStatus.DONE)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                    aria-label="Mark selected as done"
                >
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span>Done</span>
                </button>
                
                <div className="relative flex items-center">
                    <TagIcon className="absolute left-2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select 
                        onChange={handleCategoryChange}
                        className="pl-8 text-sm rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                        aria-label="Assign category to selected"
                        value="" // Uncontrolled component, value is reset on each render
                    >
                        <option value="" disabled>Assign Category...</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <button 
                    onClick={() => onBulkAction('delete')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-md"
                    aria-label="Delete selected"
                >
                    <TrashIcon className="w-4 h-4" />
                    <span>Delete</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsToolbar;