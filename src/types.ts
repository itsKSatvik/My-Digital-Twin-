export interface Task {
  id: string;
  title: string;
  hoursCompleted: number;
  hoursNeeded: number;
  deadlineHours: number; // Hours remaining from now
  deadlineDate?: string; // Exact date and time as ISO/local string
  category: 'Assignment' | 'Exam Prep' | 'Meeting' | 'Work' | 'Personal' | 'Bill Payment';
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  isTracking?: boolean; // Active timer state
  paymentType?: 'one-time' | 'recurring';
  cycleTime?: string; // e.g., 'weekly', 'monthly', 'yearly', etc.
}

export interface RiskAnalysis {
  riskScore: number; // 0 - 100
  likelyToMiss: string[];
  suggestions: string[];
  explanation: string;
  source?: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:30"
  category: 'Class' | 'Workout' | 'Meal' | 'Study' | 'Leisure' | 'Other';
  days?: string[]; // e.g. ["Monday", "Wednesday"]
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
