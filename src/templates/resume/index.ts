import { CanvasDocument } from '@/canvas/types';
import { resumeCobaltFrameTemplate } from './resume-cobalt-frame';
import { resumeOrangeVanguardTemplate } from './resume-orange-vanguard';
import { resumeAcademicBlueprintTemplate } from './resume-academic-blueprint';
import { resumeModernTemplate } from './resume-modern';
import { resumeCreativeTerracottaTemplate } from './resume-creative-terracotta';
import { resumeDaniMartinezTemplate } from './resume-dani-martinez';
import { resumeEmeraldLuxuryTemplate } from './resume-emerald-luxury';
import { resumeAcademicLavenderTemplate } from './resume-academic-lavender';
import { resumeCreativeTemplate } from './resume-creative';
import { resumeAlexTurnerTemplate } from './resume-alex-turner';
import { resumeVogueEditorialTemplate } from './resume-vogue-editorial';
import { resumeArchitectProTemplate } from './architect-pro';
import { resumeMonacoLuxuryTemplate } from './resume-monaco-luxury';
import { resumeTechMinimalistTemplate } from './resume-tech-minimalist';
import { resumeExecutiveNavyTemplate } from './resume-executive-navy';
import { resumeProfessionalTemplate } from './resume-professional';
import { resumeModernElegantTemplate } from './resume-modern-elegant';
import { resumeModernExecutiveBlockTemplate } from './resume-modern-executive-block';
import { resumeModernTechExecutiveTemplate } from './resume-modern-tech-executive';

export const resumeTemplates: Record<string, CanvasDocument> = {
  'resume-cobalt-frame': resumeCobaltFrameTemplate,
  'resume-orange-vanguard': resumeOrangeVanguardTemplate,
  'resume-academic-blueprint': resumeAcademicBlueprintTemplate,
  'resume-modern': resumeModernTemplate,
  'resume-creative-terracotta': resumeCreativeTerracottaTemplate,
  'resume-dani-martinez': resumeDaniMartinezTemplate,
  'resume-emerald-luxury': resumeEmeraldLuxuryTemplate,
  'resume-academic-lavender': resumeAcademicLavenderTemplate,
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
  'resume-professional': resumeProfessionalTemplate,
};
