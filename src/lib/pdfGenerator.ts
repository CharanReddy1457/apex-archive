import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export interface GeneratePdfOptions {
  university?: string;
  department: string;
  subjectCode: string;
  subjectName: string;
  teacherName: string;
  academicYear: string;
  assessmentType: string;
  maxMarks: number;
  durationMinutes: number;
  examDate?: string;
  questions: {
    section: string;
    instructions: string;
    items: { qNum: string; text: string; marks: number }[];
  }[];
  notes?: string;
}

export async function createAcademicExamPdf(options: GeneratePdfOptions): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([595.28, 841.89]); // A4 dimensions
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  // Header Border
  page.drawRectangle({
    x: margin,
    y: y - 80,
    width: width - margin * 2,
    height: 85,
    borderWidth: 1.5,
    borderColor: rgb(0.03, 0.1, 0.24), // #071A3D
    color: rgb(0.96, 0.98, 1.0),
  });

  // University Header
  const title = options.university || 'APEX INSTITUTE OF TECHNOLOGY & SCIENCES (AUTONOMOUS)';
  const titleWidth = helveticaBold.widthOfTextAtSize(title, 12);
  page.drawText(title, {
    x: (width - titleWidth) / 2,
    y: y - 18,
    size: 12,
    font: helveticaBold,
    color: rgb(0.03, 0.1, 0.24),
  });

  const deptText = `DEPARTMENT OF ${options.department.toUpperCase()}`;
  const deptWidth = helvetica.widthOfTextAtSize(deptText, 10);
  page.drawText(deptText, {
    x: (width - deptWidth) / 2,
    y: y - 34,
    size: 10,
    font: helvetica,
    color: rgb(0.1, 0.2, 0.4),
  });

  const assessmentHeader = `${options.assessmentType.toUpperCase()} EXAMINATION • AY ${options.academicYear}`;
  const assessmentWidth = helveticaBold.widthOfTextAtSize(assessmentHeader, 11);
  page.drawText(assessmentHeader, {
    x: (width - assessmentWidth) / 2,
    y: y - 52,
    size: 11,
    font: helveticaBold,
    color: rgb(0.09, 0.41, 1.0), // #1769FF
  });

  const examMeta = `Course: ${options.subjectName} (${options.subjectCode}) | Faculty: ${options.teacherName}`;
  const examMetaWidth = helvetica.widthOfTextAtSize(examMeta, 9);
  page.drawText(examMeta, {
    x: (width - examMetaWidth) / 2,
    y: y - 68,
    size: 9,
    font: helvetica,
    color: rgb(0.2, 0.25, 0.35),
  });

  y -= 95;

  // Metadata Bar (Date, Duration, Max Marks)
  page.drawLine({
    start: { x: margin, y: y },
    end: { x: width - margin, y: y },
    thickness: 1,
    color: rgb(0.7, 0.75, 0.85),
  });

  y -= 15;
  page.drawText(`Date: ${options.examDate || 'October 2025'}`, {
    x: margin,
    y,
    size: 9,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  const durationText = `Time: ${options.durationMinutes} Minutes`;
  const durWidth = helveticaBold.widthOfTextAtSize(durationText, 9);
  page.drawText(durationText, {
    x: (width - durWidth) / 2,
    y,
    size: 9,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  const marksText = `Max Marks: ${options.maxMarks}`;
  const marksWidth = helveticaBold.widthOfTextAtSize(marksText, 9);
  page.drawText(marksText, {
    x: width - margin - marksWidth,
    y,
    size: 9,
    font: helveticaBold,
    color: rgb(0.95, 0.35, 0.0), // #FF7A00
  });

  y -= 10;
  page.drawLine({
    start: { x: margin, y: y },
    end: { x: width - margin, y: y },
    thickness: 1,
    color: rgb(0.7, 0.75, 0.85),
  });

  y -= 22;

  // General Instructions
  page.drawText('Instructions: Answer all questions in Part A. Part B contains internal choice.', {
    x: margin,
    y,
    size: 8.5,
    font: timesRoman,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 20;

  // Render Sections & Questions
  for (const sec of options.questions) {
    if (y < 120) break; // Keep within single page or add page

    page.drawText(sec.section.toUpperCase(), {
      x: margin,
      y,
      size: 10,
      font: helveticaBold,
      color: rgb(0.03, 0.1, 0.24),
    });
    y -= 14;

    if (sec.instructions) {
      page.drawText(sec.instructions, {
        x: margin,
        y,
        size: 8,
        font: timesRoman,
        color: rgb(0.4, 0.4, 0.4),
      });
      y -= 16;
    }

    for (const item of sec.items) {
      if (y < 90) break;

      const qNumText = `${item.qNum}.`;
      page.drawText(qNumText, {
        x: margin,
        y,
        size: 9.5,
        font: timesRomanBold,
        color: rgb(0.1, 0.1, 0.1),
      });

      // Word wrapping basic support
      const maxWidth = width - margin * 2 - 70;
      const words = item.text.split(' ');
      let currentLine = '';
      let firstLine = true;

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = timesRoman.widthOfTextAtSize(testLine, 9.5);
        if (testWidth > maxWidth) {
          page.drawText(currentLine, {
            x: margin + 24,
            y,
            size: 9.5,
            font: timesRoman,
            color: rgb(0.15, 0.15, 0.15),
          });
          y -= 14;
          currentLine = word;
          firstLine = false;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        page.drawText(currentLine, {
          x: margin + 24,
          y,
          size: 9.5,
          font: timesRoman,
          color: rgb(0.15, 0.15, 0.15),
        });
      }

      // Marks column on the right
      const marksBadge = `[${item.marks} M]`;
      const mbWidth = helveticaBold.widthOfTextAtSize(marksBadge, 8.5);
      page.drawText(marksBadge, {
        x: width - margin - mbWidth,
        y,
        size: 8.5,
        font: helveticaBold,
        color: rgb(0.09, 0.41, 1.0),
      });

      y -= 18;
    }
    y -= 10;
  }

  // Footer
  page.drawLine({
    start: { x: margin, y: 40 },
    end: { x: width - margin, y: 40 },
    thickness: 0.75,
    color: rgb(0.8, 0.85, 0.9),
  });

  page.drawText(`Apex Academic Archive Repository • Paper ID: ${options.subjectCode}-${options.assessmentType.replace(/\s+/g, '')}-${options.academicYear}`, {
    x: margin,
    y: 28,
    size: 7.5,
    font: helvetica,
    color: rgb(0.5, 0.55, 0.65),
  });

  const pageNumText = 'Page 1 of 1';
  const pnWidth = helvetica.widthOfTextAtSize(pageNumText, 7.5);
  page.drawText(pageNumText, {
    x: width - margin - pnWidth,
    y: 28,
    size: 7.5,
    font: helvetica,
    color: rgb(0.5, 0.55, 0.65),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function saveSamplePdfToDisk(
  filename: string,
  options: GeneratePdfOptions
): Promise<{ relativeUrl: string; absolutePath: string; size: number }> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'papers');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, filename);
  const pdfBuffer = await createAcademicExamPdf(options);
  fs.writeFileSync(filePath, pdfBuffer);

  return {
    relativeUrl: `/uploads/papers/${filename}`,
    absolutePath: filePath,
    size: pdfBuffer.length,
  };
}
