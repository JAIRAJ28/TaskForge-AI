import React from "react";
import { FolderKanban, Sparkles, Plus } from "lucide-react";

export const ProjectsHome: React.FC = () => {
  return (
    <div className="relative grid h-full w-full place-items-center">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 -left-6 h-48 w-48 rounded-full blur-[60px] bg-[radial-gradient(closest-side,rgba(79,161,249,0.35),transparent_65%)]" />
        <div className="absolute bottom-10 right-6 h-56 w-56 rounded-full blur-[60px] bg-[radial-gradient(closest-side,rgba(18,182,127,0.35),transparent_65%)]" />
      </div>
      <div className="relative mx-auto w-full max-w-[720px] overflow-hidden rounded-3xl border border-white/10 bg-[#141923] p-8 backdrop-blur-xl shadow-[inset_2px_2px_6px_rgba(255,255,255,0.05),_inset_-2px_-2px_6px_rgba(0,0,0,0.35),_0_10px_30px_rgba(0,0,0,0.45)]">
        <div className="absolute -right-3 -top-3 rounded-full border border-white/10 bg-white/5 p-2 text-white/70">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="mx-auto flex max-w-[560px] flex-col items-center text-center">
          <div className="relative mb-6 grid h-24 w-24 place-items-center">
            <div className="absolute inset-0 rounded-2xl opacity-60 blur-xl [background:radial-gradient(closest-side,rgba(79,161,249,0.35),transparent_70%)]" />
            <div className="relative grid h-20 w-20 place-items-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_6px_20px_rgba(0,0,0,0.35)] animate-bounce">
              <FolderKanban className="h-9 w-9 text-white/90" />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-wide">
            <span className="bg-gradient-to-r from-[#4FA1F9] via-white to-[#12B67F] bg-clip-text text-transparent">
              Kickstart your workspace
            </span>
          </h1>
          <p className="mt-3 max-w-[520px] text-sm md:text-base text-white/70">
            Create a project and bring your tasks, teammates, and AI tools together.
            Organize work, track progress, and ship faster—beautifully.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70 animate-[pulse_2.4s_ease-in-out_infinite]">
              Plan → Build → Done ✅
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70 animate-[pulse_2.4s_.4s_ease-in-out_infinite]">
              Kanban Flow 🧩
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70 animate-[pulse_2.4s_.8s_ease-in-out_infinite]">
              AI Assist 🤖
            </span>
          </div>
          <div className="mt-7 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 shadow-[0_6px_20px_rgba(0,0,0,0.35)]">
            <Plus className="h-4 w-4 text-[#12B67F]" />
            <span>Use the “Create” button in the sidebar to start a new project</span>
          </div>

        </div>
      </div>
    </div>
  );
};
