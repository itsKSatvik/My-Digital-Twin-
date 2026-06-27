import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  AlertTriangle, 
  Heart, 
  Clock, 
  CheckCircle2, 
  Youtube, 
  Users, 
  Brain, 
  Zap, 
  Plus, 
  Trash2, 
  TrendingUp, 
  ShieldCheck, 
  Coffee, 
  Smartphone, 
  Laptop,
  Moon
} from 'lucide-react';
import { Task } from '../types';

interface AppActivity {
  id: string;
  name: string;
  category: 'Distraction' | 'Meeting' | 'Planning' | 'Focused Work';
  hours: number;
  timeOfDay: 'Morning' | 'Post-Lunch' | 'Evening';
}

interface AIDoctorViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  lunchStart: string;
  lunchEnd: string;
  lunchStatus: 'pending' | 'completed' | 'skipped' | 'snoozed';
  setLunchStatus: (status: 'pending' | 'completed' | 'skipped' | 'snoozed') => void;
  triggerLunchPopup: () => void;
  lunchRecords: Array<{ time: string; status: 'completed' | 'skipped' }>;
  setLunchRecords: React.Dispatch<React.SetStateAction<Array<{ time: string; status: 'completed' | 'skipped' }>>>;
  sleepRecords: Array<{ date: string; sleptAt: string; wokeAt: string; hours: number }>;
  setSleepRecords: React.Dispatch<React.SetStateAction<Array<{ date: string; sleptAt: string; wokeAt: string; hours: number }>>>;
  sleepSleptTime: string;
  sleepWokeTime: string;
  onLogSleepToday: (sleptAt: string, wokeAt: string) => void;
  getTodayDateString: (tz: string) => string;
  timezone: string;
}

