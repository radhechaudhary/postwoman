import React, { useState, useEffect } from 'react';
import { Send, Eye, ShieldCheck, FileJson, Layers, Settings, ShieldAlert, Sparkles } from 'lucide-react';
import KeyValueTable from './Shared/KeyValueTable';
import { parseQueryParams, buildUrlWithParams } from '../utils/helper';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

export default function RequestPanel({
  request = {},
  onChangeRequest,
  onSend,
  isLoading,
}) {
  const [activeTab, setActiveTab] = useState('params'); // 'params' | 'auth' | 'headers' | 'body'
  const [jsonError, setJsonError] = useState(null);

  // Set default structure if properties are missing
  const method = request.method || 'GET';
  const url = request.url || '';
  const params = request.params || [];
  const headers = request.headers || [];
  const body = request.body || { type: 'none', json: '', formdata: [] };
  const auth = request.auth || { type: 'none', bearer: '', basic: { username: '', password: '' }, apiKey: { key: '', value: '', addTo: 'header' } };

  // Sync params when URL changes (but prevent infinite loops)
  const handleUrlChange = (newUrl) => {
    const parsedParams = parseQueryParams(newUrl);

    // Merge new parsed params with existing params to preserve checkbox active states
    // If a param existed, keep its active state, else default to true.
    const mergedParams = parsedParams.map(newP => {
      const existing = params.find(p => p.key === newP.key);
      return {
        key: newP.key,
        value: newP.value,
        active: existing ? existing.active : true
      };
    });

    // Check if anything actually changed before setting state to avoid loops
    const hasChanged = JSON.stringify(mergedParams) !== JSON.stringify(params.filter(p => p.key || p.value));

    onChangeRequest({
      ...request,
      url: newUrl,
      params: hasChanged || params.length === 0 ? mergedParams : params
    });
  };

  // Sync URL when Params change
  const handleParamsChange = (newParams) => {
    const newUrl = buildUrlWithParams(url, newParams);
    onChangeRequest({
      ...request,
      url: newUrl,
      params: newParams
    });
  };

  // Check JSON validation
  useEffect(() => {
    if (body.type === 'json' && body.json) {
      try {
        JSON.parse(body.json);
        setJsonError(null);
      } catch (err) {
        setJsonError(err.message);
      }
    } else {
      setJsonError(null);
    }
  }, [body.json, body.type]);

  const handleBodyTypeChange = (type) => {
    onChangeRequest({
      ...request,
      body: {
        ...body,
        type
      }
    });
  };

  const handleBodyJsonChange = (jsonText) => {
    onChangeRequest({
      ...request,
      body: {
        ...body,
        json: jsonText
      }
    });
  };

  const handleBodyFormDataChange = (newFormData) => {
    onChangeRequest({
      ...request,
      body: {
        ...body,
        formdata: newFormData
      }
    });
  };

  const handleHeadersChange = (newHeaders) => {
    onChangeRequest({
      ...request,
      headers: newHeaders
    });
  };

  const handleAuthChange = (field, value) => {
    onChangeRequest({
      ...request,
      auth: {
        ...auth,
        [field]: value
      }
    });
  };

  const handleAuthSubFieldChange = (subField, key, value) => {
    onChangeRequest({
      ...request,
      auth: {
        ...auth,
        [subField]: {
          ...auth[subField],
          [key]: value
        }
      }
    });
  };

  const handleMethodChange = (newMethod) => {
    onChangeRequest({
      ...request,
      method: newMethod
    });
  };

  // Method select classes
  const getMethodSelectClass = () => {
    const base = "font-mono font-bold text-xs px-3.5 py-2.5 rounded-l-lg border-y border-l focus:outline-none cursor-pointer transition-all border-zinc-250 dark:border-zinc-800 ";
    switch (method) {
      case 'GET': return base + "text-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/20";
      case 'POST': return base + "text-amber-500 bg-amber-500/5 dark:bg-amber-950/20";
      case 'PUT': return base + "text-blue-500 bg-blue-500/5 dark:bg-blue-950/20";
      case 'DELETE': return base + "text-rose-500 bg-rose-500/5 dark:bg-rose-950/20";
      case 'PATCH': return base + "text-purple-500 bg-purple-500/5 dark:bg-purple-950/20";
      default: return base + "text-zinc-500 bg-zinc-500/5 dark:bg-zinc-900/20";
    }
  };

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm space-y-4">

      {/* Dynamic Request Name Header */}
      <div className="flex items-center justify-between pb-2">
        <input
          type="text"
          value={request.name || ''}
          placeholder="Untitled Request"
          onChange={(e) => onChangeRequest({ ...request, name: e.target.value })}
          className="bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 focus:outline-none text-zinc-800 dark:text-zinc-100 font-bold text-base px-1 py-0.5 w-64 transition-all"
        />
      </div>

      {/* URL & Method Entry Bar */}
      <form onSubmit={(e) => { e.preventDefault(); onSend(); }} className="flex items-center w-full shadow-sm rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">

        {/* Method Select */}
        <select
          value={method}
          onChange={(e) => handleMethodChange(e.target.value)}
          className={getMethodSelectClass()}
        >
          {METHODS.map(m => (
            <option key={m} value={m} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">{m}</option>
          ))}
        </select>

        {/* URL Input */}
        <input
          type="text"
          value={url}
          placeholder="https://api.example.com/endpoint or mock.aether.api/users"
          onChange={(e) => handleUrlChange(e.target.value)}
          className="flex-1 bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 px-4 py-2 text-sm font-mono focus:outline-none border-y border-zinc-250 dark:border-zinc-800"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`flex items-center gap-1.5 px-6 py-2.5 font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all rounded-r-lg border-y border-r border-indigo-700 dark:border-indigo-600 cursor-pointer shadow-md select-none ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          {isLoading ? (
            <span className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Send</span>
        </button>
      </form>

      {/* Inner Tabs Menu */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-4 text-xs font-semibold select-none pt-2">
        <button
          onClick={() => setActiveTab('params')}
          className={`pb-2 px-1 relative transition-colors cursor-pointer ${activeTab === 'params'
            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
        >
          Params
          {params.filter(p => p.key && p.active).length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[9px] font-bold">
              {params.filter(p => p.key && p.active).length}
            </span>
          )}
          {activeTab === 'params' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 dark:bg-indigo-400 rounded-t-full"></span>}
        </button>
        <button
          onClick={() => setActiveTab('auth')}
          className={`pb-2 px-1 relative transition-colors cursor-pointer ${activeTab === 'auth'
            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
        >
          Auth
          {auth.type !== 'none' && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold">
              ✔
            </span>
          )}
          {activeTab === 'auth' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 dark:bg-indigo-400 rounded-t-full"></span>}
        </button>
        <button
          onClick={() => setActiveTab('headers')}
          className={`pb-2 px-1 relative transition-colors cursor-pointer ${activeTab === 'headers'
            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
        >
          Headers
          {headers.filter(h => h.key && h.active).length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[9px] font-bold">
              {headers.filter(h => h.key && h.active).length}
            </span>
          )}
          {activeTab === 'headers' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 dark:bg-indigo-400 rounded-t-full"></span>}
        </button>
        <button
          onClick={() => setActiveTab('body')}
          className={`pb-2 px-1 relative transition-colors cursor-pointer ${activeTab === 'body'
            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
        >
          Body
          {body.type !== 'none' && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[9px] font-bold">
              {body.type.toUpperCase()}
            </span>
          )}
          {activeTab === 'body' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 dark:bg-indigo-400 rounded-t-full"></span>}
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-2 min-h-[140px]">

        {/* PARAMS PANEL */}
        {activeTab === 'params' && (
          <div className="space-y-2">
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Query Parameters</div>
            <KeyValueTable
              items={params}
              onChange={handleParamsChange}
              placeholderKey="Parameter Name"
              placeholderValue="Value"
            />
          </div>
        )}

        {/* AUTH PANEL */}
        {activeTab === 'auth' && (
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-1 space-y-1.5 border-r border-zinc-200 dark:border-zinc-800 pr-4">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Auth Type</label>
              <select
                value={auth.type}
                onChange={(e) => handleAuthChange('type', e.target.value)}
                className="w-full text-black bg-zinc-200 border border-zinc-250 rounded-lg p-2 text-xs focus:outline-none cursor-pointer"
              >
                <option value="none">No Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
                <option value="apikey">API Key</option>
              </select>
            </div>

            <div className="col-span-3 flex flex-col justify-center">
              {auth.type === 'none' && (
                <div className="flex items-center gap-2 text-zinc-450 p-4 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg bg-zinc-50/20 dark:bg-zinc-900/10">
                  <ShieldCheck className="w-5 h-5 text-zinc-400" />
                  <span className="text-xs">This request does not use any authorization headers. Authorization headers can be set manually in the headers panel if required.</span>
                </div>
              )}

              {auth.type === 'bearer' && (
                <div className="space-y-1.5 max-w-lg">
                  <label className="text-xs font-semibold text-zinc-400">Token</label>
                  <input
                    type="text"
                    value={auth.bearer || ''}
                    placeholder="Enter Token or {{token_var}}"
                    onChange={(e) => handleAuthChange('bearer', e.target.value)}
                    className="w-full text-white bg-zinc-800 border  border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono  dark:text-zinc-150 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}

              {auth.type === 'basic' && (
                <div className="grid grid-cols-2 gap-4 max-w-lg">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400">Username</label>
                    <input
                      type="text"
                      value={auth.basic.username || ''}
                      placeholder="Username"
                      onChange={(e) => handleAuthSubFieldChange('basic', 'username', e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-250 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400">Password</label>
                    <input
                      type="password"
                      value={auth.basic.password || ''}
                      placeholder="Password"
                      onChange={(e) => handleAuthSubFieldChange('basic', 'password', e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-250 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {auth.type === 'apikey' && (
                <div className="grid grid-cols-3 gap-3 max-w-2xl">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400">Key</label>
                    <input
                      type="text"
                      value={auth.apiKey.key || ''}
                      placeholder="X-API-Key"
                      onChange={(e) => handleAuthSubFieldChange('apiKey', 'key', e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-250 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400">Value</label>
                    <input
                      type="text"
                      value={auth.apiKey.value || ''}
                      placeholder="api-key-value"
                      onChange={(e) => handleAuthSubFieldChange('apiKey', 'value', e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-250 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400">Add To</label>
                    <select
                      value={auth.apiKey.addTo}
                      onChange={(e) => handleAuthSubFieldChange('apiKey', 'addTo', e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-250 dark:border-zinc-700 rounded-lg p-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
                    >
                      <option value="header">Header</option>
                      <option value="query">Query Params</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HEADERS PANEL */}
        {activeTab === 'headers' && (
          <div className="space-y-2">
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">HTTP Request Headers</div>
            <KeyValueTable
              items={headers}
              onChange={handleHeadersChange}
              placeholderKey="Header (e.g. Content-Type)"
              placeholderValue="Value"
            />
          </div>
        )}

        {/* BODY PANEL */}
        {activeTab === 'body' && (
          <div className="space-y-3">
            {/* Body Type Select */}
            <div className="flex gap-4 border-b border-zinc-250 dark:border-zinc-800/60 pb-2 text-xs select-none">
              {['none', 'json', 'formdata'].map(type => (
                <label key={type} className="flex items-center gap-1.5 font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-250 cursor-pointer">
                  <input
                    type="radio"
                    name="body-type"
                    value={type}
                    checked={body.type === type}
                    onChange={() => handleBodyTypeChange(type)}
                    className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-zinc-900 bg-transparent cursor-pointer"
                  />
                  <span className="capitalize">{type === 'formdata' ? 'Form Data' : type}</span>
                </label>
              ))}
            </div>

            {/* Content areas */}
            {body.type === 'none' && (
              <div className="flex items-center gap-2 text-zinc-450 p-4 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg bg-zinc-50/20 dark:bg-zinc-900/10">
                <Layers className="w-5 h-5 text-zinc-400" />
                <span className="text-xs">This request does not have any body data payload. Select JSON or Form Data to supply parameters.</span>
              </div>
            )}

            {body.type === 'json' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1.5">
                    <FileJson className="w-3.5 h-3.5 text-indigo-400" /> Raw JSON Content
                  </span>
                  {jsonError ? (
                    <span className="text-[10px] bg-rose-500/10 border border-rose-500/25 text-rose-500 px-2 py-0.5 rounded flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> JSON Error: {jsonError.split('\n')[0]}
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 px-2 py-0.5 rounded flex items-center gap-1 select-none">
                      ✔ Valid JSON
                    </span>
                  )}
                </div>
                <textarea
                  value={body.json || ''}
                  onChange={(e) => handleBodyJsonChange(e.target.value)}
                  placeholder="{\n  &quot;key&quot;: &quot;value&quot;\n}"
                  rows={6}
                  className={`w-full bg-zinc-50 dark:bg-zinc-950 font-mono text-xs text-zinc-800 dark:text-zinc-150 p-3 rounded-lg border focus:outline-none focus:ring-1 transition-all ${jsonError
                    ? 'border-rose-500/40 focus:ring-rose-500 focus:border-rose-500'
                    : 'border-zinc-250 dark:border-zinc-800 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                />
              </div>
            )}

            {body.type === 'formdata' && (
              <div className="space-y-2">
                <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Multipart Form Data Key-Values</div>
                <KeyValueTable
                  items={body.formdata}
                  onChange={handleBodyFormDataChange}
                  placeholderKey="Field Name"
                  placeholderValue="Value"
                />
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
