import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, CalendarClock, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { dayDiff, relDay } from "@/lib/format";
import type { Followup } from "@/lib/mock";
import { Sheet, Field, inputCls, Btn } from "./ui";
import { cn } from "@/lib/utils";

export function FollowupCard({ f }: { f: Followup }) {
  const { est, completeFollowup, rescheduleFollowup } = useStore();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("2026-09-26");
  const [time, setTime] = useState(f.time);
  const e = est(f.estId);
  if (!e) return null;
  const diff = dayDiff(f.date);
  const late = !f.done && diff < 0;

  return (
    <div className={cn("card-surface relative overflow-hidden p-3.5", late && "border-st-perdido/30", f.done && "opacity-60")}>
      {late && <div className="absolute inset-y-0 left-0 w-1 bg-st-perdido/70" />}
      <div className="flex items-start gap-3">
        <div className="w-12 shrink-0">
          <div className="tabular text-[15px] font-semibold">{f.time}</div>
          <div className={cn("text-[11px] font-medium", late ? "text-st-perdido" : "text-muted-foreground")}>
            {late ? `Atrasado ${-diff}d` : relDay(f.date)}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <Link to="/estabelecimentos/$id" params={{ id: e.id }} className="block truncate font-semibold hover:underline">{e.name}</Link>
          <div className="text-xs text-muted-foreground">Responsável: {e.contact.split(" ").slice(0, 2).join(" ")}</div>
          <p className="mt-1.5 text-sm text-foreground/80">“{f.note}”</p>
        </div>
      </div>
      {!f.done && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <a href={`https://wa.me/55${e.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border text-[13px] font-semibold hover:bg-accent">
            <MessageCircle className="h-4 w-4 text-st-vendido" /> WhatsApp
          </a>
          <button onClick={() => { completeFollowup(f.id); toast.success("Follow-up concluído"); }} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary text-[13px] font-semibold text-primary-foreground">
            <Check className="h-4 w-4" /> Concluir
          </button>
          <button onClick={() => setOpen(true)} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border text-[13px] font-semibold hover:bg-accent">
            <CalendarClock className="h-4 w-4" /> Reagendar
          </button>
        </div>
      )}
      <Sheet open={open} onClose={() => setOpen(false)} title="Reagendar follow-up"
        footer={<Btn className="h-12 w-full" onClick={() => { rescheduleFollowup(f.id, date, time); setOpen(false); toast.success("Follow-up reagendado"); }}>Salvar</Btn>}>
        <p className="mb-3 text-sm text-muted-foreground">{e.name}</p>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Data"><input type="date" className={inputCls} value={date} onChange={(ev) => setDate(ev.target.value)} /></Field>
          <Field label="Horário"><input type="time" className={inputCls} value={time} onChange={(ev) => setTime(ev.target.value)} /></Field>
        </div>
      </Sheet>
    </div>
  );
}
