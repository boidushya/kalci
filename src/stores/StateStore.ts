import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface IPublicKeyStore {
  value: string;
  setValue: (value: string) => void;
}

export interface IPointsStore {
  userPoints: number;
  totalPoints: number;
  setUserPoints: (points: number) => void;
  resetUserPoints: () => void;
  setTotalPoints: (points: number) => void;
  resetTotalPoints: () => void;
}

export interface ITriggerRefresh {
  refresh: boolean;
  triggerRefresh: () => void;
}

export const usePointsStore: () => IPointsStore = create<IPointsStore>()(
  devtools(
    persist(
      (set, get) => ({
        userPoints: 0,
        totalPoints: 0,
        setUserPoints: (points: number) => set({ userPoints: points }),
        resetUserPoints: () => set({ userPoints: 0 }),
        setTotalPoints: (points: number) => set({ totalPoints: points }),
        resetTotalPoints: () => set({ totalPoints: 0 }),
        getUserPoints: () => get().userPoints,
        getTotalPoints: () => get().totalPoints,
      }),
      {
        name: "KM::PointsStore",
      }
    )
  )
);

export const usePublicKeyStore: () => IPublicKeyStore =
  create<IPublicKeyStore>()(
    devtools(
      persist(
        (set) => ({
          value: "",
          setValue: (value: string) => set({ value }),
        }),
        {
          name: "KM::PublicKeyStore",
        }
      )
    )
  );

export const useTriggerRefresh: () => ITriggerRefresh = create<ITriggerRefresh>(
  (set) => ({
    refresh: false,
    triggerRefresh: () => {
      set({ refresh: true });
      setTimeout(() => {
        set({ refresh: false });
      }, 1);
    },
  })
);
