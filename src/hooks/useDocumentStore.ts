import { create } from 'zustand';
import type { 
  DocumentSchema, 
  ThemeSettings, 
  EducationItem, 
  ExperienceItem, 
  PersonalInfo, 
  BiodataDetails, 
  CustomSection, 
  CustomSectionItem 
} from '@/templates/schema';

interface DocumentState {
  document: DocumentSchema | null;
  history: DocumentSchema[];
  future: DocumentSchema[];
  
  // Actions
  setDocument: (doc: DocumentSchema, skipHistory?: boolean) => void;
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  updateSummary: (summary: string) => void;
  updateSkills: (skills: string[]) => void;
  updateBiodataDetails: (details: Partial<BiodataDetails>) => void;
  
  // Education
  addEducation: (item: EducationItem) => void;
  updateEducation: (id: string, item: Partial<EducationItem>) => void;
  removeEducation: (id: string) => void;
  
  // Experience
  addExperience: (item: ExperienceItem) => void;
  updateExperience: (id: string, item: Partial<ExperienceItem>) => void;
  removeExperience: (id: string) => void;
  
  // Custom Sections
  addCustomSection: (section: CustomSection) => void;
  updateCustomSectionTitle: (id: string, title: string) => void;
  addCustomSectionItem: (sectionId: string, item: CustomSectionItem) => void;
  updateCustomSectionItem: (sectionId: string, itemId: string, item: Partial<CustomSectionItem>) => void;
  removeCustomSectionItem: (sectionId: string, itemId: string) => void;
  removeCustomSection: (id: string) => void;
  
  // Theme
  updateTheme: (theme: Partial<ThemeSettings>) => void;
  
  // History & Persistence
  resetDocument: (defaultDoc: DocumentSchema) => void;
  undo: () => void;
  redo: () => void;
}

// Helper to save document to localStorage
const saveToLocalStorage = (doc: DocumentSchema | null) => {
  if (typeof window !== 'undefined' && doc) {
    try {
      localStorage.setItem(`dusty_doc_${doc.templateId}`, JSON.stringify(doc));
      localStorage.setItem(`dusty_last_active_template`, doc.templateId);
    } catch (e) {
      console.warn('Failed to save document to localStorage due to quota limits:', e);
    }
  }
};

const MAX_HISTORY_LIMIT = 30;

