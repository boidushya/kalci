import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type THolding = {
  token: string;
  balance: number;
};

interface ITokenStore {
  holdings: THolding[];
  addHolding: (token: string, balance: number) => void;
  removeHolding: (token: string) => void;
  modifyHolding: (token: string, balance: number) => void;
  getTotalValue: () => number;
  getBalance: (token: string) => number;
}

export const useTokenStore: () => ITokenStore = create<ITokenStore>()(
  devtools(
    persist(
      (set, get) => ({
        holdings: [],
        addHolding: (token: string, balance: number) =>
          set((state) => ({
            holdings: [
              ...state.holdings,
              {
                token,
                balance,
              },
            ],
          })),
        removeHolding: (token: string) =>
          set((state) => ({
            holdings: state.holdings.filter((h) => h.token !== token),
          })),
        modifyHolding: (token: string, balance: number) =>
          set((state) => ({
            holdings: state.holdings.map((h) => {
              if (h.token === token) {
                h.balance = balance;
              }
              return h;
            }),
          })),
        getTotalValue: () =>
          get().holdings.reduce(
            (acc: number, h: { balance: number }) => acc + h.balance,
            0
          ),
        getBalance: (token: string) =>
          get().holdings.find((h) => h.token === token)?.balance || 0,
      }),
      {
        name: "KM::TokenStore",
      }
    )
  )
);
