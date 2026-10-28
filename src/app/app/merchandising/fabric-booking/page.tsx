"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMerchandisingData } from "@/hooks/useMerchandisingData";

const Th = ({ children, className, rowSpan, colSpan }: any) => (
  <th rowSpan={rowSpan} colSpan={colSpan} className={`border border-slate-300 bg-slate-200/50 px-1 py-1 text-center text-[10px] font-semibold text-slate-700 whitespace-nowrap ${className || ""}`}>
    {children}
  </th>
);

const Td = ({ children, className }: any) => (
  <td className={`border border-slate-300 px-1 py-1 text-[11px] text-slate-800 ${className || ""}`}>
    {children}
  </td>
);

const HeaderField = ({ label, value, width = "w-24", lookup = false }: any) => (
  <div className="flex items-center gap-1">
    <span className="text-[10px] font-medium text-slate-600 whitespace-nowrap">{label} :</span>
    <div className="flex items-center">
      <input
        type="text"
        value={value}
        readOnly={!lookup}
        className={`h-5 ${width} border border-slate-300 px-1 text-[11px] focus:outline-none ${lookup ? 'bg-yellow-50' : 'bg-slate-50'}`}
      />
      {lookup && (
        <button className="h-5 w-5 border border-l-0 border-slate-300 bg-white text-[9px] font-bold text-slate-600 hover:bg-slate-100 flex items-center justify-center">
          v
        </button>
      )}
    </div>
  </div>
);

const initialRows = [
  { id: 1, color: "VINTAGE MEDIUM BLUE", consump: 0.85, unit: "Kg", w: 3, req: 2164, booked: 2164, bal: 0, mill: "SQUARE DENIM", labDip: "Approved (05/10/25)", pi: "PI-3311", etd: "12/10/25", eta: "25/10/25", rate: 3.20, amt: 6924.80 },
  { id: 2, color: "BLACK DENIM", consump: 0.85, unit: "Kg", w: 3, req: 1806, booked: 1806, bal: 0, mill: "SQUARE DENIM", labDip: "Approved", pi: "PI-3311", etd: "", eta: "", rate: 3.20, amt: 5779.20 },
  { id: 3, color: "DARK BLUE DENIM", consump: 0.85, unit: "Kg", w: 3, req: 3612, booked: 3000, bal: 612, mill: "SQUARE DENIM", labDip: "Pending", pi: "", etd: "", eta: "", rate: 3.20, amt: 11558.40 },
  { id: 4, color: "LIGHT BLUE DENIM", consump: 0.85, unit: "Kg", w: 3, req: 1806, booked: 0, bal: 1806, mill: "TBD", labDip: "Pending", pi: "", etd: "", eta: "", rate: 0, amt: 0 },
  { id: 5, color: "MEDIUM BLUE DENIM", consump: 0.85, unit: "Kg", w: 3, req: 3096, booked: 0, bal: 3096, mill: "TBD", labDip: "Pending", pi: "", etd: "", eta: "", rate: 0, amt: 0 },
  { id: 6, color: "MEDIUM GREY DENIM", consump: 0.85, unit: "Kg", w: 3, req: 1806, booked: 0, bal: 1806, mill: "TBD", labDip: "Rejected", pi: "", etd: "", eta: "", rate: 0, amt: 0 },
];

