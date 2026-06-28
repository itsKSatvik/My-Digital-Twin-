import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  ChevronRight, 
  Sparkles, 
  AlertTriangle, 
  Calendar as CalendarIcon,
  Moon,
  ListTodo,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { Task, RiskAnalysis, ScheduleEvent } from '../types';

interface DashboardViewProps {
  tasks: Task[];
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
  handleToggleTracking: (id: string) => void;
  handleToggleCompleted: (id: string) => void;
  triggerManualReorganization?: () => void;
  isReorganizing?: boolean;
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
  risk,
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
  handleToggleTracking,
  handleToggleCompleted,
  triggerManualReorganization,
  isReorganizing = false
}: DashboardViewProps) {
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

  const tzLabel = getTimezoneLabel(timezone);

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
    } catch (e) {}

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

  const renderBlockBar = (completed: number, needed: number) => {
    const ratio = needed > 0 ? completed / needed : 0;
    const blockCount = 10;
    const filledCount = Math.min(blockCount, Math.round(ratio * blockCount));
    const emptyCount = Math.max(0, blockCount - filledCount);
    
    return (
      <span className="font-mono text-[10px] tracking-wider select-none bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">
        {'█'.repeat(filledCount)}
        <span className="text-slate-700/60 font-medium">{'░'.repeat(emptyCount)}</span>
      </span>
    );
  };

  const todayTasks = tasks.filter(t => !t.id.startsWith('task_prev_'));
  const { activeEvent, upcomingEvent } = getCurrentActiveAndUpcoming();

  // Extract task risk details from pre-calculated array or fallback
  const getTaskRiskDetails = (taskId: string) => {
    const matched = risk.tasksWithRisk?.find(r => r.id === taskId);
    if (matched) return matched;
    
    // Simple inline heuristic fallback
    const t = tasks.find(item => item.id === taskId);
    if (!t) return { riskLevel: 'low', explanation: 'No constraints.' };
    const work = t.hoursNeeded - t.hoursCompleted;
    if (work > t.deadlineHours) {
      return { riskLevel: 'high', explanation: 'Required workload exceeds safety margin.' };
    }
    return { riskLevel: 'low', explanation: 'Timeline comfortable.' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      id="dashboard-view-container"
    >
      {/* 1. Header Banner */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-brand-card/30 border border-brand-border/45 p-5 rounded-3xl gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-bold text-emerald-400 font-mono uppercase tracking-widest">Twin Engine Synced</span>
          </div>
          <h1 className="text-2xl font-extrabold text-brand-text-bright font-sans mt-0.5 tracking-tight">Intelligence Hub</h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {triggerManualReorganization && (
            <button
              id="twin-override-cta"
              onClick={triggerManualReorganization}
              disabled={isReorganizing}
              className="flex-1 sm:flex-initial bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <Zap className="w-3.5 h-3.5 text-blue-200 animate-bounce" />
              <span>{isReorganizing ? 'Analyzing Day...' : 'Intervene & Replan'}</span>
            </button>
          )}

          <div className="text-right hidden sm:block border-l border-brand-border pl-3">
            <p className="text-[9px] text-brand-text-muted font-mono">{tzLabel} TIME</p>
            <p className="text-xs font-bold text-brand-text font-mono">{formattedTime}</p>
          </div>
        </div>
      </header>

      {/* 2. Sleep Prompt Popup */}
      <AnimatePresence>
        {showSleepPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-brand-card-light to-brand-card border border-brand-accent/20 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl relative overflow-hidden"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-accent/10 border border-brand-accent/25 flex items-center justify-center text-brand-accent shrink-0">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-text-bright font-sans">How did you sleep last night?</h3>
                <p className="text-xs text-brand-text-muted font-sans mt-0.5">Logging rest hours informs your Digital Twin's cognitive stamina advisor.</p>
              </div>
            </div>

            <form onSubmit={handleSubmitSleep} className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={tempSlept}
                  onChange={e => setTempSlept(e.target.value)}
                  className="bg-brand-bg-inner border border-brand-border rounded-lg text-xs text-brand-text p-2 font-mono"
                />
                <span className="text-brand-text-muted text-xs">to</span>
                <input
                  type="time"
                  value={tempWoke}
                  onChange={e => setTempWoke(e.target.value)}
                  className="bg-brand-bg-inner border border-brand-border rounded-lg text-xs text-brand-text p-2 font-mono"
                />
              </div>
              <div className="flex items-center gap-2">
                <button type="submit" className="bg-brand-accent hover:opacity-95 text-white text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer">Log</button>
                <button type="button" onClick={handleDismissSleep} className="text-brand-text-muted hover:text-brand-text-bright text-xs px-2.5 py-2">Skip</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. The Digital Twin Intelligence Panel (Primary Crown Jewel Widget) */}
      <div className="w-full bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        {/* Abstract Glowing Indicator in Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row gap-6 items-stretch relative">
          {/* Twin Visual Persona Indicator (Left) */}
          <div className="flex flex-col items-center justify-center bg-indigo-950/40 border border-indigo-500/15 p-5 rounded-2xl shrink-0 text-center lg:w-48 gap-3">
            <div className="relative">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 bg-indigo-500/35 rounded-full animate-ping scale-110 opacity-70" />
              {/* Core Avatar */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border border-indigo-400 shadow-md">
                DT
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-200">My Digital Twin</p>
              <p className="text-[9px] font-mono text-indigo-400/85 mt-0.5 uppercase tracking-wider">Predictive Advisor</p>
            </div>
            
            {/* Dynamic Risk Ring Widget */}
            <div className="w-full border-t border-indigo-500/10 pt-3 flex flex-col items-center">
              <span className="text-[10px] text-slate-400">Day Risk Level</span>
              <span className={`text-xl font-black mt-1 font-mono tracking-tight ${
                risk.riskScore > 65 ? 'text-rose-400' : risk.riskScore > 35 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {risk.riskScore}%
              </span>
              <span className="text-[8px] text-slate-400/80 mt-0.5">
                {risk.riskScore > 65 ? 'Timeline Saturated' : risk.riskScore > 35 ? 'Moderate load' : 'Optimally aligned'}
              </span>
            </div>
          </div>

          {/* Dynamic Personalized Twin Statement & Insights (Right) */}
          <div className="flex-1 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest font-mono">Today's Day Analysis</span>
              </div>
              <blockquote className="text-sm md:text-base text-slate-100 font-medium tracking-tight mt-2.5 leading-relaxed pl-3 border-l-2 border-indigo-500/50 italic">
                "{risk.digitalTwinStatement || "I'm analyzing your day's objectives. Let me optimize your focus sessions."}"
              </blockquote>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-indigo-500/10 pt-4 mt-2">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-indigo-500/10">
                <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Productivity Buffer</p>
                <p className="text-xs font-bold text-slate-200 mt-1">{risk.productivitySummary || "Workload is fully synchronized."}</p>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-indigo-500/10">
                <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Predicted Completion</p>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{risk.predictedCompletionTimes || "7:30 PM"}</span>
                </div>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-indigo-500/10">
                <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Today's Priorities</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {risk.todayPriorities && risk.todayPriorities.length > 0 ? (
                    risk.todayPriorities.slice(0, 2).map((title, i) => (
                      <span key={i} className="text-[9px] font-bold bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 px-1.5 py-0.5 rounded">
                        {title}
                      </span>
                    ))
                  ) : (
                    <span className="text-[9px] text-slate-400">No active priorities</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Commitment Synchronizer Mini Ribbon */}
      <div className="bg-brand-card/40 border border-brand-border/40 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4.5 h-4.5 text-brand-accent" />
          <div>
            <h3 className="text-xs font-bold text-brand-text">Parallel Calendar Sync</h3>
            <p className="text-[10px] text-brand-text-muted">Auto-aligning study focus with external commitments.</p>
          </div>
        </div>

        <div className="flex gap-2.5 flex-wrap">
          {activeEvent ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Active Block:</span>
              <span className="font-bold">{getEventCategoryEmoji(activeEvent.category)} {activeEvent.title}</span>
            </div>
          ) : (
            <div className="text-xs text-brand-text-muted bg-brand-bg-inner/40 px-3 py-1 rounded-xl border border-brand-border">
              No calendar conflicts detected
            </div>
          )}
          {upcomingEvent && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400">
              <span>Next Commitment: {upcomingEvent.startTime}</span>
              <span className="font-bold">{getEventCategoryEmoji(upcomingEvent.category)} {upcomingEvent.title}</span>
            </div>
          )}
        </div>
      </div>

      {/* 5. Main Double Column: Daily Objectives (7 Columns) & Proactive Schedule Optimizations (5 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Active Daily Objectives with task-level risks */}
        <div className="lg:col-span-7 bg-brand-card border border-brand-border rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 border-b border-brand-border pb-3">
            <h2 className="text-sm font-bold text-brand-text-bright flex items-center gap-2">
              <ListTodo className="w-4.5 h-4.5 text-brand-accent" />
              Active Daily Objectives
            </h2>
            <button onClick={onNavigateToTasks} className="text-xs text-brand-accent hover:opacity-80 flex items-center gap-0.5 font-sans cursor-pointer bg-transparent border-0">
              Manage All <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="text-center py-10 bg-brand-bg-inner/30 border border-brand-border rounded-xl">
                <span className="text-2xl">🎉</span>
                <p className="text-xs text-brand-text-muted mt-2 font-sans">All tasks cleared. Perfect performance today.</p>
              </div>
            ) : (
              todayTasks.map(task => {
                const isActiveFocus = task.id === activeFocusTaskId;
                const riskDetails = getTaskRiskDetails(task.id);
                
                return (
                  <div
                    key={task.id}
                    onClick={() => setActiveFocusTaskId(task.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isActiveFocus 
                        ? 'bg-brand-card-light border-indigo-500/35 shadow-md' 
                        : 'bg-brand-bg-inner/20 border-brand-border hover:border-brand-accent/20'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                            task.priority === 'high' 
                              ? 'bg-rose-500/15 text-rose-400' 
                              : task.priority === 'medium' 
                                ? 'bg-amber-500/15 text-amber-400' 
                                : 'bg-slate-700/30 text-slate-400'
                          }`}>
                            {task.priority.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-medium text-brand-text-muted font-sans">{task.category}</span>
                          
                          {/* Task-Level Risk Level Badge */}
                          <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                            riskDetails.riskLevel === 'high' 
                              ? 'bg-rose-600/20 text-rose-400 border border-rose-500/20 animate-pulse' 
                              : riskDetails.riskLevel === 'medium' 
                                ? 'bg-amber-600/20 text-amber-400' 
                                : 'bg-emerald-600/20 text-emerald-400'
                          }`}>
                            {riskDetails.riskLevel.toUpperCase()} RISK
                          </span>
                        </div>

                        <h3 className={`text-xs font-semibold mt-1.5 ${task.status === 'completed' ? 'text-brand-text-muted line-through opacity-80' : 'text-brand-text'}`}>
                          {task.title}
                        </h3>

                        {/* Task Risk Explanation */}
                        {task.status !== 'completed' && (
                          <p className={`text-[10px] mt-1 font-sans leading-normal ${
                            riskDetails.riskLevel === 'high' 
                              ? 'text-rose-400/90 font-medium' 
                              : riskDetails.riskLevel === 'medium' 
                                ? 'text-amber-400/95' 
                                : 'text-slate-400/80'
                          }`}>
                            ⚠️ {riskDetails.explanation}
                          </p>
                        )}

                        <div className="mt-2.5 flex items-center gap-2.5">
                          {renderBlockBar(task.hoursCompleted, task.hoursNeeded)}
                          <span className="text-[10px] text-brand-text-muted font-mono">
                            {task.hoursCompleted.toFixed(1)} / {task.hoursNeeded}h completed ({task.deadlineHours.toFixed(1)}h left)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                        {task.status !== 'completed' && (
                          <button
                            onClick={() => handleToggleTracking(task.id)}
                            className={`w-7.5 h-7.5 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                              task.isTracking 
                                ? 'bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 animate-pulse' 
                                : 'bg-brand-accent/10 hover:bg-brand-accent border border-brand-accent/15 text-brand-accent hover:text-white'
                            }`}
                          >
                            {task.isTracking ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleCompleted(task.id)}
                          className={`w-7.5 h-7.5 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                            task.status === 'completed' 
                              ? 'bg-emerald-500 text-white shadow-sm border-0' 
                              : 'bg-brand-bg-inner/80 hover:bg-emerald-500/15 border border-brand-border text-brand-text-muted hover:text-emerald-500'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Twin Proactive Optimizations & Schedule Changes */}
        <div className="lg:col-span-5 bg-gradient-to-br from-brand-card to-brand-card/80 border border-indigo-500/10 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-brand-border pb-3 mb-4">
              <h2 className="text-brand-text-bright font-bold flex items-center gap-2 text-sm">
                <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
                Suggested Adjustments
              </h2>
              <span className="text-[9px] text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                Predictive Action
              </span>
            </div>

            {/* List of Suggested Schedule Routine Optimizations */}
            <div className="space-y-3.5">
              <p className="text-[10px] text-slate-400 font-medium">To protect your critical work and secure your sleep schedule, I suggest these routine changes:</p>
              {risk.suggestedScheduleChanges && risk.suggestedScheduleChanges.length > 0 ? (
                risk.suggestedScheduleChanges.map((change, idx) => (
                  <div key={idx} className="bg-brand-bg-inner/20 border border-brand-border/40 p-3.5 rounded-xl flex items-start gap-3">
                    <div className="w-5.5 h-5.5 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-[10px] font-mono shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      {change}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center bg-slate-900/40 border border-brand-border rounded-xl">
                  <p className="text-xs text-slate-400">All routines perfectly aligned today.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-brand-border/40 text-[10px] text-brand-text-muted italic font-sans flex justify-between items-center">
            <span>Adaptive digital optimizer syncing</span>
            <span className="text-emerald-500 font-bold font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ACTIVE
            </span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
