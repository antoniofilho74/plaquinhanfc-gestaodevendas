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

export type Product = { id: string; name: string; price: number; active: boolean };
export const PRODUCTS: Product[] = [
  { id: "p1", name: "Placa Google NFC", price: 199, active: true },
  { id: "p2", name: "Placa Instagram NFC", price: 199, active: true },
  { id: "p3", name: "Placa WhatsApp NFC", price: 199, active: true },
  { id: "p4", name: "Placa Personalizada NFC", price: 249, active: true },
];

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
  lastVisit?: { date: string; time: string };
  value: number;
  notes?: string;
};

type Row = [string, string, string, string, string, Status, number, number];
const ROWS: Row[] = [
  ["Ótica Avenida", "Ótica", "João Carlos", "t1", "320", "interessado", 30, 34],
  ["Clínica Sorriso", "Clínica", "Amanda Reis", "t1", "410", "retornar", 38, 43],
  ["Barbearia Navalha", "Barbearia", "Rafael Souza", "t1", "128", "vendido", 12, 34],
  ["Restaurante Sabor", "Restaurante", "Carlos Mendes", "t1", "560", "retornar", 48, 34],
  ["Pet Shop Amigo", "Pet shop", "Luana Alves", "t1", "612", "nao_visitado", 57, 43],
  ["Studio Bella", "Salão", "Priscila Nunes", "t1", "700", "vendido", 65, 34],
  ["Farmácia Vida", "Farmácia", "Marcos Dias", "t1", "745", "negociacao", 73, 43],
  ["Café Sertão", "Cafeteria", "Bianca Rocha", "t1", "802", "nao_visitado", 81, 34],
  ["Academia Força", "Academia", "Diego Martins", "t1", "890", "nao_interessado", 90, 43],
  ["Ótica Visão Clara", "Ótica", "Helena Prado", "t1", "215", "vendido", 21, 43],
  ["Barbearia Dom", "Barbearia", "Thiago Lins", "t2", "1020", "vendido", 21, 10],
  ["Clínica Vet Vale", "Clínica", "Dra. Paula Melo", "t2", "1140", "interessado", 29, 20],
  ["Pizzaria Forno", "Restaurante", "Ricardo Gomes", "t2", "1210", "vendido", 21, 54],
  ["Açaí da Praça", "Restaurante", "Jéssica Torres", "t2", "1302", "visitado", 29, 62],
  ["Odonto Prime", "Clínica", "Dr. Felipe Cruz", "t2", "1388", "negociacao", 21, 70],
  ["Loja Moda Sol", "Varejo", "Camila Freitas", "t2", "1450", "nao_visitado", 29, 78],
  ["Barbearia Raiz", "Barbearia", "Bruno Castro", "t2", "1522", "retornar", 21, 86],
  ["Padaria Pão Nosso", "Padaria", "Antônio Silva", "t2", "1600", "vendido", 29, 92],
  ["Hamburgueria Brasa", "Restaurante", "Leandro Pires", "t3", "88", "vendido", 46, 86],
  ["Ótica Olhar", "Ótica", "Renata Farias", "t3", "150", "interessado", 53, 88],
  ["Clínica Derma", "Clínica", "Dra. Luíza Rios", "t3", "230", "nao_interessado", 61, 78],
  ["Espetinho do Zé", "Restaurante", "José Cardoso", "t3", "310", "retornar", 68, 79],
  ["Barbearia Clássica", "Barbearia", "Vinícius Lopes", "t3", "390", "vendido", 76, 69],
  ["Sorveteria Gelato", "Restaurante", "Marina Costa", "t3", "455", "nao_visitado", 83, 69],
  ["Estética Pele", "Salão", "Fernanda Luz", "t3", "520", "visitado", 90, 58],
  ["Livraria Saber", "Varejo", "Paulo Neves", "t4", "45", "vendido", 46, 12],
  ["Clínica Bem Estar", "Clínica", "Dra. Sônia Vaz", "t4", "90", "interessado", 55, 19],
  ["Restaurante Vale do São Francisco", "Restaurante", "Gustavo Reis", "t4", "132", "negociacao", 65, 12],
  ["Ótica Central", "Ótica", "Márcia Leal", "t4", "178", "vendido", 75, 19],
  ["Barber Kings", "Barbearia", "André Moura", "t4", "210", "nao_visitado", 85, 12],
];

const slug = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

const pad = (n: number) => String(n).padStart(2, "0");

