"use client";

import { utils, writeFile } from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate } from "./utils";

/**
 * Export an array of flat row objects to an .xlsx workbook and trigger a
 * browser download. `rows` should be an array of plain objects — object
 * keys become the header row.
 */
export function exportToExcel<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  sheetName = "Sheet1"
): void {
  const worksheet = utils.json_to_sheet(rows);

  // Auto-size columns roughly based on the longest value/header per column.
  const keys = rows.length > 0 ? Object.keys(rows[0]) : [];
  worksheet["!cols"] = keys.map((key) => {
    const maxContentLength = rows.reduce((max, row) => {
      const value = row[key];
      const length = value === null || value === undefined ? 0 : String(value).length;
      return Math.max(max, length);
    }, key.length);
    return { wch: Math.min(Math.max(maxContentLength + 2, 10), 45) };
  });

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));

  const safeFilename = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  writeFile(workbook, safeFilename);
}

export interface PdfColumn {
  header: string;
  dataKey: string;
}

const BRAND_TEAL: [number, number, number] = [15, 76, 92];
const BRAND_ORANGE: [number, number, number] = [227, 100, 20];
const BRAND_INK: [number, number, number] = [26, 26, 26];

/**
 * Export tabular data to a professional, invoice-style PDF report branded
 * for Dawat RMG SOFT, using jsPDF + jspdf-autotable.
 */
export function exportToPdf<T extends Record<string, unknown>>(
  title: string,
  columns: PdfColumn[],
  rows: T[],
  filename: string,
  options?: { subtitle?: string }
): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;

  // --- Letterhead -----------------------------------------------------
  doc.setFillColor(...BRAND_TEAL);
  doc.rect(0, 0, pageWidth, 64, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Dawat RMG SOFT", marginX, 28);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("DAWAT GARMENTS LTD. — Ashulia, Savar, Dhaka, Bangladesh", marginX, 44);

  doc.setFontSize(9);
  const generatedLabel = `Generated: ${formatDate(new Date())}`;
  doc.text(generatedLabel, pageWidth - marginX - doc.getTextWidth(generatedLabel), 28);

  doc.setDrawColor(...BRAND_ORANGE);
  doc.setLineWidth(2.5);
  doc.line(0, 64, pageWidth, 64);

  // --- Title / subtitle -------------------------------------------------
  doc.setTextColor(...BRAND_INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(title, marginX, 90);

  if (options?.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(options.subtitle, marginX, 106);
  }

  // --- Table --------------------------------------------------------
  autoTable(doc, {
    startY: options?.subtitle ? 118 : 104,
    margin: { left: marginX, right: marginX },
    head: [columns.map((c) => c.header)],
    body: rows.map((row) => columns.map((c) => formatCellValue(row[c.dataKey]))),
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 6,
      textColor: BRAND_INK,
      lineColor: [222, 217, 208],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: BRAND_TEAL,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: [247, 245, 242],
    },
    didDrawPage: () => {
      const pageCount = doc.getNumberOfPages();
      const currentPage = doc.getCurrentPageInfo().pageNumber;
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `Page ${currentPage} of ${pageCount} · Dawat RMG SOFT`,
        marginX,
        doc.internal.pageSize.getHeight() - 20
      );
    },
  });

  const safeFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  doc.save(safeFilename);
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") return value.toLocaleString("en-US");
  return String(value);
}

/**
 * Export an array of flat row objects to a downloadable CSV file. Values are
 * quoted/escaped per RFC 4180 (double quotes doubled, commas/newlines wrapped).
 */
