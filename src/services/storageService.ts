import { Task, ScheduleEvent } from '../types';

const KEYS = {
  THEME: 'dt_theme',
  TIMEZONE: 'dt_timezone',
  SCHEDULE_EVENTS: 'dt_schedule_events',
  LUNCH_START: 'dt_lunch_start',
  LUNCH_END: 'dt_lunch_end',
  LUNCH_STATUS: 'dt_lunch_status',
  LUNCH_RECORDS: 'dt_lunch_records',
  SLEEP_SLEPT_TIME: 'dt_sleep_slept_time',
  SLEEP_WOKE_TIME: 'dt_sleep_woke_time',
  LAST_SLEEP_LOGGED_DATE: 'dt_last_sleep_logged_date',
  SLEEP_RECORDS: 'dt_sleep_records',
  TASKS: 'dt_tasks',
  PLAN_STEPS: 'dt_plan_steps',
};

const DEFAULT_TASKS: Task[] = [
  {
    id: 'task_1',
    title: 'Assignment',
    hoursCompleted: 6,
    hoursNeeded: 9,
    deadlineHours: 5.3,
    category: 'Assignment',
    status: 'in_progress',
    priority: 'high',
  },
  {
    id: 'task_2',
    title: 'Exam Prep',
    hoursCompleted: 4,
    hoursNeeded: 9,
    deadlineHours: 10,
    category: 'Exam Prep',
    status: 'in_progress',
    priority: 'medium',
  },
  {
    id: 'task_3',
    title: 'Meeting',
    hoursCompleted: 2,
    hoursNeeded: 9,
    deadlineHours: 24,
    category: 'Meeting',
    status: 'todo',
    priority: 'low',
  },
  {
    id: 'task_prev_1',
    title: 'Math Assignment 2',
    hoursCompleted: 8,
    hoursNeeded: 8,
    deadlineHours: 0,
    category: 'Assignment',
    status: 'completed',
    priority: 'medium',
  },
  {
    id: 'task_prev_2',
    title: 'History Assignment 1',
    hoursCompleted: 10,
    hoursNeeded: 10,
    deadlineHours: 0,
    category: 'Assignment',
    status: 'completed',
    priority: 'high',
  },
  {
    id: 'task_prev_3',
    title: 'Physics Midterm Study',
    hoursCompleted: 12,
    hoursNeeded: 12,
    deadlineHours: 0,
    category: 'Exam Prep',
    status: 'completed',
    priority: 'high',
  },
];

export const storageService = {
  getTheme(): 'light' | 'dark' {
    return (localStorage.getItem(KEYS.THEME) as 'light' | 'dark') || 'light';
  },
  setTheme(theme: 'light' | 'dark') {
    localStorage.setItem(KEYS.THEME, theme);
  },

  getTimezone(): string {
    return localStorage.getItem(KEYS.TIMEZONE) || 'Asia/Kolkata';
  },
  setTimezone(timezone: string) {
    localStorage.setItem(KEYS.TIMEZONE, timezone);
  },

  getScheduleEvents(): ScheduleEvent[] {
    const saved = localStorage.getItem(KEYS.SCHEDULE_EVENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse schedule events:', e);
      }
    }
    return [
      { id: 'se_1', title: 'Calculus Lecture', startTime: '09:00', endTime: '10:30', category: 'Class', days: ['Monday', 'Wednesday', 'Friday'] },
      { id: 'se_2', title: 'Strength Training', startTime: '17:00', endTime: '18:30', category: 'Workout', days: ['Tuesday', 'Thursday'] },
    ];
  },
  setScheduleEvents(events: ScheduleEvent[]) {
    localStorage.setItem(KEYS.SCHEDULE_EVENTS, JSON.stringify(events));
  },

  getLunchStart(): string {
    return localStorage.getItem(KEYS.LUNCH_START) || '13:00';
  },
  setLunchStart(val: string) {
    localStorage.setItem(KEYS.LUNCH_START, val);
  },

  getLunchEnd(): string {
    return localStorage.getItem(KEYS.LUNCH_END) || '14:00';
  },
  setLunchEnd(val: string) {
    localStorage.setItem(KEYS.LUNCH_END, val);
  },

  getLunchStatus(): 'pending' | 'completed' | 'skipped' {
    return (localStorage.getItem(KEYS.LUNCH_STATUS) as any) || 'pending';
  },
  setLunchStatus(val: 'pending' | 'completed' | 'skipped') {
    localStorage.setItem(KEYS.LUNCH_STATUS, val);
  },

  getLunchRecords(): any[] {
    const saved = localStorage.getItem(KEYS.LUNCH_RECORDS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse lunch records:', e);
      }
    }
    return [];
  },
  setLunchRecords(records: any[]) {
    localStorage.setItem(KEYS.LUNCH_RECORDS, JSON.stringify(records));
  },

  getSleepSleptTime(): string {
    return localStorage.getItem(KEYS.SLEEP_SLEPT_TIME) || '23:00';
  },
  setSleepSleptTime(val: string) {
    localStorage.setItem(KEYS.SLEEP_SLEPT_TIME, val);
  },

  getSleepWokeTime(): string {
    return localStorage.getItem(KEYS.SLEEP_WOKE_TIME) || '07:00';
  },
  setSleepWokeTime(val: string) {
    localStorage.setItem(KEYS.SLEEP_WOKE_TIME, val);
  },

  getLastSleepLoggedDate(): string {
    return localStorage.getItem(KEYS.LAST_SLEEP_LOGGED_DATE) || '';
  },
  setLastSleepLoggedDate(val: string) {
    localStorage.setItem(KEYS.LAST_SLEEP_LOGGED_DATE, val);
  },

  getSleepRecords(): any[] {
    const saved = localStorage.getItem(KEYS.SLEEP_RECORDS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse sleep records:', e);
      }
    }
    return [];
  },
  setSleepRecords(records: any[]) {
    localStorage.setItem(KEYS.SLEEP_RECORDS, JSON.stringify(records));
  },

  getTasks(): Task[] {
    const saved = localStorage.getItem(KEYS.TASKS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse tasks:', e);
      }
    }
    return DEFAULT_TASKS;
  },
  setTasks(tasks: Task[]) {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  },

  getPlanSteps(): any[] | null {
    const saved = localStorage.getItem(KEYS.PLAN_STEPS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse plan steps:', e);
      }
    }
    return null;
  },
  setPlanSteps(steps: any[]) {
    localStorage.setItem(KEYS.PLAN_STEPS, JSON.stringify(steps));
  },
};
