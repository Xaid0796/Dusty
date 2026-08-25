'use client';

import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';
import type {
    GeneratorDocument,
    ResumeSection,
    ExperienceEntry,
    EducationEntry,
    SkillEntry,
    GenericEntry,
} from '@/types/generator';
import { getEffectiveColors } from '@/types/generator';

interface ResumePreviewModernProps {
    document: GeneratorDocument;
}

export const ResumePreviewModern: React.FC<ResumePreviewModernProps> = ({ document }) => {
    const { contact, style, sections } = document;
    const { primaryColor, secondaryColor } = getEffectiveColors(style);
    const fontFamily = style.fontFamily || 'Calibri';
    const fontSizeName = style.fontSizeName || 26;
    const fontSizeHeading = style.fontSizeHeading || 12;
    const fontSizeBody = style.fontSizeBody || 11;
    const lineHeight = style.lineHeight || 1.4;
    const sectionSpacing = style.sectionSpacing || 14;

    return (
        <div
            style={{
                width: '100%',
                maxWidth: '210mm',
                minHeight: '297mm',
                background: '#ffffff',
                color: '#1e293b',
                fontFamily: `${fontFamily}, sans-serif`,
                fontSize: `${fontSizeBody}pt`,
                lineHeight: lineHeight,
                padding: '36px 40px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                gap: `${sectionSpacing}px`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                borderRadius: '8px',
            }}
        >
            {/* Modern Header with Top Accent Bar */}
            <div
                style={{
                    borderBottom: `3px solid ${primaryColor}`,
                    paddingBottom: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '20px',
                }}
            >
                <div style={{ flex: 1 }}>
                    <h1
                        style={{
                            fontSize: `${fontSizeName}pt`,
                            fontWeight: 800,
                            color: secondaryColor,
                            margin: '0 0 4px 0',
                            letterSpacing: '-0.5px',
                        }}
                    >
                        {contact.fullName || 'Your Name'}
                    </h1>
                    {contact.title && (
                        <p
                            style={{
                                fontSize: `${fontSizeHeading + 1}pt`,
                                fontWeight: 600,
                                color: primaryColor,
                                margin: '0 0 10px 0',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                            }}
                        >
                            {contact.title}
                        </p>
                    )}
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '12px',
                            fontSize: `${fontSizeBody - 1}pt`,
                            color: '#64748b',
                        }}
                    >
                        {contact.email && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Mail size={12} color={primaryColor} /> {contact.email}
                            </span>
                        )}
                        {contact.phone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Phone size={12} color={primaryColor} /> {contact.phone}
                            </span>
                        )}
                        {contact.location && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={12} color={primaryColor} /> {contact.location}
                            </span>
                        )}
                        {contact.website && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Globe size={12} color={primaryColor} /> {contact.website}
                            </span>
                        )}
                        {contact.linkedin && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Linkedin size={12} color={primaryColor} /> {contact.linkedin}
                            </span>
                        )}
                        {contact.github && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Github size={12} color={primaryColor} /> {contact.github}
                            </span>
                        )}
                    </div>
                </div>

                {contact.photoUrl && (
                    <div
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: `2px solid ${primaryColor}`,
                            flexShrink: 0,
                        }}
                    >
                        <img
                            src={contact.photoUrl}
                            alt={contact.fullName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                )}
            </div>

            {/* Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${sectionSpacing}px` }}>
                {sections.map((section) => {
                    if (section.isDisabled) return null;

                    return (
                        <div key={section.id}>
                            <h2
                                style={{
                                    fontSize: `${fontSizeHeading}pt`,
                                    fontWeight: 700,
                                    color: primaryColor,
                                    borderBottom: `1px solid #e2e8f0`,
                                    paddingBottom: '4px',
                                    marginBottom: '8px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                }}
                            >
                                {section.title}
                            </h2>

                            {/* Summary */}
                            {section.kind === 'summary' && section.content && (
                                <p style={{ margin: 0, color: '#334155', whiteSpace: 'pre-line' }}>
                                    {section.content}
                                </p>
                            )}

                            {/* Experience */}
                            {section.kind === 'experience' && section.experienceItems && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {section.experienceItems.map((item: ExperienceEntry) => (
                                        <div key={item.id}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: secondaryColor }}>
                                                <span>{item.position} {item.company ? `at ${item.company}` : ''}</span>
                                                <span style={{ fontSize: `${fontSizeBody - 1}pt`, color: '#64748b', fontWeight: 400 }}>
                                                    {item.startDate} {item.startDate || item.endDate ? '–' : ''} {item.current ? 'Present' : item.endDate}
                                                </span>
                                            </div>
                                            {item.description && (
                                                <p style={{ margin: '3px 0 0 0', color: '#475569', whiteSpace: 'pre-line' }}>
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Education */}
                            {section.kind === 'education' && section.educationItems && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {section.educationItems.map((item: EducationEntry) => (
                                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, color: secondaryColor }}>{item.degree}</div>
                                                <div style={{ color: '#64748b', fontSize: `${fontSizeBody - 0.5}pt` }}>
                                                    {item.institution} {item.grade ? `· ${item.grade}` : ''}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: `${fontSizeBody - 1}pt`, color: '#64748b' }}>
                                                {item.startDate} {item.startDate || item.endDate ? '–' : ''} {item.endDate}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Skills */}
                            {section.kind === 'skills' && section.skillItems && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {section.skillItems.map((sk: SkillEntry) => (
                                        <span
                                            key={sk.id}
                                            style={{
                                                background: '#f1f5f9',
                                                color: secondaryColor,
                                                padding: '3px 8px',
                                                borderRadius: '4px',
                                                fontSize: `${fontSizeBody - 0.5}pt`,
                                                fontWeight: 500,
                                                border: '1px solid #e2e8f0',
                                            }}
                                        >
                                            {sk.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Generic Sections (Projects, Certifications, etc.) */}
                            {section.kind !== 'summary' &&
                                section.kind !== 'experience' &&
                                section.kind !== 'education' &&
                                section.kind !== 'skills' && (
                                    <div>
                                        {section.content && (
                                            <p style={{ margin: '0 0 6px 0', color: '#334155', whiteSpace: 'pre-line' }}>
                                                {section.content}
                                            </p>
                                        )}
                                        {section.genericItems && section.genericItems.length > 0 && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {section.genericItems.map((item: GenericEntry) => (
                                                    <div key={item.id}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: secondaryColor }}>
                                                            <span>{item.title} {item.subtitle ? `· ${item.subtitle}` : ''}</span>
                                                            {item.dateRange && (
                                                                <span style={{ fontSize: `${fontSizeBody - 1}pt`, color: '#64748b', fontWeight: 400 }}>
                                                                    {item.dateRange}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {item.description && (
                                                            <p style={{ margin: '2px 0 0 0', color: '#475569', whiteSpace: 'pre-line' }}>
                                                                {item.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
