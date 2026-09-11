import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const [subjects, teachers, papers] = await Promise.all([
    prisma.subject.findMany({ select: { code: true, updatedAt: true } }),
    prisma.teacher.findMany({ select: { id: true, updatedAt: true } }),
    prisma.questionPaper.findMany({ where: { status: 'APPROVED' }, select: { id: true, updatedAt: true } }),
  ]);

  const subjectUrls = subjects.map((s) => ({
    url: `${baseUrl}/subjects/${s.code}`,
    lastModified: s.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const teacherUrls = teachers.map((t) => ({
    url: `${baseUrl}/teachers/${t.id}`,
    lastModified: t.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const paperUrls = papers.map((p) => ({
    url: `${baseUrl}/papers/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    { url: `${baseUrl}`, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/search`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/subjects`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/papers`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/teachers`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/compare`, lastModified: new Date(), priority: 0.8 },
    ...subjectUrls,
    ...teacherUrls,
    ...paperUrls,
  ];
}
