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
    const { name, role = "member" } = req.body || {};
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid project id." });
    }
    if (!name || typeof name !== "string" || name.trim().length < 1) {
      return res.status(400).json({ error: true, message: "Valid user name is required." });
    }
    const ownerOk = await ensureOwner(id, req.user.userId);
    if (!ownerOk) {
      return res.status(403).json({ error: true, message: "Only owner can add members." });
    }
    const user = await User.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
    }).lean();

    if (!user) {
      return res.status(404).json({ error: true, message: "User not found." });
    }
    const userId = user._id;
    const updated = await Project.findOneAndUpdate(
      { _id: id, "members.userId": { $ne: userId } },
      { $push: { members: { userId, role: role === "owner" ? "member" : role } } },
      { new: true }
    ).populate("members.userId", "name");

    if (!updated) {
      const exists = await Project.exists({ _id: id });
      if (!exists) {
        return res.status(404).json({ error: true, message: "Project not found." });
      }
      return res.status(409).json({ error: true, message: "User is already a member." });
    }

    return res
      .status(200)
      .json({ error: false, message: "Member added.", members: updated.members });
  } catch (e) {
    return res
      .status(500)
      .json({ error: true, message: `Unable to add member: ${e.message}` });
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
    console.log(req.user.userId,"req.USERIDD_______")
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
