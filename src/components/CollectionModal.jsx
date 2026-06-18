import React, { useState, useEffect } from 'react';
import { X, FolderPlus } from 'lucide-react';

export default function CollectionModal({
  isOpen,
  onClose,
  onSubmit,
  initialName = '',
  isEdit = false
}) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <form 
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-zinc-900 border border-zinc-855 rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2 text-zinc-100 font-bold">
            <FolderPlus className="w-5 h-5 text-indigo-400" />
            <h3>{isEdit ? 'Rename Collection' : 'Create New Collection'}</h3>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Collection Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. User Authentication Endpoints"
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-zinc-500"
              autoFocus
              required
            />
          </div>
          <p className="text-xs text-zinc-500">
            Collections let you organize related API requests into clean folders that you can save and access anytime.
          </p>
        </div>

        {/* Action Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-zinc-800/60 bg-zinc-950/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-transparent hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg shadow-md transition-colors cursor-pointer"
          >
            {isEdit ? 'Save Changes' : 'Create Collection'}
          </button>
        </div>
      </form>
    </div>
  );
}
