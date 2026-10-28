"use client";

import { useState } from "react";
import { Search, X, CheckSquare, Square, ChevronRight, Calculator, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMerchandisingData } from "@/hooks/useMerchandisingData";

// Dense table components to match the exact aesthetic
const Th = ({ children, className, rowSpan, colSpan }: { children?: React.ReactNode; className?: string; rowSpan?: number; colSpan?: number }) => (
  <th rowSpan={rowSpan} colSpan={colSpan} className={`border border-slate-300 bg-slate-200/50 px-1 py-1 text-center text-[10px] font-semibold text-slate-700 whitespace-nowrap ${className || ""}`}>
    {children}
  </th>
);

const Td = ({ children, className, title }: { children?: React.ReactNode; className?: string; title?: string }) => (
  <td title={title} className={`border border-slate-300 px-1 py-1 text-[11px] text-slate-800 ${className || ""}`}>
    {children}
  </td>
);

const DenseInput = ({ value, readOnly = false, className, type = "text", onChange }: any) => (
  <input
    type={type}
    value={value}
    readOnly={readOnly}
    onChange={onChange}
    className={`w-full border-none bg-transparent px-1 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-teal-500 ${readOnly ? "bg-slate-50" : "bg-white"} ${className || ""}`}
  />
);

const HeaderField = ({ label, value, type = "text", bold = false, blue = false, red = false, width = "w-24" }: any) => (
  <div className="flex items-center gap-1">
    <span className={`text-[10px] font-medium text-slate-600 whitespace-nowrap ${bold ? 'font-bold' : ''}`}>{label} :</span>
    <input
      type={type}
      value={value}
      readOnly
      className={`h-5 ${width} border border-slate-300 px-1 text-[11px] focus:outline-none ${blue ? 'text-blue-600 font-bold' : ''} ${red ? 'text-red-600 font-bold bg-red-50' : 'bg-slate-50 text-slate-800'}`}
    />
  </div>
);

