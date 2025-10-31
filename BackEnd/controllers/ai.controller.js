// controllers/ai.controller.js
const mongoose = require("mongoose");
const { summarizeProject, askAboutProject } = require("../Service/ai.service"); // ensure this path & case are correct
const { getIO } = require("../socketjs/ioUniv");
const { ensureMember } = require("../helpers/membership");

async function summarize(req, res) {
  try {
    const { projectId } = req.body || {};
    console.log(projectId,"check this _______ AI SUMAARY CALL")
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: true, message: "Invalid projectId." });
    }
    console.log(projectId, req.user.userId,"check this _______ ensureMember SUMAARY CALL")
    if (!(await ensureMember(projectId, req.user.userId))) {
      return res.status(403).json({ error: true, message: "Forbidden: not a project member." });
    }
    const text = await summarizeProject(projectId);
    try { getIO().to(`project:${projectId}`).emit("project:summary:ready", { projectId, text }); } catch (_) {}
    return res.status(200).json({ error: false, text });
  } catch (e) {
    console.log(e,"check the e")
    return res.status(500).json({ error: true, message: `Unable to summarize: ${e.message}` });
  }
}

async function ask(req, res) {
  try {
    const { projectId, taskId, question } = req.body || {};
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: true, message: "Invalid projectId." });
    }
    if (!(await ensureMember(projectId, req.user.userId))) {
      return res.status(403).json({ error: true, message: "Forbidden: not a project member." });
    }
    if (!question || String(question).trim().length < 3) {
      return res.status(400).json({ error: true, message: "question must be ≥ 3 chars." });
    }
    // if (taskId && !mongoose.Types.ObjectId.isValid(taskId)) {
    //   return res.status(400).json({ error: true, message: "Invalid taskId." });
    // }
    const text = await askAboutProject({ projectId, taskId, question: String(question).trim() });
      return res.status(200).json({ error: false, text });
    }
    catch (e) {
      return res.status(500).json({ error: true, message: `Unable to answer: ${e.message}` });
    }
}

module.exports = { summarize, ask };
