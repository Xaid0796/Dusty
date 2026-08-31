import React from 'react';
import { useBiodataStore } from '@/hooks/useBiodataStore';
import { FAMILY_TYPE_OPTIONS, FAMILY_VALUES_OPTIONS } from '@/types/biodata';
import styles from './BiodataEditor.module.css';

export const FamilyDetailsEditor: React.FC = () => {
    const { document, updateFamily } = useBiodataStore();
    if (!document) return null;
    const f = document.family;

    const setField = (key: keyof typeof f, val: string) =>
        updateFamily({ [key]: val });

    return (
        <div>
            <div className={styles.grid2}>
                <div className={styles.field}>
                    <label className={styles.label}>Father's Name</label>
                    <input
                        className={styles.input}
                        value={f.fatherName}
                        onChange={(e) => setField('fatherName', e.target.value)}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Father's Occupation</label>
                    <input
                        className={styles.input}
                        value={f.fatherOccupation}
                        onChange={(e) => setField('fatherOccupation', e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.grid2}>
                <div className={styles.field}>
                    <label className={styles.label}>Mother's Name</label>
                    <input
                        className={styles.input}
                        value={f.motherName}
                        onChange={(e) => setField('motherName', e.target.value)}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Mother's Occupation</label>
                    <input
                        className={styles.input}
                        value={f.motherOccupation}
                        onChange={(e) => setField('motherOccupation', e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Siblings</label>
                <input
                    className={styles.input}
                    value={f.siblings}
                    onChange={(e) => setField('siblings', e.target.value)}
                />
            </div>

            <div className={styles.grid2}>
                <div className={styles.field}>
                    <label className={styles.label}>Family Type</label>
                    <select
                        className={styles.select}
                        value={f.familyType}
                        onChange={(e) => setField('familyType', e.target.value)}
                    >
                        {FAMILY_TYPE_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                                {o}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Family Values</label>
                    <select
                        className={styles.select}
                        value={f.familyValues}
                        onChange={(e) => setField('familyValues', e.target.value)}
                    >
                        {FAMILY_VALUES_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                                {o}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Native Place</label>
                <input
                    className={styles.input}
                    value={f.nativePlace}
                    onChange={(e) => setField('nativePlace', e.target.value)}
                />
            </div>
        </div>
    );
};
