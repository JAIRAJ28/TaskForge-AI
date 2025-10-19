const mongoose = require("mongoose");
const { Schema } = mongoose;

const columnSchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  key: {
    type: String,
    enum: ["todo", "in_progress", "done", "custom"], 
    default: "todo",
  },
  name: {
    type: String,
    required: true, 
  },
  order: {
    type: Number, 
    required: true,
  },
}, { timestamps: true });

columnSchema.index({ projectId: 1, key: 1 }, { unique: false }); 
columnSchema.index({ projectId: 1, order: 1 });

module.exports = mongoose.model("Column", columnSchema);