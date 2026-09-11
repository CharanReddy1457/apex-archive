export type UserRole = 'ADMIN' | 'CONTRIBUTOR' | 'STUDENT';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
}

export interface DepartmentDTO {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  icon?: string | null;
}

export interface SemesterDTO {
  id: string;
  number: number;
  label: string;
}

export interface SyllabusUnit {
  unitNumber: number;
  title: string;
  description: string;
  topics: string[];
}

export interface SubjectDTO {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  semesterId: string;
  credits: number;
  description?: string | null;
  fullSyllabus?: string | null;
  syllabusUnits?: SyllabusUnit[] | null;
  coordinator?: string | null;
  department?: DepartmentDTO;
  semester?: SemesterDTO;
  papersCount?: number;
  teachersCount?: number;
}

export interface TeacherDTO {
  id: string;
  name: string;
  title: string;
  email?: string | null;
  departmentId: string;
  bio?: string | null;
  cabin?: string | null;
  avatar?: string | null;
  department?: DepartmentDTO;
  subjectsCount?: number;
  papersCount?: number;
}

export interface AssessmentComponentDTO {
  id: string;
  name: string;
  type: string;
  maxMarks: number;
  order: number;
}

export interface AssessmentPatternDTO {
  id: string;
  totalMarks: number;
  note?: string | null;
  components: AssessmentComponentDTO[];
}

export interface CourseOfferingDTO {
  id: string;
  subjectId: string;
  teacherId: string;
  academicYearId: string;
  subject?: SubjectDTO;
  teacher?: TeacherDTO;
  academicYear?: { id: string; label: string; isCurrent: boolean };
  assessmentPattern?: AssessmentPatternDTO | null;
  questionPapers?: QuestionPaperDTO[];
}

export interface QuestionPaperDTO {
  id: string;
  courseOfferingId: string;
  assessmentType: string;
  title: string;
  examDate?: string | null;
  maxMarks: number;
  durationMinutes: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  answerKeyUrl?: string | null;
  solutionNotes?: string | null;
  status: string;
  uploadedById: string;
  createdAt: string;
  courseOffering?: any;
  tags?: string[];
  isBookmarked?: boolean;
}

export interface SearchFilters {
  query?: string;
  department?: string;
  semester?: string;
  subject?: string;
  teacher?: string;
  academicYear?: string;
  assessmentType?: string;
  page?: number;
  limit?: number;
  sortBy?: 'recent' | 'marks' | 'name';
}
