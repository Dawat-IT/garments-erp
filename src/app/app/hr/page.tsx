"use client";

import { useState } from "react";
import { Users, Fingerprint, Receipt, Plus, Search, FileDown, Pencil, Trash2, ShieldCheck, UserPlus } from "lucide-react";
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
import { formatNumber } from "@/lib/utils";
import { useHrData } from "@/hooks/useHrData";
import { Employee } from "@/lib/types";

export default function HRPage() {
  const [activeTab, setActiveTab] = useState("directory");
  
  const { employees, attendance, payroll, addEmployee, updateEmployee, deleteEmployee, processPayroll } = useHrData();

  // Employee Modal State
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  
  const [empForm, setEmpForm] = useState<Partial<Employee>>({});

  const handleOpenEmpModal = (emp?: Employee) => {
    if (emp) {
      setEditingEmp(emp);
      setEmpForm(emp);
    } else {
      setEditingEmp(null);
      setEmpForm({
        id: `EMP-${(employees.length + 1).toString().padStart(3, "0")}`,
        name: "",
        department: "Sewing",
        designation: "Operator",
        basicSalary: 10000,
        status: "Active",
        joiningDate: new Date().toISOString().split("T")[0],
        contactNumber: ""
      });
    }
    setIsEmpModalOpen(true);
  };

  const handleSaveEmp = () => {
    if (!empForm.id || !empForm.name) return;
    if (editingEmp) {
      updateEmployee(empForm as Employee);
    } else {
      addEmployee(empForm as Employee);
    }
    setIsEmpModalOpen(false);
  };

  const handleDeleteEmp = (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      deleteEmployee(id);
    }
  };

  const handleGeneratePayroll = () => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    if (payroll.some(p => p.month === currentMonth)) {
      if (!confirm("Payroll for this month already exists. Regenerate?")) return;
    }

    const newPayroll = employees.map(emp => {
      // Mock calculation based on their salary
      const lateDeduction = 0;
      const overtimeAmount = Math.floor(Math.random() * 2000);
      return {
        id: `PR-${currentMonth}-${emp.id}`,
        month: currentMonth,
        empId: emp.id,
        name: emp.name,
        department: emp.department,
        basicSalary: emp.basicSalary,
        attendanceDays: 26,
        lateDeduction,
        overtimeAmount,
        netPayable: emp.basicSalary - lateDeduction + overtimeAmount,
        status: "Draft" as const
      };
    });

    processPayroll(newPayroll);
    alert("Payroll generated successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">HR, Admin & Payroll</h1>
          <p className="mt-1 text-sm text-slate-500">Employee Directory, Attendance, and Payroll Management</p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        items={[
          { value: "directory", label: "Employee Directory", icon: <Users className="h-4 w-4" /> },
          { value: "attendance", label: "Attendance (ZKTeco)", icon: <Fingerprint className="h-4 w-4" /> },
          { value: "payroll", label: "Payroll Processing", icon: <Receipt className="h-4 w-4" /> },
        ]}
      />

      {activeTab === "directory" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Employee Master</CardTitle>
              <p className="text-xs text-slate-500 mt-1">Total Employees: {employees.length}</p>
            </div>
            <Button size="sm" onClick={() => handleOpenEmpModal()}>
              <Plus className="h-4 w-4 mr-2" /> Add Employee
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>EMP ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="font-semibold text-slate-700">{e.id}</TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">{e.name}</div>
                        <div className="text-xs text-slate-500">{e.contactNumber}</div>
                      </TableCell>
                      <TableCell>{e.department}</TableCell>
                      <TableCell>{e.designation}</TableCell>
                      <TableCell>BDT {formatNumber(e.basicSalary)}</TableCell>
                      <TableCell>
                        <Badge tone={e.status === "Active" ? "green" : e.status === "On Leave" ? "amber" : "red"}>{e.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEmpModal(e)}>
                          <Pencil className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteEmp(e.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {employees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        No employees found. Seed data from Settings.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "attendance" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Daily Attendance</CardTitle>
              <p className="text-xs text-slate-500 mt-1">Logs automatically synced from ZKTeco Device via Port Forwarding API.</p>
            </div>
            <Button size="sm" variant="secondary">
              <Fingerprint className="h-4 w-4 mr-2" /> Force Sync ZKTeco
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>EMP ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>In Time</TableHead>
                    <TableHead>Out Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.slice(0, 50).map((a, i) => (
                    <TableRow key={i}>
                      <TableCell>{a.date}</TableCell>
                      <TableCell className="font-semibold text-slate-700">{a.empId}</TableCell>
                      <TableCell>{a.name}</TableCell>
                      <TableCell>{a.inTime || "-"}</TableCell>
                      <TableCell>{a.outTime || "-"}</TableCell>
                      <TableCell>
                        <Badge tone={a.status === "Present" ? "green" : a.status === "Absent" ? "red" : "amber"}>{a.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge tone="blue">{a.source}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {attendance.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        No attendance logs found for today.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "payroll" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Payroll Processing</CardTitle>
                <p className="text-xs text-slate-500 mt-1">Generate Monthly Payroll for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
              </div>
              <Button size="sm" onClick={handleGeneratePayroll}>
                <Receipt className="h-4 w-4 mr-2" /> Generate Salary Sheet
              </Button>
            </CardHeader>
            <CardContent>
              {payroll.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center bg-slate-50">
                  <Receipt className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-700">No Payroll Generated</p>
                  <p className="text-xs text-slate-500 mb-4">Click "Generate Salary Sheet" to calculate wages based on attendance, overtime, and deductions.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>EMP ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Basic</TableHead>
                        <TableHead className="text-right">Late Ded.</TableHead>
                        <TableHead className="text-right">Overtime</TableHead>
                        <TableHead className="text-right font-bold">Net Payable</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payroll.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="font-semibold">{p.empId}</TableCell>
                          <TableCell>{p.name}</TableCell>
                          <TableCell>{p.department}</TableCell>
                          <TableCell className="text-right">BDT {formatNumber(p.basicSalary)}</TableCell>
                          <TableCell className="text-right text-red-500">-BDT {formatNumber(p.lateDeduction)}</TableCell>
                          <TableCell className="text-right text-green-600">+BDT {formatNumber(p.overtimeAmount)}</TableCell>
                          <TableCell className="text-right font-bold text-slate-900">BDT {formatNumber(p.netPayable)}</TableCell>
                          <TableCell>
                            <Badge tone={p.status === "Paid" ? "green" : "amber"}>{p.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Modal open={isEmpModalOpen} onClose={() => setIsEmpModalOpen(false)} title={editingEmp ? "Edit Employee" : "Add Employee"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>EMP ID</Label>
              <Input value={empForm.id || ""} onChange={(e) => setEmpForm({ ...empForm, id: e.target.value })} disabled={!!editingEmp} />
            </div>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={empForm.name || ""} onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={empForm.department || ""} onChange={(e) => setEmpForm({ ...empForm, department: e.target.value })}>
                <option value="Sewing">Sewing</option>
                <option value="Cutting">Cutting</option>
                <option value="Finishing">Finishing</option>
                <option value="Knitting">Knitting</option>
                <option value="Dyeing">Dyeing</option>
                <option value="HR & Admin">HR & Admin</option>
                <option value="Quality Control">Quality Control</option>
                <option value="Merchandising">Merchandising</option>
                <option value="Management">Management</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Input value={empForm.designation || ""} onChange={(e) => setEmpForm({ ...empForm, designation: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Basic Salary (BDT)</Label>
              <Input type="number" value={empForm.basicSalary || ""} onChange={(e) => setEmpForm({ ...empForm, basicSalary: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Contact Number</Label>
              <Input value={empForm.contactNumber || ""} onChange={(e) => setEmpForm({ ...empForm, contactNumber: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Joining Date</Label>
              <Input type="date" value={empForm.joiningDate || ""} onChange={(e) => setEmpForm({ ...empForm, joiningDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={empForm.status || "Active"} onChange={(e) => setEmpForm({ ...empForm, status: e.target.value as Employee["status"] })}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </Select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t">
            <Button variant="outline" onClick={() => setIsEmpModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveEmp}>Save Employee</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
