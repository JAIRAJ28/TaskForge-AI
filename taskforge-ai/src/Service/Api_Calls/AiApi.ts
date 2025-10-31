import { getAuthHeader } from "../../Utils/utils";
import API from "../Api";
import { AI_ASK, AI_SUMMARIZE } from "../endpoint";
import { useAiAskStore, useAiSummaryStore } from "../Store/AiStore";
import type { ApiError } from "../Store/getColumnStore";

export const getProjectSummary = async (
  projectId: string
): Promise<{ error: boolean; text?: string; message: string }> => {
  const { setAiSummaryLoading, setAiSummaryData, setAiSummaryError } =
    useAiSummaryStore.getState();
  if (!projectId) {
    const message = "Missing project ID";
    setAiSummaryError({ message });
    return { error: true, message };
  }
  setAiSummaryLoading(true);
  try {
    const res = await API.post(
      AI_SUMMARIZE,
      { projectId },
      { headers: { "Content-Type": "application/json", ...getAuthHeader() } }
    );
    const body = res.data;
    if (body?.error) {
      setAiSummaryError({ message: body?.message || "Failed to summarize" });
      return { error: true, message: body?.message || "Failed to summarize" };
    }
    const data = {
      error: false,
      text: body?.text || "",
      message: body?.message || "Summary generated successfully",
    };
    setAiSummaryData(data);
    return data;
  } catch (err: any) {
    const apiErr: ApiError = {
      message: err?.response?.data?.message || err.message || "Network error",
      code: err?.response?.status,
      details: err?.response?.data,
    };
    setAiSummaryError(apiErr);
    return { error: true, message: apiErr.message };
  } finally {
    setAiSummaryLoading(false);
  }
};

export const askProjectQuestion = async (
  projectId: string,
  question: string,
  taskId?: string
): Promise<{ error: boolean; text?: string; message: string }> => {
  const { setAiAskLoading, setAiAskData, setAiAskError } =
    useAiAskStore.getState();
  if (!projectId) {
    const message = "Missing project ID";
    setAiAskError({ message });
    return { error: true, message };
  }
  if (!question?.trim() || question.trim().length < 3) {
    const message = "Question must be at least 3 characters long";
    setAiAskError({ message });
    return { error: true, message };
  }
  setAiAskLoading(true);
  try {
    const res = await API.post(
      AI_ASK,
      { projectId, question: question.trim(), ...(taskId ? { taskId } : {}) },
      { headers: { "Content-Type": "application/json", ...getAuthHeader() } }
    );
    const body = res.data;
    if (body?.error) {
      setAiAskError({ message: body?.message || "Failed to get an answer" });
      return {
        error: true,
        message: body?.message || "Failed to get an answer",
      };
    }
    const data = {
      error: false,
      text: body?.text || "",
      message: body?.message || "Answer received successfully",
    };
    setAiAskData(data);
    return data;
  } catch (err: any) {
    const apiErr: ApiError = {
      message: err?.response?.data?.message || err.message || "Network error",
      code: err?.response?.status,
      details: err?.response?.data,
    };
    setAiAskError(apiErr);
    return { error: true, message: apiErr.message };
  } finally {
    setAiAskLoading(false);
  }
};
