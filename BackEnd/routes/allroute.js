const express = require("express");
const router = express.Router();

const {
  createProject,
  getProject,
  updateProject,
  deleteProject,
} = require("../controllers/project.controller");
const { getColumnsByProjectId } = require("../controllers/column.controller");
const {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
} = require("../controllers/task.controller");
const { aiRateLimit } = require("../Middleware/aiRateLimit");
const {ask, summarize } = require("../controllers/ai.controller");
const { register, login, logout } = require("../controllers/user.controler");
const { auth } = require("../Middleware/middleware");
const { listMembers, addMember, updateMemberRole, removeMember } = require("../controllers/members.controller");
// Health check
router.get("/healthz", (req, res) => res.json({ ok: true }));

router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/logout', auth, logout);

router.post("/projects",auth, createProject);
router.get("/projects",auth, getProject);
router.get("/projects/:id",auth, getProject);
router.patch("/projects/:id",auth, updateProject);
router.delete("/projects/:id",auth, deleteProject);

router.get("/column/:id/columns",auth, getColumnsByProjectId);


router.get("/projects/:id/tasks",auth, getTasksByProject);
router.post("/tasks",auth, createTask);
router.patch("/tasks/:taskId",auth, updateTask);
router.delete("/tasks/:taskId", auth,deleteTask);


router.post("/ai/summarize",auth, aiRateLimit, summarize);
router.post("/ai/ask",auth, aiRateLimit, ask);


router.get("/projects/:id/members", auth, listMembers);
router.post("/projects/:id/members", auth, addMember);
router.patch("/projects/:id/members/:userId", auth, updateMemberRole);
router.delete("/projects/:id/members/:userId", auth, removeMember);

module.exports = router;
