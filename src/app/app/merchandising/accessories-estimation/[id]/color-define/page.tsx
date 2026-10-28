"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toast";

// Dense components
const Th = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <th className={`border border-slate-300 bg-slate-200/50 px-1 py-1 text-center text-[11px] font-semibold text-slate-700 whitespace-nowrap ${className || ""}`}>
    {children}
  </th>
);

const Td = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <td className={`border border-slate-300 px-1 py-1 text-[11px] text-slate-800 ${className || ""}`}>
    {children}
  </td>
);

const HeaderField = ({ label, value, width = "w-48", hasButton = false, buttonText = "", lookup = false }: any) => (
  <div className="flex items-center justify-end gap-1">
    <span className="text-[11px] font-medium text-slate-700 whitespace-nowrap">{label} :</span>
    <div className="flex items-center">
      <input
        type="text"
        value={value}
        readOnly={!lookup}
        className={`h-6 ${width} border border-slate-300 px-1.5 text-[11px] focus:outline-none ${!lookup ? 'bg-slate-50 text-slate-800' : 'bg-yellow-50 text-slate-800'}`}
      />
      {lookup && (
        <button className="h-6 w-6 border border-l-0 border-slate-300 bg-white text-[10px] text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold">
          v
        </button>
      )}
      {hasButton && (
        <button className="ml-2 h-6 px-3 border border-slate-300 bg-yellow-50 text-[11px] text-slate-800 hover:bg-yellow-100 font-medium">
          {buttonText}
        </button>
      )}
    </div>
  </div>
);

const initialRows = [
  { id: 1, po: "DDERLP4479072", lot: 3, shellColor: "VINTAGE MEDIUM BLUE", gmtQty: 3015, accColor: "WHITE", reqQty: 4271, wastage: 171, total: 4442, bookNo: "" },
  { id: 2, po: "DDERLP4489494", lot: 4, shellColor: "BLACK DENIM", gmtQty: 2520, accColor: "WHITE", reqQty: 3570, wastage: 143, total: 3713, bookNo: "" },
  { id: 3, po: "DDERLP4489494", lot: 4, shellColor: "DARK BLUE DENIM", gmtQty: 5040, accColor: "WHITE", reqQty: 7140, wastage: 286, total: 7426, bookNo: "" },
  { id: 4, po: "DDERLP4489494", lot: 4, shellColor: "LIGHT BLUE DENIM", gmtQty: 2520, accColor: "WHITE", reqQty: 3570, wastage: 143, total: 3713, bookNo: "" },
  { id: 5, po: "DDERLP4489494", lot: 4, shellColor: "MEDIUM BLUE DENIM", gmtQty: 4320, accColor: "WHITE", reqQty: 6120, wastage: 245, total: 6365, bookNo: "" },
  { id: 6, po: "DDERLP4489494", lot: 4, shellColor: "MEDIUM GREY DENIM", gmtQty: 2520, accColor: "WHITE", reqQty: 3570, wastage: 143, total: 3713, bookNo: "" },
  { id: 7, po: "DDERLP4571635", lot: 5, shellColor: "BLACK", gmtQty: 4815, accColor: "WHITE", reqQty: 6821, wastage: 273, total: 7094, bookNo: "" },
  { id: 8, po: "DDERLP4571635", lot: 5, shellColor: "BLACK DENIM", gmtQty: 4815, accColor: "WHITE", reqQty: 6821, wastage: 273, total: 7094, bookNo: "" },
];

