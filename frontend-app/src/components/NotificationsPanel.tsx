import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Loader2, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface Notification {
  notificationId: number;
  channel: string;
  notificationType: string;
  subject?: string;
  message: string;
  status: string;
  createdAt: string;
}

const TYPE_COLOUR: Record<string, string> = {
  DEAL_FINALIZED:       'bg-green-100 text-green-700 border-green-200',
  INVOICE_OVERDUE:      'bg-red-100 text-red-700 border-red-200',
  APPOINTMENT_REMINDER: 'bg-blue-100 text-blue-700 border-blue-200',
  JOB_ASSIGNED:         'bg-orange-100 text-orange-700 border-orange-200',
  PAYMENT_RECEIVED:     'bg-emerald-100 text-emerald-700 border-emerald-200',
  SERVICE_COMPLETE:     'bg-purple-100 text-purple-700 border-purple-200',
};

const CHANNEL_ICON: Record<string, string> = {
  EMAIL: '✉️', SMS: '📱', PUSH: '🔔', IN_APP: '💬',
};

interface Props {
  userId?: number;
  theme?: 'light' | 'dark';
}

export default function NotificationsPanel({ userId, theme = 'light' }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const isDark = theme === 'dark';

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8089/api/notifications/user/${userId}`);
      setNotifications(res.data || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [userId]);

  const markRead = async (id: number) => {
    try {
      await axios.patch(`http://localhost:8089/api/notifications/${id}/read`);
      setNotifications(p => p.map(n => n.notificationId === id ? { ...n, status: 'READ' } : n));
    } catch { /* silent */ }
  };

  const markAll = () =>
    notifications.filter(n => n.status !== 'READ').forEach(n => markRead(n.notificationId));

  const unreadCount = notifications.filter(n => n.status !== 'READ').length;
  const shown = filter === 'unread' ? notifications.filter(n => n.status !== 'READ') : notifications;

  // Theme-aware class helpers
  const cls = {
    heading: isDark ? 'text-white'   : 'text-gray-900',
    sub:     isDark ? 'text-gray-400' : 'text-gray-500',
    pill: (active: boolean) =>
      active
        ? 'bg-blue-600 text-white'
        : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    card:   isDark ? 'bg-gray-800 border-gray-700'   : 'bg-white border-gray-100',
    unread: isDark ? 'bg-blue-900/30 border-blue-500/30' : 'bg-blue-50 border-blue-100',
    text:   isDark ? 'text-gray-200' : 'text-gray-700',
    muted:  isDark ? 'text-gray-400' : 'text-gray-400',
    readBadge: isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${cls.heading}`}>Notifications</h1>
          <p className={`text-sm ${cls.sub} mt-1`}>
            {unreadCount > 0
              ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAll}
              className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-700 font-medium"
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          <button
            onClick={load}
            disabled={loading}
            className={`flex items-center gap-1.5 text-sm ${cls.muted} hover:opacity-80`}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {(['all', 'unread'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${cls.pill(filter === f)}`}
          >
            {f === 'all' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : shown.length === 0 ? (
        <div className="text-center py-20">
          <Bell className={`w-14 h-14 mx-auto mb-3 opacity-20 ${cls.muted}`} />
          <p className={`font-medium ${cls.sub}`}>
            {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
          </p>
          <p className={`text-sm ${cls.muted} opacity-70 mt-1`}>
            {filter === 'unread'
              ? 'No unread messages.'
              : 'Notifications will appear here as activity happens.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map(n => (
            <div
              key={n.notificationId}
              className={`rounded-xl p-4 border transition-colors ${
                n.status !== 'READ' ? cls.unread : cls.card
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm">{CHANNEL_ICON[n.channel] ?? '🔔'}</span>
                    {n.subject && (
                      <p className={`text-sm font-semibold ${cls.heading} truncate`}>{n.subject}</p>
                    )}
                    {n.status !== 'READ' && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className={`text-sm ${cls.text} leading-relaxed`}>{n.message}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-xs ${cls.muted}`}>
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                      TYPE_COLOUR[n.notificationType] ?? 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {n.notificationType.replace(/_/g, ' ')}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      n.status === 'READ' ? cls.readBadge : 'bg-blue-100 text-blue-600'
                    }`}>
                      {n.status}
                    </span>
                  </div>
                </div>
                {n.status !== 'READ' && (
                  <button
                    onClick={() => markRead(n.notificationId)}
                    className="shrink-0 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-medium px-2 py-1 rounded-lg hover:bg-blue-50/50 transition-colors whitespace-nowrap"
                  >
                    <Check size={12} /> Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
