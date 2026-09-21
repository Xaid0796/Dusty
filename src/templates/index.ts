import React from 'react';
import { DocumentSchema } from './schema';
import { CanvasDocument } from '@/canvas/types';
import { templateRegistry } from './registry';
import { CanvasDocumentRenderer } from '@/components/shared/CanvasDocumentRenderer';
import { defaultResumeData } from './resume-modern/defaultData';

export interface TemplateDefinition {
  id: string;
  name: string;
  category: 'resume' | 'cv' | 'cover-letter' | 'basic';
  thumbnailText: string;
  thumbnailGradient: string; // Dynamic placeholder colors for Version 1
  thumbnail?: string;
  defaultData: DocumentSchema;
  Component: React.FC<{ data: DocumentSchema }>;
  photoShape: 'square' | 'rounded' | 'circle';
  isPremium: boolean;
  description?: string;
}

export interface UnifiedTemplateDefinition extends TemplateDefinition {
  loadTemplate: () => Promise<CanvasDocument> | CanvasDocument;
}

import { unifiedTemplateRegistry } from './unifiedRegistry';

export const templateMetadataRegistry: Record<string, UnifiedTemplateDefinition> = unifiedTemplateRegistry;

// Helper to get combined registry including any dynamically published templates from templateRegistry
const getCombinedRegistry = (): Record<string, UnifiedTemplateDefinition> => {
  const combined: Record<string, UnifiedTemplateDefinition> = {};

  // 1. Add and validate from templateMetadataRegistry
  for (const [id, tpl] of Object.entries(templateMetadataRegistry)) {
    if (tpl.id !== id) {
      console.error(`ERROR: Template ID mismatch in metadata registry! Key is "${id}", but tpl.id is "${tpl.id}". Forcing to match.`);
      tpl.id = id;
    }
    combined[id] = tpl;
  }

  // 2. Add/fallback from templateRegistry (any template published through the
  // Admin Builder is a CanvasDocument — render its actual design via the
  // CanvasDocumentRenderer bridge instead of a generic placeholder layout).
  for (const [id, doc] of Object.entries(templateRegistry)) {
    const canvasDoc = doc as CanvasDocument;
    if (!combined[id]) {
      combined[id] = {
        id: id,
        name: doc.name || id,
        category: (doc.category || 'resume') as any,
        thumbnailText: doc.name || id,
        thumbnailGradient: 'linear-gradient(135deg, #4f46e5, #9333ea)',
        thumbnail: doc.thumbnail,
        defaultData: defaultResumeData,
        Component: () =>
          React.createElement(CanvasDocumentRenderer, { doc: canvasDoc, scale: 0.28 }),
        photoShape: 'circle',
        isPremium: doc.isPremium || false,
        description: doc.description || `Custom ${doc.category || 'resume'} template created via Admin Builder.`,
        loadTemplate: () => Promise.resolve(canvasDoc),
      };
    } else if (doc.thumbnail) {
      // Override the metadata registry thumbnail with the live CanvasDocument thumbnail
      combined[id].thumbnail = doc.thumbnail;
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

export const getTemplateById = (id: string): UnifiedTemplateDefinition | undefined => {
  return getCombinedRegistry()[id];
};

export const getTemplatesByCategory = (category: 'resume' | 'cv' | 'cover-letter' | 'basic'): UnifiedTemplateDefinition[] => {
  return Object.values(getCombinedRegistry()).filter(tpl => tpl.category === category);
};

export const getAllTemplates = (): UnifiedTemplateDefinition[] => {
  return Object.values(getCombinedRegistry());
};
