import { create } from "zustand";

export interface IParseDialogStore {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export interface ITriggerRefresh {
  refresh: boolean;
  triggerRefresh: () => void;
}

export const useParseDialogStore: () => IParseDialogStore =
  create<IParseDialogStore>()((set) => ({
    open: false,
    setOpen: (open: boolean) => {
      set({ open });
    },
  }));

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
