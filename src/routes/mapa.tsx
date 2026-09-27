import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Search,
  SlidersHorizontal,
  Route as RouteIcon,
  ClipboardCheck,
  MessageCircle,
  User,
  Navigation,
  Layers,
  X,
  Star,
  Loader2,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { STATUS, STATUS_ORDER, TERRITORIES, USERS, type Status } from "@/lib/mock";
import { dm, relDay } from "@/lib/format";
import { Sheet, StatusBadge, Chip, Btn } from "@/components/app/ui";
import { VisitSheet } from "@/components/app/VisitSheet";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mapa")({
  validateSearch: (s: Record<string, unknown>) => ({ t: typeof s["t"] === "string" ? s["t"] : undefined }),
  head: () => ({
    meta: [
      { title: "Mapa comercial — Haja Tec" },
      { name: "description", content: "Estabelecimentos no mapa por status de prospecção." },
      { property: "og:title", content: "Mapa comercial — Haja Tec" },
      { property: "og:description", content: "Estabelecimentos no mapa por status de prospecção." },
    ],
  }),
  component: MapPage,
});

// ─── Tipos ───────────────────────────────────────────────────────────────────

type PlaceResult = {
  place_id: string;
  name: string;
  vicinity?: string;
  geometry: { location: { lat: number; lng: number } };
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: { open_now?: boolean };
};

// ─── Hook: carrega o script do Google Maps ────────────────────────────────────

function useGoogleMaps(): { ready: boolean; error: string | null } {
  const [ready, setReady] = useState(() => typeof window !== "undefined" && !!window.google?.maps);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready) return;
    if (document.getElementById("gm-script")) {
      // script já está no DOM — aguarda o evento
      const poll = setInterval(() => {
        if (window.google?.maps) { setReady(true); clearInterval(poll); }
      }, 100);
      return () => clearInterval(poll);
    }

    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    if (!key) {
      setError("A chave do Google Maps não está configurada (VITE_GOOGLE_MAPS_API_KEY).");
      return;
    }

    const script = document.createElement("script");
    script.id = "gm-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.onload = () => setReady(true);
    script.onerror = () => setError("Não foi possível carregar o Google Maps. Verifique a chave da API.");
    document.head.appendChild(script);
  }, [ready]);

  return { ready, error };
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const PETROLINA = { lat: -9.3891, lng: -40.503 };
const ZOOM = 11;
const SEARCH_RADIUS = 40000;
const SUPABASE_URL = "https://glgbmhktmqrcukomepoo.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsZ2JtaGt0bXFyY3Vrb21lcG9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMzU5OTcsImV4cCI6MjA2NDkxMTk5N30.GD9fgxnlDMfNYoVi0c2eHXAVFMGK3WzSxKuWY8g2_2E";

// ─── Componente principal ─────────────────────────────────────────────────────

