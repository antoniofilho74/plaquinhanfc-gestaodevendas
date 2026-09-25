import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, Map } from "lucide-react";
import { useStore, territoryStats } from "@/lib/store";
import { TERRITORIES } from "@/lib/mock";
import { PageHeader, Progress } from "@/components/app/ui";

export const Route = createFileRoute("/territorios")({
  head: () => ({
    meta: [
      { title: "Territórios — Tap Comercial" },
      { name: "description", content: "Avenidas e regiões de Petrolina em prospecção." },
      { property: "og:title", content: "Territórios — Tap Comercial" },
      { property: "og:description", content: "Avenidas e regiões de Petrolina em prospecção." },
    ],
  }),
  component: Territories,
});

function Territories() {
  const { ests } = useStore();
  return (
    <div>
      <PageHeader title="Territórios" subtitle="Petrolina · PE" />
      <div className="grid gap-3 md:grid-cols-2">
        {TERRITORIES.map((t) => {
          const s = territoryStats(ests, t.id);
          return (
            <div key={t.id} className="card-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold uppercase tracking-wide">{t.name}</h3>
                  <div className="text-xs text-muted-foreground">{s.total} estabelecimentos · {t.bairro}</div>
                </div>
                <div className="text-right">
                  <div className="tabular text-lg font-semibold">{s.pct}%</div>
                  <div className="text-[11px] text-muted-foreground">prospectado</div>
                </div>
              </div>
              <Progress value={s.pct} className="mt-3" />
              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                {[[s.visited, "Visitados"], [s.remaining, "Restantes"], [s.sales, "Vendas"], [`${s.conv.toFixed(1).replace(".", ",")}%`, "Conversão"]].map(([v, l]) => (
                  <div key={l as string} className="rounded-lg bg-muted py-2"><div className="tabular text-sm font-semibold">{v}</div><div className="text-[10px] text-muted-foreground">{l}</div></div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link to="/prospeccao" search={{ t: t.id }} className="flex h-11 items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-semibold text-primary-foreground"><Play className="h-3.5 w-3.5 fill-current" />Continuar</Link>
                <Link to="/mapa" search={{ t: t.id }} className="flex h-11 items-center justify-center gap-1.5 rounded-lg border text-sm font-semibold"><Map className="h-4 w-4" />Ver no mapa</Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
