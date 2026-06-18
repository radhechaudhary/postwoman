/**
 * Parses query parameters from a URL string into a structured array.
 * @param {string} urlString 
 * @returns {Array<{key: string, value: string, active: boolean}>}
 */
export function parseQueryParams(urlString) {
  if (!urlString) return [];
  try {
    // Check if there is a query string
    const queryIndex = urlString.indexOf('?');
    if (queryIndex === -1) return [];

    const queryString = urlString.substring(queryIndex + 1);
    if (!queryString) return [];

    const pairs = queryString.split('&');
    return pairs
      .map(pair => {
        const eqIndex = pair.indexOf('=');
        if (eqIndex === -1) {
          return { key: decodeURIComponent(pair), value: '', active: true };
        }
        const key = decodeURIComponent(pair.substring(0, eqIndex));
        const value = decodeURIComponent(pair.substring(eqIndex + 1));
        return { key, value, active: true };
      })
      .filter(p => p.key || p.value);
  } catch (e) {
    console.error("Error parsing query params", e);
    return [];
  }
}

/**
 * Builds a full URL by appending active query parameters.
 * @param {string} urlString - The base URL (possibly containing existing parameters or not)
 * @param {Array<{key: string, value: string, active: boolean}>} params 
 * @returns {string} The full URL
 */
export function buildUrlWithParams(urlString, params) {
  if (!urlString) return '';
  
  // Strip existing query string
  const queryIndex = urlString.indexOf('?');
  const baseUrl = queryIndex === -1 ? urlString : urlString.substring(0, queryIndex);

  const activeParams = params.filter(p => p.active && p.key);
  if (activeParams.length === 0) return baseUrl;

  const queryString = activeParams
    .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
    .join('&');

  return `${baseUrl}?${queryString}`;
}

/**
 * Interpolates environment variables in the format {{variable_name}} with actual values.
 * @param {string} text - The input string (e.g. "{{base_url}}/users")
 * @param {Record<string, string>} envVars - Environment key-value mapping
 * @returns {string} The interpolated string
 */
export function replaceEnvVars(text, envVars) {
  if (!text || !envVars) return text || '';
  
  let interpolated = text;
  const regex = /\{\{([^}]+)\}\}/g;
  let match;
  
  // Loop to handle all placeholders
  while ((match = regex.exec(text)) !== null) {
    const placeholder = match[0]; // {{variable_name}}
    const varName = match[1].trim(); // variable_name
    if (envVars[varName] !== undefined) {
      interpolated = interpolated.replace(placeholder, envVars[varName]);
    }
  }
  
  return interpolated;
}

/**
 * Formats a size in bytes to a human-readable format.
 * @param {number} bytes 
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
