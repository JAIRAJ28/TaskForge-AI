import { isAxiosError } from "axios";
import { useTasksStore } from "../Store/useTaskStore";
import { PROJECT_TASKS, TASKS } from "../endpoint";
import API from "../Api";
import { getAuthHeader } from "../../Utils/utils";
import type { CreateTaskPayload, CreateTaskResponse } from "../../Pages/Types/Types";

export const getTasksByProjectId = async (projectId: string) => {
  console.log(projectId,"projectIdprojectIdprojectIdprojectId")
  const { setTasksLoading, setTasksError, setTasksData } = useTasksStore.getState();
  setTasksLoading(true);
  setTasksError(null);
  try {
    if (!projectId) {
      const msg = "Project ID is required";
      setTasksError({ message: msg });
      setTasksData(null);
      return { error: true, message: msg };
    }
    const headers = {
      "Content-Type": "application/json",
      ...getAuthHeader(), 
    };
    console.log(PROJECT_TASKS.replace(":id", projectId),"PROJECT_TASKS.replace(projectId)")
    const res = await API.get(PROJECT_TASKS.replace(":id", projectId), {
      headers,
      timeout: 15000,
    });
    const data = res.data;
    if (data?.error) {
      const msg = data?.message || "Unable to fetch tasks";
      setTasksError({ message: msg });
      setTasksData(null);
      return { error: true, message: msg };
    }
    setTasksData(data);
    return { error: false, tasks: data?.tasks || [] };
  } catch (err: unknown) {
    let message = "Unable to fetch tasks";
    if (isAxiosError(err)) {
      message =
        (err.response?.data as { message?: string })?.message ||
        err.response?.statusText ||
        err.message ||
        message;
    } else if (err instanceof Error) {
      message = err.message;
    }
    useTasksStore.getState().setTasksError({ message });
    useTasksStore.getState().setTasksData(null);
    return { error: true, message };
  } finally {
    useTasksStore.getState().setTasksLoading(false);
  }
};


export const createTask = async (
  payload: CreateTaskPayload
): Promise<CreateTaskResponse> => {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    };
    const res = await API.post(TASKS, payload, {
      headers,
      timeout: 15000,
    });
    const data = res.data;
    if (data.error) {
      const msg = data.message || "Unable to create task";
      return { error: true, message: msg };
    }
    return {
      error: false,
      message: data.message || "Task created successfully",
      task: data.task,
    };
  } catch (err: unknown) {
    let message = "Unable to create task";
    if (isAxiosError(err)) {
      message =
        (err.response?.data as { message?: string })?.message ||
        err.response?.statusText ||
        err.message ||
        message;
    } else if (err instanceof Error) {
      message = err.message;
    }
    return { error: true, message };
  }
};



export interface UpdateTaskResponse {
  error: boolean;
  message: string;
  task?: any;
}

export async function updateTask(
  taskId: string,
  payload: {
    title?: string;
    description?: string;
    columnId?:string;
    difficulty?: "easy" | "medium" | "hard";
    order?: number;
  }
): Promise<UpdateTaskResponse> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("Token") : null;
    if (!token) return { error: true, message: "No auth token found" };
    try {
        const res = await API.patch(
        `${TASKS}/${taskId}`,
        payload,
        {
            headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
            },
            timeout: 20_000,
        }
        );
        return res.data;
    } catch (err) {
        if (isAxiosError(err)) {
        return {
            error: true,
            message: err.response?.data?.message || "Request failed",
        };
        }
        return { error: true, message: (err as Error).message };
    }
}



export async function deleteTask(taskId: string): Promise<UpdateTaskResponse> {
  const token = typeof window !== "undefined" ? localStorage.getItem("Token") : null;
  if (!token) return { error: true, message: "No auth token found" };
  try {
    const res = await API.delete<UpdateTaskResponse>(`${TASKS}/${taskId}`, {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
      timeout: 20_000,
    });
    return res.data;
  } catch (err) {
    if (isAxiosError(err)) {
      return {
        error: true,
        message: (err.response?.data as any)?.message || err.message || "Request failed",
      };
    }
    return { error: true, message: (err as Error).message };
  }
}