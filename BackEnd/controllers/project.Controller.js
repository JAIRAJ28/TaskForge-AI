const projectModel = require("../models/project.model");
const mongoose = require("mongoose");
const Column = require("../models/column.model");
const Task = require("../models/task.model");
const { getIO } = require("../socketjs/ioUniv");

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const ownerId = req.user?.userId;
    console.log(name, description,ownerId )
    if (!ownerId) {
      return res.status(401).json({ error: true, message: "Unauthorized" });
    }
    if (!name || name.trim().length < 3) {
      return res
        .status(400)
        .json({ error: true, message: "Name must be at least 3 characters." });
    }
    if (!description || description.trim().length < 3) {
      return res
        .status(400)
        .json({
          error: true,
          message: "Description must be at least 3 characters.",
        });
    }
    const project = await projectModel.create({
      name: name.trim(),
      description: description.trim(),
      ownerId,
      members: [{ userId: ownerId, role: "owner" }],
    });
    await Column.insertMany([
      { projectId: project._id, key: "todo", name: "To Do", order: 1000 },
      {
        projectId: project._id,
        key: "in_progress",
        name: "In Progress",
        order: 2000,
      },
      { projectId: project._id, key: "done", name: "Done", order: 3000 },
    ]);
    getIO().emit("project:created", { project });
    return res
      .status(201)
      .json({
        error: false,
        message: "Project created.",
        projectId: project._id,
        project,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        error: true,
        message: `Unable to create project: ${error.message}`,
      });
  }
};

const getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.query;
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ error: true, message: "Invalid project id." });
      }
      const project = await projectModel.findById(id);
      if (!project) {
        return res
          .status(404)
          .json({ error: true, message: "Project not found." });
      }
      return res.status(200).json({ error: false, message: project });
    }
    if (name) {
      const projects = await projectModel.find({
        name: { $regex: name, $options: "i" },
      });
      return res.status(200).json({ error: false, projects });
    }
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: true, message: "Unauthorized" });
    }
    const projects = await projectModel
      .find({ "members.userId": userId })
      .sort({ createdAt: -1 });
    return res.status(200).json({ error: false, message: projects });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: `Unable to get project(s): ${error.message}`,
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid project id." });
    }
    if (!name || name.trim().length < 3) {
      return res
        .status(400)
        .json({ error: true, message: "Name must be at least 3 characters." });
    }
    if (!description || description.trim().length < 3) {
      return res
        .status(400)
        .json({
          error: true,
          message: "Description must be at least 3 characters.",
        });
    }
    const updatedProject = await projectModel.findByIdAndUpdate(
      id,
      { name: name.trim(), description: description.trim() },
      { new: true }
    );

    if (!updatedProject) {
      return res
        .status(404)
        .json({ error: true, message: "Project not found." });
    }
    getIO().emit("project:updated", { project: updatedProject });
    return res.status(200).json({
      error: false,
      message: "Project updated successfully.",
      project: updatedProject,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: `Unable to update project: ${error.message}`,
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid project id." });
    }
    const deletedProject = await projectModel.findByIdAndDelete(id);
    if (!deletedProject) {
      return res
        .status(404)
        .json({ error: true, message: "Project not found." });
    }
    await Column.deleteMany({ projectId: id });
    await Task.deleteMany({ projectId: id });
    getIO().emit("project:deleted", { projectId: id });
    return res.status(200).json({
      error: false,
      message: "Project deleted successfully.",
      project: deletedProject,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: `Unable to delete project: ${error.message}`,
    });
  }
};

module.exports = {
  createProject,
  getProject,
  updateProject,
  deleteProject,
};
