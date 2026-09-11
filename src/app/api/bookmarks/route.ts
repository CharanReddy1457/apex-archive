import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ bookmarks: [] });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      include: {
        paper: {
          include: {
            courseOffering: {
              include: {
                subject: true,
                teacher: true,
                academicYear: true,
              },
            },
            paperTags: {
              include: { tag: true },
            },
          },
        },
        subject: {
          include: {
            department: true,
            semester: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedPapers = bookmarks
      .filter((b) => b.paper)
      .map((b) => ({
        ...b.paper,
        createdAt: b.paper!.createdAt.toISOString(),
        tags: b.paper!.paperTags.map((pt) => pt.tag.name),
        isBookmarked: true,
      }));

    const formattedSubjects = bookmarks
      .filter((b) => b.subject)
      .map((b) => b.subject);

    return NextResponse.json({
      papers: formattedPapers,
      subjects: formattedSubjects,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to save bookmarks' }, { status: 401 });
    }

    const { paperId, subjectId, action = 'toggle' } = await req.json();

    if (!paperId && !subjectId) {
      return NextResponse.json({ error: 'paperId or subjectId required' }, { status: 400 });
    }

    const existing = await prisma.bookmark.findFirst({
      where: {
        userId: user.id,
        ...(paperId ? { paperId } : {}),
        ...(subjectId ? { subjectId } : {}),
      },
    });

    if (existing) {
      if (action === 'remove' || action === 'toggle') {
        await prisma.bookmark.delete({ where: { id: existing.id } });
        return NextResponse.json({ bookmarked: false });
      }
      return NextResponse.json({ bookmarked: true });
    } else {
      if (action === 'add' || action === 'toggle') {
        await prisma.bookmark.create({
          data: {
            userId: user.id,
            paperId: paperId || null,
            subjectId: subjectId || null,
          },
        });
        return NextResponse.json({ bookmarked: true });
      }
      return NextResponse.json({ bookmarked: false });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
