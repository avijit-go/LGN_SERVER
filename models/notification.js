/** @format */

import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: Number },
    message: { type: String, trim: true },
    fromAdmin: { type: Boolean, default: false },
    fromUser: {type: mongoose.Schema.Types.ObjectId, ref: "User"}
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
