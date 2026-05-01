import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Plus, Clock, Users, User, ScrollText, Paperclip } from 'lucide-react';
import Modal from '../components/Modal';
import { getSocket } from '../services/socket';

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [uploadingTask, setUploadingTask] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '', deadline: '' });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchProjectAndTasks();
    const socket = getSocket();
    if (!socket) return;

    const refresh = () => fetchProjectAndTasks();
    socket.emit('joinProject', id);
    socket.on('taskCreated', refresh);
    socket.on('taskUpdated', refresh);
    socket.on('taskDeleted', refresh);

    return () => {
      socket.emit('leaveProject', id);
      socket.off('taskCreated', refresh);
      socket.off('taskUpdated', refresh);
      socket.off('taskDeleted', refresh);
    };
  }, [id]);

  const fetchProjectAndTasks = async () => {
    try {
      const promises = [
        api.get(`/projects/${id}`),
        api.get(`/tasks?projectId=${id}`)
      ];
      if (user?.role === 'Admin') {
          promises.push(api.get('/users'));
      }
      
      const results = await Promise.all(promises);
      setProject(results[0].data.data);
      setTasks(results[1].data.data.filter(t => t.projectId._id === id || t.projectId === id));
      if (user?.role === 'Admin') {
          setUsers(results[2].data.data);
      }
    } catch (err) {
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Status updated');
      fetchProjectAndTasks();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status, deadline) => {
    if (status === 'completed') return 'bg-green-400/20 text-green-400 border-green-400/30 shadow-[0_0_10px_rgba(74,222,128,0.2)]';
    if (new Date(deadline) < new Date()) return 'bg-red-400/20 text-red-400 border-red-400/30 shadow-[0_0_10px_rgba(248,113,113,0.2)]';
    if (status === 'in-progress') return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30 shadow-[0_0_10px_rgba(250,204,21,0.2)]';
    return 'bg-royal-gold/10 text-royal-champagne border-royal-gold/30 shadow-[0_0_10px_rgba(212,175,55,0.1)]';
  };

  const updateTaskAssignment = async (taskId, newAssigneeId) => {
    try {
      await api.put(`/tasks/${taskId}`, { assignedTo: newAssigneeId || null });
      toast.success('Task reassigned');
      fetchProjectAndTasks();
    } catch (err) {
      toast.error('Failed to reassign task');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, projectId: id });
      toast.success('Task created');
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', assignedTo: '', deadline: '' });
      fetchProjectAndTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleAttachmentUpload = async (taskId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploadingTask(taskId);

    try {
      await api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Attachment uploaded');
      fetchProjectAndTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload attachment');
    } finally {
      setUploadingTask(null);
    }
  };

  return (
    <Layout title={project ? project.name : 'Loading...'}>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-royal-gold"></div>
        </div>
      ) : project && (
        <>
          <div className="glass-card rounded-2xl border-white/10 mb-10 overflow-hidden animate-slide-up relative">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-royal-gold/5 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="px-6 py-6 border-b border-white/5 bg-royal-900/30">
              <div className="flex items-center gap-3 mb-2">
                <ScrollText className="text-royal-gold w-6 h-6" />
                <h3 className="text-xl font-serif font-medium text-gray-200">Royal Edict details</h3>
              </div>
              <p className="mt-1 max-w-2xl text-sm text-gray-400 leading-relaxed">{project.description}</p>
            </div>
            <div className="px-6 py-6">
              <dl className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1 glass p-4 rounded-xl">
                  <dt className="text-sm font-medium text-gray-400 flex items-center gap-2 mb-2">
                    <User size={16} className="text-royal-gold" />
                    Declared By
                  </dt>
                  <dd className="mt-1 text-base text-gray-200 font-medium">{project.createdBy?.name || 'Unknown'}</dd>
                </div>
                <div className="sm:col-span-1 glass p-4 rounded-xl">
                  <dt className="text-sm font-medium text-gray-400 flex items-center gap-2 mb-2">
                    <Users size={16} className="text-royal-gold" />
                    Assigned Nobles
                  </dt>
                  <dd className="mt-1 text-base text-gray-200 font-medium">{project.members?.map(m => m.name).join(', ') || 'No nobles assigned'}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h3 className="text-2xl font-serif font-medium text-transparent bg-clip-text bg-gradient-to-r from-royal-champagne to-royal-gold">Assigned Tasks</h3>
            {user?.role === 'Admin' && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.2)] text-royal-900 gold-gradient hover:-translate-y-0.5 transition-all duration-300"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Draft Task
              </button>
            )}
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-2xl border-white/10 shadow-xl animate-slide-up" style={{ animationDelay: '300ms' }}>
              <h3 className="mt-2 text-xl font-serif text-gray-200">No tasks drafted</h3>
              <p className="mt-2 text-gray-400">This edict has no duties assigned yet.</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden rounded-2xl border-white/10 animate-slide-up" style={{ animationDelay: '300ms' }}>
              <ul className="divide-y divide-white/5">
                {tasks.map((task, index) => (
                  <li 
                    key={task._id} 
                    className="p-6 hover:bg-white/5 transition-all duration-300 relative group"
                  >
                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-royal-champagne to-royal-gold scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="text-xl font-serif font-medium text-gray-200 truncate group-hover:text-royal-champagne transition-colors">{task.title}</h4>
                        <p className="mt-2 text-sm text-gray-400 line-clamp-2">{task.description}</p>
                        <div className="mt-4 flex items-center gap-4 text-xs font-medium text-gray-400">
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-royal-800/50 border border-white/5">
                            <Clock size={14} className="text-royal-gold" />
                            Deadline: {format(new Date(task.deadline), 'MMM d, yyyy')}
                          </span>
                          {user?.role === 'Admin' ? (
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                              Assigned to:
                              <select
                                value={task.assignedTo?._id || ''}
                                onChange={(e) => updateTaskAssignment(task._id, e.target.value)}
                                className="bg-transparent border-none focus:outline-none focus:ring-0 text-gray-200 text-xs font-medium cursor-pointer p-0"
                              >
                                <option value="" className="bg-royal-900 text-white">Unassigned</option>
                                {users.map(u => (
                                  <option key={u._id} value={u._id} className="bg-royal-900 text-white">{u.name}</option>
                                ))}
                              </select>
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Assigned to: <span className="text-gray-200">{task.assignedTo?.name || 'Unassigned'}</span></span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex flex-col items-end gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border tracking-wider uppercase ${getStatusColor(task.status, task.deadline)}`}>
                          {new Date(task.deadline) < new Date() && task.status !== 'completed' ? 'overdue' : task.status}
                        </span>
                        {(user?.role === 'Admin' || task.assignedTo?._id === user?._id) && (
                          <select
                            value={task.status}
                            onChange={(e) => updateStatus(task._id, e.target.value)}
                            className="mt-1 block w-32 pl-3 pr-8 py-2 text-xs font-medium text-white bg-royal-900 border border-white/20 focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-transparent rounded-lg cursor-pointer transition-all hover:border-royal-gold/50"
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        )}
                      </div>
                    </div>

                    {task.attachments?.length > 0 && (
                      <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-4 text-sm text-gray-300">
                        <div className="mb-2 flex items-center gap-2 text-gray-100 font-semibold">
                          <Paperclip className="h-4 w-4 text-royal-gold" />
                          Attachments
                        </div>
                        <div className="space-y-2">
                          {task.attachments.map((attachment) => (
                            <a
                              key={attachment.fileUrl}
                              href={attachment.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="block rounded-lg border border-white/10 bg-royal-900/60 px-3 py-2 text-sm text-royal-champagne hover:bg-royal-800/90"
                            >
                              {attachment.fileName}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {(user?.role === 'Admin' || task.assignedTo?._id === user?._id) && (
                      <div className="mt-4 flex items-center gap-3">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-royal-900/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-royal-800/90">
                          Upload Attachment
                          <input
                            type="file"
                            accept=".pdf,image/*,.doc,.docx"
                            className="hidden"
                            onChange={(e) => handleAttachmentUpload(task._id, e.target.files?.[0])}
                          />
                        </label>
                        {uploadingTask === task._id && (
                          <span className="text-xs text-gray-400">Uploading...</span>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Draft New Task">
            <form onSubmit={handleCreateTask} className="space-y-5 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Task Title</label>
                <input
                  type="text"
                  required
                  className="appearance-none relative block w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-gold transition-all"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  required
                  rows={2}
                  className="appearance-none relative block w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-gold transition-all resize-none"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Assign Noble</label>
                <select
                  required
                  className="appearance-none relative block w-full px-4 py-3 bg-royal-800 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-gold transition-all"
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                >
                  <option value="">Select a user</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Deadline</label>
                <input
                  type="date"
                  required
                  className="appearance-none relative block w-full px-4 py-3 bg-royal-800 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-gold transition-all color-scheme-dark"
                  style={{ colorScheme: 'dark' }}
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-300 bg-transparent border border-gray-600 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-royal-900 rounded-lg gold-gradient shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-all"
                >
                  Draft
                </button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </Layout>
  );
}
