import React, { useState } from 'react';
import { 
  User, 
  Sparkles, 
  Bell, 
  Languages, 
  Settings, 
  Save, 
  CheckCircle2, 
  SlidersHorizontal,
  LayoutGrid
} from 'lucide-react';
import { StudentProfile } from '../types';

interface SettingsViewProps {
  student: StudentProfile;
  onUpdateProfile: (profile: StudentProfile) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function SettingsView({
  student,
  onUpdateProfile,
  darkMode,
  setDarkMode
}: SettingsViewProps) {
  
  const [formData, setFormData] = useState<StudentProfile>({ ...student });
  const [success, setSuccess] = useState(false);

  // Settings mock toggles
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [lang, setLang] = useState('English (US)');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Student Profile Edit Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-[#006A6A]" />
              Academic Student Profile
            </h3>
            
            {success && (
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Saved successfully
              </span>
            )}
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#006A6A] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Desired Course Major</label>
                <input 
                  type="text" 
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#006A6A] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Primary Target University</label>
                <input 
                  type="text" 
                  name="university"
                  value={formData.university}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#006A6A] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">GPA Equivalent Index</label>
                <input 
                  type="text" 
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleInputChange}
                  placeholder="e.g. 3.92 / 4.0"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#006A6A] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">SAT Score</label>
                <input 
                  type="text" 
                  name="satScore"
                  value={formData.satScore}
                  onChange={handleInputChange}
                  placeholder="e.g. 1540 / 1600"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#006A6A] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contact Phone</label>
                <input 
                  type="text" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#006A6A] focus:bg-white transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#006A6A] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#006A6A] hover:bg-[#005151] text-white text-sm font-semibold rounded-xl transition-all duration-150 flex items-center gap-2 shadow-sm shadow-teal-700/10"
                id="btn-save-settings"
              >
                <Save className="h-4 w-4" />
                Save Profile Parameters
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Other Preferences & Platform Configurations */}
        <div className="space-y-6">
          
          {/* Theme Preset Control Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
              <LayoutGrid className="h-4.5 w-4.5 text-[#006A6A]" />
              Platform Theme Preset
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDarkMode(false)}
                className={`p-3.5 rounded-xl border text-center transition-all ${
                  !darkMode 
                    ? 'border-[#006A6A] bg-teal-50/20 text-[#006A6A] font-bold' 
                    : 'border-slate-150 hover:bg-slate-50 text-slate-600'
                }`}
                id="btn-set-light-theme"
              >
                <div className="h-4.5 w-full rounded bg-slate-100 border border-slate-200 mb-2"></div>
                <span className="text-xs">University Light</span>
              </button>

              <button
                onClick={() => setDarkMode(true)}
                className={`p-3.5 rounded-xl border text-center transition-all ${
                  darkMode 
                    ? 'border-[#006A6A] bg-teal-50/20 text-[#006A6A] font-bold' 
                    : 'border-slate-150 hover:bg-slate-50 text-slate-600'
                }`}
                id="btn-set-dark-theme"
              >
                <div className="h-4.5 w-full rounded bg-slate-850 border border-slate-900 mb-2"></div>
                <span className="text-xs">Cosmic Midnight</span>
              </button>
            </div>
          </div>

          {/* Notifications config Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
              <Bell className="h-4.5 w-4.5 text-indigo-500" />
              Alert Subscriptions
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between text-xs font-semibold text-slate-600 cursor-pointer">
                <span>Email Digest Updates</span>
                <input 
                  type="checkbox" 
                  checked={notifEmail}
                  onChange={(e) => setNotifEmail(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-slate-300 text-[#006A6A] focus:ring-[#006A6A]"
                />
              </label>

              <label className="flex items-center justify-between text-xs font-semibold text-slate-600 cursor-pointer">
                <span>Push Notification Warning Triggers</span>
                <input 
                  type="checkbox" 
                  checked={notifPush}
                  onChange={(e) => setNotifPush(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-slate-300 text-[#006A6A] focus:ring-[#006A6A]"
                />
              </label>
            </div>
          </div>

          {/* Language Selection Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
              <Languages className="h-4.5 w-4.5 text-emerald-500" />
              Language & Region
            </h3>

            <div>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#006A6A]"
                id="select-language"
              >
                <option value="English (US)">English (US)</option>
                <option value="English (UK)">English (UK)</option>
                <option value="Español (ES)">Español (ES)</option>
                <option value="Hindi (IN)">Hindi (IN)</option>
              </select>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
