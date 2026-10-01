import { describe, it, expect } from 'vitest';
import { serializeDocument, deserializeDocument } from '../serialization';
import { WhiteboardDocument } from '@/types/whiteboard';

const validDoc: WhiteboardDocument = {
  version: 1,
  pages: [
    { id: 'page-1', canvasJSON: '{"objects":[]}' },
    { id: 'page-2', canvasJSON: '{"objects":[{"type":"rect"}]}' },
  ],
  activePageIndex: 0,
};

describe('serializeDocument', () => {
  it('should produce valid JSON', () => {
    const json = serializeDocument(validDoc);
    expect(() => JSON.parse(json)).not.toThrow();
  });
});

describe('deserializeDocument', () => {
  it('should round-trip a valid document', () => {
    const json = serializeDocument(validDoc);
    const restored = deserializeDocument(json);
    expect(restored.version).toBe(1);
    expect(restored.pages).toHaveLength(2);
    expect(restored.pages[0].id).toBe('page-1');
    expect(restored.activePageIndex).toBe(0);
  });

  it('should reject invalid JSON', () => {
    expect(() => deserializeDocument('not json')).toThrow('not valid JSON');
  });

  it('should reject wrong version', () => {
    const bad = JSON.stringify({ version: 99, pages: [{ id: 'a', canvasJSON: '{}' }], activePageIndex: 0 });
    expect(() => deserializeDocument(bad)).toThrow('Unsupported version');
  });

  it('should reject missing pages', () => {
    const bad = JSON.stringify({ version: 1, pages: [], activePageIndex: 0 });
    expect(() => deserializeDocument(bad)).toThrow('missing pages');
  });

  it('should reject malformed page', () => {
    const bad = JSON.stringify({ version: 1, pages: [{ id: 123 }], activePageIndex: 0 });
    expect(() => deserializeDocument(bad)).toThrow('malformed page');
  });

  it('should reject out-of-range activePageIndex', () => {
    const bad = JSON.stringify({ version: 1, pages: [{ id: 'a', canvasJSON: '{}' }], activePageIndex: 5 });
    expect(() => deserializeDocument(bad)).toThrow('invalid activePageIndex');
  });

  it('should preserve canvas data through round-trip', () => {
    const json = serializeDocument(validDoc);
    const restored = deserializeDocument(json);
    expect(restored.pages[1].canvasJSON).toBe('{"objects":[{"type":"rect"}]}');
  });
});
