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
  DEAL_APPROVED:        'bg-teal-100 text-teal-700 border-teal-200',
  DEAL_REJECTED:        'bg-rose-100 text-rose-700 border-rose-200',
  INVOICE_ISSUED:       'bg-sky-100 text-sky-700 border-sky-200',
  ADVISOR_MESSAGE:      'bg-indigo-100 text-indigo-700 border-indigo-200',
  GENERAL:              'bg-gray-100 text-gray-600 border-gray-200',
};

const CHANNEL_ICON: Record<string, string> = {
  EMAIL: '✉️', SMS: '📱', PUSH: '🔔', IN_APP: '💬',
};

interface Props {
  userId?: number;
  /**
   * CRM customer ID — when provided the panel uses
   * GET /api/notifications/customer/{customerId} instead of the user endpoint.
   * This catches ALL notifications sent to the customer regardless of which
   * ID (IAM userId vs CRM customerId) was used when the notification was created.
   */
  customerId?: number;
  theme?: 'light' | 'dark';
  /** Cap the displayed list to this many items (default: no cap / show all) */
  limit?: number;
}

export default function NotificationsPanel({ userId, customerId, theme = 'light', limit }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [showAll, setShowAll] = useState(false);

  const isDark = theme === 'dark';

  const load = async () => {
    const hasUser = userId != null && userId > 0;
    const hasCust = customerId != null && customerId > 0;
    if (!hasUser && !hasCust) return;

    setLoading(true);
    setApiError(false);
    let anyError = false;
    try {
      // Query BOTH endpoints in parallel so we catch notifications regardless of
      // which ID (IAM userId vs CRM customerId) was stamped on the record.
      const fetches: Promise<Notification[]>[] = [];
      if (hasUser)
        fetches.push(
          axios.get<Notification[]>(`http://localhost:8089/api/notifications/user/${userId}`)
            .then(r => r.data ?? [])
            .catch(() => { anyError = true; return []; })
        );
      if (hasCust)
        fetches.push(
          axios.get<Notification[]>(`http://localhost:8089/api/notifications/customer/${customerId}`)
            .then(r => r.data ?? [])
            .catch(() => { anyError = true; return []; })
        );

      const buckets = await Promise.all(fetches);

      // Merge + deduplicate by notificationId, newest-first
      const seen = new Set<number>();
      const merged = buckets
        .flat()
        .filter(n => {
          if (seen.has(n.notificationId)) return false;
          seen.add(n.notificationId);
          return true;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Only surface the error state when every request failed AND there's nothing to show
      if (anyError && merged.length === 0) setApiError(true);
      setNotifications(merged);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [userId, customerId]);

  const markRead = async (id: number) => {
    try {
      await axios.patch(`http://localhost:8089/api/notifications/${id}/read`);
      setNotifications(p => p.map(n => n.notificationId === id ? { ...n, status: 'READ' } : n));
    } catch { /* silent */ }
  };

  const markAll = () =>
    notifications.filter(n => n.status !== 'READ').forEach(n => markRead(n.notificationId));

  const unreadCount = notifications.filter(n => n.status !== 'READ').length;
  const filtered = filter === 'unread' ? notifications.filter(n => n.status !== 'READ') : notifications;
  // Apply limit unless the user has clicked "Show all"
  const shown = limit && !showAll ? filtered.slice(0, limit) : filtered;
  const hasMore = limit && !showAll && filtered.length > limit;

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
      ) : apiError ? (
        <div className="text-center py-20">
          <p className="font-medium text-red-500 text-lg">⚠️ Could not reach notification service</p>
          <p className={`text-sm ${cls.muted} mt-1`}>
            Make sure all services are running, then retry.
          </p>
          <button
            onClick={load}
            className="mt-4 text-sm text-blue-500 hover:text-blue-700 font-medium"
          >
            ↺ Retry
          </button>
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
          {filter === 'all' && (userId ?? 0) > 0 && (
            <button
              onClick={() => {
                axios.post('http://localhost:8089/api/notifications/internal', {
                  userId,
                  ...(customerId ? { customerId } : {}),
                  channel: 'IN_APP',
                  notificationType: 'GENERAL',
                  subject: '✅ Notification System Active',
                  message: 'Your notifications are working correctly. You will see updates here as activity happens.',
                })
                  .then(() => load())
                  .catch(() => setApiError(true));
              }}
              className={`mt-5 text-sm px-5 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Send test notification
            </button>
          )}
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
          {/* Show-more footer when a limit is in effect */}
          {hasMore ? (
            <button
              onClick={() => setShowAll(true)}
              className={`w-full text-center text-sm font-medium py-2 rounded-lg transition-colors ${
                isDark ? 'text-blue-400 hover:bg-gray-800' : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              Show all {filtered.length} notifications ↓
            </button>
          ) : limit && showAll ? (
            <p className={`text-xs text-center ${cls.muted}`}>
              Showing all {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
