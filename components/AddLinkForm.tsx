

import React, { useState } from 'react';
import { fetchLinkMetadata } from '../services/geminiService';
import { Link } from '../types';
import { PlusIcon, CalendarIcon } from './icons';
import Spinner from './Spinner';

interface AddLinkFormProps {
  onAddLink: (newLink: Omit<Link, 'id' | 'status' | 'createdAt'>) => void;
}

const AddLinkForm: React.FC<AddLinkFormProps> = ({ onAddLink }) => {
  const [url, setUrl] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showDueDate, setShowDueDate] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !isValidUrl(url.trim())) {
      setError("Please enter a valid URL.");
      return;
    }
    
    setError(null);
    setIsFetching(true);

    try {
      const metadata = await fetchLinkMetadata(url.trim());
      onAddLink({
        url: url.trim(),
        ...metadata,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined
      });
      setUrl('');
      setDueDate('');
      setShowDueDate(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to process link: ${errorMessage}`);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
            id="add-link-input"
            type="url"
            value={url}
            onChange={(e) => {
                setUrl(e.target.value);
                if(error) setError(null);
            }}
            placeholder="Paste a link to save and analyze... (Ctrl+K)"
            className="flex-grow w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-2 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            disabled={isFetching}
            />
             <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                    type="button"
                    onClick={() => setShowDueDate(!showDueDate)}
                    className={`p-3 text-slate-500 dark:text-slate-400 rounded-md transition-colors ${showDueDate ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    aria-label="Set due date"
                    disabled={isFetching}
                >
                    <CalendarIcon className="w-6 h-6" />
                </button>
                <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                disabled={isFetching}
                >
                {isFetching ? (
                    <>
                    <Spinner />
                    <span>Analyzing...</span>
                    </>
                ) : (
                    <>
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Link</span>
                    </>
                )}
                </button>
             </div>
        </div>
        {showDueDate && (
             <div className="animate-fade-in">
                <label htmlFor="due-date" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Due Date (Optional)</label>
                <input 
                    type="date"
                    id="due-date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full sm:w-1/2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isFetching}
                    min={new Date().toISOString().split('T')[0]} // Today
                />
             </div>
        )}
      </form>
      {error && <p className="text-red-500 text-sm mt-2 text-center sm:text-left">{error}</p>}
    </div>
  );
};

export default AddLinkForm;