import React from 'react';
import { CanvasDocument } from '@/canvas/types';
import { ElementRenderer } from '@/components/shared/ElementRenderer';
import { mmToPx } from '@/canvas/utils';

interface CanvasDocumentRendererProps {
    doc: CanvasDocument;
    /** Scale factor applied to the A4 mm dimensions (1 = full size, 0.28 ≈ gallery thumbnail). */
    scale?: number;
}

/**
 * Renders a CanvasDocument (the schema produced by the Admin Template Builder /
 * canvas editor) as a static, non-editable React tree. Used as the gallery
 * "Component" for any template that is published as a CanvasDocument rather than
 * a hand-authored TemplateDefinition, so the public gallery and admin dashboard
 * preview the exact design the editor produced.
 *
 * Note: this mirrors the rendering path already used by TemplateThumbnail for
 * canvas-backed templates — centralizing it here keeps the bridge in one place.
 */
export const CanvasDocumentRenderer: React.FC<CanvasDocumentRendererProps> = ({ doc, scale = 1 }) => {
    const pageW = mmToPx(doc.page.width) * scale;
    const pageH = mmToPx(doc.page.height) * scale;

    return (
        <div
            style={{
                width: `${pageW}px`,
                height: `${pageH}px`,
                position: 'relative',
                backgroundColor: doc.page.background,
                overflow: 'hidden',
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
            }}
        >
            {doc.elements.map((el) => (
                <div
                    key={el.id}
                    style={{
                        position: 'absolute',
                        left: `${mmToPx(el.x) * scale}px`,
                        top: `${mmToPx(el.y) * scale}px`,
                        width: `${mmToPx(el.width) * scale}px`,
                        height: `${mmToPx(el.height) * scale}px`,
                        transform: `rotate(${el.rotation}deg)`,
                        zIndex: el.zIndex,
                        visibility: el.visible ? 'visible' : 'hidden',
                        boxSizing: 'border-box',
                    }}
                >
                    <ElementRenderer
                        element={el}
                        isEditing={false}
                        onTextBlur={() => { }}
                        isThumbnail={scale < 1}
                    />
                </div>
            ))}
        </div>
    );
};
