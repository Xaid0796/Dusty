import { create } from 'zustand';
import { CanvasDocument, CanvasElement } from './types';

export type CanvasTool = 'select' | 'draw';
export type Alignment = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';

interface CanvasState {
  document: CanvasDocument | null;
  originalDocument: CanvasDocument | null;
  selectedId: string | null;
  selectedIds: string[];
  isTextEditing: boolean;
  croppingId: string | null;
  history: CanvasDocument[];
  future: CanvasDocument[];
  zoom: number;
  activeTool: CanvasTool;
  snapToGrid: boolean;
  clipboard: CanvasElement[];
  styleClipboard: Record<string, unknown> | null;

  loadDocument: (doc: CanvasDocument, skipHistory?: boolean) => void;
  setOriginalDocument: (doc: CanvasDocument | null) => void;
  setPageSize: (width: number, height: number) => void;
  setCroppingId: (id: string | null) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>, skipHistory?: boolean) => void;
  addElement: (element: CanvasElement) => void;
  deleteElement: (id: string) => void;
  deleteSelected: () => void;
  selectElement: (id: string | null, additive?: boolean) => void;
  setSelectedIds: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  setTextEditing: (isEditing: boolean) => void;
  setZoom: (zoom: number) => void;
  setActiveTool: (tool: CanvasTool) => void;
  setSnapToGrid: (value: boolean) => void;
  copySelected: () => void;
  cutSelected: () => void;
  pasteClipboard: () => void;
  duplicateSelected: () => void;
  moveSelected: (dx: number, dy: number, skipHistory?: boolean) => void;
  alignSelected: (alignment: Alignment) => void;
  copyStyle: () => void;
  pasteStyle: () => void;

  bringForward: (id?: string) => void;
  sendBackward: (id?: string) => void;
  bringToFront: (id?: string) => void;
  sendToBack: (id?: string) => void;

  groupSelected: () => void;
  ungroupSelected: () => void;

  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  saveHistory: () => void;
}

const MAX_HISTORY = 60;

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const getStorageKey = (doc: CanvasDocument | null) => {
  if (!doc) return 'dusty_canvas_draft';
  return `dusty_canvas_draft_${doc.category || 'generic'}_${doc.id}`;
};

const saveToLocalStorage = (doc: CanvasDocument | null) => {
  if (typeof window !== 'undefined' && doc) {
    try {
      localStorage.setItem(getStorageKey(doc), JSON.stringify(doc));
    } catch (e) {
      console.warn('Failed to save draft to localStorage due to quota limits:', e);
    }
  }
};

const uniqueId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const cloneElementWithNewIds = (element: CanvasElement, index: number, now: number): CanvasElement => {
  const cloned = clone(element);
  cloned.id = uniqueId(`${element.type}-copy-${now + index}`);
  if (cloned.type === 'group') {
    cloned.elements = cloned.elements.map((child, childIdx) => {
      return cloneElementWithNewIds(child, index * 1000 + childIdx, now);
    });
  }
  return cloned;
};

const uniqueCopiedIds = (elements: CanvasElement[]) => {
  const now = Date.now();
  return elements.map((element, index) => {
    const newEl = cloneElementWithNewIds(element, index, now);
    newEl.label = element.label ? `${element.label} Copy` : undefined;
    newEl.x = element.x + 6;
    newEl.y = element.y + 6;
    return newEl;
  });
};

const scaleGroupChildren = (children: CanvasElement[], scaleX: number, scaleY: number): CanvasElement[] => {
  return children.map((child) => {
    const nextChild = {
      ...child,
      x: Number((child.x * scaleX).toFixed(2)),
      y: Number((child.y * scaleY).toFixed(2)),
      width: Number((child.width * scaleX).toFixed(2)),
      height: Number((child.height * scaleY).toFixed(2)),
    } as CanvasElement;

    if (nextChild.type === 'group') {
      nextChild.elements = scaleGroupChildren(nextChild.elements, scaleX, scaleY);
    }
    return nextChild;
  });
};

