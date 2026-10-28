"use client";
import React, { useEffect } from "react";
import { useMerchandisingData } from "@/hooks/useMerchandisingData";

const Th = ({ children, className }: any) => (
  <th className={`border border-slate-300 bg-slate-200/50 px-1 py-1 text-center text-[10px] font-semibold text-slate-700 whitespace-nowrap ${className || ""}`}>
    {children}
  </th>
);

const Td = ({ children, className }: any) => (
  <td className={`border border-slate-300 px-1 py-1 text-[10px] text-slate-800 ${className || ""}`}>
    {children}
  </td>
);

const FilterInput = () => (
  <input type="text" className="w-full h-4 text-[9px] border border-slate-300 px-0.5 focus:outline-none" />
);

const initialRows = [
  { id: "1", chDt: "09/09/26", v: "CH", mer: "DOLLAR", buyer: "MANGO", ordDt: "23/10/25", ref: "B5S57128", buyerRef: "ARI JEANS", ordQty: "212042", poNo: "4501461101-1", poQty: "20000", a: "3", pct: "3", cuttable: "20600", fab: "TS-SOFT JEANS", colorQty: "20000", lt: "9", lotQty: "25000", delD: "14/09", status: "Confirmed" },
  { id: "2", chDt: "09/09/26", v: "CH", mer: "DOLLAR", buyer: "MANGO", ordDt: "23/10/25", ref: "B5S57128", buyerRef: "ARI JEANS", ordQty: "212042", poNo: "4501046516-9", poQty: "5000", a: "3", pct: "3", cuttable: "5150", fab: "TS-SOFT JEANS", colorQty: "5000", lt: "9", lotQty: "25000", delD: "14/09", status: "Confirmed" },
  { id: "3", chDt: "09/09/26", v: "CH", mer: "DOLLAR", buyer: "MANGO", ordDt: "23/10/25", ref: "B5S57128", buyerRef: "ARI JEANS", ordQty: "212042", poNo: "4501461101-2", poQty: "5000", a: "3", pct: "3", cuttable: "5150", fab: "TS-SOFT JEANS", colorQty: "5000", lt: "10", lotQty: "5000", delD: "28/09", status: "Confirmed" },
  { id: "4", chDt: "09/09/26", v: "CH", mer: "DOLLAR", buyer: "MANGO", ordDt: "23/10/25", ref: "B5S57128", buyerRef: "ARI JEANS", ordQty: "212042", poNo: "TBA-22", poQty: "0", a: "3", pct: "3", cuttable: "0", fab: "", colorQty: "", lt: "15", lotQty: "0", delD: "19/10", status: "Confirmed" },
  { id: "5", chDt: "01/08/26", v: "CH", mer: "SHITAB", buyer: "JACHS", ordDt: "15/01/26", ref: "B5W13321:", buyerRef: "C28C-Z30-SAG", ordQty: "470648", poNo: "26 102864", poQty: "2592", a: "2", pct: "2", cuttable: "2644", fab: "410 NAVY", colorQty: "864", lt: "1", lotQty: "30144", delD: "16/08", status: "Export" },
];

