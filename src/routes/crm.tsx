import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Columns3, List, CalendarClock } from "lucide-react";
import { useStore } from "@/lib/store";
import { STATUS, type Status, type Establishment } from "@/lib/mock";
import { brl, relDay } from "@/lib/format";
import { Chip, PageHeader, StatusDot, inputCls } from "@/components/app/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/crm")({
  head: () => ({
    meta: [
      { title: "CRM — Tap Comercial" },
      { name: "description", content: "Pipeline de leads por etapa: kanban e lista." },
      { property: "og:title", content: "CRM — Tap Comercial" },
      { property: "og:description", content: "Pipeline de leads por etapa: kanban e lista." },
    ],
  }),
  component: Crm,
});

const STAGES: { s: Status; label: string }[] = [
  { s: "nao_visitado", label: "Não visitado" },
  { s: "visitado", label: "Visitado" },
  { s: "interessado", label: "Interessado" },
  { s: "retornar", label: "Follow-up" },
  { s: "negociacao", label: "Negociação" },
  { s: "vendido", label: "Vendido" },
  { s: "nao_interessado", label: "Não interessado" },
];

function Crm() {
  const { ests, followups } = useStore();
  const [view, setView] = useState<"kanban" | "lista">("lista");
  const [stage, setStage] = useState<Status | "all">("all");
  const [q, setQ] = useState("");
  const filtered = ests.filter((e) => !q || e.name.toLowerCase().includes(q.toLowerCase()));
  const nextOf = (id: string) => followups.filter((f) => f.estId === id && !f.done).sort((a, b) => a.date.localeCompare(b.date))[0];
  const pipeline = ests.filter((e) => ["interessado", "negociacao", "retornar"].includes(e.status)).reduce((s, e) => s + e.value, 0);

  const Card = ({ e }: { e: Establishment }) => {
    const n = nextOf(e.id);
    return (
      <Link to="/estabelecimentos/$id" params={{ id: e.id }} className="card-surface block p-3 transition hover:border-foreground/20">
        <div className="flex items-start gap-2">
          <StatusDot status={e.status} className="mt-1.5" />
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">{e.name}</div>
            <div className="truncate text-xs text-muted-foreground">{e.segment} · {e.street.replace("Av. ", "Av. ")}</div>
          </div>
          <div className="tabular text-sm font-semibold">{brl(e.value)}</div>
        </div>
        {n && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" /> Retorno: {relDay(n.date)} às {n.time}
          </div>
        )}
      </Link>
    );
  };

  return (
    <div>
      <PageHeader
        title="CRM"
        subtitle={`${ests.length} leads · ${brl(pipeline)} em aberto`}
        action={
          <div className="flex rounded-lg border bg-card p-0.5">
            {(["kanban", "lista"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={cn("inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold uppercase", view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
                {v === "kanban" ? <Columns3 className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{v}</span>
              </button>
            ))}
          </div>
        }
      />
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input className={cn(inputCls, "pl-9")} placeholder="Buscar lead" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {view === "lista" ? (
        <>
          <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar md:mx-0 md:flex-wrap md:px-0">
            <Chip active={stage === "all"} onClick={() => setStage("all")} count={filtered.length}>Todos</Chip>
            {STAGES.map((st) => (
              <Chip key={st.s} active={stage === st.s} onClick={() => setStage(st.s)} count={filtered.filter((e) => e.status === st.s).length}>
                <span className={cn("h-2 w-2 rounded-full", STATUS[st.s].dot)} />{st.label}
              </Chip>
            ))}
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {filtered.filter((e) => stage === "all" || e.status === stage).map((e) => <Card key={e.id} e={e} />)}
          </div>
        </>
      ) : (
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0">
          {STAGES.map((st) => {
            const items = filtered.filter((e) => e.status === st.s);
            return (
              <div key={st.s} className="w-[85vw] shrink-0 snap-start rounded-xl bg-muted/70 p-2 sm:w-72">
                <div className="flex items-center gap-2 px-1.5 pb-2 pt-1">
                  <span className={cn("h-2 w-2 rounded-full", STATUS[st.s].dot)} />
                  <span className="text-xs font-semibold uppercase tracking-wide">{st.label}</span>
                  <span className="ml-auto tabular text-xs text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((e) => <Card key={e.id} e={e} />)}
                  {!items.length && <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">Vazio</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
