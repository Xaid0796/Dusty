import React from 'react';
import type {
    BiodataDocument,
    BiodataPersonal,
    BiodataFamily,
    BiodataContact,
} from '@/types/biodata';
import styles from './BiodataPreviewModern.module.css';

interface FieldProps {
    label: string;
    value?: string;
}

const Field: React.FC<FieldProps> = ({ label, value }) => {
    if (!value || value.trim() === '') return null;
    return (
        <div className={styles.field}>
            <span className={styles.fieldLabel}>{label}:</span>
            <span className={styles.fieldValue}>{value}</span>
        </div>
    );
};

export const BiodataPreviewModern: React.FC<{ document: BiodataDocument }> = ({
    document,
}) => {
    const { photoHeading, personal, family, contact, style } = document;
    const p = personal as BiodataPersonal;
    const f = family as BiodataFamily;
    const c = contact as BiodataContact;

    return (
        <div className={styles.card} style={{ fontFamily: style.fontFamily || 'Georgia, serif' }}>
            <div className={styles.headerBanner}>
                <div className={styles.headerTitle}>{photoHeading.heading || 'Biodata'}</div>
                <div className={styles.headerMain}>
                    <div className={styles.photoContainer}>
                        {photoHeading.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={photoHeading.photoUrl} alt="Profile" className={styles.photo} />
                        ) : (
                            <div className={styles.photoPlaceholder}>Photo</div>
                        )}
                    </div>
                    <div className={styles.headerInfo}>
                        {p.fullName && <h1 className={styles.fullName}>{p.fullName}</h1>}
                        <p className={styles.subTitle}>
                            {[p.occupation, p.religion, p.caste ? `(${p.caste})` : ''].filter(Boolean).join(' · ')}
                        </p>
                        <div className={styles.quickContact}>
                            {p.dateOfBirth && <span>🎂 {p.dateOfBirth}</span>}
                            {p.placeOfBirth && <span>📍 {p.placeOfBirth}</span>}
                            {c.phone && <span>📞 {c.phone}</span>}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.sectionsContainer}>
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Personal Details</h3>
                    <div className={styles.grid2}>
                        <Field label="Date of Birth" value={p.dateOfBirth} />
                        <Field label="Time of Birth" value={p.timeOfBirth} />
                        <Field label="Place of Birth" value={p.placeOfBirth} />
                        <Field label="Height" value={p.height} />
                        <Field label="Complexion" value={p.complexion} />
                        <Field label="Blood Group" value={p.bloodGroup} />
                        <Field label="Marital Status" value={p.maritalStatus} />
                        <Field label="Diet" value={p.diet} />
                        <Field label="Religion" value={p.religion} />
                        <Field label="Caste" value={p.caste} />
                        <Field label="Gotra" value={p.gotra} />
                        <Field label="Rashi (Moon Sign)" value={p.rashi} />
                        <Field label="Nakshatra" value={p.nakshatra} />
                        <Field label="Manglik" value={p.manglik} />
                        <Field label="Education" value={p.education} />
                        <Field label="Occupation" value={p.occupation} />
                        <Field label="Annual Income" value={p.income} />
                        <Field label="Hobbies" value={p.hobbies} />
                    </div>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Family Details</h3>
                    <div className={styles.grid2}>
                        <Field label="Father's Name" value={f.fatherName} />
                        <Field label="Father's Occupation" value={f.fatherOccupation} />
                        <Field label="Mother's Name" value={f.motherName} />
                        <Field label="Mother's Occupation" value={f.motherOccupation} />
                        <Field label="Siblings" value={f.siblings} />
                        <Field label="Family Type" value={f.familyType} />
                        <Field label="Family Values" value={f.familyValues} />
                        <Field label="Native Place" value={f.nativePlace} />
                    </div>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Contact Details</h3>
                    <div className={styles.grid2}>
                        <Field label="Contact Person" value={c.contactPerson} />
                        <Field label="Phone Number" value={c.phone} />
                        <Field label="Email Address" value={c.email} />
                        <Field label="Residential Address" value={c.address} />
                    </div>
                </div>
            </div>
        </div>
    );
};
