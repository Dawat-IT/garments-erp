import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { RoleId } from "./types";
import { roles as seedRoles } from "./seed-data";
import type { RoleId as PanelRoleId } from "./roles";

interface AppState {
  /** Currently active presentation panel / role (e.g. "super_admin"). */
  role: RoleId;
  /** Set the active role/panel. */
  setRole: (role: RoleId) => void;
  /** Sidebar collapsed state (persisted for convenience across sessions). */
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      role: "super_admin",
      setRole: (role) => set({ role }),
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: "same-dawat-erp-app-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ role: state.role, sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
);

/** Convenience lookup for the role metadata (name, description, route) of the active role. */
export function getRoleMeta(role: RoleId) {
  return seedRoles.find((r) => r.id === role) ?? seedRoles[0];
}

/* ------------------------------------------------------------------ */
/* Marketing / panel-selection store                                  */
/*                                                                     */
/* Used by the public landing (`/`), role picker (`/enter`) and the    */
/* executive dashboard (`/app/dashboard`). Kept separate from          */
/* `useAppStore` above (different `RoleId` shape: "super-admin" vs.    */
/* "super_admin") so both can evolve independently.                    */
/* ------------------------------------------------------------------ */

export interface ErpStoreState {
  role: PanelRoleId | null;
  setRole: (role: PanelRoleId) => void;
  clearRole: () => void;
}

export const useErpStore = create<ErpStoreState>()(
  persist(
    (set) => ({
      role: null,
      setRole: (role) => set({ role }),
      clearRole: () => set({ role: null }),
    }),
    {
      name: "same-dawat-erp-store",
    }
  )
);
