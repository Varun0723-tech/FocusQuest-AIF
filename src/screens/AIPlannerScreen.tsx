import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Bot,
  Clock,
  Plus,
  CheckCircle2,
  Lightbulb,
  Zap,
  ArrowRight,
  BookOpen,
  Code,
  Check,
  BrainCircuit,
  Footprints,
  Map,
  WandSparkles,
  Library,
  AlertCircle,
  RotateCcw,
  Compass,
  Wrench,
} from 'lucide-react';
import { generateAIPlan, generateCognitiveCoachPlan } from '../services/aiService';
import { AIPlanResponse, CognitiveCoachPlan, LearningStyle } from '../models/types';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { LearningStyleSelector } from '../widgets/LearningStyleSelector';
import { IconContainer } from '../widgets/IconContainer';
import { AIThinkingLoader } from '../widgets/AIThinkingLoader';

export const AIPlannerScreen: React.FC = () => {
  const { importAITasks, addTask } = useTasks();
  const { user, addXp, unlockBadge, updateUserPreferences } = useAuth();

  const [mode, setMode] = useState<'cognitive' | 'standard'>('cognitive');
  const [goal, setGoal] = useState('');
  const [timeAvailable, setTimeAvailable] = useState('30 minutes');
  const [focusArea, setFocusArea] = useState('Academics & Study');
  const [contextNotes, setContextNotes] = useState('');
  const [isTinyStepMode, setIsTinyStepMode] = useState(true);
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(
    user?.preferences?.learningStyle || 'Visual'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [generationError, setGenerationError] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error'; message: string } | null>(
    null
  );

  const [planResult, setPlanResult] = useState<AIPlanResponse | null>(null);
  const [coachResult, setCoachResult] = useState<CognitiveCoachPlan | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [imported, setImported] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const TEMPLATES = [
    {
      title: 'DBMS Assignment (Tiny Steps)',
      goal: 'Finish my DBMS assignment due tomorrow.',
      time: '30 minutes',
      focus: 'Academics & Study',
      icon: BookOpen,
      isCognitive: true,
    },
    {
      title: 'Final Exam Study Sprint',
      goal: 'Prepare for my upcoming Computer Science final exam on data structures & algorithms',
      time: '90 minutes',
      focus: 'Academics & Study',
      icon: BookOpen,
      isCognitive: false,
    },
    {
      title: 'Full-Stack Feature Build',
      goal: 'Build and deploy a REST API with error handling and unit tests',
      time: '120 minutes',
      focus: 'Software Engineering',
      icon: Code,
      isCognitive: false,
    },
  ];

  const handleGeneratePlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!goal.trim()) return;

    setIsLoading(true);
    setGenerationError(false);
    setImported(false);
    setActiveStepIndex(0);

    // Save learning style to user profile / Firestore
    if (updateUserPreferences) {
      updateUserPreferences({ learningStyle });
    }

    try {
      if (mode === 'cognitive') {
        const res = await generateCognitiveCoachPlan({
          goalTitle: goal.trim(),
          learningStyle,
          isTinyStepMode,
          timeBlock: timeAvailable,
          focusDomain: focusArea,
        });

        if (res && res.steps && Array.isArray(res.steps) && res.steps.length > 0) {
          setCoachResult(res);
          setPlanResult(null);
          showToast(`AI Quest Plan generated! Personalized for your ${learningStyle} learning style.`, 'success');
        } else {
          throw new Error('Received incomplete cognitive plan');
        }
      } else {
        const result = await generateAIPlan({
          goal: goal.trim(),
          timeAvailable,
          focusArea,
          contextNotes,
        });

        if (result && result.tasks && Array.isArray(result.tasks) && result.tasks.length > 0) {
          setPlanResult(result);
          setCoachResult(null);
          showToast('Standard Quest Blueprint generated successfully!', 'success');
        } else {
          throw new Error('Received incomplete AI plan');
        }
      }
      if (unlockBadge) {
        unlockBadge('badge_ai_strategist');
      }
    } catch (err) {
      console.error('Plan generation process failed:', err);
      setGenerationError(true);
      showToast('Unable to generate study plan. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportPlan = () => {
    if (planResult && !imported) {
      const formattedTasks = planResult.tasks.map((t) => ({
        title: t.title,
        description: t.description,
        priority: t.priority as Priority,
        estimatedMinutes: t.estimatedMinutes,
        tags: t.tags || [focusArea],
        subtasks: t.subtasks.map((st, i) => ({
          id: `sub_ai_${Date.now()}_${i}`,
          title: st,
          completed: false,
        })),
        xpReward: t.priority === 'High' ? 45 : t.priority === 'Medium' ? 30 : 20,
      }));

      importAITasks(formattedTasks);
      addXp(30, 'Generated AI Quest Plan');
      setImported(true);
      showToast('All tasks imported to Quests dashboard!', 'success');
    } else if (coachResult && !imported) {
      // Import cognitive steps
      coachResult.steps.forEach((step) => {
        addTask({
          title: step.title,
          description: `Cognitive Coach Step ${step.stepNumber} (${step.estimatedMinutes} mins) • ${
            step.learningStyleHint || ''
          }`,
          priority: 'High',
          estimatedMinutes: step.estimatedMinutes,
          tags: ['Cognitive Coach', focusArea, learningStyle],
          xpReward: 25,
          subtasks: [],
        });
      });
      addXp(40, 'Imported Cognitive Coach Steps');
      setImported(true);
      showToast('Cognitive steps saved to your active Quests!', 'success');
    }
  };

  const handleApplyTemplate = (tpl: (typeof TEMPLATES)[0]) => {
    setGoal(tpl.goal);
    setTimeAvailable(tpl.time);
    setFocusArea(tpl.focus);
    if (tpl.isCognitive) {
      setMode('cognitive');
      setIsTinyStepMode(true);
    }
  };

  const handleStepComplete = (index: number) => {
    if (!coachResult) return;
    const updatedSteps = [...coachResult.steps];
    updatedSteps[index].completed = true;
    setCoachResult({ ...coachResult, steps: updatedSteps });

    if (index + 1 < updatedSteps.length) {
      setActiveStepIndex(index + 1);
    }
    addXp(20, `Completed Step ${index + 1}`);
  };

  return (
    <div className="space-y-6 pb-24 pt-2">
      {/* Toast Alert Snackbar */}
      <AnimatePresence>
        {toast?.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs font-black backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 border border-purple-500/30 text-white shadow-xl flex items-center justify-between gap-4">
        <div className="relative z-10 space-y-2 flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <WandSparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Cognitive Coach & Learning Personalization</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">AI Quest Planner & ADHD Coach</h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Eliminate task initiation paralysis! Unlike standard checklists, the AI Cognitive Coach breaks intimidating tasks into tiny 2-5 minute steps tailored to your learning style.
          </p>
        </div>
        <IconContainer icon={BrainCircuit} color="purple" size="xl" glow={true} className="hidden sm:inline-flex shrink-0" />
      </div>

      {/* Blueprint Quick Launchers */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Quick Blueprints:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TEMPLATES.map((tpl, i) => {
            const Icon = tpl.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-white">{tpl.title}</h3>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">{tpl.goal}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main AI Generator Input Form */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/30 shadow-xl space-y-5">
        <form onSubmit={handleGeneratePlan} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              What assignment or task feels hard to start? *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Finish my DBMS assignment due tomorrow."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {/* Learning Style Personalization Widget */}
          <LearningStyleSelector
            selectedStyle={learningStyle}
            onChangeStyle={setLearningStyle}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Time Block Selector
              </label>
              <select
                value={timeAvailable}
                onChange={(e) => setTimeAvailable(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="15 minutes">15 Minutes (Micro Sprint)</option>
                <option value="30 minutes">30 Minutes (Quick Sprint)</option>
                <option value="60 minutes">60 Minutes (Standard Block)</option>
                <option value="90 minutes">90 Minutes (Deep Work)</option>
                <option value="120 minutes">120 Minutes (Full Intensive)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Focus Domain Selector
              </label>
              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="Academics & Study">Academics & Study</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Writing & Essays">Writing & Essays</option>
                <option value="Creative & Design">Creative & Design</option>
                <option value="General Productivity">General Productivity</option>
              </select>
            </div>
          </div>

          {mode === 'cognitive' && (
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IconContainer icon={Footprints} color="amber" size="sm" />
                <div>
                  <h4 className="text-xs font-bold text-white">Enable Tiny Step Mode</h4>
                  <p className="text-[11px] text-slate-400">
                    Focus only on the first 5 minutes to overcome task initiation paralysis
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTinyStepMode(!isTinyStepMode)}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                  isTinyStepMode ? 'bg-purple-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    isTinyStepMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isLoading || !goal.trim()}
              className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Formatting {learningStyle} Learning Plan...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-5 h-5 text-amber-300" />
                  <span>
                    {mode === 'cognitive' ? 'Deconstruct with AI Cognitive Coach' : 'Generate AI Quest Plan'} (+30 XP)
                  </span>
                </>
              )}
            </button>

            {generationError && (
              <button
                type="button"
                onClick={() => handleGeneratePlan()}
                className="py-4 px-4 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>Retry</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Loading State Animation */}
      {isLoading && <AIThinkingLoader />}

      {/* AI Cognitive Coach Output View */}
      <AnimatePresence>
        {coachResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-slate-900 border border-purple-500/40 shadow-2xl space-y-6"
          >
            {/* Prominent Learning Style Badge & Header */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/90 via-indigo-950/80 to-slate-950 border border-purple-500/40 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-xs font-black text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>AI Cognitive Coach Plan</span>
                </div>

                {/* Badge above generated plan */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/50 text-xs font-black shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Personalized for your {coachResult.learningStyleUsed || learningStyle} learning style</span>
                </div>
              </div>

              <p className="text-sm font-bold text-white leading-relaxed">
                "{coachResult.coachMessage}"
              </p>

              <div className="flex items-center gap-3 pt-1 text-xs text-slate-300 font-bold flex-wrap">
                <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700">
                  <Clock className="w-3.5 h-3.5 text-purple-400" /> Est: {coachResult.estimatedTime || timeAvailable}
                </span>
                <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700">
                  <Compass className="w-3.5 h-3.5 text-amber-400" /> Domain: {focusArea}
                </span>
              </div>
            </div>

            {/* Nova's AI Reasoning Block */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-purple-500/30 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-black text-purple-300">
                <BrainCircuit className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>🧠 Nova's Reasoning Engine</span>
              </div>
              <div className="text-xs text-slate-300 space-y-2 font-medium">
                <p className="text-slate-400 font-bold text-[11px]">Nova detected:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <span className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-300 text-[11px] font-extrabold flex items-center gap-1">
                    ✓ Focus Goal
                  </span>
                  <span className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-300 text-[11px] font-extrabold flex items-center gap-1">
                    ✓ Time Constraint
                  </span>
                  <span className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-300 text-[11px] font-extrabold flex items-center gap-1">
                    ✓ {coachResult.learningStyleUsed || learningStyle} Learner
                  </span>
                  <span className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-300 text-[11px] font-extrabold flex items-center gap-1">
                    ✓ {coachResult.estimatedTime || timeAvailable} Block
                  </span>
                </div>
                <p className="text-slate-400 font-bold text-[11px] pt-1">Therefore Nova:</p>
                <ul className="space-y-1 text-slate-200 font-semibold text-[11px]">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                    Split goal into micro-tasks designed for zero cognitive friction
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                    Added diagrams & interactive prompts tailored for {coachResult.learningStyleUsed || learningStyle} learning
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                    Prioritized highest-impact foundational concepts first
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                    Included a structured consolidation & review checkpoint
                  </li>
                </ul>
              </div>
            </div>

            {/* Motivation Section */}
            {coachResult.motivation && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-bold flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="leading-relaxed">{coachResult.motivation}</p>
              </div>
            )}

            {/* Micro-Steps (Task Initiation Support) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Tiny Steps ({coachResult.learningStyleUsed || learningStyle} Adaptive):
                </h3>

                <button
                  onClick={handleImportPlan}
                  disabled={imported}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow transition cursor-pointer"
                >
                  {imported ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{imported ? 'Imported to Quests' : 'Save All Steps'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {Array.isArray(coachResult.steps) &&
                  coachResult.steps.map((step, idx) => {
                    const isActive = activeStepIndex === idx;
                  const isDone = step.completed;

                  return (
                    <div
                      key={step.id || idx}
                      className={`p-5 rounded-2xl border transition-all ${
                        isDone
                          ? 'bg-emerald-950/20 border-emerald-500/40 opacity-70'
                          : isActive
                          ? 'bg-slate-950 border-purple-500 shadow-xl shadow-purple-950/50 scale-[1.01]'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleStepComplete(idx)}
                            className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 transition mt-0.5 cursor-pointer ${
                              isDone
                                ? 'bg-emerald-500 border-emerald-400 text-white'
                                : isActive
                                ? 'border-purple-400 text-purple-300 bg-purple-500/20'
                                : 'border-slate-700 text-slate-500'
                            }`}
                          >
                            {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : step.stepNumber}
                          </button>

                          <div className="space-y-1">
                            <h4
                              className={`text-sm font-extrabold ${
                                isDone
                                  ? 'line-through text-slate-400'
                                  : isActive
                                  ? 'text-white'
                                  : 'text-slate-300'
                              }`}
                            >
                              Step {step.stepNumber}: {step.title}
                            </h4>

                            {step.learningStyleHint && (
                              <p className="text-xs text-purple-300 font-semibold">
                                {step.learningStyleHint}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 gap-1">
                          <span className="text-[11px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            Est: {step.estimatedMinutes} mins
                          </span>

                          {isActive && !isDone && (
                            <button
                              onClick={() => handleStepComplete(idx)}
                              className="mt-2 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow flex items-center gap-1 transition cursor-pointer"
                            >
                              <span>Done, Continue</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommended Resources Block */}
            {coachResult.resources && coachResult.resources.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-blue-400" />
                  Recommended Resources & Tools ({coachResult.learningStyleUsed || learningStyle}):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {coachResult.resources.map((res, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                      <span>{res}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Tips Block */}
            {coachResult.learningTips && coachResult.learningTips.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  Actionable Learning Tips ({coachResult.learningStyleUsed || learningStyle}):
                </h4>
                <div className="space-y-1.5">
                  {coachResult.learningTips.map((tip, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Standard AI Plan Display Card */}
        {planResult && mode === 'standard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-slate-900 border border-purple-500/40 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white">{planResult.planTitle}</h2>
                <p className="text-xs text-slate-300 mt-1">{planResult.summary}</p>
              </div>

              <button
                onClick={handleImportPlan}
                disabled={imported}
                className="py-2.5 px-5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
              >
                {imported ? 'Imported' : 'Import All Tasks'}
              </button>
            </div>

            <div className="space-y-3">
              {Array.isArray(planResult.tasks) &&
                planResult.tasks.map((task, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <h4 className="text-sm font-bold text-white">{task.title}</h4>
                  <p className="text-xs text-slate-400">{task.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
