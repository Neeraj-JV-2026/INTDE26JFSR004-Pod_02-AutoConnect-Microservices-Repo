import axios from 'axios';

/** Fire-and-forget IN_APP notification — never blocks the caller */
export const sendNotification = async (
  userId: number | null | undefined,
  type: string,
  subject: string,
  message: string,
) => {
  if (!userId) return;
  axios.post('http://localhost:8089/api/notifications', {
    userId, channel: 'IN_APP', notificationType: type, subject, message,
  }).catch(() => {/* non-critical */});
};

/** Resolve IAM userId from CRM customerId: check local state first, then API */
export const getIamUserId = async (
  customerId: number,
  customers: any[],
): Promise<number | null> => {
  const local = customers.find(c => c.customerId === customerId);
  if (local?.userId) return local.userId;
  try {
    const res = await axios.get(`http://localhost:8089/api/customers/${customerId}`);
    return res.data?.userId ?? null;
  } catch { return null; }
};

export interface LeadHandlerDeps {
  leads: any[];
  setLeads: (fn: any) => void;
  newLeadData: any;
  setNewLeadData: (v: any) => void;
  setShowNewLeadForm: (v: boolean) => void;
  setLeadSubmitLoading: (v: boolean) => void;
  showFlash: (type: 'success' | 'error', msg: string) => void;
  userId: number | undefined;
  customers: any[];
  testDrives: any[];
  setTestDrives: (fn: any) => void;
}

export const makeLeadHandlers = (deps: LeadHandlerDeps) => {
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    deps.setLeadSubmitLoading(true);
    try {
      const res = await axios.post('http://localhost:8089/api/leads', deps.newLeadData);
      deps.setLeads((prev: any[]) => [...prev, res.data]);
      deps.setShowNewLeadForm(false);
      deps.setNewLeadData({ customerId: deps.userId || 1, source: 'WALK_IN', interestedModel: '', status: 'NEW', notes: '' });
      deps.showFlash('success', 'Lead created successfully.');
    } catch (err: any) {
      deps.showFlash('error', err?.response?.data?.message || 'Failed to create lead.');
    } finally {
      deps.setLeadSubmitLoading(false);
    }
  };

  const advanceLeadStatus = async (lead: any, nextStatus: string) => {
    try {
      await axios.post(`http://localhost:8089/api/leads/${lead.leadId}/update-status?status=${nextStatus}`);
      deps.setLeads((prev: any[]) => prev.map(l => l.leadId === lead.leadId ? { ...l, status: nextStatus } : l));
      deps.showFlash('success', `Lead #${lead.leadId} moved to ${nextStatus}.`);
    } catch (err: any) {
      deps.showFlash('error', err?.response?.data?.message || `Failed to update lead status.`);
    }
  };

  const handleAssignToMe = async (lead: any) => {
    if (!deps.userId) return;
    try {
      const res = await axios.post(`http://localhost:8089/api/leads/${lead.leadId}/assign?userId=${deps.userId}`);
      deps.setLeads((prev: any[]) => prev.map(l => l.leadId === lead.leadId ? { ...l, assignedTo: res.data.assignedTo } : l));
      deps.showFlash('success', `Lead #${lead.leadId} assigned to you. You can now advance its status.`);
    } catch (err: any) {
      deps.showFlash('error', err?.response?.data?.message || 'Failed to assign lead.');
    }
  };

  const confirmTestDrive = async (td: any) => {
    try {
      await axios.patch(`http://localhost:8089/api/sales/test-drives/${td.id}/status?status=SCHEDULED`);
      deps.setTestDrives((prev: any[]) => prev.map(t => t.id === td.id ? { ...t, status: 'SCHEDULED' } : t));
      deps.showFlash('success', `Test drive TD-${td.id} confirmed as Scheduled.`);
      const uid = await getIamUserId(td.customerId, deps.customers);
      sendNotification(uid, 'APPOINTMENT_REMINDER', 'Test Drive Confirmed ✅',
        `Great news! Your test drive request for Vehicle #${td.vehicleId} has been confirmed and scheduled. We look forward to seeing you!`);
    } catch (err: any) {
      deps.showFlash('error', err?.response?.data?.message || 'Failed to confirm test drive.');
    }
  };

  return { handleLeadSubmit, advanceLeadStatus, handleAssignToMe, confirmTestDrive };
};

export interface DealHandlerDeps {
  deals: any[];
  setDeals: (fn: any) => void;
  quotes: any[];
  setQuotes: (fn: any) => void;
  userId: number | undefined;
  customers: any[];
  allVehicles: any[];
  setActiveTab: (v: string) => void;
  setWarrantyModal: (v: { dealId: number; vehicleId: number; customerId: number } | null) => void;
  setSelectedWarrantyType: (v: 'BASIC' | 'EXTENDED' | 'PREMIUM') => void;
  newQuoteData: any;
  setNewQuoteData: (v: any) => void;
  setShowNewQuoteForm: (v: boolean) => void;
  setQuoteSubmitLoading: (v: boolean) => void;
  showFlash: (type: 'success' | 'error', msg: string) => void;
}