function MapPage() {
  const { t } = Route.useSearch();
  const { ests, followups } = useStore();
  const { ready: mapsReady, error: mapsError } = useGoogleMaps();

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);

  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState<string | null>(null);

  // ── Filtros e UI state (mantido igual ao original) ──
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
  const activeFilters = fStatus.length + fSeg.length + (fSeller ? 1 : 0);
  const e = sel ? ests.find((x) => x.id === sel) : undefined;
  const next = e && followups.filter((f) => f.estId === e.id && !f.done).sort((a, b) => a.date.localeCompare(b.date))[0];
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  // ── Busca estabelecimentos na Edge Function ──
  const fetchPlaces = useCallback(async () => {
    setLoadingPlaces(true);
    setPlacesError(null);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/buscarEstabelecimentos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_ANON}`,
            apikey: SUPABASE_ANON,
          },
          body: JSON.stringify({ latitude: PETROLINA.lat, longitude: PETROLINA.lng }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error((data as { erro?: string }).erro ?? "Erro ao buscar estabelecimentos.");
      }
      setPlaces(data as PlaceResult[]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Não foi possível buscar os estabelecimentos.";
      setPlacesError(msg);
    } finally {
      setLoadingPlaces(false);
    }
  }, []);

  // ── Inicializa o mapa quando o script estiver pronto ──
  useEffect(() => {
    if (!mapsReady || !mapRef.current || mapInstanceRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: PETROLINA,
      zoom: ZOOM,
      disableDefaultUI: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
      ],
    });

    mapInstanceRef.current = map;
    infoWindowRef.current = new window.google.maps.InfoWindow();

    // Círculo de área de busca
    circleRef.current = new window.google.maps.Circle({
      map,
      center: PETROLINA,
      radius: SEARCH_RADIUS,
      strokeColor: "#1d4ed8",
      strokeOpacity: 0.35,
      strokeWeight: 2,
      fillColor: "#3b82f6",
      fillOpacity: 0.06,
    });

    fetchPlaces();
  }, [mapsReady, fetchPlaces]);

  // ── Adiciona/atualiza markers quando os places chegam ──
  useEffect(() => {
    if (!mapInstanceRef.current || !infoWindowRef.current) return;

    // Remove markers antigos
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const map = mapInstanceRef.current;
    const iw = infoWindowRef.current;

    places.forEach((place) => {
      const position = {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      };

      const marker = new window.google.maps.Marker({
        map,
        position,
        title: place.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#0ea5e9",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      marker.addListener("click", () => {
        const rating = place.rating
          ? `<span style="color:#f59e0b">★</span> <strong>${place.rating.toFixed(1)}</strong> <span style="color:#6b7280">(${place.user_ratings_total ?? 0} avaliações)</span>`
          : `<span style="color:#6b7280">Sem avaliação</span>`;

        const openNow =
          place.opening_hours?.open_now === undefined
            ? `<span style="color:#6b7280">Horário não informado</span>`
            : place.opening_hours.open_now
            ? `<span style="color:#16a34a;font-weight:600">● Aberto agora</span>`
            : `<span style="color:#dc2626;font-weight:600">● Fechado agora</span>`;

        iw.setContent(`
          <div style="font-family:system-ui,sans-serif;max-width:220px;line-height:1.5">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px">${place.name}</div>
            <div style="font-size:12px;color:#6b7280;margin-bottom:6px">${place.vicinity ?? "Endereço não disponível"}</div>
            <div style="font-size:12px;margin-bottom:4px">${rating}</div>
            <div style="font-size:12px">${openNow}</div>
          </div>
        `);
        iw.open({ map, anchor: marker });
      });

      markersRef.current.push(marker);
    });
  }, [places]);

  // ── Render ──
  return (
    <div className="relative h-[calc(100dvh-64px)] md:h-dvh">
      {/* Mapa */}
      <div ref={mapRef} className="absolute inset-0" />

      {/* Estado: carregando o script do Maps */}
      {!mapsReady && !mapsError && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="text-sm font-medium text-muted-foreground">Carregando mapa…</p>
        </div>
      )}

      {/* Estado: erro no script do Maps */}
      {mapsError && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background px-6 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="text-sm font-semibold">{mapsError}</p>
        </div>
      )}

      {/* Barra de busca + controles */}
      <div className="absolute inset-x-0 top-0 z-30 space-y-2 p-3 md:left-4 md:right-auto md:w-[420px] md:p-4">
        <div className="flex gap-2">
          <div className="flex h-12 flex-1 items-center gap-2 rounded-xl border bg-card px-3 shadow-float">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              value={q}
              onChange={(ev) => setQ(ev.target.value)}
              placeholder="Buscar estabelecimento"
              className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none"
            />
            {q && (
              <button onClick={() => setQ("")}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <button
            onClick={() => setFiltersOpen(true)}
            aria-label="Filtros"
            className="relative grid h-12 w-12 place-items-center rounded-xl border bg-card shadow-float"
          >
            <SlidersHorizontal className="h-5 w-5" />
            {activeFilters > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-brand text-[10px] font-bold text-primary-foreground">
                {activeFilters}
              </span>
            )}
          </button>
          <button
            onClick={() => setTerrOpen(true)}
            aria-label="Territórios"
            className="grid h-12 w-12 place-items-center rounded-xl border bg-card shadow-float"
          >
            <RouteIcon className="h-5 w-5" />
          </button>
        </div>

        {fTerr && (
          <div className="flex">
            <span className="inline-flex h-8 items-center gap-2 rounded-full bg-primary pl-3 pr-1.5 text-xs font-semibold text-primary-foreground shadow-float">
              {TERRITORIES.find((x) => x.id === fTerr)?.name}
              <button onClick={() => setFTerr(undefined)} className="grid h-5 w-5 place-items-center rounded-full bg-primary-foreground/20">
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        )}

        {/* Indicador de carregamento dos places */}
        {loadingPlaces && (
          <div className="flex h-10 items-center gap-2 rounded-xl border bg-card/95 px-3 shadow-float backdrop-blur">
            <Loader2 className="h-4 w-4 animate-spin text-brand" />
            <span className="text-xs font-medium text-muted-foreground">Buscando estabelecimentos…</span>
          </div>
        )}

        {/* Erro ao buscar places */}
        {placesError && !loadingPlaces && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-card/95 px-3 py-2.5 shadow-float backdrop-blur">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-destructive">{placesError}</p>
            </div>
            <button
              onClick={fetchPlaces}
              className="shrink-0 text-xs font-semibold text-brand underline-offset-2 hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Contador de results */}
        {places.length > 0 && !loadingPlaces && (
          <div className="flex h-8 items-center gap-2 rounded-full border bg-card/95 px-3 shadow-float backdrop-blur">
            <MapPin className="h-3.5 w-3.5 text-brand" />
            <span className="text-xs font-medium text-muted-foreground">
              {places.length} estabelecimento{places.length !== 1 ? "s" : ""} encontrado{places.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Legenda */}
      <div className="absolute bottom-3 left-3 z-30 md:bottom-4 md:left-4">
        {legend ? (
          <div className="rounded-xl border bg-card/95 p-3 shadow-float backdrop-blur">
            <div className="mb-2 flex items-center justify-between gap-6 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Legenda{" "}
              <button onClick={() => setLegend(false)}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {STATUS_ORDER.map((s) => (
                <div key={s} className="flex items-center gap-2 text-xs">
                  <span className={cn("h-2.5 w-2.5 rounded-full", STATUS[s].dot)} />
                  {STATUS[s].label}
                </div>
              ))}
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                Google Places
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setLegend(true)}
            className="flex h-10 items-center gap-2 rounded-full border bg-card px-3 text-xs font-semibold shadow-float"
          >
            <Layers className="h-4 w-4" />
            <span className="flex -space-x-1">
              {STATUS_ORDER.map((s) => (
                <span key={s} className={cn("h-2.5 w-2.5 rounded-full ring-2 ring-card", STATUS[s].dot)} />
              ))}
              <span className="h-2.5 w-2.5 rounded-full bg-sky-400 ring-2 ring-card" />
            </span>
          </button>
        )}
      </div>

      {/* Sheet: detalhes do estabelecimento local */}
      <Sheet open={!!e} onClose={() => setSel(undefined)} title={e && <span className="text-lg">{e.name}</span>}>
        {e && (
          <div>
            <div className="text-sm text-muted-foreground">
              {e.segment} · {e.street}, {e.number}
            </div>
            <StatusBadge status={e.status} className="mt-2.5" />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-muted p-3">
                <div className="text-[11px] text-muted-foreground">Última visita</div>
                <div className="tabular text-sm font-semibold">
                  {e.lastVisit ? `${dm(e.lastVisit.date)} às ${e.lastVisit.time}` : "—"}
                </div>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <div className="text-[11px] text-muted-foreground">Próximo retorno</div>
                <div className="tabular text-sm font-semibold">
                  {next ? `${relDay(next.date)} às ${next.time}` : "—"}
                </div>
              </div>
            </div>
            <Btn className="mt-4 h-12 w-full" onClick={() => setVisitOpen(true)}>
              <ClipboardCheck className="h-5 w-5" /> Registrar visita
            </Btn>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <a
                href={`https://wa.me/55${e.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-16 flex-col items-center justify-center gap-1 rounded-lg border text-xs font-semibold hover:bg-accent"
              >
                <MessageCircle className="h-5 w-5 text-st-vendido" />
                WhatsApp
              </a>
              <Link
                to="/estabelecimentos/$id"
                params={{ id: e.id }}
                className="flex h-16 flex-col items-center justify-center gap-1 rounded-lg border text-xs font-semibold hover:bg-accent"
              >
                <User className="h-5 w-5" />
                Ver lead
              </Link>
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(`${e.street} ${e.number} Petrolina`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-16 flex-col items-center justify-center gap-1 rounded-lg border text-xs font-semibold hover:bg-accent"
              >
                <Navigation className="h-5 w-5 text-st-visitado" />
                Rota
              </a>
            </div>
          </div>
        )}
      </Sheet>
      <VisitSheet estId={sel} open={visitOpen} onClose={() => setVisitOpen(false)} />

      {/* Sheet: filtros */}
      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filtros"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Btn
              variant="outline"
              onClick={() => {
                setFStatus([]);
                setFSeg([]);
                setFSeller(undefined);
              }}
            >
              Limpar
            </Btn>
            <Btn onClick={() => setFiltersOpen(false)}>Fechar</Btn>
          </div>
        }
      >
        <FilterGroup title="Status">
          {STATUS_ORDER.map((s) => (
            <Chip key={s} active={fStatus.includes(s)} onClick={() => setFStatus(toggle(fStatus, s))}>
              <span className={cn("h-2 w-2 rounded-full", STATUS[s].dot)} />
              {STATUS[s].label}
            </Chip>
          ))}
        </FilterGroup>
        <FilterGroup title="Segmento">
          {segments.map((s) => (
            <Chip key={s} active={fSeg.includes(s)} onClick={() => setFSeg(toggle(fSeg, s))}>
              {s}
            </Chip>
          ))}
        </FilterGroup>
        <FilterGroup title="Território">
          <Chip active={!fTerr} onClick={() => setFTerr(undefined)}>
            Todos
          </Chip>
          {TERRITORIES.map((x) => (
            <Chip key={x.id} active={fTerr === x.id} onClick={() => setFTerr(x.id)}>
              {x.short}
            </Chip>
          ))}
        </FilterGroup>
        <FilterGroup title="Vendedor">
          <Chip active={!fSeller} onClick={() => setFSeller(undefined)}>
            Todos
          </Chip>
          {USERS.slice(0, 2).map((u) => (
            <Chip key={u.id} active={fSeller === u.id} onClick={() => setFSeller(u.id)}>
              {u.short}
            </Chip>
          ))}
        </FilterGroup>
      </Sheet>

      {/* Sheet: territórios */}
      <Sheet open={terrOpen} onClose={() => setTerrOpen(false)} title="Territórios">
        <div className="space-y-2">
          {TERRITORIES.map((x) => (
            <button
              key={x.id}
              onClick={() => { setFTerr(x.id); setTerrOpen(false); }}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border p-3.5 text-left",
                fTerr === x.id && "border-primary",
              )}
            >
              <div>
                <div className="font-semibold">{x.name}</div>
                <div className="text-xs text-muted-foreground">
                  {ests.filter((e) => e.territoryId === x.id).length} estabelecimentos
                </div>
              </div>
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
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {title}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
