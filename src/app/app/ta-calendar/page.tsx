"use client";

import { useState } from "react";

const Th = ({ children, className }: any) => (
  <th className={`border border-slate-300 bg-slate-200/50 px-2 py-2 text-center text-[12px] font-bold text-slate-700 whitespace-nowrap ${className || ""}`}>
    {children}
  </th>
);

const Td = ({ children, className }: any) => (
  <td className={`border border-slate-300 px-2 py-2 text-[12px] text-slate-800 ${className || ""}`}>
    {children}
  </td>
);

const Badge = ({ status }: { status: string }) => {
  const getColors = (s: string) => {
    if (s.includes('On Track')) return 'bg-green-100 text-green-800 border-green-200';
    if (s.includes('Delayed')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (s.includes('Critical')) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };
  
  return (
    <span className={`inline-block px-3 py-1 rounded-sm text-[11px] font-bold border ${getColors(status)}`}>
      {status}
    </span>
  );
};

const initialRows = [
  { id: 1, milestone: "Order Confirmation", source: "Order Status Register", planned: "01/10/25", actual: "01/10/25", variance: 0, status: "On Track" },
  { id: 2, milestone: "Lab Dip Approval", source: "Fabric Booking Register", planned: "05/10/25", actual: "07/10/25", variance: 2, status: "Delayed" },
  { id: 3, milestone: "Fabric In-house", source: "Fabric Booking Register", planned: "25/10/25", actual: "25/10/25", variance: 0, status: "On Track" },
  { id: 4, milestone: "PP Sample Approval", source: "Sample Register", planned: "28/10/25", actual: "28/10/25", variance: 0, status: "On Track" },
  { id: 5, milestone: "Accessories In-house", source: "Accessories Booking", planned: "30/10/25", actual: "30/10/25", variance: 0, status: "On Track" },
  { id: 6, milestone: "Cutting Start", source: "Production Monitoring", planned: "01/11/25", actual: "01/11/25", variance: 0, status: "On Track" },
  { id: 7, milestone: "Sewing Start", source: "Production Monitoring", planned: "05/11/25", actual: "—", variance: 0, status: "Pending" },
  { id: 8, milestone: "Finishing Complete", source: "Production Monitoring", planned: "15/11/25", actual: "—", variance: 0, status: "Pending" },
  { id: 9, milestone: "Final Inspection", source: "Final Inspection module", planned: "18/11/25", actual: "—", variance: 0, status: "Pending" },
  { id: 10, milestone: "Ex-Factory / Shipment", source: "Shipment module", planned: "20/11/25", actual: "—", variance: 0, status: "Pending" },
];

export default function TACalendar() {
  const [rows, setRows] = useState(initialRows);
  const [view, setView] = useState("list");

  return (
    <div className="flex h-[calc(100vh-60px)] flex-col bg-[#F0F4F8] p-4 text-slate-800 font-sans overflow-hidden">
      {/* Title */}
      <div className="mb-4 flex items-center justify-between rounded bg-white p-3 border border-slate-300 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold text-slate-800 tracking-wide">T&A Calendar</div>
          <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
            <span className="text-[12px] font-bold text-slate-500">PO No:</span>
            <span className="text-[14px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">DDERLP4479072</span>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-sm border border-slate-300">
          <button 
            onClick={() => setView("list")}
            className={`px-4 py-1 text-[12px] font-bold rounded-sm ${view === 'list' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-600'}`}
          >
            List View
          </button>
          <button 
            onClick={() => setView("gantt")}
            className={`px-4 py-1 text-[12px] font-bold rounded-sm ${view === 'gantt' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-600'}`}
          >
            Gantt View
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="flex-1 overflow-auto border border-slate-400 bg-white shadow-sm">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-200">
              <tr>
                <Th className="w-12 border-slate-400">Step</Th>
                <Th className="text-left w-64 border-slate-400">Milestone</Th>
                <Th className="text-left w-48 border-slate-400">Auto-Source</Th>
                <Th className="w-32 border-slate-400">Planned Date</Th>
                <Th className="w-32 border-slate-400">Actual Date</Th>
                <Th className="w-32 border-slate-400">Variance (days)</Th>
                <Th className="w-32 border-slate-400">Status</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-[#F3F6F7] even:bg-[#F9FAFB] odd:bg-white cursor-pointer group">
                  <Td className="text-center font-bold text-slate-500 border-slate-300">{row.id}</Td>
                  <Td className="font-bold text-slate-800 border-slate-300">{row.milestone}</Td>
                  <Td className="text-slate-500 text-[11px] font-medium border-slate-300 italic">{row.source}</Td>
                  <Td className="text-center font-semibold text-slate-700 border-slate-300">{row.planned}</Td>
                  <Td className="text-center font-bold text-blue-700 border-slate-300">{row.actual}</Td>
                  <Td className={`text-center font-bold border-slate-300 text-[14px] ${row.variance > 0 ? 'text-red-600' : row.variance < 0 ? 'text-green-600' : 'text-slate-400'}`}>
                    {row.variance > 0 ? `+${row.variance}` : row.variance === 0 ? '-' : row.variance}
                  </Td>
                  <Td className="text-center border-slate-300"><Badge status={row.status} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center border border-slate-400 bg-white shadow-sm">
          <div className="text-center text-slate-500">
            <p className="font-bold text-lg mb-2">Gantt Chart View</p>
            <p className="text-sm">Timeline rendering component would be mounted here.</p>
          </div>
        </div>
      )}
    </div>
  );
}
