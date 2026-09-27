import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Nfc, Plus, MoreHorizontal, Pencil } from "lucide-react";
import { useStore } from "@/lib/store";
import { brl } from "@/lib/format";
import { Btn, Field, PageHeader, Sheet, inputCls } from "@/components/app/ui";
import type { Product } from "@/lib/mock";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const { orders, products, addProduct, updateProduct } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editError, setEditError] = useState("");

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setEditName(p.name);
    setEditPrice(String(p.price));
    setEditError("");
    setEditOpen(true);
  };

  const saveEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editProduct) return;
    const parsedPrice = Number(editPrice.replace(",", "."));
    if (!editName.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setEditError("Informe o nome e um preço válido.");
      return;
    }
    updateProduct(editProduct.id, editName.trim(), parsedPrice);
    setEditOpen(false);
  };

  const saveProduct = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedPrice = Number(price.replace(",", "."));
    if (!name.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError("Informe o nome e um preço válido para o produto.");
      return;
    }
    addProduct({ id: `p${Date.now()}`, name: name.trim(), price: parsedPrice, active: true });
    setName("");
    setPrice("");
    setError("");
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Produtos"
        subtitle={`${products.length} ativos`}
        action={<Btn onClick={() => setOpen(true)} aria-label="Cadastrar produto" className="h-10 w-10 px-0"><Plus className="h-5 w-5" /><span className="sr-only">Cadastrar produto</span></Btn>}
      />
      <div className="grid gap-2 sm:grid-cols-2">
        {products.map((p) => {
          const sold = orders.filter((o) => o.productId === p.id).reduce((s, o) => s + o.qty, 0);
          return (
            <div key={p.id} className="card-surface flex items-center gap-3 p-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-muted"><Nfc className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">{sold} vendidas · <span className="text-st-vendido">Ativo</span></div>
              </div>
              <div className="tabular font-semibold">{brl(p.price)}</div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Opções do produto"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => openEdit(p)} className="gap-2">
                    <Pencil className="h-4 w-4" />
                    Editar produto
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>
      <Sheet open={editOpen} onClose={() => { setEditOpen(false); setEditError(""); }} title="Editar produto">
        <form onSubmit={saveEdit} className="space-y-4 pt-3">
          <Field label="Nome do produto">
            <input className={inputCls} value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Ex.: Placa Google NFC" required autoFocus />
          </Field>
          <Field label="Preço (R$)">
            <input className={inputCls} type="number" min="0.01" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} placeholder="199,00" required />
          </Field>
          {editError && <p role="alert" className="text-sm text-destructive">{editError}</p>}
          <Btn type="submit" className="w-full">Salvar alterações</Btn>
        </form>
      </Sheet>
      <Sheet open={open} onClose={() => { setOpen(false); setError(""); }} title="Cadastrar produto">
        <form onSubmit={saveProduct} className="space-y-4 pt-3">
          <Field label="Nome do produto">
            <input className={inputCls} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Placa Google NFC" required autoFocus />
          </Field>
          <Field label="Preço (R$)">
            <input className={inputCls} type="number" min="0.01" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="199,00" required />
          </Field>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Btn type="submit" className="w-full">Salvar produto</Btn>
        </form>
      </Sheet>
    </div>
  );
}
