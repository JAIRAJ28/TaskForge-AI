"use client";

import { Toaster } from "sonner";

export function GlobalToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast: "backdrop-blur-xl bg-[#50708e]/70 border border-[#1f2b3a]/40 shadow-[0_0_10px_rgba(0,255,255,0.15)] text-[#e5f3f0]",
          title: "font-semibold text-[15px]",
          description: "text-[#cbd5e1] text-[13px]",
          actionButton: "bg-gradient-to-r from-[#0ea5a0] to-[#2563eb] text-white font-medium px-3 py-1 rounded-md hover:opacity-90 transition",
          cancelButton: "text-[#9be5ff] hover:text-[#c2f7ff]",
        },
      }}
    />
  );
}
