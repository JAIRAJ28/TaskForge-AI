// src/Pages/projects/RoleSym.tsx
import { Crown, ShieldCheck } from "lucide-react";
import { MEMBER_2UI } from "../../Utils/colors";
import type { Role } from "../../Pages/Types/Types";

export default function RoleSym({ role }: { role: Role }) {
  const isOwner = role === "owner";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-[4px] text-[12px] font-semibold"
      style={{
        background: isOwner ? "rgba(245,185,66,0.18)" : "rgba(79,161,249,0.15)",
        color: isOwner ? MEMBER_2UI.amber : MEMBER_2UI.blue,
        boxShadow: `inset 0 0 0 1px ${
          isOwner ? "rgba(245,185,66,0.25)" : "rgba(79,161,249,0.25)"
        }`,
      }}
    >
      {isOwner ? <Crown className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
      {isOwner ? "Owner" : "Member"}
    </span>
  );
}
