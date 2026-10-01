'use client';

import {
  ToolType,
  PEN_COLORS,
  PEN_WIDTHS,
  HIGHLIGHTER_WIDTHS,
  STICKY_COLORS,
  StickyColor,
} from '@/types/whiteboard';

const sv = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function I({ children, className }: { children: React.ReactNode; className?: string }) {
  return <svg className={className ?? "w-5 h-5"} viewBox="0 0 24 24" {...sv}>{children}</svg>;
}

const TOOLS: { type: ToolType; label: string; icon: React.ReactNode }[] = [
  { type: 'select', label: 'Sélection', icon: <I><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" /><path d="M13 13l6 6" /></I> },
  { type: 'pen', label: 'Crayon', icon: <I><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></I> },
  { type: 'highlighter', label: 'Surligneur', icon: <I><path d="M9 11l-6 6v3h9l3-3" /><path d="M22 12l-4.6 4.6a2 2 0 01-2.8 0l-5.2-5.2a2 2 0 010-2.8L14 4" /></I> },
  { type: 'eraser', label: 'Gomme', icon: <I><path d="M20 20H7L3 16a1 1 0 010-1.4l9.6-9.6a1 1 0 011.4 0l7 7a1 1 0 010 1.4L16 18" /></I> },
  { type: 'line', label: 'Ligne', icon: <I><line x1="5" y1="19" x2="19" y2="5" /></I> },
  { type: 'arrow', label: 'Flèche', icon: <I><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></I> },
  { type: 'rectangle', label: 'Rectangle', icon: <I><rect x="3" y="3" width="18" height="18" rx="2" /></I> },
  { type: 'circle', label: 'Cercle', icon: <I><circle cx="12" cy="12" r="10" /></I> },
  { type: 'text', label: 'Texte', icon: <I><polyline points="4 7 4 4 20 4 20 7" /><line x1="9.5" y1="20" x2="14.5" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></I> },
  { type: 'sticky', label: 'Note', icon: <I><path d="M15.5 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8.5L15.5 3z" /><polyline points="14 3 14 9 21 9" /></I> },
  { type: 'image', label: 'Image', icon: <I><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></I> },
  { type: 'laser', label: 'Laser', icon: <I><circle cx="12" cy="12" r="3" fill="currentColor" /><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="11" /></I> },
];

interface ToolbarProps {
  activeTool: ToolType;
  activeColor: string;
  activeWidth: number;
  activeStickyColor: StickyColor;
  onToolChange: (tool: ToolType) => void;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onStickyColorChange: (color: StickyColor) => void;
  onImageUpload: () => void;
}

export default function Toolbar({
  activeTool,
  activeColor,
  activeWidth,
  activeStickyColor,
  onToolChange,
  onColorChange,
  onWidthChange,
  onStickyColorChange,
  onImageUpload,
}: ToolbarProps) {
  const showColorPicker = ['pen', 'highlighter', 'line', 'arrow', 'rectangle', 'circle', 'text'].includes(activeTool);
  const showWidthPicker = ['pen', 'highlighter'].includes(activeTool);
  const showStickyColors = activeTool === 'sticky';
  const widths = activeTool === 'highlighter' ? HIGHLIGHTER_WIDTHS : PEN_WIDTHS;

  return (
    <div className="flex flex-col items-center gap-0.5 bg-white rounded-2xl shadow-lg p-1.5 z-20 border border-gray-100">
      {TOOLS.map((tool) => (
        <button
          key={tool.type}
          aria-label={tool.label}
          title={tool.label}
          onClick={() => {
            if (tool.type === 'image') {
              onToolChange('select');
              onImageUpload();
            } else {
              onToolChange(tool.type);
            }
          }}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all
            ${activeTool === tool.type
              ? 'bg-indigo-50 text-indigo-600 shadow-sm'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
        >
          {tool.icon}
        </button>
      ))}

      {showColorPicker && (
        <div className="flex flex-col gap-1.5 mt-1.5 pt-2 border-t border-gray-100">
          {PEN_COLORS.map((color) => (
            <button
              key={color}
              aria-label={`Couleur ${color}`}
              title={color}
              onClick={() => onColorChange(color)}
              className={`w-6 h-6 rounded-full mx-auto transition-all
                ${activeColor === color
                  ? 'ring-2 ring-indigo-400 ring-offset-2 scale-110'
                  : 'hover:scale-110'}`}
              style={{ backgroundColor: color }}
            />
          ))}
          <div className="relative mx-auto">
            <div
              className={`w-6 h-6 rounded-full border-2 border-dashed border-gray-300 overflow-hidden
                ${!PEN_COLORS.includes(activeColor) ? 'ring-2 ring-indigo-400 ring-offset-2' : ''}`}
              style={{ backgroundColor: activeColor }}
            />
            <input
              type="color"
              value={activeColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Couleur personnalisée"
              title="Couleur personnalisée"
            />
          </div>
        </div>
      )}

      {showWidthPicker && (
        <div className="flex flex-col gap-1 mt-1.5 pt-2 border-t border-gray-100">
          {widths.map((w) => (
            <button
              key={w}
              aria-label={`Épaisseur ${w}`}
              title={`Épaisseur ${w}`}
              onClick={() => onWidthChange(w)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg mx-auto transition-all
                ${activeWidth === w
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
            >
              <div
                className="rounded-full bg-current"
                style={{ width: Math.min(w * 1.2, 20), height: Math.min(w * 1.2, 20) }}
              />
            </button>
          ))}
        </div>
      )}

      {showStickyColors && (
        <div className="flex flex-col gap-1.5 mt-1.5 pt-2 border-t border-gray-100">
          {(Object.keys(STICKY_COLORS) as StickyColor[]).map((color) => (
            <button
              key={color}
              aria-label={`Note ${color}`}
              title={color}
              onClick={() => onStickyColorChange(color)}
              className={`w-6 h-6 rounded-md mx-auto transition-all
                ${activeStickyColor === color
                  ? 'ring-2 ring-indigo-400 ring-offset-2 scale-110'
                  : 'hover:scale-110'}`}
              style={{ backgroundColor: STICKY_COLORS[color] }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
