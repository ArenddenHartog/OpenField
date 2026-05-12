import { cn } from "@/lib/utils";

interface TagProps {
  children: React.ReactNode;
  active?: boolean;
}

export function Tag({ children, active = false }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        active
          ? "border-emerald-700 bg-emerald-50 text-emerald-900"
          : "border-slate-200 bg-white text-slate-700"
      )}
    >
      {children}
    </span>
  );
}
