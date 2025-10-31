// src/Pages/projects/Avatar.tsx
// import React from "react";
import { User } from "lucide-react";
import { MEMBER_2UI } from "../../Utils/colors";

export default function Avatar({ initials }: { initials: string }) {
  return (
    <div
      className="grid h-10 w-10 place-items-center rounded-full border text-[12.5px] font-semibold"
      style={{
        borderColor: MEMBER_2UI.border,
        background:
          "linear-gradient(145deg, rgba(99,143,255,0.22), rgba(18,182,127,0.22))",
        color: "#FFFFFF",
        boxShadow: "0 0 10px rgba(99,143,255,0.22)",
      }}
      title={initials}
    >
      <User className="mr-[2px] hidden h-4 w-4 opacity-80" />
      {initials}
    </div>
  );
}
