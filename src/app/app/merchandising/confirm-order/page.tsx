"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMerchandisingData } from "@/hooks/useMerchandisingData";
import { useErpRecords } from "@/hooks/useErpRecords";
import type { ConfirmOrder } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";

const fieldClass = "h-5 min-w-0 w-full flex-1 border border-slate-500 bg-yellow-50 px-1 text-[10px] font-semibold text-slate-950 focus:outline-none focus:border-blue-600";

const InputL = ({ className = "", value, onChange, onLookup }: any) => (
  <div className={cn("flex items-center", className)}>
    <input type="text" value={value ?? ""} onChange={onChange} className={fieldClass} />
    <button type="button" onClick={onLookup} className="h-5 w-5 bg-slate-200 border border-l-0 border-slate-500 font-bold text-[9px] text-slate-950 hover:bg-slate-300">L</button>
  </div>
);

const Input = ({ className = "", value, onChange, readOnly = false }: any) => (
  <input type="text" value={value ?? ""} onChange={onChange} readOnly={readOnly} className={cn(fieldClass, readOnly && "bg-slate-200", className)} />
);

const Field = ({ label, children, labelWidth = "w-20" }: any) => (
  <div className="flex items-center mb-1">
    <span className={`text-[10px] font-bold text-slate-700 ${labelWidth} text-right pr-2`}>{label}</span>
    <div className="flex-1">{children}</div>
  </div>
);

const Group = ({ title, children, className = "" }: any) => (
  <div className={`border border-slate-300 rounded-sm relative pt-3 pb-1 px-2 ${className}`}>
    <span className="absolute -top-2 left-2 bg-slate-100 px-1 text-[10px] text-slate-600 font-semibold">{title}</span>
    {children}
  </div>
);

function blankOrder(): Omit<ConfirmOrder, "id"> {
  const today = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return {
    lot: "", po: "", lcContact: "", bs: "", size: "", qty: "", rate: "", value: "",
    poDate: "", orgDelDt: "", agreedDt: "", exFactDt: "", cuttableQty: "", delMode: "Sea", delPort: "",
    orderType: "New", ourRef: "", quotationNo: "", qtnQty: "", unit: "Pcs",
    buyerName: "", buyerDept: "", buyerMer: "", agent: "", agentDept: "", agentMer: "",
    merchandiser: "", accountHolder: "", buyerStyle: "", styleType: "Casual", program: "",
    gmtItem: "", sType: "", packType: "", note: "", payMode: "FOB", tenors: "", lcUp: "G Rate",
    priceType: "Single", season: "", year: String(today.getFullYear()), orderStatus: "Confirm",
    entryDt: `${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`,
    firstDel: "", confDt: "", qtdSmv: "", ieSmv: "", manpower: "", eff100: "", pphTgt: "", effPercent: "",
    commLocal: "", commForeign: "", commSpecial: "", wash: "", printOpt: "No", embroidery: "No",
    comments: "", olt: "", pcd: "", sizeOpt: "RA", bookingHold: "",
  };
}

function money(qty: string, rate: string) {
  const q = parseFloat(qty);
  const r = parseFloat(rate);
  if (!q || !r) return "";
  return (q * r).toFixed(2);
}

