import React from 'react';
import { LinkStatus, SortConfig, SortDirection, SortKey } from '../types';
import { ArrowDownIcon, ArrowUpIcon } from './icons';

interface FilterControlsProps {
    currentFilter: LinkStatus | 'ALL';
    onFilterChange: (filter: LinkStatus | 'ALL') => void;
    categoryFilter: string;
    onCategoryFilterChange: (category: string) => void;
    categories: string[];
    sortConfig: SortConfig;
    onSortChange: (config: SortConfig) => void;
    onClearCompleted: () => void;
    hasCompletedItems: boolean;
}

const FilterButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ isActive, onClick, children }) => {
    const baseClasses = "px-3 py-1 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors";
    const activeClasses = "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300";
    const inactiveClasses = "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700";
    
    return (
        <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {children}
        </button>
    );
};


const FilterControls: React.FC<FilterControlsProps> = ({ 
    currentFilter, 
    onFilterChange, 
    categoryFilter,
    onCategoryFilterChange,
    categories,
    sortConfig, 
    onSortChange, 
    onClearCompleted, 
    hasCompletedItems 
}) => {
  
  const handleSortKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange({ ...sortConfig, key: e.target.value as SortKey });
  };

  const toggleSortDirection = () => {
    onSortChange({ ...sortConfig, direction: sortConfig.direction === 'ASC' ? 'DESC' : 'ASC' });
  };

  return (
    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4 flex-wrap">
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
        {/* Filter Controls */}
        <div className="flex items-center gap-2">
            <label htmlFor="category-filter" className="text-sm font-medium text-slate-600 dark:text-slate-300 shrink-0">Filter by</label>
            <select 
                id="category-filter"
                value={categoryFilter}
                onChange={(e) => onCategoryFilterChange(e.target.value)}
                className="text-sm rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
            >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'ALL' ? 'All Categories' : cat}</option>
                ))}
            </select>
            <FilterButton isActive={currentFilter === LinkStatus.PENDING} onClick={() => onFilterChange(LinkStatus.PENDING)}>
            Pending
            </FilterButton>
            <FilterButton isActive={currentFilter === LinkStatus.DONE} onClick={() => onFilterChange(LinkStatus.DONE)}>
            Done
            </FilterButton>
            <FilterButton isActive={currentFilter === 'ALL'} onClick={() => onFilterChange('ALL')}>
            All Statuses
            </FilterButton>
        </div>
        
        {/* Sorting Controls */}
        <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 pt-3 sm:pt-0 sm:pl-4">
            <label htmlFor="sort-by" className="text-sm font-medium text-slate-600 dark:text-slate-300">Sort by</label>
            <select 
                id="sort-by"
                value={sortConfig.key}
                onChange={handleSortKeyChange}
                className="text-sm rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
            >
                <option value="createdAt">Date</option>
                <option value="title">Title</option>
                <option value="status">Status</option>
            </select>
            <button 
                onClick={toggleSortDirection}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label={`Sort direction: ${sortConfig.direction === 'ASC' ? 'Ascending' : 'Descending'}`}
            >
                {sortConfig.direction === 'ASC' ? <ArrowUpIcon className="w-5 h-5"/> : <ArrowDownIcon className="w-5 h-5" />}
            </button>
        </div>
      </div>
      {hasCompletedItems && (
        <button 
            onClick={onClearCompleted}
            className="text-sm text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500 transition-colors focus:outline-none focus:underline shrink-0"
        >
            Clear Completed
        </button>
      )}
    </div>
  );
};

export default FilterControls;