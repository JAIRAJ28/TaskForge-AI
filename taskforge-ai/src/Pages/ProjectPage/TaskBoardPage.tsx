import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Filter, MoreVertical } from "lucide-react";
import type { Priority, StatusKey, Task } from "../Types/Types";
import { UI } from "../../Utils/colors";
import { useParams } from "react-router-dom";
import { getColumnById } from "../../Service/Api_Calls/projectApi";
import { createTask, getTasksByProjectId, updateTask } from "../../Service/Api_Calls/taskApi";
import TaskCard from "../../Components/TaskComponents/TaskCard";
import CreateTaskModal from "../../Components/TaskComponents/CreateTaskModal";
import { useSocket } from "../../Utils/hooks/useSocket";
import { toast } from "sonner";

const statusMeta: Record<StatusKey, { label: string; dot: string }> = {
  todo: { label: "To Do", dot: UI.blue },
  in_progress: { label: "In Progress", dot: UI.amber },
  done: { label: "Done", dot: UI.green },
};

const TasksBoardPage: React.FC = () => {
  const [q, setQ] = useState("");
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [columns, setColumns] = useState<{ id: string; name: string; key: string }[]>([]);
  const [columnIds, setColumnIds] = useState<string[]>([]);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { projectId } = useParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const { socket, connected } = useSocket();

  const handleTaskDeleted = (deletedId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== deletedId));
  };

  useEffect(() => {
    if (!socket) return;
    socket.on("task:moved", ({ taskId, fromColumnId, toColumnId }) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status:
                  toColumnId === columnIds[0]
                    ? "todo"
                    : toColumnId === columnIds[1]
                    ? "in_progress"
                    : "done",
              }
            : t
        )
      );
    });
    return () => {
      socket.off("task:moved");
    };
  }, [socket, columnIds]);

  async function handleTaskMove(taskId: string,
     fromColumnId: string,
     toColumnId: string) 
  {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status:
                toColumnId === columnIds[0]
                  ? "todo"
                  : toColumnId === columnIds[1]
                  ? "in_progress"
                  : "done",
            }
          : t
      )
    );
    try {
      const res = await updateTask(taskId,{columnId: toColumnId });
      if (res.error) throw new Error(res.message);
      socket?.emit("task:moved", {
        taskId,
        fromColumnId,
        toColumnId,
        projectId,
      });
      toast.success("Task moved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to move task");
    }
  }

  const mapApiTasks = (apiTasks: any[], colIds: string[]): Task[] =>
    apiTasks.map((t: any) => ({
      id: t._id,
      title: t.title,
      description: t.description || "",
      due: t.updatedAt,
      priority: t.difficulty === "hard" ? "high" : t.difficulty === "medium" ? "medium" : "low",
      points: t.order || 0,
      status:
        t.columnId === colIds[0]
          ? "todo"
          : t.columnId === colIds[1]
          ? "in_progress"
          : "done",
    }));

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchesQ =
        !s ||
        t.title.toLowerCase().includes(s) ||
        (t.description || "").toLowerCase().includes(s) ||
        (t.tags || []).some((tag) => tag.toLowerCase().includes(s));
      const matchesP = priority === "all" || t.priority === priority;
      return matchesQ && matchesP;
    });
  }, [q, priority, tasks]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectId) return;
      const res = await getTasksByProjectId(String(projectId));
      if (!res.error && res.tasks) {
        const formattedTasks = res.tasks.map((t: any) => ({
          id: t._id,
          title: t.title,
          description: t.description || "",
          due: t.updatedAt,
          priority: t.difficulty === "hard" ? "high" : t.difficulty === "medium" ? "medium" : "low",
          points: t.order || 0,
          status:
            t.columnId === columnIds[0]
              ? "todo"
              : t.columnId === columnIds[1]
              ? "in_progress"
              : "done",
        }));
        setTasks(formattedTasks);
      }
    };
    fetchTasks();
  }, [projectId, columnIds]);

  useEffect(() => {
    const fetchColumns = async () => {
      setLoadingColumns(true);
      setError(null);
      try {
        const res = await getColumnById(String(projectId));
        if (!res.error && res.columns) {
          const cols = res.columns.map((c: any) => ({
            id: c._id,
            name: c.name,
            key: c.key,
          }));
          setColumns(cols);
          setColumnIds(cols.map((c: any) => c.id));
        } else {
          setError(res.message || "Failed to fetch columns");
        }
      } catch (err) {
        setError("Error fetching columns");
      } finally {
        setLoadingColumns(false);
      }
    };
    if (projectId) fetchColumns();
  }, [projectId]);

  const grouped = useMemo(() => {
    const g: Record<StatusKey, Task[]> = { todo: [], in_progress: [], done: [] };
    for (const t of filtered) g[t.status].push(t);
    return g;
  }, [filtered]);

  return (
    <div className="flex h-full flex-col gap-5 text-[15px] leading-6">
      <header
        className="flex items-center justify-between rounded-2xl border px-4 py-2"
        style={{
          background: UI.bgPanel,
          borderColor: UI.border,
          color: UI.text,
          boxShadow:
            "0 6px 20px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tasks, tags, assignees…"
              className="w-[260px] md:w-[360px] rounded-xl border bg-[#0C1118] pl-10 pr-3 py-2.5 outline-none transition"
              style={{ borderColor: UI.border, color: UI.text }}
              onFocus={(e) =>
                (e.currentTarget.style.boxShadow = `0 0 0 3px ${UI.ring}`)
              }
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/65" />
          </div>
          <div className="flex items-center gap-2">
            <div
              className="rounded-xl border px-2 py-2"
              style={{
                borderColor: UI.border,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.12))",
              }}
            >
              <div className="inline-flex items-center gap-2 px-1">
                <Filter className="h-5 w-5 text-white/75" />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="bg-transparent text-white/90 outline-none"
                >
                  <option className="bg-[#11151B]" value="all">
                    Priority: All
                  </option>
                  <option className="bg-[#11151B]" value="high">
                    High
                  </option>
                  <option className="bg-[#11151B]" value="medium">
                    Medium
                  </option>
                  <option className="bg-[#11151B]" value="low">
                    Low
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-[15px] font-semibold transition active:translate-y-px hover:brightness-110"
            style={{
              color: "#e5f3f0",
              background:
                "linear-gradient(135deg, rgba(18,25,40,0.95) 0%, rgba(6,12,20,0.95) 100%)",
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.05) inset, 0 6px 14px rgba(0,0,0,0.65)",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(6px)",
            }}
            onClick={() => {
              setActiveColumnId(columnIds[0] || null);
              setCreateOpen(true);
            }}
            title="Create Task"
          >
            <Plus className="h-5 w-5 text-[#00d4a4]" />
            New Task
          </button>
        </div>
      </header>
      <section className="grid flex-1 min-h-0 grid-cols-1 gap-5 md:grid-cols-3">
        {loadingColumns ? (
          <div>Loading columns...</div>
        ) : (
          columns.map((col) => (
            <Column
              key={col.id}
              id={col.id}
              title={col.name}
              color={statusMeta[col.key as StatusKey]?.dot || UI.blue}
              tasks={grouped[col.key as StatusKey] || []}
              onDeleteTask={handleTaskDeleted}
              onTaskMove={handleTaskMove}
            />
          ))
        )}
      </section>
      <CreateTaskModal
        open={createOpen}
        projectId={String(projectId)}
        columnId={activeColumnId}
        onClose={() => setCreateOpen(false)}
        onCreated={async () => {
          if (!projectId) return;
          const res = await getTasksByProjectId(String(projectId));
          if (!res.error && res.tasks) {
            setTasks(mapApiTasks(res.tasks, columnIds));
          }
        }}
        createTask={createTask}
      />
    </div>
  );
};

