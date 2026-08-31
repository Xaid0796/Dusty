import React from 'react';
import { useBiodataStore } from '@/hooks/useBiodataStore';
import styles from './BiodataEditor.module.css';

export const ContactEditor: React.FC = () => {
    const { document, updateContact } = useBiodataStore();
    if (!document) return null;
    const c = document.contact;

    const setField = (key: keyof typeof c, val: string) =>
        updateContact({ [key]: val });

    return (
        <div>
            <div className={styles.field}>
                <label className={styles.label}>Contact Person</label>
                <input
                    className={styles.input}
                    value={c.contactPerson}
                    onChange={(e) => setField('contactPerson', e.target.value)}
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Phone Number</label>
                <input
                    className={styles.input}
                    value={c.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Email Address</label>
                <input
                    className={styles.input}
                    value={c.email}
                    onChange={(e) => setField('email', e.target.value)}
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Address</label>
                <textarea
                    className={styles.textarea}
                    value={c.address}
                    onChange={(e) => setField('address', e.target.value)}
                />
            </div>
        </div>
    );
};
