import { WhiteboardDocument } from '@/types/whiteboard';

const CURRENT_VERSION = 1;

export function serializeDocument(doc: WhiteboardDocument): string {
  return JSON.stringify(doc);
}

export function deserializeDocument(raw: string): WhiteboardDocument {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Invalid file: not valid JSON');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid file: not an object');
  }

  const obj = parsed as Record<string, unknown>;

  if (obj.version !== CURRENT_VERSION) {
    throw new Error(`Unsupported version: ${obj.version}`);
  }

  if (!Array.isArray(obj.pages) || obj.pages.length === 0) {
    throw new Error('Invalid file: missing pages');
  }

  for (const page of obj.pages) {
    if (
      !page ||
      typeof page !== 'object' ||
      typeof page.id !== 'string' ||
      typeof page.canvasJSON !== 'string'
    ) {
      throw new Error('Invalid file: malformed page');
    }
  }

  if (
    typeof obj.activePageIndex !== 'number' ||
    obj.activePageIndex < 0 ||
    obj.activePageIndex >= obj.pages.length
  ) {
    throw new Error('Invalid file: invalid activePageIndex');
  }

  return obj as unknown as WhiteboardDocument;
}

export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function openFile(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.jam,.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      // Limit to 100MB
      if (file.size > 100 * 1024 * 1024) {
        reject(new Error('File too large (max 100MB)'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };
    input.click();
  });
}
