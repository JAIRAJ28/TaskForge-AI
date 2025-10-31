// CreateTaskModal.tsx
import { useEffect, useMemo, useState } from "react";
import type { CreateTaskModalProps } from "../../Pages/Types/Types";

export default function CreateTaskModal({
  open,
  projectId,
  columnId,
  onClose,
  onCreated,
  createTask,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [submitting, setSubmitting] = useState(false);
  const disabled = useMemo(() => !title.trim() || !columnId || submitting, [title, columnId, submitting]);
  console.log(columnId,"columnIdcolumnId")
  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setDifficulty("medium");
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const handleCreate = async () => {
    if (!columnId) return;
    console.log(columnId,"columnId___")
    setSubmitting(true);
    const res = await createTask({ projectId, columnId, title: title.trim(), description: description.trim() || undefined, difficulty });
    setSubmitting(false);
    if (!res.error && res.task) {
      onCreated?.(res.task);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 backdrop-blur-sm">
      <div className="w-[92vw] max-w-md rounded-2xl border border-white/10 bg-[#0C1118] p-4 shadow-2xl">
        <div className="mb-3 text-white/90 text-lg font-semibold">Create Task</div>
        <div className="space-y-3">
          <input
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
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 px-3 py-2 text-white/85"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={disabled}
            className="rounded-lg px-3 py-2 font-semibold text-white disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, rgba(18,25,40,0.95) 0%, rgba(6,12,20,0.95) 100%)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
