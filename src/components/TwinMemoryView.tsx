import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Target, 
  Moon, 
  Zap, 
  ChevronRight, 
  ShieldCheck, 
  Gauge, 
  AlertTriangle, 
  Cpu, 
  Calendar, 
  Activity, 
  CheckCircle,
  Undo2,
  RefreshCw
} from 'lucide-react';
import { Task, RiskAnalysis } from '../types';

interface TwinMemoryViewProps {
  tasks: Task[];
  risk: RiskAnalysis;
  timezone: string;
}

export default function TwinMemoryView({ tasks, risk, timezone }: TwinMemoryViewProps) {
  // Demo State: Calibration Day (interactive slider to show twin's evolution)
  const [calibrationDay, setCalibrationDay] = useState<number>(14);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusText, setSyncStatusText] = useState<string>('');
  const [activeObservationCategory, setActiveObservationCategory] = useState<'all' | 'focus' | 'deadlines' | 'circadian'>('all');

  // Interactive Query Twin tool
  const [customQuery, setCustomQuery] = useState<string>('');
  const [twinResponse, setTwinResponse] = useState<{
    text: string;
    metrics: string;
  } | null>(null);

  // Simulated brain sync effect
  const triggerSync = () => {
    setIsSyncing(true);
    const steps = [
      'Accessing historical circadian patterns...',
      'Analyzing task delegation latency...',
      'Mapping cognitive fatigue thresholds...',
      'Synthesizing biometric sleep/focus ratios...',
      'Recalibrating behavioral predicting weights...'
    ];
    
    let currentStep = 0;
    setSyncStatusText(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setSyncStatusText(steps[currentStep]);
      } else {
        clearInterval(interval);
        setIsSyncing(false);
        setCalibrationDay(prev => Math.min(30, prev + 1));
      }
    }, 500);
  };

  // Predefined custom responses for demo queries
  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;

    setIsSyncing(true);
    setSyncStatusText('Processing biometric query...');

    setTimeout(() => {
      setIsSyncing(false);
      const query = customQuery.toLowerCase();
      if (query.includes('sleep') || query.includes('morning')) {
        setTwinResponse({
          text: "I observed that your cognitive throughput surges by 40% when you log a sleep entry of >= 7.5 hours. On days with < 6 hours of sleep, your average task completion time expands from 1.2 hours to 2.8 hours. I recommend scheduling complex coding sprints only between 9:00 AM and 11:30 AM on high-sleep days.",
          metrics: "CIRCADIAN ALIGNMENT: 94%"
        });
      } else if (query.includes('focus') || query.includes('deep')) {
        setTwinResponse({
          text: "I observed that you complete tasks 2.5x faster during 25-minute Deep Focus sessions coupled with 'Deep Alpha Waves' audio. Conversely, focus blocks without active sound environments suffer from a 35% higher context-switching rate. I recommend locking in 2 focus blocks in the afternoon.",
          metrics: "FOCUS COGNITION INDEX: 89%"
        });
      } else if (query.includes('delay') || query.includes('procrastinate') || query.includes('miss')) {
        setTwinResponse({
          text: "I learned you tend to delay 'Assignment' tasks by an average of 4.5 hours if they are scheduled after 6:00 PM. Your brain enters a low-dopamine fatigue state during late evening. I recommend scheduling these personal study tasks as early morning micro-objectives instead.",
          metrics: "LATENCY PATTERN RECOGNITION: 87%"
        });
      } else {
        setTwinResponse({
          text: `I have analyzed your behavioral logs relative to '${customQuery}'. I learned that when your overall workload is above 8 hours, your personal obligations are skipped first with a 72% probability. I recommend moving non-urgent personal tasks to Saturday afternoon to shield your weekday academic sprint.`,
          metrics: "DECISION DECONGESTION: 82%"
        });
      }
    }, 1200);
  };

  // Dynamic calculations from real task data
  const realStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    
    // Dynamic Deadline Success Rate
    const rawSuccessRate = total > 0 ? Math.round((completed / total) * 100) : 85;
    const successRate = Math.min(98, Math.max(45, rawSuccessRate));

    // Category with most tasks
    const categoryCounts: Record<string, number> = {};
    tasks.forEach(t => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });
    
    let topCategory = 'Assignments';
    let maxCount = 0;
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCategory = cat + 's';
      }
    });

    // Dynamic predicted completion time based on remaining hours needed
    const activeTasks = tasks.filter(t => t.status !== 'completed');
    const pendingHours = activeTasks.reduce((sum, t) => sum + (t.hoursNeeded - t.hoursCompleted), 0);
    const avgTaskCompletion = total > 0 ? (tasks.reduce((sum, t) => sum + t.hoursNeeded, 0) / total).toFixed(1) : '1.8';

    return {
      total,
      completed,
      inProgress,
      successRate,
      topCategory,
      pendingHours,
      avgTaskCompletion
    };
  }, [tasks]);

  // Scaled Confidence based on calibration day
  const twinConfidence = useMemo(() => {
    // Confidence scales with how far along the timeline they are
    const base = 50 + (calibrationDay / 30) * 38;
    // Add micro-bonus for completing real tasks
    const bonus = Math.min(10, realStats.completed * 2);
    return Math.round(Math.min(99, base + bonus));
  }, [calibrationDay, realStats.completed]);

  // Simulated circadian productivity heatmap data (24 columns representing hours)
  const heatmapData = useMemo(() => {
    // Base productivity profile of a highly structured student twin
    const baseHours = [
      { hr: '00:00', val: 5, text: 'Late-night fatigue. High error rates.' },
      { hr: '01:00', val: 2, text: 'Sub-optimal focus. Rest recommended.' },
      { hr: '02:00', val: 0, text: 'Deep rest cycle.' },
      { hr: '03:00', val: 0, text: 'Deep rest cycle.' },
      { hr: '04:00', val: 0, text: 'Deep rest cycle.' },
      { hr: '05:00', val: 10, text: 'Early morning waking cycle.' },
      { hr: '06:00', val: 20, text: 'Circadian startup.' },
      { hr: '07:00', val: 35, text: 'Light learning. High retention.' },
      { hr: '08:00', val: 55, text: 'Pre-focus ramp-up.' },
      { hr: '09:00', val: 95, text: 'PEAK FOCUS WINDOW. Exceptional code output.' },
      { hr: '10:00', val: 90, text: 'High analytical capacity.' },
      { hr: '11:00', val: 80, text: 'Core objective execution.' },
      { hr: '12:00', val: 40, text: 'Midday cooling cycle. Post-lunch lethargy.' },
      { hr: '13:00', val: 50, text: 'Secondary startup.' },
      { hr: '14:00', val: 75, text: 'High task throughput.' },
      { hr: '15:00', val: 85, text: 'Afternoon productivity spike.' },
      { hr: '16:00', val: 70, text: 'Sustained cognitive stamina.' },
      { hr: '17:00', val: 50, text: 'Evening cool-down.' },
      { hr: '18:00', val: 30, text: 'Fatigue onset. Personal buffers recommended.' },
      { hr: '19:00', val: 25, text: 'High distraction probability.' },
      { hr: '20:00', val: 45, text: 'Late evening burst. Good for routine reviews.' },
      { hr: '21:00', val: 40, text: 'Winding down.' },
      { hr: '22:00', val: 20, text: 'Melatonin release.' },
      { hr: '23:00', val: 10, text: 'Sub-optimal cognitive retention.' }
    ];

    // If active tracking is running right now, augment current hour productivity
    return baseHours;
  }, []);

  // Filterable Observations
  const observations = useMemo(() => {
    const list = [
      {
        id: 'obs-1',
        category: 'circadian',
        icon: Clock,
        iconColor: 'text-blue-400',
        title: 'Morning Cognition Burst',
        text: 'I observed you complete complex coding and writing tasks 40% faster between 8:30 AM and 11:30 AM than any other window.'
      },
      {
        id: 'obs-2',
        category: 'deadlines',
        icon: Target,
        iconColor: 'text-amber-400',
        title: 'Academic Duration Estimation Bias',
        text: `I learned you consistently underestimate study and ${realStats.topCategory} assignments by approximately 1.5 hours. I automatically adjust your planner allocations by +25% as safety margin.`
      },
      {
        id: 'obs-3',
        category: 'focus',
        icon: Zap,
        iconColor: 'text-red-400',
        title: 'Deep Alpha Wave Efficacy',
        text: 'I observed your context-switching frequency drops to near-zero when executing Deep Focus sessions paired with alpha binaural soundtracks.'
      },
      {
        id: 'obs-4',
        category: 'circadian',
        icon: Moon,
        iconColor: 'text-indigo-400',
        title: 'Melatonin Boundary Alert',
        text: 'I observed that working past 10:30 PM triggers a severe 42% drop in the next day\'s analytical efficiency. Rest is your highest leverage asset.'
      },
      {
        id: 'obs-5',
        category: 'focus',
        icon: Sparkles,
        iconColor: 'text-emerald-400',
        title: 'Rebound Speed Post-Focus',
        text: 'I observed you recover optimal cognitive state immediately after utilizing strict 25-minute work intervals followed by a 5-minute offline recess.'
      }
    ];

    if (activeObservationCategory === 'all') return list;
    return list.filter(item => item.category === activeObservationCategory);
  }, [activeObservationCategory, realStats.topCategory]);

  // Future Predictions based on current tasks and calibration
  const predictions = useMemo(() => {
    const active = tasks.filter(t => t.status !== 'completed');
    const list = [];

    // Prediction 1: Burnout risk
    if (active.length > 4 || realStats.pendingHours > 10) {
      list.push({
        type: 'warning',
        title: 'Acute Burnout Index Peak',
        text: `Your immediate workload (${realStats.pendingHours.toFixed(1)} hours across ${active.length} active tasks) exceeds daily healthy cognitive limits. I predict a 75% burnout probability by mid-week unless you move low-priority blocks down.`,
        value: 'High Burnout Risk'
      });
    } else {
      list.push({
        type: 'healthy',
        title: 'Cognitive Load Balanced',
        text: 'Current workload is in perfect equilibrium with your calculated mental capacity. I predict a high completion probability today with comfortable sleep buffer.',
        value: 'Optimal Balance'
      });
    }

    // Prediction 2: Category specific
    const topCatTasks = active.filter(t => t.category === 'Assignment');
    if (topCatTasks.length > 0) {
      const urgent = topCatTasks.some(t => t.deadlineHours < 12);
      list.push({
        type: urgent ? 'danger' : 'info',
        title: 'Assignment Deadline Probability',
        text: urgent 
          ? `I predict you will miss today's assignment deadline due to downstream schedule collision. I recommend immediately activating a Deep Focus Block to bypass the bottleneck.`
          : `I predict a 92% completion probability for your upcoming assignment '${topCatTasks[0].title}' if you initiate work blocks before the evening fatigue boundary.`,
        value: urgent ? 'Miss Risk: 68%' : 'Completion: 92%'
      });
    }

    // Prediction 3: Schedule Reorganization recommendation
    list.push({
      type: 'recommend',
      title: 'Optimal Calendar Restructuring',
      text: 'My model shows that moving non-essential Fitness or personal chores to Saturday increases your weekday task completion probability by 23% and guarantees 7.5+ hours of sleep.',
      value: '+23% Probability'
    });

    return list;
  }, [tasks, realStats.pendingHours]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-8"
      id="twin-memory-view-container"
    >
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/40 via-[#0B1020] to-purple-900/30 border border-white/5 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono">
            <Cpu className="w-3.5 h-3.5 animate-spin-slow" />
            Active Behavioral Syncing
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight font-sans">
            Twin Memory Core
          </h1>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-sans">
            I am not just an assistant. I am your Digital Twin. I continuously observe, learn from your schedule changes, focus patterns, and daily completions to predict constraints and protect your capacity.
          </p>
        </div>

        {/* Confidence Circle Indicator */}
        <div className="relative flex items-center justify-center shrink-0 w-28 h-28 bg-[#161F34]/30 rounded-2xl border border-white/5">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-blue-500/20 animate-spin-slow" />
          </div>
          <div className="text-center space-y-1 relative z-10">
            <span className="block text-3xl font-mono font-black text-blue-400 tracking-tighter">
              {twinConfidence}%
            </span>
            <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">
              Prediction Confidence
            </span>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#0B1020] border border-white/5 rounded-2xl p-4.5 space-y-2 relative group hover:border-blue-500/20 transition-all">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Today's Learning</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xs text-slate-300 font-sans leading-normal">
            "I noticed you usually delay assignments after 6:00 PM."
          </p>
          <div className="text-[10px] text-blue-400 font-mono font-bold mt-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            Auto-delay boundary logged
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#0B1020] border border-white/5 rounded-2xl p-4.5 space-y-2 relative group hover:border-purple-500/20 transition-all">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Most Delayed Category</span>
            <AlertTriangle className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-bold text-white font-sans">
            {realStats.topCategory}
          </p>
          <p className="text-[10px] text-slate-400 font-sans leading-normal">
            4.2 hours average delay risk identified downstream.
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#0B1020] border border-white/5 rounded-2xl p-4.5 space-y-2 relative group hover:border-emerald-500/20 transition-all">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Deadline Success Rate</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-black text-white">{realStats.successRate}%</span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">+1.5% this week</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1">
            <div 
              className="bg-emerald-500 h-1 rounded-full transition-all duration-1000" 
              style={{ width: `${realStats.successRate}%` }} 
            />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#0B1020] border border-white/5 rounded-2xl p-4.5 space-y-2 relative group hover:border-red-500/20 transition-all">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Average Focus Session</span>
            <Zap className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-xl font-bold text-white font-sans">
            32 Minutes
          </p>
          <p className="text-[10px] text-slate-400 font-sans leading-normal">
            Sustained with Deep Alpha waves configuration.
          </p>
        </div>

        {/* Second Stats row */}
        <div className="bg-[#0B1020] border border-white/5 rounded-2xl p-4.5 space-y-2 relative group hover:border-blue-500/20 transition-all">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Average Daily Sleep</span>
            <Moon className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl font-bold text-white font-sans">
            7.4 Hours
          </p>
          <p className="text-[10px] text-slate-400 font-sans leading-normal font-mono">
            Circadian balance threshold reached.
          </p>
        </div>

        {/* Metric 6 */}
        <div className="bg-[#0B1020] border border-white/5 rounded-2xl p-4.5 space-y-2 relative group hover:border-purple-500/20 transition-all">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Average Task Duration</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-bold text-white font-sans">
            {realStats.avgTaskCompletion} Hours
          </p>
          <p className="text-[10px] text-slate-400 font-sans leading-normal">
            Real execution velocity registered today.
          </p>
        </div>

        {/* Metric 7 */}
        <div className="bg-[#0B1020] border border-white/5 rounded-2xl p-4.5 space-y-2 relative group hover:border-yellow-500/20 transition-all">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Reason Plans Change</span>
            <Activity className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-xs text-slate-300 font-sans font-medium leading-normal">
            Underestimating technical difficulty on Assignments.
          </p>
          <p className="text-[9px] text-slate-500 uppercase font-mono font-bold mt-1">
            Accounts for 65% of drift
          </p>
        </div>

        {/* Metric 8 */}
        <div className="bg-[#0B1020] border border-white/5 rounded-2xl p-4.5 space-y-2 relative group hover:border-emerald-500/20 transition-all">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Twin Core Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-black text-white">88/100</span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">Stable</span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans leading-normal">
            Optimized memory pathways loaded.
          </p>
        </div>
      </div>

      {/* Circadian Heatmap & Weekly Trend Graph Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Heatmap block - 7 cols */}
        <div className="lg:col-span-7 bg-[#0B1020] border border-white/5 rounded-2xl p-5 md:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-mono">
                Most Productive Hours Heatmap
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Cognitive stamina distribution mapped over 24-hour cycle. Hover to decode state.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 uppercase tracking-widest font-mono">
              <span className="w-2 h-2 rounded bg-slate-950 border border-white/5" />
              <span>Low</span>
              <span className="w-2 h-2 rounded bg-blue-500" />
              <span>Peak</span>
            </div>
          </div>

          {/* Grid of 24 Hour blocks */}
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
            {heatmapData.map((item, idx) => {
              // Map intensity value (0 - 100) to background color intensity
              let bgClass = 'bg-slate-950/80 border-slate-900';
              if (item.val > 0 && item.val <= 20) bgClass = 'bg-blue-950/40 text-blue-300 border-blue-900/20';
              else if (item.val > 20 && item.val <= 50) bgClass = 'bg-blue-900/20 text-blue-300 border-blue-500/10';
              else if (item.val > 50 && item.val <= 80) bgClass = 'bg-blue-600/30 text-blue-200 border-blue-500/20';
              else if (item.val > 80) bgClass = 'bg-blue-500/80 text-white font-bold border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]';

              return (
                <div 
                  key={idx}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer relative group ${bgClass}`}
                >
                  <span className="text-[9px] font-mono font-bold">{item.hr}</span>
                  <span className="text-[10px] font-mono mt-0.5 opacity-80">{item.val}%</span>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2.5 bg-[#161F33] text-slate-100 text-[10px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-2xl border border-white/5 leading-normal text-left font-sans">
                    <div className="font-bold text-blue-400 font-mono mb-0.5">{item.hr} (Efficiency: {item.val}%)</div>
                    {item.text}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 text-[11px] text-blue-400 font-sans leading-relaxed">
            💡 <strong>Circadian Optimization:</strong> Your highest retention window is in play. I recommend blocking out high-intensity code-refactoring assignments before 12:00 PM for maximum cognitive velocity.
          </div>
        </div>

        {/* Weekly Area Trend - 5 cols */}
        <div className="lg:col-span-5 bg-[#0B1020] border border-white/5 rounded-2xl p-5 md:p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-mono">
              Chronobiological Trend
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Dynamic productivity curves computed across weekly cycles.
            </p>
          </div>

          {/* SVG Custom Graph */}
          <div className="w-full h-44 relative bg-slate-950/40 rounded-xl border border-white/5 flex items-end p-2 overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            
            {/* Glowing SVG area chart */}
            <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="gradient-blue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              
              {/* Area path */}
              <path 
                d="M 0 90 Q 15 35 30 55 T 60 25 T 90 45 T 100 20 L 100 100 L 0 100 Z" 
                fill="url(#gradient-blue)" 
              />
              
              {/* Glowing trend line */}
              <path 
                d="M 0 90 Q 15 35 30 55 T 60 25 T 90 45 T 100 20" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="2" 
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
              />

              {/* Interactive nodes */}
              <circle cx="30" cy="55" r="3" fill="#3b82f6" stroke="#0D1221" strokeWidth="1" className="cursor-pointer" />
              <circle cx="60" cy="25" r="3" fill="#8b5cf6" stroke="#0D1221" strokeWidth="1" className="cursor-pointer" />
              <circle cx="100" cy="20" r="3.5" fill="#3b82f6" stroke="#0D1221" strokeWidth="1" className="animate-pulse" />
            </svg>

            {/* Labels inside graph */}
            <div className="absolute top-2 left-2 text-[8px] font-mono text-slate-500 tracking-wider">
              COGNITIVE LIMIT (MAX)
            </div>
            <div className="absolute bottom-2 left-2 text-[8px] font-mono text-blue-500 font-bold tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              TWIN SYNCHRONICITY ACTIVE
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-[10px] font-mono text-slate-500">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span className="text-blue-400 font-bold">Sat</span>
            <span>Sun</span>
          </div>

          <p className="text-[11px] text-slate-400 font-sans leading-normal">
            Weekly alignment is currently showing a <strong>+12% increase</strong> in focus duration on Saturdays after implementing the late-evening lock-out protocol.
          </p>
        </div>
      </div>

      {/* Dynamic Digital Twin Observations */}
      <div className="bg-[#0B1020] border border-white/5 rounded-2xl p-5 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-100 font-sans flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-400" />
              Digital Twin Observations
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Confident behavioral insights compiled by parsing your timeline, focus trends, and completion rate.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-1">
            {(['all', 'focus', 'deadlines', 'circadian'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveObservationCategory(cat)}
                className={`px-3 py-1 text-[10px] font-mono rounded-lg border transition-all cursor-pointer ${
                  activeObservationCategory === cat
                    ? 'bg-blue-500/15 border-blue-500/40 text-blue-400 font-bold'
                    : 'bg-[#0B1020]/40 border-transparent text-slate-400 hover:border-white/5 hover:text-slate-200'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Observation Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {observations.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 bg-slate-950/40 border border-white/5 rounded-xl flex gap-3 items-start hover:border-blue-500/10 transition-colors"
                >
                  <div className={`p-2 bg-slate-950 rounded-lg border border-white/5 ${item.iconColor} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-200 font-sans tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      {item.text}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Interactive Query Panel */}
        <div className="p-5 bg-gradient-to-r from-blue-950/20 via-[#0B1020] to-purple-950/10 rounded-xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
              Biometric Pattern Investigator
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Submit a direct behavioral query about your circadian cycles, focus session stamina, task procrastination, or weekend habits. Your Twin will scan raw data to extract patterns.
          </p>

          <form onSubmit={handleQuerySubmit} className="flex gap-2">
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="e.g., 'How does sleep affect my morning study stamina?' or 'Why do I delay assignments?'"
              className="flex-1 px-4 py-2 text-xs bg-slate-950 border border-white/5 focus:border-blue-500/30 rounded-xl text-slate-200 placeholder-slate-500 outline-none focus:ring-0 font-sans"
            />
            <button
              type="submit"
              disabled={isSyncing || !customQuery.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Cpu className="w-3.5 h-3.5" />
              )}
              Investigate
            </button>
          </form>

          {/* Syncing Status Indicator */}
          {isSyncing && (
            <div className="flex items-center gap-2 text-[10px] font-mono text-blue-400 bg-blue-500/5 px-3.5 py-2.5 rounded-lg border border-blue-500/10">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{syncStatusText}</span>
            </div>
          )}

          {/* Dynamic AI response output */}
          <AnimatePresence>
            {twinResponse && !isSyncing && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-4 bg-slate-950 border border-white/5 rounded-xl space-y-2 relative"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest font-mono">
                    Twin Synthesis Output
                  </span>
                  <span className="text-[9px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {twinResponse.metrics}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans italic">
                  "{twinResponse.text}"
                </p>
                <button
                  type="button"
                  onClick={() => setTwinResponse(null)}
                  className="absolute top-2 right-2 p-1 text-slate-500 hover:text-slate-300 rounded cursor-pointer"
                  title="Dismiss"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Future Predictions & Calibration Timeline Dual Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Future Predictions Column */}
        <div className="bg-[#0B1020] border border-white/5 rounded-2xl p-5 md:p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Future Predictions
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Cognitive modeling of tomorrow\'s schedules and potential slip risks.
            </p>
          </div>

          <div className="space-y-3">
            {predictions.map((pred, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-xl border flex justify-between items-start gap-4 transition-all ${
                  pred.type === 'danger' || pred.type === 'warning'
                    ? 'bg-red-500/5 border-red-500/15'
                    : pred.type === 'healthy'
                      ? 'bg-emerald-500/5 border-emerald-500/15'
                      : pred.type === 'recommend'
                        ? 'bg-purple-500/5 border-purple-500/15'
                        : 'bg-slate-950/40 border-white/5'
                }`}
              >
                <div className="space-y-1 max-w-xs">
                  <h3 className="text-xs font-bold text-slate-200 font-sans flex items-center gap-1.5">
                    {pred.type === 'danger' || pred.type === 'warning' ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    ) : pred.type === 'healthy' ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    )}
                    {pred.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {pred.text}
                  </p>
                </div>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded whitespace-nowrap ${
                  pred.type === 'danger' || pred.type === 'warning'
                    ? 'text-red-400 bg-red-500/10'
                    : pred.type === 'healthy'
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-purple-400 bg-purple-500/10'
                }`}>
                  {pred.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Calibration Column */}
        <div className="bg-[#0B1020] border border-white/5 rounded-2xl p-5 md:p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-mono flex items-center justify-between">
              <span>Calibration Timeline</span>
              <button
                type="button"
                onClick={triggerSync}
                disabled={isSyncing}
                className="px-2.5 py-1 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-lg text-[10px] font-mono font-bold text-blue-400 flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                Ramp Up Core
              </button>
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Watch my predictive neural nets evolve over days of active observation. Use slider to calibrate days.
            </p>
          </div>

          {/* Interactive Calibration Slider */}
          <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-500 font-bold uppercase">Simulation Day</span>
              <span className="text-blue-400 font-bold">Day {calibrationDay} / 30</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={calibrationDay}
              onChange={(e) => setCalibrationDay(Number(e.target.value))}
              disabled={isSyncing}
              className={`w-full accent-blue-500 bg-[#0B1020] rounded-lg cursor-pointer h-1.5 ${
                isSyncing ? 'opacity-30 cursor-not-allowed' : 'hover:accent-blue-400'
              }`}
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono font-bold">
              <span>Day 1 (Bootstrap)</span>
              <span>Day 14 (Mapped)</span>
              <span>Day 30 (Mature Twin)</span>
            </div>
          </div>

          {/* Vertical Evolution Steps */}
          <div className="relative pl-5 space-y-4.5 my-2">
            <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-slate-800/80" />
            
            {/* Step 1 */}
            <div className="relative">
              <span className={`absolute -left-[19.5px] top-1 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                calibrationDay >= 1 
                  ? 'bg-blue-500 border-[#0D1221] shadow-[0_0_8px_rgba(59,130,246,0.6)]' 
                  : 'bg-slate-950 border-slate-800'
              }`} />
              <div className="space-y-0.5">
                <span className={`text-[9px] font-mono font-black ${calibrationDay >= 1 ? 'text-blue-400' : 'text-slate-500'}`}>
                  DAY 1 (COMPLETED)
                </span>
                <p className="text-xs font-bold text-slate-200 font-sans">
                  Circadian Bootstrapping
                </p>
                <p className="text-[11px] text-slate-400 font-sans leading-normal">
                  Initial schedule mapping. Loaded baseline timezone coordinates.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <span className={`absolute -left-[19.5px] top-1 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                calibrationDay >= 7 
                  ? 'bg-blue-500 border-[#0D1221] shadow-[0_0_8px_rgba(59,130,246,0.6)]' 
                  : 'bg-slate-950 border-slate-800'
              }`} />
              <div className="space-y-0.5">
                <span className={`text-[9px] font-mono font-black ${calibrationDay >= 7 ? 'text-blue-400' : 'text-slate-500'}`}>
                  DAY 7 {calibrationDay >= 7 ? '(STABLE)' : '(LOCKED)'}
                </span>
                <p className="text-xs font-bold text-slate-200 font-sans">
                  Stamina & Focus Mapping
                </p>
                <p className="text-[11px] text-slate-400 font-sans leading-normal">
                  Circadian high-velocity windows successfully identified (9:00 AM peak).
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <span className={`absolute -left-[19.5px] top-1 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                calibrationDay >= 14 
                  ? 'bg-blue-500 border-[#0D1221] shadow-[0_0_8px_rgba(59,130,246,0.6)]' 
                  : 'bg-slate-950 border-slate-800'
              }`} />
              <div className="space-y-0.5">
                <span className={`text-[9px] font-mono font-black ${calibrationDay >= 14 ? 'text-blue-400' : 'text-slate-500'}`}>
                  DAY 14 {calibrationDay >= 14 ? '(CALIBRATED)' : '(LOCKED)'}
                </span>
                <p className="text-xs font-bold text-slate-200 font-sans">
                  Behavioral Drift Tracking
                </p>
                <p className="text-[11px] text-slate-400 font-sans leading-normal">
                  Learned late-night assignment delay risk boundary (6:00 PM bottleneck).
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <span className={`absolute -left-[19.5px] top-1 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                calibrationDay >= 30 
                  ? 'bg-emerald-500 border-[#0D1221] shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse' 
                  : 'bg-slate-950 border-slate-800'
              }`} />
              <div className="space-y-0.5">
                <span className={`text-[9px] font-mono font-black ${calibrationDay >= 30 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  DAY 30 {calibrationDay >= 30 ? '(MATURED)' : '(LOCKED)'}
                </span>
                <p className="text-xs font-bold text-slate-200 font-sans">
                  Proactive Twin Coherence
                </p>
                <p className="text-[11px] text-slate-400 font-sans leading-normal">
                  Reliable multi-day prediction capability fully active. Autonomous warnings enabled.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
