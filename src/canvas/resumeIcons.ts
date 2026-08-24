/**
 * Resume Icons Library
 * SVG icons as data-URI strings for use as image elements on the canvas.
 * Each icon is a 24x24 viewBox SVG.
 */

export interface ResumeIcon {
  id: string;
  name: string;
  category: string;
  tags: string[];
  svg: string; // raw SVG string
}

const icon = (id: string, name: string, category: string, tags: string[], paths: string): ResumeIcon => ({
  id, name, category, tags,
  svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`,
});

const solidIcon = (id: string, name: string, category: string, tags: string[], paths: string): ResumeIcon => ({
  id, name, category, tags,
  svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">${paths}</svg>`,
});

export const RESUME_ICONS: ResumeIcon[] = [
  // ── Contact ─────────────────────────────────────────────────
  icon('phone', 'Phone', 'Contact', ['phone', 'call', 'contact', 'telephone'],
    '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'),

  icon('mobile', 'Mobile', 'Contact', ['mobile', 'smartphone', 'phone'],
    '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>'),

  icon('email', 'Email', 'Contact', ['email', 'mail', 'message', 'contact'],
    '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>'),

  icon('location', 'Location', 'Contact', ['location', 'address', 'map', 'place', 'city'],
    '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'),

  icon('globe', 'Website', 'Contact', ['website', 'globe', 'internet', 'url', 'link'],
    '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'),

  icon('link', 'Link / URL', 'Contact', ['link', 'url', 'chain'],
    '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),

  // ── Social ──────────────────────────────────────────────────
  solidIcon('linkedin', 'LinkedIn', 'Social', ['linkedin', 'professional', 'network', 'social'],
    '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>'),

  solidIcon('github', 'GitHub', 'Social', ['github', 'code', 'repository', 'dev', 'developer'],
    '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>'),

  icon('twitter', 'Twitter / X', 'Social', ['twitter', 'x', 'social', 'tweet'],
    '<path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>'),

  icon('instagram', 'Instagram', 'Social', ['instagram', 'photo', 'social'],
    '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>'),

  icon('youtube', 'YouTube', 'Social', ['youtube', 'video', 'media'],
    '<path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02"/>'),

  icon('behance', 'Behance', 'Social', ['behance', 'design', 'portfolio'],
    '<path d="M1 12H13c0 3.31-2.69 6-6 6S1 15.31 1 12zm0 0c0-3.31 2.69-6 6-6 2.2 0 4.12 1.19 5.18 2.96"/><path d="M22 9.5h-6"/><path d="M16 7h6v5h-6z"/><path d="M16 12h5a3 3 0 0 1 0 6h-5z"/>'),

  icon('dribbble', 'Dribbble', 'Social', ['dribbble', 'design', 'portfolio'],
    '<circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/>'),

  icon('medium', 'Medium', 'Social', ['medium', 'blog', 'writing'],
    '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h4l2 9 2-9h4"/><line x1="7" y1="17" x2="9.5" y2="17"/>'),

  icon('stackoverflow', 'Stack Overflow', 'Social', ['stackoverflow', 'developer', 'code', 'programming'],
    '<path d="M18 20H6v-2h12v2z"/><path d="M7.4 15.5l9.6 2-.4 2-9.6-2z"/><path d="M8.6 11.1l8.9 4.1-.8 1.8-8.9-4.1z"/><path d="M11.3 7.2l7.6 6.2-1.2 1.5-7.6-6.2z"/>'),

  // ── Work / Skills ────────────────────────────────────────────
  icon('briefcase', 'Work / Job', 'Work', ['briefcase', 'work', 'job', 'experience', 'career'],
    '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>'),

  icon('code', 'Code', 'Work', ['code', 'developer', 'programming', 'software'],
    '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'),

  icon('design', 'Design', 'Work', ['design', 'creative', 'art', 'figma', 'pen'],
    '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>'),

  icon('analytics', 'Analytics', 'Work', ['analytics', 'data', 'chart', 'statistics', 'metrics'],
    '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'),

  icon('chart-pie', 'Chart', 'Work', ['chart', 'pie', 'data', 'analytics', 'graph'],
    '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>'),

  icon('award', 'Award', 'Work', ['award', 'achievement', 'badge', 'honor', 'recognition'],
    '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>'),

  icon('star', 'Star / Rating', 'Work', ['star', 'rating', 'skill', 'level'],
    '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),

  icon('zap', 'Lightning / Fast', 'Work', ['zap', 'fast', 'speed', 'energy', 'skill'],
    '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'),

  icon('settings', 'Settings / Engineering', 'Work', ['settings', 'engineering', 'technical', 'developer'],
    '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),

  icon('target', 'Target / Goal', 'Work', ['target', 'goal', 'aim', 'focus', 'objective'],
    '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),

  icon('layers', 'Layers / Stack', 'Work', ['layers', 'stack', 'full-stack', 'backend', 'frontend'],
    '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>'),

  icon('cpu', 'CPU / Tech', 'Work', ['cpu', 'tech', 'hardware', 'computer', 'processor'],
    '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>'),

  icon('database', 'Database', 'Work', ['database', 'data', 'backend', 'sql', 'storage'],
    '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>'),

  icon('git-branch', 'Git / Version Control', 'Work', ['git', 'version control', 'branch', 'developer'],
    '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>'),

  // ── Education ────────────────────────────────────────────────
  icon('graduation', 'Graduation Cap', 'Education', ['education', 'university', 'degree', 'graduation', 'school'],
    '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>'),

  icon('book', 'Book', 'Education', ['book', 'education', 'learning', 'study', 'read'],
    '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),

  icon('certificate', 'Certificate', 'Education', ['certificate', 'diploma', 'qualification', 'achievement'],
    '<circle cx="12" cy="8" r="6"/><path d="M12 14v7"/><path d="M9 18l3 3 3-3"/>'),

  icon('pencil', 'Pencil / Edit', 'Education', ['pencil', 'write', 'edit', 'skills'],
    '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>'),

  // ── General Resume ───────────────────────────────────────────
  icon('check-circle', 'Check / Done', 'General', ['check', 'done', 'completed', 'tick', 'success'],
    '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'),

  icon('check', 'Checkmark', 'General', ['check', 'tick', 'bullet', 'list'],
    '<polyline points="20 6 9 17 4 12"/>'),

  icon('arrow-right', 'Arrow Right', 'General', ['arrow', 'next', 'point', 'direction'],
    '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'),

  icon('circle-dot', 'Bullet Point', 'General', ['bullet', 'point', 'list', 'item'],
    '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>'),

  icon('user', 'Person / User', 'General', ['person', 'user', 'profile', 'contact', 'about'],
    '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),

  icon('users', 'Team', 'General', ['team', 'people', 'group', 'leadership', 'collaboration'],
    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),

  icon('calendar', 'Calendar / Date', 'General', ['calendar', 'date', 'time', 'schedule'],
    '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),

  icon('clock', 'Clock / Time', 'General', ['clock', 'time', 'duration', 'schedule'],
    '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),

  icon('heart', 'Heart / Passion', 'General', ['heart', 'passion', 'love', 'interest', 'hobby'],
    '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>'),

  icon('flag', 'Flag / Achievement', 'General', ['flag', 'achievement', 'milestone', 'country'],
    '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>'),

  icon('send', 'Send / Message', 'General', ['send', 'message', 'email', 'contact'],
    '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>'),

  icon('download', 'Download', 'General', ['download', 'resume', 'pdf', 'export'],
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'),

  icon('printer', 'Print', 'General', ['print', 'printer', 'paper'],
    '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>'),

  icon('file-text', 'Document / Resume', 'General', ['document', 'resume', 'file', 'paper'],
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>'),

  icon('mic', 'Microphone / Speaking', 'General', ['microphone', 'speaking', 'presentation', 'communication'],
    '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>'),

  icon('headphones', 'Headphones', 'General', ['headphones', 'music', 'audio', 'listening'],
    '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>'),

  icon('camera', 'Photography', 'General', ['camera', 'photography', 'photo', 'visual'],
    '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>'),

  icon('map', 'Map', 'General', ['map', 'travel', 'location', 'geography'],
    '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>'),

  icon('home', 'Home / Address', 'General', ['home', 'house', 'address', 'location'],
    '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'),

  icon('trending-up', 'Growth / Trending', 'General', ['growth', 'trending', 'improvement', 'performance'],
    '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>'),

  icon('shield', 'Security / Trust', 'General', ['security', 'trust', 'protection', 'safe'],
    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),

  icon('coffee', 'Coffee / Casual', 'General', ['coffee', 'casual', 'break', 'culture'],
    '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>'),

  icon('package', 'Product / Package', 'General', ['product', 'package', 'deliver', 'project'],
    '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>'),

  icon('tool', 'Tools / Technical', 'General', ['tools', 'technical', 'maintenance', 'engineering'],
    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'),
];

/** Convert SVG string to data URI (colored version) */
export const svgToDataUri = (svgStr: string, color = '#1e293b'): string => {
  const colored = svgStr.replace(/currentColor/g, color);
  const encoded = encodeURIComponent(colored);
  return `data:image/svg+xml,${encoded}`;
};

/** Get all unique categories */
export const getIconCategories = (): string[] => {
  const cats = new Set(RESUME_ICONS.map((i) => i.category));
  return ['All', ...Array.from(cats)];
};

/** Filter icons by query and category */
export const filterIcons = (query: string, category: string): ResumeIcon[] => {
  const q = query.toLowerCase().trim();
  return RESUME_ICONS.filter((icon) => {
    const matchCat = category === 'All' || icon.category === category;
    const matchQ = !q || icon.name.toLowerCase().includes(q) || icon.tags.some((t) => t.includes(q));
    return matchCat && matchQ;
  });
};
