import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Sun, Map, KanbanSquare, Package, MoreHorizontal, LayoutDashboard, Store, Route as RouteIcon,
  Tag, Users, Settings, BellRing, Nfc,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MAIN = [
  { to: "/", label: "Hoje", icon: Sun },
  { to: "/mapa", label: "Mapa", icon: Map },
  { to: "/crm", label: "CRM", icon: KanbanSquare },
  { to: "/pedidos", label: "Pedidos", icon: Package },
] as const;

export const MORE = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/followups", label: "Follow-ups", icon: BellRing },
  { to: "/estabelecimentos", label: "Estabelecimentos", icon: Store },
  { to: "/territorios", label: "Territórios", icon: RouteIcon },
  { to: "/produtos", label: "Produtos", icon: Tag },
  { to: "/equipe", label: "Equipe", icon: Users },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path.startsWith("/prospeccao")) return <>{children}</>;
  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));
  const moreActive = MORE.some((m) => isActive(m.to)) || path === "/mais";
  const fullBleed = path.startsWith("/mapa");

  return (
    <div className="min-h-dvh md:flex">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r bg-sidebar md:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Nfc className="h-4 w-4" /></div>
          <div>
            <div className="text-sm font-semibold leading-none">Tap Comercial</div>
            <div className="mt-1 text-[11px] text-muted-foreground">Petrolina · PE</div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
          {[...MAIN, ...MORE].map((n, i) => (
            <div key={n.to}>
              {i === MAIN.length && <div className="mx-2 my-3 border-t" />}
              <Link to={n.to} className={cn("flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition hover:bg-sidebar-accent hover:text-foreground", isActive(n.to) && "bg-sidebar-accent text-foreground")}>
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            </div>
          ))}
        </nav>
        <div className="m-3 flex items-center gap-3 rounded-lg border p-3">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-xs font-semibold">AF</div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">Antonio Filho</div>
            <div className="text-[11px] text-muted-foreground">Administrador</div>
          </div>
        </div>
      </aside>

      <main className={cn("min-w-0 flex-1", fullBleed ? "" : "px-4 pb-28 pt-5 md:px-8 md:pb-10 md:pt-8")}>
        <div className={cn(!fullBleed && "mx-auto max-w-6xl")}>{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-safe backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          {MAIN.map((n) => (
            <Link key={n.to} to={n.to} className={cn("flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground", isActive(n.to) && "text-foreground")}>
              <n.icon className={cn("h-[22px] w-[22px]", isActive(n.to) && "stroke-[2.4]")} />
              {n.label}
            </Link>
          ))}
          <Link to="/mais" className={cn("flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground", moreActive && "text-foreground")}>
            <MoreHorizontal className="h-[22px] w-[22px]" />
            Mais
          </Link>
        </div>
      </nav>
    </div>
  );
}
