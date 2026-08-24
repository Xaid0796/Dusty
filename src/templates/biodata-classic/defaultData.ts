import { DocumentSchema } from '../schema';

export const defaultBiodataData: DocumentSchema = {
  id: 'pooja-patel-biodata',
  templateId: 'biodata-classic',
  category: 'biodata',
  theme: {
    primaryColor: '#881337', // Maroon / Rose Gold Accent
    secondaryColor: '#b45309', // Amber / Gold
    fontFamily: 'Georgia, serif',
    fontSize: 'medium',
    spacing: 'normal'
  },
  sections: {
    personalInfo: {
      fullName: 'Pooja Patel',
      title: 'Financial Analyst',
      email: 'pooja.patel@email.com',
      phone: '+91 91234 56789',
      location: 'Mumbai, Maharashtra',
      photoUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlMmU4ZjAiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDUiIGZpbGw9IiM5NGEzYjgiLz48cGF0aCBkPSJNNDAgMTgwIEMgNDAgMTMwLCAxNjAgMTMwLCAxNjAgMTgwIFoiIGZpbGw9IiM2NDc0OGIiLz48cGF0aCBkPSJNODEgMTMwIEwxMDAgMTU1IEwxMTUgMTMwIFoiIGZpbGw9IiMxZTNhOGEiLz48cGF0aCBkPSJNMTAwIDE1NSBMMTA2IDE4MCBMOTQgMTgwIFoiIGZpbGw9IiMwZWE1ZTkiLz48L3N2Zz4="
    },
    summary: 'Warm, down-to-earth individual seeking a well-educated, respectful partner who shares family-centric values. Enjoy traveling, cooking Gujarati cuisines, and reading classical literature.',
    biodataDetails: {
      dateOfBirth: '1996-11-12',
      timeOfBirth: '08:45 AM',
      placeOfBirth: 'Ahmedabad, Gujarat',
      rashi: 'Vrishabha (Taurus)',
      nakshatra: 'Rohini',
      height: '5\' 4"',
      complexion: 'Fair',
      caste: 'Patel (Kadva)',
      religion: 'Hindu',
      gothra: 'Kashyap',
      familyBackground: {
        fatherName: 'Ramesh Patel',
        fatherOccupation: 'Business Owner (Textile Manufacturing)',
        motherName: 'Nalini Patel',
        motherOccupation: 'Homemaker',
        siblings: '1 Younger Brother (Software Engineer at TechCorp, Bengaluru)'
      }
    },
    education: [
      {
        id: 'bio-edu-1',
        institution: 'University of Mumbai',
        degree: 'Master of Commerce (M.Com in Finance)',
        startDate: '2017',
        endDate: '2019',
        grade: 'Distinction'
      }
    ],
    experience: [
      {
        id: 'bio-exp-1',
        company: 'HDFC Bank Corporate Office',
        position: 'Senior Corporate Financial Analyst',
        startDate: '2020',
        endDate: 'Present',
        description: 'Analyzing corporate client credit ratings and evaluating portfolio risk assessments.'
      }
    ],
    customSections: []
  }
};
