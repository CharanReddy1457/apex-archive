import React from 'react';
import { Users } from 'lucide-react';
import TeacherCard from '@/components/TeacherCard';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function TeachersPage() {
  const teachers = await prisma.teacher.findMany({
    include: {
      department: true,
      courseOfferings: {
        include: {
          questionPapers: { where: { status: 'APPROVED' }, select: { id: true } },
          subject: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  const formattedTeachers = teachers.map((t) => {
    const subjectsCount = new Set(t.courseOfferings.map((co) => co.subjectId)).size;
    const papersCount = t.courseOfferings.reduce(
      (sum, co) => sum + co.questionPapers.length,
      0
    );

    return {
      id: t.id,
      name: t.name,
      title: t.title,
      email: t.email,
      departmentId: t.departmentId,
      bio: t.bio,
      cabin: t.cabin,
      avatar: t.avatar,
      department: t.department,
      subjectsCount,
      papersCount,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyber-blue mb-1">
          <Users className="w-4 h-4" />
          <span>FACULTY ROSTER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Academic Faculty Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-cyber-textMuted mt-1">
          View professors, their course offerings, cabin offices, and previous question paper repositories.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {formattedTeachers.map((teacher) => (
          <TeacherCard key={teacher.id} teacher={teacher} />
        ))}
      </div>
    </div>
  );
}
