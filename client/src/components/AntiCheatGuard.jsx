import React, { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { sound } from '../audio/soundEngine';

export default function AntiCheatGuard({ isActive = false, onViolation = null }) {
  const [warningVisible, setWarningVisible] = useState(false);
  const [violationCount, setViolationCount] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setWarningVisible(false);
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        sound.playWrong();
        setViolationCount(prev => {
          const updated = prev + 1;
          if (onViolation) onViolation('tab_blur', updated);
          return updated;
        });
        setWarningVisible(true);
      }
    };

    const handleWindowBlur = () => {
      if (document.hidden) {
        handleVisibilityChange();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isActive, onViolation]);

  if (!warningVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-obsidian/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate border-2 border-red-blood rounded-3xl p-6 shadow-red-glow text-center space-y-4 animate-shake">
        <div className="w-16 h-16 mx-auto bg-red-blood/20 border border-red-blood rounded-full flex items-center justify-center text-red-blood">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h2 className="font-heading font-extrabold text-xl text-bone">
            Please Stay on this Screen
          </h2>
          <p className="text-xs text-ash font-body">
            To keep games fair and fun for all players, please don't switch tabs or minimize your screen while a question is active.
          </p>
        </div>

        <div className="p-3 bg-obsidian/80 border border-steel/50 rounded-2xl text-xs font-medium text-orange-magma">
          Warning {violationCount} of 2. Repeated tab switches are shown to the game host.
        </div>

        <button
          onClick={() => setWarningVisible(false)}
          className="w-full py-3.5 bg-red-blood hover:bg-red-blood/90 text-bone font-heading font-bold rounded-2xl uppercase tracking-wider transition-all"
        >
          Return to Game
        </button>
      </div>
    </div>
  );
}
