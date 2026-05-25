import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Notification {
  notificationId: number;
  userId: number;
  channel: string;
  notificationType: string;
  subject?: string;
  message: string;
  status: string;
  createdAt: string;
}

const TYPE_COLOUR: Record<string, string> = {
  DEAL_FINALIZED:       'bg-green-100 text-green-700',
  INVOICE_OVERDUE:      'bg-red-100 text-red-700',
  APPOINTMENT_REMINDER: 'bg-blue-100 text-blue-700',
  JOB_ASSIGNED:         'bg-orange-100 text-orange-700',
  PAYMENT_RECEIVED:     'bg-emerald-100 text-emerald-700',
  SERVICE_COMPLETE:     'bg-purple-100 text-purple-700',
};

export default function NotificationBell() {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => n.status !== 'READ').length;

  const load = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`http://localhost:8089/api/notifications/user/${user.id}`);
      setNotifications(res.data || []);
    } catch { /* silent — user may have no notifications yet */ }
  };

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [isAuthenticated, user?.id]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id: number) => {
    try {
      await axios.patch(`http://localhost:8089/api/notifications/${id}/read`);
      setNotifications(p => p.map(n => n.notificationId === id ? { ...n, status: 'READ' } : n));
    } catch { /* silent */ }
  };

  const markAll = () =>
    notifications.filter(n => n.status !== 'READ').forEach(n => markRead(n.notificationId));

  if (!isAuthenticated) return null;

  return (
    <div className="relative flex items-center h-full px-3" ref={ref}>
      <button
        onClick={() => { setOpen(o => !o); if (!open) load(); }}
        className="relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={16} className="text-gray-300" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col max-h-[480px]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
            <span className="font-bold text-gray-900 text-sm">
              Notifications
              {unread > 0 && <span className="text-red-500 font-normal"> ({unread} new)</span>}
            </span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAll} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  <CheckCheck size={12} /> All read
                </button>
              )}
              <button onClick={() => setOpen(false)}>
                <X size={14} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-gray-400 text-sm">
                <Bell size={24} className="mx-auto mb-2 opacity-30" />
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 20).map(n => (
                <div
                  key={n.notificationId}
                  className={`px-4 py-3 border-b border-gray-50 last:border-0 transition-colors ${
                    n.status !== 'READ' ? 'bg-blue-50/60' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {n.subject && (
                        <p className="text-xs font-semibold text-gray-800 truncate">{n.subject}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.message}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-gray-400">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          TYPE_COLOUR[n.notificationType] ?? 'bg-gray-100 text-gray-600'
                        }`}>
                          {n.notificationType.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                    {n.status !== 'READ' && (
                      <button
                        onClick={() => markRead(n.notificationId)}
                        className="shrink-0 text-blue-400 hover:text-blue-600 mt-0.5 p-0.5 rounded transition-colors"
                        title="Mark as read"
                      >
                        <Check size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
