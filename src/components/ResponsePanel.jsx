import React, { useState } from 'react';
import {
  Copy, Check, FileText, Database, ShieldAlert, Sparkles,
  Terminal, ExternalLink, Zap, HelpCircle, RefreshCw
} from 'lucide-react';
import { formatBytes } from '../utils/helper';

export default function ResponsePanel({
  response = null,
  onLoadTemplate
}) {
  const [activeTab, setActiveTab] = useState('body'); // 'body' | 'headers' | 'cookies'
  const [bodyMode, setBodyMode] = useState('pretty'); // 'pretty' | 'raw' | 'preview'
  const [copied, setCopied] = useState(false);

  // Syntax highlighting for JSON output
  const highlightJson = (jsonObj) => {
    try {
      const json = JSON.stringify(jsonObj, null, 2);
      if (!json) return '';

      // Escape HTML
      const escaped = json
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Regex pattern for matching JSON components
      return escaped.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
        (match) => {
          let cls = 'text-zinc-350';
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'text-indigo-400 dark:text-indigo-350 font-medium'; // Key
            } else {
              cls = 'text-emerald-600 dark:text-emerald-400'; // String value
            }
          } else if (/true|false/.test(match)) {
            cls = 'text-purple-600 dark:text-purple-400 font-semibold'; // Boolean
          } else if (/null/.test(match)) {
            cls = 'text-rose-500 font-semibold'; // Null
          } else {
            cls = 'text-amber-600 dark:text-amber-400'; // Number
          }

          if (cls.includes('font-medium')) {
            return `<span class="${cls}">${match.replace(/:$/, '')}</span>:`;
          }
          return `<span class="${cls}">${match}</span>`;
        }
      );
    } catch (e) {
      return typeof jsonObj === 'string' ? jsonObj : JSON.stringify(jsonObj);
    }
  };

  const handleCopy = () => {
    const textToCopy = response?.isJson
      ? JSON.stringify(response.data, null, 2)
      : response?.rawBody || '';

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick template helper loading
  const quickTemplates = [
    {
      name: 'GET Mock Users list',
      method: 'GET',
      url: 'mock.aether.api/users',
      desc: 'Simulated CORS-free endpoint returning mock team members.',
      useMock: true
    },
    {
      name: 'POST Mock Add User',
      method: 'POST',
      url: 'mock.aether.api/users',
      desc: 'Creates a simulated user item and returns 201 Created state.',
      useMock: true,
      body: {
        type: 'json',
        json: '{\n  "name": "Sarah Connor",\n  "email": "sarah.c@sky.net",\n  "role": "Security Analyst"\n}'
      }
    },
    {
      name: 'GET Free JSONPlaceholder Posts',
      method: 'GET',
      url: 'jsonplaceholder.typicode.com/posts/1',
      desc: 'Real public REST endpoint returning dummy blog data.',
      useMock: false
    },
    {
      name: 'GET HTTPBin request metadata',
      method: 'GET',
      url: 'httpbin.org/get',
      desc: 'Reflects headers and IP details from a live server.',
      useMock: false
    }
  ];

  // If there's no response yet, show the Welcome / Dashboard panel
  if (!response) {
    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-6 overflow-y-auto space-y-8 select-none">

        {/* Banner Welcome */}
        <div className="flex flex-col items-center text-center py-8 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-2xl border border-indigo-500/10">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-4 animate-pulse">
            <div className="w-8 h-8 flex items-center justify-center ">
              <img src="/icon.png" alt="" className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-zinc-800 dark:text-zinc-100 tracking-wide">
            Welcome to Postwoman
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-lg">
            A beautiful, localized API client with support for query parameters synchronization and collections
          </p>
        </div>
      </div>
    );
  }

  // Response Status Colors
  const getStatusBadgeColors = (status) => {
    if (status >= 200 && status < 300) {
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    } else if (status >= 300 && status < 400) {
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    } else if (status >= 400 && status < 500) {
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    } else if (status >= 500 || status === 0) {
      return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    }
    return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
  };

  const isHtml = response.headers['content-type']?.includes('text/html');

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm overflow-hidden select-text">

      {/* Response Header Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40">

        {/* Response Metadata */}
        <div className="flex items-center gap-4 text-xs font-semibold select-none">
          <div className="text-zinc-450 uppercase tracking-wider">Response</div>

          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-bold ${getStatusBadgeColors(response.status)}`}>
            <span>{response.status || 'ERROR'}</span>
            <span>{response.statusText}</span>
          </div>

          {/* Time Badge */}
          <div className="text-zinc-500 dark:text-zinc-400">
            Time: <span className="font-mono text-zinc-800 dark:text-zinc-200">{response.duration} ms</span>
          </div>

          {/* Size Badge */}
          <div className="text-zinc-500 dark:text-zinc-400">
            Size: <span className="font-mono text-zinc-800 dark:text-zinc-200">{formatBytes(response.size)}</span>
          </div>
        </div>

        {/* Copy/Action Panel */}
        <div className="flex items-center gap-2">
          {response.rawBody && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[11px] font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors shadow-sm cursor-pointer"
              title="Copy body content"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Response config inner tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-5 gap-4 text-xs font-semibold select-none">
        <button
          onClick={() => setActiveTab('body')}
          className={`py-2 px-1 relative transition-colors cursor-pointer ${activeTab === 'body'
            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
        >
          Body
          {activeTab === 'body' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 dark:bg-indigo-400 rounded-t-full"></span>}
        </button>
        <button
          onClick={() => setActiveTab('headers')}
          className={`py-2 px-1 relative transition-colors cursor-pointer ${activeTab === 'headers'
            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
        >
          Headers
          {Object.keys(response.headers).length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[9px] font-bold">
              {Object.keys(response.headers).length}
            </span>
          )}
          {activeTab === 'headers' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 dark:bg-indigo-400 rounded-t-full"></span>}
        </button>
        <button
          onClick={() => setActiveTab('cookies')}
          className={`py-2 px-1 relative transition-colors cursor-pointer ${activeTab === 'cookies'
            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
        >
          Cookies
          {response.cookies.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[9px] font-bold">
              {response.cookies.length}
            </span>
          )}
          {activeTab === 'cookies' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 dark:bg-indigo-400 rounded-t-full"></span>}
        </button>
      </div>

      {/* Response Panel content */}
      <div className="flex-1 overflow-y-auto p-5 min-h-[200px]">

        {/* BODY RESPONSE PANEL */}
        {activeTab === 'body' && (
          <div className="h-full flex flex-col space-y-3">
            {/* Formatting selectors (Pretty / Raw / Preview) */}
            <div className="flex items-center gap-4 text-[10px] font-bold select-none border-b border-zinc-100 dark:border-zinc-800/40 pb-2">
              <button
                onClick={() => setBodyMode('pretty')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${bodyMode === 'pretty'
                  ? 'bg-zinc-150 dark:bg-zinc-800 text-indigo-500'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-350'
                  }`}
              >
                Pretty
              </button>
              <button
                onClick={() => setBodyMode('raw')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${bodyMode === 'raw'
                  ? 'bg-zinc-150 dark:bg-zinc-800 text-indigo-500'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-350'
                  }`}
              >
                Raw
              </button>
              {(isHtml || response.rawBody?.includes('<!DOCTYPE html>') || response.rawBody?.includes('<html')) && (
                <button
                  onClick={() => setBodyMode('preview')}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${bodyMode === 'preview'
                    ? 'bg-zinc-150 dark:bg-zinc-800 text-indigo-500'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-350'
                    }`}
                >
                  Preview HTML
                </button>
              )}
            </div>

            {/* Display Body according to mode */}
            <div className="flex-1 min-h-[160px] rounded-lg border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 p-4 font-mono text-xs overflow-auto">

              {/* Pretty format */}
              {bodyMode === 'pretty' && (
                response.isJson ? (
                  <pre
                    className="whitespace-pre-wrap leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: highlightJson(response.data) }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap text-zinc-850 dark:text-zinc-200 leading-relaxed">
                    {response.rawBody || 'No response body returned'}
                  </pre>
                )
              )}

              {/* Raw format */}
              {bodyMode === 'raw' && (
                <pre className="whitespace-pre-wrap text-zinc-850 dark:text-zinc-200 leading-relaxed">
                  {response.rawBody || 'No response body returned'}
                </pre>
              )}

              {/* HTML Preview (iframe sandbox) */}
              {bodyMode === 'preview' && (
                <iframe
                  title="HTML Response Preview"
                  srcDoc={response.rawBody}
                  sandbox=""
                  className="w-full h-full min-h-[350px] bg-white rounded border border-zinc-200 shadow-inner"
                />
              )}
            </div>
          </div>
        )}

        {/* HEADERS RESPONSE PANEL */}
        {activeTab === 'headers' && (
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-950/20">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-850 bg-zinc-100/50 dark:bg-zinc-950/60 font-semibold text-zinc-500 dark:text-zinc-400">
                  <th className="py-2.5 px-4 border-r border-zinc-200 dark:border-zinc-850">Header (Key)</th>
                  <th className="py-2.5 px-4">Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(response.headers).map(([key, val]) => (
                  <tr key={key} className="border-b border-zinc-150 dark:border-zinc-850/60 last:border-0 hover:bg-zinc-100/30 dark:hover:bg-zinc-900/10">
                    <td className="py-2 px-4 border-r border-zinc-150 dark:border-zinc-850/60 font-medium text-zinc-650 dark:text-zinc-400 select-all">{key}</td>
                    <td className="py-2 px-4 font-mono text-zinc-800 dark:text-zinc-200 select-all">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* COOKIES RESPONSE PANEL */}
        {activeTab === 'cookies' && (
          response.cookies.length > 0 ? (
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-950/20">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-850 bg-zinc-100/50 dark:bg-zinc-950/60 font-semibold text-zinc-500 dark:text-zinc-400">
                    <th className="py-2.5 px-4 border-r border-zinc-200 dark:border-zinc-850">Name</th>
                    <th className="py-2.5 px-4 border-r border-zinc-200 dark:border-zinc-850">Value</th>
                    <th className="py-2.5 px-4 border-r border-zinc-200 dark:border-zinc-850">Domain</th>
                    <th className="py-2.5 px-4">Path</th>
                  </tr>
                </thead>
                <tbody>
                  {response.cookies.map((cookie, idx) => (
                    <tr key={idx} className="border-b border-zinc-150 dark:border-zinc-850/60 last:border-0 hover:bg-zinc-100/30 dark:hover:bg-zinc-900/10">
                      <td className="py-2 px-4 border-r border-zinc-150 dark:border-zinc-850/60 font-semibold text-zinc-650 dark:text-zinc-400 select-all">{cookie.name}</td>
                      <td className="py-2 px-4 border-r border-zinc-150 dark:border-zinc-850/60 font-mono text-zinc-800 dark:text-zinc-200 select-all truncate max-w-[120px]">{cookie.value}</td>
                      <td className="py-2 px-4 border-r border-zinc-150 dark:border-zinc-850/60 text-zinc-500 select-all">{cookie.domain || 'N/A'}</td>
                      <td className="py-2 px-4 text-zinc-500 select-all">{cookie.path || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-450 bg-zinc-50 dark:bg-zinc-950/10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
              <Database className="w-8 h-8 mb-2 stroke-1 text-zinc-400" />
              <span className="text-xs">No cookies returned in response header</span>
            </div>
          )
        )}

      </div>

    </div>
  );
}
