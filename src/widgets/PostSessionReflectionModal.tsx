import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, Check, Send, ThumbsUp, VolumeX, Layers, HelpCircle, BatteryLow } from 'lucide-react';
import { PostSessionReflection } from '../models/types';
import { useAuth } from '../context/AuthContext';

interface PostSessionReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle?: string;
  sessionId?: string;
  onSaveReflection?: (reflection: PostSessionReflection) => void;
}

export const PostSessionReflectionModal: React.FC<PostSessionReflectionModalProps> = ({
  isOpen,
  onClose,
  taskTitle,
  sessionId = `session_${Date.now()}`,
  onSaveReflection,
}) => {
  const { addXp } = useAuth();
  const [selectedReason, setSelectedReason] = useState<
    'Too noisy' | 'Task too large' | "Didn't understand" | 'Tired' | 'Felt smooth'
  >('Felt smooth');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const REASON_OPTIONS = [
    { label: 'Felt smooth', icon: ThumbsUp, color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' },
    { label: 'Too noisy', icon: VolumeX, color: 'text-amber-400 bg-amber-500/20 border-amber-500/30' },
    { label: 'Task too large', icon: Layers, color: 'text-purple-400 bg-purple-500/20 border-purple-500/30' },
    { label: "Didn't understand", icon: HelpCircle, color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' },
    { label: 'Tired', icon: BatteryLow, color: 'text-rose-400 bg-rose-500/20 border-rose-500/30' },
  ] as const;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRef: PostSessionReflection = {
      id: `ref_${Date.now()}`,
      sessionId,
      taskTitle: taskTitle || 'General Focus Session',
      difficultyReason: selectedReason,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('focusquest_reflections_v1') || '[]');
      localStorage.setItem('focusquest_reflections_v1', JSON.stringify([newRef, ...existing]));
    } catch (err) {
      console.warn('Error saving reflection', err);
    }

    if (onSaveReflection) onSaveReflection(newRef);
    addXp(15, 'Completed Session Reflection');
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md p-6 bg-slate-900 border border-purple-500/30 rounded-3xl shadow-2xl space-y-5"
        >
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">Reflection Saved! (+15 XP)</h3>
              <p className="text-xs text-slate-400">
                FocusQuest AI will adjust future study lengths based on your feedback.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">AI Session Reflection</h3>
                  <p className="text-xs text-slate-400">What made studying easy or difficult?</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Select how this session felt:
                </label>

                <div className="grid grid-cols-1 gap-2">
                  {REASON_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedReason === opt.label;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setSelectedReason(opt.label)}
                        className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-purple-600/30 border-purple-500 text-white shadow-lg'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className={`p-1.5 rounded-xl border ${opt.color}`}>
                            <Icon className="w-4 h-4" />
                          </span>
                          <span>{opt.label}</span>
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Optional notes for AI Coach:
                </label>
                <input
                  type="text"
                  placeholder="e.g., Struggled on question 3, needed more examples"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 text-xs font-bold transition border border-slate-800"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Save & Learn
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
