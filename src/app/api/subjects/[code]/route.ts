import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code.toUpperCase();

    const subject = await prisma.subject.findUnique({
      where: { code },
      include: {
        department: true,
        semester: true,
        courseOfferings: {
          include: {
            teacher: true,
            academicYear: true,
            assessmentPattern: {
              include: {
                components: {
                  orderBy: { order: 'asc' },
                },
              },
            },
            questionPapers: {
              where: { status: 'APPROVED' },
              include: {
                paperTags: {
                  include: { tag: true },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    let parsedUnits = [];
    if (subject.syllabusUnits) {
      try {
        parsedUnits = JSON.parse(subject.syllabusUnits);
      } catch {
        parsedUnits = [];
      }
    }

    return NextResponse.json({
      subject: {
        ...subject,
        syllabusUnits: parsedUnits,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const code = params.code.toUpperCase();
    await prisma.subject.delete({
      where: { code },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
