import { replaceEnvVars } from './helper';
import { fetch } from '@tauri-apps/plugin-http';

export async function executeRequest(config, envVars = {}) {
  const startTime = performance.now();

  // 1. Resolve environment variables in URL, headers, and body
  const rawUrl = config.url || '';
  let resolvedUrl = replaceEnvVars(rawUrl, envVars);

  // Handle protocol autofill
  if (resolvedUrl && !/^https?:\/\//i.test(resolvedUrl)) {
    resolvedUrl = 'https://' + resolvedUrl;
  }

  // Resolve headers
  const resolvedHeaders = {};
  if (config.headers) {
    config.headers.forEach(h => {
      if (h.active && h.key) {
        resolvedHeaders[h.key] = replaceEnvVars(h.value, envVars);
      }
    });
  }

  // Resolve Auth headers
  if (config.auth) {
    const { type, bearer, basic, apiKey } = config.auth;
    if (type === 'bearer' && bearer) {
      resolvedHeaders['Authorization'] = `Bearer ${replaceEnvVars(bearer, envVars)}`;
    } else if (type === 'basic' && (basic.username || basic.password)) {
      const u = replaceEnvVars(basic.username, envVars);
      const p = replaceEnvVars(basic.password, envVars);
      const encoded = btoa(`${u}:${p}`);
      resolvedHeaders['Authorization'] = `Basic ${encoded}`;
    } else if (type === 'apikey' && apiKey.key) {
      const k = replaceEnvVars(apiKey.key, envVars);
      const v = replaceEnvVars(apiKey.value, envVars);
      if (apiKey.addTo === 'header') {
        resolvedHeaders[k] = v;
      } else if (apiKey.addTo === 'query') {
        // Will append query parameters to the URL
        const separator = resolvedUrl.includes('?') ? '&' : '?';
        resolvedUrl = `${resolvedUrl}${separator}${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
      }
    }
  }

  // Resolve Body
  let resolvedBody = null;
  if (config.body && config.body.type !== 'none') {
    if (config.body.type === 'json' && config.body.json) {
      resolvedBody = replaceEnvVars(config.body.json, envVars);
      // Auto add Content-Type if JSON
      if (!resolvedHeaders['Content-Type'] && !resolvedHeaders['content-type']) {
        resolvedHeaders['Content-Type'] = 'application/json';
      }
    } else if (config.body.type === 'formdata' && config.body.formdata) {
      const formData = new FormData();
      config.body.formdata.forEach(item => {
        if (item.active && item.key) {
          formData.append(item.key, replaceEnvVars(item.value, envVars));
        }
      });
      resolvedBody = formData;
      // Do not set Content-Type header; fetch will set boundary automatically
    }
  }


  // 3. Perform Actual HTTP Request
  try {
    const fetchOptions = {
      method: config.method,
      headers: resolvedHeaders,
    };

    if (config.method !== 'GET' && config.method !== 'HEAD' && resolvedBody) {
      fetchOptions.body = resolvedBody;
    }

    const response = await fetch(resolvedUrl, fetchOptions);
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    // Read headers
    const responseHeaders = {};
    response.headers.forEach((val, key) => {
      responseHeaders[key] = val;
    });

    // Extract cookies from headers
    const responseCookies = parseCookies(responseHeaders['set-cookie'] || '');

    // Get body string
    let responseText = '';
    let responseData = null;
    let isJson = false;

    try {
      responseText = await response.text();
      try {
        responseData = JSON.parse(responseText);
        isJson = true;
      } catch {
        responseData = responseText;
      }
    } catch (err) {
      responseText = `Failed to read response body: ${err.message}`;
    }

    // Estimate size
    const sizeHeader = responseHeaders['content-length'];
    const size = sizeHeader ? parseInt(sizeHeader, 10) : new Blob([responseText]).size;

    return {
      status: response.status,
      statusText: response.statusText || getHttpStatusText(response.status),
      headers: responseHeaders,
      cookies: responseCookies,
      data: responseData,
      isJson,
      rawBody: responseText,
      duration,
      size,
      error: response.status >= 400 ? `HTTP Request failed with status ${response.status}` : null,
      resolvedUrl
    };
  } catch (error) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    console.log(error)
    const errorMessage = error || 'Unknown network error';

    return {
      status: 0,
      statusText: 'Network Error',
      headers: {},
      cookies: [],
      data: null,
      isJson: false,
      rawBody: `Error: ${errorMessage}`,
      duration,
      size: 0,
      error: errorMessage,
      resolvedUrl
    };
  }
}

/**
 * Parses raw cookie strings into a structured object list.
 */
function parseCookies(cookieHeader) {
  if (!cookieHeader) return [];

  // Format: key=value; Domain=...; Path=...
  const parts = cookieHeader.split(',');
  return parts.map(part => {
    const cookie = {};
    const items = part.split(';');

    // First item is name=value
    const first = items[0].trim();
    const eq = first.indexOf('=');
    if (eq !== -1) {
      cookie.name = first.substring(0, eq);
      cookie.value = first.substring(eq + 1);
    } else {
      cookie.name = first;
      cookie.value = '';
    }

    // Additional params
    for (let i = 1; i < items.length; i++) {
      const sub = items[i].trim();
      const subEq = sub.indexOf('=');
      const key = subEq !== -1 ? sub.substring(0, subEq).toLowerCase() : sub.toLowerCase();
      const val = subEq !== -1 ? sub.substring(subEq + 1) : true;
      cookie[key] = val;
    }
    return cookie;
  });
}

function getHttpStatusText(status) {
  const codes = {
    200: 'OK', 201: 'Created', 202: 'Accepted', 204: 'No Content',
    301: 'Moved Permanently', 302: 'Found', 304: 'Not Modified',
    400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 405: 'Method Not Allowed',
    500: 'Internal Server Error', 502: 'Bad Gateway', 503: 'Service Unavailable', 504: 'Gateway Timeout'
  };
  return codes[status] || 'Unknown';
}
