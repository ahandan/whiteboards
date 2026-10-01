"use client";

import { useRef, useCallback, useState } from "react";
import * as fabric from "fabric";
import { ToolType, StickyColor, WhiteboardDocument, WhiteboardPage } from "@/types/whiteboard";
import { serializeDocument, deserializeDocument, downloadFile, openFile } from "@/lib/serialization";
import { exportPdf } from "@/lib/exportPdf";
import { exportPng } from "@/lib/exportPng";
import { setupShapeDrawing, addStickyNote, setupLaser } from "@/lib/canvasHelpers";

const W = 1920, H = 1080;

export function useWhiteboardState(fabricRef: React.RefObject<fabric.Canvas | null>) {
  const [activeTool, setActiveTool] = useState<ToolType>("pen");
  const [activeColor, setActiveColor] = useState("#000000");
  const [activeWidth, setActiveWidth] = useState(4);
  const [activeStickyColor, setActiveStickyColor] = useState<StickyColor>("yellow");

  const pagesRef = useRef<WhiteboardPage[]>([{ id: crypto.randomUUID(), canvasJSON: "{}" }]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [thumbnails, setThumbnails] = useState<string[]>([""]);

  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const isUndoRedoRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const isDirtyRef = useRef(false);

  const drawingShapeRef = useRef<fabric.FabricObject | null>(null);
  const drawStartRef = useRef<{ x: number; y: number } | null>(null);
  const laserDotsRef = useRef<fabric.FabricObject[]>([]);
  const clipboardRef = useRef<fabric.FabricObject | null>(null);
  const activePageIndexRef = useRef(0);

  const setPageIdx = useCallback((i: number) => {
    activePageIndexRef.current = i;
    setActivePageIndex(i);
  }, []);

  const markDirty = useCallback(() => { isDirtyRef.current = true; }, []);

  const saveCurrentPage = useCallback(() => {
    const c = fabricRef.current; if (!c) return;
    pagesRef.current[activePageIndexRef.current] = {
      ...pagesRef.current[activePageIndexRef.current],
      canvasJSON: JSON.stringify(c.toJSON()),
    };
  }, [fabricRef]);

  const updateThumbnail = useCallback((index?: number) => {
    const c = fabricRef.current; if (!c) return;
    const idx = index ?? activePageIndexRef.current;
    const url = c.toDataURL({ format: "png", multiplier: 0.1 });
    setThumbnails((p) => { const n = [...p]; n[idx] = url; return n; });
  }, [fabricRef]);

  const pushHistory = useCallback(() => {
    if (isUndoRedoRef.current) return;
    const c = fabricRef.current; if (!c) return;
    const json = JSON.stringify(c.toJSON());
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(json);
    if (historyRef.current.length > 50) historyRef.current = historyRef.current.slice(-50);
    historyIndexRef.current = historyRef.current.length - 1;
    setCanUndo(historyIndexRef.current > 0); setCanRedo(false); markDirty();
  }, [fabricRef, markDirty]);

  const resetHistory = useCallback((json?: string) => {
    historyRef.current = [json ?? JSON.stringify(fabricRef.current?.toJSON() ?? {})];
    historyIndexRef.current = 0; setCanUndo(false); setCanRedo(false);
  }, [fabricRef]);

  const initHistory = useCallback((c: fabric.Canvas) => {
    historyRef.current = [JSON.stringify(c.toJSON())];
    historyIndexRef.current = 0;
  }, []);

  const applyTool = useCallback(() => {
    const c = fabricRef.current; if (!c) return;
    c.isDrawingMode = false; c.selection = false;
    c.defaultCursor = "default"; c.hoverCursor = "default";
    c.off("mouse:down"); c.off("mouse:move"); c.off("mouse:up");
    const lock = () => c.forEachObject((o) => { o.selectable = false; o.evented = false; });

    switch (activeTool) {
      case "select":
        c.selection = true; c.hoverCursor = "move";
        c.forEachObject((o) => { o.selectable = true; o.evented = true; });
        break;
      case "pen": {
        c.isDrawingMode = true;
        const b = new fabric.PencilBrush(c); b.color = activeColor; b.width = activeWidth;
        c.freeDrawingBrush = b; lock(); break;
      }
      case "highlighter": {
        c.isDrawingMode = true;
        const r = parseInt(activeColor.slice(1, 3), 16);
        const g = parseInt(activeColor.slice(3, 5), 16);
        const bl = parseInt(activeColor.slice(5, 7), 16);
        const b = new fabric.PencilBrush(c);
        b.color = "rgba(" + r + "," + g + "," + bl + ",0.35)"; b.width = activeWidth;
        c.freeDrawingBrush = b; lock(); break;
      }
      case "eraser":
        c.defaultCursor = "crosshair"; c.hoverCursor = "crosshair";
        c.forEachObject((o) => {
          const isImage = o instanceof fabric.FabricImage;
          o.selectable = false;
          o.evented = !isImage;
        });
        c.on("mouse:down", (opt) => {
          const t = c.findTarget(opt.e);
          if (t && !(t instanceof fabric.FabricImage)) {
            c.remove(t); c.requestRenderAll(); pushHistory(); updateThumbnail();
          }
        });
        break;
      case "line": case "arrow": case "rectangle": case "circle":
        c.defaultCursor = "crosshair"; lock();
        setupShapeDrawing(c, activeTool, activeColor, activeWidth, pushHistory, updateThumbnail, drawingShapeRef, drawStartRef);
        break;
      case "text":
        c.defaultCursor = "text"; lock();
        c.on("mouse:down", (opt) => {
          const p = c.getScenePoint(opt.e);
          const t = new fabric.IText("Texte", { left: p.x, top: p.y, fontSize: 24, fill: activeColor, fontFamily: "sans-serif" });
          c.add(t); c.setActiveObject(t); t.enterEditing(); c.requestRenderAll();
          pushHistory(); updateThumbnail(); setActiveTool("select");
        });
        break;
      case "sticky":
        c.defaultCursor = "crosshair"; lock();
        c.on("mouse:down", (opt) => {
          const p = c.getScenePoint(opt.e);
          addStickyNote(c, p.x, p.y, activeStickyColor, pushHistory, updateThumbnail);
          setActiveTool("select");
        });
        break;
      case "laser":
        c.defaultCursor = "none"; lock(); setupLaser(c, laserDotsRef); break;
    }
  }, [fabricRef, activeTool, activeColor, activeWidth, activeStickyColor, pushHistory, updateThumbnail]);

  const restoreJSON = useCallback(async (json: string) => {
    const c = fabricRef.current; if (!c) return;
    isUndoRedoRef.current = true;
    await c.loadFromJSON(JSON.parse(json));
    c.backgroundColor = "#fff"; c.requestRenderAll();
    isUndoRedoRef.current = false; applyTool(); updateThumbnail(); markDirty();
  }, [fabricRef, applyTool, updateThumbnail, markDirty]);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    setCanUndo(historyIndexRef.current > 0); setCanRedo(true);
    restoreJSON(historyRef.current[historyIndexRef.current]);
  }, [restoreJSON]);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    setCanUndo(true); setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    restoreJSON(historyRef.current[historyIndexRef.current]);
  }, [restoreJSON]);

  const handleCopy = useCallback(() => {
    fabricRef.current?.getActiveObject()?.clone().then((cl: fabric.FabricObject) => { clipboardRef.current = cl; });
  }, [fabricRef]);

  const handlePaste = useCallback(() => {
    if (!clipboardRef.current || !fabricRef.current) return;
    clipboardRef.current.clone().then((cl: fabric.FabricObject) => {
      cl.set({ left: (cl.left ?? 0) + 20, top: (cl.top ?? 0) + 20 });
      fabricRef.current!.add(cl); fabricRef.current!.setActiveObject(cl);
      fabricRef.current!.requestRenderAll(); pushHistory(); updateThumbnail();
    });
  }, [fabricRef, pushHistory, updateThumbnail]);

  const handleDelete = useCallback(() => {
    const c = fabricRef.current; if (!c) return;
    const a = c.getActiveObjects();
    if (a.length) { a.forEach((o) => c.remove(o)); c.discardActiveObject(); c.requestRenderAll(); pushHistory(); updateThumbnail(); }
  }, [fabricRef, pushHistory, updateThumbnail]);

  const handleSelectAll = useCallback(() => {
    const c = fabricRef.current; if (!c) return;
    c.discardActiveObject();
    const objs = c.getObjects();
    if (objs.length) { c.setActiveObject(new fabric.ActiveSelection(objs, { canvas: c })); c.requestRenderAll(); }
  }, [fabricRef]);

  const switchToPage = useCallback(async (i: number) => {
    if (i === activePageIndexRef.current) return;
    saveCurrentPage(); updateThumbnail();
    const c = fabricRef.current; if (!c) return;
    await c.loadFromJSON(JSON.parse(pagesRef.current[i].canvasJSON));
    c.backgroundColor = "#fff"; c.requestRenderAll();
    setPageIdx(i); resetHistory(pagesRef.current[i].canvasJSON);
    updateThumbnail(i); applyTool();
  }, [fabricRef, saveCurrentPage, updateThumbnail, setPageIdx, resetHistory, applyTool]);

  const handleAddPage = useCallback(() => {
    saveCurrentPage(); updateThumbnail();
    pagesRef.current.push({ id: crypto.randomUUID(), canvasJSON: "{}" });
    setPageCount(pagesRef.current.length); setThumbnails((p) => [...p, ""]);
    const c = fabricRef.current;
    if (c) { c.clear(); c.backgroundColor = "#fff"; c.requestRenderAll(); }
    setPageIdx(pagesRef.current.length - 1); resetHistory(); markDirty();
  }, [fabricRef, saveCurrentPage, updateThumbnail, setPageIdx, resetHistory, markDirty]);

  const handleDeletePage = useCallback(() => {
    if (pagesRef.current.length <= 1) return;
    pagesRef.current.splice(activePageIndexRef.current, 1);
    setPageCount(pagesRef.current.length);
    setThumbnails((p) => { const n = [...p]; n.splice(activePageIndexRef.current, 1); return n; });
    const ni = Math.min(activePageIndexRef.current, pagesRef.current.length - 1);
    fabricRef.current?.loadFromJSON(JSON.parse(pagesRef.current[ni].canvasJSON)).then(() => {
      fabricRef.current!.backgroundColor = "#fff"; fabricRef.current!.requestRenderAll(); applyTool();
    });
    setPageIdx(ni); resetHistory(pagesRef.current[ni].canvasJSON); markDirty();
  }, [fabricRef, applyTool, setPageIdx, resetHistory, markDirty]);

  const handleDuplicatePage = useCallback(() => {
    saveCurrentPage(); updateThumbnail();
    const cur = pagesRef.current[activePageIndexRef.current];
    const dup: WhiteboardPage = { id: crypto.randomUUID(), canvasJSON: cur.canvasJSON };
    pagesRef.current.splice(activePageIndexRef.current + 1, 0, dup);
    setPageCount(pagesRef.current.length);
    setThumbnails((p) => { const n = [...p]; n.splice(activePageIndexRef.current + 1, 0, p[activePageIndexRef.current] ?? ""); return n; });
    fabricRef.current?.loadFromJSON(JSON.parse(dup.canvasJSON)).then(() => {
      fabricRef.current!.backgroundColor = "#fff"; fabricRef.current!.requestRenderAll(); applyTool();
    });
    setPageIdx(activePageIndexRef.current + 1); resetHistory(dup.canvasJSON); markDirty();
  }, [fabricRef, saveCurrentPage, updateThumbnail, applyTool, setPageIdx, resetHistory, markDirty]);

  const handleNew = useCallback(() => {
    if (isDirtyRef.current && !confirm("Le contenu non sauvegard\u00e9 sera perdu. Cr\u00e9er un nouveau tableau?")) return;
    const c = fabricRef.current;
    if (c) { c.clear(); c.backgroundColor = "#fff"; c.requestRenderAll(); }
    pagesRef.current = [{ id: crypto.randomUUID(), canvasJSON: "{}" }];
    setPageIdx(0); setPageCount(1); setThumbnails([""]); resetHistory(); isDirtyRef.current = false;
  }, [fabricRef, setPageIdx, resetHistory]);

  const handleSave = useCallback(() => {
    saveCurrentPage();
    const doc: WhiteboardDocument = { version: 1, pages: pagesRef.current, activePageIndex: activePageIndexRef.current };
    downloadFile(serializeDocument(doc), "tableau.jam", "application/json");
    isDirtyRef.current = false;
  }, [saveCurrentPage]);

  const handleOpen = useCallback(async () => {
    if (isDirtyRef.current && !confirm("Le contenu non sauvegard\u00e9 sera perdu. Ouvrir un fichier?")) return;
    try {
      const raw = await openFile();
      const doc = deserializeDocument(raw);
      pagesRef.current = doc.pages;
      setPageCount(doc.pages.length); setPageIdx(doc.activePageIndex);
      const c = fabricRef.current; if (!c) return;
      await c.loadFromJSON(JSON.parse(doc.pages[doc.activePageIndex].canvasJSON));
      c.backgroundColor = "#fff"; c.requestRenderAll();
      setThumbnails(doc.pages.map(() => "")); updateThumbnail(doc.activePageIndex);
      resetHistory(doc.pages[doc.activePageIndex].canvasJSON);
      isDirtyRef.current = false; applyTool();
    } catch (e) { alert("Erreur: " + (e instanceof Error ? e.message : "Fichier invalide")); }
  }, [fabricRef, applyTool, updateThumbnail, setPageIdx, resetHistory]);

  const handleExportPdf = useCallback(async () => {
    saveCurrentPage();
    const c = fabricRef.current; if (!c) return;
    const canvases: HTMLCanvasElement[] = [];
    for (let i = 0; i < pagesRef.current.length; i++) {
      if (i === activePageIndexRef.current) { canvases.push(c.toCanvasElement()); }
      else {
        const tmp = document.createElement("canvas");
        const tc = new fabric.Canvas(tmp, { width: W, height: H, backgroundColor: "#fff" });
        await tc.loadFromJSON(JSON.parse(pagesRef.current[i].canvasJSON));
        tc.requestRenderAll(); canvases.push(tc.toCanvasElement()); tc.dispose();
      }
    }
    exportPdf(canvases, "tableau.pdf");
  }, [fabricRef, saveCurrentPage]);

  const handleExportPng = useCallback(() => {
    const c = fabricRef.current; if (!c) return;
    exportPng(c.toCanvasElement(), "tableau.png");
  }, [fabricRef]);

  const addImageFromDataUrl = useCallback((dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const c = fabricRef.current; if (!c) return;
      const fi = new fabric.FabricImage(img);
      fi.scale(Math.min(W * 0.5 / img.width, H * 0.5 / img.height, 1));
      fi.set({ left: 100, top: 100 });
      c.add(fi); c.setActiveObject(fi); c.requestRenderAll();
      pushHistory(); updateThumbnail(); setActiveTool("select");
    };
    img.src = dataUrl;
  }, [fabricRef, pushHistory, updateThumbnail]);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/png,image/jpeg,image/webp";
    input.onchange = () => {
      const file = input.files?.[0]; if (!file) return;
      if (file.size > 10 * 1024 * 1024) { alert("Image trop grande (max 10 Mo)"); return; }
      const reader = new FileReader();
      reader.onload = () => addImageFromDataUrl(reader.result as string);
      reader.readAsDataURL(file);
    };
    input.click();
  }, [addImageFromDataUrl]);

  const handlePasteImage = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        if (file.size > 10 * 1024 * 1024) { alert("Image trop grande (max 10 Mo)"); return; }
        const reader = new FileReader();
        reader.onload = () => addImageFromDataUrl(reader.result as string);
        reader.readAsDataURL(file);
        return;
      }
    }
  }, [addImageFromDataUrl]);

  return {
    activeTool, setActiveTool, activeColor, setActiveColor,
    activeWidth, setActiveWidth, activeStickyColor, setActiveStickyColor,
    activePageIndex, pageCount, thumbnails, canUndo, canRedo, isDirtyRef,
    initHistory, applyTool, pushHistory, updateThumbnail,
    handleUndo, handleRedo, handleCopy, handlePaste, handleDelete, handleSelectAll,
    switchToPage, handleAddPage, handleDeletePage, handleDuplicatePage,
    handleNew, handleSave, handleOpen, handleExportPdf, handleExportPng, handleImageUpload, handlePasteImage,
  };
}
