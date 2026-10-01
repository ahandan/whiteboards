'use client';

import {
  ToolType,
  EraserMode,
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
  { type: 'laser', label: 'Laser', icon: <I><circle cx="12" cy="12" r="3" fill="currentColor" /><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="11" /></I> },
];

const ERASER_OPTIONS: { mode: EraserMode; label: string; icon: React.ReactNode }[] = [
  {
    mode: 'object',
    label: 'Effacer un objet',
    icon: <I><path d="M20 20H7L3 16a1 1 0 010-1.4l9.6-9.6a1 1 0 011.4 0l7 7a1 1 0 010 1.4L16 18" /></I>,
  },
  {
    mode: 'freehand',
    label: 'Effacer à main levée',
    icon: <I><circle cx="12" cy="12" r="8" strokeDasharray="4 3" /><line x1="8" y1="8" x2="16" y2="16" /><line x1="16" y1="8" x2="8" y2="16" /></I>,
  },
  {
    mode: 'clear-all',
    label: 'Tout effacer',
    icon: <I><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></I>,
  },
];

interface ToolbarProps {
  activeTool: ToolType;
  activeColor: string;
  activeWidth: number;
  activeStickyColor: StickyColor;
  activeEraserMode: EraserMode;
  onToolChange: (tool: ToolType) => void;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onStickyColorChange: (color: StickyColor) => void;
  onEraserModeChange: (mode: EraserMode) => void;
}

export default function Toolbar({
  activeTool,
  activeColor,
  activeWidth,
  activeStickyColor,
  activeEraserMode,
  onToolChange,
  onColorChange,
  onWidthChange,
  onStickyColorChange,
  onEraserModeChange,
}: ToolbarProps) {
  const showColorPicker = ['pen', 'highlighter', 'line', 'arrow', 'rectangle', 'circle', 'text'].includes(activeTool);
  const showWidthPicker = ['pen', 'highlighter'].includes(activeTool);
  const showStickyColors = activeTool === 'sticky';
  const showEraserOptions = activeTool === 'eraser';
  const widths = activeTool === 'highlighter' ? HIGHLIGHTER_WIDTHS : PEN_WIDTHS;

  const showSubPanel = showColorPicker || showWidthPicker || showStickyColors || showEraserOptions;

  // Find the index of the active tool to position the sub-panel
  const activeToolIndex = TOOLS.findIndex((t) => t.type === activeTool);

  return (
    <div className="relative">
      {/* Main toolbar */}
      <div className="flex flex-col items-center gap-0.5 bg-white rounded-lg p-1 z-20 border border-gray-200">
        {TOOLS.map((tool) => (
          <button
            key={tool.type}
            aria-label={tool.label}
            title={tool.label}
            onClick={() => onToolChange(tool.type)}
            className={`w-10 h-10 flex items-center justify-center rounded-md
              ${activeTool === tool.type
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Sub-panel — slides out to the right */}
      {showSubPanel && (
        <div
          className="absolute left-full ml-2 bg-white rounded-lg border border-gray-200 p-2.5 z-50
            animate-[slideIn_150ms_ease-out]"
          style={{ top: activeToolIndex * 42 + 6 }}
        >
          <div className="flex items-start gap-2">
            {/* Colors */}
            {showColorPicker && (
              <div className="flex flex-col gap-2">
                {PEN_COLORS.map((color) => (
                  <button
                    key={color}
                    aria-label={`Couleur ${color}`}
                    title={color}
                    onClick={() => onColorChange(color)}
                    className={`w-7 h-7 rounded-full border-2
                      ${activeColor === color
                        ? 'border-gray-800'
                        : 'border-transparent hover:border-gray-300'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <div className="relative">
                  <div
                    className={`w-7 h-7 rounded-full border-2 border-dashed
                      ${!PEN_COLORS.includes(activeColor) ? 'border-gray-800' : 'border-gray-300'}`}
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

            {/* Widths */}
            {showWidthPicker && (
              <div className="flex flex-col gap-1">
                {widths.map((w) => (
                  <button
                    key={w}
                    aria-label={`Épaisseur ${w}`}
                    title={`Épaisseur ${w}`}
                    onClick={() => onWidthChange(w)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md
                      ${activeWidth === w
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                  >
                    <div
                      className="rounded-full bg-current"
                      style={{ width: Math.min(w * 0.6, 24), height: Math.min(w * 0.6, 24) }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Sticky colors */}
            {showStickyColors && (
              <div className="flex flex-col gap-2">
                {(Object.keys(STICKY_COLORS) as StickyColor[]).map((color) => (
                  <button
                    key={color}
                    aria-label={`Note ${color}`}
                    title={color}
                    onClick={() => onStickyColorChange(color)}
                    className={`w-7 h-7 rounded border-2
                      ${activeStickyColor === color
                        ? 'border-gray-800'
                        : 'border-transparent hover:border-gray-300'}`}
                    style={{ backgroundColor: STICKY_COLORS[color] }}
                  />
                ))}
              </div>
            )}

            {/* Eraser options */}
            {showEraserOptions && (
              <div className="flex flex-col gap-1">
                {ERASER_OPTIONS.map((opt) => (
                  <button
                    key={opt.mode}
                    aria-label={opt.label}
                    title={opt.label}
                    onClick={() => onEraserModeChange(opt.mode)}
                    className={`w-10 h-10 flex items-center justify-center rounded-md
                      ${activeEraserMode === opt.mode
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                  >
                    {opt.icon}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
