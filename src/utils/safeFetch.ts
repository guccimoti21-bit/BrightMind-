/**
 * Safe fetch utility that inspects HTTP status and Content-Type
 * before attempting to parse responses as JSON.
 * Prevents "Unexpected token 'T', 'The page c'... is not valid JSON" errors
 * when endpoints return HTML (such as 404 pages on GitHub Pages or static hosts).
 */

export interface SafeFetchResult<T = any> {
  ok: boolean;
  status: number;
  statusText: string;
  data?: T;
  error?: string;
  isHtml?: boolean;
}

export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<SafeFetchResult<T>> {
  try {
    const res = await fetch(url, options);
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    const isJson = contentType.includes('application/json');

    if (isJson) {
      try {
        const data = await res.json();
        if (res.ok) {
          return {
            ok: true,
            status: res.status,
            statusText: res.statusText,
            data
          };
        } else {
          return {
            ok: false,
            status: res.status,
            statusText: res.statusText,
            data,
            error: data?.error || data?.message || `[HTTP ${res.status}] Request failed: ${res.statusText || 'Error'}`
          };
        }
      } catch (parseErr: any) {
        return {
          ok: false,
          status: res.status,
          statusText: res.statusText,
          error: `[HTTP ${res.status}] Failed to parse JSON response: ${parseErr.message}`
        };
      }
    }

    // Response is NOT JSON (e.g. HTML 404 from GitHub Pages, 502 Bad Gateway, plain text)
    const textBody = await res.text().catch(() => '');
    const isHtml = contentType.includes('text/html') || textBody.trim().startsWith('<') || textBody.includes('<!DOCTYPE');

    let friendlyError: string;
    if (res.status === 404) {
      friendlyError = `[HTTP 404 Not Found] The backend endpoint (${url}) is not available on this static host (GitHub Pages). Please authenticate via Supabase Auth or configure your backend API.`;
    } else if (res.status === 401) {
      friendlyError = `[HTTP 401 Unauthorized] Invalid administrator credentials.`;
    } else if (res.status === 403) {
      friendlyError = `[HTTP 403 Forbidden] Access denied. Administrator privileges required.`;
    } else if (res.status === 405) {
      friendlyError = `[HTTP 405 Method Not Allowed] The requested method is not allowed on ${url}.`;
    } else if (res.status >= 500) {
      friendlyError = `[HTTP ${res.status} Server Error] The backend server encountered an error.`;
    } else {
      friendlyError = `[HTTP ${res.status} ${res.statusText || 'Error'}] Endpoint returned HTML/text instead of JSON.`;
    }

    return {
      ok: false,
      status: res.status,
      statusText: res.statusText,
      error: friendlyError,
      isHtml
    };
  } catch (networkErr: any) {
    return {
      ok: false,
      status: 0,
      statusText: 'Network Error',
      error: networkErr.message || 'Network error: Unable to connect to server.'
    };
  }
}
