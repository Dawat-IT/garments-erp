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

const HeaderField = ({ label, value, width = "w-32" }: any) => (
  <div className="flex items-center gap-2">
    <span className="text-[12px] font-bold text-slate-600 whitespace-nowrap">{label}:</span>
    <input
      type="text"
      defaultValue={value}
      readOnly
      className={`h-8 ${width} border border-slate-300 bg-slate-50 px-2 text-[13px] font-bold text-slate-800 focus:outline-none`}
    />
  </div>
);

const initialRows = [
  { id: 1, category: "Critical", desc: "Broken needle / sharp edges", qty: 0, limit: 0 },
  { id: 2, category: "Major", desc: "Open seam / incorrect measurement", qty: 8, limit: 14 },
  { id: 3, category: "Minor", desc: "Uncut thread / minor stain", qty: 15, limit: 21 },
];

export default function FinalInspectionQC() {
  const [rows, setRows] = useState(initialRows);

  const handleQtyChange = (index: number, val: string) => {
    const updated = [...rows];
    updated[index].qty = parseInt(val) || 0;
    setRows(updated);
  };

  const getResult = (qty: number, limit: number) => {
    return qty <= limit ? "PASS" : "FAIL";
  };

  const isOverallPass = rows.every(r => r.qty <= r.limit);

  return (
    <div className="flex h-[calc(100vh-60px)] flex-col bg-[#F0F4F8] p-4 text-slate-800 font-sans overflow-hidden">
      {/* Title */}
      <div className="mb-4 flex items-center justify-between rounded bg-white p-3 border border-slate-300 shadow-sm">
        <div className="flex-1 text-center text-xl font-bold text-slate-800 tracking-wide uppercase">Final Inspection / Pre-Shipment QC</div>
      </div>

      {/* Header Form */}
      <div className="mb-4 grid grid-cols-4 gap-6 bg-white p-4 border border-slate-300 shadow-sm">
        <HeaderField label="PO No" value="DDERLP4479072" width="w-48" />
        <HeaderField label="Buyer" value="BESTSELLER" width="w-48" />
        <HeaderField label="Inspection Date" value="18/11/2025" width="w-40" />
        <HeaderField label="Inspector Name" value="Md. Rahman (3rd Party)" width="w-48" />
        
        <HeaderField label="AQL Level" value="2.5" width="w-48" />
        <HeaderField label="Lot Size (Order Qty)" value="141,155" width="w-48" />
        <HeaderField label="Sample Size" value="800" width="w-40" />
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-auto border border-slate-400 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-200">
            <tr>
              <Th className="text-left w-48 border-slate-400">Defect Category</Th>
              <Th className="text-left border-slate-400">Defect Description</Th>
              <Th className="text-red-700 w-32 border-slate-400">Qty Found</Th>
              <Th className="w-32 border-slate-400">Allowed Limit (AQL)</Th>
              <Th className="w-40 border-slate-400">Result</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const res = getResult(row.qty, row.limit);
              return (
                <tr key={row.id} className="hover:bg-[#F3F6F7] even:bg-[#F9FAFB] odd:bg-white group">
                  <Td className="font-bold border-slate-300">
                    <span className={`px-2 py-1 rounded text-[11px] uppercase ${row.category === 'Critical' ? 'bg-red-100 text-red-700' : row.category === 'Major' ? 'bg-amber-100 text-amber-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {row.category}
                    </span>
                  </Td>
                  <Td className="border-slate-300">
                    <input type="text" defaultValue={row.desc} className="w-full bg-transparent text-[12px] focus:outline-none font-medium" />
                  </Td>
                  <Td className="text-right p-0 border-slate-300">
                    <input
                      type="number"
                      value={row.qty}
                      onChange={(e) => handleQtyChange(idx, e.target.value)}
                      className="w-full h-full bg-[#FFF5F5] px-3 py-3 text-right text-[14px] font-bold text-red-600 focus:outline-none focus:bg-red-50 border border-transparent focus:border-red-400"
                    />
                  </Td>
                  <Td className="text-center font-bold text-slate-700 border-slate-300 text-[14px] bg-[#F0F7FF]">{row.limit}</Td>
                  <Td className="text-center border-slate-300">
                    <span className={`px-4 py-1.5 rounded-sm text-[12px] font-bold ${res === 'PASS' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
                      {res}
                    </span>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer / Sign-off */}
      <div className="mt-4 flex flex-col gap-4 bg-white p-4 border border-slate-300 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-slate-700 uppercase">Overall Result:</span>
            <span className={`px-8 py-2 rounded text-[16px] font-extrabold tracking-wider border-2 ${isOverallPass ? 'bg-green-100 text-green-700 border-green-500' : 'bg-red-100 text-red-700 border-red-500'}`}>
              {isOverallPass ? 'PASS — CLEARED FOR SHIPMENT' : 'FAIL — RE-INSPECTION REQUIRED'}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between px-16 pt-8 pb-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-48 border-b-2 border-slate-800 border-dashed h-8"></div>
            <span className="text-[12px] font-bold text-slate-600">Inspector Signature</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-48 border-b-2 border-slate-800 border-dashed h-8"></div>
            <span className="text-[12px] font-bold text-slate-600">Factory QA Manager</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-48 border-b-2 border-slate-800 border-dashed h-8"></div>
            <span className="text-[12px] font-bold text-slate-600">Buyer QC Sign-off</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex flex-wrap gap-3 bg-[#E1E7EC] p-3 border border-slate-300">
        <button className="bg-slate-100 border border-slate-400 hover:bg-slate-200 px-6 py-2 text-[12px] font-bold text-slate-800 shadow-sm rounded-sm">
          Print Certificate
        </button>
        <button className="bg-green-600 border border-green-700 hover:bg-green-700 text-white px-6 py-2 text-[12px] font-bold shadow-sm rounded-sm">
          Excel Export
        </button>
        <div className="flex-1"></div>
        <button className="bg-blue-600 border border-blue-700 hover:bg-blue-700 text-white px-8 py-2 text-[12px] font-bold shadow-sm rounded-sm">
          Submit Report
        </button>
      </div>
    </div>
  );
}
