"use client";

/**
 * Self-contained PDF / Excel export helpers for the Commercial module pages.
 * Client-only (jsPDF + xlsx both touch the DOM / trigger downloads).
 */

export type ExportColumn = {
  header: string;
  key: string;
};

function toRows(columns: ExportColumn[], data: Record<string, unknown>[]) {
  return data.map((row) => columns.map((col) => row[col.key] ?? ""));
}

export async function exportToPDF(options: {
  title: string;
  subtitle?: string;
  columns: ExportColumn[];
  data: Record<string, unknown>[];
  filename: string;
}) {
  const { title, subtitle, columns, data, filename } = options;
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape", unit: "pt" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setTextColor(15, 118, 110);
  doc.text(title, 40, 40);

  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(subtitle, 40, 58);
  }

  doc.setFontSize(9);
  doc.setTextColor(140, 140, 140);
  doc.text(`Generated: ${new Date().toLocaleString("en-CA")}`, pageWidth - 200, 40);

  autoTable(doc, {
    startY: subtitle ? 72 : 58,
    head: [columns.map((c) => c.header)],
    body: toRows(columns, data),
    styles: { fontSize: 8, cellPadding: 5, overflow: "linebreak" },
    headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [240, 253, 250] },
    theme: "grid",
    margin: { left: 40, right: 40 },
  });

  doc.save(`${filename}.pdf`);
}

export async function exportToExcel(options: {
  columns: ExportColumn[];
  data: Record<string, unknown>[];
  filename: string;
  sheetName?: string;
}) {
  const { columns, data, filename, sheetName = "Sheet1" } = options;
  const XLSX = await import("xlsx");

  const rows = data.map((row) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col) => {
      obj[col.header] = row[col.key] ?? "";
    });
    return obj;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  worksheet["!cols"] = columns.map((col) => ({ wch: Math.max(col.header.length + 2, 14) }));

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
