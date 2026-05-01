import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-royal-900/80 backdrop-blur-sm" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom glass-card rounded-2xl border border-white/10 text-left overflow-hidden shadow-2xl transform transition-all w-full sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-fade-in relative">
          {/* Decorative glow inside modal */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-royal-gold/10 rounded-full blur-[40px] pointer-events-none"></div>
          
          <div className="px-6 pt-6 pb-6 relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif font-medium text-transparent bg-clip-text bg-gradient-to-r from-royal-champagne to-royal-gold tracking-wide">{title}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-royal-champagne transition-colors rounded-full hover:bg-white/5 p-1">
                <X size={24} />
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