function Column({
  id,
  title,
  color,
  tasks,
  onDeleteTask,
  onTaskMove,
}: {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  onDeleteTask?: (taskId: string) => void;
  onTaskMove?: (taskId: string, fromColumnId: string, toColumnId: string) => void;
}) {
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const fromColumnId = e.dataTransfer.getData("fromColumnId");
    if (!taskId || !id) return;
    onTaskMove?.(taskId, fromColumnId, id);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  return (
    <div
      className="flex min-h-0 flex-col rounded-2xl border p-4"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        background: UI.bgCard,
        borderColor: UI.border,
        boxShadow:
          "0 8px 26px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: color, boxShadow: `0 0 10px ${color}` }}
          />
          <h3 className="text-[16px] font-semibold text-white/90">{title}</h3>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[12px] text-white/85">
            {tasks.length}
          </span>
        </div>
        <button className="rounded-lg p-1.5 hover:bg-white/10" title="Column options">
          <MoreVertical className="h-5 w-5 text-white/70" />
        </button>
      </div>
      <div className="scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex-1 space-y-4 overflow-auto pr-1">
        {tasks.length === 0 ? (
          <EmptyState />
        ) : (
          tasks.map((t) => (
            <TaskCard key={t.id} task={t} columnId={id} onDelete={onDeleteTask} />
          ))
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="grid h-32 place-items-center rounded-xl border text-white/75"
      style={{
        borderColor: UI.border,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.12))",
      }}
    >
      <span className="text-[13px]">No tasks yet</span>
    </div>
  );
}

export default TasksBoardPage;
