import React, { useState, useEffect } from 'react';
import { PlusIcon, EditIcon, SaveIcon, TrashIcon, CancelIcon } from './icons';

interface CategoryManagerProps {
    isOpen: boolean;
    onClose: () => void;
    categories: string[];
    onAddCategory: (name: string) => void;
    onUpdateCategory: (oldName: string, newName: string) => void;
    onDeleteCategory: (name: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ isOpen, onClose, categories, onAddCategory, onUpdateCategory, onDeleteCategory }) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState<{ oldName: string; newName: string } | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setNewCategoryName('');
            setEditingCategory(null);
        }
    }, [isOpen]);
    
    if (!isOpen) return null;

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            onAddCategory(newCategoryName);
            setNewCategoryName('');
        }
    };

    const handleEditStart = (name: string) => {
        setEditingCategory({ oldName: name, newName: name });
    };

    const handleEditCancel = () => {
        setEditingCategory(null);
    };

    const handleEditSave = () => {
        if (editingCategory) {
            onUpdateCategory(editingCategory.oldName, editingCategory.newName);
            setEditingCategory(null);
        }
    };

    const handleDelete = (name: string) => {
        if (window.confirm(`Are you sure you want to delete the "${name}" category? All links in this category will be moved to "Uncategorized".`)) {
            onDeleteCategory(name);
        }
    }
    
    const commonInputStyles = "w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Manage Categories</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" aria-label="Close">
                        <CancelIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-5 max-h-[60vh] overflow-y-auto">
                    <ul className="space-y-2">
                        {categories.filter(c => c.toLowerCase() !== 'uncategorized').map(cat => (
                            <li key={cat} className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                {editingCategory?.oldName === cat ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editingCategory.newName}
                                            onChange={(e) => setEditingCategory({ ...editingCategory, newName: e.target.value })}
                                            className={commonInputStyles}
                                            autoFocus
                                        />
                                        <button onClick={handleEditSave} className="p-2 text-green-500 hover:text-green-600"><SaveIcon className="w-5 h-5"/></button>
                                        <button onClick={handleEditCancel} className="p-2 text-red-500 hover:text-red-600"><CancelIcon className="w-5 h-5"/></button>
                                    </>
                                ) : (
                                    <>
                                        <span className="flex-grow">{cat}</span>
                                        <button onClick={() => handleEditStart(cat)} className="p-2 text-slate-400 hover:text-indigo-500"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDelete(cat)} className="p-2 text-slate-400 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                    </>
                                )}
                            </li>
                        ))}
                         <li className="flex items-center justify-between gap-2 p-2">
                            <span className="flex-grow text-slate-500 italic">Uncategorized (Default)</span>
                        </li>
                    </ul>
                </div>
                
                <div className="p-5 border-t border-slate-200 dark:border-slate-700">
                    <form onSubmit={handleAdd} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Add new category..."
                          className={commonInputStyles}
                        />
                        <button
                          type="submit"
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 disabled:bg-indigo-300"
                          disabled={!newCategoryName.trim()}
                        >
                          <PlusIcon className="w-5 h-5" />
                          <span>Add</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CategoryManager;