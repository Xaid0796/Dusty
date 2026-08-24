// src/types/generator.ts
// Data model for the Resume Generator (separate from the Template Marketplace)

export type SectionKind =
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'internships'
  | 'certifications'
  | 'achievements'
  | 'awards'
  | 'languages'
  | 'interests'
  | 'volunteer'
  | 'publications'
  | 'custom';

export const SECTION_KIND_LABELS: Record<SectionKind, string> = {
  summary: 'Professional Summary',
  experience: 'Work Experience',
  education: 'Educational Background',
  skills: 'Skills',
  projects: 'Projects',
  internships: 'Internships',
  certifications: 'Certifications',
  achievements: 'Achievements',
  awards: 'Awards',
  languages: 'Languages',
  interests: 'Interests',
  volunteer: 'Volunteer Experience',
  publications: 'Publications',
  custom: 'Custom Section',
};

// Sections the user can add via "Add Section" (mandatory ones are excluded)
export const ADDABLE_SECTION_KINDS: SectionKind[] = [
  'projects',
  'internships',
  'certifications',
  'achievements',
  'awards',
  'languages',
  'interests',
  'volunteer',
  'publications',
  'custom',
];

// ─── Entry Types ────────────────────────────────────────────────────────────

export interface ExperienceEntry {
  id: string;
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate: string;
  grade?: string;
}

export interface SkillEntry {
  id: string;
  name: string;
}

export interface GenericEntry {
  id: string;
  title: string;
  subtitle?: string;
  dateRange?: string;
  description?: string;
}

// ─── Section ────────────────────────────────────────────────────────────────

export interface ResumeSection {
  id: string;
  kind: SectionKind;
  title: string;
  isDeletable: boolean;    // false for summary, experience, education
  isReorderable: boolean;  // true for all sections[] members (contact/style are outside)
  isDisabled?: boolean;    // true if the section is disabled
  // Section-kind-specific data
  content?: string;                    // summary
  experienceItems?: ExperienceEntry[]; // experience
  educationItems?: EducationEntry[];   // education
  skillItems?: SkillEntry[];           // skills
  genericItems?: GenericEntry[];       // projects, certifications, custom, etc.
}

// ─── Top-level Generator Document ───────────────────────────────────────────

export interface GeneratorContact {
  fullName: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  photoUrl?: string;
  originalPhotoUrl?: string;
}

/** Deliberately minimal — generator controls design, user controls content */
export interface GeneratorStyle {
  primaryColor: string;
  secondaryColor: string;
  fontFamily?: string;
  fontSizeName?: number;
  fontSizeHeading?: number;
  fontSizeBody?: number;
  fontSizeSupport?: number;
  lineHeight?: number;
  sectionSpacing?: number;
}

export interface GeneratorDocument {
  id: string;
  contact: GeneratorContact;
  style: GeneratorStyle;
  /** ORDER of this array = render order in preview AND PDF */
  sections: ResumeSection[];
}
