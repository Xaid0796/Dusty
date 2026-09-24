export interface Guide {
    slug: string;
    title: string;
    description: string;
    category: string;
    readTime: string;
    publishedDate: string;
    content: {
        heading: string;
        paragraphs: string[];
        subsections?: {
            subtitle: string;
            body: string[];
        }[];
    }[];
}

export const GUIDES_DATA: Guide[] = [
    {
        slug: 'how-to-write-ats-friendly-resume-2026',
        title: 'How to Write an ATS-Friendly Resume in 2026: Complete Guide',
        description: 'Learn how to bypass Applicant Tracking Systems (ATS) with clean formatting, targeted keywords, and proper section structuring to land more interviews.',
        category: 'Resume Tips',
        readTime: '6 min read',
        publishedDate: '2026-09-24',
        content: [
            {
                heading: 'Understanding Applicant Tracking Systems (ATS)',
                paragraphs: [
                    'Over 75% of large and mid-sized employers use Applicant Tracking Systems (ATS) to automatically scan, parse, and rank incoming resumes before a human recruiter ever sets eyes on them. If your resume uses complex multi-column layouts, graphics, tables, or non-standard headers, the ATS parser may garble your work history, resulting in an automatic rejection.',
                    'To ensure your resume passes the digital gatekeeper, you need a balance of clean machine-readable typography and strategic keyword integration without resorting to keyword stuffing.'
                ],
                subsections: [
                    {
                        subtitle: '1. Choose Clean Layouts Over Graphic Overload',
                        body: [
                            'Avoid multi-column resume templates that place your work experience on the right and skills on the left in floating text boxes. ATS parsers read text strictly from top to left-to-right. Use single-column structures or clean, structured modular grids supported by tools like DocXume.'
                        ]
                    },
                    {
                        subtitle: '2. Incorporate Job Description Keywords Naturally',
                        body: [
                            'Read the job posting carefully and identify core competencies—such as "React.js", "Python", "Agile methodologies", or "Stakeholder management". Weave these exact phrases into your professional summary and bullet points.'
                        ]
                    }
                ]
            },
            {
                heading: 'Essential Formatting Rules for 2026',
                paragraphs: [
                    'Stick to standard section headings such as "Professional Experience", "Education", "Skills", and "Certifications". Creativity in section naming (e.g., "My Career Journey" instead of "Work Experience") confuses ATS parsers.',
                    'Always save and download your resume as a clean PDF or standard DOCX document, ensuring text remains selectable and never flattened into raster images.'
                ]
            }
        ]
    },
    {
        slug: 'difference-between-resume-cv-and-cover-letter',
        title: 'Resume vs. CV vs. Cover Letter: When to Use Which',
        description: 'Confused about whether to submit a resume, a curriculum vitae (CV), or a cover letter? Discover the exact differences, page length rules, and use cases.',
        category: 'Career Advice',
        readTime: '5 min read',
        publishedDate: '2026-09-24',
        content: [
            {
                heading: 'The Core Differences Explained',
                paragraphs: [
                    'Job seekers often use "resume" and "CV" interchangeably, but in professional hiring, they represent distinct document formats with unique expectations.',
                    'A resume is a concise, 1-to-2 page summary of your relevant work history, skills, and achievements tailored for corporate and private sector roles. A Curriculum Vitae (CV), by contrast, is a comprehensive academic chronicle detailing research, publications, grants, teaching experience, and presentations spanning multiple pages.'
                ],
                subsections: [
                    {
                        subtitle: 'When to Use a Resume',
                        body: [
                            'Use a resume for standard corporate jobs, tech roles, marketing positions, finance, and general employment. Keep it punchy and outcome-oriented.'
                        ]
                    },
                    {
                        subtitle: 'When to Use a CV',
                        body: [
                            'Use a CV when applying for university faculty positions, scientific research fellowships, medical residencies, or postdoctoral grants.'
                        ]
                    },
                    {
                        subtitle: 'The Role of the Cover Letter',
                        body: [
                            'A cover letter is your personal introduction. It bridges the gap between your resume facts and your genuine enthusiasm for the company culture.'
                        ]
                    }
                ]
            }
        ]
    },
    {
        slug: 'top-10-resume-action-verbs-that-impress-recruiters',
        title: 'Top 10 Resume Action Verbs That Immediately Impress Recruiters',
        description: 'Transform passive bullet points into high-impact achievements using strong power verbs instead of tired phrases like "responsible for".',
        category: 'Resume Tips',
        readTime: '4 min read',
        publishedDate: '2026-09-24',
        content: [
            {
                heading: 'Why Action Verbs Matter',
                paragraphs: [
                    'Recruiters spend an average of 6 to 7 seconds scanning a resume. Starting your bullet points with weak phrases like "Responsible for managing a team" or "Helped with sales" dilutes your accomplishments.',
                    'Replacing passive phrasing with robust action verbs instantly signals leadership, initiative, and measurable impact.'
                ],
                subsections: [
                    {
                        subtitle: '1. Spearheaded / Orchestrated',
                        body: ['Use these when you led a cross-functional project or launched a new product initiative from scratch.']
                    },
                    {
                        subtitle: '2. Optimized / Streamlined',
                        body: ['Demonstrates that you improved efficiency, reduced operational costs, or decreased system latency.']
                    },
                    {
                        subtitle: '3. Engineered / Architected',
                        body: ['Perfect for technical roles to show mastery over building scalable software systems or database pipelines.']
                    },
                    {
                        subtitle: '4. Accelerated / Maximized',
                        body: ['Highlights your ability to drive revenue growth, user acquisition speed, or key performance metrics.']
                    }
                ]
            }
        ]
    },
    {
        slug: 'how-to-write-a-winning-cover-letter',
        title: 'How to Write a Winning Cover Letter (With Free Templates)',
        description: 'A step-by-step framework to craft a compelling cover letter that complements your resume and catches the hiring manager’s attention.',
        category: 'Cover Letters',
        readTime: '5 min read',
        publishedDate: '2026-09-24',
        content: [
            {
                heading: 'The Anatomy of a Perfect Cover Letter',
                paragraphs: [
                    'While resumes list where you have been, cover letters explain why you want to be here and how your unique skill set solves the company’s current pain points.',
                    'Keep your cover letter to a single page with a professional header matching your resume design.'
                ],
                subsections: [
                    {
                        subtitle: 'The Hook Opening',
                        body: ['Avoid generic openings like "To whom it may concern." Address the hiring manager by name and state a specific achievement or shared passion that connects you to their mission.']
                    },
                    {
                        subtitle: 'The Value Proposition Body',
                        body: ['Highlight one or two major professional wins that directly mirror the requirements in the job description.']
                    }
                ]
            }
        ]
    },
    {
        slug: 'top-interview-questions-and-how-to-answer-them',
        title: 'Top 10 Job Interview Questions and How to Answer Them Like a Pro',
        description: 'Prepare for behavioral and technical interview questions using the STAR method (Situation, Task, Action, Result) with proven example answers.',
        category: 'Interview Prep',
        readTime: '7 min read',
        publishedDate: '2026-09-24',
        content: [
            {
                heading: 'Mastering Behavioral Interviews with STAR',
                paragraphs: [
                    'Interviewers frequently ask questions starting with "Tell me about a time when...". These behavioral queries are best answered using the STAR framework.',
                    'By structuring your response around the Situation, Task, Action, and measurable Result, you keep your answer concise and persuasive.'
                ],
                subsections: [
                    {
                        subtitle: '"Tell me about yourself"',
                        body: ['Keep your pitch to 90 seconds. Summarize your current professional title, highlight 2 major achievements, and explain why you are excited about this opportunity.']
                    },
                    {
                        subtitle: '"What is your greatest weakness?"',
                        body: ['Choose a genuine, non-critical skill you are actively improving (e.g., public speaking or mastering a new framework) and explain the concrete steps you are taking to master it.']
                    }
                ]
            }
        ]
    }
];
