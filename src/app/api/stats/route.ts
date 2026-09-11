import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const [
      totalPapers,
      totalSubjects,
      totalTeachers,
      totalOfferings,
      departments,
      recentPapers,
      subjectsWithCount,
    ] = await Promise.all([
      prisma.questionPaper.count({ where: { status: 'APPROVED' } }),
      prisma.subject.count(),
      prisma.teacher.count(),
      prisma.courseOffering.count(),
      prisma.department.findMany({
        include: {
          _count: { select: { subjects: true, teachers: true } },
        },
      }),
      prisma.questionPaper.findMany({
        where: { status: 'APPROVED' },
        include: {
          courseOffering: {
            include: {
              subject: true,
              teacher: true,
              academicYear: true,
            },
          },
          paperTags: { include: { tag: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      prisma.subject.findMany({
        include: {
          department: true,
          semester: true,
          courseOfferings: {
            include: {
              questionPapers: { where: { status: 'APPROVED' } },
            },
          },
        },
        take: 8,
      }),
    ]);

    const formattedRecentPapers = recentPapers.map((p) => ({
      id: p.id,
      assessmentType: p.assessmentType,
      title: p.title,
      maxMarks: p.maxMarks,
      durationMinutes: p.durationMinutes,
      fileUrl: p.fileUrl,
      fileName: p.fileName,
      fileSize: p.fileSize,
      createdAt: p.createdAt.toISOString(),
      courseOffering: {
        id: p.courseOffering.id,
        subject: p.courseOffering.subject,
        teacher: p.courseOffering.teacher,
        academicYear: p.courseOffering.academicYear,
      },
      tags: p.paperTags.map((pt) => pt.tag.name),
    }));

    const formattedPopularSubjects = subjectsWithCount.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      department: s.department,
      semester: s.semester,
      credits: s.credits,
      papersCount: s.courseOfferings.reduce((sum, co) => sum + co.questionPapers.length, 0),
    })).sort((a, b) => b.papersCount - a.papersCount);

    return NextResponse.json({
      stats: {
        totalPapers,
        totalSubjects,
        totalTeachers,
        totalOfferings,
      },
      departments,
      recentPapers: formattedRecentPapers,
      popularSubjects: formattedPopularSubjects,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
