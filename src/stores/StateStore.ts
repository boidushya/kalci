import { create } from "zustand";

export interface IParseDialogStore {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useParseDialogStore: () => IParseDialogStore =
  create<IParseDialogStore>()((set) => ({
    open: false,
    setOpen: (open: boolean) => {
      set({ open });
    },
  }));
