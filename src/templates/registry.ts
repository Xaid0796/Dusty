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

// Enforce template ID and key mapping consistency
for (const [key, doc] of Object.entries(templateRegistry)) {
  if (doc && doc.id !== key) {
    console.error(`ERROR: Template ID mismatch in registry! Key is "${key}", but doc.id is "${doc.id}". Forcing doc.id to match the key.`);
    doc.id = key;
  }
}

// Backward compatibility alias for the editor and components
export const sampleTemplates = templateRegistry;
