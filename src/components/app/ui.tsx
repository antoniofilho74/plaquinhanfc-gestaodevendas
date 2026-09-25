import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS, type Status } from "@/lib/mock";

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const s = STATUS[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", s.soft, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

export function StatusDot({ status, className }: { status: Status; className?: string }) {
  return <span className={cn("inline-block h-2.5 w-2.5 shrink-0 rounded-full", STATUS[status].dot, className)} />;
}

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{children}</h2>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Chip({ active, onClick, children, count }: { active?: boolean; onClick?: () => void; children: ReactNode; count?: number }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-accent",
      )}
    >
      {children}
      {count !== undefined && <span className={cn("tabular text-xs", active ? "opacity-70" : "text-muted-foreground")}>{count}</span>}
    </button>
  );
}

/** Bottom sheet on mobile, right side panel on desktop. */
export function Sheet({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 animate-in fade-in bg-foreground/25" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[90dvh] animate-in slide-in-from-bottom flex-col rounded-t-2xl bg-card shadow-float duration-200 md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[440px] md:rounded-none md:slide-in-from-right">
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border md:hidden" />
        <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-3 md:pt-5">
          <div className="min-w-0 text-base font-semibold">{title}</div>
          <button onClick={onClose} aria-label="Fechar" className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-5">{children}</div>
        {footer && <div className="border-t px-5 py-3 pb-safe">{footer}</div>}
      </div>
    </div>
  );
}

export const inputCls =
  "h-11 w-full rounded-lg border border-input bg-card px-3 text-[15px] outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function Btn({ variant = "primary", className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost" | "brand" }) {
  const v = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    brand: "bg-brand text-primary-foreground hover:bg-brand/90",
    outline: "border bg-card hover:bg-accent",
    ghost: "hover:bg-accent",
  }[variant];
  return <button {...p} className={cn("inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-40", v, className)} />;
}
