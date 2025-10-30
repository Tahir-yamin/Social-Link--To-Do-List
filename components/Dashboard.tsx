import React, { useState, useMemo } from 'react';
import { Link, LinkStatus } from '../types';
import { ChartBarIcon, ChevronDownIcon } from './icons';

interface DashboardProps {
    links: Link[];
}

const Dashboard: React.FC<DashboardProps> = ({ links }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const stats = useMemo(() => {
        const total = links.length;
        const pending = links.filter(l => l.status === LinkStatus.PENDING).length;
        const completed = total - pending;
        const categoryCounts = links.reduce((acc, link) => {
            const category = link.category || 'Uncategorized';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // FIX: Replaced destructuring in sort with index access to fix type inference issues.
        const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

        return { total, pending, completed, sortedCategories };
    }, [links]);

    if (links.length === 0) {
        return null;
    }

    return (
        <div className="border-b border-slate-200 dark:border-slate-700">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex justify-between items-center p-4"
                aria-expanded={isExpanded}
                aria-controls="dashboard-content"
            >
                <div className="flex items-center gap-3">
                    <ChartBarIcon className="w-6 h-6 text-indigo-500" />
                    <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Overview</h2>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-slate-500 dark:text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isExpanded && (
                <div id="dashboard-content" className="px-4 pb-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-center">
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Links</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.total}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
                            <p className="text-2xl font-bold text-orange-500">{stats.pending}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
                            <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-md font-semibold mb-2 text-slate-600 dark:text-slate-300">By Category</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                            {stats.sortedCategories.map(([category, count]) => (
                                <div key={category} className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600 dark:text-slate-400 truncate pr-2">{category}</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200 shrink-0">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;