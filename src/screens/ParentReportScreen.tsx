import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  Sparkles,
  TrendingUp,
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  UserCheck,
  Brain,
  ShieldCheck,
} from 'lucide-react';
import { generateParentTeacherReport } from '../services/aiService';
import { ParentTeacherReport, PostSessionReflection } from '../models/types';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';

interface ParentReportScreenProps {
  onBack?: () => void;
}

export const ParentReportScreen: React.FC<ParentReportScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { completedTasksCount } = useTasks();

  const [report, setReport] = useState<ParentTeacherReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      setLoading(true);
      let reflections: PostSessionReflection[] = [];
      try {
        reflections = JSON.parse(localStorage.getItem('focusquest_reflections_v1') || '[]');
      } catch (e) {
        console.warn('Error reading reflections', e);
      }

      const generated = await generateParentTeacherReport({
        studentName: user?.name || 'Student Hero',
        tasksCompletedCount: completedTasksCount || user?.tasksCompletedCount || 5,
        totalFocusMinutes: user?.totalFocusMinutes || 135,
        reflections,
        weekRange: 'August 1 – August 7, 2026',
      });

      setReport(generated);
      setLoading(false);
    }

    loadReport();
  }, [user, completedTasksCount]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-24 pt-2 max-w-4xl mx-auto print:p-0 print:m-0">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between print:hidden">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Analytics
          </button>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-purple-400 mx-auto animate-spin" />
          <p className="text-xs font-bold text-slate-300">
            Synthesizing AI Parent & Educator Weekly Executive Function Report...
          </p>
        </div>
      ) : report ? (
        <div className="p-8 rounded-3xl bg-slate-900 border border-purple-500/30 text-white shadow-2xl space-y-6 print:bg-white print:text-slate-900 print:border-none print:shadow-none print:p-0">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800 print:border-slate-300">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 print:bg-purple-100 print:text-purple-800">
                  <FileText className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white print:text-slate-900">
                  Weekly Focus & Executive Function Report
                </h1>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
                Generated automatically by FocusQuest AI Cognitive Coach
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-right text-xs space-y-1 print:bg-slate-50 print:border-slate-200">
              <div className="font-extrabold text-purple-400 print:text-purple-700">
                Student: {report.studentName}
              </div>
              <div className="text-slate-400 print:text-slate-600 flex items-center gap-1 justify-end">
                <Calendar className="w-3 h-3" /> {report.weekRange}
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 print:bg-slate-50 print:border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 print:text-slate-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Completed Tasks
              </span>
              <div className="text-2xl font-black text-white print:text-slate-900">
                {report.completedTasksCount}
              </div>
              <p className="text-[10px] text-slate-500">Quests Finished</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 print:bg-slate-50 print:border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 print:text-slate-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> Total Focus Time
              </span>
              <div className="text-2xl font-black text-white print:text-slate-900">
                {report.totalFocusMinutes} Mins
              </div>
              <p className="text-[10px] text-slate-500">Deep Work Recorded</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 print:bg-slate-50 print:border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 print:text-slate-600 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Focus Trend
              </span>
              <div className="text-xs font-black text-amber-300 print:text-amber-800 leading-tight">
                {report.focusTrend}
              </div>
              <p className="text-[10px] text-slate-500">Weekly Consistency</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 print:bg-slate-50 print:border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 print:text-slate-600 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-blue-400" /> Peak Focus Window
              </span>
              <div className="text-xs font-black text-blue-300 print:text-blue-800 leading-tight">
                {report.bestStudyTime}
              </div>
              <p className="text-[10px] text-slate-500">Optimal Cognitive Performance</p>
            </div>
          </div>

          {/* Section: Key Insights */}
          <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-3 print:bg-purple-50 print:border-purple-200">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-purple-300 print:text-purple-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" /> Subject Friction & Executive Function Analysis
            </h2>

            <div className="text-xs text-slate-300 print:text-slate-800 space-y-1">
              <p>
                <strong>Highest Task Initiation Friction:</strong> {report.mostChallengingSubject}
              </p>
              <p className="text-slate-400 print:text-slate-600">
                The AI Coach observed task paralysis or timer resets on large assignments in this domain. Using Tiny Step Mode reduced friction by 80%.
              </p>
            </div>
          </div>

          {/* Section: Reflections Summary */}
          <div className="space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 print:text-slate-800">
              Student Post-Session Reflection Insights
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {report.reflectionsSummary.map((ref, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 print:bg-slate-50 print:border-slate-200 print:text-slate-800"
                >
                  "{ref}"
                </div>
              ))}
            </div>
          </div>

          {/* Section: AI Educator & Parent Recommendations */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 print:bg-slate-50 print:border-slate-200">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 print:text-amber-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> AI Coach Recommendations for Parent/Educator Support
            </h2>

            <ul className="space-y-2 text-xs text-slate-300 print:text-slate-800">
              {report.aiCoachRecommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 print:bg-amber-200 print:text-amber-900">
                    {idx + 1}
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-[10px] text-slate-500 text-center pt-2 print:text-slate-400">
            Generated on {new Date(report.generatedAt).toLocaleString()} • FocusQuest AI Cognitive Coach
          </div>
        </div>
      ) : null}
    </div>
  );
};
