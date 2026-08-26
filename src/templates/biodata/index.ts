import { CanvasDocument } from '@/canvas/types';

export const biodataTemplates: Record<string, CanvasDocument> = {
  'biodata-classic': {
    id: 'biodata-classic',
    category: 'biodata',
    name: 'Classic Biodata',
    page: {
      id: 'page-1',
      width: 210,
      height: 297,
      background: '#ffffff'
    },
    elements: [
      {
        id: 'biodata-title',
        type: 'text',
        label: 'Title',
        x: 15,
        y: 15,
        width: 180,
        height: 15,
        rotation: 0,
        zIndex: 1,
        visible: true,
        locked: false,
        content: 'BIODATA',
        style: {
          fontFamily: 'Georgia',
          fontSize: 22,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: '#881337',
          textAlign: 'center',
          lineHeight: 1.2,
          letterSpacing: 1,
          padding: 0
        }
      }
    ]
  }
};
