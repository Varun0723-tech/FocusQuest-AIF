import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HeartHandshake,
  Star,
  CheckCircle2,
  Send,
  MessageSquare,
  Sparkles,
  Calendar,
  Clock,
  UserCheck,
  Smile,
  Meh,
  Frown,
  ArrowLeft,
} from 'lucide-react';
import { saveUserFeedback } from '../services/feedbackService';
import { useAuth } from '../context/AuthContext';

interface UserTestingScreenProps {
  onBackToSettings?: () => void;
  onNavigateToDashboard?: () => void;
}

export const UserTestingScreen: React.FC<UserTestingScreenProps> = ({
  onBackToSettings,
  onNavigateToDashboard,
}) => {
  const { addXp } = useAuth();

  // Section 1: Testing Info
  const [testerType, setTesterType] = useState<'Student' | 'Teacher' | 'Parent' | 'Other'>('Student');
  const [testerName, setTesterName] = useState('');
  const [ageGroup, setAgeGroup] = useState('18-22');
  const [testingDate, setTestingDate] = useState(new Date().toISOString().split('T')[0]);
  const [testingDuration, setTestingDuration] = useState('15-30 minutes');

  // Section 2: Accessibility Ratings (1-5)
  const [navigationRating, setNavigationRating] = useState(5);
  const [buttonRating, setButtonRating] = useState(5);
  const [textRating, setTextRating] = useState(5);
  const [overwhelmingRating, setOverwhelmingRating] = useState(2);
  const [colorRating, setColorRating] = useState(5);
  const [nextStepRating, setNextStepRating] = useState(5);

  // Section 3: AI Feedback (1-5)
  const [aiHelpfulness, setAiHelpfulness] = useState(5);
  const [aiStepLength, setAiStepLength] = useState(4);
  const [aiStepClarity, setAiStepClarity] = useState(5);
  const [aiStressReduction, setAiStressReduction] = useState(5);

  // Section 4: Free Text
  const [freeTextFeedback, setFreeTextFeedback] = useState('');

  // Section 5: Suggested Improvements Checklist
  const IMPROVEMENT_OPTIONS = [
    'Larger text',
    'Voice support',
    'Fewer buttons',
    'Dark mode',
    'Simpler dashboard',
    'Better colors',
    'Reminder notifications',
  ];
  const [selectedImprovements, setSelectedImprovements] = useState<string[]>([]);

  // Section 6: Overall Experience
  const [overallExperience, setOverallExperience] = useState<'😀' | '😐' | '😞'>('😀');
  const [wouldUseAgain, setWouldUseAgain] = useState<'Yes' | 'Maybe' | 'No'>('Yes');

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleImprovement = (item: string) => {
    setSelectedImprovements((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await saveUserFeedback({
        testerType,
        testerName: testerName.trim() || 'Anonymous Tester',
        ageGroup,
        testingDate,
        testingDuration,
        navigationRating,
        buttonRating,
        textRating,
        overwhelmingRating,
        colorRating,
        nextStepRating,
        aiHelpfulness,
        aiStepLength,
        aiStepClarity,
        aiStressReduction,
        freeTextFeedback: freeTextFeedback.trim(),
        improvements: selectedImprovements,
        overallExperience,
        wouldUseAgain,
      });

      addXp(50, 'Completed Usability Feedback');
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to save feedback', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = (
    value: number,
    onChange: (v: number) => void,
    label: string,
    subtext?: string
  ) => (
    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
      <div className="flex justify-between items-center flex-wrap gap-1">
        <label className="text-xs font-bold text-slate-200">{label}</label>
        <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
          {value} / 5 Stars
        </span>
      </div>
      {subtext && <p className="text-[11px] text-slate-400">{subtext}</p>}
      <div className="flex items-center gap-1.5 pt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-amber-400 transition"
          >
            <Star
              className={`w-6 h-6 transition-all ${
                star <= value ? 'text-amber-400 fill-amber-400 scale-110' : 'text-slate-700'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-24 pt-2 max-w-3xl mx-auto">
      {/* Top Breadcrumb & Return button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToSettings}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition py-1 px-3 rounded-xl bg-slate-900 border border-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Settings
        </button>
        <span className="text-xs font-extrabold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
          Neurodivergent Usability Module
        </span>
      </div>

      {/* Main Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 border border-purple-500/30 text-white shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">User Testing & Usability Feedback</h1>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
          Thank you for helping us improve FocusQuest AI. Your feedback helps us create a more accessible learning experience for neurodivergent students (ADHD, Autism, Dyslexia, etc.).
        </p>
      </div>

      <AnimatePresence>
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 text-center space-y-4 shadow-2xl"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-white">Feedback Submitted!</h2>
            <p className="text-sm text-emerald-300 max-w-md mx-auto">
              Thank you! Your feedback will help improve FocusQuest AI for neurodivergent learners around the world. (+50 XP Earned)
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
              >
                Submit Another Response
              </button>
              {onNavigateToDashboard && (
                <button
                  onClick={onNavigateToDashboard}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg transition"
                >
                  Return to Dashboard
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SECTION 1: Testing Information */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Testing Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Role / Perspective *</label>
                  <select
                    value={testerType}
                    onChange={(e) => setTesterType(e.target.value as unknown as typeof testerType)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Student">Student (ADHD / Autism / Dyslexia)</option>
                    <option value="Teacher">Teacher / Educator</option>
                    <option value="Parent">Parent / Guardian</option>
                    <option value="Other">Other Supporter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Tester Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex or Anonymous"
                    value={testerName}
                    onChange={(e) => setTesterName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Age Group *</label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Under 13">Under 13</option>
                    <option value="13-17">13–17 Years Old</option>
                    <option value="18-22">18–22 Years Old</option>
                    <option value="23-30">23–30 Years Old</option>
                    <option value="31+">31+ Years Old</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Testing Date</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="date"
                      value={testingDate}
                      onChange={(e) => setTestingDate(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">Testing Duration</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <select
                      value={testingDuration}
                      onChange={(e) => setTestingDuration(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Under 10 minutes">Under 10 minutes</option>
                      <option value="15-30 minutes">15–30 minutes</option>
                      <option value="30-60 minutes">30–60 minutes</option>
                      <option value="1+ Hour">1+ Hour</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Accessibility Questions */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Accessibility & Ergonomics
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {renderStarRating(navigationRating, setNavigationRating, 'Was the app easy to navigate?')}
                {renderStarRating(buttonRating, setButtonRating, 'Were the buttons large enough?')}
                {renderStarRating(textRating, setTextRating, 'Was the text easy to read?')}
                {renderStarRating(
                  overwhelmingRating,
                  setOverwhelmingRating,
                  'Was the interface overwhelming?',
                  '1 = Not overwhelming at all; 5 = Very overwhelming'
                )}
                {renderStarRating(colorRating, setColorRating, 'Did the colors feel comfortable?')}
                {renderStarRating(nextStepRating, setNextStepRating, 'Did you know what to do next?')}
              </div>
            </div>

            {/* SECTION 3: AI Feedback */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" /> AI Quest Assistant Feedback
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {renderStarRating(
                  aiHelpfulness,
                  setAiHelpfulness,
                  'Did the AI study plan help you start work?'
                )}
                {renderStarRating(
                  aiStepLength,
                  setAiStepLength,
                  'Were suggested steps manageable in length?',
                  '1 = Too long; 5 = Ideal chunk size'
                )}
                {renderStarRating(aiStepClarity, setAiStepClarity, 'Were the steps easy to follow?')}
                {renderStarRating(
                  aiStressReduction,
                  setAiStressReduction,
                  'Did the AI reduce stress or confusion?'
                )}
              </div>
            </div>

            {/* SECTION 4: Free Text Feedback */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Free Text Suggestions
                </h2>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  What would you improve about this app?
                </label>
                <textarea
                  rows={4}
                  placeholder="Share any detailed observations, difficulties, or ideas for cognitive accessibility..."
                  value={freeTextFeedback}
                  onChange={(e) => setFreeTextFeedback(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* SECTION 5: Suggested Improvements */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center">
                  5
                </span>
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Suggested Feature Checklist
                </h2>
              </div>

              <p className="text-xs text-slate-400">Select all features that would improve your experience:</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                {IMPROVEMENT_OPTIONS.map((item) => {
                  const isChecked = selectedImprovements.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleImprovement(item)}
                      className={`p-3 rounded-xl border text-xs font-bold text-left flex items-center gap-2 transition ${
                        isChecked
                          ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] shrink-0 ${
                          isChecked
                            ? 'bg-purple-500 border-purple-400 text-white'
                            : 'border-slate-600'
                        }`}
                      >
                        {isChecked && '✓'}
                      </span>
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 6: Overall Experience */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center">
                  6
                </span>
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Overall Experience
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    How was your overall experience with the app?
                  </label>
                  <div className="flex items-center gap-4">
                    {(['😀', '😐', '😞'] as const).map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setOverallExperience(emoji)}
                        className={`p-4 rounded-2xl text-2xl border transition ${
                          overallExperience === emoji
                            ? 'bg-purple-600/30 border-purple-500 scale-110 shadow-lg'
                            : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Would you use this app again for studying or work?
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-w-sm">
                    {(['Yes', 'Maybe', 'No'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setWouldUseAgain(opt)}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                          wouldUseAgain === opt
                            ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                            : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 7: Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition"
              >
                {isSubmitting ? (
                  <span>Saving to Firestore user_feedback...</span>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Usability Feedback (+50 XP)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </AnimatePresence>
    </div>
  );
};
