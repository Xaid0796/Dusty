import { DocumentSchema } from '@/templates/schema';
import { GeneratorDocument } from '@/types/generator';
import { CanvasDocument, CanvasElement } from '@/canvas/types';

/**
 * Converts a GeneratorDocument (from generator store) into a DocumentSchema.
 */
export function convertGeneratorToSchema(genDoc: GeneratorDocument): DocumentSchema {
    const educationSection = genDoc.sections.find((s) => s.kind === 'education');
    const experienceSection = genDoc.sections.find((s) => s.kind === 'experience');
    const summarySection = genDoc.sections.find((s) => s.kind === 'summary');
    const skillsSection = genDoc.sections.find((s) => s.kind === 'skills');

    return {
        id: genDoc.id,
        templateId: genDoc.style?.templateId || 'classic',
        category: 'resume',
        theme: {
            primaryColor: genDoc.style?.primaryColor || '#2c3e50',
            secondaryColor: genDoc.style?.secondaryColor || '#7f8c8d',
            fontFamily: genDoc.style?.fontFamily || 'Segoe UI',
            fontSize: 'medium',
            spacing: 'normal',
        },
        sections: {
            personalInfo: {
                fullName: genDoc.contact?.fullName || '',
                title: genDoc.contact?.title || '',
                email: genDoc.contact?.email || '',
                phone: genDoc.contact?.phone || '',
                location: genDoc.contact?.location || '',
                website: genDoc.contact?.website || '',
                photoUrl: genDoc.contact?.photoUrl || '',
            },
            summary: summarySection?.content || '',
            skills: skillsSection?.skillItems?.map((sk) => sk.name) || [],
            education: (educationSection?.educationItems || []).map((edu, idx) => ({
                id: edu.id || String(idx),
                institution: edu.institution || '',
                degree: edu.degree || '',
                startDate: edu.startDate || '',
                endDate: edu.endDate || '',
                grade: edu.grade || '',
            })),
            experience: (experienceSection?.experienceItems || []).map((exp, idx) => ({
                id: exp.id || String(idx),
                company: exp.company || '',
                position: exp.position || '',
                startDate: exp.startDate || '',
                endDate: exp.endDate || '',
                description: exp.description || '',
            })),
            customSections: [],
        },
    };
}

/**
 * Converts a semantic DocumentSchema into a CanvasDocument model
 * for use in the canvas editor.
 */
