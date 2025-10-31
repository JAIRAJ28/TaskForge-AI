// src/Pages/projects/MembersPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { MoreVertical, Search, UserPlus } from "lucide-react";
import { MEMBER_2UI } from "../../Utils/colors";
import MemberRowItem from "../../Components/Members/MemberRowItem";
import InviteModal from "../../Components/Members/InviteModal";
import { useMembersStore } from "../../Service/Store/getMemeberStore";
import { addMember, fetchMembers, removeMember, updateMemberRole } from "../../Service/Api_Calls/memberApi";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const MembersPage: React.FC = () => {
  const [q, setQ] = useState("");
  const [openInvite, setOpenInvite] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "owner">("member");
  
  const { data, loading, error } = useMembersStore();
  const { projectId } = useParams();
  const ownerId = data?.members?.find((m) => m.role === "owner")?.userId?._id;
  const currentUserId: string | undefined = localStorage.getItem("UserID") ?? undefined;
  useEffect(() => {
    if (projectId) fetchMembers(projectId);
  }, [projectId]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!data?.members) return [];
    if (!s) return data.members;

    return data.members.filter(
      (m) =>
        m.userId?.name?.toLowerCase().includes(s) ||
        m.role.toLowerCase().includes(s)
    );
  }, [q, data]);

 async function onPromote(userId: string) {
  if (!projectId) return toast.error("Missing project id");
  const res = await updateMemberRole(projectId, userId, "owner");
  if (res.error) toast.error(res.message);
  else {
    toast.success(res.message || "Role updated");
    await fetchMembers(projectId); 
  }
}
async function onDemote(userId: string) {
  if (!projectId) return toast.error("Missing project id");
  const res = await updateMemberRole(projectId, userId, "member");
  if (res.error) toast.error(res.message);
  else {
    toast.success(res.message || "Role updated");
    await fetchMembers(projectId);
  }
}

async function onRemove(id: string) {
  if (!projectId) return toast.error("Missing project id");
  if (!window.confirm("Are you sure you want to remove this member?")) return;

  try {
    const res = await removeMember(projectId, id);
    if (res.error) return toast.error(res.message || "Failed to remove member");
    toast.success(res.message || "Member removed");
    await fetchMembers(projectId);
  } catch (err: any) {
    toast.error(err?.message || "Something went wrong while removing the member.");
  }
}


  const handleOpenInvite = () => setOpenInvite(true);
  const handleCloseInvite = () => {
    setOpenInvite(false);
    setInviteEmail("");
    setInviteRole("member");
  };

 const handleInviteSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!inviteEmail.trim()) return;
  if (!projectId) {
    toast.error("Missing project id");
    return;
  }
  setInviting(true);
  try {
    const name = inviteEmail.trim();
    const result = await addMember(projectId, name);
    if (!result.error) {
      toast.success(result.message || "Member added.");
      await fetchMembers(projectId); 
      handleCloseInvite();
    } else {
      toast.error(result.message || "Failed to add member");
    }
  } catch (err: any) {
    toast.error(err?.message || "Network error");
  } finally {
    setInviting(false);
  }
};


  return (
    <div className="flex h-full flex-col gap-5 text-[15px] leading-6">
      <header
        className="flex flex-col gap-3 rounded-2xl border px-5 py-4 md:flex-row md:items-center md:justify-between"
        style={{
          background: MEMBER_2UI.panel,
          borderColor: MEMBER_2UI.border,
          color: MEMBER_2UI.text,
          boxShadow:
            "0 6px 20px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        <div className="flex flex-1 items-center gap-3">
          <div className="text-[16px] font-semibold tracking-wide">
            Members
          </div>
          <div className="relative ml-auto w-full max-w-md">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or role…"
              className="w-full rounded-xl border bg-[#0C1118] pl-10 pr-3 py-2.5 outline-none transition"
              style={{
                borderColor: MEMBER_2UI.border,
                color: MEMBER_2UI.text,
              }}
              onFocus={(e) =>
                (e.currentTarget.style.boxShadow = `0 0 0 3px ${MEMBER_2UI.ring}`)
              }
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/65" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenInvite}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[15px] font-semibold transition active:translate-y-px"
            style={{
              color: "white",
              background: "#7483fd",
              boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.64) inset",
            }}
            title="Invite member"
          >
            <UserPlus className="h-5 w-5" />
            Invite
          </button>
          <button
            className="rounded-xl border p-2.5 transition hover:bg-white/10"
            style={{ borderColor: MEMBER_2UI.border }}
            title="More"
          >
            <MoreVertical className="h-5 w-5 text-white/85" />
          </button>
        </div>
      </header>

      <div
        className="flex-1 overflow-auto rounded-2xl border p-4"
        style={{
          background: MEMBER_2UI.card,
          borderColor: MEMBER_2UI.border,
          boxShadow:
            "0 8px 26px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        {loading && (
          <div className="flex h-32 items-center justify-center text-white/75">
            Loading members...
          </div>
        )}

        {error && (
          <div className="flex h-32 items-center justify-center text-red-400">
            {error.message}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="mt-3 space-y-3">
            {filtered.map((m) => (
              <MemberRowItem
                key={m._id}
                member={m}
                ownerId={ownerId}               // 🔹 pass ownerId
                currentUserId={currentUserId}   // 🔹 pass current logged-in user
                onPromote={onPromote}
                onDemote={onDemote}
                onRemove={onRemove}
              />
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div
            className="grid h-36 place-items-center rounded-xl border text-white/75"
            style={{
              borderColor: MEMBER_2UI.border,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.12))",
            }}
          >
            <span className="text-[13px]">No members found.</span>
          </div>
        )}
      </div>

      <InviteModal
        open={openInvite}
        inviting={inviting}
        email={inviteEmail}
        role={inviteRole}
        onClose={handleCloseInvite}
        onSubmit={handleInviteSubmit}
        onEmail={setInviteEmail}
        onRole={setInviteRole}
      />
    </div>
  );
};

export default MembersPage;
