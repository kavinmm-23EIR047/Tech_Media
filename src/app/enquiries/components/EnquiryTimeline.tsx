/**
 * Interactive Enquiry Activity Timeline & Audit Trail Component
 */

"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Clock,
  Send,
  PlusCircle,
  User,
  Shield,
  Activity,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { TimelineActivity } from "@/features/enquiries/types/enquiry.types";
import { formatDateTime, timeAgo } from "@/features/enquiries/utils/enquiry.utils";
import { Button } from "@/components/ui/Button";

interface EnquiryTimelineProps {
  timeline: TimelineActivity[];
  onAddComment: (comment: string) => Promise<any>;
}

export const EnquiryTimeline: React.FC<EnquiryTimelineProps> = ({
  timeline,
  onAddComment,
}) => {
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(commentText);
      setCommentText("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActivityIcon = (type: TimelineActivity["type"]) => {
    switch (type) {
      case "creation":
        return <PlusCircle className="w-4 h-4 text-violet-600" />;
      case "status_change":
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case "assignment":
        return <User className="w-4 h-4 text-emerald-600" />;
      case "note":
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const getActivityBadgeColor = (type: TimelineActivity["type"]) => {
    switch (type) {
      case "creation":
        return "bg-violet-50 text-violet-700 border-violet-200";
      case "status_change":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "assignment":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "note":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Activity & Audit Timeline</h3>
            <p className="text-xs text-slate-400">History of updates, status changes and internal notes</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          {timeline.length} events
        </span>
      </div>

      {/* Add New Comment / Note Box */}
      <form onSubmit={handleSubmit} className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <MessageSquare className="w-3.5 h-3.5 text-violet-600" />
          <span>Add Internal Note / Follow-up Update</span>
        </div>
        <textarea
          rows={2}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Log customer call notes, quote follow-ups, or internal handover details..."
          className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
        />
        <div className="flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Posting as <span className="font-semibold text-slate-700">Rajesh Kumar</span>
          </div>
          <Button
            type="submit"
            size="sm"
            variant="primary"
            isLoading={isSubmitting}
            disabled={!commentText.trim()}
            leftIcon={<Send className="w-3 h-3" />}
            className="shadow-violet-sm text-xs py-1 px-3 h-8"
          >
            Post Note
          </Button>
        </div>
      </form>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {timeline.map((act) => (
          <div key={act.id} className="relative group">
            {/* Timeline Bullet Dot */}
            <div className="absolute -left-[27px] top-0.5 w-6 h-6 rounded-full bg-white border-2 border-slate-200 group-hover:border-violet-600 flex items-center justify-center transition-colors shadow-2xs">
              {getActivityIcon(act.type)}
            </div>

            {/* Event Card */}
            <div className="bg-slate-50/70 hover:bg-slate-50 rounded-xl p-3.5 border border-slate-200/70 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{act.title}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${getActivityBadgeColor(
                      act.type
                    )}`}
                  >
                    {act.type.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium" title={formatDateTime(act.timestamp)}>
                  {timeAgo(act.timestamp)}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>

              <div className="mt-2 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-400">
                <span>By {act.author} {act.authorRole ? `(${act.authorRole})` : ""}</span>
                <span>{formatDateTime(act.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
