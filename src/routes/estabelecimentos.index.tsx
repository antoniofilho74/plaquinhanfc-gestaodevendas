import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { STATUS, STATUS_ORDER, TERRITORIES, USERS, type Status } from "@/lib/mock";
import { PageHeader, StatusBadge, Btn, Sheet, Field, inputCls } from "@/components/app/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/estabelecimentos/")({
  head: () => ({
    meta: [
      { title: "Estabelecimentos — Tap Comercial" },
      { name: "description", content: "Base completa de estabelecimentos prospectados." },
      { property: "og:title", content: "Estabelecimentos — Tap Comercial" },
      { property: "og:description", content: "Base completa de estabelecimentos prospectados." },
    ],
  }),
  component: List,
});

const sel = cn(inputCls, "appearance-none pr-8");

function List() {
  const { ests, addEstablishment } = useStore();
  const [q, setQ] = useState("");
  const [st, setSt] = useState("");
  const [seg, setSeg] = useState("");
  const [ter, setTer] = useState("");
  const [sv, setSv] = useState("");
  const [open, setOpen] = useState(false);
  const segments = [...new Set(ests.map((e) => e.segment))];
  const list = ests.filter((e) => (!q || e.name.toLowerCase().includes(q.toLowerCase())) && (!st || e.status === st) && (!seg || e.segment === seg) && (!ter || e.territoryId === ter) && (!sv || e.sellerId === sv));

  const submit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const d = new FormData(ev.currentTarget);
    const name = String(d.get("name") || "").trim();
    if (!name) return toast.error("Informe o nome");
    const tid = String(d.get("territory"));
    addEstablishment({
      id: `e${Date.now()}`, name, segment: String(d.get("segment") || "Outro"), contact: String(d.get("contact") || "—"),
      whatsapp: String(d.get("whatsapp") || ""), instagram: String(d.get("instagram") || ""), street: String(d.get("street") || TERRITORIES.find((t) => t.id === tid)!.name),
      number: String(d.get("number") || "s/n"), territoryId: tid, status: d.get("status") as Status, x: 40 + Math.random() * 40, y: 45 + Math.random() * 20,
      sellerId: "u1", value: 199, notes: String(d.get("notes") || ""),
    });
    setOpen(false);
    toast.success("Estabelecimento cadastrado");
  };

  return (
    <div>
      <PageHeader title="Estabelecimentos" subtitle={`${list.length} de ${ests.length}`} action={<Btn onClick={() => setOpen(true)}><Plus className="h-4 w-4" /><span className="hidden sm:inline">Novo estabelecimento</span><span className="sm:hidden">Novo</span></Btn>} />
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input className={cn(inputCls, "pl-9")} placeholder="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <select className={sel} value={st} onChange={(e) => setSt(e.target.value)}><option value="">Status</option>{STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}</select>
        <select className={sel} value={seg} onChange={(e) => setSeg(e.target.value)}><option value="">Segmento</option>{segments.map((s) => <option key={s}>{s}</option>)}</select>
        <select className={sel} value={ter} onChange={(e) => setTer(e.target.value)}><option value="">Território</option>{TERRITORIES.map((t) => <option key={t.id} value={t.id}>{t.short}</option>)}</select>
        <select className={sel} value={sv} onChange={(e) => setSv(e.target.value)}><option value="">Vendedor</option>{USERS.slice(0, 2).map((u) => <option key={u.id} value={u.id}>{u.short}</option>)}</select>
      </div>

      <div className="space-y-2 md:hidden">
        {list.map((e) => (
          <Link key={e.id} to="/estabelecimentos/$id" params={{ id: e.id }} className="card-surface flex items-center gap-3 p-3.5">
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{e.name}</div>
              <div className="truncate text-xs text-muted-foreground">{e.segment} · {e.street}, {e.number}</div>
              <StatusBadge status={e.status} className="mt-2" />
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <div className="card-surface hidden overflow-hidden md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>{["Nome", "Segmento", "Responsável", "Território", "Status"].map((h) => <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {list.map((e) => (
              <tr key={e.id} className="hover:bg-accent/50">
                <td className="px-4 py-3"><Link to="/estabelecimentos/$id" params={{ id: e.id }} className="font-semibold hover:underline">{e.name}</Link><div className="text-xs text-muted-foreground">{e.street}, {e.number}</div></td>
                <td className="px-4 py-3">{e.segment}</td>
                <td className="px-4 py-3">{e.contact}</td>
                <td className="px-4 py-3">{TERRITORIES.find((t) => t.id === e.territoryId)?.short}</td>
                <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Novo estabelecimento">
        <form onSubmit={submit} className="space-y-3">
          <Field label="Nome do estabelecimento"><input name="name" maxLength={100} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Segmento"><input name="segment" maxLength={40} className={inputCls} /></Field>
            <Field label="Responsável"><input name="contact" maxLength={60} className={inputCls} /></Field>
            <Field label="WhatsApp"><input name="whatsapp" inputMode="tel" maxLength={20} className={inputCls} /></Field>
            <Field label="Instagram"><input name="instagram" maxLength={40} className={inputCls} /></Field>
          </div>
          <div className="grid grid-cols-[1fr_90px] gap-2">
            <Field label="Endereço"><input name="street" maxLength={100} className={inputCls} /></Field>
            <Field label="Número"><input name="number" maxLength={10} className={inputCls} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Bairro"><input name="bairro" maxLength={40} className={inputCls} /></Field>
            <Field label="Cidade"><input name="city" defaultValue="Petrolina" className={inputCls} /></Field>
            <Field label="Estado"><input name="uf" defaultValue="PE" maxLength={2} className={inputCls} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Território"><select name="territory" className={sel}>{TERRITORIES.map((t) => <option key={t.id} value={t.id}>{t.short}</option>)}</select></Field>
            <Field label="Status"><select name="status" className={sel}>{STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}</select></Field>
          </div>
          <Field label="Observações"><textarea name="notes" rows={3} maxLength={500} className={cn(inputCls, "h-auto py-2.5")} /></Field>
          <Btn type="submit" className="h-12 w-full">Cadastrar</Btn>
        </form>
      </Sheet>
    </div>
  );
}
