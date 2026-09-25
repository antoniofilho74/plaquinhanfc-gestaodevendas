import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, MessageCircle, Phone, ClipboardCheck, CalendarPlus, Pencil, Package } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { RESULT_LABEL, TERRITORIES, USERS } from "@/lib/mock";
import { dm, relDay } from "@/lib/format";
import { StatusBadge, SectionTitle, Sheet, Field, inputCls, Btn } from "@/components/app/ui";
import { VisitSheet } from "@/components/app/VisitSheet";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/estabelecimentos/$id")({
  head: () => ({
    meta: [
      { title: "Estabelecimento — Tap Comercial" },
      { name: "description", content: "Dados, ações rápidas e histórico do lead." },
      { property: "og:title", content: "Estabelecimento — Tap Comercial" },
      { property: "og:description", content: "Dados, ações rápidas e histórico do lead." },
    ],
  }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { est, visits, followups, orders, addFollowup } = useStore();
  const [visitOpen, setVisitOpen] = useState(false);
  const [fuOpen, setFuOpen] = useState(false);
  const [fd, setFd] = useState("2026-09-26");
  const [ft, setFt] = useState("14:00");
  const [fn, setFn] = useState("");
  const e = est(id);
  if (!e) return <div className="p-8 text-center text-muted-foreground">Estabelecimento não encontrado.</div>;
  const order = orders.find((o) => o.estId === e.id);

  const timeline = [
    ...visits.filter((v) => v.estId === e.id).map((v) => ({ k: `${v.date} ${v.time}`, date: v.date, time: v.time, title: "Visita", desc: `${RESULT_LABEL[v.result]}${v.note ? ` — ${v.note}` : ""}`, type: "v" })),
    ...followups.filter((f) => f.estId === e.id).map((f) => ({ k: `${f.date} ${f.time}`, date: f.date, time: f.time, title: f.done ? "Follow-up concluído" : "Follow-up agendado", desc: f.note, type: "f" })),
  ].sort((a, b) => b.k.localeCompare(a.k));
  let visitN = 0;
  const numbered = [...timeline].reverse().map((t) => (t.type === "v" ? { ...t, title: `${["Primeira", "Segunda", "Terceira", "Quarta"][visitN++] ?? "Nova"} visita` } : t)).reverse();

  const info = [
    ["Responsável", e.contact],
    ["WhatsApp", e.whatsapp],
    ["Instagram", e.instagram],
    ["Segmento", e.segment],
    ["Endereço", `${e.street}, ${e.number}`],
    ["Território", TERRITORIES.find((t) => t.id === e.territoryId)?.name],
    ["Vendedor", USERS.find((u) => u.id === e.sellerId)?.name],
  ];
  const actions = [
    { l: "WhatsApp", i: MessageCircle, c: "text-st-vendido", href: `https://wa.me/55${e.whatsapp.replace(/\D/g, "")}` },
    { l: "Ligar", i: Phone, c: "text-st-visitado", href: `tel:${e.whatsapp.replace(/\D/g, "")}` },
    { l: "Visita", i: ClipboardCheck, c: "", on: () => setVisitOpen(true) },
    { l: "Follow-up", i: CalendarPlus, c: "text-warn", on: () => setFuOpen(true) },
    { l: "Editar", i: Pencil, c: "text-muted-foreground", on: () => toast("Edição disponível na próxima etapa") },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={() => router.history.back()} className="-ml-2 mb-2 inline-flex h-9 items-center gap-1 rounded-lg px-2 text-sm font-medium text-muted-foreground hover:bg-accent"><ChevronLeft className="h-4 w-4" />Voltar</button>
      <h1 className="text-2xl font-semibold tracking-tight">{e.name}</h1>
      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><StatusBadge status={e.status} /> {e.segment}</div>

      <div className="mt-5 grid grid-cols-5 gap-2">
        {actions.map((a) => {
          const inner = (<><a.i className={cn("h-5 w-5", a.c)} /><span className="text-[11px] font-semibold">{a.l}</span></>);
          const cls = "card-surface flex h-[68px] flex-col items-center justify-center gap-1.5 hover:bg-accent";
          return a.href ? <a key={a.l} href={a.href} target="_blank" rel="noreferrer" className={cls}>{inner}</a> : <button key={a.l} onClick={a.on} className={cls}>{inner}</button>;
        })}
      </div>

      {order && (
        <Link to="/pedidos/$id" params={{ id: order.id }} className="card-surface mt-3 flex items-center gap-3 p-3.5">
          <Package className="h-5 w-5 text-st-vendido" />
          <div className="flex-1 text-sm"><span className="font-semibold">Pedido {order.number}</span> <span className="text-muted-foreground">· ver andamento</span></div>
        </Link>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section>
          <SectionTitle>Informações</SectionTitle>
          <dl className="card-surface divide-y">
            {info.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-3 text-sm"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
            ))}
          </dl>
        </section>
        <section>
          <SectionTitle>Histórico</SectionTitle>
          <ol className="relative ml-2 border-l pl-5">
            {numbered.map((t, i) => (
              <li key={i} className="relative pb-5 last:pb-0">
                <span className={cn("absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-background", t.type === "v" ? "bg-primary" : "bg-st-retornar")} />
                <div className="tabular text-xs text-muted-foreground">{dm(t.date)} • {t.time} {t.type === "f" && `· ${relDay(t.date)}`}</div>
                <div className="text-sm font-semibold">{t.title}</div>
                <div className="text-sm text-foreground/75">{t.desc}</div>
              </li>
            ))}
            {!numbered.length && <li className="text-sm text-muted-foreground">Nenhuma interação ainda.</li>}
          </ol>
        </section>
      </div>

      <VisitSheet estId={e.id} open={visitOpen} onClose={() => setVisitOpen(false)} />
      <Sheet open={fuOpen} onClose={() => setFuOpen(false)} title="Criar follow-up"
        footer={<Btn className="h-12 w-full" onClick={() => { addFollowup(e.id, fd, ft, fn || "Retornar ao estabelecimento."); setFuOpen(false); toast.success("Follow-up criado"); }}>Salvar follow-up</Btn>}>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Data"><input type="date" className={inputCls} value={fd} onChange={(x) => setFd(x.target.value)} /></Field>
          <Field label="Horário"><input type="time" className={inputCls} value={ft} onChange={(x) => setFt(x.target.value)} /></Field>
        </div>
        <div className="mt-3"><Field label="Observação"><textarea rows={3} className={cn(inputCls, "h-auto py-2.5")} value={fn} onChange={(x) => setFn(x.target.value)} /></Field></div>
      </Sheet>
    </div>
  );
}
