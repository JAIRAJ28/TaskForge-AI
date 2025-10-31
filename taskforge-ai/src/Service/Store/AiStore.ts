// src/Service/Store/aiSummaryStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ApiError } from "./authRegisterStore";


export type AiSummaryResponse = {
  error: boolean;
  text?: string;       
  message?: string;    
};

export type AiSummaryState = {
  data: AiSummaryResponse | null;
  loading: boolean;
  error: ApiError | null;
};

export type AiSummaryMutators = {
  setAiSummaryLoading: (loading: boolean) => void;
  setAiSummaryData: (data: AiSummaryResponse | null) => void;
  setAiSummaryError: (err: ApiError | null) => void;
  resetAiSummary: () => void;
};

export const useAiSummaryStore = create<AiSummaryState & AiSummaryMutators>()(
  persist(
    (set) => ({
      data: null,
      loading: false,
      error: null,
      setAiSummaryLoading: (loading) => set({ loading }),
      setAiSummaryData: (data) => set({ data, loading: false, error: null }),
      setAiSummaryError: (err) => set({ error: err, loading: false }),
      resetAiSummary: () => set({ data: null, loading: false, error: null }),
    }),
    {
      name: "ai-summary",               // localStorage key
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // keep persisted state minimal
      partialize: (s) => ({ data: s.data }),
    }
  )
);


export type AiAskResponse = {
  error: boolean;
  text?: string;       // model answer
  message?: string;    // server message (optional)
};

export type AiAskState = {
  data: AiAskResponse | null;
  loading: boolean;
  error: ApiError | null;
};

export type AiAskMutators = {
  setAiAskLoading: (loading: boolean) => void;
  setAiAskData: (data: AiAskResponse | null) => void;
  setAiAskError: (err: ApiError | null) => void;
  resetAiAsk: () => void;
};

export const useAiAskStore = create<AiAskState & AiAskMutators>()(
  persist(
    (set) => ({
      data: null,
      loading: false,
      error: null,
      setAiAskLoading: (loading) => set({ loading }),
      setAiAskData: (data) => set({ data, loading: false, error: null }),
      setAiAskError: (err) => set({ error: err, loading: false }),
      resetAiAsk: () => set({ data: null, loading: false, error: null }),
    }),
    {
      name: "ai-ask",                   // localStorage key
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ data: s.data }),
    }
  )
);
