"use client";

import { useState } from "react";

const Th = ({ children, className }: any) => (
  <th className={`border border-slate-300 bg-slate-200/50 px-2 py-2 text-center text-[11px] font-bold text-slate-700 whitespace-nowrap ${className || ""}`}>
    {children}
  </th>
);

const Td = ({ children, className }: any) => (
  <td className={`border border-slate-300 px-2 py-2 text-[11px] text-slate-800 ${className || ""}`}>
    {children}
  </td>
);

const HeaderField = ({ label, value, width = "w-32" }: any) => (
  <div className="flex items-center gap-2">
    <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">{label}:</span>
    <input
      type="text"
      defaultValue={value}
      readOnly
      className={`h-7 ${width} border border-slate-300 bg-slate-50 px-2 text-[12px] font-semibold text-slate-800 focus:outline-none`}
    />
  </div>
);

const initialRows = [
  { id: 1, date: "01/11/25", stage: "Sewing", target: 2000, actual: 1750, cum: 1750, defect: 42, remarks: "Machine breakdown line 4" },
  { id: 2, date: "02/11/25", stage: "Sewing", target: 2000, actual: 1900, cum: 3650, defect: 38, remarks: "Normal production" },
  { id: 3, date: "03/11/25", stage: "Sewing", target: 2200, actual: 2100, cum: 5750, defect: 35, remarks: "Normal production" },
  { id: 4, date: "04/11/25", stage: "Sewing", target: 2200, actual: 2180, cum: 7930, defect: 20, remarks: "Good efficiency" },
  { id: 5, date: "05/11/25", stage: "Sewing", target: 2200, actual: 2200, cum: 10130, defect: 15, remarks: "Target achieved" },
];

