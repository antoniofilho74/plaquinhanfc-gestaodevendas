import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Columns3, List, CalendarClock, Plus, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { STATUS, type Status, type Establishment } from "@/lib/mock";
import { brl, relDay } from "@/lib/format";
import { Chip, PageHeader, StatusDot, inputCls, Sheet, Field, Btn } from "@/components/app/ui";
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

const EMPTY_FORM = { nome: "", whatsapp: "", estabelecimento: "", rua: "", bairro: "", cidade: "" };

type SpeechResultEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function parseVoiceLead(transcript: string) {
  const labels: Record<string, keyof typeof EMPTY_FORM> = {
    nome: "nome",
    whatsapp: "whatsapp",
    telefone: "whatsapp",
    estabelecimento: "estabelecimento",
    empresa: "estabelecimento",
    rua: "rua",
    avenida: "rua",
    bairro: "bairro",
    cidade: "cidade",
  };
  const keys = Object.keys(labels).join("|");
  const pattern = new RegExp(`(?:^|[,;.])\\s*(${keys})\\s*[:：]\\s*([^,;.]+)`, "gi");
  const values: Partial<typeof EMPTY_FORM> = {};
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(transcript)) !== null) {
    const key = labels[match[1].toLowerCase()];
    if (key) values[key] = match[2].trim();
  }
  return values;
}

function Crm() {
  const { ests, followups, addEstablishment } = useStore();
  const [view, setView] = useState<"kanban" | "lista">("lista");
  const [stage, setStage] = useState<Status | "all">("all");
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const [recognition, setRecognition] = useState<SpeechRecognitionLike | null>(null);

  const toggleVoiceInput = () => {
    if (listening) {
      recognition?.stop();
      setListening(false);
      return;
    }

    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const SpeechRecognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceMessage("O ditado por voz não é compatível com este navegador. Você pode preencher os campos manualmente.");
      return;
    }

    const instance = new SpeechRecognition();
    instance.lang = "pt-BR";
    instance.interimResults = false;
    instance.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0]?.transcript ?? "").join(" ");
      const parsed = parseVoiceLead(transcript);
      if (Object.keys(parsed).length) {
        setForm((current) => ({ ...current, ...parsed }));
        setVoiceMessage("Dados reconhecidos. Confira os campos antes de salvar.");
      } else {
        setVoiceMessage("Não identifiquei os campos. Dite no formato indicado abaixo e tente novamente.");
      }
    };
    instance.onerror = (event) => {
      setListening(false);
      setVoiceMessage(event.error === "not-allowed" || event.error === "service-not-allowed"
        ? "Permita o acesso ao microfone nas configurações do navegador e tente novamente."
        : "Não foi possível reconhecer a fala. Tente novamente ou preencha os campos manualmente.");
    };
    instance.onend = () => setListening(false);
    setRecognition(instance);
    setVoiceMessage("Fale os campos com seus nomes, por exemplo: nome: Ana, WhatsApp: 87999999999, estabelecimento: Padaria Central, rua: Avenida Brasil, bairro: Centro, cidade: Petrolina.");
    setListening(true);
    try {
      instance.start();
    } catch {
      setListening(false);
      setVoiceMessage("Não foi possível iniciar o microfone. Confira a permissão do navegador e tente novamente.");
    }
  };

  const set = (k: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = () => {
    if (!form.nome.trim() || !form.estabelecimento.trim()) return;
    setSaving(true);
    const id = `e${Date.now()}`;
    addEstablishment({
      id,
      name: form.estabelecimento.trim(),
      segment: "Lead manual",
      contact: form.nome.trim(),
      whatsapp: form.whatsapp.trim(),
      instagram: "",
      street: [form.rua.trim(), form.bairro.trim()].filter(Boolean).join(" — "),
      number: "",
      territoryId: "",
      status: "nao_visitado",
      x: 0,
      y: 0,
      sellerId: "u1",
      value: 0,
      notes: `Cidade: ${form.cidade.trim()}`,
    });
    setSaving(false);
    setForm(EMPTY_FORM);
    setAddOpen(false);
  };
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAddOpen(true)}
              aria-label="Adicionar lead"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-primary text-primary-foreground shadow-sm transition hover:bg-primary/90 active:scale-[0.97]"
            >
              <Plus className="h-4 w-4" />
            </button>
            <div className="flex rounded-lg border bg-card p-0.5">
            {(["kanban", "lista"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={cn("inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold uppercase", view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
                {v === "kanban" ? <Columns3 className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{v}</span>
              </button>
            ))}
          </div>
            </div>
        }
      />

      <Sheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Novo lead"
        footer={
          <div className="flex gap-2">
            <Btn variant="outline" className="flex-1" onClick={() => setAddOpen(false)} disabled={saving}>
              Cancelar
            </Btn>
            <Btn variant="primary" className="flex-1" onClick={handleSave} disabled={saving || !form.nome.trim() || !form.estabelecimento.trim()}>
              {saving ? "Salvando…" : "Salvar lead"}
            </Btn>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          <div className="rounded-xl border border-border/70 bg-muted/40 p-3">
            <button
              type="button"
              onClick={toggleVoiceInput}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.98]"
              aria-pressed={listening}
            >
              <Sparkles className="h-4 w-4" />
              {listening ? "Parar ditado" : "Cadastrar por voz"}
            </button>
            <p aria-live="polite" className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {voiceMessage || "Dite os dados no formato: nome: Ana, WhatsApp: 87999999999, estabelecimento: Padaria Central, rua: Avenida Brasil, bairro: Centro, cidade: Petrolina."}
            </p>
          </div>
          <Field label="Nome do contato *">
            <input
              className={inputCls}
              placeholder="Ex.: João Silva"
              value={form.nome}
              onChange={set("nome")}
              autoComplete="off"
            />
          </Field>
          <Field label="WhatsApp">
            <input
              className={inputCls}
              placeholder="(87) 9 0000-0000"
              value={form.whatsapp}
              onChange={set("whatsapp")}
              inputMode="tel"
              autoComplete="off"
            />
          </Field>
          <Field label="Nome do estabelecimento *">
            <input
              className={inputCls}
              placeholder="Ex.: Padaria do João"
              value={form.estabelecimento}
              onChange={set("estabelecimento")}
              autoComplete="off"
            />
          </Field>
          <Field label="Rua / Avenida">
            <input
              className={inputCls}
              placeholder="Ex.: Av. Souza Filho, 120"
              value={form.rua}
              onChange={set("rua")}
              autoComplete="off"
            />
          </Field>
          <Field label="Bairro">
            <input
              className={inputCls}
              placeholder="Ex.: Centro"
              value={form.bairro}
              onChange={set("bairro")}
              autoComplete="off"
            />
          </Field>
          <Field label="Cidade">
            <input
              className={inputCls}
              placeholder="Ex.: Petrolina"
              value={form.cidade}
              onChange={set("cidade")}
              autoComplete="off"
            />
          </Field>
        </div>
      </Sheet>

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
