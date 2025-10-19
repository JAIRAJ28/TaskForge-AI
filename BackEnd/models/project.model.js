const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 30,
    },
    description: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 3000,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: ["owner", "member"],
          default: "member",
        },
      },
    ],
  },
  { timestamps: true }
);

schema.index({ name: 1 });
schema.index({ "members.userId": 1 });
module.exports = mongoose.model("Project", schema);
