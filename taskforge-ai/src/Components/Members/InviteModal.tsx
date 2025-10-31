// src/Pages/projects/InviteModal.tsx
import React from "react";
import { Loader2, Mail, UserPlus, X } from "lucide-react";
import type { Role } from "../../Pages/Types/Types";
import { MEMBER_2UI } from "../../Utils/colors";

export default function InviteModal({
  open,
  inviting,
  email,
  role,
  onClose,
  onSubmit,
  onEmail,
  onRole,
}: {
  open: boolean;
  inviting: boolean;
  email: string;
  role: Role;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onEmail: (v: string) => void;
  onRole: (r: Role) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-[95%] max-w-[520px] rounded-2xl border p-5"
        style={{ background: MEMBER_2UI.card, borderColor: MEMBER_2UI.border, color: MEMBER_2UI.text }}
      >
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-semibold">Invite Member</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-2 space-y-3">
          <div>
            <label
              className="mb-1 block text-xs font-bold"
              style={{ color: MEMBER_2UI.textMuted }}
            >
              Email
            </label>
            <div className="relative">
              <input
                type="text"
                value={email}
                onChange={(e) => onEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-xl border bg-[#0C1118] px-3 py-2.5 outline-none transition"
                style={{ borderColor: MEMBER_2UI.border, color: MEMBER_2UI.text }}
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow = `0 0 0 3px ${MEMBER_2UI.ring}`)
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
              <Mail className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
            </div>
          </div>

          <div>
            <label
              className="mb-1 block text-xs font-bold"
              style={{ color: MEMBER_2UI.textMuted }}
            >
              Role
            </label>
            <select
              className="w-full rounded-xl border bg-[#0C1118] px-3 py-2.5 outline-none"
              style={{ borderColor: MEMBER_2UI.border, color: MEMBER_2UI.text }}
              value={role}
              onChange={(e) => onRole(e.target.value as Role)}
            >
              <option className="bg-[#121821]" value="member">
                Member
              </option>
              <option className="bg-[#121821]" value="owner">
                Owner
              </option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-4 py-2 text-sm transition hover:bg-white/10"
              style={{ borderColor: MEMBER_2UI.border, color: MEMBER_2UI.textMuted }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={inviting || !email.trim()}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition active:translate-y-px disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg,#63A4FF 0%,#12B67F 100%)",
                color: "#0B0F14",
              }}
            >
              {inviting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Send Invite
            </button>
          </div>
        </form>

        <p className="mt-3 text-[11px]" style={{ color: MEMBER_2UI.textMuted }}>
          Only the project owner can change roles or remove members.
        </p>
      </div>
    </div>
  );
}
