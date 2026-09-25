import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Route as RouteIcon, ClipboardCheck, MessageCircle, User, Navigation, Layers, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { STATUS, STATUS_ORDER, TERRITORIES, USERS, type Status } from "@/lib/mock";
import { dm, relDay } from "@/lib/format";
import { MapCanvas } from "@/components/app/MapCanvas";
import { Sheet, StatusBadge, Chip, Btn } from "@/components/app/ui";
import { VisitSheet } from "@/components/app/VisitSheet";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mapa")({
  validateSearch: (s: Record<string, unknown>) => ({ t: typeof s["t"] === "string" ? s["t"] : undefined }),
  head: () => ({
    meta: [
      { title: "Mapa comercial — Tap Comercial" },
      { name: "description", content: "Estabelecimentos no mapa por status de prospecção." },
      { property: "og:title", content: "Mapa comercial — Tap Comercial" },
      { property: "og:description", content: "Estabelecimentos no mapa por status de prospecção." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const { t } = Route.useSearch();
  const { ests, followups } = useStore();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string>();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [terrOpen, setTerrOpen] = useState(false);
  const [legend, setLegend] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [fStatus, setFStatus] = useState<Status[]>([]);
  const [fSeg, setFSeg] = useState<string[]>([]);
  const [fTerr, setFTerr] = useState<string | undefined>(t);
  const [fSeller, setFSeller] = useState<string>();

  const segments = [...new Set(ests.map((e) => e.segment))];
  const list = useMemo(
    () =>
      ests.filter(
        (e) =>
          (!q || e.name.toLowerCase().includes(q.toLowerCase())) &&
          (!fStatus.length || fStatus.includes(e.status)) &&
          (!fSeg.length || fSeg.includes(e.segment)) &&
          (!fTerr || e.territoryId === fTerr) &&
          (!fSeller || e.sellerId === fSeller),
      ),
    [ests, q, fStatus, fSeg, fTerr, fSeller],
  );
  const activeFilters = fStatus.length + fSeg.length + (fSeller ? 1 : 0);
  const e = sel ? ests.find((x) => x.id === sel) : undefined;
  const next = e && followups.filter((f) => f.estId === e.id && !f.done).sort((a, b) => a.date.localeCompare(b.date))[0];
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div className="relative h-[calc(100dvh-64px)] md:h-dvh">
      <MapCanvas ests={list} selectedId={sel} onSelect={setSel} highlight={fTerr} />

      <div className="absolute inset-x-0 top-0 z-30 space-y-2 p-3 md:left-4 md:right-auto md:w-[420px] md:p-4">
        <div className="flex gap-2">
          <div className="flex h-12 flex-1 items-center gap-2 rounded-xl border bg-card px-3 shadow-float">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input value={q} onChange={(ev) => setQ(ev.target.value)} placeholder="Buscar estabelecimento" className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none" />
            {q && <button onClick={() => setQ("")}><X className="h-4 w-4 text-muted-foreground" /></button>}
          </div>
          <button onClick={() => setFiltersOpen(true)} aria-label="Filtros" className="relative grid h-12 w-12 place-items-center rounded-xl border bg-card shadow-float">
            <SlidersHorizontal className="h-5 w-5" />
            {activeFilters > 0 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-brand text-[10px] font-bold text-primary-foreground">{activeFilters}</span>}
          </button>
          <button onClick={() => setTerrOpen(true)} aria-label="Territórios" className="grid h-12 w-12 place-items-center rounded-xl border bg-card shadow-float">
            <RouteIcon className="h-5 w-5" />
          </button>
        </div>
        {fTerr && (
          <div className="flex">
            <span className="inline-flex h-8 items-center gap-2 rounded-full bg-primary pl-3 pr-1.5 text-xs font-semibold text-primary-foreground shadow-float">
              {TERRITORIES.find((x) => x.id === fTerr)?.name} · {list.length}
              <button onClick={() => setFTerr(undefined)} className="grid h-5 w-5 place-items-center rounded-full bg-primary-foreground/20"><X className="h-3 w-3" /></button>
            </span>
          </div>
        )}
      </div>

      <div className="absolute bottom-3 left-3 z-30 md:bottom-4 md:left-4">
        {legend ? (
          <div className="rounded-xl border bg-card/95 p-3 shadow-float backdrop-blur">
            <div className="mb-2 flex items-center justify-between gap-6 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Legenda <button onClick={() => setLegend(false)}><X className="h-3.5 w-3.5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {STATUS_ORDER.map((s) => (
                <div key={s} className="flex items-center gap-2 text-xs"><span className={cn("h-2.5 w-2.5 rounded-full", STATUS[s].dot)} />{STATUS[s].label}</div>
              ))}
            </div>
          </div>
        ) : (
          <button onClick={() => setLegend(true)} className="flex h-10 items-center gap-2 rounded-full border bg-card px-3 text-xs font-semibold shadow-float">
            <Layers className="h-4 w-4" />
            <span className="flex -space-x-1">{STATUS_ORDER.map((s) => <span key={s} className={cn("h-2.5 w-2.5 rounded-full ring-2 ring-card", STATUS[s].dot)} />)}</span>
          </button>
        )}
      </div>

      <Sheet open={!!e} onClose={() => setSel(undefined)} title={e && <span className="text-lg">{e.name}</span>}>
        {e && (
          <div>
            <div className="text-sm text-muted-foreground">{e.segment} · {e.street}, {e.number}</div>
            <StatusBadge status={e.status} className="mt-2.5" />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-muted p-3">
                <div className="text-[11px] text-muted-foreground">Última visita</div>
                <div className="tabular text-sm font-semibold">{e.lastVisit ? `${dm(e.lastVisit.date)} às ${e.lastVisit.time}` : "—"}</div>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <div className="text-[11px] text-muted-foreground">Próximo retorno</div>
                <div className="tabular text-sm font-semibold">{next ? `${relDay(next.date)} às ${next.time}` : "—"}</div>
              </div>
            </div>
            <Btn className="mt-4 h-12 w-full" onClick={() => setVisitOpen(true)}><ClipboardCheck className="h-5 w-5" /> Registrar visita</Btn>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <a href={`https://wa.me/55${e.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex h-16 flex-col items-center justify-center gap-1 rounded-lg border text-xs font-semibold hover:bg-accent"><MessageCircle className="h-5 w-5 text-st-vendido" />WhatsApp</a>
              <Link to="/estabelecimentos/$id" params={{ id: e.id }} className="flex h-16 flex-col items-center justify-center gap-1 rounded-lg border text-xs font-semibold hover:bg-accent"><User className="h-5 w-5" />Ver lead</Link>
              <a href={`https://www.google.com/maps/search/${encodeURIComponent(`${e.street} ${e.number} Petrolina`)}`} target="_blank" rel="noreferrer" className="flex h-16 flex-col items-center justify-center gap-1 rounded-lg border text-xs font-semibold hover:bg-accent"><Navigation className="h-5 w-5 text-st-visitado" />Rota</a>
            </div>
          </div>
        )}
      </Sheet>
      <VisitSheet estId={sel} open={visitOpen} onClose={() => setVisitOpen(false)} />

      <Sheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtros"
        footer={<div className="grid grid-cols-2 gap-2"><Btn variant="outline" onClick={() => { setFStatus([]); setFSeg([]); setFSeller(undefined); }}>Limpar</Btn><Btn onClick={() => setFiltersOpen(false)}>Ver {list.length} locais</Btn></div>}>
        <FilterGroup title="Status">
          {STATUS_ORDER.map((s) => <Chip key={s} active={fStatus.includes(s)} onClick={() => setFStatus(toggle(fStatus, s))}><span className={cn("h-2 w-2 rounded-full", STATUS[s].dot)} />{STATUS[s].label}</Chip>)}
        </FilterGroup>
        <FilterGroup title="Segmento">
          {segments.map((s) => <Chip key={s} active={fSeg.includes(s)} onClick={() => setFSeg(toggle(fSeg, s))}>{s}</Chip>)}
        </FilterGroup>
        <FilterGroup title="Território">
          <Chip active={!fTerr} onClick={() => setFTerr(undefined)}>Todos</Chip>
          {TERRITORIES.map((x) => <Chip key={x.id} active={fTerr === x.id} onClick={() => setFTerr(x.id)}>{x.short}</Chip>)}
        </FilterGroup>
        <FilterGroup title="Vendedor">
          <Chip active={!fSeller} onClick={() => setFSeller(undefined)}>Todos</Chip>
          {USERS.slice(0, 2).map((u) => <Chip key={u.id} active={fSeller === u.id} onClick={() => setFSeller(u.id)}>{u.short}</Chip>)}
        </FilterGroup>
      </Sheet>

      <Sheet open={terrOpen} onClose={() => setTerrOpen(false)} title="Territórios">
        <div className="space-y-2">
          {TERRITORIES.map((x) => (
            <button key={x.id} onClick={() => { setFTerr(x.id); setTerrOpen(false); }} className={cn("flex w-full items-center justify-between rounded-xl border p-3.5 text-left", fTerr === x.id && "border-primary")}>
              <div><div className="font-semibold">{x.name}</div><div className="text-xs text-muted-foreground">{ests.filter((e) => e.territoryId === x.id).length} estabelecimentos</div></div>
              <RouteIcon className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{title}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
