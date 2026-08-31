// src/hooks/useBiodataStore.ts
import { create } from 'zustand';
import type {
    BiodataDocument,
    BiodataPhotoHeading,
    BiodataPersonal,
    BiodataFamily,
    BiodataContact,
    BiodataStyle,
} from '@/types/biodata';

export const STORAGE_KEY = 'dusty_biodata_draft';
const MAX_HISTORY = 30;

// ─── Template-specific default profiles ───────────────────────────────────────
const TEMPLATE_PROFILES: Record<string, { name: string; photo: string; occupation: string; place: string }> = {
    classic: {
        name: 'Reyansh Iyer',
        photo: '/men-01.png',
        occupation: 'Civil Servant',
        place: 'Indore, Madhya Pradesh',
    },
    modern: {
        name: 'Ananya Mehta',
        photo: '/resume-photo-2.jpeg',
        occupation: 'Architect',
        place: 'Mumbai, Maharashtra',
    },
    floral: {
        name: 'Aditya Verma',
        photo: '/resume-photo-4.jpeg',
        occupation: 'Chartered Accountant',
        place: 'Jaipur, Rajasthan',
    },
};

export const createDefaultDocument = (templateId: 'classic' | 'modern' | 'floral' = 'modern'): BiodataDocument => {
    const profile = TEMPLATE_PROFILES[templateId] || TEMPLATE_PROFILES.modern;

    return {
        id: 'biodata-document',
        name: 'Matrimonial Biodata',
        photoHeading: {
            photoUrl: profile.photo,
            originalPhotoUrl: profile.photo,
            heading: 'Biodata',
        },
        personal: {
            fullName: profile.name,
            dateOfBirth: '15-08-1995',
            timeOfBirth: '10:30 AM',
            placeOfBirth: profile.place,
            height: templateId === 'modern' ? "5'5\"" : "5'11\"",
            complexion: 'Fair',
            bloodGroup: 'B+',
            maritalStatus: 'Never Married',
            diet: 'Vegetarian',
            religion: 'Hindu',
            caste: 'Brahmin',
            gotra: 'Kashyap',
            rashi: 'Vrishabha',
            nakshatra: 'Rohini',
            manglik: 'No',
            education: 'B.Tech / MBA',
            occupation: profile.occupation,
            income: '₹ 22 LPA',
            hobbies: 'Reading, Photography, Traveling',
        },
        family: {
            fatherName: 'Ramesh ' + profile.name.split(' ')[1],
            fatherOccupation: 'Business',
            motherName: 'Sunita ' + profile.name.split(' ')[1],
            motherOccupation: 'Homemaker',
            siblings: '1 Sister (Married)',
            familyType: 'Nuclear Family',
            familyValues: 'Moderate',
            nativePlace: profile.place,
        },
        contact: {
            contactPerson: profile.name + ' (Self / Family)',
            phone: '+91 98765 43210',
            email: `${profile.name.toLowerCase().replace(' ', '.')}@email.com`,
            address: `12, Civil Lines, ${profile.place}`,
        },
        style: {
            templateId,
            primaryColor: templateId === 'floral' ? '#881337' : templateId === 'classic' ? '#1e3a8a' : '#0284c7',
            secondaryColor: '#0f172a',
            fontFamily: 'Georgia, serif',
        },
    };
};

// ─── Debounced localStorage save ──────────────────────────────────────────────
let _saveTimer: ReturnType<typeof setTimeout> | null = null;
const scheduleSave = (doc: BiodataDocument) => {
    if (_saveTimer) clearTimeout(_saveTimer);
    _saveTimer = setTimeout(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
        } catch { }
    }, 400);
};

// ─── Store implementation ──────────────────────────────────────────────────────
interface BiodataState {
    document: BiodataDocument | null;
    history: BiodataDocument[];
    future: BiodataDocument[];
    setDocument: (doc: BiodataDocument, skipHistory?: boolean) => void;
    updateName: (name: string) => void;
    updatePhotoHeading: (ph: Partial<BiodataPhotoHeading>) => void;
    updatePersonal: (p: Partial<BiodataPersonal>) => void;
    updateFamily: (f: Partial<BiodataFamily>) => void;
    updateContact: (c: Partial<BiodataContact>) => void;
    updateStyle: (s: Partial<BiodataStyle>) => void;
    undo: () => void;
    redo: () => void;
    clearDraft: () => void;
}

export const useBiodataStore = create<BiodataState>((set, get) => {
    const pushHistory = (doc: BiodataDocument) => {
        const { history } = get();
        const clone = JSON.parse(JSON.stringify(doc)) as BiodataDocument;
        set({ history: [...history, clone].slice(-MAX_HISTORY), future: [] });
    };

    const commit = (updater: (doc: BiodataDocument) => BiodataDocument) => {
        const { document } = get();
        if (!document) return;
        pushHistory(document);
        const newDoc = updater(JSON.parse(JSON.stringify(document)) as BiodataDocument);
        set({ document: newDoc });
        scheduleSave(newDoc);
    };

    return {
        document: createDefaultDocument('modern'),
        history: [],
        future: [],
        setDocument: (doc, skipHistory = false) => {
            const { document } = get();
            if (!skipHistory && document) pushHistory(document);
            const newDoc = JSON.parse(JSON.stringify(doc)) as BiodataDocument;
            set({ document: newDoc });
            scheduleSave(newDoc);
        },
        updateName: (name) => commit((doc) => ({ ...doc, name })),
        updatePhotoHeading: (ph) => commit((doc) => ({ ...doc, photoHeading: { ...doc.photoHeading, ...ph } })),
        updatePersonal: (p) => commit((doc) => ({ ...doc, personal: { ...doc.personal, ...p } })),
        updateFamily: (f) => commit((doc) => ({ ...doc, family: { ...doc.family, ...f } })),
        updateContact: (c) => commit((doc) => ({ ...doc, contact: { ...doc.contact, ...c } })),
        updateStyle: (s) => commit((doc) => {
            const updatedStyle = { ...doc.style, ...s };
            let newDoc = { ...doc, style: updatedStyle };
            if (s.templateId && s.templateId !== doc.style.templateId) {
                const fresh = createDefaultDocument(s.templateId);
                fresh.style.templateId = s.templateId;
                return fresh;
            }
            return newDoc;
        }),
        undo: () => {
            const { document, history, future } = get();
            if (!history.length) return;
            const prev = history[history.length - 1];
            set({
                document: prev,
                history: history.slice(0, -1),
                future: document ? [JSON.parse(JSON.stringify(document)), ...future].slice(0, MAX_HISTORY) : future,
            });
            if (prev) scheduleSave(prev);
        },
        redo: () => {
            const { document, history, future } = get();
            if (!future.length) return;
            const [next, ...rest] = future;
            set({
                document: next,
                history: [...history, ...(document ? [JSON.parse(JSON.stringify(document))] : [])].slice(-MAX_HISTORY),
                future: rest,
            });
            if (next) scheduleSave(next);
        },
        clearDraft: () => { try { localStorage.removeItem(STORAGE_KEY); } catch { } },
    };
});
