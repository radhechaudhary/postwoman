import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import RequestPanel from './components/RequestPanel';
import ResponsePanel from './components/ResponsePanel';
import CollectionModal from './components/CollectionModal';
import { executeRequest } from './utils/requestRunner';
import { Save, Plus, X } from 'lucide-react';

// Default initial state for a new request
const createEmptyRequest = () => ({
  id: 'req_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
  name: 'New Request',
  method: 'GET',
  url: '',
  params: [],
  headers: [
    { key: 'Accept', value: 'application/json', active: true },
    { key: 'Content-Type', value: 'application/json', active: true },
    { key: 'Authorization', value: 'Bearer your_token_here', active: true },
    { key: 'X-API-Key', value: 'your_api_key', active: true },
  ],
  body: {
    type: 'none',
    json: '',
    formdata: []
  },
  auth: {
    type: 'none',
    bearer: '',
    basic: { username: '', password: '' },
    apiKey: { key: '', value: '', addTo: 'header' }
  }
});

// Create a new tab object — each tab holds its own request + response state
const createNewTab = (request = null) => {
  const req = request || createEmptyRequest();
  return {
    id: 'tab_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    request: req,
    response: null,
    isLoading: false,
    activeCollectionId: null,
    activeRequestId: req.id || null,
  };
};

// Method badge color for tab indicator
const getMethodColor = (method) => {
  switch (method) {
    case 'GET': return 'text-emerald-400';
    case 'POST': return 'text-amber-400';
    case 'PUT': return 'text-blue-400';
    case 'DELETE': return 'text-rose-400';
    case 'PATCH': return 'text-purple-400';
    default: return 'text-zinc-400';
  }
};


