'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, CheckCircle2, XCircle, Clock, CircleDashed } from 'lucide-react';
import { calculateStudentCourseProgress, SoftwareProgressStat } from '@/lib/softwareData';
import { Attendance } from '@/types';

const sessionStatusStyles: Record<string, { badge: string; dot: string; label: string }> = {
  present: { badge: 'bg-emerald-500 text-white', dot: 'bg-emerald-500', label: 'Present' },
  absent: { badge: 'bg-red-500 text-white', dot: 'bg-red-500', label: 'Absent' },
  late: { badge: 'bg-amber-500 text-white', dot: 'bg-amber-500', label: 'Late' },
  pending: { badge: 'bg-gray-200 text-gray-600', dot: 'bg-gray-300', label: 'Pending' },
};

const softwareStatusStyles: Record<SoftwareProgressStat['status'], { chip: string; label: string }> = {
  completed: { chip: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Completed' },
  'in-progress': { chip: 'bg-amber-100 text-amber-800 border-amber-200', label: 'In Progress' },
  pending: { chip: 'bg-gray-100 text-gray-600 border-gray-200', label: 'Upcoming' },
};

interface StudentSyllabusProgressProps {
  studentId: string;
  courseName?: string;
  attendance: Attendance[];
}

export default function StudentSyllabusProgress({
  studentId,
  courseName,
  attendance,
}: StudentSyllabusProgressProps) {
  const [expandedSoftware, setExpandedSoftware] = useState<string | null>(null);

  if (!courseName) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl text-xs text-gray-500 text-center">
        No course enrolled yet — syllabus tracking will appear once a course is assigned.
      </div>
    );
  }

  const report = calculateStudentCourseProgress(studentId, courseName, attendance);

  return (
    <div className="space-y-3">
      {/* Overall course progress header */}
      <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/70 rounded-2xl space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <div>
              <p className="text-sm font-bold text-gray-900">{report.courseName}</p>
              <p className="text-[11px] text-gray-500">
                {report.totalCourseSoftwares} software modules • {report.overallTotalSessions} total sessions
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-purple-700 leading-none">
              {report.overallCompletionPercentage}%
            </p>
            <p className="text-[10px] text-gray-500 font-medium">Course Complete</p>
          </div>
        </div>

        <div className="w-full bg-purple-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all"
            style={{ width: `${report.overallCompletionPercentage}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/80 rounded-xl py-2">
            <p className="text-sm font-bold text-emerald-700">{report.overallAttendedSessions}</p>
            <p className="text-[10px] text-gray-500 font-medium">Attended</p>
          </div>
          <div className="bg-white/80 rounded-xl py-2">
            <p className="text-sm font-bold text-orange-600">{report.overallRemainingSessions}</p>
            <p className="text-[10px] text-gray-500 font-medium">Remaining</p>
          </div>
          <div className="bg-white/80 rounded-xl py-2">
            <p className="text-sm font-bold text-purple-700">
              {report.completedSoftwares}/{report.totalCourseSoftwares}
            </p>
            <p className="text-[10px] text-gray-500 font-medium">Modules Done</p>
          </div>
        </div>
      </div>

      {/* Software-by-software breakdown */}
      <div className="space-y-2">
        {report.softwares.map((sw) => {
          const statusStyle = softwareStatusStyles[sw.status];
          const isExpanded = expandedSoftware === sw.softwareId;

          return (
            <div key={sw.softwareId} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setExpandedSoftware(isExpanded ? null : sw.softwareId)}
                className="w-full text-left p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                    <span className="text-sm font-bold text-gray-900 truncate">{sw.softwareName}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${statusStyle.chip}`}>
                    {statusStyle.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 pl-6">
                  <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        sw.completionRate >= 100
                          ? 'bg-emerald-500'
                          : sw.completionRate > 0
                            ? 'bg-amber-500'
                            : 'bg-gray-300'
                      }`}
                      style={{ width: `${sw.completionRate}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-600 shrink-0">
                    {sw.attendedSessions}/{sw.totalSessions} • {sw.completionRate}%
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 p-3 bg-gray-50/60 space-y-1.5">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Session Breakup — Attendance History
                  </p>
                  {sw.sessions.map((session) => {
                    const style = sessionStatusStyles[session.status] || sessionStatusStyles.pending;
                    return (
                      <div
                        key={session.sessionNumber}
                        className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100"
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white ${style.dot}`}
                        >
                          {session.status === 'present' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : session.status === 'absent' ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : session.status === 'late' ? (
                            <Clock className="w-3.5 h-3.5" />
                          ) : (
                            <CircleDashed className="w-3.5 h-3.5 text-gray-400" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-800 truncate">
                            <span className="font-mono font-bold text-purple-700">S{session.sessionNumber}:</span>{' '}
                            {session.title}
                          </p>
                          {session.date && (
                            <p className="text-[10px] text-gray-400">{session.date}</p>
                          )}
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${style.badge}`}
                        >
                          {style.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
