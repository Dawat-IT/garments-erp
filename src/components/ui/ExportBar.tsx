"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, Loader2, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ExportColumn {
  key: string;
  header: string;
}

export interface ExportBarProps {
  /** Base filename (without extension) used for downloads. */
  filename?: string;
  /** Optional title printed at the top of the PDF export. */
  title?: string;
  columns: ExportColumn[];
  rows: Array<Record<string, string | number>>;
  className?: string;
  showPrint?: boolean;
}

export function ExportBar({
  filename = "same-dawat-erp-export",
  title,
  columns,
  rows,
  className,
  showPrint = false,
}: ExportBarProps) {
  const [busy, setBusy] = useState<"pdf" | "excel" | null>(null);

  const handlePdf = async () => {
    try {
      setBusy("pdf");
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF();

      doc.setFontSize(14);
      doc.setTextColor(15, 76, 92);
      doc.text(title ?? "Dawat RMG SOFT", 14, 16);
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(new Date().toLocaleString("en-GB"), 14, 22);

      autoTable(doc, {
        startY: 27,
        head: [columns.map((c) => c.header)],
        body: rows.map((row) => columns.map((c) => String(row[c.key] ?? ""))),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [15, 76, 92], textColor: 255 },
        alternateRowStyles: { fillColor: [243, 246, 247] },
      });

      doc.save(`${filename}.pdf`);
    } finally {
      setBusy(null);
    }
  };

  const handleExcel = async () => {
    try {
      setBusy("excel");
      const XLSX = await import("xlsx");
      const sheetData = rows.map((row) => {
        const record: Record<string, string | number> = {};
        columns.forEach((col) => {
          record[col.header] = row[col.key] ?? "";
        });
        return record;
      });
      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Summary");
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={handlePdf}
        disabled={busy !== null}
        className="btn-secondary h-9 px-3 text-xs"
      >
        {busy === "pdf" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileText className="h-3.5 w-3.5" />
        )}
        PDF
      </button>
      <button
        type="button"
        onClick={handleExcel}
        disabled={busy !== null}
        className="btn-secondary h-9 px-3 text-xs"
      >
        {busy === "excel" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-3.5 w-3.5" />
        )}
        Excel
      </button>
      {showPrint && (
        <button
          type="button"
          onClick={() => window.print()}
          className="btn-secondary h-9 px-3 text-xs"
        >
          <Printer className="h-3.5 w-3.5" />
          Print
        </button>
      )}
    </div>
  );
}

export default ExportBar;
