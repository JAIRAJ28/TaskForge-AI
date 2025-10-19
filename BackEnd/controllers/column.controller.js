const { ensureMember } = require('../helpers/membership');
const Column = require('../models/column.model');
const mongoose = require('mongoose');

const getColumnsByProjectId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid project id." });
    }
    if (!await ensureMember(id, req.user.userId)) {
      return res.status(403).json({ error: true, message: "Forbidden: not a project member." });
    }
    const columns = await Column.find({ projectId: id }).sort({ order: 1 });
    if (!columns.length) {
      return res.status(404).json({ error: true, message: "No columns found for this project." });
    }
    return res.status(200).json({ error: false, columns });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: `Unable to get columns: ${error.message}`,
    });
  }
};

module.exports = { getColumnsByProjectId };