export const useDocumentStore = create<DocumentState>((set, get) => {
  // Helper to capture history snapshot before making edits
  const saveToHistory = (currentDoc: DocumentSchema | null) => {
    if (!currentDoc) return;
    const { history } = get();
    // Deep clone the current state
    const clone = JSON.parse(JSON.stringify(currentDoc));
    set({
      history: [...history, clone].slice(-MAX_HISTORY_LIMIT),
      future: [] // Clear redo stack on new action
    });
  };

  return {
    document: null,
    history: [],
    future: [],

    setDocument: (doc, skipHistory = false) => {
      if (!skipHistory && get().document) {
        saveToHistory(get().document);
      }
      // Deep clone template default data to prevent reference mutation
      const cloned = JSON.parse(JSON.stringify(doc));
      set({ document: cloned });
      // DO NOT write to localStorage here so that clean visits do not trigger recovery modals
    },

    updatePersonalInfo: (info) => {
      const { document } = get();
      if (!document) return;
      saveToHistory(document);

      const updated = {
        ...document,
        sections: {
          ...document.sections,
          personalInfo: {
            ...document.sections.personalInfo,
            ...info
          }
        }
      };
      set({ document: updated });
      saveToLocalStorage(updated);
    },

    updateSummary: (summary) => {
      const { document } = get();
      if (!document) return;
      saveToHistory(document);

      const updated = {
        ...document,
        sections: {
          ...document.sections,
          summary
        }
      };
      set({ document: updated });
      saveToLocalStorage(updated);
    },

    updateSkills: (skills) => {
      const { document } = get();
      if (!document) return;
      saveToHistory(document);

      const updated = {
        ...document,
        sections: {
          ...document.sections,
          skills
        }
      };
      set({ document: updated });
      saveToLocalStorage(updated);
    },

    updateBiodataDetails: (details) => {
      const { document } = get();
      if (!document) return;
      saveToHistory(document);

      const updated = {
        ...document,
        sections: {
          ...document.sections,
          biodataDetails: {
            ...document.sections.biodataDetails,
            ...details
          }
        }
      };
      set({ document: updated });
      saveToLocalStorage(updated);
    },

    addEducation: (item) => {
      const { document } = get();
      if (!document) return;
      saveToHistory(document);

      const items = document.sections.education || [];
      const updated = {
        ...document,
        sections: {
          ...document.sections,
          education: [...items, item]
        }
      };
      set({ document: updated });
      saveToLocalStorage(updated);
    },

    updateEducation: (id, item) => {
      const { document } = get();
      if (!document) return;
      saveToHistory(document);

      const items = (document.sections.education || []).map(edu => 
        edu.id === id ? { ...edu, ...item } : edu
      );
      const updated = {
        ...document,
        sections: {
          ...document.sections,
          education: items
        }
      };
      set({ document: updated });
      saveToLocalStorage(updated);
    },

    removeEducation: (id) => {
      const { document } = get();
      if (!document) return;
      saveToHistory(document);

      const items = (document.sections.education || []).filter(edu => edu.id !== id);
      const updated = {
        ...document,
        sections: {
          ...document.sections,
          education: items
        }
      };
      set({ document: updated });
      saveToLocalStorage(updated);
    },

    addExperience: (item) => {
      const { document } = get();
      if (!document) return;
      saveToHistory(document);

      const items = document.sections.experience || [];
      const updated = {
        ...document,
        sections: {
          ...document.sections,
          experience: [...items, item]
        }
      };
      set({ document: updated });
      saveToLocalStorage(updated);
    },

    updateExperience: (id, item) => {
      const { document } = get();
      if (!document) return;
      saveToHistory(document);

      const items = (document.sections.experience || []).map(exp => 
        exp.id === id ? { ...exp, ...item } : exp
      );
      const updated = {
        ...document,
        sections: {
          ...document.sections,
          experience: items
        }
      };
      set({ document: updated });
      saveToLocalStorage(updated);
    },

    removeExperience: (id) => {
      const { document } = get();
      if (!document) return;
      saveToHistory(document);

      const items = (document.sections.experience || []).filter(exp => exp.id !== id);
      const updated = {
        ...document,
        sections: {
          ...document.sections,
          experience: items
        }
      };
      set({ document: updated });
      saveToLocalStorage(updated);
    },

    addCustomSection: (section) => {
      const { document } = get();
      if (!document) return;
      saveToHistory(document);

      const sections = document.sections.customSections || [];
      const updated = {
        ...document,
        sections: {
          ...document.sections,
          customSections: [...sections, section]
        }
      };
      set({ document: updated });
      saveToLocalStorage(updated);
    },

    updateCustomSectionTitle: (id, title) => {
      const { document } = get();
      if (!document) return;
      saveToHistory(document);

      const sections = (document.sections.customSections || []).map(sec => 
        sec.id === id ? { ...sec, title } : sec
      );
      const updated = {
        ...document,
        sections: {
          ...document.sections,
          customSections: sections
        }
      };
      set({ document: updated });
      saveToLocalStorage(updated);
    },

    addCustomSectionItem: (sectionId, item) => {
      const { document } = get();
      if (!document) return;
      saveToHistory(document);

      const sections = (document.sections.customSections || []).map(sec => 
        sec.id === sectionId ? { ...sec, items: [...sec.items, item] } : sec
      );
      const updated = {
        ...document,
        sections: {
          ...document.sections,
          customSections: sections
        }
      };
      set({ document: updated });
      saveToLocalStorage(updated);
    },

    updateCustomSectionItem: (sectionId, itemId, item) => {
      const { document } = get();
      if (!document) return;
      saveToHistory(document);

      const sections = (document.sections.customSections || []).map(sec => {
        if (sec.id === sectionId) {
          const items = sec.items.map(i => i.id === itemId ? { ...i, ...item } : i);
          return { ...sec, items };
        }
        return sec;
      });
      const updated = {
        ...document,
        sections: {
          ...document.sections,
          customSections: sections
        }
      };
      set({ document: updated });
      saveToLocalStorage(updated);
    },

    removeCustomSectionItem: (sectionId, itemId) => {
      const { document } = get();
      if (!document) return;
      saveToHistory(document);

      const sections = (document.sections.customSections || []).map(sec => {
        if (sec.id === sectionId) {
          const items = sec.items.filter(i => i.id !== itemId);
          return { ...sec, items };
        }
        return sec;
      });
      const updated = {
        ...document,
        sections: {
          ...document.sections,
          customSections: sections
        }
      };
      set({ document: updated });
      saveToLocalStorage(updated);
    },

    removeCustomSection: (id) => {
      const { document } = get();
      if (!document) return;
      saveToHistory(document);

      const sections = (document.sections.customSections || []).filter(sec => sec.id !== id);
      const updated = {
        ...document,
        sections: {
          ...document.sections,
          customSections: sections
        }
      };
      set({ document: updated });
      saveToLocalStorage(updated);
    },

    updateTheme: (theme) => {
      const { document } = get();
      if (!document) return;
      saveToHistory(document);

      const updated = {
        ...document,
        theme: {
          ...document.theme,
          ...theme
        }
      };
      set({ document: updated });
      saveToLocalStorage(updated);
    },

    resetDocument: (defaultDoc) => {
      const { document } = get();
      if (document) {
        saveToHistory(document);
      }
      // Deep clone default template data to ensure immutability
      const cloned = JSON.parse(JSON.stringify(defaultDoc));
      set({
        document: cloned,
        history: [],
        future: []
      });
      // Start Fresh deletes the current template's saved draft
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`dusty_doc_${defaultDoc.templateId}`);
      }
    },

    undo: () => {
      const { document, history, future } = get();
      if (!document || history.length === 0) return;

      const previous = history[history.length - 1];
      const newHistory = history.slice(0, -1);
      
      set({
        document: previous,
        history: newHistory,
        future: [JSON.parse(JSON.stringify(document)), ...future]
      });
      saveToLocalStorage(previous);
    },

    redo: () => {
      const { document, history, future } = get();
      if (!document || future.length === 0) return;

      const next = future[0];
      const newFuture = future.slice(1);

      set({
        document: next,
        history: [...history, JSON.parse(JSON.stringify(document))],
        future: newFuture
      });
      saveToLocalStorage(next);
    }
  };
});
