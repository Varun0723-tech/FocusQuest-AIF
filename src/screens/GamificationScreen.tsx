import React from 'react';
import { motion } from 'motion/react';
import {
  Trophy,
  Sparkles,
  Flame,
  Zap,
  Lock,
  CheckCircle2,
  Clock,
  Award,
  Crown,
  BrainCircuit,
  Bot,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQuests } from '../context/QuestContext';
import { ALL_BADGES } from '../utils/constants';

export const GamificationScreen: React.FC = () => {
  const { user } = useAuth();
  const { quests, claimQuestReward } = useQuests();

  if (!user) return null;

  const xpProgressPercent = Math.min(
    100,
    Math.round((user.xp / user.xpToNextLevel) * 100)
  );

  const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
    Sparkles,
    Flame,
    Zap,
    Clock,
    BrainCircuit,
    Bot,
    Trophy,
  };

  const MOCK_LEADERBOARD = [
    { rank: 1, name: 'Aria Vance (You)', level: user.level, xp: user.xp + (user.level - 1) * 300, avatar: user.avatarUrl },
    { rank: 2, name: 'Elena Rostova', level: 6, xp: 1840, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120' },
    { rank: 3, name: 'Kaelen Thorne', level: 5, xp: 1420, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120' },
    { rank: 4, name: 'Marcus Chen', level: 4, xp: 980, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120' },
  ];

  return (
    <div className="space-y-6 pb-24 pt-2">
      {/* Hero Level Roadmap Banner */}
      <section className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 border border-purple-500/30 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-500 p-0.5 shadow-lg shadow-purple-600/30">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-yellow-400">
                <Trophy className="w-7 h-7" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black">Level {user.level} Adventurer</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-extrabold border border-amber-500/30 flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-amber-400" /> {user.streak} Day Streak
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {user.xp} / {user.xpToNextLevel} XP earned toward Level {user.level + 1}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-400 rounded-full transition-all duration-700"
              style={{ width: `${xpProgressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>Level {user.level}</span>
            <span className="text-purple-300 font-bold">{xpProgressPercent}% Complete</span>
            <span>Level {user.level + 1}</span>
          </div>
        </div>
      </section>

      {/* Grid: Daily Quests & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Quest Log */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-extrabold text-white">Active Daily Quests</h2>
          </div>

          <div className="space-y-3">
            {quests.map((q) => {
              const progressPct = Math.min(100, Math.round((q.currentCount / q.targetCount) * 100));
              const canClaim = q.currentCount >= q.targetCount && !q.completed;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition ${
                    q.completed
                      ? 'bg-slate-950/50 border-slate-850 opacity-60'
                      : canClaim
                      ? 'bg-slate-900 border-amber-500/50 shadow-md shadow-amber-500/10'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-white">{q.title}</h3>
                    <span className="text-xs font-bold text-amber-400 px-2.5 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/30">
                      +{q.xpReward} XP
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{q.description}</p>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                      <span>
                        Progress: {q.currentCount} / {q.targetCount}
                      </span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {canClaim && (
                    <button
                      onClick={() => claimQuestReward(q.id)}
                      className="mt-3 w-full py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-md flex items-center justify-center gap-1.5 transition animate-bounce"
                    >
                      <Trophy className="w-4 h-4" /> Claim Quest XP (+{q.xpReward} XP)
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Showcase */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <Crown className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-extrabold text-white">Global Leaderboard</h2>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            {MOCK_LEADERBOARD.map((lb) => (
              <div
                key={lb.rank}
                className={`flex items-center justify-between p-2.5 rounded-xl border ${
                  lb.rank === 1
                    ? 'bg-purple-950/40 border-purple-500/40'
                    : 'bg-slate-950/60 border-slate-850'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center ${
                      lb.rank === 1
                        ? 'bg-yellow-400 text-slate-950'
                        : lb.rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : lb.rank === 3
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {lb.rank}
                  </span>
                  <div className="text-xs font-bold text-white">{lb.name}</div>
                </div>

                <div className="text-right text-xs">
                  <div className="font-extrabold text-purple-300">LVL {lb.level}</div>
                  <div className="text-[10px] text-slate-400">{lb.xp} XP</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badges Showcase Grid */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-extrabold text-white">Unlocked Badges & Achievements</h2>
          </div>
          <span className="text-xs font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
            {user.unlockedBadges.length} / {ALL_BADGES.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {ALL_BADGES.map((b) => {
            const isUnlocked = user.unlockedBadges.includes(b.id);
            const IconComponent = ICON_MAP[b.iconName] || Trophy;

            return (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border text-center space-y-2 transition ${
                  isUnlocked
                    ? 'bg-slate-900 border-purple-500/40 shadow-lg shadow-purple-500/10'
                    : 'bg-slate-950/40 border-slate-850 opacity-50 grayscale'
                }`}
              >
                <div
                  className={`mx-auto w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isUnlocked
                      ? 'bg-gradient-to-tr from-purple-600 to-blue-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isUnlocked ? <IconComponent className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                </div>

                <div>
                  <h3 className="text-xs font-bold text-white">{b.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{b.description}</p>
                </div>

                <div className="pt-1">
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                      isUnlocked
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isUnlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
