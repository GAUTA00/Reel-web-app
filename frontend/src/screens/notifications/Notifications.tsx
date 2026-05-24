// src/screens/notifications/Notifications.tsx
import { ArrowLeft, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from './useNotifications';
import NotificationSkeleton from '../../components/skeletons/NotificationSkeleton';
import type { Notification, NotificationType } from '../../types/notification.types';

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'like':    return <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />;
    case 'comment': return <MessageCircle className="w-5 h-5 text-blue-500 fill-blue-500" />;
    case 'reply':   return <MessageCircle className="w-5 h-5 text-purple-500 fill-purple-500" />;
    case 'follow':  return <UserPlus className="w-5 h-5 text-green-500 fill-green-500" />;
    default:        return null;
  }
};

const getMessage = (n: Notification) => {
  const name = n.sender?.name || 'Someone';
  switch (n.type) {
    case 'like':    return <span><b>{name}</b> liked your reel.</span>;
    case 'comment': return <span><b>{name}</b> commented on your reel.</span>;
    case 'reply':   return <span><b>{name}</b> replied to your comment.</span>;
    case 'follow':  return <span><b>{name}</b> started following you.</span>;
    default:        return <span>New notification</span>;
  }
};

export default function Notifications() {
  const { notificationsQuery, markReadMutation, markAllReadMutation } = useNotifications();

  const notifications = notificationsQuery.data ?? [];
  const isLoading = notificationsQuery.isLoading;

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-black z-10 py-2">
        <div className="flex items-center gap-3">
          <Link to="/feed" className="p-2 bg-white/10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>
        <button
          onClick={() => markAllReadMutation.mutate()}
          disabled={markAllReadMutation.isPending}
          className="text-xs text-blue-400 font-semibold hover:text-blue-300 disabled:opacity-50"
        >
          Mark all read
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {isLoading ? (
          <NotificationSkeleton />
        ) : notifications.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 flex flex-col items-center">
            <div className="p-4 bg-gray-900 rounded-full mb-4">
              <MessageCircle className="w-8 h-8 opacity-50" />
            </div>
            No notifications yet.
          </div>
        ) : (
          notifications.map((n: Notification) => (
            <div
              key={n._id}
              className={`flex items-start gap-4 p-4 rounded-xl transition cursor-pointer ${n.read ? 'bg-transparent opacity-60' : 'bg-gray-900 border border-gray-800'}`}
              onClick={() => !n.read && markReadMutation.mutate(n._id)}
            >
              <div className="mt-1">
                {n.sender?.image ? (
                  <img src={n.sender.image} className="w-10 h-10 rounded-full object-cover border border-white/10" alt="" />
                ) : (
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center font-bold">
                    {n.sender?.name?.[0] || '?'}
                  </div>
                )}
                <div className="relative -top-3 -right-7 bg-white rounded-full p-0.5 w-max">
                  {getIcon(n.type)}
                </div>
              </div>

              <div className="flex-1">
                <p className="text-sm text-gray-200">{getMessage(n)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(n.createdAt).toLocaleDateString()}
                </p>
              </div>

              {n.reel && (
                <div className="w-12 h-16 bg-gray-800 rounded overflow-hidden">
                  <video src={n.reel.videoUrl} className="w-full h-full object-cover opacity-50" />
                </div>
              )}

              {!n.read && <div className="w-2 h-2 rounded-full bg-pink-500 mt-2" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