export default function AIDoctorView({
  tasks,
  setTasks,
  lunchStart,
  lunchEnd,
  lunchStatus,
  setLunchStatus,
  triggerLunchPopup,
  lunchRecords,
  setLunchRecords,
  sleepRecords,
  setSleepRecords,
  sleepSleptTime,
  sleepWokeTime,
  onLogSleepToday,
  getTodayDateString,
  timezone
}: AIDoctorViewProps) {
  // Local state for app activities
  const [activities, setActivities] = useState<AppActivity[]>(() => {
    const saved = localStorage.getItem('dt_activities');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      { id: 'act_1', name: 'YouTube (Chill & Lofi)', category: 'Distraction', hours: 2.3, timeOfDay: 'Post-Lunch' },
      { id: 'act_2', name: 'Sprint Catch-up & General Alignment', category: 'Meeting', hours: 2.5, timeOfDay: 'Morning' },
      { id: 'act_3', name: 'Drafting Task Milestones', category: 'Planning', hours: 0.5, timeOfDay: 'Morning' },
      { id: 'act_4', name: 'Technical Code Sandbox & Editor', category: 'Focused Work', hours: 1.8, timeOfDay: 'Morning' },
      { id: 'act_5', name: 'Scrolling Tech Feeds', category: 'Distraction', hours: 1.2, timeOfDay: 'Post-Lunch' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('dt_activities', JSON.stringify(activities));
  }, [activities]);

  // Form states for adding activities
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'Distraction' | 'Meeting' | 'Planning' | 'Focused Work'>('Distraction');
  const [newHours, setNewHours] = useState(1.0);
  const [newTimeOfDay, setNewTimeOfDay] = useState<'Morning' | 'Post-Lunch' | 'Evening'>('Post-Lunch');

  // Form states for custom sleep entry
  const [localSlept, setLocalSlept] = useState(sleepSleptTime || '23:00');
  const [localWoke, setLocalWoke] = useState(sleepWokeTime || '07:00');

  const handleLocalSleepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogSleepToday(localSlept, localWoke);
  };

  const isSleepLate = (timeStr: string): boolean => {
    if (!timeStr) return false;
    const [h] = timeStr.split(':').map(Number);
    return h >= 0 && h < 5;
  };

  // Applied Fixes tracking state
  const [appliedFixes, setAppliedFixes] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('dt_applied_fixes');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('dt_applied_fixes', JSON.stringify(appliedFixes));
  }, [appliedFixes]);

  // Handle adding new activities
  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newAct: AppActivity = {
      id: `act_${Date.now()}`,
      name: newName,
      category: newCategory,
      hours: Number(newHours),
      timeOfDay: newTimeOfDay
    };
    setActivities(prev => [newAct, ...prev]);
    setNewName('');
    setNewHours(1.0);
  };

  // Handle deleting activity
  const handleDeleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  // Toggle dynamic prescription
  const toggleFix = (fixId: string) => {
    setAppliedFixes(prev => {
      const next = { ...prev, [fixId]: !prev[fixId] };
      // Perform side-effects based on activated fix
      if (fixId === 'youtube_block' && next[fixId]) {
        // Automatically inject restrictive metrics
      }
      return next;
    });
  };

  // Dynamic calculations for diagnosis
  const totalYoutubeHours = activities
    .filter(a => a.category === 'Distraction' && a.name.toLowerCase().includes('youtube'))
    .reduce((sum, a) => sum + a.hours, 0);

  const totalDistractionsPostLunch = activities
    .filter(a => a.category === 'Distraction' && a.timeOfDay === 'Post-Lunch')
    .reduce((sum, a) => sum + a.hours, 0);

  const totalMeetingHours = activities
    .filter(a => a.category === 'Meeting')
    .reduce((sum, a) => sum + a.hours, 0);

  const planningTasksCount = tasks.filter(t => t.category === 'Assignment' || t.category === 'Exam Prep').length;
  // Compute planning risk bias
  const estimationDeviationPercent = 125; // Default reference simulation metric

  // Sleep analysis calculations
  const latestSleep = sleepRecords[0];
  const latestSleepHours = latestSleep ? latestSleep.hours : 0;
  const latestSleepBedtimeLate = latestSleep ? isSleepLate(latestSleep.sleptAt) : false;

  // Determine severity and alerts
  const showYouTubeAlert = totalYoutubeHours > 1.0;
  const showPostLunchAlert = totalDistractionsPostLunch > 1.0;
  const showMeetingAlert = totalMeetingHours > 2.0;
  const showPlanningAlert = planningTasksCount > 0;
  const showSkipMealAlert = lunchStatus === 'skipped' || lunchRecords.some(r => r.status === 'skipped');
  const showSleepDeficitAlert = latestSleepHours > 0 && latestSleepHours < 7.0;
  const showSleepLateAlert = latestSleepBedtimeLate;
  const showAnySleepAlert = showSleepDeficitAlert || showSleepLateAlert;

  // Compute Focus Pathology score
  let pathologicalDeductions = 0;
  if (showYouTubeAlert) pathologicalDeductions += 25;
  if (showPostLunchAlert) pathologicalDeductions += 20;
  if (showMeetingAlert) pathologicalDeductions += 15;
  if (showPlanningAlert) pathologicalDeductions += 10;
  if (showSkipMealAlert) pathologicalDeductions += 25;
  if (showSleepDeficitAlert) pathologicalDeductions += 20;
  if (showSleepLateAlert) pathologicalDeductions += 15;

  const healthScore = Math.max(10, 100 - pathologicalDeductions);

  // Status diagnosis label
  const getDiagnosisLabel = () => {
    if (healthScore >= 85) return { text: 'Nourished & Optimal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' };
    if (healthScore >= 60) return { text: 'Mild Fatigue & Time Leaks', color: 'text-amber-400 bg-amber-500/10 border-amber-500/25' };
    return { text: 'Critical Attention Deficit', color: 'text-rose-400 bg-rose-500/10 border-rose-500/25' };
  };

  const statusLabel = getDiagnosisLabel();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      id="ai-doctor-view-container"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-sans tracking-tight flex items-center gap-2.5">
            <span className="p-1.5 bg-rose-500/15 rounded-lg border border-rose-500/30">
              <Activity className="w-7 h-7 text-rose-500 animate-pulse" />
            </span>
            AI Doctor
          </h1>
          <p className="text-sm text-slate-400 font-sans mt-1">
            Analyzing device activity, meal logs, and planning bias to cure chronic time management failures.
          </p>
        </div>

        {/* Quick Lunch Simulator Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={triggerLunchPopup}
            className="px-3.5 py-1.5 bg-blue-600/25 hover:bg-blue-600 border border-blue-500/30 hover:border-blue-400 text-blue-200 hover:text-white transition-all text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            <Coffee className="w-3.5 h-3.5 animate-bounce" />
            Test Meal Reminder Alarm
          </button>
        </div>
      </div>

      {/* Main Grid: Health Status & Activity logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Panel: Diagnostic Scanner (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Clinical Diagnostic Summary */}
          <div className="bg-[#171F34] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute right-0 top-0 w-36 h-36 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-300 font-sans uppercase tracking-wider">Clinical Pathology Report</h3>
                <p className="text-[11px] text-slate-500 font-mono">ID: AI-PHYS-X9202</p>
              </div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-lg font-sans border ${statusLabel.color}`}>
                {statusLabel.text}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Health Score Dial */}
              <div className="flex flex-col items-center justify-center text-center p-3.5 bg-slate-900/40 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Cognitive Integrity</span>
                <div className="text-4xl font-extrabold font-mono text-white mt-2 flex items-baseline">
                  {healthScore}
                  <span className="text-xs text-slate-500 font-semibold">/100</span>
                </div>
                {/* Micro visual gauge */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      healthScore >= 80 ? 'bg-emerald-500' : healthScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`} 
                    style={{ width: `${healthScore}%` }}
                  />
                </div>
              </div>

              {/* Distraction Stats */}
              <div className="space-y-2.5 p-3.5 bg-slate-900/40 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Distraction Exposure</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold font-mono text-slate-200">
                    {(totalYoutubeHours + totalDistractionsPostLunch).toFixed(1)}h
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans">logged today</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {totalYoutubeHours > 1.5 
                    ? "⚠️ Severe focus leaks on entertainment tabs." 
                    : "✓ Entertainment exposure is within thresholds."}
                </p>
              </div>

              {/* Meal Health Tracker */}
              <div className="space-y-2.5 p-3.5 bg-slate-900/40 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Nutritional Balance</span>
                <div className="flex items-center gap-2 mt-1">
                  <Heart className={`w-5 h-5 shrink-0 ${showSkipMealAlert ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`} />
                  <span className="text-xs font-semibold text-slate-200">
                    {lunchStatus === 'completed' ? 'Nourished Meal Recorded' : 
                     lunchStatus === 'skipped' ? '⚠️ MEAL SKIPPED!' : 'Pending Schedule'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {showSkipMealAlert 
                    ? "⛔ Alarm: Glucose deficiency increases afternoon brain fog by 120%." 
                    : "Meal intervals are properly structured."}
                </p>
              </div>

              {/* Sleep Health Tracker */}
              <div className="space-y-2.5 p-3.5 bg-slate-900/40 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Sleep Metrics</span>
                <div className="flex items-center gap-2 mt-1">
                  <Moon className={`w-5 h-5 shrink-0 ${showSleepDeficitAlert ? 'text-rose-400 animate-pulse' : 'text-blue-400'}`} />
                  <span className="text-xs font-semibold text-slate-200">
                    {latestSleep ? `${latestSleepHours}h Rest Logged` : 'No Log Today'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {latestSleep ? (
                    showSleepDeficitAlert 
                      ? `⚠️ Sleep debt: ${latestSleepHours}h rest logged (7h minimum limit).`
                      : showSleepLateAlert
                        ? `⏰ Late sleep: bedtime at ${latestSleep.sleptAt} shifts your circadian curve.`
                        : "✓ Sleep parameters are fully optimal."
                  ) : (
                    "Please fill today's sleep log on Dashboard."
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Diagnosis prescriptions */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300 font-sans uppercase tracking-wider flex items-center gap-2">
              <Brain className="w-4 h-4 text-rose-500" />
              Dynamic Clinical Diagnoses
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Diagnosis 1: Post Lunch Slump */}
              <div className={`p-5 rounded-2xl border transition-all ${
                showPostLunchAlert 
                  ? 'bg-amber-500/5 border-amber-500/20 shadow-md' 
                  : 'bg-slate-900/20 border-white/5 opacity-80'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <TrendingUp className="w-4 h-4 text-amber-500" />
                    </span>
                    <h4 className="text-xs font-bold text-slate-200 font-sans">Post-Lunch Lethargy Loop</h4>
                  </div>
                  {showPostLunchAlert ? (
                    <span className="px-1.5 py-0.5 text-[9px] bg-amber-500/15 border border-amber-500/30 rounded font-bold uppercase text-amber-400">
                      Detected
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 text-[9px] bg-slate-800 border border-white/5 rounded font-bold uppercase text-slate-500">
                      Stable
                    </span>
                  )}
                </div>
                
                <p className="text-[11px] text-slate-400 leading-relaxed mt-3">
                  Your efficiency falls to 22% and distraction times spike right after lunch. Glycemic spikes trigger metabolic lethargy.
                </p>

                <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center justify-between gap-4">
                  <div className="text-[10px] text-slate-400 font-sans">
                    <span className="font-semibold text-amber-300">Prescription:</span> 15m Post-Meal Walk & Buffer
                  </div>
                  <button
                    onClick={() => toggleFix('lunch_buffer')}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-semibold transition-all cursor-pointer ${
                      appliedFixes['lunch_buffer']
                        ? 'bg-emerald-500 text-white font-bold'
                        : 'bg-slate-800 border border-white/10 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {appliedFixes['lunch_buffer'] ? '✓ Fix Active' : 'Apply Fix'}
                  </button>
                </div>
              </div>

              {/* Diagnosis 2: Meeting Overrun */}
              <div className={`p-5 rounded-2xl border transition-all ${
                showMeetingAlert 
                  ? 'bg-rose-500/5 border-rose-500/20 shadow-md' 
                  : 'bg-slate-900/20 border-white/5 opacity-80'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30">
                      <Users className="w-4 h-4 text-rose-500" />
                    </span>
                    <h4 className="text-xs font-bold text-slate-200 font-sans">Meeting Bloat Fatigue</h4>
                  </div>
                  {showMeetingAlert ? (
                    <span className="px-1.5 py-0.5 text-[9px] bg-rose-500/15 border border-rose-500/30 rounded font-bold uppercase text-rose-400">
                      Severe
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 text-[9px] bg-slate-800 border border-white/5 rounded font-bold uppercase text-slate-500">
                      Stable
                    </span>
                  )}
                </div>
                
                <p className="text-[11px] text-slate-400 leading-relaxed mt-3">
                  Sync meetings average {totalMeetingHours} hours. Cognitive energy degrades exponentially after 40 minutes of passive listening.
                </p>

                <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center justify-between gap-4">
                  <div className="text-[10px] text-slate-400 font-sans">
                    <span className="font-semibold text-rose-300">Prescription:</span> 25-Min Meeting Cutoff Alerts
                  </div>
                  <button
                    onClick={() => toggleFix('meeting_cutoff')}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-semibold transition-all cursor-pointer ${
                      appliedFixes['meeting_cutoff']
                        ? 'bg-emerald-500 text-white font-bold'
                        : 'bg-slate-800 border border-white/10 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {appliedFixes['meeting_cutoff'] ? '✓ Fix Active' : 'Apply Fix'}
                  </button>
                </div>
              </div>

              {/* Diagnosis 3: Unrealistic Planning Bias */}
              <div className={`p-5 rounded-2xl border transition-all ${
                showPlanningAlert 
                  ? 'bg-blue-500/5 border-blue-500/20 shadow-md' 
                  : 'bg-slate-900/20 border-white/5 opacity-80'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <Brain className="w-4 h-4 text-blue-500" />
                    </span>
                    <h4 className="text-xs font-bold text-slate-200 font-sans">Unrealistic Estimation Bias</h4>
                  </div>
                  {showPlanningAlert ? (
                    <span className="px-1.5 py-0.5 text-[9px] bg-blue-500/15 border border-blue-500/30 rounded font-bold uppercase text-blue-400">
                      High Bias
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 text-[9px] bg-slate-800 border border-white/5 rounded font-bold uppercase text-slate-500">
                      Consistent
                    </span>
                  )}
                </div>
                
                <p className="text-[11px] text-slate-400 leading-relaxed mt-3">
                  Historical data indicates a +{estimationDeviationPercent}% error in task estimations. Complex study tasks require structural buffer multipliers.
                </p>

                <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center justify-between gap-4">
                  <div className="text-[10px] text-slate-400 font-sans">
                    <span className="font-semibold text-blue-300">Prescription:</span> 1.3x Auto Time Padding
                  </div>
                  <button
                    onClick={() => toggleFix('estimation_multiplier')}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-semibold transition-all cursor-pointer ${
                      appliedFixes['estimation_multiplier']
                        ? 'bg-emerald-500 text-white font-bold'
                        : 'bg-slate-800 border border-white/10 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {appliedFixes['estimation_multiplier'] ? '✓ Fix Active' : 'Apply Fix'}
                  </button>
                </div>
              </div>

              {/* Diagnosis 4: YouTube Distraction Drainage */}
              <div className={`p-5 rounded-2xl border transition-all ${
                showYouTubeAlert 
                  ? 'bg-rose-500/5 border-rose-500/20 shadow-md' 
                  : 'bg-slate-900/20 border-white/5 opacity-80'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30">
                      <Youtube className="w-4 h-4 text-red-500" />
                    </span>
                    <h4 className="text-xs font-bold text-slate-200 font-sans">Entertainment Drainage Leak</h4>
                  </div>
                  {showYouTubeAlert ? (
                    <span className="px-1.5 py-0.5 text-[9px] bg-red-500/15 border border-red-500/30 rounded font-bold uppercase text-red-400 animate-pulse">
                      Critical
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 text-[9px] bg-slate-800 border border-white/5 rounded font-bold uppercase text-slate-500">
                      Stable
                    </span>
                  )}
                </div>
                
                <p className="text-[11px] text-slate-400 leading-relaxed mt-3">
                  YouTube streaming and social loops absorbed {totalYoutubeHours}h today, primarily during study blocks when code is stuck.
                </p>

                <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center justify-between gap-4">
                  <div className="text-[10px] text-slate-400 font-sans">
                    <span className="font-semibold text-red-300">Prescription:</span> Force block Distracting websites
                  </div>
                  <button
                    onClick={() => toggleFix('youtube_block')}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-semibold transition-all cursor-pointer ${
                      appliedFixes['youtube_block']
                        ? 'bg-emerald-500 text-white font-bold'
                        : 'bg-slate-800 border border-white/10 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {appliedFixes['youtube_block'] ? '✓ Fix Active' : 'Apply Fix'}
                  </button>
                </div>
              </div>

              {/* Diagnosis 5: Skipping Meals Warning */}
              {showSkipMealAlert && (
                <div className="col-span-1 md:col-span-2 p-5 rounded-2xl border bg-rose-500/10 border-rose-500/30 shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40">
                        <Heart className="w-4 h-4 text-rose-500" />
                      </span>
                      <h4 className="text-xs font-extrabold text-white font-sans">ALERT: Skipping Meals Pathology Detected</h4>
                    </div>
                    <span className="px-1.5 py-0.5 text-[9px] bg-rose-500/25 border border-rose-500/40 rounded font-bold uppercase text-rose-300 animate-pulse">
                      Urgent Care
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-rose-200 leading-relaxed mt-3 font-sans">
                    Your meal records indicate skipping lunch! Skipping meals deprives the brain of vital glycogen, causing attention fatigue to rise by 140% and making you highly vulnerable to cheap dopamine distractions like YouTube and tech feeds in subsequent hours.
                  </p>

                  <div className="mt-4 pt-3.5 border-t border-rose-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span className="text-[10px] text-rose-300 font-mono">
                      <strong>AI Doctor Advice</strong>: Always pause for meals. A nourished body sustains focus without cognitive decay.
                    </span>
                    <button
                      onClick={() => {
                        setLunchStatus('completed');
                        setLunchRecords(prev => [{ time: new Date().toLocaleTimeString(), status: 'completed' }, ...prev]);
                      }}
                      className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1 text-[10px] font-bold rounded-lg uppercase transition-all shadow-md cursor-pointer self-end"
                    >
                      Undo Skip & Log Balanced Meal
                    </button>
                  </div>
                </div>
              )}

              {/* Diagnosis 6: Sleep & Circadian rhythm (Only shown if needed!) */}
              {showAnySleepAlert && (
                <div className="col-span-1 md:col-span-2 p-5 rounded-2xl border bg-blue-500/10 border-blue-500/30 shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-500/40">
                        <Moon className="w-4 h-4 text-blue-400" />
                      </span>
                      <h4 className="text-xs font-extrabold text-white font-sans">ALERT: Sleep Schedule Pathology Detected</h4>
                    </div>
                    <span className="px-1.5 py-0.5 text-[9px] bg-blue-500/25 border border-blue-500/40 rounded font-bold uppercase text-blue-300 animate-pulse">
                      Needs Adjustment
                    </span>
                  </div>
                  
                  <div className="space-y-3 mt-3 text-[11px] text-slate-300 font-sans leading-relaxed">
                    {showSleepDeficitAlert && (
                      <p>
                        ⚠️ <strong className="text-amber-300">Sleep Deprivation Alert ({latestSleepHours}h logged)</strong>: You slept less than the 7-hour clinical threshold. This triggers a 30% drop in cognitive focus and increases the likelihood of afternoon distractions. AI Doctor recommends taking a 15-minute power nap between 1:30 PM and 2:30 PM to offset today's sleep debt.
                      </p>
                    )}
                    {showSleepLateAlert && (
                      <p>
                        ⏰ <strong className="text-blue-300">Circadian Misalignment Alert (Bedtime: {latestSleep?.sleptAt})</strong>: Your sleep started after midnight. Melatonin and deep-sleep phase cycles are most restorative before 2:00 AM. Sleep delay shifts your productivity curve, leading to post-lunch brain fog. AI Doctor advises locking all screens 30 minutes before bed and using a blue-light filter.
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-blue-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span className="text-[10px] text-blue-300 font-mono">
                      <strong>AI Doctor Advice</strong>: Consistent circadian rhythms strengthen willpower and eliminate brain fog.
                    </span>
                    <button
                      onClick={() => {
                        onLogSleepToday('22:30', '06:30');
                      }}
                      className="bg-[#171F34] hover:bg-slate-800 border border-white/5 text-slate-300 px-3 py-1 text-[10px] font-bold rounded-lg uppercase transition-all shadow-md cursor-pointer self-end"
                    >
                      Log Ideal Rest Profile
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Right Panel: Active Application Tracking Details Logs (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Tracker Activity Logs Container */}
          <div className="bg-[#171F34] border border-white/5 rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Device Activity Log</h3>
              </div>
              <span className="text-[9px] font-mono font-semibold text-slate-500">Live Feed</span>
            </div>

            {/* Quick interactive Form to add activity details */}
            <form onSubmit={handleAddActivity} className="space-y-3 p-3 bg-slate-900/40 rounded-xl border border-white/5">
              <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest font-mono block">Add Activity Detail</span>
              
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Activity / Website / App Name..."
                className="w-full bg-[#0B1020] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-400 font-mono uppercase block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full bg-[#0B1020] border border-white/5 rounded-lg px-2 py-1 text-[10px] text-slate-300 cursor-pointer focus:outline-none"
                  >
                    <option value="Distraction">Distraction</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Planning">Planning</option>
                    <option value="Focused Work">Focused Work</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-slate-400 font-mono uppercase block mb-1">Interval</label>
                  <select
                    value={newTimeOfDay}
                    onChange={(e: any) => setNewTimeOfDay(e.target.value)}
                    className="w-full bg-[#0B1020] border border-white/5 rounded-lg px-2 py-1 text-[10px] text-slate-300 cursor-pointer focus:outline-none"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Post-Lunch">Post-Lunch</option>
                    <option value="Evening">Evening</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[9px] text-slate-400 font-mono uppercase block mb-1">Hours Spent</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="12"
                    value={newHours}
                    onChange={(e) => setNewHours(Number(e.target.value))}
                    className="w-full bg-[#0B1020] border border-white/5 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg text-xs font-bold transition-all cursor-pointer self-end shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* List of active application details */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {activities.map((a) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-slate-900/20 border border-white/5 rounded-xl flex items-start justify-between gap-3 text-slate-300 hover:border-white/10 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {a.category === 'Distraction' ? (
                          <Youtube className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        ) : a.category === 'Meeting' ? (
                          <Users className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        ) : a.category === 'Planning' ? (
                          <Brain className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                        <span className="text-xs font-bold truncate text-slate-200 block">{a.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono">
                        <span className="uppercase">{a.category}</span>
                        <span>•</span>
                        <span>{a.timeOfDay}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-white/5">
                        {a.hours}h
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteActivity(a.id)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-800 transition-all cursor-pointer"
                        title="Delete Activity Log"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Daily Schedule Meal logs */}
          <div className="bg-[#171F34] border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Heart className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Meal Schedule Registry</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] bg-slate-900/30 p-2 rounded-lg border border-white/5 text-slate-400">
                <span className="font-semibold">Standard Lunch slot:</span>
                <span className="font-mono text-slate-200">{lunchStart} - {lunchEnd}</span>
              </div>

              {lunchRecords.length === 0 ? (
                <p className="text-[10px] text-slate-500 text-center py-4 italic">No meal history logged today.</p>
              ) : (
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Log History</span>
                  {lunchRecords.map((r, idx) => (
                    <div 
                      key={idx}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-sans ${
                        r.status === 'completed'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5" />
                        <span>{r.status === 'completed' ? 'Balanced Meal Logged' : 'Meal Skipped'}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{r.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Daily Sleep Registry */}
          <div className="bg-[#171F34] border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Sleep Schedule Registry</h3>
              </div>
              <span className="text-[9px] font-mono text-slate-500">Circadian Log</span>
            </div>

            <form onSubmit={handleLocalSleepSubmit} className="space-y-3 p-3 bg-slate-900/40 rounded-xl border border-white/5">
              <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest font-mono block">Log Custom Sleep Entry</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-400 font-mono uppercase block mb-1">Slept At</label>
                  <input
                    type="time"
                    required
                    value={localSlept}
                    onChange={(e) => setLocalSlept(e.target.value)}
                    className="w-full bg-[#0B1020] border border-white/5 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none [color-scheme:dark] cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-mono uppercase block mb-1">Woke At</label>
                  <input
                    type="time"
                    required
                    value={localWoke}
                    onChange={(e) => setLocalWoke(e.target.value)}
                    className="w-full bg-[#0B1020] border border-white/5 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none [color-scheme:dark] cursor-pointer"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-500/10"
              >
                Log Sleep Record
              </button>
            </form>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {sleepRecords.length === 0 ? (
                <p className="text-[10px] text-slate-500 text-center py-4 italic">No sleep history logged.</p>
              ) : (
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Log History</span>
                  {sleepRecords.map((r, idx) => (
                    <div 
                      key={idx}
                      className={`p-2.5 rounded-lg border text-xs font-sans flex items-center justify-between ${
                        r.hours >= 7.0 && !isSleepLate(r.sleptAt)
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Moon className="w-3.5 h-3.5" />
                          <span className="font-semibold">{r.hours} Hours Slept</span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-mono">Bedtime: {r.sleptAt} • Wake: {r.wokeAt}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">{r.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
