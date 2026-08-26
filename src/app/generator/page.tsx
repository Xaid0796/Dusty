'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  RotateCcw,
  Download,
  Plus,
  ChevronDown,
  ChevronUp,
  Palette,
  User,
  FileText,
  ZoomIn,
  ZoomOut,
  X,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import {
  useGeneratorStore,
  STORAGE_KEY,
  createDefaultDocument,
} from '@/hooks/useGeneratorStore';
import { ResumePreview } from '@/components/generator/ResumePreview';
import { DraggableSections } from '@/components/generator/DraggableSections';
import {
  ContactEditor,
  StyleEditor,
} from '@/components/generator/SectionEditors';
import { generatePDF } from '@/utils/pdfGenerator';
import {
  ADDABLE_SECTION_KINDS,
  SECTION_KIND_LABELS,
} from '@/types/generator';
import type { GeneratorDocument, SectionKind } from '@/types/generator';
import styles from './generator.module.css';

// ─── Section icons for Add Section dialog ────────────────────────────────────
const SECTION_ICONS: Record<string, string> = {
  projects: '💡', internships: '🏢', certifications: '🎖️',
  achievements: '🏆', awards: '🥇', languages: '🌐',
  interests: '✨', volunteer: '🤝', publications: '📚', custom: '📝',
};

