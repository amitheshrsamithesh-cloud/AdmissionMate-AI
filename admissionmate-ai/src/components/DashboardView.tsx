import React from 'react';
import { 
  FileText, 
  FileCheck2, 
  AlertTriangle, 
  Hourglass, 
  GraduationCap, 
  Calendar, 
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Building2,
  Receipt
} from 'lucide-react';
import { Document, College, TimelineStage, StudentProfile, PaymentRecord } from '../types';
import { calculateReadinessScore } from '../utils/readiness';

interface DashboardViewProps {
  documents: Document[];
  colleges: College[];
  timeline: TimelineStage[];
  student: StudentProfile;
  payments: PaymentRecord[];
  setActiveSection: (section: string) => void;
}

export default function DashboardView({
  documents,
  colleges,
  timeline,
  student,
  payments,
  setActiveSection,
}: DashboardViewProps) {
  
  // Document status counters
  const uploadedCount = documents.filter(doc => doc.verificationStatus !== 'Missing').length;
  const verifiedCount = documents.filter(doc => doc.verificationStatus === 'Verified').length;
  const pendingCount = documents.filter(doc => doc.verificationStatus === 'Pending').length;
  const missingCount = Math.max(0, 11 - uploadedCount);

  // Application stats
  const collegeCount = colleges.length;
  const submittedCount = colleges.filter(col => col.applicationStatus === 'Submitted' || col.applicationStatus === 'Accepted').length;
  const inProgressCount = colleges.filter(col => col.applicationStatus === 'In Progress').length;
  const completedTasks = timeline.filter(t => t.status === 'Completed').length;
  const totalTasks = timeline.length;

  // Primary target college (e.g. Stanford)
  const targetCollege = colleges.find(c => c.name.toLowerCase().includes('stanford')) || colleges[0];

  // Calculate Transparent Admission Readiness Score
  const readiness = calculateReadinessScore(student, targetCollege, documents, timeline);

  const getReadinessColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 70) return 'text-teal-600 dark:text-teal-400';
    if (score >= 50) return 'text-amber-500 dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
  };

  const getReadinessStatus = (score: number) => {
    if (score >= 90) return 'Outstanding! Highly Ready';
    if (score >= 75) return 'Strong Admission Candidate';
    if (score >= 50) return 'Missing Core Requirements';
    return 'Action Required';
  };

  // Fees calculation
  const totalFeesPaid = payments.reduce((sum, p) => sum + (p.status === 'COMPLETED' ? p.amount : 0), 0);
  const unpaidColleges = colleges.filter(c => !c.feePaid);

  return (
    <div className="space-y-6">
      
      {/* 4-Column Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3.5 bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-teal-400 rounded-xl">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Target Colleges</p>
            <p className="text-2xl font-display font-bold text-slate-800 dark:text-white mt-1">{collegeCount}</p>
            <p className="text-xs text-[#006A6A] dark:text-teal-400 font-medium mt-0.5">
              Primary: {student.university}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Applications Submitted</p>
            <p className="text-2xl font-display font-bold text-slate-800 dark:text-white mt-1">{submittedCount}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              {inProgressCount} in progress
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3.5 bg-teal-50 dark:bg-[#006A6A]/20 text-[#006A6A] dark:text-teal-400 rounded-xl">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Application Fees (PayPal)</p>
            <p className="text-2xl font-display font-bold text-slate-800 dark:text-white mt-1">
              ${totalFeesPaid.toFixed(0)} <span className="text-xs font-normal text-slate-400">USD</span>
            </p>
            <p className="text-xs text-[#006A6A] dark:text-teal-400 font-medium mt-0.5">
              {unpaidColleges.length} unpaid pending
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-xl">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Upcoming Deadline</p>
            <p className="text-2xl font-display font-bold text-slate-800 dark:text-white mt-1">Nov 1</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">
              Stanford Early Decision
            </p>
          </div>
        </div>

      </div>

      {/* Main Grid: Readiness Score Gauge & Document Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Admission Readiness Gauge */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-5 flex flex-col items-center text-center justify-between">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider font-display">
                Admission Readiness Score
              </h2>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                Target: {targetCollege?.name}
              </span>
            </div>
            <div className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          
          <div className="py-4 relative flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-44 h-44">
              <circle 
                className="text-slate-100 dark:text-slate-800" 
                strokeWidth="12" 
                stroke="currentColor" 
                fill="transparent" 
                r="74" 
                cx="88" 
                cy="88" 
              />
              <circle 
                className="text-[#006A6A] dark:text-teal-400 transition-all duration-1000 ease-out" 
                strokeWidth="12" 
                strokeDasharray={2 * Math.PI * 74}
                strokeDashoffset={2 * Math.PI * 74 * (1 - readiness.overallScore / 100)}
                strokeLinecap="round" 
                stroke="currentColor" 
                fill="transparent" 
                r="74" 
                cx="88" 
                cy="88" 
                transform="rotate(-90 88 88)"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-display font-black text-slate-800 dark:text-white">
                {readiness.overallScore}%
              </span>
              <span className={`text-xs font-semibold mt-1 tracking-wide ${getReadinessColor(readiness.overallScore)}`}>
                {getReadinessStatus(readiness.overallScore)}
              </span>
            </div>
          </div>

          {/* Factor Breakdown */}
          <div className="w-full space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Required Documents:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-white">{readiness.documentsScore} / 40 pts</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#006A6A] h-full rounded-full" style={{ width: `${(readiness.documentsScore / 40) * 100}%` }}></div>
            </div>

            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Academic Match (GPA & SAT):</span>
              <span className="font-mono font-bold text-slate-800 dark:text-white">{readiness.eligibilityScore} / 30 pts</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-teal-500 h-full rounded-full" style={{ width: `${(readiness.eligibilityScore / 30) * 100}%` }}></div>
            </div>

            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Application Fee (PayPal):</span>
              <span className="font-mono font-bold text-slate-800 dark:text-white">{readiness.feeScore} / 15 pts</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(readiness.feeScore / 15) * 100}%` }}></div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl w-full text-left mt-3">
            <div className="flex gap-2 items-start">
              <TrendingUp className="h-4 w-4 text-[#006A6A] dark:text-teal-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">Recommended Next Step</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {readiness.recommendedSteps[0]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Document Summary Cards */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider font-display">
                  Document Audit & Integrity Summary
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Cryptographic SHA-256 verification and AI classification status
                </p>
              </div>
              <button 
                onClick={() => setActiveSection('vault')}
                className="text-xs text-[#006A6A] dark:text-teal-400 font-bold hover:underline flex items-center gap-1"
                id="btn-goto-vault"
              >
                Open Vault <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50/60 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900 flex items-start gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-lg shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Uploaded</p>
                  <p className="text-xl font-display font-bold text-slate-800 dark:text-white mt-1">{uploadedCount}</p>
                  <p className="text-[10px] text-blue-700 dark:text-blue-400 mt-0.5">Stored in Vault</p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900 flex items-start gap-3">
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 rounded-lg shrink-0">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">AI Validated</p>
                  <p className="text-xl font-display font-bold text-slate-800 dark:text-white mt-1">{verifiedCount}</p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">Credentials matched</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900 flex items-start gap-3">
                <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded-lg shrink-0">
                  <Hourglass className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Review</p>
                  <p className="text-xl font-display font-bold text-slate-800 dark:text-white mt-1">{pendingCount}</p>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">Awaiting OCR check</p>
                </div>
              </div>

              <div className="p-4 bg-red-50/60 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900 flex items-start gap-3">
                <div className="p-2.5 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 rounded-lg shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Missing for Target</p>
                  <p className="text-xl font-display font-bold text-slate-800 dark:text-white mt-1">{readiness.missingDocs.length}</p>
                  <p className="text-[10px] text-red-700 dark:text-red-400 mt-0.5">
                    {readiness.missingDocs[0] || 'All uploaded'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 border border-teal-100 dark:border-[#006A6A]/30 bg-teal-50/40 dark:bg-[#006A6A]/10 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-[#006A6A] dark:text-teal-400" />
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Verify pending marksheets with Gemini 3.8 Flash OCR to raise your readiness score.
              </p>
            </div>
            <button 
              onClick={() => setActiveSection('ocr')}
              className="text-xs px-3 py-1.5 bg-[#006A6A] hover:bg-[#005151] text-white font-bold rounded-lg transition-colors"
              id="btn-goto-ocr"
            >
              Verify Now
            </button>
          </div>
        </div>
      </div>

      {/* Application Fee Payment Status (PayPal Sandbox) Widget */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-lg">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider font-display">
                College Application Fee Status (PayPal Sandbox)
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Official processing fees required by university admission offices
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveSection('payments')}
            className="flex items-center gap-1 text-xs font-bold text-white bg-[#006A6A] hover:bg-[#005151] px-4 py-2 rounded-xl shadow-sm transition"
          >
            <span>Pay Fee via PayPal</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {colleges.slice(0, 3).map((col) => (
            <div
              key={col.id}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between"
            >
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-xs">{col.name}</h4>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                  Fee: ${col.applicationFee}.00 USD
                </p>
              </div>
              {col.feePaid ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                  <CheckCircle className="h-3 w-3" /> Paid
                </span>
              ) : (
                <button
                  onClick={() => setActiveSection('payments')}
                  className="text-[11px] font-bold text-[#006A6A] dark:text-teal-400 hover:underline"
                >
                  Pay Now →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
