import axios from 'axios';
import { Loader2, RefreshCw, ShieldCheck, Bell } from 'lucide-react';
import { StatusBadge, TableCard, TableHead, PageTitle } from './DashboardShared';

// ---------------------------------------------------------------------------
// WarrantyClaimsTab
// ---------------------------------------------------------------------------

export interface WarrantyClaimsTabProps {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  warrantyClaims: any[];
  setWarrantyClaims: React.Dispatch<React.SetStateAction<any[]>>;
  claimFlash: { ok: boolean; text: string } | null;
  approveModal: { claimId: number } | null;
  setApproveModal: React.Dispatch<React.SetStateAction<{ claimId: number } | null>>;
  approvedAmount: string;
  setApprovedAmount: React.Dispatch<React.SetStateAction<string>>;
  rejectModal: { claimId: number } | null;
  setRejectModal: React.Dispatch<React.SetStateAction<{ claimId: number } | null>>;
  rejectReason: string;
  setRejectReason: React.Dispatch<React.SetStateAction<string>>;
  claimActionLoading: boolean;
  handleApproveClaim: () => void;
  handleRejectClaim: () => void;
}

export function WarrantyClaimsTab({
  loading,
  setLoading,
  warrantyClaims,
  setWarrantyClaims,
  claimFlash,
  approveModal,
  setApproveModal,
  approvedAmount,
  setApprovedAmount,
  rejectModal,
  setRejectModal,
  rejectReason,
  setRejectReason,
  claimActionLoading,
  handleApproveClaim,
  handleRejectClaim,
}: WarrantyClaimsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <PageTitle>Warranty Claims</PageTitle>
          <p className="text-sm text-slate-500 mt-1">Review and approve or reject customer warranty claim submissions.</p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            axios.get('http://localhost:8089/api/v1/warranties/claims')
              .then(res => setWarrantyClaims(res.data?.data || res.data || []))
              .catch(() => {})
              .finally(() => setLoading(false));
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {claimFlash && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${claimFlash.ok ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {claimFlash.text}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
      ) : warrantyClaims.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No warranty claims found.</p>
        </div>
      ) : (
        <TableCard>
          <TableHead cols={['Claim ID', 'Warranty ID', 'Description', 'Claimed Amount', 'Status', 'Actions']} right={[5]} />
          <tbody className="bg-white divide-y divide-slate-200">
            {warrantyClaims.map((claim: any) => (
              <tr key={claim.claimId} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#{claim.claimId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">W-{claim.warrantyId}</td>
                <td className="px-6 py-4 text-sm text-slate-700 max-w-xs truncate">{claim.claimDescription || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {claim.claimAmount ? `$${Number(claim.claimAmount).toLocaleString()}` : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={claim.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {(claim.status === 'SUBMITTED' || claim.status === 'UNDER_REVIEW') && (
                    <>
                      <button
                        onClick={() => { setApproveModal({ claimId: claim.claimId }); setApprovedAmount(String(claim.claimAmount || '')); }}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >Approve</button>
                      <button
                        onClick={() => { setRejectModal({ claimId: claim.claimId }); setRejectReason(''); }}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >Reject</button>
                    </>
                  )}
                  {claim.status === 'APPROVED' && claim.approvedAmount && (
                    <span className="text-green-700 text-xs">Approved ${Number(claim.approvedAmount).toLocaleString()}</span>
                  )}
                  {claim.status === 'REJECTED' && (
                    <span className="text-red-600 text-xs" title={claim.rejectionReason || ''}>Rejected</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      )}

    </div>
  );
}

// ---------------------------------------------------------------------------
// NotificationsTab
// ---------------------------------------------------------------------------

export interface NotificationsTabProps {
  notifsList: any[];
  setNotifsList: React.Dispatch<React.SetStateAction<any[]>>;
  notifsLoading: boolean;
  setNotifsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  user: { id: number; name?: string; [key: string]: any } | null;
}

export function NotificationsTab({
  notifsList,
  setNotifsList,
  notifsLoading,
  setNotifsLoading,
  user,
}: NotificationsTabProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <PageTitle>Notifications</PageTitle>
          <p className="text-sm text-slate-500 mt-1">
            {notifsList.filter(n => n.status !== 'READ').length > 0
              ? `${notifsList.filter(n => n.status !== 'READ').length} unread`
              : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {notifsList.some(n => n.status !== 'READ') && (
            <button
              onClick={() => {
                notifsList.filter(n => n.status !== 'READ').forEach(n =>
                  axios.patch(`http://localhost:8089/api/notifications/${n.notificationId}/read`).catch(() => {})
                );
                setNotifsList(p => p.map(n => ({ ...n, status: 'READ' })));
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              ✓✓ Mark all read
            </button>
          )}
          <button
            onClick={() => {
              if (!user?.id) return;
              setNotifsLoading(true);
              axios.get(`http://localhost:8089/api/notifications/user/${user.id}`)
                .then(res => setNotifsList((res.data || []).slice(0, 5)))
                .catch(() => setNotifsList([]))
                .finally(() => setNotifsLoading(false));
            }}
            className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={notifsLoading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {notifsLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : notifsList.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <Bell className="w-14 h-14 mx-auto mb-3 text-slate-200" />
          <p className="font-medium text-slate-500">No notifications yet</p>
          <p className="text-sm text-slate-400 mt-1">Notifications appear here when you assign job cards, appointments are updated, or customers send messages.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifsList.map((n: any) => {
            const TYPE_COLOUR: Record<string, string> = {
              JOB_ASSIGNED:         'bg-orange-100 text-orange-700 border-orange-200',
              APPOINTMENT_REMINDER: 'bg-blue-100 text-blue-700 border-blue-200',
              SERVICE_COMPLETE:     'bg-purple-100 text-purple-700 border-purple-200',
              ADVISOR_MESSAGE:      'bg-teal-100 text-teal-700 border-teal-200',
              INVOICE_ISSUED:       'bg-green-100 text-green-700 border-green-200',
              DEAL_FINALIZED:       'bg-emerald-100 text-emerald-700 border-emerald-200',
              INVOICE_OVERDUE:      'bg-red-100 text-red-700 border-red-200',
            };
            const CHANNEL_ICON: Record<string, string> = { EMAIL: '✉️', SMS: '📱', PUSH: '🔔', IN_APP: '💬' };
            return (
              <div
                key={n.notificationId}
                className={`rounded-xl p-4 border transition-colors ${
                  n.status !== 'READ' ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base">{CHANNEL_ICON[n.channel] ?? '🔔'}</span>
                      {n.subject && (
                        <p className="text-sm font-semibold text-slate-900 truncate">{n.subject}</p>
                      )}
                      {n.status !== 'READ' && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs text-slate-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                        TYPE_COLOUR[n.notificationType] ?? 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {n.notificationType.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  {n.status !== 'READ' && (
                    <button
                      onClick={() => {
                        axios.patch(`http://localhost:8089/api/notifications/${n.notificationId}/read`).catch(() => {});
                        setNotifsList(p => p.map(x => x.notificationId === n.notificationId ? { ...x, status: 'READ' } : x));
                      }}
                      className="shrink-0 text-xs text-blue-500 hover:text-blue-700 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                    >
                      ✓ Mark read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <p className="text-xs text-center text-slate-400">
            Showing {notifsList.length} most recent notification{notifsList.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
