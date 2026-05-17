import { authClient } from './axiosConfig';

/**
 * Login with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: object}>}
 */
export const login = async (email, password) => {
  const response = await authClient.post('/login', { email, password });
  return response.data;
};

/**
 * Register a new user account.
 * @param {object} data - { fullName, email, password, phone, role }
 * @returns {Promise<object>}
 */
export const register = async (data) => {
  const response = await authClient.post('/register', data);
  return response.data;
};

/**
 * Logout — invalidates the token on the server side.
 * @param {string} token
 * @returns {Promise<void>}
 */
export const logout = async (token) => {
  try {
    await authClient.post('/logout', { token });
  } catch (err) {
    // Silently ignore logout errors (token may already be expired)
    console.warn('AutoConnect: logout request failed silently', err?.message);
  }
};

/**
 * Validate an existing JWT token.
 * @param {string} token
 * @returns {Promise<{valid: boolean, user: object}>}
 */
export const validateToken = async (token) => {
  const response = await authClient.post('/validate', { token });
  return response.data;
};

/**
 * Refresh an expired JWT token.
 * @param {string} token - Current (possibly expired) token
 * @returns {Promise<{token: string}>}
 */
export const refreshToken = async (token) => {
  const response = await authClient.post('/refresh', { token });
  return response.data;
};

const authApi = { login, register, logout, validateToken, refreshToken };
export default authApi;