export default function AccessoriesEstimationColorDefine({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);

  const totalGmtQty = rows.reduce((sum, r) => sum + r.gmtQty, 0);
  const totalReqQty = rows.reduce((sum, r) => sum + r.reqQty, 0);
  const totalWastage = rows.reduce((sum, r) => sum + r.wastage, 0);
  const totalTotalQty = rows.reduce((sum, r) => sum + r.total, 0);
  const grandTotalGmtQty = 53884; // Dummy static from original DB
  const globalPOLineCount = 55;

  return (
    <div className="flex h-full w-full flex-col bg-[#F4F6F9] p-1.5 text-slate-800 font-sans overflow-hidden">
      
      {/* Title Bar */}
      <div className="mb-1 bg-[#E1EAF7] py-1 border border-blue-200 flex-shrink-0">
        <h1 className="text-center text-base font-bold text-slate-800 tracking-wide">Accessories Estimation Color Define</h1>
      </div>

      {/* Header Info */}
      <div className="mb-1.5 bg-[#E1EAF7] p-2 border border-blue-200 rounded-sm flex-shrink-0 text-[10px]">
        <div className="grid grid-cols-2 gap-y-1 max-w-4xl mx-auto">
          <HeaderField label="Our Ref." value="B6S31110R" width="w-48" />
          <HeaderField label="Buyer Name" value="BESTSELLER" width="w-64" lookup />
          
          <HeaderField label="Accessories Name" value="BUTTON-PLASTIC , 5285" width="w-64" />
          <HeaderField label="Description" value="ADJUSTABLE PLASTIC BUTTON" width="w-80" />
          
          <div className="col-span-2 flex justify-start pl-[52px]">
            <HeaderField label="Technical Spacification" value="No Data" width="w-64" hasButton buttonText="TS Add(+)" />
          </div>
          
          <div className="col-span-2 flex justify-start pl-[124px] gap-2 items-center">
            <span className="text-[11px] font-medium text-slate-700">Color Type:</span>
            <select className="h-5 w-32 border border-slate-300 text-[10px] focus:outline-none bg-white">
              <option>Single Color</option>
              <option>Multi Color</option>
            </select>
            <div className="flex items-center ml-4">
              <input type="text" defaultValue="WHITE" className="h-5 w-40 border border-slate-300 bg-yellow-50 px-1.5 text-[10px] focus:outline-none" />
              <button className="h-5 w-5 border border-l-0 border-slate-300 bg-white text-[10px] text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold">
                v
              </button>
            </div>
            <button className="ml-4 h-5 px-3 border border-slate-300 bg-yellow-50 text-[10px] text-slate-800 hover:bg-yellow-100 font-medium">
              Color Add(+)
            </button>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="mb-1 flex items-center gap-2 bg-[#E1EAF7] p-1 border border-blue-200 flex-shrink-0 text-[10px]">
        <input type="text" className="h-5 w-24 border border-slate-300 px-1 text-[10px] focus:outline-none" />
        <input type="text" className="h-5 w-16 border border-slate-300 px-1 text-[10px] focus:outline-none" />
        <input type="text" className="h-5 w-40 border border-slate-300 px-1 text-[10px] focus:outline-none" />
        <input type="text" className="h-5 w-24 border border-slate-300 px-1 text-[10px] focus:outline-none" />
        <input type="text" className="h-5 w-24 border border-slate-300 px-1 text-[10px] focus:outline-none" />
        <div className="flex-1"></div>
        <button className="h-5 px-3 border border-green-700 bg-green-100 text-[10px] font-bold text-green-800 hover:bg-green-200 shadow-sm underline">
          Clear
        </button>
      </div>

      {/* Data Grid - Scrollable box */}
      <div className="flex-1 min-h-0 overflow-auto border border-blue-200 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-[#F4F6F9]">
            <tr>
              <Th className="w-8"></Th>
              <Th className="text-left w-32">PO No</Th>
              <Th className="w-16">LOT</Th>
              <Th className="text-left w-48">Shell Fabric Color</Th>
              <Th className="w-32">GMT Order Qty</Th>
              <Th className="text-left w-40">Accessories Color</Th>
              <Th className="w-32">Req. Qty</Th>
              <Th className="w-24">Wastage</Th>
              <Th className="w-32">Total Qty</Th>
              <Th className="w-24">Book No</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-[#F3F6F7]">
                <Td className="text-center font-bold text-red-600 cursor-pointer hover:bg-red-50">X</Td>
                <Td>{row.po}</Td>
                <Td className="text-center">{row.lot}</Td>
                <Td>{row.shellColor}</Td>
                <Td className="text-right">{row.gmtQty.toLocaleString()}</Td>
                <Td className="p-0">
                  <div className="flex h-full w-full">
                    <input type="text" value={row.accColor} readOnly className="h-full w-full bg-yellow-50 px-1 py-1 text-[11px] border-none focus:outline-none" />
                    <button className="bg-yellow-50 border-l border-slate-300 px-1 text-[10px] font-bold text-slate-500 hover:bg-yellow-100">L</button>
                  </div>
                </Td>
                <Td className="text-right font-medium">{row.reqQty.toLocaleString()}</Td>
                <Td className="text-right">{row.wastage.toLocaleString()}</Td>
                <Td className="text-right font-medium bg-[#F0F7FF]">{row.total.toLocaleString()}</Td>
                <Td>{row.bookNo}</Td>
              </tr>
            ))}
            
            {/* Footer Row */}
            <tr className="bg-[#F4F6F9] font-bold">
              <Td className="text-center text-red-600">{globalPOLineCount}</Td>
              <Td></Td>
              <Td></Td>
              <Td>
                <input type="text" value={grandTotalGmtQty.toLocaleString()} readOnly className="w-full bg-[#E1EAF7] text-right border border-blue-200 px-1 focus:outline-none text-slate-700" />
              </Td>
              <Td className="text-right text-purple-700 bg-[#E1EAF7]">{totalGmtQty.toLocaleString()}</Td>
              <Td className="text-right">{totalGmtQty.toLocaleString()}</Td>
              <Td className="text-right text-purple-700 font-bold">{totalReqQty.toLocaleString()}</Td>
              <Td className="text-right text-purple-700 font-bold">{totalWastage.toLocaleString()}</Td>
              <Td className="text-right text-purple-700 font-bold">{totalTotalQty.toLocaleString()}</Td>
              <Td></Td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="mt-1 flex justify-end gap-2 flex-shrink-0">
        <button 
          onClick={() => { toast.success("Color define saved"); router.back(); }}
          className="bg-white border border-slate-400 hover:bg-slate-100 px-8 py-1.5 text-[12px] font-bold text-slate-800 shadow-sm underline"
        >
          Save
        </button>
        <button 
          onClick={() => router.back()}
          className="bg-white border border-slate-400 hover:bg-slate-100 px-8 py-1.5 text-[12px] font-bold text-slate-800 shadow-sm underline"
        >
          Back
        </button>
      </div>

    </div>
  );
}
