import { create } from "zustand";
import { fetchSharedErp } from "@/lib/clientErp";
import { Employee, AttendanceLog, PayrollRecord } from "@/lib/types";

interface HrStore {
  employees: Employee[];
  attendance: AttendanceLog[];
  payroll: PayrollRecord[];
  
  // Actions
  addEmployee: (emp: Employee) => void;
  updateEmployee: (emp: Employee) => void;
  deleteEmployee: (id: string) => void;
  
  addAttendance: (log: AttendanceLog) => void;
  processPayroll: (records: PayrollRecord[]) => void;
  updatePayrollStatus: (id: string, status: "Approved" | "Paid") => void;

  refresh: () => Promise<void>;
}

let hrServerReady = false;

export const useHrData = create<HrStore>((set, get) => {
  const persistToServer = async (nextState: Partial<HrStore>) => {
    if (!hrServerReady) return;
    try {
      const { employees, attendance, payroll } = { ...get(), ...nextState };
      const dataToPersist = { employees, attendance, payroll };
      
      const res = await fetch("/api/data?store=hr", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: dataToPersist }),
      });
      if (!res.ok) {
        console.error("[useHrData] Failed to persist hr data");
      }
    } catch (e) {
      console.error("[useHrData] Network error persisting hr data:", e);
    }
  };

  return {
    employees: [],
    attendance: [],
    payroll: [],

    addEmployee: (emp) => {
      set((state) => {
        const next = { employees: [emp, ...state.employees] };
        persistToServer(next);
        return next;
      });
    },

    updateEmployee: (emp) => {
      set((state) => {
        const next = {
          employees: state.employees.map((e) => (e.id === emp.id ? emp : e)),
        };
        persistToServer(next);
        return next;
      });
    },

    deleteEmployee: (id) => {
      set((state) => {
        const next = {
          employees: state.employees.filter((e) => e.id !== id),
        };
        persistToServer(next);
        return next;
      });
    },

    addAttendance: (log) => {
      set((state) => {
        const next = { attendance: [log, ...state.attendance] };
        persistToServer(next);
        return next;
      });
    },

    processPayroll: (records) => {
      set((state) => {
        const next = { payroll: [...records, ...state.payroll] };
        persistToServer(next);
        return next;
      });
    },

    updatePayrollStatus: (id, status) => {
      set((state) => {
        const next = {
          payroll: state.payroll.map((p) => (p.id === id ? { ...p, status } : p)),
        };
        persistToServer(next);
        return next;
      });
    },

    refresh: async () => {
      try {
        const data = await fetchSharedErp();
        set({
          employees: data.employees || [],
          attendance: data.attendance || [],
          payroll: data.payroll || [],
        });
        hrServerReady = true;
      } catch (e) {
        console.error("[useHrData] fetch failed", e);
      }
    },
  };
});
