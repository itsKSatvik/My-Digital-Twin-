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
import TwinMemoryView from './components/TwinMemoryView';
import AIChatPanel from './components/AIChatPanel';
import ProactiveInterruptModal from './components/ProactiveInterruptModal';
import TwinReorganizeModal from './components/TwinReorganizeModal';

import { useAppState } from './hooks/useAppState';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [proactiveAlertOpen, setProactiveAlertOpen] = useState(true);
  const [isLunchPopupOpen, setIsLunchPopupOpen] = useState(false);

  // Invoke centralized custom AppState & Twin Orchestrator
  const {
    theme,
    setTheme,
    timezone,
    setTimezone,
    tasks,
    setTasks,
    updateTask,
    handleToggleTracking,
    handleToggleCompleted,
    scheduleEvents,
    setScheduleEvents,
    lunchStart,
    lunchEnd,
    setLunchStart,
    setLunchEnd,
    lunchStatus,
    lunchRecords,
    setLunchStatus,
    onLogLunchToday,
    onSaveLunchSettings,
    sleepSleptTime,
    sleepWokeTime,
    lastSleepLoggedDate,
    setLastSleepLoggedDate,
    sleepRecords,
    onLogSleepToday,
    risk,
    refreshRisk,
    isLoadingRisk,
    planSteps,
    refreshPlan,
    isLoadingPlan,
    activeFocusTaskId,
    setActiveFocusTaskId,
    messages,
    setMessages,
    getTodayDateString,
    twinReorg,
    isReorganizing,
    triggerManualReorganization,
    acceptTwinReorganization,
    dismissTwinReorganization,
  } = useAppState();

  // Synchronize document classes on theme changes
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    } else {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  // ==========================================
  // GOOGLE WORKSPACE STATE & MUTATION SYNC
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

        const normalizedTime = timeStr.trim().slice(0, 5); // "HH:mm"

        if (normalizedTime >= lunchStart && normalizedTime <= lunchEnd) {
          if (lunchStatus === 'pending') {
            setIsLunchPopupOpen(true);
          }
        }
      } catch (e) {
        console.error("Timezone comparison failed in checkLunchTime:", e);
      }
    };

    const interval = setInterval(checkLunchTime, 15000);
    checkLunchTime();

    return () => clearInterval(interval);
  }, [timezone, lunchStart, lunchEnd, lunchStatus]);

  // Proactive Interrupt Modal callbacks
  const handleAcceptProactiveDirective = () => {
    setScheduleEvents(scheduleEvents.map(evt => {
      if (evt.id === 'se_3' || evt.title.toLowerCase().includes('gym')) {
        return {
          ...evt,
          title: 'Strength & Conditioning Gym (Rescheduled by AI)',
          days: ['Sunday']
        };
      }
      return evt;
    }));

    setActiveFocusTaskId('task_1');

    setTasks(prev => prev.map(t => {
      if (t.id === 'task_1') {
        return { ...t, isTracking: true, status: 'in_progress' };
      }
      return { ...t, isTracking: false };
    }));

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
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <DashboardView 
                key="dashboard"
                tasks={tasks} 
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
                onLogSleepToday={onLogSleepToday}
                getTodayDateString={getTodayDateString}
                scheduleEvents={scheduleEvents}
                onNavigateToTasks={() => setActiveTab('tasks')}
                onNavigateToDoctor={() => setActiveTab('doctor')}
                handleToggleTracking={handleToggleTracking}
                handleToggleCompleted={handleToggleCompleted}
                triggerManualReorganization={triggerManualReorganization}
                isReorganizing={isReorganizing}
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
                planSteps={planSteps}
                isLoadingPlan={isLoadingPlan}
                refreshPlan={refreshPlan}
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
                setLunchRecords={(val: any) => {
                  if (typeof val === 'function') {
                    onLogLunchToday('completed');
                  }
                }}
                sleepRecords={sleepRecords}
                setSleepRecords={() => {}}
                sleepSleptTime={sleepSleptTime}
                sleepWokeTime={sleepWokeTime}
                onLogSleepToday={onLogSleepToday}
                getTodayDateString={getTodayDateString}
                timezone={timezone}
              />
            )}
            {activeTab === 'memory' && (
              <TwinMemoryView 
                key="memory"
                tasks={tasks}
                risk={risk}
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

      {/* Mobile Chat Slide-over Drawer */}
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
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileChatOpen(false)}
                className="fixed inset-0 bg-black z-40"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#161E33] z-50 shadow-2xl"
              >
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-900/40">
                    <div className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-blue-400" />
                      <span className="text-sm font-bold text-white">Digital Twin Companion</span>
                    </div>
                    <button
                      onClick={() => setMobileChatOpen(false)}
                      className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <AIChatPanel 
                      tasks={tasks} 
                      messages={messages} 
                      setMessages={setMessages} 
                    />
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Startup Congestion Proactive Alerts */}
      <ProactiveInterruptModal 
        isOpen={proactiveAlertOpen} 
        onAccept={handleAcceptProactiveDirective}
        onNegotiate={handleNegotiateProactiveDirective}
        tasks={tasks}
        scheduleEvents={scheduleEvents}
        theme={theme}
      />

      {/* Active Digital Twin Automatic Reorganization Overlay Modal */}
      <TwinReorganizeModal 
        isOpen={twinReorg.visible}
        explanation={twinReorg.explanation}
        beforeEvents={twinReorg.beforeEvents}
        afterEvents={twinReorg.afterEvents}
        onAccept={acceptTwinReorganization}
        onDismiss={dismissTwinReorganization}
      />
    </div>
  );
}
