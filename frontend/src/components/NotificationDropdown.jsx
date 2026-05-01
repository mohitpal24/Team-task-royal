import { useEffect, useState } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import useNotifications from '../hooks/useNotifications';
import { getSocket } from '../services/socket';

export default function NotificationDropdown() {
  const { notifications, unreadCount, loading, markAsRead, markAllRead, fetchNotifications } = useNotifications();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const refresh = () => fetchNotifications();
    socket.on('taskCreated', refresh);
    socket.on('taskUpdated', refresh);
    socket.on('projectCreated', refresh);
    socket.on('taskDeleted', refresh);

    return () => {
      socket.off('taskCreated', refresh);
      socket.off('taskUpdated', refresh);
      socket.off('projectCreated', refresh);
      socket.off('taskDeleted', refresh);
    };
  }, [fetchNotifications]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex items-center justify-center rounded-full border border-white/10 bg-royal-900/80 p-3 text-royal-champagne hover:bg-royal-gold/10 transition-all"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-96 rounded-3xl border border-white/10 bg-royal-950/95 shadow-2xl shadow-black/20 backdrop-blur-2xl z-50">
          <div className="p-4 flex items-center justify-between border-b border-white/10">
            <div>
              <p className="text-sm font-semibold text-white">Notifications</p>
              <p className="text-xs text-gray-400">Latest updates from TaskFlow Royal</p>
            </div>
            <button onClick={markAllRead} className="text-xs text-gray-300 hover:text-white">Mark all read</button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-sm text-gray-400">Loading notifications…</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">No notifications yet.</div>
            ) : (
              notifications.map((notification) => (
                <div key={notification._id} className={`group flex items-start gap-3 px-4 py-4 border-b border-white/5 transition-colors ${notification.isRead ? 'bg-royal-900/50' : 'bg-royal-800/80'}`}>
                  <div className="mt-1 rounded-full bg-royal-gold/10 p-2 text-royal-gold">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-100">{notification.message}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-gray-500">{notification.type.replace('_', ' ')}</p>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="text-xs uppercase tracking-[0.2em] text-royal-gold hover:text-white"
                    >
                      Mark
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
