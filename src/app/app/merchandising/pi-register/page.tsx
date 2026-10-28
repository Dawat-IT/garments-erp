"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMerchandisingData } from "@/hooks/useMerchandisingData";

const Th = ({ children, className }: any) => (
  <th className={`border border-slate-300 bg-slate-200/50 px-2 py-1.5 text-center text-[11px] font-semibold text-slate-700 whitespace-nowrap ${className || ""}`}>
    {children}
  </th>
);

const Td = ({ children, className }: any) => (
  <td className={`border border-slate-300 px-2 py-1.5 text-[11px] text-slate-800 ${className || ""}`}>
    {children}
  </td>
);

const initialRows = [
  { id: 1, piNo: "PI-3311", date: "02/10/25", ref: "B6S31110R", buyer: "BESTSELLER", supplier: "SQUARE DENIM", type: "Fabric", qty: 14290, val: 45728.00, pt: "LC", lcNo: "LC-88213", lcDate: "04/10/25", st: "FOB", status: "Confirmed" },
  { id: 2, piNo: "PI-3312", date: "03/10/25", ref: "B6S31110R", buyer: "BESTSELLER", supplier: "GUANGDONG", type: "Accessories", qty: 146801, val: 13946.10, pt: "TT", lcNo: "—", lcDate: "—", st: "FOB", status: "Confirmed" },
  { id: 3, piNo: "PI-3313", date: "03/10/25", ref: "B6S31110R", buyer: "BESTSELLER", supplier: "AMERICAN & EFIRD", type: "Accessories", qty: 20288, val: 17593.29, pt: "TT", lcNo: "—", lcDate: "—", st: "FOB", status: "Sent" },
  { id: 4, piNo: "PI-3314", date: "05/10/25", ref: "B6S31110R", buyer: "BESTSELLER", supplier: "WORTHY TEXTILE", type: "Accessories", qty: 23243, val: 14875.83, pt: "Advance", lcNo: "—", lcDate: "—", st: "FOB", status: "Draft" },
  { id: 5, piNo: "PI-3315", date: "07/10/25", ref: "B6S31110R", buyer: "BESTSELLER", supplier: "NINE UNITED ENTERPRISE", type: "Accessories", qty: 341735, val: 8000.68, pt: "TT", lcNo: "—", lcDate: "—", st: "FOB", status: "Confirmed" },
];

export default function PIRegisterAll() {
  const router = useRouter();
  const { piRegisters, refresh, addPiRegister } = useMerchandisingData();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const rows = piRegisters.length > 0 ? piRegisters : initialRows;

  const totalValue = rows.reduce((sum, r: any) => sum + (r.val || 0), 0);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#F0F4F8] p-2 font-sans text-slate-800">
      {/* Title */}
      <div className="mb-2 flex shrink-0 items-center justify-between rounded bg-slate-200 p-1.5 border border-slate-300">
        <div className="flex-1 text-center text-lg font-bold text-slate-800 tracking-wide">PI Register All</div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 min-h-0 overflow-auto border border-slate-400 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-200">
            <tr>
              <Th className="w-6 border-slate-400">#</Th>
              <Th className="text-left w-24 border-slate-400">PI No</Th>
              <Th className="w-20 border-slate-400">PI Date</Th>
              <Th className="w-24 border-slate-400">Our Ref</Th>
              <Th className="text-left w-32 border-slate-400">Buyer</Th>
              <Th className="text-left w-48 border-slate-400">Supplier</Th>
              <Th className="w-24 border-slate-400">Item Type</Th>
              <Th className="text-right w-24 border-slate-400">Total Qty</Th>
              <Th className="text-right w-32 border-slate-400">Total Value</Th>
              <Th className="w-24 border-slate-400">Payment Term</Th>
              <Th className="w-24 border-slate-400">LC No</Th>
              <Th className="w-20 border-slate-400">LC Date</Th>
              <Th className="w-24 border-slate-400">Shipment Term</Th>
              <Th className="w-28 border-slate-400">Status</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id} className="hover:bg-[#F3F6F7] even:bg-[#F9FAFB] odd:bg-white cursor-pointer group">
                <Td className="text-center font-bold text-slate-500 border-slate-300">{idx + 1}</Td>
                <Td className="font-bold text-blue-700 border-slate-300 underline">{row.piNo}</Td>
                <Td className="text-center border-slate-300">{row.date}</Td>
                <Td className="text-center font-medium border-slate-300">{row.ref}</Td>
                <Td className="border-slate-300">{row.buyer}</Td>
                <Td className="font-semibold text-slate-700 border-slate-300">{row.supplier}</Td>
                <Td className="text-center border-slate-300">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.type === 'Fabric' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {row.type}
                  </span>
                </Td>
                <Td className="text-right font-medium border-slate-300">{row.qty.toLocaleString()}</Td>
                <Td className="text-right font-bold text-slate-800 border-slate-300 bg-[#F0F7FF]">${row.val.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</Td>
                <Td className="text-center border-slate-300">{row.pt}</Td>
                <Td className="text-center border-slate-300">{row.lcNo}</Td>
                <Td className="text-center border-slate-300">{row.lcDate}</Td>
                <Td className="text-center border-slate-300">{row.st}</Td>
                <Td className="text-center border-slate-300">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    row.status === 'Confirmed' ? 'bg-green-100 text-green-700 border border-green-200' :
                    row.status === 'Sent' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                    'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {row.status}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-2 flex shrink-0 items-center justify-between bg-slate-200 p-2 border border-slate-300 shadow-inner">
        <div className="flex gap-6 text-[12px] font-bold text-slate-800">
          <span className="flex items-center gap-2">Count of PIs: <span className="text-blue-800 bg-white px-2 py-0.5 border border-slate-300 shadow-sm">{rows.length}</span></span>
        </div>
        <div className="text-[14px] font-bold flex items-center gap-2">
          Total PI Value 
          <span className="text-blue-800 bg-white px-4 py-1.5 border border-slate-300 shadow-sm">
            ${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-2 flex shrink-0 flex-wrap gap-2 bg-[#E1E7EC] p-2 border border-slate-300">
        <button 
          onClick={() => {
            addPiRegister({ piNo: "PI-NEW", date: "10/10/25", ref: "NEW-REF", buyer: "NEW BUYER", supplier: "NEW SUPPLIER", type: "Fabric", qty: 1000, val: 5000, pt: "TT", lcNo: "LC-123", lcDate: "10/10/25", st: "FOB", status: "Draft" });
          }}
          className="bg-blue-600 border border-blue-700 hover:bg-blue-700 text-white px-4 py-1.5 text-[12px] font-bold shadow-sm rounded-sm">
          New PI
        </button>
        <button className="bg-slate-100 border border-slate-400 hover:bg-slate-200 px-4 py-1.5 text-[12px] font-bold text-slate-800 shadow-sm rounded-sm">
          View PI
        </button>
        <button className="bg-slate-100 border border-slate-400 hover:bg-slate-200 px-4 py-1.5 text-[12px] font-bold text-slate-800 shadow-sm rounded-sm">
          Print
        </button>
        <div className="flex-1"></div>
        <button className="bg-green-600 border border-green-700 hover:bg-green-700 text-white px-4 py-1.5 text-[12px] font-bold shadow-sm rounded-sm">
          Excel Export
        </button>
      </div>
    </div>
  );
}
