import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Project } from "../../Pages/Types/Types";

type ProjectsState = {
  loading: boolean;
  error: string | null;
  projects: Project[];
  project: Project | null;

  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
  setProjects: (list: Project[]) => void;
  setProject: (p: Project | null) => void;
  reset: () => void;
};

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set) => ({
      loading: false,
      error: null,
      projects: [],
      project: null,

      setLoading: (v) => set({ loading: v }),
      setError: (msg) => set({ error: msg }),
      setProjects: (list) => set({ projects: list }),
      setProject: (p) => set({ project: p }),
      reset: () =>
        set({ loading: false, error: null, projects: [], project: null }),
    }),
    {
      name: "projects-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ projects: state.projects, project: state.project }),
      version: 1,
    }
  )
);
export type GetByIdRaw = { error: boolean; message: Project };
export type GetByNameRaw = { error: boolean; projects: Project[]; message?: string };
export type GetMineRaw = { error: boolean; message: Project[] };
