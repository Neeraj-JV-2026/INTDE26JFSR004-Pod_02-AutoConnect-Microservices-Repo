import axios from 'axios';

const API_GATEWAY = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8089';
const TOKEN_KEY = 'ac_token';

/**
 * Factory function that creates a configured Axios instance
 * for a given base path on the API gateway.
 *
 * @param {string} basePath - e.g. '/api/auth', '/api/inventory'
 * @returns {import('axios').AxiosInstance}
 */
export function createApiClient(basePath = '') {
  const instance = axios.create({
    baseURL: `${API_GATEWAY}${basePath}`,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // ── Request Interceptor ────────────────────────────────────
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ── Response Interceptor ───────────────────────────────────
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const { status } = error.response;

        if (status === 401) {
          // Token expired or invalid — clear storage and redirect
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('ac_user');
          // Avoid redirect loop if already on /login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }

        if (status === 403) {
          // Forbidden — let the caller handle, but log it
          console.warn('AutoConnect: 403 Forbidden —', error.config?.url);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
}

// ── Named Instances ────────────────────────────────────────────

/** For auth endpoints (no base path needed beyond /api/auth) */
export const authClient = createApiClient('/api/auth');

/** Generic gateway client — use for ad-hoc requests */
export const gatewayClient = createApiClient('');

export default createApiClient;
