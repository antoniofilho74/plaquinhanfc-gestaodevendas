import { useEffect, useState } from "react";
import { Check, Heart, RotateCw, UserX, X } from "lucide-react";
import { toast } from "sonner";
import { Sheet, Field, inputCls, Btn } from "./ui";
import { useStore } from "@/lib/store";
import { RESULT_LABEL, type VisitResult } from "@/lib/mock";
import { cn } from "@/lib/utils";

const OPTIONS: { r: VisitResult; icon: typeof Check; cls: string }[] = [
  { r: "interessado", icon: Heart, cls: "text-st-interessado" },
  { r: "retornar", icon: RotateCw, cls: "text-warn" },
  { r: "ausente", icon: UserX, cls: "text-st-visitado" },
  { r: "nao_interessado", icon: X, cls: "text-st-perdido" },
  { r: "vendido", icon: Check, cls: "text-st-vendido" },
];

export function VisitSheet({ estId, open, onClose }: { estId?: string | undefined; open: boolean; onClose: () => void }) {
  const { est, registerVisit } = useStore();
  const [result, setResult] = useState<VisitResult | null>(null);
  const [note, setNote] = useState("");
  const [date, setDate] = useState("2026-09-26");
  const [time, setTime] = useState("14:00");
  useEffect(() => {
    if (open) { setResult(null); setNote(""); }
  }, [open]);
  const e = estId ? est(estId) : undefined;
  const needsReturn = result === "retornar" || result === "interessado" || result === "ausente";

  const save = () => {
    if (!e || !result) return;
    registerVisit(e.id, result, note, needsReturn ? { date, time } : undefined);
    toast.success("Visita registrada", { description: `${e.name} · ${RESULT_LABEL[result]}` });
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={<div><div className="text-xs font-normal text-muted-foreground">Registrar visita</div><div className="truncate">{e?.name}</div></div>}
      footer={<Btn className="h-12 w-full" disabled={!result} onClick={save}>Salvar visita</Btn>}
    >
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Qual foi o resultado?</p>
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map(({ r, icon: I, cls }) => (
          <button key={r} onClick={() => setResult(r)} className={cn("flex h-14 items-center gap-2.5 rounded-xl border bg-card px-3 text-left text-sm font-semibold transition", result === r ? "border-primary ring-2 ring-primary/15" : "hover:bg-accent", r === "vendido" && "col-span-2")}>
            <I className={cn("h-5 w-5 shrink-0", cls)} />
            {RESULT_LABEL[r]}
          </button>
        ))}
      </div>
      {needsReturn && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Field label="Retorno — data"><input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Horário"><input type="time" className={inputCls} value={time} onChange={(e) => setTime(e.target.value)} /></Field>
        </div>
      )}
      <div className="mt-4">
        <Field label="Observações">
          <textarea rows={3} className={cn(inputCls, "h-auto py-2.5")} placeholder="Ex.: falou com o dono, pediu proposta…" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </div>
    </Sheet>
  );
}
