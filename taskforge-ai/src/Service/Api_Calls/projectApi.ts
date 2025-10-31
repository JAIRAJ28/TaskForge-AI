import { isAxiosError } from "axios";
import API from "../Api";
import { PROJECT_COLUMNS, PROJECTS } from "../endpoint";
import type { ProjectListResponse } from "../../Pages/Types/Types";
import { getAuthHeader } from "../../Utils/utils";
import { useProjectsStore, type GetByIdRaw, type GetByNameRaw, type GetMineRaw } from "../Store/getProjectStore";
import { useColumnsStore } from "../Store/getColumnStore";
export interface CreateProjectPayload {
  name: string;
  description: string;
}
export interface Project {
  _id: string;
  name: string;
  description: string;
  ownerId: string;
  members: Array<{ userId: string; role: "owner" | "member" }>;
  createdAt?: string;
  updatedAt?: string;
}
export interface CreateProjectResponse {
  error: boolean;
  message: string;
  projectId?: string;
  project?: Project;
}
export const createProject = async (
  payload: CreateProjectPayload
): Promise<CreateProjectResponse> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("Token") : null;
    if (!token) {
      return {
        error: true,
        message: "Authentication token missing. Please log in again.",
      };
    }
    const res = await API.post<CreateProjectResponse>(PROJECTS, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      timeout: 15000,
    });
    const data = res.data;
    if (data.error) {
      return {
        error: true,
        message: data.message || "Unable to create project.",
      };
    }
    return {
      error: false,
      message: data.message || "Project created successfully.",
      projectId: data.projectId,
      project: data.project,
    };
  } catch (err: unknown) {
    let message = "Unable to create project.";
    if (isAxiosError(err)) {
      message =
        (err.response?.data as { message?: string })?.message ||
        err.response?.statusText ||
        err.message ||
        message;
    } else if (err instanceof Error) {
      message = err.message;
    }
    return {
      error: true,
      message,
    };
  }
};

export type GetProjectPayload = {
  id?: string;     
  name?: string;   
};

export const getAllProject = async ({ id, name }: GetProjectPayload={}): Promise<ProjectListResponse> => {
  const { setLoading, setError, setProjects, setProject } = useProjectsStore.getState();
      setLoading(true);
      setError(null);
      try {
        const headers = {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        };
        if (id) {
          const res = await API.get<GetByIdRaw>(`${PROJECTS}/${id}`, {
            headers,
            timeout: 15000,
          });
          const data = res.data;
          if (data.error || !data.message) {
            const msg = "Unable to fetch project";
            setError(msg);
            setProject(null);
            return { error: true, message: msg };
          }
          setProject(data.message);
          return { error: false, project: data.message };
        }
        if (name) {
          const res = await API.get<GetByNameRaw>(`${PROJECTS}`, {
            headers,
            params: { name },
            timeout: 15000,
          });
          const data = res.data;
          if (data.error) {
            const msg = data?.message || "Unable to fetch projects";
            setError(msg);
            setProjects([]);
            return { error: true, message: msg };
          }
          setProjects(data.projects || []);
          setProject(null);
          return { error: false, projects: data.projects || [] };
        }
        const res = await API.get<GetMineRaw>(`${PROJECTS}`, {
          headers,
          timeout: 15000,
        });
        const data = res.data;
        if (data.error) {
          const msg = "Unable to fetch projects";
          setError(msg);
          setProjects([]);
          return { error: true, message: msg };
        }
        setProjects(data.message || []);
        setProject(null);
        return { error: false, projects: data.message || [] };
      } catch (err: unknown) {
        let message = "Unable to fetch project(s)";
        if (isAxiosError(err)) {
          message =
            (err.response?.data as { message?: string })?.message ||
            err.response?.statusText ||
            err.message ||
            message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        useProjectsStore.getState().setError(message);
        useProjectsStore.getState().setProjects([]);
        return { error: true, message };
      } finally {
        useProjectsStore.getState().setLoading(false);
      }
};


export const getColumnById = async (projectId: string) => {
  const { setColumnsLoading, setColumnsData, setColumnsError } = useColumnsStore.getState();
  setColumnsLoading(true);
  setColumnsError(null);
  try {
    const headers = {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    };
    const endpoint = PROJECT_COLUMNS.replace(":id", projectId);
    const res = await API.get(endpoint, { headers, timeout: 15000 });
    const data = res.data;
    if (data.error) {
      setColumnsError({ message: data?.message || "Failed to fetch columns" });
      setColumnsData(null);
      return { error: true, message: data?.message || "Failed to fetch columns" };
    }
    setColumnsData(data);
    return { error: false, columns: data.columns || [] };
  } catch (err: unknown) {
    let message = "Unable to fetch columns";
    if (isAxiosError(err)) {
      message =
        (err.response?.data as { message?: string })?.message ||
        err.response?.statusText ||
        err.message ||
        message;
    } else if (err instanceof Error) {
      message = err.message;
    }
    setColumnsError({ message });
    setColumnsData(null);
    return { error: true, message };
  } finally {
    useColumnsStore.getState().setColumnsLoading(false);
  }
};

export interface UpdateProjectPayload {
  name: string;
  description: string;
}
export interface UpdateProjectResponse {
  error: boolean;
  message: string;
  project?: Project;
}
export interface DeleteProjectResponse {
  error: boolean;
  message: string;
  project?: Project;
}

export const updateProject = async (
  id: string,
  payload: UpdateProjectPayload
): Promise<UpdateProjectResponse> => {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    };
    const res = await API.patch<UpdateProjectResponse>(`${PROJECTS}/${id}`, payload, {
      headers,
      timeout: 15000,
    });
    const data = res.data;
    if (data.error) {
      return { error: true, message: data.message || "Unable to update project." };
    }
    return {
      error: false,
      message: data.message || "Project updated successfully.",
      project: data.project,
    };
  } catch (err: unknown) {
    let message = "Unable to update project.";
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

export const deleteProject = async (id: string): Promise<DeleteProjectResponse> => {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    };
    const res = await API.delete<DeleteProjectResponse>(`${PROJECTS}/${id}`, {
      headers,
      timeout: 15000,
    });
    const data = res.data;
    if (data.error) {
      return { error: true, message: data.message || "Unable to delete project." };
    }
    return {
      error: false,
      message: data.message || "Project deleted successfully.",
      project: data.project,
    };
  } catch (err: unknown) {
    let message = "Unable to delete project.";
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
