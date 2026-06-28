import { Task, RiskAnalysis, ChatMessage, ScheduleEvent } from '../types';

export interface PlanStep {
  title: string;
  desc: string;
  time: string;
  urgency: 'CRITICAL' | 'MEDIUM' | 'LOW';
  priority?: string;
  duration?: string;
  reason?: string;
  expectedFinishTime?: string;
  dependencies?: string[];
  confidence?: number;
}

export interface ReorganizeResult {
  reorganizedEvents: ScheduleEvent[];
  explanation: string;
  affectedTasks: string[];
}

export interface SurvivalPlanResult {
  reorderedTasks: Task[];
  skipRecommendations: string[];
  survivalPlan: string;
  source?: string;
}

export const aiService = {
  async getRiskAnalysis(tasks: Task[]): Promise<RiskAnalysis & { source?: string }> {
    const response = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks }),
    });
    if (!response.ok) throw new Error('Failed to fetch risk parameters');
    return response.json();
  },

  async sendChatMessage(messages: ChatMessage[], tasks: Task[]): Promise<{ text: string; source?: string }> {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, tasks }),
    });
    if (!response.ok) throw new Error('Failed to send chat message');
    return response.json();
  },

  async generateDynamicPlan(tasks: Task[], risk: RiskAnalysis): Promise<PlanStep[]> {
    const response = await fetch('/api/planner/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks, risk }),
    });
    if (!response.ok) throw new Error('Failed to generate dynamic plan');
    const data = await response.json();
    return data.steps;
  },

  async reorganizeSchedule(tasks: Task[], scheduleEvents: ScheduleEvent[]): Promise<ReorganizeResult> {
    const response = await fetch('/api/digitaltwin/reorganize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks, scheduleEvents }),
    });
    if (!response.ok) throw new Error('Failed to reorganize schedule');
    return response.json();
  },

  async getEmergencySurvivalPlan(tasks: Task[]): Promise<SurvivalPlanResult> {
    const response = await fetch('/api/emergency/survival', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks }),
    });
    if (!response.ok) throw new Error('Failed to fetch emergency survival plan');
    return response.json();
  }
};
