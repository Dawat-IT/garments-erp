"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Banknote,
  Building2,
  Download,
  FileSpreadsheet,
  FileText,
  HandCoins,
  Landmark,
  Pencil,
  PieChart,
  Plus,
  Receipt,
  Search,
  TrendingUp,
  Trash2,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Textarea } from "@/components/ui/Textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { toast } from "@/components/ui/Toast";
import { useErpRecords } from "@/hooks/useErpRecords";
import type { Expense, ExpenseCategory, LedgerPaymentStatus, Payment, PaymentMethod, PaymentPartyType } from "@/lib/types";
import { exportLedgerStatementPdf, exportToExcel, exportToPdf, type PdfColumn } from "@/lib/export";
import { formatBdt, formatCurrency, formatDate, formatNumber } from "@/lib/utils";

const ACCOUNT_TABS = [
  { value: "buyer", label: "Buyer Ledger" },
  { value: "supplier", label: "Supplier Ledger" },
  { value: "expense", label: "Expenses" },
  { value: "payment", label: "Collections" },
  { value: "pnl", label: "Profit / Loss" },
];

const EXPENSE_CATEGORIES: ExpenseCategory[] = ["utility", "salary", "transport", "rent", "maintenance", "office", "other"];
const PAYMENT_METHODS: PaymentMethod[] = ["bank", "cash", "cheque", "mobile banking", "LC"];
const PARTY_TYPES: PaymentPartyType[] = ["buyer", "supplier", "other"];

function ledgerTone(status: LedgerPaymentStatus): "success" | "warning" | "danger" {
  if (status === "paid") return "success";
  if (status === "partial") return "warning";
  return "danger";
}

function formatPaymentAmount(p: Payment): string {
  return p.partyType === "buyer" ? formatCurrency(p.amount) : formatBdt(p.amount);
}

type ExpenseFormState = { title: string; category: ExpenseCategory; date: string; amount: string; notes: string };
const emptyExpenseForm: ExpenseFormState = { title: "", category: "utility", date: new Date().toISOString().slice(0, 10), amount: "", notes: "" };

type PaymentFormState = { party: string; partyType: PaymentPartyType; date: string; amount: string; method: PaymentMethod; reference: string };
const emptyPaymentForm: PaymentFormState = { party: "", partyType: "buyer", date: new Date().toISOString().slice(0, 10), amount: "", method: "bank", reference: "" };

export default function AccountsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-ink-400">Loading accounts…</div>}>
      <AccountsContent />
    </Suspense>
  );
}

function AccountsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = ["supplier", "expense", "payment", "pnl"].includes(tabParam ?? "") ? (tabParam as string) : "buyer";

  const { data, addExpense, updateExpense, deleteExpense, addPayment, updatePayment, deletePayment } = useErpRecords();
  const { buyerLedger, supplierLedger, expenses, payments, pnl } = data;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [partyTypeFilter, setPartyTypeFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [editExpenseRecord, setEditExpenseRecord] = useState<Expense | null>(null);
  const [expenseForm, setExpenseForm] = useState<ExpenseFormState>(emptyExpenseForm);

  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [editPaymentRecord, setEditPaymentRecord] = useState<Payment | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>(emptyPaymentForm);

  function setTab(tab: string) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (tab === "buyer") params.delete("tab");
    else params.set("tab", tab);
    const query = params.toString();
    router.replace(`/app/accounts${query ? `?${query}` : ""}`, { scroll: false });
    setSearch("");
    setStatusFilter("all");
  }

  const filteredBuyerLedger = useMemo(() => {
    const q = search.trim().toLowerCase();
    return buyerLedger.filter((b) => {
      const matchesSearch = !q || b.buyerName.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [buyerLedger, search, statusFilter]);

  const filteredSupplierLedger = useMemo(() => {
    const q = search.trim().toLowerCase();
    return supplierLedger.filter((s) => {
      const matchesSearch = !q || s.supplierName.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [supplierLedger, search, statusFilter]);

  const filteredExpenses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return expenses.filter((e) => {
      const matchesSearch = !q || e.title.toLowerCase().includes(q) || e.notes.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "all" || e.category === categoryFilter;
      const matchesFrom = !fromDate || e.date >= fromDate;
      const matchesTo = !toDate || e.date <= toDate;
      return matchesSearch && matchesCategory && matchesFrom && matchesTo;
    });
  }, [expenses, search, categoryFilter, fromDate, toDate]);

  const filteredPayments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments.filter((p) => {
      const matchesSearch = !q || p.party.toLowerCase().includes(q) || (p.reference ?? "").toLowerCase().includes(q);
      const matchesParty = partyTypeFilter === "all" || p.partyType === partyTypeFilter;
      const matchesFrom = !fromDate || p.date >= fromDate;
      const matchesTo = !toDate || p.date <= toDate;
      return matchesSearch && matchesParty && matchesFrom && matchesTo;
    });
  }, [payments, search, partyTypeFilter, fromDate, toDate]);

  const filteredPnl = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pnl.filter((p) => !q || p.buyerName.toLowerCase().includes(q) || p.poNumber.toLowerCase().includes(q) || p.style.toLowerCase().includes(q));
  }, [pnl, search]);

  const kpis = useMemo(() => {
    switch (activeTab) {
      case "supplier": {
        const totalPurchase = supplierLedger.reduce((s, r) => s + r.purchaseValue, 0);
        const totalPaid = supplierLedger.reduce((s, r) => s + r.paidValue, 0);
        const totalDue = supplierLedger.reduce((s, r) => s + r.dueValue, 0);
        const dueCount = supplierLedger.filter((r) => r.dueValue > 0).length;
        return [
          { label: "Total Purchases", value: formatBdt(totalPurchase), icon: Landmark },
          { label: "Total Paid", value: formatBdt(totalPaid), icon: HandCoins },
          { label: "Total Payable", value: formatBdt(totalDue), icon: Wallet, invert: true },
          { label: "Suppliers Due", value: formatNumber(dueCount), icon: Building2, invert: true },
        ];
      }
      case "expense": {
        const total = filteredExpenses.reduce((s, r) => s + r.amount, 0);
        const monthKey = new Date().toISOString().slice(0, 7);
        const thisMonth = expenses.filter((e) => e.date.startsWith(monthKey)).reduce((s, r) => s + r.amount, 0);
        const byCategory = new Map<string, number>();
        expenses.forEach((e) => byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount));
        const topCategory = Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
        return [
          { label: "Filtered Total", value: formatBdt(total), icon: Receipt },
          { label: "This Month", value: formatBdt(thisMonth), icon: TrendingUp, invert: true },
          { label: "Top Category", value: topCategory, icon: PieChart },
          { label: "Records", value: formatNumber(filteredExpenses.length), icon: FileText },
        ];
      }
      case "payment": {
        const buyerTotal = payments.filter((p) => p.partyType === "buyer").reduce((s, r) => s + r.amount, 0);
        const supplierTotal = payments.filter((p) => p.partyType === "supplier").reduce((s, r) => s + r.amount, 0);
        return [
          { label: "Buyer Collections", value: formatCurrency(buyerTotal), icon: Banknote },
          { label: "Supplier Payments", value: formatBdt(supplierTotal), icon: HandCoins, invert: true },
          { label: "Total Records", value: formatNumber(payments.length), icon: FileText },
          { label: "Filtered", value: formatNumber(filteredPayments.length), icon: Search },
        ];
      }
      case "pnl": {
        const revenue = pnl.reduce((s, r) => s + r.orderValue, 0);
        const cost = pnl.reduce((s, r) => s + r.totalCost, 0);
        const profit = pnl.reduce((s, r) => s + r.profit, 0);
        const avgMargin = pnl.length ? pnl.reduce((s, r) => s + r.marginPercent, 0) / pnl.length : 0;
        return [
          { label: "Total Revenue", value: formatCurrency(revenue), icon: TrendingUp },
          { label: "Total Cost", value: formatCurrency(cost), icon: Landmark, invert: true },
          { label: "Net Profit", value: formatCurrency(profit), icon: Wallet },
          { label: "Avg Margin", value: `${avgMargin.toFixed(1)}%`, icon: PieChart },
        ];
      }
      default: {
        const totalOrder = buyerLedger.reduce((s, r) => s + r.orderValue, 0);
        const totalReceived = buyerLedger.reduce((s, r) => s + r.receivedValue, 0);
        const totalDue = buyerLedger.reduce((s, r) => s + r.dueValue, 0);
        const paidCount = buyerLedger.filter((r) => r.status === "paid").length;
        return [
          { label: "Total Order Value", value: formatCurrency(totalOrder), icon: Landmark },
          { label: "Total Received", value: formatCurrency(totalReceived), icon: HandCoins },
          { label: "Total Receivable", value: formatCurrency(totalDue), icon: Wallet, invert: true },
          { label: "Buyers Fully Paid", value: formatNumber(paidCount), icon: Building2 },
        ];
      }
    }
  }, [activeTab, buyerLedger, supplierLedger, filteredExpenses, expenses, payments, filteredPayments, pnl]);

  /* ------------------------------ Expense CRUD ------------------------------ */

  function openAddExpense() {
    setExpenseForm(emptyExpenseForm);
    setAddExpenseOpen(true);
  }
  function openEditExpense(expense: Expense) {
    setExpenseForm({ title: expense.title, category: expense.category, date: expense.date, amount: String(expense.amount), notes: expense.notes });
    setEditExpenseRecord(expense);
  }
  function handleAddExpenseSubmit(e: FormEvent) {
    e.preventDefault();
    addExpense({ title: expenseForm.title, category: expenseForm.category, date: expenseForm.date, amount: Number(expenseForm.amount) || 0, notes: expenseForm.notes });
    toast.success("Expense recorded", `${expenseForm.title} added.`);
    setAddExpenseOpen(false);
  }
  function handleEditExpenseSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editExpenseRecord) return;
    updateExpense(editExpenseRecord.id, { title: expenseForm.title, category: expenseForm.category, date: expenseForm.date, amount: Number(expenseForm.amount) || 0, notes: expenseForm.notes });
    toast.success("Expense updated");
    setEditExpenseRecord(null);
  }
  function handleDeleteExpense(expense: Expense) {
    if (!window.confirm(`Delete expense "${expense.title}"?`)) return;
    deleteExpense(expense.id);
    toast.success("Expense deleted");
  }

  /* ------------------------------ Payment CRUD ------------------------------ */

  function openAddPayment() {
    setPaymentForm(emptyPaymentForm);
    setAddPaymentOpen(true);
  }
  function openEditPayment(payment: Payment) {
    setPaymentForm({ party: payment.party, partyType: payment.partyType, date: payment.date, amount: String(payment.amount), method: payment.method, reference: payment.reference ?? "" });
    setEditPaymentRecord(payment);
  }
  function handleAddPaymentSubmit(e: FormEvent) {
    e.preventDefault();
    addPayment({ party: paymentForm.party, partyType: paymentForm.partyType, date: paymentForm.date, amount: Number(paymentForm.amount) || 0, method: paymentForm.method, reference: paymentForm.reference || undefined });
    toast.success("Payment recorded", `${paymentForm.party} — ${paymentForm.method}`);
    setAddPaymentOpen(false);
  }
  function handleEditPaymentSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editPaymentRecord) return;
    updatePayment(editPaymentRecord.id, { party: paymentForm.party, partyType: paymentForm.partyType, date: paymentForm.date, amount: Number(paymentForm.amount) || 0, method: paymentForm.method, reference: paymentForm.reference || undefined });
    toast.success("Payment updated");
    setEditPaymentRecord(null);
  }
  function handleDeletePayment(payment: Payment) {
    if (!window.confirm(`Delete payment from/to ${payment.party}?`)) return;
    deletePayment(payment.id);
    toast.success("Payment deleted");
  }

  /* ------------------------------ Exports ------------------------------ */

  function exportCurrentTab() {
    if (activeTab === "buyer") {
      const headers = ["Buyer", "Order Value", "Invoice Value", "Received", "Due", "Status"];
      const rows = filteredBuyerLedger.map((r) => ({ Buyer: r.buyerName, "Order Value": formatCurrency(r.orderValue), "Invoice Value": formatCurrency(r.invoiceValue), Received: formatCurrency(r.receivedValue), Due: formatCurrency(r.dueValue), Status: r.status }));
      const columns: PdfColumn[] = headers.map((h) => ({ header: h, dataKey: h }));
      exportToPdf("Buyer Ledger", columns, rows, "buyer-ledger", { subtitle: "Dawat RMG SOFT — Accounts Receivable" });
      exportToExcel("buyer-ledger", rows, "Buyer Ledger");
    } else if (activeTab === "supplier") {
      const headers = ["Supplier", "Purchase Value", "Paid", "Due", "Status"];
      const rows = filteredSupplierLedger.map((r) => ({ Supplier: r.supplierName, "Purchase Value": formatBdt(r.purchaseValue), Paid: formatBdt(r.paidValue), Due: formatBdt(r.dueValue), Status: r.status }));
      const columns: PdfColumn[] = headers.map((h) => ({ header: h, dataKey: h }));
      exportToPdf("Supplier Ledger", columns, rows, "supplier-ledger", { subtitle: "Dawat RMG SOFT — Accounts Payable" });
      exportToExcel("supplier-ledger", rows, "Supplier Ledger");
    } else if (activeTab === "expense") {
      const headers = ["Title", "Category", "Date", "Amount", "Notes"];
      const rows = filteredExpenses.map((e) => ({ Title: e.title, Category: e.category, Date: formatDate(e.date), Amount: formatBdt(e.amount), Notes: e.notes }));
      const columns: PdfColumn[] = headers.map((h) => ({ header: h, dataKey: h }));
      exportToPdf("Expenses", columns, rows, "expenses", { subtitle: "Dawat RMG SOFT — Operating Expenses" });
      exportToExcel("expenses", rows, "Expenses");
    } else if (activeTab === "payment") {
      const headers = ["Party", "Type", "Date", "Amount", "Method", "Reference"];
      const rows = filteredPayments.map((p) => ({ Party: p.party, Type: p.partyType, Date: formatDate(p.date), Amount: formatPaymentAmount(p), Method: p.method, Reference: p.reference ?? "—" }));
      const columns: PdfColumn[] = headers.map((h) => ({ header: h, dataKey: h }));
      exportToPdf("Collections & Payments", columns, rows, "payments", { subtitle: "Dawat RMG SOFT — Cash / Bank Movements" });
      exportToExcel("payments", rows, "Payments");
    } else {
      const headers = ["Buyer", "PO Number", "Style", "Order Value", "Fabric Cost", "CM Cost", "Total Cost", "Profit", "Margin %"];
      const rows = filteredPnl.map((p) => ({
        Buyer: p.buyerName,
        "PO Number": p.poNumber,
        Style: p.style,
        "Order Value": formatCurrency(p.orderValue),
        "Fabric Cost": formatCurrency(p.fabricCost),
        "CM Cost": formatCurrency(p.cmCost),
        "Total Cost": formatCurrency(p.totalCost),
        Profit: formatCurrency(p.profit),
        "Margin %": `${p.marginPercent.toFixed(1)}%`,
      }));
      const columns: PdfColumn[] = headers.map((h) => ({ header: h, dataKey: h }));
      exportToPdf("Profit & Loss", columns, rows, "profit-loss", { subtitle: "Dawat RMG SOFT — Per-order profitability" });
      exportToExcel("profit-loss", rows, "P&L");
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeader
        eyebrow="Finance"
        title="Accounts"
        subtitle="Buyer & supplier ledgers, expenses, collections and profit & loss."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={exportCurrentTab} leftIcon={<FileSpreadsheet className="h-4 w-4" />}>
              Excel
            </Button>
            <Button variant="outline" onClick={exportCurrentTab} leftIcon={<Download className="h-4 w-4" />}>
              PDF
            </Button>
            {activeTab === "expense" && (
              <Button onClick={openAddExpense} leftIcon={<Plus className="h-4 w-4" />}>
                New Expense
              </Button>
            )}
            {activeTab === "payment" && (
              <Button onClick={openAddPayment} leftIcon={<Plus className="h-4 w-4" />}>
                New Payment
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} invertTone={kpi.invert} accent={kpi.invert ? "accent" : "teal"} />
        ))}
      </div>

      <Tabs value={activeTab} onChange={setTab} items={ACCOUNT_TABS} />

      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="max-w-sm flex-1">
            <Input leftIcon={<Search className="h-4 w-4" />} placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {(activeTab === "buyer" || activeTab === "supplier") && (
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[{ value: "all", label: "All Statuses" }, { value: "paid", label: "Paid" }, { value: "partial", label: "Partial" }, { value: "unpaid", label: "Unpaid" }]}
              />
            </div>
          )}
          {activeTab === "expense" && (
            <div className="w-full sm:w-48">
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} options={[{ value: "all", label: "All Categories" }, ...EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))]} />
            </div>
          )}
          {activeTab === "payment" && (
            <div className="w-full sm:w-44">
              <Select value={partyTypeFilter} onChange={(e) => setPartyTypeFilter(e.target.value)} options={[{ value: "all", label: "All Parties" }, ...PARTY_TYPES.map((p) => ({ value: p, label: p }))]} />
            </div>
          )}
          {(activeTab === "expense" || activeTab === "payment") && (
            <>
              <div className="w-full sm:w-40">
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div className="w-full sm:w-40">
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {activeTab === "buyer" && (
        <Card>
          {filteredBuyerLedger.length === 0 ? (
            <EmptyState title="No buyer ledger entries" subtitle="No buyers match the selected filters." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Order Value</TableHead>
                  <TableHead>Invoiced</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBuyerLedger.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-semibold text-slate-800">{entry.buyerName}</TableCell>
                    <TableCell>{formatCurrency(entry.orderValue)}</TableCell>
                    <TableCell>{formatCurrency(entry.invoiceValue)}</TableCell>
                    <TableCell>{formatCurrency(entry.receivedValue)}</TableCell>
                    <TableCell className={entry.dueValue > 0 ? "font-semibold text-amber-600" : "text-slate-500"}>{formatCurrency(entry.dueValue)}</TableCell>
                    <TableCell>
                      <Badge tone={ledgerTone(entry.status)}>{entry.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          exportLedgerStatementPdf(
                            {
                              partyLabel: "Buyer",
                              partyName: entry.buyerName,
                              rows: [
                                { label: "Order Value", value: formatCurrency(entry.orderValue) },
                                { label: "Invoice Value", value: formatCurrency(entry.invoiceValue) },
                                { label: "Received Value", value: formatCurrency(entry.receivedValue) },
                              ],
                              summary: [
                                { label: "Outstanding Due", value: formatCurrency(entry.dueValue), emphasis: true },
                                { label: "Status", value: entry.status.toUpperCase() },
                              ],
                            },
                            `buyer-statement-${entry.buyerName}`
                          )
                        }
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Statement
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {activeTab === "supplier" && (
        <Card>
          {filteredSupplierLedger.length === 0 ? (
            <EmptyState title="No supplier ledger entries" subtitle="No suppliers match the selected filters." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Purchase Value</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSupplierLedger.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-semibold text-slate-800">{entry.supplierName}</TableCell>
                    <TableCell>{formatBdt(entry.purchaseValue)}</TableCell>
                    <TableCell>{formatBdt(entry.paidValue)}</TableCell>
                    <TableCell className={entry.dueValue > 0 ? "font-semibold text-amber-600" : "text-slate-500"}>{formatBdt(entry.dueValue)}</TableCell>
                    <TableCell>
                      <Badge tone={ledgerTone(entry.status)}>{entry.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          exportLedgerStatementPdf(
                            {
                              partyLabel: "Supplier",
                              partyName: entry.supplierName,
                              rows: [
                                { label: "Purchase Value", value: formatBdt(entry.purchaseValue) },
                                { label: "Paid Value", value: formatBdt(entry.paidValue) },
                              ],
                              summary: [
                                { label: "Outstanding Due", value: formatBdt(entry.dueValue), emphasis: true },
                                { label: "Status", value: entry.status.toUpperCase() },
                              ],
                            },
                            `supplier-statement-${entry.supplierName}`
                          )
                        }
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Statement
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {activeTab === "expense" && (
        <Card>
          {filteredExpenses.length === 0 ? (
            <EmptyState title="No expenses found" subtitle="No expense records match the selected filters." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-semibold text-slate-800">{expense.title}</TableCell>
                    <TableCell>
                      <Badge tone="neutral">{expense.category}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(expense.date)}</TableCell>
                    <TableCell className="font-semibold text-slate-800">{formatBdt(expense.amount)}</TableCell>
                    <TableCell className="max-w-xs text-xs text-slate-500">{expense.notes}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => openEditExpense(expense)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteExpense(expense)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {activeTab === "payment" && (
        <Card>
          {filteredPayments.length === 0 ? (
            <EmptyState title="No payments found" subtitle="No collection / payment records match the selected filters." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Party</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-semibold text-slate-800">{payment.party}</TableCell>
                    <TableCell>
                      <Badge tone="neutral">{payment.partyType}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(payment.date)}</TableCell>
                    <TableCell className="font-semibold text-slate-800">{formatPaymentAmount(payment)}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell className="text-xs text-slate-500">{payment.reference ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => openEditPayment(payment)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeletePayment(payment)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {activeTab === "pnl" && (
        <Card>
          {filteredPnl.length === 0 ? (
            <EmptyState title="No P&L records" subtitle="No profit & loss entries match your search." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Info</TableHead>
                  <TableHead>Order Value</TableHead>
                  <TableHead>Fabric / CM Cost</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPnl.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-semibold text-slate-800">{p.buyerName}</p>
                      <p className="text-xs text-slate-500">PO: {p.poNumber}</p>
                      <p className="text-xs text-slate-400">Style: {p.style}</p>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800">{formatCurrency(p.orderValue)}</TableCell>
                    <TableCell>
                      <p className="text-xs text-slate-500">Fabric: {formatCurrency(p.fabricCost)}</p>
                      <p className="text-xs text-slate-500">CM: {formatCurrency(p.cmCost)}</p>
                    </TableCell>
                    <TableCell>{formatCurrency(p.totalCost)}</TableCell>
                    <TableCell className="font-semibold text-emerald-700">{formatCurrency(p.profit)}</TableCell>
                    <TableCell>
                      <Badge tone={p.marginPercent >= 20 ? "success" : p.marginPercent >= 10 ? "warning" : "danger"}>{p.marginPercent.toFixed(1)}%</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* Add expense modal */}
      <Modal open={addExpenseOpen} onClose={() => setAddExpenseOpen(false)} title="New Expense" size="md">
        <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
          <div>
            <Label required>Title</Label>
            <Input required value={expenseForm.title} onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })} placeholder="Electricity — Unit 01" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Category</Label>
              <Select required value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as ExpenseCategory })} options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))} />
            </div>
            <div>
              <Label required>Date</Label>
              <Input required type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label required>Amount (BDT)</Label>
              <Input required type="number" min={0} value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} placeholder="285000" />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea rows={3} value={expenseForm.notes} onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })} />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setAddExpenseOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Expense</Button>
          </div>
        </form>
      </Modal>

      {/* Edit expense modal */}
      <Modal open={!!editExpenseRecord} onClose={() => setEditExpenseRecord(null)} title={editExpenseRecord ? `Update — ${editExpenseRecord.title}` : ""} size="md">
        {editExpenseRecord && (
          <form onSubmit={handleEditExpenseSubmit} className="space-y-4">
            <div>
              <Label required>Title</Label>
              <Input required value={expenseForm.title} onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label required>Category</Label>
                <Select required value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as ExpenseCategory })} options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))} />
              </div>
              <div>
                <Label required>Date</Label>
                <Input required type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label required>Amount (BDT)</Label>
                <Input required type="number" min={0} value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea rows={3} value={expenseForm.notes} onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })} />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditExpenseRecord(null)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Add payment modal */}
      <Modal open={addPaymentOpen} onClose={() => setAddPaymentOpen(false)} title="New Payment" size="md">
        <form onSubmit={handleAddPaymentSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Party Name</Label>
              <Input required value={paymentForm.party} onChange={(e) => setPaymentForm({ ...paymentForm, party: e.target.value })} placeholder="H&M" />
            </div>
            <div>
              <Label required>Party Type</Label>
              <Select required value={paymentForm.partyType} onChange={(e) => setPaymentForm({ ...paymentForm, partyType: e.target.value as PaymentPartyType })} options={PARTY_TYPES.map((p) => ({ value: p, label: p }))} />
            </div>
            <div>
              <Label required>Date</Label>
              <Input required type="date" value={paymentForm.date} onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })} />
            </div>
            <div>
              <Label required>Amount</Label>
              <Input required type="number" min={0} value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} placeholder="185000" />
            </div>
            <div>
              <Label required>Method</Label>
              <Select required value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value as PaymentMethod })} options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))} />
            </div>
            <div>
              <Label>Reference</Label>
              <Input value={paymentForm.reference} onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })} placeholder="TT-H&M-0724" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setAddPaymentOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Payment</Button>
          </div>
        </form>
      </Modal>

      {/* Edit payment modal */}
      <Modal open={!!editPaymentRecord} onClose={() => setEditPaymentRecord(null)} title={editPaymentRecord ? `Update — ${editPaymentRecord.party}` : ""} size="md">
        {editPaymentRecord && (
          <form onSubmit={handleEditPaymentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label required>Party Name</Label>
                <Input required value={paymentForm.party} onChange={(e) => setPaymentForm({ ...paymentForm, party: e.target.value })} />
              </div>
              <div>
                <Label required>Party Type</Label>
                <Select required value={paymentForm.partyType} onChange={(e) => setPaymentForm({ ...paymentForm, partyType: e.target.value as PaymentPartyType })} options={PARTY_TYPES.map((p) => ({ value: p, label: p }))} />
              </div>
              <div>
                <Label required>Date</Label>
                <Input required type="date" value={paymentForm.date} onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })} />
              </div>
              <div>
                <Label required>Amount</Label>
                <Input required type="number" min={0} value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
              </div>
              <div>
                <Label required>Method</Label>
                <Select required value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value as PaymentMethod })} options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))} />
              </div>
              <div>
                <Label>Reference</Label>
                <Input value={paymentForm.reference} onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditPaymentRecord(null)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
