import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  Clock, 
  AlertTriangle, 
  Filter, 
  RotateCcw,
  PlusCircle,
  FolderMinus,
  Briefcase,
  BookOpen,
  Coffee,
  CheckCircle2,
  CalendarDays,
  Play,
  Pause,
  CreditCard
} from 'lucide-react';
import { Task } from '../types';

interface TasksViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  refreshRisk: () => void;
  isWorkspaceConnected: boolean;
  workspaceTasks: any[];
  isWorkspaceLoading: boolean;
  syncWorkspaceData: () => Promise<void>;
}

export default function TasksView({ 
  tasks, 
  setTasks, 
  refreshRisk,
  isWorkspaceConnected,
  workspaceTasks,
  isWorkspaceLoading,
  syncWorkspaceData
}: TasksViewProps) {
  // Form States
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Task['category']>('Assignment');
  const [newHoursNeeded, setNewHoursNeeded] = useState(8);
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [addToGoogleTasks, setAddToGoogleTasks] = useState(false);

  const [paymentType, setPaymentType] = useState<'one-time' | 'recurring'>('one-time');
  const [cycleTime, setCycleTime] = useState<string>('Monthly');

  const [newDeadlineDate, setNewDeadlineDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
  });

  // Filter States
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');

  // Add Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Calculate deadlineHours from newDeadlineDate
    const diffMs = new Date(newDeadlineDate).getTime() - new Date().getTime();
    const computedDeadlineHours = diffMs > 0 ? Math.max(0.1, Math.round((diffMs / 3600000) * 10) / 10) : 0;

    const newTask: Task = {
      id: 'task_' + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      hoursNeeded: newCategory === 'Bill Payment' ? 1 : Math.max(1, Number(newHoursNeeded)),
      hoursCompleted: 0,
      deadlineHours: computedDeadlineHours,
      deadlineDate: newDeadlineDate,
      status: 'todo',
      priority: newPriority,
      paymentType: newCategory === 'Bill Payment' ? paymentType : undefined,
      cycleTime: (newCategory === 'Bill Payment' && paymentType === 'recurring') ? cycleTime : undefined
    };

    setTasks(prev => {
      const updated = [...prev, newTask];
      // Trigger API refresh after state updates
      setTimeout(refreshRisk, 50);
      return updated;
    });

    if (isWorkspaceConnected && addToGoogleTasks) {
      try {
        await fetch('/api/workspace/tasks/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newTitle.trim(),
            notes: `Task category: ${newCategory}. Created from My Digital Twin.`,
            dueDate: newDeadlineDate
          })
        });
        await syncWorkspaceData();
      } catch (err) {
        console.error("Failed to add Google Task:", err);
      }
    }

    // Reset Form
    setNewTitle('');
    setNewHoursNeeded(8);
    setNewPriority('medium');
    setNewCategory('Assignment');
    setPaymentType('one-time');
    setCycleTime('Monthly');
    setAddToGoogleTasks(false);

    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    const pad = (n: number) => String(n).padStart(2, '0');
    setNewDeadlineDate(`${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`);
  };

  // Save Task Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !editingTaskId) return;

    const diffMs = new Date(newDeadlineDate).getTime() - new Date().getTime();
    const computedDeadlineHours = diffMs > 0 ? Math.max(0.1, Math.round((diffMs / 3600000) * 10) / 10) : 0;

    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id === editingTaskId) {
          const hoursNeededVal = newCategory === 'Bill Payment' ? 1 : Math.max(1, Number(newHoursNeeded));
          return {
            ...t,
            title: newTitle.trim(),
            category: newCategory,
            hoursNeeded: hoursNeededVal,
            deadlineHours: computedDeadlineHours,
            deadlineDate: newDeadlineDate,
            priority: newPriority,
            status: (t.hoursCompleted >= hoursNeededVal ? 'completed' : t.status === 'completed' ? 'todo' : t.status) as Task['status'],
            paymentType: newCategory === 'Bill Payment' ? paymentType : undefined,
            cycleTime: (newCategory === 'Bill Payment' && paymentType === 'recurring') ? cycleTime : undefined
          };
        }
        return t;
      });
      setTimeout(refreshRisk, 50);
      return updated;
    });

    // Reset state
    setEditingTaskId(null);
    setNewTitle('');
    setNewHoursNeeded(8);
    setNewPriority('medium');
    setNewCategory('Assignment');
    setPaymentType('one-time');
    setCycleTime('Monthly');

    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    const pad = (n: number) => String(n).padStart(2, '0');
    setNewDeadlineDate(`${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`);
  };

  // Select Task to Edit
  const handleEditClick = (task: Task) => {
    setEditingTaskId(task.id);
    setNewTitle(task.title);
    setNewCategory(task.category);
    setNewHoursNeeded(task.hoursNeeded);
    setNewPriority(task.priority);
    setPaymentType(task.paymentType || 'one-time');
    setCycleTime(task.cycleTime || 'Monthly');

    if (task.deadlineDate) {
      setNewDeadlineDate(task.deadlineDate);
    } else {
      const dt = new Date();
      dt.setMinutes(dt.getMinutes() + Math.round(task.deadlineHours * 60));
      const pad = (n: number) => String(n).padStart(2, '0');
      setNewDeadlineDate(`${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setNewTitle('');
    setNewHoursNeeded(8);
    setNewPriority('medium');
    setNewCategory('Assignment');
    setPaymentType('one-time');
    setCycleTime('Monthly');

    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    const pad = (n: number) => String(n).padStart(2, '0');
    setNewDeadlineDate(`${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`);
  };

  // Delete Task
  const handleDeleteTask = (id: string) => {
    setTasks(prev => {
      const updated = prev.filter(t => t.id !== id);
      setTimeout(refreshRisk, 50);
      return updated;
    });
  };

  // Toggle status
  const handleToggleStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'completed' ? 'todo' : 'completed';
        const nextCompleted = nextStatus === 'completed' ? t.hoursNeeded : 0;
        return { ...t, status: nextStatus, hoursCompleted: nextCompleted };
      }
      return t;
    }));
    setTimeout(refreshRisk, 100);
  };

  // Quick increment progress
  const handleIncrementProgress = (id: string, amount: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextCompleted = Math.max(0, Math.min(t.hoursNeeded, t.hoursCompleted + amount));
        const nextStatus = nextCompleted === t.hoursNeeded ? 'completed' : nextCompleted > 0 ? 'in_progress' : 'todo';
        return { ...t, hoursCompleted: nextCompleted, status: nextStatus };
      }
      return t;
    }));
    setTimeout(refreshRisk, 100);
  };

  // Quick decrement progress
  const handleDecrementProgress = (id: string, amount: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextCompleted = Math.max(0, Math.min(t.hoursNeeded, t.hoursCompleted - amount));
        const nextStatus = nextCompleted === t.hoursNeeded ? 'completed' : nextCompleted > 0 ? 'in_progress' : 'todo';
        return { ...t, hoursCompleted: nextCompleted, status: nextStatus };
      }
      return t;
    }));
    setTimeout(refreshRisk, 100);
  };

  // Get categories and items for filters
  const categories = ['All', 'Assignment', 'Exam Prep', 'Meeting', 'Work', 'Personal', 'Bill Payment'];
  const priorities = ['All', 'high', 'medium', 'low'];

  // Filter tasks
  const filteredTasks = (() => {
    const localFiltered = tasks.filter(task => {
      const matchesCategory = filterCategory === 'All' || task.category === filterCategory;
      const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
      return matchesCategory && matchesPriority;
    }).map(t => ({ ...t, isGoogle: false }));

    const googleFiltered = isWorkspaceConnected 
      ? workspaceTasks.filter(t => {
          const matchesCategory = filterCategory === 'All' || filterCategory === 'Personal' || filterCategory === 'Work';
          const matchesPriority = filterPriority === 'All';
          return matchesCategory && matchesPriority;
        }).map(t => ({
          id: t.id,
          title: t.title,
          hoursCompleted: t.status === 'completed' ? 1 : 0,
          hoursNeeded: 1,
          deadlineHours: t.due ? (new Date(t.due).getTime() - Date.now()) / 3600000 : 24,
          deadlineDate: t.due || undefined,
          category: 'Personal' as const,
          status: (t.status === 'completed' ? 'completed' : 'todo') as any,
          priority: 'medium' as const,
          isGoogle: true,
          notes: t.notes,
          listTitle: t.listTitle,
          isTracking: false
        }))
      : [];

    return [...localFiltered, ...googleFiltered];
  })();

  // Format task progress into continuous display string (hours, minutes, seconds)
  const formatTaskTime = (hours: number): string => {
    const totalSeconds = Math.round(hours * 3600);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    if (h > 0) {
      return `${h}h ${m}m ${s}s`;
    }
    if (m > 0) {
      return `${m}m ${s}s`;
    }
    return `${s}s`;
  };

  // Format deadline for user-friendly display
  const formatDeadline = (task: Task): string => {
    let dateObj: Date;
    if (task.deadlineDate) {
      dateObj = new Date(task.deadlineDate);
    } else if (task.deadlineHours > 0) {
      dateObj = new Date();
      dateObj.setMinutes(dateObj.getMinutes() + Math.round(task.deadlineHours * 60));
    } else {
      return 'No deadline';
    }

    return dateObj.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Toggle tracking (Start/Pause) for active tasks
  const handleToggleTracking = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextTracking = !t.isTracking;
        const nextStatus = nextTracking ? 'in_progress' : t.status;
        return { 
          ...t, 
          isTracking: nextTracking, 
          status: nextStatus === 'completed' && nextTracking ? 'in_progress' : nextStatus
        };
      }
      return { ...t, isTracking: false }; // Pause others
    }));
    setTimeout(refreshRisk, 50);
  };

  // Toggle completed status
  const handleToggleCompleted = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextStatus = t.status === 'completed' ? 'todo' : 'completed';
        const nextCompleted = nextStatus === 'completed' ? t.hoursNeeded : 0;
        return { 
          ...t, 
          status: nextStatus, 
          hoursCompleted: nextCompleted,
          isTracking: false // Pause if completed
        };
      }
      return t;
    }));
    setTimeout(refreshRisk, 100);
  };

  // Dynamically compute advice for estimated time from previous completed data
  const getCategoryEstimateAdvice = () => {
    // Filter completed tasks of this category
    const completedOfCategory = tasks.filter(t => t.category === newCategory && t.status === 'completed');
    
    // If no completed ones, fall back to any of this category (excluding custom active ones with default hours if possible)
    const anyOfCategory = completedOfCategory.length > 0 
      ? completedOfCategory 
      : tasks.filter(t => t.category === newCategory);
      
    if (anyOfCategory.length === 0) {
      return null;
    }
    
    const sum = anyOfCategory.reduce((acc, t) => acc + t.hoursNeeded, 0);
    const avg = Math.round((sum / anyOfCategory.length) * 10) / 10;
    return avg;
  };

  const adviceEstimate = getCategoryEstimateAdvice();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      id="tasks-view-container"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white font-sans tracking-tight">Task Workspace</h1>
        <p className="text-sm text-slate-400 font-sans mt-0.5">
          Insert objectives, modify parameters, and manage active hourly block timelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Form to add/edit tasks (5 Columns) */}
        <div className="lg:col-span-5 bg-[#171F34] border border-white/5 p-6 rounded-2xl h-fit">
          <h2 className="text-sm font-semibold text-white font-sans flex items-center gap-2 mb-5">
            {editingTaskId ? (
              <>
                <Edit2 className="w-4 h-4 text-emerald-500" />
                Edit Task Details
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 text-blue-500" />
                Create Workspace Entry
              </>
            )}
          </h2>

          <form onSubmit={editingTaskId ? handleSaveEdit : handleAddTask} className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Objective Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Physics Lab Report"
                className="w-full bg-[#0B1020] border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as Task['category'])}
                  className="w-full bg-[#0B1020] border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
                >
                  <option value="Assignment">📝 Assignment</option>
                  <option value="Exam Prep">📚 Exam Prep</option>
                  <option value="Meeting">💼 Meeting</option>
                  <option value="Work">🏢 Work</option>
                  <option value="Personal">🏠 Personal</option>
                  <option value="Bill Payment">💳 Bill Payment</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as Task['priority'])}
                  className="w-full bg-[#0B1020] border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
                >
                  <option value="high">🔴 High Urgency</option>
                  <option value="medium">🟡 Medium Urgency</option>
                  <option value="low">🟢 Low Urgency</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Hours needed (Hidden for Bill Payment category) */}
              {newCategory !== 'Bill Payment' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Total Est. Hours</label>
                  <div className="flex items-center bg-[#0B1020] border border-white/5 rounded-lg px-3 py-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newHoursNeeded}
                      onChange={(e) => setNewHoursNeeded(Number(e.target.value))}
                      className="w-full bg-transparent border-0 outline-none focus:ring-0 text-xs text-slate-100"
                    />
                    <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  </div>
                </div>
              )}

              {/* Payment Type Options (Shown only for Bill Payment) */}
              {newCategory === 'Bill Payment' && (
                <div className="space-y-3 p-3.5 bg-[#0B1020]/40 rounded-xl border border-white/5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Payment Type</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentType"
                          value="one-time"
                          checked={paymentType === 'one-time'}
                          onChange={() => setPaymentType('one-time')}
                          className="accent-blue-500"
                        />
                        One-time Payment
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentType"
                          value="recurring"
                          checked={paymentType === 'recurring'}
                          onChange={() => setPaymentType('recurring')}
                          className="accent-blue-500"
                        />
                        Recurring Payment
                      </label>
                    </div>
                  </div>

                  {paymentType === 'recurring' && (
                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Cycle Time</label>
                      <select
                        value={cycleTime}
                        onChange={(e) => setCycleTime(e.target.value)}
                        className="w-full bg-[#0B1020] border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
                      >
                        <option value="Weekly">Weekly</option>
                        <option value="Bi-weekly">Bi-weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Yearly">Yearly</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Exact Deadline Date/Time */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                  {newCategory === 'Bill Payment' ? 'Payment Due Date & Time' : 'Deadline Date & Time'}
                </label>
                <div className="flex items-center bg-[#0B1020] border border-white/5 rounded-lg px-3 py-2">
                  <input
                    type="datetime-local"
                    required
                    value={newDeadlineDate}
                    onChange={(e) => setNewDeadlineDate(e.target.value)}
                    className="w-full bg-transparent border-0 outline-none focus:ring-0 text-xs text-slate-100 [color-scheme:dark] cursor-pointer"
                  />
                  <CalendarDays className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
                </div>
              </div>
            </div>

            {newCategory !== 'Bill Payment' && adviceEstimate !== null && (
              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-[11px] text-blue-300 font-sans flex flex-col gap-2 mt-1">
                <div className="flex items-start gap-1.5">
                  <span className="text-xs shrink-0">💡</span>
                  <span>
                    <strong>AI Advice</strong>: Completed <strong>{newCategory}</strong> tasks average <strong>{adviceEstimate} hours</strong>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setNewHoursNeeded(adviceEstimate)}
                  className="w-full text-center py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-200 hover:text-white transition-all text-[9px] font-semibold uppercase cursor-pointer"
                >
                  Apply {adviceEstimate}h Estimate
                </button>
              </div>
            )}

            {isWorkspaceConnected && !editingTaskId && (
              <div className="flex items-center gap-2 p-2 bg-purple-500/5 rounded-lg border border-purple-500/10 mb-2">
                <input
                  type="checkbox"
                  id="addToGoogleTasks"
                  checked={addToGoogleTasks}
                  onChange={(e) => setAddToGoogleTasks(e.target.checked)}
                  className="rounded border-white/10 bg-[#0B1020] text-purple-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="addToGoogleTasks" className="text-[9px] text-purple-300 font-semibold cursor-pointer select-none uppercase tracking-wider font-mono">
                  Add to Google Tasks
                </label>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {editingTaskId ? (
                <>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs py-2.5 rounded-lg transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 rounded-lg transition-all shadow-lg shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Task Entry
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Manage Table (7 Columns) */}
        <div className="lg:col-span-7 bg-[#171F34] border border-white/5 p-6 rounded-2xl flex flex-col h-full">
          {/* Controls / Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white font-sans flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-500" />
              Active Database
            </h2>

            {/* Filter controls */}
            <div className="flex gap-2.5">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-[#0B1020] border border-white/5 rounded-lg px-2.5 py-1 text-[10px] text-slate-300 font-sans cursor-pointer focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c === 'All' ? '📂 All Categories' : c}</option>
                ))}
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-[#0B1020] border border-white/5 rounded-lg px-2.5 py-1 text-[10px] text-slate-300 font-sans cursor-pointer focus:outline-none"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>{p === 'All' ? '🔥 All Priorities' : p.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          {/* List display */}
          <div className="flex-1 overflow-y-auto max-h-[360px] space-y-2.5 mt-4 pr-1">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-10">
                <FolderMinus className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-500 font-sans mt-2">No matching entries found.</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-[#0B1020]/30 border border-white/5 hover:border-white/10 rounded-xl p-3.5 flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleCompleted(task.id)}
                      className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${
                        task.status === 'completed'
                          ? 'bg-emerald-500/25 border-emerald-500 text-emerald-400'
                          : 'border-slate-700 hover:border-slate-500 text-transparent hover:text-slate-500'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    {/* Meta info */}
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-200'
                      }`}>
                        {task.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-sans">
                          {task.category}
                        </span>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                          task.priority === 'high'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/10'
                            : task.priority === 'medium'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                        }`}>
                          {task.priority.toUpperCase()}
                        </span>
                        {(task as any).isGoogle && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase font-extrabold">
                            Google Task
                          </span>
                        )}
                        {task.status !== 'completed' && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-rose-300 border border-rose-500/10 flex items-center gap-1">
                            <CalendarDays className="w-2.5 h-2.5 text-rose-400" />
                            {formatDeadline(task)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      {task.category === 'Bill Payment' ? (
                        <>
                          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                            {task.paymentType === 'recurring' ? 'Recurring' : 'One-time'}
                          </p>
                          {task.paymentType === 'recurring' && (
                            <span className="text-[10px] text-slate-500 font-mono block mt-1">
                              Cycle: {task.cycleTime || 'Monthly'}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-mono font-semibold text-slate-300">
                            {formatTaskTime(task.hoursCompleted)} / {task.hoursNeeded}h
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono block mt-1">Goal: {task.hoursNeeded}h</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-900/40 p-1 rounded-xl border border-white/5">
                      {/* Edit Button */}
                      <button
                        id={`edit-task-btn-${task.id}`}
                        onClick={() => handleEditClick(task)}
                        title="Edit Task Parameters"
                        className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                          editingTaskId === task.id
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                            : 'bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white border border-transparent hover:border-slate-600'
                        }`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Play/Pause Button */}
                      {task.status !== 'completed' && task.category !== 'Bill Payment' && (
                        <button
                          id={`toggle-track-${task.id}`}
                          onClick={() => handleToggleTracking(task.id)}
                          title={task.isTracking ? "Pause Tracking" : "Start Tracking"}
                          className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                            task.isTracking
                              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 animate-pulse shadow-md shadow-emerald-500/10'
                              : 'bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 text-blue-400 hover:text-white'
                          }`}
                        >
                          {task.isTracking ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        </button>
                      )}

                      {/* Completed Button */}
                      <button
                        id={`toggle-complete-${task.id}`}
                        onClick={() => handleToggleCompleted(task.id)}
                        title={task.status === 'completed' ? "Mark as Active" : "Mark as Completed"}
                        className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                          task.status === 'completed'
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                            : 'bg-slate-800/60 hover:bg-emerald-500/10 border border-slate-700/60 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      id={`delete-task-${task.id}`}
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
