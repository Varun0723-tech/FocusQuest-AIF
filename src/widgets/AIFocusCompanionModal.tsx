import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageCircle, Send, X, Heart, Shield, Play, Clock, CheckCircle2, Volume2 } from 'lucide-react';
import { sendCompanionMessage } from '../services/aiService';
import { useAuth } from '../context/AuthContext';

interface AIFocusCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTaskTitle?: string;
  onStartMicroTimer?: (minutes: number) => void;
}

export const AIFocusCompanionModal: React.FC<AIFocusCompanionModalProps> = ({
  isOpen,
  onClose,
  activeTaskTitle,
  onStartMicroTimer,
}) => {
  const { user } = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<
    { sender: 'user' | 'companion'; text: string; microStep?: string; minutes?: number }[]
  >([
    {
      sender: 'companion',
      text: `Hi ${user?.name || 'there'}! I'm your AI Focus Companion. Having trouble starting or feeling stuck with "${
        activeTaskTitle || 'your assignment'
      }"? Tell me what's on your mind.`,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage.trim();
    if (!textToSend) return;

    setInputMessage('');
    setMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    setIsTyping(true);

    try {
      const res = await sendCompanionMessage({
        userMessage: textToSend,
        taskTitle: activeTaskTitle,
        currentMinutes: user?.totalFocusMinutes || 0,
        streak: user?.streak || 0,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: 'companion',
          text: res.reply,
          microStep: res.suggestedMicroStep,
          minutes: res.suggestedMinutes || 2,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'companion',
          text: "That is completely valid! Let's lower the bar: spend 2 minutes opening your work. You can do anything for 2 minutes!",
          microStep: 'Open notebook workspace',
          minutes: 2,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-slate-900 border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[520px]"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-slate-900 border-b border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  AI Focus Companion
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ADHD Coach
                  </span>
                </h3>
                <p className="text-[11px] text-slate-300">Empathetic task initiation support</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Empathetic Prompts */}
          <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => handleSend("I'm scared to start.")}
              className="shrink-0 px-3 py-1 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold transition"
            >
              "I'm scared to start."
            </button>
            <button
              onClick={() => handleSend("This task is too huge.")}
              className="shrink-0 px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold transition"
            >
              "This task is too huge."
            </button>
            <button
              onClick={() => handleSend("I have zero focus today.")}
              className="shrink-0 px-3 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold transition"
            >
              "I have zero focus today."
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-950 border border-purple-500/20 text-slate-200 rounded-bl-none space-y-2 relative group'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="leading-relaxed flex-1">{msg.text}</p>
                    {msg.sender === 'companion' && (
                      <button
                        onClick={() => speakText(msg.text)}
                        title="Read Aloud"
                        className="p-1 rounded-lg bg-violet-500/10 hover:bg-violet-500/30 text-violet-300 transition shrink-0 mt-0.5"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Micro-Step Suggested Card */}
                  {msg.microStep && (
                    <div className="mt-2 p-3 rounded-xl bg-purple-950/60 border border-purple-500/40 space-y-2 text-purple-200">
                      <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-300">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Micro-Step Strategy
                        </span>
                        <span>{msg.minutes || 2} Mins Only</span>
                      </div>
                      <p className="font-bold text-white text-xs">{msg.microStep}</p>

                      {onStartMicroTimer && (
                        <button
                          onClick={() => {
                            onStartMicroTimer(msg.minutes || 2);
                            onClose();
                          }}
                          className="w-full mt-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow transition"
                        >
                          <Play className="w-3.5 h-3.5 fill-slate-950" />
                          Start {msg.minutes || 2}-Minute Warmup Timer
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs p-2">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                <span>Coach is thinking...</span>
              </div>
            )}
          </div>

          {/* Footer Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Tell your coach how you feel..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 transition shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
