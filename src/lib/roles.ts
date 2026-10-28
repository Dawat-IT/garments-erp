import type { LucideIcon } from "lucide-react";
import {
  ShieldCheck,
  LineChart,
  Users,
  Factory,
  ClipboardCheck,
  Warehouse,
  Wallet,
} from "lucide-react";

/** Canonical panel role IDs used across enter, sidebar, dashboard and guards. */
export type RoleId =
  | "super-admin"
  | "owner-director"
  | "merchandiser"
  | "production-manager"
  | "qc-manager"
  | "store-manager"
  | "accounts-manager";

/** Module keys used for nav filtering and route guards. */
export type ModuleKey =
  | "dashboard"
  | "buyers"
  | "orders"
  | "ta-calendar"
  | "merchandising"
  | "costing"
  | "procurement"
  | "inventory"
  | "production"
  | "quality-control"
  | "shipment"
  | "accounts"
  | "reports"
  | "settings"
  | "engineering"
  | "hr";

export type DashboardVariant =
  | "super"
  | "owner"
  | "merchandiser"
  | "production"
  | "qc"
  | "store"
  | "accounts";

export interface RoleDefinition {
  id: RoleId;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  scope: string[];
  icon: LucideIcon;
  /** Landing route after Continue */
  homePath: string;
  /** Which dashboard layout to render */
  dashboard: DashboardVariant;
  /**
   * Allowed modules. `"*"` = full access (Super Admin).
   * Matching is by module key on nav items / pathname prefixes.
   */
  modules: ModuleKey[] | "*";
}

/**
 * Role → modules map researched from Code Bondhu Garments ERP panels:
 * each panel focuses the sidebar and dashboard on that department's work.
 */
export const ROLES: RoleDefinition[] = [
  {
    id: "super-admin",
    title: "Super Admin",
    titleBn: "Super Admin",
    description: "Full ERP overview across all modules and operations",
    descriptionBn: "Full control of every module and factory operation",
    scope: ["All Modules", "User Access", "System Config"],
    icon: ShieldCheck,
    homePath: "/app/dashboard",
    dashboard: "super",
    modules: "*",
  },
  {
    id: "owner-director",
    title: "Owner / Director",
    titleBn: "Owner / Director",
    description: "Executive overview, KPI, shipment and profit status",
    descriptionBn: "Executive KPI, shipment and profit or loss overview",
    scope: ["Executive KPI", "Shipment", "Profit / Loss"],
    icon: LineChart,
    homePath: "/app/dashboard",
    dashboard: "owner",
    modules: ["dashboard", "shipment", "accounts", "reports"],
  },
  {
    id: "merchandiser",
    title: "Merchandiser",
    titleBn: "Merchandiser",
    description: "Buyers, orders, T&A, samples and costing",
    descriptionBn: "Buyers, orders, T&A, samples and costing",
    scope: ["Buyers", "Orders & T&A", "Samples", "Costing"],
    icon: Users,
    homePath: "/app/dashboard",
    dashboard: "merchandiser",
    modules: ["dashboard", "buyers", "orders", "ta-calendar", "merchandising", "costing", "engineering"],
  },
  {
    id: "production-manager",
    title: "Production Manager",
    titleBn: "Production Manager",
    description: "Cutting, sewing, finishing and packing",
    descriptionBn: "Cutting, sewing, finishing and packing floor control",
    scope: ["Cutting", "Sewing", "Finishing", "Packing"],
    icon: Factory,
    homePath: "/app/dashboard",
    dashboard: "production",
    modules: ["dashboard", "production", "engineering"],
  },
  {
    id: "qc-manager",
    title: "QC Manager",
    titleBn: "QC Manager",
    description: "Inline QC, endline QC and final inspection",
    descriptionBn: "Inline, endline and final inspection",
    scope: ["Inline QC", "Endline QC", "Final Inspection", "Defects"],
    icon: ClipboardCheck,
    homePath: "/app/dashboard",
    dashboard: "qc",
    modules: ["dashboard", "quality-control"],
  },
  {
    id: "store-manager",
    title: "Store Manager",
    titleBn: "Store Manager",
    description: "Fabric, trims, inventory and in-house status",
    descriptionBn: "Fabric, trims, inventory and in-house status",
    scope: ["Fabric Stock", "Trims", "Procurement", "Inventory"],
    icon: Warehouse,
    homePath: "/app/dashboard",
    dashboard: "store",
    modules: ["dashboard", "procurement", "inventory"],
  },
  {
    id: "accounts-manager",
    title: "Accounts Manager",
    titleBn: "Accounts Manager",
    description: "Buyer ledger, supplier ledger and profit/loss",
    descriptionBn: "Buyer and supplier ledgers, and profit or loss",
    scope: ["Buyer Ledger", "Supplier Ledger", "Collections", "P/L"],
    icon: Wallet,
    homePath: "/app/dashboard",
    dashboard: "accounts",
    modules: ["dashboard", "accounts", "reports"],
  },
];

