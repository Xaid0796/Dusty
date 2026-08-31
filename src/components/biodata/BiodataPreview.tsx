import React from 'react';
import type {
    BiodataDocument,
    BiodataPersonal,
    BiodataFamily,
    BiodataContact,
} from '@/types/biodata';
import styles from './BiodataPreview.module.css';

interface RowProps {
    label: string;
    value: string;
}

const Row: React.FC<RowProps> = ({ label, value }) => (
    <div className={styles.row}>
        <span className={styles.rowLabel}>{label}</span>
        <span className={styles.rowValue}>{value || '—'}</span>
    </div>
);

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
    <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        <div className={styles.sectionBody}>{children}</div>
    </div>
);

export const BiodataPreview: React.FC<{ document: BiodataDocument }> = ({
    document,
}) => {
    const { photoHeading, personal, family, contact, style } = document;
    const p = personal as BiodataPersonal;
    const f = family as BiodataFamily;
    const c = contact as BiodataContact;

    const cardStyle: React.CSSProperties = {
        fontFamily: style.fontFamily || 'Georgia, serif',
    };

    return (
        <div className={styles.card} style={cardStyle}>
            <div className={styles.heading}>{photoHeading.heading}</div>

            <div className={styles.header}>
                <div className={styles.photoWrap}>
                    {photoHeading.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photoHeading.photoUrl} alt="Profile" className={styles.photo} />
                    ) : (
                        <div className={styles.photoPlaceholder}>Photo</div>
                    )}
                </div>
                <div className={styles.nameBlock}>
                    <h1 className={styles.fullName}>{p.fullName}</h1>
                    <p className={styles.subName}>
                        {p.occupation} {p.religion ? `· ${p.religion}` : ''} {p.caste ? `(${p.caste})` : ''}
                    </p>
                </div>
            </div>

            <Section title="Personal Details">
                <Row label="Full Name" value={p.fullName} />
                <Row label="Date of Birth" value={p.dateOfBirth} />
                <Row label="Time of Birth" value={p.timeOfBirth} />
                <Row label="Place of Birth" value={p.placeOfBirth} />
                <Row label="Height" value={p.height} />
                <Row label="Complexion" value={p.complexion} />
                <Row label="Blood Group" value={p.bloodGroup} />
                <Row label="Marital Status" value={p.maritalStatus} />
                <Row label="Diet" value={p.diet} />
                <Row label="Religion" value={p.religion} />
                <Row label="Caste / Community" value={p.caste} />
                <Row label="Gotra" value={p.gotra} />
                <Row label="Rashi (Moon Sign)" value={p.rashi} />
                <Row label="Nakshatra" value={p.nakshatra} />
                <Row label="Manglik" value={p.manglik} />
                <Row label="Education" value={p.education} />
                <Row label="Occupation" value={p.occupation} />
                <Row label="Annual Income" value={p.income} />
                <Row label="Hobbies" value={p.hobbies} />
            </Section>

            <Section title="Family Details">
                <Row label="Father's Name" value={f.fatherName} />
                <Row label="Father's Occupation" value={f.fatherOccupation} />
                <Row label="Mother's Name" value={f.motherName} />
                <Row label="Mother's Occupation" value={f.motherOccupation} />
                <Row label="Siblings" value={f.siblings} />
                <Row label="Family Type" value={f.familyType} />
                <Row label="Family Values" value={f.familyValues} />
                <Row label="Native Place" value={f.nativePlace} />
            </Section>

            <Section title="Contact Details">
                <Row label="Contact Person" value={c.contactPerson} />
                <Row label="Phone Number" value={c.phone} />
                <Row label="Email Address" value={c.email} />
                <Row label="Address" value={c.address} />
            </Section>

            <div className={styles.footer}>
                Matrimonial Biodata · Generated professionally
            </div>
        </div>
    );
};