export default function ConfirmOrderDetails() {
  const router = useRouter();
  const {
    confirmOrders,
    quotations,
    addConfirmOrder,
    updateConfirmOrder,
    deleteConfirmOrder,
    flushConfirmOrders,
    refresh,
  } = useMerchandisingData();
  const buyers = useErpRecords((state) => state.data.buyers);
  const orders = useErpRecords((state) => state.data.orders);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lookup, setLookup] = useState<"quotation" | "buyer" | "ref" | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showAll, setShowAll] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    let alive = true;
    refresh().then((ok) => {
      if (!alive) return;
      if (ok) {
        loadedRef.current = true;
        setLoaded(true);
      } else {
        toast.error("Could not load orders");
      }
    });
    return () => {
      alive = false;
      if (saveTimer.current && loadedRef.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
        flushConfirmOrders().catch(() => {});
      }
    };
  }, [refresh, flushConfirmOrders]);

  useEffect(() => {
    if (loaded && !selectedId && confirmOrders.length) setSelectedId(confirmOrders[0].id);
  }, [loaded, confirmOrders, selectedId]);

  const selected = confirmOrders.find((row) => row.id === selectedId) || null;
  const visibleRows = showAll || !selected ? confirmOrders : confirmOrders.filter((row) => row.id === selected.id);
  const totalQty = visibleRows.reduce((sum, row) => sum + (parseFloat(row.qty) || 0), 0);
  const totalValue = visibleRows.reduce((sum, row) => sum + (parseFloat(row.value) || 0), 0);
  const qtyN = parseFloat(selected?.qty || "");
  const manpowerN = parseFloat(selected?.manpower || "");
  const pphN = parseFloat(selected?.pphTgt || "");
  const productionDays = qtyN > 0 && manpowerN > 0 && pphN > 0 ? String(Math.ceil(qtyN / (manpowerN * pphN))) : "";

  const linkedQuotation = quotations.find((row) => row.id === selected?.quotationId || (!!selected?.orderId && row.orderId === selected.orderId));
  const linkedOrder = orders.find((row) => row.id === selected?.orderId);
  const linkedBuyer = buyers.find((row) => row.id === selected?.buyerId);
  const show = (key: keyof ConfirmOrder, fallback = "") => {
    if (!selected) return "";
    const value = selected[key];
    if (value != null && String(value) !== "") return String(value);
    return fallback;
  };

  const visibleFields = (): Partial<ConfirmOrder> => ({
    ourRef: show("ourRef", selected?.bs || ""),
    quotationNo: show("quotationNo", linkedQuotation?.quotationNo || ""),
    quotationId: selected?.quotationId || linkedQuotation?.id,
    qtnQty: show("qtnQty", selected?.qty || ""),
    unit: show("unit", "Pcs"),
    buyerName: show("buyerName", linkedBuyer?.name || linkedOrder?.buyerName || ""),
    buyerDept: show("buyerDept", linkedBuyer?.country || ""),
    merchandiser: show("merchandiser", linkedQuotation?.oMer || ""),
    buyerStyle: show("buyerStyle", selected?.bs || linkedOrder?.style || ""),
    gmtItem: show("gmtItem", linkedOrder?.productName || linkedQuotation?.gi || ""),
    orderId: selected?.orderId || linkedOrder?.id,
    buyerId: selected?.buyerId || linkedBuyer?.id || linkedOrder?.buyerId,
  });

  const scheduleSave = () => {
    if (!loadedRef.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      flushConfirmOrders().catch((error) => toast.error("Save failed", error instanceof Error ? error.message : undefined));
    }, 700);
  };

  const ensureSelected = () => {
    if (selected) return selected;
    const created = addConfirmOrder(blankOrder());
    setSelectedId(created.id);
    return created;
  };

  const patch = (id: string, updates: Partial<ConfirmOrder>) => {
    if (!loadedRef.current) return;
    const next = { ...updates };
    if ("qty" in updates || "rate" in updates) {
      const row = confirmOrders.find((item) => item.id === id);
      const qty = "qty" in updates ? updates.qty || "" : row?.qty || "";
      const rate = "rate" in updates ? updates.rate || "" : row?.rate || "";
      next.value = money(qty, rate);
    }
    updateConfirmOrder(id, next);
    scheduleSave();
  };

  const setField = (field: keyof ConfirmOrder, value: string) => {
    if (!loadedRef.current) return;
    const row = ensureSelected();
    patch(row.id, { [field]: value } as Partial<ConfirmOrder>);
  };

  const saveNow = async () => {
    if (!loadedRef.current) {
      toast.warning("Orders are still loading");
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    try {
      if (selected) updateConfirmOrder(selected.id, visibleFields());
      await flushConfirmOrders();
      toast.success("Order saved");
    } catch (error) {
      toast.error("Save failed", error instanceof Error ? error.message : undefined);
    }
  };

  const applyQuotation = (quotationId: string) => {
    if (!loadedRef.current) return;
    const quotation = quotations.find((item) => item.id === quotationId);
    if (!quotation) return;
    const row = ensureSelected();
    const qty = quotation.qty || "";
    const rate = quotation.fFob || quotation.nFob || "";
    patch(row.id, {
      quotationId: quotation.id,
      quotationNo: quotation.quotationNo,
      ourRef: quotation.ourRef,
      qtnQty: qty,
      buyerId: quotation.buyerId,
      buyerName: quotation.buyer,
      buyerStyle: quotation.buyerRef,
      gmtItem: quotation.gi,
      merchandiser: quotation.oMer,
      orgDelDt: quotation.delDt,
      agreedDt: quotation.delDt,
      qty,
      rate,
      cuttableQty: qty,
      bs: quotation.ourRef,
    });
    setLookup(null);
  };

  const applyBuyer = (buyerId: string) => {
    if (!loadedRef.current) return;
    const buyer = buyers.find((item) => item.id === buyerId);
    if (!buyer) return;
    const row = ensureSelected();
    patch(row.id, { buyerId: buyer.id, buyerName: buyer.name, buyerDept: buyer.country || "" });
    setLookup(null);
  };

  const applyOrder = (orderId: string) => {
    if (!loadedRef.current) return;
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;
    const row = ensureSelected();
    patch(row.id, {
      orderId: order.id,
      ourRef: order.style,
      po: order.poNumber,
      buyerId: order.buyerId,
      buyerName: order.buyerName,
      buyerStyle: order.style,
      gmtItem: order.productName,
      bs: order.style,
      qty: String(order.quantity),
      qtnQty: String(order.quantity),
      rate: String(order.unitPrice),
      cuttableQty: String(order.quantity),
      orgDelDt: order.shipDate,
      poDate: order.orderDate,
    });
    setLookup(null);
  };

  const removeRow = async (id: string) => {
    if (!loadedRef.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    deleteConfirmOrder(id);
    if (selectedId === id) {
      const rest = confirmOrders.filter((row) => row.id !== id);
      setSelectedId(rest[0]?.id || null);
    }
    try {
      await flushConfirmOrders();
      toast.success("Order deleted");
    } catch (error) {
      toast.error("Delete failed", error instanceof Error ? error.message : undefined);
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-100 font-sans text-slate-800">
      <div className="flex shrink-0 items-center justify-between bg-slate-200 border-b border-slate-300 p-1">
        <button onClick={() => router.back()} className="bg-slate-500 hover:bg-slate-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">&larr; Back</button>
        <div className="text-[14px] font-bold text-slate-800">Confirm Order Details</div>
        <div className="text-[10px] font-bold text-slate-500 mr-1">{loaded ? "" : "Loading..."}</div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-1">
        <div className="mb-1 flex shrink-0 items-center gap-4 overflow-x-auto border border-slate-300 bg-slate-100 p-1 relative">
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <label className="flex items-center gap-1"><input type="radio" name="orderType" checked={(selected?.orderType || "New") === "New"} onChange={() => setField("orderType", "New")} /> New Order</label>
            <label className="flex items-center gap-1"><input type="radio" name="orderType" checked={selected?.orderType === "Repeat"} onChange={() => setField("orderType", "Repeat")} /> Repeat Order</label>
          </div>
          <div className="flex w-48 shrink-0 items-center gap-1">
            <span className="text-[10px] font-bold w-16 text-right">Our Ref:</span>
            <InputL value={show("ourRef", selected?.bs || "")} onChange={(e: any) => setField("ourRef", e.target.value)} onLookup={() => setLookup(lookup === "ref" ? null : "ref")} />
          </div>
          <div className="flex w-48 shrink-0 items-center gap-1">
            <span className="text-[10px] font-bold w-16 text-right">Quotation:</span>
            <InputL value={show("quotationNo", linkedQuotation?.quotationNo || "")} onChange={(e: any) => setField("quotationNo", e.target.value)} onLookup={() => setLookup(lookup === "quotation" ? null : "quotation")} />
          </div>
          <div className="flex w-32 shrink-0 items-center gap-1">
            <span className="text-[10px] font-bold w-16 text-right">Qtn Qty:</span>
            <Input value={show("qtnQty", selected?.qty || "")} onChange={(e: any) => setField("qtnQty", e.target.value)} />
          </div>
          <div className="flex w-32 shrink-0 items-center gap-1">
            <span className="text-[10px] font-bold w-12 text-right">Unit:</span>
            <Input value={show("unit", "Pcs")} onChange={(e: any) => setField("unit", e.target.value)} />
          </div>
          {lookup && (
            <div className="absolute top-8 left-24 z-30 max-h-48 w-80 overflow-auto border border-slate-400 bg-white shadow">
              {lookup === "quotation" && quotations.map((row) => (
                <button key={row.id} type="button" onClick={() => applyQuotation(row.id)} className="block w-full border-b border-slate-100 px-2 py-1 text-left text-[10px] hover:bg-blue-50">
                  {row.quotationNo} — {row.buyer} — {row.ourRef}
                </button>
              ))}
              {lookup === "buyer" && buyers.map((row) => (
                <button key={row.id} type="button" onClick={() => applyBuyer(row.id)} className="block w-full border-b border-slate-100 px-2 py-1 text-left text-[10px] hover:bg-blue-50">
                  {row.name}
                </button>
              ))}
              {lookup === "ref" && orders.map((row) => (
                <button key={row.id} type="button" onClick={() => applyOrder(row.id)} className="block w-full border-b border-slate-100 px-2 py-1 text-left text-[10px] hover:bg-blue-50">
                  {row.style} — {row.poNumber} — {row.buyerName}
                </button>
              ))}
              {!((lookup === "quotation" && quotations.length) || (lookup === "buyer" && buyers.length) || (lookup === "ref" && orders.length)) && (
                <div className="px-2 py-1 text-[10px] text-slate-500">No records</div>
              )}
            </div>
          )}
        </div>

        <div className="mb-1 flex shrink-0 items-stretch gap-1">
          <div className="flex w-1/4 flex-col gap-1">
            <Group title="Buyer">
              <Field label="Buyer" labelWidth="w-16"><InputL value={show("buyerName", linkedBuyer?.name || linkedOrder?.buyerName || "")} onChange={(e: any) => setField("buyerName", e.target.value)} onLookup={() => setLookup(lookup === "buyer" ? null : "buyer")} /></Field>
              <Field label="Byr Dept" labelWidth="w-16"><Input value={show("buyerDept", linkedBuyer?.country || "")} onChange={(e: any) => setField("buyerDept", e.target.value)} /></Field>
              <Field label="Byr Mer" labelWidth="w-16"><Input value={selected?.buyerMer} onChange={(e: any) => setField("buyerMer", e.target.value)} /></Field>
            </Group>
            <Group title="Agent">
              <Field label="Byr Agent" labelWidth="w-16"><Input value={selected?.agent} onChange={(e: any) => setField("agent", e.target.value)} /></Field>
              <Field label="Byr Dept" labelWidth="w-16"><Input value={selected?.agentDept} onChange={(e: any) => setField("agentDept", e.target.value)} /></Field>
              <Field label="Agnt Mer" labelWidth="w-16"><Input value={selected?.agentMer} onChange={(e: any) => setField("agentMer", e.target.value)} /></Field>
            </Group>
            <Group title="Merchandiser">
              <div className="flex gap-1">
                <div className="flex flex-col flex-1">
                  <span className="text-[9px] font-bold text-center">Merchandiser</span>
                  <Input value={show("merchandiser", linkedQuotation?.oMer || "")} onChange={(e: any) => setField("merchandiser", e.target.value)} />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-[9px] font-bold text-center">Account Holder</span>
                  <Input value={selected?.accountHolder} onChange={(e: any) => setField("accountHolder", e.target.value)} />
                </div>
              </div>
            </Group>
          </div>

          <div className="flex w-1/4 flex-col gap-1">
            <Group title="GMT Item" className="h-full">
              <Field label="Buyer Style" labelWidth="w-20"><Input value={show("buyerStyle", selected?.bs || linkedOrder?.style || "")} onChange={(e: any) => setField("buyerStyle", e.target.value)} /></Field>
              <Field label="T&A" labelWidth="w-20">
                <div className="flex gap-1 items-center">
                  <button type="button" onClick={() => router.push("/app/ta-calendar")} className="bg-blue-100 text-[9px] font-bold text-blue-800 px-2 py-0.5 border border-blue-300">TNA</button>
                  <label className="flex items-center gap-1 text-[9px] font-bold ml-2"><input type="radio" name="styleType" checked={(selected?.styleType || "Casual") === "Casual"} onChange={() => setField("styleType", "Casual")} /> Casual</label>
                  <label className="flex items-center gap-1 text-[9px] font-bold"><input type="radio" name="styleType" checked={selected?.styleType === "Formal"} onChange={() => setField("styleType", "Formal")} /> Formal</label>
                </div>
              </Field>
              <Field label="Program" labelWidth="w-20"><Input value={selected?.program} onChange={(e: any) => setField("program", e.target.value)} /></Field>
              <div className="flex gap-1 mb-1">
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-[10px] font-bold w-12 text-right">Gmt Item</span>
                  <Input value={show("gmtItem", linkedOrder?.productName || linkedQuotation?.gi || "")} onChange={(e: any) => setField("gmtItem", e.target.value)} />
                </div>
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-[10px] font-bold text-red-600 w-16 text-right">Qty (Pcs)</span>
                  <Input value={selected?.qty} onChange={(e: any) => setField("qty", e.target.value)} />
                </div>
              </div>
              <div className="flex gap-1 mb-1">
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-[10px] font-bold w-12 text-right">S.Type</span>
                  <Input value={selected?.sType} onChange={(e: any) => setField("sType", e.target.value)} />
                </div>
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-[10px] font-bold w-16 text-right">Pack Type</span>
                  <Input value={selected?.packType} onChange={(e: any) => setField("packType", e.target.value)} />
                </div>
              </div>
              <Field label="Note" labelWidth="w-12"><Input value={selected?.note} onChange={(e: any) => setField("note", e.target.value)} /></Field>
            </Group>
          </div>

          <div className="flex w-1/4 flex-col gap-1">
            <Group title="Delivery">
              <Field label="LOT #" labelWidth="w-16"><Input value={selected?.lot} onChange={(e: any) => setField("lot", e.target.value)} /></Field>
              <Field label="Quantity" labelWidth="w-16"><Input value={selected?.qty} onChange={(e: any) => setField("qty", e.target.value)} /></Field>
              <Field label="Del Date" labelWidth="w-16"><Input value={selected?.orgDelDt} onChange={(e: any) => setField("orgDelDt", e.target.value)} /></Field>
            </Group>
            <div className="flex gap-1 flex-1">
              <Group title="Finantial Term" className="flex-1">
                <Field label="Pay Mode" labelWidth="w-16">
                  <select value={selected?.payMode || "FOB"} onChange={(e) => setField("payMode", e.target.value)} className={fieldClass}>
                    <option>FOB</option>
                    <option>CIF</option>
                    <option>CNF</option>
                  </select>
                </Field>
                <Field label="Tenors" labelWidth="w-16"><Input value={selected?.tenors} onChange={(e: any) => setField("tenors", e.target.value)} /></Field>
                <Field label="LC UP" labelWidth="w-16">
                  <select value={selected?.lcUp || "G Rate"} onChange={(e) => setField("lcUp", e.target.value)} className={fieldClass}>
                    <option>G Rate</option>
                    <option>B Rate</option>
                  </select>
                </Field>
              </Group>
              <Group title="Rate" className="flex-1">
                <Field label="Price Type" labelWidth="w-16">
                  <select value={selected?.priceType || "Single"} onChange={(e) => setField("priceType", e.target.value)} className={fieldClass}>
                    <option>Single</option>
                    <option>Size Wise</option>
                  </select>
                </Field>
                <Field label="U.Price(Pcs)" labelWidth="w-16 text-red-600"><Input value={selected?.rate} onChange={(e: any) => setField("rate", e.target.value)} /></Field>
              </Group>
            </div>
          </div>

          <div className="flex w-1/4 flex-col gap-1">
            <Group title="Schedule">
              <div className="flex gap-1">
                <div className="flex-1">
                  <Field label="Season" labelWidth="w-16"><Input value={selected?.season} onChange={(e: any) => setField("season", e.target.value)} /></Field>
                  <Field label="Year" labelWidth="w-16"><Input value={selected?.year} onChange={(e: any) => setField("year", e.target.value)} /></Field>
                  <Field label="Ord. St." labelWidth="w-16">
                    <select value={selected?.orderStatus || "Confirm"} onChange={(e) => setField("orderStatus", e.target.value)} className={fieldClass}>
                      <option>Confirm</option>
                      <option>Pending</option>
                      <option>Hold</option>
                    </select>
                  </Field>
                </div>
                <div className="flex-1">
                  <Field label="Entry Dt" labelWidth="w-16"><Input value={selected?.entryDt} onChange={(e: any) => setField("entryDt", e.target.value)} /></Field>
                  <Field label="First Del" labelWidth="w-16"><Input value={selected?.firstDel} onChange={(e: any) => setField("firstDel", e.target.value)} /></Field>
                  <Field label="Conf. Dt" labelWidth="w-16"><Input value={selected?.confDt} onChange={(e: any) => setField("confDt", e.target.value)} /></Field>
                </div>
              </div>
            </Group>
            <Group title="Productivity">
              <div className="flex gap-1 mb-1">
                <div className="flex items-center gap-1 flex-1"><span className="text-[9px] font-bold text-red-600 w-16 text-right">Qtd. SMV</span><Input value={selected?.qtdSmv} onChange={(e: any) => setField("qtdSmv", e.target.value)} /></div>
                <div className="flex items-center gap-1 flex-1"><span className="text-[9px] font-bold w-12 text-right">IE SMV</span><Input value={selected?.ieSmv} onChange={(e: any) => setField("ieSmv", e.target.value)} /></div>
              </div>
              <div className="flex gap-1 mb-1">
                <div className="flex items-center gap-1 flex-1"><span className="text-[9px] font-bold text-red-600 w-16 text-right">Manpower</span><Input value={selected?.manpower} onChange={(e: any) => setField("manpower", e.target.value)} /></div>
                <div className="flex items-center gap-1 flex-1"><span className="text-[9px] font-bold w-12 text-right">100% Eff</span><Input value={selected?.eff100} onChange={(e: any) => setField("eff100", e.target.value)} /></div>
              </div>
              <div className="flex gap-1 mb-1">
                <div className="flex items-center gap-1 flex-1"><span className="text-[9px] font-bold text-red-600 w-16 text-right">PPH Tgt</span><Input value={selected?.pphTgt} onChange={(e: any) => setField("pphTgt", e.target.value)} /></div>
                <div className="flex items-center gap-1 flex-1"><span className="text-[9px] font-bold w-12 text-right">Eff %</span><Input value={selected?.effPercent} onChange={(e: any) => setField("effPercent", e.target.value)} /></div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold px-1 mt-1">
                <span>Production Required =</span>
                <div className="flex items-center gap-1">
                  <Input className="w-12 bg-slate-200" readOnly value={productionDays} />
                  <span>Days</span>
                </div>
              </div>
            </Group>
            <Group title="Commission %">
              <div className="flex gap-1">
                <div className="flex flex-col flex-1"><span className="text-[9px] font-bold text-center">Local</span><Input value={selected?.commLocal} onChange={(e: any) => setField("commLocal", e.target.value)} /></div>
                <div className="flex flex-col flex-1"><span className="text-[9px] font-bold text-center">Foreign</span><Input value={selected?.commForeign} onChange={(e: any) => setField("commForeign", e.target.value)} /></div>
                <div className="flex flex-col flex-1"><span className="text-[9px] font-bold text-center">Special</span><Input value={selected?.commSpecial} onChange={(e: any) => setField("commSpecial", e.target.value)} /></div>
              </div>
            </Group>
          </div>
        </div>

        <div className="mb-1 flex shrink-0 items-center gap-2 overflow-x-auto border border-slate-300 bg-slate-100 p-1">
          <div className="flex w-32 shrink-0 items-center gap-1"><span className="text-[10px] font-bold">Wash</span><Input value={selected?.wash} onChange={(e: any) => setField("wash", e.target.value)} /></div>
          <div className="flex items-center gap-1 ml-4 text-[10px] font-bold text-red-600 w-28">
            <span>Print</span>
            <select value={selected?.printOpt || "No"} onChange={(e) => setField("printOpt", e.target.value)} className={fieldClass}><option>No</option><option>Yes</option></select>
          </div>
          <div className="flex items-center gap-1 ml-4 text-[10px] font-bold text-red-600 w-32">
            <span>Embroidery</span>
            <select value={selected?.embroidery || "No"} onChange={(e) => setField("embroidery", e.target.value)} className={fieldClass}><option>No</option><option>Yes</option></select>
          </div>
          <div className="flex-1"></div>
          <button type="button" onClick={() => router.push("/app/merchandising/fabric-booking")} className="bg-slate-200 border border-slate-400 font-bold text-blue-900 text-[10px] px-3 py-0.5 hover:bg-slate-300 underline shadow-sm">Fabric Estimate</button>
          <button type="button" onClick={() => router.push("/app/merchandising/accessories-estimation")} className="bg-slate-200 border border-slate-400 font-bold text-blue-900 text-[10px] px-3 py-0.5 hover:bg-slate-300 underline shadow-sm">Access. Estimate</button>
          <button type="button" onClick={() => router.push("/app/merchandising/analysis")} className="bg-slate-200 border border-slate-400 font-bold text-blue-900 text-[10px] px-3 py-0.5 hover:bg-slate-300 shadow-sm">AC Test</button>
        </div>

        {showComments && (
          <div className="mb-1 border border-slate-300 bg-white p-1">
            <div className="mb-1 text-[10px] font-bold">Comments</div>
            <textarea value={selected?.comments || ""} onChange={(e) => setField("comments", e.target.value)} className="h-14 w-full border border-slate-500 bg-yellow-50 p-1 text-[10px] font-semibold text-slate-950 focus:outline-none" />
          </div>
        )}
        {showLegend && (
          <div className="mb-1 border border-slate-300 bg-white p-1 text-[10px]">
            BS = Buyer Style, PO = Purchase Order, Value = Qty × Rate. Save stores this order. L opens quotation, buyer, or style lookup.
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-slate-400 bg-white">
          <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-max border-collapse">
            <thead className="sticky top-0 bg-slate-200 z-10">
              <tr>
                <th className="border border-slate-300 px-1 py-1 text-[10px] w-6"></th>
                <th className="border border-slate-300 px-1 py-1 text-[10px] w-12">Lot</th>
                <th className="border border-slate-300 px-1 py-1 text-[10px] w-24">PO</th>
                <th className="border border-slate-300 px-1 py-1 text-[10px] w-32">LC / Sales Contact</th>
                <th className="border border-slate-300 px-1 py-1 text-[10px] w-12">BS</th>
                <th className="border border-slate-300 px-1 py-1 text-[10px] w-16">Size</th>
                <th className="border border-slate-300 px-1 py-1 text-[10px] w-16">Qty(Pc)</th>
                <th className="border border-slate-300 px-1 py-1 text-[10px] w-12">Rate</th>
                <th className="border border-slate-300 px-1 py-1 text-[10px] w-16">Value</th>
                <th className="border border-slate-300 px-1 py-1 text-[10px] w-16">PO Date</th>
                <th className="border border-slate-300 px-1 py-1 text-[10px] text-red-600 w-16">Org Del Dt</th>
                <th className="border border-slate-300 px-1 py-1 text-[10px] text-red-600 w-16">Agreed Dt</th>
                <th className="border border-slate-300 px-1 py-1 text-[10px] w-16">(-) Ex-Fact Dt</th>
                <th className="border border-slate-300 px-1 py-1 text-[10px] w-16">(%) Cuttable Qty</th>
                <th className="border border-slate-300 px-1 py-1 text-[10px] w-16">Del Mode</th>
                <th className="border border-slate-300 px-1 py-1 text-[10px] w-16">Del. Port</th>
                <th className="border border-slate-300 px-1 py-1 text-[10px] w-12">Opt</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.id} onClick={() => setSelectedId(row.id)} className={selectedId === row.id ? "bg-blue-100" : ""}>
                  <td className="border border-slate-300 text-center"><button type="button" onClick={(event) => { event.stopPropagation(); removeRow(row.id); }} className="text-blue-700 font-bold text-[10px]">X</button></td>
                  <td className="border border-slate-300"><Input value={row.lot} onChange={(e: any) => patch(row.id, { lot: e.target.value })} /></td>
                  <td className="border border-slate-300"><Input value={row.po} onChange={(e: any) => patch(row.id, { po: e.target.value })} /></td>
                  <td className="border border-slate-300"><Input value={row.lcContact} onChange={(e: any) => patch(row.id, { lcContact: e.target.value })} /></td>
                  <td className="border border-slate-300"><Input value={row.bs} onChange={(e: any) => patch(row.id, { bs: e.target.value })} /></td>
                  <td className="border border-slate-300"><Input value={row.size} onChange={(e: any) => patch(row.id, { size: e.target.value })} /></td>
                  <td className="border border-slate-300"><Input value={row.qty} onChange={(e: any) => patch(row.id, { qty: e.target.value })} /></td>
                  <td className="border border-slate-300"><Input value={row.rate} onChange={(e: any) => patch(row.id, { rate: e.target.value })} /></td>
                  <td className="border border-slate-300"><Input value={row.value} readOnly /></td>
                  <td className="border border-slate-300"><Input value={row.poDate} onChange={(e: any) => patch(row.id, { poDate: e.target.value })} /></td>
                  <td className="border border-slate-300"><Input value={row.orgDelDt} onChange={(e: any) => patch(row.id, { orgDelDt: e.target.value })} /></td>
                  <td className="border border-slate-300"><Input value={row.agreedDt} onChange={(e: any) => patch(row.id, { agreedDt: e.target.value })} /></td>
                  <td className="border border-slate-300"><Input value={row.exFactDt} onChange={(e: any) => patch(row.id, { exFactDt: e.target.value })} /></td>
                  <td className="border border-slate-300"><Input value={row.cuttableQty} onChange={(e: any) => patch(row.id, { cuttableQty: e.target.value })} /></td>
                  <td className="border border-slate-300">
                    <select value={row.delMode || ""} onChange={(e) => patch(row.id, { delMode: e.target.value })} className={fieldClass}>
                      <option value=""></option>
                      <option>Sea</option>
                      <option>Air</option>
                    </select>
                  </td>
                  <td className="border border-slate-300"><Input value={row.delPort} onChange={(e: any) => patch(row.id, { delPort: e.target.value })} /></td>
                  <td className="border border-slate-300 text-center">
                    <button type="button" onClick={(event) => { event.stopPropagation(); const size = window.prompt("Size", row.size || ""); if (size != null) patch(row.id, { size }); }} className="text-blue-700 font-bold text-[10px]">Size</button>
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-100 font-bold">
                <td colSpan={6} className="text-right text-[10px] pr-2 py-1 border border-slate-300">Total:</td>
                <td className="border border-slate-300 bg-white"><Input readOnly value={totalQty > 0 ? String(totalQty) : ""} /></td>
                <td className="border border-slate-300"></td>
                <td className="border border-slate-300 bg-white"><Input readOnly value={totalValue > 0 ? totalValue.toFixed(2) : ""} /></td>
                <td colSpan={7} className="border border-slate-300"></td>
                <td className="border border-slate-300 text-center">
                  <button type="button" onClick={() => selected && patch(selected.id, { qty: "", rate: "", value: "", size: "", cuttableQty: "" })} className="text-red-600 font-bold text-[10px]">Clr</button>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>

        <div className="mt-1 flex shrink-0 items-center gap-4 overflow-x-auto px-2 py-1 text-[10px] font-bold">
          <div>No of PO: <span className="text-green-700 ml-1">{visibleRows.length}</span></div>
          <button type="button" onClick={() => setShowComments((open) => !open)} className="bg-blue-200 text-blue-900 px-2 py-0.5 border border-slate-300">Comments:</button>
          <div className="flex-1"></div>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">OLT</span>
            <input value={selected?.olt || ""} onChange={(e) => setField("olt", e.target.value)} className="w-12 h-5 border border-slate-500 bg-yellow-50 px-1 text-[10px] font-semibold text-slate-950" />
            <span className="text-slate-500 ml-2">PCD</span>
            <input value={selected?.pcd || ""} onChange={(e) => setField("pcd", e.target.value)} className="w-16 h-5 border border-slate-500 bg-yellow-50 px-1 text-[10px] font-semibold text-slate-950" />
          </div>
          <div className="flex items-center gap-2 ml-4">
            <label className="flex items-center gap-1"><input type="radio" name="sizeOpt" checked={selected?.sizeOpt === "Size"} onChange={() => setField("sizeOpt", "Size")} /> Size Wise</label>
            <label className="flex items-center gap-1"><input type="radio" name="sizeOpt" checked={selected?.sizeOpt === "In-Seam"} onChange={() => setField("sizeOpt", "In-Seam")} /> In-Seam Wise</label>
            <label className="flex items-center gap-1 text-green-700"><input type="radio" name="sizeOpt" checked={(selected?.sizeOpt || "RA") === "RA"} onChange={() => setField("sizeOpt", "RA")} /> RA...</label>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-t border-slate-300 bg-slate-200 px-2 py-1.5 text-[11px] font-bold">
        <button type="button" onClick={() => setShowLegend((open) => !open)} className="bg-slate-100 border border-slate-400 hover:bg-slate-200 px-4 py-1 shadow-sm text-blue-900">Legend</button>
        <label className="bg-slate-100 border border-slate-400 hover:bg-slate-200 px-4 py-1 shadow-sm text-blue-900 cursor-pointer">
          Attachment{selected?.attachment ? `: ${selected.attachment}` : ""}
          <input type="file" className="hidden" onChange={(e) => setField("attachment", e.target.files?.[0]?.name || "")} />
        </label>
        <button type="button" onClick={() => window.print()} className="bg-slate-100 border border-slate-400 hover:bg-slate-200 px-4 py-1 shadow-sm text-blue-900">Reports</button>
        <button type="button" onClick={() => router.push("/app/orders")} className="bg-slate-100 border border-slate-400 hover:bg-slate-200 px-4 py-1 shadow-sm text-blue-900 underline">View Order</button>
        <label className="flex items-center gap-1 ml-2 text-[10px] text-slate-800"><input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> All Data</label>
        <div className="flex-1 text-center">
          <button type="button" onClick={() => setField("bookingHold", selected?.bookingHold === "ABH" ? "" : "ABH")} className={`border border-slate-400 px-6 py-1 shadow-sm mr-2 ${selected?.bookingHold === "ABH" ? "bg-amber-200" : "bg-slate-200"}`}>ABH</button>
          <button type="button" onClick={() => setField("bookingHold", selected?.bookingHold === "FBH" ? "" : "FBH")} className={`border border-slate-400 px-6 py-1 shadow-sm ${selected?.bookingHold === "FBH" ? "bg-amber-200" : "bg-slate-200"}`}>FBH</button>
        </div>
        <button type="button" disabled={!selectedId} onClick={() => selectedId && removeRow(selectedId)} className="bg-slate-100 border border-slate-400 hover:bg-slate-200 px-6 py-1 shadow-sm text-blue-900 underline disabled:text-slate-400">Delete</button>
        <button type="button" onClick={() => { if (!selected) { toast.warning("Select an order first"); return; } updateConfirmOrder(selected.id, visibleFields()); scheduleSave(); toast.info("Editing", "Change the fields, then Save"); }} className="bg-slate-100 border border-slate-400 hover:bg-slate-200 px-6 py-1 shadow-sm text-blue-900 underline">Edit</button>
        <button type="button" disabled={!loaded} onClick={() => { const created = addConfirmOrder(blankOrder()); setSelectedId(created.id); scheduleSave(); toast.success("New order added"); }} className="bg-slate-100 border border-slate-400 hover:bg-slate-200 px-6 py-1 shadow-sm text-blue-900 underline disabled:text-slate-400">New</button>
        <button type="button" onClick={saveNow} className="bg-emerald-600 border border-emerald-700 hover:bg-emerald-700 px-6 py-1 shadow-sm text-white underline">Save</button>
      </div>
    </div>
  );
}
