import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { X, MapPin, MessageCircle, Check, Heart, RotateCw, UserX, Ban, DoorClosed, EyeOff, ChevronLeft, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { TERRITORIES, RESULT_LABEL, type VisitResult, type Establishment } from "@/lib/mock";
import { Progress, Sheet, Field, inputCls, Btn, StatusBadge } from "@/components/app/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/prospeccao")({
  validateSearch: (s: Record<string, unknown>) => ({ t: typeof s["t"] === "string" ? s["t"] : "t1" }),
  head: () => ({
    meta: [
      { title: "Modo prospecção — Tap Comercial" },
      { name: "description", content: "Registre o resultado de cada visita em segundos." },
      { property: "og:title", content: "Modo prospecção — Tap Comercial" },
      { property: "og:description", content: "Registre o resultado de cada visita em segundos." },
    ],
  }),
  component: Prospect,
});

const BIG: { r: VisitResult; icon: typeof Check; cls: string; ring: string }[] = [
  { r: "vendido", icon: Check, cls: "bg-st-vendido text-primary-foreground", ring: "" },
  { r: "interessado", icon: Heart, cls: "bg-card", ring: "text-st-interessado" },
  { r: "retornar", icon: RotateCw, cls: "bg-card", ring: "text-warn" },
  { r: "ausente", icon: UserX, cls: "bg-card", ring: "text-st-visitado" },
  { r: "nao_interessado", icon: Ban, cls: "bg-card", ring: "text-st-perdido" },
];

