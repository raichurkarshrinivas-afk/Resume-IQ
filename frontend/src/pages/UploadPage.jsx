/**
 * UploadPage — 2-step Trustworthy Resume Upload & Text Correction Flow.
 *
 * Phase A Requirements:
 * 1. Step 1: Upload resume (PDF / DOCX, <= 5MB) + optional job details.
 * 2. Step 2: Extracted text preview & error correction before analysis.
 *    - Displays parser metadata (page count, char count, word count, standard section detection).
 *    - Editable textarea to fix OCR / character encoding errors.
 *    - Persists user corrections to PUT /api/resumes/{id} before running analysis.
 *    - Seamless "Confirm & Analyze" execution.
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client';
import { useToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

export default function UploadPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);

  // Flow step: 'upload' | 'review'
  const [step, setStep] = useState('upload');

  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // Uploaded record and extracted/corrected text
  const [uploadedResume, setUploadedResume] = useState(null);
  const [extractedText, setExtractedText] = useState('');

  // Status flags
  const [uploading, setUploading] = useState(false);
  const [savingCorrection, setSavingCorrection] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileSelect = (selectedFile) => {
    setUploadError('');
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const name = selectedFile.name.toLowerCase();

    if (!validTypes.includes(selectedFile.type) && !name.endsWith('.pdf') && !name.endsWith('.docx')) {
      const err = 'Please upload a PDF or DOCX file. Other formats are not supported.';
      setUploadError(err);
      toast.error(err);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      const err = 'File size must be under 5 MB. Please upload a smaller file.';
      setUploadError(err);
      toast.error(err);
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSampleResume = async () => {
    try {
      const res = await fetch('/sample_resume.docx');
      const blob = await res.blob();
      const sampleFile = new File([blob], 'Alex_Morgan_Senior_Engineer.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      setFile(sampleFile);
      if (!jobTitle) setJobTitle('Senior Backend Architect');
      if (!jobDescription) {
        setJobDescription(
          'Seeking a Senior Backend Architect experienced with Python, FastAPI, Docker, Kubernetes, PostgreSQL, Redis, and high-throughput microservices.'
        );
      }
      toast.info('Sample resume loaded! Click "Extract Resume & Continue" to proceed.');
    } catch (err) {
      toast.error('Could not load sample resume');
    }
  };

  // Step 1: Upload and extract text
  const handleExtractResume = async (e) => {
    if (e) e.preventDefault();
    setUploadError('');
    if (!file) {
      toast.warning('Please select a resume file');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await client.post('/api/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const resumeData = res.data;
      setUploadedResume(resumeData);
      setExtractedText(resumeData.raw_text || '');
      setStep('review');
      toast.success('Resume parsed! Please review the extracted text.');
    } catch (err) {
      const detail = err.response?.data?.detail || 'Upload failed. Please verify your file.';
      setUploadError(detail);
      toast.error(detail);
    } finally {
      setUploading(false);
    }
  };

  // Step 2: Confirm text & run analysis
  const handleConfirmAndAnalyze = async () => {
    if (!uploadedResume) return;

    if (!extractedText.trim() || extractedText.trim().length < 50) {
      toast.warning('Resume text must contain at least 50 characters.');
      return;
    }

    setSavingCorrection(true);
    setAnalyzing(true);

    try {
      // 1. If text was modified by user, persist to PUT /api/resumes/{id}
      if (extractedText.trim() !== (uploadedResume.raw_text || '').trim()) {
        await client.put(`/api/resumes/${uploadedResume.id}`, {
          corrected_text: extractedText.trim(),
        });
        toast.info('Saved your text corrections.');
      }

      // 2. Trigger analysis
      setSavingCorrection(false);
      const analysisRes = await client.post('/api/analysis/', {
        resume_id: uploadedResume.id,
        job_title: jobTitle || null,
        job_description: jobDescription || null,
      });

      toast.success('Analysis complete!');
      navigate(`/analysis/${analysisRes.data.id}`);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Analysis failed. Please try again.';
      toast.error(detail);
    } finally {
      setSavingCorrection(false);
      setAnalyzing(false);
    }
  };

  // Reset text back to raw extraction
  const handleResetText = () => {
    if (uploadedResume?.raw_text) {
      setExtractedText(uploadedResume.raw_text);
      toast.info('Restored original extracted text.');
    }
  };

  const isTextModified = uploadedResume && extractedText.trim() !== (uploadedResume.raw_text || '').trim();
  const wordCount = extractedText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = extractedText.length;
  const metadata = uploadedResume?.parser_metadata || {};

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '780px' }}>
      {/* Page Title & Stepper Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Upload & Analyse Your Resume
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
          Strict, verifiable ATS scoring with zero invented metrics and full text transparency.
        </p>

        {/* Stepper indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: step === 'upload' ? 'var(--color-primary-600)' : 'var(--color-success-600)',
            }}
          >
            <span
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: step === 'upload' ? 'var(--color-primary-100)' : 'var(--color-success-100)',
                color: step === 'upload' ? 'var(--color-primary-700)' : 'var(--color-success-700)',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              {step === 'review' ? '✓' : '1'}
            </span>
            <span>1. Upload Document</span>
          </div>

          <span style={{ color: 'var(--border-color)' }}>──</span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: step === 'review' ? 'var(--color-primary-600)' : 'var(--text-tertiary)',
            }}
          >
            <span
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: step === 'review' ? 'var(--color-primary-100)' : 'var(--bg-tertiary)',
                color: step === 'review' ? 'var(--color-primary-700)' : 'var(--text-tertiary)',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              2
            </span>
            <span>2. Review & Verify Extracted Text</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ───────────────────────────────────────────────────────────── */}
        {/* STEP 1: DOCUMENT UPLOAD & OPTIONAL TARGET ROLE                */}
        {/* ───────────────────────────────────────────────────────────── */}
        {step === 'upload' && (
          <motion.div
            key="step-upload"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            style={{ display: 'grid', gap: '20px' }}
          >
            {/* Drop Zone */}
            <Card padding="0">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                  border: `2px dashed ${dragOver ? 'var(--color-primary-500)' : 'var(--border-color)'}`,
                  background: dragOver ? 'var(--color-primary-50)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                  style={{ display: 'none' }}
                />

                {file ? (
                  <div>
                    <span style={{ fontSize: '44px', display: 'block', marginBottom: '12px' }}>
                      {file.name.endsWith('.pdf') ? '📕' : '📘'}
                    </span>
                    <p style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                      {file.name}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0 }}>
                      {(file.size / 1024).toFixed(1)} KB • Click to choose a different file
                    </p>
                  </div>
                ) : (
                  <div>
                    <span style={{ fontSize: '44px', display: 'block', marginBottom: '12px' }}>📤</span>
                    <p style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                      Drop your resume here or click to browse
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '0 0 14px' }}>
                      Supports PDF and DOCX (max 5 MB)
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadSampleResume();
                      }}
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-full)',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--color-primary-600)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'var(--color-primary-50)';
                        e.target.style.borderColor = 'var(--color-primary-500)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'var(--bg-secondary)';
                        e.target.style.borderColor = 'var(--border-color)';
                      }}
                    >
                      📄 Click to load sample resume (Alex Morgan)
                    </button>
                  </div>
                )}
              </div>
            </Card>

            {/* Target Position (optional) */}
            <Card>
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px', color: 'var(--text-primary)' }}>
                Target Position <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-tertiary)' }}>(optional)</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input
                  label="Job Title"
                  placeholder="e.g. Senior Backend Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Job Description
                  </label>
                  <textarea
                    placeholder="Paste the target job description here for keyword matching and role-specific analysis..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      fontFamily: 'var(--font-sans)',
                      color: 'var(--text-primary)',
                      background: 'var(--bg-primary)',
                      border: '0.5px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      outline: 'none',
                      resize: 'vertical',
                      lineHeight: 1.6,
                    }}
                  />
                </div>
              </div>
            </Card>

            {/* Error Banner */}
            {uploadError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-danger-50)',
                  border: '1px solid var(--color-danger-500)',
                  color: 'var(--color-danger-700)',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  lineHeight: 1.5,
                }}
              >
                <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
                <div>
                  <strong>Upload Issue: </strong>
                  {uploadError}
                </div>
              </motion.div>
            )}

            {/* Next Button */}
            <Button
              size="lg"
              fullWidth
              loading={uploading}
              disabled={!file}
              onClick={handleExtractResume}
            >
              {uploading ? 'Extracting Resume Text...' : 'Extract Resume & Continue →'}
            </Button>
          </motion.div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* STEP 2: REVIEW & CORRECT EXTRACTED TEXT (PHASE A)             */}
        {/* ───────────────────────────────────────────────────────────── */}
        {step === 'review' && (
          <motion.div
            key="step-review"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            style={{ display: 'grid', gap: '20px' }}
          >
            {/* Parser Quality & Metadata Card */}
            <Card padding="20px">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>🔍</span>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      Parser Extraction Quality
                    </h3>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
                    Document: <strong>{uploadedResume?.filename}</strong> ({uploadedResume?.file_type?.toUpperCase()})
                  </p>
                </div>

                <Badge variant={metadata.encoding_clean ? 'behavioral' : 'amber'}>
                  {metadata.encoding_clean ? '✓ UTF-8 Verified' : '⚠️ Encoding quirks'}
                </Badge>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
                <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                    Pages
                  </span>
                  <strong style={{ fontSize: '18px', color: 'var(--text-primary)' }}>
                    {metadata.page_count || 1}
                  </strong>
                </div>

                <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                    Words
                  </span>
                  <strong style={{ fontSize: '18px', color: 'var(--text-primary)' }}>
                    {metadata.word_count || wordCount}
                  </strong>
                </div>

                <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                    Characters
                  </span>
                  <strong style={{ fontSize: '18px', color: 'var(--text-primary)' }}>
                    {metadata.character_count || charCount}
                  </strong>
                </div>

                <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                    Parser Engine
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginTop: '3px' }}>
                    {metadata.parser_engine || 'Standard'}
                  </span>
                </div>
              </div>

              {/* Detected Standard Sections */}
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Standard Sections Detected by Parser:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['Experience', 'Skills', 'Education', 'Projects', 'Summary'].map((sec) => {
                    const detected = (metadata.detected_sections || []).includes(sec.toLowerCase());
                    return (
                      <span
                        key={sec}
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 9px',
                          borderRadius: 'var(--radius-full)',
                          background: detected ? 'var(--color-success-50)' : 'var(--bg-tertiary)',
                          color: detected ? 'var(--color-success-700)' : 'var(--text-tertiary)',
                          border: `1px solid ${detected ? 'var(--color-success-500)40' : 'transparent'}`,
                        }}
                      >
                        {detected ? `✓ ${sec}` : `○ ${sec}`}
                      </span>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Extracted Text Editor */}
            <Card padding="20px">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 2px', color: 'var(--text-primary)' }}>
                    Extracted Resume Text Preview
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                    Review what the ATS extracted. You can fix OCR typos or formatting quirks before running analysis.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isTextModified && (
                    <Button size="sm" variant="ghost" onClick={handleResetText}>
                      ↺ Reset to Original
                    </Button>
                  )}
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    {wordCount} words • {charCount} chars
                  </span>
                </div>
              </div>

              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                rows={14}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: '13px',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  lineHeight: 1.55,
                  color: 'var(--text-primary)',
                  background: 'var(--bg-primary)',
                  border: isTextModified ? '1.5px solid var(--color-primary-500)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />

              {isTextModified && (
                <p style={{ fontSize: '12px', color: 'var(--color-primary-600)', margin: '8px 0 0', fontWeight: 500 }}>
                  ✏️ You have made changes to the extracted text. These corrections will be saved and evaluated by the AI.
                </p>
              )}
            </Card>

            {/* Target Role Confirmation (Editable in Step 2) */}
            <Card padding="20px">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                  Target Role Details (Optional)
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  {jobTitle || 'General Analysis Mode'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <Input
                  label="Job Title"
                  placeholder="e.g. Senior Software Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
                <Input
                  label="Job Description"
                  placeholder="Optional job description text or requirements..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
            </Card>

            {/* Bottom Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
              <Button
                variant="outline"
                size="md"
                onClick={() => setStep('upload')}
                disabled={analyzing}
              >
                ← Back / Choose Different File
              </Button>

              <Button
                variant="primary"
                size="lg"
                loading={savingCorrection || analyzing}
                onClick={handleConfirmAndAnalyze}
                style={{ minWidth: '240px' }}
              >
                {analyzing ? 'Analysing Resume...' : 'Confirm & Analyze Resume 🚀'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
