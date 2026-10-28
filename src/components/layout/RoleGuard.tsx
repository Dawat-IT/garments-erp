"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useErpStore } from "@/lib/store";
import { getRoleHome, roleCanAccessPath } from "@/lib/roles";

/**
 * Ensures a panel role is selected and that the current route is allowed for that role.
 * Unauthorized routes redirect to the role home dashboard.
 */
export function RoleGuard({ children }: { children: React.ReactNode }) {
  const role = useErpStore((s) => s.role);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!role) {
      router.replace("/enter");
      return;
    }
    if (pathname && !roleCanAccessPath(role, pathname)) {
      router.replace(getRoleHome(role));
    }
  }, [role, pathname, router]);

  if (!role) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-ink-500">
        Redirecting to panel selection…
      </div>
    );
  }

  if (pathname && !roleCanAccessPath(role, pathname)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-ink-500">
        Opening your panel modules…
      </div>
    );
  }

  return <>{children}</>;
}

export default RoleGuard;
