import React from 'react';
import { DocumentSchema } from './schema';
import { ResumeModernLayout } from './resume-modern/layout';
import { defaultResumeData } from './resume-modern/defaultData';
import { templateRegistry } from './registry';
import { CanvasDocument } from '@/canvas/types';
import { CanvasDocumentRenderer } from '@/components/shared/CanvasDocumentRenderer';
import { coverLetterBoldGeometricTemplate as coverLetterBoldGeometric } from './cover-letter/cover-letter-bold-geometric';
import { coverLetterClassicProfessionalTemplate as coverLetterClassicProfessional } from './cover-letter/cover-letter-classic-professional';
import { coverLetterCreativeContemporaryTemplate as coverLetterCreativeContemporary } from './cover-letter/cover-letter-creative-contemporary';
import { coverLetterEditorialCenteredTemplate as coverLetterEditorialCentered } from './cover-letter/cover-letter-editorial-centered';
import { coverLetterElegantExecutiveTemplate as coverLetterElegantExecutive } from './cover-letter/cover-letter-elegant-executive';
import { coverLetterModernMinimalTemplate } from './cover-letter/cover-letter-modern-minimal';
import { coverLetterSidebarModernTemplate as coverLetterSidebarModern } from './cover-letter/cover-letter-sidebar-modern';
import { coverLetterVintageEleganceTemplate as coverLetterVintageElegance } from './cover-letter/cover-letter-vintage-elegance';

export interface TemplateDefinition {
  id: string;
  name: string;
  category: 'resume' | 'cv' | 'cover-letter' | 'basic';
  thumbnailText: string;
  thumbnailGradient: string; // Dynamic placeholder colors for Version 1
  thumbnail?: string;
  defaultData: DocumentSchema;
  Component: React.FC<{ data: DocumentSchema }>;
  photoShape: 'square' | 'rounded' | 'circle';
  isPremium: boolean;
  description?: string;
}

