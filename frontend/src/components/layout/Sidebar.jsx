import { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Hexagon, UserCheck } from 'lucide-react';
import SettingsModal from '../SettingsModal';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { logout, user } = useContext(AuthContext);
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    ...(user?.role === 'Admin' ? [{ name: 'Activity', href: '/activity', icon: UserCheck }] : [])
  ];

  const classNames = (...classes) => classes.filter(Boolean).join(' ');

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-royal-900/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)}></div>
      )}
      <div className={classNames(
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        "fixed inset-y-0 left-0 z-50 w-64 glass transition-transform duration-500 ease-in-out md:translate-x-0 md:static md:flex md:flex-col border-r border-white/5"
      )}>
        <div className="flex items-center justify-center h-20 bg-royal-900/40 border-b border-white/5 px-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center animate-float">
              <Hexagon className="text-royal-gold w-10 h-10 animate-glow" />
              <CheckSquare className="text-royal-900 w-5 h-5 absolute z-10" />
            </div>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-royal-champagne to-royal-gold font-serif text-2xl font-bold tracking-wider">
              TaskFlow
            </span>
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto mt-6">
          <nav className="flex-1 px-4 py-4 space-y-3">
            {navigation.map((item) => {
              const current = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    current ? 'bg-royal-gold/20 text-royal-champagne border-r-2 border-royal-gold shadow-[inset_0_0_20px_rgba(212,175,55,0.1)]' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200',
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 backdrop-blur-sm'
                  )}
                >
                  <item.icon
                    className={classNames(
                      current ? 'text-royal-gold' : 'text-gray-500 group-hover:text-royal-champagne',
                      'mr-4 flex-shrink-0 h-5 w-5 transition-colors duration-300'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex bg-royal-900/40 border-t border-white/5 p-4 m-4 rounded-xl backdrop-blur-sm hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setIsSettingsOpen(true)}>
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div>
                <div className="inline-flex h-10 w-10 rounded-full gold-gradient items-center justify-center text-royal-900 font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                  {user?.name.charAt(0)}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-200">{user?.name}</p>
                <p className="text-xs font-medium text-royal-gold group-hover:text-royal-champagne transition-colors">{user?.role}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); logout(); }}
                className="ml-auto p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all duration-300"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
