import { folder } from "@/types";
import { create } from "zustand";

interface SidebarState {
  open: boolean;
  folder: folder | null;
  loading: boolean;
  ChangeState: () => void;
  keepClose: () => void;
  setLoading: (value: boolean) => void;
  setfolder: (folder: folder) => void;
}

const useSidebarStore = create<SidebarState>((set) => ({
  open: false,
  folder: null,
  loading: false,

  ChangeState: () => {
    set((state) => ({ open: !state.open }));
  },

  keepClose: () => {
    set(() => ({ open: false }));
  },

  setfolder: (folder: folder) => {
    set(() => ({ folder: folder }));
  },

  setLoading: (value: boolean) => {
    set((state) => ({ loading: !state.loading }));
  },
}));

export default useSidebarStore;
