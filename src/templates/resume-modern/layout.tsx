import React from 'react';
import { DocumentSchema } from '../schema';
import styles from './layout.module.css';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { PhotoContainer } from '@/components/shared/PhotoContainer';
const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlMmU4ZjAiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDUiIGZpbGw9IiM5NGEzYjgiLz48cGF0aCBkPSJNNDAgMTgwIEMgNDAgMTMwLCAxNjAgMTMwLCAxNjAgMTgwIFoiIGZpbGw9IiM2NDc0OGIiLz48cGF0aCBkPSJNODUgMTMwIEwxMDAgMTU1IEwxMTUgMTMwIFoiIGZpbGw9IiMxZTNhOGEiLz48cGF0aCBkPSJNMTAwIDE1NSBMMTA2IDE4MCBMOTQgMTgwIFoiIGZpbGw9IiMwZWE1ZTkiLz48L3N2Zz4=";

interface TemplateProps {
  data: DocumentSchema;
}

export const ResumeModernLayout: React.FC<TemplateProps> = ({ data }) => {
  const { theme, sections } = data;
  const { personalInfo, summary, education = [], experience = [], skills = [], customSections = [] } = sections;

  const photoShape = 'circle';

  const fontSizes = theme.fontSizes || {};
  const photoToRender = personalInfo.photoUrl || DEFAULT_AVATAR;

  // Bind local theme values to CSS custom properties
  const customStyles = {
    '--primary-color': theme.primaryColor,
    '--secondary-color': theme.secondaryColor,
    '--font-family': theme.fontFamily,
    fontSize: fontSizes.body ? `${fontSizes.body}px` : (theme.fontSize === 'small' ? '12px' : theme.fontSize === 'large' ? '16px' : '14px'),
    padding: theme.spacing === 'compact' ? '12mm' : theme.spacing === 'spacious' ? '25mm' : '20mm',
    
    // Advanced variables
    '--size-name': `${fontSizes.name || 28}px`,
    '--size-title': `${fontSizes.title || 14}px`,
    '--size-heading': `${fontSizes.heading || 14}px`,
    '--size-subheading': `${fontSizes.subheading || 12}px`,
    '--size-body': `${fontSizes.body || 11}px`,
    '--size-contact': `${fontSizes.contact || 11}px`,
    '--size-metadata': `${fontSizes.metadata || 10}px`,
    '--line-height': theme.lineHeight !== undefined ? `${theme.lineHeight}` : '1.5',
    '--letter-spacing': theme.letterSpacing !== undefined ? `${theme.letterSpacing}px` : '0px',
    '--section-spacing': theme.sectionSpacing !== undefined ? `${theme.sectionSpacing}px` : '15px',
    '--font-weight': theme.fontWeight || 'normal',
    '--text-align': theme.textAlign || 'left',
  } as React.CSSProperties;

  return (
    <div className={styles.a4Page} style={customStyles}>
      {/* Header Area */}
      <header className={styles.header}>
        <PhotoContainer 
          photoUrl={photoToRender} 
          fullName={personalInfo.fullName} 
          shape={photoShape} 
          width="90px" 
          height="90px"
          borderColor={theme.primaryColor}
          borderWidth="3px"
          style={{ marginRight: '20px' }}
        />
        <div className={styles.headerText}>
          <h1 className={styles.name}>{personalInfo.fullName}</h1>
          {personalInfo.title && <p className={styles.title}>{personalInfo.title}</p>}
          
          <div className={styles.contactGrid}>
            <span className={styles.contactItem}>
              <Mail size={12} color={theme.primaryColor} />
              {personalInfo.email}
            </span>
            <span className={styles.contactItem}>
              <Phone size={12} color={theme.primaryColor} />
              {personalInfo.phone}
            </span>
            {personalInfo.location && (
              <span className={styles.contactItem}>
                <MapPin size={12} color={theme.primaryColor} />
                {personalInfo.location}
              </span>
            )}
            {personalInfo.website && (
              <span className={styles.contactItem}>
                <Globe size={12} color={theme.primaryColor} />
                {personalInfo.website}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Core Columns */}
      <div className={styles.mainGrid}>
        {/* Left (Main Work Experience & Ed) */}
        <div className={styles.leftCol}>
          {/* Work Experience */}
          {experience.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Experience</h2>
              {experience.map((exp) => (
                <div key={exp.id} className={styles.item}>
                  <div className={styles.itemHeader}>
                    <h3 className={styles.itemTitle}>{exp.position}</h3>
                    <span className={styles.itemDate}>
                      {exp.startDate} – {exp.endDate}
                    </span>
                  </div>
                  <div className={styles.itemMeta}>
                    {exp.company}
                  </div>
                  {exp.description && <p className={styles.itemDescription}>{exp.description}</p>}
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Education</h2>
              {education.map((edu) => (
                <div key={edu.id} className={styles.item}>
                  <div className={styles.itemHeader}>
                    <h3 className={styles.itemTitle}>{edu.degree}</h3>
                    <span className={styles.itemDate}>
                      {edu.startDate} – {edu.endDate}
                    </span>
                  </div>
                  <div className={styles.itemMeta}>
                    {edu.institution} {edu.grade ? `(${edu.grade})` : ''}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Custom Sections */}
          {customSections.map((sec) => (
            <section key={sec.id} className={styles.section}>
              <h2 className={styles.sectionTitle}>{sec.title}</h2>
              {sec.items.map((item) => (
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemHeader}>
                    <h3 className={styles.itemTitle}>{item.title}</h3>
                    {item.dateRange && <span className={styles.itemDate}>{item.dateRange}</span>}
                  </div>
                  {item.subtitle && <div className={styles.itemMeta}>{item.subtitle}</div>}
                  {item.description && <p className={styles.itemDescription}>{item.description}</p>}
                </div>
              ))}
            </section>
          ))}
        </div>

        {/* Right (Summary & Skills sidebar) */}
        <div className={styles.rightCol}>
          {/* Summary */}
          {summary && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Profile</h2>
              <p className={styles.summaryText}>{summary}</p>
            </section>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Skills</h2>
              <ul className={styles.skillsGrid}>
                {skills.map((skill, index) => (
                  <li key={index} className={styles.skillBadge}>
                    {skill}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
