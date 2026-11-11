import React from 'react';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle, 
  Mail,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { Notification } from '../types';

interface NotificationsViewProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDeleteNotification: (id: string) => void;
}

export default function NotificationsView({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDeleteNotification
}: NotificationsViewProps) {
  
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
      case 'danger':
        return <XCircle className="h-5 w-5 text-red-500 shrink-0" />;
      default:
        return <Info className="h-5 w-5 text-blue-500 shrink-0" />;
    }
  };

  const getUnreadCount = () => notifications.filter(n => !n.read).length;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
      
      {/* Notifications Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <Bell className="h-5.5 w-5.5 text-[#006A6A]" />
          <div>
            <h2 className="text-base font-display font-bold text-slate-800 leading-none">Notifications Dashboard</h2>
            <p className="text-[10px] text-slate-400 mt-1">{getUnreadCount()} unread alerts</p>
          </div>
        </div>

        {getUnreadCount() > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-[#006A6A] hover:underline font-bold"
            id="btn-mark-all-read"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3.5">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border flex gap-3 items-start justify-between transition-all ${
                notif.read 
                  ? 'border-slate-100 bg-white/50 text-slate-600 opacity-75' 
                  : 'border-indigo-100/60 bg-indigo-50/10 text-slate-800 font-medium shadow-sm shadow-indigo-100/10'
              }`}
            >
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-slate-50 rounded-xl shrink-0">
                  {getNotificationIcon(notif.type)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 leading-tight flex items-center gap-2">
                    <span>{notif.title}</span>
                    {!notif.read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 shrink-0"></span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.description}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-2">{notif.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 pl-4">
                {!notif.read && (
                  <button
                    onClick={() => onMarkRead(notif.id)}
                    className="p-1.5 text-slate-400 hover:text-[#006A6A] hover:bg-slate-50 rounded-lg transition-all"
                    title="Mark as read"
                    id={`btn-mark-read-${notif.id}`}
                  >
                    <CheckCircle className="h-4.5 w-4.5" />
                  </button>
                )}
                <button
                  onClick={() => onDeleteNotification(notif.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-lg transition-all"
                  title="Delete Alert"
                  id={`btn-delete-notif-${notif.id}`}
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-400">
            <Mail className="h-10 w-10 text-slate-200 mx-auto mb-2" />
            <p className="text-sm font-semibold">Your inbox is clear</p>
            <p className="text-xs text-slate-400 mt-1">There are no outstanding warnings or updates at this time.</p>
          </div>
        )}
      </div>

    </div>
  );
}
