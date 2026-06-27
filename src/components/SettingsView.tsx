import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, Shield, Cpu, RefreshCw, CheckCircle2, CloudLightning, ToggleLeft, ToggleRight, HelpCircle } from 'lucide-react';

interface SettingsViewProps {
  riskSource: string;
  timezone: string;
  setTimezone: (timezone: string) => void;
  lunchStart: string;
  setLunchStart: (start: string) => void;
  lunchEnd: string;
  setLunchEnd: (end: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  isWorkspaceConnected: boolean;
  workspaceProfile: any | null;
  isWorkspaceLoading: boolean;
  syncWorkspaceData: () => Promise<void>;
}

export default function SettingsView({ 
  riskSource, 
  timezone, 
  setTimezone,
  lunchStart,
  setLunchStart,
  lunchEnd,
  setLunchEnd,
  theme,
  setTheme,
  isWorkspaceConnected,
  workspaceProfile,
  isWorkspaceLoading,
  syncWorkspaceData
}: SettingsViewProps) {
  const [geminiStatus, setGeminiStatus] = useState<'checking' | 'active' | 'offline'>('checking');
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(false);
  const [safetyFilter, setSafetyFilter] = useState('High Precision');

  useEffect(() => {
    // Check if Gemini is active based on riskSource parameter
    if (riskSource === 'gemini') {
      setGeminiStatus('active');
    } else if (riskSource === 'local') {
      setGeminiStatus('offline');
    } else {
      // Small simulated delay to check backend status
      setTimeout(() => {
        if (riskSource && riskSource.includes('gemini')) {
          setGeminiStatus('active');
        } else {
          setGeminiStatus('offline');
        }
      }, 600);
    }
  }, [riskSource]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      id="settings-view-container"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white font-sans tracking-tight">Settings</h1>
        <p className="text-sm text-slate-400 font-sans mt-0.5">
          Configure parameters, toggle preferences, and view intelligence server configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: System telemetry (5 Columns) */}
        <div className="lg:col-span-5 bg-[#171F34] border border-white/5 p-6 rounded-2xl h-fit space-y-5">
          <h2 className="text-sm font-semibold text-white font-sans flex items-center gap-2 pb-2 border-b border-white/5">
            <Cpu className="w-4.5 h-4.5 text-blue-500" />
            AI Integration Status
          </h2>

          <div className="space-y-3.5">
            {/* Gemini API Key indicator */}
            <div className="flex items-center justify-between p-3.5 bg-[#0B1020]/30 border border-white/5 rounded-xl">
              <div>
                <h4 className="text-xs font-semibold text-slate-300">Gemini LLM Connection</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Google GenAI Client v2.4</p>
              </div>
              
              <div className="flex items-center gap-1.5">
                {geminiStatus === 'checking' && (
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-white/5 px-2 py-0.5 rounded flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Check
                  </span>
                )}
                {geminiStatus === 'active' && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                  </span>
                )}
                {geminiStatus === 'offline' && (
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Local Planner
                  </span>
                )}
              </div>
            </div>

            {/* Google Workspace Connection Panel */}
            <div className="space-y-4 p-4 bg-[#0B1020]/30 border border-white/5 rounded-xl">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📅</span>
                  <h3 className="text-xs font-bold text-slate-200">Google Workspace</h3>
                </div>
                <span className="text-[9px] font-mono text-slate-500">Calendar & Tasks</span>
              </div>

