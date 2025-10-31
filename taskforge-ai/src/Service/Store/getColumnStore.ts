import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ApiError = {
  message: string;
  code?: number;
  details?: Record<string, unknown>;
};

export type ColumnKey = "todo" | "in_progress" | "done";
export interface Column {
  _id: string;
  projectId: string;
  key: ColumnKey;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface ColumnsResponse {
  error: boolean;
  columns: Column[];
}

export type ColumnsState = {
  data: ColumnsResponse | null;
  loading: boolean;
  error: ApiError | null;
};

export type ColumnsMutators = {
  setColumnsLoading: (loading: boolean) => void;
  setColumnsData: (data: ColumnsResponse | null) => void;
  setColumnsError: (err: ApiError | null) => void;
  resetColumns: () => void;
};

export const useColumnsStore = create<ColumnsState & ColumnsMutators>()(
  persist(
    (set) => ({
      data: null,
      loading: false,
      error: null,
      setColumnsLoading: (loading) => set({ loading }),
      setColumnsData: (data) => set({ data, loading: false, error: null }),
      setColumnsError: (err) => set({ error: err, loading: false }),
      resetColumns: () => set({ data: null, loading: false, error: null }),
    }),
    {
      name: "columns-store",
      storage: createJSONStorage(() => localStorage),
      // persist only the response data; omit loading/error flags
      partialize: (state) => ({ data: state.data }),
      version: 1,
    }
  )
);
