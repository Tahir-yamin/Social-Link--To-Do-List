import React, { useState, useMemo, useEffect } from 'react';
import { Link, LinkStatus, SortConfig } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import AddLinkForm from './components/AddLinkForm';
import LinkList from './components/LinkList';
import FilterControls from './components/FilterControls';
import { fetchLinkMetadata, fetchDeepAnalysis } from './services/geminiService';
import Spinner from './components/Spinner';
import CategoryManager from './components/CategoryManager';
import Dashboard from './components/Dashboard';
import BulkActionsToolbar from './components/BulkActionsToolbar';

const DEFAULT_CATEGORIES = ['Technology', 'News', 'Productivity', 'Lifestyle', 'Programming', 'Uncategorized'];

const App: React.FC = () => {
  const [links, setLinks] = useLocalStorage<Link[]>('saved-links', []);
  const [filter, setFilter] = useState<LinkStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [categories, setCategories] = useLocalStorage<string[]>('link-categories', DEFAULT_CATEGORIES);
  const [sortConfig, setSortConfig] = useLocalStorage<SortConfig>('link-sort-config', { key: 'createdAt', direction: 'DESC' });
  const [isProcessingSharedLink, setIsProcessingSharedLink] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [analyzingLinkId, setAnalyzingLinkId] = useState<string | null>(null);
  const [selectedLinkIds, setSelectedLinkIds] = useState(new Set<string>());


  // Handle incoming shares from PWA share target
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedUrl = urlParams.get('url');
    const sharedText = urlParams.get('text');
    const urlToProcess = sharedUrl || sharedText; // Sometimes URL is in text field

    if (urlToProcess) {
      // Use regex to find a URL in the text, as some platforms send it in the text field
      const urlRegex = /(https?:\/\/[^\s]+)/;
      const foundUrl = urlToProcess.match(urlRegex);

      if (foundUrl && foundUrl[0]) {
        // Clean the URL from the address bar to prevent re-processing on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
        handleSharedLink(foundUrl[0]);
      }
    }
  }, []); // Empty dependency array ensures this runs only once on mount
  
  // Handle Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Add Link Shortcut (Cmd/Ctrl + K)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('add-link-input')?.focus();
      }
      
      // Open Category Manager Shortcut (Cmd/Ctrl + Shift + C)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setIsCategoryManagerOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  const handleAddLink = (newLink: Omit<Link, 'id' | 'status' | 'createdAt'>) => {
    const linkToAdd: Link = {
      ...newLink,
      id: crypto.randomUUID(),
      status: LinkStatus.PENDING,
      createdAt: Date.now(),
    };
    // Prevent adding duplicates, especially from sharing
    if (!links.some(link => link.url === linkToAdd.url)) {
        setLinks(prevLinks => [linkToAdd, ...prevLinks]);
        // Add new category if it doesn't exist
        handleAddCategory(linkToAdd.category);
    }
  };

  const handleSharedLink = async (url: string) => {
    if (links.some(link => link.url === url)) {
        console.log("Shared link already exists.");
        return;
    }
    
    setIsProcessingSharedLink(true);
    try {
      const metadata = await fetchLinkMetadata(url.trim());
      handleAddLink({ url: url.trim(), ...metadata });
    } catch (err) {
      console.error("Failed to process shared link:", err);
      // Add a fallback link with an error message
      handleAddLink({
          url: url.trim(),
          title: "Unable to Access Document Content",
          summary: `Could not analyze ${url.trim()}. You can manage it manually.`,
          category: 'Error',
          sources: [],
      });
    } finally {
      setIsProcessingSharedLink(false);
    }
  };

  const handleToggleStatus = (id: string) => {
    setLinks(prevLinks =>
      prevLinks.map(link =>
        link.id === id
          ? { ...link, status: link.status === LinkStatus.DONE ? LinkStatus.PENDING : LinkStatus.DONE }
          : link
      )
    );
  };

  const handleDeleteLink = (id: string) => {
    setLinks(prevLinks => prevLinks.filter(link => link.id !== id));
    setSelectedLinkIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
    });
  };

  const handleUpdateLink = (id: string, updates: Partial<Omit<Link, 'id' | 'url' | 'createdAt'>>) => {
    setLinks(prevLinks =>
      prevLinks.map(link =>
        link.id === id ? { ...link, ...updates } : link
      )
    );
    if(updates.category){
      handleAddCategory(updates.category);
    }
  };
  
  const handleDeepAnalysis = async (linkId: string) => {
    const linkToAnalyze = links.find(link => link.id === linkId);
    if (!linkToAnalyze) return;

    setAnalyzingLinkId(linkId);
    try {
      const deepSummary = await fetchDeepAnalysis(linkToAnalyze.url);
      handleUpdateLink(linkId, { summary: deepSummary });
    } catch (error) {
      console.error("Deep analysis failed:", error);
      handleUpdateLink(linkId, { summary: "Deep analysis failed. Please try again."});
    } finally {
      setAnalyzingLinkId(null);
    }
  };

  const handleClearCompleted = () => {
    setLinks(prevLinks => prevLinks.filter(link => link.status !== LinkStatus.DONE));
  };
  
  // Category Management Handlers
  const handleAddCategory = (name: string) => {
    const newCategory = name.trim();
    if (newCategory && !categories.find(c => c.toLowerCase() === newCategory.toLowerCase())) {
        setCategories(prev => [...prev, newCategory].sort());
    }
  };

  const handleUpdateCategory = (oldName: string, newName: string) => {
    const trimmedNewName = newName.trim();
    if (!trimmedNewName || oldName.toLowerCase() === trimmedNewName.toLowerCase()) return;
    if (categories.find(c => c.toLowerCase() === trimmedNewName.toLowerCase())) {
        alert(`Category "${trimmedNewName}" already exists.`);
        return;
    }
    
    // Update links
    setLinks(prevLinks => prevLinks.map(link => 
        link.category.toLowerCase() === oldName.toLowerCase() ? { ...link, category: trimmedNewName } : link
    ));

    // Update category list
    setCategories(prev => prev.map(c => c.toLowerCase() === oldName.toLowerCase() ? trimmedNewName : c).sort());
  };

  const handleDeleteCategory = (name: string) => {
    if (name.toLowerCase() === 'uncategorized') return;

    // Re-assign links to 'Uncategorized'
    setLinks(prevLinks => prevLinks.map(link => 
        link.category.toLowerCase() === name.toLowerCase() ? { ...link, category: 'Uncategorized' } : link
    ));

    // Remove from category list
    setCategories(prev => prev.filter(c => c.toLowerCase() !== name.toLowerCase()));
  };
  
  // Selection Handlers
  const handleToggleSelection = (id: string) => {
    setSelectedLinkIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });
  };

  const handleClearSelection = () => setSelectedLinkIds(new Set());
  
  const handleToggleSelectAll = (visibleLinkIds: string[]) => {
    const allVisibleSelected = visibleLinkIds.every(id => selectedLinkIds.has(id));
    if (allVisibleSelected) {
        // Deselect all visible
        setSelectedLinkIds(prev => {
            const newSet = new Set(prev);
            visibleLinkIds.forEach(id => newSet.delete(id));
            return newSet;
        });
    } else {
        // Select all visible
        setSelectedLinkIds(prev => new Set([...prev, ...visibleLinkIds]));
    }
  };

  const handleBulkAction = (action: 'delete' | 'setStatus' | 'setCategory', payload?: any) => {
    if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${selectedLinkIds.size} selected links?`)) {
        setLinks(prev => prev.filter(link => !selectedLinkIds.has(link.id)));
        handleClearSelection();
      }
    } else {
      setLinks(prev => prev.map(link => {
        if (selectedLinkIds.has(link.id)) {
          if (action === 'setStatus') return { ...link, status: payload };
          if (action === 'setCategory') return { ...link, category: payload };
        }
        return link;
      }));
      handleClearSelection();
    }
  };


  const sortedAndFilteredLinks = useMemo(() => {
    const statusFiltered = filter === 'ALL'
      ? links
      : links.filter(link => link.status === filter);
      
    const categoryFiltered = categoryFilter === 'ALL'
      ? statusFiltered
      : statusFiltered.filter(link => link.category === categoryFilter);

    return [...categoryFiltered].sort((a, b) => {
      const { key, direction } = sortConfig;
      const order = direction === 'ASC' ? 1 : -1;

      switch (key) {
        case 'createdAt':
          return (a.createdAt - b.createdAt) * order;
        case 'title':
          return a.title.localeCompare(b.title) * order;
        case 'status':
          // PENDING is "less than" DONE
          if (a.status === b.status) return 0;
          return (a.status === LinkStatus.PENDING ? -1 : 1) * order;
        default:
          return 0;
      }
    });
  }, [links, filter, categoryFilter, sortConfig]);
  
  const completedCount = useMemo(() => links.filter(link => link.status === LinkStatus.DONE).length, [links]);
  
  // Clear selection when filters change to avoid confusion
  useEffect(() => {
    handleClearSelection();
  }, [filter, categoryFilter, sortConfig]);

  return (
    <>
      <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200">
        <div className="container mx-auto max-w-3xl p-4 md:p-8 pb-24">
          <Header onManageCategories={() => setIsCategoryManagerOpen(true)} />
          <main>
            {isProcessingSharedLink && (
              <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 bg-indigo-600 text-white shadow-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <Spinner />
                  <span>Processing shared link...</span>
                </div>
              </div>
            )}
            <AddLinkForm onAddLink={handleAddLink} />
            <div className="mt-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
               <Dashboard links={links} />
               <FilterControls 
                  currentFilter={filter} 
                  onFilterChange={setFilter}
                  categoryFilter={categoryFilter}
                  onCategoryFilterChange={setCategoryFilter}
                  categories={['ALL', ...categories]}
                  sortConfig={sortConfig}
                  onSortChange={setSortConfig}
                  onClearCompleted={handleClearCompleted}
                  hasCompletedItems={completedCount > 0}
               />
               <LinkList
                  links={sortedAndFilteredLinks}
                  categories={categories}
                  selectedLinkIds={selectedLinkIds}
                  onToggleSelection={handleToggleSelection}
                  onToggleSelectAll={handleToggleSelectAll}
                  onToggleStatus={handleToggleStatus}
                  onDeleteLink={handleDeleteLink}
                  onUpdateLink={handleUpdateLink}
                  onAddCategory={handleAddCategory}
                  analyzingLinkId={analyzingLinkId}
                  onDeepAnalysis={handleDeepAnalysis}
               />
            </div>
          </main>
        </div>
      </div>
      <BulkActionsToolbar 
        selectedCount={selectedLinkIds.size}
        categories={categories.filter(c => c.toLowerCase() !== 'uncategorized')}
        onBulkAction={handleBulkAction}
        onClearSelection={handleClearSelection}
      />
      <CategoryManager 
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </>
  );
};

export default App;