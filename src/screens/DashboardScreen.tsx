import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Flame,
  Trophy,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  ArrowRight,
  Zap,
  Target,
  Timer,
  ChevronRight,
  TrendingUp,
  MessageCircle,
  BrainCircuit,
  GraduationCap,
  ClipboardCheck,
  Sun,
  Moon,
  CloudSun,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useQuests } from '../context/QuestContext';
import { AddTaskModal } from '../widgets/AddTaskModal';
import { ADHDModeToggle } from '../widgets/ADHDModeToggle';
import { AIFocusCompanionModal } from '../widgets/AIFocusCompanionModal';
import { IconContainer } from '../widgets/IconContainer';
import { NovaAvatar } from '../widgets/NovaAvatar';
import { KnowledgeGalaxy } from '../widgets/KnowledgeGalaxy';
import { DynamicQuestGraph } from '../widgets/DynamicQuestGraph';
import { LearningDNA } from '../widgets/LearningDNA';
import { QuestTimeline } from '../widgets/QuestTimeline';

interface DashboardScreenProps {
  onNavigate: (tab: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { tasks, toggleTaskComplete, toggleSubtask } = useTasks();
  const { quests, claimQuestReward } = useQuests();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);

  if (!user) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(
    (t) => !t.completed || (t.completedAt && t.completedAt.startsWith(todayStr))
  );
  const pendingCount = todayTasks.filter((t) => !t.completed).length;
  const completedCount = todayTasks.filter((t) => t.completed).length;

  const xpProgressPercent = Math.min(
    100,
    Math.round((user.xp / user.xpToNextLevel) * 100)
  );

  const currentHour = new Date().getHours();
  const timeGreeting =
    currentHour < 12
      ? { text: 'Good Morning', icon: Sun, color: 'text-amber-300' }
      : currentHour < 18
      ? { text: 'Good Afternoon', icon: CloudSun, color: 'text-orange-300' }
      : { text: 'Good Evening', icon: Moon, color: 'text-indigo-300' };

  const streak = user.streak || 1;
  const encouragementMsg =
    streak > 1
      ? `Outstanding momentum! You're on a ${streak}-day streak. Complete 1 focus block to keep your streak glowing!`
      : `Welcome to your cognitive space! Complete 1 quest task today to launch your daily streak.`;

