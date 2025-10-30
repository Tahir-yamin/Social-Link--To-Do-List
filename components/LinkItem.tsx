import React, { useState } from 'react';
import { Link, LinkStatus } from '../types';
import { TrashIcon, ExternalLinkIcon, EditIcon, SaveIcon, CancelIcon, TagIcon, WebIcon, SparklesIcon, ChevronDownIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon, CalendarIcon } from './icons';
import Spinner from './Spinner';

interface LinkItemProps {
  link: Link;
  categories: string[];
  isSelected: boolean;
  isAnalyzing: boolean;
  onToggleSelection: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDeleteLink: (id: string) => void;
  onUpdateLink: (id: string, updates: Partial<Omit<Link, 'id' | 'url' | 'createdAt'>>) => void;
  onAddCategory: (name: string) => void;
  onDeepAnalysis: (id: string) => void;
}

const LinkItem: React.FC<LinkItemProps> = ({ link, categories, isSelected, isAnalyzing, onToggleSelection, onToggleStatus, onDeleteLink, onUpdateLink, onAddCategory, onDeepAnalysis }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(link.title);
  const [editedSummary, setEditedSummary] = useState(link.summary);
  const [editedCategory, setEditedCategory] = useState(link.category);
  const [editedDueDate, setEditedDueDate] = useState(link.dueDate ? new Date(link.dueDate).toISOString().split('T')[0] : '');
  const [isExpanded, setIsExpanded] = useState(false);

  const isDone = link.status === LinkStatus.DONE;
  const isError = link.category === 'Error';

  let statusBorderClass = 'border-transparent';
  if (isError) {
    statusBorderClass = 'border-slate-400 dark:border-slate-500';
  } else if (isDone) {
    statusBorderClass = 'border-green-500';
  } else { // Pending
    statusBorderClass = 'border-orange-500';
  }
  
  const handleToggleExpand = () => setIsExpanded(prev => !prev);

  const handleEdit = () => {
    setIsEditing(true);
    setIsExpanded(true); // Ensure item is expanded when editing starts
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTitle(link.title); // Reset changes
    setEditedSummary(link.summary);
    setEditedCategory(link.category);
    setEditedDueDate(link.dueDate ? new Date(link.dueDate).toISOString().split('T')[0] : '');
  };

  const handleSave = () => {
    if (editedTitle.trim() === '') {
      // Prevent saving an empty title
      return;
    }
    const newCategory = editedCategory.trim() || 'Uncategorized';
    
    // Add category if it's new
    if (!categories.find(c => c.toLowerCase() === newCategory.toLowerCase())) {
        onAddCategory(newCategory);
    }

    onUpdateLink(link.id, { 
        title: editedTitle.trim(), 
        summary: editedSummary.trim(),
        category: newCategory,
        dueDate: editedDueDate ? new Date(editedDueDate).getTime() : undefined,
    });
    setIsEditing(false);
  };
  
  const StatusIndicator = () => {
    let icon;
    let containerClasses;

    if (isError) {
        icon = <ExclamationCircleIcon className="w-4 h-4 text-white" title="Error" />;
        containerClasses = 'bg-slate-400 dark:bg-slate-500';
    } else if (isDone) {
        icon = <CheckCircleIcon className="w-4 h-4 text-white" title="Done" />;
        containerClasses = 'bg-green-500';
    } else { // Pending
        icon = <ClockIcon className="w-4 h-4 text-white" title="Pending" />;
        containerClasses = 'bg-orange-500';
    }

    return (
        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${containerClasses}`}>
            {icon}
        </div>
    );
  };
  
  const StatusToggleButton = () => (
     <button
        onClick={(e) => { e.stopPropagation(); onToggleStatus(link.id); }}
        className="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 focus:outline-none focus:text-indigo-500 transition-colors disabled:opacity-50"
        aria-label={`Mark as ${isDone ? 'pending' : 'done'}`}
        disabled={isAnalyzing}
      >
        {isDone 
            ? <ClockIcon className="w-5 h-5" title="Mark as Pending" /> 
            : <CheckCircleIcon className="w-5 h-5" title="Mark as Done" />
        }
    </button>
  );

  const commonInputStyles = "w-full px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";
  
  let categoryTagClasses = '';
  if (isError) {
    categoryTagClasses = 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300';
  } else if (isDone) {
    categoryTagClasses = 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400';
  } else {
    categoryTagClasses = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300';
  }


  if (isEditing) {
    return (
      <li className={`flex items-start gap-4 py-4 pr-4 pl-3 bg-slate-50 dark:bg-slate-700/50 border-l-4 ${statusBorderClass}`}>
        <div className="flex-shrink-0 pt-1">
          {/* Checkbox is disabled during editing */}
          <input
            type="checkbox"
            className="h-6 w-6 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-100 dark:bg-slate-900 opacity-50"
            aria-label="Selection checkbox"
            disabled
          />
        </div>
        <div className="flex-grow space-y-2">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className={`${commonInputStyles} font-semibold text-lg`}
            aria-label="Edit title"
          />
           <textarea
            value={editedSummary}
            onChange={(e) => setEditedSummary(e.target.value)}
            className={`${commonInputStyles} text-base resize-y min-h-[60px]`}
            aria-label="Edit summary"
            rows={3}
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
                <TagIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                type="text"
                value={editedCategory}
                onChange={(e) => setEditedCategory(e.target.value)}
                className={`${commonInputStyles} pl-8`}
                aria-label="Edit category"
                list="category-suggestions"
                />
                <datalist id="category-suggestions">
                    {categories.map(cat => <option key={cat} value={cat} />)}
                </datalist>
            </div>
            <div className="relative flex-grow">
                <CalendarIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="date"
                    value={editedDueDate}
                    onChange={(e) => setEditedDueDate(e.target.value)}
                    className={`${commonInputStyles} pl-8`}
                    aria-label="Edit due date"
                />
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 pt-1 flex flex-col gap-3">
          <button
            onClick={handleSave}
            className="text-slate-400 hover:text-green-500 dark:hover:text-green-400 focus:outline-none focus:text-green-500 transition-colors"
            aria-label={`Save changes for link: ${link.title}`}
          >
            <SaveIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleCancel}
            className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 focus:outline-none focus:text-red-500 transition-colors"
            aria-label={`Cancel editing link: ${link.title}`}
          >
            <CancelIcon className="w-5 h-5" />
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className={`flex items-start gap-4 py-4 pr-4 pl-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200 relative border-l-4 ${statusBorderClass} ${isAnalyzing ? 'animate-pulse' : ''} ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
      <div className="flex-shrink-0 pt-1">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(link.id)}
          className="h-6 w-6 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-100 dark:bg-slate-900"
          aria-label={`Select link: "${link.title}"`}
        />
      </div>
      <div className="flex-grow overflow-hidden">
        <div 
            className="cursor-pointer" 
            onClick={handleToggleExpand}
            role="button"
            aria-expanded={isExpanded}
        >
            <div className="flex justify-between items-start">
                <div className="flex-grow">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <div className="flex items-center gap-3">
                            <StatusIndicator />
                            <h3 className={`text-lg font-semibold text-slate-800 dark:text-slate-100 transition-colors ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                                {link.title}
                            </h3>
                            {isAnalyzing && (
                                <div className="text-indigo-500" title="Analyzing...">
                                    <Spinner />
                                </div>
                            )}
                        </div>
                        {link.category && (
                        <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${categoryTagClasses}`}>
                            <TagIcon className="w-3 h-3"/>
                            <span>{link.category}</span>
                        </div>
                        )}
                        {link.dueDate && (
                             <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300`}>
                                <CalendarIcon className="w-3 h-3"/>
                                <span>{new Date(link.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-shrink-0 pl-2">
                    <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </div>
            <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className={`flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-400 truncate transition-colors ${isDone ? 'text-slate-400 dark:text-slate-500 hover:text-slate-400 dark:hover:text-slate-500' : ''}`}
            >
            <span className="truncate">{link.url}</span>
            <ExternalLinkIcon className="w-4 h-4 flex-shrink-0" />
            </a>
        </div>

        {isExpanded && (
            <div className="mt-2 animate-fade-in">
                <p className={`mt-1 text-slate-600 dark:text-slate-400 transition-colors whitespace-pre-wrap ${isDone ? 'text-slate-400 dark:text-slate-500' : ''}`}>
                {link.summary}
                </p>

                {link.sources && link.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    <WebIcon className="w-4 h-4" />
                    SOURCES
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                    {link.sources.map((source, index) => (
                        <li key={index} className="text-sm">
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline truncate" title={source.uri}>
                            {source.title || new URL(source.uri).hostname}
                        </a>
                        </li>
                    ))}
                    </ul>
                </div>
                )}
            </div>
        )}
      </div>
      <div className="flex-shrink-0 pt-1 flex flex-col gap-3">
        <StatusToggleButton />
        <button
          onClick={(e) => { e.stopPropagation(); handleEdit(); }}
          className="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 focus:outline-none focus:text-indigo-500 transition-colors disabled:opacity-50"
          aria-label={`Edit link: ${link.title}`}
          disabled={isAnalyzing}
        >
          <EditIcon className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDeepAnalysis(link.id); }}
          className="text-slate-400 hover:text-purple-500 dark:hover:text-purple-400 focus:outline-none focus:text-purple-500 transition-colors disabled:opacity-50"
          aria-label={`Analyze deeper: ${link.title}`}
          disabled={isAnalyzing}
        >
            <SparklesIcon className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteLink(link.id); }}
          className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 focus:outline-none focus:text-red-500 transition-colors disabled:opacity-50"
          aria-label={`Delete link: ${link.title}`}
          disabled={isAnalyzing}
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </li>
  );
};

export default LinkItem;