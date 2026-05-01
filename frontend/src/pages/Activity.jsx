import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Clock, UserCheck, FileText } from 'lucide-react';

export default function Activity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/activity');
        setLogs(res.data.data);
      } catch (err) {
        toast.error('Failed to load activity logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <Layout title="Activity Timeline">
      <div className="glass-card rounded-3xl border-white/10 p-6 animate-slide-up">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-serif text-gray-200">Admin activity timeline</h2>
            <p className="text-sm text-gray-400">Everything important that happened across the kingdom.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-royal-gold"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No activity recorded yet.</div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log._id} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-royal-900/50 p-5 transition-all hover:border-royal-gold/20">
                <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-royal-champagne to-royal-gold"></div>
                <div className="ml-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-gray-500">
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{new Date(log.createdAt).toLocaleString()}</span>
                    <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" />{log.targetType}</span>
                  </div>
                  <p className="text-sm text-gray-100 leading-relaxed"><span className="font-semibold text-royal-gold">{log.user?.name || 'System'}</span> {log.action.replace('_', ' ')}{log.meta?.fileName ? `: ${log.meta.fileName}` : ''}</p>
                  <div className="flex flex-wrap gap-2 text-[11px] text-gray-400">
                    {log.projectId && <span className="rounded-full bg-white/5 px-2 py-1">Project ID: {log.projectId}</span>}
                    {log.targetId && <span className="rounded-full bg-white/5 px-2 py-1">Target ID: {log.targetId}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
