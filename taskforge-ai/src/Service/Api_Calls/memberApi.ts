import { isAxiosError, type AxiosError } from "axios";
import API from "../Api";
import { useMembersStore, type ApiError, type MembersResponse } from "../Store/getMemeberStore";

export async function fetchMembers(projectId: string) {
  const { setMembersLoading, setMembersData, setMembersError } = useMembersStore.getState();
  try {
    setMembersLoading(true);
    const res = await API.get<MembersResponse>(`/projects/${projectId}/members`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${localStorage.getItem("Token") || ""}`,
      },
    });
    if (!res.data || res.data.error) {
      setMembersError({
        message: res.data?.message || "Failed to fetch members",
        code: res.status,
      });
      return;
    }
    setMembersData(res.data);
  }catch (err) {
    const axiosErr = err as AxiosError<{ message?: string }>;
    const formattedError: ApiError = {
      message:
        axiosErr.response?.data?.message ||
        axiosErr.message ||
        "Network error",
      code: axiosErr.response?.status,
      details: axiosErr.response?.data,
    };
    setMembersError(formattedError);
  }
}

export const addMember = async (projectId: string, name: string, role: string = "member") => {
  const { setMembersLoading, setMembersData, setMembersError } = useMembersStore.getState();
  setMembersLoading(true);
  try {
    const res = await API.post(
      `/projects/${projectId}/members`,
      {name,role},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("Token") || ""}`,
        },
      }
    );
    const body = res.data;
    if (!body || typeof body !== "object") {
      throw new Error("Invalid response from server.");
    }
    if (body.error) {
      setMembersError({
        message: body.message || "Failed to add member.",
        code: res.status,
      });
      return { error: true, message: body.message };
    }
    setMembersData({
      error: false,
      members: body.members || [],
    });
    return { error: false, message: body.message };
  } catch (err: any) {
    const apiErr: ApiError = {
      message: err?.response?.data?.message || err.message || "Network error",
      code: err?.response?.status,
      details: err?.response?.data,
    };
    setMembersError(apiErr);
    return { error: true, message: apiErr.message };
  }
};



export async function updateMemberRole(
  projectId: string,
  userId: string,
  role: "owner" | "member"
): Promise<{ error: boolean; message: string }> {
  const {
    setMembersLoading,
    setMembersData,
    setMembersError,
  } = useMembersStore.getState();
  setMembersLoading(true);
  try {
    const res = await API.patch(
      `/projects/${projectId}/members/${userId}`,
      { role },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("Token") || "",
        },
        timeout: 15000,
      }
    );
    const body = res?.data as {
      error?: boolean;
      message?: string;
      members?: Array<{
        _id: string;
        role: "owner" | "member";
        userId: { _id: string; name: string };
      }>;
    };

    if (!body || typeof body !== "object") {
      throw new Error("Invalid response from server.");
    }
    if (body.error) {
      const msg = body.message || "Failed to update role.";
      setMembersError({ message: msg, code: res.status });
      return { error: true, message: msg };
    }
    setMembersData({
      error: false,
      members: body.members || [],
    });

    return { error: false, message: body.message || "Role updated." };
  } catch (err: unknown) {
    const apiErr: ApiError = isAxiosError(err)
      ? {
          message:
            (err.response?.data as { message?: string })?.message ||
            err.response?.statusText ||
            err.message ||
            "Network error",
          code: err.response?.status,
          details: err.response?.data as Record<string, unknown> | undefined,
        }
      : err instanceof Error
      ? { message: err.message }
      : { message: "Network error" };

    setMembersError(apiErr);
    return { error: true, message: apiErr.message };
  } finally {
    setMembersLoading(false);
  }
}

export const removeMember = async (
  projectId: string,
  userId: string
): Promise<{ error: boolean; message: string }> => {
  const { setMembersLoading, setMembersData, setMembersError } =
    useMembersStore.getState();
  setMembersLoading(true);
  try {
    const res = await API.delete(`/projects/${projectId}/members/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${localStorage.getItem("Token") || ""}`,
      },
    });
    const body = res.data;
    if (!body || typeof body !== "object") {
      throw new Error("Invalid response from server.");
    }
    if (body.error) {
      setMembersError({
        message: body.message || "Failed to remove member.",
        code: res.status,
      });
      return { error: true, message: body.message };
    }
    setMembersData({
      error: false,
      members: body.members || [],
    });
    return { error: false, message: body.message };
  } catch (err: any) {
    const apiErr: ApiError = {
      message: err?.response?.data?.message || err.message || "Network error",
      code: err?.response?.status,
      details: err?.response?.data,
    };
    setMembersError(apiErr);
    return { error: true, message: apiErr.message };
  } finally {
    setMembersLoading(false);
  }
};