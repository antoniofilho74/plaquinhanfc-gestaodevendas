import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useStore } from "@/lib/store";
import { DAILY, TERRITORIES } from "@/lib/mock";
import { brl } from "@/lib/format";
import { Chip, PageHeader, SectionTitle, Progress } from "@/components/app/ui";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Tap Comercial" },
      { name: "description", content: "Faturamento, vendas, visitas e conversão da operação." },
      { property: "og:title", content: "Dashboard — Tap Comercial" },
      { property: "og:description", content: "Faturamento, vendas, visitas e conversão da operação." },
    ],
  }),
  component: Dashboard,
});

const PERIODS = [
  { k: "1", l: "Hoje", days: 1 },
  { k: "7", l: "7 dias", days: 7 },
  { k: "30", l: "30 dias", days: 30 },
  { k: "m", l: "Este mês", days: 25 },
];

function Dashboard() {
  const { ests } = useStore();
  const [p, setP] = useState("30");
  const days = PERIODS.find((x) => x.k === p)!.days;
  const data = DAILY.slice(-days);
  const sales = data.reduce((s, d) => s + d.sales, 0);
  const visits = data.reduce((s, d) => s + d.visits, 0);
  const revenue = data.reduce((s, d) => s + d.revenue, 0);
  const kpis = [
    ["Faturamento", brl(revenue)],
    ["Vendas", sales],
    ["Ticket médio", brl(sales ? revenue / sales : 0)],
    ["Visitas", visits],
    ["Conversão", `${((sales / Math.max(visits, 1)) * 100).toFixed(1).replace(".", ",")}%`],
  ];
  const segs = ["Ótica", "Barbearia", "Restaurante", "Clínica"].map((s) => {
    const list = ests.filter((e) => e.segment === s && e.status !== "nao_visitado");
    const sold = list.filter((e) => e.status === "vendido").length;
    return { s, v: list.length ? Math.round((sold / list.length) * 100) : 0 };
  });

  return (
    <div>
      <PageHeader title="Dashboard" />
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 no-scrollbar md:mx-0 md:px-0">
        {PERIODS.map((x) => <Chip key={x.k} active={p === x.k} onClick={() => setP(x.k)}>{x.l}</Chip>)}
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        {kpis.map(([l, v], i) => (
          <div key={l as string} className={`card-surface p-3.5 ${i === 0 ? "col-span-2 md:col-span-1" : ""}`}>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{l}</div>
            <div className="tabular mt-1 text-xl font-semibold tracking-tight">{v}</div>
          </div>
        ))}
      </div>

      <section className="card-surface mt-4 p-4">
        <SectionTitle>Vendas por dia</SectionTitle>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -24, right: 4, top: 4 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={10} stroke="var(--muted-foreground)" interval="preserveStartEnd" />
              <YAxis tickLine={false} axisLine={false} fontSize={10} stroke="var(--muted-foreground)" allowDecimals={false} />
              <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }} />
              <Bar dataKey="sales" name="Vendas" fill="var(--brand)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="card-surface p-4">
          <SectionTitle>Conversão por segmento</SectionTitle>
          <div className="space-y-3">
            {segs.map((s) => (
              <div key={s.s}>
                <div className="mb-1 flex justify-between text-sm"><span>{s.s}s</span><span className="tabular font-semibold">{s.v}%</span></div>
                <Progress value={s.v} />
              </div>
            ))}
          </div>
        </section>
        <section className="card-surface p-4">
          <SectionTitle>Performance por território</SectionTitle>
          <div className="divide-y">
            {TERRITORIES.map((t) => {
              const list = ests.filter((e) => e.territoryId === t.id);
              const v = list.filter((e) => e.status !== "nao_visitado").length;
              const s = list.filter((e) => e.status === "vendido").length;
              return (
                <div key={t.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div><div className="font-medium">{t.name}</div><div className="text-xs text-muted-foreground">{v} visitas · {s} vendas</div></div>
                  <div className="tabular font-semibold">{v ? Math.round((s / v) * 100) : 0}%</div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
