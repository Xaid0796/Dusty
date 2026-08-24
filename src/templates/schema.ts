export interface PersonalInfo {
  fullName: string;
  title?: string;
  email: string;
  phone: string;
  location?: string;
  website?: string;
  photoUrl?: string; // Base64 data URL for client-side storage
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  grade?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface FamilyBackground {
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherOccupation?: string;
  siblings?: string;
}

export interface BiodataDetails {
  dateOfBirth?: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
  rashi?: string;
  nakshatra?: string;
  height?: string;
  complexion?: string;
  caste?: string;
  religion?: string;
  gothra?: string;
  familyBackground?: FamilyBackground;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  dateRange?: string;
  description?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large' | string;
  spacing: 'compact' | 'normal' | 'spacious';
  fontSizes?: {
    name?: number;
    title?: number;
    heading?: number;
    subheading?: number;
    body?: number;
    contact?: number;
    metadata?: number;
  };
  lineHeight?: number;
  letterSpacing?: number;
  sectionSpacing?: number;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | string;
  textAlign?: 'left' | 'center' | 'right' | 'justify' | string;
}

export interface DocumentSchema {
  id: string;
  templateId: string;
  category: 'resume' | 'cv' | 'biodata' | 'cover-letter' | 'portfolio' | 'basic';
  theme: ThemeSettings;
  sections: {
    personalInfo: PersonalInfo;
    summary?: string;
    education?: EducationItem[];
    experience?: ExperienceItem[];
    skills?: string[];
    biodataDetails?: BiodataDetails;
    customSections?: CustomSection[];
  };
}
