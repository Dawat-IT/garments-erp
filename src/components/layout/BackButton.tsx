"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-white/20 bg-white/5 px-2.5 text-[12px] font-semibold text-white hover:bg-white/10",
        className
      )}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Back
    </button>
  );
}
