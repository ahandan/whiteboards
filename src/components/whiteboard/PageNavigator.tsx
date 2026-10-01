'use client';

interface PageNavigatorProps {
  pageCount: number;
  activePageIndex: number;
  thumbnails: string[];
  onPageChange: (index: number) => void;
  onAddPage: () => void;
  onDeletePage: () => void;
  onDuplicatePage: () => void;
}

export default function PageNavigator({
  pageCount,
  activePageIndex,
  thumbnails,
  onPageChange,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
}: PageNavigatorProps) {
  const sv = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  return (
    <div className="flex items-center gap-1.5 bg-white border-t border-gray-200 px-3 py-1.5 z-20 overflow-x-auto select-none">
      <NavBtn
        label="Page précédente"
        onClick={() => onPageChange(Math.max(0, activePageIndex - 1))}
        disabled={activePageIndex === 0}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" {...sv}><polyline points="15 18 9 12 15 6" /></svg>
      </NavBtn>

      <div className="flex gap-1.5 overflow-x-auto py-0.5">
        {thumbnails.map((thumb, i) => (
          <button
            key={i}
            aria-label={`Page ${i + 1}`}
            title={`Page ${i + 1}`}
            onClick={() => onPageChange(i)}
            className={`relative flex-shrink-0 w-[72px] h-[44px] rounded-lg overflow-hidden transition-all
              ${i === activePageIndex
                ? 'ring-2 ring-indigo-400 ring-offset-1 shadow-md'
                : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
          >
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumb} alt={`Page ${i + 1}`} className="w-full h-full object-contain bg-white" />
            ) : (
              <div className="w-full h-full bg-white flex items-center justify-center text-xs text-gray-300 font-medium">
                {i + 1}
              </div>
            )}
            <span className="absolute bottom-0.5 right-1 text-[9px] font-medium text-gray-400 bg-white/90 px-1 rounded">
              {i + 1}
            </span>
          </button>
        ))}
      </div>

      <NavBtn
        label="Page suivante"
        onClick={() => onPageChange(Math.min(pageCount - 1, activePageIndex + 1))}
        disabled={activePageIndex === pageCount - 1}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" {...sv}><polyline points="9 18 15 12 9 6" /></svg>
      </NavBtn>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <NavBtn label="Ajouter une page" onClick={onAddPage}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" {...sv}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
      </NavBtn>
      <NavBtn label="Dupliquer la page" onClick={onDuplicatePage}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" {...sv}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
      </NavBtn>
      <NavBtn label="Supprimer la page" onClick={onDeletePage} disabled={pageCount <= 1} danger>
        <svg className="w-4 h-4" viewBox="0 0 24 24" {...sv}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
      </NavBtn>
    </div>
  );
}

function NavBtn({ label, onClick, disabled, danger, children }: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors
        disabled:opacity-25 disabled:cursor-not-allowed
        ${danger
          ? 'text-gray-500 hover:bg-red-50 hover:text-red-500'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
    >
      {children}
    </button>
  );
}

