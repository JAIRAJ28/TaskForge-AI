import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { TaskListResponse } from "../../Pages/Types/Types";

export type ApiError = {
  message: string;
  code?: number;
  details?: Record<string, unknown>;
};
export type TaskState = {
  data: TaskListResponse | null;
  loading: boolean;
  error: ApiError | null;
};
export type TaskMutators = {
  setTasksLoading: (loading: boolean) => void;
  setTasksData: (data: TaskListResponse | null) => void;
  setTasksError: (err: ApiError | null) => void;
  resetTasks: () => void;
};
export const useTasksStore = create<TaskState & TaskMutators>()(
  persist(
    (set) => ({
      data: null,
      loading: false,
      error: null,
      setTasksLoading: (loading) => set({ loading }),
      setTasksData: (data) => set({ data, loading: false, error: null }),
      setTasksError: (err) => set({ error: err, loading: false }),
      resetTasks: () => set({ data: null, loading: false, error: null }),
    }),
    {
      name: "tasks-store", 
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ data: state.data }),
      version: 1,
    }
  )
);
