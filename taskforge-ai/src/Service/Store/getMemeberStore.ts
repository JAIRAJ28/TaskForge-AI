import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ApiError = {
  message: string;
  code?: number;
  details?: Record<string, unknown>;
};

export interface MemberUser {
  _id: string;
  name: string;
  password?: string;
}

export type MemberRole = "owner" | "member";

export interface Member {
  _id: string;
  role: MemberRole;
  userId: MemberUser;
}

export interface MembersResponse {
  error: boolean;
  members: Member[];
  message?: string;
}

export type MembersState = {
  data: MembersResponse | null;
  loading: boolean;
  error: ApiError | null;
};

export type MembersMutators = {
  setMembersLoading: (loading: boolean) => void;
  setMembersData: (data: MembersResponse | null) => void;
  setMembersError: (err: ApiError | null) => void;
  resetMembers: () => void;
};

export const useMembersStore = create<MembersState & MembersMutators>()(
  persist(
    (set) => ({
      data: null,
      loading: false,
      error: null,
      setMembersLoading: (loading) => set({ loading }),
      setMembersData: (data) => set({ data, loading: false, error: null }),
      setMembersError: (err) => set({ error: err, loading: false }),
      resetMembers: () => set({ data: null, loading: false, error: null }),
    }),
    {
      name: "members-store", 
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ data: state.data }),
      version: 1,
    }
  )
);