export const templateMetadataRegistry: Record<string, TemplateDefinition> = {
  'cv-executive-masterclass': {
    id: 'cv-executive-masterclass',
    name: 'Executive Masterclass CV',
    category: 'cv',
    thumbnailText: 'Executive CV',
    thumbnailGradient: 'linear-gradient(135deg, #0f172a, #d97706)',
    thumbnail: '/thumbnails/monaco.png',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'An elite, professional Curriculum Vitae template featuring warm cream background, deep charcoal and bronze typography, structural accent dividers, and comprehensive academic/executive sections.',
  },
  'cv-academic-diplomat': {
    id: 'cv-academic-diplomat',
    name: 'Academic Diplomat CV',
    category: 'cv',
    thumbnailText: 'Academic CV',
    thumbnailGradient: 'linear-gradient(135deg, #064e3b, #d4af37)',
    thumbnail: '/thumbnails/executive.png',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'An elite, scholarly Curriculum Vitae template featuring deep forest emerald header, refined gold accents, balanced typographical harmony, and comprehensive research/diplomatic sections.',
  },
  'cv-biotech-innovator': {
    id: 'cv-biotech-innovator',
    name: 'Biotech Innovator CV',
    category: 'cv',
    thumbnailText: 'Biotech CV',
    thumbnailGradient: 'linear-gradient(135deg, #4A0E17, #E0A96D)',
    thumbnail: '/thumbnails/monaco.png',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'An avant-garde, sophisticated Curriculum Vitae template featuring a deep burgundy and rose gold palette, asymmetric split-column layout, Garamond-Inter typography, and bespoke biotech innovation sections.',
  },
  'cv-global-media-executive': {
    id: 'cv-global-media-executive',
    name: 'Global Media Executive CV',
    category: 'cv',
    thumbnailText: 'Media Executive CV',
    thumbnailGradient: 'linear-gradient(135deg, #0D1B2A, #4361EE)',
    thumbnail: '/thumbnails/sterling.png',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'rounded',
    isPremium: false,
    description: 'A cutting-edge Curriculum Vitae template featuring midnight slate and electric indigo palette, editorial magazine-style layout with data visualization accents, Inter-Garamond typography, and bespoke media leadership sections.',
  },
  'cv-financial-strategist': {
    id: 'cv-financial-strategist',
    name: 'Financial Strategist CV',
    category: 'cv',
    thumbnailText: 'Financial Strategist CV',
    thumbnailGradient: 'linear-gradient(135deg, #3A1700, #C5A059)',
    thumbnail: '/thumbnails/cv-financial-strategist.png',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'A sophisticated executive Curriculum Vitae template featuring a rich mahogany and warm cream palette with burnished bronze accents, minimalist serif composition, refined top banner with ornate borders, Times New Roman/Arial typography, and bespoke sections for sovereign wealth advisory, asset management tracks, and board advisory roles.',
  },
  'cv-stylish-student': {
    id: 'cv-stylish-student',
    name: 'Stylish Student CV',
    category: 'cv',
    thumbnailText: 'Stylish Student CV',
    thumbnailGradient: 'linear-gradient(135deg, #1E1B4B, #F43F5E)',
    thumbnail: '/thumbnails/cv-stylish-student.png',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'A vibrant, modern CV template tailored for ambitious students and researchers featuring an asymmetric left sidebar, deep indigo and soft periwinkle palette, coral pink accents, and clean modular sections for education, projects, leadership, and technical skills.',
  },
  'cv-quantum-researcher': {
    id: 'cv-quantum-researcher',
    name: 'Quantum Researcher CV',
    category: 'cv',
    thumbnailText: 'Quantum Researcher CV',
    thumbnailGradient: 'linear-gradient(135deg, #0F172A, #06B6D4)',
    thumbnail: '/thumbnails/cv-quantum-researcher.png',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'A distinctive 2-page student CV template featuring a Modern Top-Header Grid, accents, crisp white background, dual-column cards, and comprehensive academic, research, publications, and honors sections across 2 pages.',
  },
  'cv-indian-scholar': {
    id: 'cv-indian-scholar',
    name: 'Elite Scholar CV',
    category: 'cv',
    thumbnailText: 'Elite Scholar CV',
    thumbnailGradient: 'linear-gradient(135deg, #1E1B4B, #D97706)',
    thumbnail: '/thumbnails/cv-indian-scholar.png',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'A stylish, distinctive 2-page CV template crafted for ambitious scholars and engineering students, featuring a Deep Royal Indigo header, Warm Amber/Saffron accents, CGPA & academic metrics, and comprehensive academic, research, and project sections across 2 pages.',
  },
  'resume-academic-blueprint': {
    id: 'resume-academic-blueprint',
    name: 'Academic Blueprint',
    category: 'resume',
    thumbnailText: 'Blueprint',
    thumbnailGradient: 'linear-gradient(135deg, #1E293B, #475569)',
    thumbnail: '/thumbnails/blueprint.png',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'A structured academic and professional resume template featuring a clean header banner, structured education and publication sections, and clean typography designed for researchers, students, and academics.',
  },
  'resume-dani-martinez': {
    id: 'resume-dani-martinez',
    name: 'Dani Martinez Modern',
    category: 'resume',
    thumbnailText: 'Dani Martinez',
    thumbnailGradient: 'linear-gradient(135deg, #333333, #737373)',
    thumbnail: '/thumbnails/dani.png',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'A sleek, professional modern resume template featuring a distinct sidebar with profile picture, contact details, education, skills, and languages. The main content area highlights work experience and professional references in a clean two-column layout.',
  },
  'resume-cobalt-frame': {
    id: 'resume-cobalt-frame',
    name: 'Cobalt Frame',
    category: 'resume',
    thumbnailText: 'Cobalt Frame',
    thumbnailGradient: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'A professional and clean resume template featuring a distinct cobalt blue border frame, structured layout, and typography tailored for job applications.',
  },
  'resume-orange-vanguard': {
    id: 'resume-orange-vanguard',
    name: 'Orange Vanguard',
    category: 'resume',
    thumbnailText: 'Orange Vanguard',
    thumbnailGradient: 'linear-gradient(135deg, #ea580c, #f97316)',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'A high-impact creative resume template featuring a bold orange accent bar and a modern two-column layout.',
  },
  'resume-modern': {
    id: 'resume-modern',
    name: 'Modern Executive Resume',
    category: 'resume',
    thumbnailText: 'Resume Modern',
    thumbnailGradient: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
    thumbnail: '/thumbnails/samantha.png',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
  }, 'resume-creative-terracotta': {
    id: 'resume-creative-terracotta',
    name: 'Creative Terracotta',
    category: 'resume',
    thumbnailText: 'Terracotta',
    thumbnailGradient: 'linear-gradient(135deg, #C2410C, #9a3412)',
    thumbnail: '/thumbnails/teracotta.png',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'A sophisticated professional-grade architectural resume template featuring a dark header band, structured grid columns, precision design elements, and clean layout sections for senior technical professionals.',
  },
  'resume-professional': {
    id: 'resume-professional',
    name: 'Modern Professional Resume',
    category: 'resume',
    thumbnailText: 'Professional',
    thumbnailGradient: 'linear-gradient(135deg, #0f172a, #334155)',
    thumbnail: '/thumbnails/modern-pro.png',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'A premium, modern, professional one-page A4 Resume template suitable for real job applications with a sidebar layout.',
  },

  'resume-alex-turner': {
    id: 'resume-alex-turner',
    name: 'Professional Software Engineer Resume',
    category: 'resume',
    thumbnailText: 'Alex Turner',
    thumbnailGradient: 'linear-gradient(135deg, #2c3e50, #7f8c8d)',
    thumbnail: '/thumbnails/alex-turner.png',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'A clean, professional software engineer resume template with structured sections for experience, projects, and technical skills.',
  },
  'resume-modern-tech-executive': {
    id: 'resume-modern-tech-executive',
    name: 'Modern Tech Executive',
    category: 'resume',
    thumbnailText: 'Tech Executive',
    thumbnailGradient: 'linear-gradient(135deg, #0f172a, #38bdf8)',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'A high-end, modern tech executive resume with a dark sidebar and cyan accents. Perfect for senior engineers and architects.',
  },
  'resume-modern-elegant': {
    id: 'resume-modern-elegant',
    name: 'Modern Elegant',
    category: 'resume',
    thumbnailText: 'Modern Elegant',
    thumbnailGradient: 'linear-gradient(135deg, #1a1a1a, #c5a059)',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'A minimalist, elegant resume template featuring gold accent frames, profile photo, and comprehensive structured sections.',
  },
  'resume-creative': {
    id: 'resume-creative',
    name: 'Creative Resume',
    category: 'resume',
    thumbnailText: 'Creative Resume',
    thumbnailGradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'A high-impact, modern visual resume template featuring structured columns, technical skills list, education details, and key professional project showcases.',
  },
  'resume-executive-navy': {
    id: 'resume-executive-navy',
    name: 'Executive Navy',
    category: 'resume',
    thumbnailText: 'Executive Navy',
    thumbnailGradient: 'linear-gradient(135deg, #1E3A8A, #3b82f6)',
    thumbnail: '/thumbnails/navy.png',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'A clean two-column professional resume featuring a deep navy blue sidebar, structured core skills, and executive experience placeholders.',
  },
  'resume-tech-minimalist': {
    id: 'resume-tech-minimalist',
    name: 'Tech Minimalist',
    category: 'resume',
    thumbnailText: 'Tech Minimalist',
    thumbnailGradient: 'linear-gradient(135deg, #0f172a, #334155)',
    thumbnail: '/thumbnails/minimilistic.png',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'A stark white, high-contrast slate typography tech resume featuring a strict single-column timeline layout, vertical track lines, and explicit GitHub and Tech Stack placeholders.',
  },
  'resume-monaco-luxury': {
    id: 'resume-monaco-luxury',
    name: 'Monaco Luxury',
    category: 'resume',
    thumbnailText: 'Monaco Luxury',
    thumbnailGradient: 'linear-gradient(135deg, #0f172a, #cbd5e1)',
    thumbnail: '/thumbnails/monaco.png',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'A highly advanced, premium executive resume template featuring an asymmetric layout, subtle background container sidebar, circular profile frame, Garamond-Arial typography, minimalist QR code, and custom diamond section splitters.',
  },
  'resume-architect-pro': {
    id: 'resume-architect-pro',
    name: 'Architect Pro',
    category: 'resume',
    thumbnailText: 'Architect Pro',
    thumbnailGradient: 'linear-gradient(135deg, #0f172a, #334155)',
    thumbnail: '/thumbnails/architech.png',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'A sophisticated professional-grade architectural resume template featuring a dark header band, structured grid columns, precision design elements, and clean layout sections for senior technical professionals.',
  },
  'resume-academic-lavender': {
    id: 'resume-academic-lavender',
    name: 'Academic Lavender',
    category: 'resume',
    thumbnailText: 'Academic Lavender',
    thumbnailGradient: 'linear-gradient(135deg, #F4F4F6, #5C5992)',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'A premium asymmetric college student resume template featuring a soft lavender sidebar background, profile photo frame, serif name typography, and structured academic sections.',
  },
  'resume-vogue-editorial': {
    id: 'resume-vogue-editorial',
    name: 'Vogue Editorial',
    category: 'resume',
    thumbnailText: 'Vogue Editorial',
    thumbnailGradient: 'linear-gradient(135deg, #FAF9F6, #D4AF37)',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'An editorial-style premium resume template featuring an ultra-premium warm cream background, deep charcoal typography, geometric gold corner accent frames, and a meticulously balanced two-column layout.',
  },
  'resume-emerald-luxury': {
    id: 'resume-emerald-luxury',
    name: 'Emerald Luxury',
    category: 'resume',
    thumbnailText: 'Emerald Luxury',
    thumbnailGradient: 'linear-gradient(135deg, #064e3b, #10b981)',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'A luxurious, executive-grade resume template featuring a striking deep emerald accent ribbon, precise asymmetric two-column layout, circular profile frame, and sophisticated typography tailored for senior leaders and corporate professionals.',
  },
  'resume-modern-executive-block': {
    id: 'resume-modern-executive-block',
    name: 'Modern Executive Block',
    category: 'resume',
    thumbnailText: 'Executive Block',
    thumbnailGradient: 'linear-gradient(135deg, #008ca6, #1e293b)',
    thumbnail: '/thumbnails/block.png',
    defaultData: defaultResumeData,
    Component: ResumeModernLayout,
    photoShape: 'circle',
    isPremium: false,
    description: 'A robust modern executive resume template featuring a bold teal top block banner, structured two-column layout, clear visual hierarchy, and professional experience sections.',
  },


  'cover-letter-classic-professional': {
    id: 'cover-letter-classic-professional',
    name: 'Classic Professional Cover Letter',
    category: 'cover-letter',
    thumbnailText: 'Classic Professional',
    thumbnailGradient: 'linear-gradient(135deg, #1e3a8a, #334155)',
    thumbnail: '/thumbnails/cv-financial-strategist.jpg',
    defaultData: defaultResumeData,
    Component: () => React.createElement(CanvasDocumentRenderer, { doc: coverLetterClassicProfessional, scale: 0.28 }),
    photoShape: 'circle',
    isPremium: false,
    description: 'A clean, traditional cover letter layout with a navy accent bar, structured sender/recipient blocks, justified body paragraphs, and a script-style signature — ideal for corporate and formal applications.',
  },
  'cover-letter-modern-minimal': {
    id: 'cover-letter-modern-minimal',
    name: 'Modern Minimal Cover Letter',
    category: 'cover-letter',
    thumbnailText: 'Modern Minimal',
    thumbnailGradient: 'linear-gradient(135deg, #0d9488, #334155)',
    thumbnail: '/thumbnails/minimilistic.png',
    defaultData: defaultResumeData,
    Component: () => React.createElement(CanvasDocumentRenderer, { doc: coverLetterModernMinimalTemplate, scale: 0.28 }),
    photoShape: 'circle',
    isPremium: false,
    description: 'A contemporary, whitespace-forward cover letter with a teal sidebar accent, Montserrat headings, and a single-column body — perfect for design, tech, and startup roles.',
  },
  'cover-letter-elegant-executive': {
    id: 'cover-letter-elegant-executive',
    name: 'Elegant Executive Cover Letter',
    category: 'cover-letter',
    thumbnailText: 'Elegant Executive',
    thumbnailGradient: 'linear-gradient(135deg, #1a1a1a, #c5a059)',
    thumbnail: '/thumbnails/cv-executive-masterclass.png',
    defaultData: defaultResumeData,
    Component: () => React.createElement(CanvasDocumentRenderer, { doc: coverLetterElegantExecutive, scale: 0.28 }),
    photoShape: 'circle',
    isPremium: false,
    description: 'A refined, editorial cover letter featuring a gold border frame, Playfair Display italic headings, serif body text, and an enclosure note — tailored for senior and executive positions.',
  },
  'cover-letter-creative-contemporary': {
    id: 'cover-letter-creative-contemporary',
    name: 'Creative Contemporary Cover Letter',
    category: 'cover-letter',
    thumbnailText: 'Creative Contemporary',
    thumbnailGradient: 'linear-gradient(135deg, #f43f5e, #fb7185)',
    thumbnail: '/thumbnails/creative.png',
    defaultData: defaultResumeData,
    Component: () => React.createElement(CanvasDocumentRenderer, { doc: coverLetterCreativeContemporary, scale: 0.28 }),
    photoShape: 'circle',
    isPremium: false,
    description: 'A bold, colorful cover letter with a rose-pink header band, drop-cap initial, and playful typography — designed for creative, branding, and marketing roles.',
  },
  'cover-letter-sidebar-modern': {
    id: 'cover-letter-sidebar-modern',
    name: 'Sidebar Modern Cover Letter',
    category: 'cover-letter',
    thumbnailText: 'Sidebar Modern',
    thumbnailGradient: 'linear-gradient(135deg, #1e293b, #3b82f6)',
    thumbnail: '/thumbnails/modern-pro.png',
    defaultData: defaultResumeData,
    Component: () => React.createElement(CanvasDocumentRenderer, { doc: coverLetterSidebarModern, scale: 0.28 }),
    photoShape: 'circle',
    isPremium: false,
    description: 'A two-column cover letter with a dark slate sidebar featuring contact details and skills, blue circular initial, and a clean main column — ideal for software and engineering roles.',
  },
  'cover-letter-vintage-elegance': {
    id: 'cover-letter-vintage-elegance',
    name: 'Vintage Elegance Cover Letter',
    category: 'cover-letter',
    thumbnailText: 'Vintage Elegance',
    thumbnailGradient: 'linear-gradient(135deg, #2d1b00, #8b6914)',
    thumbnail: '/thumbnails/lavendar.png',
    defaultData: defaultResumeData,
    Component: () => React.createElement(CanvasDocumentRenderer, { doc: coverLetterVintageElegance, scale: 0.28 }),
    photoShape: 'circle',
    isPremium: false,
    description: 'A nostalgic parchment-toned cover letter with ornamental floral corners, diamond dividers, Playfair Display typography, and classic formal prose — perfect for heritage, archival, and traditional applications.',
  },
  'cover-letter-bold-geometric': {
    id: 'cover-letter-bold-geometric',
    name: 'Bold Geometric Cover Letter',
    category: 'cover-letter',
    thumbnailText: 'Bold Geometric',
    thumbnailGradient: 'linear-gradient(135deg, #7c3aed, #ede9fe)',
    thumbnail: '/thumbnails/monaco.png',
    defaultData: defaultResumeData,
    Component: () => React.createElement(CanvasDocumentRenderer, { doc: coverLetterBoldGeometric, scale: 0.28 }),
    photoShape: 'circle',
    isPremium: false,
    description: 'A high-impact cover letter with a violet accent bar, geometric color bands, a purple highlight result box, and bold Montserrat headings — designed for marketing, strategy, and leadership roles.',
  },
  'cover-letter-editorial-centered': {
    id: 'cover-letter-editorial-centered',
    name: 'Editorial Centered Cover Letter',
    category: 'cover-letter',
    thumbnailText: 'Editorial Centered',
    thumbnailGradient: 'linear-gradient(135deg, #111111, #ffffff)',
    thumbnail: '/thumbnails/executive.png',
    defaultData: defaultResumeData,
    Component: () => React.createElement(CanvasDocumentRenderer, { doc: coverLetterEditorialCentered, scale: 0.28 }),
    photoShape: 'circle',
    isPremium: false,
    description: 'A sophisticated centered-typography cover letter with a newspaper masthead, Playfair Display name, serif justified body, and minimal footer rule — tailored for editorial, publishing, and creative writing roles.',
  },

};

