// src/Components/Members/MemberRowItem.tsx
import { Crown, Trash2 } from "lucide-react";
import Avatar from "./Avatar";
import { MEMBER_2UI } from "../../Utils/colors";
import RoleSym from "./RoleSym";
import { useLoginStore } from "../../Service/Store/authRegisterStore";

type MemberWire = {
  _id: string;
  role: "owner" | "member";
  userId: { _id: string; name: string; password?: string };
};
export default function MemberRowItem({
  member,
  onPromote,
  onRemove,
  ownerId,
}: {
  member: MemberWire;
  onPromote: (id: string) => void;
  onDemote: (id: string) => void;
  onRemove: (id: string) => void;
  ownerId?: string;
  currentUserId?: string;
}) {
  const {data} = useLoginStore()
  console.log(data,"check the data loginData")
  const isOwner = member.role === "owner";
  const isCurrentOwner = data?.user?.id === ownerId; // ✅ only project owner can modify roles
  const name = member.userId?.name || "Unknown User";
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "UU";
  console.log( data?.user?.id,isCurrentOwner,isOwner,member,ownerId, data?.user?.id,"currentUserIdcurrentUserIdcurrentUserId")
  return (
    <div
      className="rounded-2xl border p-3 transition-all duration-200 hover:-translate-y-[1px]"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.18))",
        borderColor: MEMBER_2UI.border,
        boxShadow: "0 12px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      <div className="grid items-center gap-3 sm:grid-cols-12">
        <div className="col-span-12 flex items-center gap-3 sm:col-span-6">
          <Avatar initials={initials} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-[15px] font-semibold text-white/95">
                {name}
              </span>
              {isOwner && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[11px] font-semibold"
                  style={{
                    background: "rgba(245,185,66,0.18)",
                    color: MEMBER_2UI.amber,
                    boxShadow: "inset 0 0 0 1px rgba(245,185,66,0.25)",
                  }}
                >
                  <Crown className="h-3.5 w-3.5" />
                  Owner
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-6 sm:col-span-3">
          <RoleSym role={member.role} />
        </div>

        {/* ✅ Only project owner can see Promote/Demote/Remove buttons */}
        {isCurrentOwner && (
          <div className="col-span-6 sm:col-span-3">
            <div className="flex items-center justify-end gap-1.5">
               {!isOwner &&( <button
                  onClick={() => onPromote(member.userId._id)}
                  className="rounded-lg px-2.5 py-2 text-[12px] transition hover:bg-white/10"
                  style={{ color: MEMBER_2UI.text }}
                  title="Make owner"
                >
                  <Crown className="mr-1 inline-block h-4 w-4 text-white/80" />
                  Promote
                </button>)}

              {!isOwner && (
                <button
                  onClick={() => onRemove(member.userId._id)}
                  className="rounded-lg p-2 transition hover:bg-white/10"
                  style={{ color: MEMBER_2UI.red }}
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
