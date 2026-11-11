import React from 'react';
import { 
  LayoutDashboard, 
  FolderLock, 
  FileScan, 
  Landmark, 
  CreditCard,
  GitCompare, 
  CalendarDays, 
  BotMessageSquare, 
  BarChart3, 
  Bell, 
  Settings,
  X,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  unreadCount: number;
}

export default function Sidebar({ 
  activeSection, 
  setActiveSection, 
  isOpen, 
  setIsOpen,
  unreadCount
}: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'vault', name: 'Smart Document Vault', icon: FolderLock },
    { id: 'ocr', name: 'OCR Verification Center', icon: FileScan },
    { id: 'requirements', name: 'College Requirements', icon: Landmark },
    { id: 'payments', name: 'Application Fees (PayPal)', icon: CreditCard, badge: 'Sandbox' },
    { id: 'comparison', name: 'College Comparison', icon: GitCompare },
    { id: 'timeline', name: 'Admission Timeline', icon: CalendarDays },
    { id: 'assistant', name: 'AI Assistant', icon: BotMessageSquare, badge: 'AI' },
    { id: 'analytics', name: 'Reports & Analytics', icon: BarChart3 },
    { id: 'notifications', name: 'Notifications', icon: Bell, count: unreadCount },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const handleItemClick = (id: string) => {
    setActiveSection(id);
    setIsOpen(false); // Close drawer on mobile click
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        id="app-sidebar"
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 z-50 flex flex-col border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#006A6A] rounded-lg text-white flex items-center justify-center">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-tight text-[#006A6A] dark:text-white leading-none">AdmissionMate</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-wider font-semibold uppercase mt-0.5">AI Platform</span>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            id="btn-close-sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-item-${item.id}`}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive 
                    ? 'bg-[#E6F0F0] dark:bg-[#006A6A] text-[#006A6A] dark:text-white border-l-4 border-[#006A6A] font-semibold' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`h-5 w-5 ${isActive ? 'text-[#006A6A] dark:text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#6750A4] text-white rounded-md tracking-wider uppercase font-sans">
                    {item.badge}
                  </span>
                )}
                {item.count && item.count > 0 ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {item.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer - Student Context */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#E6F0F0] dark:bg-[#006A6A]/20 text-[#006A6A] dark:text-teal-400 flex items-center justify-center font-display font-bold shadow-sm">
            RK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate leading-tight">Rahul Kumar</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">Computer Science</p>
          </div>
        </div>
      </aside>
    </>
  );
}
