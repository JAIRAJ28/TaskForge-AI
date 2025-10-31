// src/Components/Sidebar.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Plus,
  Search as SearchIcon,
  ChevronRight,
  Loader2,
  X,
  Edit2,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { COLORS } from "../Utils/colors";
import { toast } from "sonner";
import { createProject, getAllProject, updateProject, deleteProject } from "../Service/Api_Calls/projectApi";
import type { Project as ProjectFromApi } from "../Service/Api_Calls/projectApi";
import type { Project as ProjectFromPages } from "../Pages/Types/Types";

function debounce<T extends (...args: any[]) => void>(fn: T, wait = 300) {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
function normalizeProject(p: ProjectFromPages | ProjectFromApi): ProjectFromApi {
  const members =
    (p as any)?.members?.map((m: any) => ({
      userId: String(m.userId),
      role: m.role === "admin" ? ("member" as const) : (m.role as "owner" | "member"),
    })) ?? [];

  return {
    _id: String((p as any)._id),
    name: (p as any).name,
    description: (p as any).description,
    ownerId: String((p as any).ownerId),
    members,
    createdAt: (p as any).createdAt,
    updatedAt: (p as any).updatedAt,
  };
}
function normalizeList(
  list: Array<ProjectFromPages | ProjectFromApi> | undefined | null
): ProjectFromApi[] {
  if (!list || !Array.isArray(list)) return [];
  return list.map(normalizeProject);
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectFromApi[]>([]);
  const [displayed, setDisplayed] = useState<ProjectFromApi[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [openCreate, setOpenCreate] = useState<boolean>(false);

  const [q, setQ] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllProject();
      if (res.error) {
        setProjects([]);
        setDisplayed([]);
        setError(res.message || "Unable to fetch projects");
        return;
      }
      const list =
        normalizeList(res.projects) ||
        normalizeList(res.project ? [res.project] : []);
      setProjects(list);
      setDisplayed(list);
    } catch (err: any) {
      setError(err?.message || "Network error");
      setProjects([]);
      setDisplayed([]);
    } finally {
      setLoading(false);
    }
  }
  async function loadByName(nameValue: string) {
    if (!nameValue.trim()) {
      loadAll();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getAllProject({ name: nameValue });
      if (res.error) {
        setDisplayed([]);
        setError(res.message || "Unable to search projects");
        return;
      }
      const list =
        normalizeList(res.projects) ||
        normalizeList(res.project ? [res.project] : []);
      setProjects(list);
      setDisplayed(list);
    } catch (err: any) {
      setError(err?.message || "Network error");
      setDisplayed([]);
    } finally {
      setLoading(false);
    }
  }
  async function handleProjectClick(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllProject({ id });
      if (res.error || !res.project) {
        setError(res.message || "Unable to fetch project");
        return;
      }
      const item = normalizeProject(res.project);
      setProjects((prev) => {
        const next = [item, ...prev.filter((p) => p._id !== item._id)];
        return next;
      });
      setDisplayed((prev) => {
        const next = [item, ...prev.filter((p) => p._id !== item._id)];
        return next;
      });
      navigate(`/dashboard/${item._id}`);
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }
  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    const d = description.trim();
    if (n.length < 3) {
      toast.error("Name must be at least 3 characters.");
      return;
    }
    if (d.length < 3) {
      toast.error("Description must be at least 3 characters.");
      return;
    }
    try {
      setCreating(true);
      const res = await createProject({ name: n, description: d });
      if (!res || res.error) {
        toast.error(res?.message || "Failed to create project");
        return;
      }
      toast.success("Project created successfully 🎉", {
        description:
          `${res.message || "A new project has been created."}` +
          (res.project?.name ? ` Project name: ${res.project.name}` : ""),
      });
      await loadAll();
      setOpenCreate(false);
      setName("");
      setDescription("");
      if (res.projectId) {
        navigate(`/dashboard/${res.projectId}`);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  }
  const debouncedSearch = useRef(
    debounce((value: string) => {
      loadByName(value);
    }, 400)
  ).current;
  function handleSearchChange(value: string) {
    setQ(value);
    debouncedSearch(value);
  }

  function openEditFor(p: ProjectFromApi) {
    setEditId(p._id);
    setEditName(p.name);
    setEditDescription(p.description || "");
    setOpenEdit(true);
  }
  async function handleUpdateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    const n = editName.trim();
    const d = editDescription.trim();
    if (n.length < 3) {
      toast.error("Name must be at least 3 characters.");
      return;
    }
    if (d.length < 3) {
      toast.error("Description must be at least 3 characters.");
      return;
    }
    try {
      setEditing(true);
      const tId = toast.loading("Updating project…");
      const res = await updateProject(editId, { name: n, description: d });
      if (res.error || !res.project) {
        toast.error(res.message || "Failed to update", { id: tId });
        return;
      }
      const updated = normalizeProject(res.project);
      setProjects((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      setDisplayed((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      toast.success("Project updated", { id: tId });
      setOpenEdit(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update project");
    } finally {
      setEditing(false);
    }
  }
  async function confirmDelete() {
    if (!confirmDeleteId) return;
    try {
      setDeleting(true);
      const tId = toast.loading("Deleting project…");
      const res = await deleteProject(confirmDeleteId);
      if (res.error) {
        toast.error(res.message || "Failed to delete project", { id: tId });
        return;
      }
      setProjects((prev) => prev.filter((p) => p._id !== confirmDeleteId));
      setDisplayed((prev) => prev.filter((p) => p._id !== confirmDeleteId));
      toast.success("Project deleted", { id: tId });
      setConfirmDeleteId(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete project");
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);
  useEffect(() => {
    function onDown(ev: MouseEvent) {
      const target = ev.target as Node;
      if (openCreate && dialogRef.current && !dialogRef.current.contains(target)) {
        setOpenCreate(false);
      }
      if (openMenuId && menuRef.current && !menuRef.current.contains(target)) {
        setOpenMenuId(null);
      }
    }
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openCreate, openMenuId]);

  return (
    <aside
      className="h-screen w-full max-w-[320px] border-r p-4 flex flex-col"
      style={{
        background: COLORS.bg,
        color: COLORS.text,
        borderColor: COLORS.border,
      }}
    >
      <div
        className="rounded-2xl border p-4 mb-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-md"
        style={{ background: COLORS.cardBg, borderColor: COLORS.border }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            <h2 className="text-sm font-semibold tracking-wide">
              Your Projects
            </h2>
          </div>

          <button
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition
                       active:translate-y-px cursor-pointer"
            style={{
              background: `linear-gradient(180deg, ${COLORS.primaryFrom}, ${COLORS.primaryTo})`,
              color: "#fff",
            }}
            title="Create Project"
          >
            <Plus className="h-4 w-4" />
            Create
          </button>
        </div>

        <div className="mt-3 relative">
          <input
            value={q}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search projects…"
            className="w-full rounded-xl border bg-[#0e1724] px-9 py-2 text-sm outline-none transition"
            style={{ borderColor: COLORS.border, color: COLORS.text }}
            onFocus={(e) =>
              (e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.focusRing}`)
            }
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
          />
          <SearchIcon
            className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: COLORS.muted }}
          />
        </div>
      </div>

      <div
        className="flex-1 overflow-auto rounded-2xl border p-3 space-y-2"
        style={{ background: COLORS.cardBg, borderColor: COLORS.border }}
      >
        {loading ? (
          <div
            className="flex h-40 items-center justify-center gap-2 text-sm"
            style={{ color: COLORS.muted }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading projects…
          </div>
        ) : error ? (
          <div className="text-sm" style={{ color: "#ef4444" }}>
            {error}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-sm" style={{ color: COLORS.muted }}>
            No projects found.
          </div>
        ) : (
          displayed.map((p) => (
            <div
              key={p._id}
              className="relative w-full rounded-xl border px-3 py-3 transition hover:border-white/20 hover:bg-white/5"
              style={{ borderColor: COLORS.border }}
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => handleProjectClick(p._id)}
                  className="flex items-center gap-2 text-left flex-1 min-w-0"
                >
                  <div
                    className="grid h-8 w-8 place-items-center rounded-lg shrink-0"
                    style={{
                      background: "#0e1724",
                      border: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <FolderKanban className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold leading-5 truncate">
                      {p.name}
                    </div>
                    <div
                      className="text-xs truncate max-w-[180px] sm:max-w-[220px] md:max-w-[240px]"
                      style={{ color: COLORS.muted }}
                    >
                      {p.description}
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    title="More"
                    onClick={() => setOpenMenuId((cur) => (cur === p._id ? null : p._id))}
                    className="rounded-md p-1 hover:bg-white/10 cursor-pointer"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  <ChevronRight
                    className="h-4 w-4 opacity-60 hidden sm:block"
                    style={{ color: COLORS.muted }}
                  />
                </div>
              </div>

              {openMenuId === p._id && (
                <div
                  ref={menuRef}
                  className="absolute right-2 top-10 z-50 w-40 overflow-hidden rounded-lg border bg-[#0e1724] shadow-xl"
                  style={{ borderColor: COLORS.border, color: COLORS.text }}
                >
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-white/10"
                    onClick={() => {
                      setOpenMenuId(null);
                      openEditFor(p);
                    }}
                  >
                    <Edit2 className="h-4 w-4" /> Edit
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-300 hover:bg-white/10"
                    onClick={() => {
                      setOpenMenuId(null);
                      setConfirmDeleteId(p._id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-xs" style={{ color: COLORS.muted }}>
        <div
          className="rounded-xl border p-3"
          style={{ borderColor: COLORS.border, background: COLORS.cardBg }}
        >
          Tip: select a project to see Tasks / Members / AI on the top navbar.
        </div>
      </div>

      {openCreate && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div
            ref={dialogRef}
            className="w-[95%] max-w-[520px] rounded-2xl border p-5 transition
                       scale-100 opacity-100"
            style={{
              background: COLORS.cardBg,
              borderColor: COLORS.border,
              color: COLORS.text,
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Create Project</h3>
              <button
                onClick={() => setOpenCreate(false)}
                className="rounded-md p-1 hover:bg-white/10 cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="mt-4 space-y-3">
              <div>
                <label
                  className="mb-1 block text-xs font-bold"
                  style={{ color: COLORS.muted }}
                >
                  Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Platform Revamp"
                  className="w-full rounded-xl border bg-[#0e1724] px-3 py-2 outline-none transition"
                  style={{ borderColor: COLORS.border, color: COLORS.text }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.focusRing}`)
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
                <p className="mt-1 text-xs" style={{ color: COLORS.muted }}>
                  Minimum 3 characters.
                </p>
              </div>

              <div>
                <label
                  className="mb-1 block text-xs font-bold"
                  style={{ color: COLORS.muted }}
                >
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description for your team"
                  rows={4}
                  className="w-full resize-none rounded-xl border bg-[#0e1724] px-3 py-2 outline-none transition"
                  style={{ borderColor: COLORS.border, color: COLORS.text }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.focusRing}`)
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenCreate(false)}
                  className="rounded-xl border px-4 py-2 text-sm transition hover:bg-white/10 cursor-pointer"
                  style={{ borderColor: COLORS.border, color: COLORS.muted }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition
                             active:translate-y-px disabled:opacity-60 cursor-pointer"
                  style={{
                    background: `linear-gradient(180deg, ${COLORS.primaryFrom}, ${COLORS.primaryTo})`,
                    color: "#fff",
                  }}
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Create
                </button>
              </div>
            </form>

            <p className="mt-3 text-[11px]" style={{ color: COLORS.muted }}>
              Owner will be set from your auth token. Default columns (To Do, In
              Progress, Done) are created by backend.
            </p>
          </div>
        </div>
      )}

      {openEdit && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div
            className="w-[95%] max-w-[520px] rounded-2xl border p-5"
            style={{ background: COLORS.cardBg, borderColor: COLORS.border, color: COLORS.text }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Edit Project</h3>
              <button onClick={() => setOpenEdit(false)} className="rounded-md p-1 hover:bg-white/10 cursor-pointer" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProject} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-bold" style={{ color: COLORS.muted }}>
                  Name
                </label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Project name"
                  className="w-full rounded-xl border bg-[#0e1724] px-3 py-2 outline-none transition"
                  style={{ borderColor: COLORS.border, color: COLORS.text }}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold" style={{ color: COLORS.muted }}>
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Project description"
                  rows={4}
                  className="w-full resize-none rounded-xl border bg-[#0e1724] px-3 py-2 outline-none transition"
                  style={{ borderColor: COLORS.border, color: COLORS.text }}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenEdit(false)}
                  className="rounded-xl border px-4 py-2 text-sm transition hover:bg-white/10 cursor-pointer"
                  style={{ borderColor: COLORS.border, color: COLORS.muted }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition active:translate-y-px disabled:opacity-60 cursor-pointer"
                  style={{
                    background: `linear-gradient(180deg, ${COLORS.primaryFrom}, ${COLORS.primaryTo})`,
                    color: "#fff",
                  }}
                >
                  {editing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit2 className="h-4 w-4" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div
            className="w-[95%] max-w-[420px] rounded-2xl border p-5"
            style={{ background: COLORS.cardBg, borderColor: COLORS.border, color: COLORS.text }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Delete Project</h3>
              <button onClick={() => setConfirmDeleteId(null)} className="rounded-md p-1 hover:bg-white/10 cursor-pointer" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm" style={{ color: COLORS.muted }}>
              Are you sure you want to delete this project? This will also delete its columns and tasks.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-xl border px-4 py-2 text-sm transition hover:bg-white/10 cursor-pointer"
                style={{ borderColor: COLORS.border, color: COLORS.muted }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition active:translate-y-px disabled:opacity-60 cursor-pointer"
                style={{
                  background: `linear-gradient(180deg, #7f1d1d, #991b1b)`,
                  color: "#fff",
                }}
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
