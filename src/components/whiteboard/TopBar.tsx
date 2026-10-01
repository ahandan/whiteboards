'use client';

interface TopBarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onExportPdf: () => void;
  onExportPng: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function TopBar({
  onNew, onOpen, onSave, onExportPdf, onExportPng,
  onUndo, onRedo, canUndo, canRedo,
}: TopBarProps) {
  return (
    <div className="flex items-center h-12 bg-white border-b border-gray-200 px-3 gap-0.5 z-20 select-none">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M8 12h8M12 8v8" />
          </svg>
        </div>
        <span className="font-semibold text-sm text-gray-800 hidden sm:block">Tableau</span>
      </div>

      {/* File actions */}
      <Btn label="Nouveau" onClick={onNew} icon={IconNew} />
      <Btn label="Ouvrir" onClick={onOpen} icon={IconOpen} />
      <Btn label="Sauvegarder" onClick={onSave} icon={IconSave} />

      <Divider />

      <Btn label="Exporter PDF" onClick={onExportPdf} icon={IconPdf} />
      <Btn label="Exporter PNG" onClick={onExportPng} icon={IconImage} />

      <Divider />

      <Btn label="Annuler (Ctrl+Z)" onClick={onUndo} disabled={!canUndo} icon={IconUndo} />
      <Btn label="Rétablir (Ctrl+Y)" onClick={onRedo} disabled={!canRedo} icon={IconRedo} />
    </div>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1.5" />;
}

function Btn({ label, onClick, disabled, icon: Icon }: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon: React.FC<{ className?: string }>;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600
        hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200
        disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
    >
      <Icon className="w-[18px] h-[18px]" />
    </button>
  );
}

/* --- SVG Icons (inline, no deps) --- */

const s = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function IconNew({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" {...s}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>;
}
function IconOpen({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" {...s}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>;
}
function IconSave({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" {...s}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>;
}
function IconPdf({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" {...s}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M9 15v-2h1.5a1.5 1.5 0 010 3H9" /></svg>;
}
function IconImage({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" {...s}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>;
}
function IconUndo({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" {...s}><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>;
}
function IconRedo({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" {...s}><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.13-9.36L23 10" /></svg>;
}
