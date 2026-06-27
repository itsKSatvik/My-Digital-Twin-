import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Bot, AlertTriangle, Sparkles, X, Coffee, Heart, Clock } from 'lucide-react';

import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import TasksView from './components/TasksView';
import CalendarView from './components/CalendarView';
import AIPlannerView from './components/AIPlannerView';
import AIDoctorView from './components/AIDoctorView';
import EmergencyModeView from './components/EmergencyModeView';
import SettingsView from './components/SettingsView';
import AIChatPanel from './components/AIChatPanel';
import ProactiveInterruptModal from './components/ProactiveInterruptModal';

import { Task, RiskAnalysis, ChatMessage, ScheduleEvent } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [proactiveAlertOpen, setProactiveAlertOpen] = useState(true);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('dt_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('dt_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    } else {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  const [timezone, setTimezone] = useState<string>(() => {
    return localStorage.getItem('dt_timezone') || 'Asia/Kolkata';
  });

  useEffect(() => {
    localStorage.setItem('dt_timezone', timezone);
  }, [timezone]);

  // Load parallel schedule events from localStorage or default to student routine
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>(() => {
    const saved = localStorage.getItem('dt_schedule_events');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'se_1',
        title: 'Database Systems Lecture',
        startTime: '09:30',
        endTime: '11:00',
        category: 'Class',
        days: ['Monday', 'Wednesday', 'Friday']
      },
      {
        id: 'se_2',
        title: 'Midday Power Lunch',
        startTime: '13:00',
        endTime: '14:00',
        category: 'Meal',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      },
      {
        id: 'se_3',
        title: 'Strength & Conditioning Gym',
        startTime: '17:30',
        endTime: '19:00',
        category: 'Workout',
        days: ['Monday', 'Wednesday', 'Friday']
      },
      {
        id: 'se_4',
        title: 'Group Project Study Session',
        startTime: '15:00',
        endTime: '16:30',
        category: 'Study',
        days: ['Tuesday', 'Thursday']
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('dt_schedule_events', JSON.stringify(scheduleEvents));
  }, [scheduleEvents]);

  // Lunch / Meal Schedule configurations and states
  const [lunchStart, setLunchStart] = useState(() => localStorage.getItem('dt_lunch_start') || '13:00');
  const [lunchEnd, setLunchEnd] = useState(() => localStorage.getItem('dt_lunch_end') || '14:00');
  const [lunchStatus, setLunchStatus] = useState<'pending' | 'completed' | 'skipped' | 'snoozed'>(() => {
    return (localStorage.getItem('dt_lunch_status') as any) || 'pending';
  });
  const [lunchRecords, setLunchRecords] = useState<Array<{ time: string; status: 'completed' | 'skipped' }>>(() => {
    const saved = localStorage.getItem('dt_lunch_records');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLunchPopupOpen, setIsLunchPopupOpen] = useState(false);
  const [showSkipWarning, setShowSkipWarning] = useState(false);

  useEffect(() => {
    localStorage.setItem('dt_lunch_start', lunchStart);
  }, [lunchStart]);

  useEffect(() => {
    localStorage.setItem('dt_lunch_end', lunchEnd);
  }, [lunchEnd]);

  useEffect(() => {
    localStorage.setItem('dt_lunch_status', lunchStatus);
  }, [lunchStatus]);

  useEffect(() => {
    localStorage.setItem('dt_lunch_records', JSON.stringify(lunchRecords));
  }, [lunchRecords]);

  // Sleep / Rest schedule configurations and states
  const [sleepSleptTime, setSleepSleptTime] = useState(() => localStorage.getItem('dt_sleep_slept_time') || '23:00');
  const [sleepWokeTime, setSleepWokeTime] = useState(() => localStorage.getItem('dt_sleep_woke_time') || '07:00');
  const [lastSleepLoggedDate, setLastSleepLoggedDate] = useState(() => localStorage.getItem('dt_last_sleep_logged_date') || '');
  const [sleepRecords, setSleepRecords] = useState<Array<{ date: string; sleptAt: string; wokeAt: string; hours: number }>>(() => {
    const saved = localStorage.getItem('dt_sleep_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    // Pre-populate some realistic sleep logs for user tracking visualization
    return [
      { date: '2026-06-25', sleptAt: '22:30', wokeAt: '06:30', hours: 8.0 },
      { date: '2026-06-24', sleptAt: '23:45', wokeAt: '07:15', hours: 7.5 },
      { date: '2026-06-23', sleptAt: '01:15', wokeAt: '06:45', hours: 5.5 },
      { date: '2026-06-22', sleptAt: '23:00', wokeAt: '07:00', hours: 8.0 }
    ];
  });

  const getTodayDateString = useCallback((tz: string) => {
    try {
      const d = new Date();
      return new Intl.DateTimeFormat('en-CA', { // YYYY-MM-DD format
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(d);
    } catch (e) {
      const d = new Date();
      return d.toISOString().split('T')[0];
    }
  }, []);

  const handleLogSleepToday = useCallback((sleptAt: string, wokeAt: string) => {
    const [sHour, sMin] = sleptAt.split(':').map(Number);
    const [wHour, wMin] = wokeAt.split(':').map(Number);
    
    const sleptDate = new Date();
    sleptDate.setHours(sHour, sMin, 0, 0);
    
    const wokeDate = new Date();
    wokeDate.setHours(wHour, wMin, 0, 0);
    
    // If woke time is earlier in the day than slept time, sleep crossed midnight
    if (wokeDate.getTime() < sleptDate.getTime()) {
      sleptDate.setDate(sleptDate.getDate() - 1);
    }
    
    const diffMs = wokeDate.getTime() - sleptDate.getTime();
    const hours = Math.round((diffMs / 3600000) * 10) / 10;
    
    const todayStr = getTodayDateString(timezone);
    const newRecord = {
      date: todayStr,
      sleptAt,
      wokeAt,
      hours: hours > 0 ? hours : 8.0
    };
    
    setSleepRecords(prev => {
      const filtered = prev.filter(r => r.date !== todayStr);
      const nextRecords = [newRecord, ...filtered];
      localStorage.setItem('dt_sleep_records', JSON.stringify(nextRecords));
      return nextRecords;
    });
    
    setSleepSleptTime(sleptAt);
    setSleepWokeTime(wokeAt);
    setLastSleepLoggedDate(todayStr);
    
    localStorage.setItem('dt_sleep_slept_time', sleptAt);
    localStorage.setItem('dt_sleep_woke_time', wokeAt);
    localStorage.setItem('dt_last_sleep_logged_date', todayStr);
  }, [timezone, getTodayDateString]);

  // Check for current time corresponding to lunch hours in active timezone
  useEffect(() => {
    const checkLunchTime = () => {
      const now = new Date();
      try {
        const timeStr = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(now);

        const normalizedTime = timeStr.trim().slice(0, 5); // Take "HH:mm"

        if (normalizedTime >= lunchStart && normalizedTime <= lunchEnd) {
          if (lunchStatus === 'pending') {
            setIsLunchPopupOpen(true);
          }
        }
      } catch (e) {
        console.error("Timezone comparison failed in checkLunchTime:", e);
      }
    };

    const interval = setInterval(checkLunchTime, 10000);
    checkLunchTime();

    return () => clearInterval(interval);
  }, [timezone, lunchStart, lunchEnd, lunchStatus]);

  // ==========================================
  // GOOGLE WORKSPACE REAL-TIME STATE & SYNC
  // ==========================================
  const [isWorkspaceConnected, setIsWorkspaceConnected] = useState(false);
  const [workspaceProfile, setWorkspaceProfile] = useState<any | null>(null);
  const [workspaceCalendar, setWorkspaceCalendar] = useState<any[]>([]);
  const [workspaceTasks, setWorkspaceTasks] = useState<any[]>([]);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(false);

  const syncWorkspaceData = useCallback(async () => {
    setIsWorkspaceLoading(true);
    try {
      const res = await fetch('/api/workspace/sync');
      if (res.ok) {
        const data = await res.json();
        setWorkspaceCalendar(data.calendar || []);
        setWorkspaceTasks(data.tasks || []);
        if (data.profile) setWorkspaceProfile(data.profile);
        setIsWorkspaceConnected(true);
      } else if (res.status === 401) {
        setIsWorkspaceConnected(false);
        setWorkspaceProfile(null);
      }
    } catch (e) {
      console.error("Failed to sync workspace data:", e);
    } finally {
      setIsWorkspaceLoading(false);
    }
  }, []);

  const checkWorkspaceStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/workspace/status');
      if (res.ok) {
        const data = await res.json();
        setIsWorkspaceConnected(data.connected);
        setWorkspaceProfile(data.profile || null);
        if (data.connected) {
          syncWorkspaceData();
        }
      }
    } catch (e) {
      console.error("Failed to check workspace status:", e);
    }
  }, [syncWorkspaceData]);

  useEffect(() => {
    checkWorkspaceStatus();
  }, [checkWorkspaceStatus]);

  // Initial Tasks pre-populated with active workloads and historical completed tasks for advice references
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task_1',
      title: 'Assignment',
      hoursCompleted: 6,
      hoursNeeded: 9,
      deadlineHours: 5.3, // 5 hours 18 mins left
      category: 'Assignment',
      status: 'in_progress',
      priority: 'high'
    },
    {
      id: 'task_2',
      title: 'Exam Prep',
      hoursCompleted: 4,
      hoursNeeded: 9,
      deadlineHours: 10,
      category: 'Exam Prep',
      status: 'in_progress',
      priority: 'medium'
    },
    {
      id: 'task_3',
      title: 'Meeting',
      hoursCompleted: 2,
      hoursNeeded: 9,
      deadlineHours: 24,
      category: 'Meeting',
      status: 'todo',
      priority: 'low'
    },
    // Historical Completed Tasks for previous data references
    {
      id: 'task_prev_1',
      title: 'Math Assignment 2',
      hoursCompleted: 8,
      hoursNeeded: 8,
      deadlineHours: 0,
      category: 'Assignment',
      status: 'completed',
      priority: 'medium'
    },
    {
      id: 'task_prev_2',
      title: 'History Assignment 1',
      hoursCompleted: 10,
      hoursNeeded: 10,
      deadlineHours: 0,
      category: 'Assignment',
      status: 'completed',
      priority: 'high'
    },
    {
      id: 'task_prev_3',
      title: 'Physics Midterm Study',
      hoursCompleted: 12,
      hoursNeeded: 12,
      deadlineHours: 0,
      category: 'Exam Prep',
      status: 'completed',
      priority: 'high'
    },
    {
      id: 'task_prev_4',
      title: 'Sprint Backlog Review',
      hoursCompleted: 1.5,
      hoursNeeded: 1.5,
      deadlineHours: 0,
      category: 'Meeting',
      status: 'completed',
      priority: 'low'
    },
    {
      id: 'task_prev_5',
      title: 'Client Demo Sync',
      hoursCompleted: 2,
      hoursNeeded: 2,
      deadlineHours: 0,
      category: 'Meeting',
      status: 'completed',
      priority: 'medium'
    },
    {
      id: 'task_prev_6',
      title: 'Refactor Auth Layer',
      hoursCompleted: 6,
      hoursNeeded: 6,
      deadlineHours: 0,
      category: 'Work',
      status: 'completed',
      priority: 'high'
    }
  ]);

  // Initial chat history pre-populated to match user request exactly
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `### Welcome back, Planner! 🤖
I'm your **Digital Twin**. I've loaded your schedule and local parameters. 

Ask me any questions about priority optimization, what items are safe to postpone, or click one of the quick actions below to analyze your deadlines.`,
      timestamp: '12:00 PM'
    },
    {
      id: 'user_prompt_msg',
      sender: 'user',
      text: 'I have 5 hours left.',
      timestamp: '12:01 PM'
    },
    {
      id: 'ai_prompt_msg',
      sender: 'ai',
      text: `### ⚡ Action Plan
I recommend **skipping Task B (Meeting)**.

Move **Interview Prep** to tomorrow.
Finish **Assignment** first (highest urgency with only 5h 18m remaining).`,
      timestamp: '12:01 PM'
    }
  ]);

  // Initial risk assessment matching user prompt exactly
  const [risk, setRisk] = useState<RiskAnalysis>({
    riskScore: 72,
    likelyToMiss: ['Assignment'],
    suggestions: [
      'Start Assignment now',
      'Delay Gym',
      'Sleep before 11 PM'
    ],
    explanation: 'High-risk schedule detected. You are likely to miss the deadline for: Assignment because remaining work exceeds your safety margin.'
  });

  const [isLoadingRisk, setIsLoadingRisk] = useState(false);
  const [activeFocusTaskId, setActiveFocusTaskId] = useState<string>('task_1');

  // Trigger dynamic risk index assessment from the server
  const refreshRisk = useCallback(async () => {
    setIsLoadingRisk(true);
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks }),
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      
      setRisk({
        riskScore: data.riskScore,
        likelyToMiss: data.likelyToMiss,
        suggestions: data.suggestions,
        explanation: data.explanation,
        source: data.source
      } as RiskAnalysis & { source?: string });
    } catch (error) {
      console.error("Failed to fetch risk parameters:", error);
      // Fallback local heuristic calculator if API server is not active
      calculateLocalRisk();
    } finally {
      setIsLoadingRisk(false);
    }
  }, [tasks]);

  // Local fallback calculation logic
  const calculateLocalRisk = () => {
    const activeTasks = tasks.filter(t => t.status !== 'completed');
    if (activeTasks.length === 0) {
      setRisk({
        riskScore: 5,
        likelyToMiss: [],
        suggestions: [
          'All current tasks completed! Great job.',
          'Take a short 15-minute break to recharge.',
          'Plan your next big goals in the planner.'
        ],
        explanation: 'You have completed all of today\'s tasks. Risk is extremely low.'
      });
      return;
    }

    const likelyToMiss: string[] = [];
    let totalRiskPoints = 0;

    activeTasks.forEach(task => {
      const workRemaining = task.hoursNeeded - task.hoursCompleted;
      if (workRemaining > task.deadlineHours) {
        likelyToMiss.push(task.title);
        totalRiskPoints += 100;
      } else {
        const ratio = workRemaining / task.deadlineHours;
        if (ratio > 0.8) {
          likelyToMiss.push(task.title);
          totalRiskPoints += 85;
        } else if (ratio > 0.5) {
          totalRiskPoints += 50;
        } else {
          totalRiskPoints += 15;
        }
      }
    });

    const averageRisk = Math.round(totalRiskPoints / activeTasks.length);
    const calculatedScore = Math.max(10, Math.min(95, averageRisk));

    setRisk({
      riskScore: calculatedScore,
      likelyToMiss,
      suggestions: [
        `Start ${likelyToMiss[0] || activeTasks[0].title} immediately.`,
        activeTasks.length > 1 ? `Postpone ${activeTasks[activeTasks.length - 1].title} to tomorrow.` : 'Minimize non-essential tasks.',
        'Ensure you sleep before 11 PM to maintain focus.'
      ],
      explanation: likelyToMiss.length > 0 
        ? `High-risk schedule detected. You are likely to miss deadline for: ${likelyToMiss.join(", ")}.`
        : 'Your schedule is currently stable, but maintain focus blocks to avoid slippage.'
    });
  };

  const handleAcceptProactiveDirective = () => {
    // 1. Move Gym to Sunday
    setScheduleEvents(prev => prev.map(evt => {
      if (evt.id === 'se_3' || evt.title.toLowerCase().includes('gym')) {
        return {
          ...evt,
          title: 'Strength & Conditioning Gym (Rescheduled by AI)',
          days: ['Sunday']
        };
      }
      return evt;
    }));

    // 2. Set active focus task to Assignment
    setActiveFocusTaskId('task_1');

    // 3. Set status and start tracking timer
    setTasks(prev => prev.map(t => {
      if (t.id === 'task_1') {
        return { ...t, isTracking: true, status: 'in_progress' };
      }
      return { ...t, isTracking: false };
    }));

    // 4. Add system override text in chat log
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        id: 'proactive_ack_' + Date.now(),
        sender: 'ai',
        text: `### 🚨 PROACTIVE OVERRIDE ENGAGED\nI have successfully taken charge:\n*   **Gym Session Rescheduled**: Postponed Gym from today's active parallel load to tomorrow (Sunday).\n*   **Focus Priority Locked**: Focuser targeted on **Assignment** (3.0 hours needed).\n*   **Distraction Guard Active**: Focus timer has been initiated. Avoid YouTube!`,
        timestamp: timeStr
      }
    ]);

    setProactiveAlertOpen(false);
  };

  const handleNegotiateProactiveDirective = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        id: 'proactive_reject_' + Date.now(),
        sender: 'ai',
        text: `### ⚠️ DIRECTIVE REJECTED\nYou have chosen to keep the **Gym Session** today.\n**Active Risk Index is 95%**.\nYour Digital Twin warns that this choice guarantees assignment failure or acute sleep deprivation (<4.5 hours of rest).`,
        timestamp: timeStr
      }
    ]);
    setProactiveAlertOpen(false);
  };

  // Perform a refresh on initial render and when tasks update
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshRisk();
    }, 500); // Small debounce
    return () => clearTimeout(timer);
  }, [tasks, refreshRisk]);

  // Dynamic tracking for tasks that are actively being timed (continue counting time in seconds/minutes/hours)
  const isAnyTaskTracking = tasks.some(t => t.isTracking);
  useEffect(() => {
    if (!isAnyTaskTracking) return;

    const interval = setInterval(() => {
      setTasks(prev => prev.map(t => {
        if (t.isTracking) {
          const nextCompleted = Math.min(t.hoursNeeded, t.hoursCompleted + (1 / 3600));
          const isFinished = nextCompleted >= t.hoursNeeded;
          return {
            ...t,
            hoursCompleted: nextCompleted,
            isTracking: !isFinished,
            status: isFinished ? 'completed' : 'in_progress'
          };
        }
        return t;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isAnyTaskTracking]);

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-[#161E33] via-[#0D1221] to-[#121B2F] text-slate-100 flex flex-col md:flex-row overflow-x-hidden font-sans"
      id="main-app-container"
    >
      {/* Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={sidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed} 
        timezone={timezone}
      />

      {/* Main Panel Area */}
      <main 
        className={`flex-1 min-h-screen transition-all duration-300 pb-20 md:pb-6 pt-6 px-4 md:px-8 overflow-y-auto ${
          sidebarCollapsed ? 'md:pl-28' : 'md:pl-72'
        }`}
      >
        {/* Render View Container based on selected Sidebar tab */}
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <DashboardView 
                key="dashboard"
                tasks={tasks} 
                setTasks={setTasks} 
                risk={risk} 
                isLoadingRisk={isLoadingRisk}
                refreshRisk={refreshRisk}
                activeFocusTaskId={activeFocusTaskId}
                setActiveFocusTaskId={setActiveFocusTaskId}
                timezone={timezone}
                sleepSleptTime={sleepSleptTime}
                sleepWokeTime={sleepWokeTime}
                lastSleepLoggedDate={lastSleepLoggedDate}
                setLastSleepLoggedDate={setLastSleepLoggedDate}
                onLogSleepToday={handleLogSleepToday}
                getTodayDateString={getTodayDateString}
                scheduleEvents={scheduleEvents}
                onNavigateToTasks={() => setActiveTab('tasks')}
                onNavigateToDoctor={() => setActiveTab('doctor')}
              />
            )}
            {activeTab === 'tasks' && (
              <TasksView 
                key="tasks"
                tasks={tasks} 
                setTasks={setTasks} 
                refreshRisk={refreshRisk}
                isWorkspaceConnected={isWorkspaceConnected}
                workspaceTasks={workspaceTasks}
                isWorkspaceLoading={isWorkspaceLoading}
                syncWorkspaceData={syncWorkspaceData}
              />
            )}
            {activeTab === 'calendar' && (
              <CalendarView 
                key="calendar"
                tasks={tasks} 
                setTasks={setTasks} 
                scheduleEvents={scheduleEvents}
                setScheduleEvents={setScheduleEvents}
                isWorkspaceConnected={isWorkspaceConnected}
                workspaceCalendar={workspaceCalendar}
                isWorkspaceLoading={isWorkspaceLoading}
                syncWorkspaceData={syncWorkspaceData}
                timezone={timezone}
              />
            )}
            {activeTab === 'planner' && (
              <AIPlannerView 
                key="planner"
                tasks={tasks} 
                risk={risk} 
                isLoading={isLoadingRisk}
                refreshRisk={refreshRisk}
              />
            )}
            {activeTab === 'emergency' && (
              <EmergencyModeView 
                key="emergency"
                tasks={tasks} 
                setTasks={setTasks} 
              />
            )}
            {activeTab === 'doctor' && (
              <AIDoctorView 
                key="doctor"
                tasks={tasks}
                setTasks={setTasks}
                lunchStart={lunchStart}
                lunchEnd={lunchEnd}
                lunchStatus={lunchStatus}
                setLunchStatus={setLunchStatus}
                triggerLunchPopup={() => setIsLunchPopupOpen(true)}
                lunchRecords={lunchRecords}
                setLunchRecords={setLunchRecords}
                sleepRecords={sleepRecords}
                setSleepRecords={setSleepRecords}
                sleepSleptTime={sleepSleptTime}
                sleepWokeTime={sleepWokeTime}
                onLogSleepToday={handleLogSleepToday}
                getTodayDateString={getTodayDateString}
                timezone={timezone}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsView 
                key="settings"
                riskSource={(risk as any).source || 'local'} 
                timezone={timezone}
                setTimezone={setTimezone}
                lunchStart={lunchStart}
                setLunchStart={setLunchStart}
                lunchEnd={lunchEnd}
                setLunchEnd={setLunchEnd}
                theme={theme}
                setTheme={setTheme}
                isWorkspaceConnected={isWorkspaceConnected}
                workspaceProfile={workspaceProfile}
                isWorkspaceLoading={isWorkspaceLoading}
                syncWorkspaceData={syncWorkspaceData}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Desktop Persistent AI Companion Chat Panel */}
      <div className="hidden lg:block">
        <AIChatPanel 
          tasks={tasks} 
          messages={messages} 
          setMessages={setMessages} 
        />
      </div>

      {/* Mobile Chat Trigger & Slide-over Drawer */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileChatOpen(true)}
          className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 z-40 active:scale-95 transition-transform"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {mobileChatOpen && (
            <>
              {/* Dark Overlay backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileChatOpen(false)}
                className="fixed inset-0 bg-black z-40"
              />
              
              {/* Drawer Box */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-80 bg-[#121626] border-l border-slate-800/60 z-50 flex flex-col shadow-2xl"
              >
                {/* Close Button overlay */}
                <button
                  onClick={() => setMobileChatOpen(false)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 z-50"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex-1 overflow-hidden pt-4">
                  <AIChatPanel 
                    tasks={tasks} 
                    messages={messages} 
                    setMessages={setMessages} 
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Lunch / Meal Reminder Modal Popup */}
      <AnimatePresence>
        {isLunchPopupOpen && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121829] border border-rose-500/30 max-w-md w-full rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Pulse effect bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 animate-pulse" />

              {!showSkipWarning ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-rose-500/5">
                    <Coffee className="w-8 h-8 text-rose-500 animate-bounce" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h2 className="text-lg font-extrabold text-white font-sans tracking-tight uppercase">
                      🍽️ Meal Time Protocol
                    </h2>
                    <p className="text-xs text-rose-300 font-mono font-medium">
                      Standard Interval: {lunchStart} - {lunchEnd}
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Your AI Doctor detects it is currently lunch time. Skipping meals deprives the brain of essential glycogen, reducing your focus capacity by <strong className="text-rose-400">35%</strong> and triggering severe post-lunch procrastination. Please grab a balanced meal!
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                    <button
                      onClick={() => {
                        setLunchStatus('completed');
                        setLunchRecords(prev => [
                          { time: new Date().toLocaleTimeString(), status: 'completed' },
                          ...prev
                        ]);
                        setIsLunchPopupOpen(false);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/15"
                    >
                      ✓ Done Eating
                    </button>

                    <button
                      onClick={() => setShowSkipWarning(true)}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold py-2.5 rounded-xl border border-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer"
                    >
                      ❌ Skip Meal
                    </button>

                    <button
                      onClick={() => {
                        setLunchStatus('snoozed');
                        setIsLunchPopupOpen(false);
                        // Simulate snooze: reset back to pending in 60s for development/testing convenience
                        setTimeout(() => {
                          setLunchStatus('pending');
                        }, 60000);
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-semibold py-2.5 rounded-xl border border-white/5 transition-all cursor-pointer"
                    >
                      Snooze 10m
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-500/15 border border-red-500/40 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-red-500/10">
                    <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-base font-extrabold text-white font-sans tracking-tight uppercase">
                      ⚠️ Medical Override Warning
                    </h2>
                    <p className="text-[10px] text-red-400 font-mono font-bold">
                      COGNITIVE FATIGUE THREAT DETECTED
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Skipping meals is highly discouraged by the AI Doctor! Your historical activity records show skipping lunch increases YouTube distraction by <strong className="text-red-400">120%</strong> because of brain glucose depletion.
                  </p>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={() => setShowSkipWarning(false)}
                      className="w-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-rose-500/25"
                    >
                      Okay, I will Eat (Cancel Skip)
                    </button>
                    
                    <button
                      onClick={() => {
                        setLunchStatus('skipped');
                        setLunchRecords(prev => [
                          { time: new Date().toLocaleTimeString(), status: 'skipped' },
                          ...prev
                        ]);
                        setShowSkipWarning(false);
                        setIsLunchPopupOpen(false);
                      }}
                      className="w-full text-[10px] text-slate-500 hover:text-red-400 font-semibold py-1.5 transition-colors cursor-pointer uppercase tracking-wider"
                    >
                      Confirm skip regardless (Prohibited)
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Proactive AI Interruption Override Modal */}
      <AnimatePresence>
        {proactiveAlertOpen && (
          <ProactiveInterruptModal
            isOpen={proactiveAlertOpen}
            onAccept={handleAcceptProactiveDirective}
            onNegotiate={handleNegotiateProactiveDirective}
            tasks={tasks}
            scheduleEvents={scheduleEvents}
            theme={theme}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
