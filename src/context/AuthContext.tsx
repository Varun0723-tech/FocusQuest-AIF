import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../models/types';
import { INITIAL_USER } from '../utils/constants';
import { soundService } from '../services/soundService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signupWithEmail: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  addXp: (amount: number, reason?: string) => void;
  updateUserPreferences: (prefs: Partial<UserProfile['preferences']>) => void;
  unlockBadge: (badgeId: string) => void;
  levelUpModal: { show: boolean; level: number } | null;
  closeLevelUpModal: () => void;
  xpGainToast: { show: boolean; amount: number; reason: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'focusquest_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [levelUpModal, setLevelUpModal] = useState<{ show: boolean; level: number } | null>(null);
  const [xpGainToast, setXpGainToast] = useState<{ show: boolean; amount: number; reason: string } | null>(null);

  // Load user from localStorage or initialize
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(INITIAL_USER);
      }
    } catch {
      setUser(INITIAL_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
  }, [user]);

  const loginWithEmail = async (email: string, pass: string) => {
    if (!email || !pass) {
      return { success: false, error: 'Please fill in both email and password' };
    }
    // Simulate auth network response
    await new Promise((r) => setTimeout(r, 600));

    const loggedInUser: UserProfile = {
      ...INITIAL_USER,
      email,
      name: email.split('@')[0].replace('.', ' ') || 'Adventurer',
    };
    setUser(loggedInUser);
    soundService.playXpGain();
    return { success: true };
  };

  const signupWithEmail = async (name: string, email: string, pass: string) => {
    if (!name || !email || !pass) {
      return { success: false, error: 'Please complete all required fields' };
    }
    await new Promise((r) => setTimeout(r, 600));

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name,
      email,
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      totalFocusMinutes: 0,
      tasksCompletedCount: 0,
      unlockedBadges: ['badge_first_quest'],
      preferences: {
        theme: 'dark',
        highContrast: false,
        soundEnabled: true,
        autoStartBreaks: false,
      },
    };
    setUser(newUser);
    soundService.playLevelUp();
    return { success: true };
  };

  const loginWithGoogle = async () => {
    await new Promise((r) => setTimeout(r, 800));
    const googleUser: UserProfile = {
      ...INITIAL_USER,
      name: 'Google Explorer',
      email: 'user.google@focusquest.ai',
    };
    setUser(googleUser);
    soundService.playXpGain();
  };

  const forgotPassword = async (email: string) => {
    await new Promise((r) => setTimeout(r, 500));
    return {
      success: true,
      message: `Password reset link has been dispatched to ${email}. Check your inbox!`,
    };
  };

  const logout = () => {
    setUser(null);
  };

  const addXp = (amount: number, reason: string = 'Quest Completed') => {
    if (!user) return;

    soundService.playXpGain();
    setXpGainToast({ show: true, amount, reason });
    setTimeout(() => {
      setXpGainToast(null);
    }, 2800);

    let newXp = user.xp + amount;
    let newLevel = user.level;
    let newXpToNext = user.xpToNextLevel;
    let didLevelUp = false;

    while (newXp >= newXpToNext) {
      newXp -= newXpToNext;
      newLevel += 1;
      newXpToNext = newLevel * 100;
      didLevelUp = true;
    }

    if (didLevelUp) {
      setTimeout(() => {
        soundService.playLevelUp();
        setLevelUpModal({ show: true, level: newLevel });
      }, 400);
    }

    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        xpToNextLevel: newXpToNext,
      };
    });
  };

  const updateUserPreferences = (prefs: Partial<UserProfile['preferences']>) => {
    if (!user) return;
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          ...prefs,
        },
      };
    });
  };

  const unlockBadge = (badgeId: string) => {
    if (!user) return;
    if (user.unlockedBadges.includes(badgeId)) return;

    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        unlockedBadges: [...prev.unlockedBadges, badgeId],
      };
    });
    soundService.playLevelUp();
  };

  const closeLevelUpModal = () => {
    setLevelUpModal(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        forgotPassword,
        logout,
        addXp,
        updateUserPreferences,
        unlockBadge,
        levelUpModal,
        closeLevelUpModal,
        xpGainToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
