// endpoints.js

// BASE
export const API_BASE = "/forge"; // append to your host (e.g., http://localhost:2001 + API_BASE)

/* HEALTH */
export const HEALTHZ = "/healthz";
// GET
// query: none
// body: none
// headers: none

/* AUTH */
export const AUTH_REGISTER = "/auth/register";
// POST
// body: { name: string, password: string }
// headers: Content-Type: application/json

export const AUTH_LOGIN = "/auth/login";
// POST
// body: { name: string, password: string }
// headers: Content-Type: application/json

export const AUTH_LOGOUT = "/auth/logout";
// POST
// body: none
// headers: Authorization: Bearer <JWT>

/* PROJECTS */
export const PROJECTS = "/projects";
// POST
// body: { name: string, description?: string }
// headers: Authorization: Bearer <JWT>, Content-Type: application/json
// GET (user-specific list)
// query: none
// headers: Authorization: Bearer <JWT>

export const PROJECT_BY_ID = "/projects/:id";
// GET
// params: :id = projectId
// headers: Authorization: Bearer <JWT>
// PATCH
// params: :id = projectId
// body: { name?: string, description?: string }
// headers: Authorization: Bearer <JWT>, Content-Type: application/json
// DELETE
// params: :id = projectId
// headers: Authorization: Bearer <JWT>

/* COLUMNS */
export const PROJECT_COLUMNS = "/column/:id/columns";
// GET
// params: :id = projectId
// headers: Authorization: Bearer <JWT>

/* TASKS */
export const TASKS = "/tasks";
// POST
// body: {
//   projectId: string,
//   columnId: string,
//   title: string,
//   description?: string,
//   difficulty?: "easy" | "medium" | "hard",
//   user?: { userId: string }
// }
// headers: Authorization: Bearer <JWT>, Content-Type: application/json

export const PROJECT_TASKS = "/projects/:id/tasks";
// GET
// params: :id = projectId
// query: ?columnId=string&search=string&page=number&limit=number
// headers: Authorization: Bearer <JWT>

export const TASK_BY_ID = "/tasks/:taskId";
// PATCH
// params: :taskId = taskId
// body: { title?: string, description?: string, difficulty?: "easy" | "medium" | "hard", columnId?: string, projectId?: string }
// headers: Authorization: Bearer <JWT>, Content-Type: application/json
// DELETE
// params: :taskId = taskId
// headers: Authorization: Bearer <JWT>

/* MEMBERS */
export const PROJECT_MEMBERS = "/projects/:id/members";
// GET
// params: :id = projectId
// headers: Authorization: Bearer <JWT>
// POST (owner only)
// params: :id = projectId
// body: { userId: string, role: "owner" | "member" }
// headers: Authorization: Bearer <JWT>, Content-Type: application/json

export const PROJECT_MEMBER_BY_USER = "/projects/:id/members/:userId";
// PATCH (owner only)
// params: :id = projectId, :userId = target user
// body: { role: "owner" | "member" }
// headers: Authorization: Bearer <JWT>, Content-Type: application/json
// DELETE (owner only)
// params: :id = projectId, :userId = target user
// headers: Authorization: Bearer <JWT>

/* AI */
export const AI_SUMMARIZE = "/ai/summarize";
// POST
// body: { projectId: string }
// headers: Authorization: Bearer <JWT>, Content-Type: application/json

export const AI_ASK = "/ai/ask";
// POST
// body: { projectId: string, question: string }
// headers: Authorization: Bearer <JWT>, Content-Type: application/json
