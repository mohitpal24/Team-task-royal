import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import IntroOverlay from '../IntroOverlay';
import NotificationDropdown from '../NotificationDropdown';

export default function Layout({ children, title }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-royal-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-royal-800 to-royal-900 relative">
      <IntroOverlay />
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-royal-gold/10 blur-[120px] rounded-full pointer-events-none"></div>

      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden z-10">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 glass border-b-0 rounded-b-xl flex items-center mb-4">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-royal-champagne hover:text-royal-gold focus:outline-none"
            onClick={() => setMobileOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu size={24} />
          </button>
          <span className="text-royal-gold font-serif text-lg font-bold ml-2">TaskFlow Royal</span>
        </div>
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between animate-fade-in">
              <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-transparent bg-clip-text bg-gradient-to-r from-royal-champagne to-royal-gold drop-shadow-md">
                {title}
              </h1>
              <div className="flex items-center gap-3">
                <NotificationDropdown />
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8 animate-slide-up">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
