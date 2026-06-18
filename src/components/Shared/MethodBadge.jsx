import React from 'react';

const METHOD_COLORS = {
  GET: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-500/20'
  },
  POST: {
    bg: 'bg-amber-500/10 dark:bg-amber-950/40',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-500/20'
  },
  PUT: {
    bg: 'bg-blue-500/10 dark:bg-blue-950/40',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-500/20'
  },
  PATCH: {
    bg: 'bg-purple-500/10 dark:bg-purple-950/40',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-500/20'
  },
  DELETE: {
    bg: 'bg-rose-500/10 dark:bg-rose-950/40',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-500/20'
  },
  OPTIONS: {
    bg: 'bg-slate-500/10 dark:bg-slate-900/40',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-500/20'
  },
  HEAD: {
    bg: 'bg-teal-500/10 dark:bg-teal-950/40',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-500/20'
  }
};

export default function MethodBadge({ method, className = '' }) {
  const m = (method || 'GET').toUpperCase();
  const styles = METHOD_COLORS[m] || METHOD_COLORS.GET;
  
  return (
    <span className={`inline-flex items-center justify-center font-mono text-xs font-semibold px-2 py-0.5 rounded border ${styles.bg} ${styles.text} ${styles.border} ${className}`}>
      {m}
    </span>
  );
}
