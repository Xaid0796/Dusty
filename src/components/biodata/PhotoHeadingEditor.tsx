import React from 'react';
import { useBiodataStore } from '@/hooks/useBiodataStore';
import { HEADING_OPTIONS } from '@/types/biodata';
import styles from './BiodataEditor.module.css';

interface PhotoHeadingEditorProps {
    onOpenCrop?: () => void;
}

export const PhotoHeadingEditor: React.FC<PhotoHeadingEditorProps> = ({ onOpenCrop }) => {
    const { document, updatePhotoHeading, updateStyle } = useBiodataStore();
    if (!document) return null;
    const { photoHeading, style } = document;

    const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const b64 = ev.target?.result as string;
            updatePhotoHeading({ photoUrl: b64, originalPhotoUrl: b64 });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const removePhoto = () => updatePhotoHeading({ photoUrl: undefined, originalPhotoUrl: undefined });

    return (
        <div>
            <div className={styles.photoRow}>
                {photoHeading.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoHeading.photoUrl} alt="thumb" className={styles.photoThumb} />
                ) : (
                    <div className={styles.photoThumb} />
                )}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <label className={styles.uploadBtn}>
                        Change Photo
                        <input type="file" accept="image/*" hidden onChange={onPhoto} />
                    </label>
                    {onOpenCrop && (
                        <button
                            type="button"
                            className={styles.uploadBtn}
                            onClick={onOpenCrop}
                            disabled={!photoHeading.photoUrl}
                            style={{ opacity: photoHeading.photoUrl ? 1 : 0.5, cursor: photoHeading.photoUrl ? 'pointer' : 'not-allowed' }}
                        >
                            Crop
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={removePhoto}
                        disabled={!photoHeading.photoUrl}
                        style={{ padding: '6px 12px', fontSize: '0.8rem', border: '1px solid #ef4444', borderRadius: '6px', cursor: photoHeading.photoUrl ? 'pointer' : 'not-allowed', background: '#fef2f2', color: '#dc2626', opacity: photoHeading.photoUrl ? 1 : 0.5 }}
                    >
                        Remove
                    </button>
                </div>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Heading</label>
                <input
                    className={styles.input}
                    value={photoHeading.heading}
                    onChange={(e) => updatePhotoHeading({ heading: e.target.value })}
                    placeholder="Biodata"
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Primary Color</label>
                <div className={styles.colorRow}>
                    <input
                        type="color"
                        className={styles.colorInput}
                        value={style.primaryColor}
                        onChange={(e) => updateStyle({ primaryColor: e.target.value })}
                    />
                    <input
                        className={styles.input}
                        value={style.primaryColor}
                        onChange={(e) => updateStyle({ primaryColor: e.target.value })}
                    />
                </div>
            </div>
        </div>
    );
};
