import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { ORDER_STAGES, PRODUCTS } from "@/lib/mock";
import { brl, dm } from "@/lib/format";
import { Chip, PageHeader } from "@/components/app/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pedidos/")({
  head: () => ({
    meta: [
      { title: "Pedidos — Tap Comercial" },
      { name: "description", content: "Pipeline operacional das placas NFC vendidas." },
      { property: "og:title", content: "Pedidos — Tap Comercial" },
      { property: "og:description", content: "Pipeline operacional das placas NFC vendidas." },
    ],
  }),
  component: Orders,
});

const FILTERS = [
  { k: "all", l: "Todos", test: () => true },
  { k: "prod", l: "Produção", test: (s: number) => s <= 5 },
  { k: "ready", l: "Prontos", test: (s: number) => s === 6 },
  { k: "deliv", l: "Entrega", test: (s: number) => s === 7 },
  { k: "done", l: "Concluídos", test: (s: number) => s === 8 },
];

export const stageTone = (s: number) =>
  s === 8 ? "bg-st-vendido/12 text-st-vendido" : s >= 6 ? "bg-st-visitado/10 text-st-visitado" : s === 5 ? "bg-st-negociacao/10 text-st-negociacao" : "bg-st-retornar/15 text-warn";

function Orders() {
  const { orders, est } = useStore();
  const [f, setF] = useState("all");
  const test = FILTERS.find((x) => x.k === f)!.test;
  const list = orders.filter((o) => test(o.stage));
  return (
    <div>
      <PageHeader title="Pedidos" subtitle={`${orders.filter((o) => o.stage < 8).length} em andamento`} />
      <div className="card-surface mb-4 overflow-x-auto p-3 no-scrollbar">
        <div className="flex min-w-max gap-1">
          {ORDER_STAGES.map((s, i) => {
            const n = orders.filter((o) => o.stage === i).length;
            return (
              <div key={s} className="w-[72px] text-center">
                <div className={cn("tabular text-lg font-semibold", !n && "text-muted-foreground/50")}>{n}</div>
                <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{s}</div>
                <div className={cn("mt-1.5 h-1 rounded-full", n ? "bg-brand" : "bg-muted")} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 no-scrollbar md:mx-0 md:px-0">
        {FILTERS.map((x) => <Chip key={x.k} active={f === x.k} onClick={() => setF(x.k)} count={orders.filter((o) => x.test(o.stage)).length}>{x.l}</Chip>)}
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {list.map((o) => {
          const e = est(o.estId);
          const p = PRODUCTS.find((x) => x.id === o.productId)!;
          return (
            <Link key={o.id} to="/pedidos/$id" params={{ id: o.id }} className="card-surface flex items-center gap-3 p-3.5 hover:border-foreground/20">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{o.number}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", stageTone(o.stage))}>{ORDER_STAGES[o.stage]}</span>
                </div>
                <div className="mt-1 truncate font-semibold">{e?.name}</div>
                <div className="text-xs text-muted-foreground">{p.name}{o.qty > 1 && ` × ${o.qty}`} · Entrega {dm(o.delivery)}</div>
              </div>
              <div className="tabular text-sm font-semibold">{brl(p.price * o.qty)}</div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