// ─── Generator Page ──────────────────────────────────────────────────────────
export default function GeneratorPage() {
  const [isClient, setIsClient] = useState(false);
  const [scale, setScale] = useState(0.8);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load theme from localStorage on client-side mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dusty_editor_theme') as 'light' | 'dark';
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      localStorage.setItem('dusty_editor_theme', next);
    } catch {
      /* ignore */
    }
  };
  const [activeMobileTab, setActiveMobileTab] = useState<'edit' | 'preview'>('edit');
  const [isPickingTemplate, setIsPickingTemplate] = useState(true);

  // Modal states
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<GeneratorDocument | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [selectedKind, setSelectedKind] = useState<SectionKind>('projects');

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Accordion: tracks which section is expanded in sidebar
  const [activeAccordion, setActiveAccordion] = useState<string | null>('contact');

  // Photo crop state
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState(1.2);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragStartCrop, setDragStartCrop] = useState({ x: 0, y: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });

  // Refs
  const previewParentRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const {
    document: doc,
    setDocument,
    history,
    future,
    undo,
    redo,
    addSection,
    clearDraft,
  } = useGeneratorStore();

  // ── Hydration ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ── Initialize store + check for existing draft ───────────────────────────
  useEffect(() => {
    if (!isClient) return;

    const defaultDoc = createDefaultDocument();
    setDocument(defaultDoc, true); // always start with default visually

    try {
      if (!sessionStorage.getItem('dusty_session_started')) {
        sessionStorage.setItem('dusty_session_started', 'true');
        localStorage.removeItem(STORAGE_KEY);
      }
      const rawDraft = localStorage.getItem(STORAGE_KEY);
      if (rawDraft) {
        const parsed = JSON.parse(rawDraft) as GeneratorDocument;
        // Only prompt recovery if the draft differs from the default
        if (JSON.stringify(parsed) !== JSON.stringify(defaultDoc)) {
          setPendingDraft(parsed);
          setShowDraftModal(true);
          setIsPickingTemplate(false);
        }
      }
    } catch {
      /* malformed JSON — ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  // ── A4 preview scale calculation ──────────────────────────────────────────
  useEffect(() => {
    if (!isClient) return;
    const calcScale = () => {
      if (!previewParentRef.current) return;
      const pw = previewParentRef.current.clientWidth;
      const s = Math.min((pw - 48) / 794, 1);
      setScale(s > 0.2 ? s : 0.5);
    };
    calcScale();
    window.addEventListener('resize', calcScale);
    const t = setTimeout(calcScale, 200);
    return () => {
      window.removeEventListener('resize', calcScale);
      clearTimeout(t);
    };
  }, [isClient, activeMobileTab]);

  // ── Draft recovery ─────────────────────────────────────────────────────────
  const handleContinueDraft = () => {
    if (pendingDraft) {
      setDocument(pendingDraft, true);
      setIsPickingTemplate(false);
    }
    setShowDraftModal(false);
    setPendingDraft(null);
  };

  const handleStartFresh = () => {
    clearDraft();
    const currentTemplateId = pendingDraft?.style?.templateId || doc?.style?.templateId || 'classic';
    const newDoc = createDefaultDocument();
    newDoc.style.templateId = currentTemplateId;
    setDocument(newDoc, true);
    setIsPickingTemplate(false);
    setShowDraftModal(false);
    setPendingDraft(null);
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    clearDraft();
    const currentTemplateId = doc?.style?.templateId || 'classic';
    const newDoc = createDefaultDocument();
    newDoc.style.templateId = currentTemplateId;
    setDocument(newDoc, false);
    setShowResetModal(false);
  };

  // ── Add Section ────────────────────────────────────────────────────────────
  const handleAddSection = () => {
    addSection(selectedKind);
    setShowAddSection(false);
    // Auto-expand the newly added section
    const newId = `sec-${selectedKind}-`; // prefix — full id is in the store
    // We'll just reset accordion; user will see it at the bottom
  };

  // ── Addable kinds: always show all, plus Skills if not currently present ──
  const addableKinds = (): SectionKind[] => {
    if (!doc) return ADDABLE_SECTION_KINDS;
    const hasSkills = doc.sections.some((s) => s.kind === 'skills');
    const base = hasSkills ? ADDABLE_SECTION_KINDS : ['skills' as SectionKind, ...ADDABLE_SECTION_KINDS];
    return base;
  };

  // ── Photo upload ───────────────────────────────────────────────────────────
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be under 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target?.result as string;
      useGeneratorStore.getState().updateContact({ originalPhotoUrl: b64 });
      setCropImageSrc(b64);
      setCropOffset({ x: 0, y: 0 });
      setCropZoom(1.2);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const onCropImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    const vw = 180;
    const vh = 180;
    const baseScale = Math.max(vw / naturalWidth, vh / naturalHeight);
    const dw = naturalWidth * baseScale;
    const dh = naturalHeight * baseScale;
    setDisplaySize({ width: dw, height: dh });
    setCropOffset({
      x: (vw - dw) / 2,
      y: (vh - dh) / 2,
    });
    setCropZoom(1);
  };

  const handleCropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingCrop(true);
    setDragStartCrop({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
  };

  const handleCropMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingCrop || !displaySize.width) return;
    const nextX = e.clientX - dragStartCrop.x;
    const nextY = e.clientY - dragStartCrop.y;

    const vw = 180;
    const vh = 180;
    const dw = displaySize.width * cropZoom;
    const dh = displaySize.height * cropZoom;

    const minX = vw - dw;
    const minY = vh - dh;

    const clampedX = Math.max(minX, Math.min(0, nextX));
    const clampedY = Math.max(minY, Math.min(0, nextY));

    setCropOffset({ x: clampedX, y: clampedY });
  };

  const handleCropMouseUp = () => setIsDraggingCrop(false);

  const handleZoomChange = (newZoom: number) => {
    const nextZoom = Math.max(1, Math.min(3, newZoom));
    setCropZoom(nextZoom);

    const vw = 180;
    const vh = 180;
    const dw = displaySize.width * nextZoom;
    const dh = displaySize.height * nextZoom;

    const minX = vw - dw;
    const minY = vh - dh;

    setCropOffset((prev) => ({
      x: Math.max(minX, Math.min(0, prev.x)),
      y: Math.max(minY, Math.min(0, prev.y)),
    }));
  };

  const handleApplyCrop = () => {
    if (!cropImageSrc || !displaySize.width) return;
    const img = new Image();
    img.onload = () => {
      const vw = 180;
      const vh = 180;
      const dw = displaySize.width * cropZoom;
      const dh = displaySize.height * cropZoom;

      const dx = -cropOffset.x;
      const dy = -cropOffset.y;

      const sf = img.naturalWidth / dw;

      const sx = dx * sf;
      const sy = dy * sf;
      const sw = vw * sf;
      const sh = vh * sf;

      const clampedSx = Math.max(0, Math.min(img.naturalWidth, sx));
      const clampedSy = Math.max(0, Math.min(img.naturalHeight, sy));
      const clampedSw = Math.max(1, Math.min(img.naturalWidth - clampedSx, sw));
      const clampedSh = Math.max(1, Math.min(img.naturalHeight - clampedSy, sh));

      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, clampedSx, clampedSy, clampedSw, clampedSh, 0, 0, 200, 200);
        const b64 = canvas.toDataURL('image/jpeg', 0.90);
        useGeneratorStore.getState().updateContact({ photoUrl: b64 });
        setShowCropModal(false);
        setCropImageSrc('');
      }
    };
    img.src = cropImageSrc;
  };

  // ── PDF download ───────────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    const el = previewRef.current;
    if (!el) {
      setExportError('Preview not available. Please try again.');
      return;
    }
    if (!doc) return;

    setIsExporting(true);
    setExportError(null);

    const rawName = doc.contact.fullName || '';
    const cleanName = rawName.trim().replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '-');
    const filename = cleanName ? `${cleanName}-Resume.pdf` : 'My-Resume.pdf';

    try {
      await generatePDF(el, filename);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('PDF export failed:', err);
      setExportError('PDF generation failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // ── Toggle accordion ───────────────────────────────────────────────────────
  const toggleAccordion = (id: string) =>
    setActiveAccordion((prev) => (prev === id ? null : id));

  // ─── Guards ────────────────────────────────────────────────────────────────
  if (!isClient || !doc) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#64748b' }}>
        Loading Resume Generator…
      </div>
    );
  }

  if (isPickingTemplate) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>Choose Resume Template Model</h1>
              <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>Select a design model for your resume before filling in your details.</p>
            </div>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Classic Template Card */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.2s', cursor: 'pointer' }}
              onClick={() => {
                useGeneratorStore.getState().updateStyle({ templateId: 'classic' });
                useGeneratorStore.getState().updateContact({ photoUrl: '/resume-photo-1.jpeg' });
                setIsPickingTemplate(false);
              }}
            >
              <div>
                <div style={{ height: '140px', background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1px solid #cbd5e1' }}>
                  <FileText size={40} color="#1e3a8a" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>Classic Professional</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>Traditional single-column layout with refined typography and professional header styling.</p>
              </div>
              <button style={{ width: '100%', padding: '10px', background: '#1e3a8a', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                Use this template →
              </button>
            </div>

            {/* Modern Template Card */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.2s', cursor: 'pointer' }}
              onClick={() => {
                useGeneratorStore.getState().updateStyle({ templateId: 'modern' });
                useGeneratorStore.getState().updateContact({ photoUrl: '/resume-photo-2.jpeg' });
                setIsPickingTemplate(false);
              }}
            >
              <div>
                <div style={{ height: '140px', background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1px solid #cbd5e1' }}>
                  <Sparkles size={40} color="#0284c7" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>Modern Minimalist</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>Clean modern layout with top accent bar, modern badges, and sleek visual hierarchy.</p>
              </div>
              <button style={{ width: '100%', padding: '10px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                Use this template →
              </button>
            </div>

            {/* Executive Sidebar Template Card */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.2s', cursor: 'pointer' }}
              onClick={() => {
                useGeneratorStore.getState().updateStyle({ templateId: 'sidebar', primaryColor: '#004d1a' });
                useGeneratorStore.getState().updateContact({ photoUrl: '/resume-photo-3.jpeg' });
                setIsPickingTemplate(false);
              }}
            >
              <div>
                <div style={{ height: '140px', background: '#f0fdf4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1px solid #bbf7d0' }}>
                  <User size={40} color="#004d1a" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>Executive Sidebar</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>Two-column layout featuring a striking colored sidebar for photo, contact details, skills, and languages.</p>
              </div>
              <button style={{ width: '100%', padding: '10px', background: '#004d1a', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                Use this template →
              </button>
            </div>

            {/* Greta Student Minimalist Sidebar Template Card */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.2s', cursor: 'pointer' }}
              onClick={() => {
                useGeneratorStore.getState().setDocument({
                  id: 'generator-document',
                  contact: {
                    fullName: 'ELENA ROOTS',
                    title: 'Business Administration Graduate',
                    email: 'elena.roots@reallygreatsite.com',
                    phone: '+1 (555) 382-9102',
                    location: '742 Evergreen Terrace, Springfield',
                    website: 'elenaroots.dev',
                    linkedin: 'linkedin.com/in/elena-roots',
                    photoUrl: '/resume-photo-4.jpeg',
                  },
                  style: {
                    templateId: 'greta',
                    primaryColor: '#f2e6dc',
                    secondaryColor: '#111111',
                    fontFamily: 'Calibri',
                    fontSizeName: 26,
                    fontSizeHeading: 11.5,
                    fontSizeBody: 10,
                    lineHeight: 1.4,
                    sectionSpacing: 16,
                  },
                  sections: [
                    {
                      id: 'sec-summary',
                      kind: 'summary',
                      title: 'Profile',
                      isDeletable: false,
                      isReorderable: true,
                      content: 'Dedicated Business Administration student and aspiring professional. Possesses a strong work ethic, exceptional organizational skills, and a proactive mindset toward corporate leadership and operational efficiency.',
                    },
                    {
                      id: 'sec-education',
                      kind: 'education',
                      title: 'Education',
                      isDeletable: false,
                      isReorderable: true,
                      educationItems: [
                        {
                          id: 'edu-1',
                          institution: 'BORCELLE UNIVERSITY',
                          degree: 'B.S. in Business Administration',
                          field: 'Management & Marketing',
                          startDate: '2020',
                          endDate: '2024',
                          grade: '3.9 GPA · Magna Cum Laude',
                        },
                        {
                          id: 'edu-2',
                          institution: 'BORCELLE SCHOOL',
                          degree: 'High School Diploma with Honors',
                          startDate: '2015',
                          endDate: '2019',
                          grade: 'Valedictorian',
                        },
                      ],
                    },
                    {
                      id: 'sec-languages',
                      kind: 'languages',
                      title: 'Language',
                      isDeletable: true,
                      isReorderable: true,
                      genericItems: [
                        { id: 'lang-1', title: 'Native English.' },
                        { id: 'lang-2', title: 'Advanced Spanish.' },
                        { id: 'lang-3', title: 'Conversational French.' },
                      ],
                    },
                    {
                      id: 'sec-skills',
                      kind: 'skills',
                      title: 'Computer Skills',
                      isDeletable: true,
                      isReorderable: true,
                      skillItems: [
                        { id: 'sk-1', name: 'Text processor (Word / Docs).' },
                        { id: 'sk-2', name: 'Spreadsheets (Advanced Excel & Formulas).' },
                        { id: 'sk-3', name: 'Slide presentations (PowerPoint / Canva).' },
                        { id: 'sk-4', name: 'Database management & CRM software.' },
                      ],
                    },
                    {
                      id: 'sec-volunteer',
                      kind: 'volunteer',
                      title: 'Volunteer Experience',
                      isDeletable: true,
                      isReorderable: true,
                      experienceItems: [
                        {
                          id: 'vol-1',
                          position: 'INGOUDE COMPANY',
                          company: 'Community Outreach',
                          startDate: '2024',
                          endDate: 'present',
                          current: true,
                          description: 'Participation in collections to distribute educational supplies and books in low-income schools.',
                        },
                        {
                          id: 'vol-2',
                          position: 'STUDENT MENTOR',
                          company: 'Campus Youth Initiative',
                          startDate: '2022',
                          endDate: '2023',
                          current: false,
                          description: 'Guided incoming freshman students on academic planning and campus resource navigation.',
                        },
                      ],
                    },
                    {
                      id: 'sec-certifications',
                      kind: 'certifications',
                      title: 'Certifications',
                      isDeletable: true,
                      isReorderable: true,
                      genericItems: [
                        {
                          id: 'cert-1',
                          title: 'Digital Marketing Fundamentals',
                          subtitle: 'Google Career Certificates',
                          dateRange: '2023',
                          description: 'Mastery of SEO, social media strategy, and e-commerce analytics.',
                        },
                        {
                          id: 'cert-2',
                          title: 'Project Management Associate (CAPM)',
                          subtitle: 'Project Management Institute',
                          dateRange: '2024',
                          description: 'Comprehensive training in agile methodologies, risk management, and scheduling.',
                        },
                      ],
                    },
                    {
                      id: 'sec-awards',
                      kind: 'awards',
                      title: 'Awards & Honors',
                      isDeletable: true,
                      isReorderable: true,
                      genericItems: [
                        {
                          id: 'aw-1',
                          title: 'Dean’s List Excellence Award',
                          subtitle: 'Borcelle University',
                          dateRange: '2021 – 2024',
                          description: 'Awarded consecutively for maintaining top academic standing across 8 semesters.',
                        },
                      ],
                    },
                  ],
                });
                setIsPickingTemplate(false);
              }}
            >
              <div>
                <div style={{ height: '140px', background: '#f2e6dc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1px solid #d1c4b8' }}>
                  <User size={40} color="#8c6d53" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>Greta Student Minimalist</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>Warm beige sidebar layout featuring updated name, profile, contact, education, languages, computer skills, volunteer experience, certifications, and awards.</p>
              </div>
              <button style={{ width: '100%', padding: '10px', background: '#8c6d53', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                Use this template →
              </button>
            </div>

            {/* William Executive Designer Template Card */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.2s', cursor: 'pointer' }}
              onClick={() => {
                useGeneratorStore.getState().setDocument({
                  id: 'generator-document',
                  contact: {
                    fullName: 'WILLIAM ALEXANDER',
                    title: 'Managing Chairman',
                    email: 'youremail@here',
                    phone: '+123 456 7890',
                    location: 'Your Location Here 00',
                    website: 'your website here',
                    photoUrl: '/resume-photo-5.jpeg',
                  },
                  style: {
                    templateId: 'william',
                    primaryColor: '#f8f9fa',
                    secondaryColor: '#0f172a',
                    fontFamily: 'Calibri',
                    fontSizeName: 26,
                    fontSizeHeading: 11.5,
                    fontSizeBody: 10,
                    lineHeight: 1.4,
                    sectionSpacing: 16,
                  },
                  sections: [
                    {
                      id: 'sec-summary',
                      kind: 'summary',
                      title: 'Personal Profile',
                      isDeletable: false,
                      isReorderable: true,
                      content: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
                    },
                    {
                      id: 'sec-experience',
                      kind: 'experience',
                      title: 'Work Experience',
                      isDeletable: false,
                      isReorderable: true,
                      experienceItems: [
                        {
                          id: 'exp-1',
                          position: 'Senior Graphic Designer',
                          company: 'Name of Company',
                          startDate: '2028',
                          endDate: 'Present',
                          current: true,
                          description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem.\n\n• Lorem ipsum dolor sit amet, consectetuer adipiscing elit\n• Lorem ipsum dolor sit amet, consectetuer adipiscing elit',
                        },
                        {
                          id: 'exp-2',
                          position: 'Senior Graphic Designer',
                          company: 'Name of Company',
                          startDate: '2026',
                          endDate: '2027',
                          current: false,
                          description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.\n\n• Lorem ipsum dolor sit amet, consectetuer adipiscing elit',
                        },
                        {
                          id: 'exp-3',
                          position: 'Senior Graphic Designer',
                          company: 'Name of Company',
                          startDate: '2024',
                          endDate: '2026',
                          current: false,
                          description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
                        },
                      ],
                    },
                    {
                      id: 'sec-education',
                      kind: 'education',
                      title: 'Education',
                      isDeletable: false,
                      isReorderable: true,
                      educationItems: [
                        {
                          id: 'edu-1',
                          institution: 'University Name - Canada',
                          degree: 'Degree Title',
                          startDate: '2024',
                          endDate: '2029',
                        },
                        {
                          id: 'edu-2',
                          institution: 'University Name - London',
                          degree: 'Degree Title',
                          startDate: '2024',
                          endDate: '2029',
                        },
                      ],
                    },
                    {
                      id: 'sec-skills',
                      kind: 'skills',
                      title: 'Skills',
                      isDeletable: true,
                      isReorderable: true,
                      skillItems: [
                        { id: 'sk-1', name: 'Digital Marketing' },
                        { id: 'sk-2', name: 'Web Development' },
                        { id: 'sk-3', name: 'Data Analysis' },
                        { id: 'sk-4', name: 'Project Management' },
                        { id: 'sk-5', name: 'Graphic Design' },
                        { id: 'sk-6', name: 'Content Creation' },
                        { id: 'sk-7', name: 'Programming' },
                      ],
                    },
                    {
                      id: 'sec-reference',
                      kind: 'custom',
                      title: 'Reference',
                      isDeletable: true,
                      isReorderable: true,
                      content: 'Robert Maverick\nCompany\nP: (+123) 456 7890\nE: youremail@here',
                    },
                  ],
                });
                setIsPickingTemplate(false);
              }}
            >
              <div>
                <div style={{ height: '140px', background: '#f8f9fa', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1px solid #cbd5e1' }}>
                  <User size={40} color="#0f172a" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>William Executive Designer</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>Precise layout matching William Alexander resume with box image frame (no circle), left sidebar contact, education, skills, references, and right personal profile & experience with diamond bullets.</p>
              </div>
              <button style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                Use this template →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const previewWrapperStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: 'top center',
  };

  return (
    <div
      data-theme={theme}
      className={`${styles.workspace} ${activeMobileTab === 'edit' ? styles.showEditor : styles.showPreview
        }`}
    >
      {/* ── Hidden photo file input ─────────────────────────────────────────── */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handlePhotoUpload}
      />

      {/* ── Top Toolbar ─────────────────────────────────────────────────────── */}
      <header className={styles.toolbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <span className={styles.toolbarTitle}>Resume Generator</span>
            <span className={styles.toolbarSub}>Professional single-format resume</span>
          </div>
        </div>

        <div className={styles.toolbarActions}>
          <div className={styles.saveStatus}>
            <span className={styles.saveDot} />
            Auto-saved
          </div>


          <button className={styles.iconBtn} onClick={toggleTheme} title="Toggle Theme">
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
          <button className={styles.iconBtn} onClick={undo} disabled={!history.length} title="Undo">
            <Undo2 size={15} /> Undo
          </button>
          <button className={styles.iconBtn} onClick={redo} disabled={!future.length} title="Redo">
            <Redo2 size={15} /> Redo
          </button>
          <button className={styles.iconBtn} onClick={() => setShowResetModal(true)} title="Reset">
            <RotateCcw size={15} /> Reset
          </button>
          <button className={styles.downloadBtn} onClick={handleDownloadPDF} disabled={isExporting}>
            <Download size={15} />
            {isExporting ? 'Generating…' : 'Download PDF'}
          </button>
        </div>
      </header>

      {exportError && (
        <div className={styles.errorBar}>{exportError}</div>
      )}
      {exportSuccess && (
        <div className={styles.successBar}>Download complete</div>
      )}

      {/* ── Main workspace ───────────────────────────────────────────────────── */}
      <div className={styles.main}>
        {/* ── LEFT SIDEBAR ──────────────────────────────────────────────────── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <p className={styles.sidebarHeading}>Resume Editor</p>
          </div>

          <div className={styles.sidebarScroll}>
            {/* ── Style Settings (fixed — not in sections[]) ─────────────────── */}
            <div className={styles.fixedSection}>
              <button
                className={styles.fixedSectionHeader}
                onClick={() => toggleAccordion('style')}
              >
                <span className={styles.fixedSectionTitle}>
                  <Palette size={15} color="#0d9488" />
                  Style Settings
                  <span className={styles.fixedBadge}>Fixed</span>
                </span>
                {activeAccordion === 'style' ? (
                  <ChevronUp size={16} color="#94a3b8" />
                ) : (
                  <ChevronDown size={16} color="#94a3b8" />
                )}
              </button>
              {activeAccordion === 'style' && (
                <div className={styles.fixedSectionBody}>
                  <StyleEditor style={doc.style} />
                </div>
              )}
            </div>

            {/* ── Contact Information (fixed — not in sections[]) ────────────── */}
            <div className={styles.fixedSection}>
              <button
                className={styles.fixedSectionHeader}
                onClick={() => toggleAccordion('contact')}
              >
                <span className={styles.fixedSectionTitle}>
                  <User size={15} color="#6366f1" />
                  Contact Information
                  <span className={styles.fixedBadge}>Fixed</span>
                </span>
                {activeAccordion === 'contact' ? (
                  <ChevronUp size={16} color="#94a3b8" />
                ) : (
                  <ChevronDown size={16} color="#94a3b8" />
                )}
              </button>
              {activeAccordion === 'contact' && (
                <div className={styles.fixedSectionBody}>
                  <ContactEditor
                    contact={doc.contact}
                    onOpenPhotoUpload={() => photoInputRef.current?.click()}
                    onOpenCrop={() => {
                      const orig = doc.contact.originalPhotoUrl || doc.contact.photoUrl;
                      if (orig) {
                        setCropImageSrc(orig);
                        setCropOffset({ x: 0, y: 0 });
                        setCropZoom(1.2);
                        setShowCropModal(true);
                      }
                    }}
                  />
                </div>
              )}
            </div>

            {/* ── Reorderable content sections ──────────────────────────────── */}
            <DraggableSections
              sections={doc.sections}
              activeAccordion={activeAccordion}
              onToggleAccordion={toggleAccordion}
            />

            {/* ── Add Section ───────────────────────────────────────────────── */}
            <button
              className={styles.addSectionBtn}
              onClick={() => setShowAddSection(true)}
            >
              <Plus size={16} />
              Add Section
            </button>
          </div>
        </aside>

        {/* ── RIGHT PREVIEW ──────────────────────────────────────────────────── */}
        <section className={styles.previewPanel} ref={previewParentRef}>
          <div style={previewWrapperStyle}>
            <div className={styles.previewShadow}>
              {/* previewRef captures the unscaled inner A4 element for PDF */}
              <div ref={previewRef}>
                <ResumePreview document={doc} />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Mobile tab nav ───────────────────────────────────────────────────── */}
      <nav className={styles.mobileTabs}>
        <button
          className={`${styles.mobileTabBtn} ${activeMobileTab === 'edit' ? styles.mobileTabBtnActive : ''}`}
          onClick={() => setActiveMobileTab('edit')}
        >
          ✏️ Edit
        </button>
        <button
          className={`${styles.mobileTabBtn} ${activeMobileTab === 'preview' ? styles.mobileTabBtnActive : ''}`}
          onClick={() => setActiveMobileTab('preview')}
        >
          👁 Preview
        </button>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════════════ */}

      {/* ── Draft Recovery Modal ──────────────────────────────────────────── */}
      {showDraftModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} role="dialog" aria-modal="true">
            <h3 className={styles.modalTitle}>Continue editing?</h3>
            <p className={styles.modalBody}>
              You have an unsaved resume draft from a previous session.
              Would you like to continue where you left off, or start fresh with the sample resume?
            </p>
            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={handleStartFresh}>
                Start Fresh
              </button>
              <button className={styles.btnPrimary} onClick={handleContinueDraft}>
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset Confirmation Modal ──────────────────────────────────────── */}
      {showResetModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} role="dialog" aria-modal="true">
            <h3 className={styles.modalTitle}>Reset Resume?</h3>
            <p className={styles.modalBody}>
              This will remove all your current changes and restore the default sample resume.
              This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={() => setShowResetModal(false)}>
                Cancel
              </button>
              <button className={styles.btnDanger} onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Section Modal ─────────────────────────────────────────────── */}
      {showAddSection && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} role="dialog" aria-modal="true" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className={styles.modalTitle} style={{ margin: 0 }}>Add a Section</h3>
              <button onClick={() => setShowAddSection(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.addSectionList}>
              {addableKinds().map((kind) => (
                <button
                  key={kind}
                  className={`${styles.addSectionOption} ${selectedKind === kind ? styles.addSectionOptionSelected : ''}`}
                  onClick={() => setSelectedKind(kind)}
                >
                  <span>{SECTION_ICONS[kind] ?? '📄'}</span>
                  {SECTION_KIND_LABELS[kind]}
                </button>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={() => setShowAddSection(false)}>
                Cancel
              </button>
              <button className={styles.btnPrimary} onClick={handleAddSection}>
                <Plus size={14} style={{ marginRight: 4 }} />
                Add Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Photo Crop Modal ──────────────────────────────────────────────── */}
      {showCropModal && cropImageSrc && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} role="dialog" aria-modal="true" style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className={styles.modalTitle} style={{ margin: 0 }}>Adjust Photo</h3>
              <button onClick={() => setShowCropModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              {/* Crop viewport */}
              <div
                className={styles.cropViewport}
                onMouseDown={handleCropMouseDown}
                onMouseMove={handleCropMouseMove}
                onMouseUp={handleCropMouseUp}
                onMouseLeave={handleCropMouseUp}
              >
                <img
                  src={cropImageSrc}
                  alt="Crop preview"
                  draggable={false}
                  onLoad={onCropImageLoad}
                  style={{
                    width: displaySize.width * cropZoom,
                    height: displaySize.height * cropZoom,
                    objectFit: 'cover',
                    transform: `translate(${cropOffset.x}px, ${cropOffset.y}px)`,
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                />
              </div>

              {/* Zoom controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => handleZoomChange(cropZoom - 0.1)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', display: 'flex' }}
                >
                  <ZoomOut size={16} color="#475569" />
                </button>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={cropZoom}
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                  style={{ width: '160px' }}
                />
                <button
                  onClick={() => handleZoomChange(cropZoom + 0.1)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', display: 'flex' }}
                >
                  <ZoomIn size={16} color="#475569" />
                </button>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, textAlign: 'center' }}>
                Drag to reposition · Use slider to zoom
              </p>
            </div>

            <div className={styles.modalActions} style={{ marginTop: '20px' }}>
              <button className={styles.btnSecondary} onClick={() => setShowCropModal(false)}>
                Cancel
              </button>
              <button className={styles.btnPrimary} onClick={handleApplyCrop}>
                Apply Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
