import { create } from 'zustand';
import type {
  GeneratorDocument,
  GeneratorContact,
  GeneratorStyle,
  ResumeSection,
  SectionKind,
  ExperienceEntry,
  EducationEntry,
  SkillEntry,
  GenericEntry,
} from '@/types/generator';
import { SECTION_KIND_LABELS } from '@/types/generator';

export const STORAGE_KEY = 'dusty_generator_draft';
const MAX_HISTORY = 30;

// ─── Default placeholder avatar ─────────────────────────────────────────────
const DEFAULT_AVATAR =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlMmU4ZjAiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDUiIGZpbGw9IiM5NGEzYjgiLz48cGF0aCBkPSJNNDAgMTgwIEMgNDAgMTMwLCAxNjAgMTMwLCAxNjAgMTgwIFoiIGZpbGw9IiM2NDc0OGIiLz48cGF0aCBkPSJNODUgMTMwIEwxMDAgMTU1IEwxMTUgMTMwIFoiIGZpbGw9IiMxZTNhOGEiLz48cGF0aCBkPSJNMTAwIDE1NSBMMTA2IDE4MCBMOTQgMTgwIFoiIGZpbGw9IiMwZWE1ZTkiLz48L3N2Zz4=';

// ─── Default document with sample data ──────────────────────────────────────
export const createDefaultDocument = (): GeneratorDocument => ({
  id: 'generator-document',
  contact: {
    fullName: 'Aravind Sharma',
    title: 'Senior Software Engineer',
    email: 'aravind.sharma@email.com',
    phone: '+91 98765 43210',
    location: 'Bengaluru, Karnataka',
    website: 'aravindsharma.dev',
    linkedin: 'linkedin.com/in/aravind-sharma',
    github: 'github.com/aravind-sharma',
    photoUrl: DEFAULT_AVATAR,
  },
  style: {
    primaryColor: '#1e3a8a',
    secondaryColor: '#0d9488',
    fontFamily: 'Times New Roman',
    fontSizeName: 28,
    fontSizeHeading: 13,
    fontSizeBody: 12.5,
    fontSizeSupport: 11.5,
    lineHeight: 1.55,
    sectionSpacing: 18,
  },
  sections: [
    {
      id: 'sec-summary',
      kind: 'summary',
      title: 'Professional Summary',
      isDeletable: false,
      isReorderable: true,
      content:
        'Innovative Senior Software Engineer with 6+ years of experience specializing in React, Next.js, and cloud architecture. Passionate about building high-performance web applications, optimizing build systems, and mentoring cross-functional teams to deliver robust, scalable products.',
    },
    {
      id: 'sec-experience',
      kind: 'experience',
      title: 'Work Experience',
      isDeletable: false,
      isReorderable: true,
      experienceItems: [
        {
          id: 'exp-1',
          position: 'Senior Software Engineer',
          company: 'Infosys Technologies Ltd.',
          startDate: 'Jan 2022',
          endDate: '',
          current: true,
          description:
            'Led development of microservices architecture serving 1M+ daily active users.\nMentored a team of 5 junior engineers and conducted weekly code reviews.\nReduced API response times by 40% through Redis caching and query optimization.',
        },
        {
          id: 'exp-2',
          position: 'Software Engineer',
          company: 'Wipro Digital',
          startDate: 'Jul 2019',
          endDate: 'Dec 2021',
          current: false,
          description:
            'Built responsive React applications for enterprise banking clients.\nIntegrated REST APIs and developed a reusable component library used across 3 projects.\nImproved test coverage from 45% to 90% using Jest and React Testing Library.',
        },
      ],
    },
    {
      id: 'sec-education',
      kind: 'education',
      title: 'Educational Background',
      isDeletable: false,
      isReorderable: true,
      educationItems: [
        {
          id: 'edu-1',
          institution: 'Indian Institute of Technology, Madras',
          degree: 'B.Tech in Computer Science & Engineering',
          field: 'Computer Science',
          startDate: '2015',
          endDate: '2019',
          grade: '8.9 CGPA',
        },
      ],
    },
    {
      id: 'sec-skills',
      kind: 'skills',
      title: 'Skills',
      isDeletable: true,
      isReorderable: true,
      skillItems: [
        { id: 'sk-1', name: 'TypeScript' },
        { id: 'sk-2', name: 'React & Next.js' },
        { id: 'sk-3', name: 'Node.js & Express' },
        { id: 'sk-4', name: 'PostgreSQL' },
        { id: 'sk-5', name: 'AWS Cloud Services' },
        { id: 'sk-6', name: 'REST APIs & GraphQL' },
        { id: 'sk-7', name: 'Git & CI/CD' },
        { id: 'sk-8', name: 'Docker & Kubernetes' },
      ],
    },
  ],
});

// ─── Debounced localStorage save ─────────────────────────────────────────────
let _saveTimer: ReturnType<typeof setTimeout> | null = null;
const scheduleSave = (doc: GeneratorDocument) => {
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    } catch {
      /* storage full — ignore */
    }
  }, 400);
};

// ─── Store interface ─────────────────────────────────────────────────────────
interface GeneratorState {
  document: GeneratorDocument | null;
  history: GeneratorDocument[];
  future: GeneratorDocument[];