export const useCanvasStore = create<CanvasState>((set, get) => {
  const saveToHistory = (doc: CanvasDocument | null) => {
    if (!doc) return;
    const { history } = get();
    set({ history: [...history, clone(doc)].slice(-MAX_HISTORY), future: [] });
  };

  const replaceDocument = (next: CanvasDocument, options?: { clearSelection?: boolean; selectedIds?: string[] }) => {
    const ids = options?.selectedIds ?? (options?.clearSelection ? [] : get().selectedIds);
    set({
      document: next,
      selectedIds: ids,
      selectedId: ids[0] ?? null,
      isTextEditing: ids.length !== 1 ? false : get().isTextEditing,
    });
    saveToLocalStorage(next);
  };

  return {
    document: null,
    originalDocument: null,
    selectedId: null,
    selectedIds: [],
    isTextEditing: false,
    croppingId: null,
    history: [],
    future: [],
    zoom: 100,
    activeTool: 'select',
    snapToGrid: false,
    clipboard: [],
    styleClipboard: null,

    loadDocument: (doc, _skipHistory = false) => {
      const cloned = clone(doc);
      set({
        document: cloned,
        selectedId: null,
        selectedIds: [],
        isTextEditing: false,
        croppingId: null,
        history: [],
        future: [],
        activeTool: 'select',
      });
    },

    setOriginalDocument: (doc) => set({ originalDocument: doc ? clone(doc) : null }),
    setPageSize: (width, height) => {
      const { document } = get();
      if (!document) return;
      saveToHistory(document);
      const next = { ...document, page: { ...document.page, width, height } };
      replaceDocument(next);
    },
    setCroppingId: (id) => set({ croppingId: id, selectedIds: id ? [id] : get().selectedIds, selectedId: id ?? get().selectedId }),

    saveHistory: () => saveToHistory(get().document),

    updateElement: (id, updates, skipHistory = false) => {
      const { document } = get();
      if (!document) return;
      if (!skipHistory) saveToHistory(document);

      const updatedElements = document.elements.map((el) => {
        if (el.id !== id) return el;
        const next = { ...el, ...updates } as CanvasElement;
        if (el.type === 'text' && (updates as any).style) {
          (next as any).style = { ...el.style, ...(updates as any).style };
        }
        if (el.type === 'group' && next.type === 'group') {
          const scaleX = updates.width !== undefined && el.width !== 0 ? updates.width / el.width : 1;
          const scaleY = updates.height !== undefined && el.height !== 0 ? updates.height / el.height : 1;
          if (scaleX !== 1 || scaleY !== 1) {
            next.elements = scaleGroupChildren(el.elements, scaleX, scaleY);
          }
        }
        return next;
      });

      replaceDocument({ ...document, elements: updatedElements });
    },

    addElement: (element) => {
      const { document } = get();
      if (!document) return;
      saveToHistory(document);
      const maxZ = document.elements.reduce((max, el) => Math.max(max, el.zIndex), 1); // Start from 1 (canvas bg is 1)
      const newElement = { ...clone(element), zIndex: maxZ + 1 } as CanvasElement;
      replaceDocument({ ...document, elements: [...document.elements, newElement] }, { selectedIds: [newElement.id] });
    },

    deleteElement: (id) => {
      const { document, selectedIds } = get();
      if (!document) return;
      const target = document.elements.find((el) => el.id === id);
      if (!target || target.locked) return;
      saveToHistory(document);
      const next = { ...document, elements: document.elements.filter((el) => el.id !== id) };
      replaceDocument(next, { selectedIds: selectedIds.filter((item) => item !== id) });
    },

    deleteSelected: () => {
      const { document, selectedIds } = get();
      if (!document || selectedIds.length === 0) return;
      const removable = new Set(selectedIds.filter((id) => !document.elements.find((el) => el.id === id)?.locked));
      if (removable.size === 0) return;
      saveToHistory(document);
      replaceDocument(
        { ...document, elements: document.elements.filter((el) => !removable.has(el.id)) },
        { selectedIds: selectedIds.filter((id) => !removable.has(id)) }
      );
    },

    selectElement: (id, additive = false) => {
      if (!id) {
        set({ selectedId: null, selectedIds: [], isTextEditing: false, croppingId: null });
        return;
      }
      const current = get().selectedIds;
      let next = additive
        ? current.includes(id)
          ? current.filter((item) => item !== id)
          : [...current, id]
        : [id];
      if (next.length === 0) next = [];
      set({ selectedIds: next, selectedId: next[0] ?? null, isTextEditing: false, croppingId: null });
    },

    setSelectedIds: (ids) => set({ selectedIds: ids, selectedId: ids[0] ?? null, isTextEditing: false, croppingId: null }),
    toggleSelection: (id) => get().selectElement(id, true),

    selectAll: () => {
      const { document } = get();
      if (!document) return;
      const ids = document.elements.filter((el) => el.visible).map((el) => el.id);
      set({ selectedIds: ids, selectedId: ids[0] ?? null, isTextEditing: false, croppingId: null });
    },

    setTextEditing: (isEditing) => set({ isTextEditing: isEditing }),
    setZoom: (zoom) => set({ zoom: Math.max(25, Math.min(200, zoom)) }),
    setActiveTool: (tool) => set({ activeTool: tool, croppingId: tool === 'draw' ? null : get().croppingId }),
    setSnapToGrid: (value) => set({ snapToGrid: value }),

    copySelected: () => {
      const { document, selectedIds } = get();
      if (!document || selectedIds.length === 0) return;
      const selected = document.elements.filter((el) => selectedIds.includes(el.id) && !el.locked);
      set({ clipboard: clone(selected) });
    },

    cutSelected: () => {
      get().copySelected();
      get().deleteSelected();
    },

    pasteClipboard: () => {
      const { document, clipboard } = get();
      if (!document || clipboard.length === 0) return;
      const clones = uniqueCopiedIds(clipboard);
      const maxZ = document.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);
      const elements = clones.map((el, index) => ({ ...el, zIndex: maxZ + index + 1 }));
      saveToHistory(document);
      replaceDocument({ ...document, elements: [...document.elements, ...elements] }, { selectedIds: elements.map((el) => el.id) });
    },

    duplicateSelected: () => {
      const { document, selectedIds } = get();
      if (!document || selectedIds.length === 0) return;
      const originals = document.elements.filter((el) => selectedIds.includes(el.id) && !el.locked);
      if (originals.length === 0) return;
      const duplicates = uniqueCopiedIds(originals);
      const maxZ = document.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);
      const elements = duplicates.map((el, index) => ({ ...el, zIndex: maxZ + index + 1 }));
      saveToHistory(document);
      replaceDocument({ ...document, elements: [...document.elements, ...elements] }, { selectedIds: elements.map((el) => el.id) });
    },

    moveSelected: (dx, dy, skipHistory = false) => {
      const { document, selectedIds } = get();
      if (!document || selectedIds.length === 0) return;
      if (!skipHistory) saveToHistory(document);
      const idSet = new Set(selectedIds);
      const elements = document.elements.map((el) => {
        if (!idSet.has(el.id) || el.locked) return el;
        return { ...el, x: Number((el.x + dx).toFixed(2)), y: Number((el.y + dy).toFixed(2)) };
      });
      replaceDocument({ ...document, elements });
    },

    alignSelected: (alignment) => {
      const { document, selectedIds } = get();
      if (!document || selectedIds.length === 0) return;
      const selected = document.elements.filter((el) => selectedIds.includes(el.id) && !el.locked);
      if (selected.length === 0) return;
      const minX = Math.min(...selected.map((el) => el.x));
      const maxX = Math.max(...selected.map((el) => el.x + el.width));
      const minY = Math.min(...selected.map((el) => el.y));
      const maxY = Math.max(...selected.map((el) => el.y + el.height));
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      saveToHistory(document);
      const ids = new Set(selectedIds);
      const elements = document.elements.map((el) => {
        if (!ids.has(el.id) || el.locked) return el;
        let x = el.x;
        let y = el.y;
        if (alignment === 'left') x = minX;
        if (alignment === 'center') x = centerX - el.width / 2;
        if (alignment === 'right') x = maxX - el.width;
        if (alignment === 'top') y = minY;
        if (alignment === 'middle') y = centerY - el.height / 2;
        if (alignment === 'bottom') y = maxY - el.height;
        return { ...el, x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
      });
      replaceDocument({ ...document, elements });
    },

    bringForward: (id) => {
      const { document, selectedIds } = get();
      if (!document) return;
      const ids = id ? [id] : selectedIds;
      if (ids.length === 0) return;

      saveToHistory(document);
      const sorted = [...document.elements].sort((a, b) => a.zIndex - b.zIndex);
      const result = [...sorted];

      for (let i = result.length - 2; i >= 0; i--) {
        if (ids.includes(result[i].id) && !result[i].locked && !ids.includes(result[i + 1].id)) {
          [result[i], result[i + 1]] = [result[i + 1], result[i]];
        }
      }

      // Ensure elements don't go behind the canvas background (min zIndex = 2)
      const nextElements = result.map((el, i) => ({ ...el, zIndex: i + 2 }));
      replaceDocument({ ...document, elements: nextElements });
    },

    sendBackward: (id) => {
      const { document, selectedIds } = get();
      if (!document) return;
      const ids = id ? [id] : selectedIds;
      if (ids.length === 0) return;

      const sorted = [...document.elements].sort((a, b) => a.zIndex - b.zIndex);
      const activeId = id || selectedIds[0];
      const activeIndex = sorted.findIndex((el) => el.id === activeId);
      if (activeIndex <= 0) return;

      saveToHistory(document);
      const result = [...sorted];

      for (let i = 1; i < result.length; i++) {
        if (ids.includes(result[i].id) && !result[i].locked && !ids.includes(result[i - 1].id)) {
          [result[i], result[i - 1]] = [result[i - 1], result[i]];
        }
      }

      // Ensure elements don't go behind the canvas background (min zIndex = 2)
      const nextElements = result.map((el, i) => ({ ...el, zIndex: i + 2 }));
      replaceDocument({ ...document, elements: nextElements });
    },

    bringToFront: (id) => {
      const { document, selectedIds } = get();
      if (!document) return;
      const ids = id ? [id] : selectedIds;
      if (ids.length === 0) return;

      saveToHistory(document);
      const others = document.elements.filter((el) => !ids.includes(el.id) || el.locked).sort((a, b) => a.zIndex - b.zIndex);
      const moving = document.elements.filter((el) => ids.includes(el.id) && !el.locked).sort((a, b) => a.zIndex - b.zIndex);
      // Ensure elements don't go behind the canvas background (min zIndex = 2)
      const nextElements = [...others, ...moving].map((el, i) => ({ ...el, zIndex: i + 2 }));
      replaceDocument({ ...document, elements: nextElements });
    },

    sendToBack: (id) => {
      const { document, selectedIds } = get();
      if (!document) return;
      const ids = id ? [id] : selectedIds;
      if (ids.length === 0) return;

      saveToHistory(document);
      const others = document.elements.filter((el) => !ids.includes(el.id) || el.locked).sort((a, b) => a.zIndex - b.zIndex);
      const moving = document.elements.filter((el) => ids.includes(el.id) && !el.locked).sort((a, b) => a.zIndex - b.zIndex);
      // Ensure elements don't go behind the canvas background (min zIndex = 2)
      const nextElements = [...moving, ...others].map((el, i) => ({ ...el, zIndex: i + 2 }));
      replaceDocument({ ...document, elements: nextElements });
    },

    undo: () => {
      const { document, history, future, isTextEditing, selectedId, selectedIds, croppingId } = get();
      if (!document || history.length === 0) return;
      const previous = history[history.length - 1];

      const currentEl = selectedId ? document.elements.find((el) => el.id === selectedId) : null;
      const isTextSelected = currentEl?.type === 'text' || currentEl?.type === 'sticky' || currentEl?.type === 'table';
      const selectedExists = selectedId ? previous.elements.some((el) => el.id === selectedId) : false;
      const preserveSelection = isTextSelected && selectedExists;

      set({
        document: clone(previous),
        history: history.slice(0, -1),
        future: [clone(document), ...future],
        selectedId: preserveSelection ? selectedId : null,
        selectedIds: preserveSelection ? selectedIds : [],
        isTextEditing: preserveSelection ? isTextEditing : false,
        croppingId: preserveSelection ? croppingId : null,
      });
      saveToLocalStorage(previous);
    },

    redo: () => {
      const { document, history, future, isTextEditing, selectedId, selectedIds, croppingId } = get();
      if (!document || future.length === 0) return;
      const next = future[0];

      const currentEl = selectedId ? document.elements.find((el) => el.id === selectedId) : null;
      const isTextSelected = currentEl?.type === 'text' || currentEl?.type === 'sticky' || currentEl?.type === 'table';
      const selectedExists = selectedId ? next.elements.some((el) => el.id === selectedId) : false;
      const preserveSelection = isTextSelected && selectedExists;

      set({
        document: clone(next),
        history: [...history, clone(document)].slice(-MAX_HISTORY),
        future: future.slice(1),
        selectedId: preserveSelection ? selectedId : null,
        selectedIds: preserveSelection ? selectedIds : [],
        isTextEditing: preserveSelection ? isTextEditing : false,
        croppingId: preserveSelection ? croppingId : null,
      });
      saveToLocalStorage(next);
    },

    clearHistory: () => set({ history: [], future: [] }),

    copyStyle: () => {
      const { document, selectedId } = get();
      if (!document || !selectedId) return;
      const el = document.elements.find((e) => e.id === selectedId);
      if (!el) return;
      // Extract style properties relevant to the element type
      const styleProps: Record<string, unknown> = { type: el.type };
      if (el.type === 'text') { styleProps.style = clone((el as any).style); }
      if (el.type === 'rect' || el.type === 'circle' || el.type === 'triangle' || el.type === 'star' || el.type === 'hexagon' || el.type === 'arrow') {
        styleProps.fill = (el as any).fill;
        styleProps.stroke = (el as any).stroke;
        styleProps.strokeWidth = (el as any).strokeWidth;
        styleProps.opacity = (el as any).opacity;
        styleProps.styleMode = (el as any).styleMode;
        if (el.type === 'rect') styleProps.borderRadius = (el as any).borderRadius;
      }
      if (el.type === 'image') {
        styleProps.opacity = (el as any).opacity;
        styleProps.borderRadius = (el as any).borderRadius;
        styleProps.objectFit = (el as any).objectFit;
      }
      set({ styleClipboard: styleProps });
    },

    pasteStyle: () => {
      const { document, selectedIds, styleClipboard } = get();
      if (!document || selectedIds.length === 0 || !styleClipboard) return;
      saveToHistory(document);
      const { type, ...props } = styleClipboard;
      const updatedElements = document.elements.map((el) => {
        if (!selectedIds.includes(el.id)) return el;
        if (el.type !== type) return el; // Only apply to same type
        return { ...el, ...(type === 'text' ? { style: { ...(el as any).style, ...(props as any).style } } : props) } as CanvasElement;
      });
      replaceDocument({ ...document, elements: updatedElements });
    },

    groupSelected: () => {
      const { document, selectedIds } = get();
      if (!document || selectedIds.length < 2) return;
      const elementsToGroup = document.elements.filter((el) => selectedIds.includes(el.id) && !el.locked);
      if (elementsToGroup.length < 2) return;

      saveToHistory(document);

      const minX = Math.min(...elementsToGroup.map((el) => el.x));
      const maxX = Math.max(...elementsToGroup.map((el) => el.x + el.width));
      const minY = Math.min(...elementsToGroup.map((el) => el.y));
      const maxY = Math.max(...elementsToGroup.map((el) => el.y + el.height));
      const width = maxX - minX;
      const height = maxY - minY;

      const groupedElements = elementsToGroup.map((el) => ({
        ...clone(el),
        x: Number((el.x - minX).toFixed(2)),
        y: Number((el.y - minY).toFixed(2)),
      }));

      const maxZIndex = document.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);
      const groupId = uniqueId('group');
      const groupElement = {
        id: groupId,
        type: 'group',
        label: 'Group',
        x: Number(minX.toFixed(2)),
        y: Number(minY.toFixed(2)),
        width: Number(width.toFixed(2)),
        height: Number(height.toFixed(2)),
        rotation: 0,
        zIndex: maxZIndex + 1,
        visible: true,
        locked: false,
        elements: groupedElements,
      } as any;

      const remainingElements = document.elements.filter((el) => !selectedIds.includes(el.id));
      const nextElements = [...remainingElements, groupElement];

      replaceDocument({ ...document, elements: nextElements }, { selectedIds: [groupId] });
    },

    ungroupSelected: () => {
      const { document, selectedIds } = get();
      if (!document || selectedIds.length === 0) return;

      const groupsToUngroup = document.elements.filter(
        (el) => selectedIds.includes(el.id) && el.type === 'group' && !el.locked
      ) as any[];

      if (groupsToUngroup.length === 0) return;

      saveToHistory(document);

      let nextElements = [...document.elements];
      const newSelectedIds: string[] = [];

      for (const group of groupsToUngroup) {
        nextElements = nextElements.filter((el) => el.id !== group.id);

        const unpacked = group.elements.map((el: any) => {
          let dx = el.x;
          let dy = el.y;

          if (group.rotation !== 0) {
            const rad = (group.rotation * Math.PI) / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);
            dx = el.x * cos - el.y * sin;
            dy = el.x * sin + el.y * cos;
          }

          const absoluteEl = {
            ...clone(el),
            x: Number((group.x + dx).toFixed(2)),
            y: Number((group.y + dy).toFixed(2)),
            rotation: Number(((el.rotation + group.rotation) % 360).toFixed(2)),
            zIndex: group.zIndex,
          };

          return absoluteEl;
        });

        nextElements.push(...unpacked);
        newSelectedIds.push(...unpacked.map((el: any) => el.id));
      }

      replaceDocument({ ...document, elements: nextElements }, { selectedIds: newSelectedIds });
    },
  };
});

export { uniqueId };