export default function OrderStatusRegister() {
  const { orderStatuses, addOrderStatus, refresh } = useMerchandisingData();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const displayRows = orderStatuses.length > 0 ? orderStatuses : initialRows;

  const handleAddDummy = () => {
    addOrderStatus({
      chDt: "11/11/26", v: "CH", mer: "NEW MER", buyer: "ZARA", ordDt: "10/10/25", ref: "Z-100", buyerRef: "ZARA REF", ordQty: "1000", poNo: "Z-PO-1", poQty: "1000", a: "1", pct: "2", cuttable: "1020", fab: "COTTON", colorQty: "1000", lt: "1", lotQty: "1000", delD: "12/12", status: "Pending"
    });
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-100 font-sans text-slate-800">
      {/* Top Header */}
      <div className="flex shrink-0 items-center justify-between bg-slate-200 border-b border-slate-300 p-1">
        <div className="text-[11px] font-bold text-blue-800 ml-2">User: <span className="font-semibold text-slate-800">ALAVI</span></div>
        <div className="text-[14px] font-bold text-slate-800">Order Status Register</div>
        <div className="flex items-center gap-4 mr-1">
          <div className="text-[11px] font-bold">Tot Rec: <span className="text-blue-700">{displayRows.length}</span></div>
          <button className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">X</button>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 min-h-0 overflow-auto border border-slate-300 m-1 bg-white relative">
        <span className="absolute top-0 left-0 bg-white px-1 text-[10px] text-slate-600 font-semibold border-x border-b border-slate-300 z-20">Order Details</span>
        <table className="w-full border-collapse mt-4">
          <thead className="sticky top-0 bg-slate-200 shadow-sm z-10">
            {/* Filter Row */}
            <tr>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"><div className="flex justify-center"><button className="bg-yellow-200 border border-slate-400 font-bold px-1 text-[9px]">C</button></div></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"></th>
              <th className="p-0.5"></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"></th>
              <th className="p-0.5">
                <select className="w-full text-[9px] border border-slate-300 h-4 focus:outline-none"><option>Confirm+Export</option></select>
              </th>
            </tr>
            {/* Header Row */}
            <tr>
              <Th>CH Dt</Th>
              <Th className="text-blue-700">V</Th>
              <Th>Mer</Th>
              <Th>Buyer</Th>
              <Th>Ord Dt</Th>
              <Th></Th>
              <Th>Our Ref</Th>
              <Th></Th>
              <Th>Buyer Ref</Th>
              <Th>Ord Qty</Th>
              <Th>PO No</Th>
              <Th>PO Qty</Th>
              <Th className="text-blue-700">A</Th>
              <Th>%</Th>
              <Th>Cuttable Qty</Th>
              <Th>Fab Color</Th>
              <Th>Color Qty</Th>
              <Th>Lt</Th>
              <Th>Lot Qty</Th>
              <Th>Del D</Th>
              <Th></Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row) => (
              <tr key={row.id} className="hover:bg-blue-50 even:bg-slate-50 border-b border-slate-200">
                <Td className="text-center font-bold text-green-700"><span className="bg-green-700 text-white px-1">{row.chDt}</span></Td>
                <Td className="text-center text-blue-700 font-bold">{row.v}</Td>
                <Td>{row.mer}</Td>
                <Td>{row.buyer}</Td>
                <Td className="text-center">{row.ordDt}</Td>
                <Td className="text-center text-blue-700 font-bold">C <span className="ml-0.5">A</span></Td>
                <Td className="text-blue-700 font-bold">{row.ref}</Td>
                <Td className="text-center font-bold"><button className="bg-slate-200 border border-slate-400 px-1 text-[9px] font-bold hover:bg-slate-300">R</button></Td>
                <Td className="font-bold text-slate-800">{row.buyerRef}</Td>
                <Td className="text-right bg-yellow-200 font-bold">{row.ordQty}</Td>
                <Td className="text-blue-700 font-semibold">{row.poNo}</Td>
                <Td className="text-right">{row.poQty}</Td>
                <Td className="text-center">{row.a}</Td>
                <Td className="text-center">{row.pct}</Td>
                <Td className="text-right text-blue-700 font-bold">{row.cuttable}</Td>
                <Td>{row.fab}</Td>
                <Td className="text-right">{row.colorQty}</Td>
                <Td className="text-center font-bold text-slate-600">{row.lt}</Td>
                <Td className="text-right">{row.lotQty}</Td>
                <Td className="text-center text-blue-700">{row.delD}</Td>
                <Td className="text-center text-blue-700 font-bold">Cp</Td>
                <Td className="text-center font-bold text-slate-700">{row.status}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pre-footer */}
      <div className="flex shrink-0 items-center gap-6 px-4 py-1 bg-slate-200 border-x border-slate-300 mx-1 text-[11px] font-bold">
        <div className="flex items-center gap-3 text-blue-700">
          <label className="flex items-center gap-1"><input type="radio" name="viewType" defaultChecked /> Changed</label>
          <label className="flex items-center gap-1 text-slate-700"><input type="radio" name="viewType" /> New</label>
          <label className="flex items-center gap-1 text-slate-800"><input type="radio" name="viewType" /> All</label>
        </div>
        
        <div className="flex-1"></div>
        
        <div className="flex items-center gap-1">
          <span className="text-slate-700">A/c Holder :</span>
          <span className="text-blue-700">ASHISH</span>
          <span className="text-slate-800">=</span>
          <input type="text" className="w-16 h-5 border border-slate-300" />
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-slate-700">Team Head :</span>
          <span className="text-blue-700">KHALID</span>
          <span className="text-slate-800">=</span>
          <input type="text" className="w-16 h-5 border border-slate-300" />
        </div>
        <div className="w-32"></div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-t border-slate-300 bg-slate-200 px-2 py-1.5 text-[11px] font-bold">
        <button className="text-blue-700 px-2 hover:underline">&lt;Manual&gt;</button>
        
        <div className="flex items-center gap-1">
          <span className="text-slate-600">Our Season</span>
          <div className="flex items-center">
            <input type="text" className="h-6 w-12 bg-yellow-50 border border-slate-300 px-1 focus:outline-none" />
            <button className="h-6 w-5 bg-slate-200 border border-l-0 border-slate-400 font-bold text-[9px] hover:bg-slate-300">L</button>
          </div>
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          <span className="text-slate-600">Year</span>
          <input type="text" className="h-6 w-16 border border-slate-300 px-1 focus:outline-none" />
        </div>
        
        <select className="h-6 w-24 border border-slate-300 ml-2 focus:outline-none">
          <option>PO Delivery...</option>
        </select>
        
        <div className="flex items-center gap-1 ml-2">
          <span className="text-slate-600 font-semibold">From</span>
          <input type="text" defaultValue="12/08/2026" className="h-6 w-20 border border-slate-300 px-1 text-center focus:outline-none" />
          <span className="text-slate-600 font-semibold">to</span>
          <input type="text" defaultValue="09/01/2027" className="h-6 w-20 border border-slate-300 px-1 text-center focus:outline-none" />
        </div>
        
        <button onClick={handleAddDummy} className="bg-orange-100 border border-orange-300 hover:bg-orange-200 px-3 py-1 shadow-sm text-slate-800 ml-1">Refresh</button>
        
        <div className="flex-1"></div>
        
        <button className="bg-slate-100 border border-slate-300 hover:bg-slate-200 px-4 py-1 text-blue-900 shadow-sm">Quotation/Costing Register</button>
        <button className="bg-slate-100 border border-slate-300 hover:bg-slate-200 px-4 py-1 text-blue-900 shadow-sm">Order Entry</button>
        <button className="bg-yellow-100 border border-yellow-300 hover:bg-yellow-200 px-4 py-1 shadow-sm">Report</button>
        <button className="bg-green-600 border border-green-700 hover:bg-green-700 text-white px-4 py-1 shadow-sm">Excel.xls &gt;&gt;</button>
      </div>
    </div>
  );
}
