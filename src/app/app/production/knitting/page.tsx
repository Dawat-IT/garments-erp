"use client";

import { useState } from "react";
import { Factory, ClipboardCheck, Scale, FileText, CheckCircle2 } from "lucide-react";
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
  Modal
} from "@/components/commercial/ui";
import { formatNumber } from "@/lib/commercialFormat";
import { bn } from "@/lib/bn";
import { toast } from "@/components/ui/Toast";

const mockPrograms = [
  { id: "KP-1024", order: "PO-24-001", style: "ST-8899", fabric: "Single Jersey 160 GSM", machine: "M-01", target: 1200, output: 850, status: "Running" },
  { id: "KP-1025", order: "PO-24-002", style: "ST-7711", fabric: "Fleece 280 GSM", machine: "M-03", target: 2000, output: 2000, status: "Completed" },
];

const mockRolls = [
  { id: "RL-8899-01", program: "KP-1024", weight: 20.5, defect: "None", qcStatus: "Pass", date: "2026-09-10" },
  { id: "RL-8899-02", program: "KP-1024", weight: 19.8, defect: "Hole", qcStatus: "Fail", date: "2026-09-10" },
  { id: "RL-7711-05", program: "KP-1025", weight: 21.0, defect: "None", qcStatus: "Pass", date: "2026-09-09" },
];

export default function KnittingPage() {
  const [activeTab, setActiveTab] = useState("program");
  const [addProgramOpen, setAddProgramOpen] = useState(false);
  const [addRollOpen, setAddRollOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Knitting Production</h1>
          <p className="mt-1 text-sm text-slate-500">Manage Knitting Programs, Machine Allocation, and Roll Generation</p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        items={[
          { value: "program", label: "Knitting Program", icon: <FileText className="h-4 w-4" /> },
          { value: "qc", label: "Grey Fabric & QC", icon: <ClipboardCheck className="h-4 w-4" /> },
        ]}
      />

      {activeTab === "program" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Programs</CardTitle>
            <Button size="sm" onClick={() => setAddProgramOpen(true)}>
              New Program
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program ID</TableHead>
                  <TableHead>Order Info</TableHead>
                  <TableHead>Fabric Details</TableHead>
                  <TableHead>Machine</TableHead>
                  <TableHead>Progress (kg)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPrograms.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-semibold text-slate-700">{p.id}</TableCell>
                    <TableCell>
                      <p className="font-semibold">{p.order}</p>
                      <p className="text-xs text-slate-500">{p.style}</p>
                    </TableCell>
                    <TableCell>{p.fabric}</TableCell>
                    <TableCell>{p.machine}</TableCell>
                    <TableCell>
                      <p className="text-sm">{formatNumber(p.output)} / {formatNumber(p.target)}</p>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full mt-1">
                        <div className={`h-1.5 rounded-full ${p.status === 'Completed' ? 'bg-green-500' : 'bg-teal-500'}`} style={{ width: `${(p.output/p.target)*100}%` }}></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge tone={p.status === "Completed" ? "green" : "blue"}>{p.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === "qc" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Grey Fabric Rolls & QC</CardTitle>
            <Button size="sm" variant="secondary" onClick={() => setAddRollOpen(true)}>
              <Scale className="h-4 w-4 mr-2" /> Generate Roll
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll ID</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                  <TableHead>Defects</TableHead>
                  <TableHead>QC Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRolls.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-semibold text-slate-700">{r.id}</TableCell>
                    <TableCell>{r.program}</TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.weight} kg</TableCell>
                    <TableCell>{r.defect}</TableCell>
                    <TableCell>
                      <Badge tone={r.qcStatus === "Pass" ? "green" : "red"}>{r.qcStatus}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Modal open={addProgramOpen} onClose={() => setAddProgramOpen(false)} title="New Knitting Program" size="md">
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Order / Style</Label>
              <Input placeholder="Search Order..." />
            </div>
            <div>
              <Label required>Fabric Type & GSM</Label>
              <Input placeholder="e.g. Single Jersey 160 GSM" />
            </div>
            <div>
              <Label required>Machine Allocation</Label>
              <Input placeholder="e.g. M-01" />
            </div>
            <div>
              <Label required>Target Quantity (kg)</Label>
              <Input type="number" placeholder="0" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setAddProgramOpen(false)}>{bn.cancel}</Button>
            <Button type="button" onClick={() => { toast.success("Knitting program saved successfully"); setAddProgramOpen(false); }}>{bn.save}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={addRollOpen} onClose={() => setAddRollOpen(false)} title="Generate Grey Roll" size="sm">
        <form className="space-y-4">
          <div>
            <Label required>Program ID</Label>
            <Input placeholder="e.g. KP-1024" />
          </div>
          <div>
            <Label required>Roll Weight (kg)</Label>
            <Input type="number" step="0.1" placeholder="0.0" />
          </div>
          <div>
            <Label>Defects (if any)</Label>
            <Input placeholder="e.g. Hole, Lycra Out" />
          </div>
          <div>
            <Label required>QC Decision</Label>
            <select className="w-full rounded-md border border-slate-300 p-2 text-sm mt-1">
              <option>Pass</option>
              <option>Fail</option>
              <option>Hold</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setAddRollOpen(false)}>{bn.cancel}</Button>
            <Button type="button" onClick={() => { toast.success("Grey roll generated successfully"); setAddRollOpen(false); }}>{bn.save}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
