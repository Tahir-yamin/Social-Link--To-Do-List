import React from 'react';
import { LinkIcon, CogIcon } from './icons';

interface HeaderProps {
    onManageCategories: () => void;
}

const Header: React.FC<HeaderProps> = ({ onManageCategories }) => {
  return (
    <header className="text-center mb-8 relative">
      <div className="flex items-center justify-center gap-4 mb-2">
        <LinkIcon className="w-10 h-10 text-indigo-500" />
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
          LinkLoom
        </h1>
      </div>
      <p className="text-slate-500 dark:text-slate-400">
        Weave your web links into a manageable to-do list.
      </p>
      <button
        onClick={onManageCategories}
        className="absolute top-0 right-0 p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
        aria-label="Manage categories"
      >
        <CogIcon className="w-6 h-6" />
      </button>
    </header>
  );
};

export default Header;