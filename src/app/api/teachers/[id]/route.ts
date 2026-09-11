import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: params.id },
      include: {
        department: true,
        courseOfferings: {
          include: {
            subject: {
              include: {
                department: true,
                semester: true,
              },
            },
            academicYear: true,
            assessmentPattern: {
              include: {
                components: true,
              },
            },
            questionPapers: {
              where: { status: 'APPROVED' },
              include: {
                paperTags: {
                  include: { tag: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json({ teacher });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
