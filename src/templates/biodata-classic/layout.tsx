import React from 'react';
import { DocumentSchema } from '../schema';
import styles from './layout.module.css';
import { PhotoContainer } from '@/components/shared/PhotoContainer';

const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlMmU4ZjAiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDUiIGZpbGw9IiM5NGEzYjgiLz48cGF0aCBkPSJNNDAgMTgwIEMgNDAgMTMwLCAxNjAgMTMwLCAxNjAgMTgwIFoiIGZpbGw9IiM2NDc0OGIiLz48cGF0aCBkPSJNODUgMTMwIEwxMDAgMTU1IEwxMTUgMTMwIFoiIGZpbGw9IiMxZTNhOGEiLz48cGF0aCBkPSJNMTAwIDE1NSBMMTA2IDE4MCBMOTQgMTgwIFoiIGZpbGw9IiMwZWE1ZTkiLz48L3N2Zz4=";

interface TemplateProps {
  data: DocumentSchema;
}

export const BiodataClassicLayout: React.FC<TemplateProps> = ({ data }) => {
  const { theme, sections } = data;
  const { personalInfo, summary, biodataDetails, education = [], experience = [], customSections = [] } = sections;

  const photoShape = 'rounded';

  const fontSizes = theme.fontSizes || {};
  const photoToRender = personalInfo.photoUrl || DEFAULT_AVATAR;

  // Bind local theme values to CSS custom properties
  const customStyles = {
    '--primary-color': theme.primaryColor,
    '--secondary-color': theme.secondaryColor,
    '--font-family': theme.fontFamily,
    fontSize: fontSizes.body ? `${fontSizes.body}px` : (theme.fontSize === 'small' ? '12px' : theme.fontSize === 'large' ? '16px' : '14px'),
    padding: theme.spacing === 'compact' ? '8mm' : theme.spacing === 'spacious' ? '20mm' : '15mm',
    
    // Dynamic typography role variables
    '--size-name': `${fontSizes.name || 24}px`,
    '--size-title': `${fontSizes.title || 14}px`,
    '--size-heading': `${fontSizes.heading || 16}px`,
    '--size-subheading': `${fontSizes.subheading || 13}px`,
    '--size-body': `${fontSizes.body || 12}px`,
    '--size-contact': `${fontSizes.contact || 12}px`,
    '--size-metadata': `${fontSizes.metadata || 11}px`,
    '--line-height': theme.lineHeight !== undefined ? `${theme.lineHeight}` : '1.4',
    '--letter-spacing': theme.letterSpacing !== undefined ? `${theme.letterSpacing}px` : '0px',
    '--section-spacing': theme.sectionSpacing !== undefined ? `${theme.sectionSpacing}px` : '10px',
    '--font-weight': theme.fontWeight || 'bold',
    '--text-align': theme.textAlign || 'center',
  } as React.CSSProperties;

  // Helper to format date strings for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('en-IN', options);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={styles.a4Page} style={customStyles}>
      <div className={styles.borderOuter}>
        {/* Religious/Traditional Invocation */}
        <div className={styles.header}>
          <div className={styles.ganeshaIcon}>|| Shri Ganesha Namah ||</div>
          <h1 className={styles.pageTitle}>Biodata</h1>
        </div>

        {/* Profile Image & General Intro (Pixel Stable Layout) */}
        <div className={styles.profileHeader}>
          <div style={{ flexGrow: 1 }}>
            <div className={styles.grid}>
              <span className={styles.label}>Full Name:</span>
              <span className={styles.value} style={{ fontSize: '1.2rem', fontWeight: 'bold', color: theme.primaryColor }}>
                {personalInfo.fullName}
              </span>
              
              {personalInfo.title && (
                <>
                  <span className={styles.label}>Occupation:</span>
                  <span className={styles.value}>{personalInfo.title}</span>
                </>
              )}
            </div>
          </div>
          <PhotoContainer 
            photoUrl={photoToRender} 
            fullName={personalInfo.fullName} 
            shape={photoShape} 
            width="120px" 
            height="150px"
            borderColor={theme.primaryColor}
            borderWidth="2px"
            style={{ padding: '4px', backgroundColor: '#ffffff' }}
          />
        </div>

        {/* Brief Summary */}
        {summary && <p className={styles.summarySection}>"{summary}"</p>}

        {/* Personal details grid */}
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Personal Details</h2>
          <div className={styles.grid}>
            {biodataDetails?.dateOfBirth && (
              <>
                <span className={styles.label}>Date of Birth:</span>
                <span className={styles.value}>{formatDate(biodataDetails.dateOfBirth)}</span>
              </>
            )}
            {biodataDetails?.timeOfBirth && (
              <>
                <span className={styles.label}>Time of Birth:</span>
                <span className={styles.value}>{biodataDetails.timeOfBirth}</span>
              </>
            )}
            {biodataDetails?.placeOfBirth && (
              <>
                <span className={styles.label}>Place of Birth:</span>
                <span className={styles.value}>{biodataDetails.placeOfBirth}</span>
              </>
            )}
            {biodataDetails?.height && (
              <>
                <span className={styles.label}>Height:</span>
                <span className={styles.value}>{biodataDetails.height}</span>
              </>
            )}
            {biodataDetails?.complexion && (
              <>
                <span className={styles.label}>Complexion:</span>
                <span className={styles.value}>{biodataDetails.complexion}</span>
              </>
            )}
            {biodataDetails?.religion && (
              <>
                <span className={styles.label}>Religion:</span>
                <span className={styles.value}>{biodataDetails.religion}</span>
              </>
            )}
            {biodataDetails?.caste && (
              <>
                <span className={styles.label}>Caste:</span>
                <span className={styles.value}>{biodataDetails.caste}</span>
              </>
            )}
            {biodataDetails?.rashi && (
              <>
                <span className={styles.label}>Rashi (Moon Sign):</span>
                <span className={styles.value}>{biodataDetails.rashi}</span>
              </>
            )}
            {biodataDetails?.nakshatra && (
              <>
                <span className={styles.label}>Nakshatra:</span>
                <span className={styles.value}>{biodataDetails.nakshatra}</span>
              </>
            )}
            {biodataDetails?.gothra && (
              <>
                <span className={styles.label}>Gothra:</span>
                <span className={styles.value}>{biodataDetails.gothra}</span>
              </>
            )}
          </div>
        </section>

        {/* Education Section */}
        {education.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Education</h2>
            <div>
              {education.map((edu) => (
                <div key={edu.id} className={styles.subItem}>
                  <div className={styles.subItemTitle}>{edu.degree}</div>
                  <div className={styles.subItemMeta}>{edu.institution} | {edu.startDate} – {edu.endDate} {edu.grade ? `(${edu.grade})` : ''}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Profession Section */}
        {experience.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Professional Career</h2>
            <div>
              {experience.map((exp) => (
                <div key={exp.id} className={styles.subItem}>
                  <div className={styles.subItemTitle}>{exp.position} at {exp.company}</div>
                  <div className={styles.subItemMeta}>{exp.startDate} – {exp.endDate}</div>
                  {exp.description && <p className={styles.subItemDesc}>{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Family Details Section */}
        {(biodataDetails?.familyBackground?.fatherName || 
          biodataDetails?.familyBackground?.fatherOccupation || 
          biodataDetails?.familyBackground?.motherName || 
          biodataDetails?.familyBackground?.motherOccupation || 
          biodataDetails?.familyBackground?.siblings) && (
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Family Details</h2>
            <div className={styles.grid}>
              {biodataDetails?.familyBackground?.fatherName && (
                <>
                  <span className={styles.label}>Father's Name:</span>
                  <span className={styles.value}>{biodataDetails.familyBackground.fatherName}</span>
                </>
              )}
              {biodataDetails?.familyBackground?.fatherOccupation && (
                <>
                  <span className={styles.label}>Father's Occupation:</span>
                  <span className={styles.value}>{biodataDetails.familyBackground.fatherOccupation}</span>
                </>
              )}
              {biodataDetails?.familyBackground?.motherName && (
                <>
                  <span className={styles.label}>Mother's Name:</span>
                  <span className={styles.value}>{biodataDetails.familyBackground.motherName}</span>
                </>
              )}
              {biodataDetails?.familyBackground?.motherOccupation && (
                <>
                  <span className={styles.label}>Mother's Occupation:</span>
                  <span className={styles.value}>{biodataDetails.familyBackground.motherOccupation}</span>
                </>
              )}
              {biodataDetails?.familyBackground?.siblings && (
                <>
                  <span className={styles.label}>Siblings:</span>
                  <span className={styles.value}>{biodataDetails.familyBackground.siblings}</span>
                </>
              )}
            </div>
          </section>
        )}

        {/* Contact details */}
        <section className={styles.section} style={{ marginTop: 'auto' }}>
          <h2 className={styles.sectionHeading}>Contact Details</h2>
          <div className={styles.grid}>
            <span className={styles.label}>Phone Number:</span>
            <span className={styles.value}>{personalInfo.phone}</span>
            
            <span className={styles.label}>Email Address:</span>
            <span className={styles.value}>{personalInfo.email}</span>

            {personalInfo.location && (
              <>
                <span className={styles.label}>Address:</span>
                <span className={styles.value}>{personalInfo.location}</span>
              </>
            )}
          </div>
        </section>

        {/* Custom Sections */}
        {customSections.map((sec) => (
          <section key={sec.id} className={styles.section}>
            <h2 className={styles.sectionHeading}>{sec.title}</h2>
            <div className={styles.grid}>
              {sec.items.map((item) => (
                <React.Fragment key={item.id}>
                  <span className={styles.label}>{item.title}:</span>
                  <span className={styles.value}>
                    {item.description} {item.subtitle ? `(${item.subtitle})` : ''}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
