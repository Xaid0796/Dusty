'use client';

/**
 * Section editor panels for the Resume Generator sidebar.
 * One component per section kind.
 */

import React, { useState, useRef } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { useGeneratorStore } from '@/hooks/useGeneratorStore';
import type {
  GeneratorContact,
  GeneratorStyle,
  ResumeSection,
  ExperienceEntry,
  EducationEntry,
  SkillEntry,
  GenericEntry,
} from '@/types/generator';

// ─── Shared form primitives ─────────────────────────────────────────────────

const Label = ({ children }: { children: React.ReactNode }) => (
  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', display: 'block', marginBottom: '4px' }}>
    {children}
  </label>
);


const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ onFocus, ...props }, ref) => {
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      if (onFocus) onFocus(e);
    };
    return (
      <input
        {...props}
        onFocus={handleFocus}
        ref={ref}
        style={{
          width: '100%',
          padding: '7px 10px',
          fontSize: '0.85rem',
          border: '1px solid var(--border-input, #e2e8f0)',
          borderRadius: '6px',
          outline: 'none',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
          background: 'var(--bg-input, #fff)',
          color: 'var(--text-input, #1e293b)',
          ...props.style,
        }}
      />
    );
  }
);
Input.displayName = 'Input';


const Textarea = ({ onFocus, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (onFocus) onFocus(e);
  };
  return (
    <textarea
      {...props}
      onFocus={handleFocus}
      style={{
        width: '100%',
        padding: '8px 10px',
        fontSize: '0.85rem',
        border: '1px solid var(--border-input, #e2e8f0)',
        borderRadius: '6px',
        outline: 'none',
        resize: 'vertical',
        fontFamily: 'inherit',
        lineHeight: 1.5,
        boxSizing: 'border-box',
        color: 'var(--text-input, #1e293b)',
        background: 'var(--bg-input, #fff)',
        ...props.style,
      }}
    />
  );
};

const Divider = () => (
  <hr style={{ border: 'none', borderTop: '1px solid var(--border-card, #f1f5f9)', margin: '8px 0' }} />
);

const FormGroup = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    {children}
  </div>
);

const Grid2 = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
    {children}
  </div>
);

// ─── Contact Editor ─────────────────────────────────────────────────────────

interface ContactEditorProps {
  contact: GeneratorContact;
  onOpenPhotoUpload: () => void;
  onOpenCrop?: () => void;
}

