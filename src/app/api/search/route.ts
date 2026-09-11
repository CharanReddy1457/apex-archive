import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() || '';
    const dept = searchParams.get('dept') || '';
    const sem = searchParams.get('sem') || '';
    const teacherId = searchParams.get('teacher') || '';
    const year = searchParams.get('year') || '';
    const assessment = searchParams.get('assessment') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '12', 10)));
    const skip = (page - 1) * limit;

    // Build Prisma query condition
    const whereConditions: any = {
      status: 'APPROVED',
    };

    // Filter by department
    if (dept && dept !== 'All') {
      whereConditions.courseOffering = {
        ...whereConditions.courseOffering,
        subject: {
          ...whereConditions.courseOffering?.subject,
          department: { code: dept },
        },
      };
    }

    // Filter by semester
    if (sem && sem !== 'All') {
      const semNumber = parseInt(sem, 10);
      if (!isNaN(semNumber)) {
        whereConditions.courseOffering = {
          ...whereConditions.courseOffering,
          subject: {
            ...whereConditions.courseOffering?.subject,
            semester: { number: semNumber },
          },
        };
      }
    }

    // Filter by teacher
    if (teacherId && teacherId !== 'All') {
      whereConditions.courseOffering = {
        ...whereConditions.courseOffering,
        teacherId,
      };
    }

    // Filter by academic year
    if (year && year !== 'All') {
      whereConditions.courseOffering = {
        ...whereConditions.courseOffering,
        academicYear: { label: year },
      };
    }

    // Filter by assessment type
    if (assessment && assessment !== 'All') {
      whereConditions.assessmentType = {
        contains: assessment,
      };
    }

    // Global multi-token search query
    if (query) {
      const tokens = query.split(/\s+/).filter(Boolean);
      
      whereConditions.AND = tokens.map((token) => ({
        OR: [
          { title: { contains: token } },
          { assessmentType: { contains: token } },
          {
            courseOffering: {
              subject: {
                OR: [
                  { name: { contains: token } },
                  { code: { contains: token } },
                  { description: { contains: token } },
                ],
              },
            },
          },
          {
            courseOffering: {
              teacher: {
                name: { contains: token },
              },
            },
          },
          {
            courseOffering: {
              academicYear: {
                label: { contains: token },
              },
            },
          },
          {
            paperTags: {
              some: {
                tag: {
                  name: { contains: token.replace('#', '') },
                },
              },
            },
          },
        ],
      }));
    }

    // Execute queries with count
    const [total, papers] = await Promise.all([
      prisma.questionPaper.count({ where: whereConditions }),
      prisma.questionPaper.findMany({
        where: whereConditions,
        include: {
          courseOffering: {
            include: {
              subject: {
                include: {
                  department: true,
                  semester: true,
                },
              },
              teacher: true,
              academicYear: true,
            },
          },
          paperTags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
    ]);

    // Format results
    const formattedPapers = papers.map((p) => ({
      id: p.id,
      courseOfferingId: p.courseOfferingId,
      assessmentType: p.assessmentType,
      title: p.title,
      examDate: p.examDate,
      maxMarks: p.maxMarks,
      durationMinutes: p.durationMinutes,
      fileUrl: p.fileUrl,
      fileName: p.fileName,
      fileSize: p.fileSize,
      pageCount: p.pageCount,
      answerKeyUrl: p.answerKeyUrl,
      solutionNotes: p.solutionNotes,
      status: p.status,
      uploadedById: p.uploadedById,
      createdAt: p.createdAt.toISOString(),
      courseOffering: {
        id: p.courseOffering.id,
        subject: {
          id: p.courseOffering.subject.id,
          code: p.courseOffering.subject.code,
          name: p.courseOffering.subject.name,
          credits: p.courseOffering.subject.credits,
          departmentId: p.courseOffering.subject.departmentId,
          semesterId: p.courseOffering.subject.semesterId,
          department: p.courseOffering.subject.department,
          semester: p.courseOffering.subject.semester,
        },
        teacher: p.courseOffering.teacher,
        academicYear: p.courseOffering.academicYear,
      },
      tags: p.paperTags.map((pt) => pt.tag.name),
    }));

    return NextResponse.json({
      papers: formattedPapers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to perform search' }, { status: 500 });
  }
}
