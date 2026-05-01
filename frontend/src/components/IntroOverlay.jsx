import { useState, useEffect } from 'react';

export default function IntroOverlay() {
  const [stage, setStage] = useState(0); // 0: initial, 1: welcome, 2: work harder, 3: fade out, 4: unmount

  useEffect(() => {
    // Check if we've already shown the intro in this session
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
    if (hasSeenIntro) {
      setStage(4);
      return;
    }

    // Animation sequence
    setTimeout(() => setStage(1), 500); // Show "Welcome to the Kingdom"
    setTimeout(() => setStage(2), 2500); // Show "Work Harder"
    setTimeout(() => setStage(3), 4500); // Start fade out of the whole overlay
    setTimeout(() => {
      setStage(4);
      sessionStorage.setItem('hasSeenIntro', 'true');
    }, 5500); // Unmount
  }, []);

  if (stage === 4) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-royal-900 transition-opacity duration-1000 ${stage === 3 ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center px-4">
        {stage >= 1 && stage < 3 && (
          <h1 className={`font-serif text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-royal-champagne to-royal-gold drop-shadow-lg transition-all duration-1000 ${stage === 1 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4 absolute left-0 right-0'}`}>
            Welcome to the Kingdom
          </h1>
        )}
        
        {stage >= 2 && stage < 3 && (
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-royal-gold drop-shadow-[0_0_20px_rgba(212,175,55,0.5)] animate-fade-in translate-y-0">
            Work Harder.
          </h1>
        )}
      </div>
      
      {/* Decorative magical particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-royal-gold/20 rounded-full blur-[80px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-royal-champagne/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
}
