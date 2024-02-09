import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type THolding = {
  token: string;
  balance: number;
};

type TAPY = {
  token: string;
  apy: number;
};

export interface ITokenStore {
  holdings: THolding[];
  addHolding: (token: string, balance: number) => void;
  removeHolding: (token: string) => void;
  modifyHolding: (token: string, balance: number) => void;
  getTotalValue: () => number;
  getBalance: (token: string) => number;
}

export interface IAPYStore {
  apyMap: TAPY[];
  getApy: (token: string) => number;
  modifyApy: (token: string, apy?: number) => void;
}

export const useApyStore: () => IAPYStore = create<IAPYStore>()(
  devtools(
    persist(
      (set, get) => ({
        apyMap: [],
        getApy: (token: string) => {
          const apy = get().apyMap.find((a) => a.token === token)?.apy || 0;
          return apy;
        },
        modifyApy: (token: string, apy = 0) => {
          set((state) => {
            if (state.apyMap.some((a) => a.token === token)) {
              return {
                apyMap: state.apyMap.map((a) => {
                  if (a.token === token) {
                    a.apy = apy;
                  }
                  return a;
                }),
              };
            }
            return {
              apyMap: [...state.apyMap, { token, apy }],
            };
          });
        },
      }),
      {
        name: "KM::ApyStore",
      }
    )
  )
);

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
