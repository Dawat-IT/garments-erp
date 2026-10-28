"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Building2,
  DollarSign,
  Download,
  FileSpreadsheet,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  Plus,
  Search,
  Users,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Label,
  Modal,
  paymentStatusTone,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  cn,
} from "@/components/commercial/ui";
import { Buyer, buyerStats, orderValue, useCommercialData } from "@/hooks/useCommercialData";
import { exportToExcel, exportToPDF } from "@/lib/commercialExport";
import { formatDate, formatMoney, formatNumber } from "@/lib/commercialFormat";
import { bn } from "@/lib/bn";

type BuyerFormState = {
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
};

const emptyForm: BuyerFormState = { name: "", company: "", phone: "", email: "", address: "" };

export default function BuyersPage() {
  const { buyers, orders, addBuyer, updateBuyer } = useCommercialData();

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<BuyerFormState>(emptyForm);

  const filteredBuyers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return buyers;
    return buyers.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.company.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q)
    );
  }, [buyers, search]);

  const selectedBuyer = buyers.find((b) => b.id === selectedId) ?? null;
  const selectedStats = selectedBuyer ? buyerStats(selectedBuyer, orders) : null;

  function openAdd() {
    setForm(emptyForm);
    setAddOpen(true);
  }

  function openEdit(buyer: Buyer) {
    setForm({
      name: buyer.name,
      company: buyer.company,
      phone: buyer.phone,
      email: buyer.email,
      address: buyer.address,
    });
    setEditOpen(true);
  }

  function handleAddSubmit(e: FormEvent) {
    e.preventDefault();
    const created = addBuyer({ ...form });
    setAddOpen(false);
    setSelectedId(created.id);
  }

  function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedBuyer) return;
    updateBuyer(selectedBuyer.id, { ...form });
    setEditOpen(false);
  }

  function exportRows() {
    return buyers.map((b) => {
      const stats = buyerStats(b, orders);
      return {
        name: b.name,
        company: b.company,
        phone: b.phone,
        email: b.email,
        address: b.address,
        totalOrders: stats.totalOrders,
        totalQty: formatNumber(stats.totalQty),
        totalValue: formatMoney(stats.totalValue),
        totalReceived: formatMoney(stats.totalReceived),
        totalDue: formatMoney(stats.totalDue),
      };
    });
  }

  const exportColumns = [
    { header: "Buyer", key: "name" },
    { header: "Company", key: "company" },
    { header: "Phone", key: "phone" },
    { header: "Email", key: "email" },
    { header: "Address", key: "address" },
    { header: "Total Orders", key: "totalOrders" },
    { header: "Total Qty", key: "totalQty" },
    { header: "Total Value", key: "totalValue" },
    { header: "Received", key: "totalReceived" },
    { header: "Due", key: "totalDue" },
  ];

  async function handleExportPdf() {
    await exportToPDF({
      title: "Buyer list",
      subtitle: "Orders & payment history summary",
      columns: exportColumns,
      data: exportRows(),
      filename: "buyer-list",
    });
  }

  async function handleExportExcel() {
    await exportToExcel({
      columns: exportColumns,
      data: exportRows(),
      filename: "buyer-list",
      sheetName: "Buyers",
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800 sm:text-xl">{bn.buyers.heading}</h1>
          <p className="text-[12px] text-slate-500">{bn.buyers.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button variant="secondary" onClick={handleExportExcel}>
            <FileSpreadsheet className="h-4 w-4" />
            {bn.exportExcel}
          </Button>
          <Button variant="secondary" onClick={handleExportPdf}>
            <Download className="h-4 w-4" />
            {bn.exportPdf}
          </Button>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" />
            {bn.buyers.newBuyer}
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <KpiTile icon={<Users className="h-4 w-4" />} label="Total buyers" value={formatNumber(buyers.length)} tone="teal" />
        <KpiTile icon={<Package className="h-4 w-4" />} label={bn.buyers.totalOrders} value={formatNumber(orders.length)} tone="blue" />
        <KpiTile
          icon={<DollarSign className="h-4 w-4" />}
          label={bn.buyers.totalValue}
          value={formatMoney(orders.reduce((s, o) => s + orderValue(o), 0))}
          tone="green"
        />
        <KpiTile
          icon={<DollarSign className="h-4 w-4" />}
          label={bn.buyers.totalDue}
          value={formatMoney(
            buyers.reduce((s, b) => s + buyerStats(b, orders).totalDue, 0)
          )}
          tone="amber"
        />
      </div>

      {/* Search */}
      <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:flex-row sm:items-center">
        <div className="max-w-md flex-1">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder={bn.buyers.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <p className="text-[11px] text-slate-400">
          {bn.totalRecords}: {filteredBuyers.length}
        </p>
      </div>

      <div className="grid min-h-0 grid-cols-1 gap-3 xl:grid-cols-5 xl:items-start">
        {/* Buyer cards */}
        <div className="xl:col-span-2 xl:max-h-[calc(100dvh-220px)] xl:overflow-y-auto">
          {filteredBuyers.length === 0 ? (
            <Card>
              <EmptyState message={bn.buyers.noBuyers} />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {filteredBuyers.map((buyer) => {
                const stats = buyerStats(buyer, orders);
                const active = buyer.id === selectedId;
                return (
                  <button
                    key={buyer.id}
                    onClick={() => setSelectedId(buyer.id)}
                    className={cn(
                      "flex flex-col rounded-lg border p-3 text-left shadow-sm transition-all",
                      active
                        ? "border-teal-500 bg-teal-50/60 ring-2 ring-teal-500/30"
                        : "border-slate-200 bg-white hover:border-teal-300 hover:shadow-md"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-teal-100 text-xs font-bold text-teal-700">
                          {buyer.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-bold text-slate-800">{buyer.name}</p>
                          <p className="truncate text-[11px] text-slate-500">{buyer.company}</p>
                        </div>
                      </div>
                      {stats.totalDue > 0 ? (
                        <Badge tone="amber">Due</Badge>
                      ) : (
                        <Badge tone="green">Paid</Badge>
                      )}
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1.5 border-t border-slate-100 pt-2 text-center">
                      <div>
                        <p className="text-[9px] uppercase text-slate-400">{bn.buyers.totalOrders}</p>
                        <p className="text-[12px] font-bold text-slate-700">{stats.totalOrders}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase text-slate-400">{bn.buyers.totalValue}</p>
                        <p className="text-[12px] font-bold text-slate-700">{formatMoney(stats.totalValue)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase text-slate-400">{bn.buyers.totalDue}</p>
                        <p className={cn("text-[12px] font-bold", stats.totalDue > 0 ? "text-amber-600" : "text-emerald-600")}>
                          {formatMoney(stats.totalDue)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="xl:col-span-3">
          {!selectedBuyer || !selectedStats ? (
            <Card className="h-full">
              <EmptyState message={bn.buyers.selectBuyerHint} icon={<Users className="h-9 w-9 text-slate-300" />} />
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{selectedBuyer.name}</CardTitle>
                    <p className="text-xs text-slate-500">{selectedBuyer.company}</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => openEdit(selectedBuyer)}>
                    <Pencil className="h-3.5 w-3.5" />
                    {bn.edit}
                  </Button>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <InfoRow icon={<Phone className="h-4 w-4" />} label={bn.buyers.phone} value={selectedBuyer.phone} />
                  <InfoRow icon={<Mail className="h-4 w-4" />} label={bn.buyers.email} value={selectedBuyer.email} />
                  <InfoRow icon={<MapPin className="h-4 w-4" />} label={bn.buyers.address} value={selectedBuyer.address} />
                  <InfoRow icon={<Building2 className="h-4 w-4" />} label="Added" value={formatDate(selectedBuyer.createdAt)} />
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <KpiTile icon={<Package className="h-5 w-5" />} label={bn.buyers.totalOrders} value={formatNumber(selectedStats.totalOrders)} tone="teal" />
                <KpiTile icon={<DollarSign className="h-5 w-5" />} label={bn.buyers.totalValue} value={formatMoney(selectedStats.totalValue)} tone="blue" />
                <KpiTile icon={<DollarSign className="h-5 w-5" />} label={bn.buyers.totalReceived} value={formatMoney(selectedStats.totalReceived)} tone="green" />
                <KpiTile icon={<DollarSign className="h-5 w-5" />} label={bn.buyers.totalDue} value={formatMoney(selectedStats.totalDue)} tone="amber" />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{bn.buyers.orderHistory}</CardTitle>
                  <p className="mt-0.5 text-xs text-slate-500">{bn.buyers.paymentHistory}</p>
                </CardHeader>
                {selectedStats.orders.length === 0 ? (
                  <EmptyState message={bn.noData} />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PO / Style</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Shipment</TableHead>
                        <TableHead>{bn.status}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedStats.orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <p className="font-semibold text-slate-800">{order.po}</p>
                            <p className="text-xs text-slate-400">{order.style}</p>
                          </TableCell>
                          <TableCell>
                            <p>{order.product}</p>
                            <p className="text-xs text-slate-400">{order.color}</p>
                          </TableCell>
                          <TableCell>{formatNumber(order.qty)} pcs</TableCell>
                          <TableCell className="font-semibold text-slate-800">
                            {formatMoney(orderValue(order))}
                          </TableCell>
                          <TableCell>{formatDate(order.shipDate)}</TableCell>
                          <TableCell>
                            <Badge tone={paymentStatusTone(order.paymentStatus)}>{order.paymentStatus}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Add buyer modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={bn.buyers.newBuyer} size="md">
        <BuyerForm
          form={form}
          setForm={setForm}
          onSubmit={handleAddSubmit}
          onCancel={() => setAddOpen(false)}
          formId="add-buyer-form"
        />
      </Modal>

      {/* Edit buyer modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`${bn.edit} — ${selectedBuyer?.name ?? ""}`} size="md">
        <BuyerForm
          form={form}
          setForm={setForm}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditOpen(false)}
          formId="edit-buyer-form"
        />
      </Modal>
    </div>
  );
}

function BuyerForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  formId,
}: {
  form: BuyerFormState;
  setForm: (f: BuyerFormState) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
  formId: string;
}) {
  return (
    <form id={formId} onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label required>{bn.buyers.name}</Label>
        <Input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="H&M"
        />
      </div>
      <div>
        <Label required>{bn.buyers.company}</Label>
        <Input
          required
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          placeholder="H & M Hennes & Mauritz GBC AB"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label required>{bn.buyers.phone}</Label>
          <Input
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+46 8 796 5500"
          />
        </div>
        <div>
          <Label required>{bn.buyers.email}</Label>
          <Input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="sourcing@buyer.com"
          />
        </div>
      </div>
      <div>
        <Label required>{bn.buyers.address}</Label>
        <Textarea
          required
          rows={3}
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Full company address"
        />
      </div>
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {bn.cancel}
        </Button>
        <Button type="submit">{bn.save}</Button>
      </div>
    </form>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase text-slate-400">{label}</p>
        <p className="truncate text-sm font-medium text-slate-700">{value}</p>
      </div>
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
  tone: "teal" | "blue" | "green" | "amber";
}) {
  const toneClasses: Record<string, string> = {
    teal: "bg-teal-50 text-teal-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm shadow-slate-900/[0.03]">
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", toneClasses[tone])}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="truncate text-[15px] font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
