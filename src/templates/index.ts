import React from 'react';
import { DocumentSchema } from './schema';
import { ResumeModernLayout } from './resume-modern/layout';
import { defaultResumeData } from './resume-modern/defaultData';
import { templateRegistry } from './registry';

export interface TemplateDefinition {
  id: string;
  name: string;
  category: 'resume' | 'cv' | 'biodata' | 'cover-letter' | 'basic';
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
    isPremium: true,
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
    isPremium: true,
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
    isPremium: true,
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
    isPremium: true,
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
    isPremium: true,
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

  // 2. Add/fallback from templateRegistry
  for (const [id, doc] of Object.entries(templateRegistry)) {
    if (!combined[id]) {
      combined[id] = {
        id: id,
        name: doc.name || id,
        category: (doc.category || 'resume') as any,
        thumbnailText: doc.name || id,
        thumbnailGradient: 'linear-gradient(135deg, #4f46e5, #9333ea)',
        defaultData: defaultResumeData,
        Component: ResumeModernLayout,
        photoShape: 'circle',
        isPremium: doc.isPremium || false,
        description: `Custom ${doc.category || 'resume'} template created via Admin Builder.`,
      };
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

export const getTemplatesByCategory = (category: 'resume' | 'cv' | 'biodata' | 'cover-letter' | 'basic'): TemplateDefinition[] => {
  return Object.values(getCombinedRegistry()).filter(tpl => tpl.category === category);
};

export const getAllTemplates = (): TemplateDefinition[] => {
  return Object.values(getCombinedRegistry());
};
