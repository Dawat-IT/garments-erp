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
  { id: 1, name: "BUTTON-PLASTIC", est: 207968, booked: 207968, unit: "Pcs", rate: 0.0060, amt: 1247.81, delDate: "10/10/25", payment: "Advance", status: "Delivered" },
  { id: 2, name: "RIVET-METAL", est: 293602, booked: 293602, unit: "Pcs", rate: 0.0220, amt: 6459.24, delDate: "12/10/25", payment: "Credit", status: "Booked" },
  { id: 3, name: "POLY BAG", est: 141155, booked: 100000, unit: "Pcs", rate: 0.0228, amt: 2280.00, delDate: "15/10/25", payment: "Advance", status: "Partial" },
  { id: 4, name: "CARTON", est: 2940, booked: 2940, unit: "Pcs", rate: 1.0000, amt: 2940.73, delDate: "18/10/25", payment: "Credit", status: "Booked" },
  { id: 5, name: "TAPE-GUM", est: 2352, booked: 0, unit: "Roll", rate: 0.5000, amt: 0.00, delDate: "", payment: "Advance", status: "Pending" },
];

export default function AccessoriesBooking() {
  const router = useRouter();
  const { accessoriesBookings, refresh, addAccessoriesBooking, updateAccessoriesBooking } = useMerchandisingData();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const rows = accessoriesBookings.length > 0 ? accessoriesBookings : initialRows;

  const handleBookedChange = (index: number, val: string) => {
    const row = rows[index];
    const booked = parseFloat(val) || 0;
    if (accessoriesBookings.length > 0) {
      updateAccessoriesBooking(String(row.id), { bookQty: booked });
    }
  };

  const totalBookingAmount = rows.reduce((sum, r: any) => sum + (r.amt || 0), 0);
  
  // Dummy logic: if status is Delivered or Partial, we assume some delivered qty
  const totalDeliveredQty = rows.filter((r: any) => r.status === 'Delivered').reduce((sum, r: any) => sum + (r.booked || r.bookQty || 0), 0) + 
                            rows.filter((r: any) => r.status === 'Partial').reduce((sum, r: any) => sum + ((r.booked || r.bookQty || 0) / 2), 0);
  const totalBalanceQty = rows.reduce((sum, r: any) => sum + (r.est || r.reqQty || 0), 0) - totalDeliveredQty;

  return (
    <div className="flex h-full w-full flex-col bg-[#F0F4F8] p-1 text-slate-800 font-sans overflow-hidden">
      {/* Title */}
      <div className="mb-1 flex items-center justify-between rounded bg-slate-200 p-1 border border-slate-300 flex-shrink-0">
        <div className="flex-1 text-center text-base font-bold text-slate-800">Accessories Booking (Direct)</div>
        <button onClick={() => router.push("/app/dashboard")} className="flex h-5 w-5 items-center justify-center bg-red-600 text-white font-bold rounded hover:bg-red-700 text-xs">X</button>
      </div>

      {/* Header Form */}
      <div className="mb-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-2 gap-y-1 bg-white p-1.5 border border-slate-300 shadow-sm flex-shrink-0">
        <HeaderField label="Our Ref" value="B6S31110R" lookup width="w-24" />
        <HeaderField label="Buyer" value="BESTSELLER" width="w-32" />
        <HeaderField label="Item Name" value="Multiple" lookup width="w-32" />
        <HeaderField label="Supplier" value="Multiple" lookup width="w-32" />
        <HeaderField label="Booking No" value="AB-2025-001" width="w-24" />
        <HeaderField label="Booking Dt" value="03/10/2025" width="w-24" />
      </div>

      {/* Main Grid - Scrollable box */}
      <div className="flex-1 min-h-0 overflow-auto border border-slate-400 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-200">
            <tr>
              <Th className="w-6 border-slate-400">X</Th>
              <Th className="text-left w-48 border-slate-400">Item Name (Pulled from Estimation)</Th>
              <Th className="border-slate-400">Estimated Qty</Th>
              <Th className="text-blue-700 border-slate-400">Booking Qty</Th>
              <Th className="border-slate-400">Unit</Th>
              <Th className="border-slate-400">Rate</Th>
              <Th className="text-red-700 border-slate-400">Amount</Th>
              <Th className="border-slate-400">Delivery Date</Th>
              <Th className="border-slate-400">Payment Terms</Th>
              <Th className="border-slate-400">Status</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any, idx) => (
              <tr key={row.id} className="hover:bg-[#F3F6F7] even:bg-[#F9FAFB] odd:bg-white">
                <Td className="text-center font-bold text-red-500 cursor-pointer border-slate-300 hover:bg-red-100">X</Td>
                <Td className="font-semibold text-slate-700 border-slate-300">{row.name}</Td>
                <Td className="text-right font-medium bg-[#F0F7FF] border-slate-300">{(row.est || row.reqQty || 0).toLocaleString()}</Td>
                <Td className="text-right p-0 border-slate-300">
                  <input
                    type="number"
                    value={row.booked || row.bookQty || 0}
                    onChange={(e) => handleBookedChange(idx, e.target.value)}
                    className="w-full h-full bg-transparent px-1 py-1 text-right text-[11px] text-blue-700 font-bold focus:outline-none"
                  />
                </Td>
                <Td className="text-center border-slate-300">{row.unit || "Pcs"}</Td>
                <Td className="text-right font-semibold border-slate-300">${(row.rate || 0).toFixed(4)}</Td>
                <Td className="text-right font-bold text-slate-800 border-slate-300 bg-[#FFF5F5]">${(row.amt || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</Td>
                <Td className="text-center border-slate-300">
                  <input type="text" defaultValue={row.delDate || row.targetDate || ""} className="w-20 text-center bg-transparent border border-slate-300 focus:outline-none" />
                </Td>
                <Td className="text-center border-slate-300">
                  <select defaultValue={row.payment} className="w-full bg-transparent text-[10px] focus:outline-none">
                    <option>Advance</option>
                    <option>LC</option>
                    <option>Credit</option>
                  </select>
                </Td>
                <Td className="text-center border-slate-300">
                  <select defaultValue={row.status} className={`w-full bg-transparent text-[10px] font-bold focus:outline-none ${row.status === 'Delivered' ? 'text-green-600' : row.status === 'Partial' ? 'text-amber-600' : 'text-slate-600'}`}>
                    <option>Pending</option>
                    <option>Booked</option>
                    <option>Partial</option>
                    <option>Delivered</option>
                  </select>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-1 flex items-center justify-between bg-slate-200 p-1.5 border border-slate-300 shadow-inner flex-shrink-0">
        <div className="flex gap-4 text-[10px] font-bold text-slate-800">
          <span className="flex items-center gap-1.5">Total Delivered Qty: <span className="text-green-700 bg-white px-2 py-0.5 border border-slate-300 shadow-sm">{totalDeliveredQty.toLocaleString(undefined, {maximumFractionDigits:0})}</span></span>
          <span className="flex items-center gap-1.5">Total Balance Qty: <span className="text-red-700 bg-white px-2 py-0.5 border border-slate-300 shadow-sm">{totalBalanceQty.toLocaleString(undefined, {maximumFractionDigits:0})}</span></span>
        </div>
        <div className="text-[12px] font-bold flex items-center gap-2">
          Total Booking Amount 
          <span className="text-blue-800 bg-white px-2 py-0.5 border border-slate-300 shadow-sm">
            ${totalBookingAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-1 flex flex-wrap gap-1 bg-[#E1E7EC] p-1 border border-slate-300 flex-shrink-0">
        <button 
          onClick={() => {
            addAccessoriesBooking({ orderNo: "NEW", item: "NEW ITEM", color: "Red", size: "L", reqQty: 1000, allowance: 5, bookQty: 1050, supplier: "NEW SUPPLIER", targetDate: "10/10/25", status: "Pending" });
          }}
          className="bg-blue-100 border border-blue-400 text-blue-800 hover:bg-blue-200 px-3 py-1 text-[11px] font-bold shadow-sm rounded-sm">
          Pull from Estimation
        </button>
        <button className="bg-slate-100 border border-slate-400 hover:bg-slate-200 px-3 py-1 text-[11px] font-bold text-slate-800 shadow-sm rounded-sm ml-2">
          Print PO
        </button>
        <button className="bg-green-600 border border-green-700 hover:bg-green-700 text-white px-3 py-1 text-[11px] font-bold shadow-sm rounded-sm">
          Excel Export
        </button>
        <div className="flex-1"></div>
        <button className="bg-slate-100 border border-slate-400 hover:bg-slate-200 px-6 py-1 text-[11px] font-bold text-slate-800 shadow-sm rounded-sm">Save</button>
      </div>
    </div>
  );
}
