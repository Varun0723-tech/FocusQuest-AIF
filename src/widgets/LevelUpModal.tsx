import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Sparkles, X, ArrowRight } from 'lucide-react';

interface LevelUpModalProps {
  modal: { show: boolean; level: number } | null;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ modal, onClose }) => {
  return (
    <AnimatePresence>
      {modal?.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-purple-500/40 p-6 text-center text-white shadow-2xl overflow-hidden"
          >
            {/* Background glowing orb */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 p-0.5 shadow-lg shadow-purple-500/30 mb-4 flex items-center justify-center animate-bounce">
              <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
                <Trophy className="w-10 h-10 text-yellow-400" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-2 border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5" /> LEVEL UP UNLOCKED
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Level <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{modal.level}</span> Reached!
            </h2>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              You are forging new mental mastery! Your focused quests have elevated your quest attributes and productivity stats.
            </p>

            <div className="mt-6 p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-left text-xs space-y-1.5 text-slate-300">
              <div className="flex justify-between font-medium">
                <span>Focus Capacity Bonus</span>
                <span className="text-emerald-400 font-bold">+10% XP</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>New Badge Category</span>
                <span className="text-indigo-300 font-bold">Unlocked</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition"
            >
              Continue Quest <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
