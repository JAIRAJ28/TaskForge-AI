const mongoose = require("mongoose");
const Project = require("../models/project.model");
async function ensureMember(projectId, userId) {
  if (!mongoose.Types.ObjectId.isValid(projectId)) return false;
  const found = await Project.exists({ _id: projectId, "members.userId": userId });
  return !!found;
}
async function ensureOwner(projectId, userId) {
  if (!mongoose.Types.ObjectId.isValid(projectId)) return false;
  const found = await Project.exists({ _id: projectId, ownerId: userId });
  return !!found;
}
module.exports = { ensureMember, ensureOwner };
