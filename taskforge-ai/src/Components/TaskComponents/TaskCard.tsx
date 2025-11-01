// TaskCard.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GripVertical, Tag, Clock, User, MoreVertical, X, Edit2, Trash2 } from "lucide-react";
import { deleteTask, updateTask } from "../../Service/Api_Calls/taskApi";
import { toast } from "sonner";

export type CardTask = {
  id?: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  tags?: string[];
  due?: string;
  points?: number;
  assignees?: string[];
};

export type TaskCardProps = {
  task: CardTask;
  taskId?: string;
  columnId?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  showDragHandle?: boolean;
  onUpdated?: (task: {
    _id: string;
    title: string;
    description?: string;
    difficulty: "easy" | "medium" | "hard";
    order?: number;
  }) => void;
  onDelete?: (taskId: string) => void;
  accentColors?: {
    low?: string;
    medium?: string;
    high?: string;
    border?: string;
  };
};

const FALLBACK_COLORS = {
  low: "#1e3349ff",
  medium: "#624a1aff",
  high: "#362328ff",
  border: "rgba(255,255,255,0.07)",
};

const EDITS_KEY = "task_edits_cache_v1";
type LocalEdit = {
  _id: string;
  title?: string;
  description?: string;
  difficulty?: "easy" | "medium" | "hard";
  order?: number;
  updatedAt: number;
};
const loadEdits = (): Record<string, LocalEdit> => {
  try {
    return JSON.parse(localStorage.getItem(EDITS_KEY) || "{}");
  } catch {
    return {};
  }
};
const saveEdit = (e: LocalEdit) => {
  const all = loadEdits();
  all[e._id] = e;
  localStorage.setItem(EDITS_KEY, JSON.stringify(all));
};

function Avatar({ initials, borderColor }: { initials: string; borderColor: string }) {
  return (
    <div
      className="grid h-7 w-7 place-items-center rounded-full border text-[11px] font-semibold"
      style={{
        borderColor,
        background:
          "linear-gradient(145deg, rgba(99,143,255,0.22), rgba(18,182,127,0.22))",
        color: "#FFFFFF",
        boxShadow: "0 0 8px rgba(99,143,255,0.18)",
      }}
      title={initials}
    >
      <User className="mr-[2px] hidden h-3.5 w-3.5 opacity-80" />
      {initials}
    </div>
  );
}

function MoreCount({ n, borderColor }: { n: number; borderColor: string }) {
  return (
    <div
      className="grid h-7 w-7 place-items-center rounded-full border text-[10px] font-semibold text-white/85"
      style={{ borderColor, background: "rgba(255,255,255,0.06)" }}
      title={`+${n}`}
    >
      +{n}
    </div>
  );
}

function formatDue(due: string) {
  try {
    const d = new Date(due);
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "2-digit" };
    return d.toLocaleDateString(undefined, opts);
  } catch {
    return due;
  }
}


