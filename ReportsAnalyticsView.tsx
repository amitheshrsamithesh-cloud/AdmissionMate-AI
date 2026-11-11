import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  PieChart, 
  Hourglass,
  ArrowDownToLine,
  HelpCircle,
  Award
} from 'lucide-react';
import { Document, College, TimelineStage } from '../types';

interface ReportsAnalyticsViewProps {
  documents: Document[];
  colleges: College[];
  timeline: TimelineStage[];
}

export default function ReportsAnalyticsView({
  documents,
  colleges,
  timeline
}: ReportsAnalyticsViewProps) {
  
  const [downloading, setDownloading] = useState<string | null>(null);

  const verifiedCount = documents.filter(doc => doc.verificationStatus === 'Verified').length;
  const pendingCount = documents.filter(doc => doc.verificationStatus === 'Pending').length;
  const missingCount = 11 - (verifiedCount + pendingCount);

  // Download trigger simulator
  const handleDownloadReport = (reportName: string) => {
    setDownloading(reportName);
    setTimeout(() => {
      setDownloading(null);
      // Create and download a simple mock TXT summary report for Rahul Kumar
      const fileContent = `=========================================
ADMISSIONMATE AI - EXECUTIVE DECISION REPORT
=========================================
Report: ${reportName}
Generated On: ${new Date().toISOString().split('T')[0]}
Student: Rahul Kumar
Course Interest: Computer Science
Target University: Stanford University

ACADEMIC FIT DETAILS:
- GPA: 3.92 / 4.0 (95.0%)
- SAT Score: 1540 / 1600
- 10th Board Transcript: Verified
- 12th Board Transcript: Verified

DOCUMENTS STATUS SUMMARY:
- Verified: ${verifiedCount}
- Pending: ${pendingCount}
- Missing: ${missingCount}

COLLEGE TARGET SPECS:
${colleges.map(c => `- ${c.name} (Deadline: ${c.deadlines.split(',')[0]} | Status: ${c.applicationStatus})`).join('\n')}

VALIDATION FOOTPRINT:
Certified securely on the AdmissionMate AI Platform.
=========================================`;
      
      const blob = new Blob([fileContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportName.toLowerCase().replace(/\s+/g, "_")}_summary.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* 2x2 Bento Grid of Analytics Reports & Beautiful SVG Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Admission Readiness Report & Trends */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-[#006A6A]" />
              Readiness Performance Trends
            </h3>
            
            <button 
              onClick={() => handleDownloadReport("Admission Readiness Report")}
              disabled={downloading !== null}
              className="text-xs text-[#006A6A] hover:underline font-bold flex items-center gap-1 disabled:opacity-50"
              id="btn-dl-readiness"
            >
              {downloading === "Admission Readiness Report" ? (
                <Hourglass className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ArrowDownToLine className="h-3.5 w-3.5" />
              )}
              Export
            </button>
          </div>

          <p className="text-xs text-slate-400">Weekly evaluation logs detailing your total completion score compared to peer averages for selective Computer Science admissions.</p>

          {/* Pure Beautiful SVG line graph */}
          <div className="h-48 flex items-end justify-between relative pt-6 bg-slate-50/50 rounded-xl p-4">
            <div className="absolute top-2 left-4 text-[10px] text-slate-400 font-mono">Platform Readiness % Index</div>
            
            <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="30" x2="400" y2="30" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="75" x2="400" y2="75" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="120" x2="400" y2="120" stroke="#F1F5F9" strokeWidth="1" />
              
              {/* Peer Average line (dashed line) */}
              <path d="M 0,90 Q 100,85 200,82 T 400,80" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4" />
              
              {/* Student progress line */}
              <path d="M 0,130 Q 100,100 200,60 T 400,35" fill="none" stroke="#006A6A" strokeWidth="3" strokeLinecap="round" />
              
              {/* Highlight Nodes */}
              <circle cx="200" cy="60" r="4" fill="#006A6A" stroke="white" strokeWidth="2" />
              <circle cx="400" cy="35" r="4.5" fill="#6750A4" stroke="white" strokeWidth="2.5" />
            </svg>

            {/* Labels below chart */}
            <div className="absolute bottom-2 left-0 right-0 px-4 flex justify-between text-[9px] font-mono font-bold text-slate-400">
              <span>Week 1 (Profile)</span>
              <span>Week 2 (Uploads)</span>
              <span>Week 3 (Verifications)</span>
              <span>Current (Ready: 78%)</span>
            </div>
          </div>

          <div className="flex gap-4 justify-center text-xs font-semibold text-slate-500 pt-2">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#006A6A]" />
              <span>Your Profile Score</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-slate-300" />
              <span>National CS Average</span>
            </div>
          </div>
        </div>

        {/* Document Completion Report & Charts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="h-4.5 w-4.5 text-[#6750A4]" />
              Document Verification Share
            </h3>
            
            <button 
              onClick={() => handleDownloadReport("Document Completion Report")}
              disabled={downloading !== null}
              className="text-xs text-[#006A6A] hover:underline font-bold flex items-center gap-1 disabled:opacity-50"
              id="btn-dl-docs"
            >
              {downloading === "Document Completion Report" ? (
                <Hourglass className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ArrowDownToLine className="h-3.5 w-3.5" />
              )}
              Export
            </button>
          </div>

          <p className="text-xs text-slate-400">Proportion of your necessary document types cataloged in terms of verification cycles (Total: 11 categories).</p>

          {/* Bar completion graph */}
          <div className="space-y-3.5 pt-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Verified Assets (10th/12th/Aadhaar)</span>
                <span>{verifiedCount} files</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${(verifiedCount/11)*100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Pending Extracted Sheets (Income/Community)</span>
                <span>{pendingCount} files</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: `${(pendingCount/11)*100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Missing/Required Packs (SOP/LOR/Essays)</span>
                <span>{missingCount} files</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-red-400 h-full" style={{ width: `${(missingCount/11)*100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* College Comparison Report Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-4.5 w-4.5 text-[#006A6A]" />
              College Comparison & Deadlines
            </h3>
            
            <button 
              onClick={() => handleDownloadReport("College Comparison Report")}
              disabled={downloading !== null}
              className="text-xs text-[#006A6A] hover:underline font-bold flex items-center gap-1 disabled:opacity-50"
              id="btn-dl-compare"
            >
              {downloading === "College Comparison Report" ? (
                <Hourglass className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ArrowDownToLine className="h-3.5 w-3.5" />
              )}
              Export
            </button>
          </div>

          <p className="text-xs text-slate-400">Summarized checklist and target milestones for your primary universities.</p>

          <div className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
            {colleges.map((col, i) => (
              <div key={i} className="py-2.5 flex justify-between items-center">
                <span>{col.name}</span>
                <span className="font-bold text-slate-800">{col.deadlines.split('(')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Eligibility Analysis Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-4.5 w-4.5 text-indigo-500" />
                Eligibility Verification Footprint
              </h3>
              
              <button 
                onClick={() => handleDownloadReport("Eligibility Analysis Report")}
                disabled={downloading !== null}
                className="text-xs text-[#006A6A] hover:underline font-bold flex items-center gap-1 disabled:opacity-50"
                id="btn-dl-eligibility"
              >
                {downloading === "Eligibility Analysis Report" ? (
                  <Hourglass className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowDownToLine className="h-3.5 w-3.5" />
                )}
                Export
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">A complete validation of student academic requirements checked by Gemini OCR matching boards.</p>

            <ul className="space-y-2 text-xs font-semibold text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                <span>GPA Score verified (3.92 / 4.0) matches CBSE Board grading standards perfectly.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                <span>SAT Score verified (1540 / 1600) via College Board ledger records.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                <span>Core STEM requisites verified: Physics (96%), Computer Science (100%).</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <span className="inline-flex items-center gap-1 text-[10px] bg-slate-50 border border-slate-150 px-2 py-1 rounded-full text-slate-500 font-mono font-bold uppercase">
              <ShieldCheck className="h-3.5 w-3.5 text-[#006A6A]" /> Verified on platform sandbox
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
