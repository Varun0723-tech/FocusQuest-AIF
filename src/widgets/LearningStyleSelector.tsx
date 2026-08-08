import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, Eye, Headphones, BookOpen, Hand, CheckCircle2, Check } from 'lucide-react';
import { LearningStyle } from '../models/types';
import { useAuth } from '../context/AuthContext';
import { IconContainer, IconColorTheme } from './IconContainer';

interface LearningStyleSelectorProps {
  selectedStyle?: LearningStyle;
  onChangeStyle?: (style: LearningStyle) => void;
  compact?: boolean;
}

export const LearningStyleSelector: React.FC<LearningStyleSelectorProps> = ({
  selectedStyle,
  onChangeStyle,
  compact = false,
}) => {
  const { user, updateUserPreferences } = useAuth();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentStyle: LearningStyle = selectedStyle || user?.preferences?.learningStyle || 'Visual';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const handleSelect = (style: LearningStyle) => {
    if (onChangeStyle) onChangeStyle(style);
    updateUserPreferences({ learningStyle: style });
    showToast('Learning style preference updated.');
  };

  const STYLES: {
    id: LearningStyle;
    title: string;
    desc: string;
    icon: typeof Eye;
    colorTheme: IconColorTheme;
  }[] = [
    {
      id: 'Visual',
      title: 'Visual',
      desc: 'Flowcharts, mind maps, color coding & diagrams',
      icon: Eye,
      colorTheme: 'purple',
    },
    {
      id: 'Auditory',
      title: 'Auditory',
      desc: 'Discussions, explanations, teach aloud & voice learning',
      icon: Headphones,
      colorTheme: 'blue',
    },
    {
      id: 'Reading',
      title: 'Reading / Writing',
      desc: 'Bullet summaries, text outlines, notes & flashcards',
      icon: BookOpen,
      colorTheme: 'amber',
    },
    {
      id: 'Kinesthetic',
      title: 'Kinesthetic',
      desc: 'Interactive exercises, practice questions & mini projects',
      icon: Hand,
      colorTheme: 'emerald',
    },
  ];

  if (compact) {
    return (
      <div className="relative">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-purple-400" /> Learning Style:
          </span>
          {STYLES.map((st) => {
            const isSelected = currentStyle === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => handleSelect(st.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
                <span>{st.title}</span>
              </button>
            );
          })}
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -top-9 left-0 z-50 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] shadow-lg flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-3 relative">
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold text-white flex items-center gap-2">
          <IconContainer icon={GraduationCap} color="purple" size="sm" glow={true} />
          <span>AI Learning Style Personalization</span>
        </label>
        <span className="text-[10px] text-purple-300 font-bold bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
          Personalized AI Prompt Adaptation
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STYLES.map((st) => {
          const Icon = st.icon;
          const isSelected = currentStyle === st.id;
          return (
            <motion.button
              key={st.id}
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              animate={{
                scale: isSelected ? 1.02 : 1,
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              onClick={() => handleSelect(st.id)}
              className={`p-4 rounded-2xl border text-left transition-all relative flex items-center gap-3.5 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-br from-purple-950/90 via-indigo-950/80 to-slate-950 border-purple-500 shadow-xl shadow-purple-900/40 ring-2 ring-purple-500/80'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              {/* Checkmark Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 p-1 rounded-full bg-purple-500 text-white shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              )}

              <IconContainer
                icon={Icon}
                color={st.colorTheme}
                size="md"
                glow={isSelected}
                active={isSelected}
              />

              <div className="pr-6 flex-1 min-w-0">
                <h4
                  className={`text-xs font-black ${
                    isSelected ? 'text-white' : 'text-slate-200'
                  }`}
                >
                  {st.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{st.desc}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Floating Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="fixed bottom-20 right-6 z-50 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-2 border border-emerald-300"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