export const ContactEditor: React.FC<ContactEditorProps> = ({ contact, onOpenPhotoUpload, onOpenCrop }) => {
  const { updateContact } = useGeneratorStore();
  const up = (field: Partial<GeneratorContact>) => updateContact(field);

  const hasCustomPhoto = contact.photoUrl && !contact.photoUrl.startsWith('data:image/svg+xml');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Photo row */}
      <FormGroup>
        <Label>Profile Photo</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {contact.photoUrl && (
            <img
              src={contact.photoUrl}
              alt="Preview"
              style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-card, #e2e8f0)', flexShrink: 0 }}
            />
          )}
          <button
            onClick={onOpenPhotoUpload}
            style={{ padding: '6px 12px', fontSize: '0.8rem', border: '1px solid var(--border-btn, #cbd5e1)', borderRadius: '6px', cursor: 'pointer', background: 'var(--bg-btn, #f8fafc)', color: 'var(--text-btn, #475569)', fontFamily: 'inherit' }}
          >
            {contact.photoUrl ? 'Change Photo' : 'Upload Photo'}
          </button>
          {hasCustomPhoto && onOpenCrop && (
            <button
              onClick={onOpenCrop}
              style={{ padding: '6px 12px', fontSize: '0.8rem', border: '1px solid var(--border-btn, #cbd5e1)', borderRadius: '6px', cursor: 'pointer', background: 'var(--bg-btn, #f8fafc)', color: 'var(--text-btn, #475569)', fontFamily: 'inherit' }}
            >
              Crop
            </button>
          )}
          {contact.photoUrl && (
            <button
              onClick={() => up({ photoUrl: '', originalPhotoUrl: '' })}
              style={{ padding: '6px 12px', fontSize: '0.8rem', border: '1px solid var(--border-input, #fecaca)', borderRadius: '6px', cursor: 'pointer', background: 'var(--bg-input, #fff5f5)', color: '#dc2626', fontFamily: 'inherit' }}
            >
              Remove
            </button>
          )}
        </div>
      </FormGroup>

      <Divider />

      <FormGroup>
        <Label>Full Name *</Label>
        <Input value={contact.fullName} onChange={(e) => up({ fullName: e.target.value })} placeholder="e.g. Aravind Sharma" />
      </FormGroup>
      <FormGroup>
        <Label>Professional Title</Label>
        <Input value={contact.title ?? ''} onChange={(e) => up({ title: e.target.value })} placeholder="e.g. Senior Software Engineer" />
      </FormGroup>

      <Divider />

      <Grid2>
        <FormGroup>
          <Label>Email</Label>
          <Input type="email" value={contact.email ?? ''} onChange={(e) => up({ email: e.target.value })} placeholder="email@example.com" />
        </FormGroup>
        <FormGroup>
          <Label>Phone Number</Label>
          <Input type="tel" value={contact.phone ?? ''} onChange={(e) => up({ phone: e.target.value })} placeholder="+91 98765 43210" />
        </FormGroup>
      </Grid2>
      <Grid2>
        <FormGroup>
          <Label>Location</Label>
          <Input value={contact.location ?? ''} onChange={(e) => up({ location: e.target.value })} placeholder="City, State" />
        </FormGroup>
        <FormGroup>
          <Label>Website</Label>
          <Input value={contact.website ?? ''} onChange={(e) => up({ website: e.target.value })} placeholder="yourportfolio.com" />
        </FormGroup>
      </Grid2>
      <Grid2>
        <FormGroup>
          <Label>LinkedIn</Label>
          <Input value={contact.linkedin ?? ''} onChange={(e) => up({ linkedin: e.target.value })} placeholder="linkedin.com/in/yourname" />
        </FormGroup>
        <FormGroup>
          <Label>GitHub</Label>
          <Input value={contact.github ?? ''} onChange={(e) => up({ github: e.target.value })} placeholder="github.com/yourname" />
        </FormGroup>
      </Grid2>
      {/* Scroll spacer to guarantee accessibility of last fields */}
      <div style={{ height: '40px', flexShrink: 0 }} />
    </div>
  );
};

// ─── Style Editor ────────────────────────────────────────────────────────────

interface StyleEditorProps {
  style: GeneratorStyle;
}

