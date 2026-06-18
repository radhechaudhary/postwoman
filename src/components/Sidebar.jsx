import { useState } from 'react';
import {
  Folder, FolderOpen, ChevronDown, ChevronRight, Play, Plus,
  Trash2, Edit, Search, History as HistoryIcon,
} from 'lucide-react';
import MethodBadge from './Shared/MethodBadge';

export default function Sidebar({
  collections = [],
  history = [],
  activeRequestId,
  onSelectRequest,
  onAddCollection,
  onRenameCollection,
  onDeleteCollection,
  onAddRequestToCollection,
  onDeleteRequestFromCollection,
  onClearHistory,
  onDeleteHistoryItem,
}) {
  const [activeTab, setActiveTab] = useState('collections'); // 'collections' | 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCollections, setExpandedCollections] = useState({});

  const toggleCollection = (id) => {
    setExpandedCollections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter collections and their nested requests based on search
  const filteredCollections = collections.map(col => {
    const matchedRequests = col.requests.filter(req =>
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.url.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isColMatch = col.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (isColMatch || matchedRequests.length > 0) {
      return {
        ...col,
        requests: isColMatch ? col.requests : matchedRequests,
        isMatched: true
      };
    }
    return null;
  }).filter(Boolean);

  // Filter history requests
  const filteredHistory = history.filter(item =>
    (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.method.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 h-full flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/70 select-none">

      {/* Brand Logo & Name */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/50 dark:bg-zinc-950/40">
        <div className="w-8 h-8 flex items-center justify-center ">
          <img src="/icon.png" alt="" className="w-8 h-8" />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-wider bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
            PostWoman
          </h1>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-600 font-semibold tracking-widest uppercase">API testing tool</p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-2 py-1.5 gap-1.5 bg-zinc-100/30 dark:bg-zinc-900/10">
        <button
          onClick={() => setActiveTab('collections')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold tracking-wider transition-all cursor-pointer ${activeTab === 'collections'
            ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200 dark:border-zinc-800'
            : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
        >
          <Folder className="w-3.5 h-3.5" /> Collections
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold tracking-wider transition-all cursor-pointer ${activeTab === 'history'
            ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200 dark:border-zinc-800'
            : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
        >
          <HistoryIcon className="w-3.5 h-3.5" /> History
        </button>
      </div>

      {/* Search Input bar */}
      <div className="p-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder={activeTab === 'collections' ? "Search collections/requests..." : "Search request history..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800/80 rounded-lg pl-9 pr-4 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-zinc-400 dark:placeholder-zinc-600 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Main content scroll container */}
      <div className="flex-1 overflow-y-auto px-2 space-y-2">
        {activeTab === 'collections' ? (
          <div className="space-y-1.5">
            {/* Header + Add button */}
            <div className="flex items-center justify-between px-2 pb-1 text-zinc-500 font-semibold text-[10px] uppercase tracking-wider">
              <span>Saved Collections</span>
              <button
                onClick={onAddCollection}
                className="p-1 rounded text-zinc-400 hover:text-indigo-400 hover:bg-zinc-200 dark:hover:bg-zinc-850 transition-colors cursor-pointer"
                title="Create collection"
              >
                <Plus className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* List */}
            {filteredCollections.map(col => {
              const isExpanded = expandedCollections[col.id];
              return (
                <div key={col.id} className="space-y-1 border border-zinc-200/40 dark:border-zinc-800/20 rounded-lg overflow-hidden bg-white/40 dark:bg-zinc-900/10">
                  {/* Collection Header */}
                  <div className="group flex items-center justify-between px-2.5 py-1.5 hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50 rounded-md transition-colors cursor-pointer">
                    <div
                      onClick={() => toggleCollection(col.id)}
                      className="flex-1 flex items-center gap-1.5 font-semibold text-xs text-zinc-700 dark:text-zinc-300 truncate"
                    >
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />}
                      {isExpanded ? <FolderOpen className="w-4 h-4 text-amber-500" /> : <Folder className="w-4 h-4 text-amber-500" />}
                      <span className="truncate">{col.name}</span>
                    </div>

                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onAddRequestToCollection(col.id)}
                        className="p-1 text-zinc-400 hover:text-indigo-400 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                        title="Add Request"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRenameCollection(col.id)}
                        className="p-1 text-zinc-400 hover:text-zinc-250 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                        title="Rename Collection"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDeleteCollection(col.id)}
                        className="p-1 text-zinc-400 hover:text-rose-500 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                        title="Delete Collection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Requests list inside collection */}
                  {isExpanded && (
                    <div className="pl-4 pr-1 pb-1.5 space-y-0.5 border-l border-zinc-200 dark:border-zinc-800 ml-4.5 mt-0.5">
                      {col.requests.map(req => (
                        <div
                          key={req.id}
                          onClick={() => onSelectRequest(req, col.id)}
                          className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${activeRequestId === req.id
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                            : 'text-zinc-650 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-200/30 dark:hover:bg-zinc-900/30 border border-transparent'
                            }`}
                        >
                          <div className="flex-1 flex items-center gap-1.5 min-w-0 pr-1">
                            <MethodBadge method={req.method} className="text-[9px] px-1 py-0" />
                            <span className="truncate">{req.name}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteRequestFromCollection(col.id, req.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-450 hover:text-rose-450 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer transition-opacity"
                            title="Delete request"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {col.requests.length === 0 && (
                        <div className="text-[10px] text-zinc-500 pl-3.5 py-1.5 italic">Empty collection</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {filteredCollections.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400 dark:text-zinc-600">
                <Folder className="w-8 h-8 mb-2 stroke-1" />
                <div className="text-xs font-semibold">No Collections Found</div>
                <button
                  onClick={onAddCollection}
                  className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Create one now
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            {/* Header + Clear button */}
            <div className="flex items-center justify-between px-2 pb-1 text-zinc-500 font-semibold text-[10px] uppercase tracking-wider">
              <span>Recent Requests</span>
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="text-[10px] text-zinc-450 hover:text-rose-400 font-semibold flex items-center gap-1 cursor-pointer"
                  title="Clear history"
                >
                  <Trash2 className="w-3 h-3" /> Clear All
                </button>
              )}
            </div>

            {/* List */}
            <div className="space-y-1">
              {filteredHistory.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => onSelectRequest(item)}
                  className="group flex items-center justify-between px-2.5 py-2 hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all cursor-pointer"
                >
                  <div className="flex-1 flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <MethodBadge method={item.method} className="text-[8px] px-1 py-0" />
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate">
                        {item.name || item.url || 'Untitled Request'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                      {item.url}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHistoryItem(item.id || idx);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-450 hover:text-rose-500 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer transition-opacity"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {filteredHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400 dark:text-zinc-600">
                  <HistoryIcon className="w-8 h-8 mb-2 stroke-1" />
                  <div className="text-xs font-semibold">No Request History</div>
                  <span className="text-[10px] text-zinc-500 mt-1">Send a query to log a request</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
