import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { QuestProvider } from './context/QuestContext';
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { TasksScreen } from './screens/TasksScreen';
import { AIPlannerScreen } from './screens/AIPlannerScreen';
import { FocusTimerScreen } from './screens/FocusTimerScreen';
import { GamificationScreen } from './screens/GamificationScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { UserTestingScreen } from './screens/UserTestingScreen';
import { FeedbackDashboardScreen } from './screens/FeedbackDashboardScreen';
import { Navbar } from './widgets/Navbar';
import { Navigation } from './widgets/Navigation';
import { XPToast } from './widgets/XPToast';
import { LevelUpModal } from './widgets/LevelUpModal';
import { ErrorBoundary } from './components/ErrorBoundary';

const TAB_STORAGE_KEY = 'focusquest_active_tab';

const MainAppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading, levelUpModal, closeLevelUpModal, xpGainToast } = useAuth();
  
  // Restore active tab from localStorage or default to 'dashboard'
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      return localStorage.getItem(TAB_STORAGE_KEY) || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  // Save active tab on change
  useEffect(() => {
    try {
      localStorage.setItem(TAB_STORAGE_KEY, activeTab);
    } catch (e) {
      console.warn('Failed to save active tab to localStorage', e);
    }
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-purple-400 gap-3">
        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        <span className="text-xs font-bold tracking-widest uppercase">Loading FocusQuest AI...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const prefs = user?.preferences || {};
  const profile = prefs.accessibilityProfile || (prefs.adhdMode ? 'ADHD' : 'Custom');
  const isLargeText = prefs.largeText || profile === 'Dyslexia';
  const isHighContrast = prefs.highContrast;

  const profileClasses = 
    profile === 'Dyslexia'
      ? 'tracking-wide leading-relaxed bg-[#0e1626] font-sans'
      : profile === 'Autism'
      ? 'saturate-90 brightness-95 bg-[#0b0f19]'
      : profile === 'ADHD'
      ? 'bg-[#0b0f19] ring-1 ring-violet-500/20'
      : 'bg-[#0b0f19]';

  return (
    <div
      className={`min-h-screen text-slate-100 flex flex-col selection:bg-violet-500 selection:text-white ${profileClasses} ${
        isLargeText ? 'text-base' : 'text-sm'
      } ${isHighContrast ? 'contrast-125 saturate-150' : ''}`}
    >
      {/* Top Header Navigation Bar */}
      <Navbar activeTab={activeTab} onNavigate={setActiveTab} />

      {/* Primary Tab Navigation */}
      <Navigation activeTab={activeTab} onNavigate={setActiveTab} />

      {/* Main View Container (Indexed Stack for state preservation) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-4 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full"
          >
            {/* Active Screen Rendering with preserved layout */}
            <div className={activeTab === 'dashboard' ? 'block' : 'hidden'}>
              <DashboardScreen onNavigate={setActiveTab} />
            </div>

            <div className={activeTab === 'tasks' ? 'block' : 'hidden'}>
              <TasksScreen />
            </div>

            <div className={activeTab === 'ai-planner' ? 'block' : 'hidden'}>
              <AIPlannerScreen />
            </div>

            <div className={activeTab === 'focus' ? 'block' : 'hidden'}>
              <FocusTimerScreen />
            </div>

            <div className={activeTab === 'gamification' ? 'block' : 'hidden'}>
              <GamificationScreen />
            </div>

            <div className={activeTab === 'analytics' ? 'block' : 'hidden'}>
              <AnalyticsScreen />
            </div>

            <div className={activeTab === 'settings' ? 'block' : 'hidden'}>
              <SettingsScreen onNavigate={setActiveTab} />
            </div>

            {activeTab === 'user-testing' && (
              <UserTestingScreen
                onBackToSettings={() => setActiveTab('settings')}
                onNavigateToDashboard={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'feedback-dashboard' && (
              <FeedbackDashboardScreen onBackToSettings={() => setActiveTab('settings')} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Notifications & Modals */}
      <XPToast toast={xpGainToast} />
      <LevelUpModal modal={levelUpModal} onClose={closeLevelUpModal} />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TaskProvider>
          <QuestProvider>
            <MainAppContent />
          </QuestProvider>
        </TaskProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
