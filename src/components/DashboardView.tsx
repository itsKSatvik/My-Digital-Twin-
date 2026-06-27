import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  CheckCircle, 
  CheckCircle2,
  Calendar as CalendarIcon,
  Plus,
  Moon,
  Trash2,
  ListTodo,
  X
} from 'lucide-react';
import { Task, RiskAnalysis, ScheduleEvent } from '../types';

interface DashboardViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  risk: RiskAnalysis;
  isLoadingRisk: boolean;
  refreshRisk: () => void;
  activeFocusTaskId: string;
  setActiveFocusTaskId: (id: string) => void;
  timezone: string;
  sleepSleptTime: string;
  sleepWokeTime: string;
  lastSleepLoggedDate: string;
  setLastSleepLoggedDate: (val: string) => void;
  onLogSleepToday: (sleptAt: string, wokeAt: string) => void;
  getTodayDateString: (tz: string) => string;
  scheduleEvents?: ScheduleEvent[];
  onNavigateToTasks?: () => void;
  onNavigateToDoctor?: () => void;
}

const getTimezoneLabel = (tz: string) => {
  if (tz === 'Asia/Kolkata') return 'IST';
  if (tz === 'America/New_York') return 'EST';
  if (tz === 'America/Los_Angeles') return 'PST';
  if (tz === 'Europe/London') return 'GMT';
  if (tz === 'Europe/Paris') return 'CET';
  if (tz === 'Asia/Singapore') return 'SGT';
  if (tz === 'Asia/Tokyo') return 'JST';
  if (tz === 'Australia/Sydney') return 'AEST';
  if (tz === 'UTC') return 'UTC';
  return tz.split('/').pop()?.replace('_', ' ') || tz;
};