export const StyleEditor: React.FC<StyleEditorProps> = ({ style }) => {
  const { updateStyle } = useGeneratorStore();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fonts = [
    'Times New Roman',
    'Calibri',
    'Arial',
    'Aptos',
    'Helvetica',
    'Lato',
    'Roboto',
    'Garamond',
    'Cambria',
    'Georgia'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.5 }}>
        Choose a professional typography style and accent colors for your resume.
      </p>
      
      <FormGroup>
        <Label>Font Family</Label>
        <select
          value={style.fontFamily || 'Times New Roman'}
          onChange={(e) => updateStyle({ fontFamily: e.target.value })}
          style={{
            width: '100%',
            padding: '8px 10px',
            fontSize: '0.85rem',
            border: '1px solid var(--border-input, #e2e8f0)',
            borderRadius: '6px',
            outline: 'none',
            background: 'var(--bg-input, #fff)',
            color: 'var(--text-input, #1e293b)',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          {fonts.map((f) => (
            <option key={f} value={f} style={{ background: 'var(--bg-input, #fff)', color: 'var(--text-input, #1e293b)' }}>
              {f}
            </option>
          ))}
        </select>
      </FormGroup>

      <Grid2>
        <FormGroup>
          <Label>Primary Color</Label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              value={style.primaryColor || '#1e3a8a'}
              onChange={(e) => updateStyle({ primaryColor: e.target.value })}
              style={{ width: 36, height: 36, border: 'none', padding: 0, cursor: 'pointer', borderRadius: '6px', flexShrink: 0 }}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)', fontFamily: 'monospace' }}>
              {style.primaryColor}
            </span>
          </div>
        </FormGroup>
        <FormGroup>
          <Label>Secondary Color</Label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              value={style.secondaryColor || '#0d9488'}
              onChange={(e) => updateStyle({ secondaryColor: e.target.value })}
              style={{ width: 36, height: 36, border: 'none', padding: 0, cursor: 'pointer', borderRadius: '6px', flexShrink: 0 }}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)', fontFamily: 'monospace' }}>
              {style.secondaryColor}
            </span>
          </div>
        </FormGroup>
      </Grid2>

      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          fontSize: '0.8rem',
          border: '1px solid var(--border-btn, #cbd5e1)',
          borderRadius: '6px',
          background: 'var(--bg-btn, #f8fafc)',
          color: 'var(--text-btn, #475569)',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontWeight: 600,
          marginTop: '4px',
          width: '100%',
        }}
      >
        <span>🛠️ Advanced Customization</span>
        {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {showAdvanced && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '12px',
            borderRadius: '8px',
            background: 'var(--bg-card-header, #f8fafc)',
            border: '1px solid var(--border-card, #e2e8f0)',
            marginTop: '4px',
          }}
        >
          {/* Heading/Name Size */}
          <FormGroup>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '4px' }}>
              <span>Heading / Name Size</span>
              <span>{style.fontSizeName || 28}px</span>
            </div>
            <input
              type="range"
              min={16}
              max={48}
              value={style.fontSizeName || 28}
              onChange={(e) => updateStyle({ fontSizeName: parseInt(e.target.value) })}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </FormGroup>

          {/* Section Heading Size */}
          <FormGroup>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '4px' }}>
              <span>Section Heading Size</span>
              <span>{style.fontSizeHeading || 13}px</span>
            </div>
            <input
              type="range"
              min={10}
              max={24}
              value={style.fontSizeHeading || 13}
              onChange={(e) => updateStyle({ fontSizeHeading: parseInt(e.target.value) })}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </FormGroup>

          {/* Body Text Size */}
          <FormGroup>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '4px' }}>
              <span>Body Text Size</span>
              <span>{style.fontSizeBody || 12.5}px</span>
            </div>
            <input
              type="range"
              min={9}
              max={18}
              step={0.5}
              value={style.fontSizeBody || 12.5}
              onChange={(e) => updateStyle({ fontSizeBody: parseFloat(e.target.value) })}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </FormGroup>

          {/* Supporting Text Size */}
          <FormGroup>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '4px' }}>
              <span>Supporting Text Size</span>
              <span>{style.fontSizeSupport || 11.5}px</span>
            </div>
            <input
              type="range"
              min={8}
              max={16}
              step={0.5}
              value={style.fontSizeSupport || 11.5}
              onChange={(e) => updateStyle({ fontSizeSupport: parseFloat(e.target.value) })}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </FormGroup>

          {/* Line Height */}
          <FormGroup>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '4px' }}>
              <span>Line Spacing (Line Height)</span>
              <span>{style.lineHeight || 1.55}</span>
            </div>
            <input
              type="range"
              min={1.1}
              max={2.0}
              step={0.05}
              value={style.lineHeight || 1.55}
              onChange={(e) => updateStyle({ lineHeight: parseFloat(e.target.value) })}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </FormGroup>

          {/* Section Spacing */}
          <FormGroup>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: '4px' }}>
              <span>Section Spacing</span>
              <span>{style.sectionSpacing || 18}px</span>
            </div>
            <input
              type="range"
              min={5}
              max={40}
              value={style.sectionSpacing || 18}
              onChange={(e) => updateStyle({ sectionSpacing: parseInt(e.target.value) })}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </FormGroup>
        </div>
      )}
    </div>
  );
};

// ─── Summary Editor ──────────────────────────────────────────────────────────

export const SummaryEditor: React.FC<{ section: ResumeSection }> = ({ section }) => {
  const { updateSectionContent } = useGeneratorStore();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Textarea
        rows={5}
        value={section.content ?? ''}
        onChange={(e) => updateSectionContent(section.id, e.target.value)}
        placeholder="Write a brief professional summary..."
      />
      <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
        3–5 sentences summarizing your professional background and key strengths.
      </p>
    </div>
  );
};

// ─── Experience Editor ───────────────────────────────────────────────────────

const newExpEntry = (): ExperienceEntry => ({
  id: `exp-${Date.now()}`,
  position: '',
  company: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
});

