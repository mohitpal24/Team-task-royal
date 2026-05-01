import { useCallback, useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function useNotifications() {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
      setUnreadCount(res.data.data.filter((item) => !item.isRead).length);
    } catch (err) {
      console.error('Unable to load notifications', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((current) => current.map((item) => item._id === id ? { ...item, isRead: true } : item));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      console.error('Unable to mark notification read', err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Unable to mark all notifications read', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllRead
  };
}
