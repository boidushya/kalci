import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface IPublicKeyStore {
  value: string;
  setValue: (value: string) => void;
}

export interface ITriggerRefresh {
  refresh: boolean;
  triggerRefresh: () => void;
}

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
