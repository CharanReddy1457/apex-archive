import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseOfferingId = searchParams.get('courseOfferingId');

    if (!courseOfferingId) {
      return NextResponse.json({ error: 'courseOfferingId is required' }, { status: 400 });
    }

    const pattern = await prisma.assessmentPattern.findUnique({
      where: { courseOfferingId },
      include: {
        components: {
          orderBy: { order: 'asc' },
        },
        courseOffering: {
          include: {
            subject: true,
            teacher: true,
            academicYear: true,
          },
        },
      },
    });

    return NextResponse.json({ pattern });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'CONTRIBUTOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { courseOfferingId, totalMarks = 100, note, components = [] } = body;

    if (!courseOfferingId) {
      return NextResponse.json({ error: 'courseOfferingId is required' }, { status: 400 });
    }

    // Upsert AssessmentPattern
    const pattern = await prisma.assessmentPattern.upsert({
      where: { courseOfferingId },
      update: {
        totalMarks: parseInt(totalMarks, 10),
        note,
      },
      create: {
        courseOfferingId,
        totalMarks: parseInt(totalMarks, 10),
        note,
      },
    });

    // Replace components
    await prisma.assessmentComponent.deleteMany({
      where: { assessmentPatternId: pattern.id },
    });

    if (Array.isArray(components) && components.length > 0) {
      await prisma.assessmentComponent.createMany({
        data: components.map((c: any, index: number) => ({
          assessmentPatternId: pattern.id,
          name: c.name || `Component ${index + 1}`,
          type: c.type || 'TEST',
          maxMarks: parseInt(c.maxMarks || '0', 10),
          order: index + 1,
        })),
      });
    }

    const updated = await prisma.assessmentPattern.findUnique({
      where: { id: pattern.id },
      include: {
        components: { orderBy: { order: 'asc' } },
        courseOffering: {
          include: { subject: true, teacher: true, academicYear: true },
        },
      },
    });

    return NextResponse.json({ pattern: updated, message: 'Assessment pattern saved successfully' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
