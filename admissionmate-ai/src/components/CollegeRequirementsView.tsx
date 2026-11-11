import React, { useState } from 'react';
import { 
  Landmark, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info,
  ChevronRight,
  Sparkles,
  CreditCard,
  Receipt,
  ArrowRight
} from 'lucide-react';
import { College, Document } from '../types';

interface CollegeRequirementsViewProps {
  colleges: College[];
  documents: Document[];
  onUpdateStatus: (id: string, status: College['applicationStatus']) => void;
  setActiveSection: (section: string) => void;
}

export default function CollegeRequirementsView({
  colleges,
  documents,
  onUpdateStatus,
  setActiveSection
}: CollegeRequirementsViewProps) {
  
  const [selectedCollegeId, setSelectedCollegeId] = useState(colleges[0].id);
  const activeCollege = colleges.find(c => c.id === selectedCollegeId) || colleges[0];

  // Helper to check if student has uploaded the document
  const uploadedCategories = documents
    .filter(doc => doc.verificationStatus === 'Verified' || doc.verificationStatus === 'Pending')
    .map(doc => doc.category);

  const getDocStatus = (category: string) => {
    const foundDoc = documents.find(d => 
      d.category.toLowerCase().includes(category.toLowerCase()) ||
      d.name.toLowerCase().includes(category.toLowerCase()) ||
      category.toLowerCase().includes(d.category.toLowerCase())
    );
    if (!foundDoc) return { status: 'missing', label: 'Missing' };
    if (foundDoc.verificationStatus === 'Verified') return { status: 'verified', label: 'AI Validated' };
    if (foundDoc.verificationStatus === 'Expired') return { status: 'expired', label: 'Expired' };
    return { status: 'pending', label: 'Pending OCR' };
  };

  // Calculate missing documents
  const missingDocs = activeCollege.requiredDocs.filter(
    reqDoc => !documents.some(d => 
      (d.verificationStatus === 'Verified' || d.verificationStatus === 'Pending') &&
      (d.category.toLowerCase().includes(reqDoc.toLowerCase()) || d.name.toLowerCase().includes(reqDoc.toLowerCase()))
    )
  );

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Hard': return 'text-red-600 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900';
      case 'Medium': return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900';
      default: return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Sidebar College List */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-3">
          University Registry
        </h3>
        {colleges.map((college) => {
          const isSelected = college.id === selectedCollegeId;
          const isSubmitted = college.applicationStatus === 'Submitted';
          const isInProgress = college.applicationStatus === 'In Progress';
          
          return (
            <button
              key={college.id}
              onClick={() => setSelectedCollegeId(college.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                isSelected 
                  ? 'bg-teal-50 dark:bg-[#006A6A]/20 border-l-4 border-[#006A6A] font-semibold text-slate-800 dark:text-white' 
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-teal-100 dark:bg-[#006A6A]/40 text-[#006A6A] dark:text-teal-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <Landmark className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate text-slate-800 dark:text-white">{college.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Fee: ${college.applicationFee} • {college.deadlines.split(',')[0]}
                  </p>
                </div>
              </div>
              
              <div>
                {college.feePaid ? (
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500 text-white rounded-md uppercase">
                    Paid
                  </span>
                ) : isInProgress ? (
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-500 text-white rounded-md uppercase">
                    Draft
                  </span>
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Right Core Details Screen */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Header Details Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3.5 bg-teal-50 dark:bg-[#006A6A]/20 text-[#006A6A] dark:text-teal-400 rounded-xl">
                <Landmark className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-slate-800 dark:text-white">
                  {activeCollege.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getDifficultyColor(activeCollege.difficulty)}`}>
                    Acceptance: {activeCollege.difficulty}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tuition: {activeCollege.fees}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                Application Status
              </label>
              <select
                value={activeCollege.applicationStatus}
                onChange={(e) => onUpdateStatus(activeCollege.id, e.target.value as College['applicationStatus'])}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#006A6A] cursor-pointer"
                id="college-status-select"
              >
                <option value="Not Applied">Not Applied</option>
                <option value="In Progress">In Progress (Draft)</option>
                <option value="Submitted">Submitted (Under Review)</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Fee & PayPal Checkout Card */}
          <div className="p-4 bg-teal-50/50 dark:bg-[#006A6A]/10 border border-teal-100 dark:border-[#006A6A]/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#006A6A] text-white rounded-lg">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 dark:text-teal-400 font-bold block">
                  Application Processing Fee
                </span>
                <span className="text-base font-bold text-slate-800 dark:text-white">
                  ${activeCollege.applicationFee}.00 USD
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                  ({activeCollege.feePaid ? 'Paid via PayPal Sandbox' : 'Unpaid - Required for submission'})
                </span>
              </div>
            </div>

            {activeCollege.feePaid ? (
              <button
                onClick={() => setActiveSection('payments')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 rounded-xl hover:bg-emerald-200 transition"
              >
                <Receipt className="h-4 w-4" />
                View Receipt
              </button>
            ) : (
              <button
                onClick={() => setActiveSection('payments')}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#006A6A] hover:bg-[#005252] rounded-xl shadow-sm transition"
              >
                <CreditCard className="h-4 w-4" />
                Pay ${activeCollege.applicationFee} via PayPal
              </button>
            )}
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-[#006A6A] dark:text-teal-400" />
              Eligibility Prerequisites
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {activeCollege.eligibility}
            </p>
          </div>
        </div>

        {/* Document Checklist and Verification status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Document Checklist Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                Required Documents Audit
              </h3>
              
              <ul className="space-y-3">
                {activeCollege.requiredDocs.map((reqDoc, idx) => {
                  const docAudit = getDocStatus(reqDoc);
                  
                  return (
                    <li key={idx} className="flex items-center justify-between text-sm py-1">
                      <div className="flex items-center gap-2.5">
                        {docAudit.status === 'verified' ? (
                          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                        ) : docAudit.status === 'pending' ? (
                          <Info className="h-4.5 w-4.5 text-amber-500" />
                        ) : (
                          <XCircle className="h-4.5 w-4.5 text-red-400" />
                        )}
                        <span className="font-medium text-slate-700 dark:text-slate-300">{reqDoc}</span>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        docAudit.status === 'verified' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : docAudit.status === 'pending'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                      }`}>
                        {docAudit.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {missingDocs.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => setActiveSection('vault')}
                  className="w-full py-2 bg-[#E6F0F0] dark:bg-[#006A6A]/20 hover:bg-teal-100 dark:hover:bg-[#006A6A]/30 text-[#006A6A] dark:text-teal-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  id="btn-upload-missing-reqs"
                >
                  Upload Missing Documents ({missingDocs.length})
                </button>
              </div>
            )}
          </div>

          {/* Admission Process Checklist */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
              Admission Guidelines & Next Steps
            </h3>

            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {activeCollege.admissionProcess}
              </p>

              <div className="p-4 rounded-xl border border-teal-100 dark:border-[#006A6A]/30 bg-teal-50/30 dark:bg-[#006A6A]/10 space-y-2">
                <h4 className="text-xs font-bold text-[#006A6A] dark:text-teal-400 flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  AI Admission Tip
                </h4>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  {missingDocs.length === 0 
                    ? `Great! Your document checklist is complete for ${activeCollege.name}. If you haven't yet, pay your $${activeCollege.applicationFee} application fee via PayPal to finalize submission.` 
                    : `Your GPA (3.92) is highly competitive for ${activeCollege.name}. Address your missing ${missingDocs.join(', ')} to lock in your eligibility.`
                  }
                </p>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => setActiveSection('assistant')}
                  className="w-full py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  id="btn-consult-ai-requirements"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#006A6A] dark:text-teal-400" />
                  Consult AI Counselor for {activeCollege.name}
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
