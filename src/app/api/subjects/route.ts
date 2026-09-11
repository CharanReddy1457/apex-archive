import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dept = searchParams.get('dept');
    const sem = searchParams.get('sem');

    const where: any = {};
    if (dept && dept !== 'All') {
      where.department = { code: dept };
    }
    if (sem && sem !== 'All') {
      const semNumber = parseInt(sem, 10);
      if (!isNaN(semNumber)) {
        where.semester = { number: semNumber };
      }
    }

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        department: true,
        semester: true,
        courseOfferings: {
          include: {
            questionPapers: {
              where: { status: 'APPROVED' },
              select: { id: true },
            },
            teacher: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    const formatted = subjects.map((s) => {
      const papersCount = s.courseOfferings.reduce(
        (sum, co) => sum + co.questionPapers.length,
        0
      );
      const uniqueTeachers = new Set(s.courseOfferings.map((co) => co.teacherId));

      return {
        id: s.id,
        code: s.code,
        name: s.name,
        departmentId: s.departmentId,
        semesterId: s.semesterId,
        credits: s.credits,
        description: s.description,
        coordinator: s.coordinator,
        department: s.department,
        semester: s.semester,
        papersCount,
        teachersCount: uniqueTeachers.size,
      };
    });

    return NextResponse.json({ subjects: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { code, name, departmentId, semesterId, credits, description, coordinator, fullSyllabus, syllabusUnits } = body;

    if (!code || !name || !departmentId || !semesterId) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const subject = await prisma.subject.create({
      data: {
        code: code.toUpperCase().trim(),
        name,
        departmentId,
        semesterId,
        credits: parseInt(credits || '4', 10),
        description,
        coordinator,
        fullSyllabus,
        syllabusUnits: syllabusUnits ? JSON.stringify(syllabusUnits) : null,
      },
      include: {
        department: true,
        semester: true,
      },
    });

    return NextResponse.json({ subject }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
