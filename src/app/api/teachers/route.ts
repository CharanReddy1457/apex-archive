import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dept = searchParams.get('dept');

    const where: any = {};
    if (dept && dept !== 'All') {
      where.department = { code: dept };
    }

    const teachers = await prisma.teacher.findMany({
      where,
      include: {
        department: true,
        courseOfferings: {
          include: {
            subject: true,
            questionPapers: {
              where: { status: 'APPROVED' },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formatted = teachers.map((t) => {
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

    return NextResponse.json({ teachers: formatted });
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
    const { name, title, email, departmentId, bio, cabin, avatar } = body;

    if (!name || !departmentId) {
      return NextResponse.json({ error: 'Name and Department required' }, { status: 400 });
    }

    const teacher = await prisma.teacher.create({
      data: {
        name,
        title: title || 'Professor',
        email,
        departmentId,
        bio,
        cabin,
        avatar,
      },
    });

    return NextResponse.json({ teacher }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
