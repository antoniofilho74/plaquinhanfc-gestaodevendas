import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, ChevronRight, MapPin } from "lucide-react";
import { useStore, territoryStats } from "@/lib/store";
import { TODAY, PRODUCTS } from "@/lib/mock";
import { brl, dayDiff } from "@/lib/format";
import { FollowupCard } from "@/components/app/FollowupCard";
import { Progress, SectionTitle } from "@/components/app/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hoje — Tap Comercial" },
      { name: "description", content: "Retornos, follow-ups e prospecção do dia." },
      { property: "og:title", content: "Hoje — Tap Comercial" },
      { property: "og:description", content: "Retornos, follow-ups e prospecção do dia." },
    ],
  }),
  component: Today,
});

function Today() {
  const { followups, visits, orders, ests } = useStore();
  const open = followups.filter((f) => !f.done);
  const todayF = open.filter((f) => f.date === TODAY).sort((a, b) => a.time.localeCompare(b.time));
  const late = open.filter((f) => dayDiff(f.date) < 0);
  const todayVisits = visits.filter((v) => v.date === TODAY).length;
  const todayOrders = orders.filter((o) => o.createdAt === TODAY);
  const sales = ests.filter((e) => e.status === "vendido" && e.lastVisit?.date === TODAY).length + todayOrders.length;
  const revenue = sales * 199;
  const st = territoryStats(ests, "t1");
  void PRODUCTS;

  const kpis = [
    { v: todayF.length, l: "Retornos" },
    { v: late.length, l: "Atrasados", warn: late.length > 0 },
    { v: todayVisits, l: "Visitas" },
    { v: sales, l: "Vendas" },
    { v: brl(revenue), l: "Faturamento" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Sexta, 25 de setembro</p>
          <h1 className="text-[26px] font-semibold tracking-tight">Bom dia, Antonio</h1>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-sm font-semibold md:hidden">AF</div>
      </header>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar md:mx-0 md:grid md:grid-cols-5 md:px-0">
        {kpis.map((k) => (
          <div key={k.l} className="card-surface min-w-[92px] shrink-0 px-3 py-2.5">
            <div className={`tabular text-lg font-semibold leading-tight ${k.warn ? "text-st-perdido" : ""}`}>{k.v}</div>
            <div className="text-[11px] font-medium text-muted-foreground">{k.l}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section>
          <SectionTitle action={<Link to="/followups" className="text-xs font-semibold text-brand">Ver todos</Link>}>Follow-ups de hoje</SectionTitle>
          <div className="space-y-2.5">
            {late.slice(0, 1).map((f) => <FollowupCard key={f.id} f={f} />)}
            {todayF.map((f) => <FollowupCard key={f.id} f={f} />)}
            {todayF.length === 0 && <div className="card-surface p-6 text-center text-sm text-muted-foreground">Nenhum retorno para hoje 🎉</div>}
          </div>
        </section>

        <section className="lg:sticky lg:top-8 lg:self-start">
          <SectionTitle>Prospecção de hoje</SectionTitle>
          <div className="card-surface p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand" />
              <h3 className="font-semibold">Av. Souza Filho</h3>
              <span className="ml-auto tabular text-sm font-semibold">{st.pct}%</span>
            </div>
            <Progress value={st.pct} className="mt-3" />
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {[[st.total, "Total"], [st.visited, "Visitados"], [st.remaining, "Restantes"], [st.sales, "Vendas"]].map(([v, l]) => (
                <div key={l as string}>
                  <div className="tabular text-lg font-semibold">{v}</div>
                  <div className="text-[11px] text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>
            <Link to="/prospeccao" search={{ t: "t1" }} className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-semibold tracking-wide text-primary-foreground active:scale-[0.99]">
              <Play className="h-4 w-4 fill-current" /> INICIAR PROSPECÇÃO
            </Link>
            <Link to="/territorios" className="mt-2 flex h-10 items-center justify-center gap-1 text-sm font-medium text-muted-foreground">
              Trocar território <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