export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  taskId,
  columnId,
  className,
  style,
  onClick,
  showDragHandle = true,
  onUpdated,
  onDelete,
  accentColors,
}) => {
  const colors = { ...FALLBACK_COLORS, ...(accentColors || {}) };
  const id = taskId ?? task.id ?? (task as any)?._id;

  const [display, setDisplay] = useState<CardTask>(task);
  useEffect(() => {
    setDisplay(task);
  }, [task]);

  const priColor =
    display.priority === "high"
      ? colors.high
      : display.priority === "medium"
      ? colors.medium
      : colors.low;

  const [menuOpen, setMenuOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [removed, setRemoved] = useState(false);
  const defaultDifficulty: "easy" | "medium" | "hard" =
    display.priority === "high" ? "hard" : display.priority === "medium" ? "medium" : "easy";
  const [title, setTitle] = useState(display.title);
  const [description, setDescription] = useState(display.description || "");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(defaultDifficulty);
  const [order, setOrder] = useState<number | undefined>(display.points);
  const [saving, setSaving] = useState(false);
  const canSave = useMemo(() => !!id && title.trim().length > 0 && !saving, [id, title, saving]);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  useEffect(() => {
    if (updateOpen) {
      setTimeout(() => titleRef.current?.focus(), 0);
    }
  }, [updateOpen]);

  useEffect(() => {
    if (!updateOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUpdateOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [updateOpen]);

  const handleOpenUpdate = () => {
    setTitle(display.title);
    setDescription(display.description || "");
    setDifficulty(defaultDifficulty);
    setOrder(display.points);
    setMenuOpen(false);
    setUpdateOpen(true);
  };

  const handleSave = async () => {
    if (!id || !canSave) return;
    setSaving(true);
    const tId = toast.loading("Saving changes…");
    const res = await updateTask(id, {
      title: title.trim(),
      description: description.trim() || undefined,
      difficulty,
      columnId:columnId,
      order,
    });
    setSaving(false);
    if (!res.error && (res as any).task) {
      const srv = (res as any).task as {
        _id: string;
        title: string;
        description?: string;
        difficulty: "easy" | "medium" | "hard";
        order?: number;
      };
      const nextPriority = srv.difficulty === "hard" ? "high" : srv.difficulty === "medium" ? "medium" : "low";
      setDisplay((d) => ({
        ...d,
        title: srv.title,
        description: srv.description || "",
        priority: nextPriority,
        points: typeof srv.order === "number" ? srv.order : d.points,
      }));
      onUpdated?.(srv);
      saveEdit({
        _id: srv._id,
        title: srv.title,
        description: srv.description,
        difficulty: srv.difficulty,
        order: srv.order,
        updatedAt: Date.now(),
      });
      setUpdateOpen(false);
      toast.success("Task updated", { id: tId });
    } else {
      toast.error(res.message || "Failed to update task", { id: tId });
    }
  };

  if (removed) return null;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("taskId", id);
        e.dataTransfer.setData("fromColumnId", columnId || "");
      }}
      onClick={() => {
        if (!updateOpen) onClick?.();
      }}
      className={[
        "group rounded-xl border p-3 transition-all duration-150 hover:translate-y-[-1px]",
        "bg-[rgba(0,0,0,0.18)] relative",
        className || "",
      ].join(" ")}
      style={{
        borderColor: colors.border,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.18))",
        boxShadow:
          "0 8px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)",
        minHeight: "auto",
        maxHeight: "clamp(88px, 22vh, 140px)",
        borderRadius: "12px",
        overflow: "hidden",
        ...style,
      }}
      data-column-id={columnId}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {showDragHandle && (
            <GripVertical className="h-4 w-4 shrink-0 text-white/30 opacity-0 transition-opacity group-hover:opacity-100" />
          )}
          <h4 className="truncate text-[15px] font-semibold text-white/95">
            {display.title}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold text-white"
            style={{ background: priColor }}
          >
            {display.priority ?? "low"}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="rounded-md p-1.5 text-white/80 hover:bg-white/10"
            title="More"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute right-2 top-8 z-50 w-44 overflow-hidden rounded-lg border bg-[#0C1118] text-white shadow-xl"
              style={{ borderColor: colors.border }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-white/10"
                onClick={handleOpenUpdate}
              >
                <Edit2 className="h-4 w-4" /> Update task
              </button>
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-300 hover:bg-white/10"
                onClick={async () => {
                  setMenuOpen(false);
                  if (!id) return;
                  const tId = toast.loading("Deleting…");
                  const res = await deleteTask(id);
                  if (!res.error) {
                    toast.success("Task deleted", { id: tId });
                    setRemoved(true);
                    onDelete?.(id);
                  } else {
                    toast.error(res.message || "Failed to delete task", { id: tId });
                  }
                }}
              >
                <Trash2 className="h-4 w-4" /> Delete task
              </button>
            </div>
          )}
        </div>
      </div>

      {display.description ? (
        <p className="mb-2 line-clamp-2 text-[12.5px] leading-5 text-white/75">
          {display.description}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-1.5">
        {display.tags?.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] text-white/85"
            style={{
              borderColor: colors.border,
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <Tag className="h-3.5 w-3.5 text-white/65" />
            {tag}
          </span>
        ))}

        {display.tags && display.tags.length > 2 ? (
          <span
            className="rounded-md border px-2 py-0.5 text-[11px] text-white/75"
            style={{ borderColor: colors.border, background: "rgba(255,255,255,0.04)" }}
          >
            +{display.tags.length - 2}
          </span>
        ) : null}

        {display.due ? (
          <span
            className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] text-white/85"
            style={{
              borderColor: colors.border,
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <Clock className="h-3.5 w-3.5 text-white/65" />
            {formatDue(display.due)}
          </span>
        ) : null}

        {typeof display.points === "number" ? (
          <span
            className="rounded-md border px-2 py-0.5 text-[11px] text-white/85"
            style={{
              borderColor: colors.border,
              background: "rgba(255,255,255,0.04)",
            }}
          >
            {display.points} pts
          </span>
        ) : null}

        <div className="ml-auto flex -space-x-2">
          {(display.assignees || []).slice(0, 3).map((a) => (
            <Avatar key={a} initials={a} borderColor={colors.border} />
          ))}
          {display.assignees && display.assignees.length > 3 ? (
            <MoreCount n={display.assignees.length - 3} borderColor={colors.border} />
          ) : null}
        </div>
      </div>

      {updateOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[1000] grid place-items-center bg-black/60 backdrop-blur-sm"
            onClick={() => !saving && setUpdateOpen(false)}
          >
            <div
              className="w-[92vw] max-w-md rounded-2xl border border-white/10 bg-[#0C1118] p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="text-lg font-semibold text-white/90">Update Task</div>
                <button
                  className="rounded-md p-1 text-white/80 hover:bg-white/10"
                  onClick={() => !saving && setUpdateOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  ref={titleRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  className="w-full rounded-lg border border-white/10 bg-[#0C1118] px-3 py-2 text-white/90 outline-none"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-[#0C1118] px-3 py-2 text-white/85 outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full rounded-lg border border-white/10 bg-[#0C1118] px-3 py-2 text-white/90 outline-none"
                  >
                    <option className="bg-[#0C1118]" value="easy">Easy</option>
                    <option className="bg-[#0C1118]" value="medium">Medium</option>
                    <option className="bg-[#0C1118]" value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => setUpdateOpen(false)}
                  className="rounded-lg border border-white/10 px-3 py-2 text-white/85 disabled:opacity-60 curssor-pointer"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!canSave}
                  className="rounded-lg px-3 py-2 font-semibold text-white disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(18,25,40,0.95) 0%, rgba(6,12,20,0.95) 100%)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};


export default TaskCard;
