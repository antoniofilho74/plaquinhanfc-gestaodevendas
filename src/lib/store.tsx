import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  ESTABLISHMENTS, FOLLOWUPS, ORDERS, VISITS, TODAY, PRODUCTS,
  type Establishment, type Followup, type Order, type Status, type Visit, type VisitResult,
} from "./mock";
import { nowTime } from "./format";

const resultToStatus: Record<VisitResult, Status> = {
  vendido: "vendido",
  interessado: "interessado",
  retornar: "retornar",
  ausente: "retornar",
  nao_interessado: "nao_interessado",
  fechado: "visitado",
  nao_visitar: "nao_interessado",
};

type Ctx = {
  ests: Establishment[];
  visits: Visit[];
  followups: Followup[];
  orders: Order[];
  est: (id: string) => Establishment | undefined;
  registerVisit: (estId: string, result: VisitResult, note: string, ret?: { date: string; time: string }) => void;
  addFollowup: (estId: string, date: string, time: string, note: string) => void;
  completeFollowup: (id: string) => void;
  rescheduleFollowup: (id: string, date: string, time: string) => void;
  advanceOrder: (id: string) => void;
  addEstablishment: (e: Establishment) => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ests, setEsts] = useState(ESTABLISHMENTS);
  const [visits, setVisits] = useState(VISITS);
  const [followups, setFollowups] = useState(FOLLOWUPS);
  const [orders, setOrders] = useState(ORDERS);

  const value = useMemo<Ctx>(() => {
    const addFollowup = (estId: string, date: string, time: string, note: string) =>
      setFollowups((f) => [{ id: `f${Date.now()}`, estId, date, time, note, done: false }, ...f]);
    return {
      ests, visits, followups, orders,
      est: (id) => ests.find((e) => e.id === id),
      registerVisit: (estId, result, note, ret) => {
        const time = nowTime();
        setEsts((all) => all.map((e) => (e.id === estId ? { ...e, status: resultToStatus[result], lastVisit: { date: TODAY, time } } : e)));
        setVisits((v) => [...v, { id: `v${Date.now()}`, estId, date: TODAY, time, result, note, userId: "u1" }]);
        if (ret) addFollowup(estId, ret.date, ret.time, note || "Retornar ao estabelecimento.");
        if (result === "vendido") {
          setOrders((o) => [
            {
              id: `o${Date.now()}`, number: `#00${115 + o.length}`, estId, productId: "p1", qty: 1,
              stage: 0, paid: false, delivery: "2026-10-02", createdAt: TODAY, link: "https://exemplo.com",
            },
            ...o,
          ]);
        }
      },
      addFollowup,
      completeFollowup: (id) => setFollowups((f) => f.map((x) => (x.id === id ? { ...x, done: true } : x))),
      rescheduleFollowup: (id, date, time) => setFollowups((f) => f.map((x) => (x.id === id ? { ...x, date, time } : x))),
      advanceOrder: (id) => setOrders((o) => o.map((x) => (x.id === id ? { ...x, stage: Math.min(8, x.stage + 1), paid: true } : x))),
      addEstablishment: (e) => setEsts((all) => [e, ...all]),
    };
  }, [ests, visits, followups, orders]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export const useStore = () => {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("StoreProvider missing");
  return c;
};

export function territoryStats(ests: Establishment[], territoryId: string) {
  const list = ests.filter((e) => e.territoryId === territoryId);
  const visited = list.filter((e) => e.status !== "nao_visitado").length;
  const sales = list.filter((e) => e.status === "vendido").length;
  return {
    total: list.length,
    visited,
    remaining: list.length - visited,
    sales,
    pct: list.length ? Math.round((visited / list.length) * 100) : 0,
    conv: visited ? (sales / visited) * 100 : 0,
  };
}
