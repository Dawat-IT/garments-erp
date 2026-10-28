/**
 * ERP rows are stored in normalized MongoDB collections, not one JSON blob.
 * See `src/lib/db/repository.ts` and `src/lib/db/repair.ts`.
 */
export const ERP_STORAGE = "normalized" as const;
