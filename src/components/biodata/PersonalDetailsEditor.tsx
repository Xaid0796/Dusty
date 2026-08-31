import React from 'react';
import { useBiodataStore } from '@/hooks/useBiodataStore';
import {
    COMPLEXION_OPTIONS,
    BLOOD_GROUP_OPTIONS,
    MARITAL_STATUS_OPTIONS,
    DIET_OPTIONS,
    MANGALIK_OPTIONS,
} from '@/types/biodata';
import styles from './BiodataEditor.module.css';

export const PersonalDetailsEditor: React.FC = () => {
    const { document, updatePersonal } = useBiodataStore();
    if (!document) return null;
    const p = document.personal;

    const setField = (key: keyof typeof p, val: string) =>
        updatePersonal({ [key]: val });

    return (
        <div>
            <div className={styles.field}>
                <label className={styles.label}>Full Name</label>
                <input
                    className={styles.input}
                    value={p.fullName}
                    onChange={(e) => setField('fullName', e.target.value)}
                />
            </div>

            <div className={styles.grid2}>
                <div className={styles.field}>
                    <label className={styles.label}>Date of Birth</label>
                    <input
                        className={styles.input}
                        value={p.dateOfBirth}
                        onChange={(e) => setField('dateOfBirth', e.target.value)}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Time of Birth</label>
                    <input
                        className={styles.input}
                        value={p.timeOfBirth}
                        onChange={(e) => setField('timeOfBirth', e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Place of Birth</label>
                <input
                    className={styles.input}
                    value={p.placeOfBirth}
                    onChange={(e) => setField('placeOfBirth', e.target.value)}
                />
            </div>

            <div className={styles.grid2}>
                <div className={styles.field}>
                    <label className={styles.label}>Height</label>
                    <input
                        className={styles.input}
                        value={p.height}
                        onChange={(e) => setField('height', e.target.value)}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Complexion</label>
                    <select
                        className={styles.select}
                        value={p.complexion}
                        onChange={(e) => setField('complexion', e.target.value)}
                    >
                        {COMPLEXION_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                                {o}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.grid2}>
                <div className={styles.field}>
                    <label className={styles.label}>Blood Group</label>
                    <select
                        className={styles.select}
                        value={p.bloodGroup}
                        onChange={(e) => setField('bloodGroup', e.target.value)}
                    >
                        {BLOOD_GROUP_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                                {o}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Marital Status</label>
                    <select
                        className={styles.select}
                        value={p.maritalStatus}
                        onChange={(e) => setField('maritalStatus', e.target.value)}
                    >
                        {MARITAL_STATUS_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                                {o}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.grid2}>
                <div className={styles.field}>
                    <label className={styles.label}>Diet</label>
                    <select
                        className={styles.select}
                        value={p.diet}
                        onChange={(e) => setField('diet', e.target.value)}
                    >
                        {DIET_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                                {o}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Religion</label>
                    <input
                        className={styles.input}
                        value={p.religion}
                        onChange={(e) => setField('religion', e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.grid2}>
                <div className={styles.field}>
                    <label className={styles.label}>Caste / Community</label>
                    <input
                        className={styles.input}
                        value={p.caste}
                        onChange={(e) => setField('caste', e.target.value)}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Gotra</label>
                    <input
                        className={styles.input}
                        value={p.gotra}
                        onChange={(e) => setField('gotra', e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.grid2}>
                <div className={styles.field}>
                    <label className={styles.label}>Rashi (Moon Sign)</label>
                    <input
                        className={styles.input}
                        value={p.rashi}
                        onChange={(e) => setField('rashi', e.target.value)}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Nakshatra (Star)</label>
                    <input
                        className={styles.input}
                        value={p.nakshatra}
                        onChange={(e) => setField('nakshatra', e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.grid2}>
                <div className={styles.field}>
                    <label className={styles.label}>Manglik</label>
                    <select
                        className={styles.select}
                        value={p.manglik}
                        onChange={(e) => setField('manglik', e.target.value)}
                    >
                        {MANGALIK_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                                {o}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Education</label>
                    <input
                        className={styles.input}
                        value={p.education}
                        onChange={(e) => setField('education', e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.grid2}>
                <div className={styles.field}>
                    <label className={styles.label}>Occupation</label>
                    <input
                        className={styles.input}
                        value={p.occupation}
                        onChange={(e) => setField('occupation', e.target.value)}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Annual Income</label>
                    <input
                        className={styles.input}
                        value={p.income}
                        onChange={(e) => setField('income', e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Hobbies</label>
                <textarea
                    className={styles.textarea}
                    value={p.hobbies}
                    onChange={(e) => setField('hobbies', e.target.value)}
                />
            </div>
        </div>
    );
};
