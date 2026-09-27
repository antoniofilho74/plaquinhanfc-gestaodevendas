import { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Nfc, Plus, MoreHorizontal, Pencil, Archive, ArchiveRestore, ChevronDown, ChevronUp, ImagePlus } from "lucide-react";
import { useStore } from "@/lib/store";
import { brl } from "@/lib/format";
import { Btn, Field, PageHeader, Sheet, inputCls } from "@/components/app/ui";
import type { Product } from "@/lib/mock";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  const { orders, products, addProduct, updateProduct, archiveProduct, unarchiveProduct } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImagePreview, setEditImagePreview] = useState("");
  const [editError, setEditError] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const activeProducts = products.filter((p) => !p.archived);
  const archivedProducts = products.filter((p) => p.archived);

  const handleImageChange = (file: File | undefined, setPreview: (v: string) => void, setUrl: (v: string) => void) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setUrl(url);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setEditName(p.name);
    setEditPrice(String(p.price));
    setEditImagePreview(p.imageUrl ?? "");
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
    updateProduct(editProduct.id, editName.trim(), parsedPrice, editImagePreview || undefined);
    setEditOpen(false);
  };

  const saveProduct = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedPrice = Number(price.replace(",", "."));
    if (!name.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError("Informe o nome e um preço válido para o produto.");
      return;
    }
    addProduct({ id: `p${Date.now()}`, name: name.trim(), price: parsedPrice, active: true, imageUrl: imagePreview || undefined });
    setName("");
    setPrice("");
    setImageUrl("");
    setImagePreview("");
    setError("");
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Produtos"
        subtitle={`${activeProducts.length} ativo${activeProducts.length !== 1 ? "s" : ""}`}
        action={<Btn onClick={() => setOpen(true)} aria-label="Cadastrar produto" className="h-10 w-10 px-0"><Plus className="h-5 w-5" /><span className="sr-only">Cadastrar produto</span></Btn>}
      />
      <div className="grid gap-2 sm:grid-cols-2">
        {activeProducts.map((p) => {
          const sold = orders.filter((o) => o.productId === p.id).reduce((s, o) => s + o.qty, 0);
          return (
            <div key={p.id} className="card-surface flex items-center gap-3 p-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-muted overflow-hidden">
                {p.imageUrl
                  ? <img src={p.imageUrl} alt={p.name} className="h-11 w-11 object-cover" />
                  : <Nfc className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">{sold} vendida{sold !== 1 ? "s" : ""} · <span className="text-st-vendido">Ativo</span></div>
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
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => openEdit(p)} className="gap-2">
                    <Pencil className="h-4 w-4" />
                    Editar produto
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => archiveProduct(p.id)} className="gap-2 text-muted-foreground">
                    <Archive className="h-4 w-4" />
                    Arquivar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>

      {archivedProducts.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showArchived ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {archivedProducts.length} produto{archivedProducts.length !== 1 ? "s" : ""} arquivado{archivedProducts.length !== 1 ? "s" : ""}
          </button>
          {showArchived && (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {archivedProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/30 p-3 opacity-60">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted overflow-hidden">
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} className="h-10 w-10 object-cover" />
                      : <Nfc className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-muted-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{brl(p.price)} · Arquivado</div>
                  </div>
                  <button
                    onClick={() => unarchiveProduct(p.id)}
                    aria-label="Desarquivar produto"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    title="Desarquivar"
                  >
                    <ArchiveRestore className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <Sheet open={editOpen} onClose={() => { setEditOpen(false); setEditError(""); }} title="Editar produto">
        <form onSubmit={saveEdit} className="space-y-4 pt-3">
          <Field label="Foto do produto">
            <div
              onClick={() => editFileInputRef.current?.click()}
              className="flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-muted/30 transition hover:bg-muted/60 overflow-hidden"
            >
              {editImagePreview
                ? <img src={editImagePreview} alt="Preview" className="h-28 w-full object-cover rounded-xl" />
                : <>
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Clique para enviar uma foto</span>
                  </>}
            </div>
            <input
              ref={editFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange(e.target.files?.[0], setEditImagePreview, setEditImagePreview)}
            />
          </Field>
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
      <Sheet open={open} onClose={() => { setOpen(false); setError(""); setImagePreview(""); setImageUrl(""); }} title="Cadastrar produto">
        <form onSubmit={saveProduct} className="space-y-4 pt-3">
          <Field label="Foto do produto">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-muted/30 transition hover:bg-muted/60 overflow-hidden"
            >
              {imagePreview
                ? <img src={imagePreview} alt="Preview" className="h-28 w-full object-cover rounded-xl" />
                : <>
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Clique para enviar uma foto</span>
                  </>}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange(e.target.files?.[0], setImagePreview, setImageUrl)}
            />
          </Field>
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
