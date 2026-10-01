import * as fabric from 'fabric';
import { ToolType, StickyColor, STICKY_COLORS } from '@/types/whiteboard';

export function setupShapeDrawing(
  canvas: fabric.Canvas,
  tool: ToolType,
  color: string,
  width: number,
  pushHistory: () => void,
  updateThumbnail: () => void,
  drawingShapeRef: React.RefObject<fabric.FabricObject | null>,
  drawStartRef: React.RefObject<{ x: number; y: number } | null>,
) {
  canvas.on('mouse:down', (opt) => {
    const pointer = canvas.getScenePoint(opt.e);
    drawStartRef.current = { x: pointer.x, y: pointer.y };
    const baseOpts = {
      stroke: color, strokeWidth: width,
      fill: 'transparent', selectable: false, evented: false,
    };
    let shape: fabric.FabricObject;
    switch (tool) {
      case 'line':
      case 'arrow':
        shape = new fabric.Line(
          [pointer.x, pointer.y, pointer.x, pointer.y], baseOpts,
        );
        break;
      case 'rectangle':
        shape = new fabric.Rect({
          left: pointer.x, top: pointer.y,
          width: 0, height: 0, ...baseOpts,
        });
        break;
      case 'circle':
        shape = new fabric.Ellipse({
          left: pointer.x, top: pointer.y,
          rx: 0, ry: 0, ...baseOpts,
        });
        break;
      default:
        return;
    }
    canvas.add(shape);
    drawingShapeRef.current = shape;
  });

  canvas.on('mouse:move', (opt) => {
    if (!drawingShapeRef.current || !drawStartRef.current) return;
    const pointer = canvas.getScenePoint(opt.e);
    const s = drawStartRef.current;
    const shape = drawingShapeRef.current;
    if (tool === 'line' || tool === 'arrow') {
      (shape as fabric.Line).set({ x2: pointer.x, y2: pointer.y });
    } else if (tool === 'rectangle') {
      (shape as fabric.Rect).set({
        left: Math.min(s.x, pointer.x),
        top: Math.min(s.y, pointer.y),
        width: Math.abs(pointer.x - s.x),
        height: Math.abs(pointer.y - s.y),
      });
    } else if (tool === 'circle') {
      (shape as fabric.Ellipse).set({
        left: Math.min(s.x, pointer.x),
        top: Math.min(s.y, pointer.y),
        rx: Math.abs(pointer.x - s.x) / 2,
        ry: Math.abs(pointer.y - s.y) / 2,
      });
    }
    canvas.requestRenderAll();
  });

  canvas.on('mouse:up', () => {
    if (!drawingShapeRef.current) return;
    if (tool === 'arrow') {
      const line = drawingShapeRef.current as fabric.Line;
      const x1 = line.x1 ?? 0, y1 = line.y1 ?? 0;
      const x2 = line.x2 ?? 0, y2 = line.y2 ?? 0;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const h = 15;
      const head = new fabric.Polygon(
        [
          { x: x2, y: y2 },
          { x: x2 - h * Math.cos(angle - Math.PI / 6), y: y2 - h * Math.sin(angle - Math.PI / 6) },
          { x: x2 - h * Math.cos(angle + Math.PI / 6), y: y2 - h * Math.sin(angle + Math.PI / 6) },
        ],
        { fill: color, stroke: color, selectable: false, evented: false },
      );
      canvas.add(head);
    }
    drawingShapeRef.current = null;
    drawStartRef.current = null;
    pushHistory();
    updateThumbnail();
  });
}

export function addStickyNote(
  canvas: fabric.Canvas,
  x: number, y: number,
  stickyColor: StickyColor,
  pushHistory: () => void,
  updateThumbnail: () => void,
) {
  const S = 200;
  const bg = new fabric.Rect({
    width: S, height: S,
    fill: STICKY_COLORS[stickyColor],
    rx: 8, ry: 8,
    shadow: new fabric.Shadow({
      color: 'rgba(0,0,0,0.2)', blur: 8, offsetX: 2, offsetY: 2,
    }),
  });
  const text = new fabric.IText('Note', {
    fontSize: 20, fill: '#333',
    fontFamily: 'sans-serif', left: 15, top: 15,
  });
  const group = new fabric.Group([bg, text], {
    left: x - S / 2, top: y - S / 2,
    subTargetCheck: true,
  });
  canvas.add(group);
  canvas.setActiveObject(group);
  canvas.requestRenderAll();
  pushHistory();
  updateThumbnail();
}

export function setupLaser(
  canvas: fabric.Canvas,
  laserDotsRef: React.RefObject<fabric.FabricObject[]>,
) {
  canvas.on('mouse:move', (opt) => {
    const pointer = canvas.getScenePoint(opt.e);
    const dot = new fabric.Circle({
      left: pointer.x - 8, top: pointer.y - 8,
      radius: 8,
      fill: 'rgba(255,0,0,0.8)',
      stroke: 'rgba(255,0,0,0.4)',
      strokeWidth: 4,
      selectable: false, evented: false,
      excludeFromExport: true,
    });
    canvas.add(dot);
    laserDotsRef.current.push(dot);
    setTimeout(() => {
      canvas.remove(dot);
      const idx = laserDotsRef.current.indexOf(dot);
      if (idx >= 0) laserDotsRef.current.splice(idx, 1);
      canvas.requestRenderAll();
    }, 1500);
    canvas.requestRenderAll();
  });
}
