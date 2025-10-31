import { useState } from "react";
import { Loader2, Copy, CheckCheck, X, Sparkles, Wand2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { getProjectSummary } from "../../Service/Api_Calls/AiApi";
import ReactMarkdown from "react-markdown";

const UI = {
  panel: "rgba(14,18,24,0.90)",
  border: "rgba(255,255,255,0.10)",
  text: "#E9EEF7",
  textMuted: "#A7B2C3",
  ring: "rgba(99,143,255,0.35)",
  accent: "linear-gradient(135deg,#63A4FF 0%,#12B67F 100%)",
};

export default function AiSummarizeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  async function onSummarize() {
    if (!projectId) return toast.error("Missing project id");
    setLoading(true);
    setText("");
    try {
      const res = await getProjectSummary(projectId);
      if (res.error) {
        toast.error(res.message || "Failed to summarize");
        return;
      }
      setText(res.text ?? "");
      toast.success("Summary ready");
    } catch (e: any) {
      toast.error(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  async function copyOut() {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-md p-3">
      <div
        className="w-full max-w-5xl rounded-2xl border p-6 sm:p-7 max-h-[90vh] overflow-auto scrollbar-thin"
        style={{
          background: UI.panel,
          borderColor: UI.border,
          color: UI.text,
          boxShadow: "0 50px 120px rgba(0,0,0,0.70), inset 0 1px 0 rgba(255,255,255,0.05)",
          scrollbarColor: "rgba(255,255,255,0.18) transparent",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="grid h-10 w-10 place-items-center rounded-xl"
              style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${UI.border}` }}
            >
              <Wand2 className="h-5 w-5" />
            </div>
            <h3 className="text-[18px] font-semibold">Project Summary</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div
            className="rounded-xl border p-3 text-[13px]"
            style={{ borderColor: UI.border, color: UI.textMuted }}
          >
            One-click snapshot: status counts, highlights, risks, next actions.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSummarize}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-[15px] font-semibold transition active:translate-y-px disabled:opacity-60"
              style={{ background: UI.accent, color: "#0B0F14" }}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              Summarize
            </button>
            <button
              onClick={copyOut}
              disabled={!text}
              className="rounded-2xl border px-3.5 py-2.5 text-sm transition hover:bg-white/10 disabled:opacity-50"
              style={{ borderColor: UI.border }}
              title="Copy"
            >
              {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <div
            className="rounded-xl border"
            style={{ borderColor: UI.border, background: "rgba(255,255,255,0.03)" }}
          >
            <div
              className="max-h-[55vh] overflow-auto p-3.5 scrollbar-thin"
              style={{ scrollbarColor: "rgba(255,255,255,0.18) transparent" }}
            >
              {loading ? (
                <div className="flex h-[200px] items-center justify-center text-white/75">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating…
                </div>
              ) : text ? (
                <div className="prose prose-invert max-w-none text-[15px] leading-7">
                  <ReactMarkdown>{text}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-[13px]" style={{ color: UI.textMuted }}>
                  No summary yet. Click Summarize to begin.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
