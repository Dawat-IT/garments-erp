import type { ErpData } from "@/lib/types";

let inflight: Promise<ErpData> | null = null;

/** One in-flight GET /api/data shared by every store that mounts with the app shell. */
export function fetchSharedErp(): Promise<ErpData> {
  if (!inflight) {
    const run = fetch("/api/data", { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json?.success || !json.data) {
          throw new Error(json?.error || "Failed to load ERP data.");
        }
        return json.data as ErpData;
      })
      .finally(() => {
        if (inflight === run) inflight = null;
      });
    inflight = run;
  }
  return inflight;
}
