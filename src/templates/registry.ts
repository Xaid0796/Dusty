import { CanvasDocument } from '@/canvas/types';
import { resumeTemplates } from './resume';
import { biodataTemplates } from './biodata';
import { cvTemplates } from './cv';
import { coverLetterTemplates } from './cover-letter';

// Canonical registry mapping template ID to CanvasDocument
export const templateRegistry: Record<string, CanvasDocument> = {
  ...resumeTemplates,
  ...biodataTemplates,
  ...cvTemplates,
  ...coverLetterTemplates,
};

// Backward compatibility alias for the editor and components
export const sampleTemplates = templateRegistry;
