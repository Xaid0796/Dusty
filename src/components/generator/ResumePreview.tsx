'use client';

import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';
import styles from './ResumePreview.module.css';
import type {
  GeneratorDocument,
  ResumeSection,
  ExperienceEntry,
  EducationEntry,
  SkillEntry,
  GenericEntry,
} from '@/types/generator';
import { getEffectiveColors } from '@/types/generator';
import { ResumePreviewModern } from './ResumePreviewModern';
import { ResumePreviewSidebar } from './ResumePreviewSidebar';
import { ResumePreviewGreta } from './ResumePreviewGreta';
import { ResumePreviewWilliam } from './ResumePreviewWilliam';

// ─── Contact field helper ────────────────────────────────────────────────────
// ─── Contact field helper ────────────────────────────────────────────────────
const ContactItem = ({
  icon: Icon,
  value,
}: {
  icon: React.ElementType;
  value?: string;
}) => {
  if (!value?.trim()) return null;
  return (
    <span className={styles.contactItem}>
      <Icon size={12} />
      {value}
    </span>
  );
};

// ─── Section renderers ───────────────────────────────────────────────────────

const SummarySection = ({ section }: { section: ResumeSection }) => (
  <section className={styles.section}>
    <h2 className={styles.sectionTitle}>{section.title}</h2>
    {section.content?.trim() && (
      <p className={styles.summaryText}>{section.content}</p>
    )}
  </section>
);

