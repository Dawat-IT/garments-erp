"use client";

import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import {
  Boxes,
  Building2,
  Check,
  ClipboardCheck,
  Database,
  Download,
  FileJson,
  Package,
  RefreshCcw,
  Save,
  Ship,
  ShoppingCart,
  Trash2,
  Upload,
  Users,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toast";
import { useErpRecords } from "@/hooks/useErpRecords";
import type { ErpData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

const SUMMARY_LABELS: Record<string, { label: string; icon: typeof Users }> = {
  buyers: { label: "Buyers", icon: Users },
  orders: { label: "Orders", icon: ShoppingCart },
  taTasks: { label: "T&A Tasks", icon: ClipboardCheck },
  samples: { label: "Samples", icon: Package },
  costings: { label: "Costings", icon: Wallet },
  procurements: { label: "Procurements", icon: Boxes },
  inventory: { label: "Inventory Items", icon: Boxes },
  stockLedger: { label: "Stock Ledger Entries", icon: Boxes },
  cuttingJobs: { label: "Cutting Jobs", icon: Package },
  sewingLines: { label: "Sewing Lines", icon: Package },
  finishingJobs: { label: "Finishing Jobs", icon: Package },
  packingJobs: { label: "Packing Jobs", icon: Package },
  qcRecords: { label: "QC Records", icon: ClipboardCheck },
  defects: { label: "Defects Logged", icon: ClipboardCheck },
  shipments: { label: "Shipments", icon: Ship },
  buyerLedger: { label: "Buyer Ledger Entries", icon: Wallet },
  supplierLedger: { label: "Supplier Ledger Entries", icon: Wallet },
  expenses: { label: "Expenses", icon: Wallet },
  payments: { label: "Payments", icon: Wallet },
  pnl: { label: "P&L Records", icon: Wallet },
};

export default function SettingsPage() {
  const { data, updateSettings, resetToSeed, importData, clearTransactional } = useErpRecords();
  const { settings, roles } = data;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [profileForm, setProfileForm] = useState(() => ({
    companyName: settings.companyName,
    tagline: settings.tagline,
    taglineBn: /[\u0980-\u09FF]/.test(settings.taglineBn)
      ? "From order confirmation to shipment — everything in one ERP."
      : settings.taglineBn,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    website: settings.website ?? "",
    unitsText: settings.units.join(", "),
  }));

  function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    updateSettings({
      companyName: profileForm.companyName,
      tagline: profileForm.tagline,
      taglineBn: profileForm.taglineBn,
      address: profileForm.address,
      phone: profileForm.phone,
      email: profileForm.email,
      website: profileForm.website || undefined,
      units: profileForm.unitsText
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean),
    });
    toast.success("Company profile saved", "Changes are reflected across the ERP immediately.");
    setSavingProfile(false);
  }

  function handleSelectPanel(roleId: string) {
    updateSettings({ currentPanel: roleId as typeof settings.currentPanel });
    const role = roles.find((r) => r.id === roleId);
    toast.success("Presentation panel switched", role ? `Now presenting as ${role.name}.` : undefined);
  }

  function handleExportJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `same-dawat-erp-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success("Data exported", "Full ERP dataset downloaded as a JSON backup.");
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<ErpData>;
        if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.orders) || !Array.isArray(parsed.buyers)) {
          throw new Error("This file doesn't look like a valid Dawat RMG SOFT backup.");
        }
        importData(parsed as ErpData);
        toast.success("Data imported", "ERP dataset replaced from the uploaded backup file.");
      } catch (err) {
        toast.error("Import failed", err instanceof Error ? err.message : "Could not parse the JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  async function handleResetData() {
    if (!window.confirm("Reset all ERP data to factory seed data? This cannot be undone.")) return;
    setResetting(true);
    try {
      await resetToSeed();
      toast.success("Data reset", "ERP dataset reseeded from factory defaults.");
    } finally {
      setResetting(false);
    }
  }

  function handleClearTransactional() {
    if (!window.confirm("Clear ALL transactional records (orders, production, QC, shipments, accounts)? Company profile and roles are kept.")) return;
    clearTransactional();
    toast.warning("Transactional data cleared", "All module records have been removed.");
  }

  const summaryEntries = useMemo(() => {
    return Object.entries(SUMMARY_LABELS).map(([key, meta]) => {
      const value = data[key as keyof ErpData];
      const count = Array.isArray(value) ? value.length : 0;
      return { key, ...meta, count };
    });
  }, [data]);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeader
        eyebrow="Administration"
        title="Settings"
        subtitle="Company profile, presentation panels and ERP data management."
      />

      {/* Company Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-teal-700" />
            Company Profile
          </CardTitle>
          <CardDescription>Shown across letterheads, PDF exports and the public site.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label required>Company Name</Label>
              <Input required value={profileForm.companyName} onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })} />
            </div>
            <div>
              <Label>Tagline (English)</Label>
              <Input value={profileForm.tagline} onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })} />
            </div>
            <div>
              <Label>Secondary tagline</Label>
              <Input value={profileForm.taglineBn} onChange={(e) => setProfileForm({ ...profileForm, taglineBn: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Address</Label>
              <Textarea rows={2} value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
            </div>
            <div>
              <Label>Website</Label>
              <Input value={profileForm.website} onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })} placeholder="www.samedawatgarments.com" />
            </div>
            <div>
              <Label>Factory Units (comma separated)</Label>
              <Input value={profileForm.unitsText} onChange={(e) => setProfileForm({ ...profileForm, unitsText: e.target.value })} placeholder="Unit 01, Unit 02, Cutting Section" />
            </div>
            <div className="flex items-center justify-end sm:col-span-2">
              <Button type="submit" loading={savingProfile} leftIcon={<Save className="h-4 w-4" />}>
                Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Role / Presentation Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-teal-700" />
            Role / Presentation Panel
          </CardTitle>
          <CardDescription>Choose which role&apos;s dashboard focus is presented across the ERP.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => {
              const active = role.id === settings.currentPanel;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleSelectPanel(role.id)}
                  className={`relative flex flex-col rounded-xl border p-4 text-left transition-colors ${
                    active ? "border-teal-600 bg-teal-50/70 ring-1 ring-teal-600/30" : "border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/30"
                  }`}
                >
                  {active && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-white">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  )}
                  <p className="pr-6 text-sm font-semibold text-slate-800">{role.name}</p>
                  <p className="text-xs text-slate-500">{role.name}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">{role.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {role.focusModules.slice(0, 3).map((m) => (
                      <Badge key={m} tone={active ? "success" : "neutral"} className="text-[10px]">
                        {m}
                      </Badge>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4 text-teal-700" />
            Data Management
          </CardTitle>
          <CardDescription>Backup, restore or reset the entire ERP dataset. Changes sync to MongoDB in the background.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4">
              <FileJson className="h-5 w-5 text-teal-700" />
              <p className="text-sm font-semibold text-slate-800">Export JSON</p>
              <p className="text-xs text-slate-500">Download the full dataset as a JSON backup file.</p>
              <Button variant="outline" size="sm" className="mt-1" onClick={handleExportJson} leftIcon={<Download className="h-3.5 w-3.5" />}>
                Export
              </Button>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4">
              <Upload className="h-5 w-5 text-teal-700" />
              <p className="text-sm font-semibold text-slate-800">Import JSON</p>
              <p className="text-xs text-slate-500">Restore the ERP dataset from a previously exported backup.</p>
              <Button variant="outline" size="sm" className="mt-1" onClick={handleImportClick} leftIcon={<Upload className="h-3.5 w-3.5" />}>
                Import
              </Button>
              <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50/40 p-4">
              <RefreshCcw className="h-5 w-5 text-amber-600" />
              <p className="text-sm font-semibold text-slate-800">Reset Data</p>
              <p className="text-xs text-slate-500">Reseed the entire ERP with factory demo data via the server.</p>
              <Button variant="outline" size="sm" className="mt-1 border-amber-300 text-amber-700 hover:bg-amber-100" loading={resetting} onClick={handleResetData} leftIcon={<RefreshCcw className="h-3.5 w-3.5" />}>
                Reset
              </Button>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50/40 p-4">
              <Trash2 className="h-5 w-5 text-red-600" />
              <p className="text-sm font-semibold text-slate-800">Clear Transactional Data</p>
              <p className="text-xs text-slate-500">Remove orders, production, QC, shipment and accounts records.</p>
              <Button variant="danger" size="sm" className="mt-1" onClick={handleClearTransactional} leftIcon={<Trash2 className="h-3.5 w-3.5" />}>
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Boxes className="h-4 w-4 text-teal-700" />
            System Summary
          </CardTitle>
          <CardDescription>Live record counts across every ERP module.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {summaryEntries.map((entry) => (
              <KpiCard key={entry.key} label={entry.label} value={formatNumber(entry.count)} icon={entry.icon} className="p-4" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
