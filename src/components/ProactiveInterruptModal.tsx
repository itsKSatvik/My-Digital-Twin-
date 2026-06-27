import { motion } from 'motion/react';
import { Sparkles, ShieldAlert, ArrowRight, Clock, Dumbbell, BookOpen } from 'lucide-react';
import { Task, ScheduleEvent } from '../types';

interface ProactiveInterruptModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onNegotiate: () => void;
  tasks: Task[];
  scheduleEvents: ScheduleEvent[];
  theme: 'light' | 'dark';
}

export default function ProactiveInterruptModal({
  isOpen,
  onAccept,
  onNegotiate,
  tasks,
  scheduleEvents,
  theme,
}: ProactiveInterruptModalProps) {
  if (!isOpen) return null;

  const isLight = theme === 'light';

  // Find Gym commitment details
  const gymEvent = scheduleEvents.find(e => e.title.toLowerCase().includes('gym') || e.id === 'se_3');
  // Find Assignment task details
  const assignmentTask = tasks.find(t => t.title.toLowerCase().includes('assignment') || t.id === 'task_1');

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-slate-950/80 backdrop-blur-md">
      {/* Immersive Red Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.08)_0%,transparent_70%)] pointer-events-none" />
      
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: -20 }}
        transition={{ type: 'spring', damping: 20, stiffness: 160 }}
        className={`relative max-w-lg w-full rounded-3xl p-8 overflow-hidden transition-colors duration-300 ${
          isLight 
            ? 'bg-white border-2 border-rose-500/40 shadow-[0_15px_50px_rgba(244,63,94,0.15)] text-slate-800' 
            : 'bg-slate-950 border-2 border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.2)] text-white'
        }`}
        id="proactive-override-dialog"
      >
        {/* Hologram/Scanning Line Effect */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent animate-pulse" />
        
        {/* Glow behind Avatar */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* AI Twin Avatar / Interruption Icon */}
        <div className="relative flex justify-center mb-6">
          <div className="relative">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              isLight 
                ? 'bg-rose-50 border border-rose-200 shadow-rose-100' 
                : 'bg-rose-950/50 border border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
            }`}>
              <span className="text-3xl">🤖</span>
            </div>
            {/* Pulsing Signal Halo */}
            <div className="absolute inset-0 rounded-full border-2 border-rose-500 animate-ping opacity-20" />
            <div className="absolute -bottom-1 -right-1 bg-rose-600 text-white rounded-full p-1 border border-slate-950 shadow-md">
              <ShieldAlert className="w-4 h-4 animate-bounce force-text-white" />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-1 mb-8">
          <span className={`text-[10px] font-mono font-bold px-3.5 py-1.5 rounded-full border inline-block uppercase tracking-widest animate-pulse transition-all ${
            isLight 
              ? 'text-rose-700 bg-rose-50 border-rose-200' 
              : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
          }`}>
            🚨 Core Digital Twin Intervention
          </span>
        </div>

        {/* The Direct Bold Commands (Exactly as requested) */}
        <div className="space-y-4 mb-8">
          <motion.p 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-lg font-bold font-mono tracking-tight ${
              isLight ? 'text-slate-500' : 'text-slate-300'
            }`}
          >
            Good evening.
          </motion.p>

          <motion.p 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-2xl font-black font-sans tracking-tight leading-snug ${
              isLight ? 'text-slate-950' : 'text-white'
            }`}
          >
            You <span className="text-rose-500 underline decoration-rose-500/40 decoration-wavy underline-offset-4">won't finish</span> today's work.
          </motion.p>

          {/* Defer Gym Box */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-4 rounded-2xl flex items-start gap-3.5 border transition-all ${
              isLight 
                ? 'bg-rose-50/60 border-rose-200/80 shadow-sm' 
                : 'bg-rose-950/20 border-rose-500/20'
            }`}
          >
            <Dumbbell className={`w-5 h-5 shrink-0 mt-0.5 ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
            <div>
              <p className={`text-sm font-extrabold font-sans ${isLight ? 'text-rose-900' : 'text-rose-300'}`}>
                I already moved Gym to tomorrow.
              </p>
              <p className={`text-[11px] font-sans mt-0.5 leading-relaxed ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                Strength & Conditioning is deferred to Sunday. Your sleep threshold cannot support parallel 1.5h high-energy commitments and mental focus today.
              </p>
            </div>
          </motion.div>

          {/* Prioritize Assignment Box */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-4 rounded-2xl flex items-start gap-3.5 border transition-all ${
              isLight 
                ? 'bg-blue-50/60 border-blue-200/80 shadow-sm' 
                : 'bg-blue-950/20 border-blue-500/20'
            }`}
          >
            <BookOpen className={`w-5 h-5 shrink-0 mt-0.5 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
            <div>
              <p className={`text-sm font-extrabold font-sans ${isLight ? 'text-blue-900' : 'text-blue-300'}`}>
                Finish Assignment now.
              </p>
              <p className={`text-[11px] font-sans mt-0.5 leading-relaxed ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                Remaining time to deadline is <strong className={`font-mono font-bold ${isLight ? 'text-blue-950 text-xs' : 'text-white'}`}>5h 18m</strong>. You need exactly <strong className={`font-mono font-bold ${isLight ? 'text-blue-950 text-xs' : 'text-white'}`}>3.0 hours</strong> of focused, zero-distraction work to lock in a passing score.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Buttons / Actions */}
        <div className="space-y-3">
          <button
            onClick={onAccept}
            className="w-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-extrabold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_4px_25px_rgba(244,63,94,0.3)] hover:shadow-[0_4px_35px_rgba(244,63,94,0.45)] hover:scale-[1.01] active:scale-[0.99] group border border-white/10 force-text-white"
            id="accept-directive-btn"
          >
            <Sparkles className="w-4.5 h-4.5 text-rose-200 animate-spin force-text-white" />
            <span className="tracking-wide force-text-white">Accept Digital Twin Directive</span>
            <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform force-text-white" />
          </button>

          <button
            onClick={onNegotiate}
            className={`w-full py-3 px-6 rounded-xl font-bold text-xs transition-colors cursor-pointer border text-center uppercase tracking-widest ${
              isLight 
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-white/5 hover:border-white/10'
            }`}
            id="negotiate-directive-btn"
          >
            Dismiss & Keep Gym Today (Dangerous)
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[9px] text-slate-500 font-mono">
            SECURE SYNC: MULTI-SYSTEM INTERRUPT COOLDOWN ENGAGED
          </p>
        </div>
      </motion.div>
    </div>
  );
}