export function getRoleById(id: RoleId | null | undefined): RoleDefinition | undefined {
  if (!id) return undefined;
  return ROLES.find((role) => role.id === id);
}

/** Map pathname (and optional search) to a module key. */
export function pathToModule(pathname: string): ModuleKey | null {
  if (!pathname.startsWith("/app")) return null;
  if (pathname === "/app/dashboard" || pathname.startsWith("/app/dashboard/")) return "dashboard";
  if (pathname.startsWith("/app/buyers")) return "buyers";
  if (pathname.startsWith("/app/orders")) return "orders";
  if (pathname.startsWith("/app/ta-calendar")) return "ta-calendar";
  if (pathname.startsWith("/app/merchandising")) return "merchandising";
  if (pathname.startsWith("/app/costing")) return "costing";
  if (pathname.startsWith("/app/procurement")) return "procurement";
  if (pathname.startsWith("/app/inventory")) return "inventory";
  if (pathname.startsWith("/app/production")) return "production";
  if (pathname.startsWith("/app/quality-control")) return "quality-control";
  if (pathname.startsWith("/app/shipment")) return "shipment";
  if (pathname.startsWith("/app/accounts")) return "accounts";
  if (pathname.startsWith("/app/reports")) return "reports";
  if (pathname.startsWith("/app/settings")) return "settings";
  if (pathname.startsWith("/app/engineering")) return "engineering";
  if (pathname.startsWith("/app/hr")) return "hr";
  return null;
}

export function roleCanAccessModule(roleId: RoleId | null | undefined, moduleKey: ModuleKey | null): boolean {
  if (!moduleKey) return true;
  // Settings only for super-admin
  if (moduleKey === "settings") {
    return roleId === "super-admin";
  }
  const role = getRoleById(roleId);
  if (!role) return false;
  if (role.modules === "*") return true;
  return role.modules.includes(moduleKey);
}

export function roleCanAccessPath(roleId: RoleId | null | undefined, pathname: string): boolean {
  const moduleKey = pathToModule(pathname);
  return roleCanAccessModule(roleId, moduleKey);
}

export function getRoleHome(roleId: RoleId): string {
  return getRoleById(roleId)?.homePath ?? "/app/dashboard";
}

/** Seed-store RoleId (underscore) ↔ panel RoleId (kebab) bridges */
export type SeedRoleId =
  | "super_admin"
  | "owner_director"
  | "merchandiser"
  | "production_manager"
  | "qc_manager"
  | "store_manager"
  | "accounts_manager";

export const PANEL_TO_SEED: Record<RoleId, SeedRoleId> = {
  "super-admin": "super_admin",
  "owner-director": "owner_director",
  merchandiser: "merchandiser",
  "production-manager": "production_manager",
  "qc-manager": "qc_manager",
  "store-manager": "store_manager",
  "accounts-manager": "accounts_manager",
};

export const SEED_TO_PANEL: Record<SeedRoleId, RoleId> = {
  super_admin: "super-admin",
  owner_director: "owner-director",
  merchandiser: "merchandiser",
  production_manager: "production-manager",
  qc_manager: "qc-manager",
  store_manager: "store-manager",
  accounts_manager: "accounts-manager",
};
