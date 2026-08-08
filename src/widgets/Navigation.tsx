import React from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  ClipboardCheck,
  BrainCircuit,
  Timer,
  Trophy,
  LineChart,
  Settings,
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface NavigationProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: ClipboardCheck },
  { id: 'ai-planner', label: 'AI Coach', icon: BrainCircuit, badge: 'AI' },
  { id: 'focus', label: 'Focus', icon: Timer },
  { id: 'gamification', label: 'Achievements', icon: Trophy },
  { id: 'analytics', label: 'Analytics', icon: LineChart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onNavigate }) => {
  const handleNavClick = (tabId: string) => {
    soundService.playClick();
    onNavigate(tabId);
  };

  return (
    <>
      {/* Mobile & Tablet Bottom Navigation Bar */}
      <nav className="fixed bottom-3 left-3 right-3 z-50 bg-[#111827]/95 backdrop-blur-2xl border border-white/10 rounded-full py-2 px-3 shadow-2xl shadow-black/90 lg:hidden">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`relative flex flex-col items-center justify-center p-2 rounded-full transition-all cursor-pointer ${
                  isActive
                    ? 'text-violet-400 font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {/* Active Pill Indicator Layout Animation */}
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveTab"
                    className="absolute inset-0 bg-violet-500/20 rounded-full border border-violet-500/30"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                <div className="relative z-10">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-violet-400' : ''}`} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 text-[7px] font-extrabold px-1 py-0.2 bg-violet-600 text-white rounded-full shadow">
                      {item.badge}
                    </span>
                  )}
                </div>

                <span className="text-[9px] font-bold mt-0.5 relative z-10 hidden sm:block">
                  {item.label}
                </span>

                {isActive && (
                  <motion.span
                    layoutId="mobileActiveDot"
                    className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Floating Navigation Bar */}
      <div className="hidden lg:block py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="inline-flex items-center gap-1.5 p-1.5 bg-[#111827]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-black/50">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all relative cursor-pointer ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
                  }`}
                >
                  {/* Active Indicator Background Transition */}
                  {isActive && (
                    <motion.div
                      layoutId="desktopActiveTab"
                      className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-full shadow-lg shadow-violet-600/30 border border-violet-400/30"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}

                  <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="relative z-10">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`relative z-10 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
