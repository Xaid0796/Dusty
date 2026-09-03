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

interface ResumePreviewGretaProps {
    document: GeneratorDocument;
}

export const ResumePreviewGreta: React.FC<ResumePreviewGretaProps> = ({ document }) => {
    const { contact, style, sections } = document;
    const { primaryColor, secondaryColor } = getEffectiveColors(style);
    const sidebarBg = '#f2e6dc'; // soft warm beige from template
    const fontFamily = style.fontFamily || 'Calibri';
    const fontSizeName = style.fontSizeName || 26;
    const fontSizeHeading = style.fontSizeHeading || 11.5;
    const fontSizeBody = style.fontSizeBody || 10;
    const lineHeight = style.lineHeight || 1.4;
    const sectionSpacing = style.sectionSpacing || 16;

    // Separate sidebar sections (summary / profile, contact, skills, languages, interests) or render them appropriately
    // In Greta's resume: Left column has Profile and Contact Me. Right column has Education, Language, Computer Skills, Volunteer Experience.
    const leftKinds = ['summary', 'skills', 'languages', 'interests', 'custom'];
    const leftSections = sections.filter((s) => !s.isDisabled && (leftKinds.includes(s.kind) || s.kind === 'summary'));
    const rightSections = sections.filter((s) => !s.isDisabled && !leftSections.includes(s));

    const summarySection = sections.find((s) => s.kind === 'summary' && !s.isDisabled);
    const contactSections = sections.filter((s) => !s.isDisabled && s.kind !== 'summary');

    return (
        <div
            style={{
                width: '210mm',
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
            {/* Left Sidebar (Soft Beige) */}
            <div
                style={{
                    width: '35%',
                    background: sidebarBg,
                    color: '#222222',
                    padding: '40px 24px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `${sectionSpacing + 6}px`,
                }}
            >
                {/* Photo */}
                {contact.photoUrl && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                        <div
                            style={{
                                width: '130px',
                                height: '130px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '3px solid #ffffff',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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

                {/* Profile / Summary Section in Sidebar */}
                {summarySection && summarySection.content?.trim() && (
                    <div>
                        <h2
                            style={{
                                fontSize: `${fontSizeHeading}pt`,
                                fontWeight: 700,
                                color: '#111111',
                                borderBottom: '1px solid #d1c4b8',
                                paddingBottom: '4px',
                                marginBottom: '10px',
                                textTransform: 'uppercase',
                                letterSpacing: '1.2px',
                            }}
                        >
                            {summarySection.title}
                        </h2>
                        <p style={{ margin: 0, color: '#333333', lineHeight: 1.5, fontSize: `${fontSizeBody}pt`, whiteSpace: 'pre-line' }}>
                            {summarySection.content}
                        </p>
                    </div>
                )}

                {/* Contact Me Section */}
                <div>
                    <h2
                        style={{
                            fontSize: `${fontSizeHeading}pt`,
                            fontWeight: 700,
                            color: '#111111',
                            borderBottom: '1px solid #d1c4b8',
                            paddingBottom: '4px',
                            marginBottom: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '1.2px',
                        }}
                    >
                        Contact Me
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: `${fontSizeBody}pt` }}>
                        {contact.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', wordBreak: 'break-word' }}>
                                <Phone size={14} style={{ flexShrink: 0, color: '#333333' }} />
                                <span>{contact.phone}</span>
                            </div>
                        )}
                        {contact.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', wordBreak: 'break-word' }}>
                                <Mail size={14} style={{ flexShrink: 0, color: '#333333' }} />
                                <span style={{ fontSize: `${fontSizeBody - 0.5}pt` }}>{contact.email}</span>
                            </div>
                        )}
                        {contact.location && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', wordBreak: 'break-word' }}>
                                <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#333333' }} />
                                <span>{contact.location}</span>
                            </div>
                        )}
                        {contact.website && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', wordBreak: 'break-word' }}>
                                <Globe size={14} style={{ flexShrink: 0, color: '#333333' }} />
                                <span style={{ fontSize: `${fontSizeBody - 0.5}pt` }}>{contact.website}</span>
                            </div>
                        )}
                        {contact.linkedin && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', wordBreak: 'break-word' }}>
                                <Linkedin size={14} style={{ flexShrink: 0, color: '#333333' }} />
                                <span style={{ fontSize: `${fontSizeBody - 0.5}pt` }}>{contact.linkedin}</span>
                            </div>
                        )}
                        {contact.github && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', wordBreak: 'break-word' }}>
                                <Github size={14} style={{ flexShrink: 0, color: '#333333' }} />
                                <span style={{ fontSize: `${fontSizeBody - 0.5}pt` }}>{contact.github}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Left-assigned sections (skills, languages, custom) if any */}
                {sections
                    .filter((s) => !s.isDisabled && (s.kind === 'skills' || s.kind === 'languages' || s.kind === 'interests'))
                    .map((section: ResumeSection) => (
                        <div key={section.id}>
                            <h2
                                style={{
                                    fontSize: `${fontSizeHeading}pt`,
                                    fontWeight: 700,
                                    color: '#111111',
                                    borderBottom: '1px solid #d1c4b8',
                                    paddingBottom: '4px',
                                    marginBottom: '10px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1.2px',
                                }}
                            >
                                {section.title}
                            </h2>

                            {section.kind === 'skills' && section.skillItems && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {section.skillItems.map((sk: SkillEntry) => (
                                        <div key={sk.id} style={{ color: '#333333', fontSize: `${fontSizeBody}pt` }}>
                                            • {sk.name}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {section.kind === 'languages' && section.genericItems && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {section.genericItems.map((item: GenericEntry) => (
                                        <div key={item.id} style={{ color: '#333333', fontSize: `${fontSizeBody}pt` }}>
                                            {item.title} {item.subtitle ? `(${item.subtitle})` : ''}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {section.kind !== 'skills' && section.kind !== 'languages' && (
                                <div style={{ fontSize: `${fontSizeBody}pt`, color: '#333333', whiteSpace: 'pre-line' }}>
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
                    padding: '44px 40px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `${sectionSpacing + 4}px`,
                }}
            >
                {/* Header Name & Title */}
                <div style={{ marginBottom: '8px' }}>
                    <h1
                        style={{
                            fontSize: `${fontSizeName}pt`,
                            fontWeight: 800,
                            color: '#111111',
                            margin: '0 0 4px 0',
                            letterSpacing: '1px',
                            lineHeight: 1.1,
                            textTransform: 'uppercase',
                        }}
                    >
                        {contact.fullName || 'Your Name'}
                    </h1>
                    {contact.title && (
                        <p
                            style={{
                                fontSize: `${fontSizeBody + 1.5}pt`,
                                fontWeight: 600,
                                color: '#444444',
                                margin: 0,
                                letterSpacing: '0.5px',
                            }}
                        >
                            {contact.title}
                        </p>
                    )}
                </div>

                {/* Main Sections (Education, Experience, Volunteer, Certifications, etc. excluding Summary and Left-assigned ones) */}
                {sections
                    .filter((s) => !s.isDisabled && s.kind !== 'summary' && s.kind !== 'skills' && s.kind !== 'languages' && s.kind !== 'interests')
                    .map((section: ResumeSection) => (
                        <div key={section.id}>
                            <h2
                                style={{
                                    fontSize: `${fontSizeHeading}pt`,
                                    fontWeight: 700,
                                    color: '#111111',
                                    borderBottom: '1.5px solid #111111',
                                    paddingBottom: '4px',
                                    marginBottom: '10px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1.2px',
                                }}
                            >
                                {section.title}
                            </h2>

                            {/* Education */}
                            {section.kind === 'education' && section.educationItems && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {section.educationItems.map((item: EducationEntry) => (
                                        <div key={item.id}>
                                            <div style={{ fontWeight: 700, color: '#111111', fontSize: `${fontSizeBody + 0.5}pt` }}>
                                                {item.institution}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555555', fontSize: `${fontSizeBody - 0.5}pt`, fontStyle: 'italic' }}>
                                                <span>{item.degree} {item.field ? `in ${item.field}` : ''}</span>
                                                <span>{item.startDate} {item.startDate || item.endDate ? '–' : ''} {item.endDate}</span>
                                            </div>
                                            {item.grade && (
                                                <div style={{ fontSize: `${fontSizeBody - 0.5}pt`, color: '#666666' }}>{item.grade}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Experience & Volunteer */}
                            {(section.kind === 'experience' || section.kind === 'volunteer') && section.experienceItems && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {section.experienceItems.map((item: ExperienceEntry) => (
                                        <div key={item.id}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                <span style={{ fontWeight: 700, color: '#111111', fontSize: `${fontSizeBody + 0.5}pt` }}>
                                                    {item.position}
                                                </span>
                                                <span style={{ fontSize: `${fontSizeBody - 0.5}pt`, color: '#555555' }}>
                                                    {item.startDate} {item.startDate || item.endDate ? '–' : ''} {item.current ? 'present' : item.endDate}
                                                </span>
                                            </div>
                                            {item.company && (
                                                <div style={{ fontStyle: 'italic', color: '#555555', fontSize: `${fontSizeBody}pt`, marginBottom: '2px' }}>
                                                    {item.company}
                                                </div>
                                            )}
                                            {item.description && (
                                                <p style={{ margin: 0, color: '#333333', whiteSpace: 'pre-line', fontSize: `${fontSizeBody}pt` }}>
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Generic / Custom / Certifications / Awards / etc. */}
                            {section.kind !== 'education' && section.kind !== 'experience' && section.kind !== 'volunteer' && (
                                <div>
                                    {section.content && (
                                        <p style={{ margin: '0 0 6px 0', color: '#333333', whiteSpace: 'pre-line' }}>
                                            {section.content}
                                        </p>
                                    )}
                                    {section.genericItems && section.genericItems.length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {section.genericItems.map((item: GenericEntry) => (
                                                <div key={item.id}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                        <span style={{ fontWeight: 700, color: '#111111', fontSize: `${fontSizeBody + 0.5}pt` }}>
                                                            {item.title}
                                                        </span>
                                                        {item.dateRange && (
                                                            <span style={{ fontSize: `${fontSizeBody - 0.5}pt`, color: '#555555' }}>
                                                                {item.dateRange}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.subtitle && (
                                                        <div style={{ fontStyle: 'italic', color: '#555555', fontSize: `${fontSizeBody}pt` }}>
                                                            {item.subtitle}
                                                        </div>
                                                    )}
                                                    {item.description && (
                                                        <p style={{ margin: '2px 0 0 0', color: '#333333', whiteSpace: 'pre-line', fontSize: `${fontSizeBody}pt` }}>
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
