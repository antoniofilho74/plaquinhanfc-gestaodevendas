export const TODAY = "2026-09-25";

export type Status =
  | "nao_visitado"
  | "visitado"
  | "retornar"
  | "interessado"
  | "negociacao"
  | "vendido"
  | "nao_interessado";

export const STATUS: Record<Status, { label: string; dot: string; soft: string; text: string }> = {
  nao_visitado: { label: "Não visitado", dot: "bg-st-novo", soft: "bg-st-novo/10 text-st-novo", text: "text-st-novo" },
  visitado: { label: "Visitado", dot: "bg-st-visitado", soft: "bg-st-visitado/10 text-st-visitado", text: "text-st-visitado" },
  retornar: { label: "Retornar", dot: "bg-st-retornar", soft: "bg-st-retornar/15 text-warn", text: "text-warn" },
  interessado: { label: "Interessado", dot: "bg-st-interessado", soft: "bg-st-interessado/12 text-st-interessado", text: "text-st-interessado" },
  negociacao: { label: "Negociação", dot: "bg-st-negociacao", soft: "bg-st-negociacao/10 text-st-negociacao", text: "text-st-negociacao" },
  vendido: { label: "Vendido", dot: "bg-st-vendido", soft: "bg-st-vendido/12 text-st-vendido", text: "text-st-vendido" },
  nao_interessado: { label: "Não interessado", dot: "bg-st-perdido", soft: "bg-st-perdido/10 text-st-perdido", text: "text-st-perdido" },
};
export const STATUS_ORDER: Status[] = ["nao_visitado", "visitado", "interessado", "retornar", "negociacao", "vendido", "nao_interessado"];

export type User = { id: string; name: string; short: string; role: string };
export const USERS: User[] = [
  { id: "u1", name: "Antonio Filho", short: "Antonio", role: "Administrador" },
  { id: "u2", name: "João Pedro", short: "João", role: "Vendedor" },
  { id: "u3", name: "Carlos Lima", short: "Carlos", role: "Produção" },
];

export type Territory = { id: string; name: string; short: string; bairro: string };
export const TERRITORIES: Territory[] = [
  { id: "t1", name: "Av. Souza Filho", short: "Souza Filho", bairro: "Centro" },
  { id: "t2", name: "Av. Monsenhor Ângelo Sampaio", short: "Monsenhor", bairro: "Centro" },
  { id: "t3", name: "Av. Guararapes", short: "Guararapes", bairro: "Gercino Coelho" },
  { id: "t4", name: "Rua Pacífico da Luz", short: "Pacífico da Luz", bairro: "Centro" },
];

export type Product = { id: string; name: string; price: number; active: boolean; archived?: boolean; imageUrl?: string };
export const PRODUCTS: Product[] = [];

export type Establishment = {
  id: string;
  name: string;
  segment: string;
  contact: string;
  whatsapp: string;
  instagram: string;
  street: string;
  number: string;
  territoryId: string;
  status: Status;
  x: number;
  y: number;
  sellerId: string;
  lastVisit?: { date: string; time: string } | undefined;
  value: number;
  notes?: string | undefined;
};

const slug = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

const pad = (n: number) => String(n).padStart(2, "0");

void slug;
void pad;

export const ESTABLISHMENTS: Establishment[] = [];

export type VisitResult = "vendido" | "interessado" | "retornar" | "ausente" | "nao_interessado" | "fechado" | "nao_visitar";
export const RESULT_LABEL: Record<VisitResult, string> = {
  vendido: "Vendido",
  interessado: "Interessado",
  retornar: "Retornar",
  ausente: "Responsável ausente",
  nao_interessado: "Não interessado",
  fechado: "Fechado",
  nao_visitar: "Não visitar novamente",
};

export type Visit = { id: string; estId: string; date: string; time: string; result: VisitResult; note: string; userId: string };
export const VISITS: Visit[] = [];

export type Followup = { id: string; estId: string; date: string; time: string; note: string; done: boolean };
export const FOLLOWUPS: Followup[] = [];

export const ORDER_STAGES = ["Venda", "Pagamento", "Dados", "Arte", "NFC", "Produção", "Pronto", "Entrega", "Instalado"] as const;
export const ORDER_STAGE_DONE_LABEL = ["Venda realizada", "Pagamento", "Dados recebidos", "Arte aprovada", "NFC configurado", "Produção", "Pronto", "Entrega", "Instalado"];

export type Order = { id: string; number: string; estId: string; productId: string; qty: number; stage: number; paid: boolean; delivery: string; createdAt: string; link: string };
export const ORDERS: Order[] = [];

// Histórico diário — será preenchido com dados reais
export const DAILY: { date: string; visits: number; sales: number; revenue: number }[] = [];
