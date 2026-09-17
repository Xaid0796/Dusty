import { CanvasDocument } from '@/canvas/types';
import { resumeOrangeVanguardTemplate } from './resume-orange-vanguard';
import { resumeCobaltFrameTemplate } from './resume-cobalt-frame';
import { resumeExecutiveNavyTemplate } from './resume-executive-navy';
import { resumeDaniMartinezTemplate } from './resume-dani-martinez';
import { resumeEmeraldLuxuryTemplate } from './resume-emerald-luxury';
import { resumeAcademicLavenderTemplate } from './resume-academic-lavender';
import { resumeCreativeTemplate } from './resume-creative';
import { resumeModernElegantTemplate } from './resume-modern-elegant';
import { resumeAlexTurnerTemplate } from './resume-alex-turner';
import { resumeModernExecutiveBlockTemplate } from './resume-modern-executive-block';
import { resumeVogueEditorialTemplate } from './resume-vogue-editorial';
import { resumeArchitectProTemplate } from './resume-architect-pro';
import { resumeMonacoLuxuryTemplate } from './resume-monaco-luxury';
import { resumeTechMinimalistTemplate } from './resume-tech-minimalist';
import { resumeModernTechExecutiveTemplate } from './resume-modern-tech-executive';
import { resumeCreativeTerracottaTemplate } from './resume-creative-terracotta';
import { resumeProfessionalTemplate } from './resume-professional';
import { resumeModernTemplate } from './resume-modern';
import { resumeAcademicBlueprintTemplate } from './resume-academic-blueprint';
import { resumeAtelierGridTemplate } from './resume-atelier-grid';
import { resumeModernIdentityCardTemplate } from './resume-modern-identity-card';
import { resumeOliverBennettTemplate } from './resume-oliver-bennett';
export const resumeTemplates: Record<string, CanvasDocument> = {
  'resume-orange-vanguard': resumeOrangeVanguardTemplate,
  'resume-cobalt-frame': resumeCobaltFrameTemplate,
  'resume-executive-navy': resumeExecutiveNavyTemplate,
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
  'resume-creative-terracotta': resumeCreativeTerracottaTemplate,
  'resume-professional': resumeProfessionalTemplate,
  'resume-modern': resumeModernTemplate,
  'resume-academic-blueprint': resumeAcademicBlueprintTemplate,
  'resume-atelier-grid': resumeAtelierGridTemplate,
  'resume-modern-identity-card': resumeModernIdentityCardTemplate,
  'resume-oliver-bennett': resumeOliverBennettTemplate,
};
