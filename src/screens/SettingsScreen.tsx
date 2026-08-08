import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Accessibility,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Eye,
  User,
  RotateCcw,
  LogOut,
  CheckCircle2,
  Lock,
  HeartHandshake,
  BarChart3,
  Type,
  ZapOff,
  Minimize2,
  Target,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_USER } from '../utils/constants';
import { IconContainer } from '../widgets/IconContainer';

interface SettingsScreenProps {
  onNavigate?: (tab: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate }) => {
  const { user, updateUserPreferences, logout } = useAuth();
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!user) return null;

  const prefs = user.preferences || {};

  const handleToggle = (key: keyof typeof prefs) => {
    updateUserPreferences({ [key]: !prefs[key] });
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data back to initial mock values?')) {
      localStorage.clear();
      setResetSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
  };

  return (
    <div className="space-y-6 pb-24 pt-2 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <IconContainer icon={SettingsIcon} color="purple" size="md" />
          <h1 className="text-2xl font-black text-white tracking-tight">Settings & Accessibility</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Customize your experience, high-contrast modes, accessibility preferences, and usability testing.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Data reset complete! Reloading workspace...</span>
        </div>
      )}

      {/* Hero Profile */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/30 shadow-xl space-y-4">
        <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-purple-400" /> Hero Profile
        </h2>

        <div className="flex items-center gap-4">
          <img
            src={user.avatarUrl || INITIAL_USER.avatarUrl}
            alt={user.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/40"
          />
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white">{user.name}</h3>
            <p className="text-xs text-slate-400">{user.email}</p>
            <span className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Level {user.level} Adventurer
            </span>
          </div>
        </div>
      </div>

      {/* User Testing & Feedback Shortcuts */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-slate-900 border border-purple-500/40 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-amber-400" /> Neurodivergent User Testing
          </h2>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Hackathon Usability Module
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Test the FocusQuest AI experience as a neurodivergent student, parent, or educator and submit structured feedback stored directly in Firestore.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            onClick={() => onNavigate && onNavigate('user-testing')}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition"
          >
            <HeartHandshake className="w-4 h-4" /> Open User Testing Form
          </button>

          <button
            onClick={() => onNavigate && onNavigate('feedback-dashboard')}
            className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <BarChart3 className="w-4 h-4 text-amber-400" /> Developer Feedback Dashboard
          </button>
        </div>
      </div>

      {/* Accessibility Profiles Selection */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-violet-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Accessibility className="w-4 h-4 text-violet-400" /> Neurodivergent Accessibility Profiles
          </h2>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase">
            Usability Criteria 25%
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Select an tailored profile designed specifically for different cognitive profiles. Each profile configures fonts, layout, spacing, and micro-interaction mechanics.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* ADHD Profile Card */}
          <button
            type="button"
            onClick={() =>
              updateUserPreferences({
                accessibilityProfile: 'ADHD',
                adhdMode: true,
                singleTaskFocusMode: true,
                minimalInterface: false,
              })
            }
            className={`p-4 rounded-2xl text-left border transition-all relative ${
              (prefs.accessibilityProfile || (prefs.adhdMode ? 'ADHD' : 'Custom')) === 'ADHD'
                ? 'bg-violet-950/60 border-violet-500 text-white shadow-lg shadow-violet-500/20 ring-1 ring-violet-500'
                : 'bg-black/30 border-white/10 text-slate-300 hover:border-violet-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-extrabold text-white flex items-center gap-2">
                🧠 ADHD Profile
              </span>
              {(prefs.accessibilityProfile || (prefs.adhdMode ? 'ADHD' : 'Custom')) === 'ADHD' && (
                <CheckCircle2 className="w-4 h-4 text-violet-400" />
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Dopamine micro-rewards, single-task lock, task deconstruction, high contrast focus rings.
            </p>
          </button>

          {/* Dyslexia Profile Card */}
          <button
            type="button"
            onClick={() =>
              updateUserPreferences({
                accessibilityProfile: 'Dyslexia',
                largeText: true,
                highContrast: true,
              })
            }
            className={`p-4 rounded-2xl text-left border transition-all relative ${
              prefs.accessibilityProfile === 'Dyslexia'
                ? 'bg-amber-950/60 border-amber-500 text-white shadow-lg shadow-amber-500/20 ring-1 ring-amber-500'
                : 'bg-black/30 border-white/10 text-slate-300 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-extrabold text-white flex items-center gap-2">
                📖 Dyslexia Profile
              </span>
              {prefs.accessibilityProfile === 'Dyslexia' && (
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Expanded line-height, letter spacing, soft warm anti-glare tint, high legibility font hierarchy.
            </p>
          </button>

          {/* Autism / Sensory Friendly Profile Card */}
          <button
            type="button"
            onClick={() =>
              updateUserPreferences({
                accessibilityProfile: 'Autism',
                reducedAnimations: true,
                minimalInterface: true,
                soundEnabled: false,
              })
            }
            className={`p-4 rounded-2xl text-left border transition-all relative ${
              prefs.accessibilityProfile === 'Autism'
                ? 'bg-blue-950/60 border-blue-500 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-500'
                : 'bg-black/30 border-white/10 text-slate-300 hover:border-blue-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-extrabold text-white flex items-center gap-2">
                🎨 Autism / Sensory Profile
              </span>
              {prefs.accessibilityProfile === 'Autism' && (
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Muted visual contrast, zero jarring popups/animations, quiet sound profile, predictable layouts.
            </p>
          </button>

          {/* Custom Profile Card */}
          <button
            type="button"
            onClick={() =>
              updateUserPreferences({
                accessibilityProfile: 'Custom',
              })
            }
            className={`p-4 rounded-2xl text-left border transition-all relative ${
              prefs.accessibilityProfile === 'Custom' || (!prefs.accessibilityProfile && !prefs.adhdMode)
                ? 'bg-slate-800 border-slate-600 text-white'
                : 'bg-black/30 border-white/10 text-slate-300 hover:border-slate-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-extrabold text-white flex items-center gap-2">
                ⚡ Custom Configuration
              </span>
              {(prefs.accessibilityProfile === 'Custom' || (!prefs.accessibilityProfile && !prefs.adhdMode)) && (
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Configure each toggle independently according to your personal preferences below.
            </p>
          </button>
        </div>
      </div>

      {/* Accessibility Mode & Visual Toggles */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-400" /> Accessibility Mode Controls
        </h2>

        <div className="space-y-4 text-xs">
          {/* Theme Switch */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-sm">Theme Appearance</h3>
              <p className="text-slate-400">Dark luxury quest mode with purple/blue accents</p>
            </div>
            <div className="p-1 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-1">
              <button
                type="button"
                onClick={() => updateUserPreferences({ theme: 'dark' })}
                className={`p-2 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  prefs.theme !== 'light'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Dark
              </button>
              <button
                type="button"
                onClick={() => updateUserPreferences({ theme: 'light' })}
                className={`p-2 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  prefs.theme === 'light'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Light
              </button>
            </div>
          </div>

          {/* Large Text Support */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-start gap-2">
              <Type className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-white text-sm">Large Text</h3>
                <p className="text-slate-400">Increase base text size for readability</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('largeText')}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                prefs.largeText ? 'bg-purple-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  prefs.largeText ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* High Contrast Mode */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-start gap-2">
              <Eye className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-white text-sm">High Contrast</h3>
                <p className="text-slate-400">Thicker borders and vivid colors for visual clarity</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('highContrast')}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                prefs.highContrast ? 'bg-purple-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  prefs.highContrast ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reduced Animations */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-start gap-2">
              <ZapOff className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-white text-sm">Reduced Animations</h3>
                <p className="text-slate-400">Disable transitions to prevent sensory overload</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('reducedAnimations')}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                prefs.reducedAnimations ? 'bg-purple-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  prefs.reducedAnimations ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Minimal Interface */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-start gap-2">
              <Minimize2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-white text-sm">Minimal Interface</h3>
                <p className="text-slate-400">Streamline layout and hide auxiliary widgets</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('minimalInterface')}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                prefs.minimalInterface ? 'bg-purple-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  prefs.minimalInterface ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Single-Task Focus Mode */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-white text-sm">Single-Task Focus Mode</h3>
                <p className="text-slate-400">Lock focus to one active quest task at a time</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('singleTaskFocusMode')}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                prefs.singleTaskFocusMode ? 'bg-purple-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  prefs.singleTaskFocusMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sound Chimes */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-2">
              <Volume2 className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-white text-sm">Audio Synth Chimes</h3>
                <p className="text-slate-400">Play audio rewards on XP gain, level up, and timer finish</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('soundEnabled')}
              className={`p-2.5 rounded-xl transition ${
                prefs.soundEnabled ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {prefs.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Account & Data Management */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2 text-rose-400">
          <Lock className="w-4 h-4" /> Account & Reset
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleResetData}
            className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" /> Restore Mock Dataset
          </button>

          <button
            onClick={logout}
            className="flex-1 py-3 px-4 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 border border-rose-500/40 transition"
          >
            <LogOut className="w-4 h-4" /> Logout Session
          </button>
        </div>
      </div>
    </div>
  );
};
