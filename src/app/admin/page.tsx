'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Upload, 
  Award, 
  BookOpen, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  FileText, 
  Clock, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import EmptyState from '@/components/EmptyState';

export default function AdminPortalPage() {
  const { user, switchDemoUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'pattern' | 'upload' | 'subject' | 'teacher' | 'moderation'>('pattern');
  const [loading, setLoading] = useState(true);

  // Common catalog state
  const [departments, setDepartments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [pendingPapers, setPendingPapers] = useState<any[]>([]);

  // 1. Pattern Builder state
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedYearLabel, setSelectedYearLabel] = useState('2025-26');
  const [patternNote, setPatternNote] = useState('');
  const [components, setComponents] = useState<{ id?: string; name: string; type: string; maxMarks: number }[]>([
    { name: 'CT-1 (Continuous Test 1)', type: 'TEST', maxMarks: 20 },
    { name: 'CT-2 (Continuous Test 2)', type: 'TEST', maxMarks: 20 },
    { name: 'Semester Mini-Project', type: 'PROJECT', maxMarks: 20 },
    { name: 'Final Assessment Exam', type: 'FINAL', maxMarks: 40 },
  ]);
  const [patternFeedback, setPatternFeedback] = useState<string | null>(null);

  // 2. Paper Upload state
  const [uploadSubjectId, setUploadSubjectId] = useState('');
  const [uploadTeacherId, setUploadTeacherId] = useState('');
  const [uploadYearLabel, setUploadYearLabel] = useState('2025-26');
  const [uploadType, setUploadType] = useState('CT-1');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDate, setUploadDate] = useState('');
  const [uploadMarks, setUploadMarks] = useState(20);
  const [uploadDuration, setUploadDuration] = useState(60);
  const [uploadSolutionNotes, setUploadSolutionNotes] = useState('');
  const [uploadTags, setUploadTags] = useState('important, unit-1, unit-2');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // 3. New Subject state
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubDeptId, setNewSubDeptId] = useState('');
  const [newSubSemNum, setNewSubSemNum] = useState(5);
  const [newSubCredits, setNewSubCredits] = useState(4);
  const [newSubCoordinator, setNewSubCoordinator] = useState('');
  const [newSubDesc, setNewSubDesc] = useState('');
  const [subSuccess, setSubSuccess] = useState<string | null>(null);

  // 4. New Teacher state
  const [newTeachName, setNewTeachName] = useState('');
  const [newTeachTitle, setNewTeachTitle] = useState('Associate Professor');
  const [newTeachDeptId, setNewTeachDeptId] = useState('');
  const [newTeachEmail, setNewTeachEmail] = useState('');
  const [newTeachCabin, setNewTeachCabin] = useState('');
  const [teachSuccess, setTeachSuccess] = useState<string | null>(null);

  // Load catalogs
  const loadCatalogs = async () => {
    try {
      const [deptRes, subRes, teachRes, pendingRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/subjects'),
        fetch('/api/teachers'),
        fetch('/api/papers?status=PENDING_REVIEW'),
      ]);

      if (deptRes.ok) {
        const d = await deptRes.json();
        setDepartments(d.departments || []);
      }
      if (subRes.ok) {
        const s = await subRes.json();
        setSubjects(s.subjects || []);
        if (s.subjects?.length > 0) {
          setSelectedSubjectId(s.subjects[0].id);
          setUploadSubjectId(s.subjects[0].id);
        }
      }
      if (teachRes.ok) {
        const t = await teachRes.json();
        setTeachers(t.teachers || []);
        if (t.teachers?.length > 0) {
          setSelectedTeacherId(t.teachers[0].id);
          setUploadTeacherId(t.teachers[0].id);
        }
      }
      if (pendingRes.ok) {
        const p = await pendingRes.json();
        setPendingPapers(p.papers || []);
      }
    } catch (err) {
      console.error('Catalog error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  // Calculate pattern total
  const patternTotal = components.reduce((sum, c) => sum + (Number(c.maxMarks) || 0), 0);
  const isPatternValid = patternTotal === 100;

  // Add component
  const addComponent = () => {
    setComponents([
      ...components,
      { name: `Component ${components.length + 1}`, type: 'TEST', maxMarks: 10 },
    ]);
  };

  // Remove component
  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  // Update component
  const updateComponent = (index: number, field: string, value: any) => {
    const updated = [...components];
    updated[index] = { ...updated[index], [field]: value };
    setComponents(updated);
  };

  // Save Assessment Pattern
  const handleSavePattern = async (e: React.FormEvent) => {
    e.preventDefault();
    setPatternFeedback(null);

    // Find or create course offering ID
    try {
      // First get subject details to find matching offering
      const subject = subjects.find((s) => s.id === selectedSubjectId);
      if (!subject) return;

      const subRes = await fetch(`/api/subjects/${subject.code}`);
      const subData = await subRes.json();
      const offering = subData.subject?.courseOfferings?.find(
        (o: any) => o.teacherId === selectedTeacherId && o.academicYear?.label === selectedYearLabel
      );

      if (!offering) {
        setPatternFeedback('No course offering found for this exact Subject + Teacher + Year combination. Creating pattern...');
      }

      const offeringId = offering?.id || subData.subject?.courseOfferings?.[0]?.id;

      if (!offeringId) {
        setPatternFeedback('Error: Course offering ID not available.');
        return;
      }

      const res = await fetch('/api/assessment-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseOfferingId: offeringId,
          totalMarks: patternTotal,
          note: patternNote,
          components,
        }),
      });

      if (res.ok) {
        setPatternFeedback('✓ Assessment pattern successfully updated and live!');
      } else {
        const data = await res.json();
        setPatternFeedback(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setPatternFeedback(`Error saving pattern: ${err.message}`);
    }
  };

  // Handle Paper Upload
  const handlePaperUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);

    if (!uploadFile) {
      setUploadError('Please select a PDF file to upload.');
      return;
    }

    setUploadProgress(true);

    try {
      // 1. Upload PDF file
      const formData = new FormData();
      formData.append('file', uploadFile);

      const fileRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!fileRes.ok) {
        const errData = await fileRes.json();
        throw new Error(errData.error || 'Failed to upload PDF');
      }

      const fileData = await fileRes.json();

      // 2. Find course offering ID
      const subject = subjects.find((s) => s.id === uploadSubjectId);
      const subRes = await fetch(`/api/subjects/${subject.code}`);
      const subData = await subRes.json();
      const offering = subData.subject?.courseOfferings?.find(
        (o: any) => o.teacherId === uploadTeacherId && o.academicYear?.label === uploadYearLabel
      ) || subData.subject?.courseOfferings?.[0];

      if (!offering) {
        throw new Error('Course offering could not be matched.');
      }

      // 3. Create question paper record
      const tagList = uploadTags.split(',').map((t) => t.trim()).filter(Boolean);

      const paperRes = await fetch('/api/papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseOfferingId: offering.id,
          assessmentType: uploadType,
          title: uploadTitle || `${subject.name} — ${uploadType} (${uploadYearLabel})`,
          examDate: uploadDate || new Date().toISOString().split('T')[0],
          maxMarks: uploadMarks,
          durationMinutes: uploadDuration,
          fileUrl: fileData.fileUrl,
          fileName: fileData.fileName,
          fileSize: fileData.fileSize,
          pageCount: fileData.pageCount,
          solutionNotes: uploadSolutionNotes,
          tags: tagList,
        }),
      });

      if (!paperRes.ok) {
        const errData = await paperRes.json();
        throw new Error(errData.error || 'Failed to create paper record');
      }

      const pData = await paperRes.json();
      setUploadSuccess(`✓ Success: ${pData.message || 'Question paper published successfully!'}`);
      setUploadFile(null);
      setUploadTitle('');
      loadCatalogs();
    } catch (err: any) {
      setUploadError(err.message || 'An error occurred');
    } finally {
      setUploadProgress(false);
    }
  };

  // Handle Create Subject
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubSuccess(null);
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newSubCode,
          name: newSubName,
          departmentId: newSubDeptId || departments[0]?.id,
          semesterId: departments[0]?.id ? 'default' : '', // Resolved on server
          credits: newSubCredits,
          coordinator: newSubCoordinator,
          description: newSubDesc,
        }),
      });
      if (res.ok) {
        setSubSuccess(`✓ Subject ${newSubCode} created successfully!`);
        setNewSubCode('');
        setNewSubName('');
        loadCatalogs();
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  // Handle Moderation Approve
  const handleApprovePaper = async (paperId: string) => {
    try {
      const res = await fetch(`/api/papers/${paperId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });
      if (res.ok) {
        setPendingPapers(pendingPapers.filter((p) => p.id !== paperId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header with Role Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyber-orange mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>AUTHENTICATED REPOSITORY MANAGEMENT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Academic Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-cyber-textMuted mt-1">
            Define variable assessment patterns, upload exam PDFs, manage professors, and moderate papers.
          </p>
        </div>

        {/* Quick Demo Role Switcher */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border text-xs">
          <span className="text-[11px] font-mono text-slate-400 px-2 font-semibold">Active:</span>
          <button
            type="button"
            onClick={() => switchDemoUser('ADMIN')}
            className={`px-3 py-1 rounded-xl font-bold transition-all ${
              user?.role === 'ADMIN'
                ? 'bg-cyber-orange text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-white'
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => switchDemoUser('CONTRIBUTOR')}
            className={`px-3 py-1 rounded-xl font-bold transition-all ${
              user?.role === 'CONTRIBUTOR'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-white'
            }`}
          >
            Contributor
          </button>
          <button
            type="button"
            onClick={() => switchDemoUser('STUDENT')}
            className={`px-3 py-1 rounded-xl font-bold transition-all ${
              user?.role === 'STUDENT'
                ? 'bg-cyber-blue text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-white'
            }`}
          >
            Student
          </button>
        </div>
      </div>

      {/* Portal Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'pattern', label: 'Assessment Pattern Builder', icon: Award },
          { id: 'upload', label: 'Upload Question Paper', icon: Upload },
          { id: 'moderation', label: `Moderation Queue (${pendingPapers.length})`, icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyber-blue text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: VARIABLE ASSESSMENT PATTERN BUILDER */}
      {activeTab === 'pattern' && (
        <form onSubmit={handleSavePattern} className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border shadow-sm space-y-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-cyber-blue" />
                Define Custom Assessment Structure
              </h2>
              <p className="text-xs text-slate-500 dark:text-cyber-textMuted mt-0.5">
                Every Subject + Teacher + Academic Year combination supports a variable assessment pattern.
              </p>
            </div>

            {/* Selectors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-cyber-textMuted uppercase mb-1">
                  Subject
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl bg-slate-50 dark:bg-cyber-navy/50 border border-slate-200 dark:border-cyber-border text-slate-900 dark:text-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-cyber-textMuted uppercase mb-1">
                  Faculty / Teacher
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl bg-slate-50 dark:bg-cyber-navy/50 border border-slate-200 dark:border-cyber-border text-slate-900 dark:text-white"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.title})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-cyber-textMuted uppercase mb-1">
                  Academic Year
                </label>
                <select
                  value={selectedYearLabel}
                  onChange={(e) => setSelectedYearLabel(e.target.value)}
                  className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl bg-slate-50 dark:bg-cyber-navy/50 border border-slate-200 dark:border-cyber-border text-slate-900 dark:text-white font-mono"
                >
                  <option value="2025-26">2025-26 (Current)</option>
                  <option value="2024-25">2024-25</option>
                  <option value="2023-24">2023-24</option>
                </select>
              </div>
            </div>

            {/* Scheme Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-cyber-textMuted uppercase mb-1">
                Evaluation Scheme Note (Optional)
              </label>
              <input
                type="text"
                value={patternNote}
                onChange={(e) => setPatternNote(e.target.value)}
                placeholder="e.g. Continuous evaluation with weightage on semester database mini-project."
                className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl bg-slate-50 dark:bg-cyber-navy/50 border border-slate-200 dark:border-cyber-border text-slate-900 dark:text-white"
              />
            </div>

            {/* Dynamic Assessment Components Editor */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider font-mono">
                  Assessment Components & Marks
                </span>
                <button
                  type="button"
                  onClick={addComponent}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyber-blueSoft text-cyber-blue border border-cyber-blue/30 text-xs font-semibold hover:bg-cyber-blue hover:text-white transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Assessment</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {components.map((comp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 sm:gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-cyber-navy/30 border border-slate-200/80 dark:border-cyber-border/40"
                  >
                    <input
                      type="text"
                      value={comp.name}
                      onChange={(e) => updateComponent(idx, 'name', e.target.value)}
                      placeholder="Component Name (e.g. CT-1, Project, Final)"
                      className="flex-1 text-xs sm:text-sm py-1.5 px-2.5 rounded-lg bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border text-slate-900 dark:text-white font-medium"
                    />

                    <select
                      value={comp.type}
                      onChange={(e) => updateComponent(idx, 'type', e.target.value)}
                      className="w-28 sm:w-36 text-xs py-1.5 px-2 rounded-lg bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border text-slate-900 dark:text-white"
                    >
                      <option value="TEST">Continuous Test</option>
                      <option value="FINAL">Final Exam</option>
                      <option value="PROJECT">Project / Lab</option>
                      <option value="ASSIGNMENT">Assignment</option>
                      <option value="QUIZ">Quiz</option>
                    </select>

                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={comp.maxMarks}
                        onChange={(e) => updateComponent(idx, 'maxMarks', parseInt(e.target.value || '0', 10))}
                        className="w-16 sm:w-20 text-xs sm:text-sm py-1.5 px-2 rounded-lg bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border text-slate-900 dark:text-white font-mono font-bold text-center"
                        min={0}
                        max={100}
                      />
                      <span className="text-xs font-mono text-slate-400">M</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeComponent(idx)}
                      disabled={components.length <= 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Real-time Total & Validation Warning (Requirement 14) */}
              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500 dark:text-cyber-textMuted">
                    Total Marks: <strong className="text-sm font-bold text-slate-900 dark:text-white">{patternTotal}</strong>
                  </span>

                  {!isPatternValid && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {patternTotal > 100
                        ? `⚠ Warning: Total exceeds 100 marks (${patternTotal})`
                        : `⚠ Warning: Total is less than 100 marks (${patternTotal})`}
                    </span>
                  )}

                  {isPatternValid && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      <CheckCircle className="w-3.5 h-3.5" /> Standard 100 Marks Scheme
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyber-blue hover:bg-blue-600 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow-cyber-glow-blue transition-all"
                >
                  Save Changes
                </button>
              </div>

              {patternFeedback && (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-cyber-navy/40 text-xs font-mono text-slate-700 dark:text-slate-200">
                  {patternFeedback}
                </div>
              )}
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: UPLOAD QUESTION PAPER */}
      {activeTab === 'upload' && (
        <form onSubmit={handlePaperUpload} className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border shadow-sm space-y-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyber-blue" />
                Upload Previous Year Question Paper
              </h2>
              <p className="text-xs text-slate-500 dark:text-cyber-textMuted mt-0.5">
                Upload genuine examination PDFs with full metadata, duration, marks, and solution notes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-cyber-textMuted uppercase mb-1">
                  Subject *
                </label>
                <select
                  value={uploadSubjectId}
                  onChange={(e) => setUploadSubjectId(e.target.value)}
                  className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl bg-slate-50 dark:bg-cyber-navy/50 border border-slate-200 dark:border-cyber-border text-slate-900 dark:text-white"
                  required
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-cyber-textMuted uppercase mb-1">
                  Faculty Teacher *
                </label>
                <select
                  value={uploadTeacherId}
                  onChange={(e) => setUploadTeacherId(e.target.value)}
                  className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl bg-slate-50 dark:bg-cyber-navy/50 border border-slate-200 dark:border-cyber-border text-slate-900 dark:text-white"
                  required
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-cyber-textMuted uppercase mb-1">
                  Academic Year *
                </label>
                <select
                  value={uploadYearLabel}
                  onChange={(e) => setUploadYearLabel(e.target.value)}
                  className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl bg-slate-50 dark:bg-cyber-navy/50 border border-slate-200 dark:border-cyber-border text-slate-900 dark:text-white font-mono"
                  required
                >
                  <option value="2025-26">2025-26</option>
                  <option value="2024-25">2024-25</option>
                  <option value="2023-24">2023-24</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-cyber-textMuted uppercase mb-1">
                  Assessment Type *
                </label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl bg-slate-50 dark:bg-cyber-navy/50 border border-slate-200 dark:border-cyber-border text-slate-900 dark:text-white font-semibold"
                >
                  <option value="CT-1">CT-1 (Continuous Test 1)</option>
                  <option value="CT-2">CT-2 (Continuous Test 2)</option>
                  <option value="Final Assessment">Final Assessment Examination</option>
                  <option value="Midterm">Midterm Examination</option>
                  <option value="End Semester">End Semester</option>
                  <option value="Assignment">Assignment Test</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Model Paper">Model Paper</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-cyber-textMuted uppercase mb-1">
                  Max Marks *
                </label>
                <input
                  type="number"
                  value={uploadMarks}
                  onChange={(e) => setUploadMarks(parseInt(e.target.value || '0', 10))}
                  className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl bg-slate-50 dark:bg-cyber-navy/50 border border-slate-200 dark:border-cyber-border text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-cyber-textMuted uppercase mb-1">
                  Duration (Minutes) *
                </label>
                <input
                  type="number"
                  value={uploadDuration}
                  onChange={(e) => setUploadDuration(parseInt(e.target.value || '0', 10))}
                  className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl bg-slate-50 dark:bg-cyber-navy/50 border border-slate-200 dark:border-cyber-border text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-cyber-textMuted uppercase mb-1">
                Paper Title / Description
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g. Continuous Test 1 — ER Diagrams & Schema Synthesis"
                className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl bg-slate-50 dark:bg-cyber-navy/50 border border-slate-200 dark:border-cyber-border text-slate-900 dark:text-white"
              />
            </div>

            {/* PDF File Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-cyber-textMuted uppercase mb-1">
                Question Paper PDF File *
              </label>
              <div className="border-2 border-dashed border-slate-300 dark:border-cyber-border rounded-2xl p-6 text-center hover:border-cyber-blue transition-colors">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="pdf-input"
                  required
                />
                <label htmlFor="pdf-input" className="cursor-pointer space-y-2 block">
                  <FileText className="w-8 h-8 text-cyber-blue mx-auto" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 block">
                    {uploadFile ? uploadFile.name : 'Click to select or drag examination PDF file'}
                  </span>
                  <span className="text-[11px] text-slate-400 block font-mono">
                    PDF format only • Maximum 25MB
                  </span>
                </label>
              </div>
            </div>

            {/* Solution Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-cyber-textMuted uppercase mb-1">
                Faculty Solution Notes / Hints (Optional)
              </label>
              <textarea
                rows={3}
                value={uploadSolutionNotes}
                onChange={(e) => setUploadSolutionNotes(e.target.value)}
                placeholder="Key hints, answers to conceptual questions, or calculation steps..."
                className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl bg-slate-50 dark:bg-cyber-navy/50 border border-slate-200 dark:border-cyber-border text-slate-900 dark:text-white leading-relaxed"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-cyber-textMuted uppercase mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={uploadTags}
                onChange={(e) => setUploadTags(e.target.value)}
                placeholder="important, sql, normalization, repeated-questions"
                className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl bg-slate-50 dark:bg-cyber-navy/50 border border-slate-200 dark:border-cyber-border text-slate-900 dark:text-white font-mono"
              />
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
                {uploadError}
              </div>
            )}

            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold">
                {uploadSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={uploadProgress}
              className="w-full py-3 rounded-xl bg-cyber-blue hover:bg-blue-600 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              {uploadProgress ? (
                <span>Uploading & Publishing Document...</span>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload & Publish Question Paper</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: MODERATION QUEUE */}
      {activeTab === 'moderation' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border shadow-sm space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Contributor Submission Moderation Queue
            </h2>
            <p className="text-xs text-slate-500 dark:text-cyber-textMuted mt-0.5">
              Review and approve papers submitted by student contributors before public visibility.
            </p>
          </div>

          {pendingPapers.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-cyber-navy/20 border border-dashed border-slate-200 dark:border-cyber-border">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Queue is clear!
              </p>
              <p className="text-xs text-slate-500 dark:text-cyber-textMuted">
                All uploaded question papers are currently verified and approved.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPapers.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-cyber-navy/40 border border-slate-200 dark:border-cyber-border flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-cyber-blue">
                      {p.assessmentType} • {p.courseOffering?.subject?.name}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {p.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-cyber-textMuted">
                      Uploaded by contributor • {p.fileName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={p.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                    >
                      Inspect
                    </a>
                    <button
                      type="button"
                      onClick={() => handleApprovePaper(p.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
