"use client";

import { useState } from "react";
import { Beaker, FlaskConical, TestTube2, Waves, FileCheck2, Plus } from "lucide-react";
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
} from "@/components/commercial/ui";
import { Modal } from "@/components/commercial/ui";
import { bn } from "@/lib/bn";
import { toast } from "@/components/ui/Toast";

const mockBatches = [
  { id: "B-2026-001", order: "PO-24-001", color: "Navy Blue", weight: 500, recipe: "R-101", status: "Prepared" },
  { id: "B-2026-002", order: "PO-24-002", color: "Heather Grey", weight: 800, recipe: "Pending", status: "Recipe Pending" },
];

const mockMachines = [
  { id: "D-01", capacity: 600, batch: "B-2026-001", status: "Running", startTime: "08:00 AM" },
  { id: "D-02", capacity: 1000, batch: "-", status: "Idle", startTime: "-" },
];

export default function DyeingPage() {
  const [activeTab, setActiveTab] = useState("batch");
  const [addBatchOpen, setAddBatchOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dyeing & Wash</h1>
          <p className="mt-1 text-sm text-slate-500">Batch Preparation, Chemical Issue, Machine Loading, and Finishing</p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        items={[
          { value: "batch", label: "Batch & Recipe", icon: <Beaker className="h-4 w-4" /> },
          { value: "machine", label: "Machine Loading", icon: <Waves className="h-4 w-4" /> },
          { value: "finish", label: "Finishing & QC", icon: <FileCheck2 className="h-4 w-4" /> },
        ]}
      />

      {activeTab === "batch" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Dyeing Batches</CardTitle>
            <Button size="sm" onClick={() => setAddBatchOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create Batch
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                  <TableHead>Recipe</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBatches.map(b => (
                  <TableRow key={b.id}>
                    <TableCell className="font-semibold text-slate-700">{b.id}</TableCell>
                    <TableCell>{b.order}</TableCell>
                    <TableCell>{b.color}</TableCell>
                    <TableCell>{b.weight}</TableCell>
                    <TableCell>{b.recipe}</TableCell>
                    <TableCell>
                      <Badge tone={b.status === "Prepared" ? "green" : "amber"}>{b.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Add Recipe</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === "machine" && (
        <Card>
          <CardHeader>
            <CardTitle>Dyeing Machines Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockMachines.map(m => (
                <div key={m.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold text-slate-800">{m.id}</h3>
                    <Badge tone={m.status === "Running" ? "blue" : "slate"}>{m.status}</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p>Capacity: <span className="font-medium text-slate-800">{m.capacity} kg</span></p>
                    <p>Loaded Batch: <span className="font-medium text-slate-800">{m.batch}</span></p>
                    <p>Start Time: <span className="font-medium text-slate-800">{m.startTime}</span></p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <Button variant={m.status === "Running" ? "outline" : "primary"} className="w-full">
                      {m.status === "Running" ? "Unload Machine" : "Load Machine"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "finish" && (
        <Card>
          <CardHeader>
            <CardTitle>Finishing & Fabric QC</CardTitle>
            <p className="text-xs text-slate-500">Slitting, Stentering, Compacting, and Final Inspection.</p>
          </CardHeader>
          <CardContent>
             <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-slate-500">No batches in finishing stage.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Modal open={addBatchOpen} onClose={() => setAddBatchOpen(false)} title="Create Dyeing Batch" size="md">
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Order / Style</Label>
              <Input placeholder="Select Order..." />
            </div>
            <div>
              <Label required>Color</Label>
              <Input placeholder="e.g. Navy Blue" />
            </div>
            <div>
              <Label required>Target Weight (kg)</Label>
              <Input type="number" placeholder="0" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setAddBatchOpen(false)}>{bn.cancel}</Button>
            <Button type="button" onClick={() => { toast.success("Dyeing batch created successfully"); setAddBatchOpen(false); }}>{bn.save}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
