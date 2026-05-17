import { createApiClient } from './axiosConfig';

const userClient = createApiClient('/api/users');

/**
 * Get all users (ADMIN only).
 * @param {object} params - { page, size, role, active }
 */
export const getUsers = (params = {}) =>
  userClient.get('', { params }).then((r) => r.data);

/**
 * Get a single user by ID.
 * @param {string|number} userId
 */
export const getUser = (userId) =>
  userClient.get(`/${userId}`).then((r) => r.data);

/**
 * Create a new user (admin action).
 * @param {object} userData
 */
export const createUser = (userData) =>
  userClient.post('', userData).then((r) => r.data);

/**
 * Update an existing user.
 * @param {string|number} userId
 * @param {object} updates
 */
export const updateUser = (userId, updates) =>
  userClient.put(`/${userId}`, updates).then((r) => r.data);

/**
 * Deactivate (soft-delete) a user.
 * @param {string|number} userId
 */
export const deactivateUser = (userId) =>
  userClient.patch(`/${userId}/deactivate`).then((r) => r.data);

/**
 * Re-activate a deactivated user.
 * @param {string|number} userId
 */
export const activateUser = (userId) =>
  userClient.patch(`/${userId}/activate`).then((r) => r.data);

/**
 * Get audit logs (ADMIN / AUDITOR).
 * @param {object} params - { page, size, userId, action, startDate, endDate }
 */
export const getAuditLogs = (params = {}) =>
  userClient.get('/audit-logs', { params }).then((r) => r.data);

/**
 * Update the current user's own profile.
 * @param {object} profileData
 */
export const updateProfile = (profileData) =>
  userClient.put('/me', profileData).then((r) => r.data);

/**
 * Change the current user's password.
 * @param {object} passwordData - { currentPassword, newPassword }
 */
export const changePassword = (passwordData) =>
  userClient.post('/me/change-password', passwordData).then((r) => r.data);

const userApi = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deactivateUser,
  activateUser,
  getAuditLogs,
  updateProfile,
  changePassword,
};

export default userApi;
