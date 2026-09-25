import { TODAY } from "./mock";

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const dm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

export const dayDiff = (iso: string) =>
  Math.round((new Date(iso + "T00:00:00").getTime() - new Date(TODAY + "T00:00:00").getTime()) / 86400000);

export const relDay = (iso: string) => {
  const d = dayDiff(iso);
  if (d === 0) return "Hoje";
  if (d === 1) return "Amanhã";
  if (d === -1) return "Ontem";
  return dm(iso);
};

export const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export const initials = (s: string) =>
  s.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