export const ESTABLISHMENTS: Establishment[] = ROWS.map((r, i) => {
  const [name, segment, contact, territoryId, number, status, x, y] = r;
  const t = TERRITORIES.find((t) => t.id === territoryId)!;
  const visited = status !== "nao_visitado";
  const day = 25 - (i % 5);
  return {
    id: `e${i + 1}`,
    name,
    segment,
    contact,
    whatsapp: `(87) 9 ${9800 + i * 37}-${pad((i * 13) % 100)}${pad((i * 7) % 100)}`,
    instagram: `@${slug(name)}`,
    street: t.name,
    number,
    territoryId,
    status,
    x,
    y,
    sellerId: territoryId === "t1" || territoryId === "t3" ? "u2" : "u1",
    lastVisit: visited ? { date: `2026-09-${pad(day)}`, time: `${pad(9 + (i % 8))}:${pad((i * 11) % 60)}` } : undefined,
    value: segment === "Clínica" || segment === "Restaurante" ? 249 : 199,
  };
});
// Ótica Avenida specifics from the brief
ESTABLISHMENTS[0].lastVisit = { date: "2026-09-25", time: "09:20" };

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
const statusToResult: Partial<Record<Status, VisitResult>> = {
  visitado: "ausente",
  retornar: "retornar",
  interessado: "interessado",
  negociacao: "interessado",
  vendido: "vendido",
  nao_interessado: "nao_interessado",
};
export const VISITS: Visit[] = [
  { id: "v0", estId: "e1", date: "2026-09-24", time: "10:32", result: "ausente", note: "Primeira visita. Responsável ausente.", userId: "u2" },
  ...ESTABLISHMENTS.filter((e) => e.lastVisit).map((e, i) => ({
    id: `v${i + 1}`,
    estId: e.id,
    date: e.lastVisit!.date,
    time: e.lastVisit!.time,
    result: statusToResult[e.status]!,
    note: e.id === "e1" ? "Falou com João. Demonstrou interesse." : e.status === "vendido" ? "Fechou pedido na hora." : e.status === "retornar" ? "Pediu para voltar outro dia." : "Apresentação feita.",
    userId: e.sellerId,
  })),
];

export type Followup = { id: string; estId: string; date: string; time: string; note: string; done: boolean };
const F = (id: string, estId: string, date: string, time: string, note: string, done = false): Followup => ({ id, estId, date, time, note, done });
export const FOLLOWUPS: Followup[] = [
  F("f1", "e1", "2026-09-25", "10:00", "Retornar para apresentar proposta."),
  F("f2", "e2", "2026-09-25", "14:00", "Levar amostra da placa Google."),
  F("f3", "e4", "2026-09-24", "15:00", "Falar novamente com proprietário."),
  F("f4", "e7", "2026-09-25", "16:30", "Enviar proposta com 2 placas."),
  F("f5", "e12", "2026-09-23", "11:00", "Confirmar interesse com a Dra. Paula."),
  F("f6", "e15", "2026-09-25", "11:30", "Negociar desconto para 3 unidades."),
  F("f7", "e17", "2026-09-25", "15:30", "Dono volta de viagem hoje."),
  F("f8", "e14", "2026-09-22", "09:30", "Tentar falar com a gerente."),
  F("f9", "e20", "2026-09-26", "14:00", "Mostrar modelo Instagram."),
  F("f10", "e22", "2026-09-27", "18:00", "Visitar no horário de abertura."),
  F("f11", "e27", "2026-09-25", "17:00", "Apresentar case de outra clínica."),
  F("f12", "e28", "2026-09-28", "10:00", "Fechar valor com o Gustavo."),
  F("f13", "e3", "2026-09-20", "10:00", "Confirmar dados da arte.", true),
  F("f14", "e6", "2026-09-21", "14:00", "Enviar link do Google.", true),
  F("f15", "e13", "2026-09-22", "16:00", "Coletar logo da pizzaria.", true),
];

export const ORDER_STAGES = ["Venda", "Pagamento", "Dados", "Arte", "NFC", "Produção", "Pronto", "Entrega", "Instalado"] as const;
export const ORDER_STAGE_DONE_LABEL = ["Venda realizada", "Pagamento", "Dados recebidos", "Arte aprovada", "NFC configurado", "Produção", "Pronto", "Entrega", "Instalado"];

export type Order = { id: string; number: string; estId: string; productId: string; qty: number; stage: number; paid: boolean; delivery: string; createdAt: string; link: string };
const soldIds = ESTABLISHMENTS.filter((e) => e.status === "vendido").map((e) => e.id);
const stages = [8, 8, 7, 6, 5, 4, 3, 1, 0, 5];
const prods = ["p1", "p2", "p1", "p3", "p1", "p4", "p2", "p1", "p3", "p1"];
export const ORDERS: Order[] = soldIds.map((estId, i) => ({
  id: `o${i + 1}`,
  number: `#${pad(0)}${115 + i}`.replace("#00", "#00"),
  estId,
  productId: prods[i],
  qty: i === 5 ? 2 : 1,
  stage: stages[i],
  paid: stages[i] >= 1,
  delivery: `2026-09-${pad(22 + i)}`,
  createdAt: `2026-09-${pad(14 + i)}`,
  link: `https://g.page/r/${slug(ESTABLISHMENTS.find((e) => e.id === estId)!.name)}`,
}));
ORDERS.forEach((o) => (o.number = `#00${115 + Number(o.id.slice(1)) - 1}`));

// Deterministic 30-day history for dashboard charts (ending today)
export const DAILY = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 8, 25 - (29 - i));
  const visits = 4 + ((i * 7) % 6) + (i % 7 === 0 ? 0 : 2);
  const sales = Math.max(0, Math.round(visits * (0.18 + ((i * 3) % 5) * 0.03)));
  return { date: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`, visits, sales, revenue: sales * 199 };
});
