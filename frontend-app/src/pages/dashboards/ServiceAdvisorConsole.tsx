import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Settings, MessageSquare, ClipboardList, Bell, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarTab,
  WorkOrdersTab,
  PartsReservationTab,
  CustomerCommsTab,
} from './ServiceAdvisorConsoleTabs';
import { WarrantyClaimsTab, NotificationsTab } from './ServiceAdvisorClaimsTabs';
import { ApproveClaimModal, RejectClaimModal, VehicleIntakeModal, AssignJobCardModal } from './ServiceAdvisorModals';

export default function ServiceAdvisorConsole() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('calendar');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [workorders, setWorkorders] = useState<any[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newInteraction, setNewInteraction] = useState({ customerId: '', type: 'CALL', notes: '' });
  const [interactionLoading, setInteractionLoading] = useState(false);
  const [interactionMsg, setInteractionMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Comms tab — in-app messaging
  const [selectedChatCustomer, setSelectedChatCustomer] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatText, setChatText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [chatSearch, setChatSearch] = useState('');
  const [chatError, setChatError] = useState<string | null>(null);

  // Notifications tab — top 5
  const [notifsList, setNotifsList] = useState<any[]>([]);
  const [notifsLoading, setNotifsLoading] = useState(false);

  // Reference data for smart dropdowns
  const [customers, setCustomers] = useState<any[]>([]);
  const [allVehicles, setAllVehicles] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);

  // Warranty claims
  const [warrantyClaims, setWarrantyClaims] = useState<any[]>([]);
  const [approveModal, setApproveModal] = useState<{ claimId: number } | null>(null);
  const [approvedAmount, setApprovedAmount] = useState('');
  const [rejectModal, setRejectModal] = useState<{ claimId: number } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [claimActionLoading, setClaimActionLoading] = useState(false);
  const [claimFlash, setClaimFlash] = useState<{ ok: boolean; text: string } | null>(null);

  const showClaimFlash = (ok: boolean, text: string) => {
    setClaimFlash({ ok, text });
    setTimeout(() => setClaimFlash(null), 4000);
  };

  const handleApproveClaim = async () => {
    if (!approveModal) return;
    setClaimActionLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:8089/api/v1/warranties/claims/${approveModal.claimId}/approve?approvedAmount=${parseFloat(approvedAmount) || 0}`
      );
      const updated = res.data?.data || res.data;
      setWarrantyClaims(prev => prev.map(c => c.claimId === approveModal.claimId ? updated : c));
      showClaimFlash(true, `Claim #${approveModal.claimId} approved.`);
    } catch (err: any) {
      showClaimFlash(false, err?.response?.data?.message || 'Failed to approve claim.');
    } finally {
      setClaimActionLoading(false);
      setApproveModal(null);
      setApprovedAmount('');
    }
  };

  const handleRejectClaim = async () => {
    if (!rejectModal) return;
    setClaimActionLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:8089/api/v1/warranties/claims/${rejectModal.claimId}/reject?reason=${encodeURIComponent(rejectReason)}`
      );
      const updated = res.data?.data || res.data;
      setWarrantyClaims(prev => prev.map(c => c.claimId === rejectModal.claimId ? updated : c));
      showClaimFlash(true, `Claim #${rejectModal.claimId} rejected.`);
    } catch (err: any) {
      showClaimFlash(false, err?.response?.data?.message || 'Failed to reject claim.');
    } finally {
      setClaimActionLoading(false);
      setRejectModal(null);
      setRejectReason('');
    }
  };

  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    customerId: 1,
    vehicleId: 1,
    advisorId: user?.id || 3,
    scheduledAt: new Date().toISOString().slice(0, 16),
    durationMinutes: 60,
    serviceType: 'MAINTENANCE'
  });
  const [aptSubmitLoading, setAptSubmitLoading] = useState(false);

  const [intakeAppt, setIntakeAppt] = useState<any>(null);
  const [intakeChecks, setIntakeChecks] = useState<Record<string, boolean>>({});
  const [intakeNotes, setIntakeNotes] = useState('');
  const [intakeSubmitting, setIntakeSubmitting] = useState(false);

  const [assignJobAptId, setAssignJobAptId] = useState<number | null>(null);
  // WorkOrderRequest: appointmentId, advisorId, reportedIssues, estimatedHours
  // JobCardRequest (via assign-technician): technicianId
  const [newJobCard, setNewJobCard] = useState({
    technicianId: 0,
    reportedIssues: 'Initial inspection',
    estimatedHours: 1.0,
  });
  const [jobSubmitLoading, setJobSubmitLoading] = useState(false);
  const [jobError, setJobError] = useState<string | null>(null);

  useEffect(() => {
    axios.get('http://localhost:8089/api/customers')
      .then(res => {
        const data: any[] = res.data || [];
        setCustomers(data);
        if (data.length > 0) setNewAppointment(prev => ({ ...prev, customerId: data[0].customerId }));
      }).catch(() => {});
    axios.get('http://localhost:8089/api/inventory/vehicles')
      .then(res => {
        const data: any[] = res.data || [];
        setAllVehicles(data);
        const available = data.filter((v: any) => v.status !== 'SOLD');
        if (available.length > 0) setNewAppointment(prev => ({ ...prev, vehicleId: available[0].vehicleId }));
      }).catch(() => {});
    axios.get('http://localhost:8089/api/users/by-role?role=TECHNICIAN')
      .then(res => {
        const data: any[] = res.data || [];
        setTechnicians(data);
        if (data.length > 0) setNewJobCard(prev => ({ ...prev, technicianId: data[0].userId }));
      }).catch(() => {});
  }, []);

  // Load chat thread when a customer is selected in the Comms tab
  useEffect(() => {
    if (!selectedChatCustomer) return;
    setChatLoading(true);
    axios.get(`http://localhost:8089/api/notifications/customer/${selectedChatCustomer.customerId}`)
      .then(res => {
        const all: any[] = res.data || [];
        // Show only advisor-sent messages in this thread
        setChatMessages(all.filter((n: any) => n.notificationType === 'ADVISOR_MESSAGE'));
      })
      .catch(() => setChatMessages([]))
      .finally(() => setChatLoading(false));
  }, [selectedChatCustomer]);

  const handleLogInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    setInteractionLoading(true);
    setInteractionMsg(null);
    try {
      const res = await axios.post('http://localhost:8089/api/interactions', {
        customerId: Number(newInteraction.customerId),
        type: newInteraction.type,
        notes: newInteraction.notes,
        advisorId: user?.id,
      });
      setInteractions(prev => [res.data, ...prev]);
      setInteractionMsg({ text: 'Interaction logged successfully.', ok: true });
      setNewInteraction({ customerId: '', type: 'CALL', notes: '' });
    } catch {
      setInteractionMsg({ text: 'Failed to log interaction. Please try again.', ok: false });
    } finally {
      setInteractionLoading(false);
    }
  };

  /** Send an in-app message to the selected customer as an ADVISOR_MESSAGE notification */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatCustomer || !chatText.trim()) return;
    setChatSending(true);
    setChatError(null);
    try {
      const res = await axios.post('http://localhost:8089/api/notifications', {
        userId: selectedChatCustomer.userId,
        customerId: selectedChatCustomer.customerId,
        channel: 'IN_APP',
        notificationType: 'ADVISOR_MESSAGE',
        subject: 'Message from Service Advisor',
        message: chatText.trim(),
      });
      setChatMessages(prev => [...prev, res.data]);
      setChatText('');
    } catch {
      setChatError('Failed to send message. Please try again.');
    } finally {
      setChatSending(false);
    }
  };

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAptSubmitLoading(true);
    try {
      const res = await axios.post('http://localhost:8089/api/appointments', newAppointment);
      setAppointments([...appointments, res.data.data || res.data]);
      setShowAppointmentForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setAptSubmitLoading(false);
    }
  };

  const handleJobCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJobSubmitLoading(true);
    setJobError(null);
    try {
      // Step 0: Transition appointment BOOKED → IN_PROGRESS (required before WorkOrder creation)
      try {
        await axios.post(`http://localhost:8089/api/appointments/${assignJobAptId}/schedule`);
      } catch (schedErr: any) {
        // If already IN_PROGRESS that's fine — any other error is a real problem
        const msg: string = schedErr?.response?.data?.message || schedErr?.message || '';
        if (!msg.toLowerCase().includes('in_progress')) {
          throw new Error(msg || 'Failed to schedule appointment.');
        }
      }
      // Step 1: Create WorkOrder from appointment
      const woRes = await axios.post('http://localhost:8089/api/workorders', {
        appointmentId: assignJobAptId,
        advisorId: user?.id || 3,
        reportedIssues: newJobCard.reportedIssues,
        estimatedHours: newJobCard.estimatedHours,
      });
      const workOrder = woRes.data?.data || woRes.data;
      // Step 2: Assign technician to WorkOrder — field is woId (not workOrderId)
      await axios.post(`http://localhost:8089/api/workorders/${workOrder.woId}/assign-technician`, {
        technicianId: newJobCard.technicianId,
      });
      // Step 3: Create a JobCard from the WorkOrder — this is what appears in TechnicianConsole
      // (WorkOrder and JobCard are separate entities; technicians only see JobCards via /api/jobcards/my)
      await axios.post(`http://localhost:8089/api/jobcards`, {
        workOrderId: workOrder.woId,
        technicianId: newJobCard.technicianId,
      });
      setAppointments(prev => prev.map(a => a.appId === assignJobAptId ? { ...a, status: 'IN_PROGRESS' } : a));
      setWorkorders(prev => [...prev, workOrder]);
      setAssignJobAptId(null);
      setJobError(null);
      // Notify customer: their vehicle has been checked in and work has started
      const appt = appointments.find((a: any) => a.appId === assignJobAptId);
      if (appt?.customerId) {
        axios.get(`http://localhost:8089/api/customers/${appt.customerId}`)
          .then(res => {
            const iamUserId = res.data?.userId;
            if (iamUserId) {
              axios.post('http://localhost:8089/api/notifications', {
                userId: iamUserId,
                customerId: appt.customerId,   // CRM ID — lets customer find this via /customer/{id}
                channel: 'IN_APP',
                notificationType: 'APPOINTMENT_REMINDER',
                subject: 'Service Work Has Begun 🔧',
                message: `Your vehicle has been checked in and a work order has been created. A technician has been assigned and will begin work shortly. We'll notify you when the service is complete.`,
              }).catch(() => {});
            }
          }).catch(() => {});
      }
      // Notify the advisor themselves so their Notifications tab is populated
      if (user?.id) {
        const customerName = customers.find((c: any) => c.customerId === appt?.customerId)?.name
          || `Customer #${appt?.customerId}`;
        axios.post('http://localhost:8089/api/notifications', {
          userId: user.id,
          channel: 'IN_APP',
          notificationType: 'JOB_ASSIGNED',
          subject: `Job Card Created — Apt #${assignJobAptId}`,
          message: `Work order created for ${customerName}. Technician assigned. Est. ${newJobCard.estimatedHours} hrs.`,
        }).catch(() => {});
      }
    } catch (err: any) {
      setJobError(err?.response?.data?.message || err?.message || 'Failed to assign technician. Check the technician ID and try again.');
    } finally {
      setJobSubmitLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'calendar') {
      axios.get('http://localhost:8089/api/appointments').then(res => setAppointments(res.data.data || res.data)).finally(() => setLoading(false));
    } else if (activeTab === 'workorders') {
      // WorkOrderController exposes GET /api/workorders — returns ApiResponse<List<WorkOrder>>
      axios.get('http://localhost:8089/api/workorders')
        .then(res => setWorkorders(res.data?.data || res.data || []))
        .catch(() => setWorkorders([]))
        .finally(() => setLoading(false));
    } else if (activeTab === 'parts') {
      axios.get('http://localhost:8089/api/v1/inventory/parts').then(res => setParts(res.data)).catch(() => setParts([])).finally(() => setLoading(false));
    } else if (activeTab === 'comms') {
      // customers already loaded on mount; no additional fetch needed
      setLoading(false);
    } else if (activeTab === 'warranty-claims') {
      axios.get('http://localhost:8089/api/v1/warranties/claims')
        .then(res => setWarrantyClaims(res.data?.data || res.data || []))
        .catch(() => setWarrantyClaims([]))
        .finally(() => setLoading(false));
    } else if (activeTab === 'notifications') {
      if (user?.id) {
        setNotifsLoading(true);
        axios.get(`http://localhost:8089/api/notifications/user/${user.id}`)
          .then(res => setNotifsList((res.data || []).slice(0, 5)))
          .catch(() => setNotifsList([]))
          .finally(() => { setNotifsLoading(false); setLoading(false); });
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [activeTab]);

  const tabs = [
    { id: 'calendar', name: 'Appointment Calendar', icon: Calendar },
    { id: 'workorders', name: 'Work Orders', icon: ClipboardList },
    { id: 'parts', name: 'Parts Reservation', icon: Settings },
    { id: 'warranty-claims', name: 'Warranty Claims', icon: ShieldCheck },
    { id: 'comms', name: 'Customer Comms', icon: MessageSquare },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-300 flex-shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Settings className="w-6 h-6 mr-2 text-blue-400" />
            Service Console
          </h2>
          <p className="text-xs text-slate-400 mt-2">Advisor: {user?.name || 'User'}</p>
        </div>
        <nav className="mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-blue-400 border-l-4 border-blue-400 font-medium'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-3" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* CALENDAR TAB */}
          {activeTab === 'calendar' && (
            <CalendarTab
              loading={loading}
              appointments={appointments}
              customers={customers}
              allVehicles={allVehicles}
              showAppointmentForm={showAppointmentForm}
              setShowAppointmentForm={setShowAppointmentForm}
              newAppointment={newAppointment}
              setNewAppointment={setNewAppointment}
              aptSubmitLoading={aptSubmitLoading}
              handleAppointmentSubmit={handleAppointmentSubmit}
              setAssignJobAptId={setAssignJobAptId}
              setJobError={setJobError}
              setIntakeAppt={setIntakeAppt}
              setIntakeChecks={setIntakeChecks}
              setIntakeNotes={setIntakeNotes}
            />
          )}

          {/* WORKORDERS TAB */}
          {activeTab === 'workorders' && (
            <WorkOrdersTab
              loading={loading}
              workorders={workorders}
            />
          )}

          {/* PARTS TAB */}
          {activeTab === 'parts' && (
            <PartsReservationTab
              loading={loading}
              parts={parts}
            />
          )}

          {/* WARRANTY CLAIMS TAB */}
          {activeTab === 'warranty-claims' && (
            <WarrantyClaimsTab
              loading={loading}
              setLoading={setLoading}
              warrantyClaims={warrantyClaims}
              setWarrantyClaims={setWarrantyClaims}
              claimFlash={claimFlash}
              approveModal={approveModal}
              setApproveModal={setApproveModal}
              approvedAmount={approvedAmount}
              setApprovedAmount={setApprovedAmount}
              rejectModal={rejectModal}
              setRejectModal={setRejectModal}
              rejectReason={rejectReason}
              setRejectReason={setRejectReason}
              claimActionLoading={claimActionLoading}
              handleApproveClaim={handleApproveClaim}
              handleRejectClaim={handleRejectClaim}
            />
          )}

          {/* NOTIFICATIONS TAB — top 5 from DB */}
          {activeTab === 'notifications' && (
            <NotificationsTab
              notifsList={notifsList}
              setNotifsList={setNotifsList}
              notifsLoading={notifsLoading}
              setNotifsLoading={setNotifsLoading}
              user={user}
            />
          )}

          {/* COMMS TAB — In-App Messaging */}
          {activeTab === 'comms' && (
            <CustomerCommsTab
              customers={customers}
              chatSearch={chatSearch}
              setChatSearch={setChatSearch}
              selectedChatCustomer={selectedChatCustomer}
              setSelectedChatCustomer={setSelectedChatCustomer}
              setChatError={setChatError}
              chatLoading={chatLoading}
              chatMessages={chatMessages}
              chatText={chatText}
              setChatText={setChatText}
              handleSendMessage={handleSendMessage}
              chatSending={chatSending}
              chatError={chatError}
            />
          )}

          <ApproveClaimModal
            approvingClaim={approveModal}
            approveAmount={approvedAmount}
            setApproveAmount={setApprovedAmount}
            approveLoading={claimActionLoading}
            handleApproveClaim={handleApproveClaim}
            onClose={() => setApproveModal(null)}
          />

          <RejectClaimModal
            rejectingClaim={rejectModal}
            rejectReason={rejectReason}
            setRejectReason={setRejectReason}
            rejectLoading={claimActionLoading}
            handleRejectClaim={handleRejectClaim}
            onClose={() => setRejectModal(null)}
          />

          <VehicleIntakeModal
            intakeAppt={intakeAppt}
            intakeChecks={intakeChecks}
            setIntakeChecks={setIntakeChecks}
            intakeNotes={intakeNotes}
            setIntakeNotes={setIntakeNotes}
            intakeSubmitting={intakeSubmitting}
            setIntakeSubmitting={setIntakeSubmitting}
            onClose={() => setIntakeAppt(null)}
          />

          <AssignJobCardModal
            assignJobAptId={assignJobAptId}
            jobError={jobError}
            technicians={technicians}
            newJobCard={newJobCard}
            setNewJobCard={setNewJobCard}
            jobSubmitLoading={jobSubmitLoading}
            handleJobCardSubmit={handleJobCardSubmit}
            onClose={() => { setAssignJobAptId(null); setJobError(null); }}
          />
        </div>
      </div>
    </div>
  );
}
