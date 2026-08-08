import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ClipboardCheck,
  Search,
  Filter,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Tag,
  AlertCircle,
  X,
  Edit2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Priority, Task } from '../models/types';
import { useTasks } from '../context/TaskContext';
import { AddTaskModal } from '../widgets/AddTaskModal';
import { IconContainer } from '../widgets/IconContainer';

export const TasksScreen: React.FC = () => {
  const {
    tasks,
    filterPriority,
    filterStatus,
    searchQuery,
    sortBy,
    setFilterPriority,
    setFilterStatus,
    setSearchQuery,
    setSortBy,
    toggleTaskComplete,
    toggleSubtask,
    deleteTask,
    updateTask,
  } = useTasks();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('Medium');

  // Filter tasks logic
  const filteredTasks = tasks.filter((t) => {
    if (filterPriority !== 'All' && t.priority !== filterPriority) return false;
    if (filterStatus === 'Pending' && t.completed) return false;
    if (filterStatus === 'Completed' && !t.completed) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchTag = t.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }
    return true;
  });

  // Sort tasks logic
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'deadline') {
      const dA = a.deadline || '9999';
      const dB = b.deadline || '9999';
      return dA.localeCompare(dB);
    }
    if (sortBy === 'priority') {
      const pMap: Record<Priority, number> = { High: 3, Medium: 2, Low: 1 };
      return pMap[b.priority] - pMap[a.priority];
    }
    if (sortBy === 'xp') {
      return b.xpReward - a.xpReward;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleOpenEdit = (task: Task) => {
    setSelectedTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditPriority(task.priority);
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !editTitle.trim()) return;
    updateTask(selectedTask.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      priority: editPriority,
    });
    setIsEditing(false);
    setSelectedTask(null);
  };

  return (
    <div className="space-y-6 pb-24 pt-2">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <IconContainer icon={ClipboardCheck} color="purple" size="md" />
            <h1 className="text-2xl font-black text-white tracking-tight">Task Quest Log</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage, organize, and execute your quests with priorities and subtasks.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Quest Task
        </button>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search tasks by title, description, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as unknown as typeof sortBy)}
              className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
            >
              <option value="deadline">Deadline</option>
              <option value="priority">Priority (High to Low)</option>
              <option value="xp">XP Reward</option>
              <option value="created">Recently Created</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800 text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" /> Status:
            </span>
            {(['All', 'Pending', 'Completed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  filterStatus === s
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-400">Priority:</span>
            {(['All', 'High', 'Medium', 'Low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  filterPriority === p
                    ? p === 'High'
                      ? 'bg-rose-500 text-white shadow'
                      : p === 'Medium'
                      ? 'bg-amber-500 text-white shadow'
                      : p === 'Low'
                      ? 'bg-emerald-500 text-white shadow'
                      : 'bg-purple-600 text-white shadow'
                    : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task List */}
      {sortedTasks.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Matching Quests Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting your search query or filter criteria, or add a new task to your quest log.
          </p>
          <button
            onClick={() => {
              setFilterPriority('All');
              setFilterStatus('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border transition group ${
                task.completed
                  ? 'bg-slate-950/40 border-slate-850 opacity-60'
                  : 'bg-slate-900 border-slate-800 hover:border-purple-500/40 shadow-lg'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className={`mt-0.5 p-1 rounded-full transition ${
                      task.completed
                        ? 'text-emerald-400 hover:text-emerald-300'
                        : 'text-slate-500 hover:text-purple-400'
                    }`}
                    aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 fill-emerald-400/20" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        onClick={() => setSelectedTask(task)}
                        className={`text-sm font-bold cursor-pointer hover:text-purple-300 transition ${
                          task.completed ? 'line-through text-slate-500' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </h3>

                      {/* Priority Tag */}
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          task.priority === 'High'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : task.priority === 'Medium'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {task.priority}
                      </span>

                      {/* XP Badge */}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        +{task.xpReward} XP
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Subtasks */}
                    {task.subtasks.length > 0 && (
                      <div className="pt-2 space-y-1">
                        <div className="text-[10px] font-bold text-slate-400">
                          Subtask Breakdown (
                          {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {task.subtasks.map((st) => (
                            <button
                              key={st.id}
                              onClick={() => toggleSubtask(task.id, st.id)}
                              className="text-left flex items-center gap-2 text-xs py-1 px-2 rounded-lg bg-slate-950/50 hover:bg-slate-800 text-slate-300 transition"
                            >
                              <span
                                className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] shrink-0 ${
                                  st.completed
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-slate-600'
                                }`}
                              >
                                {st.completed && '✓'}
                              </span>
                              <span className={`truncate ${st.completed ? 'line-through text-slate-500' : ''}`}>
                                {st.title}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer Meta Tags */}
                    <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-400 flex-wrap">
                      {task.deadline && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" /> Due {task.deadline}
                        </span>
                      )}
                      {task.estimatedMinutes && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-500" /> {task.estimatedMinutes} mins
                        </span>
                      )}
                      {task.tags.map((tag, idx) => (
                        <span key={idx} className="flex items-center gap-0.5 text-purple-400/80">
                          <Tag className="w-3 h-3" /> #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Task Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(task)}
                    className="p-2 rounded-xl text-slate-500 hover:text-purple-300 hover:bg-slate-800 transition"
                    title="Edit Task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Task Modal */}
      <AnimatePresence>
        {isEditing && selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl bg-slate-900 border border-purple-500/30 p-6 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-extrabold">Edit Quest Task</h3>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Priority
                  </label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-slate-800 rounded-xl border border-slate-700">
                    {(['Low', 'Medium', 'High'] as Priority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setEditPriority(p)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition ${
                          editPriority === p
                            ? p === 'High'
                              ? 'bg-rose-500 text-white shadow'
                              : p === 'Medium'
                              ? 'bg-amber-500 text-white shadow'
                              : 'bg-emerald-500 text-white shadow'
                            : 'text-slate-400'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AddTaskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};
