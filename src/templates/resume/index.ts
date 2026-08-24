import { CanvasDocument } from '@/canvas/types';
import { resumeCreativeTemplate } from './resume-creative';
import { resumeModernElegantTemplate } from './resume-modern-elegant';
import { resumeAlexTurnerTemplate } from './resume-alex-turner';
import { resumeModernExecutiveBlockTemplate } from './resume-modern-executive-block';
import { resumeVogueEditorialTemplate } from './resume-vogue-editorial';
import { resumeArchitectProTemplate } from './architect-pro';
import { resumeMonacoLuxuryTemplate } from './resume-monaco-luxury';
import { resumeTechMinimalistTemplate } from './resume-tech-minimalist';
import { resumeModernTechExecutiveTemplate } from './resume-modern-tech-executive';
import { resumeExecutiveNavyTemplate } from './resume-executive-navy';
import { resumeCreativeTerracottaTemplate } from './resume-creative-terracotta';
import { resumeProfessionalTemplate } from './resume-professional';
import { sampleResumeDocument } from './modern';
export const resumeTemplates: Record<string, CanvasDocument> = {
  'resume-creative': resumeCreativeTemplate,
  'resume-modern-elegant': resumeModernElegantTemplate,
  'resume-alex-turner': resumeAlexTurnerTemplate,
  'resume-modern-executive-block': resumeModernExecutiveBlockTemplate,
  'resume-vogue-editorial': resumeVogueEditorialTemplate,
  'resume-architect-pro': resumeArchitectProTemplate,
  'resume-monaco-luxury': resumeMonacoLuxuryTemplate,
  'resume-tech-minimalist': resumeTechMinimalistTemplate,
  'resume-modern-tech-executive': resumeModernTechExecutiveTemplate,
  'resume-executive-navy': resumeExecutiveNavyTemplate,
  'resume-creative-terracotta': resumeCreativeTerracottaTemplate,
  'resume-professional': resumeProfessionalTemplate,
  'resume-modern': sampleResumeDocument,
};