export const makeDealHandlers = (deps: DealHandlerDeps) => {
  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    deps.setQuoteSubmitLoading(true);
    try {
      // Step 1: Create DRAFT — taxes/fees must be Map<String,Object> (not plain numbers) per backend entity
      const createPayload = {
        customerId: deps.newQuoteData.customerId,
        vehicleId: deps.newQuoteData.vehicleId,
        taxes: { amount: deps.newQuoteData.taxes },
        fees: { amount: deps.newQuoteData.fees },
        status: 'DRAFT',
      };
      const created = await axios.post('http://localhost:8089/api/sales/quotes', createPayload);
      // Step 2: Generate — triggers inventory availability check + pricing calculation
      const generated = await axios.post(`http://localhost:8089/api/sales/quotes/${created.data.quoteId}/generate`);
      deps.setQuotes((prev: any[]) => [...prev, generated.data]);
      deps.setShowNewQuoteForm(false);
      deps.setNewQuoteData({ customerId: deps.userId || 1, vehicleId: 1, taxes: 0, fees: 0 });
      deps.showFlash('success', 'Quote generated successfully.');
      // Notify customer
      const uid = await getIamUserId(deps.newQuoteData.customerId, deps.customers);
      const vehicle = deps.allVehicles.find(v => v.vehicleId === deps.newQuoteData.vehicleId);
      const vehicleName = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : `Vehicle #${deps.newQuoteData.vehicleId}`;
      sendNotification(uid, 'GENERAL', 'Your Quote Is Ready',
        `A sales quote has been generated for the ${vehicleName}. Total: $${generated.data?.totalPrice?.toLocaleString() ?? '—'}. Please visit the dealership or contact us to review the details.`);
    } catch (err: any) {
      deps.showFlash('error', err?.response?.data?.message || 'Failed to generate quote.');
    } finally {
      deps.setQuoteSubmitLoading(false);
    }
  };

  const convertQuoteToDeal = async (quote: any) => {
    try {
      // Deal entity fields: quoteId, salesPersonId, status (PENDING/APPROVED/REJECTED/FINALIZED)
      // customerId, vehicleId, finalPrice are NOT Deal entity fields
      const payload = { quoteId: quote.quoteId, salesPersonId: deps.userId, status: 'PENDING' };
      const res = await axios.post('http://localhost:8089/api/sales/deals', payload);
      deps.setDeals((prev: any[]) => [...prev, res.data]);
      deps.showFlash('success', 'Quote converted to Deal! Pending Manager Approval.');
      deps.setActiveTab('approvals');
    } catch (err: any) {
      deps.showFlash('error', err?.response?.data?.message || 'Failed to convert quote to deal.');
    }
  };

  const approveDeal = async (dealId: number) => {
    try {
      await axios.post(`http://localhost:8089/api/sales/deals/${dealId}/approve`);
      deps.setDeals((prev: any[]) => prev.map(d => d.dealId === dealId ? { ...d, status: 'APPROVED' } : d));
      deps.showFlash('success', `Deal #${dealId} approved.`);
    } catch (err: any) {
      deps.showFlash('error', err?.response?.data?.message || 'Failed to approve deal.');
    }
  };

  const rejectDeal = async (dealId: number) => {
    try {
      await axios.post(`http://localhost:8089/api/sales/deals/${dealId}/reject`);
      deps.setDeals((prev: any[]) => prev.map(d => d.dealId === dealId ? { ...d, status: 'REJECTED' } : d));
      deps.showFlash('success', `Deal #${dealId} rejected.`);
    } catch (err: any) {
      deps.showFlash('error', err?.response?.data?.message || 'Failed to reject deal.');
    }
  };

  const finalizeDeal = async (dealId: number) => {
    try {
      await axios.post(`http://localhost:8089/api/sales/deals/${dealId}/finalize`);
      deps.setDeals((prev: any[]) => prev.map(d => d.dealId === dealId ? { ...d, status: 'FINALIZED' } : d));
      deps.showFlash('success', `Deal #${dealId} finalized! Invoice sent to Finance. Commission calculated.`);
      // Resolve quote to get vehicleId + customerId — used for notification & warranty offer
      const deal = deps.deals.find(d => d.dealId === dealId);
      if (deal?.quoteId) {
        axios.get(`http://localhost:8089/api/sales/quotes/${deal.quoteId}`)
          .then(async qRes => {
            const customerId = qRes.data?.customerId;
            const vehicleId  = qRes.data?.vehicleId;
            if (customerId) {
              const uid = await getIamUserId(customerId, deps.customers);
              sendNotification(uid, 'DEAL_FINALIZED', 'Deal Finalized — Congratulations! 🎉',
                `Your vehicle deal #${dealId} has been finalized! Our finance team will contact you shortly with payment and delivery details.`);
            }
            // Open warranty offer modal
            if (vehicleId && customerId) {
              deps.setSelectedWarrantyType('BASIC');
              deps.setWarrantyModal({ dealId, vehicleId, customerId });
            }
          }).catch(() => {/* non-critical */});
      }
    } catch (err: any) {
      deps.showFlash('error', err?.response?.data?.message || 'Failed to finalize deal.');
    }
  };

  return { handleQuoteSubmit, convertQuoteToDeal, approveDeal, rejectDeal, finalizeDeal };
};