export function exportToCsv<T extends Record<string, unknown>>(filename: string, rows: T[]): void {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

  const escapeCell = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const text = typeof value === "number" ? String(value) : String(value);
    if (/[",\n\r]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((key) => escapeCell(row[key])).join(",")),
  ];

  const blob = new Blob([`\uFEFF${lines.join("\r\n")}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/* Commercial invoice — export-quality PDF                            */
/* ------------------------------------------------------------------ */

export interface InvoiceLineItem {
  description: string;
  hsCode?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
}

export interface CommercialInvoiceInput {
  invoiceNo: string;
  invoiceDate: string;
  poNumber: string;
  buyerName: string;
  buyerAddress?: string;
  consignee?: string;
  shipmentMode: string;
  cartons?: number;
  netWeightKg?: number;
  grossWeightKg?: number;
  portOfLoading?: string;
  portOfDischarge?: string;
  countryOfOrigin?: string;
  countryOfFinalDestination?: string;
  paymentTerms?: string;
  currency?: string;
  items: InvoiceLineItem[];
  bankDetails?: string[];
  declaration?: string;
}

/**
 * Renders a professional, export-quality Commercial Invoice PDF branded for
 * Dawat RMG SOFT — used from the Shipment → Export Docs tab. Portrait A4,
 * letterhead + buyer/consignee/shipment blocks + line-item table + totals +
 * bank details + signature block.
 */
export function exportCommercialInvoicePdf(input: CommercialInvoiceInput, filename: string): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  const currency = input.currency ?? "USD";

  // --- Letterhead -----------------------------------------------------
  doc.setFillColor(...BRAND_TEAL);
  doc.rect(0, 0, pageWidth, 74, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("DAWAT GARMENTS LTD.", marginX, 30);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Ashulia, Savar, Dhaka-1341, Bangladesh", marginX, 44);
  doc.text("Phone: +880 1713-224488  ·  Email: info@samedawatgarments.com", marginX, 56);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  const invoiceLabel = "COMMERCIAL INVOICE";
  doc.text(invoiceLabel, pageWidth - marginX - doc.getTextWidth(invoiceLabel), 34);

  doc.setDrawColor(...BRAND_ORANGE);
  doc.setLineWidth(3);
  doc.line(0, 74, pageWidth, 74);

  // --- Invoice meta -----------------------------------------------------
  let y = 96;
  doc.setTextColor(...BRAND_INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`Invoice No: ${input.invoiceNo}`, marginX, y);
  doc.text(`Invoice Date: ${formatDate(input.invoiceDate)}`, pageWidth / 2 + 10, y);
  y += 15;
  doc.text(`PO / Order No: ${input.poNumber}`, marginX, y);
  doc.text(`Payment Terms: ${input.paymentTerms ?? "As per contract"}`, pageWidth / 2 + 10, y);

  // --- Buyer / Consignee blocks ------------------------------------------
  y += 20;
  const colWidth = (pageWidth - marginX * 2 - 20) / 2;

  doc.setFillColor(247, 245, 242);
  doc.rect(marginX, y, colWidth, 62, "F");
  doc.rect(marginX + colWidth + 20, y, colWidth, 62, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND_TEAL);
  doc.text("BILL TO / BUYER", marginX + 8, y + 14);
  doc.text("CONSIGNEE", marginX + colWidth + 28, y + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND_INK);
  const buyerLines = doc.splitTextToSize(
    `${input.buyerName}\n${input.buyerAddress ?? "Address on file"}`,
    colWidth - 16
  );
  doc.text(buyerLines, marginX + 8, y + 28);

  const consigneeLines = doc.splitTextToSize(
    input.consignee ?? `${input.buyerName} (Same as Buyer)`,
    colWidth - 16
  );
  doc.text(consigneeLines, marginX + colWidth + 28, y + 28);

  // --- Shipment details strip ---------------------------------------------
  y += 78;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND_TEAL);
  doc.text("SHIPMENT DETAILS", marginX, y);
  y += 12;

  const shipmentFields: [string, string][] = [
    ["Mode of Shipment", input.shipmentMode],
    ["Port of Loading", input.portOfLoading ?? "Chittagong, Bangladesh"],
    ["Port of Discharge", input.portOfDischarge ?? "—"],
    ["Country of Origin", input.countryOfOrigin ?? "Bangladesh"],
    ["Country of Destination", input.countryOfFinalDestination ?? "—"],
    ["No. of Cartons", input.cartons !== undefined ? formatCellValue(input.cartons) : "—"],
  ];
  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    theme: "plain",
    body: shipmentFields.map(([label, value]) => [label, value]),
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2, textColor: BRAND_INK },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 150, textColor: [90, 90, 90] },
    },
  });

  // --- Line items table -----------------------------------------------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const afterShipmentY = (doc as any).lastAutoTable.finalY + 14;
  const grandTotal = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalQty = input.items.reduce((sum, item) => sum + item.quantity, 0);

  autoTable(doc, {
    startY: afterShipmentY,
    margin: { left: marginX, right: marginX },
    head: [["#", "Description of Goods", "HS Code", "Qty (pcs)", "Unit Price", "Amount"]],
    body: input.items.map((item, index) => [
      String(index + 1),
      item.description,
      item.hsCode ?? "6109.10",
      formatCellValue(item.quantity),
      `${currency} ${item.unitPrice.toFixed(2)}`,
      `${currency} ${(item.quantity * item.unitPrice).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    ]),
    foot: [["", "", "TOTAL", formatCellValue(totalQty), "", `${currency} ${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]],
    styles: { font: "helvetica", fontSize: 8.5, cellPadding: 6, textColor: BRAND_INK, lineColor: [222, 217, 208], lineWidth: 0.5 },
    headStyles: { fillColor: BRAND_TEAL, textColor: [255, 255, 255], fontStyle: "bold" },
    footStyles: { fillColor: [247, 245, 242], textColor: BRAND_INK, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 24 },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let finalY = (doc as any).lastAutoTable.finalY + 20;

  // --- Declaration + bank details -----------------------------------------
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(110, 110, 110);
  const declaration =
    input.declaration ??
    "We hereby certify that the goods described above are of Bangladesh origin and that this invoice shows the actual price of the goods described, and that all particulars are true and correct.";
  const declarationLines = doc.splitTextToSize(declaration, pageWidth - marginX * 2);
  doc.text(declarationLines, marginX, finalY);
  finalY += declarationLines.length * 10 + 14;

  if (input.bankDetails && input.bankDetails.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND_TEAL);
    doc.text("BANKER'S DETAILS", marginX, finalY);
    finalY += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND_INK);
    input.bankDetails.forEach((line) => {
      doc.text(line, marginX, finalY);
      finalY += 11;
    });
  }

  // --- Signature block --------------------------------------------------
  const signatureY = Math.max(finalY + 40, doc.internal.pageSize.getHeight() - 90);
  doc.setDrawColor(200, 195, 185);
  doc.setLineWidth(0.5);
  doc.line(pageWidth - marginX - 170, signatureY, pageWidth - marginX, signatureY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND_INK);
  doc.text("For DAWAT GARMENTS LTD.", pageWidth - marginX - 170, signatureY + 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text("Authorized Signatory", pageWidth - marginX - 170, signatureY + 26);

  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Generated by Dawat RMG SOFT · ${formatDate(new Date())}`,
    marginX,
    doc.internal.pageSize.getHeight() - 20
  );

  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}

/* ------------------------------------------------------------------ */
/* Ledger statement — buyer / supplier account statement PDF          */
/* ------------------------------------------------------------------ */

export interface LedgerStatementInput {
  partyLabel: string;
  partyName: string;
  partyMeta?: string;
  rows: { label: string; value: string }[];
  summary: { label: string; value: string; emphasis?: boolean }[];
}

/**
 * Renders a compact one-party account statement (buyer or supplier ledger)
 * branded for Dawat RMG SOFT — used from Accounts → Buyer/Supplier Ledger
 * "Export Statement" actions.
 */
export function exportLedgerStatementPdf(input: LedgerStatementInput, filename: string): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;

  doc.setFillColor(...BRAND_TEAL);
  doc.rect(0, 0, pageWidth, 64, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Dawat RMG SOFT", marginX, 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("DAWAT GARMENTS LTD. — Ashulia, Savar, Dhaka, Bangladesh", marginX, 44);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  const title = "ACCOUNT STATEMENT";
  doc.text(title, pageWidth - marginX - doc.getTextWidth(title), 28);

  doc.setDrawColor(...BRAND_ORANGE);
  doc.setLineWidth(2.5);
  doc.line(0, 64, pageWidth, 64);

  let y = 90;
  doc.setTextColor(...BRAND_INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(input.partyName, marginX, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text(`${input.partyLabel}${input.partyMeta ? " · " + input.partyMeta : ""}`, marginX, y);
  doc.text(`Statement Date: ${formatDate(new Date())}`, pageWidth - marginX - 150, y);

  y += 22;
  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    head: [["Particulars", "Amount"]],
    body: input.rows.map((r) => [r.label, r.value]),
    styles: { font: "helvetica", fontSize: 9.5, cellPadding: 7, textColor: BRAND_INK, lineColor: [222, 217, 208], lineWidth: 0.5 },
    headStyles: { fillColor: BRAND_TEAL, textColor: [255, 255, 255], fontStyle: "bold" },
    columnStyles: { 1: { halign: "right" } },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let finalY = (doc as any).lastAutoTable.finalY + 16;

  input.summary.forEach((row) => {
    doc.setFont("helvetica", row.emphasis ? "bold" : "normal");
    doc.setFontSize(row.emphasis ? 11 : 9.5);
    doc.setTextColor(...(row.emphasis ? BRAND_ORANGE : BRAND_INK));
    doc.text(row.label, marginX, finalY);
    doc.text(row.value, pageWidth - marginX - doc.getTextWidth(row.value), finalY);
    finalY += row.emphasis ? 18 : 15;
  });

  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Generated by Dawat RMG SOFT · ${formatDate(new Date())}`,
    marginX,
    doc.internal.pageSize.getHeight() - 20
  );

  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