export default function FabricBookingRegister() {
  const router = useRouter();
  const { fabricBookings, refresh, addFabricBooking, updateFabricBooking } = useMerchandisingData();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const rows = fabricBookings.length > 0 ? fabricBookings : initialRows;
  const orderQtyDz = 2470; // example multiplier

  const handleConsumpChange = (index: number, val: string) => {
    const row = rows[index];
    const consump = parseFloat(val) || 0;
    
    const req = (consump * orderQtyDz) * (1 + row.w / 100);
    const bal = req - row.booked;
    const amt = req * row.rate;
    
    if (fabricBookings.length > 0) {
      updateFabricBooking(String(row.id), { consump, req, bal, amt });
    }
  };

  const totalReq = rows.reduce((sum, r: any) => sum + (r.req || 0), 0);
  const totalBooked = rows.reduce((sum, r: any) => sum + (r.booked || 0), 0);
  const totalBal = rows.reduce((sum, r: any) => sum + (r.bal || 0), 0);
  const totalAmt = rows.reduce((sum, r: any) => sum + (r.amt || 0), 0);

  return (
    <div className="flex h-full w-full flex-col bg-[#F0F4F8] p-1 text-slate-800 font-sans overflow-hidden">
      {/* Title */}
      <div className="mb-1 flex items-center justify-between rounded bg-slate-200 p-1 border border-slate-300 flex-shrink-0">
        <div className="flex-1 text-center text-base font-bold text-slate-800">Fabric Booking Register</div>
        <button onClick={() => router.push("/app/dashboard")} className="flex h-5 w-5 items-center justify-center bg-red-600 text-white font-bold rounded hover:bg-red-700 text-xs">X</button>
      </div>

      {/* Header Form */}
      <div className="mb-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-2 gap-y-1 bg-white p-1.5 border border-slate-300 shadow-sm flex-shrink-0 text-[10px]">
        <HeaderField label="PO No" value="DDERLP4479072" lookup width="w-32" />
        <HeaderField label="Our Ref" value="B6S31110R" lookup width="w-24" />
        <HeaderField label="Buyer" value="BESTSELLER" width="w-28" />
        <HeaderField label="Style" value="13190372-Nk" width="w-32" />
        <HeaderField label="Order Qty" value="141,155" width="w-24" />
        
        <HeaderField label="Fabric Type" value="Denim" lookup width="w-32" />
        <HeaderField label="Composition" value="100% Cotton" width="w-24" />
        <HeaderField label="GSM" value="320" width="w-28" />
        <HeaderField label="Width" value="58 inch" width="w-32" />
        <HeaderField label="Construction" value="20x16/128x60" width="w-24" />
      </div>

      {/* Main Grid - Scrollable box */}
      <div className="flex-1 min-h-0 overflow-auto border border-slate-400 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-200">
            <tr>
              <Th className="w-6 border-slate-400">X</Th>
              <Th className="text-left w-32 border-slate-400">Fabric Color</Th>
              <Th className="border-slate-400">Consump/Dz</Th>
              <Th className="border-slate-400">Unit</Th>
              <Th className="border-slate-400">Wastage %</Th>
              <Th className="text-red-700 border-slate-400">Total Req Qty</Th>
              <Th className="text-blue-700 border-slate-400">Booking Qty</Th>
              <Th className="border-slate-400">Balance Qty</Th>
              <Th className="text-left w-32 border-slate-400">Supplier/Mill</Th>
              <Th className="border-slate-400">Lab Dip Status</Th>
              <Th className="border-slate-400">PI No</Th>
              <Th className="border-slate-400">ETD (Mill)</Th>
              <Th className="border-slate-400">ETA (Factory)</Th>
              <Th className="border-slate-400">Rate/Unit</Th>
              <Th className="border-slate-400">Amount</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id} className="hover:bg-[#F3F6F7] even:bg-[#F9FAFB] odd:bg-white">
                <Td className="text-center font-bold text-red-500 cursor-pointer border-slate-300 hover:bg-red-100">X</Td>
                <Td className="font-semibold text-slate-700 border-slate-300">{row.color}</Td>
                <Td className="text-right p-0 border-slate-300">
                  <input
                    type="number"
                    value={row.consump}
                    onChange={(e) => handleConsumpChange(idx, e.target.value)}
                    className="w-full h-full bg-transparent px-1 py-1 text-right text-[11px] text-blue-700 font-semibold focus:outline-none"
                  />
                </Td>
                <Td className="text-center border-slate-300">{row.unit}</Td>
                <Td className="text-right border-slate-300">{row.w}</Td>
                <Td className="text-right font-bold text-slate-800 border-slate-300 bg-[#F0F7FF]">{row.req.toLocaleString(undefined, {maximumFractionDigits:0})}</Td>
                <Td className="text-right font-bold text-blue-700 border-slate-300">{row.booked.toLocaleString()}</Td>
                <Td className={`text-right font-bold border-slate-300 ${row.bal > 0 ? 'text-red-600' : 'text-slate-600'}`}>{row.bal.toLocaleString(undefined, {maximumFractionDigits:0})}</Td>
                <Td className="text-[10px] border-slate-300">{row.mill}</Td>
                <Td className={`text-center font-bold text-[10px] border-slate-300 ${row.labDip.includes('Approved') ? 'text-green-600' : row.labDip === 'Rejected' ? 'text-red-600' : 'text-amber-600'}`}>
                  {row.labDip}
                </Td>
                <Td className="text-center border-slate-300 text-blue-700 underline cursor-pointer">{row.pi}</Td>
                <Td className="text-center text-[10px] border-slate-300">{row.etd}</Td>
                <Td className="text-center text-[10px] border-slate-300">{row.eta}</Td>
                <Td className="text-right font-semibold border-slate-300">${row.rate.toFixed(2)}</Td>
                <Td className="text-right font-bold text-slate-800 border-slate-300">${row.amt.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Booking Sub-Table (Simplified View) */}
      <div className="mt-2 bg-white border border-slate-300 p-2 shadow-sm">
        <div className="text-[11px] font-bold text-slate-700 mb-1">Recent Booking History (Selected Item)</div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <Th className="text-left w-24">Book No</Th>
              <Th className="text-left w-24">Book Date</Th>
              <Th className="text-right w-24">Booked Qty</Th>
              <Th className="text-right w-24">Remaining Qty</Th>
              <Th className="text-left">Remarks</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td className="border-slate-200">FB-9021</Td>
              <Td className="border-slate-200">02/10/25</Td>
              <Td className="text-right font-semibold border-slate-200">2,164</Td>
              <Td className="text-right border-slate-200">0</Td>
              <Td className="border-slate-200">Initial booking</Td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-1 flex items-center justify-between bg-slate-200 p-1.5 border border-slate-300 shadow-inner flex-shrink-0">
        <div className="flex gap-4 text-[10px] font-bold text-slate-800">
          <span className="flex items-center gap-1.5">Total Order: <span className="text-blue-800 bg-white px-2 py-0.5 border border-slate-300">141,155</span></span>
          <span className="flex items-center gap-1.5">Total Booked: <span className="text-blue-800 bg-white px-2 py-0.5 border border-slate-300">{totalBooked.toLocaleString()}</span></span>
          <span className="flex items-center gap-1.5">Total Balance: <span className="text-red-700 bg-white px-2 py-0.5 border border-slate-300">{totalBal.toLocaleString(undefined, {maximumFractionDigits:0})}</span></span>
        </div>
        <div className="text-[12px] font-bold flex items-center gap-2">
          Total Amount 
          <span className="text-blue-800 bg-white px-2 py-0.5 border border-slate-300 shadow-sm">
            ${totalAmt.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-1 flex flex-wrap gap-1 bg-[#E1E7EC] p-1 border border-slate-300 flex-shrink-0">
        {["Req. Sheet", "Lab Dip Register", "Booking History"].map(btn => (
          <button key={btn} className="bg-slate-100 border border-slate-400 hover:bg-slate-200 px-3 py-1 text-[11px] font-bold text-slate-800 shadow-sm rounded-sm">
            {btn}
          </button>
        ))}
        <button className="bg-green-600 border border-green-700 hover:bg-green-700 text-white px-3 py-1 text-[11px] font-bold shadow-sm rounded-sm ml-2">
          Excel Export
        </button>
        <div className="flex-1"></div>
        <button className="bg-red-50 border border-red-300 text-red-700 hover:bg-red-100 px-6 py-1 text-[11px] font-bold shadow-sm rounded-sm">Cancel</button>
        <button 
          onClick={() => {
            addFabricBooking({ color: "NEW COLOR", consump: 1, unit: "Kg", w: 5, req: 1000, booked: 0, bal: 1000, mill: "NEW MILL", labDip: "Pending", pi: "", etd: "", eta: "", rate: 4.0, amt: 0 });
          }}
          className="bg-slate-100 border border-slate-400 hover:bg-slate-200 px-6 py-1 text-[11px] font-bold text-slate-800 shadow-sm rounded-sm">New</button>
        <button className="bg-slate-100 border border-slate-400 hover:bg-slate-200 px-6 py-1 text-[11px] font-bold text-slate-800 shadow-sm rounded-sm">Save</button>
      </div>
    </div>
  );
}
