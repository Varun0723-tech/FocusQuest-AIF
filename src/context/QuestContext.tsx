import React, { createContext, useContext, useState, useEffect } from 'react';
import { FocusSession, Quest } from '../models/types';
import { INITIAL_QUESTS } from '../utils/constants';
import { useAuth } from './AuthContext';
import { soundService } from '../services/soundService';

interface QuestContextType {
  quests: Quest[];
  focusSessions: FocusSession[];
  logFocusSession: (minutes: number, mode: FocusSession['mode'], taskId?: string, taskTitle?: string) => void;
  claimQuestReward: (questId: string) => void;
}

const LOCAL_STORAGE_QUESTS_KEY = 'focusquest_quests_v1';
const LOCAL_STORAGE_SESSIONS_KEY = 'focusquest_sessions_v1';

const QuestContext = createContext<QuestContextType | undefined>(undefined);

export const QuestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addXp, user, unlockBadge } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);

  useEffect(() => {
    try {
      const savedQuests = localStorage.getItem(LOCAL_STORAGE_QUESTS_KEY);
      const savedSessions = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
      setQuests(savedQuests ? JSON.parse(savedQuests) : INITIAL_QUESTS);
      setFocusSessions(savedSessions ? JSON.parse(savedSessions) : []);
    } catch {
      setQuests(INITIAL_QUESTS);
    }
  }, []);

  useEffect(() => {
    if (quests.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_QUESTS_KEY, JSON.stringify(quests));
    }
  }, [quests]);

  useEffect(() => {
    if (focusSessions.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(focusSessions));
    }
  }, [focusSessions]);

  const logFocusSession = (minutes: number, mode: FocusSession['mode'], taskId?: string, taskTitle?: string) => {
    const xpEarned = Math.max(10, Math.floor(minutes * 1.5));
    const newSession: FocusSession = {
      id: `sess_${Date.now()}`,
      userId: user?.id || 'guest',
      taskId,
      taskTitle,
      durationMinutes: minutes,
      completedAt: new Date().toISOString(),
      xpEarned,
      mode,
    };

    setFocusSessions((prev) => [newSession, ...prev]);
    addXp(xpEarned, `Focus Session (${minutes}m)`);
    soundService.playTimerComplete();

    // Unlock badges if thresholds met
    const totalMins = (user?.totalFocusMinutes || 0) + minutes;
    if (totalMins >= 60) unlockBadge('badge_focus_1hr');
    if (totalMins >= 300) unlockBadge('badge_focus_5hr');

    // Update daily quests
    setQuests((prev) =>
      prev.map((q) => {
        if (q.type === 'focus_time' && !q.completed) {
          const updatedCount = q.currentCount + minutes;
          return {
            ...q,
            currentCount: updatedCount,
            completed: updatedCount >= q.targetCount,
          };
        }
        return q;
      })
    );
  };

  const claimQuestReward = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId && !q.completed) {
          addXp(q.xpReward, `Quest Claimed: ${q.title}`);
          soundService.playLevelUp();
          return { ...q, completed: true };
        }
        return q;
      })
    );
  };

  return (
    <QuestContext.Provider
      value={{
        quests,
        focusSessions,
        logFocusSession,
        claimQuestReward,
      }}
    >
      {children}
    </QuestContext.Provider>
  );
};

export const useQuests = () => {
  const context = useContext(QuestContext);
  if (!context) throw new Error('useQuests must be used within QuestProvider');
  return context;
};
