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
  Layers,
  MapPin,
  Users,
  Wallet,
  Bell,
  Sparkles,
  ArrowRight,
  Hourglass,
  Link2
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
  risk?: any;
}

export default function TasksView({ 
  tasks, 
  setTasks, 
  refreshRisk,
  isWorkspaceConnected,
  workspaceTasks,
  isWorkspaceLoading,
  syncWorkspaceData,
  risk
}: TasksViewProps) {
  // Form States
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TaskCategory>('Assignment');
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [newHoursNeeded, setNewHoursNeeded] = useState(8);
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [addToGoogleTasks, setAddToGoogleTasks] = useState(false);

  // Interactive Simulation States
  const [payingTaskId, setPayingTaskId] = useState<string | null>(null);
  const [preparingTaskId, setPreparingTaskId] = useState<string | null>(null);
  const [remindedTaskIds, setRemindedTaskIds] = useState<string[]>([]);
  const [selectedShoppingListTaskId, setSelectedShoppingListTaskId] = useState<string | null>(null);
  const [showingTipTaskId, setShowingTipTaskId] = useState<string | null>(null);
  const [activeAppliedAdjustments, setActiveAppliedAdjustments] = useState<string[]>([]);

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

  // Interactive Simulation Handlers
  const handleSimulatePayment = (taskId: string) => {
    setPayingTaskId(taskId);
    setTimeout(() => {
      setPayingTaskId(null);
      handleToggleCompleted(taskId);
    }, 1200);
  };

  const handleSimulatePrepare = (taskId: string) => {
    setPreparingTaskId(taskId);
    setTimeout(() => {
      setPreparingTaskId(null);
      setShowingTipTaskId(taskId);
      setTimeout(() => setShowingTipTaskId(null), 4000);
    }, 1000);
  };

  const handleToggleReminder = (taskId: string) => {
    setRemindedTaskIds(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

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
          <div className="flex-1 overflow-y-auto max-h-[700px] space-y-3 mt-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-14 bg-[#0B1020]/20 border border-dashed border-white/5 rounded-2xl">
                <FolderMinus className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-500 font-sans mt-2">No active tasks found matching this criteria.</p>
              </div>
            ) : (
              filteredTasks.map((taskItem) => {
                const task = taskItem as any;
                
                // Helper to format time relative to deadline date
                const relativeTime = (() => {
                  let targetDate: Date;
                  if (task.deadlineDate) {
                    targetDate = new Date(task.deadlineDate);
                  } else if (task.deadlineHours > 0) {
                    targetDate = new Date();
                    targetDate.setMinutes(targetDate.getMinutes() + Math.round(task.deadlineHours * 60));
                  } else {
                    return 'N/A';
                  }
                  const now = new Date();
                  const diffMs = targetDate.getTime() - now.getTime();
                  if (diffMs <= 0) return 'Overdue';
                  
                  const diffMins = Math.floor(diffMs / 60000);
                  const hrs = Math.floor(diffMins / 60);
                  const mins = diffMins % 60;
                  
                  if (hrs >= 24) {
                    const days = Math.floor(hrs / 24);
                    const remHrs = hrs % 24;
                    return `${days}d ${remHrs}h`;
                  }
                  return `${hrs}h ${mins}m`;
                })();

                // Helper to render category icon
                const getCategoryIcon = (cat: string) => {
                  switch(cat) {
                    case 'Meeting':
                      return (
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-lg shadow-blue-950/20">
                          <Users className="w-5 h-5" />
                        </div>
                      );
                    case 'Bill Payment':
                      return (
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-lg shadow-amber-950/20">
                          <Wallet className="w-5 h-5" />
                        </div>
                      );
                    case 'Study':
                    case 'Exam Prep':
                      return (
                        <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center shrink-0 shadow-lg shadow-violet-950/20">
                          <BookOpen className="w-5 h-5" />
                        </div>
                      );
                    case 'Assignment':
                      return (
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/20">
                          <FileText className="w-5 h-5" />
                        </div>
                      );
                    case 'Health & Fitness':
                      return (
                        <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0 shadow-lg shadow-rose-950/20">
                          <Dumbbell className="w-5 h-5" />
                        </div>
                      );
                    case 'Shopping':
                      return (
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center justify-center shrink-0 shadow-lg shadow-yellow-950/20">
                          <ShoppingCart className="w-5 h-5" />
                        </div>
                      );
                    case 'Travel':
                      return (
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-950/20">
                          <Plane className="w-5 h-5" />
                        </div>
                      );
                    case 'Work':
                      return (
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-950/20">
                          <Briefcase className="w-5 h-5" />
                        </div>
                      );
                    case 'Household':
                      return (
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0 shadow-lg shadow-orange-950/20">
                          <Home className="w-5 h-5" />
                        </div>
                      );
                    case 'Personal Goal':
                      return (
                        <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 flex items-center justify-center shrink-0 shadow-lg shadow-fuchsia-950/20">
                          <Target className="w-5 h-5" />
                        </div>
                      );
                    case 'Habit':
                      return (
                        <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0 shadow-lg shadow-teal-950/20">
                          <Activity className="w-5 h-5" />
                        </div>
                      );
                    default:
                      return (
                        <div className="w-12 h-12 rounded-xl bg-slate-500/10 text-slate-400 border border-slate-500/20 flex items-center justify-center shrink-0">
                          <Coffee className="w-5 h-5" />
                        </div>
                      );
                  }
                };

                // Helper to render category label badge
                const getCategoryBadge = (cat: string) => {
                  switch (cat) {
                    case 'Meeting':
                      return <span className="text-[9px] font-sans font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 uppercase border border-blue-500/10">Meeting</span>;
                    case 'Bill Payment':
                      return <span className="text-[9px] font-sans font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 uppercase border border-amber-500/10">Bill Payment</span>;
                    case 'Study':
                    case 'Exam Prep':
                      return <span className="text-[9px] font-sans font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 uppercase border border-violet-500/10">Study</span>;
                    case 'Assignment':
                      return <span className="text-[9px] font-sans font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 uppercase border border-emerald-500/10">Assignment</span>;
                    case 'Health & Fitness':
                      return <span className="text-[9px] font-sans font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 uppercase border border-rose-500/10">Health</span>;
                    case 'Shopping':
                      return <span className="text-[9px] font-sans font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 uppercase border border-yellow-500/10">Shopping</span>;
                    case 'Travel':
                      return <span className="text-[9px] font-sans font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 uppercase border border-cyan-500/10">Travel</span>;
                    case 'Work':
                      return <span className="text-[9px] font-sans font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 uppercase border border-indigo-500/10">Work</span>;
                    default:
                      return <span className="text-[9px] font-sans font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 uppercase border border-slate-700/50">{cat}</span>;
                  }
                };

                const taskRisk = risk?.tasksWithRisk?.find((r: any) => r.id === task.id);
                const riskLevel = taskRisk?.riskLevel || (task.priority === 'high' ? 'high' : task.priority === 'medium' ? 'medium' : 'low');
                const riskExplanation = taskRisk?.explanation || '';

                const getRiskBadge = (level: string) => {
                  if (level === 'high') {
                    return <span className="text-[9px] font-mono font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/20 uppercase">High Risk</span>;
                  }
                  if (level === 'medium') {
                    return <span className="text-[9px] font-mono font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 uppercase">Medium Risk</span>;
                  }
                  return <span className="text-[9px] font-mono font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 uppercase">Low Risk</span>;
                };

                const getAdvisoryText = () => {
                  if (riskExplanation) {
                    return riskExplanation;
                  }
                  switch (task.category) {
                    case 'Bill Payment':
                      return task.lateFee 
                        ? `Pay before the due date to avoid late fees of $${task.lateFee}/day.` 
                        : "Enable auto pay to never miss a due date and protect your credit score.";
                    case 'Meeting':
                      return "With upcoming preparations and buffer remaining, schedule is stable. Pre-read agenda items to be aligned.";
                    case 'Study':
                    case 'Exam Prep':
                      return `Difficulty is ${task.difficulty || 'medium'}. Spend ${task.hoursNeeded}h on revision materials: ${task.studyMaterial || 'assigned textbooks'}.`;
                    case 'Assignment':
                      return `Verify links & guidelines. Dependency: ${task.dependencies || 'None'}. Review references: ${task.referenceMaterial || 'Lecture notes'}.`;
                    case 'Health & Fitness':
                      return task.recovery && task.recovery < 50
                        ? `Your body recovery is ${task.recovery}%. Tone down workout load/intensity to avoid injuries.`
                        : `Body recovery is ${task.recovery || '85'}%. Ideal window for this high-performance training block.`;
                    case 'Shopping':
                      return `Check list parameters. Budget ceiling is $${task.budget || '150'}. Avoid peak hour shopping lines.`;
                    case 'Travel':
                      return `Tickets and hotel: ${task.hotel || 'Booking Confirmed'}. Review custom checklists: ${task.checklist || 'All sets ready'}.`;
                    default:
                      return task.customNotes || "Maintain high focus blocks to achieve project milestones successfully.";
                  }
                };

                const renderMetaGrid = () => {
                  switch (task.category) {
                    case 'Meeting':
                      return (
                        <div className="w-full bg-[#0B1020]/45 border border-white/5 rounded-xl p-3 text-[11px] text-slate-300 space-y-1.5 font-sans">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Starts in</span>
                            <span className="text-slate-200 font-semibold font-mono">{relativeTime}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5"><Hourglass className="w-3.5 h-3.5" /> Duration</span>
                            <span className="text-slate-200 font-mono">{task.preparationTime ? `${task.preparationTime}h` : '1h'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Priority</span>
                            <span className="text-blue-400 font-bold">{task.priority.toUpperCase()}</span>
                          </div>
                        </div>
                      );
                    case 'Bill Payment':
                      return (
                        <div className="w-full bg-[#0B1020]/45 border border-white/5 rounded-xl p-3 text-[11px] text-slate-300 space-y-1.5 font-sans">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> Amount</span>
                            <span className="text-emerald-400 font-extrabold font-mono">${task.amount || '0.00'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Due in</span>
                            <span className="text-slate-200 font-mono">{relativeTime}</span>
                          </div>
                          {task.lateFee !== undefined && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Late Fee</span>
                              <span className="text-red-400 font-mono">${task.lateFee}/day</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" /> Recurring</span>
                            <span className="text-amber-400 font-semibold">{task.recurring ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      );
                    case 'Study':
                    case 'Exam Prep':
                      return (
                        <div className="w-full bg-[#0B1020]/45 border border-white/5 rounded-xl p-3 text-[11px] text-slate-300 space-y-1.5 font-sans">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Subject</span>
                            <span className="text-slate-200 truncate max-w-[90px]">{task.subject || 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Diff</span>
                            <span className={`font-bold capitalize ${task.difficulty === 'hard' ? 'text-rose-400' : task.difficulty === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>{task.difficulty || 'medium'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Confidence</span>
                            <span className="text-slate-200 capitalize font-mono">{task.confidenceLevel || 'medium'}</span>
                          </div>
                        </div>
                      );
                    case 'Assignment':
                      return (
                        <div className="w-full bg-[#0B1020]/45 border border-white/5 rounded-xl p-3 text-[11px] text-slate-300 space-y-1.5 font-sans">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Course</span>
                            <span className="text-slate-200 truncate max-w-[90px]">{task.course || 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" /> Portal</span>
                            <span className="text-blue-400 truncate max-w-[90px] font-semibold">{task.submissionLink ? 'Canvas' : 'Standard'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Blockers</span>
                            <span className="text-slate-200 truncate max-w-[90px]">{task.dependencies || 'None'}</span>
                          </div>
                        </div>
                      );
                    case 'Health & Fitness':
                      return (
                        <div className="w-full bg-[#0B1020]/45 border border-white/5 rounded-xl p-3 text-[11px] text-slate-300 space-y-1.5 font-sans">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5"><Dumbbell className="w-3.5 h-3.5" /> Workout</span>
                            <span className="text-slate-200 truncate max-w-[90px]">{task.workoutType || 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Duration</span>
                            <span className="text-slate-200 font-mono">{task.duration || '45'}m</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Recovery</span>
                            <span className="text-blue-400 font-extrabold font-mono">{task.recovery || '80'}%</span>
                          </div>
                        </div>
                      );
                    case 'Shopping':
                      return (
                        <div className="w-full bg-[#0B1020]/45 border border-white/5 rounded-xl p-3 text-[11px] text-slate-300 space-y-1.5 font-sans">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5"><ShoppingCart className="w-3.5 h-3.5" /> Store</span>
                            <span className="text-slate-200 truncate max-w-[90px]">{task.store || 'Grocery'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> Budget</span>
                            <span className="text-emerald-400 font-bold font-mono">${task.budget || '100'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Items</span>
                            <span className="text-slate-200 font-mono">{task.items ? task.items.split(',').length : 0} items</span>
                          </div>
                        </div>
                      );
                    case 'Travel':
                      return (
                        <div className="w-full bg-[#0B1020]/45 border border-white/5 rounded-xl p-3 text-[11px] text-slate-300 space-y-1.5 font-sans">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5"><Plane className="w-3.5 h-3.5" /> Dest</span>
                            <span className="text-slate-200 truncate max-w-[90px]">{task.destination || 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5"><Home className="w-3.5 h-3.5" /> Hotel</span>
                            <span className="text-slate-200 truncate max-w-[90px]">{task.hotel || 'N/A'}</span>
                          </div>
                        </div>
                      );
                    default:
                      return (
                        <div className="w-full bg-[#0B1020]/45 border border-white/5 rounded-xl p-3 text-[11px] text-slate-300 space-y-1.5 font-sans">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Hours</span>
                            <span className="text-slate-200 font-semibold font-mono">{formatTaskTime(task.hoursCompleted)} / {task.hoursNeeded}h</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5"><Hourglass className="w-3.5 h-3.5" /> Target</span>
                            <span className="text-slate-200 font-mono">{task.hoursNeeded}h</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-blue-400" /> Priority</span>
                            <span className="text-blue-400 font-bold font-mono">{task.priority.toUpperCase()}</span>
                          </div>
                        </div>
                      );
                  }
                };

                const renderActionsPanel = () => {
                  const isCompleted = task.status === 'completed';
                  const isPaying = payingTaskId === task.id;
                  const isPreparing = preparingTaskId === task.id;
                  const isReminded = remindedTaskIds.includes(task.id);
                  const isShowingTip = showingTipTaskId === task.id;

                  if (isCompleted) {
                    return (
                      <div className="flex items-center gap-2 justify-end w-full">
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                          <Check className="w-3.5 h-3.5" /> Done
                        </span>
                        <div className="flex items-center gap-1 bg-slate-900/40 p-1 rounded-xl border border-white/5">
                          <button
                            onClick={() => handleEditClick(task)}
                            className="w-8 h-8 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleCompleted(task.id)}
                            className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                            title="Restore Task"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  }

                  switch (task.category) {
                    case 'Bill Payment':
                      return (
                        <div className="flex flex-col gap-2 w-full">
                          {isPaying ? (
                            <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-semibold py-2 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></div>
                              Processing Payment...
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSimulatePayment(task.id)}
                              className="w-full bg-[#D96504] hover:bg-[#F2780C] text-white text-[11px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-900/10 active:scale-[0.98]"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Pay Now
                            </button>
                          )}
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={() => handleToggleCompleted(task.id)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold py-1.5 rounded-lg border border-white/5 transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                            >
                              <Check className="w-3 h-3" /> Mark Paid
                            </button>
                            <button
                              onClick={() => handleToggleReminder(task.id)}
                              className={`text-[10px] font-semibold py-1.5 rounded-lg border transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer ${
                                isReminded 
                                  ? 'bg-blue-500/20 border-blue-500/30 text-blue-400 font-bold' 
                                  : 'bg-slate-800 hover:bg-slate-700 border-white/5 text-slate-300'
                              }`}
                            >
                              <Bell className="w-3 h-3" /> {isReminded ? 'Reminded' : 'Remind Me'}
                            </button>
                          </div>
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleEditClick(task)}
                              className="flex-1 py-1.5 bg-slate-800/60 hover:bg-slate-700 border border-white/5 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer flex items-center justify-center text-[10px] font-medium"
                            >
                              <Edit2 className="w-3 h-3 mr-1" /> Edit parameters
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );

                    case 'Meeting':
                      return (
                        <div className="flex flex-col gap-2 w-full">
                          <button
                            onClick={() => handleSimulatePrepare(task.id)}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-950/10"
                          >
                            <Users className="w-3.5 h-3.5" /> {isPreparing ? 'Preparing Documents...' : 'Prepare'}
                          </button>
                          {isShowingTip && (
                            <div className="text-[10px] p-2.5 bg-blue-900/40 border border-blue-500/20 rounded-lg text-blue-200 font-sans leading-normal animate-pulse">
                              <strong>Twin recommendation applied:</strong> Meeting slide-decks aggregated. Buffer scheduled securely.
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={() => handleEditClick(task)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold py-1.5 rounded-lg border border-white/5 transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleToggleCompleted(task.id)}
                              className="bg-slate-800 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-400 text-[10px] font-semibold py-1.5 rounded-lg border border-white/5 transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                            >
                              Complete
                            </button>
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );

                    case 'Shopping':
                      return (
                        <div className="flex flex-col gap-2 w-full">
                          <button
                            onClick={() => setSelectedShoppingListTaskId(selectedShoppingListTaskId === task.id ? null : task.id)}
                            className="w-full bg-yellow-600 hover:bg-yellow-500 text-white text-[11px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" /> {selectedShoppingListTaskId === task.id ? 'Hide Items' : 'View List'}
                          </button>
                          {selectedShoppingListTaskId === task.id && task.items && (
                            <div className="p-2.5 bg-yellow-950/20 border border-yellow-500/20 rounded-lg space-y-1.5 text-[10px]">
                              {task.items.split(',').map((item: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-slate-300">
                                  <input type="checkbox" className="rounded text-yellow-500 w-3 h-3 border-white/10" defaultChecked={i % 3 === 0} />
                                  <span className="font-mono">{item.trim()}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={() => handleToggleCompleted(task.id)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold py-1.5 rounded-lg border border-white/5 transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> Mark Bought
                            </button>
                            <button
                              onClick={() => handleEditClick(task)}
                              className="bg-slate-800/60 hover:bg-slate-700 border border-white/5 text-slate-400 hover:text-white rounded-lg text-[10px] font-semibold py-1.5 transition-all cursor-pointer flex items-center justify-center"
                            >
                              Edit
                            </button>
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );

                    case 'Health & Fitness':
                      return (
                        <div className="flex flex-col gap-2 w-full">
                          <button
                            onClick={() => handleToggleCompleted(task.id)}
                            className="w-full bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <Dumbbell className="w-3.5 h-3.5" /> Start Workout
                          </button>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={() => handleEditClick(task)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold py-1.5 rounded-lg border border-white/5 transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer text-center"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="bg-slate-800/60 hover:bg-red-500/25 border border-white/5 text-slate-400 hover:text-red-400 rounded-lg text-[10px] font-semibold py-1.5 transition-all cursor-pointer flex items-center justify-center"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      );

                    case 'Travel':
                      return (
                        <div className="flex flex-col gap-2 w-full">
                          <button
                            onClick={() => {
                              alert(`Travel Reference Log\n---------------------\nTickets: ${task.tickets || 'E-TICKET#241951'}\nHotel Stay: ${task.hotel || 'Grand Hyatt Central Midtown'}\nChecklist: ${task.checklist || 'All sets ready'}`);
                            }}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <Plane className="w-3.5 h-3.5" /> View Tickets
                          </button>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={() => handleToggleCompleted(task.id)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold py-1.5 rounded-lg border border-white/5 transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                            >
                              Check-in Done
                            </button>
                            <button
                              onClick={() => handleEditClick(task)}
                              className="bg-slate-800/60 hover:bg-slate-700 border border-white/5 text-slate-400 hover:text-white rounded-lg text-[10px] font-semibold py-1.5 transition-all cursor-pointer flex items-center justify-center"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      );

                    default:
                      // Study, Assignment, Work, Custom, Habit (these benefit from active timers and hours estimation)
                      return (
                        <div className="flex flex-col gap-2 w-full">
                          <div className="flex items-center gap-1.5 w-full bg-[#0B1020]/20 p-1 rounded-xl border border-white/5 justify-between">
                            <span className="text-[10px] text-slate-400 px-2 font-mono">
                              Tracked: <strong>{formatTaskTime(task.hoursCompleted)} / {task.hoursNeeded}h</strong>
                            </span>
                            <button
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
                          </div>
                          
                          <div className="w-full bg-slate-900/50 rounded-full h-1 overflow-hidden">
                            <div 
                              className="bg-blue-500 h-1 rounded-full transition-all duration-300" 
                              style={{ width: `${Math.min(100, (task.hoursCompleted / task.hoursNeeded) * 100)}%` }}
                            ></div>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                            <button
                              onClick={() => handleToggleCompleted(task.id)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold py-1.5 rounded-lg border border-white/5 transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                            >
                              <Check className="w-3 h-3" /> Done
                            </button>
                            <button
                              onClick={() => handleEditClick(task)}
                              className="bg-slate-800/60 hover:bg-slate-700 border border-white/5 text-slate-400 hover:text-white rounded-lg text-[10px] font-semibold py-1.5 transition-all cursor-pointer flex items-center justify-center"
                              title="Edit Parameters"
                            >
                              Edit
                            </button>
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                  }
                };

                return (
                  <div
                    key={task.id}
                    className={`bg-[#0B1020]/30 border border-white/5 hover:border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-start justify-between gap-5 transition-all group relative overflow-hidden ${
                      task.status === 'completed' ? 'opacity-70' : ''
                    }`}
                  >
                    {/* Left Details Block */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      {/* Custom Category Icon Block */}
                      {getCategoryIcon(task.category)}

                      {/* Info Content */}
                      <div className="min-w-0 flex-1">
                        {/* Badge Row */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {getCategoryBadge(task.category)}
                          {getRiskBadge(riskLevel)}
                          {task.isGoogle && (
                            <span className="text-[9px] font-mono font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase">
                              Google Task
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className={`text-base font-bold mt-1.5 font-sans leading-snug transition-colors ${
                          task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-100 group-hover:text-white'
                        }`}>
                          {task.title}
                        </h3>

                        {/* Details Grid */}
                        <div className="flex flex-col gap-1.5 mt-2 text-xs text-slate-400 font-sans">
                          {task.category === 'Meeting' && (
                            <>
                              <span className="flex items-center gap-1.5">
                                <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
                                {formatDeadline(task)}
                              </span>
                              {task.location && (
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                  {task.location}
                                </span>
                              )}
                            </>
                          )}
                          {task.category === 'Bill Payment' && (
                            <>
                              <span className="flex items-center gap-1.5">
                                <CalendarDays className="w-3.5 h-3.5 text-amber-500" />
                                Due: {formatDeadline(task)}
                              </span>
                              {task.paymentMethod && (
                                <span className="flex items-center gap-1.5">
                                  <Wallet className="w-3.5 h-3.5 text-slate-500" />
                                  {task.paymentMethod}
                                </span>
                              )}
                            </>
                          )}
                          {task.category !== 'Meeting' && task.category !== 'Bill Payment' && (
                            <span className="flex items-center gap-1.5">
                              <CalendarDays className="w-3.5 h-3.5 text-rose-400" />
                              Deadline: {formatDeadline(task)}
                            </span>
                          )}
                        </div>

                        {/* Digital Twin Advisory Panel */}
                        {task.status !== 'completed' && (
                          <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-xs text-amber-400 mt-3.5 leading-relaxed">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <p className="font-sans font-medium">{getAdvisoryText()}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Parameters and Action Block */}
                    <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-4 shrink-0 w-full md:w-[220px]">
                      {/* Parameter Grid Info Block */}
                      {renderMetaGrid()}

                      {/* Action buttons panel */}
                      {renderActionsPanel()}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Suggested Adjustments (Predictive AI Recommendations) Section */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-slate-100 font-sans">Suggested Adjustments</h3>
              </div>
              <span className="text-[9px] px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-extrabold uppercase tracking-wider flex items-center gap-1">
                Predictive Actions 🪄
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-sans">
              These recommendations will optimize your day and reduce stress.
            </p>

            <div className="mt-3.5 space-y-2">
              {tasks.filter(t => t.status !== 'completed').map((t, idx) => {
                const adjId = `adj-${t.id}`;
                const isApplied = activeAppliedAdjustments.includes(adjId);

                if (t.category === 'Bill Payment' && t.lateFee) {
                  return (
                    <div key={adjId} className="flex items-center justify-between gap-3 bg-[#0B1020]/25 border border-white/5 rounded-xl p-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold flex items-center justify-center shrink-0 font-mono">
                          {idx + 1}
                        </span>
                        <p className="text-slate-300 truncate font-sans">
                          Pay <strong className="text-amber-400">{t.title}</strong> today to avoid late fee of <strong className="text-red-400">${t.lateFee}</strong>.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (!isApplied) {
                            setActiveAppliedAdjustments(prev => [...prev, adjId]);
                            setTasks(prevTasks => prevTasks.map(pt => pt.id === t.id ? { ...pt, priority: 'high' } : pt));
                            setTimeout(refreshRisk, 100);
                          }
                        }}
                        className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                          isApplied 
                            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 cursor-default'
                            : 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer active:scale-95'
                        }`}
                      >
                        {isApplied ? 'Applied ✓' : 'Apply'}
                      </button>
                    </div>
                  );
                }

                if (t.category === 'Meeting') {
                  return (
                    <div key={adjId} className="flex items-center justify-between gap-3 bg-[#0B1020]/25 border border-white/5 rounded-xl p-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold flex items-center justify-center shrink-0 font-mono">
                          {idx + 1}
                        </span>
                        <p className="text-slate-300 truncate font-sans">
                          Pre-schedule 30m prep block for meeting: <strong className="text-blue-400">{t.title}</strong>.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (!isApplied) {
                            setActiveAppliedAdjustments(prev => [...prev, adjId]);
                            setTasks(prevTasks => prevTasks.map(pt => pt.id === t.id ? { ...pt, preparationTime: 0.5 } : pt));
                            setTimeout(refreshRisk, 100);
                          }
                        }}
                        className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                          isApplied 
                            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 cursor-default'
                            : 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer active:scale-95'
                        }`}
                      >
                        {isApplied ? 'Applied ✓' : 'Apply'}
                      </button>
                    </div>
                  );
                }

                if ((t.category === 'Study' || t.category === 'Exam Prep') && t.difficulty === 'hard') {
                  return (
                    <div key={adjId} className="flex items-center justify-between gap-3 bg-[#0B1020]/25 border border-white/5 rounded-xl p-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold flex items-center justify-center shrink-0 font-mono">
                          {idx + 1}
                        </span>
                        <p className="text-slate-300 truncate font-sans">
                          Set revision schedule for hard subject: <strong className="text-violet-400">{t.title}</strong>.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (!isApplied) {
                            setActiveAppliedAdjustments(prev => [...prev, adjId]);
                            setTasks(prevTasks => prevTasks.map(pt => pt.id === t.id ? { ...pt, revisionRequired: true } : pt));
                            setTimeout(refreshRisk, 100);
                          }
                        }}
                        className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                          isApplied 
                            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 cursor-default'
                            : 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer active:scale-95'
                        }`}
                      >
                        {isApplied ? 'Applied ✓' : 'Apply'}
                      </button>
                    </div>
                  );
                }

                return null;
              }).filter(Boolean).slice(0, 2)}

              {tasks.filter(t => t.status !== 'completed').length === 0 && (
                <div className="text-center py-5 bg-[#0B1020]/10 border border-dashed border-white/5 rounded-xl">
                  <p className="text-xs text-slate-500 font-sans">All tasks completed! Great job optimization state is maximized.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