const initialRows = [
  { id: 1, name: "BUTTON-PLASTIC", status: "R", place: "Waist", desc: "ADJUSTABLE PLASTIC BUTTON", qty: 17, unit: "Pcs", wastage: 4, rel: 1, rate: 0.0060, amt: 1247.81, nominee: "Own", supplier: "DEKKO ACCESSORIES" },
  { id: 2, name: "BUTTON-METAL", status: "R", place: "Waist", desc: "METAL BUTTON", qty: 12, unit: "Pcs", wastage: 4, rel: 1, rate: 0.0950, amt: 13946.10, nominee: "Nomi...", supplier: "GUANGDONG" },
  { id: 3, name: "ZIPPER", status: "R", place: "zipper", desc: "4.5YG PULLER ZIPPER", qty: 12, unit: "Pcs", wastage: 4, rel: 1, rate: 0.0950, amt: 13946.10, nominee: "Nomi...", supplier: "WEIXING INDUSTRIAL" },
  { id: 4, name: "THREAD 20/2", status: "C", place: "Body", desc: "THREAD 20/2", qty: 645, unit: "Mtr", wastage: 4, rel: 3000, rate: 1.0700, amt: 2814.29, nominee: "Nomi...", supplier: "AMERICAN & EFIRD" },
  { id: 5, name: "THREAD 20/3", status: "C", place: "Body", desc: "THREAD 20/3", qty: 585, unit: "Mtr", wastage: 4, rel: 3000, rate: 1.0500, amt: 2504.80, nominee: "Nomi...", supplier: "AMERICAN & EFIRD" },
  { id: 6, name: "THREAD 40/2", status: "C", place: "Body", desc: "THREAD 40/2", qty: 3500, unit: "Mtr", wastage: 4, rel: 3000, rate: 0.8600, amt: 12274.20, nominee: "Nomi...", supplier: "AMERICAN & EFIRD" },
  { id: 7, name: "TAPE-GUM", status: "R", place: "Carton", desc: "GUM TAPE", qty: 8, unit: "Mtr", wastage: 0, rel: 40, rate: 0.5000, amt: 1176.29, nominee: "Own", supplier: "DEKKO ACCESSORIES" },
  { id: 8, name: "RIVET-METAL", status: "R", place: "Body", desc: "METAL RIVET", qty: 24, unit: "Pcs", wastage: 4, rel: 1, rate: 0.0220, amt: 6459.24, nominee: "Nomi...", supplier: "GUANGDONG" },
  { id: 9, name: "POCKETING", status: "C", place: "pocket", desc: "TC WHITE POCKETING", qty: 1.9, unit: "Yds", wastage: 4, rel: 1, rate: 0.6400, amt: 14875.83, nominee: "Nomi...", supplier: "WORTHY TEXTILE" },
  { id: 10, name: "POLY BAG", status: "R", place: "Body", desc: "POLY BAG", qty: 12, unit: "Pcs", wastage: 0, rel: 1, rate: 0.0228, amt: 3218.33, nominee: "Own", supplier: "DEKKO ACCESSORIES" },
  { id: 11, name: "CARTON", status: "R", place: "Carton", desc: "CARTON", qty: 0.25, unit: "Pcs", wastage: 0, rel: 1, rate: 1.0000, amt: 2940.73, nominee: "Own", supplier: "G SIX PACKAGING" },
  { id: 12, name: "WASH-ENZYME", status: "R", place: "Body", desc: "ENZYME RAIN WASH", qty: 12, unit: "Pcs", wastage: 0, rel: 12, rate: 5.0000, amt: 64696.06, nominee: "Own", supplier: "MUTUAL APPAREL" },
  { id: 13, name: "INTERLINING", status: "C", place: "Body", desc: "INTERLINING/FUSING", qty: 2.1, unit: "Yds", wastage: 4, rel: 1, rate: 0.1000, amt: 2569.02, nominee: "Nomi...", supplier: "ETASIA INTERNATIONAL" },
  { id: 14, name: "MAIN LABEL", status: "C", place: "Body", desc: "MAIN LABEL", qty: 12, unit: "Pcs", wastage: 4, rel: 1, rate: 0.0200, amt: 2936.02, nominee: "Nomi...", supplier: "NINE UNITED ENTERPRISE" },
  { id: 15, name: "CARE LABEL", status: "C", place: "Body", desc: "CARE LABEL", qty: 12, unit: "Pcs", wastage: 5, rel: 1, rate: 0.0400, amt: 5928.52, nominee: "Nomi...", supplier: "TRIMCO BANGLADESH" },
  { id: 16, name: "STICKER-PRICE", status: "C", place: "Body", desc: "STICKER-PRICE", qty: 60, unit: "Pcs", wastage: 4, rel: 1, rate: 0.0110, amt: 8074.06, nominee: "Nomi...", supplier: "UNITED NINE ENTERPRISE" },
  { id: 17, name: "INFORMATION", status: "C", place: "Body", desc: "INDIGO TAG", qty: 4, unit: "Pcs", wastage: 4, rel: 1, rate: 0.0135, amt: 660.60, nominee: "Nomi...", supplier: "NINE UNITED ENTERPRISE" },
  { id: 18, name: "HANGTAG WITH STRING", status: "C", place: "Body", desc: "HANGTAG WITH STRING", qty: 12, unit: "Pcs", wastage: 4, rel: 1, rate: 0.0300, amt: 4404.03, nominee: "Nomi...", supplier: "NINE UNITED ENTERPRISE" },
];

