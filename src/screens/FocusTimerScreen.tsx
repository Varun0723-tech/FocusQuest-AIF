import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Target,
  Sparkles,
  Brain,
  MessageCircle,
  Eye,
  Zap,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useQuests } from '../context/QuestContext';
import { useAuth } from '../context/AuthContext';
import { soundService } from '../services/soundService';
import { AIFocusCompanionModal } from '../widgets/AIFocusCompanionModal';
import { OverwhelmDetectorModal } from '../widgets/OverwhelmDetectorModal';
import { PostSessionReflectionModal } from '../widgets/PostSessionReflectionModal';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom';

const MODE_PRESETS: Record<TimerMode, { label: string; defaultMinutes: number }> = {
  pomodoro: { label: 'Focus Sprint', defaultMinutes: 25 },
  shortBreak: { label: 'Short Rest', defaultMinutes: 5 },
  longBreak: { label: 'Deep Rest', defaultMinutes: 15 },
  custom: { label: 'Deep Focus', defaultMinutes: 45 },
};

export const FocusTimerScreen: React.FC = () => {
  const { tasks } = useTasks();
  const { logFocusSession } = useQuests();
  const { user, updateUserPreferences } = useAuth();

  // Adaptive Focus Duration calculation
  const adaptiveMinutes = user?.preferences?.adaptiveFocusMinutes || 20;

  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [totalSeconds, setTotalSeconds] = useState(adaptiveMinutes * 60);
  const [secondsLeft, setSecondsLeft] = useState(adaptiveMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [ambientSound, setAmbientSound] = useState<'off' | 'rain' | 'forest' | 'waves'>('off');

  // Modals state
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);
  const [isOverwhelmOpen, setIsOverwhelmOpen] = useState(false);
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);

  // Quit / Reset Counter for Overwhelm Detector
  const [quitCount, setQuitCount] = useState(0);

  // Single Task Focus Mode toggle
  const [isSingleTaskFocus, setIsSingleTaskFocus] = useState(
    !!user?.preferences?.singleTaskFocusMode
  );

  // Ambient sound synthesizer using Web Audio API
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Update timer whenever adaptiveMinutes changes or mode changes
  useEffect(() => {
    if (!isRunning) {
      const mins = mode === 'pomodoro' ? adaptiveMinutes : MODE_PRESETS[mode].defaultMinutes;
      setTotalSeconds(mins * 60);
      setSecondsLeft(mins * 60);
    }
  }, [adaptiveMinutes, mode, isRunning]);

  // Handle Mode Change
  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    stopAmbientSound();
    setMode(newMode);
    const mins = newMode === 'pomodoro' ? adaptiveMinutes : MODE_PRESETS[newMode].defaultMinutes;
    setTotalSeconds(mins * 60);
    setSecondsLeft(mins * 60);
  };

  // Timer Tick Interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            stopAmbientSound();
            handleTimerFinished();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, totalSeconds, mode, selectedTaskId]);

  const handleTimerFinished = () => {
    const elapsedMins = Math.round(totalSeconds / 60);
    const selectedTask = tasks.find((t) => t.id === selectedTaskId);
    logFocusSession(elapsedMins, mode, selectedTaskId, selectedTask?.title);

    // Reward adaptive focus stability: increase adaptive focus minutes if successful
    if (adaptiveMinutes < 30) {
      updateUserPreferences({ adaptiveFocusMinutes: Math.min(30, adaptiveMinutes + 5) });
    }

    soundService.playLevelUp();
    setIsReflectionOpen(true);
  };

  const handleToggleTimer = () => {
    soundService.playClick();
    if (!isRunning && ambientSound !== 'off') {
      startAmbientSound(ambientSound);
    } else if (isRunning) {
      stopAmbientSound();
    }
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    soundService.playClick();

    // If timer was running for at least 15s before reset, register a friction event
    if (isRunning && totalSeconds - secondsLeft > 15) {
      const newQuit = quitCount + 1;
      setQuitCount(newQuit);

      // Trigger Overwhelm Detector if quit >= 2
      if (newQuit >= 2) {
        setIsOverwhelmOpen(true);

        // Reduce adaptive focus minutes to prevent frustration
        updateUserPreferences({
          adaptiveFocusMinutes: Math.max(10, adaptiveMinutes - 5),
          consecutiveQuits: (user?.preferences?.consecutiveQuits || 0) + 1,
        });
      }
    }

    setIsRunning(false);
    stopAmbientSound();
    setSecondsLeft(totalSeconds);
  };

  // Ambient Sound Web Audio Synth Implementation
  const startAmbientSound = (type: 'rain' | 'forest' | 'waves') => {
    stopAmbientSound();
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.866 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.04;
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = type === 'rain' ? 'lowpass' : type === 'waves' ? 'bandpass' : 'notch';
      filter.frequency.setValueAtTime(type === 'rain' ? 800 : 400, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
    } catch {
      // Audio fallback
    }
  };

  const stopAmbientSound = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  };

  const toggleSound = (sound: 'off' | 'rain' | 'forest' | 'waves') => {
    setAmbientSound(sound);
    if (sound === 'off') {
      stopAmbientSound();
    } else if (isRunning) {
      startAmbientSound(sound);
    }
  };

  const handleStartMicroTimer = (minutes: number) => {
    setIsRunning(false);
    stopAmbientSound();
    setMode('pomodoro');
    setTotalSeconds(minutes * 60);
    setSecondsLeft(minutes * 60);
    setIsRunning(true);
  };

  // Format MM:SS
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const progressRatio = totalSeconds > 0 ? secondsLeft / totalSeconds : 1;
  const strokeDashoffset = 565 * (1 - progressRatio);

  const pendingTasks = tasks.filter((t) => !t.completed);
  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="space-y-6 pb-28 pt-1 max-w-3xl mx-auto">
      {/* Header & Single-Task Mode Switch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-extrabold uppercase tracking-wide">
            <Timer className="w-3.5 h-3.5" /> Ambient Focus Chamber
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans'] mt-1">Focus Chamber</h1>
          <p className="text-xs text-slate-400">
            Adapts focus block duration dynamically to prevent cognitive burnout.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Companion Launcher Button */}
          <button
            onClick={() => setIsCompanionOpen(true)}
            className="py-2 px-3.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-violet-600/30 transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Companion</span>
          </button>

          {/* Single Task Focus Toggle */}
          <button
            onClick={() => {
              const nextVal = !isSingleTaskFocus;
              setIsSingleTaskFocus(nextVal);
              updateUserPreferences({ singleTaskFocusMode: nextVal });
            }}
            className={`py-2 px-3.5 rounded-full border text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              isSingleTaskFocus
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-[#111827] text-slate-400 border-white/10 hover:text-white'
            }`}
            title="Single Task Focus Mode: Hides extraneous controls to maximize concentration"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isSingleTaskFocus ? 'Single-Task ON' : 'Single-Task'}</span>
          </button>
        </div>
      </div>

      {/* Adaptive Focus Duration Banner */}
      {!isSingleTaskFocus && (
        <div className="p-3.5 rounded-2xl glass-card text-xs text-violet-200 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Brain className="w-4 h-4 text-amber-300" />
            <span>AI Adaptive Duration: <strong>{adaptiveMinutes} Minutes</strong></span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
            Scales automatically based on session completion momentum
          </span>
        </div>
      )}

      {/* Mode Presets Pill Switch */}
      {!isSingleTaskFocus && (
        <div className="grid grid-cols-4 p-1.5 bg-[#111827] rounded-full border border-white/10 gap-1 shadow-lg">
          {(Object.keys(MODE_PRESETS) as TimerMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleModeChange(m)}
              className={`py-2 rounded-full text-xs font-bold transition-all ${
                mode === m
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m === 'pomodoro' ? `${adaptiveMinutes}m Focus` : MODE_PRESETS[m].label}
            </button>
          ))}
        </div>
      )}

      {/* Main Timer Dial Card */}
      <div className="p-8 rounded-[32px] glass-card shadow-2xl text-center relative overflow-hidden flex flex-col items-center">
        {/* Selected Task Highlight Banner in Single Task Mode */}
        {selectedTask && (
          <div className="mb-4 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-200 text-xs font-extrabold flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-300" />
            <span>Target: {selectedTask.title}</span>
          </div>
        )}

        {/* SVG Radial Ring */}
        <div className="relative w-64 h-64 flex items-center justify-center my-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              className="text-slate-800/80"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              className="text-violet-500 transition-all duration-1000"
              strokeWidth="8"
              strokeDasharray="565"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="url(#timerGradient)"
              fill="transparent"
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-extrabold text-white tracking-wider font-mono">
              {timeStr}
            </span>
            <span className="text-[11px] font-extrabold text-violet-300/80 uppercase tracking-widest mt-2">
              {mode === 'pomodoro' ? `${adaptiveMinutes} Min Focus` : MODE_PRESETS[mode].label}
            </span>
          </div>
        </div>

        {/* Task Selection Linker */}
        {!isSingleTaskFocus && (
          <div className="w-full max-w-sm mb-6 space-y-1 text-left">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Target Task
            </label>
            <div className="relative">
              <Target className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500 transition-all"
              >
                <option value="">No Task Linked (General Focus)</option>
                {pendingTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.priority} Priority)
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Timer Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleResetTimer}
            className="p-3.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleToggleTimer}
            className={`btn-pill px-8 py-3.5 text-sm font-extrabold flex items-center gap-2 shadow-xl transition-all ${
              isRunning
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-500/20'
                : 'btn-primary-pill'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" /> Pause Session
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" /> Start Focus
              </>
            )}
          </button>
        </div>
      </div>

      {/* Ambient Sound Synthesizer Controls */}
      {!isSingleTaskFocus && (
        <div className="p-4 rounded-2xl glass-card space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-violet-400" /> Ambient Noise Synthesizer:
            </span>
            <span className="text-violet-300 font-mono text-[11px] uppercase">{ambientSound}</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {(['off', 'rain', 'forest', 'waves'] as const).map((snd) => (
              <button
                key={snd}
                type="button"
                onClick={() => toggleSound(snd)}
                className={`py-2 rounded-full text-xs font-bold transition-all capitalize ${
                  ambientSound === snd
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'bg-black/30 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {snd === 'off' ? 'Mute' : snd}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Modals */}
      <AIFocusCompanionModal
        isOpen={isCompanionOpen}
        onClose={() => setIsCompanionOpen(false)}
        activeTaskTitle={selectedTask?.title}
        onStartMicroTimer={handleStartMicroTimer}
      />

      <OverwhelmDetectorModal
        isOpen={isOverwhelmOpen}
        onClose={() => setIsOverwhelmOpen(false)}
        onEnableTinyStepMode={() => {
          handleStartMicroTimer(5);
          updateUserPreferences({ singleTaskFocusMode: true });
        }}
        taskTitle={selectedTask?.title}
      />

      <PostSessionReflectionModal
        isOpen={isReflectionOpen}
        onClose={() => setIsReflectionOpen(false)}
        taskTitle={selectedTask?.title}
      />
    </div>
  );
};

