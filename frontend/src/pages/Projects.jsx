import { useEffect, useState, useContext } from 'react';
import Layout from '../components/layout/Layout';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, FolderKanban } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Modal from '../components/Modal';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      toast.success('Project created');
      setIsModalOpen(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  };

  return (
    <Layout title="Projects">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 animate-fade-in">
        <p className="text-gray-400">Manage and view your team projects in the royal archive</p>
        {user?.role === 'Admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-royal-900 gold-gradient hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-royal-gold"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-2xl border-white/10 shadow-xl animate-slide-up">
          <FolderKanban className="mx-auto h-16 w-16 text-royal-gold/50 animate-pulse" />
          <h3 className="mt-4 text-xl font-serif text-gray-200">No projects found</h3>
          <p className="mt-2 text-gray-400">Your royal archives are empty. Begin by declaring a new project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <Link 
              key={project._id} 
              to={`/projects/${project._id}`} 
              className="block animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="glass-card rounded-2xl border-t border-l border-white/10 hover:border-royal-gold/40 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(212,175,55,0.15)] transition-all duration-300 overflow-hidden group">
                <div className="p-6 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-royal-gold/5 rounded-full blur-2xl group-hover:bg-royal-gold/10 transition-colors"></div>
                  <h3 className="text-xl font-serif font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 truncate mb-3">{project.name}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2 h-10">{project.description}</p>
                  <div className="mt-6 flex items-center justify-between text-xs font-medium text-royal-champagne border-t border-white/10 pt-4">
                    <span className="flex items-center gap-1 bg-royal-gold/10 px-3 py-1 rounded-full">{project.members?.length || 0} Members</span>
                    <span>{format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="space-y-5 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
            <input
              type="text"
              required
              className="appearance-none relative block w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-gold transition-all"
              value={newProject.name}
              onChange={(e) => setNewProject({...newProject, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              required
              rows={3}
              className="appearance-none relative block w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-gold transition-all resize-none"
              value={newProject.description}
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
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
              Create Project
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
