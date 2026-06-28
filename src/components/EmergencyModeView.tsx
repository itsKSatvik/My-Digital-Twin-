import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Compass, 
  AlertOctagon, 
  ShieldAlert, 
  Clock, 
  RotateCcw,
  CheckCircle2,
  Sliders,
  Laptop,
  Smartphone
} from 'lucide-react';
import { Task } from '../types';

interface EmergencyModeViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export default function EmergencyModeView({ tasks, setTasks }: EmergencyModeViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(25);
  const [countdown, setCountdown] = useState({ minutes: 25, seconds: 0 });
  
  // Sync countdown with custom session duration when paused
  useEffect(() => {
    if (!isPlaying) {
      setCountdown({ minutes: sessionDuration, seconds: 0 });
    }
  }, [sessionDuration, isPlaying]);
  
  // Ambient sound configurations
  const [activeSound, setActiveSound] = useState('Deep Alpha Waves');
  const [soundVolume, setSoundVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  // Focus block logger metrics
  const [focusLogged, setFocusLogged] = useState(0);

  // Emergency blockades list
  const [blockades, setBlockades] = useState([
    { id: 'websites_pc', label: "Restrict Distracting Websites", device: "Computer", active: true },
    { id: 'apps_mobile', label: "Restrict Distracting Apps", device: "Phone / Tablet", active: true },
    { id: 'phone', label: "Silence Cell Phone Notifications", device: "Phone / Tablet", active: true },
    { id: 'slack', label: "Auto-respond on Slack / Teams", device: "Computer", active: true },
    { id: 'tabs', label: "Restrict Browser to Single Active Tab", device: "Computer", active: false },
    { id: 'door', label: "Activate 'Do Not Disturb' Door Indicator", device: "All Devices", active: false },
  ]);

  // Handle countdown tick
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 };
          } else if (prev.minutes > 0) {
            return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          } else {
            setIsPlaying(false);
            setFocusLogged(f => f + 1);
            // Auto credit 1 focused hour to first incomplete task
            setTasks(current => {
              const activeTask = current.find(t => t.status !== 'completed');
              if (activeTask) {
                return current.map(t => {
                  if (t.id === activeTask.id) {
                    const nextCompleted = Math.min(t.hoursNeeded, t.hoursCompleted + 1);
                    const nextStatus = nextCompleted === t.hoursNeeded ? 'completed' : 'in_progress';
                    return { ...t, hoursCompleted: nextCompleted, status: nextStatus };
                  }
                  return t;
                });
              }
              return current;
            });
            return { minutes: sessionDuration, seconds: 0 };
          }
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, setTasks, sessionDuration]);

  const handleToggleBlockade = (id: string) => {
    setBlockades(prev => prev.map(b => {
      if (b.id === id) return { ...b, active: !b.active };
      return b;
    }));
  };

  const handleResetTimer = () => {
    setIsPlaying(false);
    setCountdown({ minutes: sessionDuration, seconds: 0 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      id="deep-focus-mode-container"
    >
      {/* Warning Crimson Banner */}
      <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 flex items-center justify-between gap-4 animate-pulse-slow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-400 font-sans tracking-tight">DEEP FOCUS PROTOCOL ACTIVE</h3>
            <p className="text-xs text-red-500/80 font-sans mt-0.5">
              High congestion risk detected. Custom deep focus sessions enabled. Work blocks prioritized.
            </p>
          </div>
        </div>
        <Zap className="w-5 h-5 text-red-500 animate-pulse hidden sm:block" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Nuclear Focus Timer (5 Columns) */}
        <div className="lg:col-span-5 bg-[#171F34] border border-red-500/10 rounded-2xl p-6 flex flex-col justify-between items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-red-500/[0.01] pointer-events-none" />
          
          <div className="w-full">
            <h2 className="text-xs font-bold text-red-400 uppercase tracking-widest font-mono flex items-center justify-center gap-1.5 mb-2">
              <AlertOctagon className="w-4 h-4" />
              DEEP FOCUS SESSION
            </h2>
            <p className="text-[11px] text-slate-500 font-sans">Slam through congestion windows without excuses.</p>
          </div>

          {/* Large Countdown timer */}
          <div className="my-6">
            <span className="text-7xl font-mono font-black text-red-500 tracking-tighter drop-shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              {String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
            </span>
            <div className="block mt-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-950/40 px-3.5 py-1.5 rounded-full border border-white/5 inline-block font-mono">
                Focus Blocks Logged: <strong className="text-red-400">{focusLogged}</strong>
              </span>
            </div>
          </div>

          {/* Flexible Timer Adjustment Panel */}
          <div className="w-full mb-6 px-1 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Session Duration</span>
              <span className="text-red-400 font-bold font-mono">{sessionDuration} min</span>
            </div>
            
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={sessionDuration}
              onChange={(e) => setSessionDuration(Number(e.target.value))}
              disabled={isPlaying}
              className={`w-full accent-red-500 bg-slate-950 rounded-lg cursor-pointer h-1.5 ${
                isPlaying ? 'opacity-35 cursor-not-allowed' : 'hover:accent-red-400'
              }`}
            />
            {isPlaying && (
              <p className="text-[9px] text-slate-500 italic mt-0.5">Pause session to adjust duration</p>
            )}

            <div className="flex flex-wrap justify-center gap-1 pt-1">
              <button
                disabled={isPlaying || sessionDuration <= 5}
                onClick={() => setSessionDuration(prev => Math.max(5, prev - 5))}
                className="px-2 py-1 text-[10px] font-bold bg-slate-950 hover:bg-slate-900 border border-white/5 text-slate-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Decrease 5 minutes"
              >
                -5m
              </button>
              
              {[15, 25, 45, 60, 90].map((preset) => (
                <button
                  key={preset}
                  disabled={isPlaying}
                  onClick={() => setSessionDuration(preset)}
                  className={`px-2 py-1 text-[10px] font-mono rounded-lg border transition-all cursor-pointer ${
                    sessionDuration === preset
                      ? 'bg-red-500/15 border-red-500/40 text-red-400 font-bold'
                      : 'bg-[#0B1020]/40 border-transparent text-slate-400 hover:border-white/5 hover:text-slate-200'
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  {preset}m
                </button>
              ))}

              <button
                disabled={isPlaying || sessionDuration >= 120}
                onClick={() => setSessionDuration(prev => Math.min(120, prev + 5))}
                className="px-2 py-1 text-[10px] font-bold bg-slate-950 hover:bg-slate-900 border border-white/5 text-slate-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Increase 5 minutes"
              >
                +5m
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3.5 w-full justify-center">
            <button
              id="emergency-play-pause"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                isPlaying 
                  ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' 
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              id="emergency-reset"
              onClick={handleResetTimer}
              className="p-3 bg-slate-950 hover:bg-slate-900 border border-white/5 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Sound Synthesizer + Blockades (7 Columns) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Sound Synthesizer Card */}
          <div className="bg-[#171F34] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-white font-sans flex items-center gap-2">
                <Sliders className="w-4.5 h-4.5 text-blue-500" />
                Focus Audio loops
              </h3>
              
              <button
                id="synth-mute-toggle"
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Presets */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Sound Preset</span>
                {['Deep Alpha Waves', 'Lofi Focus Beats', 'SaaS White Noise', 'Synthetic Rain loop'].map((sound) => (
                  <button
                    key={sound}
                    onClick={() => setActiveSound(sound)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                      activeSound === sound 
                        ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 font-semibold' 
                        : 'bg-[#0B1020]/40 border-transparent text-slate-400 hover:border-white/5 hover:text-slate-200'
                    }`}
                  >
                    {sound}
                  </button>
                ))}
              </div>

              {/* Volume & Animated Synthesizer visualizer waves */}
              <div className="flex flex-col justify-between py-1">
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Synthesizer Volume ({soundVolume}%)</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={soundVolume}
                    onChange={(e) => setSoundVolume(Number(e.target.value))}
                    className="w-full accent-blue-500 bg-slate-900 rounded-lg cursor-pointer h-1.5"
                  />
                </div>

                {/* Waves Animation */}
                <div className="bg-slate-950 rounded-xl p-3 border border-white/5 h-24 flex items-end justify-between gap-1 relative overflow-hidden mt-3">
                  <div className="absolute inset-0 bg-blue-500/[0.01] flex items-center justify-center">
                    <span className="text-[8px] font-mono font-bold text-slate-600 uppercase tracking-widest">
                      {isMuted ? "MUTED" : "SYNTH ACTIVE"}
                    </span>
                  </div>

                  {/* Individual animated visualizer bars */}
                  {Array.from({ length: 16 }).map((_, i) => {
                    const animationDelay = `${i * 0.08}s`;
                    const barHeight = isMuted || !isPlaying ? 'h-1.5' : 'h-full';
                    
                    return (
                      <div
                        key={i}
                        className={`w-1.5 rounded-t-sm bg-gradient-to-t from-blue-600 to-purple-500 transition-all ${barHeight}`}
                        style={{
                          animation: !isMuted && isPlaying ? 'bounce 0.8s ease-in-out infinite alternate' : 'none',
                          animationDelay,
                          height: !isMuted && isPlaying ? `${Math.floor(Math.random() * 85) + 15}%` : '6px'
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Distraction blockade checklist */}
          <div className="bg-[#171F34] border border-white/5 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white font-sans flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
              <Compass className="w-4.5 h-4.5 text-red-400" />
              Focus blockades
            </h3>

            <div className="space-y-3">
              {blockades.map((b) => (
                <div 
                  key={b.id}
                  onClick={() => handleToggleBlockade(b.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                    b.active 
                      ? 'bg-red-500/5 border-red-500/20 text-slate-200' 
                      : 'bg-[#0B1020]/30 border-white/5 text-slate-400 hover:border-white/10'
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold">{b.label}</span>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 font-mono">
                      {b.device === "Computer" ? (
                        <>
                          <Laptop className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-blue-400/90">Computer Block</span>
                        </>
                      ) : b.device === "Phone / Tablet" ? (
                        <>
                          <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-purple-400/90">Mobile / Tablet Block</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-amber-400/90">Universal Block</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      b.active 
                        ? 'bg-red-500/20 border-red-500 text-red-400' 
                        : 'border-slate-700 text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bounce custom animation definition */}
      <style>{`
        @keyframes bounce {
          0% { transform: scaleY(0.15); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </motion.div>
  );
}
