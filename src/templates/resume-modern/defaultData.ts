import { DocumentSchema } from '../schema';

export const defaultResumeData: DocumentSchema = {
  id: 'aravind-sharma-resume',
  templateId: 'resume-modern',
  category: 'resume',
  theme: {
    primaryColor: '#1e3a8a', // Indigo / Navy Blue
    secondaryColor: '#0d9488', // Teal
    fontFamily: 'Inter, sans-serif',
    fontSize: 'medium',
    spacing: 'normal'
  },
  sections: {
    personalInfo: {
      fullName: 'Aravind Sharma',
      title: 'Senior Software Engineer',
      email: 'aravind.sharma@email.com',
      phone: '+91 98765 43210',
      location: 'Bengaluru, Karnataka',
      website: 'aravindsharma.dev',
      photoUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlMmU4ZjAiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDUiIGZpbGw9IiM5NGEzYjgiLz48cGF0aCBkPSJNNDAgMTgwIEMgNDAgMTMwLCAxNjAgMTMwLCAxNjAgMTgwIFoiIGZpbGw9IiM2NDc0OGIiLz48cGF0aCBkPSJNODEgMTMwIEwxMDAgMTU1IEwxMTUgMTMwIFoiIGZpbGw9IiMxZTNhOGEiLz48cGF0aCBkPSJNMTAwIDE1NSBMMTA2IDE4MCBMOTQgMTgwIFoiIGZpbGw9IiMwZWE1ZTkiLz48L3N2Zz4="
    },
    summary: 'Innovative Senior Software Engineer with 6+ years of experience specializing in React, Next.js, and cloud architecture. Passionate about building high-performance web applications, optimizing build systems, and mentoring cross-functional developer teams to deliver robust products.',
    skills: [
      'TypeScript',
      'React & Next.js',
      'Node.js & Express',
      'PostgreSQL',
      'REST APIs & GraphQL',
      'CSS Modules & Sass',
      'AWS Cloud Services',
      'Git & CI/CD'
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'Indian Institute of Technology, Madras',
        degree: 'B.Tech in Computer Science and Engineering',
        startDate: '2016',
        endDate: '2020',
        grade: '8.9 CGPA'
      },
      {
        id: 'edu-2',
        institution: 'Kendriya Vidyalaya, IIT Madras',
        degree: 'AISSCE (Class XII), Science Stream',
        startDate: '2014',
        endDate: '2016',
        grade: '95.2%'
      }
    ],
    experience: [
      {
        id: 'exp-1',
        company: 'TechCorp Solutions',
        position: 'Lead Frontend Engineer',
        startDate: '2022',
        endDate: 'Present',
        description: 'Led a team of 4 frontend developers to re-architect our B2B SaaS platform using Next.js and custom CSS Modules. Reduced initial page bundle sizes by 35% and boosted Core Web Vitals to green. Integrated robust state machines to handle complex editing flows.'
      },
      {
        id: 'exp-2',
        company: 'WebSolvers Pvt Ltd',
        position: 'Software Engineer',
        startDate: '2020',
        endDate: '2022',
        description: 'Developed and optimized client-facing web applications using React.js. Created a reusable component library from scratch that cut feature development cycles by 20%. Written extensive unit tests using Jest to maintain codebase reliability.'
      }
    ],
    customSections: []
  }
};
