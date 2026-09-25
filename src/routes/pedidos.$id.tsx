import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { ORDER_STAGES, ORDER_STAGE_DONE_LABEL, PRODUCTS } from "@/lib/mock";
import { brl, dm } from "@/lib/format";
import { Btn, SectionTitle } from "@/components/app/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pedidos/$id")({
  head: () => ({
    meta: [
      { title: "Detalhes do pedido — Tap Comercial" },
      { name: "description", content: "Andamento do pedido da placa NFC." },
      { property: "og:title", content: "Detalhes do pedido — Tap Comercial" },
      { property: "og:description", content: "Andamento do pedido da placa NFC." },
    ],
  }),
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { orders, est, advanceOrder } = useStore();
  const o = orders.find((x) => x.id === id);
  if (!o) return <div className="p-8 text-center text-muted-foreground">Pedido não encontrado.</div>;
  const e = est(o.estId);
  const p = PRODUCTS.find((x) => x.id === o.productId)!;
  const rows = [
    ["Cliente", e ? <Link to="/estabelecimentos/$id" params={{ id: e.id }} className="font-semibold underline-offset-2 hover:underline">{e.name}</Link> : "—"],
    ["Produto", p.name],
    ["Quantidade", o.qty],
    ["Valor", brl(p.price * o.qty)],
    ["Pagamento", <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase", o.paid ? "bg-st-vendido/12 text-st-vendido" : "bg-st-retornar/15 text-warn")}>{o.paid ? "Pago" : "Pendente"}</span>],
    ["Entrega", dm(o.delivery)],
    ["Link NFC", <a href={o.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand">{o.link.replace("https://", "").slice(0, 26)}…<ExternalLink className="h-3 w-3" /></a>],
  ] as const;

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={() => router.history.back()} className="-ml-2 mb-2 inline-flex h-9 items-center gap-1 rounded-lg px-2 text-sm font-medium text-muted-foreground hover:bg-accent"><ChevronLeft className="h-4 w-4" />Pedidos</button>
      <div className="font-mono text-sm text-muted-foreground">PEDIDO {o.number}</div>
      <h1 className="text-2xl font-semibold tracking-tight">{e?.name}</h1>

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <section>
          <SectionTitle>Detalhes</SectionTitle>
          <dl className="card-surface divide-y">
            {rows.map(([k, v]) => <div key={k} className="flex items-center justify-between gap-4 px-4 py-3 text-sm"><dt className="text-muted-foreground">{k}</dt><dd className="text-right">{v}</dd></div>)}
          </dl>
        </section>
        <section>
          <SectionTitle>Andamento</SectionTitle>
          <ol className="card-surface p-4">
            {ORDER_STAGES.map((_, i) => {
              const done = i < o.stage || o.stage === 8;
              const cur = i === o.stage && o.stage !== 8;
              return (
                <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < 8 && <span className={cn("absolute left-[11px] top-6 h-[calc(100%-16px)] w-px", done ? "bg-st-vendido" : "bg-border")} />}
                  <span className={cn("relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2", done ? "border-st-vendido bg-st-vendido text-primary-foreground" : cur ? "border-brand bg-card" : "border-border bg-card")}>
                    {done ? <Check className="h-3.5 w-3.5" /> : cur ? <span className="h-2 w-2 rounded-full bg-brand" /> : null}
                  </span>
                  <div className={cn("pt-0.5 text-sm", cur ? "font-semibold" : done ? "" : "text-muted-foreground")}>
                    {ORDER_STAGE_DONE_LABEL[i]}
                    {cur && <span className="ml-2 text-xs font-medium text-brand">em andamento</span>}
                  </div>
                </li>
              );
            })}
          </ol>
          {o.stage < 8 && <Btn className="mt-3 h-12 w-full" onClick={() => { advanceOrder(o.id); toast.success(`Avançado para ${ORDER_STAGES[o.stage + 1]}`); }}>Avançar para {ORDER_STAGES[o.stage + 1]}</Btn>}
        </section>
      </div>
    </div>
  );
}
