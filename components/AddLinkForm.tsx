
import React, { useState } from 'react';
import { fetchLinkMetadata } from '../services/geminiService';
import { Link } from '../types';
import { PlusIcon } from './icons';
import Spinner from './Spinner';

interface AddLinkFormProps {
  onAddLink: (newLink: Omit<Link, 'id' | 'status' | 'createdAt'>) => void;
}

const AddLinkForm: React.FC<AddLinkFormProps> = ({ onAddLink }) => {
  const [url, setUrl] = useState('');
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
      onAddLink({ url: url.trim(), ...metadata });
      setUrl('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to process link: ${errorMessage}`);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
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
        <button
          type="submit"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
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
      </form>
      {error && <p className="text-red-500 text-sm mt-2 text-center sm:text-left">{error}</p>}
    </div>
  );
};

export default AddLinkForm;