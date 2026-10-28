import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  className?: string;
  render?: (row: T) => React.ReactNode;
  accessor?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  emptyMessage?: string;
  dense?: boolean;
  className?: string;
}

function alignClass(align?: "left" | "right" | "center") {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No records found.",
  dense = false,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("card-surface overflow-hidden", className)}>
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink-200/70 bg-ink-50/70">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-500",
                    alignClass(col.align)
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-ink-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={keyExtractor(row, index)}
                  className="border-b border-ink-100 transition-colors last:border-0 hover:bg-teal-50/50"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        dense ? "px-4 py-2.5" : "px-4 py-3.5",
                        "text-ink-700",
                        alignClass(col.align),
                        col.className
                      )}
                    >
                      {col.render ? col.render(row) : col.accessor ? col.accessor(row) : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