              {isWorkspaceConnected ? (
                <div className="space-y-3">
                  {workspaceProfile ? (
                    <div className="flex items-center gap-3 p-2 bg-[#171F34]/50 rounded-xl border border-white/5">
                      {workspaceProfile.picture ? (
                        <img 
                          src={workspaceProfile.picture} 
                          alt={workspaceProfile.name} 
                          className="w-9 h-9 rounded-full border border-white/10"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
                          {workspaceProfile.name?.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-200 truncate">{workspaceProfile.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{workspaceProfile.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Connected
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                    <div className="p-2 bg-[#171F34]/40 rounded-lg border border-white/5">
                      <p className="text-slate-400">Calendar</p>
                      <p className="text-xs font-extrabold text-blue-400 mt-0.5">Active Sync</p>
                    </div>
                    <div className="p-2 bg-[#171F34]/40 rounded-lg border border-white/5">
                      <p className="text-slate-400">Tasks</p>
                      <p className="text-xs font-extrabold text-purple-400 mt-0.5">Active Sync</p>
                    </div>
                  </div>

                  <button
                    onClick={syncWorkspaceData}
                    disabled={isWorkspaceLoading}
                    className="w-full py-2 bg-[#171F34] hover:bg-[#1f2a47] border border-white/5 hover:border-white/10 text-slate-300 font-bold text-[10px] rounded-lg uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isWorkspaceLoading ? 'animate-spin' : ''}`} />
                    {isWorkspaceLoading ? 'Synchronizing...' : 'Sync Workspace'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Connect Google Calendar and Google Tasks to sync your agenda and track deadlines inside your Digital Twin.
                  </p>

                  <button
                    onClick={syncWorkspaceData}
                    disabled={isWorkspaceLoading}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-[10px] rounded-lg uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/10"
                  >
                    <RefreshCw className={`w-3 h-3 ${isWorkspaceLoading ? 'animate-spin' : ''}`} />
                    {isWorkspaceLoading ? 'Syncing...' : 'Sync with Google Workspace'}
                  </button>
                </div>
              )}
            </div>

            {/* Security Profile */}
            <div className="flex items-center justify-between p-3.5 bg-[#0B1020]/30 border border-white/5 rounded-xl">
              <div>
                <h4 className="text-xs font-semibold text-slate-300">Security Encryption</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Encrypted local storage layers</p>
              </div>
              <span className="text-[10px] font-mono text-slate-300 bg-slate-900 border border-white/5 px-2.5 py-0.5 rounded uppercase font-bold">
                AES-256
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Preferences Settings (7 Columns) */}
        <div className="lg:col-span-7 bg-[#171F34] border border-white/5 p-6 rounded-2xl">
          <h2 className="text-sm font-semibold text-white font-sans flex items-center gap-2 pb-2 border-b border-white/5 mb-4">
            <Shield className="w-4.5 h-4.5 text-blue-500" />
            Workspace Preferences
          </h2>

          <div className="space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-[#0B1020]/30 rounded-xl border border-white/5">
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Dark Mode Theme</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Toggle high-contrast dark mode visualization.</p>
              </div>
              <button
                id="toggle-dark-mode"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
              >
                {theme === 'dark' ? <ToggleRight className="w-7 h-7 text-blue-500" /> : <ToggleLeft className="w-7 h-7" />}
              </button>
            </div>

            {/* Toggle 1 */}
            <div className="flex items-center justify-between p-3.5 bg-[#0B1020]/30 rounded-xl border border-white/5">
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Active Analytics Tracking</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Compile completion efficiency rates locally.</p>
              </div>
              <button
                onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                className="text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
              >
                {analyticsEnabled ? <ToggleRight className="w-7 h-7 text-blue-500" /> : <ToggleLeft className="w-7 h-7" />}
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between p-3.5 bg-[#0B1020]/30 rounded-xl border border-white/5">
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Haptic Ticks (Simulated)</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Emit short haptic alerts during countdown ticks.</p>
              </div>
              <button
                onClick={() => setVibrationEnabled(!vibrationEnabled)}
                className="text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
              >
                {vibrationEnabled ? <ToggleRight className="w-7 h-7 text-blue-500" /> : <ToggleLeft className="w-7 h-7" />}
              </button>
            </div>

            {/* Dropdown Selection */}
            <div className="flex items-center justify-between p-3.5 bg-[#0B1020]/30 rounded-xl border border-white/5">
              <div>
                <h4 className="text-xs font-semibold text-slate-200">AI Safety Filters</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Set conservative threshold margins for risk scores.</p>
              </div>
              
              <select
                value={safetyFilter}
                onChange={(e) => setSafetyFilter(e.target.value)}
                className="bg-[#0B1020] border border-white/5 rounded-lg px-2.5 py-1 text-[10px] text-slate-300 font-sans cursor-pointer focus:outline-none"
              >
                <option value="Aggressive Core">🔴 Aggressive Core</option>
                <option value="High Precision"> Balanced Precision</option>
                <option value="Relaxed Buffer"> Relaxed Buffer</option>
              </select>
            </div>

            {/* Timezone Dropdown Selection */}
            <div className="flex items-center justify-between p-3.5 bg-[#0B1020]/30 rounded-xl border border-white/5">
              <div>
                <h4 className="text-xs font-semibold text-slate-200">System Time Zone</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Change local and prediction clocks (Default: IST).</p>
              </div>
              
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="bg-[#0B1020] border border-white/5 rounded-lg px-2.5 py-1 text-[10px] text-slate-300 font-sans cursor-pointer focus:outline-none"
              >
                <option value="Asia/Kolkata">🇮🇳 IST (UTC+05:30)</option>
                <option value="UTC">🌐 UTC (UTC+00:00)</option>
                <option value="America/New_York">🇺🇸 EST (UTC-05:00)</option>
                <option value="America/Los_Angeles">🇺🇸 PST (UTC-08:00)</option>
                <option value="Europe/London">🇬🇧 GMT (UTC+00:00)</option>
                <option value="Europe/Paris">🇪🇺 CET (UTC+01:00)</option>
                <option value="Asia/Singapore">🇸🇬 SGT (UTC+08:00)</option>
                <option value="Asia/Tokyo">🇯🇵 JST (UTC+09:00)</option>
                <option value="Australia/Sydney">🇦🇺 AEST (UTC+10:00)</option>
              </select>
            </div>

            {/* Lunch Hour Settings */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-[#0B1020]/30 rounded-xl border border-white/5 gap-3">
              <div>
                <h4 className="text-xs font-semibold text-slate-200">AI Doctor Lunch Interval</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Set daily interval (24h format HH:MM) to track nutritional schedule.</p>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={lunchStart}
                  onChange={(e) => setLunchStart(e.target.value)}
                  placeholder="13:00"
                  className="bg-[#0B1020] border border-white/5 rounded-lg px-2 py-1 text-[10px] text-slate-300 font-mono text-center w-16 focus:outline-none focus:border-blue-500/50"
                  title="Lunch Start Hour"
                />
                <span className="text-slate-500 text-[10px] uppercase font-bold font-mono">to</span>
                <input
                  type="text"
                  value={lunchEnd}
                  onChange={(e) => setLunchEnd(e.target.value)}
                  placeholder="14:00"
                  className="bg-[#0B1020] border border-white/5 rounded-lg px-2 py-1 text-[10px] text-slate-300 font-mono text-center w-16 focus:outline-none focus:border-blue-500/50"
                  title="Lunch End Hour"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