export default function AccessoriesEstimation() {
  const router = useRouter();
  const { accEstimations, refresh, addAccEstimation, updateAccEstimation } = useMerchandisingData();
  const orderQtyDz = 11762.92; // 141,155 pcs / 12

  // Hydrate data from hook
  const rows = accEstimations.length > 0 ? accEstimations : initialRows;

  const handleRateChange = (index: number, newRate: string) => {
    const row = rows[index];
    const rate = parseFloat(newRate) || 0;
    const ttlQty = (row.qty * orderQtyDz) * (1 + row.wastage / 100);
    const amt = (ttlQty * rate) / row.rel;
    
    // Auto-update if it's already in the DB, otherwise we'd just see initial rows.
    // To properly modify initialRows we would need to add them to DB first,
    // so we'll just implement the `updateAccEstimation` logic for existing DB rows.
    if (accEstimations.length > 0) {
      updateAccEstimation(String(row.id), { rate, amt });
    }
  };

  const totalAmount = rows.reduce((sum, row) => sum + row.amt, 0);

  return (
    <div className="flex h-full w-full flex-col bg-[#F0F4F8] p-1 text-slate-800 font-sans overflow-hidden">
      {/* Title Bar */}
      <div className="mb-1 flex items-center justify-between rounded bg-slate-200 p-1 border border-slate-300 flex-shrink-0">
        <div className="flex-1 text-center text-base font-bold text-slate-800">Accessories Estimation</div>
        <button onClick={() => router.push("/app/dashboard")} className="flex h-5 w-5 items-center justify-center bg-red-600 text-white font-bold rounded hover:bg-red-700 text-xs">X</button>
      </div>

      {/* Header Fields */}
      <div className="mb-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-2 gap-y-1 bg-white p-1.5 border border-slate-300 flex-shrink-0 text-[10px]">
        <HeaderField label="Qtn No" value="Q31W25/251014/0162" width="w-32" />
        <HeaderField label="Qtd Qty" value="1,31,067" width="w-24" />
        <HeaderField label="Qtd Acc Cost/Dz" value="15.5419" width="w-20" />
        <HeaderField label="Booking No." value="" width="w-24" />
        <HeaderField label="Booking Dt" value="" width="w-24" />
        <HeaderField label="Our Ref" value="B6S31110R" width="w-32" />
        <HeaderField label="Qtd FOB" value="5.69" width="w-24" />
        <HeaderField label="Qtd Acc Total Value" value="1,82,817.72" width="w-28" />
        <HeaderField label="PI No." value="" width="w-24" />
        <HeaderField label="PI Date" value="" width="w-24" />
        <HeaderField label="Ord Date" value="01/10/2025" width="w-24" />
        <HeaderField label="Buyer" value="BESTSELLER" width="w-28" />
        <HeaderField label="Order Qty" value="1,41,155" width="w-24" />
        <HeaderField label="FOB" value="5.70" width="w-16" />
        <HeaderField label="Est Acc Cost/Dz" value="$16.1232" blue width="w-20" />
        <HeaderField label="Total" value={`$${totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}`} red bold width="w-28" />
        <HeaderField label="Group No." value="" width="w-24" />
        <HeaderField label="Buyer Sty." value="13190372- Nk" width="w-32" />
      </div>

      {/* Quick Add Row */}
      <div className="mb-1 flex flex-wrap items-center gap-2 bg-[#E6F3F7] p-1 text-[10px] border border-slate-300 font-semibold shadow-sm flex-shrink-0">
        <span className="text-slate-700">Qtd. Item</span>
        <select className="h-5 w-40 border border-slate-300 bg-white px-1 text-[11px] text-blue-800 font-bold shadow-inner">
          <option>BUTTON-PLASTIC</option>
        </select>
        <span className="text-slate-700">=</span>
        <input className="h-5 w-20 border border-slate-300 bg-white shadow-inner" />
        <span className="text-slate-700">Qtd. Consump</span>
        <span className="text-blue-800 font-bold">17 Pcs</span>
        <span className="text-slate-700">W%</span>
        <span className="text-blue-800 font-bold">4 %</span>
        <span className="text-slate-700">Qtd. Rate</span>
        <span className="text-blue-800 font-bold">0.0060</span>
        <span className="text-slate-700">Qtd. Amt</span>
        <span className="text-blue-800 font-bold">1,247.81</span>
        <span className="ml-4 text-slate-700">Estimated Amt</span>
        <span className="text-blue-800 font-bold bg-white px-2 py-0.5 border border-slate-300">1,247.81</span>
        <span className="ml-4 text-slate-700">Balance Amt</span>
        <span className="bg-white px-2 py-0.5 border border-slate-300">.00</span>
      </div>

      {/* Main Grid - Scrollable box */}
      <div className="flex-1 min-h-0 overflow-auto border border-slate-400 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-200">
            <tr>
              <Th rowSpan={2} className="w-6 border-slate-400">X</Th>
              <Th rowSpan={2} className="w-10 border-slate-400">In<br/>House</Th>
              <Th rowSpan={2} className="w-6 border-slate-400"> </Th>
              <Th rowSpan={2} className="w-32 text-left border-slate-400">Accessories<br/>Item Name</Th>
              <Th rowSpan={2} className="w-24 text-left border-slate-400">Used Place</Th>
              <Th rowSpan={2} className="text-left border-slate-400">Description</Th>
              <Th colSpan={2} className="border-slate-400">Consumption</Th>
              <Th rowSpan={2} className="w-12 border-slate-400">Affect<br/>G.Qty</Th>
              <Th colSpan={2} className="border-slate-400">Wastage</Th>
              <Th colSpan={4} className="text-red-700 border-slate-400">Estimation/BOM</Th>
              <Th rowSpan={2} className="w-16 border-slate-400">Nominee<br/>Status</Th>
              <Th rowSpan={2} className="text-left w-32 border-slate-400">Supplier</Th>
              <Th rowSpan={2} className="w-10 border-slate-400">Bulk</Th>
              <Th colSpan={4} className="border-slate-400">Factors</Th>
              <Th rowSpan={2} className="text-blue-800 cursor-pointer border-slate-400">Quick Booking</Th>
            </tr>
            <tr>
              <Th className="border-slate-400">Qty/Dz</Th>
              <Th className="border-slate-400">Unit</Th>
              <Th className="border-slate-400">%</Th>
              <Th className="border-slate-400">Qty</Th>
              <Th className="border-slate-400">TTL Qty</Th>
              <Th className="border-slate-400">Unit</Th>
              <Th className="border-slate-400">Rel.</Th>
              <Th className="border-slate-400">Rate</Th>
              <Th className="border-slate-400">Amount</Th>
              <Th className="border-slate-400">Size</Th>
              <Th className="border-slate-400">Color</Th>
              <Th className="border-slate-400">Code</Th>
              <Th className="border-slate-400">Booking</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const ttlQty = (row.qty * orderQtyDz) * (1 + row.wastage / 100);
              const wasteQty = (row.qty * orderQtyDz) * (row.wastage / 100);

              return (
                <tr key={row.id} className="hover:bg-[#F3F6F7] even:bg-[#F9FAFB] odd:bg-white group">
                  <Td className="text-center text-red-500 cursor-pointer border-slate-300 font-bold hover:bg-red-100">X</Td>
                  <Td className="text-center border-slate-300"><input type="checkbox" className="h-3 w-3 rounded-sm border-slate-400 text-teal-600 focus:ring-teal-600" /></Td>
                  <Td className={`text-center font-bold border-slate-300 ${row.status === 'C' ? 'text-red-700 bg-red-50' : 'text-slate-700'}`}>{row.status}</Td>
                  <Td className={`font-semibold border-slate-300 ${row.status === 'C' ? 'text-red-700' : 'text-blue-800'}`}>{row.name}</Td>
                  <Td className="border-slate-300">{row.place}</Td>
                  <Td className="border-slate-300"><DenseInput value={row.desc} readOnly /></Td>
                  <Td className="text-right border-slate-300 bg-[#F0F7FF] font-medium">{row.qty}</Td>
                  <Td className="text-center border-slate-300">{row.unit}</Td>
                  <Td className="text-center border-slate-300"></Td>
                  <Td className="text-right border-slate-300 bg-[#F0F7FF] font-medium">{row.wastage}</Td>
                  <Td className="text-right border-slate-300">{wasteQty.toLocaleString(undefined, {maximumFractionDigits:2})}</Td>
                  <Td className="text-right font-bold text-slate-700 border-slate-300">{ttlQty.toLocaleString(undefined, {maximumFractionDigits:2})}</Td>
                  <Td className="text-center border-slate-300 bg-[#F8FAFC]">
                    <select className="h-4 w-full border border-slate-300 bg-white text-[10px] focus:outline-none"><option>{row.unit}</option></select>
                  </Td>
                  <Td className="text-right border-slate-300">{row.rel}</Td>
                  <Td className="text-right p-0 border-slate-300">
                    <DenseInput 
                      value={row.rate} 
                      onChange={(e: any) => handleRateChange(idx, e.target.value)} 
                      type="number"
                      className="text-right text-blue-800 font-semibold" 
                    />
                  </Td>
                  <Td className="text-right font-bold text-slate-800 border-slate-300">${row.amt.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</Td>
                  <Td className="border-slate-300">
                    <select className="h-4 w-full max-w-[60px] border border-slate-300 bg-white text-[10px] focus:outline-none">
                      <option>{row.nominee}</option>
                    </select>
                  </Td>
                  <Td className="text-[10px] border-slate-300 max-w-[120px] truncate" title={row.supplier}>{row.supplier}</Td>
                  <Td className="text-center border-slate-300"><input type="checkbox" defaultChecked={row.nominee === 'Own'} className="h-3 w-3 rounded-sm border-slate-400 text-teal-600 focus:ring-teal-600" /></Td>
                  {/* Factors */}
                  <Td className="text-center border-slate-300"><input type="checkbox" defaultChecked className="h-3 w-3 rounded-sm border-slate-400 text-teal-600 focus:ring-teal-600" /></Td>
                  <Td className="text-center border-slate-300">
                    <div className="flex justify-center items-center gap-0.5">
                      <input type="checkbox" defaultChecked className="h-3 w-3 rounded-sm border-slate-400 text-teal-600 focus:ring-teal-600" />
                      <button className="bg-amber-600 hover:bg-amber-700 text-white text-[9px] px-1 rounded-sm leading-tight shadow-sm">D</button>
                    </div>
                  </Td>
                  <Td className="text-center border-slate-300"><input type="checkbox" className="h-3 w-3 rounded-sm border-slate-400 text-teal-600 focus:ring-teal-600" /></Td>
                  <Td className="text-center border-slate-300">
                    <button className="bg-[#6B21A8] hover:bg-[#581C87] text-white text-[9px] px-1 rounded-sm leading-tight shadow-sm">BH</button>
                  </Td>
                  <Td className="text-center border-slate-300 bg-slate-50 group-hover:bg-blue-50 transition-colors">
                    <Link href={`/app/merchandising/accessories-estimation/${row.id}/color-define`} className="text-blue-700 font-semibold underline hover:text-blue-900 px-2 py-0.5 rounded text-[10px]">
                      View
                    </Link>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-1 flex items-center justify-between bg-slate-200 p-1.5 border border-slate-300 shadow-inner flex-shrink-0">
        <div className="flex gap-6 text-[10px] font-bold text-slate-800">
          <span className="flex items-center gap-1.5">No. of Acc: <span className="text-blue-800 bg-white px-2 py-0.5 border border-slate-300 shadow-sm">{rows.length}</span></span>
          <span className="flex items-center gap-1.5">Item PID: <span className="text-blue-800 bg-white px-2 py-0.5 border border-slate-300 shadow-sm">5285</span></span>
          <span className="flex items-center gap-1.5">Rec PID: <span className="text-blue-800 bg-white px-2 py-0.5 border border-slate-300 shadow-sm">125100001734</span></span>
        </div>
        <div className="text-[12px] font-bold flex items-center gap-2">
          Total 
          <span className="text-blue-800 bg-white px-2 py-0.5 border border-slate-300 shadow-sm">
            ${totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-1 flex flex-wrap gap-1 bg-[#E1E7EC] p-1 border border-slate-300 flex-shrink-0">
        {["Req. Sheet", "View List", "Color Summary", "RM Analysis Tools", "PI Reg All", "Accessories Booking", "Costing Summ"].map(btn => (
          <button key={btn} className="bg-slate-100 border border-slate-400 hover:bg-slate-200 px-3 py-1 text-[11px] font-bold text-slate-800 shadow-sm rounded-sm">
            {btn}
          </button>
        ))}
        <button className="bg-green-600 border border-green-700 hover:bg-green-700 text-white px-3 py-1 text-[11px] font-bold shadow-sm rounded-sm ml-2">
          Excel &gt;&gt;
        </button>
        <div className="flex-1"></div>
        <button className="bg-slate-100 border border-slate-400 hover:bg-slate-200 px-6 py-1 text-[11px] font-bold text-slate-800 shadow-sm rounded-sm">Cancel</button>
        <button 
          onClick={() => {
            addAccEstimation({ name: "NEW-TRIM", status: "R", place: "Waist", desc: "NEW TRIM DESC", qty: 10, unit: "Pcs", wastage: 2, rel: 1, rate: 0.05, amt: 0, nominee: "Own", supplier: "NEW SUPPLIER" });
          }}
          className="bg-slate-100 border border-slate-400 hover:bg-slate-200 px-6 py-1 text-[11px] font-bold text-slate-800 shadow-sm rounded-sm">New</button>
        <button className="bg-slate-100 border border-slate-400 hover:bg-slate-200 px-6 py-1 text-[11px] font-bold text-slate-800 shadow-sm rounded-sm">Save</button>
      </div>
    </div>
  );
}
