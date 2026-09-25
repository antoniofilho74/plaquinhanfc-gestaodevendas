import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { MORE } from "@/components/app/AppShell";

export const Route = createFileRoute("/mais")({
  head: () => ({
    meta: [
      { title: "Mais — Tap Comercial" },
      { name: "description", content: "Dashboard, estabelecimentos, territórios, produtos e equipe." },
      { property: "og:title", content: "Mais — Tap Comercial" },
      { property: "og:description", content: "Dashboard, estabelecimentos, territórios, produtos e equipe." },
    ],
  }),
  component: More,
});

function More() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary font-semibold">AF</div>
        <div><div className="font-semibold">Antonio Filho</div><div className="text-sm text-muted-foreground">Administrador · Petrolina</div></div>
      </div>
      <div className="card-surface divide-y overflow-hidden">
        {MORE.map((m) => (
          <Link key={m.to} to={m.to} className="flex h-14 items-center gap-3 px-4 hover:bg-accent">
            <m.icon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 font-medium">{m.label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
