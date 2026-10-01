'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import * as fabric from 'fabric';
import TopBar from './TopBar';
import Toolbar from './Toolbar';
import PageNavigator from './PageNavigator';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ToolType, StickyColor, WhiteboardDocument, WhiteboardPage } from '@/types/whiteboard';
import { serializeDocument, deserializeDocument, downloadFile, openFile } from '@/lib/serialization';
import { exportPdf } from '@/lib/exportPdf';
import { exportPng } from '@/lib/exportPng';
import { setupShapeDrawing, addStickyNote, setupLaser } from '@/lib/canvasHelpers';
import { useWhiteboardState } from '@/hooks/useWhiteboardState';

const W = 1920, H = 1080;

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const st = useWhiteboardState(fabricRef);

  // Init
  useEffect(() => {
    if (!canvasRef.current) return;
    const c = new fabric.Canvas(canvasRef.current, {
      width: W, height: H, backgroundColor: '#fff', preserveObjectStacking: true,
    });
    fabricRef.current = c;
    st.initHistory(c);
    const PADDING = 32;
    const resize = () => {
      const el = containerRef.current; if (!el) return;
      const { width, height } = el.getBoundingClientRect();
      const availW = width - PADDING * 2;
      const availH = height - PADDING * 2;
      const s = Math.min(availW / W, availH / H);
      c.setZoom(s);
      c.setDimensions({ width: W * s, height: H * s });
    };
    resize();
    window.addEventListener('resize', resize);
    const onMod = () => { st.pushHistory(); st.updateThumbnail(); };
    c.on('object:modified', onMod); c.on('path:created', onMod);
    return () => { window.removeEventListener('resize', resize); c.dispose(); fabricRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tool settings
  useEffect(() => { st.applyTool(); }, [st.activeTool, st.activeColor, st.activeWidth, st.activeStickyColor]);

  // beforeunload
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (st.isDirtyRef.current) e.preventDefault(); };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [st.isDirtyRef]);

  // Prevent touch zoom
  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const p = (e: TouchEvent) => { if (e.touches.length > 1) e.preventDefault(); };
    el.addEventListener('touchmove', p, { passive: false });
    el.addEventListener('touchstart', p, { passive: false });
    return () => { el.removeEventListener('touchmove', p); el.removeEventListener('touchstart', p); };
  }, []);

  useKeyboardShortcuts({
    onUndo: st.handleUndo, onRedo: st.handleRedo,
    onCopy: st.handleCopy, onPaste: st.handlePaste,
    onDelete: st.handleDelete, onSelectAll: st.handleSelectAll,
  });

  // Paste images from clipboard
  useEffect(() => {
    const handler = (e: ClipboardEvent) => st.handlePasteImage(e);
    window.addEventListener('paste', handler);
    return () => window.removeEventListener('paste', handler);
  }, [st.handlePasteImage]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100">
      <TopBar onNew={st.handleNew} onOpen={st.handleOpen} onSave={st.handleSave}
        onExportPdf={st.handleExportPdf} onExportPng={st.handleExportPng}
        onUndo={st.handleUndo} onRedo={st.handleRedo}
        canUndo={st.canUndo} canRedo={st.canRedo} />
      <div className="flex flex-1 overflow-hidden">
        <div className="p-2 overflow-y-auto">
          <Toolbar activeTool={st.activeTool} activeColor={st.activeColor}
            activeWidth={st.activeWidth} activeStickyColor={st.activeStickyColor}
            onToolChange={st.setActiveTool} onColorChange={st.setActiveColor}
            onWidthChange={st.setActiveWidth} onStickyColorChange={st.setActiveStickyColor}
            onImageUpload={st.handleImageUpload} />
        </div>
        <div ref={containerRef}
          className="flex-1 flex items-center justify-center overflow-hidden bg-gray-300"
          style={{ touchAction: 'none', padding: 32 }}>
          <canvas ref={canvasRef} className="rounded-lg shadow-xl" />
        </div>
      </div>
      <PageNavigator pageCount={st.pageCount} activePageIndex={st.activePageIndex}
        thumbnails={st.thumbnails} onPageChange={st.switchToPage}
        onAddPage={st.handleAddPage} onDeletePage={st.handleDeletePage}
        onDuplicatePage={st.handleDuplicatePage} />
    </div>
  );
}
