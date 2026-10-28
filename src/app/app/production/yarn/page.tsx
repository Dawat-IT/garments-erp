"use client";

import { useState } from "react";
import { Layers, PackageCheck, Truck, Search, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Input,
  Label,
  Button,
  Tabs,
  Modal,
  Select
} from "@/components/commercial/ui";
import { formatNumber, formatDate } from "@/lib/commercialFormat";
import { bn } from "@/lib/bn";
import { toast } from "@/components/ui/Toast";

const mockYarnStock = [
  { id: "YRN-101", count: "30s", composition: "100% Cotton", brand: "Square", lot: "L-2026-A1", qty: 5000, status: "Available" },
  { id: "YRN-102", count: "24s", composition: "CVC", brand: "Envoy", lot: "L-2026-B3", qty: 2500, status: "Low Stock" },
  { id: "YRN-103", count: "20s", composition: "100% Cotton", brand: "DBL", lot: "L-2026-C2", qty: 8000, status: "Available" },
];

const mockYarnIssue = [
  { id: "YI-001", program: "KP-1024", date: "2026-09-10", count: "30s", qty: 1500, machine: "M-01", status: "Issued" },
  { id: "YI-002", program: "KP-1025", date: "2026-09-09", count: "24s", qty: 800, machine: "M-03", status: "Pending" },
];

export default function YarnStorePage() {
  const [activeTab, setActiveTab] = useState("stock");
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Yarn Store</h1>
          <p className="mt-1 text-sm text-slate-500">Manage Yarn Inventory, Procurement, and Issue to Knitting</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Receive Yarn
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        items={[
          { value: "stock", label: "Yarn Stock", icon: <Layers className="h-4 w-4" /> },
          { value: "issue", label: "Yarn Issue", icon: <Truck className="h-4 w-4" /> },
        ]}
      />

      {activeTab === "stock" && (
        <Card>
          <CardHeader>
            <CardTitle>Yarn Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Yarn ID</TableHead>
                  <TableHead>Count & Composition</TableHead>
                  <TableHead>Brand & Lot No</TableHead>
                  <TableHead>Available Qty (kg)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockYarnStock.map(y => (
                  <TableRow key={y.id}>
                    <TableCell className="font-semibold text-slate-700">{y.id}</TableCell>
                    <TableCell>
                      <p className="font-semibold">{y.count}</p>
                      <p className="text-xs text-slate-500">{y.composition}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold">{y.brand}</p>
                      <p className="text-xs text-slate-500">Lot: {y.lot}</p>
                    </TableCell>
                    <TableCell>{formatNumber(y.qty)}</TableCell>
                    <TableCell>
                      <Badge tone={y.status === "Available" ? "green" : "amber"}>{y.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => toast.success("Yarn issued to floor")}>Issue to Floor</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === "issue" && (
        <Card>
          <CardHeader>
            <CardTitle>Yarn Issue Log</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issue ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Knitting Program</TableHead>
                  <TableHead>Yarn Info</TableHead>
                  <TableHead>Machine</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockYarnIssue.map(y => (
                  <TableRow key={y.id}>
                    <TableCell className="font-semibold text-slate-700">{y.id}</TableCell>
                    <TableCell>{y.date}</TableCell>
                    <TableCell>{y.program}</TableCell>
                    <TableCell>
                      <p className="text-sm">{y.count}</p>
                      <p className="text-xs text-slate-500">Qty: {formatNumber(y.qty)} kg</p>
                    </TableCell>
                    <TableCell>{y.machine}</TableCell>
                    <TableCell>
                      <Badge tone={y.status === "Issued" ? "blue" : "amber"}>{y.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Receive Yarn" size="md">
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Yarn Count</Label>
              <Input placeholder="e.g. 30s" />
            </div>
            <div>
              <Label required>Composition</Label>
              <Input placeholder="e.g. 100% Cotton" />
            </div>
            <div>
              <Label required>Brand</Label>
              <Input placeholder="e.g. Square" />
            </div>
            <div>
              <Label required>Lot No</Label>
              <Input placeholder="e.g. L-2026" />
            </div>
            <div>
              <Label required>Received Qty (kg)</Label>
              <Input type="number" placeholder="0" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setAddOpen(false)}>{bn.cancel}</Button>
            <Button type="button" onClick={() => { toast.success("Yarn received successfully"); setAddOpen(false); }}>{bn.save}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