export const ExperienceEditor: React.FC<{ section: ResumeSection }> = ({ section }) => {
  const { updateExperienceItems } = useGeneratorStore();
  const items = section.experienceItems ?? [];
  const [expanded, setExpanded] = useState<string | null>(items[0]?.id ?? null);

  const update = (updatedItems: ExperienceEntry[]) =>
    updateExperienceItems(section.id, updatedItems);

  const updateItem = (id: string, patch: Partial<ExperienceEntry>) =>
    update(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const removeItem = (id: string) => {
    update(items.filter((i) => i.id !== id));
    if (expanded === id) setExpanded(null);
  };

  const addItem = () => {
    const entry = newExpEntry();
    update([...items, entry]);
    setExpanded(entry.id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map((item, idx) => (
        <div key={item.id} style={{ border: '1px solid var(--border-card, #e2e8f0)', borderRadius: '8px', overflow: 'hidden' }}>
          <button
            onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-card-header, #f8fafc)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary, #334155)', textAlign: 'left' }}>
              {item.position || `Experience ${idx + 1}`}
              {item.company && <span style={{ fontWeight: 400, color: 'var(--text-secondary, #64748b)' }}> · {item.company}</span>}
            </span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px', display: 'flex', alignItems: 'center' }}>
                <Trash2 size={13} />
              </button>
              {expanded === item.id ? <ChevronUp size={14} color="var(--text-muted, #94a3b8)" /> : <ChevronDown size={14} color="var(--text-muted, #94a3b8)" />}
            </div>
          </button>

          {expanded === item.id && (
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-card, #f1f5f9)' }}>
              <Grid2>
                <FormGroup>
                  <Label>Job Title</Label>
                  <Input value={item.position} onChange={(e) => updateItem(item.id, { position: e.target.value })} placeholder="e.g. Software Engineer" />
                </FormGroup>
                <FormGroup>
                  <Label>Company</Label>
                  <Input value={item.company} onChange={(e) => updateItem(item.id, { company: e.target.value })} placeholder="e.g. Infosys" />
                </FormGroup>
              </Grid2>
              <Grid2>
                <FormGroup>
                  <Label>Start Date</Label>
                  <Input value={item.startDate} onChange={(e) => updateItem(item.id, { startDate: e.target.value })} placeholder="Jan 2022" />
                </FormGroup>
                <FormGroup>
                  <Label>End Date</Label>
                  <Input value={item.current ? 'Present' : item.endDate}
                    onChange={(e) => updateItem(item.id, { endDate: e.target.value })}
                    placeholder="Dec 2023"
                    disabled={item.current}
                    style={{ opacity: item.current ? 0.5 : 1 }}
                  />
                </FormGroup>
              </Grid2>
              <FormGroup>
                <label style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary, #475569)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={item.current} onChange={(e) => updateItem(item.id, { current: e.target.checked, endDate: e.target.checked ? '' : item.endDate })} />
                  Currently working here
                </label>
              </FormGroup>
              <FormGroup>
                <Label>Description</Label>
                <Textarea rows={4} value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  placeholder="Describe your responsibilities and achievements. Use new lines for multiple points." />
              </FormGroup>
            </div>
          )}
        </div>
      ))}

      <button onClick={addItem}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', fontSize: '0.82rem', border: '1px dashed var(--border-btn-hover, #cbd5e1)', borderRadius: '8px', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary, #64748b)', fontFamily: 'inherit', width: '100%', justifyContent: 'center' }}>
        <Plus size={14} /> Add Experience
      </button>
    </div>
  );
};

// ─── Education Editor ────────────────────────────────────────────────────────

const newEduEntry = (): EducationEntry => ({
  id: `edu-${Date.now()}`,
  institution: '',
  degree: '',
  field: '',
  startDate: '',
  endDate: '',
  grade: '',
});

export const EducationEditor: React.FC<{ section: ResumeSection }> = ({ section }) => {
  const { updateEducationItems } = useGeneratorStore();
  const items = section.educationItems ?? [];
  const [expanded, setExpanded] = useState<string | null>(items[0]?.id ?? null);

  const update = (updatedItems: EducationEntry[]) =>
    updateEducationItems(section.id, updatedItems);

  const updateItem = (id: string, patch: Partial<EducationEntry>) =>
    update(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const removeItem = (id: string) => {
    update(items.filter((i) => i.id !== id));
    if (expanded === id) setExpanded(null);
  };

  const addItem = () => {
    const entry = newEduEntry();
    update([...items, entry]);
    setExpanded(entry.id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map((item, idx) => (
        <div key={item.id} style={{ border: '1px solid var(--border-card, #e2e8f0)', borderRadius: '8px', overflow: 'hidden' }}>
          <button
            onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-card-header, #f8fafc)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary, #334155)', textAlign: 'left' }}>
              {item.degree || `Education ${idx + 1}`}
              {item.institution && <span style={{ fontWeight: 400, color: 'var(--text-secondary, #64748b)' }}> · {item.institution}</span>}
            </span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px', display: 'flex', alignItems: 'center' }}>
                <Trash2 size={13} />
              </button>
              {expanded === item.id ? <ChevronUp size={14} color="var(--text-muted, #94a3b8)" /> : <ChevronDown size={14} color="var(--text-muted, #94a3b8)" />}
            </div>
          </button>

          {expanded === item.id && (
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-card, #f1f5f9)' }}>
              <FormGroup>
                <Label>Degree / Qualification</Label>
                <Input value={item.degree} onChange={(e) => updateItem(item.id, { degree: e.target.value })} placeholder="e.g. B.Tech in Computer Science" />
              </FormGroup>
              <FormGroup>
                <Label>Institution</Label>
                <Input value={item.institution} onChange={(e) => updateItem(item.id, { institution: e.target.value })} placeholder="e.g. IIT Madras" />
              </FormGroup>
              <FormGroup>
                <Label>Field of Study (optional)</Label>
                <Input value={item.field ?? ''} onChange={(e) => updateItem(item.id, { field: e.target.value })} placeholder="e.g. Computer Science" />
              </FormGroup>
              <Grid2>
                <FormGroup>
                  <Label>Start Year</Label>
                  <Input value={item.startDate} onChange={(e) => updateItem(item.id, { startDate: e.target.value })} placeholder="2015" />
                </FormGroup>
                <FormGroup>
                  <Label>End Year</Label>
                  <Input value={item.endDate} onChange={(e) => updateItem(item.id, { endDate: e.target.value })} placeholder="2019" />
                </FormGroup>
              </Grid2>
              <FormGroup>
                <Label>Grade / CGPA (optional)</Label>
                <Input value={item.grade ?? ''} onChange={(e) => updateItem(item.id, { grade: e.target.value })} placeholder="e.g. 8.9 CGPA / First Class" />
              </FormGroup>
            </div>
          )}
        </div>
      ))}

      <button onClick={addItem}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', fontSize: '0.82rem', border: '1px dashed var(--border-btn-hover, #cbd5e1)', borderRadius: '8px', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary, #64748b)', fontFamily: 'inherit', width: '100%', justifyContent: 'center' }}>
        <Plus size={14} /> Add Education
      </button>
    </div>
  );
};

// ─── Skills Editor ───────────────────────────────────────────────────────────

export const SkillsEditor: React.FC<{ section: ResumeSection }> = ({ section }) => {
  const { updateSkillItems } = useGeneratorStore();
  const items: SkillEntry[] = section.skillItems ?? [];
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addSkill = () => {
    const name = input.trim();
    if (!name || items.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setInput('');
      return;
    }
    updateSkillItems(section.id, [...items, { id: `sk-${Date.now()}`, name }]);
    setInput('');
  };

  const removeSkill = (id: string) =>
    updateSkillItems(section.id, items.filter((s) => s.id !== id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', minHeight: '36px' }}>
        {items.map((sk) => (
          <span key={sk.id}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--bg-add-btn, #eff6ff)', color: 'var(--text-add-btn, #1e40af)', padding: '4px 9px', borderRadius: '5px', fontSize: '0.8rem', border: '1px solid var(--border-add-btn, #bfdbfe)' }}>
            {sk.name}
            <button onClick={() => removeSkill(sk.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #6b7280)', padding: 0, display: 'flex', alignItems: 'center' }}>
              <Trash2 size={11} />
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
          placeholder="Type a skill and press Enter"
        />
        <button onClick={addSkill}
          style={{ padding: '7px 12px', border: '1px solid var(--border-btn, #cbd5e1)', borderRadius: '6px', background: 'var(--bg-btn, #f8fafc)', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-btn, #475569)', fontFamily: 'inherit' }}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};

// ─── Generic Section Editor (projects, certs, achievements, etc.) ────────────

const newGenericEntry = (): GenericEntry => ({
  id: `ge-${Date.now()}`,
  title: '',
  subtitle: '',
  dateRange: '',
  description: '',
});

export const GenericSectionEditor: React.FC<{ section: ResumeSection }> = ({ section }) => {
  const { updateGenericItems, updateSectionTitle, updateSectionContent } = useGeneratorStore();
  const items: GenericEntry[] = section.genericItems ?? [];
  const [expanded, setExpanded] = useState<string | null>(items[0]?.id ?? null);

  const update = (updatedItems: GenericEntry[]) =>
    updateGenericItems(section.id, updatedItems);

  const updateItem = (id: string, patch: Partial<GenericEntry>) =>
    update(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const removeItem = (id: string) => {
    update(items.filter((i) => i.id !== id));
    if (expanded === id) setExpanded(null);
  };

  const addItem = () => {
    const entry = newGenericEntry();
    update([...items, entry]);
    setExpanded(entry.id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <FormGroup>
        <Label>Section Title</Label>
        <Input
          value={section.title}
          onChange={(e) => updateSectionTitle(section.id, e.target.value)}
          placeholder="e.g. Research, Hobbies, Projects, Personal Statement..."
        />
      </FormGroup>

      <FormGroup>
        <Label>Section Overview / Paragraph Text (optional)</Label>
        <Textarea
          rows={3}
          value={section.content ?? ''}
          onChange={(e) => updateSectionContent(section.id, e.target.value)}
          placeholder="Write any general text or paragraph for this section..."
        />
      </FormGroup>

      <Divider />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)' }}>
          Structured Entries ({items.length})
        </span>
      </div>

      {items.map((item, idx) => (
        <div key={item.id} style={{ border: '1px solid var(--border-card, #e2e8f0)', borderRadius: '8px', overflow: 'hidden' }}>
          <button
            onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-card-header, #f8fafc)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary, #334155)', textAlign: 'left' }}>
              {item.title || `Entry ${idx + 1}`}
            </span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px', display: 'flex', alignItems: 'center' }}>
                <Trash2 size={13} />
              </button>
              {expanded === item.id ? <ChevronUp size={14} color="var(--text-muted, #94a3b8)" /> : <ChevronDown size={14} color="var(--text-muted, #94a3b8)" />}
            </div>
          </button>

          {expanded === item.id && (
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-card, #f1f5f9)' }}>
              <Grid2>
                <FormGroup>
                  <Label>Title</Label>
                  <Input value={item.title} onChange={(e) => updateItem(item.id, { title: e.target.value })} placeholder="Entry title" />
                </FormGroup>
                <FormGroup>
                  <Label>Date / Range</Label>
                  <Input value={item.dateRange ?? ''} onChange={(e) => updateItem(item.id, { dateRange: e.target.value })} placeholder="2023 – Present" />
                </FormGroup>
              </Grid2>
              <FormGroup>
                <Label>Subtitle / Organization (optional)</Label>
                <Input value={item.subtitle ?? ''} onChange={(e) => updateItem(item.id, { subtitle: e.target.value })} placeholder="Organization or role" />
              </FormGroup>
              <FormGroup>
                <Label>Description</Label>
                <Textarea rows={3} value={item.description ?? ''} onChange={(e) => updateItem(item.id, { description: e.target.value })} placeholder="Brief description..." />
              </FormGroup>
            </div>
          )}
        </div>
      ))}

      <button onClick={addItem}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', fontSize: '0.82rem', border: '1px dashed var(--border-btn-hover, #cbd5e1)', borderRadius: '8px', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary, #64748b)', fontFamily: 'inherit', width: '100%', justifyContent: 'center' }}>
        <Plus size={14} /> Add Entry
      </button>
    </div>
  );
};

// ─── Section editor dispatcher ───────────────────────────────────────────────

export const SectionEditorContent: React.FC<{ section: ResumeSection }> = ({ section }) => {
  switch (section.kind) {
    case 'summary': return <SummaryEditor section={section} />;
    case 'experience': return <ExperienceEditor section={section} />;
    case 'education': return <EducationEditor section={section} />;
    case 'skills': return <SkillsEditor section={section} />;
    default: return <GenericSectionEditor section={section} />;
  }
};
