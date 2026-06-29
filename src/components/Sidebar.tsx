import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AppLogo from './AppLogo';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Brain, 
  Zap, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Activity,
  Clock,
  User
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  timezone: string;
}

const getTimezoneLabel = (tz: string) => {
  if (tz === 'Asia/Kolkata') return 'IST';
  if (tz === 'America/New_York') return 'EST';
  if (tz === 'America/Los_Angeles') return 'PST';
  if (tz === 'Europe/London') return 'GMT';
  if (tz === 'Europe/Paris') return 'CET';
  if (tz === 'Asia/Singapore') return 'SGT';
  if (tz === 'Asia/Tokyo') return 'JST';
  if (tz === 'Australia/Sydney') return 'AEST';
  if (tz === 'UTC') return 'UTC';
  return tz.split('/').pop()?.replace('_', ' ') || tz;
};

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, timezone }: SidebarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(time);

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(time);

  const tzLabel = getTimezoneLabel(timezone);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'planner', label: 'Twin Planner', icon: Brain, badge: 'New' },
    { id: 'doctor', label: 'Twin Doctor', icon: Activity, badge: 'Fixes' },
    { id: 'memory', label: 'Twin Memory', icon: User, badge: 'Core' },
    { id: 'emergency', label: 'Deep Focus Mode', icon: Zap, highlight: true },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        id="desktop-sidebar"
        className={`hidden md:flex flex-col h-screen fixed left-0 top-0 border-r border-white/5 bg-brand-bg transition-all duration-300 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Header/Logo */}
        <div className="h-16 flex items-center px-5.5 border-b border-white/5 gap-3 shrink-0">
          <AppLogo className="w-8.5 h-8.5 shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-lg text-white font-sans tracking-tight"
              >
                My Digital Twin
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Digital Clock Widget */}
        <div className="px-6 py-4 border-b border-white/5 bg-[#171F34]/20 shrink-0">
          {isCollapsed ? (
            <div className="flex flex-col items-center justify-center gap-1 text-slate-400 group relative">
              <Clock className="w-5 h-5 text-blue-500 animate-pulse" />
              <span className="text-[9px] font-mono font-semibold text-slate-300">
                {new Intl.DateTimeFormat('en-US', {
                  timeZone: timezone,
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }).format(time)}
              </span>
              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-[#171F34] text-slate-100 text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/5 shadow-xl z-50">
                {formattedTime} ({tzLabel})
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>{tzLabel} CLOCK</span>
              </div>
              <div className="text-base font-bold font-mono tracking-tight text-white mt-1">
                {formattedTime}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {formattedDate}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                id={`sidebar-item-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all relative group ${
                  isActive 
                    ? item.highlight 
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-white/5 text-white border border-white/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <Icon className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive 
                      ? item.highlight ? 'text-red-400' : 'text-white' 
                      : 'text-slate-400 group-hover:text-white'
                  }`} />
                  
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="truncate font-sans"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </div>

                {/* Badge */}
                {!isCollapsed && item.badge && (
                  <span className="absolute right-3 top-2.5 px-1.5 py-0.5 text-[9px] font-bold bg-blue-600 text-white rounded uppercase tracking-wider scale-90">
                    {item.badge}
                  </span>
                )}

                {/* Tooltip on collapse */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-[#171F34] text-slate-100 text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/5 shadow-xl z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Pro Plan Box from Design HTML */}
        {!isCollapsed && (
          <div className="px-6 mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-xl border border-white/5">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1 font-sans">Pro Plan</p>
              <p className="text-xs text-slate-400 leading-normal font-sans">Enhanced AI predictions active.</p>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <div className="p-4 border-t border-white/5">
          <button
            id="sidebar-collapse-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg bg-[#171F34]/30 hover:bg-[#171F34]/80 text-slate-400 hover:text-slate-200 border border-white/5 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav 
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-brand-bg/90 border-t border-slate-800/60 backdrop-blur-md flex items-center justify-around px-2 z-30"
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              id={`mobile-nav-item-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
                isActive 
                  ? item.highlight 
                    ? 'text-red-400'
                    : 'text-blue-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-sans mt-1 max-w-[50px] truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
