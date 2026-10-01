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
  onNew,
  onOpen,
  onSave,
  onExportPdf,
  onExportPng,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: TopBarProps) {
  return (
    <div className="flex items-center gap-1 bg-white shadow-sm px-3 py-1.5 z-20">
      <span className="font-bold text-lg text-blue-700 mr-4 select-none">Tableau</span>

      <TopBarButton label="Nouveau" onClick={onNew}>📄</TopBarButton>
      <TopBarButton label="Ouvrir" onClick={onOpen}>📂</TopBarButton>
      <TopBarButton label="Sauvegarder" onClick={onSave}>💾</TopBarButton>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <TopBarButton label="Exporter PDF" onClick={onExportPdf}>📑</TopBarButton>
      <TopBarButton label="Exporter PNG" onClick={onExportPng}>🖼️</TopBarButton>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <TopBarButton label="Annuler (Ctrl+Z)" onClick={onUndo} disabled={!canUndo}>↩️</TopBarButton>
      <TopBarButton label="Rétablir (Ctrl+Y)" onClick={onRedo} disabled={!canRedo}>↪️</TopBarButton>
    </div>
  );
}

function TopBarButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="w-10 h-10 flex items-center justify-center rounded-lg text-lg
        hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  );
}
