import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { TODAY } from "@/lib/mock";
import { dayDiff } from "@/lib/format";
import { Chip, PageHeader } from "@/components/app/ui";
import { FollowupCard } from "@/components/app/FollowupCard";

export const Route = createFileRoute("/followups")({
  head: () => ({
    meta: [
      { title: "Follow-ups — Tap Comercial" },
      { name: "description", content: "Retornos de hoje, atrasados, próximos e concluídos." },
      { property: "og:title", content: "Follow-ups — Tap Comercial" },
      { property: "og:description", content: "Retornos de hoje, atrasados, próximos e concluídos." },
    ],
  }),
  component: Followups,
});

function Followups() {
  const { followups } = useStore();
  const groups = {
    hoje: followups.filter((f) => !f.done && f.date === TODAY),
    atrasados: followups.filter((f) => !f.done && dayDiff(f.date) < 0),
    proximos: followups.filter((f) => !f.done && dayDiff(f.date) > 0),
    concluidos: followups.filter((f) => f.done),
  };
  const [tab, setTab] = useState<keyof typeof groups>("hoje");
  const labels = { hoje: "Hoje", atrasados: "Atrasados", proximos: "Próximos", concluidos: "Concluídos" };
  const list = [...groups[tab]].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return (
    <div>
      <PageHeader title="Follow-ups" />
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 no-scrollbar md:mx-0 md:px-0">
        {(Object.keys(groups) as (keyof typeof groups)[]).map((k) => <Chip key={k} active={tab === k} onClick={() => setTab(k)} count={groups[k].length}>{labels[k]}</Chip>)}
      </div>
      <div className="grid gap-2.5 md:grid-cols-2">
        {list.map((f) => <FollowupCard key={f.id} f={f} />)}
        {!list.length && <div className="card-surface p-6 text-center text-sm text-muted-foreground md:col-span-2">Nada por aqui.</div>}
      </div>
    </div>
  );
}
