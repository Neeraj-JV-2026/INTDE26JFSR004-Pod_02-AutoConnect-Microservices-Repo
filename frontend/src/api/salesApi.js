import { createApiClient } from './axiosConfig';

const salesClient = createApiClient('/api/sales');

// ── Deals ─────────────────────────────────────────────────────

/**
 * Get all deals (with optional filters).
 * @param {object} params - { page, size, status, agentId }
 */
export const getDeals = (params = {}) =>
  salesClient.get('/deals', { params }).then((r) => r.data);

/**
 * Create a new deal.
 * @param {object} dealData
 */
export const createDeal = (dealData) =>
  salesClient.post('/deals', dealData).then((r) => r.data);

/**
 * Approve a deal (SALES_MANAGER only).
 * @param {string|number} dealId
 * @param {object} approvalData
 */
export const approveDeal = (dealId, approvalData = {}) =>
  salesClient.post(`/deals/${dealId}/approve`, approvalData).then((r) => r.data);

/**
 * Reject a deal.
 * @param {string|number} dealId
 * @param {object} rejectionData
 */
export const rejectDeal = (dealId, rejectionData = {}) =>
  salesClient.post(`/deals/${dealId}/reject`, rejectionData).then((r) => r.data);

// ── Quotes ────────────────────────────────────────────────────

/**
 * Get all quotes.
 * @param {object} params
 */
export const getQuotes = (params = {}) =>
  salesClient.get('/quotes', { params }).then((r) => r.data);

/**
 * Create a new quote.
 * @param {object} quoteData
 */
export const createQuote = (quoteData) =>
  salesClient.post('/quotes', quoteData).then((r) => r.data);

// ── Promotions ────────────────────────────────────────────────

/**
 * Get active sales promotions.
 * @param {object} params
 */
export const getPromotions = (params = {}) =>
  salesClient.get('/promotions', { params }).then((r) => r.data);

/**
 * Create a new promotion.
 * @param {object} promoData
 */
export const createPromotion = (promoData) =>
  salesClient.post('/promotions', promoData).then((r) => r.data);

// ── Commissions ───────────────────────────────────────────────

/**
 * Get commission records.
 * @param {object} params - { agentId, period }
 */
export const getCommissions = (params = {}) =>
  salesClient.get('/commissions', { params }).then((r) => r.data);

// ── Test Drives ───────────────────────────────────────────────

/**
 * Get test drive bookings.
 * @param {object} params
 */
export const getTestDrives = (params = {}) =>
  salesClient.get('/test-drives', { params }).then((r) => r.data);

/**
 * Schedule a test drive.
 * @param {object} testDriveData
 */
export const scheduleTestDrive = (testDriveData) =>
  salesClient.post('/test-drives', testDriveData).then((r) => r.data);

const salesApi = {
  getDeals,
  createDeal,
  approveDeal,
  rejectDeal,
  getQuotes,
  createQuote,
  getPromotions,
  createPromotion,
  getCommissions,
  getTestDrives,
  scheduleTestDrive,
};

export default salesApi;
