import type { Establishment } from "@/lib/mock";
import { STATUS } from "@/lib/mock";
import { cn } from "@/lib/utils";

/** Simulated street map of central Petrolina (no external API). Coordinates are 0–100. */
export function MapCanvas({ ests, selectedId, onSelect, highlight }: { ests: Establishment[]; selectedId?: string | undefined; onSelect: (id: string) => void; highlight?: string | undefined }) {
  const road = (id: string) => (highlight && highlight !== id ? 0.55 : 1);
  return (
    <div className="absolute inset-0 overflow-hidden bg-[var(--map-land)]">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {Array.from({ length: 11 }).map((_, i) =>
          Array.from({ length: 11 }).map((__, j) => (
            <rect key={`${i}-${j}`} x={i * 9.5 + 1} y={j * 9.5 + 1} width="7.6" height="7.6" rx="0.8" fill={(i * 3 + j) % 13 === 0 ? "var(--map-park)" : "var(--map-block)"} />
          )),
        )}
        {/* Rio São Francisco */}
        <path d="M0,97 C20,92 35,99 55,96 S85,90 100,94 L100,100 L0,100 Z" fill="var(--map-water)" />
        {/* minor streets */}
        {[10, 48, 60, 90].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="100" stroke="var(--map-road)" strokeWidth="1" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 5 }} />)}
        {[26, 52, 66].map((y) => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="var(--map-road)" style={{ strokeWidth: 5 }} vectorEffect="non-scaling-stroke" />)}
        {/* main avenues */}
        {[
          { id: "t1", d: "M0,38.5 L100,38.5" },
          { id: "t2", d: "M25,0 L25,100" },
          { id: "t3", d: "M40,95 L96,56" },
          { id: "t4", d: "M38,15.5 L100,15.5" },
        ].map((r) => (
          <g key={r.id} opacity={road(r.id)}>
            <path d={r.d} stroke="var(--map-road-edge)" fill="none" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 14 }} strokeLinecap="round" />
            <path d={r.d} stroke={highlight === r.id ? "var(--brand)" : "var(--map-road)"} strokeOpacity={highlight === r.id ? 0.35 : 1} fill="none" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 11 }} strokeLinecap="round" />
          </g>
        ))}
      </svg>
      {[
        { t: "Av. Souza Filho", x: 52, y: 38.5, rot: 0 },
        { t: "Av. Monsenhor Ângelo Sampaio", x: 25, y: 40, rot: 90 },
        { t: "Av. Guararapes", x: 66, y: 76.5, rot: -30 },
        { t: "R. Pacífico da Luz", x: 70, y: 15.5, rot: 0 },
        { t: "Rio São Francisco", x: 70, y: 97, rot: 0 },
      ].map((l) => (
        <div key={l.t} className="pointer-events-none absolute whitespace-nowrap text-[10px] font-medium tracking-wide text-[var(--map-label)]" style={{ left: `${l.x}%`, top: `${l.y}%`, transform: `translate(-50%,-50%) rotate(${l.rot}deg)` }}>
          {l.t}
        </div>
      ))}
      {ests.map((e) => {
        const sel = e.id === selectedId;
        return (
          <button
            key={e.id}
            onClick={() => onSelect(e.id)}
            aria-label={e.name}
            className="absolute -translate-x-1/2 -translate-y-1/2 p-1.5"
            style={{ left: `${e.x}%`, top: `${e.y}%`, zIndex: sel ? 20 : 10 }}
          >
            <span className={cn("relative flex items-center justify-center rounded-full border-2 border-card shadow-float transition-transform", STATUS[e.status].dot, sel ? "h-8 w-8 scale-110" : "h-6 w-6")}>
              {sel && <span className={cn("absolute inset-0 animate-ping rounded-full opacity-40", STATUS[e.status].dot)} />}
              <span className="h-2 w-2 rounded-full bg-card" />
            </span>
            {sel && <span className="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">{e.name}</span>}
          </button>
        );
      })}
    </div>
  );
}