export default function ProductionMonitoring() {
  const [rows, setRows] = useState(initialRows);
  const orderQty = 141155;

  const handleActualChange = (index: number, val: string) => {
    const updated = [...rows];
    updated[index].actual = parseInt(val) || 0;
    
    // Recalculate cumulatives
    let cum = 0;
    for (let i = 0; i < updated.length; i++) {
      cum += updated[i].actual;
      updated[i].cum = cum;
    }
    setRows(updated);
  };

  const handleDefectChange = (index: number, val: string) => {
    const updated = [...rows];
    updated[index].defect = parseInt(val) || 0;
    setRows(updated);
  };

  const totalTarget = rows.reduce((sum, r) => sum + r.target, 0);
  const totalActual = rows.reduce((sum, r) => sum + r.actual, 0);
  const overallEff = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;
  
  const totalDefect = rows.reduce((sum, r) => sum + r.defect, 0);
  const overallDefectRate = totalActual > 0 ? (totalDefect / totalActual) * 100 : 0;

  const remainingToTarget = orderQty - totalActual;

  return (
    <div className="flex h-[calc(100vh-60px)] flex-col bg-[#F0F4F8] p-2 text-slate-800 font-sans overflow-hidden">
      {/* Title */}
      <div className="mb-2 flex items-center justify-between rounded bg-slate-200 p-2 border border-slate-300">
        <div className="flex-1 text-center text-lg font-bold text-slate-800 tracking-wide">Production Monitoring</div>
      </div>

      {/* Header Form */}
      <div className="mb-2 grid grid-cols-4 gap-4 bg-white p-3 border border-slate-300 shadow-sm">
        <HeaderField label="PO No" value="DDERLP4479072" width="w-40" />
        <HeaderField label="Style" value="13190372-Nk" width="w-40" />
        <HeaderField label="Order Qty" value="141,155" width="w-32" />
        <HeaderField label="Line No" value="Line 04, 05" width="w-32" />
        
        <HeaderField label="Cutting Start" value="01/11/25" width="w-40" />
        <HeaderField label="Sewing Start" value="05/11/25" width="w-40" />
        <HeaderField label="Buyer" value="BESTSELLER" width="w-32" />
        <HeaderField label="Current Stage" value="Sewing" width="w-32" />
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-auto border border-slate-400 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-200">
            <tr>
              <Th className="w-8 border-slate-400">#</Th>
              <Th className="w-24 border-slate-400">Date</Th>
              <Th className="w-32 border-slate-400">Stage</Th>
              <Th className="w-32 border-slate-400">Target Qty (Day)</Th>
              <Th className="text-blue-700 w-32 border-slate-400">Actual Qty (Day)</Th>
              <Th className="text-green-700 w-32 border-slate-400">Cumulative Actual</Th>
              <Th className="w-24 border-slate-400">Efficiency %</Th>
              <Th className="text-red-700 w-24 border-slate-400">Defect Qty</Th>
              <Th className="text-red-700 w-24 border-slate-400">Defect Rate %</Th>
              <Th className="text-left border-slate-400">Remarks</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const eff = row.target > 0 ? (row.actual / row.target) * 100 : 0;
              const defRate = row.actual > 0 ? (row.defect / row.actual) * 100 : 0;
              
              return (
                <tr key={row.id} className="hover:bg-[#F3F6F7] even:bg-[#F9FAFB] odd:bg-white group">
                  <Td className="text-center font-bold text-slate-500 border-slate-300">{idx + 1}</Td>
                  <Td className="text-center font-medium border-slate-300">{row.date}</Td>
                  <Td className="text-center border-slate-300">
                    <select value={row.stage} className="w-full bg-transparent text-[11px] font-semibold focus:outline-none text-center" disabled>
                      <option>Cutting</option>
                      <option>Sewing</option>
                      <option>Finishing</option>
                      <option>Packing</option>
                    </select>
                  </Td>
                  <Td className="text-right font-semibold border-slate-300">{row.target.toLocaleString()}</Td>
                  <Td className="text-right p-0 border-slate-300">
                    <input
                      type="number"
                      value={row.actual}
                      onChange={(e) => handleActualChange(idx, e.target.value)}
                      className="w-full h-full bg-[#F0F7FF] px-2 py-2 text-right text-[12px] font-bold text-blue-700 focus:outline-none focus:bg-blue-50 border border-transparent focus:border-blue-400"
                    />
                  </Td>
                  <Td className="text-right font-bold text-green-700 border-slate-300 bg-[#F0FFF4]">{row.cum.toLocaleString()}</Td>
                  <Td className={`text-right font-bold border-slate-300 ${eff >= 100 ? 'text-green-600' : eff >= 90 ? 'text-amber-600' : 'text-red-600'}`}>
                    {eff.toFixed(1)}%
                  </Td>
                  <Td className="text-right p-0 border-slate-300">
                    <input
                      type="number"
                      value={row.defect}
                      onChange={(e) => handleDefectChange(idx, e.target.value)}
                      className="w-full h-full bg-[#FFF5F5] px-2 py-2 text-right text-[12px] font-bold text-red-600 focus:outline-none focus:bg-red-50 border border-transparent focus:border-red-400"
                    />
                  </Td>
                  <Td className="text-right font-bold text-red-600 border-slate-300 bg-[#FFF5F5]">
                    {defRate.toFixed(1)}%
                  </Td>
                  <Td className="border-slate-300">
                    <input type="text" defaultValue={row.remarks} className="w-full bg-transparent text-[11px] focus:outline-none" />
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between bg-slate-200 p-3 border border-slate-300 shadow-inner">
        <div className="flex gap-8 text-[12px] font-bold text-slate-800">
          <span className="flex items-center gap-2">Order Qty: <span className="text-slate-800 bg-white px-3 py-1 border border-slate-300 shadow-sm">{orderQty.toLocaleString()}</span></span>
          <span className="flex items-center gap-2">Remaining to Produce: <span className="text-red-700 bg-white px-3 py-1 border border-slate-300 shadow-sm">{remainingToTarget.toLocaleString()}</span></span>
          <span className="flex items-center gap-2">Overall Defect Rate: <span className="text-red-700 bg-white px-3 py-1 border border-slate-300 shadow-sm">{overallDefectRate.toFixed(1)}%</span></span>
        </div>
        <div className="flex gap-8 text-[12px] font-bold text-slate-800">
          <span className="flex items-center gap-2">Overall Efficiency: <span className="text-blue-800 bg-white px-3 py-1 border border-slate-300 shadow-sm">{overallEff.toFixed(1)}%</span></span>
          <span className="flex items-center gap-2 text-[14px]">
            Total Cum. Actual: 
            <span className="text-green-700 bg-white px-4 py-1.5 border border-slate-300 shadow-sm">
              {totalActual.toLocaleString()}
            </span>
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-2 flex flex-wrap gap-2 bg-[#E1E7EC] p-2 border border-slate-300">
        <button className="bg-slate-100 border border-slate-400 hover:bg-slate-200 px-6 py-1.5 text-[12px] font-bold text-slate-800 shadow-sm rounded-sm">
          Add Day
        </button>
        <button className="bg-green-600 border border-green-700 hover:bg-green-700 text-white px-6 py-1.5 text-[12px] font-bold shadow-sm rounded-sm ml-2">
          Excel Export
        </button>
        <div className="flex-1"></div>
        <button className="bg-blue-600 border border-blue-700 hover:bg-blue-700 text-white px-8 py-1.5 text-[12px] font-bold shadow-sm rounded-sm">
          Save Data
        </button>
      </div>
    </div>
  );
}
