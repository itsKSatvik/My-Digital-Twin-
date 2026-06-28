import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, CheckCircle2, AlertCircle, FileText, ChevronRight, Clock, Award, ShieldAlert } from 'lucide-react';
import { Task, RiskAnalysis } from '../types';

interface AIPlannerViewProps {
  tasks: Task[];
  risk: RiskAnalysis;
  planSteps: {
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
  }[];
  isLoadingPlan: boolean;
  refreshPlan: () => void;
}

export default function AIPlannerView({ tasks, risk, planSteps, isLoadingPlan, refreshPlan }: AIPlannerViewProps) {
  const [activePlanStep, setActivePlanStep] = useState<number | null>(0); // Default open first
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const handleToggleStep = (index: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      id="ai-planner-view-container"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-sans tracking-tight">AI Planner</h1>
          <p className="text-sm text-slate-400 font-sans mt-0.5">
            Smart workload optimization and predictive task orchestration.
          </p>
        </div>

        <button
          id="regenerate-plan-btn"
          onClick={refreshPlan}
          disabled={isLoadingPlan}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4.5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/10 cursor-pointer flex items-center gap-1.5 shrink-0 hover:scale-[1.01] active:scale-[0.99]"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          {isLoadingPlan ? "Regenerating..." : "Regenerate AI Targets"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Plan Steps Checklist (7 Columns) */}
        <div className="lg:col-span-7 bg-[#171F34]/80 border border-white/5 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-2.5 mb-6 pb-3 border-b border-white/5">
            <Brain className="w-4.5 h-4.5 text-purple-400" />
            <h2 className="text-sm font-semibold text-slate-100 font-sans">Active AI Priority Protocol</h2>
          </div>

          <div className="space-y-3.5">
            {planSteps.length === 0 ? (
              <div className="text-center py-12 bg-[#0B1020]/20 rounded-xl border border-white/5">
                <Sparkles className="w-8 h-8 text-indigo-400 mx-auto animate-bounce" />
                <p className="text-xs text-slate-400 mt-3">Click 'Regenerate AI Targets' to formulate a highly optimized step-by-step routing.</p>
              </div>
            ) : (
              planSteps.map((step, index) => {
                const isCompleted = !!completedSteps[index];
                const isExpanded = activePlanStep === index;

                return (
                  <motion.div 
                    layout
                    key={index}
                    className={`border rounded-xl transition-all overflow-hidden ${
                      isExpanded 
                        ? 'bg-[#1d263d] border-indigo-500/30 shadow-lg' 
                        : 'bg-[#0B1020]/30 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {/* Step Header */}
                    <div 
                      onClick={() => setActivePlanStep(isExpanded ? null : index)}
                      className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStep(index);
                          }}
                          className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${
                            isCompleted
                              ? 'bg-emerald-500/25 border-emerald-500 text-emerald-400'
                              : 'border-slate-700 hover:border-slate-500 text-transparent'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${
                            isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'
                          }`}>
                            {step.title}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400 block mt-1">
                            Target Window: {step.time}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded ${
                          step.urgency === 'CRITICAL' 
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                            : step.urgency === 'MEDIUM' 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                              : 'bg-slate-800 text-slate-400'
                        }`}>
                          {step.urgency}
                        </span>
                        <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-90 text-slate-300' : ''}`} />
                      </div>
                    </div>

                    {/* Step Expanded Detail (Motion Collapsible) */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="border-t border-white/5"
                        >
                          <div className="p-4 bg-[#111827]/40 space-y-4 text-xs font-sans leading-relaxed text-slate-300">
                            <div>
                              <p className="text-[9px] font-mono uppercase tracking-wider text-indigo-400">Tactical Strategy</p>
                              <p className="mt-1 font-medium">{step.desc}</p>
                            </div>

                            {/* Dynamic AI Fields Redesigned Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-white/5">
                              {step.reason && (
                                <div className="space-y-1">
                                  <p className="text-[9px] font-mono uppercase tracking-wider text-indigo-400">Twin Contextual Reasoning</p>
                                  <p className="text-slate-400 text-[11px] leading-relaxed italic">"{step.reason}"</p>
                                </div>
                              )}

                              <div className="space-y-2">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3 text-indigo-400" /> Target Duration:</span>
                                  <span className="font-semibold text-slate-200">{step.duration ? (step.duration.includes('h') ? step.duration : `${step.duration} hrs`) : 'Auto-timed'}</span>
                                </div>
                                
                                {step.expectedFinishTime && (
                                  <div className="flex justify-between text-[11px]">
                                    <span className="text-slate-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Complete By:</span>
                                    <span className="font-semibold text-emerald-400">{step.expectedFinishTime}</span>
                                  </div>
                                )}

                                {step.confidence !== undefined && (
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[11px]">
                                      <span className="text-slate-400 flex items-center gap-1"><Award className="w-3 h-3 text-amber-400" /> Execution Confidence:</span>
                                      <span className="font-semibold text-amber-400">{Math.round(step.confidence * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                      <div className="bg-amber-400 h-full" style={{ width: `${step.confidence * 100}%` }} />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Dependencies Badge list if any */}
                            {step.dependencies && step.dependencies.length > 0 && (
                              <div className="pt-3 border-t border-white/5 flex flex-wrap items-center gap-2">
                                <span className="text-[9px] font-mono uppercase tracking-wider text-rose-400 flex items-center gap-1">
                                  <ShieldAlert className="w-3 h-3" /> Pre-requisite Blocks:
                                </span>
                                {step.dependencies.map((dep, dIdx) => (
                                  <span key={dIdx} className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2 py-0.5 rounded font-medium">
                                    {dep}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: AI Analysis summary cards (5 Columns) */}
        <div className="lg:col-span-5 bg-[#171F34]/80 border border-white/5 p-6 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
              <FileText className="w-4.5 h-4.5 text-blue-400" />
              <h2 className="text-sm font-semibold text-slate-100 font-sans">Slippage Audit Diagnosis</h2>
            </div>

            <div className="space-y-3.5">
              <div className="bg-[#0B1020]/30 border border-white/5 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Congestion Assessment</h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">
                    Overall slippage risk is calculated at <strong className="text-blue-400 font-semibold">{risk.riskScore}%</strong>. 
                    {risk.likelyToMiss && risk.likelyToMiss.length > 0 
                      ? ` Heavy bottlenecks identified on: ${risk.likelyToMiss.join(", ")}.`
                      : ' Schedule load aligns with deadline tolerances.'}
                  </p>
                </div>
              </div>

              <div className="bg-[#0B1020]/30 border border-white/5 p-4 rounded-xl">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Digital Twin Action Advice</h4>
                <ul className="text-xs text-slate-300 space-y-2.5 list-disc list-inside font-sans">
                  {risk.suggestions.map((suggestion, index) => (
                    <li key={index} className="leading-relaxed">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-sans italic mt-6 bg-[#0B1020]/50 border border-white/5 p-3.5 rounded-xl leading-relaxed">
            Pro Tip: Toggle the checkboxes as you complete focus blocks to keep risk estimates accurate.
          </div>
        </div>
      </div>
    </motion.div>
  );
}
