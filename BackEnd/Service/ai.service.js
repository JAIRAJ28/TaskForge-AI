// Service/ai.service.js
const Project = require("../models/project.model");
const Task = require("../models/task.model");

let _genai = null;

async function getGenAI() {
  if (_genai) return _genai;
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  _genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return _genai;
}

function pickModel(envKey, fallback) {
  return (process.env[envKey] || fallback || "gemini-2.5-flash").trim();
}

function clampTasks(tasks, max = 200) {
  return tasks
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, max);
}

function buildSummaryPrompt(project, tasks) {
  const payload = {
    project: { name: project?.name || "", description: project?.description || "" },
    tasks: tasks.map(t => ({
      title: t.title,
      description: t.description,
      status: t.columnKey || t.columnId || "",
      order: t.order,
      updatedAt: t.updatedAt,
    })),
  };
  return `
You are an assistant for a Kanban project board. Summarize concisely.

Project:
${JSON.stringify(payload.project)}

Tasks:
${JSON.stringify(payload.tasks)}

Write:
- Snapshot: counts by status
- Progress highlights
- Risks/blockers
- Next 3–5 actions
≤180 words. Be factual; say if data is missing.`;
}

function buildQAPrompt(project, tasks, focus, question) {
  const payload = {
    project: { name: project?.name || "", description: project?.description || "" },
    focus: focus ? { title: focus.title, description: focus.description, status: focus.columnKey || focus.columnId || "" } : null,
    tasks: tasks.map(t => ({ title: t.title, description: t.description, status: t.columnKey || t.columnId || "" })),
    question,
  };
  return `
Answer only from this project/task data. If info isn't present, say so.
Context:
${JSON.stringify(payload)}
Answer ≤120 words. If suggesting actions, list up to 3 bullets.`;
}

async function summarizeProject(projectId) {
  const project = await Project.findById(projectId).lean();
  if (!project) throw new Error("Project not found");
  const tasks = await Task.find({ projectId }).sort({ order: 1 }).lean();
  const safeTasks = clampTasks(tasks, 200);
  const genai = await getGenAI();
  const model = genai.getGenerativeModel({ model: pickModel("GEMINI_MODEL_SUMMARY", "gemini-2.5-flash") });
  const prompt = buildSummaryPrompt(project, safeTasks);
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function askAboutProject({ projectId, taskId, question }) {
  const project = await Project.findById(projectId).lean();
  if (!project) throw new Error("Project not found");
  const tasks = await Task.find({ projectId }).sort({ order: 1 }).lean();
  const safeTasks = clampTasks(tasks, 200);
  const focus = taskId ? safeTasks.find(t => String(t._id) === String(taskId)) : null;
  const genai = await getGenAI();
  const model = genai.getGenerativeModel({ model: pickModel("GEMINI_MODEL_QA", "gemini-2.5-flash") });
  const prompt = buildQAPrompt(project, safeTasks, focus, question);
  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = { summarizeProject, askAboutProject };
