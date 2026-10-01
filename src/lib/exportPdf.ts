import { jsPDF } from 'jspdf';

export function exportPdf(pages: HTMLCanvasElement[], filename = 'whiteboard.pdf') {
  if (pages.length === 0) return;
  const first = pages[0];
  const pdf = new jsPDF({
    orientation: first.width > first.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [first.width, first.height],
  });

  pages.forEach((canvas, i) => {
    if (i > 0) {
      pdf.addPage([canvas.width, canvas.height], canvas.width > canvas.height ? 'landscape' : 'portrait');
    }
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  });

  pdf.save(filename);
}
