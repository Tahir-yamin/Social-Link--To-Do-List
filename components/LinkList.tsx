import React, { useRef, useEffect } from 'react';
import { Link } from '../types';
import LinkItem from './LinkItem';

interface LinkListProps {
  links: Link[];
  categories: string[];
  selectedLinkIds: Set<string>;
  analyzingLinkId: string | null;
  onToggleSelection: (id: string) => void;
  onToggleSelectAll: (visibleLinkIds: string[]) => void;
  onToggleStatus: (id: string) => void;
  onDeleteLink: (id: string) => void;
  onUpdateLink: (id: string, updates: Partial<Omit<Link, 'id' | 'url' | 'createdAt'>>) => void;
  onAddCategory: (name: string) => void;
  onDeepAnalysis: (id: string) => void;
}

const LinkList: React.FC<LinkListProps> = ({ 
    links, 
    categories, 
    selectedLinkIds, 
    analyzingLinkId, 
    onToggleSelection, 
    onToggleSelectAll,
    onToggleStatus, 
    onDeleteLink, 
    onUpdateLink, 
    onAddCategory, 
    onDeepAnalysis 
}) => {
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  const visibleLinkIds = links.map(link => link.id);
  const selectedVisibleCount = visibleLinkIds.filter(id => selectedLinkIds.has(id)).length;

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
        selectAllCheckboxRef.current.checked = selectedVisibleCount > 0 && selectedVisibleCount === visibleLinkIds.length;
        selectAllCheckboxRef.current.indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < visibleLinkIds.length;
    }
  }, [selectedVisibleCount, visibleLinkIds.length]);
  

  if (links.length === 0) {
    return (
      <div className="text-center py-12 px-6">
        <p className="text-slate-500 dark:text-slate-400">Your link list is empty.</p>
        <p className="text-slate-400 dark:text-slate-500 text-sm">Add a link above to get started or clear your filters!</p>
      </div>
    );
  }

  return (
    <div>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-4">
            <input
                ref={selectAllCheckboxRef}
                type="checkbox"
                onChange={() => onToggleSelectAll(visibleLinkIds)}
                className="h-6 w-6 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-100 dark:bg-slate-900"
                aria-label="Select all visible links"
            />
            <label htmlFor="select-all" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Select All
            </label>
        </div>
        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
        {links.map((link) => (
            <LinkItem
            key={link.id}
            link={link}
            categories={categories}
            isSelected={selectedLinkIds.has(link.id)}
            isAnalyzing={analyzingLinkId === link.id}
            onToggleSelection={onToggleSelection}
            onToggleStatus={onToggleStatus}
            onDeleteLink={onDeleteLink}
            onUpdateLink={onUpdateLink}
            onAddCategory={onAddCategory}
            onDeepAnalysis={onDeepAnalysis}
            />
        ))}
        </ul>
    </div>
  );
};

export default LinkList;