import { createApiClient } from './axiosConfig';

const serviceClient = createApiClient('/api/v1');

// ── Appointments ──────────────────────────────────────────────

/**
 * Get all service appointments.
 * @param {object} params - { page, size, date, advisorId, status }
 */
export const getAppointments = (params = {}) =>
  serviceClient.get('/appointments', { params }).then((r) => r.data);

/**
 * Create a new appointment.
 * @param {object} appointmentData
 */
export const createAppointment = (appointmentData) =>
  serviceClient.post('/appointments', appointmentData).then((r) => r.data);

/**
 * Schedule / reschedule an appointment.
 * @param {string|number} appointmentId
 * @param {object} scheduleData - { scheduledDate, advisorId }
 */
export const scheduleAppointment = (appointmentId, scheduleData) =>
  serviceClient.put(`/appointments/${appointmentId}/schedule`, scheduleData).then((r) => r.data);

/**
 * Cancel an appointment.
 * @param {string|number} appointmentId
 */
export const cancelAppointment = (appointmentId) =>
  serviceClient.patch(`/appointments/${appointmentId}/cancel`).then((r) => r.data);

// ── Work Orders ───────────────────────────────────────────────

/**
 * Get all work orders.
 * @param {object} params
 */
export const getWorkOrders = (params = {}) =>
  serviceClient.get('/workorders', { params }).then((r) => r.data);

/**
 * Create a new work order.
 * @param {object} workOrderData
 */
export const createWorkOrder = (workOrderData) =>
  serviceClient.post('/workorders', workOrderData).then((r) => r.data);

/**
 * Assign a technician to a work order.
 * @param {string|number} workOrderId
 * @param {string|number} technicianId
 */
export const assignTechnician = (workOrderId, technicianId) =>
  serviceClient.patch(`/workorders/${workOrderId}/assign`, { technicianId }).then((r) => r.data);

/**
 * Update work order status.
 * @param {string|number} workOrderId
 * @param {string} status
 */
export const updateWorkOrderStatus = (workOrderId, status) =>
  serviceClient.patch(`/workorders/${workOrderId}/status`, { status }).then((r) => r.data);

// ── Job Cards ─────────────────────────────────────────────────

/**
 * Get all job cards.
 * @param {object} params
 */
export const getJobCards = (params = {}) =>
  serviceClient.get('/job-cards', { params }).then((r) => r.data);

/**
 * Create a new job card.
 * @param {object} jobCardData
 */
export const createJobCard = (jobCardData) =>
  serviceClient.post('/job-cards', jobCardData).then((r) => r.data);

/**
 * Mark a job card as started.
 * @param {string|number} jobCardId
 */
export const startJobCard = (jobCardId) =>
  serviceClient.patch(`/job-cards/${jobCardId}/start`).then((r) => r.data);

/**
 * Mark a job card as completed.
 * @param {string|number} jobCardId
 * @param {object} completionData
 */
export const completeJobCard = (jobCardId, completionData = {}) =>
  serviceClient.patch(`/job-cards/${jobCardId}/complete`, completionData).then((r) => r.data);

// ── Parts ─────────────────────────────────────────────────────

/**
 * Get parts inventory for service.
 * @param {object} params
 */
export const getParts = (params = {}) =>
  serviceClient.get('/parts', { params }).then((r) => r.data);

/**
 * Consume (use) a part on a job card.
 * @param {string|number} partId
 * @param {object} consumeData - { jobCardId, quantity }
 */
export const consumePart = (partId, consumeData) =>
  serviceClient.post(`/parts/${partId}/consume`, consumeData).then((r) => r.data);

/**
 * Get part consumption history.
 * @param {object} params
 */
export const getConsumptions = (params = {}) =>
  serviceClient.get('/parts/consumptions', { params }).then((r) => r.data);

const serviceApi = {
  getAppointments,
  createAppointment,
  scheduleAppointment,
  cancelAppointment,
  getWorkOrders,
  createWorkOrder,
  assignTechnician,
  updateWorkOrderStatus,
  getJobCards,
  createJobCard,
  startJobCard,
  completeJobCard,
  getParts,
  consumePart,
  getConsumptions,
};

export default serviceApi;
