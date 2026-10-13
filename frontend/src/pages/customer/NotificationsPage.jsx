import React, { useState, useEffect } from 'react';
import { notificationsApi } from '../../services/api';
import { Bell, CheckCircle2, Clock, Check, Info, AlertTriangle } from 'lucide-react';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.getMy();
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Activity Center</span>
          <h1 className="text-2xl font-black text-white mt-0.5">My Notifications</h1>
          <p className="text-xs text-slate-400">Booking confirmations, reminders, and payment receipts.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400">Loading notifications...</div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition flex items-start justify-between gap-4 ${
                n.read
                  ? 'bg-slate-900/60 border-slate-800'
                  : 'bg-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    n.notificationType === 'SUCCESS'
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                      : n.notificationType === 'WARNING'
                      ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                      : 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {n.notificationType === 'SUCCESS' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : n.notificationType === 'WARNING' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{n.title}</h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 pt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  title="Mark as read"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition shrink-0"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <Bell className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No Notifications</h3>
          <p className="text-xs text-slate-500">You're all caught up!</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
