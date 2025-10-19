// models/user.model.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      index: true,
    },
    password: { type: String, required: true, minlength: 3, select: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
