import { CanvasDocument } from '@/canvas/types';
import { cvIndianScholarTemplate } from './cv-indian-scholar';
import { cvQuantumResearcherTemplate } from './cv-quantum-researcher';
import { cvStylishStudentTemplate } from './cv-stylish-student';
import { cvFinancialStrategistTemplate } from './cv-financial-strategist';
import { cvGlobalMediaExecutiveTemplate } from './cv-global-media-executive';
import { cvAcademicDiplomatTemplate } from './cv-academic-diplomat';
import { cvBiotechInnovatorTemplate } from './cv-biotech-innovator';
import { cvExecutiveMasterclassTemplate } from './cv-executive-masterclass';
export const cvTemplates: Record<string, CanvasDocument> = {
  'cv-indian-scholar': cvIndianScholarTemplate,
  'cv-quantum-researcher': cvQuantumResearcherTemplate,
  'cv-stylish-student': cvStylishStudentTemplate,
  'cv-financial-strategist': cvFinancialStrategistTemplate,
  'cv-global-media-executive': cvGlobalMediaExecutiveTemplate,
  'cv-academic-diplomat': cvAcademicDiplomatTemplate,
  'cv-biotech-innovator': cvBiotechInnovatorTemplate,
  'cv-executive-masterclass': cvExecutiveMasterclassTemplate,
  };
