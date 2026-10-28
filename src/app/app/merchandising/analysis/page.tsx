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

// Dummy data mapped from the screenshot
const initialRows = [
  { id: "1", buyer: "BESTSEL", c: "N", s: "E", ref: "B6S31110R", lot: "10", delDt: "12/08/26", pcd: "05/08/26", lotQty: "6,480", eiPid: "23011", bomItem: "MOLD", details: "mold", bi: "N", conDz: "0.0005 Set", w: "0", ttlCon: "0.27 Pcs", rate: "17.00", value: "4.59", nob: ".", bQty: "", bValue: "", blnQty: "0.27", blnVal: "4.59", status: "Pending", bg: "bg-orange-500 text-white" },
  { id: "2", buyer: "BESTSEL", c: "Y", s: "E", ref: "B6S31110R", lot: "10", delDt: "12/08/26", pcd: "05/08/26", lotQty: "6,480", eiPid: "5328", bomItem: "ZIPPER", details: "4.5YG PULLER", bi: "N", conDz: "12.00 Pcs", w: "4", ttlCon: "6,739.20 Pcs", rate: "0.095", value: "640.22", nob: "1", bQty: "4,614.00", bValue: "461.40", blnQty: "2,125.20", blnVal: "178.82", status: "Partial", bg: "bg-orange-400 text-white" },
  { id: "3", buyer: "BESTSEL", c: "N", s: "N", ref: "B6S31110R", lot: "10", delDt: "12/08/26", pcd: "05/08/26", lotQty: "6,480", eiPid: "6037", bomItem: "CARTON BOAR", details: "CARTON CAR", bi: "N", conDz: "1.00 Pcs", w: "0", ttlCon: "540.00 Pcs", rate: "0.12", value: "64.80", nob: ".", bQty: "", bValue: "", blnQty: "540.00", blnVal: "64.80", status: "Pending", bg: "bg-orange-500 text-white" },
  { id: "4", buyer: "BESTSEL", c: "N", s: "N", ref: "B6S31110R", lot: "10", delDt: "12/08/26", pcd: "05/08/26", lotQty: "6,480", eiPid: "5914", bomItem: "PE SHEET", details: "ANTI MOLD PE", bi: "N", conDz: "11.20 Pcs", w: "0", ttlCon: "6,048.00 Pcs", rate: "0.0592", value: "358.04", nob: ".", bQty: "", bValue: "", blnQty: "6,048.00", blnVal: "358.04", status: "Pending", bg: "bg-orange-500 text-white" },
  { id: "5", buyer: "BESTSEL", c: "N", s: "E", ref: "B6S31110R", lot: "10", delDt: "12/08/26", pcd: "05/08/26", lotQty: "6,480", eiPid: "6065", bomItem: "HANGTAG WIT", details: "HANGTAG WIT", bi: "N", conDz: "12.00 Pcs", w: "4", ttlCon: "6,739.20 Pcs", rate: "0.03", value: "202.18", nob: ".", bQty: "", bValue: "", blnQty: "6,739.20", blnVal: "202.18", status: "Pending", bg: "bg-orange-500 text-white" },
  { id: "6", buyer: "BESTSEL", c: "Y", s: "N", ref: "B6S31110R", lot: "10", delDt: "12/08/26", pcd: "05/08/26", lotQty: "6,480", eiPid: "5118", bomItem: "POCKETING", details: "TC WHITE POC", bi: "Y", conDz: "1.90 Yds", w: "4", ttlCon: "1,067.04 Yds", rate: "0.64", value: "682.91", nob: ".", bQty: "", bValue: "", blnQty: "1,067.04", blnVal: "682.91", status: "Pending", bg: "bg-orange-500 text-white" },
  { id: "7", buyer: "BESTSEL", c: "Y", s: "E", ref: "B6S31110R", lot: "10", delDt: "12/08/26", pcd: "05/08/26", lotQty: "6,480", eiPid: "5082", bomItem: "RIVET-METAL", details: "METAL RIVET", bi: "N", conDz: "24.00 Pcs", w: "4", ttlCon: "13,478.40 Pcs", rate: "0.022", value: "296.52", nob: ".", bQty: "", bValue: "", blnQty: "13,478.40", blnVal: "296.52", status: "Pending", bg: "bg-orange-500 text-white" },
  { id: "8", buyer: "BESTSEL", c: "Y", s: "E", ref: "B6S31110R", lot: "10", delDt: "12/08/26", pcd: "05/08/26", lotQty: "6,480", eiPid: "5295", bomItem: "BUTTON-META", details: "METAL BUTTON", bi: "N", conDz: "12.00 Pcs", w: "4", ttlCon: "6,739.20 Pcs", rate: "0.095", value: "640.22", nob: ".", bQty: "", bValue: "", blnQty: "6,739.20", blnVal: "640.22", status: "Pending", bg: "bg-orange-500 text-white" },
];