const ExperienceSection = ({ section }: { section: ResumeSection }) => {
  const items: ExperienceEntry[] = section.experienceItems ?? [];
  if (!items.length) return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{section.title}</h2>
    </section>
  );
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{section.title}</h2>
      <div className={styles.entryList}>
        {items.map((item) => (
          <div key={item.id} className={styles.entry}>
            <div className={styles.entryHead}>
              <h3 className={styles.entryTitle}>{item.position}</h3>
              <span className={styles.entryDate}>
                {item.startDate}
                {(item.startDate || item.endDate || item.current) && ' – '}
                {item.current ? 'Present' : item.endDate}
              </span>
            </div>
            {item.company && (
              <div className={styles.entrySubtitle}>{item.company}</div>
            )}
            {item.description?.trim() && (
              <p className={styles.entryDesc}>{item.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

const EducationSection = ({ section }: { section: ResumeSection }) => {
  const items: EducationEntry[] = section.educationItems ?? [];
  if (!items.length) return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{section.title}</h2>
    </section>
  );
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{section.title}</h2>
      <div className={styles.entryList}>
        {items.map((item) => (
          <div key={item.id} className={styles.entry}>
            <div className={styles.entryHead}>
              <h3 className={styles.entryTitle}>{item.degree}</h3>
              <span className={styles.entryDate}>
                {item.startDate}
                {(item.startDate || item.endDate) && ' – '}
                {item.endDate}
              </span>
            </div>
            <div className={styles.entrySubtitle}>
              {item.institution}
              {item.grade ? ` · ${item.grade}` : ''}
            </div>
            {item.field && (
              <div className={styles.entryDesc}>{item.field}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

const SkillsSection = ({ section }: { section: ResumeSection }) => {
  const items: SkillEntry[] = section.skillItems ?? [];
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{section.title}</h2>
      {items.length > 0 && (
        <ul className={styles.skillsList}>
          {items.map((sk) => (
            <li key={sk.id} className={styles.skill}>
              {sk.name}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const GenericSection = ({ section }: { section: ResumeSection }) => {
  const items: GenericEntry[] = section.genericItems ?? [];
  const hasContent = Boolean(section.content?.trim());
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{section.title}</h2>
      {hasContent && (
        <p className={styles.summaryText} style={{ marginBottom: items.length ? '10px' : 0 }}>
          {section.content}
        </p>
      )}
      {items.length > 0 && (
        <div className={styles.entryList}>
          {items.map((item) => (
            <div key={item.id} className={styles.entry}>
              <div className={styles.entryHead}>
                {item.title && <h3 className={styles.entryTitle}>{item.title}</h3>}
                {item.dateRange && (
                  <span className={styles.entryDate}>{item.dateRange}</span>
                )}
              </div>
              {item.subtitle?.trim() && (
                <div className={styles.entrySubtitle}>{item.subtitle}</div>
              )}
              {item.description?.trim() && (
                <p className={styles.entryDesc}>{item.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};


// ─── Section dispatcher ──────────────────────────────────────────────────────
const renderSection = (section: ResumeSection) => {
  switch (section.kind) {
    case 'summary':
      return <SummarySection key={section.id} section={section} />;
    case 'experience':
      return <ExperienceSection key={section.id} section={section} />;
    case 'education':
      return <EducationSection key={section.id} section={section} />;
    case 'skills':
      return <SkillsSection key={section.id} section={section} />;
    default:
      return <GenericSection key={section.id} section={section} />;
  }
};

const FONT_STACKS: Record<string, string> = {
  'Times New Roman': '"Times New Roman", Times, serif',
  'Calibri': 'Calibri, Candara, "Segoe UI", Arial, sans-serif',
  'Arial': 'Arial, Helvetica, sans-serif',
  'Aptos': 'Aptos, Calibri, sans-serif',
  'Helvetica': '"Helvetica Neue", Helvetica, Arial, sans-serif',
  'Lato': 'Lato, sans-serif',
  'Roboto': 'Roboto, sans-serif',
  'Garamond': 'Garamond, Baskerville, "Baskerville Old Face", serif',
  'Cambria': 'Cambria, Georgia, serif',
  'Georgia': 'Georgia, serif',
};

// ─── Main Preview ─────────────────────────────────────────────────────────────
interface ResumePreviewProps {
  document: GeneratorDocument;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ document }) => {
  const { contact, style, sections } = document;

  if (style.templateId === 'modern') {
    return <ResumePreviewModern document={document} />;
  }

  if (style.templateId === 'sidebar') {
    return <ResumePreviewSidebar document={document} />;
  }

  if (style.templateId === 'greta') {
    return <ResumePreviewGreta document={document} />;
  }

  if (style.templateId === 'william') {
    return <ResumePreviewWilliam document={document} />;
  }

  const effColors = getEffectiveColors(style);
  const selectedFont = style.fontFamily || 'Times New Roman';
  const fontFamilyValue = FONT_STACKS[selectedFont] || '"Times New Roman", Times, serif';

  const cssVars = {
    '--primary': effColors.primaryColor,
    '--secondary': effColors.secondaryColor,
    fontFamily: fontFamilyValue,
    '--size-name': style.fontSizeName ? `${style.fontSizeName}px` : undefined,
    '--size-heading': style.fontSizeHeading ? `${style.fontSizeHeading}px` : undefined,
    '--size-body': style.fontSizeBody ? `${style.fontSizeBody}px` : undefined,
    '--size-support': style.fontSizeSupport ? `${style.fontSizeSupport}px` : undefined,
    '--section-spacing': style.sectionSpacing ? `${style.sectionSpacing}px` : undefined,
    '--line-height': style.lineHeight ? `${style.lineHeight}` : undefined,
  } as React.CSSProperties;

  return (
    <div className={styles.page} style={cssVars}>
      {/* ── Header: always at top, never reorderable ── */}
      <header className={styles.header}>
        {contact.photoUrl && (
          <img
            src={contact.photoUrl}
            alt={contact.fullName || 'Profile'}
            className={styles.photo}
            crossOrigin="anonymous"
          />
        )}
        <div className={styles.headerInfo}>
          <h1 className={styles.name}>{contact.fullName || 'Your Name'}</h1>
          {contact.title?.trim() && (
            <p className={styles.jobTitle}>{contact.title}</p>
          )}
          <div className={styles.contactRow}>
            <ContactItem icon={Mail} value={contact.email} />
            <ContactItem icon={Phone} value={contact.phone} />
            <ContactItem icon={MapPin} value={contact.location} />
            <ContactItem icon={Globe} value={contact.website} />
            <ContactItem icon={Linkedin} value={contact.linkedin} />
            <ContactItem icon={Github} value={contact.github} />
          </div>
        </div>
      </header>

      {/* ── Sections rendered in sections[] order — this IS the source of truth ── */}
      <div className={styles.body}>
        {sections
          .filter((section) => !section.isDisabled)
          .map((section) => renderSection(section))}
      </div>
    </div>
  );
};
