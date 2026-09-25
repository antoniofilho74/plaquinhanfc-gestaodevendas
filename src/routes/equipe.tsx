import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { USERS, PRODUCTS } from "@/lib/mock";
import { brl, initials } from "@/lib/format";
import { PageHeader } from "@/components/app/ui";

export const Route = createFileRoute("/equipe")({
  head: () => ({
    meta: [
      { title: "Equipe — Tap Comercial" },
      { name: "description", content: "Desempenho individual de visitas, vendas e faturamento." },
      { property: "og:title", content: "Equipe — Tap Comercial" },
      { property: "og:description", content: "Desempenho individual de visitas, vendas e faturamento." },
    ],
  }),
  component: Team,
});

function Team() {
  const { visits, orders, est } = useStore();
  return (
    <div>
      <PageHeader title="Equipe" subtitle={`${USERS.length} membros`} />
      <div className="grid gap-3 md:grid-cols-3">
        {USERS.map((u) => {
          const v = visits.filter((x) => x.userId === u.id).length;
          const my = orders.filter((o) => est(o.estId)?.sellerId === u.id);
          const s = u.role === "Produção" ? 0 : my.length;
          const rev = u.role === "Produção" ? 0 : my.reduce((a, o) => a + PRODUCTS.find((p) => p.id === o.productId)!.price * o.qty, 0);
          const stats = u.role === "Produção"
            ? [["Em produção", orders.filter((o) => o.stage === 5).length], ["Prontos", orders.filter((o) => o.stage === 6).length], ["Instalados", orders.filter((o) => o.stage === 8).length], ["Pedidos", orders.length]]
            : [["Visitas", v], ["Vendas", s], ["Conversão", `${v ? Math.round((s / v) * 100) : 0}%`], ["Faturamento", brl(rev)]];
          return (
            <div key={u.id} className="card-surface p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-sm font-semibold">{initials(u.name)}</div>
                <div><div className="font-semibold">{u.name}</div><div className="text-xs text-muted-foreground">{u.role}</div></div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {stats.map(([l, val]) => (
                  <div key={l as string} className="rounded-lg bg-muted p-2.5"><div className="tabular text-sm font-semibold">{val}</div><div className="text-[11px] text-muted-foreground">{l}</div></div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
