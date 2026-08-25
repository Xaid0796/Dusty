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

interface ResumePreviewSidebarProps {
    document: GeneratorDocument;
}

export const ResumePreviewSidebar: React.FC<ResumePreviewSidebarProps> = ({ document }) => {
    const { contact, style, sections } = document;
    const { primaryColor, secondaryColor } = getEffectiveColors(style);
    const fontFamily = style.fontFamily || 'Times New Roman';
    const fontSizeName = style.fontSizeName || 24;
    const fontSizeHeading = style.fontSizeHeading || 12;
    const fontSizeBody = style.fontSizeBody || 10.5;
    const lineHeight = style.lineHeight || 1.4;
    const sectionSpacing = style.sectionSpacing || 16;

    // Separate sidebar sections (skills, languages, interests) from main sections (summary, experience, education, etc.)
    const sidebarKinds = ['skills', 'languages', 'interests'];
    const sidebarSections = sections.filter((s) => !s.isDisabled && sidebarKinds.includes(s.kind));
    const mainSections = sections.filter((s) => !s.isDisabled && !sidebarKinds.includes(s.kind));

    const summarySection = mainSections.find((s) => s.kind === 'summary');
    const contentMainSections = mainSections.filter((s) => s.kind !== 'summary');

    return (
        <div
            style={{
                width: '100%',
                maxWidth: '210mm',
                minHeight: '297mm',
                background: '#ffffff',
                color: '#1e293b',
                fontFamily: `${fontFamily}, serif`,
                fontSize: `${fontSizeBody}pt`,
                lineHeight: lineHeight,
                boxSizing: 'border-box',
                display: 'flex',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                borderRadius: '8px',
                overflow: 'hidden',
            }}
        >
            {/* Left Sidebar */}
            <div
                style={{
                    width: '32%',
                    background: primaryColor,
                    color: '#ffffff',
                    padding: '32px 20px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `${sectionSpacing + 4}px`,
                }}
            >
                {/* Photo */}
                {contact.photoUrl && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                        <div
                            style={{
                                width: '110px',
                                height: '110px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '3px solid rgba(255,255,255,0.8)',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
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

                {/* Name & Title */}
                <div style={{ textAlign: 'center' }}>
                    <h1
                        style={{
                            fontSize: `${fontSizeName}pt`,
                            fontWeight: 700,
                            color: '#ffffff',
                            margin: '0 0 6px 0',
                            letterSpacing: '0.5px',
                            lineHeight: 1.15,
                        }}
                    >
                        {contact.fullName || 'Your Name'}
                    </h1>
                    {contact.title && (
                        <p
                            style={{
                                fontSize: `${fontSizeBody}pt`,
                                fontWeight: 500,
                                color: 'rgba(255,255,255,0.85)',
                                margin: 0,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                            }}
                        >
                            {contact.title}
                        </p>
                    )}
                </div>

                {/* Contact Section */}
                <div>
                    <h2
                        style={{
                            fontSize: `${fontSizeHeading}pt`,
                            fontWeight: 700,
                            color: '#ffffff',
                            borderBottom: '1px solid rgba(255,255,255,0.3)',
                            paddingBottom: '4px',
                            marginBottom: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                        }}
                    >
                        Contact
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: `${fontSizeBody - 0.5}pt` }}>
                        {contact.location && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', wordBreak: 'break-word' }}>
                                <MapPin size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span>{contact.location}</span>
                            </div>
                        )}
                        {contact.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
                                <Phone size={13} style={{ flexShrink: 0 }} />
                                <span>{contact.phone}</span>
                            </div>
                        )}
                        {contact.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
                                <Mail size={13} style={{ flexShrink: 0 }} />
                                <span style={{ fontSize: `${fontSizeBody - 1}pt` }}>{contact.email}</span>
                            </div>
                        )}
                        {contact.website && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
                                <Globe size={13} style={{ flexShrink: 0 }} />
                                <span style={{ fontSize: `${fontSizeBody - 1}pt` }}>{contact.website}</span>
                            </div>
                        )}
                        {contact.linkedin && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
                                <Linkedin size={13} style={{ flexShrink: 0 }} />
                                <span style={{ fontSize: `${fontSizeBody - 1}pt` }}>{contact.linkedin}</span>
                            </div>
                        )}
                        {contact.github && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
                                <Github size={13} style={{ flexShrink: 0 }} />
                                <span style={{ fontSize: `${fontSizeBody - 1}pt` }}>{contact.github}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Sections (Skills, Languages, Interests) */}
                {sidebarSections.map((section: ResumeSection) => (
                    <div key={section.id}>
                        <h2
                            style={{
                                fontSize: `${fontSizeHeading}pt`,
                                fontWeight: 700,
                                color: '#ffffff',
                                borderBottom: '1px solid rgba(255,255,255,0.3)',
                                paddingBottom: '4px',
                                marginBottom: '10px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                            }}
                        >
                            {section.title}
                        </h2>

                        {section.kind === 'skills' && section.skillItems && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {section.skillItems.map((sk: SkillEntry) => (
                                    <div
                                        key={sk.id}
                                        style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            border: '1px solid rgba(255,255,255,0.25)',
                                            borderRadius: '16px',
                                            padding: '5px 12px',
                                            fontSize: `${fontSizeBody - 0.5}pt`,
                                            textAlign: 'center',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {sk.name}
                                    </div>
                                ))}
                            </div>
                        )}

                        {section.kind === 'languages' && section.genericItems && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {section.genericItems.map((item: GenericEntry) => (
                                    <div
                                        key={item.id}
                                        style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            border: '1px solid rgba(255,255,255,0.25)',
                                            borderRadius: '16px',
                                            padding: '4px 10px',
                                            fontSize: `${fontSizeBody - 0.5}pt`,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {item.title}
                                    </div>
                                ))}
                            </div>
                        )}

                        {section.kind !== 'skills' && section.kind !== 'languages' && (
                            <div style={{ fontSize: `${fontSizeBody - 0.5}pt`, opacity: 0.9, whiteSpace: 'pre-line' }}>
                                {section.content}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Right Main Content */}
            <div
                style={{
                    flex: 1,
                    padding: '36px 36px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `${sectionSpacing}px`,
                }}
            >
                {/* Summary */}
                {summarySection && summarySection.content?.trim() && (
                    <div>
                        <h2
                            style={{
                                fontSize: `${fontSizeHeading + 1}pt`,
                                fontWeight: 700,
                                color: primaryColor,
                                borderBottom: '1px solid #cbd5e1',
                                paddingBottom: '4px',
                                marginBottom: '12px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                            }}
                        >
                            {summarySection.title}
                        </h2>
                        <p style={{ margin: 0, color: '#334155', lineHeight: 1.5, fontSize: `${fontSizeBody}pt`, whiteSpace: 'pre-line' }}>
                            {summarySection.content}
                        </p>
                    </div>
                )}

                {/* Main Sections */}
                {contentMainSections.map((section: ResumeSection) => (
                    <div key={section.id}>
                        <h2
                            style={{
                                fontSize: `${fontSizeHeading + 1}pt`,
                                fontWeight: 700,
                                color: primaryColor,
                                borderBottom: '1px solid #cbd5e1',
                                paddingBottom: '4px',
                                marginBottom: '12px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                            }}
                        >
                            {section.title}
                        </h2>

                        {/* Experience */}
                        {section.kind === 'experience' && section.experienceItems && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {section.experienceItems.map((item: ExperienceEntry) => (
                                    <div key={item.id}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                                            <span style={{ fontWeight: 700, color: secondaryColor, fontSize: `${fontSizeBody + 0.5}pt` }}>
                                                {item.position}
                                            </span>
                                            <span style={{ fontSize: `${fontSizeBody - 1}pt`, color: '#64748b' }}>
                                                {item.startDate} {item.startDate || item.endDate ? '–' : ''} {item.current ? 'Present' : item.endDate}
                                            </span>
                                        </div>
                                        {item.company && (
                                            <div style={{ fontStyle: 'italic', color: '#475569', fontSize: `${fontSizeBody}pt`, marginBottom: '4px' }}>
                                                {item.company}
                                            </div>
                                        )}
                                        {item.description && (
                                            <p style={{ margin: 0, color: '#334155', whiteSpace: 'pre-line', fontSize: `${fontSizeBody}pt` }}>
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Education */}
                        {section.kind === 'education' && section.educationItems && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {section.educationItems.map((item: EducationEntry) => (
                                    <div key={item.id}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                                            <span style={{ fontWeight: 700, color: secondaryColor, fontSize: `${fontSizeBody + 0.5}pt` }}>
                                                {item.degree}
                                            </span>
                                            <span style={{ fontSize: `${fontSizeBody - 1}pt`, color: '#64748b' }}>
                                                {item.startDate} {item.startDate || item.endDate ? '–' : ''} {item.endDate}
                                            </span>
                                        </div>
                                        <div style={{ fontStyle: 'italic', color: '#475569', fontSize: `${fontSizeBody}pt` }}>
                                            {item.institution} {item.grade ? `· ${item.grade}` : ''}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Generic Sections (Certifications, Projects, etc.) */}
                        {section.kind !== 'experience' && section.kind !== 'education' && (
                            <div>
                                {section.content && (
                                    <p style={{ margin: '0 0 6px 0', color: '#334155', whiteSpace: 'pre-line' }}>
                                        {section.content}
                                    </p>
                                )}
                                {section.genericItems && section.genericItems.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                ))}
            </div>
        </div>
    );
};
