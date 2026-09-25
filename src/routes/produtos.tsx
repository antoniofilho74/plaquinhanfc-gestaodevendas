import { createFileRoute } from "@tanstack/react-router";
import { Nfc } from "lucide-react";
import { useStore } from "@/lib/store";
import { PRODUCTS } from "@/lib/mock";
import { brl } from "@/lib/format";
import { PageHeader } from "@/components/app/ui";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos — Tap Comercial" },
      { name: "description", content: "Catálogo de placas NFC e quantidades vendidas." },
      { property: "og:title", content: "Produtos — Tap Comercial" },
      { property: "og:description", content: "Catálogo de placas NFC e quantidades vendidas." },
    ],
  }),
  component: Products,
});

function Products() {
  const { orders } = useStore();
  return (
    <div>
      <PageHeader title="Produtos" subtitle={`${PRODUCTS.length} ativos`} />
      <div className="grid gap-2 sm:grid-cols-2">
        {PRODUCTS.map((p) => {
          const sold = orders.filter((o) => o.productId === p.id).reduce((s, o) => s + o.qty, 0);
          return (
            <div key={p.id} className="card-surface flex items-center gap-3 p-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-muted"><Nfc className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">{sold} vendidas · <span className="text-st-vendido">Ativo</span></div>
              </div>
              <div className="tabular font-semibold">{brl(p.price)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
