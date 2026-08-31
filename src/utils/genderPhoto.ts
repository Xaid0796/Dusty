/**
 * Gender-based photo assignment for the resume generator.
 *
 * When a template is loaded, the default person name determines which
 * photo pool to draw from. When the user edits the name, we re-detect
 * gender and swap the photo automatically (only if the current photo
 * is one of the auto-assigned defaults, never a user-uploaded image).
 */

export type Gender = 'male' | 'female';

// ─── Photo pools ─────────────────────────────────────────────────────────────

export const MALE_PHOTOS: string[] = [
    '/photos/male/american-office.jpeg',
    '/photos/male/men-01.png',
    '/photos/male/american.jpeg',
    '/photos/male/scottish-office.jpeg',
    '/photos/male/office-man.jpeg',
    '/photos/male/italian-office.jpeg',
];

export const FEMALE_PHOTOS: string[] = [
    '/photos/female/office-girl.jpeg',
    '/photos/female/office-women.jpeg',
    '/photos/female/women-01.png',
    '/photos/female/office-girl-beautiful.jpeg',
];

// Legacy public/ photos used by older templates
const LEGACY_PHOTOS: string[] = [
    '/resume-photo-1.jpeg',
    '/resume-photo-2.jpeg',
    '/resume-photo-3.jpeg',
    '/resume-photo-4.jpeg',
    '/resume-photo-5.jpeg',
];

// ─── Common first-name sets for heuristic gender detection ────────────────────

const COMMON_FEMALE_NAMES = new Set([
    'sophia', 'emma', 'olivia', 'ava', 'isabella', 'mia', 'charlotte', 'amelia',
    'harper', 'evelyn', 'luna', 'camila', 'aria', 'scarlett', 'penelope', 'layla',
    'chloe', 'victoria', 'madison', 'eleanor', 'grace', 'nora', 'zoe', 'stella',
    'hannah', 'elena', 'samantha', 'danielle', 'alexandra', 'natalie', 'lily',
    'sarah', 'jessica', 'jennifer', 'ashley', 'elizabeth', 'taylor', 'lauren',
    'alice', 'bethany', 'claire', 'diana', 'francesca', 'georgia', 'hazel',
    'iris', 'julia', 'kate', 'laura', 'monica', 'nina', 'paula', 'rachel',
    'aisha', 'priya', 'ananya', 'meera', 'divya', 'kavya', 'shruti', 'neha',
    'pooja', 'ritika', 'sonia', 'nita', 'gita', 'sunita', 'rekha', 'maya',
    'deepa', 'sita', 'radha', 'sarojini', 'indira', 'kamala', 'sushma',
    'mrs', 'ms', 'miss', 'smt',
]);

const COMMON_MALE_NAMES = new Set([
    'james', 'john', 'robert', 'michael', 'william', 'david', 'richard', 'joseph',
    'thomas', 'charles', 'christopher', 'daniel', 'matthew', 'anthony', 'mark',
    'donald', 'steven', 'paul', 'andrew', 'joshua', 'kevin', 'brian', 'george',
    'timothy', 'ronald', 'edward', 'jason', 'jeffrey', 'ryan', 'jacob', 'gary',
    'nicholas', 'eric', 'stephen', 'jonathan', 'justin', 'brandon', 'benjamin',
    'samuel', 'raymond', 'gregory', 'frank', 'patrick', 'jack', 'oliver', 'henry',
    'oscar', 'charlie', 'harry', 'alexander', 'sebastian', 'theo', 'leo',
    'aravind', 'rahul', 'vikram', 'aditya', 'karan', 'rohan', 'amit', 'sanjay',
    'rajesh', 'priyank', 'vijay', 'suresh', 'ravi', 'anil', 'sunil', 'mohan',
    'deepak', 'pradeep', 'manoj', 'ajay', 'naveen', 'nitin', 'ganesh',
    'shankar', 'prakash', 'venkatesh', 'srinivas', 'ramesh',
    'mr', 'sir', 'shri',
]);

// ─── Detection ───────────────────────────────────────────────────────────────

/**
 * Detect gender from a full name string. Uses title prefixes first,
 * then checks the first name against common-name lists, then falls
 * back to checking every word in the name.
 */
export function detectGender(fullName: string): Gender {
    const name = fullName.trim().toLowerCase();

    if (name.length === 0) return 'male';

    // 1) Title-based detection
    if (/^(mr\.|mr\s|sir[\s,]|shri[\s,])/i.test(name)) return 'male';
    if (/^(mrs\.|mrs\s|ms\.|ms\s|miss[\s,]|smt[\s,])/i.test(name)) return 'female';

    // 2) First-name detection
    const parts = name.split(/[\s,]+/);
    const titleSkip = ['mr', 'mrs', 'ms', 'dr', 'sir', 'smt', 'shri'];
    const firstName =
        parts.find((p) => !titleSkip.includes(p.replace('.', ''))) ??
        parts[0] ??
        '';

    if (COMMON_FEMALE_NAMES.has(firstName)) return 'female';
    if (COMMON_MALE_NAMES.has(firstName)) return 'male';

    // 3) Fallback — scan every word
    for (const part of parts) {
        if (COMMON_FEMALE_NAMES.has(part)) return 'female';
        if (COMMON_MALE_NAMES.has(part)) return 'male';
    }

    return 'male';
}

// ─── Photo selection ─────────────────────────────────────────────────────────

/**
 * Return a deterministic photo URL for the given gender.
 * Uses the first photo in the pool so the result is stable
 * across re-renders.
 */
export function getDefaultPhotoForGender(gender: Gender): string {
    return gender === 'female' ? FEMALE_PHOTOS[0] : MALE_PHOTOS[0];
}

/**
 * Given a current photo URL, return the matching-gender photo from
 * the opposite pool if the gender changed. If the current photo is
 * a user-uploaded blob/data-URI or an unrecognized URL, returns null
 * to signal "do not override".
 */
export function getPhotoForGender(
    currentPhoto: string,
    gender: Gender,
): string | null {
    // Recognise any auto-assigned photo (new pool or legacy pool)
    const allAuto = [...MALE_PHOTOS, ...FEMALE_PHOTOS, ...LEGACY_PHOTOS];
    const isAuto = allAuto.some((url) => currentPhoto === url);

    if (!isAuto) return null; // user uploaded their own photo

    // Already correct gender?
    const isMale = MALE_PHOTOS.includes(currentPhoto) ||
        ['/resume-photo-1.jpeg', '/resume-photo-2.jpeg', '/resume-photo-3.jpeg'].includes(currentPhoto);
    const isFemale = FEMALE_PHOTOS.includes(currentPhoto) ||
        ['/resume-photo-4.jpeg', '/resume-photo-5.jpeg'].includes(currentPhoto);

    if ((gender === 'male' && isMale) || (gender === 'female' && isFemale)) {
        return null; // no change needed
    }

    return getDefaultPhotoForGender(gender);
}
