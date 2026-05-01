import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import api from '../services/api';
import toast from 'react-hot-toast';
import { CheckCircle, Clock, AlertCircle, ListTodo, Crown } from 'lucide-react';
import { getSocket } from '../services/socket';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/tasks/stats/dashboard');
        setStats(res.data.data);
      } catch (err) {
        toast.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();

    const socket = getSocket();
    if (!socket) return;
    const refresh = () => fetchStats();
    socket.on('taskCreated', refresh);
    socket.on('taskUpdated', refresh);
    socket.on('taskDeleted', refresh);

    return () => {
      socket.off('taskCreated', refresh);
      socket.off('taskUpdated', refresh);
      socket.off('taskDeleted', refresh);
    };
  }, []);

  const statCards = stats ? [
    { name: 'Total Tasks', value: stats.total, icon: ListTodo, color: 'text-royal-champagne bg-royal-gold/20 shadow-[0_0_15px_rgba(212,175,55,0.2)]' },
    { name: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-400 bg-green-400/20 shadow-[0_0_15px_rgba(74,222,128,0.2)]' },
    { name: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-yellow-400 bg-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.2)]' },
    { name: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-red-400 bg-red-400/20 shadow-[0_0_15px_rgba(248,113,113,0.2)]' },
  ] : [];

  return (
    <Layout title="Dashboard">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-royal-gold"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((item, index) => (
            <div 
              key={item.name} 
              className={`glass-card overflow-hidden rounded-2xl border-t border-l border-white/10 hover:-translate-y-2 transition-all duration-300 animate-slide-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`rounded-xl p-4 ${item.color} backdrop-blur-sm`}>
                      <item.icon className="h-7 w-7" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">{item.name}</dt>
                      <dd>
                        <div className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">{item.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-10 animate-fade-in" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <Crown className="text-royal-gold w-6 h-6 animate-pulse" />
          <h2 className="text-xl font-serif font-medium text-royal-champagne drop-shadow-sm">Welcome to TaskFlow Royal</h2>
        </div>
        <div className="glass-card rounded-2xl border-white/10 hover:border-royal-gold/30 transition-colors duration-500">
          <div className="px-6 py-8 sm:p-10 text-gray-300">
            <p className="text-lg mb-4">Use the sidebar to navigate your Projects and Tasks.</p>
            <p className="leading-relaxed">
              If you are an <span className="text-royal-gold font-medium">Admin</span>, you hold the power to create new projects and assign tasks across the realm. 
              If you are a <span className="text-royal-champagne font-medium">Member</span>, you can view the tasks assigned to you and update their status to serve the kingdom.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
