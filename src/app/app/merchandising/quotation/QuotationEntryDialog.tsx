import React, { useEffect, useState } from "react";
import type { Quotation, QuotationEntryData, QuotationFabricLine, QuotationTrimLine } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";

const Section = ({ title, children, className = "", contentClassName = "", action }: any) => (
  <div className={`border border-slate-200 rounded-md shadow-xs bg-white flex flex-col shrink-0 ${className}`}>
    <div className="bg-slate-50 px-2.5 py-1 font-semibold text-[10px] text-slate-700 border-b border-slate-200 uppercase tracking-wider flex items-center justify-between shrink-0">
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
        {title}
      </div>
      {action && <div>{action}</div>}
    </div>
    <div className={`p-1.5 flex-1 ${contentClassName}`}>{children}</div>
  </div>
);

const Label = ({ children, className = "" }: any) => (
  <label className={cn("text-[9.5px] font-bold text-slate-700 whitespace-nowrap min-w-[62px] xl:text-right shrink-0", className)}>{children}</label>
);

const Input = ({ className = "", ...props }: any) => (
  <input
    className={cn(
      "border border-slate-300 rounded h-[22px] px-1.5 text-[10px] font-semibold text-slate-950 bg-yellow-50/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full disabled:bg-slate-100 disabled:text-slate-600 transition-colors",
      className
    )}
    {...props}
  />
);

const Select = ({ className = "", children, ...props }: any) => (
  <select
    className={cn(
      "border border-slate-300 rounded h-[22px] px-1 text-[10px] font-semibold text-slate-950 bg-yellow-50/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full transition-colors",
      className
    )}
    {...props}
  >
    {children}
  </select>
);

const Th = ({ children, className = "" }: any) => (
  <th className={`border border-slate-300 bg-slate-200/90 px-1.5 py-1 text-center text-[9px] font-bold text-slate-800 whitespace-nowrap ${className}`}>{children}</th>
);

const Td = ({ children, className = "" }: any) => (
  <td className={`border-b border-r border-slate-200 px-0.5 py-0.5 text-[10px] text-slate-800 ${className}`}>{children}</td>
);

const SummaryRow = ({ label, value, isBold = false, isTotal = false, colorClass = "text-slate-800", bgClass = "" }: any) => (
  <div className={`flex justify-between items-center px-1.5 py-1 rounded ${bgClass} ${isTotal ? "border-t border-slate-200 mt-1 pt-1" : ""}`}>
    <span className={`text-[9.5px] ${isBold ? "font-bold text-slate-800" : "font-medium text-slate-600"}`}>{label}</span>
    <span className={`text-[10.5px] font-mono ${isBold ? "font-bold" : "font-semibold"} ${colorClass}`}>{value}</span>
  </div>
);

function blankFabric(): QuotationFabricLine {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    usedPlace: "",
    supplier: "",
    status: "",
    fabricCode: "",
    millCode: "",
    fabricDesc: "",
    width: "",
    actCons: "",
    quotedCons: "",
    wPercent: "",
    unit: "",
    preQtdPrice: "",
    quotedPrice: "",
  };
}

function blankTrim(): QuotationTrimLine {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    usedPlace: "",
    trimsName: "",
    description: "",
    supplier: "",
    status: "",
    consDz: "",
    unit: "",
    wPercent: "",
    packUnit: "",
    prePrice: "",
    quotedPrice: "",
  };
}

const blankCosting = {
  financeCost: "",
  cmLaborCost: "",
  overheadCost: "",
  commission: "",
  buyingOp: "",
  fob: "",
};

function blankEntry(): QuotationEntryData {
  return {
    garmentType: "Casual",
    orderType: "Regular",
    ourRef: "",
    quotationNo: "",
    maskingNo: "",
    buyer: "",
    buyerId: "",
    season: "",
    option: "",
    tna: "",
    revisedNo: "",
    offerFob: "",
    merchandiser: "",
    accountHolder: "",
    styleNo: "",
    gi: "",
    department: "",
    styleItem: "",
    qty: "",
    delivery: "",
    firstDelivery: "",
    offerNo: "",
    offerStatus: "",
    submitDate: "",
    amendment: "",
    financePercent: "",
    machineEff: "",
    smv: "",
    attachment: "",
    fabricRows: [blankFabric(), blankFabric()],
    trimsRows: [blankTrim(), blankTrim()],
    costing: { ...blankCosting },
  };
}