// Helper to get combined registry including any dynamically published templates from templateRegistry
const getCombinedRegistry = (): Record<string, TemplateDefinition> => {
  const combined: Record<string, TemplateDefinition> = {};

  // 1. Add and validate from templateMetadataRegistry
  for (const [id, tpl] of Object.entries(templateMetadataRegistry)) {
    if (tpl.id !== id) {
      console.error(`ERROR: Template ID mismatch in metadata registry! Key is "${id}", but tpl.id is "${tpl.id}". Forcing to match.`);
      tpl.id = id;
    }
    combined[id] = tpl;
  }

  // 2. Add/fallback from templateRegistry (any template published through the
  // Admin Builder is a CanvasDocument — render its actual design via the
  // CanvasDocumentRenderer bridge instead of a generic placeholder layout).
  // When a template exists in both registries (e.g. a hardcoded cover-letter
  // template that was re-published with a new thumbnail), the templateRegistry
  // CanvasDocument's thumbnail takes precedence so the uploaded thumbnail
  // always shows up after a publish without requiring a manual metadata edit.
  for (const [id, doc] of Object.entries(templateRegistry)) {
    const canvasDoc = doc as CanvasDocument;
    if (!combined[id]) {
      combined[id] = {
        id: id,
        name: doc.name || id,
        category: (doc.category || 'resume') as any,
        thumbnailText: doc.name || id,
        thumbnailGradient: 'linear-gradient(135deg, #4f46e5, #9333ea)',
        thumbnail: doc.thumbnail,
        defaultData: defaultResumeData,
        Component: () =>
          React.createElement(CanvasDocumentRenderer, { doc: canvasDoc, scale: 0.28 }),
        photoShape: 'circle',
        isPremium: doc.isPremium || false,
        description: doc.description || `Custom ${doc.category || 'resume'} template created via Admin Builder.`,
      };
    } else if (doc.thumbnail) {
      // Override the metadata registry thumbnail with the live CanvasDocument
      // thumbnail — this is the authoritative image the Admin Builder uploaded.
      combined[id].thumbnail = doc.thumbnail;
    }
  }

  // 3. Guarantee that tpl.id matches the combined key
  for (const [id, tpl] of Object.entries(combined)) {
    if (tpl.id !== id) {
      tpl.id = id;
    }
  }

  return combined;
};

export const getTemplateById = (id: string): TemplateDefinition | undefined => {
  return getCombinedRegistry()[id];
};

export const getTemplatesByCategory = (category: 'resume' | 'cv' | 'cover-letter' | 'basic'): TemplateDefinition[] => {
  return Object.values(getCombinedRegistry()).filter(tpl => tpl.category === category);
};

export const getAllTemplates = (): TemplateDefinition[] => {
  return Object.values(getCombinedRegistry());
};
