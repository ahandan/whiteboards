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
  return (
    <div className="flex items-center gap-2 bg-white shadow-inner px-3 py-1.5 z-20 overflow-x-auto">
      <button
        aria-label="Page précédente"
        title="Page précédente"
        onClick={() => onPageChange(Math.max(0, activePageIndex - 1))}
        disabled={activePageIndex === 0}
        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-30 text-lg"
      >
        ◀
      </button>

      <div className="flex gap-2 overflow-x-auto py-1">
        {thumbnails.map((thumb, i) => (
          <button
            key={i}
            aria-label={`Page ${i + 1}`}
            title={`Page ${i + 1}`}
            onClick={() => onPageChange(i)}
            className={`relative flex-shrink-0 w-20 h-14 rounded border-2 overflow-hidden transition-colors
              ${i === activePageIndex ? 'border-blue-500 shadow-md' : 'border-gray-300 hover:border-gray-400'}`}
          >
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumb} alt={`Page ${i + 1}`} className="w-full h-full object-contain bg-white" />
            ) : (
              <div className="w-full h-full bg-white flex items-center justify-center text-xs text-gray-400">
                {i + 1}
              </div>
            )}
            <span className="absolute bottom-0 right-0.5 text-[10px] text-gray-500 bg-white/80 px-0.5 rounded">
              {i + 1}
            </span>
          </button>
        ))}
      </div>

      <button
        aria-label="Page suivante"
        title="Page suivante"
        onClick={() => onPageChange(Math.min(pageCount - 1, activePageIndex + 1))}
        disabled={activePageIndex === pageCount - 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-30 text-lg"
      >
        ▶
      </button>

      <div className="w-px h-6 bg-gray-300" />

      <button
        aria-label="Ajouter une page"
        title="Ajouter une page"
        onClick={onAddPage}
        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-green-100 text-lg"
      >
        ➕
      </button>
      <button
        aria-label="Dupliquer la page"
        title="Dupliquer la page"
        onClick={onDuplicatePage}
        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-blue-100 text-lg"
      >
        📋
      </button>
      <button
        aria-label="Supprimer la page"
        title="Supprimer la page"
        onClick={onDeletePage}
        disabled={pageCount <= 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-100 disabled:opacity-30 text-lg"
      >
        🗑️
      </button>
    </div>
  );
}