function num(value: string): number | null {
  if (value == null || String(value).trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function money(value: number | null, digits = 2): string {
  if (value == null) return "";
  return `$${value.toFixed(digits)}`;
}

function fixed(value: number | null, digits: number): string {
  if (value == null) return "";
  return value.toFixed(digits);
}

function sum(values: Array<number | null>): number | null {
  if (values.every((value) => value == null)) return null;
  return values.reduce<number>((total, value) => total + (value ?? 0), 0);
}

function toIso(value: string): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!match) return "";
  const year = match[3].length === 2 ? `20${match[3]}` : match[3];
  return `${year}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

function keep(saved: string | undefined, fallback: string | undefined): string {
  const value = (saved ?? "").trim();
  return value || (fallback ?? "");
}

function entryFromQuotation(quotation?: Quotation | null): QuotationEntryData {
  const base = blankEntry();
  if (!quotation) return base;
  const saved = quotation.entry;
  const fob = keep(saved?.costing?.fob, keep(saved?.offerFob, quotation.fFob || quotation.nFob));
  return {
    ...base,
    ...saved,
    garmentType: saved?.garmentType || base.garmentType,
    orderType: saved?.orderType || base.orderType,
    ourRef: keep(saved?.ourRef, quotation.ourRef),
    quotationNo: keep(saved?.quotationNo, quotation.quotationNo || (quotation as { qtnNo?: string }).qtnNo),
    maskingNo: saved?.maskingNo || "",
    buyer: keep(saved?.buyer, quotation.buyer),
    buyerId: keep(saved?.buyerId, quotation.buyerId),
    season: saved?.season || "",
    option: keep(saved?.option, quotation.option),
    tna: saved?.tna || "",
    revisedNo: keep(saved?.revisedNo, quotation.amend),
    offerFob: fob,
    merchandiser: keep(saved?.merchandiser, quotation.oMer),
    accountHolder: saved?.accountHolder || "",
    styleNo: keep(saved?.styleNo, quotation.buyerRef),
    gi: keep(saved?.gi, quotation.gi),
    department: saved?.department || "",
    styleItem: saved?.styleItem || "",
    qty: keep(saved?.qty, quotation.qty),
    delivery: toIso(keep(saved?.delivery, quotation.delDt)),
    firstDelivery: toIso(saved?.firstDelivery || ""),
    offerNo: saved?.offerNo || "",
    offerStatus: saved?.offerStatus || quotation.appStatus || "",
    submitDate: toIso(saved?.submitDate || ""),
    amendment: saved?.amendment || "",
    financePercent: saved?.financePercent || "",
    machineEff: keep(saved?.machineEff, quotation.eff),
    smv: keep(saved?.smv, quotation.smv),
    attachment: saved?.attachment || "",
    fabricRows: saved?.fabricRows?.length ? saved.fabricRows : [blankFabric(), blankFabric()],
    trimsRows: saved?.trimsRows?.length ? saved.trimsRows : [blankTrim(), blankTrim()],
    costing: {
      ...blankCosting,
      ...saved?.costing,
      fob,
    },
  };
}

export default function QuotationEntryDialog({
  onClose,
  onSave,
  initial,
  buyers,
}: {
  onClose: () => void;
  onSave?: (data: Omit<Quotation, "id"> & { id?: string }) => void | Promise<void>;
  initial?: Quotation | null;
  buyers: Array<{ id: string; name: string }>;
}) {
  const [form, setForm] = useState<QuotationEntryData>(() => entryFromQuotation(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const fileRef = React.useRef<HTMLInputElement>(null);
  const attachRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(entryFromQuotation(initial));
  }, [initial]);

  const setField = (field: keyof QuotationEntryData, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };
  const setCost = (field: keyof QuotationEntryData["costing"], value: string) => {
    setForm((current) => ({ ...current, costing: { ...current.costing, [field]: value }, offerFob: field === "fob" ? value : current.offerFob }));
  };

  const handleFabricChange = (id: number, field: keyof QuotationFabricLine, value: string) => {
    setForm((current) => ({
      ...current,
      fabricRows: current.fabricRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    }));
  };
  const handleTrimsChange = (id: number, field: keyof QuotationTrimLine, value: string) => {
    setForm((current) => ({
      ...current,
      trimsRows: current.trimsRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    }));
  };

  const repeatLastRows = () => {
    setForm((current) => {
      const fabric = current.fabricRows[current.fabricRows.length - 1] || blankFabric();
      const trim = current.trimsRows[current.trimsRows.length - 1] || blankTrim();
      return {
        ...current,
        fabricRows: [...current.fabricRows, { ...fabric, id: Date.now() }],
        trimsRows: [...current.trimsRows, { ...trim, id: Date.now() + 1 }],
      };
    });
    setNote("Last fabric and trim rows repeated");
  };

  const replicateQty = () => {
    setForm((current) => {
      const source = current.fabricRows.find((row) => row.quotedCons || row.quotedPrice || row.wPercent) || current.fabricRows[0];
      if (!source) return current;
      return {
        ...current,
        fabricRows: current.fabricRows.map((row) => ({
          ...row,
          quotedCons: row.quotedCons || source.quotedCons,
          wPercent: row.wPercent || source.wPercent,
          quotedPrice: row.quotedPrice || source.quotedPrice,
          unit: row.unit || source.unit,
          actCons: row.actCons || source.actCons,
        })),
      };
    });
    setNote(form.qty ? `Consumption copied across fabric rows. Qty ${form.qty}` : "Consumption copied across fabric rows");
  };

  const importSheet = async (file: File) => {
    const XLSX = await import("xlsx");
    const book = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const sheet = book.Sheets[book.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    const cell = (row: Record<string, unknown>, names: string[]) => {
      const found = Object.entries(row).find(([key]) => names.includes(key.toLowerCase().replace(/[^a-z0-9]/g, "")));
      return found ? String(found[1] ?? "") : "";
    };
    const fabrics: QuotationFabricLine[] = [];
    const trims: QuotationTrimLine[] = [];
    rows.forEach((row, index) => {
      const fabricDesc = cell(row, ["fabricdesc", "fabricdescription", "fabric"]);
      const fabricCode = cell(row, ["fabriccode", "code"]);
      const trimsName = cell(row, ["trimsname", "trimname", "accessories", "item"]);
      if (fabricDesc || fabricCode) {
        fabrics.push({
          ...blankFabric(),
          id: Date.now() + index,
          usedPlace: cell(row, ["usedplace", "place"]),
          supplier: cell(row, ["supplier"]),
          status: cell(row, ["status"]),
          fabricCode,
          millCode: cell(row, ["millcode", "mill"]),
          fabricDesc,
          width: cell(row, ["width"]),
          actCons: cell(row, ["actcons", "actualcons"]),
          quotedCons: cell(row, ["quotedcons", "cons"]),
          wPercent: cell(row, ["wpercent", "wastage", "w"]),
          unit: cell(row, ["unit"]),
          preQtdPrice: cell(row, ["preqtdprice", "preprice"]),
          quotedPrice: cell(row, ["quotedprice", "price"]),
        });
      } else if (trimsName) {
        trims.push({
          ...blankTrim(),
          id: Date.now() + index,
          usedPlace: cell(row, ["usedplace", "place"]),
          trimsName,
          description: cell(row, ["description", "desc"]),
          supplier: cell(row, ["supplier"]),
          status: cell(row, ["status"]),
          consDz: cell(row, ["consdz", "cons"]),
          unit: cell(row, ["unit"]),
          wPercent: cell(row, ["wpercent", "wastage", "w"]),
          packUnit: cell(row, ["packunit"]),
          prePrice: cell(row, ["preprice"]),
          quotedPrice: cell(row, ["quotedprice", "price"]),
        });
      }
    });
    if (!fabrics.length && !trims.length) {
      setError("No fabric or trim columns found in the sheet.");
      toast.error("Upload failed", "No fabric or trim columns found in the sheet.");
      return;
    }
    setForm((current) => ({
      ...current,
      fabricRows: fabrics.length ? fabrics : current.fabricRows,
      trimsRows: trims.length ? trims : current.trimsRows,
    }));
    setError("");
    setNote(`Imported ${fabrics.length} fabric and ${trims.length} trim rows`);
    toast.success("Sheet imported", `${fabrics.length} fabric and ${trims.length} trim rows`);
  };

  const calculatedFabric = form.fabricRows.map((row) => {
    const quotedCons = num(row.quotedCons);
    const wPercent = num(row.wPercent);
    const quotedPrice = num(row.quotedPrice);
    const totalCons = quotedCons == null ? null : quotedCons * (1 + (wPercent ?? 0) / 100);
    const amtPcs = totalCons == null || quotedPrice == null ? null : totalCons * quotedPrice;
    const amtDz = amtPcs == null ? null : amtPcs * 12;
    return { ...row, totalCons, amtDz, amtPcs };
  });
  const totalFabricCostPcs = sum(calculatedFabric.map((row) => row.amtPcs));

  const calculatedTrims = form.trimsRows.map((row) => {
    const consDz = num(row.consDz);
    const wPercent = num(row.wPercent);
    const quotedPrice = num(row.quotedPrice);
    const totalQty = consDz == null ? null : consDz * (1 + (wPercent ?? 0) / 100);
    const amtDz = totalQty == null || quotedPrice == null ? null : totalQty * quotedPrice;
    const amtPcs = amtDz == null ? null : amtDz / 12;
    return { ...row, totalQty, amtDz, amtPcs };
  });
  const totalTrimsCostPcs = sum(calculatedTrims.map((row) => row.amtPcs));

  const financeCost = num(form.costing.financeCost);
  const financePercent = num(form.financePercent);
  const cmLaborCost = num(form.costing.cmLaborCost);
  const overheadCost = num(form.costing.overheadCost);
  const commission = num(form.costing.commission);
  const buyingOp = num(form.costing.buyingOp);
  const fob = num(form.costing.fob);
  const totalMaterialCost = sum([totalFabricCostPcs, totalTrimsCostPcs]);
  const hasCosting = [totalFabricCostPcs, totalTrimsCostPcs, financeCost, financePercent, cmLaborCost, overheadCost, commission, buyingOp, fob].some((value) => value != null);
  const material = (totalFabricCostPcs ?? 0) + (totalTrimsCostPcs ?? 0);
  const financeUsed = financeCost != null ? financeCost : financePercent != null ? (material * financePercent) / 100 : 0;
  const totalCostNet = hasCosting ? material + financeUsed + (cmLaborCost ?? 0) + (overheadCost ?? 0) : null;
  const netFob = hasCosting ? (fob ?? 0) - (commission ?? 0) - (buyingOp ?? 0) : null;
  const netCm = netFob == null || totalCostNet == null ? null : netFob - totalCostNet;
  const grossCm = netCm == null ? null : netCm + (overheadCost ?? 0);
  const marginPercent = netCm == null || !fob ? null : (netCm / fob) * 100;

  const handleSave = async (appStatus: "Draft" | "Submitted") => {
    setSaving(true);
    setError("");
    try {
      const today = new Date();
      const pad = (value: number) => String(value).padStart(2, "0");
      const qtnDt = initial?.qtnDt || `${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${String(today.getFullYear()).slice(2)}`;
      const quotationNo = form.quotationNo.trim() || `Q-${Date.now().toString(36).toUpperCase()}`;
      await onSave?.({
        id: initial?.id,
        buyerId: form.buyerId || undefined,
        qtnDt,
        delDt: form.delivery ? form.delivery.split("-").reverse().join("/").replace(/(\d{4})$/, (year) => year.slice(2)) : "",
        option: form.option,
        quotationNo,
        amend: form.revisedNo,
        ourRef: form.ourRef,
        buyer: form.buyer,
        buyerRef: form.styleNo,
        gi: form.gi,
        mp: "",
        smv: form.smv,
        pph: "",
        eff: form.machineEff,
        qty: form.qty,
        gCm: grossCm == null ? "" : grossCm.toFixed(2),
        aCm: netCm == null ? "" : netCm.toFixed(2),
        nFob: netFob == null ? "" : netFob.toFixed(2),
        fFob: fob == null ? "" : fob.toFixed(2),
        oMer: form.merchandiser,
        appStatus,
        entry: { ...form, quotationNo, qty: form.qty, offerFob: form.costing.fob },
      });
      toast.success(appStatus === "Submitted" ? "Quotation submitted" : "Quotation saved");
      onClose();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Quotation could not be saved.";
      setError(message);
      toast.error("Save failed", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-100/95 backdrop-blur-sm flex flex-col font-sans h-dvh max-h-dvh overflow-hidden">
      <div className="flex items-center justify-between bg-slate-900 text-white px-3.5 py-1.5 flex-shrink-0 shadow-sm z-10 border-b border-slate-700">
        <div className="flex items-center gap-2.5">
          <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white px-2.5 py-1 rounded text-[10.5px] font-bold transition-colors flex items-center gap-1 shadow-xs mr-1 border border-slate-600">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            <span>Back</span>
          </button>
          <div className="w-6.5 h-6.5 rounded bg-blue-600 flex items-center justify-center shadow-inner">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <h1 className="text-[12.5px] font-bold tracking-wide leading-tight">{initial ? "Edit Quotation / Costing" : "Quotation / Costing Entry"}</h1>
            <p className="text-[9px] text-slate-400 font-medium leading-tight">Create and manage detailed garment costings</p>
          </div>
        </div>
        <button onClick={onClose} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-[10.5px] font-bold flex items-center gap-1">
          <span>Close</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-auto p-2 flex flex-col xl:flex-row items-stretch gap-2 min-h-0">
        <div className="flex-1 flex flex-col min-w-0 w-full gap-1.5">
          <Section title="Quotation Header" className="mb-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-2.5 gap-y-1">
              <div className="flex items-center gap-1"><Label>User:</Label><Input value="Admin" disabled /></div>
              <div className="flex items-center gap-1">
                <Label>Type:</Label>
                <div className="flex gap-2 w-full bg-yellow-50/70 border border-slate-300 rounded px-1.5 h-[22px] items-center text-slate-950">
                  <label className="text-[9.5px] font-medium flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cf" checked={form.garmentType === "Casual"} onChange={() => setField("garmentType", "Casual")} className="accent-blue-600 scale-90" /> Casual</label>
                  <label className="text-[9.5px] font-medium flex items-center gap-0.5 cursor-pointer"><input type="radio" name="cf" checked={form.garmentType === "Formal"} onChange={() => setField("garmentType", "Formal")} className="accent-blue-600 scale-90" /> Formal</label>
                </div>
              </div>
              <div className="flex items-center gap-1"><Label>Our Ref:</Label><Input value={form.ourRef} onChange={(e: any) => setField("ourRef", e.target.value)} /></div>
              <div className="flex items-center gap-1">
                <Label>Order Type:</Label>
                <div className="flex gap-2 w-full bg-yellow-50/70 border border-slate-300 rounded px-1.5 h-[22px] items-center text-slate-950">
                  <label className="text-[9.5px] font-medium flex items-center gap-0.5 cursor-pointer"><input type="radio" name="sr" checked={form.orderType === "Regular"} onChange={() => setField("orderType", "Regular")} className="accent-blue-600 scale-90" /> Regular</label>
                  <label className="text-[9.5px] font-medium flex items-center gap-0.5 cursor-pointer"><input type="radio" name="sr" checked={form.orderType === "SMS"} onChange={() => setField("orderType", "SMS")} className="accent-blue-600 scale-90" /> SMS</label>
                </div>
              </div>
              <div className="flex items-center gap-1"><Label>Quotation No:</Label><Input value={form.quotationNo} onChange={(e: any) => setField("quotationNo", e.target.value)} className="font-bold text-blue-800" /></div>
              <div className="flex items-center gap-1"><Label>Masking No:</Label><Input value={form.maskingNo} onChange={(e: any) => setField("maskingNo", e.target.value)} /></div>
              <div className="flex items-center gap-1">
                <Label>Buyer:</Label>
                <Select value={form.buyerId || ""} onChange={(e: any) => {
                  const buyer = buyers.find((item) => item.id === e.target.value);
                  setForm((current) => ({ ...current, buyerId: e.target.value, buyer: buyer?.name || "" }));
                }}>
                  <option value=""></option>
                  {buyers.map((buyer) => <option key={buyer.id} value={buyer.id}>{buyer.name}</option>)}
                </Select>
              </div>
              <div className="flex items-center gap-1">
                <Label>Season:</Label>
                <Select value={form.season} onChange={(e: any) => setField("season", e.target.value)}>
                  <option value=""></option>
                  <option value="SUMMER">SUMMER</option>
                  <option value="WINTER">WINTER</option>
                </Select>
              </div>
              <div className="flex items-center gap-1"><Label>Option:</Label><Input value={form.option} onChange={(e: any) => setField("option", e.target.value)} /></div>
              <div className="flex items-center gap-1">
                <Label>TNA:</Label>
                <Select value={form.tna} onChange={(e: any) => setField("tna", e.target.value)}>
                  <option value=""></option>
                  <option value="Regular">Regular</option>
                </Select>
              </div>
              <div className="flex items-center gap-1"><Label>Revised No:</Label><Input value={form.revisedNo} onChange={(e: any) => setField("revisedNo", e.target.value)} /></div>
              <div className="flex items-center gap-1"><Label>Offer FOB:</Label><Input value={form.costing.fob} onChange={(e: any) => setCost("fob", e.target.value)} className="font-bold text-green-800" /></div>
              <div className="flex items-center gap-1"><Label>Merchandiser:</Label><Input value={form.merchandiser} onChange={(e: any) => setField("merchandiser", e.target.value)} /></div>
              <div className="flex items-center gap-1"><Label>A/C Holder:</Label><Input value={form.accountHolder} onChange={(e: any) => setField("accountHolder", e.target.value)} /></div>
              <div className="flex items-center gap-1"><Label>Style No:</Label><Input value={form.styleNo} onChange={(e: any) => setField("styleNo", e.target.value)} className="font-semibold" /></div>
              <div className="flex items-center gap-1"><Label>Qty:</Label><Input value={form.qty} onChange={(e: any) => setField("qty", e.target.value)} className="text-right font-semibold" /></div>
              <div className="flex items-center gap-1"><Label>G. Item:</Label><Input value={form.gi} onChange={(e: any) => setField("gi", e.target.value)} /></div>
              <div className="flex items-center gap-1"><Label>Department:</Label><Input value={form.department} onChange={(e: any) => setField("department", e.target.value)} /></div>
              <div className="flex items-center gap-1"><Label>Style/GMT Item:</Label><Input value={form.styleItem} onChange={(e: any) => setField("styleItem", e.target.value)} /></div>
              <div className="flex items-center gap-1"><Label>Delivery:</Label><Input type="date" value={form.delivery} onChange={(e: any) => setField("delivery", e.target.value)} /></div>
              <div className="flex items-center gap-1"><Label>First Delivery:</Label><Input type="date" value={form.firstDelivery} onChange={(e: any) => setField("firstDelivery", e.target.value)} /></div>
            </div>
          </Section>

          <Section
            title="Fabric Details"
            className="mb-0"
            contentClassName="p-0"
            action={
              <div className="flex gap-1">
                <button type="button" onClick={() => setForm((current) => ({ ...current, fabricRows: [...current.fabricRows, blankFabric()] }))} className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-2 py-0.5 text-[9px] font-bold rounded">Add Fabric Row</button>
                <button type="button" onClick={() => setForm((current) => ({ ...current, fabricRows: current.fabricRows.length > 1 ? current.fabricRows.slice(0, -1) : current.fabricRows }))} className="bg-white hover:bg-red-50 border border-red-200 text-red-600 px-2 py-0.5 text-[9px] font-bold rounded">Remove Last</button>
              </div>
            }
          >
            <div className="w-full max-h-[125px] overflow-auto border-t border-slate-200">
              <table className="w-full min-w-max border-collapse">
                <thead className="sticky top-0 bg-slate-200 z-10">
                  <tr>
                    <Th>Used Place</Th>
                    <Th>Supplier</Th>
                    <Th>Status</Th>
                    <Th>Fabric Code</Th>
                    <Th>Mill Code</Th>
                    <Th>Fabric Description</Th>
                    <Th className="w-12">Width</Th>
                    <Th className="w-16">Act. Cons</Th>
                    <Th className="w-16 bg-blue-50/50">Quoted Cons</Th>
                    <Th className="w-12 bg-blue-50/50">W%</Th>
                    <Th className="w-16">Total Cons</Th>
                    <Th className="w-12">Unit</Th>
                    <Th className="w-16">Pre. Qtd Price</Th>
                    <Th className="w-16 bg-green-50/50">Quoted Price</Th>
                    <Th className="w-16">Amt/DZ</Th>
                    <Th className="w-16">Amt/PCS</Th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedFabric.map((row) => (
                    <tr key={row.id}>
                      <Td><Input value={row.usedPlace} onChange={(e: any) => handleFabricChange(row.id, "usedPlace", e.target.value)} /></Td>
                      <Td><Input value={row.supplier} onChange={(e: any) => handleFabricChange(row.id, "supplier", e.target.value)} /></Td>
                      <Td><Input value={row.status} onChange={(e: any) => handleFabricChange(row.id, "status", e.target.value)} /></Td>
                      <Td><Input value={row.fabricCode} onChange={(e: any) => handleFabricChange(row.id, "fabricCode", e.target.value)} /></Td>
                      <Td><Input value={row.millCode} onChange={(e: any) => handleFabricChange(row.id, "millCode", e.target.value)} /></Td>
                      <Td><Input value={row.fabricDesc} onChange={(e: any) => handleFabricChange(row.id, "fabricDesc", e.target.value)} /></Td>
                      <Td><Input value={row.width} onChange={(e: any) => handleFabricChange(row.id, "width", e.target.value)} /></Td>
                      <Td><Input value={row.actCons} onChange={(e: any) => handleFabricChange(row.id, "actCons", e.target.value)} className="text-right" /></Td>
                      <Td><Input value={row.quotedCons} onChange={(e: any) => handleFabricChange(row.id, "quotedCons", e.target.value)} className="text-right" /></Td>
                      <Td><Input value={row.wPercent} onChange={(e: any) => handleFabricChange(row.id, "wPercent", e.target.value)} className="text-right" /></Td>
                      <Td><Input disabled value={fixed(row.totalCons, 3)} className="text-right font-bold text-slate-600" /></Td>
                      <Td><Input value={row.unit} onChange={(e: any) => handleFabricChange(row.id, "unit", e.target.value)} /></Td>
                      <Td><Input value={row.preQtdPrice} onChange={(e: any) => handleFabricChange(row.id, "preQtdPrice", e.target.value)} className="text-right" /></Td>
                      <Td><Input value={row.quotedPrice} onChange={(e: any) => handleFabricChange(row.id, "quotedPrice", e.target.value)} className="text-right text-green-800" /></Td>
                      <Td><Input disabled value={fixed(row.amtDz, 2)} className="text-right font-semibold" /></Td>
                      <Td><Input disabled value={fixed(row.amtPcs, 2)} className="text-right text-blue-800" /></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section
            title="Trims / Accessories"
            className="mb-0"
            contentClassName="p-0"
            action={
              <div className="flex gap-1">
                <button type="button" onClick={() => setForm((current) => ({ ...current, trimsRows: [...current.trimsRows, blankTrim()] }))} className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-2 py-0.5 text-[9px] font-bold rounded">Add Trim Row</button>
                <button type="button" onClick={() => setForm((current) => ({ ...current, trimsRows: current.trimsRows.length > 1 ? current.trimsRows.slice(0, -1) : current.trimsRows }))} className="bg-white hover:bg-red-50 border border-red-200 text-red-600 px-2 py-0.5 text-[9px] font-bold rounded">Remove Last</button>
              </div>
            }
          >
            <div className="w-full max-h-[125px] overflow-auto border-t border-slate-200">
              <table className="w-full min-w-max border-collapse">
                <thead className="sticky top-0 bg-slate-200 z-10">
                  <tr>
                    <Th>Used Place</Th>
                    <Th>Trims Name</Th>
                    <Th>Description</Th>
                    <Th>Supplier</Th>
                    <Th>Status</Th>
                    <Th className="w-16 bg-blue-50/50">Cons/DZ</Th>
                    <Th className="w-12">Unit</Th>
                    <Th className="w-12 bg-blue-50/50">W%</Th>
                    <Th className="w-16">Total Qty</Th>
                    <Th className="w-12">Pack Unit</Th>
                    <Th className="w-16">Pre. Price</Th>
                    <Th className="w-16 bg-green-50/50">Quoted Price</Th>
                    <Th className="w-16">Amt/DZ</Th>
                    <Th className="w-16">Amt/PCS</Th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedTrims.map((row) => (
                    <tr key={row.id}>
                      <Td><Input value={row.usedPlace} onChange={(e: any) => handleTrimsChange(row.id, "usedPlace", e.target.value)} /></Td>
                      <Td><Input value={row.trimsName} onChange={(e: any) => handleTrimsChange(row.id, "trimsName", e.target.value)} /></Td>
                      <Td><Input value={row.description} onChange={(e: any) => handleTrimsChange(row.id, "description", e.target.value)} /></Td>
                      <Td><Input value={row.supplier} onChange={(e: any) => handleTrimsChange(row.id, "supplier", e.target.value)} /></Td>
                      <Td><Input value={row.status} onChange={(e: any) => handleTrimsChange(row.id, "status", e.target.value)} /></Td>
                      <Td><Input value={row.consDz} onChange={(e: any) => handleTrimsChange(row.id, "consDz", e.target.value)} className="text-right" /></Td>
                      <Td><Input value={row.unit} onChange={(e: any) => handleTrimsChange(row.id, "unit", e.target.value)} /></Td>
                      <Td><Input value={row.wPercent} onChange={(e: any) => handleTrimsChange(row.id, "wPercent", e.target.value)} className="text-right" /></Td>
                      <Td><Input disabled value={fixed(row.totalQty, 2)} className="text-right font-bold text-slate-600" /></Td>
                      <Td><Input value={row.packUnit} onChange={(e: any) => handleTrimsChange(row.id, "packUnit", e.target.value)} /></Td>
                      <Td><Input value={row.prePrice} onChange={(e: any) => handleTrimsChange(row.id, "prePrice", e.target.value)} className="text-right" /></Td>
                      <Td><Input value={row.quotedPrice} onChange={(e: any) => handleTrimsChange(row.id, "quotedPrice", e.target.value)} className="text-right text-green-800" /></Td>
                      <Td><Input disabled value={fixed(row.amtDz, 2)} className="text-right font-semibold" /></Td>
                      <Td><Input disabled value={fixed(row.amtPcs, 3)} className="text-right text-blue-800" /></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Costing / CM Section" className="mb-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-x-2.5 gap-y-1">
              <div className="flex items-center gap-1"><Label>Finance Cost:</Label><Input value={form.costing.financeCost} onChange={(e: any) => setCost("financeCost", e.target.value)} className="text-right" /></div>
              <div className="flex items-center gap-1"><Label>Finance %:</Label><Input value={form.financePercent} onChange={(e: any) => setField("financePercent", e.target.value)} className="text-right" /></div>
              <div className="flex items-center gap-1"><Label>O/H Cost:</Label><Input value={form.costing.overheadCost} onChange={(e: any) => setCost("overheadCost", e.target.value)} className="text-right" /></div>
              <div className="flex items-center gap-1"><Label>CM/Labor Cost:</Label><Input value={form.costing.cmLaborCost} onChange={(e: any) => setCost("cmLaborCost", e.target.value)} className="text-right" /></div>
              <div className="flex items-center gap-1"><Label>Mac. Eff %:</Label><Input value={form.machineEff} onChange={(e: any) => setField("machineEff", e.target.value)} className="text-right" /></div>
              <div className="flex items-center gap-1"><Label>SMV:</Label><Input value={form.smv} onChange={(e: any) => setField("smv", e.target.value)} className="text-right" /></div>
              <div className="flex items-center gap-1"><Label>Commission:</Label><Input value={form.costing.commission} onChange={(e: any) => setCost("commission", e.target.value)} className="text-right" /></div>
              <div className="flex items-center gap-1"><Label>Buying OP:</Label><Input value={form.costing.buyingOp} onChange={(e: any) => setCost("buyingOp", e.target.value)} className="text-right" /></div>
              <div className="flex items-center gap-1"><Label>Net CM:</Label><Input readOnly value={money(netCm)} className="text-right font-bold text-blue-950 bg-blue-100" /></div>
              <div className="flex items-center gap-1"><Label>Gross CM:</Label><Input readOnly value={money(grossCm)} className="text-right font-bold text-slate-950 bg-slate-200" /></div>
              <div className="flex items-center gap-1"><Label>Net FOB:</Label><Input readOnly value={money(netFob)} className="text-right font-bold text-green-950 bg-green-100" /></div>
              <div className="flex items-center gap-1"><Label>Margin %:</Label><Input readOnly value={marginPercent == null ? "" : `${marginPercent.toFixed(2)}%`} className="text-right font-bold text-indigo-950 bg-indigo-100" /></div>
            </div>
          </Section>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-1.5">
            <Section title="Offer Details" className="mb-0">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-2.5 gap-y-1">
                <div className="flex items-center gap-1"><Label>Offer No.:</Label><Input value={form.offerNo} onChange={(e: any) => setField("offerNo", e.target.value)} /></div>
                <div className="flex items-center gap-1"><Label>FOB:</Label><Input value={form.costing.fob} onChange={(e: any) => setCost("fob", e.target.value)} className="font-bold text-green-700" /></div>
                <div className="flex items-center gap-1"><Label>Ach. CM/DZ:</Label><Input value={netCm == null ? "" : (netCm * 12).toFixed(2)} disabled className="font-bold text-blue-700" /></div>
                <div className="flex items-center gap-1"><Label>Commission:</Label><Input value={form.costing.commission} onChange={(e: any) => setCost("commission", e.target.value)} /></div>
                <div className="flex items-center gap-1">
                  <Label>Status:</Label>
                  <Select value={form.offerStatus} onChange={(e: any) => setField("offerStatus", e.target.value)}>
                    <option value=""></option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                  </Select>
                </div>
                <div className="flex items-center gap-1"><Label>Submit Date:</Label><Input type="date" value={form.submitDate} onChange={(e: any) => setField("submitDate", e.target.value)} /></div>
              </div>
            </Section>
            <Section title="Amendment / Deviation" className="mb-0 h-full flex flex-col">
              <textarea value={form.amendment} onChange={(e) => setField("amendment", e.target.value)} className="w-full flex-1 border border-slate-300 rounded bg-yellow-50/70 p-1.5 text-[10px] font-semibold text-slate-950 placeholder:text-slate-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none min-h-[50px] transition-colors" placeholder="Enter amendment details here..." />
            </Section>
          </div>
        </div>

        <div className="w-full xl:w-[245px] flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
            <div className="bg-slate-800 text-white px-2.5 py-1 font-bold text-[10.5px]">Costing Summary</div>
            <div className="p-1.5 flex flex-col gap-0.5">
              <SummaryRow label="Fabric Cost (PCS)" value={money(totalFabricCostPcs, 3)} />
              <SummaryRow label="Trims Cost (PCS)" value={money(totalTrimsCostPcs, 3)} />
              <SummaryRow label="Total Material Cost" value={money(totalMaterialCost, 3)} isBold colorClass="text-blue-700" bgClass="bg-blue-50/50 border border-blue-100" />
              <SummaryRow label="Finance Cost" value={hasCosting ? money(financeUsed) : ""} />
              <SummaryRow label="CM / Labor Cost" value={money(cmLaborCost)} colorClass="text-orange-700" />
              <SummaryRow label="Overhead Cost" value={money(overheadCost)} />
              <SummaryRow label="Total Cost (Net)" value={money(totalCostNet)} isBold isTotal colorClass="text-red-600" bgClass="bg-red-50/50 border border-red-100 mt-0.5" />
              <SummaryRow label="Commission" value={money(commission)} />
              <SummaryRow label="Buying OP" value={money(buyingOp)} />
              <SummaryRow label="Gross FOB" value={money(fob)} isBold colorClass="text-green-700" bgClass="bg-green-50/50 border border-green-100 mt-0.5" />
              <SummaryRow label="Net FOB" value={money(netFob)} isBold colorClass="text-emerald-700" bgClass="bg-emerald-50/50 border border-emerald-100" />
              <div className="mt-1 bg-indigo-50 p-2 rounded-md border border-indigo-100 flex flex-col gap-1">
                <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-indigo-900">Net CM (PCS)</span><span className="text-[13px] font-bold text-indigo-700">{money(netCm)}</span></div>
                <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-indigo-900">Margin / CM %</span><span className="text-[13px] font-bold text-indigo-700">{marginPercent == null ? "" : `${marginPercent.toFixed(2)}%`}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex flex-wrap items-center justify-between gap-1.5 flex-shrink-0 z-10 w-full">
        <button onClick={() => { setForm(initial ? entryFromQuotation(initial) : blankEntry()); setNote(""); setError(""); }} className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-2.5 py-1 text-[10px] font-bold rounded shadow-xs flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Reset
        </button>
        <div className="text-[10.5px] font-semibold">
          {error ? <span className="text-red-600">{error}</span> : <span className="text-emerald-700">{note}</span>}
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) importSheet(file).catch(() => { setError("Could not read that sheet."); toast.error("Upload failed", "Could not read that sheet."); });
          }} />
          <button type="button" onClick={() => fileRef.current?.click()} className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2.5 py-1 text-[9.5px] font-bold shadow-xs rounded">XLS Upload</button>
          <button type="button" onClick={replicateQty} className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2.5 py-1 text-[9.5px] font-bold shadow-xs rounded">Qty Replication</button>
          <button type="button" onClick={repeatLastRows} className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2.5 py-1 text-[9.5px] font-bold shadow-xs rounded">Qty Repeat</button>
          <input ref={attachRef} type="file" className="hidden" onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            setField("attachment", file.name);
            setNote(`Attached ${file.name}`);
          }} />
          <button type="button" onClick={() => attachRef.current?.click()} className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2.5 py-1 text-[9.5px] font-bold shadow-xs rounded">
            Attachment{form.attachment ? `: ${form.attachment}` : ""}
          </button>
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          <button type="button" onClick={() => window.print()} className="bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-1 text-[10px] font-bold shadow-xs rounded">View</button>
          <button type="button" onClick={() => setNote("Costing calculated")} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3.5 py-1 text-[10px] font-bold shadow-xs rounded">Calculate</button>
          <button type="button" disabled={saving} onClick={() => handleSave("Submitted")} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-3.5 py-1 text-[10px] font-bold shadow-xs rounded">
            {saving ? "Saving..." : "Submit"}
          </button>
          <button type="button" disabled={saving} onClick={() => handleSave("Draft")} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-3.5 py-1 text-[10px] font-bold shadow-xs rounded">
            {saving ? "Saving..." : "Save Quotation"}
          </button>
        </div>
      </div>
    </div>
  );
}
