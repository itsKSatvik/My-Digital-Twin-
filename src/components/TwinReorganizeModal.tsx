import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Check, X, AlertTriangle, ArrowRight, Calendar } from 'lucide-react';
import { ScheduleEvent } from '../types';

interface TwinReorganizeModalProps {
  isOpen: boolean;
  explanation: string;
  beforeEvents: ScheduleEvent[];
  afterEvents: ScheduleEvent[];
  onAccept: () => void;
  onDismiss: () => void;
}

export default function TwinReorganizeModal({
  isOpen,
  explanation,
  beforeEvents,
  afterEvents,
  onAccept,
  onDismiss
}: TwinReorganizeModalProps) {
  if (!isOpen) return null;

  // Find events that changed
  const changedBefore = beforeEvents.filter(be => {
    const ae = afterEvents.find(a => a.id === be.id);
    return !ae || ae.title !== be.title || ae.startTime !== be.startTime || ae.endTime !== be.endTime;
  });

  const changedAfter = afterEvents.filter(ae => {
    const be = beforeEvents.find(b => b.id === ae.id);
    return !be || be.title !== ae.title || be.startTime !== ae.startTime || be.endTime !== ae.endTime;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gradient-to-b from-[#1E2540] to-[#13192B] border border-blue-500/30 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Top Decorative Sparkle Background */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-center gap-3.5 border-b border-white/5 pb-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-lg shadow-blue-500/5">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-400 font-mono uppercase tracking-widest block">Proactive Digital Twin</span>
              <h3 className="text-lg font-bold text-white font-sans tracking-tight">Active Schedule Override</h3>
            </div>
            <button
              onClick={onDismiss}
              className="ml-auto w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Warning Indicator */}
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-start gap-3 mb-5">
            <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">Deadline Slippage Warning</p>
              <p className="text-xs text-slate-300 mt-1 font-sans leading-relaxed">
                Task remaining workloads physically exceed the remaining deadline buffer. Active scheduler intervention is recommended.
              </p>
            </div>
          </div>

          {/* Twin Explanation */}
          <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 mb-5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Twin Analytical Reasoning</h4>
            <p className="text-xs text-slate-200 leading-relaxed italic font-sans font-medium">
              "{explanation}"
            </p>
          </div>

          {/* Before & After Comparison */}
          <div className="space-y-3.5 mb-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Proposed Routine Modifications</h4>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Before Column */}
              <div className="bg-[#0B1020]/30 border border-white/5 rounded-2xl p-3.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Before</p>
                <div className="space-y-2">
                  {changedBefore.length > 0 ? (
                    changedBefore.map((e, idx) => (
                      <div key={idx} className="border border-white/5 bg-slate-900/40 rounded-xl p-2.5">
                        <p className="text-xs font-semibold text-slate-400 truncate">{e.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{e.startTime} - {e.endTime}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic py-2 font-sans">Standard Routine</p>
                  )}
                </div>
              </div>

              {/* After Column */}
              <div className="bg-blue-950/10 border border-blue-500/10 rounded-2xl p-3.5">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2 font-mono">Proposed After</p>
                <div className="space-y-2">
                  {changedAfter.length > 0 ? (
                    changedAfter.map((e, idx) => (
                      <div key={idx} className="border border-blue-500/20 bg-blue-500/5 rounded-xl p-2.5">
                        <p className="text-xs font-bold text-blue-300 truncate">{e.title}</p>
                        <p className="text-[10px] text-blue-400 font-mono mt-0.5">{e.startTime} - {e.endTime}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic py-2 font-sans">Optimized Blocks</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex gap-3">
            <button
              id="twin-dismiss-btn"
              onClick={onDismiss}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold cursor-pointer"
            >
              Keep My Routine
            </button>
            <button
              id="twin-accept-btn"
              onClick={onAccept}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/25 cursor-pointer border border-blue-400/20 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Check className="w-4 h-4" />
              Accept Reorganization
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
