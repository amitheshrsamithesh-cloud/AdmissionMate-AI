import React from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { StudentProfile } from '../types';

interface TopBarProps {
  onMenuClick: () => void;
  activeSectionName: string;
  student: StudentProfile;
  unreadCount: number;
  setActiveSection: (section: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function TopBar({
  onMenuClick,
  activeSectionName,
  student,
  unreadCount,
  setActiveSection,
  darkMode,
  setDarkMode
}: TopBarProps) {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm shadow-slate-100/40 dark:shadow-none">
      {/* Left items: Menu button for mobile, section name */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          id="btn-sidebar-toggle"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <h1 className="font-display font-bold text-lg md:text-xl text-slate-800 dark:text-white tracking-tight">
            {activeSectionName}
          </h1>
        </div>
      </div>

      {/* Middle item: Search bar (styled SaaS-style) */}
      <div className="hidden md:flex items-center max-w-md flex-1 mx-8 relative">
        <div className="absolute left-3.5 text-slate-400">
          <Search className="h-4.5 w-4.5" />
        </div>
        <input 
          type="text" 
          placeholder="Search documents, colleges, deadlines..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#006A6A] dark:focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-all duration-150"
          id="topbar-search"
        />
      </div>

      {/* Right items: AI Status, Theme Toggle, Notification, Profile */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* AI Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-[#006A6A]/10 border border-teal-100 dark:border-[#006A6A]/30 text-[#006A6A] dark:text-teal-400 text-xs font-semibold leading-none shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-[#006A6A] dark:text-teal-400 animate-pulse-slow" />
          <span className="hidden sm:inline">AI Agent:</span>
          <span className="text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider text-[10px]">Active</span>
        </div>

        {/* Theme Toggle (Professional UI element) */}
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors"
          title="Toggle Theme"
          id="btn-theme-toggle"
        >
          {darkMode ? (
            <Sun className="h-5 w-5 text-amber-500" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        {/* Notification Bell */}
        <button 
          onClick={() => setActiveSection('notifications')}
          className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full relative transition-colors"
          id="btn-topbar-notifications"
        >
          <Bell className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </button>

        {/* User Profile */}
        <div 
          onClick={() => setActiveSection('settings')}
          className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 cursor-pointer group hover:opacity-90"
          id="topbar-profile"
        >
          <div className="h-9 w-9 rounded-full bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 flex items-center justify-center text-[#006A6A] dark:text-teal-400 font-semibold text-sm">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden lg:flex flex-col text-left leading-none">
            <span className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-[#006A6A] transition-colors">{student.name}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{student.university}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
