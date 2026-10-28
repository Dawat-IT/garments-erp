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

const initialRows = [
  { 
    id: 1, 
    po: "DDERLP4479072", 
    shipped: 141155, 
    balance: 0, 
    vessel: "MSC ISABELLA", 
    etd: "20/11/25", 
    eta: "05/12/25", 
    bl: "MSCU998231", 
    invoice: "INV-6621", 
    value: 804583.50, 
    docs: { inv: true, pl: true, bl: true, co: true, gsp: true },
    payStatus: "Realized",
    payDate: "10/12/25"
  },
];

export default function ShipmentDocumentation() {
  const [rows, setRows] = useState(initialRows);

  const toggleDoc = (idx: number, docType: keyof typeof initialRows[0]['docs']) => {
    const updated = [...rows];
    updated[idx].docs[docType] = !updated[idx].docs[docType];
    setRows(updated);
  };

  return (
    <div className="flex h-[calc(100vh-60px)] flex-col bg-[#F0F4F8] p-2 text-slate-800 font-sans overflow-hidden">
      {/* Title */}
      <div className="mb-2 flex items-center justify-between rounded bg-slate-200 p-2 border border-slate-300">
        <div className="flex-1 text-center text-lg font-bold text-slate-800 tracking-wide uppercase">Shipment & Documentation Register</div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-auto border border-slate-400 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-200">
            <tr>
              <Th className="text-left w-24 border-slate-400">PO No</Th>
              <Th className="text-blue-700 w-24 border-slate-400">Shipped Qty</Th>
              <Th className="w-24 border-slate-400">Balance Qty</Th>
              <Th className="w-32 border-slate-400">Vessel/Flight</Th>
              <Th className="w-20 border-slate-400">ETD</Th>
              <Th className="w-20 border-slate-400">ETA</Th>
              <Th className="w-24 border-slate-400">B/L or AWB No</Th>
              <Th className="w-24 border-slate-400">Invoice No</Th>
              <Th className="text-right w-32 border-slate-400">Invoice Value</Th>
              <Th className="w-64 border-slate-400">Documents Sent Checklist</Th>
              <Th className="w-24 border-slate-400">Payment Status</Th>
              <Th className="w-24 border-slate-400">Realization Date</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id} className="hover:bg-[#F3F6F7] even:bg-[#F9FAFB] odd:bg-white group">
                <Td className="font-bold text-blue-700 border-slate-300 underline cursor-pointer">{row.po}</Td>
                <Td className="text-right font-bold text-blue-700 border-slate-300 bg-[#F0F7FF]">{row.shipped.toLocaleString()}</Td>
                <Td className="text-right font-bold text-slate-500 border-slate-300">{row.balance}</Td>
                <Td className="text-center font-semibold border-slate-300">
                  <input type="text" defaultValue={row.vessel} className="w-full bg-transparent focus:outline-none text-center" />
                </Td>
                <Td className="text-center border-slate-300">
                  <input type="text" defaultValue={row.etd} className="w-full bg-transparent focus:outline-none text-center" />
                </Td>
                <Td className="text-center border-slate-300">
                  <input type="text" defaultValue={row.eta} className="w-full bg-transparent focus:outline-none text-center" />
                </Td>
                <Td className="text-center font-bold border-slate-300">
                  <input type="text" defaultValue={row.bl} className="w-full bg-transparent focus:outline-none text-center" />
                </Td>
                <Td className="text-center font-bold border-slate-300">
                  <input type="text" defaultValue={row.invoice} className="w-full bg-transparent focus:outline-none text-center" />
                </Td>
                <Td className="text-right font-bold text-slate-800 border-slate-300 bg-[#F0F7FF]">
                  ${row.value.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}
                </Td>
                <Td className="text-center border-slate-300">
                  <div className="flex items-center justify-center gap-3 text-[10px] font-bold">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={row.docs.inv} onChange={() => toggleDoc(idx, 'inv')} /> INV
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={row.docs.pl} onChange={() => toggleDoc(idx, 'pl')} /> PL
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={row.docs.bl} onChange={() => toggleDoc(idx, 'bl')} /> BL
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={row.docs.co} onChange={() => toggleDoc(idx, 'co')} /> CO
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={row.docs.gsp} onChange={() => toggleDoc(idx, 'gsp')} /> GSP
                    </label>
                  </div>
                </Td>
                <Td className="text-center border-slate-300">
                  <select defaultValue={row.payStatus} className={`w-full bg-transparent text-[11px] font-bold focus:outline-none ${row.payStatus === 'Realized' ? 'text-green-600' : row.payStatus === 'Partial' ? 'text-amber-600' : 'text-red-600'}`}>
                    <option>Pending</option>
                    <option>Partial</option>
                    <option>Realized</option>
                  </select>
                </Td>
                <Td className="text-center border-slate-300">
                  <input type="text" defaultValue={row.payDate} className="w-full bg-transparent focus:outline-none text-center" />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="mt-2 flex flex-wrap gap-2 bg-[#E1E7EC] p-2 border border-slate-300">
        <button className="bg-blue-600 border border-blue-700 hover:bg-blue-700 text-white px-6 py-1.5 text-[12px] font-bold shadow-sm rounded-sm">
          New Shipment Booking
        </button>
        <button className="bg-slate-100 border border-slate-400 hover:bg-slate-200 px-6 py-1.5 text-[12px] font-bold text-slate-800 shadow-sm rounded-sm ml-2">
          Generate Docs
        </button>
        <div className="flex-1"></div>
        <button className="bg-green-600 border border-green-700 hover:bg-green-700 text-white px-6 py-1.5 text-[12px] font-bold shadow-sm rounded-sm">
          Save Record
        </button>
      </div>
    </div>
  );
}
