import { useEffect, useState, useContext } from 'react';
import Layout from '../components/layout/Layout';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Clock, CheckCircle2, Paperclip, Trash2 } from 'lucide-react';
import { getSocket } from '../services/socket';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchTasks();
    const socket = getSocket();
    if (!socket) return;
    const refresh = () => fetchTasks();
    socket.on('taskCreated', refresh);
    socket.on('taskUpdated', refresh);
    socket.on('taskDeleted', refresh);
    return () => {
      socket.off('taskCreated', refresh);
      socket.off('taskUpdated', refresh);
      socket.off('taskDeleted', refresh);
    };
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.data);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Status updated');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const getStatusColor = (status, deadline) => {
    if (status === 'completed') return 'bg-green-400/20 text-green-400 border-green-400/30 shadow-[0_0_10px_rgba(74,222,128,0.2)]';
    if (new Date(deadline) < new Date()) return 'bg-red-400/20 text-red-400 border-red-400/30 shadow-[0_0_10px_rgba(248,113,113,0.2)]';
    if (status === 'in-progress') return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30 shadow-[0_0_10px_rgba(250,204,21,0.2)]';
    return 'bg-royal-gold/10 text-royal-champagne border-royal-gold/30 shadow-[0_0_10px_rgba(212,175,55,0.1)]';
  };

  return (
    <Layout title="My Tasks">
      <div className="mb-6 animate-fade-in">
        <p className="text-gray-400">View and manage tasks assigned to you across the realm</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-royal-gold"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-2xl border-white/10 shadow-xl animate-slide-up">
          <CheckCircle2 className="mx-auto h-16 w-16 text-royal-gold/50 animate-pulse" />
          <h3 className="mt-4 text-xl font-serif text-gray-200">No tasks assigned</h3>
          <p className="mt-2 text-gray-400">You don't have any pending royal duties right now.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden rounded-2xl border-white/10 animate-slide-up">
          <ul className="divide-y divide-white/5">
            {tasks.map((task, index) => (
              <li 
                key={task._id} 
                className="p-6 hover:bg-white/5 transition-all duration-300 relative group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-royal-champagne to-royal-gold scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0 pr-0 sm:pr-4">
                    <h4 className="text-xl font-serif font-medium text-gray-200 truncate group-hover:text-royal-champagne transition-colors">{task.title}</h4>
                    <p className="mt-2 text-sm text-gray-400 line-clamp-2">{task.description}</p>
                    <div className="mt-4 flex flex-col gap-3 text-xs font-medium text-gray-400">
                      <div className="flex flex-wrap gap-4">
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-royal-800/50 border border-white/5">
                          <Clock size={14} className="text-royal-gold" />
                          Deadline: {format(new Date(task.deadline), 'MMM d, yyyy')}
                        </span>
                        {task.projectId && (
                          <span className="text-royal-gold px-3 py-1 rounded-full bg-royal-gold/10 border border-royal-gold/20">
                            Project: {task.projectId.name}
                          </span>
                        )}
                      </div>
                      {task.attachments?.length > 0 && (
                        <div className="flex flex-wrap gap-2 items-center text-gray-300">
                          <Paperclip className="h-4 w-4 text-royal-gold" />
                          {task.attachments.map((attachment) => (
                            <a key={attachment.fileUrl} href={attachment.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-royal-champagne hover:text-white underline-offset-2">
                              {attachment.fileName}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3 sm:ml-4 w-full sm:w-auto">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border tracking-wider uppercase ${getStatusColor(task.status, task.deadline)}`}>
                      {new Date(task.deadline) < new Date() && task.status !== 'completed' ? 'overdue' : task.status}
                    </span>
                    <select
                      value={task.status}
                      onChange={(e) => updateStatus(task._id, e.target.value)}
                      className="mt-1 block w-32 pl-3 pr-8 py-2 text-xs font-medium text-white bg-royal-900 border border-white/20 focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-transparent rounded-lg cursor-pointer transition-all hover:border-royal-gold/50"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    {user?.role === 'Admin' && (
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors w-full justify-center sm:w-auto mt-2 sm:mt-0"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Layout>
  );
}
