export type ToolType =
  | 'select'
  | 'pen'
  | 'highlighter'
  | 'eraser'
  | 'line'
  | 'arrow'
  | 'rectangle'
  | 'circle'
  | 'text'
  | 'sticky'
  | 'image'
  | 'laser';

export type EraserMode = 'object' | 'freehand' | 'clear-all';

export type PenColor = string;

export type PenWidth = number;

export type StickyColor = 'yellow' | 'pink' | 'blue' | 'green';

export const STICKY_COLORS: Record<StickyColor, string> = {
  yellow: '#FFF9C4',
  pink: '#F8BBD0',
  blue: '#BBDEFB',
  green: '#C8E6C9',
};

export const PEN_COLORS = [
  '#000000', // black
  '#D32F2F', // red
  '#1976D2', // blue
  '#388E3C', // green
  '#FBC02D', // yellow
  '#7B1FA2', // purple
];

export const PEN_WIDTHS = [2, 4, 8, 16];

export const HIGHLIGHTER_WIDTHS = [20, 30, 40];

export interface WhiteboardPage {
  id: string;
  canvasJSON: string; // Fabric.js serialized JSON
}

export interface WhiteboardDocument {
  version: 1;
  pages: WhiteboardPage[];
  activePageIndex: number;
}

export function createEmptyDocument(): WhiteboardDocument {
  return {
    version: 1,
    pages: [{ id: crypto.randomUUID(), canvasJSON: '{}' }],
    activePageIndex: 0,
  };
}