function Prospect() {
  const { t } = Route.useSearch();
  const { ests, registerVisit } = useStore();
  const terr = TERRITORIES.find((x) => x.id === t) ?? TERRITORIES[0]!;
  // Freeze the route order at entry
  const [queue] = useState<Establishment[]>(() => ests.filter((e) => e.territoryId === terr.id).sort((a, b) => a.x + a.y * 0.01 - (b.x + b.y * 0.01)));
  const [idx, setIdx] = useState(() => {
    const i = queue.findIndex((e) => e.status === "nao_visitado" || e.status === "retornar");
    return i < 0 ? 0 : i;
  });
  const [retOpen, setRetOpen] = useState(false);
  const [date, setDate] = useState("2026-09-26");
  const [time, setTime] = useState("14:00");
  const [note, setNote] = useState("");
  const [done, setDone] = useState<VisitResult[]>([]);
  const [anim, setAnim] = useState(0);

  const cur = queue[idx];
  const live = useMemo(() => (cur ? ests.find((e) => e.id === cur.id) : undefined), [ests, cur]);
  const finished = idx >= queue.length;

  const advance = (r: VisitResult) => {
    setDone((d) => [...d, r]);
    setIdx((i) => i + 1);
    setAnim((a) => a + 1);
  };
  const choose = (r: VisitResult) => {
    if (!cur) return;
    if (r === "retornar" || r === "ausente") { setNote(r === "ausente" ? "Responsável ausente." : ""); setRetOpen(true); setPending(r); return; }
    registerVisit(cur.id, r, "");
    toast.success(RESULT_LABEL[r], { description: cur.name });
    advance(r);
  };
  const [pending, setPending] = useState<VisitResult>("retornar");
  const saveReturn = () => {
    if (!cur) return;
    registerVisit(cur.id, pending, note, { date, time });
    setRetOpen(false);
    toast.success("Retorno agendado", { description: `${cur.name} · ${date.slice(8)}/${date.slice(5, 7)} às ${time}` });
    advance(pending);
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <Link to="/" className="grid h-10 w-10 place-items-center rounded-full hover:bg-accent" aria-label="Sair"><X className="h-5 w-5" /></Link>
          <div className="text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{terr.name}</div>
            <div className="tabular text-sm font-semibold">{finished ? queue.length : idx + 1} de {queue.length}</div>
          </div>
          <button disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - 1))} className="grid h-10 w-10 place-items-center rounded-full hover:bg-accent disabled:opacity-30" aria-label="Anterior"><ChevronLeft className="h-5 w-5" /></button>
        </div>
        <Progress value={((finished ? queue.length : idx) / queue.length) * 100} className="mt-3" />
      </header>

      {finished ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-st-vendido/12 text-st-vendido"><Trophy className="h-8 w-8" /></div>
          <h2 className="mt-4 text-xl font-semibold">Território concluído</h2>
          <p className="mt-1 text-sm text-muted-foreground">{done.length} visitas nesta sessão · {done.filter((d) => d === "vendido").length} vendas</p>
          <div className="mt-6 grid w-full gap-2">
            <Link to="/" className="flex h-12 items-center justify-center rounded-xl bg-primary font-semibold text-primary-foreground">Voltar para Hoje</Link>
            <Link to="/territorios" className="flex h-12 items-center justify-center rounded-xl border font-semibold">Escolher outro território</Link>
          </div>
        </div>
      ) : cur && live ? (
        <div key={anim} className="flex flex-1 animate-in fade-in slide-in-from-right-4 flex-col px-4 pb-6 pt-5 duration-300">
          <div className="card-surface p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Estabelecimento</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{live.name}</h1>
            <div className="mt-0.5 text-sm text-muted-foreground">{live.segment} · {live.street}, {live.number}</div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <StatusBadge status={live.status} />
              <div className="flex gap-2">
                <Link to="/mapa" search={{ t: terr.id }} className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold"><MapPin className="h-4 w-4" />Mapa</Link>
                <a href={`https://wa.me/55${live.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold"><MessageCircle className="h-4 w-4 text-st-vendido" />WhatsApp</a>
              </div>
            </div>
          </div>

          <p className="mb-3 mt-6 text-center text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Qual foi o resultado da visita?</p>
          <div className="grid grid-cols-2 gap-2.5">
            {BIG.map(({ r, icon: I, cls, ring }, i) => (
              <button key={r} onClick={() => choose(r)} className={cn("flex h-[72px] items-center gap-3 rounded-2xl border px-4 text-left text-[15px] font-semibold shadow-[var(--shadow-soft)] transition active:scale-[0.97]", cls, i === 0 && "col-span-2 h-16 justify-center border-transparent text-base")}>
                <I className={cn("h-6 w-6 shrink-0", ring)} />
                {r === "vendido" ? "VENDI" : RESULT_LABEL[r]}
              </button>
            ))}
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            {([["fechado", DoorClosed], ["nao_visitar", EyeOff]] as const).map(([r, I]) => (
              <button key={r} onClick={() => choose(r)} className="flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent">
                <I className="h-4 w-4" />{RESULT_LABEL[r]}
              </button>
            ))}
          </div>
          <button onClick={() => { setIdx((i) => i + 1); setAnim((a) => a + 1); }} className="mt-auto pt-6 text-center text-sm font-medium text-muted-foreground underline-offset-4 hover:underline">Pular este estabelecimento</button>
        </div>
      ) : null}

      <Sheet open={retOpen} onClose={() => setRetOpen(false)} title="Agendar retorno" footer={<Btn className="h-12 w-full" onClick={saveReturn}>Salvar retorno</Btn>}>
        <p className="mb-3 text-sm text-muted-foreground">{cur?.name}</p>
        <div className="mb-3 flex gap-2">
          {[["Amanhã", "2026-09-26"], ["Seg", "2026-09-28"], ["Em 1 semana", "2026-10-02"]].map(([l, d]) => (
            <button key={d} onClick={() => setDate(d!)} className={cn("h-9 flex-1 rounded-lg border text-xs font-semibold", date === d && "border-primary bg-primary text-primary-foreground")}>{l}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Data"><input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Horário"><input type="time" className={inputCls} value={time} onChange={(e) => setTime(e.target.value)} /></Field>
        </div>
        <div className="mt-3"><Field label="Observação"><textarea rows={3} className={cn(inputCls, "h-auto py-2.5")} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex.: dono chega às 14h" /></Field></div>
      </Sheet>
    </div>
  );
}
