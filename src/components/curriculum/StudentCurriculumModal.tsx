'use client';

import Modal from '@/components/ui/Modal';
import StudentSyllabusProgress from './StudentSyllabusProgress';
import { Attendance } from '@/types';
import { User as UserType } from '@/types';

interface StudentCurriculumModalProps {
  student: UserType | null;
  attendance: Attendance[];
  onClose: () => void;
}

/**
 * Full session-by-session drilldown for one student:
 * every software in their course, every session, color-coded status.
 */
export default function StudentCurriculumModal({
  student,
  attendance,
  onClose,
}: StudentCurriculumModalProps) {
  if (!student) return null;

  return (
    <Modal
      isOpen={!!student}
      onClose={onClose}
      title={`Curriculum Tracker — ${student.name}`}
      size="2xl"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-emerald-50/70 rounded-xl text-xs">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center text-white font-bold">
            {student.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{student.name}</p>
            <p className="font-mono text-emerald-700">{student.studentId || 'MAAC-STU'}</p>
            <p className="text-gray-600">
              {student.course || 'No course'} • Status: {student.studentStatus || 'Active'}
            </p>
          </div>
        </div>

        <StudentSyllabusProgress
          studentId={student.id}
          courseName={student.course}
          attendance={attendance}
        />
      </div>
    </Modal>
  );
}
