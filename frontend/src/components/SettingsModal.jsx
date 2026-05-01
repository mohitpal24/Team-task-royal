import { useState, useEffect, useContext } from 'react';
import Modal from './Modal';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Settings, User, Shield, AlertTriangle, Trash2, Power } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const { user, login } = useContext(AuthContext); // Assuming login/setUser updates context
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile State
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  
  // Admin Team State
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setProfileData({ name: user.name, email: user.email });
      if (user.role === 'Admin') {
        fetchTeam();
      }
    }
  }, [isOpen, user]);

  const fetchTeam = async () => {
    setLoadingTeam(true);
    try {
      const res = await api.get('/users');
      setTeamMembers(res.data.data);
    } catch (err) {
      toast.error('Failed to load nobles');
    } finally {
      setLoadingTeam(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/users/profile', profileData);
      toast.success('Profile updated successfully');
      // If we need to update context, we might need a refresh or we can just reload the page for simplicity
      window.location.reload(); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.put(`/users/${userId}/status`);
      toast.success('Noble status updated');
      fetchTeam();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleKickUser = async (userId) => {
    if (window.confirm('Are you sure you want to banish this noble? This action cannot be undone. Their tasks will become unassigned.')) {
      try {
        await api.delete(`/users/${userId}`);
        toast.success('Noble banished successfully');
        fetchTeam();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to banish noble');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Royal Settings">
      <div className="border-b border-white/10 mb-6 flex gap-4">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'profile' ? 'text-royal-gold border-b-2 border-royal-gold' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <div className="flex items-center gap-2">
            <User size={16} /> My Profile
          </div>
        </button>
        {user?.role === 'Admin' && (
          <button
            onClick={() => setActiveTab('team')}
            className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'team' ? 'text-royal-gold border-b-2 border-royal-gold' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <div className="flex items-center gap-2">
              <Shield size={16} /> Manage Nobles
            </div>
          </button>
        )}
      </div>

      {activeTab === 'profile' ? (
        <form onSubmit={handleUpdateProfile} className="space-y-5 animate-fade-in">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              required
              className="appearance-none relative block w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-gold transition-all"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              required
              disabled
              className="appearance-none relative block w-full px-4 py-3 bg-white/5 border border-white/10 text-gray-400 rounded-lg focus:outline-none cursor-not-allowed"
              value={profileData.email}
              title="Email cannot be changed"
            />
          </div>
          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-royal-900 rounded-lg gold-gradient shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-all"
            >
              Update Profile
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {loadingTeam ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-gold"></div>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
              {teamMembers.map(member => (
                <div key={member._id} className="glass p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 rounded-full bg-royal-800 border border-white/10 items-center justify-center text-gray-300 font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">{member.name} {member._id === user._id && '(You)'}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400">{member.email}</span>
                        {!member.isActive && <span className="text-red-400 font-medium px-1.5 py-0.5 rounded bg-red-400/10 text-[10px]">SUSPENDED</span>}
                      </div>
                    </div>
                  </div>
                  
                  {member._id !== user._id && (
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                      <button
                        onClick={() => handleToggleStatus(member._id)}
                        className={`p-2 rounded-lg transition-colors border ${member.isActive ? 'text-yellow-500 hover:bg-yellow-500/10 border-yellow-500/20' : 'text-green-400 hover:bg-green-400/10 border-green-400/20'}`}
                        title={member.isActive ? "Suspend Noble" : "Activate Noble"}
                      >
                        {member.isActive ? <AlertTriangle size={16} /> : <Power size={16} />}
                      </button>
                      <button
                        onClick={() => handleKickUser(member._id)}
                        className="p-2 rounded-lg transition-colors border border-red-500/20 text-red-500 hover:bg-red-500/10"
                        title="Banish Noble"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
