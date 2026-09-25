import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/ui";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Tap Comercial" },
      { name: "description", content: "Preferências da conta e da operação." },
      { property: "og:title", content: "Configurações — Tap Comercial" },
      { property: "og:description", content: "Preferências da conta e da operação." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const rows = [["Empresa", "Tap Comercial"], ["Cidade base", "Petrolina · PE"], ["Meta diária de visitas", "25"], ["Horário de prospecção", "08:00 – 18:00"], ["Integrações", "Disponível na próxima etapa"]];
  return (
    <div className="max-w-2xl">
      <PageHeader title="Configurações" />
      <dl className="card-surface divide-y">
        {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 px-4 py-3.5 text-sm"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}
      </dl>
    </div>
  );
}
