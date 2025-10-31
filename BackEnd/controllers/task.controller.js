const Task= require("../models/task.model");
const Column =require("../models/column.model");
const project =require("../models/project.model");
const mongoose=require("mongoose");
const { getIO } = require("../socketjs/ioUniv");
const { ensureMember } = require("../helpers/membership");

const DIFFICULTIES = new Set(['easy', 'medium', 'hard']);

const createTask = async (req, res) => {
  try {
    let { projectId, columnId, title, description, difficulty } = req.body;
    const user = req.user
    console.log( projectId, columnId, title, description, difficulty,user," projectId, columnId, title, description, difficulty,user")
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: true, message: 'Invalid projectId.' });
    }
    if (!await ensureMember(projectId, user.userId)) {
        return res.status(403).json({ error: true, message: "Forbidden: not a project member." });
      }
    if (!columnId || !mongoose.Types.ObjectId.isValid(columnId)) {
      return res.status(400).json({ error: true, message: 'Invalid columnId.' });
    }
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return res.status(400).json({ error: true, message: 'Title must be at least 3 characters.' });
    }
    title = title.trim();
    description = typeof description === 'string' ? description.trim() : '';
    if (difficulty) {
      if (typeof difficulty !== 'string' || !DIFFICULTIES.has(difficulty)) {
        return res.status(400).json({ error: true, message: 'Invalid difficulty. Use easy | medium | hard.' });
      }
    } else {
      difficulty = 'easy'; 
    }
    const column = await Column.findById(columnId).lean();
    if (!column) {
      return res.status(404).json({ error: true, message: 'Column not found.' });
    }
    if (String(column.projectId) !== String(projectId)) {
      return res.status(400).json({ error: true, message: 'columnId does not belong to the given projectId.' });
    }
    const lastTask = await Task
      .find({ projectId, columnId })
      .sort({ order: -1 })
      .select({ order: 1 })
      .limit(1)
      .lean();
    const nextOrder = lastTask.length ? (Number(lastTask[0].order) + 1000) : 1000;
    const attemptCreate = async (orderValue) => {
      return Task.create({
        projectId,
        columnId,
        title,
        description,
        order: orderValue,
        difficulty,
      });
    };
    try {
      const task = await attemptCreate(nextOrder);
        getIO().to(`project:${projectId}`).emit("task:created", { task });
      return res.status(201).json({ error: false, message: 'Task created.', task });
    } catch (e) {
      if (e && e.code === 11000) {
        const latest = await Task
          .find({ projectId, columnId })
          .sort({ order: -1 })
          .select({ order: 1 })
          .limit(1)
          .lean();
        const retryOrder = latest.length ? (Number(latest[0].order) + 1000) : (nextOrder + 1000);
        const task = await attemptCreate(retryOrder);
        getIO().to(`project:${projectId}`).emit("task:created", { task });
        return res.status(201).json({ error: false, message: 'Task created.', task });
      }
      throw e;
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: `Unable to create task: ${error.message}`,
    });
  }
};

const getTasksByProject = async (req, res) => {
  const { id } = req.params;
  const { columnId, search, page = 1, limit = 20 } = req.query;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid project id." });
    }
    if (!await ensureMember(id, req.user.userId)) {
      return res.status(403).json({ error: true, message: "Forbidden: not a project member." });
    }
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * perPage;
    const query = { projectId: id };
    if (columnId && mongoose.Types.ObjectId.isValid(columnId)) {
      query.columnId = columnId;
    }
    if (search && String(search).trim()) {
      const term = String(search).trim();
      query.$or = [
        { title: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
      ];
    }
    const [tasks, total] = await Promise.all([
      Task.find(query).sort({ order: 1 }).skip(skip).limit(perPage).lean(),
      Task.countDocuments(query),
    ]);
    return res.status(200).json({
      error: false,
      total,
      page: pageNum,
      limit: perPage,
      tasks,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: `Unable to get tasks: ${error.message}`,
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ error: true, message: "Invalid taskId." });
    }
    const current = await Task.findById(taskId).select("projectId").lean();
    if (!current) {
      return res.status(404).json({ error: true, message: "Task not found." });
    }
    if (!await ensureMember(current.projectId, req.user.userId)) {
      return res.status(403).json({ error: true, message: "Forbidden: not a project member." });
    }
    const deleted = await Task.findByIdAndDelete(taskId);
    if (!deleted) {
      return res.status(404).json({ error: true, message: "Task not found." });
    }
    getIO().to(`project:${deleted.projectId}`).emit("task:deleted", { taskId: deleted._id });
    return res.status(200).json({ error: false, message: "Task deleted.", taskId: deleted._id });
  } catch (error) {
    return res.status(500).json({ error: true, message: `Unable to delete task: ${error.message}` });
  }
};


const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ error: true, message: "Invalid taskId." });
    }
    const current = await Task.findById(taskId).select("projectId columnId order").lean();
    if (!current) {
      return res.status(404).json({ error: true, message: "Task not found." });
    }
    if (!(await ensureMember(current.projectId, req.user.userId))) {
      return res.status(403).json({ error: true, message: "Forbidden: not a project member." });
    }
    let { title, description, difficulty, order } = req.body;
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length < 3) {
        return res.status(400).json({ error: true, message: "title must be a string ≥ 3 chars." });
      }
      title = title.trim();
    }
    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({ error: true, message: "description must be a string." });
      }
      description = description.trim();
    }
    if (difficulty !== undefined) {
      if (typeof difficulty !== "string" || !DIFFICULTIES.has(difficulty)) {
        return res.status(400).json({ error: true, message: "difficulty must be one of: easy | medium | hard." });
      }
    }
    if (order !== undefined) {
      if (typeof order !== "number" || order < 0) {
        return res.status(400).json({ error: true, message: "order must be a non-negative number." });
      }
    }
    const setDoc = {};
    if (title !== undefined) setDoc.title = title;
    if (description !== undefined) setDoc.description = description;
    if (difficulty !== undefined) setDoc.difficulty = difficulty;
    if (order !== undefined) setDoc.order = order;
    if (Object.keys(setDoc).length === 0) {
      return res.status(400).json({ error: true, message: "No valid fields to update." });
    }
    const updated = await Task.findByIdAndUpdate(
      taskId,
      { $set: setDoc },
      { new: true }
    );
    getIO().to(`project:${current.projectId}`).emit("task:updated", { task: updated });
    if (order !== undefined) {
      getIO().to(`project:${current.projectId}`).emit("task:reordered", {
        taskId: updated._id,
        columnId: updated.columnId,
        order: updated.order,
      });
    }
    return res.status(200).json({ error: false, message: "Task updated.", task: updated });
  } catch (err) {
    return res.status(500).json({ error: true, message: `Unable to update task: ${err.message}` });
  }
};


module.exports = { createTask,getTasksByProject,deleteTask,updateTask };
