'use client';

import {
  ToolType,
  PEN_COLORS,
  PEN_WIDTHS,
  HIGHLIGHTER_WIDTHS,
  STICKY_COLORS,
  StickyColor,
} from '@/types/whiteboard';

const TOOLS: { type: ToolType; label: string; icon: string }[] = [
  { type: 'select', label: 'Sélection', icon: '↖' },
  { type: 'pen', label: 'Crayon', icon: '✏️' },
  { type: 'highlighter', label: 'Surligneur', icon: '🖍️' },
  { type: 'eraser', label: 'Gomme', icon: '🧽' },
  { type: 'line', label: 'Ligne', icon: '╱' },
  { type: 'arrow', label: 'Flèche', icon: '→' },
  { type: 'rectangle', label: 'Rectangle', icon: '▭' },
  { type: 'circle', label: 'Cercle', icon: '◯' },
  { type: 'text', label: 'Texte', icon: 'T' },
  { type: 'sticky', label: 'Note', icon: '📝' },
  { type: 'image', label: 'Image', icon: '🖼️' },
  { type: 'laser', label: 'Laser', icon: '🔴' },
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
    <div className="flex flex-col items-center gap-1 bg-white rounded-xl shadow-lg p-2 z-20">
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
          className={`w-11 h-11 flex items-center justify-center rounded-lg text-lg transition-colors
            ${activeTool === tool.type ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-400' : 'hover:bg-gray-100 text-gray-700'}`}
        >
          {tool.icon}
        </button>
      ))}

      {showColorPicker && (
        <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-gray-200">
          {PEN_COLORS.map((color) => (
            <button
              key={color}
              aria-label={`Couleur ${color}`}
              title={color}
              onClick={() => onColorChange(color)}
              className={`w-7 h-7 rounded-full mx-auto border-2 transition-transform
                ${activeColor === color ? 'border-blue-500 scale-110' : 'border-gray-300'}`}
              style={{ backgroundColor: color }}
            />
          ))}
          <input
            type="color"
            value={activeColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-7 h-7 mx-auto cursor-pointer rounded border-0"
            aria-label="Couleur personnalisée"
            title="Couleur personnalisée"
          />
        </div>
      )}

      {showWidthPicker && (
        <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-gray-200">
          {widths.map((w) => (
            <button
              key={w}
              aria-label={`Épaisseur ${w}`}
              title={`Épaisseur ${w}`}
              onClick={() => onWidthChange(w)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg mx-auto
                ${activeWidth === w ? 'bg-blue-100 ring-2 ring-blue-400' : 'hover:bg-gray-100'}`}
            >
              <div
                className="rounded-full bg-current"
                style={{ width: Math.min(w * 1.5, 24), height: Math.min(w * 1.5, 24) }}
              />
            </button>
          ))}
        </div>
      )}

      {showStickyColors && (
        <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-gray-200">
          {(Object.keys(STICKY_COLORS) as StickyColor[]).map((color) => (
            <button
              key={color}
              aria-label={`Note ${color}`}
              title={color}
              onClick={() => onStickyColorChange(color)}
              className={`w-7 h-7 rounded mx-auto border-2
                ${activeStickyColor === color ? 'border-blue-500 scale-110' : 'border-gray-300'}`}
              style={{ backgroundColor: STICKY_COLORS[color] }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
