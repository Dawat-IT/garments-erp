"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Boxes,
  Download,
  Eye,
  FileSpreadsheet,
  FileStack,
  PackageCheck,
  PackageSearch,
  Pencil,
  Plus,
  Scissors,
  Search,
  TriangleAlert,
  Layers,
} from "lucide-react";
import {
  Badge,
  type BadgeTone,
  Button,
  Card,
  CardContent,
  EmptyState,
  Input,
  Label,
  Modal,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  CardHeader,
  CardTitle,
} from "@/components/commercial/ui";
import { InventoryItem, useInventoryData } from "@/hooks/useInventoryData";
import { CuttingJob, useProductionData } from "@/hooks/useProductionData";
import { useErpRecords } from "@/hooks/useErpRecords";
import { exportToExcel, exportToPDF } from "@/lib/commercialExport";
import { formatDate, formatNumber } from "@/lib/commercialFormat";
import { bn } from "@/lib/bn";
import { toast } from "@/components/ui/Toast";

function isLowStock(item: { received: number; balance: number }) {
  return item.received > 0 && item.balance / item.received < 0.35;
}

type ItemFormState = {
  category: "fabric" | "trims" | "finished_fabric";
  itemName: string;
  colorSpec: string;
  unitType: string;
  unit: string;
  orderId: string;
  received: string;
  issued: string;
  location: string;
};

const emptyForm: ItemFormState = {
  category: "fabric",
  itemName: "",
  colorSpec: "",
  unitType: "Roll",
  unit: "Kg",
  orderId: "",
  received: "0",
  issued: "0",
  location: "Unit 01 — Fabric Store",
};

function cuttingStatusTone(status: CuttingJob["status"]): BadgeTone {
  if (status === "Completed") return "green";
  if (status === "In Progress") return "blue";
  return "amber";
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-400">{bn.loading}</div>}>
      <InventoryContent />
    </Suspense>
  );
}

function InventoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: "fabric" | "trims" | "cutting" | "finished" | "ledger" | "finished_fabric" =
    tabParam === "trims" || tabParam === "cutting" || tabParam === "finished" || tabParam === "ledger" || tabParam === "finished_fabric"
      ? tabParam
      : "fabric";

  const { inventory, stockLedger, addInventoryItem, updateInventoryItem } = useInventoryData();
  const orders = useErpRecords((state) => state.data.orders);
  const { cuttingJobs } = useProductionData();

  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [viewItem, setViewItem] = useState<InventoryItem | null>(null);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<ItemFormState>(emptyForm);
  const [updateForm, setUpdateForm] = useState({ received: "0", issued: "0", location: "" });

  function setTab(tab: string) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (tab === "fabric") params.delete("tab");
    else params.set("tab", tab);
    const query = params.toString();
    router.replace(`/app/inventory${query ? `?${query}` : ""}`, { scroll: false });
  }

  const filteredInventory = useMemo(() => {
    const category = activeTab === "fabric" ? "fabric" : activeTab === "trims" ? "trims" : activeTab === "finished" ? "finished" : activeTab === "finished_fabric" ? "finished_fabric" : null;
    if (!category) return [];
    const q = search.trim().toLowerCase();
    return inventory.filter((item) => {
      if (item.category !== category) return false;
      if (!q) return true;
      return (
        item.itemName.toLowerCase().includes(q) ||
        item.poNumber.toLowerCase().includes(q) ||
        item.style.toLowerCase().includes(q) ||
        item.buyerName.toLowerCase().includes(q)
      );
    });
  }, [inventory, activeTab, search]);

  const filteredCutting = useMemo(() => {
    if (activeTab !== "cutting") return [];
    const q = search.trim().toLowerCase();
    return cuttingJobs.filter((job) => {
      if (!q) return true;
      return (
        job.poNumber.toLowerCase().includes(q) ||
        job.style.toLowerCase().includes(q) ||
        job.buyerName.toLowerCase().includes(q)
      );
    });
  }, [cuttingJobs, activeTab, search]);

  const filteredLedger = useMemo(() => {
    if (activeTab !== "ledger") return [];
    const q = search.trim().toLowerCase();
    return stockLedger.filter((entry) => !q || entry.itemName.toLowerCase().includes(q) || entry.ref.toLowerCase().includes(q));
  }, [stockLedger, activeTab, search]);

  const kpis = useMemo(() => {
    const fabric = inventory.filter((i) => i.category === "fabric");
    const trims = inventory.filter((i) => i.category === "trims");
    const finished = inventory.filter((i) => i.category === "finished");
    const finishedFabric = inventory.filter((i) => i.category === "finished_fabric");
    const lowStock = [...fabric, ...trims].filter((i) => isLowStock(i)).length;
    return {
      fabricItems: fabric.length,
      trimsItems: trims.length,
      cuttingJobs: cuttingJobs.length,
      finishedItems: finished.length,
      finishedFabric: finishedFabric.length,
      lowStock,
    };
  }, [inventory, cuttingJobs]);

  function openAdd() {
    setForm({ ...emptyForm, category: activeTab === "trims" ? "trims" : activeTab === "finished_fabric" ? "finished_fabric" : "fabric" });
    setAddOpen(true);
  }

  function openEdit(item: InventoryItem) {
    setUpdateForm({ received: String(item.received), issued: String(item.issued), location: item.location });
    setEditItem(item);
  }

  function handleAddSubmit(e: FormEvent) {
    e.preventDefault();
    const order = orders.find((o) => o.id === form.orderId);
    if (!order) return;
    addInventoryItem({
      category: form.category,
      itemName: form.itemName,
      colorSpec: form.colorSpec,
      unitType: form.unitType,
      unit: form.unit,
      orderId: order.id,
      poNumber: order.poNumber,
      buyerName: order.buyerName,
      style: order.style,
      received: Number(form.received) || 0,
      issued: Number(form.issued) || 0,
      location: form.location,
      lastUpdated: new Date().toISOString().slice(0, 10),
    });
    setAddOpen(false);
  }

  function handleUpdateSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editItem) return;
    updateInventoryItem(editItem.id, {
      received: Number(updateForm.received) || 0,
      issued: Number(updateForm.issued) || 0,
      location: updateForm.location,
      lastUpdated: new Date().toISOString().slice(0, 10),
    });
    setEditItem(null);
  }

  const tabTitle = {
    fabric: bn.inventory.fabricStock,
    trims: bn.inventory.trimsStock,
    cutting: bn.inventory.cuttingIssue,
    finished: bn.inventory.finishedGoods,
    ledger: bn.inventory.stockLedger,
    finished_fabric: "Fin. Fabric Stock",
  }[activeTab];

  function exportColumnsFor() {
    if (activeTab === "cutting") {
      return [
        { header: "Buyer", key: "buyer" },
        { header: "PO", key: "po" },
        { header: "Style", key: "style" },
        { header: "Fabric Issued", key: "fabricIssued" },
        { header: "Cut Qty", key: "cutQty" },
        { header: "Reject", key: "reject" },
        { header: "Balance", key: "balance" },
        { header: "Status", key: "status" },
      ];
    }
    if (activeTab === "ledger") {
      return [
        { header: "Item", key: "itemName" },
        { header: "Date", key: "date" },
        { header: "Ref", key: "ref" },
        { header: "In Qty", key: "inQty" },
        { header: "Out Qty", key: "outQty" },
        { header: "Balance", key: "balance" },
        { header: "Remarks", key: "remarks" },
      ];
    }
    return [
      { header: "Item", key: "itemName" },
      { header: "Buyer", key: "buyer" },
      { header: "PO", key: "po" },
      { header: "Style", key: "style" },
      { header: "Received", key: "received" },
      { header: "Issued", key: "issued" },
      { header: "Balance", key: "balance" },
      { header: "Location", key: "location" },
    ];
  }

  function exportRows() {
    if (activeTab === "cutting") {
      return filteredCutting.map((job) => ({
        buyer: job.buyerName,
        po: job.poNumber,
        style: job.style,
        fabricIssued: formatNumber(job.fabricIssued),
        cutQty: formatNumber(job.cutQty),
        reject: formatNumber(job.reject),
        balance: formatNumber(job.balance),
        status: job.status,
      }));
    }
    if (activeTab === "ledger") {
      return filteredLedger.map((entry) => ({
        itemName: entry.itemName,
        date: formatDate(entry.date),
        ref: entry.ref,
        inQty: formatNumber(entry.inQty),
        outQty: formatNumber(entry.outQty),
        balance: formatNumber(entry.balance),
        remarks: entry.remarks,
      }));
    }
    return filteredInventory.map((item) => ({
      itemName: item.itemName,
      buyer: item.buyerName,
      po: item.poNumber,
      style: item.style,
      received: formatNumber(item.received),
      issued: formatNumber(item.issued),
      balance: formatNumber(item.balance),
      location: item.location,
    }));
  }

  async function handleExportPdf() {
    await exportToPDF({
      title: `${bn.inventory.heading} — ${tabTitle}`,
      subtitle: bn.inventory.subtitle,
      columns: exportColumnsFor(),
      data: exportRows(),
      filename: `inventory-${activeTab}`,
    });
  }

  async function handleExportExcel() {
    await exportToExcel({ columns: exportColumnsFor(), data: exportRows(), filename: `inventory-${activeTab}`, sheetName: "Inventory" });
  }

  const showItemTable = activeTab === "fabric" || activeTab === "trims" || activeTab === "finished" || activeTab === "finished_fabric";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{bn.inventory.heading}</h1>
          <p className="mt-1 text-sm text-slate-500">{bn.inventory.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={handleExportExcel}>
            <FileSpreadsheet className="h-4 w-4" />
            {bn.exportExcel}
          </Button>
          <Button variant="secondary" onClick={handleExportPdf}>
            <Download className="h-4 w-4" />
            {bn.exportPdf}
          </Button>
          {(activeTab === "fabric" || activeTab === "trims" || activeTab === "finished_fabric") && (
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" />
              {bn.inventory.newItem}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <KpiTile icon={<Boxes className="h-5 w-5" />} label="Grey Fabric" value={formatNumber(kpis.fabricItems)} tone="blue" />
        <KpiTile icon={<Layers className="h-5 w-5" />} label="Fin. Fabric" value={formatNumber(kpis.finishedFabric)} tone="teal" />
        <KpiTile icon={<PackageSearch className="h-5 w-5" />} label="Trims" value={formatNumber(kpis.trimsItems)} tone="green" />
        <KpiTile icon={<PackageCheck className="h-5 w-5" />} label="Finished" value={formatNumber(kpis.finishedItems)} tone="teal" />
        <KpiTile icon={<TriangleAlert className="h-5 w-5" />} label={bn.inventory.lowStock} value={formatNumber(kpis.lowStock)} tone="red" />
      </div>

      <Tabs
        value={activeTab}
        onChange={setTab}
        items={[
          { value: "fabric", label: "Grey Fabric Stock", icon: <Boxes className="h-3.5 w-3.5" /> },
          { value: "finished_fabric", label: "Fin. Fabric Stock", icon: <Layers className="h-3.5 w-3.5" /> },
          { value: "trims", label: bn.inventory.trimsStock, icon: <PackageSearch className="h-3.5 w-3.5" /> },
          { value: "cutting", label: bn.inventory.cuttingIssue, icon: <Scissors className="h-3.5 w-3.5" /> },
          { value: "finished", label: bn.inventory.finishedGoods, icon: <PackageCheck className="h-3.5 w-3.5" /> },
          { value: "ledger", label: bn.inventory.stockLedger, icon: <FileStack className="h-3.5 w-3.5" /> },
        ]}
      />
      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="max-w-sm flex-1">
            <Label className="sr-only">Search</Label>
            <Input icon={<Search className="h-4 w-4" />} placeholder={bn.inventory.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <p className="ml-auto text-xs text-slate-400">
            {bn.totalRecords}: {activeTab === "cutting" ? filteredCutting.length : activeTab === "ledger" ? filteredLedger.length : filteredInventory.length}
          </p>
        </CardContent>
      </Card>

      {activeTab === "cutting" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CAD & Marker Efficiency</CardTitle>
              <p className="text-sm text-slate-500">Calculate Fabric Consumption (BOM) based on Marker Efficiency</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <Label>Order / Style</Label>
                  <Select>
                    <option>PO-24-001 (ST-8899)</option>
                    <option>PO-24-002 (ST-7711)</option>
                  </Select>
                </div>
                <div>
                  <Label>Marker Efficiency (%)</Label>
                  <Input type="number" defaultValue={85} />
                </div>
                <div>
                  <Label>Revised Consumption (kg/dz)</Label>
                  <Input type="text" readOnly value="2.85" className="bg-slate-50" />
                </div>
                <div>
                  <Button className="w-full" onClick={() => toast.success("BOM Updated")}>Update BOM</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cutting Issue & Bundling</CardTitle>
              <Button size="sm" onClick={() => toast.success("Fabric Issued")}>
                <Scissors className="h-4 w-4 mr-2" />
                {"Issue Fabric"}
              </Button>
            </CardHeader>
            <CardContent>
              {filteredCutting.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Info</TableHead>
                        <TableHead>Fabric Issued</TableHead>
                        <TableHead>Cut Qty</TableHead>
                        <TableHead>Reject</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>{bn.status}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCutting.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell>
                            <p className="font-semibold text-slate-800">{job.buyerName}</p>
                            <p className="text-xs text-slate-500">PO: {job.poNumber}</p>
                            <p className="text-xs text-slate-400">Style: {job.style}</p>
                          </TableCell>
                          <TableCell>{formatNumber(job.fabricIssued)} pcs</TableCell>
                          <TableCell>{formatNumber(job.cutQty)} pcs</TableCell>
                          <TableCell>{formatNumber(job.reject)} pcs</TableCell>
                          <TableCell>{formatNumber(job.balance)} pcs</TableCell>
                          <TableCell>
                            <Badge tone={cuttingStatusTone(job.status)}>{job.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <EmptyState message="No matching cutting jobs." />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab !== "cutting" && (
        <Card>
          {showItemTable ? (
            filteredInventory.length === 0 ? (
              <EmptyState message={bn.noData} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item &amp; Location</TableHead>
                    <TableHead>Order Info</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead className="text-right">{bn.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-semibold text-slate-800">{item.itemName}</p>
                        <p className="text-xs text-slate-500">{item.colorSpec}</p>
                        <p className="text-xs text-slate-400">{item.location}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-700">{item.buyerName}</p>
                        <p className="text-xs text-slate-500">PO: {item.poNumber}</p>
                        <p className="text-xs text-slate-400">Style: {item.style}</p>
                      </TableCell>
                      <TableCell>
                        {formatNumber(item.received)} {item.unit}
                      </TableCell>
                      <TableCell>
                        {formatNumber(item.issued)} {item.unit}
                      </TableCell>
                      <TableCell>
                        <Badge tone={isLowStock(item) ? "red" : "green"}>
                          {formatNumber(item.balance)} {item.unit}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="secondary" size="sm" onClick={() => setViewItem(item)}>
                            <Eye className="h-3.5 w-3.5" />
                            {bn.view}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                            <Pencil className="h-3.5 w-3.5" />
                            {bn.update}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          ) : filteredLedger.length === 0 ? (
            <EmptyState message={bn.noData} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Ref</TableHead>
                  <TableHead>In Qty</TableHead>
                  <TableHead>Out Qty</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLedger.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium text-slate-700">{entry.itemName}</TableCell>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell>{entry.ref}</TableCell>
                    <TableCell className="text-emerald-600">{entry.inQty > 0 ? `+${formatNumber(entry.inQty)}` : "—"}</TableCell>
                    <TableCell className="text-red-600">{entry.outQty > 0 ? `-${formatNumber(entry.outQty)}` : "—"}</TableCell>
                    <TableCell className="font-semibold text-slate-800">{formatNumber(entry.balance)}</TableCell>
                    <TableCell className="text-xs text-slate-500">{entry.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* Add item modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={bn.inventory.newItem} size="lg">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Category</Label>
              <Select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as "fabric" | "trims" })}>
                <option value="fabric">Fabric</option>
                <option value="trims">Trims</option>
              </Select>
            </div>
            <div>
              <Label required>{bn.procurement.selectOrder}</Label>
              <Select required value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })}>
                <option value="">— {bn.procurement.selectOrder} —</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.buyerName} — {o.poNumber} ({o.style})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label required>{bn.inventory.itemName}</Label>
              <Input required value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} placeholder="Single Jersey — Navy" />
            </div>
            <div>
              <Label>{bn.inventory.colorSpec}</Label>
              <Input value={form.colorSpec} onChange={(e) => setForm({ ...form, colorSpec: e.target.value })} placeholder="Navy / White" />
            </div>
            <div>
              <Label>Unit Type</Label>
              <Input value={form.unitType} onChange={(e) => setForm({ ...form, unitType: e.target.value })} placeholder="Roll" />
            </div>
            <div>
              <Label>Unit</Label>
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="Kg" />
            </div>
            <div>
              <Label required>{bn.inventory.received}</Label>
              <Input required type="number" min={0} value={form.received} onChange={(e) => setForm({ ...form, received: e.target.value })} placeholder="3000" />
            </div>
            <div>
              <Label>{bn.inventory.issued}</Label>
              <Input type="number" min={0} value={form.issued} onChange={(e) => setForm({ ...form, issued: e.target.value })} placeholder="0" />
            </div>
            <div className="sm:col-span-2">
              <Label required>{bn.inventory.location}</Label>
              <Input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Unit 01 — Fabric Store" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setAddOpen(false)}>
              {bn.cancel}
            </Button>
            <Button type="submit">{bn.save}</Button>
          </div>
        </form>
      </Modal>

      {/* View modal */}
      <Modal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title={viewItem ? viewItem.itemName : ""}
        description={viewItem ? `${viewItem.buyerName} · ${viewItem.poNumber} · ${viewItem.style}` : ""}
        size="md"
      >
        {viewItem && (
          <div className="grid grid-cols-2 gap-3">
            <ViewField label="Category" value={viewItem.category} />
            <ViewField label={bn.inventory.colorSpec} value={viewItem.colorSpec} />
            <ViewField label={bn.inventory.received} value={`${formatNumber(viewItem.received)} ${viewItem.unit}`} />
            <ViewField label={bn.inventory.issued} value={`${formatNumber(viewItem.issued)} ${viewItem.unit}`} />
            <ViewField label={bn.inventory.balance} value={`${formatNumber(viewItem.balance)} ${viewItem.unit}`} />
            <ViewField label={bn.inventory.location} value={viewItem.location} />
            <ViewField label="Last Updated" value={formatDate(viewItem.lastUpdated)} />
          </div>
        )}
      </Modal>

      {/* Update modal */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title={editItem ? `${bn.update} — ${editItem.itemName}` : ""} size="md">
        {editItem && (
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>{bn.inventory.received}</Label>
                <Input type="number" min={0} value={updateForm.received} onChange={(e) => setUpdateForm({ ...updateForm, received: e.target.value })} />
              </div>
              <div>
                <Label>{bn.inventory.issued}</Label>
                <Input type="number" min={0} value={updateForm.issued} onChange={(e) => setUpdateForm({ ...updateForm, issued: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>{bn.inventory.location}</Label>
                <Input value={updateForm.location} onChange={(e) => setUpdateForm({ ...updateForm, location: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setEditItem(null)}>
                {bn.cancel}
              </Button>
              <Button type="submit">{bn.save}</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

function ViewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
      <p className="text-[10px] uppercase text-slate-400">{label}</p>
      <p className="text-sm font-semibold capitalize text-slate-700">{value}</p>
    </div>
  );
}

function KpiTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "teal" | "blue" | "green" | "red";
}) {
  const toneClasses: Record<string, string> = {
    teal: "bg-teal-50 text-teal-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.03]">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-0.5 truncate text-lg font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
