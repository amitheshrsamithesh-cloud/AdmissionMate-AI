import React from 'react';
import { 
  CheckCircle2, 
  Hourglass, 
  Circle, 
  Sparkles,
  CalendarDays,
  Play
} from 'lucide-react';
import { TimelineStage } from '../types';

interface AdmissionTimelineViewProps {
  timeline: TimelineStage[];
  onToggleStage: (id: number) => void;
}

export default function AdmissionTimelineView({
  timeline,
  onToggleStage
}: AdmissionTimelineViewProps) {
  
  const getStatusIcon = (status: TimelineStage['status']) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="h-6 w-6 text-emerald-500 bg-white rounded-full shrink-0" />;
      case 'In Progress':
        return <Hourglass className="h-6 w-6 text-amber-500 bg-white rounded-full animate-spin shrink-0" />;
      default:
        return <Circle className="h-6 w-6 text-slate-300 bg-white rounded-full shrink-0" />;
    }
  };

  const getStatusColor = (status: TimelineStage['status']) => {
    switch (status) {
      case 'Completed':
        return 'border-emerald-500 bg-emerald-50 text-emerald-800';
      case 'In Progress':
        return 'border-amber-500 bg-amber-50 text-amber-800';
      default:
        return 'border-slate-200 bg-white text-slate-400';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Timeline flow chart */}
      <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-display font-bold text-slate-800 tracking-tight">Interactive Milestone Roadmap</h2>
          <p className="text-xs text-slate-400 mt-1">Configure admission checkpoints below to synchronize with college systems. Click a checkpoint state button to mark tasks completed.</p>
        </div>

        <div className="relative pl-6 space-y-8 before:absolute before:top-4 before:bottom-4 before:left-3 before:w-0.5 before:bg-slate-100">
          {timeline.map((stage) => {
            const isCompleted = stage.status === 'Completed';
            const isInProgress = stage.status === 'In Progress';
            
            return (
              <div key={stage.id} className="relative flex gap-4 items-start">
                {/* Dot Icon indicator overlaying line */}
                <div className="absolute -left-[29px] z-10">
                  {getStatusIcon(stage.status)}
                </div>

                {/* Content Box */}
                <div className={`flex-1 p-4 rounded-xl border transition-all ${
                  isCompleted 
                    ? 'border-emerald-100 bg-emerald-50/20 text-slate-800' 
                    : isInProgress
                    ? 'border-amber-100 bg-amber-50/20 text-slate-800'
                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold flex items-center gap-1.5">
                        <span>Stage {stage.id}: {stage.name}</span>
                        {stage.updatedAt && (
                          <span className="text-[10px] font-mono text-slate-400 font-medium">({stage.updatedAt})</span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{stage.description}</p>
                    </div>

                    <div>
                      <button
                        onClick={() => onToggleStage(stage.id)}
                        className={`text-xs px-3 py-1.5 font-bold rounded-lg border transition-all ${getStatusColor(stage.status)}`}
                        id={`btn-toggle-stage-${stage.id}`}
                      >
                        {stage.status}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Milestones Explanatory Board */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <CalendarDays className="h-5 w-5 text-[#006A6A]" />
            <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider">Timeline Metrics</h3>
          </div>

          <div className="space-y-4 text-xs text-slate-600">
            <div className="flex justify-between font-semibold">
              <span>Overall Milestones:</span>
              <span>{timeline.filter(t => t.status === 'Completed').length} / {timeline.length} Complete</span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${(timeline.filter(t => t.status === 'Completed').length / timeline.length) * 100}%` }}
              />
            </div>

            <p className="leading-relaxed text-slate-400">
              The standard high school admissions roadmap spans 6-12 months. Ensure transcripts (12th Board) are finalized by mid-summer, LOR drafts completed by September, and application submissions completed ahead of individual college Early Decision rules (Nov 1).
            </p>

            <div className="p-4 rounded-xl border border-indigo-50 bg-indigo-50/20 flex gap-2">
              <Sparkles className="h-4.5 w-4.5 text-[#6750A4] shrink-0" />
              <p className="text-[11px] text-slate-600 leading-relaxed">
                <strong>Next Step Priority:</strong> Complete verification for the Income Certificate inside the vault to proceed smoothly to <strong>Eligibility Evaluation</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
