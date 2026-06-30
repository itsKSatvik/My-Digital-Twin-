export type TaskCategory =
  | 'Study'
  | 'Work'
  | 'Assignment'
  | 'Meeting'
  | 'Bill Payment'
  | 'Health & Fitness'
  | 'Shopping'
  | 'Travel'
  | 'Household'
  | 'Personal Goal'
  | 'Habit'
  | 'Custom'
  | 'Exam Prep' // Legacy compatibility
  | 'Personal';  // Legacy compatibility

export interface Task {
  id: string;
  title: string;
  hoursCompleted: number;
  hoursNeeded: number;
  deadlineHours: number; // Hours remaining from now
  deadlineDate?: string; // Exact date and time as ISO/local string
  category: TaskCategory;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  isTracking?: boolean; // Active timer state
  
  // Custom metadata fields for different categories
  // STUDY
  subject?: string;
  examDate?: string;
  topics?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  revisionRequired?: boolean;
  confidenceLevel?: 'low' | 'medium' | 'high';
  studyMaterial?: string;

  // ASSIGNMENT
  course?: string;
  dependencies?: string;
  referenceMaterial?: string;
  submissionLink?: string;

  // BILL PAYMENT
  billName?: string;
  amount?: number;
  dueDate?: string;
  recurring?: boolean;
  paymentMethod?: string;
  lateFee?: number;
  autoPay?: boolean;
  cycleTime?: string; // e.g., 'weekly', 'monthly', 'yearly', etc.
  paymentType?: 'one-time' | 'recurring'; // Legacy compatibility

  // SHOPPING
  store?: string;
  items?: string;
  budget?: number;

  // WORKOUT / HEALTH & FITNESS
  workoutType?: string;
  duration?: number; // Duration in minutes
  intensity?: 'low' | 'medium' | 'high';
  goal?: string;
  recovery?: number; // 0 - 100
  sleep?: number; // Hours slept

  // MEETING
  agenda?: string;
  location?: string;
  participants?: string;
  preparationTime?: number; // Preparation in hours
  documents?: string;
  travelTime?: number; // Travel time in minutes

  // TRAVEL
  destination?: string;
  departure?: string;
  packing?: string;
  tickets?: string;
  hotel?: string;
  checklist?: string;

  // CUSTOM / OTHER
  customNotes?: string;
}

export interface RiskAnalysis {
  riskScore: number; // 0 - 100
  likelyToMiss: string[];
  suggestions: string[];
  explanation: string;
  source?: string;
  todayPriorities?: string[];
  predictedCompletionTimes?: string;
  suggestedScheduleChanges?: string[];
  productivitySummary?: string;
  digitalTwinStatement?: string;
  tasksWithRisk?: { id: string; riskLevel: 'low' | 'medium' | 'high'; explanation: string }[];
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
