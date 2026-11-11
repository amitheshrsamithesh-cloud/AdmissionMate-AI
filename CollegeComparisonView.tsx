import React, { useState } from 'react';
import { 
  GitCompare, 
  Check, 
  HelpCircle, 
  DollarSign, 
  Calendar, 
  Sparkles,
  TrendingUp,
  Award
} from 'lucide-react';
import { College } from '../types';

interface CollegeComparisonViewProps {
  colleges: College[];
}

export default function CollegeComparisonView({ colleges }: CollegeComparisonViewProps) {
  // Toggle selection states
  const [selectedColleges, setSelectedColleges] = useState<string[]>(
    colleges.map(c => c.id) // Compare all by default
  );

  const toggleCollegeSelection = (id: string) => {
    setSelectedColleges(prev => {
      if (prev.includes(id)) {
        // Keep at least two checked for comparison
        if (prev.length <= 2) return prev;
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const comparedColleges = colleges.filter(c => selectedColleges.includes(c.id));

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Hard':
        return <span className="px-2 py-1 text-xs font-bold bg-red-50 text-red-700 rounded-lg border border-red-200 uppercase tracking-wide">Highly Selective</span>;
      case 'Medium':
        return <span className="px-2 py-1 text-xs font-bold bg-amber-50 text-amber-700 rounded-lg border border-amber-200 uppercase tracking-wide">Selective</span>;
      default:
        return <span className="px-2 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 uppercase tracking-wide">Standard</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Selector Dashboard Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Toggle Colleges for Comparison</h3>
        <div className="flex flex-wrap gap-3">
          {colleges.map((col) => {
            const isChecked = selectedColleges.includes(col.id);
            return (
              <button
                key={col.id}
                onClick={() => toggleCollegeSelection(col.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${
                  isChecked 
                    ? 'bg-[#006A6A] text-white border-[#006A6A] shadow-md shadow-teal-700/10' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
                id={`btn-toggle-compare-${col.id}`}
              >
                {isChecked && <Check className="h-3.5 w-3.5" />}
                <span>{col.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Specifications Matrix */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-5 px-6 font-display font-bold text-slate-500 text-sm w-1/5">Comparison Matrix</th>
                {comparedColleges.map((col) => (
                  <th key={col.id} className="py-5 px-6 font-display font-bold text-slate-800 text-sm text-center">
                    <span className="block font-extrabold">{col.name}</span>
                    <span className="block text-[10px] text-slate-400 font-mono mt-1 font-semibold uppercase">{col.difficulty} Choice</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              
              {/* Difficulty Row */}
              <tr>
                <td className="py-4 px-6 font-bold text-slate-600 bg-slate-50/10">Admissions Rate</td>
                {comparedColleges.map((col) => (
                  <td key={col.id} className="py-4 px-6 text-center">
                    {getDifficultyBadge(col.difficulty)}
                  </td>
                ))}
              </tr>

              {/* Eligibility Criteria */}
              <tr>
                <td className="py-4 px-6 font-bold text-slate-600 bg-slate-50/10 flex items-start gap-1.5">
                  <Award className="h-4 w-4 text-indigo-500 mt-0.5" />
                  <span>Academic Cut-Offs</span>
                </td>
                {comparedColleges.map((col) => (
                  <td key={col.id} className="py-4 px-6">
                    <div className="bg-slate-50 p-3 rounded-xl text-xs font-semibold text-slate-700 text-center leading-relaxed">
                      {col.eligibility}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Required Documents list */}
              <tr>
                <td className="py-4 px-6 font-bold text-slate-600 bg-slate-50/10">Required Transcripts</td>
                {comparedColleges.map((col) => (
                  <td key={col.id} className="py-4 px-6">
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {col.requiredDocs.map((doc, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-[10px] font-medium bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Tuition Fees */}
              <tr>
                <td className="py-4 px-6 font-bold text-slate-600 bg-slate-50/10 flex items-start gap-1.5">
                  <DollarSign className="h-4 w-4 text-emerald-500 mt-0.5" />
                  <span>Annual Tuition</span>
                </td>
                {comparedColleges.map((col) => (
                  <td key={col.id} className="py-4 px-6 text-center font-bold text-slate-800 font-mono text-sm">
                    {col.fees}
                  </td>
                ))}
              </tr>

              {/* Deadlines */}
              <tr>
                <td className="py-4 px-6 font-bold text-slate-600 bg-slate-50/10 flex items-start gap-1.5">
                  <Calendar className="h-4 w-4 text-amber-500 mt-0.5" />
                  <span>Application Deadlines</span>
                </td>
                {comparedColleges.map((col) => (
                  <td key={col.id} className="py-4 px-6 text-center text-xs font-semibold text-slate-600 leading-relaxed">
                    {col.deadlines}
                  </td>
                ))}
              </tr>

              {/* Application Actions */}
              <tr className="bg-slate-50/20">
                <td className="py-5 px-6 font-bold text-slate-600">Application State</td>
                {comparedColleges.map((col) => {
                  const isApplied = col.applicationStatus === 'Submitted' || col.applicationStatus === 'Accepted';
                  return (
                    <td key={col.id} className="py-5 px-6 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className={`text-xs font-bold uppercase ${isApplied ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {col.applicationStatus}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Recommendation Panel */}
      <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-[#006A6A] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-teal-900">AI Counselor Synthesis</h4>
          <p className="text-xs text-teal-800 mt-1 leading-relaxed">
            Comparing Stanford CS and CMU CS: Both are exceptionally competitive options (Highly Selective). Stanford evaluates with high focus on community leadership and broad extracurricular essays, while CMU puts heavy emphasis on specialized advanced STEM scoring (Physics & Computer Science perfection). Your verified scores meet both thresholds excellently. Ensure you write highly tailored statements of purpose for each.
          </p>
        </div>
      </div>

    </div>
  );
}
