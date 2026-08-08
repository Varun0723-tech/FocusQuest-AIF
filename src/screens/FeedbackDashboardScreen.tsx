import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Star,
  Sparkles,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  Award,
  ArrowLeft,
  Filter,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { getStoredFeedback } from '../services/feedbackService';
import { UserFeedback } from '../models/types';

interface FeedbackDashboardScreenProps {
  onBackToSettings?: () => void;
}

export const FeedbackDashboardScreen: React.FC<FeedbackDashboardScreenProps> = ({
  onBackToSettings,
}) => {
  const [feedbackList, setFeedbackList] = useState<UserFeedback[]>([]);
  const [filterType, setFilterType] = useState<string>('All');

  useEffect(() => {
    setFeedbackList(getStoredFeedback());
  }, []);

  const filtered = feedbackList.filter((fb) => {
    if (filterType === 'All') return true;
    return fb.testerType === filterType;
  });

  const totalTesters = feedbackList.length;

  const avgNav = totalTesters
    ? (feedbackList.reduce((acc, f) => acc + f.navigationRating, 0) / totalTesters).toFixed(1)
    : '0';

  const avgAccessibility = totalTesters
    ? (
        feedbackList.reduce(
          (acc, f) => acc + (f.buttonRating + f.textRating + f.colorRating) / 3,
          0
        ) / totalTesters
      ).toFixed(1)
    : '0';

  const avgAi = totalTesters
    ? (feedbackList.reduce((acc, f) => acc + f.aiHelpfulness, 0) / totalTesters).toFixed(1)
    : '0';

  // Calculate most requested improvement
  const improvementCounts: Record<string, number> = {};
  feedbackList.forEach((fb) => {
    fb.improvements.forEach((imp) => {
      improvementCounts[imp] = (improvementCounts[imp] || 0) + 1;
    });
  });

  let mostRequested = 'None';
  let maxCount = 0;
  Object.entries(improvementCounts).forEach(([key, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostRequested = key;
    }
  });

  const happyCount = feedbackList.filter((f) => f.overallExperience === '😀').length;
  const overallSatisfactionPct = totalTesters
    ? Math.round((happyCount / totalTesters) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-24 pt-2 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToSettings}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Settings
        </button>
        <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          Admin & Developer Portal
        </span>
      </div>

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 border border-purple-500/30 text-white shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Usability Feedback Dashboard</h1>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
          Aggregated ratings, accessibility metrics, and user feedback collected from neurodivergent student testers and educators stored in Firestore `user_feedback`.
        </p>
      </div>

      {/* Key Metric Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Testers</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalTesters}</div>
          <p className="text-[10px] text-slate-500">Total Participants</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Navigation</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{avgNav} / 5</div>
          <p className="text-[10px] text-slate-500">Avg Ease of Use</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Accessibility</span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{avgAccessibility} / 5</div>
          <p className="text-[10px] text-slate-500">Text & Buttons</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>AI Utility</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{avgAi} / 5</div>
          <p className="text-[10px] text-slate-500">Helpfulness Score</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Top Request</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xs font-extrabold text-white truncate">{mostRequested}</div>
          <p className="text-[10px] text-slate-500">{maxCount} Votes</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Satisfaction</span>
            <ThumbsUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{overallSatisfactionPct}%</div>
          <p className="text-[10px] text-slate-500">Positive Rating</p>
        </div>
      </div>

      {/* Visual Analytics / Breakdown Chart */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/30 shadow-xl space-y-4">
        <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
          Requested Accessibility Enhancements Breakdown
        </h2>

        <div className="space-y-3">
          {Object.entries(improvementCounts).map(([item, count]) => {
            const pct = Math.round((count / (totalTesters || 1)) * 100);
            return (
              <div key={item} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>{item}</span>
                  <span className="text-purple-400">
                    {count} votes ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Feedback Responses Feed */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-400" /> Recent Tester Submissions (
            {filtered.length})
          </h2>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-bold">Filter:</span>
            {(['All', 'Student', 'Teacher', 'Parent'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  filterType === t
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((fb) => (
            <div
              key={fb.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition space-y-3"
            >
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">
                      {fb.testerName || 'Anonymous Tester'}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {fb.testerType}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Age {fb.ageGroup}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    Tested on {fb.testingDate} ({fb.testingDuration})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xl">{fb.overallExperience}</span>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${
                      fb.wouldUseAgain === 'Yes'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    Would Use: {fb.wouldUseAgain}
                  </span>
                </div>
              </div>

              {/* Star Ratings Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                <div className="p-2 rounded-xl bg-slate-950/60">
                  <span className="text-slate-400">Nav:</span>{' '}
                  <strong className="text-amber-400">{fb.navigationRating} ★</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60">
                  <span className="text-slate-400">Buttons:</span>{' '}
                  <strong className="text-amber-400">{fb.buttonRating} ★</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60">
                  <span className="text-slate-400">Text Readability:</span>{' '}
                  <strong className="text-amber-400">{fb.textRating} ★</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60">
                  <span className="text-slate-400">AI Helpfulness:</span>{' '}
                  <strong className="text-amber-400">{fb.aiHelpfulness} ★</strong>
                </div>
              </div>

              {fb.freeTextFeedback && (
                <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200">
                  <strong className="text-purple-300 block mb-1">Feedback:</strong> "
                  {fb.freeTextFeedback}"
                </div>
              )}

              {fb.improvements.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-bold text-slate-500">Requested:</span>
                  {fb.improvements.map((imp, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300"
                    >
                      {imp}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
