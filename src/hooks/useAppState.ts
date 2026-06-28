import { useState, useEffect, useCallback, useRef } from 'react';
import { Task, RiskAnalysis, ScheduleEvent, ChatMessage } from '../types';
import { storageService } from '../services/storageService';
import { aiService, PlanStep, ReorganizeResult } from '../services/aiService';

export interface TwinReorgState {
  explanation: string;
  beforeEvents: ScheduleEvent[];
  afterEvents: ScheduleEvent[];
  visible: boolean;
}

export function useAppState() {
  // 1. Basic configuration states
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => storageService.getTheme());
  const [timezone, setTimezoneState] = useState(() => storageService.getTimezone());

  // 2. Main data states
  const [tasks, setTasksState] = useState<Task[]>(() => storageService.getTasks());
  const [scheduleEvents, setScheduleEventsState] = useState<ScheduleEvent[]>(() => storageService.getScheduleEvents());

  // 3. Routine states (Lunch & Sleep)
  const [lunchStart, setLunchStart] = useState(() => storageService.getLunchStart());
  const [lunchEnd, setLunchEnd] = useState(() => storageService.getLunchEnd());
  const [lunchStatus, setLunchStatusState] = useState(() => storageService.getLunchStatus());
  const [lunchRecords, setLunchRecordsState] = useState(() => storageService.getLunchRecords());

  const [sleepSleptTime, setSleepSleptTime] = useState(() => storageService.getSleepSleptTime());
  const [sleepWokeTime, setSleepWokeTime] = useState(() => storageService.getSleepWokeTime());
  const [lastSleepLoggedDate, setLastSleepLoggedDateState] = useState(() => storageService.getLastSleepLoggedDate());
  const [sleepRecords, setSleepRecordsState] = useState(() => storageService.getSleepRecords());

  // 4. AI & Assistant states
  const [risk, setRisk] = useState<RiskAnalysis>({
    riskScore: 72,
    likelyToMiss: ['Assignment'],
    suggestions: ['Start Assignment now', 'Delay Gym', 'Sleep before 11 PM'],
    explanation: 'High-risk schedule detected. You are likely to miss the deadline for: Assignment because remaining work exceeds your safety margin.',
    todayPriorities: ['Assignment', 'Exam Prep'],
    predictedCompletionTimes: '9:30 PM',
    suggestedScheduleChanges: ['Postpone Leisure block', 'Reschedule Gym'],
    productivitySummary: 'Your timeline is congested today. Main priority is Assignment.',
    digitalTwinStatement: "I noticed today's plan is unrealistic. Your active load is too heavy. I suggests moving Gym or leisure blocks downstream to create a dedicated deep-focus protocol for Assignment.",
    tasksWithRisk: []
  });
  const [isLoadingRisk, setIsLoadingRisk] = useState(false);

  const [planSteps, setPlanStepsState] = useState<PlanStep[]>(() => {
    const saved = storageService.getPlanSteps();
    return saved || [
      {
        title: 'Initialize High-Priority Focus Block',
        desc: 'Allocate uninterrupted 90-minute blocks to your highest load tasks. Turn on distraction blocking.',
        time: 'First 2 hours',
        urgency: 'CRITICAL',
      },
      {
        title: 'Consolidate and Reschedule Low-Impact Work',
        desc: 'Identify personal tasks, routine meetings, or low priority goals. Postpone them to a less congested evening block.',
        time: 'Midday adjustment',
        urgency: 'MEDIUM',
      },
      {
        title: 'Implement 10-Minute Cognitive Decompression',
        desc: 'Do not check notifications during breaks. Stand up, stretch, or practice 4-7-8 breathing to sustain executive stamina.',
        time: 'Scheduled breaks',
        urgency: 'LOW',
      },
    ];
  });
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);

  // Digital Twin Auto Reorganization notification overlay
  const [twinReorg, setTwinReorg] = useState<TwinReorgState>({
    explanation: '',
    beforeEvents: [],
    afterEvents: [],
    visible: false,
  });
  const [isReorganizing, setIsReorganizing] = useState(false);

  // 5. Navigation & UI States
  const [activeFocusTaskId, setActiveFocusTaskId] = useState<string>('');

  // 6. Chat messaging states
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `### Welcome back, Planner! 🤖\nI'm your **Digital Twin**. I've loaded your schedule and local parameters.\n\nAsk me any questions about priority optimization, what items are safe to postpone, or click one of the quick actions below to analyze your deadlines.`,
      timestamp: '12:00 PM',
    },
    {
      id: 'user_prompt_msg',
      sender: 'user',
      text: 'I have 5 hours left.',
      timestamp: '12:01 PM',
    },
    {
      id: 'ai_prompt_msg',
      sender: 'ai',
      text: `### ⚡ Action Plan\nI recommend **skipping Task B (Meeting)**.\n\nMove **Interview Prep** to tomorrow.\nFinish **Assignment** first (highest urgency with only 5h 18m remaining).`,
      timestamp: '12:01 PM',
    },
  ]);

  // Wrapper setters to ensure storage synchronization
  const setTheme = useCallback((val: 'light' | 'dark') => {
    setThemeState(val);
    storageService.setTheme(val);
  }, []);

  const setTimezone = useCallback((val: string) => {
    setTimezoneState(val);
    storageService.setTimezone(val);
  }, []);

  const setTasks = useCallback((val: Task[] | ((prev: Task[]) => Task[])) => {
    setTasksState(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      storageService.setTasks(next);
      return next;
    });
  }, []);

  const setScheduleEvents = useCallback((val: ScheduleEvent[]) => {
    setScheduleEventsState(val);
    storageService.setScheduleEvents(val);
  }, []);

  const setLunchStatus = useCallback((val: 'pending' | 'completed' | 'skipped') => {
    setLunchStatusState(val);
    storageService.setLunchStatus(val);
  }, []);

  const setLastSleepLoggedDate = useCallback((val: string) => {
    setLastSleepLoggedDateState(val);
    storageService.setLastSleepLoggedDate(val);
  }, []);

  // Proactive automatic schedule reorganization when a task is slipping
  const detectSlippageAndReorganize = useCallback(async (currentTasks: Task[]) => {
    const activeTasks = currentTasks.filter(t => t.status !== 'completed' && t.category !== 'Bill Payment');
    const isSlipping = activeTasks.some(t => {
      const remainingWork = t.hoursNeeded - t.hoursCompleted;
      return remainingWork > t.deadlineHours;
    });

    if (isSlipping && !twinReorg.visible) {
      setIsReorganizing(true);
      try {
        const res = await aiService.reorganizeSchedule(currentTasks, scheduleEvents);
        setTwinReorg({
          explanation: res.explanation,
          beforeEvents: [...scheduleEvents],
          afterEvents: res.reorganizedEvents,
          visible: true,
        });
      } catch (err) {
        console.error('Failed to trigger automatic digital twin reorganization:', err);
      } finally {
        setIsReorganizing(false);
      }
    }
  }, [scheduleEvents, twinReorg.visible]);

  // Handle task property updates
  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasksState(prev => {
      const next = prev.map(t => (t.id === id ? { ...t, ...updates } : t));
      storageService.setTasks(next);
      // Run asynchronous check for slippage in the background
      setTimeout(() => detectSlippageAndReorganize(next), 100);
      return next;
    });
  }, [detectSlippageAndReorganize]);

  // Start/Pause tracking timer for a task
  const handleToggleTracking = useCallback((id: string) => {
    setTasksState(prev => {
      const isCurrentlyTracking = prev.find(t => t.id === id)?.isTracking;
      const next = prev.map(t => {
        if (t.id === id) {
          return { ...t, isTracking: !t.isTracking };
        }
        // Pause all other timers
        return { ...t, isTracking: false };
      });
      storageService.setTasks(next);
      if (!isCurrentlyTracking) {
        setActiveFocusTaskId(id);
      }
      return next;
    });
  }, []);

  // Complete/Uncomplete a task
  const handleToggleCompleted = useCallback((id: string) => {
    setTasksState(prev => {
      const next = prev.map(t => {
        if (t.id === id) {
          const isCompleting = t.status !== 'completed';
          return {
            ...t,
            status: isCompleting ? 'completed' as const : 'in_progress' as const,
            isTracking: false,
          };
        }
        return t;
      });
      storageService.setTasks(next);
      return next;
    });
  }, []);

  // Trigger manual schedule reorganization (Digital Twin Override)
  const triggerManualReorganization = useCallback(async () => {
    setIsReorganizing(true);
    try {
      const res = await aiService.reorganizeSchedule(tasks, scheduleEvents);
      setTwinReorg({
        explanation: res.explanation,
        beforeEvents: [...scheduleEvents],
        afterEvents: res.reorganizedEvents,
        visible: true,
      });
    } catch (err) {
      console.error('Twin reorganization trigger failed:', err);
    } finally {
      setIsReorganizing(false);
    }
  }, [tasks, scheduleEvents]);

  // Apply reorganized schedule proposed by the Twin
  const acceptTwinReorganization = useCallback(() => {
    if (twinReorg.afterEvents.length > 0) {
      setScheduleEvents(twinReorg.afterEvents);
    }
    setTwinReorg(prev => ({ ...prev, visible: false }));
  }, [twinReorg, setScheduleEvents]);

  const dismissTwinReorganization = () => {
    setTwinReorg(prev => ({ ...prev, visible: false }));
  };

  // Helper date utility
  const getTodayDateString = useCallback((tz: string) => {
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return formatter.format(new Date());
    } catch (e) {
      const offset = new Date().getTimezoneOffset();
      const local = new Date(new Date().getTime() - offset * 60 * 1000);
      return local.toISOString().split('T')[0];
    }
  }, []);

  // Fetch or calculate deadline risks
  const refreshRisk = useCallback(async () => {
    setIsLoadingRisk(true);
    try {
      const res = await aiService.getRiskAnalysis(tasks);
      setRisk({
        riskScore: res.riskScore,
        likelyToMiss: res.likelyToMiss,
        suggestions: res.suggestions,
        explanation: res.explanation,
        source: res.source,
        todayPriorities: res.todayPriorities,
        predictedCompletionTimes: res.predictedCompletionTimes,
        suggestedScheduleChanges: res.suggestedScheduleChanges,
        productivitySummary: res.productivitySummary,
        digitalTwinStatement: res.digitalTwinStatement,
        tasksWithRisk: res.tasksWithRisk,
      });
    } catch (error) {
      console.error('AI risk calculation error, using local fallback:', error);
      // Heuristic fallback calculation
      const active = tasks.filter(t => t.status !== 'completed');
      if (active.length === 0) {
        setRisk({
          riskScore: 5,
          likelyToMiss: [],
          suggestions: ['Perfect alignment! All tasks finished.'],
          explanation: 'All objectives logged today have been completed successfully.',
          todayPriorities: [],
          predictedCompletionTimes: 'Completed',
          suggestedScheduleChanges: [],
          productivitySummary: 'All tasks completed successfully.',
          digitalTwinStatement: 'Excellent work today! Your slate is completely clean. Rest and recover.',
          tasksWithRisk: []
        });
      } else {
        const slip = active.filter(t => (t.hoursNeeded - t.hoursCompleted) > t.deadlineHours).map(t => t.title);
        const slipTasks = active.filter(t => (t.hoursNeeded - t.hoursCompleted) > t.deadlineHours);
        
        // Build heuristic values
        const totalWork = active.reduce((acc, t) => acc + (t.hoursNeeded - t.hoursCompleted), 0);
        const now = new Date();
        now.setMinutes(now.getMinutes() + Math.round(totalWork * 60 * 1.25));
        const predictedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setRisk({
          riskScore: slip.length > 0 ? 88 : 42,
          likelyToMiss: slip,
          suggestions: slip.length > 0
            ? [`Start ${slip[0]} immediately. Remaining work exceeds deadline.`, 'Mute notification hubs', 'Adjust calendar routine']
            : ['Consolidate meetings', 'Secure 90-minute study blocks', 'Sleep on time'],
          explanation: slip.length > 0
            ? `Your schedule is congested. Tight constraints detected on: ${slip.join(', ')}.`
            : 'Workload is dense but manageable. Stay disciplined to prevent bottlenecks.',
          todayPriorities: active.map(t => t.title),
          predictedCompletionTimes: predictedTime,
          suggestedScheduleChanges: [
            `Postpone Leisure block to clear a deep-focus sprint for ${active[0]?.title || 'objectives'}.`,
            'Reschedule Workout session downstream.'
          ],
          productivitySummary: `You have ${active.length} active objectives requiring ${totalWork.toFixed(1)} hours of workload.`,
          digitalTwinStatement: slip.length > 0
            ? `I noticed today's plan is unrealistic. Your active load is too heavy. I suggests moving Gym or leisure blocks downstream to create a dedicated deep-focus protocol for ${active[0]?.title}.`
            : `Your schedule is completely in sync with your capacity today. I predict you will complete your objectives around ${predictedTime}.`,
          tasksWithRisk: tasks.map(t => {
            const rem = t.hoursNeeded - t.hoursCompleted;
            const level = rem > t.deadlineHours ? 'high' : rem / t.deadlineHours > 0.5 ? 'medium' : 'low';
            return {
              id: t.id,
              riskLevel: level as any,
              explanation: rem > t.deadlineHours 
                ? 'Time needed exceeds deadline buffer.' 
                : 'Manageable buffer.'
            };
          })
        });
      }
    } finally {
      setIsLoadingRisk(false);
    }
  }, [tasks]);

  // Refresh dynamic AI planning protocol (Genuinely dynamic steps)
  const refreshPlan = useCallback(async () => {
    setIsLoadingPlan(true);
    try {
      const steps = await aiService.generateDynamicPlan(tasks, risk);
      setPlanStepsState(steps);
      storageService.setPlanSteps(steps);
    } catch (error) {
      console.error('Failed to generate dynamic plan, using fallback steps:', error);
      // Custom dynamic fallback based on the active state
      const active = tasks.filter(t => t.status !== 'completed');
      const mostUrgent = active[0]?.title || 'Assignment';
      const steps: PlanStep[] = [
        {
          title: `Intense Sprint: ${mostUrgent}`,
          desc: `Dedicate your next active hour to crushing outstanding tasks on **${mostUrgent}**. Shut down social devices.`,
          time: 'First 90 Minutes',
          urgency: 'CRITICAL',
        },
        {
          title: 'Reschedule Chores & Meetings',
          desc: `Examine low priority events or administrative tasks. Clear them from your afternoon blocks.`,
          time: 'Afternoon Audit',
          urgency: 'MEDIUM',
        },
        {
          title: 'Pomodoro Breathing Cycle',
          desc: 'Relax your visual cortex during brief Pomodoro breaks to prevent fatigue.',
          time: 'Rest Windows',
          urgency: 'LOW',
        },
      ];
      setPlanStepsState(steps);
      storageService.setPlanSteps(steps);
    } finally {
      setIsLoadingPlan(false);
    }
  }, [tasks, risk]);

  // Synchronize dynamic elements on mount & when tasks state changes
  useEffect(() => {
    const activeTasks = tasks.filter(t => !t.id.startsWith('task_prev_') && t.status !== 'completed');
    if (activeTasks.length > 0 && !activeFocusTaskId) {
      setActiveFocusTaskId(activeTasks[0].id);
    }
  }, [tasks, activeFocusTaskId]);

  // Proactive automatic refresh of risk analysis when tasks change
  useEffect(() => {
    refreshRisk();
  }, [tasks.length, tasks.map(t => t.status).join(','), refreshRisk]);

  // Handle active countdown / ticking logic inside the hooks
  useEffect(() => {
    const activeTrackedTask = tasks.find(t => t.isTracking);
    if (activeTrackedTask) {
      const interval = setInterval(() => {
        setTasksState(prev => {
          const next = prev.map(t => {
            if (t.isTracking) {
              const updatedCompleted = parseFloat((t.hoursCompleted + 1 / 3600).toFixed(5));
              const updatedRemaining = parseFloat(Math.max(0, t.deadlineHours - 1 / 3600).toFixed(5));
              return {
                ...t,
                hoursCompleted: updatedCompleted,
                deadlineHours: updatedRemaining,
              };
            }
            return t;
          });
          storageService.setTasks(next);
          return next;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [tasks]);

  // Log Lunch status
  const onLogLunchToday = useCallback((status: 'completed' | 'skipped') => {
    const todayStr = getTodayDateString(timezone);
    const newRecord = { date: todayStr, status };
    setLunchRecordsState(prev => {
      const next = [newRecord, ...prev.filter(r => r.date !== todayStr)];
      storageService.setLunchRecords(next);
      return next;
    });
    setLunchStatus(status);
  }, [timezone, getTodayDateString, setLunchStatus]);

  // Log Sleep status
  const onLogSleepToday = useCallback((sleptAt: string, wokeAt: string) => {
    const todayStr = getTodayDateString(timezone);
    const hrs = calculateDurationHours(sleptAt, wokeAt);
    const newRecord = { date: todayStr, hours: hrs, sleptAt, wokeAt };
    setSleepRecordsState(prev => {
      const next = [newRecord, ...prev.filter(r => r.date !== todayStr)];
      storageService.setSleepRecords(next);
      return next;
    });
    setSleepSleptTime(sleptAt);
    setSleepWokeTime(wokeAt);
    setLastSleepLoggedDate(todayStr);
    storageService.setSleepSleptTime(sleptAt);
    storageService.setSleepWokeTime(wokeAt);
  }, [timezone, getTodayDateString, setLastSleepLoggedDate]);

  const onSaveLunchSettings = useCallback((start: string, end: string) => {
    setLunchStart(start);
    setLunchEnd(end);
    storageService.setLunchStart(start);
    storageService.setLunchEnd(end);
  }, []);

  const setLunchStartWrapper = useCallback((val: string) => {
    setLunchStart(val);
    storageService.setLunchStart(val);
  }, []);

  const setLunchEndWrapper = useCallback((val: string) => {
    setLunchEnd(val);
    storageService.setLunchEnd(val);
  }, []);

  return {
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
    setLunchStart: setLunchStartWrapper,
    setLunchEnd: setLunchEndWrapper,
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
  };
}

// Utility to calculate duration hours between times
function calculateDurationHours(start: string, end: string): number {
  const [sH, sM] = start.split(':').map(Number);
  const [eH, eM] = end.split(':').map(Number);
  let diff = (eH * 60 + eM) - (sH * 60 + sM);
  if (diff < 0) {
    diff += 24 * 60; // Slept past midnight
  }
  return parseFloat((diff / 60).toFixed(1));
}
