// controllers/members.controller.js
const mongoose = require("mongoose");
const Project = require("../models/project.model");
const User = require("../models/user.model");
const { ensureOwner } = require("../helpers/membership");

const listMembers = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid project id." });
    }
    const project = await Project.findById(id).populate("members.userId", "name").lean();
    if (!project) return res.status(404).json({ error: true, message: "Project not found." });
    return res.status(200).json({ error: false, members: project.members });
  } catch (e) {
    return res.status(500).json({ error: true, message: `Unable to list members: ${e.message}` });
  }
};

const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role = "member" } = req.body || {};
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: true, message: "Invalid ids." });
    }
    const ownerOk = await ensureOwner(id, req.user.userId);
    if (!ownerOk) return res.status(403).json({ error: true, message: "Only owner can add members." });

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: true, message: "User not found." });

    const updated = await Project.findOneAndUpdate(
      { _id: id, "members.userId": { $ne: userId } },
      { $push: { members: { userId, role: role === "owner" ? "member" : role } } },
      { new: true }
    ).populate("members.userId", "name");

    return res.status(200).json({ error: false, message: "Member added.", members: updated.members });
  } catch (e) {
    return res.status(500).json({ error: true, message: `Unable to add member: ${e.message}` });
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body || {};
    if (!["owner", "member"].includes(role)) {
      return res.status(400).json({ error: true, message: "Invalid role." });
    }
    const ownerOk = await ensureOwner(id, req.user.userId);
    if (!ownerOk) return res.status(403).json({ error: true, message: "Only owner can update roles." });
    const proj = await Project.findOne({ _id: id, "members.userId": userId });
    if (!proj) return res.status(404).json({ error: true, message: "Member not found." });
    if (role === "owner") {
      proj.ownerId = userId;
      proj.members = proj.members.map(m => ({
        userId: m.userId,
        role: String(m.userId) === String(userId) ? "owner" : "member",
      }));
    } else {
      proj.members = proj.members.map(m => ({
        userId: m.userId,
        role: String(m.userId) === String(userId) ? "member" : m.role,
      }));
    }
    await proj.save();
    const populated = await Project.findById(id).populate("members.userId", "name").lean();
    return res.status(200).json({ error: false, message: "Role updated.", members: populated.members });
  } catch (e) {
    return res.status(500).json({ error: true, message: `Unable to update role: ${e.message}` });
  }
};

const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const ownerOk = await ensureOwner(id, req.user.userId);
    if (!ownerOk) return res.status(403).json({ error: true, message: "Only owner can remove members." });
    const proj = await Project.findById(id);
    if (!proj) return res.status(404).json({ error: true, message: "Project not found." });
    if (String(proj.ownerId) === String(userId)) {
      return res.status(400).json({ error: true, message: "Cannot remove the owner." });
    }
    await Project.updateOne({ _id: id }, { $pull: { members: { userId } } });
    const populated = await Project.findById(id).populate("members.userId", "name").lean();
    return res.status(200).json({ error: false, message: "Member removed.", members: populated.members });
  } catch (e) {
    return res.status(500).json({ error: true, message: `Unable to remove member: ${e.message}` });
  }
};

module.exports = { listMembers, addMember, updateMemberRole, removeMember };