  return (
    <div className="space-y-6 pb-28 pt-1">
      {/* Top Header Controls Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <ADHDModeToggle />

          <button
            onClick={() => setIsCompanionOpen(true)}
            className="py-2 px-4 rounded-full bg-violet-500/10 hover:bg-violet-500/20 text-violet-200 border border-violet-500/30 font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Focus Companion</span>
          </button>
        </div>

        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 bg-[#111827] px-3.5 py-1.5 rounded-full border border-white/10 shadow-sm">
          <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
          <span>Style: <strong className="text-violet-200 font-semibold">{user.preferences?.learningStyle || 'Visual'}</strong></span>
        </span>
      </div>

      {/* Hero Welcome Card with Nova AI Orb */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-950/80 via-[#111827] to-indigo-950/90 p-6 md:p-8 border border-purple-500/30 shadow-2xl text-white">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-extrabold tracking-wide uppercase">
              <timeGreeting.icon className={`w-3.5 h-3.5 ${timeGreeting.color}`} />
              <span>{timeGreeting.text}, {user.name}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans']">
              FocusQuest AI Cognitive OS
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
              {pendingCount > 0
                ? `Nova detected ${pendingCount} active quest ${pendingCount === 1 ? 'task' : 'tasks'} today. Let's start with a 5-minute micro task!`
                : `All daily quests conquered! Nova has optimized your cognitive memory graph.`}
            </p>
          </div>

          {/* Glowing Nova AI Orb Hero Avatar */}
          <div className="flex items-center justify-center shrink-0 p-2">
            <NovaAvatar size="hero" interactive={true} showSubtitle={true} />
          </div>
        </div>
      </section>

      {/* Encouragement Engine Banner */}
      <section className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-violet-500/10 to-indigo-500/10 border border-amber-500/20 text-amber-200 text-xs font-bold flex items-center gap-3 shadow-sm">
        <IconContainer icon={Sparkles} color="amber" size="sm" />
        <div className="flex-1 font-medium">{encouragementMsg}</div>
        <button
          onClick={() => onNavigate('focus')}
          className="btn-pill px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shrink-0 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
        >
          Start Session
        </button>
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Streak Card */}
        <div
          onClick={() => onNavigate('gamification')}
          className="glass-card-interactive p-4 rounded-2xl cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Streak</span>
            <IconContainer icon={Flame} color="amber" size="sm" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">{user.streak} <span className="text-xs font-semibold text-amber-400">Days</span></div>
            <p className="text-[11px] text-slate-400 mt-1">Active focus flame</p>
          </div>
        </div>

        {/* Total Focus Time */}
        <div
          onClick={() => onNavigate('focus')}
          className="glass-card-interactive p-4 rounded-2xl cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Focus Time</span>
            <IconContainer icon={Timer} color="blue" size="sm" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">{user.totalFocusMinutes} <span className="text-xs font-semibold text-blue-400">Min</span></div>
            <p className="text-[11px] text-slate-400 mt-1">Pomodoro logged</p>
          </div>
        </div>

        {/* Quests Done */}
        <div
          onClick={() => onNavigate('tasks')}
          className="glass-card-interactive p-4 rounded-2xl cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Completed</span>
            <IconContainer icon={ClipboardCheck} color="emerald" size="sm" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">{completedCount} <span className="text-xs font-semibold text-emerald-400">Tasks</span></div>
            <p className="text-[11px] text-slate-400 mt-1">Today's completions</p>
          </div>
        </div>

        {/* AI Generator Quick Launch */}
        <div
          onClick={() => onNavigate('ai-planner')}
          className="glass-card-interactive p-4 rounded-2xl cursor-pointer group bg-gradient-to-br from-violet-950/40 to-indigo-950/40 border-violet-500/30 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-violet-300 uppercase tracking-wider">AI Coach</span>
            <IconContainer icon={BrainCircuit} color="purple" size="sm" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center justify-between">
              <span>Tiny Step Deconstruct</span>
              <ChevronRight className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-[11px] text-violet-300/70 mt-1">Break down tasks</p>
          </div>
        </div>
      </section>

      {/* Quick Actions Shortcuts */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onNavigate('focus')}
          className="glass-card-interactive p-4 rounded-2xl text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <IconContainer icon={Timer} color="blue" size="md" />
            <div>
              <h3 className="text-xs font-bold text-white">Start Focus Session</h3>
              <p className="text-[11px] text-slate-400">Adaptive Pomodoro Timer</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
        </button>

        <button
          onClick={() => onNavigate('ai-planner')}
          className="glass-card-interactive p-4 rounded-2xl text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <IconContainer icon={BrainCircuit} color="purple" size="md" />
            <div>
              <h3 className="text-xs font-bold text-white">AI Step Deconstructor</h3>
              <p className="text-[11px] text-slate-400">ADHD & Dyslexia friendly steps</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition" />
        </button>

        <button
          onClick={() => setIsAddTaskModalOpen(true)}
          className="btn-pill p-4 rounded-2xl bg-gradient-to-r from-violet-600/30 to-blue-600/30 border border-violet-500/30 hover:border-violet-400 text-left transition flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <IconContainer icon={Plus} color="violet" size="md" />
            <div>
              <h3 className="text-xs font-bold text-white">New Task Quest</h3>
              <p className="text-[11px] text-slate-300">Add custom task</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-violet-400 transition" />
        </button>
      </section>

      {/* AI Knowledge Galaxy Constellation Map */}
      <section>
        <KnowledgeGalaxy onSelectNode={() => onNavigate('ai-planner')} compact={false} />
      </section>

      {/* Grid: AI Learning DNA & Game Quest Timeline */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LearningDNA />
        <QuestTimeline onStartQuest={() => onNavigate('focus')} />
      </section>

      {/* Main Grid: Today's Tasks & Daily Quests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks List (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-violet-500/20 text-violet-400">
                <Target className="w-4 h-4" />
              </div>
              <h2 className="text-base font-extrabold text-white font-['Plus_Jakarta_Sans']">Today's Quest Tasks</h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                {todayTasks.length}
              </span>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayTasks.length === 0 ? (
            <div className="p-8 rounded-[24px] glass-card text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">No Quest Tasks For Today</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create a task manually or generate an automated study/work plan with AI.
              </p>
              <button
                onClick={() => setIsAddTaskModalOpen(true)}
                className="btn-primary-pill px-4 py-2 text-xs font-bold transition inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create Task
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl border transition-all ${
                    task.completed
                      ? 'bg-[#111827]/40 border-white/5 opacity-60'
                      : 'glass-card-interactive hover:border-violet-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className={`mt-0.5 p-1 rounded-full transition ${
                          task.completed
                            ? 'text-emerald-400 hover:text-emerald-300'
                            : 'text-slate-500 hover:text-violet-400'
                        }`}
                        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 fill-emerald-400/20" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={`text-xs md:text-sm font-bold truncate ${
                              task.completed ? 'line-through text-slate-500' : 'text-white'
                            }`}
                          >
                            {task.title}
                          </h3>

                          {/* Priority Badge */}
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                              task.priority === 'High'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : task.priority === 'Medium'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {task.priority}
                          </span>

                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                            +{task.xpReward} XP
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-400 line-clamp-1">{task.description}</p>
                        )}

                        {/* Subtasks Progress */}
                        {task.subtasks.length > 0 && (
                          <div className="pt-2 space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                              <span>
                                Subtasks ({task.subtasks.filter((s) => s.completed).length}/
                                {task.subtasks.length})
                              </span>
                            </div>
                            <div className="space-y-1">
                              {task.subtasks.map((st) => (
                                <button
                                  key={st.id}
                                  onClick={() => toggleSubtask(task.id, st.id)}
                                  className="w-full text-left flex items-center gap-2 text-xs py-1 px-2.5 rounded-xl bg-black/30 hover:bg-white/[0.06] text-slate-300 transition"
                                >
                                  <span
                                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${
                                      st.completed
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : 'border-slate-600'
                                    }`}
                                  >
                                    {st.completed && '✓'}
                                  </span>
                                  <span className={st.completed ? 'line-through text-slate-500' : ''}>
                                    {st.title}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Estimated time */}
                    {task.estimatedMinutes && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0 bg-black/40 px-2.5 py-1 rounded-full border border-white/10 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{task.estimatedMinutes}m</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar: Daily Quests & Adventurer Status */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-white font-['Plus_Jakarta_Sans']">Daily Quests</h2>
          </div>

          <div className="space-y-3">
            {quests.map((q) => {
              const progressPct = Math.min(100, Math.round((q.currentCount / q.targetCount) * 100));
              const canClaim = q.currentCount >= q.targetCount && !q.completed;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    q.completed
                      ? 'bg-[#111827]/40 border-white/5 opacity-60'
                      : canClaim
                      ? 'bg-gradient-to-br from-amber-500/10 to-violet-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'glass-card'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-xs font-bold text-white">{q.title}</h3>
                    <span className="text-[9px] font-extrabold text-amber-300 px-2 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/20">
                      +{q.xpReward} XP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2.5">{q.description}</p>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold font-mono">
                      <span>
                        Progress: {q.currentCount} / {q.targetCount}
                      </span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {canClaim && (
                    <button
                      onClick={() => claimQuestReward(q.id)}
                      className="mt-3 w-full py-1.5 px-3 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all animate-bounce"
                    >
                      <Trophy className="w-3.5 h-3.5" /> Claim Reward (+{q.xpReward} XP)
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Motivational Widget */}
          <div className="p-4 rounded-2xl glass-card text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-violet-400 font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>Cognitive Insight</span>
            </div>
            <p className="italic text-slate-400 text-[11px] leading-relaxed">
              "Great focus velocity is built on small, consistent focus blocks. Log 25 minutes of focused work today to build momentum."
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Quest Graph Section */}
      <section>
        <DynamicQuestGraph />
      </section>

      {/* Floating Action Button (FAB) to Add Task */}
      <button
        onClick={() => setIsAddTaskModalOpen(true)}
        className="fixed bottom-20 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white shadow-2xl shadow-violet-600/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
        aria-label="Add Task"
        title="Create New Task"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
      />

      {/* AI Focus Companion Modal */}
      <AIFocusCompanionModal
        isOpen={isCompanionOpen}
        onClose={() => setIsCompanionOpen(false)}
        onStartMicroTimer={() => onNavigate('focus')}
      />
    </div>
  );
};

