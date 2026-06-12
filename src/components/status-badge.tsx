import { cn } from "@/lib/cn";

type StatusBadgeProps = {
  className?: string;
  closed: boolean;
  label?: string;
};

export function StatusBadge({ className, closed, label }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]",
        closed
          ? "bg-amber-100 text-amber-900"
          : "bg-emerald-100 text-emerald-900",
        className,
      )}
    >
      {label ?? (closed ? "Encerrada" : "Aberta")}
    </span>
  );
}