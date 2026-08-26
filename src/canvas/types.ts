// ============================================================
//  CANVAS DOCUMENT MODEL
//  Generic, template-independent.
// ============================================================

export type ElementType =
  | 'text'
  | 'image'
  | 'rect'
  | 'circle'
  | 'triangle'
  | 'star'
  | 'hexagon'
  | 'arrow'
  | 'line'
  | 'sticky'
  | 'table'
  | 'drawing'
  | 'diagonal-line'
  | 'wave'
  | 'l-shape'
  | 'right-triangle'
  | 'diamond'
  | 'pentagon'
  | 'four-star'
  | 'eight-star'
  | 'speech-rect'
  | 'speech-oval'
  | 'cloud'
  | 'heart'
  | 'lightning'
  | 'arrow-left'
  | 'arrow-up'
  | 'arrow-down'
  | 'group'
  | 'floral-branch'
  | 'elegant-corner'
  | 'divider-diamond'
  | 'badge-star'
  | 'arch-accent'
  | 'wave-accent'
  | 'chart'
  | 'frame'
  | 'qr-code';

export interface CanvasPage {
  id: string;
  width: number;
  height: number;
  background: string;
}

export interface BaseElement {
  id: string;
  type: ElementType;
  label?: string;
  url?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  letterSpacing: number;
  padding: number;
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  style: TextStyle;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  originalSrc?: string; // Cache original source to allow re-cropping
  objectFit: 'cover' | 'contain' | 'fill';
  objectPosition: string;
  cropX: number;
  cropY: number;
  zoom: number;
  borderRadius: number;
  opacity: number;
  flipX?: boolean;
  flipY?: boolean;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  blur?: number;
  backgroundColor?: string;
}

export interface RectElement extends BaseElement {
  type: 'rect';
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius: number;
  opacity: number;
  styleMode?: 'fill' | 'outline' | 'both';
}

export interface CircleElement extends BaseElement {
  type: 'circle';
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  styleMode?: 'fill' | 'outline' | 'both';
}

export interface TriangleElement extends BaseElement {
  type: 'triangle';
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  styleMode?: 'fill' | 'outline' | 'both';
}

export interface LineElement extends BaseElement {
  type: 'line';
  stroke: string;
  strokeWidth: number;
  orientation: 'horizontal' | 'vertical';
}

export interface StickyElement extends BaseElement {
  type: 'sticky';
  content: string;
  background: string;
  textColor: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  opacity: number;
  borderRadius: number;
  padding: number;
}

export interface TableElement extends BaseElement {
  type: 'table';
  rows: number;
  columns: number;
  cells: string[][];
  headerRow: boolean;
  headerBackground: string;
  borderColor: string;
  borderWidth: number;
  cellPadding: number;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  headerTextColor: string;
}

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingElement extends BaseElement {
  type: 'drawing';
  points: DrawingPoint[];
  stroke: string;
  strokeWidth: number;
  opacity: number;
  lineCap: 'round' | 'square' | 'butt';
  lineJoin: 'round' | 'miter' | 'bevel';
}

export interface StarElement extends BaseElement {
  type: 'star';
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  styleMode?: 'fill' | 'outline' | 'both';
}

export interface HexagonElement extends BaseElement {
  type: 'hexagon';
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  styleMode?: 'fill' | 'outline' | 'both';
}

export interface ArrowElement extends BaseElement {
  type: 'arrow';
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  styleMode?: 'fill' | 'outline' | 'both';
}

export interface CustomShapeElement extends BaseElement {
  type:
  | 'diagonal-line'
  | 'wave'
  | 'l-shape'
  | 'right-triangle'
  | 'diamond'
  | 'pentagon'
  | 'four-star'
  | 'eight-star'
  | 'speech-rect'
  | 'speech-oval'
  | 'cloud'
  | 'heart'
  | 'lightning'
  | 'arrow-left'
  | 'arrow-up'
  | 'arrow-down'
  | 'floral-branch'
  | 'elegant-corner'
  | 'divider-diamond'
  | 'badge-star'
  | 'arch-accent'
  | 'wave-accent';
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  styleMode?: 'fill' | 'outline' | 'both';
}

export interface GroupElement extends BaseElement {
  type: 'group';
  elements: CanvasElement[];
}

export interface ChartDataItem {
  label: string;
  value: number;
}

export interface ChartElement extends BaseElement {
  type: 'chart';
  chartType: 'pie' | 'bar' | 'line';
  designPreset: string;
  data: ChartDataItem[];
  showLegend: boolean;
  showValues: boolean;
  showLabels: boolean;
}

export interface FrameElement extends BaseElement {
  type: 'frame';
  src?: string;
  originalSrc?: string;
  shape: 'rectangle' | 'square' | 'circle' | 'ellipse';
  borderEnabled: boolean;
  borderWidth: number;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderColor: string;
  objectFit: 'cover' | 'contain';
  cropX: number;
  cropY: number;
  zoom: number;
  opacity: number;
}

export type QRCodeDesignPreset =
  | 'classic'
  | 'minimal'
  | 'rounded'
  | 'rounded-dots'
  | 'modern'
  | 'dots'
  | 'professional'
  | 'elegant'
  | 'bold'
  | 'framed';

export interface QRCodeElement extends BaseElement {
  type: 'qr-code';
  content: string;
  designPreset: QRCodeDesignPreset;
  foregroundColor: string;
  backgroundColor: string;
  margin: number;
}

export type CanvasElement =
  | TextElement
  | ImageElement
  | RectElement
  | CircleElement
  | TriangleElement
  | StarElement
  | HexagonElement
  | ArrowElement
  | LineElement
  | StickyElement
  | TableElement
  | DrawingElement
  | CustomShapeElement
  | GroupElement
  | ChartElement
  | FrameElement
  | QRCodeElement;

export interface CanvasDocument {
  id: string;
  category: string;
  name: string;
  description?: string;
  page: CanvasPage;
  elements: CanvasElement[];
  isPremium?: boolean;
  thumbnail?: string;
}