export function convertSchemaToCanvas(schema: DocumentSchema): CanvasDocument {
    const elements: CanvasElement[] = [];
    let currentY = 15;
    const marginX = 15;
    const contentWidth = 180;
    let zIndex = 1;

    const primaryColor = schema.theme.primaryColor || '#2c3e50';
    const secondaryColor = schema.theme.secondaryColor || '#7f8c8d';
    const fontFamily = schema.theme.fontFamily || 'Segoe UI';

    // Personal Info Header
    const personal = schema.sections.personalInfo;
    if (personal) {
        if (personal.fullName) {
            elements.push({
                id: 'fullName',
                type: 'text',
                label: 'Full Name',
                x: marginX,
                y: currentY,
                width: contentWidth,
                height: 10,
                rotation: 0,
                zIndex: zIndex++,
                visible: true,
                locked: false,
                content: personal.fullName.toUpperCase(),
                style: {
                    fontFamily,
                    fontSize: 24,
                    fontWeight: 'bold',
                    fontStyle: 'normal',
                    textDecoration: 'none',
                    color: primaryColor,
                    textAlign: 'left',
                    lineHeight: 1.1,
                    letterSpacing: 0.5,
                    padding: 0,
                },
            });
            currentY += 12;
        }

        if (personal.title) {
            elements.push({
                id: 'jobTitle',
                type: 'text',
                label: 'Job Title',
                x: marginX,
                y: currentY,
                width: contentWidth,
                height: 7,
                rotation: 0,
                zIndex: zIndex++,
                visible: true,
                locked: false,
                content: personal.title,
                style: {
                    fontFamily,
                    fontSize: 12,
                    fontWeight: 'normal',
                    fontStyle: 'normal',
                    textDecoration: 'none',
                    color: secondaryColor,
                    textAlign: 'left',
                    lineHeight: 1.2,
                    letterSpacing: 0,
                    padding: 0,
                },
            });
            currentY += 9;
        }

        const contactParts = [
            personal.location,
            personal.email,
            personal.phone,
            personal.website,
        ].filter(Boolean);

        if (contactParts.length > 0) {
            elements.push({
                id: 'contactInfo',
                type: 'text',
                label: 'Contact Info',
                x: marginX,
                y: currentY,
                width: contentWidth,
                height: 8,
                rotation: 0,
                zIndex: zIndex++,
                visible: true,
                locked: false,
                content: contactParts.join(' | '),
                style: {
                    fontFamily,
                    fontSize: 9.5,
                    fontWeight: 'normal',
                    fontStyle: 'normal',
                    textDecoration: 'none',
                    color: '#555555',
                    textAlign: 'left',
                    lineHeight: 1.3,
                    letterSpacing: 0,
                    padding: 0,
                },
            });
            currentY += 10;
        }

        // Divider
        elements.push({
            id: 'header-divider',
            type: 'line',
            label: 'Header Divider',
            x: marginX,
            y: currentY,
            width: contentWidth,
            height: 1,
            rotation: 0,
            zIndex: zIndex++,
            visible: true,
            locked: false,
            stroke: primaryColor,
            strokeWidth: 1.5,
            orientation: 'horizontal',
        });
        currentY += 6;
    }

    // Summary Section
    if (schema.sections.summary) {
        elements.push({
            id: 'summary-heading',
            type: 'text',
            label: 'Summary Heading',
            x: marginX,
            y: currentY,
            width: contentWidth,
            height: 6,
            rotation: 0,
            zIndex: zIndex++,
            visible: true,
            locked: false,
            content: 'PROFESSIONAL SUMMARY',
            style: {
                fontFamily,
                fontSize: 11,
                fontWeight: 'bold',
                fontStyle: 'normal',
                textDecoration: 'none',
                color: primaryColor,
                textAlign: 'left',
                lineHeight: 1.1,
                letterSpacing: 1,
                padding: 0,
            },
        });
        currentY += 7;

        elements.push({
            id: 'summary-body',
            type: 'text',
            label: 'Summary Content',
            x: marginX,
            y: currentY,
            width: contentWidth,
            height: 15,
            rotation: 0,
            zIndex: zIndex++,
            visible: true,
            locked: false,
            content: schema.sections.summary,
            style: {
                fontFamily,
                fontSize: 9.8,
                fontWeight: 'normal',
                fontStyle: 'normal',
                textDecoration: 'none',
                color: '#444444',
                textAlign: 'justify',
                lineHeight: 1.4,
                letterSpacing: 0,
                padding: 0,
            },
        });
        currentY += 18;
    }

    // Education Section
    if (schema.sections.education && schema.sections.education.length > 0) {
        elements.push({
            id: 'education-heading',
            type: 'text',
            label: 'Education Heading',
            x: marginX,
            y: currentY,
            width: contentWidth,
            height: 6,
            rotation: 0,
            zIndex: zIndex++,
            visible: true,
            locked: false,
            content: 'EDUCATION',
            style: {
                fontFamily,
                fontSize: 11,
                fontWeight: 'bold',
                fontStyle: 'normal',
                textDecoration: 'none',
                color: primaryColor,
                textAlign: 'left',
                lineHeight: 1.1,
                letterSpacing: 1,
                padding: 0,
            },
        });
        currentY += 7;

        schema.sections.education.forEach((edu, idx) => {
            elements.push({
                id: `edu-${edu.id || idx}-degree`,
                type: 'text',
                label: `Education ${idx + 1} Degree`,
                x: marginX,
                y: currentY,
                width: 135,
                height: 5,
                rotation: 0,
                zIndex: zIndex++,
                visible: true,
                locked: false,
                content: edu.degree,
                style: {
                    fontFamily,
                    fontSize: 10.5,
                    fontWeight: 'bold',
                    fontStyle: 'normal',
                    textDecoration: 'none',
                    color: primaryColor,
                    textAlign: 'left',
                    lineHeight: 1.2,
                    letterSpacing: 0,
                    padding: 0,
                },
            });

            elements.push({
                id: `edu-${edu.id || idx}-date`,
                type: 'text',
                label: `Education ${idx + 1} Date`,
                x: 150,
                y: currentY,
                width: 45,
                height: 5,
                rotation: 0,
                zIndex: zIndex++,
                visible: true,
                locked: false,
                content: `${edu.startDate} – ${edu.endDate}`,
                style: {
                    fontFamily,
                    fontSize: 10,
                    fontWeight: 'bold',
                    fontStyle: 'normal',
                    textDecoration: 'none',
                    color: primaryColor,
                    textAlign: 'right',
                    lineHeight: 1.2,
                    letterSpacing: 0,
                    padding: 0,
                },
            });
            currentY += 6;

            if (edu.institution) {
                elements.push({
                    id: `edu-${edu.id || idx}-inst`,
                    type: 'text',
                    label: `Education ${idx + 1} Institution`,
                    x: marginX,
                    y: currentY,
                    width: contentWidth,
                    height: 5,
                    rotation: 0,
                    zIndex: zIndex++,
                    visible: true,
                    locked: false,
                    content: edu.institution,
                    style: {
                        fontFamily,
                        fontSize: 9.5,
                        fontWeight: 'normal',
                        fontStyle: 'italic',
                        textDecoration: 'none',
                        color: secondaryColor,
                        textAlign: 'left',
                        lineHeight: 1.2,
                        letterSpacing: 0,
                        padding: 0,
                    },
                });
                currentY += 6;
            }
        });
        currentY += 4;
    }

    // Experience Section
    if (schema.sections.experience && schema.sections.experience.length > 0) {
        elements.push({
            id: 'experience-heading',
            type: 'text',
            label: 'Experience Heading',
            x: marginX,
            y: currentY,
            width: contentWidth,
            height: 6,
            rotation: 0,
            zIndex: zIndex++,
            visible: true,
            locked: false,
            content: 'PROFESSIONAL EXPERIENCE',
            style: {
                fontFamily,
                fontSize: 11,
                fontWeight: 'bold',
                fontStyle: 'normal',
                textDecoration: 'none',
                color: primaryColor,
                textAlign: 'left',
                lineHeight: 1.1,
                letterSpacing: 1,
                padding: 0,
            },
        });
        currentY += 7;

        schema.sections.experience.forEach((exp, idx) => {
            elements.push({
                id: `exp-${exp.id || idx}-pos`,
                type: 'text',
                label: `Experience ${idx + 1} Position`,
                x: marginX,
                y: currentY,
                width: 135,
                height: 5,
                rotation: 0,
                zIndex: zIndex++,
                visible: true,
                locked: false,
                content: exp.position,
                style: {
                    fontFamily,
                    fontSize: 10.5,
                    fontWeight: 'bold',
                    fontStyle: 'normal',
                    textDecoration: 'none',
                    color: primaryColor,
                    textAlign: 'left',
                    lineHeight: 1.2,
                    letterSpacing: 0,
                    padding: 0,
                },
            });

            elements.push({
                id: `exp-${exp.id || idx}-date`,
                type: 'text',
                label: `Experience ${idx + 1} Date`,
                x: 150,
                y: currentY,
                width: 45,
                height: 5,
                rotation: 0,
                zIndex: zIndex++,
                visible: true,
                locked: false,
                content: `${exp.startDate} – ${exp.endDate}`,
                style: {
                    fontFamily,
                    fontSize: 10,
                    fontWeight: 'bold',
                    fontStyle: 'normal',
                    textDecoration: 'none',
                    color: primaryColor,
                    textAlign: 'right',
                    lineHeight: 1.2,
                    letterSpacing: 0,
                    padding: 0,
                },
            });
            currentY += 6;

            if (exp.company) {
                elements.push({
                    id: `exp-${exp.id || idx}-comp`,
                    type: 'text',
                    label: `Experience ${idx + 1} Company`,
                    x: marginX,
                    y: currentY,
                    width: contentWidth,
                    height: 5,
                    rotation: 0,
                    zIndex: zIndex++,
                    visible: true,
                    locked: false,
                    content: exp.company,
                    style: {
                        fontFamily,
                        fontSize: 9.5,
                        fontWeight: 'normal',
                        fontStyle: 'italic',
                        textDecoration: 'none',
                        color: secondaryColor,
                        textAlign: 'left',
                        lineHeight: 1.2,
                        letterSpacing: 0,
                        padding: 0,
                    },
                });
                currentY += 6;
            }

            if (exp.description) {
                elements.push({
                    id: `exp-${exp.id || idx}-desc`,
                    type: 'text',
                    label: `Experience ${idx + 1} Description`,
                    x: marginX,
                    y: currentY,
                    width: contentWidth,
                    height: 12,
                    rotation: 0,
                    zIndex: zIndex++,
                    visible: true,
                    locked: false,
                    content: exp.description,
                    style: {
                        fontFamily,
                        fontSize: 9.5,
                        fontWeight: 'normal',
                        fontStyle: 'normal',
                        textDecoration: 'none',
                        color: '#444444',
                        textAlign: 'left',
                        lineHeight: 1.35,
                        letterSpacing: 0,
                        padding: 0,
                    },
                });
                currentY += 14;
            }
        });
    }

    return {
        id: schema.templateId || 'converted-resume',
        name: 'Converted Resume Document',
        category: schema.category === 'basic' ? 'resume' : schema.category,
        page: {
            id: 'page-1',
            width: 210,
            height: 297,
            background: '#ffffff',
        },
        elements,
    };
}

/**
 * Converts a CanvasDocument back into a DocumentSchema where possible.
 */
export function convertCanvasToSchema(doc: CanvasDocument): DocumentSchema {
    const findContent = (id: string) => {
        const el = doc.elements.find((e) => e.id === id);
        return el && el.type === 'text' ? el.content : '';
    };

    const validCategory: 'resume' | 'cv' | 'cover-letter' | 'basic' =
        doc.category === 'cv' || doc.category === 'cover-letter' || doc.category === 'basic'
            ? doc.category
            : 'resume';

    return {
        id: doc.id,
        templateId: doc.id,
        category: validCategory,
        sections: {
            personalInfo: {
                fullName: findContent('fullName'),
                title: findContent('jobTitle'),
                email: '',
                phone: '',
                location: '',
                website: '',
            },
            summary: findContent('summary-body'),
            skills: [],
            education: [],
            experience: [],
            customSections: [],
        },
        theme: {
            primaryColor: '#2c3e50',
            secondaryColor: '#7f8c8d',
            fontFamily: 'Segoe UI',
            fontSize: 'medium',
            spacing: 'normal',
        },
    };
}