export default function App() {

  // --- Persistent State ---
  const [collections, setCollections] = useState(() => {
    var saved = localStorage.getItem('aether_collections');
    if (!saved || saved === 'null') {
      saved = JSON.stringify([])
    }
    // console.log('collections', saved)
    return JSON.parse(saved);
  });

  const [history, setHistory] = useState(() => {
    var saved = localStorage.getItem('aether_history');
    if (!saved || saved === 'null') {
      saved = JSON.stringify([])
    }
    // console.log('history', saved)
    return JSON.parse(saved);
  });

  // --- Tab System (persisted in localStorage) ---
  const [tabs, setTabs] = useState(() => {
    try {
      const saved = localStorage.getItem('aether_tabs');
      if (saved && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Restore tabs but reset transient state
          return parsed.map(tab => ({
            ...tab,
            response: null,
            isLoading: false,
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to restore tabs from localStorage:', e);
    }
    return [createNewTab()];
  });

  const [activeTabId, setActiveTabId] = useState(() => {
    try {
      const savedId = localStorage.getItem('aether_activeTabId');
      if (savedId && savedId !== 'null') {
        return savedId;
      }
    } catch (e) {
      console.warn('Failed to restore activeTabId from localStorage:', e);
    }
    return tabs[0]?.id;
  });

  // Derive active tab's state
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const currentRequest = activeTab?.request || createEmptyRequest();
  const response = activeTab?.response || null;
  const isLoading = activeTab?.isLoading || false;
  const activeCollectionId = activeTab?.activeCollectionId || null;
  const activeRequestId = activeTab?.activeRequestId || null;

  // --- Modals State ---
  const [isColModalOpen, setIsColModalOpen] = useState(false);
  const [colModalConfig, setColModalConfig] = useState({ isEdit: false, collectionId: null, initialName: '' });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('aether_collections', JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    localStorage.setItem('aether_history', JSON.stringify(history));
  }, [history]);

  // Persist tabs to localStorage (strip transient state to keep it lean)
  useEffect(() => {
    const serializable = tabs.map(({ response, isLoading, ...rest }) => rest);
    localStorage.setItem('aether_tabs', JSON.stringify(serializable));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem('aether_activeTabId', activeTabId);
  }, [activeTabId]);

  // --- Tab Mutation Helpers ---
  const updateActiveTab = useCallback((updates) => {
    setTabs(prev => prev.map(tab =>
      tab.id === activeTabId ? { ...tab, ...updates } : tab
    ));
  }, [activeTabId]);

  const setCurrentRequest = useCallback((newRequest) => {
    updateActiveTab({ request: newRequest });
  }, [updateActiveTab]);

  const setResponse = useCallback((newResponse) => {
    updateActiveTab({ response: newResponse });
  }, [updateActiveTab]);

  const setIsLoading = useCallback((loading) => {
    updateActiveTab({ isLoading: loading });
  }, [updateActiveTab]);

  // --- Tab Actions ---
  const handleCreateNewTab = () => {
    const newTab = createNewTab();
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleCloseTab = (tabId, e) => {
    e?.stopPropagation();
    setTabs(prev => {
      if (prev.length === 1) {
        // Last tab — replace with a fresh one
        const freshTab = createNewTab();
        setActiveTabId(freshTab.id);
        return [freshTab];
      }
      const filtered = prev.filter(t => t.id !== tabId);
      // If closing the active tab, switch to nearest neighbour
      if (tabId === activeTabId) {
        const closedIdx = prev.findIndex(t => t.id === tabId);
        const newIdx = Math.min(closedIdx, filtered.length - 1);
        setActiveTabId(filtered[newIdx].id);
      }
      return filtered;
    });
  };

  const handleSwitchTab = (tabId) => {
    setActiveTabId(tabId);
  };

  // --- Handlers ---
  const handleSelectRequest = (req, collectionId = null) => {
    // If this request is already open in a tab, just switch to it
    const existingTab = tabs.find(t => t.activeRequestId === req.id);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }
    // Otherwise load into the current active tab
    updateActiveTab({
      request: JSON.parse(JSON.stringify(req)),
      activeRequestId: req.id || null,
      activeCollectionId: collectionId,
      response: null,
    });
  };

  const handleSendRequest = async () => {
    setIsLoading(true);
    setResponse(null);

    try {
      const res = await executeRequest(currentRequest);
      setResponse(res);
      // Save to History (limit to 50 items)
      const historyItem = {
        ...JSON.parse(JSON.stringify(currentRequest)),
        id: 'hist_' + Date.now(),
        timestamp: Date.now(),
        status: res.status,
        duration: res.duration
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 49)]);
    } catch (err) {
      console.error(err);
      setResponse({
        status: 0,
        statusText: 'Client Error',
        headers: {},
        cookies: [],
        data: null,
        isJson: false,
        rawBody: `An unexpected client error occurred: ${err.message}`,
        duration: 0,
        size: 0,
        error: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save the currently modified request back to its parent Collection
  const handleSaveCurrentRequest = () => {
    if (!activeCollectionId || !activeRequestId) {
      alert("This request is not part of any collection. To save it, create or select a collection first.");
      return;
    }

    setCollections(prev => prev.map(col => {
      if (col.id === activeCollectionId) {
        return {
          ...col,
          requests: col.requests.map(req => {
            if (req.id === activeRequestId) {
              return {
                ...JSON.parse(JSON.stringify(currentRequest)),
                id: activeRequestId
              };
            }
            return req;
          })
        };
      }
      return col;
    }));

    const btn = document.getElementById('save-btn');
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = '✔ Saved';
      btn.classList.add('bg-emerald-600', 'text-white');
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('bg-emerald-600', 'text-white');
      }, 1500);
    }
  };

  // --- Collection CRUDS ---
  const handleOpenAddCollection = () => {
    setColModalConfig({ isEdit: false, collectionId: null, initialName: '' });
    setIsColModalOpen(true);
  };

  const handleOpenRenameCollection = (colId) => {
    const col = collections.find(c => c.id === colId);
    if (col) {
      setColModalConfig({ isEdit: true, collectionId: colId, initialName: col.name });
      setIsColModalOpen(true);
    }
  };

  const handleCollectionModalSubmit = (name) => {
    if (colModalConfig.isEdit) {
      setCollections(prev => prev.map(col => {
        if (col.id === colModalConfig.collectionId) {
          return { ...col, name };
        }
        return col;
      }));
    } else {
      const newCol = {
        id: 'col_' + Date.now(),
        name,
        requests: []
      };
      setCollections(prev => [...prev, newCol]);
    }
  };

  const handleDeleteCollection = (colId) => {
    if (confirm("Are you sure you want to delete this collection and all its requests?")) {
      setCollections(prev => prev.filter(col => col.id !== colId));
      if (activeCollectionId === colId) {
        updateActiveTab({ activeCollectionId: null, activeRequestId: null });
      }
    }
  };

  const handleAddRequestToCollection = (colId) => {
    const newReq = createEmptyRequest();
    newReq.name = "New API Request";

    setCollections(prev => prev.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          requests: [...col.requests, newReq]
        };
      }
      return col;
    }));

    // Auto-select the newly added request
    handleSelectRequest(newReq, colId);
  };

  const handleDeleteRequestFromCollection = (colId, reqId) => {
    setCollections(prev => prev.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          requests: col.requests.filter(r => r.id !== reqId)
        };
      }
      return col;
    }));

    if (activeRequestId === reqId) {
      updateActiveTab({ activeRequestId: null, activeCollectionId: null });
    }
  };

  // --- History Handlers ---
  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your request history?")) {
      setHistory([]);
    }
  };

  const handleDeleteHistoryItem = (histId) => {
    setHistory(prev => prev.filter(item => item.id !== histId));
  };

  // --- Template Handlers ---
  const handleLoadTemplate = (template) => {
    const baseReq = createEmptyRequest();
    const req = {
      ...baseReq,
      id: 'req_temp_' + Date.now(),
      name: template.name,
      method: template.method,
      url: template.url,
      body: template.body || baseReq.body
    };

    updateActiveTab({
      request: req,
      activeRequestId: req.id,
      activeCollectionId: null,
      response: null,
    });
  };

  // Get a short display label for a tab
  const getTabLabel = (tab) => {
    const name = tab.request?.name;
    const url = tab.request?.url;
    if (name && name !== 'New Request') return name;
    if (url) {
      try {
        const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
        return urlObj.pathname === '/' ? urlObj.hostname : urlObj.pathname.split('/').filter(Boolean).pop() || urlObj.hostname;
      } catch {
        return url.length > 24 ? url.slice(0, 24) + '…' : url;
      }
    }
    return 'Untitled';
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-zinc-100 dark:bg-zinc-950 font-sans text-zinc-800 dark:text-zinc-200">

      {/* Sidebar - Collections & History */}
      <Sidebar
        collections={collections}
        history={history}
        activeRequestId={activeRequestId}
        onSelectRequest={handleSelectRequest}
        onAddCollection={handleOpenAddCollection}
        onRenameCollection={handleOpenRenameCollection}
        onDeleteCollection={handleDeleteCollection}
        onAddRequestToCollection={handleAddRequestToCollection}
        onDeleteRequestFromCollection={handleDeleteRequestFromCollection}
        onClearHistory={handleClearHistory}
        onDeleteHistoryItem={handleDeleteHistoryItem}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">

        {/* Top Header Utilities */}
        <div className="h-12 border-b border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 select-none">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Active Workspace</span>
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800"></div>
          </div>
        </div>

        {/* ═══ Chrome-style Tab Bar ═══ */}
        <div className="tab-bar flex items-end bg-zinc-100 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 px-2 pt-1.5 shrink-0 overflow-x-auto gap-0.5">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            const method = tab.request?.method || 'GET';

            return (
              <div
                key={tab.id}
                onClick={() => handleSwitchTab(tab.id)}
                className={`group relative flex items-center gap-2 pl-3 pr-1.5 py-2 rounded-t-lg text-xs font-medium cursor-pointer select-none min-w-[120px] max-w-[220px] transition-all duration-150
                  ${isActive
                    ? 'bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 border border-b-0 border-zinc-200 dark:border-zinc-800 shadow-sm z-10 -mb-px'
                    : 'bg-zinc-200/50 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 border border-transparent hover:bg-zinc-200/80 dark:hover:bg-zinc-800/70 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
              >
                {/* Loading spinner or method badge */}
                {tab.isLoading ? (
                  <span className="w-2.5 h-2.5 rounded-full border-[1.5px] border-indigo-400/30 border-t-indigo-400 animate-spin shrink-0"></span>
                ) : (
                  <span className={`font-mono text-[9px] font-bold shrink-0 ${getMethodColor(method)}`}>
                    {method}
                  </span>
                )}

                {/* Tab label */}
                <span className="truncate flex-1 text-[11px]">
                  {getTabLabel(tab)}
                </span>

                {/* Response status dot */}
                {tab.response && (
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tab.response.status >= 200 && tab.response.status < 300 ? 'bg-emerald-400' :
                    tab.response.status >= 400 ? 'bg-rose-400' :
                      'bg-amber-400'
                    }`}></span>
                )}

                {/* Close button */}
                <button
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  className={`p-0.5 rounded-md transition-all shrink-0 cursor-pointer
                    ${isActive
                      ? 'hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                      : 'opacity-0 group-hover:opacity-100 hover:bg-zinc-300/60 dark:hover:bg-zinc-700/60 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                    }`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* New Tab "+" button */}
          <button
            onClick={handleCreateNewTab}
            className="flex items-center justify-center w-7 h-7 mb-0.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-all cursor-pointer shrink-0"
            title="New Tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content workspace area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
          {/* Request Builder — key forces remount on tab switch */}
          <RequestPanel
            key={activeTabId + '_req'}
            request={currentRequest}
            onChangeRequest={setCurrentRequest}
            onSend={handleSendRequest}
            isLoading={isLoading}
          />

          {/* Response Inspector */}
          <ResponsePanel
            key={activeTabId + '_res'}
            response={response}
            onLoadTemplate={handleLoadTemplate}
          />
        </div>

      </main>

      {/* --- Modals --- */}
      <CollectionModal
        isOpen={isColModalOpen}
        onClose={() => setIsColModalOpen(false)}
        onSubmit={handleCollectionModalSubmit}
        initialName={colModalConfig.initialName}
        isEdit={colModalConfig.isEdit}
      />

    </div>
  );
}