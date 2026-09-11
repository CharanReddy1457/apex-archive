import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paper = await prisma.questionPaper.findUnique({
      where: { id: params.id },
      include: {
        courseOffering: {
          include: {
            subject: {
              include: { department: true, semester: true },
            },
            teacher: true,
            academicYear: true,
          },
        },
        paperTags: {
          include: { tag: true },
        },
        uploadedBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    // Check if current user has bookmarked this paper
    const user = await getCurrentUser();
    let isBookmarked = false;
    if (user) {
      const bm = await prisma.bookmark.findFirst({
        where: { userId: user.id, paperId: paper.id },
      });
      isBookmarked = !!bm;
    }

    return NextResponse.json({
      paper: {
        ...paper,
        createdAt: paper.createdAt.toISOString(),
        tags: paper.paperTags.map((pt) => pt.tag.name),
        isBookmarked,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'CONTRIBUTOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { title, maxMarks, durationMinutes, solutionNotes, status, assessmentType } = body;

    const updated = await prisma.questionPaper.update({
      where: { id: params.id },
      data: {
        ...(title ? { title } : {}),
        ...(maxMarks ? { maxMarks: parseInt(maxMarks, 10) } : {}),
        ...(durationMinutes ? { durationMinutes: parseInt(durationMinutes, 10) } : {}),
        ...(solutionNotes !== undefined ? { solutionNotes } : {}),
        ...(status && user.role === 'ADMIN' ? { status } : {}),
        ...(assessmentType ? { assessmentType } : {}),
      },
    });

    return NextResponse.json({ paper: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Only admins can delete papers.' }, { status: 403 });
    }

    await prisma.questionPaper.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