export default function DashboardView({
  tasks,
  setTasks,
  risk,
  isLoadingRisk,
  refreshRisk,
  activeFocusTaskId,
  setActiveFocusTaskId,
  timezone,
  sleepSleptTime,
  sleepWokeTime,
  lastSleepLoggedDate,
  setLastSleepLoggedDate,
  onLogSleepToday,
  getTodayDateString,
  scheduleEvents = [],
  onNavigateToTasks,
  onNavigateToDoctor
}: DashboardViewProps) {
  const [countdownTime, setCountdownTime] = useState({ hours: 5, minutes: 18, seconds: 0 });
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(new Date());

  // Sleep prompt local states
  const [tempSlept, setTempSlept] = useState(sleepSleptTime);
  const [tempWoke, setTempWoke] = useState(sleepWokeTime);
  const [showSleepPrompt, setShowSleepPrompt] = useState(false);

  useEffect(() => {
    setShowSleepPrompt(lastSleepLoggedDate !== getTodayDateString(timezone));
  }, [lastSleepLoggedDate, timezone, getTodayDateString]);

  const handleSubmitSleep = (e: React.FormEvent) => {
    e.preventDefault();
    onLogSleepToday(tempSlept, tempWoke);
    setShowSleepPrompt(false);
  };

  const handleDismissSleep = () => {
    const todayStr = getTodayDateString(timezone);
    setLastSleepLoggedDate(todayStr);
    localStorage.setItem('dt_last_sleep_logged_date', todayStr);
    setShowSleepPrompt(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(time);

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(time);

  const tzLabel = getTimezoneLabel(timezone);

  // Set default focus task if none is set
  useEffect(() => {
    if (!activeFocusTaskId && tasks.length > 0) {
      const active = tasks.find(t => t.status !== 'completed');
      if (active) setActiveFocusTaskId(active.id);
    }
  }, [tasks, activeFocusTaskId, setActiveFocusTaskId]);

  // Find current focus task
  const focusTask = tasks.find(t => t.id === activeFocusTaskId) || tasks[0];

  // Dynamic ticking of the countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCountdownTime(prev => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 };
          } else if (prev.minutes > 0) {
            return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          } else if (prev.hours > 0) {
            return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Sync countdown starting value when focus task changes
  useEffect(() => {
    if (focusTask) {
      // Set hours based on deadlineHours, minutes randomly or set to 18 for design prompt matching
      const targetHours = Math.floor(focusTask.deadlineHours);
      const targetMinutes = Math.floor((focusTask.deadlineHours % 1) * 60) || 18;
      setCountdownTime({ hours: targetHours, minutes: targetMinutes, seconds: 0 });
    }
  }, [focusTask]);

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

  const getEventCategoryEmoji = (category: string) => {
    switch(category) {
      case 'Class': return '🏫';
      case 'Workout': return '🏋️';
      case 'Meal': return '🍕';
      case 'Study': return '📚';
      case 'Leisure': return '🎮';
      default: return '⚙️';
    }
  };

  const getCurrentActiveAndUpcoming = () => {
    const now = new Date();
    let currentH = now.getHours();
    let currentM = now.getMinutes();
    
    try {
      const timeStr = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(now);
      const [h, m] = timeStr.trim().split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        currentH = h;
        currentM = m;
      }
    } catch (e) {
      // fallback
    }

    const currentDec = currentH + currentM / 60;

    let activeEvent: ScheduleEvent | null = null;
    let upcomingEvent: ScheduleEvent | null = null;
    let minUpcomingDiff = Infinity;

    scheduleEvents.forEach(evt => {
      const [sh, sm] = evt.startTime.split(':').map(Number);
      const [eh, em] = evt.endTime.split(':').map(Number);
      const startDec = sh + sm / 60;
      const endDec = eh + em / 60;

      if (currentDec >= startDec && currentDec <= endDec) {
        activeEvent = evt;
      } else if (startDec > currentDec) {
        const diff = startDec - currentDec;
        if (diff < minUpcomingDiff) {
          minUpcomingDiff = diff;
          upcomingEvent = evt;
        }
      }
    });

    return { activeEvent, upcomingEvent };
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
  };

  // Toggle completed status
  const handleToggleCompleted = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextStatus = t.status === 'completed' ? 'in_progress' : 'completed';
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
  };

  // Render retro block progress bar (e.g. ██████░░░)
  const renderBlockBar = (completed: number, needed: number) => {
    const ratio = completed / needed;
    const blockCount = 10;
    const filledCount = Math.min(blockCount, Math.round(ratio * blockCount));
    const emptyCount = Math.max(0, blockCount - filledCount);
    
    const filled = '█'.repeat(filledCount);
    const empty = '░'.repeat(emptyCount);
    return (
      <span className="font-mono text-xs tracking-wider select-none bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">
        {filled}
        <span className="text-slate-700/60 font-medium">{empty}</span>
      </span>
    );
  };

  // Quick stats calculations
  const todayTasks = tasks.filter(t => !t.id.startsWith('task_prev_'));
  const completedCount = todayTasks.filter(t => t.status === 'completed').length;
  const pendingCount = todayTasks.filter(t => t.status !== 'completed').length;
  const totalHoursNeeded = Math.round(todayTasks.reduce((sum, t) => sum + (t.status !== 'completed' ? (t.hoursNeeded - t.hoursCompleted) : 0), 0) * 10) / 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-10"
      id="dashboard-view-container"
    >
      {/* Header Row */}
      <header className="flex justify-between items-center mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-sans tracking-tight">Overview</h1>
          <p className="text-sm text-slate-400 mt-1 font-sans">
            Welcome back. <strong className="text-blue-400 font-medium">{pendingCount} active workloads</strong> scheduled today.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            id="generate-plan-cta"
            onClick={refreshRisk}
            disabled={isLoadingRisk}
            className="text-sm px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_22px_rgba(139,92,246,0.45)] hover:scale-[1.02] active:scale-[0.98] shrink-0 border border-white/10"
          >
            <Sparkles className="w-4 h-4 text-blue-200 animate-pulse" />
            <span>{isLoadingRisk ? "Generating Plan..." : "Generate Today's AI Plan"}</span>
          </button>
          
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-mono">{tzLabel} TIME</p>
            <p className="text-sm font-bold text-slate-200 font-mono tracking-tight">{formattedTime}</p>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">{formattedDate}</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-white/10 bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
            <img src="https://ui-avatars.com/api/?name=Planner&background=2563eb&color=fff" alt="Avatar" referrerPolicy="no-referrer" />
          </div>
        </div>
      </header>

      {/* Morning Sleep Tracker Popup Prompt */}
      <AnimatePresence>
        {showSleepPrompt && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -15 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="bg-[#171F34] border border-blue-500/30 rounded-2xl relative overflow-hidden shadow-2xl p-5 mb-2"
            id="morning-sleep-prompt"
          >
            {/* Subtle background glow */}
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Dismiss button */}
            <button
              onClick={handleDismissSleep}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer p-1 rounded hover:bg-slate-800"
              title="Dismiss sleep details log for today"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/5">
                  <Moon className="w-5.5 h-5.5 text-blue-400 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">AI Doctor Prompt</span>
                    <h3 className="text-sm font-extrabold text-white font-sans tracking-tight">How did you sleep last night?</h3>
                  </div>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed font-sans">
                    Log bedtime and wake time to calibrate focus thresholds and predict burnout.
                  </p>
                </div>
              </div>

              {/* Inline interactive inputs */}
              <form onSubmit={handleSubmitSleep} className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 bg-slate-900/60 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Slept at:</span>
                  <input
                    type="time"
                    required
                    value={tempSlept}
                    onChange={(e) => setTempSlept(e.target.value)}
                    className="bg-[#0B1020] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500/50 [color-scheme:dark] cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Woke up:</span>
                  <input
                    type="time"
                    required
                    value={tempWoke}
                    onChange={(e) => setTempWoke(e.target.value)}
                    className="bg-[#0B1020] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500/50 [color-scheme:dark] cursor-pointer"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  Submit Log
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="stats-grid">
        {[
          { 
            label: "Tasks Left", 
            value: `${pendingCount}`, 
            icon: ListTodo, 
            color: "text-blue-400", 
            onClick: onNavigateToTasks, 
            clickable: true 
          },
          { 
            label: "Active Risk Index", 
            value: `${risk.riskScore}%`, 
            icon: AlertTriangle, 
            color: risk.riskScore > 60 ? "text-rose-400 animate-pulse" : "text-amber-400",
            onClick: onNavigateToDoctor,
            clickable: true
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              onClick={stat.onClick}
              className={`bg-[#171F34] border border-white/5 p-4 rounded-2xl flex items-center gap-3.5 relative overflow-hidden group ${
                stat.clickable ? 'cursor-pointer hover:border-blue-500/30' : ''
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 rounded-xl bg-slate-900/60 flex items-center justify-center border border-white/5 shrink-0">
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1">
                  {stat.label}
                  {stat.clickable && <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />}
                </p>
                <p className="text-lg font-bold text-slate-100 mt-0.5 truncate font-sans">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Parallel Daily Routine Monitor */}
      {(() => {
        const { activeEvent, upcomingEvent } = getCurrentActiveAndUpcoming();
        return (
          <div className="bg-[#171F34] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <CalendarIcon className="w-4.5 h-4.5 text-blue-400" />
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Routine Monitor (Parallel Tracker)</h3>
                <p className="text-[11px] text-slate-500">Live synchronization with your academic and training schedules.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Active Event */}
              {activeEvent ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                  <span className="animate-pulse">🟢</span>
                  <span className="font-bold">Active Now:</span>
                  <span>{getEventCategoryEmoji((activeEvent as any).category)} {(activeEvent as any).title}</span>
                  <span className="font-mono opacity-80 text-[10px]">({(activeEvent as any).startTime} - {(activeEvent as any).endTime})</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/40 border border-white/5 text-xs text-slate-400">
                  <span>⚪</span>
                  <span className="font-bold">Routine State:</span>
                  <span>No active routine clashes</span>
                </div>
              )}

              {/* Upcoming Event */}
              {upcomingEvent && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
                  <span>⏳</span>
                  <span className="font-bold">Next Up:</span>
                  <span>{getEventCategoryEmoji((upcomingEvent as any).category)} {(upcomingEvent as any).title}</span>
                  <span className="font-mono opacity-80 text-[10px]">at {(upcomingEvent as any).startTime}</span>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Main Grid: Left column (Tasks + Risk Meter) | Right column (Countdown + Suggestions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Today's Tasks Panel (6 Columns) */}
        <div className="lg:col-span-7 bg-[#171F34] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-white font-sans flex items-center gap-2.5">
                <ListTodo className="w-4.5 h-4.5 text-blue-500" />
                Today's Task Efficiency
              </h2>
              <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                Active Block
              </span>
            </div>

            <div className="space-y-4">
              {(() => {
                const activeTasks = tasks.filter(t => !t.id.startsWith('task_prev_') && t.status !== 'completed');
                
                if (activeTasks.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl bg-slate-900/40 border border-white/5">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xl mb-3">🎉</div>
                      <h4 className="text-sm font-semibold text-slate-200">All Tasks Completed!</h4>
                      <p className="text-xs text-slate-400 mt-1.5 max-w-sm font-sans leading-relaxed">
                        Fantastic job! You've cleared your active dashboard schedule. Enjoy your free time or manage routines in the calendar view.
                      </p>
                    </div>
                  );
                }

                return activeTasks.map((task) => {
                  const percentage = Math.round((task.hoursCompleted / task.hoursNeeded) * 100);
                  const isFocus = task.id === activeFocusTaskId;
                  const isHighRisk = risk.likelyToMiss.some(missTask => 
                    task.title.toLowerCase().includes(missTask.toLowerCase()) || 
                    missTask.toLowerCase().includes(task.title.toLowerCase())
                  );
                  
                  return (
                    <div 
                      key={task.id}
                      id={`task-item-${task.id}`}
                      onClick={() => setActiveFocusTaskId(task.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer group relative ${
                        isFocus 
                          ? isHighRisk
                            ? 'bg-[#251b24] border-rose-500/40 shadow-lg shadow-rose-500/5'
                            : 'bg-[#1d263d] border-white/10 shadow-lg shadow-blue-500/5' 
                          : isHighRisk
                            ? 'bg-[#1c1219] border-rose-500/20 hover:border-rose-500/35 hover:bg-[#251b24]/30'
                            : 'bg-[#0B1020]/30 border-white/5 hover:border-white/10 hover:bg-[#1d263d]/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        {/* Left info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                              task.status === 'completed' 
                                ? 'bg-emerald-500' 
                                : task.status === 'in_progress' 
                                  ? 'bg-blue-500 animate-pulse' 
                                  : 'bg-slate-600'
                            }`} />
                            <h3 className={`text-sm font-medium truncate ${
                              task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-200'
                            }`}>
                              {task.title}
                            </h3>
                            {isHighRisk && (
                              <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 flex items-center gap-1 shrink-0 uppercase tracking-wider animate-pulse">
                                ⚠️ High Risk
                              </span>
                            )}
                          </div>
  
                          {/* Blocky progress indicator & standard bar, or payment options */}
                          {task.category === 'Bill Payment' ? (
                            <div className="space-y-1 mt-3">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">Payment Option</span>
                                <span className="text-blue-400 font-bold uppercase text-[10px] tracking-wider font-mono">
                                  {task.paymentType === 'recurring' ? `Recurring (${task.cycleTime || 'Monthly'})` : 'One-time'}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {task.status === 'completed' ? '💳 Bill Paid & Completed' : '⏳ Pending Payment Due'}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2 mt-3">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">Task Completion</span>
                                <span className="text-slate-300 font-mono font-semibold">{percentage}%</span>
                              </div>
                              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    task.title === 'Assignment' 
                                      ? 'bg-blue-500' 
                                      : task.title === 'Exam Prep' 
                                        ? 'bg-purple-500' 
                                        : 'bg-orange-400'
                                  }`} 
                                  style={{ width: `${percentage}%` }} 
                                />
                              </div>
                            </div>
                          )}
                        </div>
  
                        {/* Right Control Actions */}
                        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <div className="text-right">
                            {task.category === 'Bill Payment' ? (
                              <>
                                <p className="text-xs font-semibold text-slate-300">
                                  {task.status === 'completed' ? 'Paid' : 'Unpaid'}
                                </p>
                                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                                  {task.deadlineHours > 0 ? `${Math.round(task.deadlineHours / 24) || 1}d left` : 'due today'}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-xs font-mono font-semibold text-slate-300">
                                  {formatTaskTime(task.hoursCompleted)} / {task.hoursNeeded}h
                                </p>
                                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                                  {task.deadlineHours > 0 ? `${task.deadlineHours}h left` : 'historical log'}
                                </p>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1.5 bg-slate-900/40 p-1 rounded-xl border border-white/5">
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
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-sans">
            <span>💡 Click any card to set active focus target.</span>
          </div>
        </div>

        {/* Risk Meter Panel (5 Columns) */}
        <div className={`lg:col-span-5 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 ${
          risk.riskScore > 60 
            ? 'bg-[#1e141a] border border-rose-500/30 shadow-[0_0_25px_rgba(244,63,94,0.1)]' 
            : 'bg-[#171F34] border border-white/5'
        }`}>
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Deadline Risk Meter</h3>
              <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                risk.riskScore > 60 
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                  : risk.riskScore > 35 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              }`}>
                {risk.riskScore > 60 ? "High Risk" : risk.riskScore > 35 ? "Medium Risk" : "Stable"}
              </span>
            </div>

            {/* Huge Risk Meter display */}
            <div className="flex flex-col items-center justify-center py-4 relative">
              {/* Outer Glow Ring */}
              <div className="w-32 h-32 rounded-full border-4 border-slate-800/60 flex items-center justify-center relative">
                <div 
                  className="absolute inset-0 rounded-full border-4 border-transparent transition-all duration-1000"
                  style={{
                    borderTopColor: risk.riskScore > 60 ? '#ef4444' : risk.riskScore > 35 ? '#f59e0b' : '#10b981',
                    borderRightColor: risk.riskScore > 50 ? (risk.riskScore > 60 ? '#ef4444' : '#f59e0b') : 'transparent',
                    transform: `rotate(${risk.riskScore * 3.6}deg)`
                  }}
                />
                
                <div className="text-center">
                  <span className={`text-4xl font-extrabold font-sans tracking-tight ${
                    risk.riskScore > 65 ? "text-rose-400" : risk.riskScore > 35 ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {risk.riskScore}%
                  </span>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 font-mono">Slippage Prob</p>
                </div>
              </div>

              {/* Likely to miss status */}
              <div className="mt-4 w-full text-center">
                <span className="text-xs font-medium text-slate-400 block font-sans">Bottleneck Risk:</span>
                {risk.likelyToMiss.length > 0 ? (
                  <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full mt-1.5 inline-block animate-pulse font-sans">
                    Likely to miss: {risk.likelyToMiss.join(", ")}
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mt-1.5 inline-block font-sans">
                    Perfect alignment. No expected slippages.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#0B1020]/60 border border-white/5 p-3.5 rounded-xl">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 font-mono">Analyzer Diagnosis</p>
            <p className="text-xs text-slate-300 leading-relaxed italic font-sans">
              "{risk.explanation}"
            </p>
          </div>
        </div>
      </div>

      {/* Second Row: Countdown & AI Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Real-time Focus Countdown (5 Columns) */}
        <div className="lg:col-span-5 bg-[#171F34] border border-white/5 rounded-2xl p-6 flex flex-col justify-between overflow-hidden relative">
          <div className="absolute -right-16 -bottom-16 w-36 h-36 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white font-sans flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-blue-500 animate-spin-slow" />
                Focus Countdown
              </h2>
              <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                Ticking
              </span>
            </div>

            <div className="text-center py-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1 font-mono">CURRENT FOCUS TARGET</span>
              <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 rounded-full inline-block truncate max-w-full">
                {focusTask ? focusTask.title : "No task selected"}
              </span>

              {/* Countdown Digits */}
              <div className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-white mt-6 flex items-center justify-center gap-1.5 select-none">
                <span className="bg-[#0B1020] rounded-xl px-3 py-2 border border-white/5 shadow-inner">
                  {String(countdownTime.hours).padStart(2, '0')}
                </span>
                <span className="text-slate-600 animate-pulse text-3xl">:</span>
                <span className="bg-[#0B1020] rounded-xl px-3 py-2 border border-white/5 shadow-inner">
                  {String(countdownTime.minutes).padStart(2, '0')}
                </span>
                <span className="text-slate-600 animate-pulse text-3xl">:</span>
                <span className="bg-[#0B1020] rounded-xl px-3 py-2 border border-white/5 shadow-inner text-blue-400/90">
                  {String(countdownTime.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3.5 mt-4">
            <button
              id="countdown-play-pause"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all shadow-md cursor-pointer ${
                isPlaying 
                  ? 'bg-amber-600/10 border-amber-500/20 text-amber-400 hover:bg-amber-600/20' 
                  : 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/20'
              }`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>
            
            <button
              id="reset-timer-btn"
              onClick={() => {
                if (focusTask) {
                  const targetHours = Math.floor(focusTask.deadlineHours);
                  const targetMinutes = Math.floor((focusTask.deadlineHours % 1) * 60) || 18;
                  setCountdownTime({ hours: targetHours, minutes: targetMinutes, seconds: 0 });
                }
              }}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-200 bg-[#0B1020]/80 border border-white/5 rounded-lg px-4 py-2 transition-all font-mono"
            >
              RESET BLOCK
            </button>
          </div>
        </div>

        {/* Proactive AI Suggestions Card (7 Columns) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-[#1C1A2E] via-[#171F34] to-[#121626] border border-purple-500/20 rounded-2xl p-6 flex flex-col justify-between shadow-[0_0_30px_rgba(139,92,246,0.06)] relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white font-sans flex items-center gap-2.5">
                <Sparkles className="w-4.5 h-4.5 text-purple-400" />
                AI Recommendations
              </h2>
              <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                Interactive
              </span>
            </div>

            {/* List of Suggestions */}
            <div className="space-y-3">
              {risk.suggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3.5 p-3.5 bg-[#0B1020]/30 border border-white/5 hover:border-blue-500/20 rounded-xl transition-all group"
                >
                  <div className="w-5 h-5 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <span className="text-[10px] font-bold text-purple-400 font-mono">0{index + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-200 leading-normal font-sans">
                      {suggestion}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-sans relative z-10">
            <span>✨ Recommendations updated dynamically by AI based on logged hours.</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
