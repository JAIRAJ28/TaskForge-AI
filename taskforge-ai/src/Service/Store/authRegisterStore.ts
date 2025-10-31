import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ApiError = {
  message: string;
  code?: number;
  details?: object;
};

export interface RegisterResponse {
  error: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
  };
  token?: string;
}

/* ======================= Register Store (with persist) ======================= */

export type RegisterState = {
  data: RegisterResponse | null;
  loading: boolean;
  error: ApiError | null;
};

export type RegisterMutators = {
  setRegisterLoading: (loading: boolean) => void;
  setRegisterData: (data: RegisterResponse | null) => void;
  setRegisterError: (err: ApiError | null) => void;
  registerReset: () => void;
};

export const useRegisterStore = create<RegisterState & RegisterMutators>()(
  persist(
    (set) => ({
      data: null,
      loading: false,
      error: null,
      setRegisterLoading: (loading) => set({ loading }),
      setRegisterData: (data) => set({ data, loading: false, error: null }),
      setRegisterError: (err) => set({ error: err, loading: false }),
      registerReset: () => set({ data: null, loading: false, error: null }),
    }),
    {
      name: "register-store",
      storage: createJSONStorage(() => localStorage),
      // persist only the useful data; skip loading/error
      partialize: (state) => ({ data: state.data }),
      version: 1,
    }
  )
);

/* ======================== Login Store (with persist) ======================== */

export type LoginState = {
  data: RegisterResponse | null;
  loading: boolean;
  error: ApiError | null;
};

export type LoginMutators = {
  setloginLoading: (loading: boolean) => void;
  setloginData: (data: RegisterResponse | null) => void;
  setloginError: (err: ApiError | null) => void;
  registerloginReset: () => void;
};

export const useLoginStore = create<LoginState & LoginMutators>()(
  persist(
    (set) => ({
      data: null,
      loading: false,
      error: null,
      setloginLoading: (loading) => set({ loading }),
      setloginData: (data) => set({ data, loading: false, error: null }),
      setloginError: (err) => set({ error: err, loading: false }),
      registerloginReset: () => set({ data: null, loading: false, error: null }),
    }),
    {
      name: "login-store",
      storage: createJSONStorage(() => localStorage),
      // persist only the useful data; skip loading/error
      partialize: (state) => ({ data: state.data }),
      version: 1,
    }
  )
);
