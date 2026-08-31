import { CanvasDocument } from '@/canvas/types';
import { coverLetterClassicProfessionalTemplate } from './cover-letter-classic-professional';
import { coverLetterEditorialCenteredTemplate } from './cover-letter-editorial-centered';
import { coverLetterBoldGeometricTemplate } from './cover-letter-bold-geometric';
import { coverLetterVintageEleganceTemplate } from './cover-letter-vintage-elegance';
import { coverLetterSidebarModernTemplate } from './cover-letter-sidebar-modern';
import { coverLetterCreativeContemporaryTemplate } from './cover-letter-creative-contemporary';
import { coverLetterElegantExecutiveTemplate } from './cover-letter-elegant-executive';
import { coverLetterModernMinimalTemplate } from './cover-letter-modern-minimal';
export const coverLetterTemplates: Record<string, CanvasDocument> = {
    'cover-letter-classic-professional': coverLetterClassicProfessionalTemplate,
    'cover-letter-editorial-centered': coverLetterEditorialCenteredTemplate,
    'cover-letter-bold-geometric': coverLetterBoldGeometricTemplate,
    'cover-letter-vintage-elegance': coverLetterVintageEleganceTemplate,
    'cover-letter-sidebar-modern': coverLetterSidebarModernTemplate,
    'cover-letter-creative-contemporary': coverLetterCreativeContemporaryTemplate,
    'cover-letter-elegant-executive': coverLetterElegantExecutiveTemplate,
    'cover-letter-modern-minimal': coverLetterModernMinimalTemplate,
};
