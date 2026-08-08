import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface XPToastProps {
  toast: { show: boolean; amount: number; reason: string } | null;
}

export const XPToast: React.FC<XPToastProps> = ({ toast }) => {
  return (
    <AnimatePresence>
      {toast?.show && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-xl border border-purple-400/30 font-medium text-sm backdrop-blur-md"
        >
          <div className="w-6 h-6 rounded-full bg-yellow-400/20 text-yellow-300 flex items-center justify-center font-bold text-xs animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          </div>
          <span>
            <strong className="text-yellow-300 font-extrabold">+{toast.amount} XP</strong> — {toast.reason}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