  setDocument: (doc: GeneratorDocument, skipHistory?: boolean) => void;
  updateContact: (contact: Partial<GeneratorContact>) => void;
  updateStyle: (style: Partial<GeneratorStyle>) => void;
  updateSectionContent: (sectionId: string, content: string) => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  updateExperienceItems: (sectionId: string, items: ExperienceEntry[]) => void;
  updateEducationItems: (sectionId: string, items: EducationEntry[]) => void;
  updateSkillItems: (sectionId: string, items: SkillEntry[]) => void;
  updateGenericItems: (sectionId: string, items: GenericEntry[]) => void;
  addSection: (kind: SectionKind, title?: string) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  toggleSectionDisabled: (sectionId: string) => void;
  undo: () => void;
  redo: () => void;
  clearDraft: () => void;
}

// ─── Store implementation ────────────────────────────────────────────────────
export const useGeneratorStore = create<GeneratorState>((set, get) => {
  const pushHistory = (doc: GeneratorDocument) => {
    const { history } = get();
    const clone = JSON.parse(JSON.stringify(doc)) as GeneratorDocument;
    set({ history: [...history, clone].slice(-MAX_HISTORY), future: [] });
  };

  const commit = (updater: (doc: GeneratorDocument) => GeneratorDocument) => {
    const { document } = get();
    if (!document) return;
    pushHistory(document);
    const newDoc = updater(JSON.parse(JSON.stringify(document)) as GeneratorDocument);
    set({ document: newDoc });
    scheduleSave(newDoc);
  };

  return {
    document: null,
    history: [],
    future: [],

    setDocument: (doc, skipHistory = false) => {
      const { document } = get();
      if (!skipHistory && document) pushHistory(document);
      const newDoc = JSON.parse(JSON.stringify(doc)) as GeneratorDocument;
      set({ document: newDoc });
      scheduleSave(newDoc);
    },

    updateContact: (contact) =>
      commit((doc) => ({ ...doc, contact: { ...doc.contact, ...contact } })),

    updateStyle: (style) =>
      commit((doc) => ({ ...doc, style: { ...doc.style, ...style } })),

    updateSectionContent: (sectionId, content) =>
      commit((doc) => ({
        ...doc,
        sections: doc.sections.map((s) =>
          s.id === sectionId ? { ...s, content } : s
        ),
      })),

    updateSectionTitle: (sectionId, title) =>
      commit((doc) => ({
        ...doc,
        sections: doc.sections.map((s) =>
          s.id === sectionId ? { ...s, title } : s
        ),
      })),

    updateExperienceItems: (sectionId, items) =>
      commit((doc) => ({
        ...doc,
        sections: doc.sections.map((s) =>
          s.id === sectionId ? { ...s, experienceItems: items } : s
        ),
      })),

    updateEducationItems: (sectionId, items) =>
      commit((doc) => ({
        ...doc,
        sections: doc.sections.map((s) =>
          s.id === sectionId ? { ...s, educationItems: items } : s
        ),
      })),

    updateSkillItems: (sectionId, items) =>
      commit((doc) => ({
        ...doc,
        sections: doc.sections.map((s) =>
          s.id === sectionId ? { ...s, skillItems: items } : s
        ),
      })),

    updateGenericItems: (sectionId, items) =>
      commit((doc) => ({
        ...doc,
        sections: doc.sections.map((s) =>
          s.id === sectionId ? { ...s, genericItems: items } : s
        ),
      })),

    addSection: (kind, title) => {
      commit((doc) => {
        const newSection: ResumeSection = {
          id: `sec-${kind}-${Date.now()}`,
          kind,
          title: title ?? SECTION_KIND_LABELS[kind],
          isDeletable: true,
          isReorderable: true,
          ...(kind === 'skills' ? { skillItems: [] } : { genericItems: [] }),
        };
        return { ...doc, sections: [...doc.sections, newSection] };
      });
    },

    removeSection: (sectionId) => {
      const { document } = get();
      if (!document) return;
      const section = document.sections.find((s) => s.id === sectionId);
      if (!section?.isDeletable) return; // guard: cannot delete mandatory sections
      commit((doc) => ({
        ...doc,
        sections: doc.sections.filter((s) => s.id !== sectionId),
      }));
    },

    reorderSections: (fromIndex, toIndex) => {
      commit((doc) => {
        const sections = [...doc.sections];
        const [moved] = sections.splice(fromIndex, 1);
        sections.splice(toIndex, 0, moved);
        return { ...doc, sections };
      });
    },

    toggleSectionDisabled: (sectionId) => {
      commit((doc) => ({
        ...doc,
        sections: doc.sections.map((s) =>
          s.id === sectionId ? { ...s, isDisabled: !s.isDisabled } : s
        ),
      }));
    },

    undo: () => {
      const { document, history, future } = get();
      if (!history.length) return;
      const prev = history[history.length - 1];
      set({
        document: prev,
        history: history.slice(0, -1),
        future: document
          ? [JSON.parse(JSON.stringify(document)), ...future].slice(0, MAX_HISTORY)
          : future,
      });
      if (prev) scheduleSave(prev);
    },

    redo: () => {
      const { document, history, future } = get();
      if (!future.length) return;
      const [next, ...rest] = future;
      set({
        document: next,
        history: [
          ...history,
          ...(document ? [JSON.parse(JSON.stringify(document))] : []),
        ].slice(-MAX_HISTORY),
        future: rest,
      });
      if (next) scheduleSave(next);
    },

    clearDraft: () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    },
  };
});
