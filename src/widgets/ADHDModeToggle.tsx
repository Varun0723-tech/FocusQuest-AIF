import React from 'react';
import { Zap, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ADHDModeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { user, updateUserPreferences } = useAuth();

  if (!user) return null;

  const prefs = user.preferences || {};
  const isAdhdMode = !!prefs.adhdMode;

  const handleToggle = () => {
    const nextState = !isAdhdMode;
    if (nextState) {
      // Enable all neurodivergent accessibility optimizations in 1-click
      updateUserPreferences({
        adhdMode: true,
        largeText: true,
        highContrast: true,
        reducedAnimations: true,
        minimalInterface: true,
        singleTaskFocusMode: true,
        soundEnabled: true,
      });
    } else {
      updateUserPreferences({
        adhdMode: false,
        largeText: false,
        highContrast: false,
        reducedAnimations: false,
        minimalInterface: false,
        singleTaskFocusMode: false,
      });
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`px-3.5 py-2 rounded-2xl font-black text-xs transition flex items-center gap-2 border shadow-md ${
        isAdhdMode
          ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/20 animate-pulse'
          : 'bg-slate-900/90 hover:bg-slate-800 text-amber-300 border-amber-500/30'
      } ${className}`}
      title="1-Touch Neurodivergent Preset: Enables Large Text, High Contrast, Single Task Focus Mode & Reduced Animations"
    >
      <div className={`p-1 rounded-lg ${isAdhdMode ? 'bg-slate-950/20' : 'bg-amber-500/20'}`}>
        <Zap className="w-3.5 h-3.5" />
      </div>
      <span>{isAdhdMode ? 'ADHD Mode: ACTIVE' : 'Enable ADHD Mode'}</span>
      {isAdhdMode && <Check className="w-3.5 h-3.5 stroke-[3]" />}
    </button>
  );
};
