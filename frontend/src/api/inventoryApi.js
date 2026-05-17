import { createApiClient } from './axiosConfig';

const inventoryClient = createApiClient('/api/inventory');
const inventoryV1Client = createApiClient('/api/v1/inventory');

// ── Vehicles ──────────────────────────────────────────────────

/**
 * Get paginated list of vehicles.
 * @param {object} params - { page, size, sort, status, make, model }
 */
export const getVehicles = (params = {}) =>
  inventoryClient.get('/vehicles', { params }).then((r) => r.data);

/**
 * Get a single vehicle by ID.
 * @param {string|number} id
 */
export const getVehicle = (id) =>
  inventoryClient.get(`/vehicles/${id}`).then((r) => r.data);

/**
 * Create a new vehicle listing.
 * @param {object} vehicleData
 */
export const createVehicle = (vehicleData) =>
  inventoryClient.post('/vehicles', vehicleData).then((r) => r.data);

/**
 * Update an existing vehicle.
 * @param {string|number} id
 * @param {object} updates
 */
export const updateVehicle = (id, updates) =>
  inventoryClient.put(`/vehicles/${id}`, updates).then((r) => r.data);

/**
 * Delete a vehicle (soft delete).
 * @param {string|number} id
 */
export const deleteVehicle = (id) =>
  inventoryClient.delete(`/vehicles/${id}`).then((r) => r.data);

// ── Parts ─────────────────────────────────────────────────────

/**
 * Get paginated list of parts.
 * @param {object} params
 */
export const getParts = (params = {}) =>
  inventoryClient.get('/parts', { params }).then((r) => r.data);

/**
 * Get a single part by ID.
 * @param {string|number} id
 */
export const getPart = (id) =>
  inventoryClient.get(`/parts/${id}`).then((r) => r.data);

// ── Promotions & Pricing ──────────────────────────────────────

/**
 * Get active inventory promotions.
 * @param {object} params
 */
export const getInventoryPromotions = (params = {}) =>
  inventoryV1Client.get('/promotions', { params }).then((r) => r.data);

/**
 * Get pricing rules.
 * @param {object} params
 */
export const getPricingRules = (params = {}) =>
  inventoryV1Client.get('/pricing-rules', { params }).then((r) => r.data);

// ── Recalls ───────────────────────────────────────────────────

/**
 * Get vehicle recalls.
 * @param {object} params
 */
export const getRecalls = (params = {}) =>
  inventoryV1Client.get('/recalls', { params }).then((r) => r.data);

const inventoryApi = {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getParts,
  getPart,
  getInventoryPromotions,
  getPricingRules,
  getRecalls,
};

export default inventoryApi;
