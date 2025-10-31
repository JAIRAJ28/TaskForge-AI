import React, { useState } from "react";
import { Sparkles, MessageSquareText, ChevronRight, Bot } from "lucide-react";
import AiSummarizeModal from "../../Components/AI/AiSummary";
import AiAskModal from "../../Components/AI/AiAsk";

const UI = {
  bg: "radial-gradient(1200px 720px at 50% -10%, rgba(99,143,255,0.18), rgba(0,0,0,0) 60%), radial-gradient(900px 600px at 100% 0%, rgba(18,182,127,0.16), rgba(0,0,0,0) 60%)",
  border: "rgba(255,255,255,0.10)",
  text: "#EDF2FA",
  textMuted: "#B7C2D3",
  accent: "linear-gradient(135deg,#6AA6FF 0%,#18C08B 100%)",
};

const AiHome: React.FC = () => {
  const [openSummarize, setOpenSummarize] = useState(false);
  const [openAsk, setOpenAsk] = useState(false);

  return (
    <div className="relative h-full w-full">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: UI.bg }} />
      <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-center p-4 sm:p-6 lg:p-10">
        <section
          className="rounded-3xl border p-8 sm:p-12"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(0,0,0,0.18))",
            borderColor: UI.border,
            boxShadow: "0 24px 64px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="mb-7 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px]"
            style={{ borderColor: UI.border, color: UI.text }}
          >
            <Bot className="h-4 w-4" /> AI Tools
          </div>

          {/* Bigger, warmer headline & subhead */}
          <h1 className="text-[36px] font-extrabold leading-[1.1] tracking-tight text-white sm:text-[42px] lg:text-[48px]">
            Welcome to <span className="text-white/90">Project&nbsp;AI</span>
          </h1>
          <p className="mt-3 max-w-3xl text-[16px] leading-relaxed sm:text-[18px]" style={{ color: UI.textMuted }}>
            Summarize your work at a glance. Ask anything about the project. Fast, clear, and on-point.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setOpenSummarize(true)}
              className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[17px] font-semibold transition active:translate-y-px"
              style={{ background: UI.accent, color: "#0B0F14" }}
            >
              <Sparkles className="h-5 w-5" />
              Summarize
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => setOpenAsk(true)}
              className="inline-flex items-center gap-2 rounded-2xl border px-6 py-3.5 text-[17px] font-semibold transition hover:bg-white/10 active:translate-y-px"
              style={{ borderColor: UI.border, color: UI.text }}
            >
              <MessageSquareText className="h-5 w-5" />
              Ask
            </button>
          </div>

          <div className="mt-9 grid gap-3 text-[13px] sm:grid-cols-2">
            <div
              className="rounded-xl border px-4 py-2.5"
              style={{ borderColor: UI.border, background: "rgba(255,255,255,0.06)", color: UI.text }}
            >
              <span className="font-semibold">Summary</span> — instant brief.
            </div>
            <div
              className="rounded-xl border px-4 py-2.5"
              style={{ borderColor: UI.border, background: "rgba(255,255,255,0.06)", color: UI.text }}
            >
              <span className="font-semibold">Ask</span> — quick answers.
            </div>
          </div>
        </section>
      </div>

      <AiSummarizeModal open={openSummarize} onClose={() => setOpenSummarize(false)} />
      <AiAskModal open={openAsk} onClose={() => setOpenAsk(false)} />
    </div>
  );
};

export default AiHome;
