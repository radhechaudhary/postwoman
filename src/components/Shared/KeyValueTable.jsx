import React, { useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function KeyValueTable({ 
  items = [], 
  onChange, 
  placeholderKey = "Key", 
  placeholderValue = "Value" 
}) {
  
  // Ensure we always have at least one empty row at the bottom
  useEffect(() => {
    if (items.length === 0 || items[items.length - 1].key !== '' || items[items.length - 1].value !== '') {
      const updated = [...items, { key: '', value: '', active: true }];
      onChange(updated);
    }
  }, [items, onChange]);

  const handleRowChange = (index, field, value) => {
    const updated = items.map((item, idx) => {
      if (idx === index) {
        const newItem = { ...item, [field]: value };
        // If they enable/disable or type key/value, keep active state matching
        if (field === 'key' || field === 'value') {
          newItem.active = true;
        }
        return newItem;
      }
      return item;
    });
    
    onChange(updated);
  };

  const handleToggleActive = (index) => {
    const updated = items.map((item, idx) => {
      if (idx === index) {
        return { ...item, active: !item.active };
      }
      return item;
    });
    onChange(updated);
  };

  const handleDeleteRow = (index) => {
    if (items.length <= 1 && index === 0) {
      // Don't delete the only row, just clear it
      onChange([{ key: '', value: '', active: true }]);
      return;
    }
    const updated = items.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  return (
    <div className="w-full overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900/50">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 font-medium select-none">
            <th className="w-12 py-2 px-3 text-center"></th>
            <th className="py-2 px-3 border-r border-zinc-200 dark:border-zinc-800">Key</th>
            <th className="py-2 px-3 border-r border-zinc-200 dark:border-zinc-800">Value</th>
            <th className="w-12 py-2 px-3 text-center"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return (
              <tr 
                key={index} 
                className={`border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 last:border-b-0 transition-colors ${
                  !item.active ? 'opacity-50' : ''
                }`}
              >
                {/* Active Checkbox */}
                <td className="py-1 px-2 text-center align-middle">
                  {!isLast && (
                    <input 
                      type="checkbox" 
                      checked={item.active}
                      onChange={() => handleToggleActive(index)}
                      className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-zinc-900 bg-transparent cursor-pointer"
                    />
                  )}
                </td>

                {/* Key Input */}
                <td className="py-1 px-3 border-r border-zinc-100 dark:border-zinc-800/60">
                  <input
                    type="text"
                    value={item.key}
                    placeholder={placeholderKey}
                    onChange={(e) => handleRowChange(index, 'key', e.target.value)}
                    className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-1 font-mono text-xs dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600"
                  />
                </td>

                {/* Value Input */}
                <td className="py-1 px-3 border-r border-zinc-100 dark:border-zinc-800/60">
                  <input
                    type="text"
                    value={item.value}
                    placeholder={placeholderValue}
                    onChange={(e) => handleRowChange(index, 'value', e.target.value)}
                    className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-1 font-mono text-xs dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600"
                  />
                </td>

                {/* Delete Button */}
                <td className="py-1 px-2 text-center align-middle">
                  {!isLast && (
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(index)}
                      className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                      title="Delete row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
