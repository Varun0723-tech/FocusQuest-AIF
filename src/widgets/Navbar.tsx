import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, Sparkles, LogOut, Settings as SettingsIcon, Zap } from 'lucide-react';
import { NovaAvatar } from './NovaAvatar';

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onNavigate }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const xpProgressPercent = Math.min(
    100,
    Math.round((user.xp / user.xpToNextLevel) * 100)
  );

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F17]/80 backdrop-blur-2xl border-b border-white/[0.08] px-4 md:px-6 py-3 text-white transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand logo & title */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-[1px] shadow-lg shadow-violet-600/20 group-hover:scale-105 transition-all">
            <div className="w-full h-full bg-[#0B0F17] rounded-[15px] flex items-center justify-center text-violet-400">
              <Zap className="w-4 h-4 fill-violet-400 text-violet-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white font-['Plus_Jakarta_Sans']">
                FocusQuest
              </span>
              <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 uppercase tracking-widest">
                AI OS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Cognitive Operating System</p>
          </div>
        </div>

        {/* Center Nova AI Orb trigger */}
        <div className="hidden sm:flex items-center gap-2 bg-purple-950/40 border border-purple-500/30 px-3 py-1 rounded-full shadow-lg">
          <NovaAvatar size="sm" showSubtitle={false} />
          <div className="text-[11px] font-bold text-purple-200">
            <span>Nova Companion Active</span>
          </div>
        </div>

        {/* Level, XP & Streak Stats Pill */}
        <div className="flex items-center gap-2.5">
          {/* Streak pill */}
          <button
            onClick={() => onNavigate('gamification')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold hover:bg-amber-500/20 hover:border-amber-500/40 transition-all shadow-sm cursor-pointer"
            title={`${user.streak} Day Active Streak`}
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
            <span>{user.streak}</span>
            <span className="text-[10px] text-amber-300/70 uppercase hidden sm:inline">day streak</span>
          </button>

          {/* Level & XP bar */}
          <button
            onClick={() => onNavigate('gamification')}
            className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 hover:border-violet-500/40 hover:bg-white/[0.06] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span className="text-xs font-bold text-violet-200">
                Lvl {user.level}
              </span>
            </div>
            <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden p-0">
              <div
                className="bg-gradient-to-r from-violet-500 to-indigo-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${xpProgressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-semibold font-mono">
              {user.xp}/{user.xpToNextLevel} XP
            </span>
          </button>

          {/* User Profile avatar / settings buttons */}
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/10">
            <button
              onClick={() => onNavigate('settings')}
              className={`p-1.5 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer ${
                activeTab === 'settings' ? 'bg-violet-600 text-white shadow-sm' : 'hover:bg-white/10'
              }`}
              title="Settings & Profile"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="p-1.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};


