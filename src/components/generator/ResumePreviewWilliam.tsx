'use client';

import React from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import type {
    GeneratorDocument,
    ResumeSection,
    ExperienceEntry,
    EducationEntry,
    SkillEntry,
    GenericEntry,
} from '@/types/generator';
import { getEffectiveColors } from '@/types/generator';

interface ResumePreviewWilliamProps {
    document: GeneratorDocument;
}

export const ResumePreviewWilliam: React.FC<ResumePreviewWilliamProps> = ({ document }) => {
    const { contact, style, sections } = document;
    const { primaryColor, secondaryColor } = getEffectiveColors(style);
    const fontFamily = style.fontFamily || 'Calibri';
    const fontSizeBody = style.fontSizeBody || 10;
    const fontSizeHeading = style.fontSizeHeading || 11.5;
    const fontSizeName = style.fontSizeName || 26;
    const lineHeight = style.lineHeight || 1.4;
    const sectionSpacing = style.sectionSpacing || 16;

    const summarySection = sections.find((s) => s.kind === 'summary' && !s.isDisabled);

    return (
        <div
            style={{
                width: '100%',
                maxWidth: '210mm',
                minHeight: '297mm',
                background: '#ffffff',
                color: '#222222',
                fontFamily: `${fontFamily}, sans-serif`,
                fontSize: `${fontSizeBody}pt`,
                lineHeight: lineHeight,
                boxSizing: 'border-box',
                display: 'flex',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                borderRadius: '8px',
                overflow: 'hidden',
            }}
        >
            {/* Left Sidebar (Light Gray/White Background with subtle divider) */}
            <div
                style={{
                    width: '35%',
                    background: '#f8f9fa',
                    borderRight: '1px solid #e2e8f0',
                    color: '#222222',
                    padding: '36px 20px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `${sectionSpacing + 4}px`,
                }}
            >
                {/* Photo in Box Frame (NO CIRCLE) */}
                {contact.photoUrl && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                        <div
                            style={{
                                width: '120px',
                                height: '140px',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                border: '2px solid #cbd5e1',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                background: '#e2e8f0',
                            }}
                        >
                            <img
                                src={contact.photoUrl}
                                alt={contact.fullName || 'Profile'}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                    </div>
                )}

                {/* Contact Section */}
                <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: `${fontSizeBody - 0.5}pt` }}>
                        {contact.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', wordBreak: 'break-word', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                                <Phone size={14} style={{ flexShrink: 0, color: '#334155' }} />
                                <span style={{ fontWeight: 500 }}>{contact.phone}</span>
                            </div>
                        )}
                        {contact.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', wordBreak: 'break-word', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                                <Mail size={14} style={{ flexShrink: 0, color: '#334155' }} />
                                <span style={{ fontSize: `${fontSizeBody - 1}pt`, fontWeight: 500 }}>{contact.email}</span>
                            </div>
                        )}
                        {contact.website && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', wordBreak: 'break-word', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                                <Globe size={14} style={{ flexShrink: 0, color: '#334155' }} />
                                <span style={{ fontSize: `${fontSizeBody - 1}pt`, fontWeight: 500 }}>{contact.website}</span>
                            </div>
                        )}
                        {contact.location && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', wordBreak: 'break-word', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                                <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#334155' }} />
                                <span style={{ fontWeight: 500 }}>{contact.location}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Education Section in Sidebar */}
                {sections
                    .filter((s) => !s.isDisabled && s.kind === 'education')
                    .map((section: ResumeSection) => (
                        <div key={section.id}>
                            <h2
                                style={{
                                    fontSize: `${fontSizeHeading}pt`,
                                    fontWeight: 700,
                                    color: '#0f172a',
                                    borderBottom: '1.5px solid #0f172a',
                                    paddingBottom: '4px',
                                    marginBottom: '10px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                }}
                            >
                                {section.title}
                            </h2>
                            {section.educationItems && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {section.educationItems.map((item: EducationEntry) => (
                                        <div key={item.id} style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px' }}>
                                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: `${fontSizeBody}pt` }}>
                                                {item.degree}
                                            </div>
                                            <div style={{ fontSize: `${fontSizeBody - 1}pt`, color: '#475569' }}>
                                                {item.institution} {item.field ? `- ${item.field}` : ''}
                                            </div>
                                            <div style={{ fontSize: `${fontSizeBody - 1.5}pt`, color: '#64748b' }}>
                                                {item.startDate} {item.startDate || item.endDate ? '–' : ''} {item.endDate}
                                                {item.grade ? ` · ${item.grade}` : ''}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                {/* Skills Section in Sidebar */}
                {sections
                    .filter((s) => !s.isDisabled && s.kind === 'skills')
                    .map((section: ResumeSection) => (
                        <div key={section.id}>
                            <h2
                                style={{
                                    fontSize: `${fontSizeHeading}pt`,
                                    fontWeight: 700,
                                    color: '#0f172a',
                                    borderBottom: '1.5px solid #0f172a',
                                    paddingBottom: '4px',
                                    marginBottom: '10px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                }}
                            >
                                {section.title}
                            </h2>
                            {section.skillItems && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {section.skillItems.map((sk: SkillEntry) => (
                                        <div key={sk.id} style={{ color: '#334155', fontSize: `${fontSizeBody - 0.5}pt`, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ color: '#0f172a', fontSize: '10pt' }}>◇</span> {sk.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                {/* Other/Reference/Custom Section in Sidebar */}
                {sections
                    .filter((s) => !s.isDisabled && (s.kind === 'awards' || s.kind === 'certifications' || s.kind === 'custom' || s.kind === 'languages'))
                    .map((section: ResumeSection) => (
                        <div key={section.id}>
                            <h2
                                style={{
                                    fontSize: `${fontSizeHeading}pt`,
                                    fontWeight: 700,
                                    color: '#0f172a',
                                    borderBottom: '1.5px solid #0f172a',
                                    paddingBottom: '4px',
                                    marginBottom: '10px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                }}
                            >
                                {section.title}
                            </h2>
                            <div style={{ fontSize: `${fontSizeBody - 0.5}pt`, color: '#334155', whiteSpace: 'pre-line' }}>
                                {section.content}
                            </div>
                            {section.genericItems && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {section.genericItems.map((item: GenericEntry) => (
                                        <div key={item.id}>
                                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.title}</div>
                                            {item.subtitle && <div style={{ color: '#475569' }}>{item.subtitle}</div>}
                                            {item.description && <div style={{ color: '#64748b' }}>{item.description}</div>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
            </div>

            {/* Right Main Content */}
            <div
                style={{
                    flex: 1,
                    padding: '40px 36px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `${sectionSpacing + 4}px`,
                }}
            >
                {/* Header Name & Title with gray background accent box matching design */}
                <div
                    style={{
                        background: '#f1f5f9',
                        padding: '18px 24px',
                        borderRadius: '6px',
                        borderLeft: '4px solid #0f172a',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <div>
                        <h1
                            style={{
                                fontSize: `${fontSizeName}pt`,
                                fontWeight: 800,
                                color: '#0f172a',
                                margin: '0 0 2px 0',
                                letterSpacing: '0.8px',
                                textTransform: 'uppercase',
                                lineHeight: 1.1,
                            }}
                        >
                            {contact.fullName || 'WILLIAM ALEXANDER'}
                        </h1>
                        {contact.title && (
                            <p
                                style={{
                                    fontSize: `${fontSizeBody + 1}pt`,
                                    fontWeight: 600,
                                    color: '#475569',
                                    margin: 0,
                                    letterSpacing: '0.5px',
                                    textTransform: 'uppercase',
                                }}
                            >
                                {contact.title}
                            </p>
                        )}
                    </div>
                </div>

                {/* Personal Profile / Summary */}
                {summarySection && summarySection.content?.trim() && (
                    <div>
                        <h2
                            style={{
                                fontSize: `${fontSizeHeading}pt`,
                                fontWeight: 700,
                                color: '#0f172a',
                                borderBottom: '1.5px solid #0f172a',
                                paddingBottom: '4px',
                                marginBottom: '10px',
                                textTransform: 'uppercase',
                                letterSpacing: '1.2px',
                            }}
                        >
                            {summarySection.title}
                        </h2>
                        <p style={{ margin: 0, color: '#334155', lineHeight: 1.6, fontSize: `${fontSizeBody}pt`, whiteSpace: 'pre-line' }}>
                            {summarySection.content}
                        </p>
                    </div>
                )}

                {/* Experience & Work Sections */}
                {sections
                    .filter((s) => !s.isDisabled && (s.kind === 'experience' || s.kind === 'volunteer' || s.kind === 'projects' || s.kind === 'internships'))
                    .map((section: ResumeSection) => (
                        <div key={section.id}>
                            <h2
                                style={{
                                    fontSize: `${fontSizeHeading}pt`,
                                    fontWeight: 700,
                                    color: '#0f172a',
                                    borderBottom: '1.5px solid #0f172a',
                                    paddingBottom: '4px',
                                    marginBottom: '12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1.2px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                <span style={{ color: '#0f172a', fontSize: '10pt' }}>◇</span> {section.title}
                            </h2>

                            {section.experienceItems && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {section.experienceItems.map((item: ExperienceEntry) => (
                                        <div key={item.id} style={{ position: 'relative', paddingLeft: '14px', borderLeft: '2px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                                                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: `${fontSizeBody + 0.5}pt` }}>
                                                    {item.position}
                                                </span>
                                                <span style={{ fontSize: `${fontSizeBody - 1}pt`, color: '#64748b', fontWeight: 600 }}>
                                                    {item.startDate} {item.startDate || item.endDate ? '–' : ''} {item.current ? 'Present' : item.endDate}
                                                </span>
                                            </div>
                                            {item.company && (
                                                <div style={{ fontWeight: 600, color: '#475569', fontSize: `${fontSizeBody}pt`, marginBottom: '4px' }}>
                                                    {item.company}
                                                </div>
                                            )}
                                            {item.description && (
                                                <p style={{ margin: 0, color: '#334155', whiteSpace: 'pre-line', fontSize: `${fontSizeBody}pt`, lineHeight: 1.5 }}>
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
            </div>
        </div>
    );
};
