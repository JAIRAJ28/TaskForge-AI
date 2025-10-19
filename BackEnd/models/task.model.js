const mongoose = require("mongoose");
const { Schema } = mongoose;
const taskSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    columnId: {
      type: Schema.Types.ObjectId,
      ref: "Column",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    order: {
      type: Number,          
      required: true,
      min: 0,
    },
    difficulty: {             
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
  },
  { timestamps: true }
);
taskSchema.index({ projectId:1, columnId:1, order:1 }, { unique:true });
taskSchema.index({ updatedAt: -1 });             
taskSchema.index({ title:"text", description:"text" });
module.exports = mongoose.model("Task", taskSchema);
