import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import {
  Bell,
  CheckCircle2,
  Trash2,
  CheckCheck,
  CloudSun,
  Sprout,
  Bug,
  GraduationCap,
  ShoppingBag,
  Info
} from 'lucide-react';

export const NotificationsPage: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.warn('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchNotifs();
  }, [token]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotif = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'weather': return CloudSun;
      case 'harvest':
      case 'crop': return Sprout;
      case 'pest': return Bug;
      case 'consultation': return GraduationCap;
      case 'order': return ShoppingBag;
      default: return Info;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            {t('nav_notifications')} Center
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Agricultural alerts, weather warnings, harvest milestones, and expert consultation updates.
          </p>
        </div>

        {notifications.some(n => !n.read) && (
          <button
            onClick={markAllRead}
            className="px-3.5 py-2 bg-white text-emerald-900 border border-neutral-200 hover:bg-neutral-50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-neutral-200 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200 space-y-3">
          <Bell className="w-12 h-12 text-neutral-300 mx-auto" />
          <h3 className="font-bold text-neutral-800 text-base">No Notifications</h3>
          <p className="text-xs text-neutral-500">
            You're completely up to date with farm alerts and expert replies.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => {
            const Icon = getIcon(notif.type);

            return (
              <div
                key={notif._id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  notif.read
                    ? 'bg-white border-neutral-200/70 opacity-80'
                    : 'bg-emerald-50/40 border-emerald-200 shadow-xs'
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  notif.read ? 'bg-neutral-100 text-neutral-500' : 'bg-emerald-100 text-emerald-900'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs font-bold ${notif.read ? 'text-neutral-700' : 'text-neutral-900'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>

                  {notif.link && (
                    <button
                      onClick={() => onNavigate(notif.link.replace('/', ''))}
                      className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 mt-2 block"
                    >
                      View related module →
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif._id)}
                      className="p-1.5 text-emerald-800 hover:bg-emerald-100 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotif(notif._id)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
