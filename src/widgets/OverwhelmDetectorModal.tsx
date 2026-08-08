import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Sparkles, Check, X, ArrowRight, Heart } from 'lucide-react';

interface OverwhelmDetectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnableTinyStepMode: () => void;
  taskTitle?: string;
}

export const OverwhelmDetectorModal: React.FC<OverwhelmDetectorModalProps> = ({
  isOpen,
  onClose,
  onEnableTinyStepMode,
  taskTitle,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md p-6 bg-slate-900 border border-purple-500/40 rounded-3xl shadow-2xl space-y-5 text-center"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-amber-400 animate-bounce" />
          </div>

          <div className="space-y-2">
            <span className="inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              AI Overwhelm Detector
            </span>
            <h2 className="text-xl font-black text-white">Looks like today's task feels difficult</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              I noticed you stopped or restarted the focus timer a few times for{' '}
              <strong className="text-purple-300">"{taskTitle || 'this assignment'}"</strong>. That is a clear sign of task friction or cognitive overload.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-500/30 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Heart className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Let's lower the friction!</span>
            </div>
            <p className="text-xs text-purple-200">
              Switch to <strong>Tiny Step Mode</strong>: The AI will break this task into a 5-minute micro-action. No pressure, zero overwhelm.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={() => {
                onEnableTinyStepMode();
                onClose();
              }}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-extrabold text-xs shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition"
            >
              <span>Yes, Enable Tiny Step Mode</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-400 font-bold text-xs transition border border-slate-800"
            >
              No thanks, keep current timer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
