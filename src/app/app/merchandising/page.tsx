"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ClipboardList,
  Download,
  Eye,
  FileSpreadsheet,
  Pencil,
  Search,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import {
  Badge,
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
  Textarea,
  sampleStatusTone,
  taStatusTone,
} from "@/components/commercial/ui";
import {
  MerchItem,
  ProductionApproval,
  SampleStatus,
  TaStatus,
  useCommercialData,
} from "@/hooks/useCommercialData";
import { exportToExcel, exportToPDF } from "@/lib/commercialExport";
import { bn } from "@/lib/bn";

const SAMPLE_STATUSES: SampleStatus[] = ["Approved", "Pending", "Rejected"];
const PRODUCTION_APPROVALS: ProductionApproval[] = ["Approved", "Pending"];
const RISK_LEVELS: TaStatus[] = ["On Track", "At Risk", "Delayed"];

export default function MerchandisingPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-400">{bn.loading}</div>}>
      <MerchandisingContent />
    </Suspense>
  );
}

function MerchandisingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") === "samples" ? "samples" : "tracking";

  const { orders, merchItems, updateMerchItem } = useCommercialData();

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [viewItem, setViewItem] = useState<MerchItem | null>(null);
  const [editItem, setEditItem] = useState<MerchItem | null>(null);
  const [form, setForm] = useState({
    fitSample: "Pending" as SampleStatus,
    ppSample: "Pending" as SampleStatus,
    techPack: "Pending" as SampleStatus,
    productionApproval: "Pending" as ProductionApproval,
    riskLevel: "On Track" as TaStatus,
    notes: "",
  });

  function setTab(tab: string) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (tab === "samples") params.set("tab", "samples");
    else params.delete("tab");
    const query = params.toString();
    router.replace(`/app/merchandising${query ? `?${query}` : ""}`, { scroll: false });
  }

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return merchItems.filter((m) => {
      const matchesSearch =
        !q || m.po.toLowerCase().includes(q) || m.buyer.toLowerCase().includes(q) || m.style.toLowerCase().includes(q);
      const matchesRisk = riskFilter === "all" || m.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [merchItems, search, riskFilter]);

  const kpis = {
    runningStyles: merchItems.length,
    atRisk: merchItems.filter((m) => m.riskLevel === "At Risk" || m.riskLevel === "Delayed").length,
    ppPending: merchItems.filter((m) => m.ppSample === "Pending").length,
    techPackApproved: merchItems.filter((m) => m.techPack === "Approved").length,
  };

  function findOrder(orderId: string) {
    return orders.find((o) => o.id === orderId);
  }

  function openEdit(item: MerchItem) {
    setForm({
      fitSample: item.fitSample,
      ppSample: item.ppSample,
      techPack: item.techPack,
      productionApproval: item.productionApproval,
      riskLevel: item.riskLevel,
      notes: item.notes,
    });
    setEditItem(item);
  }

  function handleUpdateSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editItem) return;
    updateMerchItem(editItem.id, { ...form });
    setEditItem(null);
  }

  const exportColumns =
    activeTab === "samples"
      ? [
          { header: "Buyer", key: "buyer" },
          { header: "PO", key: "po" },
          { header: "Style", key: "style" },
          { header: "Fit Sample", key: "fitSample" },
          { header: "PP Sample", key: "ppSample" },
          { header: "Production Approval", key: "productionApproval" },
          { header: "Notes", key: "notes" },
        ]
      : [
          { header: "Buyer", key: "buyer" },
          { header: "PO", key: "po" },
          { header: "Style", key: "style" },
          { header: "Tech Pack", key: "techPack" },
          { header: "Stage", key: "stage" },
          { header: "Risk", key: "riskLevel" },
          { header: "Notes", key: "notes" },
        ];

  function exportRows() {
    return filteredItems.map((m) => ({
      buyer: m.buyer,
      po: m.po,
      style: m.style,
      fitSample: m.fitSample,
      ppSample: m.ppSample,
      techPack: m.techPack,
      productionApproval: m.productionApproval,
      stage: findOrder(m.orderId)?.stage ?? "—",
      riskLevel: m.riskLevel,
      notes: m.notes,
    }));
  }

  async function handleExportPdf() {
    await exportToPDF({
      title: bn.merch.heading,
      subtitle: bn.merch.subtitle,
      columns: exportColumns,
      data: exportRows(),
      filename: `merchandising-${activeTab}`,
    });
  }

  async function handleExportExcel() {
    await exportToExcel({ columns: exportColumns, data: exportRows(), filename: `merchandising-${activeTab}`, sheetName: "Merchandising" });
  }

  return (
    <div className="flex h-full w-full flex-col overflow-auto space-y-4 p-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{bn.merch.heading}</h1>
          <p className="mt-1 text-sm text-slate-500">{bn.merch.subtitle}</p>
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
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiTile icon={<ClipboardList className="h-5 w-5" />} label={bn.merch.runningStyles} value={String(kpis.runningStyles)} tone="teal" />
        <KpiTile icon={<TriangleAlert className="h-5 w-5" />} label={bn.merch.atRisk} value={String(kpis.atRisk)} tone="red" />
        <KpiTile icon={<ClipboardList className="h-5 w-5" />} label={bn.merch.ppPending} value={String(kpis.ppPending)} tone="amber" />
        <KpiTile icon={<ShieldCheck className="h-5 w-5" />} label={bn.merch.techPackApproved} value={String(kpis.techPackApproved)} tone="green" />
      </div>

      <Tabs
        value={activeTab}
        onChange={setTab}
        items={[
          { value: "tracking", label: bn.merch.orderTracking },
          { value: "samples", label: bn.merch.sampleApproval },
        ]}
      />

      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="max-w-sm flex-1">
            <Label className="sr-only">{bn.merch.searchOrder}</Label>
            <Input icon={<Search className="h-4 w-4" />} placeholder={bn.merch.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="w-full sm:w-52">
            <Select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
              <option value="all">{bn.merch.riskLevel}: {bn.all}</option>
              {RISK_LEVELS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </div>
          <p className="ml-auto text-xs text-slate-400">
            {bn.totalRecords}: {filteredItems.length}
          </p>
        </CardContent>
      </Card>

      <Card>
        {filteredItems.length === 0 ? (
          <EmptyState message={bn.noData} />
        ) : activeTab === "samples" ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Info</TableHead>
                <TableHead>Sample Approval</TableHead>
                <TableHead>Production Approval</TableHead>
                <TableHead>{bn.notes}</TableHead>
                <TableHead className="text-right">{bn.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-semibold text-slate-800">{item.buyer}</p>
                    <p className="text-xs text-slate-500">PO: {item.po}</p>
                    <p className="text-xs text-slate-400">Style: {item.style}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-slate-600">
                      Fit Sample <Badge tone={sampleStatusTone(item.fitSample)}>{item.fitSample}</Badge>
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      PP Sample <Badge tone={sampleStatusTone(item.ppSample)}>{item.ppSample}</Badge>
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge tone={sampleStatusTone(item.productionApproval)}>{item.productionApproval}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs text-xs text-slate-500">{item.notes}</TableCell>
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
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Info</TableHead>
                <TableHead>{bn.merch.techPackStatus}</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>{bn.merch.riskLevel}</TableHead>
                <TableHead>{bn.notes}</TableHead>
                <TableHead className="text-right">{bn.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const order = findOrder(item.orderId);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-semibold text-slate-800">{item.buyer}</p>
                      <p className="text-xs text-slate-500">PO: {item.po}</p>
                      <p className="text-xs text-slate-400">Style: {item.style}</p>
                    </TableCell>
                    <TableCell>
                      <Badge tone={sampleStatusTone(item.techPack)}>{item.techPack}</Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-slate-700">{order?.stage ?? "—"}</p>
                      <p className="text-xs text-slate-400">{order?.progress ?? 0}% complete</p>
                    </TableCell>
                    <TableCell>
                      <Badge tone={taStatusTone(item.riskLevel)}>{item.riskLevel}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs text-xs text-slate-500">{item.notes}</TableCell>
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
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* View modal */}
      <Modal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title={viewItem ? `${viewItem.buyer} — ${viewItem.po}` : ""}
        description={viewItem?.style}
        size="md"
      >
        {viewItem && (
          <div className="grid grid-cols-2 gap-3">
            <ViewField label={bn.merch.fitSample} value={viewItem.fitSample} />
            <ViewField label={bn.merch.ppSample} value={viewItem.ppSample} />
            <ViewField label={bn.merch.techPackStatus} value={viewItem.techPack} />
            <ViewField label={bn.merch.productionApproval} value={viewItem.productionApproval} />
            <ViewField label={bn.merch.riskLevel} value={viewItem.riskLevel} />
            <div className="col-span-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
              <p className="text-[10px] uppercase text-slate-400">{bn.notes}</p>
              <p className="text-sm text-slate-700">{viewItem.notes}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Update modal */}
      <Modal
        open={!!editItem}
        onClose={() => setEditItem(null)}
        title={editItem ? `${bn.update} — ${editItem.po}` : ""}
        size="md"
      >
        {editItem && (
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>{bn.merch.fitSample}</Label>
                <Select value={form.fitSample} onChange={(e) => setForm({ ...form, fitSample: e.target.value as SampleStatus })}>
                  {SAMPLE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>{bn.merch.ppSample}</Label>
                <Select value={form.ppSample} onChange={(e) => setForm({ ...form, ppSample: e.target.value as SampleStatus })}>
                  {SAMPLE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>{bn.merch.techPackStatus}</Label>
                <Select value={form.techPack} onChange={(e) => setForm({ ...form, techPack: e.target.value as SampleStatus })}>
                  {SAMPLE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>{bn.merch.productionApproval}</Label>
                <Select
                  value={form.productionApproval}
                  onChange={(e) => setForm({ ...form, productionApproval: e.target.value as ProductionApproval })}
                >
                  {PRODUCTION_APPROVALS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>{bn.merch.riskLevel}</Label>
                <Select value={form.riskLevel} onChange={(e) => setForm({ ...form, riskLevel: e.target.value as TaStatus })}>
                  {RISK_LEVELS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>{bn.notes}</Label>
                <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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
      <p className="text-sm font-semibold text-slate-700">{value}</p>
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
  tone: "teal" | "red" | "amber" | "green";
}) {
  const toneClasses: Record<string, string> = {
    teal: "bg-teal-50 text-teal-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
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
