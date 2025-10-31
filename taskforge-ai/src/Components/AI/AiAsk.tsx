import { useState } from "react";
import { Loader2, X, MessageSquareText, Copy, CheckCheck } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { askProjectQuestion } from "../../Service/Api_Calls/AiApi";

const UI = {
  panel: "rgba(14,18,24,0.90)",
  border: "rgba(255,255,255,0.10)",
  text: "#E9EEF7",
  textMuted: "#A7B2C3",
  ring: "rgba(99,143,255,0.35)",
  accent: "linear-gradient(135deg,#63A4FF 0%,#12B67F 100%)",
};

export default function AiAskModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { projectId } = useParams();
  const [question, setQuestion] = useState("");
  const [taskId, setTaskId] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  async function handleAsk() {
    if (!projectId) return toast.error("Missing project ID");
    if (question.trim().length < 3)
      return toast.error("Question must be at least 3 characters long");
      setLoading(true);
      setAnswer("");
      try {
        const res = await askProjectQuestion(projectId, question, taskId);
        if (res?.error) {
          toast.error(res?.message);
        } else {
          toast.success("Answer ready!");
          if ("text" in res && res?.text) {
            setAnswer(res?.text);
          } else {
            setAnswer("");
          }
        }
      } catch (err: any) {
        toast.error(err?.message || "Something went wrong while asking.");
      } finally {
        setLoading(false);
      }
  }


  async function copyOut() {
    if (!answer) return;
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-md p-3">
      <div
        className="w-full max-w-5xl rounded-2xl border p-6 sm:p-7"
        style={{
          background: UI.panel,
          borderColor: UI.border,
          color: UI.text,
          boxShadow:
            "0 50px 120px rgba(0,0,0,0.70), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="grid h-10 w-10 place-items-center rounded-xl"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${UI.border}`,
              }}
            >
              <MessageSquareText className="h-5 w-5" />
            </div>
            <h3 className="text-[18px] font-semibold">Ask the Project</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label
                className="mb-1 block text-xs font-semibold"
                style={{ color: UI.textMuted }}
              >
                Question
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={8}
                placeholder="e.g. What are the current blockers and next 3 actions?"
                className="w-full resize-y rounded-xl border bg-[#0C1118] px-3 py-3 outline-none transition"
                style={{ borderColor: UI.border, color: UI.text }}
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow = `0 0 0 3px ${UI.ring}`)
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
            </div>

            {/* <div>
              <label
                className="mb-1 block text-xs font-semibold"
                style={{ color: UI.textMuted }}
              >
                Focus Task (optional)
              </label> */}
              {/* <input
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                placeholder="Paste a Task name or id to focus"
                className="w-full rounded-xl border bg-[#0C1118] px-3 py-2.5 outline-none transition"
                style={{ borderColor: UI.border, color: UI.text }}
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow = `0 0 0 3px ${UI.ring}`)
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              /> */}
            {/* </div> */}

            <div className="flex items-center gap-2">
              <button
                onClick={handleAsk}
                disabled={loading || question.trim().length < 3}
                className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-[15px] font-semibold transition active:translate-y-px disabled:opacity-60"
                style={{ background: UI.accent, color: "#0B0F14" }}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <MessageSquareText className="h-5 w-5" />
                )}
                Ask
              </button>
            </div>
          </div>

          <div
            className="flex min-h-[280px] flex-col rounded-xl border"
            style={{ borderColor: UI.border }}
          >
            <div
              className="flex items-center justify-between border-b p-2.5"
              style={{ borderColor: UI.border }}
            >
              <span className="text-xs" style={{ color: UI.textMuted }}>
                Answer
              </span>
              <button
                onClick={copyOut}
                disabled={!answer}
                className="rounded-lg px-2.5 py-1.5 text-xs transition hover:bg-white/10 disabled:opacity-50"
                title="Copy"
              >
                {copied ? (
                  <CheckCheck className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="flex-1 overflow-auto p-3.5">
              {loading ? (
                <div className="flex h-[200px] items-center justify-center text-white/75">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Thinking…
                </div>
              ) : answer ? (
                <pre className="whitespace-pre-wrap text-[15px] leading-7">
                  {answer}
                </pre>
              ) : (
                <div className="text-[13px]" style={{ color: UI.textMuted }}>
                  No answer yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
