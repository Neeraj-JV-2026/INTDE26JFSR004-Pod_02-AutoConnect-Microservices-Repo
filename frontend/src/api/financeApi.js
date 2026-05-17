import { createApiClient } from './axiosConfig';

const financeClient = createApiClient('/api/finance');

// ── Invoices ──────────────────────────────────────────────────

/**
 * Get all invoices.
 * @param {object} params - { page, size, status, customerId }
 */
export const getInvoices = (params = {}) =>
  financeClient.get('/invoices', { params }).then((r) => r.data);

/**
 * Create a new invoice.
 * @param {object} invoiceData
 */
export const createInvoice = (invoiceData) =>
  financeClient.post('/invoices', invoiceData).then((r) => r.data);

/**
 * Update invoice status (e.g., PAID, CANCELLED, OVERDUE).
 * @param {string|number} invoiceId
 * @param {string} status
 */
export const updateInvoiceStatus = (invoiceId, status) =>
  financeClient.patch(`/invoices/${invoiceId}/status`, { status }).then((r) => r.data);

/**
 * Get invoices for a specific customer.
 * @param {string|number} customerId
 * @param {object} params
 */
export const getInvoicesByCustomer = (customerId, params = {}) =>
  financeClient.get(`/invoices/customer/${customerId}`, { params }).then((r) => r.data);

// ── Payments ──────────────────────────────────────────────────

/**
 * Get payment records.
 * @param {object} params
 */
export const getPayments = (params = {}) =>
  financeClient.get('/payments', { params }).then((r) => r.data);

/**
 * Process a payment for an invoice.
 * @param {object} paymentData - { invoiceId, amount, method, reference }
 */
export const processPayment = (paymentData) =>
  financeClient.post('/payments', paymentData).then((r) => r.data);

// ── Reports ───────────────────────────────────────────────────

/**
 * Get financial reports.
 * @param {object} params - { type, startDate, endDate, period }
 */
export const getReports = (params = {}) =>
  financeClient.get('/reports', { params }).then((r) => r.data);

/**
 * Create / generate a new report.
 * @param {object} reportData
 */
export const createReport = (reportData) =>
  financeClient.post('/reports', reportData).then((r) => r.data);

// ── Tasks ─────────────────────────────────────────────────────

/**
 * Get finance tasks / work items.
 * @param {object} params
 */
export const getTasks = (params = {}) =>
  financeClient.get('/tasks', { params }).then((r) => r.data);

// ── Notifications ─────────────────────────────────────────────

/**
 * Get finance notifications for the current user.
 * @param {object} params
 */
export const getNotifications = (params = {}) =>
  financeClient.get('/notifications', { params }).then((r) => r.data);

/**
 * Mark a notification as read.
 * @param {string|number} notifId
 */
export const markNotificationRead = (notifId) =>
  financeClient.patch(`/notifications/${notifId}/read`).then((r) => r.data);

const financeApi = {
  getInvoices,
  createInvoice,
  updateInvoiceStatus,
  getInvoicesByCustomer,
  getPayments,
  processPayment,
  getReports,
  createReport,
  getTasks,
  getNotifications,
  markNotificationRead,
};

export default financeApi;