export default function AnalysisTools() {
  const { accRmBookings, refresh, addAccRmBooking } = useMerchandisingData();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const displayRows = accRmBookings.length > 0 ? accRmBookings : initialRows;

  const handleAddDummy = () => {
    addAccRmBooking({
      buyer: "NEW BUYER", c: "Y", s: "N", ref: "REF123", lot: "11", delDt: "10/10/26", pcd: "01/10/26", lotQty: "1,000", eiPid: "123", bomItem: "NEW BOM", details: "DET", bi: "Y", conDz: "10 Pcs", w: "1", ttlCon: "100 Pcs", rate: "1.00", value: "100.00", nob: ".", bQty: "", bValue: "", blnQty: "100", blnVal: "100.00", status: "Pending", bg: "bg-orange-500 text-white"
    });
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-100 font-sans text-slate-800">
      {/* Top Header */}
      <div className="flex shrink-0 items-center justify-between bg-slate-200 border-b border-slate-300 p-1">
        <div className="text-[11px] font-bold text-blue-800 ml-2">User: <span className="font-semibold text-slate-800">ALAVI</span></div>
        <div className="text-[14px] font-bold text-slate-800">Acc RM Booking Analysis Tools</div>
        <div className="flex items-center gap-4 mr-1">
          <div className="text-[11px] font-bold">Tot Rec: <span className="text-blue-700">{displayRows.length}</span></div>
          <button className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">X</button>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 min-h-0 overflow-auto border border-slate-300 m-1 bg-white">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-slate-200 shadow-sm z-10">
            {/* Filter Row */}
            <tr>
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
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5"><FilterInput /></th>
              <th className="p-0.5">
                <div className="flex justify-center"><input type="checkbox" className="w-3 h-3" /></div>
              </th>
              <th className="p-0.5"><FilterInput /></th>
            </tr>
            {/* Header Row */}
            <tr>
              <Th>Buyer</Th>
              <Th>C</Th>
              <Th>S</Th>
              <Th>Our Ref</Th>
              <Th></Th>
              <Th></Th>
              <Th>Lot</Th>
              <Th>Del Dt</Th>
              <Th>PCD</Th>
              <Th>Lot Qty</Th>
              <Th>EI.PID</Th>
              <Th>BOM Item</Th>
              <Th></Th>
              <Th>Item Details</Th>
              <Th>BI</Th>
              <Th>Con/Dz</Th>
              <Th>W</Th>
              <Th>TTL Con</Th>
              <Th>Rate</Th>
              <Th>Value($)</Th>
              <Th>NOB</Th>
              <Th>B.Qty</Th>
              <Th>B.Value($)</Th>
              <Th>Bln.Qty</Th>
              <Th>Bln.Val($)</Th>
              <Th></Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row) => (
              <tr key={row.id} className="hover:bg-blue-50 even:bg-slate-50 border-b border-slate-200">
                <Td className="text-blue-700 font-semibold">{row.buyer}</Td>
                <Td className={`text-center font-bold ${row.c === 'Y' ? 'bg-orange-400 text-white' : ''}`}>{row.c}</Td>
                <Td className="text-center text-blue-700">{row.s}</Td>
                <Td className="text-blue-700">{row.ref}</Td>
                <Td className="text-center"><button className="bg-slate-200 border border-slate-400 px-1 text-[9px] font-bold hover:bg-slate-300">R</button></Td>
                <Td className="text-center"><button className="bg-slate-200 border border-slate-400 px-1 text-[9px] font-bold hover:bg-slate-300">C</button></Td>
                <Td className="text-center">{row.lot}</Td>
                <Td className="text-center">{row.delDt}</Td>
                <Td className="text-center">{row.pcd}</Td>
                <Td className="text-right">{row.lotQty}</Td>
                <Td className="text-center">{row.eiPid}</Td>
                <Td>{row.bomItem}</Td>
                <Td className="text-center"><button className="bg-slate-200 border border-slate-400 px-1 text-[9px] font-bold hover:bg-slate-300">BH</button></Td>
                <Td>{row.details}</Td>
                <Td className={`text-center font-bold ${row.bi === 'Y' ? 'bg-orange-400 text-white' : ''}`}>{row.bi}</Td>
                <Td className="text-right">{row.conDz}</Td>
                <Td className="text-right">{row.w}</Td>
                <Td className="text-right">{row.ttlCon}</Td>
                <Td className="text-right">{row.rate}</Td>
                <Td className="text-right text-blue-700">{row.value}</Td>
                <Td className={`text-center text-blue-700 underline cursor-pointer font-bold ${row.nob === '1' ? 'bg-white' : ''}`}>{row.nob}</Td>
                <Td className="text-right">{row.bQty}</Td>
                <Td className="text-right">{row.bValue}</Td>
                <Td className="text-right">{row.blnQty}</Td>
                <Td className="text-right text-blue-700">{row.blnVal}</Td>
                <Td className="text-center"><input type="checkbox" className="w-3 h-3" /></Td>
                <Td className={`text-center font-semibold ${row.bg}`}>{row.status}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Details */}
      <div className="flex shrink-0 flex-col gap-1 bg-slate-200 border border-slate-300 mx-1 mb-1 p-1 text-[11px] font-semibold">
        <div className="flex items-start gap-4">
          {/* Left Block */}
          <div className="flex gap-4 p-1">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 justify-end">
                <span>Mc :</span>
                <input type="text" defaultValue="SHOWRAV" className="w-24 border border-slate-300 h-5 px-1 text-blue-700 focus:outline-none" />
                <button className="bg-white border border-slate-400 w-5 h-5 flex items-center justify-center font-bold">=</button>
              </div>
              <div className="flex items-center gap-1 justify-end">
                <span>Mc A/c :</span>
                <input type="text" defaultValue="HIDER" className="w-24 border border-slate-300 h-5 px-1 text-blue-700 focus:outline-none" />
                <button className="bg-white border border-slate-400 w-5 h-5 flex items-center justify-center font-bold">=</button>
              </div>
              <div className="flex items-center gap-1 justify-end">
                <span>Mc Head :</span>
                <input type="text" defaultValue="KHALID" className="w-24 border border-slate-300 h-5 px-1 text-blue-700 focus:outline-none" />
                <button className="bg-white border border-slate-400 w-5 h-5 flex items-center justify-center font-bold">=</button>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 justify-end">
                <span>Qtn No :</span>
                <input type="text" defaultValue="Q31W25/25" className="w-32 border border-slate-300 h-5 px-1 text-blue-700 focus:outline-none" />
                <button className="bg-white border border-slate-400 w-5 h-5 flex items-center justify-center font-bold">=</button>
              </div>
              <div className="flex items-center gap-1 justify-end">
                <span>Qtn Date :</span>
                <input type="text" defaultValue="02/11/2025" className="w-32 border border-slate-300 h-5 px-1 text-blue-700 focus:outline-none" />
                <button className="bg-white border border-slate-400 w-5 h-5 flex items-center justify-center font-bold">=</button>
              </div>
              <div className="flex items-center gap-1 justify-end">
                <span>Buyer Ref :</span>
                <input type="text" defaultValue="13190372-N" className="w-32 border border-slate-300 h-5 px-1 text-blue-700 focus:outline-none" />
                <button className="bg-white border border-slate-400 w-5 h-5 flex items-center justify-center font-bold">=</button>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 justify-end">
                <span>RM In House By :</span>
                <input type="text" defaultValue="31/07/2026" className="w-24 border border-slate-300 h-5 px-1 text-blue-700 focus:outline-none" />
                <button className="bg-white border border-slate-400 w-5 h-5 flex items-center justify-center font-bold">=</button>
                <input type="text" className="w-16 border border-slate-300 h-5 px-1 focus:outline-none" />
              </div>
              <div className="flex items-center gap-1 justify-end">
                <span>RM Booked By :</span>
                <input type="text" defaultValue="17/07/2026" className="w-24 border border-slate-300 h-5 px-1 text-blue-700 focus:outline-none" />
                <button className="bg-white border border-slate-400 w-5 h-5 flex items-center justify-center font-bold">=</button>
                <input type="text" className="w-16 border border-slate-300 h-5 px-1 focus:outline-none" />
              </div>
              <div className="flex items-center gap-1 justify-end">
                <span>Left Days (Book) :</span>
                <input type="text" defaultValue="-55" className="w-24 border border-slate-300 h-5 px-1 text-blue-700 text-center focus:outline-none" />
                <button className="bg-white border border-slate-400 w-5 h-5 flex items-center justify-center font-bold">=</button>
                <input type="text" className="w-16 border border-slate-300 h-5 px-1 focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Supplier Grid block */}
          <div className="bg-white border border-slate-400 p-1">
            <table className="w-[300px] border-collapse text-[10px]">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border border-slate-300 px-1">ID</th>
                  <th className="border border-slate-300 px-1 text-left w-full">Supplier Name</th>
                  <th className="border border-slate-300 px-1">N/O</th>
                  <th className="border border-slate-300 px-1">F/L</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 px-1 text-center">389</td>
                  <td className="border border-slate-300 px-1">AGAMI ACCESSORIES LT</td>
                  <td className="border border-slate-300 px-1 text-center">N</td>
                  <td className="border border-slate-300 px-1 text-center">L</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-1 text-center">&nbsp;</td>
                  <td className="border border-slate-300 px-1">&nbsp;</td>
                  <td className="border border-slate-300 px-1 text-center">&nbsp;</td>
                  <td className="border border-slate-300 px-1 text-center">&nbsp;</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Proceed to book block */}
          <div className="flex flex-col gap-2 p-1 border border-slate-300 bg-slate-100 relative">
            <span className="absolute -top-2 left-2 bg-slate-100 px-1 text-[9px] text-slate-500">Group Info</span>
            <div className="flex gap-1 items-center mt-2">
              <input type="text" defaultValue="Clr" className="w-16 bg-yellow-50 border border-slate-300 h-5 px-1 focus:outline-none" />
              <button className="bg-slate-200 border border-slate-400 w-5 h-5 flex items-center justify-center font-bold">L</button>
            </div>
            <button className="bg-blue-100 border border-blue-400 text-blue-800 font-bold px-4 py-2 hover:bg-blue-200 text-[12px] shadow-sm">
              Proceed to Book &gt;&gt;
            </button>
          </div>
          
          <div className="flex flex-col gap-1 text-[10px] ml-4">
            <div className="flex justify-between w-32"><span>Rec :</span><span></span></div>
            <div className="flex justify-between w-32"><span>Qty :</span><span></span></div>
            <div className="flex justify-between w-32"><span>Amt :</span><span></span></div>
          </div>
        </div>

        {/* Radio Row */}
        <div className="flex items-center gap-4 px-2 pt-1 border-t border-slate-300">
          <div className="flex items-center gap-1">
            <span className="w-16">V.Status:</span>
            <select className="border border-slate-300 h-5 px-1 focus:outline-none w-32">
              <option>Pending + Partial</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-32 text-right">Booking Required Status:</span>
            <select className="border border-slate-300 h-5 px-1 focus:outline-none w-24">
              <option>All</option>
            </select>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center gap-4 text-orange-600 font-bold">
            <label className="flex items-center gap-1"><input type="radio" name="task" defaultChecked /> My Task</label>
            <label className="flex items-center gap-1 text-slate-800"><input type="radio" name="task" /> All</label>
            <label className="flex items-center gap-1 text-green-700"><input type="radio" name="sel" defaultChecked /> Selected</label>
            <label className="flex items-center gap-1 text-red-600"><input type="radio" name="sel" /> Not Selected</label>
            <label className="flex items-center gap-1 text-slate-800"><input type="radio" name="sel" /> All</label>
          </div>
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-t border-slate-300 bg-slate-200 px-1 py-1.5 text-[11px] font-bold">
        <input type="text" defaultValue="12/08/2026" className="w-20 border border-slate-300 h-6 px-1 focus:outline-none text-center" />
        <span className="text-slate-600">to</span>
        <input type="text" defaultValue="10/03/2027" className="w-20 border border-slate-300 h-6 px-1 focus:outline-none text-center" />
        
        <select className="border border-slate-300 h-6 px-1 focus:outline-none w-32 ml-1">
          <option>Lot Delivery D...</option>
        </select>
        
        <button onClick={handleAddDummy} className="bg-orange-100 border border-orange-300 hover:bg-orange-200 px-3 py-1 shadow-sm">Refresh</button>
        <button className="bg-slate-100 border border-slate-400 hover:bg-slate-200 px-3 py-1 text-blue-800 shadow-sm">Ref wise TNA</button>
        
        <div className="flex-1"></div>
        
        <button className="bg-teal-50 border border-teal-200 hover:bg-teal-100 px-3 py-1 text-teal-900 shadow-sm">Quotation Register</button>
        <button className="bg-teal-50 border border-teal-200 hover:bg-teal-100 px-3 py-1 text-teal-900 shadow-sm">Order Register</button>
        <button className="bg-teal-50 border border-teal-200 hover:bg-teal-100 px-3 py-1 text-teal-900 shadow-sm">Booking Register</button>
        <button className="bg-teal-50 border border-teal-200 hover:bg-teal-100 px-3 py-1 text-teal-900 shadow-sm">PI Register</button>
        <button className="bg-teal-50 border border-teal-200 hover:bg-teal-100 px-3 py-1 text-teal-900 shadow-sm">RM Purchase Analysis Tools</button>
        
        <button className="bg-slate-100 border border-slate-400 hover:bg-slate-200 px-3 py-1 shadow-sm text-[10px]">Legend</button>
        <button className="bg-blue-100 border border-blue-300 hover:bg-blue-200 px-4 py-1 text-blue-900 shadow-sm">Report</button>
        <button className="bg-green-700 border border-green-800 hover:bg-green-800 text-white px-4 py-1 shadow-sm">&lt;&lt;Excel&gt;&gt;</button>
      </div>
    </div>
  );
}
