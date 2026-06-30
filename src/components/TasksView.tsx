import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  Clock, 
  AlertTriangle, 
  Filter, 
  RotateCcw,
  PlusCircle,
  FolderMinus,
  Briefcase,
  BookOpen,
  Coffee,
  CheckCircle2,
  CalendarDays,
  Play,
  Pause,
  CreditCard,
  FileText,
  Dumbbell,
  ShoppingCart,
  Plane,
  Home,
  Target,
  Activity,
  Layers
} from 'lucide-react';
import { Task, TaskCategory } from '../types';
import { detectTaskCategory } from '../utils/taskDetector';

interface TasksViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  refreshRisk: () => void;
  isWorkspaceConnected: boolean;
  workspaceTasks: any[];
  isWorkspaceLoading: boolean;
  syncWorkspaceData: () => Promise<void>;
}

export default function TasksView({ 
  tasks, 
  setTasks, 
  refreshRisk,
  isWorkspaceConnected,
  workspaceTasks,
  isWorkspaceLoading,
  syncWorkspaceData
}: TasksViewProps) {
  // Form States
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TaskCategory>('Assignment');
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [newHoursNeeded, setNewHoursNeeded] = useState(8);
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [addToGoogleTasks, setAddToGoogleTasks] = useState(false);

  // Custom metadata states
  // STUDY
  const [studySubject, setStudySubject] = useState('');
  const [studyExamDate, setStudyExamDate] = useState('');
  const [studyTopics, setStudyTopics] = useState('');
  const [studyDifficulty, setStudyDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [studyConfidence, setStudyConfidence] = useState<'low' | 'medium' | 'high'>('medium');
  const [studyMaterial, setStudyMaterial] = useState('');
  const [studyRevision, setStudyRevision] = useState(false);

  // ASSIGNMENT
  const [assignCourse, setAssignCourse] = useState('');
  const [assignDependencies, setAssignDependencies] = useState('');
  const [assignRefMaterial, setAssignRefMaterial] = useState('');
  const [assignSubLink, setAssignSubLink] = useState('');

  // BILL PAYMENT
  const [billAmount, setBillAmount] = useState<number | ''>('');
  const [billRecurring, setBillRecurring] = useState(false);
  const [billMethod, setBillMethod] = useState('');
  const [billLateFee, setBillLateFee] = useState<number | ''>('');
  const [billAutoPay, setBillAutoPay] = useState(false);
  const [paymentType, setPaymentType] = useState<'one-time' | 'recurring'>('one-time');
  const [cycleTime, setCycleTime] = useState<string>('Monthly');

  // SHOPPING
  const [shopStore, setShopStore] = useState('');
  const [shopItems, setShopItems] = useState('');
  const [shopBudget, setShopBudget] = useState<number | ''>('');

  // WORKOUT / HEALTH & FITNESS
  const [workWorkoutType, setWorkWorkoutType] = useState('');
  const [workDuration, setWorkDuration] = useState<number | ''>('');
  const [workIntensity, setWorkIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [workGoal, setWorkGoal] = useState('');
  const [workRecovery, setWorkRecovery] = useState<number | ''>('');
  const [workSleep, setWorkSleep] = useState<number | ''>('');

  // MEETING
  const [meetAgenda, setMeetAgenda] = useState('');
  const [meetLocation, setMeetLocation] = useState('');
  const [meetParticipants, setMeetParticipants] = useState('');
  const [meetPrepTime, setMeetPrepTime] = useState<number | ''>('');
  const [meetDocuments, setMeetDocuments] = useState('');
  const [meetTravelTime, setMeetTravelTime] = useState<number | ''>('');

  // TRAVEL
  const [travelDest, setTravelDest] = useState('');
  const [travelDeparture, setTravelDeparture] = useState('');
  const [travelPacking, setTravelPacking] = useState('');
  const [travelTickets, setTravelTickets] = useState('');
  const [travelHotel, setTravelHotel] = useState('');
  const [travelChecklist, setTravelChecklist] = useState('');

  // CUSTOM
  const [customNotes, setCustomNotes] = useState('');

  const [newDeadlineDate, setNewDeadlineDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
  });

  // Filter States
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');

  // Helper to reset form metadata
  const resetMetadataForm = () => {
    setNewTitle('');
    setNewHoursNeeded(8);
    setNewPriority('medium');
    setNewCategory('Assignment');
    setIsAutoDetected(false);
    
    // Reset study
    setStudySubject('');
    setStudyExamDate('');
    setStudyTopics('');
    setStudyDifficulty('medium');
    setStudyConfidence('medium');
    setStudyMaterial('');
    setStudyRevision(false);

    // Reset assignment
    setAssignCourse('');
    setAssignDependencies('');
    setAssignRefMaterial('');
    setAssignSubLink('');

    // Reset bill
    setBillAmount('');
    setBillRecurring(false);
    setBillMethod('');
    setBillLateFee('');
    setBillAutoPay(false);
    setPaymentType('one-time');
    setCycleTime('Monthly');

    // Reset shopping
    setShopStore('');
    setShopItems('');
    setShopBudget('');

    // Reset workout
    setWorkWorkoutType('');
    setWorkDuration('');
    setWorkIntensity('medium');
    setWorkGoal('');
    setWorkRecovery('');
    setWorkSleep('');

    // Reset meeting
    setMeetAgenda('');
    setMeetLocation('');
    setMeetParticipants('');
    setMeetPrepTime('');
    setMeetDocuments('');
    setMeetTravelTime('');

    // Reset travel
    setTravelDest('');
    setTravelDeparture('');
    setTravelPacking('');
    setTravelTickets('');
    setTravelHotel('');
    setTravelChecklist('');

    // Reset custom
    setCustomNotes('');

    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    const pad = (n: number) => String(n).padStart(2, '0');
    setNewDeadlineDate(`${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`);
  };

  // Smart Task Detection on Keypress
  const handleTitleChange = (val: string) => {
    setNewTitle(val);
    if (!editingTaskId) {
      const { category, confidence } = detectTaskCategory(val);
      if (confidence === 'high') {
        setNewCategory(category);
        setIsAutoDetected(true);
      } else {
        setIsAutoDetected(false);
      }
    }
  };

  // Add Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Calculate deadlineHours from newDeadlineDate
    const diffMs = new Date(newDeadlineDate).getTime() - new Date().getTime();
    const computedDeadlineHours = diffMs > 0 ? Math.max(0.1, Math.round((diffMs / 3600000) * 10) / 10) : 0;

    const newTask: Task = {
      id: 'task_' + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      hoursNeeded: newCategory === 'Bill Payment' ? 1 : Math.max(1, Number(newHoursNeeded)),
      hoursCompleted: 0,
      deadlineHours: computedDeadlineHours,
      deadlineDate: newDeadlineDate,
      status: 'todo',
      priority: newPriority,
      
      // Study
      subject: (newCategory === 'Study' || newCategory === 'Exam Prep') ? studySubject.trim() || undefined : undefined,
      examDate: (newCategory === 'Study' || newCategory === 'Exam Prep') ? studyExamDate || undefined : undefined,
      topics: (newCategory === 'Study' || newCategory === 'Exam Prep') ? studyTopics.trim() || undefined : undefined,
      difficulty: (newCategory === 'Study' || newCategory === 'Exam Prep') ? studyDifficulty : undefined,
      confidenceLevel: (newCategory === 'Study' || newCategory === 'Exam Prep') ? studyConfidence : undefined,
      studyMaterial: (newCategory === 'Study' || newCategory === 'Exam Prep') ? studyMaterial.trim() || undefined : undefined,
      revisionRequired: (newCategory === 'Study' || newCategory === 'Exam Prep') ? studyRevision : undefined,

      // Assignment
      course: newCategory === 'Assignment' ? assignCourse.trim() || undefined : undefined,
      dependencies: newCategory === 'Assignment' ? assignDependencies.trim() || undefined : undefined,
      referenceMaterial: newCategory === 'Assignment' ? assignRefMaterial.trim() || undefined : undefined,
      submissionLink: newCategory === 'Assignment' ? assignSubLink.trim() || undefined : undefined,

      // Bill Payment
      amount: newCategory === 'Bill Payment' ? (billAmount !== '' ? Number(billAmount) : undefined) : undefined,
      recurring: newCategory === 'Bill Payment' ? billRecurring : undefined,
      paymentMethod: newCategory === 'Bill Payment' ? billMethod.trim() || undefined : undefined,
      lateFee: newCategory === 'Bill Payment' ? (billLateFee !== '' ? Number(billLateFee) : undefined) : undefined,
      autoPay: newCategory === 'Bill Payment' ? billAutoPay : undefined,
      paymentType: newCategory === 'Bill Payment' ? paymentType : undefined,
      cycleTime: (newCategory === 'Bill Payment' && (paymentType === 'recurring' || billRecurring)) ? cycleTime : undefined,

      // Shopping
      store: newCategory === 'Shopping' ? shopStore.trim() || undefined : undefined,
      items: newCategory === 'Shopping' ? shopItems.trim() || undefined : undefined,
      budget: newCategory === 'Shopping' ? (shopBudget !== '' ? Number(shopBudget) : undefined) : undefined,

      // Workout / Health & Fitness
      workoutType: newCategory === 'Health & Fitness' ? workWorkoutType.trim() || undefined : undefined,
      duration: newCategory === 'Health & Fitness' ? (workDuration !== '' ? Number(workDuration) : undefined) : undefined,
      intensity: newCategory === 'Health & Fitness' ? workIntensity : undefined,
      goal: newCategory === 'Health & Fitness' ? workGoal.trim() || undefined : undefined,
      recovery: newCategory === 'Health & Fitness' ? (workRecovery !== '' ? Number(workRecovery) : undefined) : undefined,
      sleep: newCategory === 'Health & Fitness' ? (workSleep !== '' ? Number(workSleep) : undefined) : undefined,

      // Meeting
      agenda: newCategory === 'Meeting' ? meetAgenda.trim() || undefined : undefined,
      location: newCategory === 'Meeting' ? meetLocation.trim() || undefined : undefined,
      participants: newCategory === 'Meeting' ? meetParticipants.trim() || undefined : undefined,
      preparationTime: newCategory === 'Meeting' ? (meetPrepTime !== '' ? Number(meetPrepTime) : undefined) : undefined,
      documents: newCategory === 'Meeting' ? meetDocuments.trim() || undefined : undefined,
      travelTime: newCategory === 'Meeting' ? (meetTravelTime !== '' ? Number(meetTravelTime) : undefined) : undefined,

      // Travel
      destination: newCategory === 'Travel' ? travelDest.trim() || undefined : undefined,
      departure: newCategory === 'Travel' ? travelDeparture || undefined : undefined,
      packing: newCategory === 'Travel' ? travelPacking.trim() || undefined : undefined,
      tickets: newCategory === 'Travel' ? travelTickets.trim() || undefined : undefined,
      hotel: newCategory === 'Travel' ? travelHotel.trim() || undefined : undefined,
      checklist: newCategory === 'Travel' ? travelChecklist.trim() || undefined : undefined,

      // Custom
      customNotes: newCategory === 'Custom' ? customNotes.trim() || undefined : undefined
    };

    setTasks(prev => {
      const updated = [...prev, newTask];
      setTimeout(refreshRisk, 50);
      return updated;
    });

    if (isWorkspaceConnected && addToGoogleTasks) {
      try {
        await fetch('/api/workspace/tasks/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newTitle.trim(),
            notes: `Task category: ${newCategory}. Created from My Digital Twin.`,
            dueDate: newDeadlineDate
          })
        });
        await syncWorkspaceData();
      } catch (err) {
        console.error("Failed to add Google Task:", err);
      }
    }

    resetMetadataForm();
  };

  // Save Task Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !editingTaskId) return;

    const diffMs = new Date(newDeadlineDate).getTime() - new Date().getTime();
    const computedDeadlineHours = diffMs > 0 ? Math.max(0.1, Math.round((diffMs / 3600000) * 10) / 10) : 0;

    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id === editingTaskId) {
          const hoursNeededVal = newCategory === 'Bill Payment' ? 1 : Math.max(1, Number(newHoursNeeded));
          return {
            ...t,
            title: newTitle.trim(),
            category: newCategory,
            hoursNeeded: hoursNeededVal,
            deadlineHours: computedDeadlineHours,
            deadlineDate: newDeadlineDate,
            priority: newPriority,
            status: (t.hoursCompleted >= hoursNeededVal ? 'completed' : t.status === 'completed' ? 'todo' : t.status) as Task['status'],
            
            // Study
            subject: (newCategory === 'Study' || newCategory === 'Exam Prep') ? studySubject.trim() || undefined : undefined,
            examDate: (newCategory === 'Study' || newCategory === 'Exam Prep') ? studyExamDate || undefined : undefined,
            topics: (newCategory === 'Study' || newCategory === 'Exam Prep') ? studyTopics.trim() || undefined : undefined,
            difficulty: (newCategory === 'Study' || newCategory === 'Exam Prep') ? studyDifficulty : undefined,
            confidenceLevel: (newCategory === 'Study' || newCategory === 'Exam Prep') ? studyConfidence : undefined,
            studyMaterial: (newCategory === 'Study' || newCategory === 'Exam Prep') ? studyMaterial.trim() || undefined : undefined,
            revisionRequired: (newCategory === 'Study' || newCategory === 'Exam Prep') ? studyRevision : undefined,

            // Assignment
            course: newCategory === 'Assignment' ? assignCourse.trim() || undefined : undefined,
            dependencies: newCategory === 'Assignment' ? assignDependencies.trim() || undefined : undefined,
            referenceMaterial: newCategory === 'Assignment' ? assignRefMaterial.trim() || undefined : undefined,
            submissionLink: newCategory === 'Assignment' ? assignSubLink.trim() || undefined : undefined,

            // Bill Payment
            amount: newCategory === 'Bill Payment' ? (billAmount !== '' ? Number(billAmount) : undefined) : undefined,
            recurring: newCategory === 'Bill Payment' ? billRecurring : undefined,
            paymentMethod: newCategory === 'Bill Payment' ? billMethod.trim() || undefined : undefined,
            lateFee: newCategory === 'Bill Payment' ? (billLateFee !== '' ? Number(billLateFee) : undefined) : undefined,
            autoPay: newCategory === 'Bill Payment' ? billAutoPay : undefined,
            paymentType: newCategory === 'Bill Payment' ? paymentType : undefined,
            cycleTime: (newCategory === 'Bill Payment' && (paymentType === 'recurring' || billRecurring)) ? cycleTime : undefined,

            // Shopping
            store: newCategory === 'Shopping' ? shopStore.trim() || undefined : undefined,
            items: newCategory === 'Shopping' ? shopItems.trim() || undefined : undefined,
            budget: newCategory === 'Shopping' ? (shopBudget !== '' ? Number(shopBudget) : undefined) : undefined,

            // Workout / Health & Fitness
            workoutType: newCategory === 'Health & Fitness' ? workWorkoutType.trim() || undefined : undefined,
            duration: newCategory === 'Health & Fitness' ? (workDuration !== '' ? Number(workDuration) : undefined) : undefined,
            intensity: newCategory === 'Health & Fitness' ? workIntensity : undefined,
            goal: newCategory === 'Health & Fitness' ? workGoal.trim() || undefined : undefined,
            recovery: newCategory === 'Health & Fitness' ? (workRecovery !== '' ? Number(workRecovery) : undefined) : undefined,
            sleep: newCategory === 'Health & Fitness' ? (workSleep !== '' ? Number(workSleep) : undefined) : undefined,

            // Meeting
            agenda: newCategory === 'Meeting' ? meetAgenda.trim() || undefined : undefined,
            location: newCategory === 'Meeting' ? meetLocation.trim() || undefined : undefined,
            participants: newCategory === 'Meeting' ? meetParticipants.trim() || undefined : undefined,
            preparationTime: newCategory === 'Meeting' ? (meetPrepTime !== '' ? Number(meetPrepTime) : undefined) : undefined,
            documents: newCategory === 'Meeting' ? meetDocuments.trim() || undefined : undefined,
            travelTime: newCategory === 'Meeting' ? (meetTravelTime !== '' ? Number(meetTravelTime) : undefined) : undefined,

            // Travel
            destination: newCategory === 'Travel' ? travelDest.trim() || undefined : undefined,
            departure: newCategory === 'Travel' ? travelDeparture || undefined : undefined,
            packing: newCategory === 'Travel' ? travelPacking.trim() || undefined : undefined,
            tickets: newCategory === 'Travel' ? travelTickets.trim() || undefined : undefined,
            hotel: newCategory === 'Travel' ? travelHotel.trim() || undefined : undefined,
            checklist: newCategory === 'Travel' ? travelChecklist.trim() || undefined : undefined,

            // Custom
            customNotes: newCategory === 'Custom' ? customNotes.trim() || undefined : undefined
          };
        }
        return t;
      });
      setTimeout(refreshRisk, 50);
      return updated;
    });

    setEditingTaskId(null);
    resetMetadataForm();
  };

  // Select Task to Edit
  const handleEditClick = (task: Task) => {
    setEditingTaskId(task.id);
    setNewTitle(task.title);
    setNewCategory(task.category);
    setNewHoursNeeded(task.hoursNeeded);
    setNewPriority(task.priority);
    setIsAutoDetected(false);

    // Populate metadata fields
    setStudySubject(task.subject || '');
    setStudyExamDate(task.examDate || '');
    setStudyTopics(task.topics || '');
    setStudyDifficulty(task.difficulty || 'medium');
    setStudyConfidence(task.confidenceLevel || 'medium');
    setStudyMaterial(task.studyMaterial || '');
    setStudyRevision(task.revisionRequired || false);

    setAssignCourse(task.course || '');
    setAssignDependencies(task.dependencies || '');
    setAssignRefMaterial(task.referenceMaterial || '');
    setAssignSubLink(task.submissionLink || '');

    setBillAmount(task.amount !== undefined ? task.amount : '');
    setBillRecurring(task.recurring || false);
    setBillMethod(task.paymentMethod || '');
    setBillLateFee(task.lateFee !== undefined ? task.lateFee : '');
    setBillAutoPay(task.autoPay || false);
    setPaymentType(task.paymentType || (task.recurring ? 'recurring' : 'one-time'));
    setCycleTime(task.cycleTime || 'Monthly');

    setShopStore(task.store || '');
    setShopItems(task.items || '');
    setShopBudget(task.budget !== undefined ? task.budget : '');

    setWorkWorkoutType(task.workoutType || '');
    setWorkDuration(task.duration !== undefined ? task.duration : '');
    setWorkIntensity(task.intensity || 'medium');
    setWorkGoal(task.goal || '');
    setWorkRecovery(task.recovery !== undefined ? task.recovery : '');
    setWorkSleep(task.sleep !== undefined ? task.sleep : '');

    setMeetAgenda(task.agenda || '');
    setMeetLocation(task.location || '');
    setMeetParticipants(task.participants || '');
    setMeetPrepTime(task.preparationTime !== undefined ? task.preparationTime : '');
    setMeetDocuments(task.documents || '');
    setMeetTravelTime(task.travelTime !== undefined ? task.travelTime : '');

    setTravelDest(task.destination || '');
    setTravelDeparture(task.departure || '');
    setTravelPacking(task.packing || '');
    setTravelTickets(task.tickets || '');
    setTravelHotel(task.hotel || '');
    setTravelChecklist(task.checklist || '');

    setCustomNotes(task.customNotes || '');

    if (task.deadlineDate) {
      setNewDeadlineDate(task.deadlineDate);
    } else {
      const dt = new Date();
      dt.setMinutes(dt.getMinutes() + Math.round(task.deadlineHours * 60));
      const pad = (n: number) => String(n).padStart(2, '0');
      setNewDeadlineDate(`${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${dt.getDate()}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingTaskId(null);
    resetMetadataForm();
  };

  // Delete Task
  const handleDeleteTask = (id: string) => {
    setTasks(prev => {
      const updated = prev.filter(t => t.id !== id);
      setTimeout(refreshRisk, 50);
      return updated;
    });
  };

  // Toggle status
  const handleToggleStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'completed' ? 'todo' : 'completed';
        const nextCompleted = nextStatus === 'completed' ? t.hoursNeeded : 0;
        return { ...t, status: nextStatus, hoursCompleted: nextCompleted };
      }
      return t;
    }));
    setTimeout(refreshRisk, 100);
  };

  // Quick increment progress
  const handleIncrementProgress = (id: string, amount: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextCompleted = Math.max(0, Math.min(t.hoursNeeded, t.hoursCompleted + amount));
        const nextStatus = nextCompleted === t.hoursNeeded ? 'completed' : nextCompleted > 0 ? 'in_progress' : 'todo';
        return { ...t, hoursCompleted: nextCompleted, status: nextStatus };
      }
      return t;
    }));
    setTimeout(refreshRisk, 100);
  };

  // Quick decrement progress
  const handleDecrementProgress = (id: string, amount: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextCompleted = Math.max(0, Math.min(t.hoursNeeded, t.hoursCompleted - amount));
        const nextStatus = nextCompleted === t.hoursNeeded ? 'completed' : nextCompleted > 0 ? 'in_progress' : 'todo';
        return { ...t, hoursCompleted: nextCompleted, status: nextStatus };
      }
      return t;
    }));
    setTimeout(refreshRisk, 100);
  };

  // Get categories and items for filters
  const categories = [
    'All',
    'Study',
    'Work',
    'Assignment',
    'Meeting',
    'Bill Payment',
    'Health & Fitness',
    'Shopping',
    'Travel',
    'Household',
    'Personal Goal',
    'Habit',
    'Custom'
  ];
  const priorities = ['All', 'high', 'medium', 'low'];

  // Filter tasks
  const filteredTasks = (() => {
    const localFiltered = tasks.filter(task => {
      const matchesCategory = filterCategory === 'All' || task.category === filterCategory;
      const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
      return matchesCategory && matchesPriority;
    }).map(t => ({ ...t, isGoogle: false }));

    const googleFiltered = isWorkspaceConnected 
      ? workspaceTasks.filter(t => {
          const matchesCategory = filterCategory === 'All' || filterCategory === 'Personal' || filterCategory === 'Work';
          const matchesPriority = filterPriority === 'All';
          return matchesCategory && matchesPriority;
        }).map(t => ({
          id: t.id,
          title: t.title,
          hoursCompleted: t.status === 'completed' ? 1 : 0,
          hoursNeeded: 1,
          deadlineHours: t.due ? (new Date(t.due).getTime() - Date.now()) / 3600000 : 24,
          deadlineDate: t.due || undefined,
          category: 'Personal' as const,
          status: (t.status === 'completed' ? 'completed' : 'todo') as any,
          priority: 'medium' as const,
          isGoogle: true,
          notes: t.notes,
          listTitle: t.listTitle,
          isTracking: false
        }))
      : [];

    return [...localFiltered, ...googleFiltered];
  })();

  // Format task progress into continuous display string (hours, minutes, seconds)
  const formatTaskTime = (hours: number): string => {
    const totalSeconds = Math.round(hours * 3600);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    if (h > 0) {
      return `${h}h ${m}m ${s}s`;
    }
    if (m > 0) {
      return `${m}m ${s}s`;
    }
    return `${s}s`;
  };

  // Format deadline for user-friendly display
  const formatDeadline = (task: Task): string => {
    let dateObj: Date;
    if (task.deadlineDate) {
      dateObj = new Date(task.deadlineDate);
    } else if (task.deadlineHours > 0) {
      dateObj = new Date();
      dateObj.setMinutes(dateObj.getMinutes() + Math.round(task.deadlineHours * 60));
    } else {
      return 'No deadline';
    }

    return dateObj.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Toggle tracking (Start/Pause) for active tasks
  const handleToggleTracking = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextTracking = !t.isTracking;
        const nextStatus = nextTracking ? 'in_progress' : t.status;
        return { 
          ...t, 
          isTracking: nextTracking, 
          status: nextStatus === 'completed' && nextTracking ? 'in_progress' : nextStatus
        };
      }
      return { ...t, isTracking: false }; // Pause others
    }));
    setTimeout(refreshRisk, 50);
  };

  // Toggle completed status
  const handleToggleCompleted = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextStatus = t.status === 'completed' ? 'todo' : 'completed';
        const nextCompleted = nextStatus === 'completed' ? t.hoursNeeded : 0;
        return { 
          ...t, 
          status: nextStatus, 
          hoursCompleted: nextCompleted,
          isTracking: false // Pause if completed
        };
      }
      return t;
    }));
    setTimeout(refreshRisk, 100);
  };

  // Dynamically compute advice for estimated time from previous completed data
  const getCategoryEstimateAdvice = () => {
    // Filter completed tasks of this category
    const completedOfCategory = tasks.filter(t => t.category === newCategory && t.status === 'completed');
    
    // If no completed ones, fall back to any of this category (excluding custom active ones with default hours if possible)
    const anyOfCategory = completedOfCategory.length > 0 
      ? completedOfCategory 
      : tasks.filter(t => t.category === newCategory);
      
    if (anyOfCategory.length === 0) {
      return null;
    }
    
    const sum = anyOfCategory.reduce((acc, t) => acc + t.hoursNeeded, 0);
    const avg = Math.round((sum / anyOfCategory.length) * 10) / 10;
    return avg;
  };

  const adviceEstimate = getCategoryEstimateAdvice();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      id="tasks-view-container"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white font-sans tracking-tight">Task Workspace</h1>
        <p className="text-sm text-slate-400 font-sans mt-0.5">
          Insert objectives, modify parameters, and manage active hourly block timelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Form to add/edit tasks (5 Columns) */}
        <div className="lg:col-span-5 bg-[#171F34] border border-white/5 p-6 rounded-2xl h-fit">
          <h2 className="text-sm font-semibold text-white font-sans flex items-center gap-2 mb-5">
            {editingTaskId ? (
              <>
                <Edit2 className="w-4 h-4 text-emerald-500" />
                Edit Task Details
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 text-blue-500" />
                Create Workspace Entry
              </>
            )}
          </h2>

          <form onSubmit={editingTaskId ? handleSaveEdit : handleAddTask} className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Objective Title</label>
                {isAutoDetected && (
                  <motion.span 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-mono flex items-center gap-1 font-semibold"
                  >
                    ✨ Auto-categorized
                  </motion.span>
                )}
              </div>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Pay electricity bill tomorrow"
                className="w-full bg-[#0B1020] border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => {
                    setNewCategory(e.target.value as TaskCategory);
                    setIsAutoDetected(false); // Overridden manually
                  }}
                  className="w-full bg-[#0B1020] border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
                >
                  <option value="Study">📚 Study</option>
                  <option value="Work">💼 Work</option>
                  <option value="Assignment">📝 Assignment</option>
                  <option value="Meeting">📅 Meeting</option>
                  <option value="Bill Payment">💳 Bill Payment</option>
                  <option value="Health & Fitness">🏋 Health & Fitness</option>
                  <option value="Shopping">🛒 Shopping</option>
                  <option value="Travel">✈ Travel</option>
                  <option value="Household">🏠 Household</option>
                  <option value="Personal Goal">🎯 Personal Goal</option>
                  <option value="Habit">💡 Habit</option>
                  <option value="Custom">➕ Custom</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as Task['priority'])}
                  className="w-full bg-[#0B1020] border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
                >
                  <option value="high">🔴 High Urgency</option>
                  <option value="medium">🟡 Medium Urgency</option>
                  <option value="low">🟢 Low Urgency</option>
                </select>
              </div>
            </div>

            {/* Adaptive Smart Twin Metadata Section */}
            <motion.div
              key={newCategory}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="p-3.5 bg-[#0B1020]/50 rounded-xl border border-white/5 space-y-3 mt-3"
            >
              <div className="flex justify-between items-center pb-1 border-b border-white/5">
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest font-mono">
                  Adaptive Fields: {newCategory}
                </span>
                <span className="text-[8px] text-slate-500 font-mono">Twin Rec Option</span>
              </div>

              {/* Study Category */}
              {(newCategory === 'Study' || newCategory === 'Exam Prep') && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Subject</label>
                      <input
                        type="text"
                        value={studySubject}
                        onChange={(e) => setStudySubject(e.target.value)}
                        placeholder="e.g., Mathematics"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Exam Date</label>
                      <input
                        type="date"
                        value={studyExamDate}
                        onChange={(e) => setStudyExamDate(e.target.value)}
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none [color-scheme:dark]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-mono">Core Topics</label>
                    <input
                      type="text"
                      value={studyTopics}
                      onChange={(e) => setStudyTopics(e.target.value)}
                      placeholder="e.g., Fourier Transform, Calculus"
                      className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Difficulty</label>
                      <select
                        value={studyDifficulty}
                        onChange={(e) => setStudyDifficulty(e.target.value as any)}
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                      >
                        <option value="easy">🟢 Easy</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="hard">🔴 Hard</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Confidence Level</label>
                      <select
                        value={studyConfidence}
                        onChange={(e) => setStudyConfidence(e.target.value as any)}
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                      >
                        <option value="low">🔴 Low Confidence</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="high">🟢 High Confidence</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Primary Material</label>
                      <input
                        type="text"
                        value={studyMaterial}
                        onChange={(e) => setStudyMaterial(e.target.value)}
                        placeholder="e.g., Textbook chapter 4 & Lecture notes"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-[10px] text-slate-300 cursor-pointer select-none py-1">
                      <input
                        type="checkbox"
                        checked={studyRevision}
                        onChange={(e) => setStudyRevision(e.target.checked)}
                        className="rounded border-white/10 bg-[#0B1020] text-blue-500 focus:ring-0"
                      />
                      Schedule Revision Sessions before deadline
                    </label>
                  </div>
                </div>
              )}

              {/* Assignment Category */}
              {newCategory === 'Assignment' && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Course / Subject</label>
                      <input
                        type="text"
                        value={assignCourse}
                        onChange={(e) => setAssignCourse(e.target.value)}
                        placeholder="e.g., CS 301"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Submission Link</label>
                      <input
                        type="text"
                        value={assignSubLink}
                        onChange={(e) => setAssignSubLink(e.target.value)}
                        placeholder="e.g., Canvas submission URL"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Reference Material</label>
                      <input
                        type="text"
                        value={assignRefMaterial}
                        onChange={(e) => setAssignRefMaterial(e.target.value)}
                        placeholder="e.g., Slides, Rubric"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Prerequisites / Blockers</label>
                      <input
                        type="text"
                        value={assignDependencies}
                        onChange={(e) => setAssignDependencies(e.target.value)}
                        placeholder="e.g., Lab 2, API spec"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bill Payment Category */}
              {newCategory === 'Bill Payment' && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Bill Amount ($)</label>
                      <input
                        type="number"
                        value={billAmount}
                        onChange={(e) => setBillAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g., 120"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Estimated Late Fee ($)</label>
                      <input
                        type="number"
                        value={billLateFee}
                        onChange={(e) => setBillLateFee(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g., 15"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-mono">Payment Method</label>
                    <input
                      type="text"
                      value={billMethod}
                      onChange={(e) => setBillMethod(e.target.value)}
                      placeholder="e.g., Bank Autopay, Chase card"
                      className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-wrap gap-4 pt-1">
                    <label className="flex items-center gap-1.5 text-[10px] text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={billAutoPay}
                        onChange={(e) => setBillAutoPay(e.target.checked)}
                        className="rounded border-white/10 bg-[#0B1020] text-amber-500 focus:ring-0"
                      />
                      Auto Pay Enabled
                    </label>
                    <label className="flex items-center gap-1.5 text-[10px] text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={billRecurring}
                        onChange={(e) => {
                          setBillRecurring(e.target.checked);
                          if (e.target.checked) setPaymentType('recurring');
                        }}
                        className="rounded border-white/10 bg-[#0B1020] text-amber-500 focus:ring-0"
                      />
                      Recurring Payment
                    </label>
                  </div>
                </div>
              )}

              {/* Shopping Category */}
              {newCategory === 'Shopping' && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Store / Vendor</label>
                      <input
                        type="text"
                        value={shopStore}
                        onChange={(e) => setShopStore(e.target.value)}
                        placeholder="e.g., Costco, Amazon"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Total Budget ($)</label>
                      <input
                        type="number"
                        value={shopBudget}
                        onChange={(e) => setShopBudget(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g., 75"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-mono">Target Items List</label>
                    <input
                      type="text"
                      value={shopItems}
                      onChange={(e) => setShopItems(e.target.value)}
                      placeholder="e.g., Vegetables, Paper towels, Milk"
                      className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Health & Fitness Category */}
              {newCategory === 'Health & Fitness' && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Workout / Sport Type</label>
                      <input
                        type="text"
                        value={workWorkoutType}
                        onChange={(e) => setWorkWorkoutType(e.target.value)}
                        placeholder="e.g., HIIT, Strength, Swimming"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Target Duration (mins)</label>
                      <input
                        type="number"
                        value={workDuration}
                        onChange={(e) => setWorkDuration(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g., 45"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Intensity Level</label>
                      <select
                        value={workIntensity}
                        onChange={(e) => setWorkIntensity(e.target.value as any)}
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                      >
                        <option value="low">🟢 Light / Recovery</option>
                        <option value="medium">🟡 Moderate Effort</option>
                        <option value="high">🔴 High / Heavy Lift</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Recovery Score (%)</label>
                      <input
                        type="number"
                        value={workRecovery}
                        onChange={(e) => setWorkRecovery(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g., 78"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1 col-span-2">
                      <label className="text-[9px] text-slate-400 font-mono">Core Training Goal</label>
                      <input
                        type="text"
                        value={workGoal}
                        onChange={(e) => setWorkGoal(e.target.value)}
                        placeholder="e.g., Cardio endurance & Core strengthening"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Meeting Category */}
              {newCategory === 'Meeting' && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Agenda Summary</label>
                      <input
                        type="text"
                        value={meetAgenda}
                        onChange={(e) => setMeetAgenda(e.target.value)}
                        placeholder="e.g., Q3 Planning Session"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Location / Link</label>
                      <input
                        type="text"
                        value={meetLocation}
                        onChange={(e) => setMeetLocation(e.target.value)}
                        placeholder="e.g., Google Meet / Room 3B"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Participants</label>
                      <input
                        type="text"
                        value={meetParticipants}
                        onChange={(e) => setMeetParticipants(e.target.value)}
                        placeholder="e.g., Sarah, Dave, David"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Prep Required (hours)</label>
                      <input
                        type="number"
                        value={meetPrepTime}
                        onChange={(e) => setMeetPrepTime(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g., 1.5"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Attached Documents</label>
                      <input
                        type="text"
                        value={meetDocuments}
                        onChange={(e) => setMeetDocuments(e.target.value)}
                        placeholder="e.g., slide_deck_v1.pdf"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Travel / Transit Time (mins)</label>
                      <input
                        type="number"
                        value={meetTravelTime}
                        onChange={(e) => setMeetTravelTime(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g., 20"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Travel Category */}
              {newCategory === 'Travel' && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Destination</label>
                      <input
                        type="text"
                        value={travelDest}
                        onChange={(e) => setTravelDest(e.target.value)}
                        placeholder="e.g., Paris, France"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Departure Date</label>
                      <input
                        type="date"
                        value={travelDeparture}
                        onChange={(e) => setTravelDeparture(e.target.value)}
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none [color-scheme:dark]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Tickets / Booking Ref</label>
                      <input
                        type="text"
                        value={travelTickets}
                        onChange={(e) => setTravelTickets(e.target.value)}
                        placeholder="e.g., Flight AirFrance AF-015"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Hotel / Stay Location</label>
                      <input
                        type="text"
                        value={travelHotel}
                        onChange={(e) => setTravelHotel(e.target.value)}
                        placeholder="e.g., Hilton Opera Paris"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Packing Essentials List</label>
                      <input
                        type="text"
                        value={travelPacking}
                        onChange={(e) => setTravelPacking(e.target.value)}
                        placeholder="e.g., Passports, Adaptor, Medication"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Travel Checklist</label>
                      <input
                        type="text"
                        value={travelChecklist}
                        onChange={(e) => setTravelChecklist(e.target.value)}
                        placeholder="e.g., Check-in online, exchange EUR"
                        className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Category */}
              {newCategory === 'Custom' && (
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-mono">Advanced Notes & Logic Parameters</label>
                  <textarea
                    rows={2}
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="Enter custom context or instructions for your digital twin..."
                    className="w-full bg-[#171F34] border border-white/5 rounded-md p-2.5 text-xs text-slate-200 focus:outline-none resize-none"
                  />
                </div>
              )}

              {/* Work / Household / Personal Goal / Habit Categories */}
              {(newCategory === 'Work' || newCategory === 'Household' || newCategory === 'Personal Goal' || newCategory === 'Habit') && (
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-mono">Category Context & Reference Note</label>
                    <input
                      type="text"
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder={`Provide specific background context for this ${newCategory} task...`}
                      className="w-full bg-[#171F34] border border-white/5 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </motion.div>

            <div className="grid grid-cols-1 gap-4">
              {/* Hours needed (Hidden for Bill Payment category) */}
              {newCategory !== 'Bill Payment' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Total Est. Hours</label>
                  <div className="flex items-center bg-[#0B1020] border border-white/5 rounded-lg px-3 py-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newHoursNeeded}
                      onChange={(e) => setNewHoursNeeded(Number(e.target.value))}
                      className="w-full bg-transparent border-0 outline-none focus:ring-0 text-xs text-slate-100"
                    />
                    <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  </div>
                </div>
              )}

              {/* Exact Deadline Date/Time */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                  {newCategory === 'Bill Payment' ? 'Payment Due Date & Time' : 'Deadline Date & Time'}
                </label>
                <div className="flex items-center bg-[#0B1020] border border-white/5 rounded-lg px-3 py-2">
                  <input
                    type="datetime-local"
                    required
                    value={newDeadlineDate}
                    onChange={(e) => setNewDeadlineDate(e.target.value)}
                    className="w-full bg-transparent border-0 outline-none focus:ring-0 text-xs text-slate-100 [color-scheme:dark] cursor-pointer"
                  />
                  <CalendarDays className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
                </div>
              </div>
            </div>

            {newCategory !== 'Bill Payment' && adviceEstimate !== null && (
              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-[11px] text-blue-300 font-sans flex flex-col gap-2 mt-1">
                <div className="flex items-start gap-1.5">
                  <span className="text-xs shrink-0">🧠</span>
                  <span>
                    <strong>Twin Recommendation</strong>: Based on your historical pattern, your average <strong>{newCategory}</strong> tasks take <strong>{adviceEstimate} hours</strong>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setNewHoursNeeded(adviceEstimate)}
                  className="w-full text-center py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-200 hover:text-white transition-all text-[9px] font-semibold uppercase cursor-pointer"
                >
                  Apply {adviceEstimate}h Estimate
                </button>
              </div>
            )}

            {isWorkspaceConnected && !editingTaskId && (
              <div className="flex items-center gap-2 p-2 bg-purple-500/5 rounded-lg border border-purple-500/10 mb-2">
                <input
                  type="checkbox"
                  id="addToGoogleTasks"
                  checked={addToGoogleTasks}
                  onChange={(e) => setAddToGoogleTasks(e.target.checked)}
                  className="rounded border-white/10 bg-[#0B1020] text-purple-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="addToGoogleTasks" className="text-[9px] text-purple-300 font-semibold cursor-pointer select-none uppercase tracking-wider font-mono">
                  Add to Google Tasks
                </label>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {editingTaskId ? (
                <>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs py-2.5 rounded-lg transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 rounded-lg transition-all shadow-lg shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Task Entry
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Manage Table (7 Columns) */}
        <div className="lg:col-span-7 bg-[#171F34] border border-white/5 p-6 rounded-2xl flex flex-col h-full">
          {/* Controls / Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white font-sans flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-500" />
              Active Database
            </h2>

            {/* Filter controls */}
            <div className="flex gap-2.5">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-[#0B1020] border border-white/5 rounded-lg px-2.5 py-1 text-[10px] text-slate-300 font-sans cursor-pointer focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c === 'All' ? '📂 All Categories' : c}</option>
                ))}
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-[#0B1020] border border-white/5 rounded-lg px-2.5 py-1 text-[10px] text-slate-300 font-sans cursor-pointer focus:outline-none"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>{p === 'All' ? '🔥 All Priorities' : p.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          {/* List display */}
          <div className="flex-1 overflow-y-auto max-h-[360px] space-y-2.5 mt-4 pr-1">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-10">
                <FolderMinus className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-500 font-sans mt-2">No matching entries found.</p>
              </div>
            ) : (
              filteredTasks.map((taskItem) => {
                const task = taskItem as any;
                return (
                  <div
                    key={task.id}
                  className="bg-[#0B1020]/30 border border-white/5 hover:border-white/10 rounded-xl p-3.5 flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleCompleted(task.id)}
                      className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        task.status === 'completed'
                          ? 'bg-emerald-500/25 border-emerald-500 text-emerald-400'
                          : 'border-slate-700 hover:border-slate-500 text-transparent hover:text-slate-500'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    {/* Meta info */}
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${
                        task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-200'
                      }`}>
                        {task.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-sans">
                          {task.category}
                        </span>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                          task.priority === 'high'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/10'
                            : task.priority === 'medium'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                        }`}>
                          {task.priority.toUpperCase()}
                        </span>
                        {(task as any).isGoogle && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase font-extrabold">
                            Google Task
                          </span>
                        )}
                        {task.status !== 'completed' && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-rose-300 border border-rose-500/10 flex items-center gap-1">
                            <CalendarDays className="w-2.5 h-2.5 text-rose-400" />
                            {formatDeadline(task)}
                          </span>
                        )}
                      </div>

                      {/* Adaptive Twin Meta-Panel inside Task Card */}
                      {(task.subject || task.course || task.amount !== undefined || task.store || task.workoutType || task.agenda || task.destination || task.customNotes) && (
                        <div className="mt-2.5 p-2 bg-slate-900/50 border border-white/5 rounded-lg text-[11px] space-y-1.5">
                          {/* Study/Exam Meta */}
                          {(task.category === 'Study' || task.category === 'Exam Prep') && (
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
                              {task.subject && <div><span className="text-slate-500">Subject:</span> {task.subject}</div>}
                              {task.examDate && <div><span className="text-slate-500">Exam:</span> {task.examDate}</div>}
                              {task.topics && <div className="col-span-2"><span className="text-slate-500">Topics:</span> {task.topics}</div>}
                              {task.difficulty && <div><span className="text-slate-500">Diff:</span> {task.difficulty === 'easy' ? '🟢 Easy' : task.difficulty === 'medium' ? '🟡 Medium' : '🔴 Hard'}</div>}
                              {task.confidenceLevel && <div><span className="text-slate-500">Confidence:</span> {task.confidenceLevel === 'high' ? '🟢 High' : task.confidenceLevel === 'medium' ? '🟡 Med' : '🔴 Low'}</div>}
                              {task.studyMaterial && <div className="col-span-2"><span className="text-slate-500">Materials:</span> {task.studyMaterial}</div>}
                              {task.revisionRequired && <div className="col-span-2 text-emerald-400 font-semibold">🔄 Pre-exam revisions scheduled</div>}
                            </div>
                          )}

                          {/* Assignment Meta */}
                          {task.category === 'Assignment' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
                              {task.course && <div><span className="text-slate-500">Course:</span> {task.course}</div>}
                              {task.submissionLink && (
                                <div className="truncate">
                                  <span className="text-slate-500">Portal:</span>{' '}
                                  <a href={task.submissionLink} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                                    Link ↗
                                  </a>
                                </div>
                              )}
                              {task.referenceMaterial && <div className="col-span-2"><span className="text-slate-500">References:</span> {task.referenceMaterial}</div>}
                              {task.dependencies && <div className="col-span-2 text-amber-400"><span className="text-slate-500">Blockers:</span> {task.dependencies}</div>}
                            </div>
                          )}

                          {/* Bill Payment Meta */}
                          {task.category === 'Bill Payment' && (
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
                              {task.amount !== undefined && <div><span className="text-slate-500">Amount:</span> <strong className="text-emerald-400">${task.amount}</strong></div>}
                              {task.lateFee !== undefined && <div><span className="text-slate-500">Late Fee:</span> <span className="text-red-400">${task.lateFee}</span></div>}
                              {task.paymentMethod && <div className="col-span-2"><span className="text-slate-500">Method:</span> {task.paymentMethod}</div>}
                              {task.autoPay && <div className="col-span-2 text-amber-400 font-medium">⚡ Autopay setup in banking portal</div>}
                            </div>
                          )}

                          {/* Shopping Meta */}
                          {task.category === 'Shopping' && (
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
                              {task.store && <div><span className="text-slate-500">Store:</span> {task.store}</div>}
                              {task.budget !== undefined && <div><span className="text-slate-500">Budget:</span> <strong className="text-emerald-400">${task.budget}</strong></div>}
                              {task.items && <div className="col-span-2"><span className="text-slate-500">List:</span> <span className="text-slate-300">{task.items}</span></div>}
                            </div>
                          )}

                          {/* Health & Fitness Meta */}
                          {task.category === 'Health & Fitness' && (
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
                              {task.workoutType && <div><span className="text-slate-500">Workout:</span> {task.workoutType}</div>}
                              {task.duration && <div><span className="text-slate-500">Duration:</span> {task.duration}m</div>}
                              {task.intensity && <div><span className="text-slate-500">Intensity:</span> {task.intensity === 'high' ? '🔴 High' : task.intensity === 'medium' ? '🟡 Moderate' : '🟢 Recovery'}</div>}
                              {task.recovery && <div><span className="text-slate-500">Body Recovery:</span> <strong className="text-blue-400">{task.recovery}%</strong></div>}
                              {task.goal && <div className="col-span-2"><span className="text-slate-500">Objective:</span> {task.goal}</div>}
                            </div>
                          )}

                          {/* Meeting Meta */}
                          {task.category === 'Meeting' && (
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
                              {task.agenda && <div className="col-span-2"><span className="text-slate-500">Agenda:</span> {task.agenda}</div>}
                              {task.location && <div><span className="text-slate-500">Where:</span> {task.location}</div>}
                              {task.participants && <div><span className="text-slate-500">With:</span> {task.participants}</div>}
                              {task.preparationTime && <div><span className="text-slate-500">Prep Required:</span> {task.preparationTime}h</div>}
                              {task.travelTime && <div><span className="text-slate-500">Transit:</span> {task.travelTime}m</div>}
                              {task.documents && <div className="col-span-2"><span className="text-slate-500">Attachments:</span> 📄 {task.documents}</div>}
                            </div>
                          )}

                          {/* Travel Meta */}
                          {task.category === 'Travel' && (
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
                              {task.destination && <div><span className="text-slate-500">Dest:</span> {task.destination}</div>}
                              {task.departure && <div><span className="text-slate-500">Depart:</span> {task.departure}</div>}
                              {task.hotel && <div className="col-span-2"><span className="text-slate-500">Stay:</span> {task.hotel}</div>}
                              {task.tickets && <div className="col-span-2"><span className="text-slate-500">Tickets/Ref:</span> {task.tickets}</div>}
                              {task.packing && <div className="col-span-2"><span className="text-slate-500">Pack:</span> {task.packing}</div>}
                              {task.checklist && <div className="col-span-2 text-blue-300 font-medium">📋 {task.checklist}</div>}
                            </div>
                          )}

                          {/* Other custom context notes */}
                          {task.customNotes && (
                            <div className="text-slate-300 text-[11px]">
                              <span className="text-slate-500">Digital Twin Note:</span> {task.customNotes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      {task.category === 'Bill Payment' ? (
                        <>
                          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                            {task.paymentType === 'recurring' ? 'Recurring' : 'One-time'}
                          </p>
                          {task.paymentType === 'recurring' && (
                            <span className="text-[10px] text-slate-500 font-mono block mt-1">
                              Cycle: {task.cycleTime || 'Monthly'}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-mono font-semibold text-slate-300">
                            {formatTaskTime(task.hoursCompleted)} / {task.hoursNeeded}h
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono block mt-1">Goal: {task.hoursNeeded}h</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-900/40 p-1 rounded-xl border border-white/5">
                      {/* Edit Button */}
                      <button
                        id={`edit-task-btn-${task.id}`}
                        onClick={() => handleEditClick(task)}
                        title="Edit Task Parameters"
                        className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                          editingTaskId === task.id
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                            : 'bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white border border-transparent hover:border-slate-600'
                        }`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Play/Pause Button */}
                      {task.status !== 'completed' && task.category !== 'Bill Payment' && (
                        <button
                          id={`toggle-track-${task.id}`}
                          onClick={() => handleToggleTracking(task.id)}
                          title={task.isTracking ? "Pause Tracking" : "Start Tracking"}
                          className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                            task.isTracking
                              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 animate-pulse shadow-md shadow-emerald-500/10'
                              : 'bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 text-blue-400 hover:text-white'
                          }`}
                        >
                          {task.isTracking ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        </button>
                      )}

                      {/* Completed Button */}
                      <button
                        id={`toggle-complete-${task.id}`}
                        onClick={() => handleToggleCompleted(task.id)}
                        title={task.status === 'completed' ? "Mark as Active" : "Mark as Completed"}
                        className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                          task.status === 'completed'
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                            : 'bg-slate-800/60 hover:bg-emerald-500/10 border border-slate-700/60 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      id={`delete-task-${task.id}`}
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
