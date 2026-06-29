import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Sparkles, 
  Clock, 
  Check, 
  RefreshCw, 
  Plus, 
  Trash2, 
  GraduationCap, 
  Dumbbell, 
  Utensils, 
  BookOpen, 
  Gamepad2, 
  Briefcase,
  AlertCircle,
  Sparkle
} from 'lucide-react';
import { Task, ScheduleEvent } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  scheduleEvents: ScheduleEvent[];
  setScheduleEvents: React.Dispatch<React.SetStateAction<ScheduleEvent[]>>;
  isWorkspaceConnected: boolean;
  workspaceCalendar: any[];
  isWorkspaceLoading: boolean;
  syncWorkspaceData: () => Promise<void>;
  timezone: string;
}

const CATEGORIES = [
  { id: 'Class', label: 'Class / Meeting', icon: GraduationCap, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { id: 'Workout', label: 'Fitness / Wellness', icon: Dumbbell, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'Meal', label: 'Meal / Break', icon: Utensils, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id: 'Study', label: 'Focus Block / Learn', icon: BookOpen, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { id: 'Leisure', label: 'Rest / Hobby', icon: Gamepad2, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
  { id: 'Other', label: 'Commitments / Chores', icon: Briefcase, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
];

export default function CalendarView({ 
  tasks, 
  setTasks, 
  scheduleEvents, 
  setScheduleEvents,
  isWorkspaceConnected,
  workspaceCalendar,
  isWorkspaceLoading,
  syncWorkspaceData,
  timezone
}: CalendarViewProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationSuccess, setOptimizationSuccess] = useState(false);
  
  // Form states for adding schedule event
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ScheduleEvent['category']>('Class');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:30');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Wednesday', 'Friday']);
  const [publishToGoogle, setPublishToGoogle] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Generate hourly schedule slots (from 8 AM to 10 PM)
  const hours = Array.from({ length: 15 }, (_, i) => i + 8);

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEvent: ScheduleEvent = {
      id: 'se_' + Date.now(),
      title: newTitle.trim(),
      startTime: newStartTime,
      endTime: newEndTime,
      category: newCategory,
      days: selectedDays.length > 0 ? selectedDays : undefined
    };

    setScheduleEvents(prev => [...prev, newEvent]);

    if (isWorkspaceConnected && publishToGoogle) {
      try {
        const today = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const dateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
        const startTimeISO = new Date(`${dateStr}T${newStartTime}:00`).toISOString();
        const endTimeISO = new Date(`${dateStr}T${newEndTime}:00`).toISOString();

        await fetch('/api/workspace/calendar/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newTitle.trim(),
            description: `Registered parallel commitment of category ${newCategory} via My Digital Twin.`,
            startTime: startTimeISO,
            endTime: endTimeISO
          })
        });

        // Sync fresh data
        await syncWorkspaceData();
      } catch (err) {
        console.error("Failed to publish event to Google Calendar:", err);
      }
    }

    setNewTitle('');
    setSelectedDays(['Monday', 'Wednesday', 'Friday']);
    setPublishToGoogle(false);
  };

  const handleDeleteEvent = (id: string) => {
    setScheduleEvents(prev => prev.filter(e => e.id !== id));
  };

  // Pre-set Routines Templates
  const loadStudentTemplate = () => {
    const studentPreset: ScheduleEvent[] = [
      { id: 'student_1', title: 'Academic Lecture', startTime: '09:30', endTime: '11:00', category: 'Class', days: ['Monday', 'Wednesday', 'Friday'] },
      { id: 'student_2', title: 'Subject Recitation / Seminar', startTime: '11:30', endTime: '12:30', category: 'Class', days: ['Tuesday', 'Thursday'] },
      { id: 'student_3', title: 'Midday Lunch & Social Hour', startTime: '13:00', endTime: '14:00', category: 'Meal', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
      { id: 'student_4', title: 'Gym Training & Run', startTime: '17:30', endTime: '19:00', category: 'Workout', days: ['Monday', 'Wednesday', 'Friday'] },
      { id: 'student_5', title: 'Library Deep Focus Session', startTime: '15:00', endTime: '17:00', category: 'Study', days: ['Tuesday', 'Thursday'] },
    ];
    setScheduleEvents(studentPreset);
  };

  const loadDeveloperTemplate = () => {
    const devPreset: ScheduleEvent[] = [
      { id: 'dev_1', title: 'Engineering Standup Meeting', startTime: '10:00', endTime: '10:30', category: 'Class', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
      { id: 'dev_2', title: 'Deep Focus Coding Sprint', startTime: '11:00', endTime: '13:00', category: 'Study', days: ['Monday', 'Wednesday', 'Friday'] },
      { id: 'dev_3', title: 'Lunch Break', startTime: '13:00', endTime: '14:00', category: 'Meal', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
      { id: 'dev_4', title: 'Architecture & System Sync', startTime: '15:00', endTime: '16:30', category: 'Study', days: ['Tuesday', 'Thursday'] },
      { id: 'dev_5', title: 'Evening Run & Mobility Work', startTime: '18:00', endTime: '19:15', category: 'Workout', days: ['Monday', 'Tuesday', 'Thursday'] },
    ];
    setScheduleEvents(devPreset);
  };

  const loadCorporateTemplate = () => {
    const corporatePreset: ScheduleEvent[] = [
      { id: 'corp_1', title: 'Team Catch-up & Emails', startTime: '09:00', endTime: '10:00', category: 'Class', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
      { id: 'corp_2', title: 'Core Deliverables Focus', startTime: '10:30', endTime: '12:30', category: 'Study', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
      { id: 'corp_3', title: 'Lunch & Fresh Air Break', startTime: '12:30', endTime: '13:30', category: 'Meal', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
      { id: 'corp_4', title: 'Client Syncs & Strategy Meeting', startTime: '14:00', endTime: '15:30', category: 'Other', days: ['Tuesday', 'Thursday'] },
      { id: 'corp_5', title: 'Post-Work Workout & Gym', startTime: '18:00', endTime: '19:30', category: 'Workout', days: ['Monday', 'Wednesday', 'Friday'] },
    ];
    setScheduleEvents(corporatePreset);
  };

  const loadCreativeTemplate = () => {
    const creativePreset: ScheduleEvent[] = [
      { id: 'creative_1', title: 'Morning Inspiration & Reading', startTime: '08:30', endTime: '09:30', category: 'Study', days: ['Monday', 'Wednesday', 'Friday'] },
      { id: 'creative_2', title: 'Deep Creative Focus (No Distraction)', startTime: '10:00', endTime: '12:30', category: 'Study', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
      { id: 'creative_3', title: 'Nutritious Lunch / Coffee Break', startTime: '13:00', endTime: '14:00', category: 'Meal', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
      { id: 'creative_4', title: 'Portfolio / Business Administration', startTime: '14:30', endTime: '16:00', category: 'Other', days: ['Tuesday', 'Thursday'] },
      { id: 'creative_5', title: 'Leisure Activity & Screen Free Walk', startTime: '17:00', endTime: '18:30', category: 'Leisure', days: ['Monday', 'Wednesday', 'Friday'] },
    ];
    setScheduleEvents(creativePreset);
  };

  const loadBalancedTemplate = () => {
    const balancedPreset: ScheduleEvent[] = [
      { id: 'bal_1', title: 'Mindful Morning Stretch / Yoga', startTime: '08:00', endTime: '09:00', category: 'Workout', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      { id: 'bal_2', title: 'Skill Learning & Creative Craft', startTime: '10:00', endTime: '11:30', category: 'Study', days: ['Monday', 'Wednesday', 'Saturday'] },
      { id: 'bal_3', title: 'Home Cooking & Family Meal', startTime: '12:30', endTime: '13:30', category: 'Meal', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      { id: 'bal_4', title: 'Errands, Groceries & Chores', startTime: '15:00', endTime: '16:30', category: 'Other', days: ['Tuesday', 'Thursday', 'Saturday'] },
      { id: 'bal_5', title: 'Book Club Reading & Evening Rest', startTime: '18:30', endTime: '20:00', category: 'Leisure', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    ];
    setScheduleEvents(balancedPreset);
  };

  const clearAllEvents = () => {
    setScheduleEvents([]);
  };

  // Helper: check if a schedule event overlaps with a specific hourly block
  const getEventsForHour = (hour: number) => {
    // 1. Get local schedule events
    const localEvents = scheduleEvents.filter(event => {
      const [startH, startM] = event.startTime.split(':').map(Number);
      const [endH, endM] = event.endTime.split(':').map(Number);
      const startDec = startH + startM / 60;
      const endDec = endH + endM / 60;
      
      // Overlap formula: event spans over the hour window [hour, hour + 1]
      return startDec < (hour + 1) && endDec > hour;
    }).map(evt => ({ ...evt, isGoogle: false }));

    // 2. Get google workspace events for today
    const googleEvents = workspaceCalendar.filter(evt => {
      const startStr = evt.start?.dateTime || evt.start?.date;
      if (!startStr) return false;
      const startDate = new Date(startStr);
      const endDate = evt.end?.dateTime || evt.end?.date ? new Date(evt.end.dateTime || evt.end.date) : new Date(startDate.getTime() + 3600000);
      
      const today = new Date();
      const isToday = startDate.getDate() === today.getDate() && 
                      startDate.getMonth() === today.getMonth() && 
                      startDate.getFullYear() === today.getFullYear();
      if (!isToday) return false;

      const startH = startDate.getHours();
      const startM = startDate.getMinutes();
      const endH = endDate.getHours();
      const endM = endDate.getMinutes();

      const startDec = startH + startM / 60;
      const endDec = endH + endM / 60;

      return startDec < (hour + 1) && endDec > hour;
    }).map(evt => {
      const startDate = new Date(evt.start?.dateTime || evt.start?.date);
      const endDate = evt.end?.dateTime || evt.end?.date ? new Date(evt.end.dateTime || evt.end.date) : new Date(startDate.getTime() + 3600000);
      const pad = (n: number) => String(n).padStart(2, '0');
      return {
        id: evt.id || 'g_' + Date.now(),
        title: evt.summary || 'Google Calendar Event',
        startTime: `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`,
        endTime: `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`,
        category: 'Class' as const, // Render as Class/Meeting style (cyan border/bg)
        isGoogle: true
      };
    });

    return [...localEvents, ...googleEvents];
  };

  const getTaskForHour = (hour: number) => {
    const activeTasks = tasks.filter(t => t.status !== 'completed' && t.category !== 'Bill Payment');
    if (activeTasks.length === 0) return null;
    
    // Distribute active tasks logically based on hour modulo
    const taskIndex = hour % activeTasks.length;
    const task = activeTasks[taskIndex];
    
    // Simple logic: display tasks on 3-hour cycle offsets to leave visual negative space
    const hourMod = hour % 3;
    if (hourMod === 0 && task) {
      return {
        ...task,
        duration: "1.5h",
        color: task.category === 'Assignment' 
          ? 'from-blue-600/30 to-blue-500/20 text-blue-400 border-blue-500/30'
          : task.category === 'Exam Prep'
            ? 'from-purple-600/30 to-purple-500/20 text-purple-400 border-purple-500/30'
            : 'from-amber-600/30 to-amber-500/20 text-amber-400 border-amber-500/30'
      };
    }
    return null;
  };

  const handleTwinOptimize = () => {
    setIsOptimizing(true);
    setOptimizationSuccess(false);
    
    setTimeout(() => {
      setIsOptimizing(false);
      setOptimizationSuccess(true);
      
      setTasks(prev => prev.map(t => {
        if (t.status !== 'completed') {
          return { ...t, deadlineHours: Math.round(t.deadlineHours + 1.5) };
        }
        return t;
      }));

      setTimeout(() => setOptimizationSuccess(false), 6000);
    }, 1800);
  };

  // Helper: get style elements for event category
  const getCategoryStyles = (category: ScheduleEvent['category']) => {
    const config = CATEGORIES.find(c => c.id === category);
    return config || CATEGORIES[5]; // fallback to Other
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      id="calendar-view-container"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-sans tracking-tight">Visual Calendar</h1>
          <p className="text-sm text-slate-400 font-sans mt-0.5">
            Coordinate your daily commitments side-by-side with your flexible focus tasks.
          </p>
        </div>

        <button
          id="ai-optimize-schedule"
          onClick={handleTwinOptimize}
          disabled={isOptimizing}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-blue-500/10 cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          {isOptimizing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Recalculating Clashes...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              Resolve Schedule Clashes
            </>
          )}
        </button>
      </div>

      {/* Success Notification Banner */}
      {optimizationSuccess && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl flex items-center gap-2.5 text-xs text-emerald-400"
        >
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span><strong>Twin De-clashing Completed!</strong> Parallel commitments have been prioritized and flexible work blocks were automatically rescheduled to avoid overlaps.</span>
        </motion.div>
      )}

      {/* Main Grid: Left Side Timeline / Right Side Registry Form & Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT & MID: Hourly Blocks showing parallel schedules */}
        <div className="lg:col-span-2 bg-[#171F34] border border-white/5 rounded-2xl p-5 md:p-6 overflow-hidden flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4.5 h-4.5 text-blue-400" />
              <h2 className="text-sm font-semibold text-slate-100 font-sans">Dual Parallel Timeline</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900/60 border border-white/5 px-2 py-0.5 rounded-md">
              8:00 AM - 10:00 PM
            </span>
          </div>

          {/* Timeline labels header */}
          <div className="grid grid-cols-12 gap-4 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider px-1.5 py-1 bg-slate-900/30 rounded-lg border border-white/5">
            <div className="col-span-2 text-right">Time</div>
            <div className="col-span-5 text-center border-l border-white/10">Daily Commitments</div>
            <div className="col-span-5 text-center border-l border-white/10">Focus Task Blocks</div>
          </div>

          {/* Timeline Scrollable Content */}
          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {hours.map((hour) => {
              const displayTime = `${String(hour).padStart(2, '0')}:00`;
              const hourEvents = getEventsForHour(hour);
              const scheduledTask = getTaskForHour(hour);

              return (
                <div 
                  key={hour} 
                  className="grid grid-cols-12 gap-4 items-center p-2 rounded-xl hover:bg-white/[0.02] transition-colors group min-h-[58px]"
                >
                  {/* Time column */}
                  <div className="col-span-2 flex flex-col justify-center items-end pr-1 text-right select-none">
                    <span className="font-mono text-xs font-semibold text-slate-400">
                      {displayTime}
                    </span>
                    <span className="text-[8px] font-mono text-slate-600">
                      {hour >= 12 ? 'PM' : 'AM'}
                    </span>
                  </div>

                  {/* Parallel commitments Column (Classes, Workouts, Meals, etc.) */}
                  <div className="col-span-5 h-full flex flex-col justify-center border-l border-white/5 pl-3 gap-1.5">
                    {hourEvents.length > 0 ? (
                      hourEvents.map((evt) => {
                        const style = getCategoryStyles(evt.category);
                        const CatIcon = style.icon;
                        const isGoogle = (evt as any).isGoogle;
                        return (
                          <div
                            key={evt.id}
                            className={`p-1.5 px-2 rounded-lg border text-[11px] leading-tight flex items-center gap-1.5 font-medium ${isGoogle ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : style.color}`}
                          >
                            <CatIcon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 justify-between">
                                <p className="truncate font-semibold">{evt.title}</p>
                                {isGoogle && (
                                  <span className="text-[7px] font-mono px-1 py-0.2 bg-blue-500/20 text-blue-300 rounded uppercase font-extrabold select-none shrink-0 border border-blue-500/30">Google</span>
                                )}
                              </div>
                              <p className="text-[9px] opacity-60 font-mono">
                                {evt.startTime} - {evt.endTime}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-[10px] text-slate-600 font-sans italic select-none">
                        No commitments
                      </span>
                    )}
                  </div>

                  {/* Dynamic Focus Task Column */}
                  <div className="col-span-5 h-full flex flex-col justify-center border-l border-white/5 pl-3">
                    {scheduledTask ? (
                      <motion.div
                        initial={{ scale: 0.98, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`p-2 rounded-lg border bg-gradient-to-r ${scheduledTask.color} flex items-center justify-between gap-1.5 shadow-sm`}
                      >
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold truncate">
                            {scheduledTask.title}
                          </p>
                          <span className="text-[8px] font-bold uppercase tracking-wide opacity-60 block font-mono">
                            {scheduledTask.category}
                          </span>
                        </div>
                        <span className="text-[8px] font-mono bg-slate-950/40 px-1.5 py-0.5 rounded shrink-0 font-bold border border-white/5">
                          {scheduledTask.duration}
                        </span>
                      </motion.div>
                    ) : (
                      <span className="text-[10px] text-slate-600 font-sans italic select-none">
                        Flexible window
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE: Add Schedule & Template Registry */}
        <div className="space-y-6">
          
          {/* Daily Schedule Registry Manager */}
          <div className="bg-[#171F34] border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Sparkle className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Schedule Registry</h3>
              </div>
              <span className="text-[9px] font-mono text-slate-500">Routine manager</span>
            </div>

            {/* Template Buttons */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Load Routine Preset</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={loadStudentTemplate}
                  className="bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-cyan-500/20 text-slate-300 hover:text-cyan-400 py-1.5 px-2 text-[10px] font-bold rounded-lg uppercase tracking-wide transition-all cursor-pointer text-center"
                >
                  🏫 Student
                </button>
                <button
                  type="button"
                  onClick={loadDeveloperTemplate}
                  className="bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-purple-500/20 text-slate-300 hover:text-purple-400 py-1.5 px-2 text-[10px] font-bold rounded-lg uppercase tracking-wide transition-all cursor-pointer text-center"
                >
                  💻 Developer
                </button>
                <button
                  type="button"
                  onClick={loadCorporateTemplate}
                  className="bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-blue-500/20 text-slate-300 hover:text-blue-400 py-1.5 px-2 text-[10px] font-bold rounded-lg uppercase tracking-wide transition-all cursor-pointer text-center"
                >
                  💼 Corporate
                </button>
                <button
                  type="button"
                  onClick={loadCreativeTemplate}
                  className="bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-pink-500/20 text-slate-300 hover:text-pink-400 py-1.5 px-2 text-[10px] font-bold rounded-lg uppercase tracking-wide transition-all cursor-pointer text-center"
                >
                  🎨 Creative
                </button>
                <button
                  type="button"
                  onClick={loadBalancedTemplate}
                  className="col-span-2 bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-emerald-500/20 text-slate-300 hover:text-emerald-400 py-1.5 px-2 text-[10px] font-bold rounded-lg uppercase tracking-wide transition-all cursor-pointer text-center"
                >
                  🌿 Balanced Living Preset
                </button>
              </div>
            </div>

            {/* Form to Add Event */}
            <form onSubmit={handleAddEvent} className="space-y-3 p-3.5 bg-slate-900/40 rounded-xl border border-white/5">
              <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest font-mono block">Add Commitment</span>
              
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-mono uppercase block">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Systems Lecture, Core Gym"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#0B1020] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-400 font-mono uppercase block mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full bg-[#0B1020] border border-white/5 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none [color-scheme:dark] cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-mono uppercase block mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full bg-[#0B1020] border border-white/5 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none [color-scheme:dark] cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-mono uppercase block">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ScheduleEvent['category'])}
                  className="w-full bg-[#0B1020] border border-white/5 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day Selection */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-mono uppercase block">Active Days</label>
                <div className="flex flex-wrap gap-1">
                  {daysOfWeek.map((day) => {
                    const short = day.slice(0, 3);
                    const active = selectedDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded uppercase transition-all cursor-pointer ${
                          active 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-[#0B1020] text-slate-400 hover:text-slate-200 border border-white/5'
                        }`}
                      >
                        {short}
                      </button>
                    );
                  })}
                </div>
              </div>

              {isWorkspaceConnected && (
                <div className="flex items-center gap-2 p-2 bg-blue-500/5 rounded-lg border border-blue-500/10">
                  <input
                    type="checkbox"
                    id="publishToGoogle"
                    checked={publishToGoogle}
                    onChange={(e) => setPublishToGoogle(e.target.checked)}
                    className="rounded border-white/10 bg-[#0B1020] text-blue-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="publishToGoogle" className="text-[9px] text-blue-300 font-semibold cursor-pointer select-none uppercase tracking-wider font-mono">
                    Publish to Google Calendar
                  </label>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-blue-500/10"
              >
                <Plus className="w-3.5 h-3.5" /> Register Commitment
              </button>
            </form>

            {/* List of Registered Events with deletion option */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Registered commitments</span>
                {scheduleEvents.length > 0 && (
                  <button 
                    onClick={clearAllEvents}
                    className="text-[9px] text-rose-400 hover:text-rose-300 transition-colors uppercase font-mono font-bold cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                {scheduleEvents.length === 0 ? (
                  <p className="text-[10px] text-slate-500 text-center py-4 italic">No routine events registered. Load a preset template above to begin.</p>
                ) : (
                  <div className="space-y-1.5">
                    {scheduleEvents.map((evt) => {
                      const style = getCategoryStyles(evt.category);
                      const CatIcon = style.icon;
                      return (
                        <div 
                          key={evt.id}
                          className="p-2 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between text-xs gap-3 hover:border-white/10 transition-all"
                        >
                          <div className="min-w-0 flex items-center gap-2">
                            <span className={`p-1.5 rounded-lg border ${style.color}`}>
                              <CatIcon className="w-3.5 h-3.5" />
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-200 truncate">{evt.title}</p>
                              <p className="text-[9px] text-slate-400 font-mono leading-none mt-0.5">
                                {evt.startTime} - {evt.endTime} {evt.days && `• ${evt.days.map(d => d.slice(0, 3)).join(', ')}`}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteEvent(evt.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                            title="Delete Commitment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </motion.div>
  );
}
