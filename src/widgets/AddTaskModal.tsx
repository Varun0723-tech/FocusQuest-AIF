import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Clock, Calendar, AlertCircle, Sparkles, ClipboardCheck } from 'lucide-react';
import { Priority } from '../models/types';
import { useTasks } from '../context/TaskContext';
import { IconContainer } from './IconContainer';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPriority?: Priority;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, defaultPriority = 'Medium' }) => {
  const { addTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(defaultPriority);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [tagsInput, setTagsInput] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks((prev) => [...prev, newSubtaskTitle.trim()]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title');
      return;
    }

    const tags = tagsInput
      ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
      : ['Quest'];

    const formattedSubtasks = subtasks.map((st, idx) => ({
      id: `sub_${Date.now()}_${idx}`,
      title: st,
      completed: false,
    }));

    addTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      deadline,
      estimatedMinutes: Number(estimatedMinutes) || 25,
      tags,
      subtasks: formattedSubtasks,
      xpReward: priority === 'High' ? 40 : priority === 'Medium' ? 25 : 15,
    });

    // Reset fields
    setTitle('');
    setDescription('');
    setTagsInput('');
    setSubtasks([]);
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-purple-500/30 p-6 text-white shadow-2xl my-8"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <IconContainer icon={ClipboardCheck} color="purple" size="sm" />
              <h2 className="text-xl font-extrabold text-white">Create New Quest Task</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Audit UX Wireframes & Submit Feedback"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError('');
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Provide task scope details or key instructions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-800/80 rounded-xl border border-slate-700">
                  {(['Low', 'Medium', 'High'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition ${
                        priority === p
                          ? p === 'High'
                            ? 'bg-rose-500 text-white shadow'
                            : p === 'Medium'
                            ? 'bg-amber-500 text-white shadow'
                            : 'bg-emerald-500 text-white shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Deadline
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Estimated Minutes
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="number"
                    min={5}
                    max={240}
                    step={5}
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Tags (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="Design, Work, Study"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Subtasks Section */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Subtask Breakdown
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add a subtask step..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {subtasks.length > 0 && (
                <div className="max-h-28 overflow-y-auto space-y-1.5 p-2 bg-slate-950/50 rounded-xl border border-slate-800">
                  {subtasks.map((st, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/60 text-xs text-slate-300"
                    >
                      <span className="truncate">{st}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Quest Task
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
