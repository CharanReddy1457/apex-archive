import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20', 10));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const skip = (page - 1) * limit;
    const status = searchParams.get('status') || 'APPROVED';

    const [total, papers] = await Promise.all([
      prisma.questionPaper.count({ where: { status } }),
      prisma.questionPaper.findMany({
        where: { status },
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const formatted = papers.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      tags: p.paperTags.map((pt) => pt.tag.name),
    }));

    return NextResponse.json({
      papers: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'CONTRIBUTOR')) {
      return NextResponse.json({ error: 'Unauthorized. Login as Admin or Contributor.' }, { status: 403 });
    }

    const body = await req.json();
    const {
      courseOfferingId,
      assessmentType,
      title,
      examDate,
      maxMarks,
      durationMinutes,
      fileUrl,
      fileName,
      fileSize,
      pageCount,
      solutionNotes,
      answerKeyUrl,
      tags = [],
    } = body;

    if (!courseOfferingId || !assessmentType || !title || !fileUrl) {
      return NextResponse.json({ error: 'Missing required paper fields' }, { status: 400 });
    }

    // Determine status based on role
    const status = user.role === 'ADMIN' ? 'APPROVED' : 'PENDING_REVIEW';

    const paper = await prisma.questionPaper.create({
      data: {
        courseOfferingId,
        assessmentType,
        title,
        examDate: examDate || null,
        maxMarks: parseInt(maxMarks || '100', 10),
        durationMinutes: parseInt(durationMinutes || '120', 10),
        fileUrl,
        fileName: fileName || 'question_paper.pdf',
        fileSize: parseInt(fileSize || '0', 10),
        pageCount: parseInt(pageCount || '1', 10),
        solutionNotes,
        answerKeyUrl,
        status,
        uploadedById: user.id,
      },
    });

    // Process tags
    if (Array.isArray(tags) && tags.length > 0) {
      for (const rawTag of tags) {
        const cleanName = rawTag.toLowerCase().replace(/[^a-z0-9-_]/g, '').trim();
        if (!cleanName) continue;

        const tag = await prisma.tag.upsert({
          where: { name: cleanName },
          update: {},
          create: { name: cleanName },
        });

        await prisma.paperTag.create({
          data: {
            paperId: paper.id,
            tagId: tag.id,
          },
        }).catch(() => {});
      }
    }

    return NextResponse.json({ paper, message: status === 'APPROVED' ? 'Paper published' : 'Paper submitted for admin approval' }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
