/** @format */

import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    // option: { type: String, required: true },
    text: { type: String, required: true },
    image: { type: String, default: "" },
    user: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { _id: false }
);

const TournamentQuestion = mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },
    question: {
      type: String,
      trim: true,
      required: [true, "Question is required"],
    },
    correctOption: { type: String, default: "", enum: ["optionA", "optionB", "optionC", "optionD", ""],  },
    tourId: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament", index: true, },
    optionA: {
      text: { type: String },
      image: { type: String },
      users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    optionB: {
      text: { type: String },
      image: { type: String },
      users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    optionC: {
      text: { type: String },
      image: { type: String },
      users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    optionD: {
      text: { type: String },
      image: { type: String },
      users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

const LeaderBoardScheema = mongoose.Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Tournament Id is required"],
      ref: "Tournament",
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "User Id is required"],
      ref: "User"
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Question Id is required"],
      ref: "Question"
    },
    correctPredictions: {
      type: Boolean,
      default: false,
    },
    totalTimeSpend: {
      type: Number,
      required: [true, "Total time spent is required"],
      default: 0,
    },
    
  },
  { timestamps: true }
);

export const leaderBoardScheema = mongoose.model(
  "Leaderboard",
  LeaderBoardScheema
);

export default mongoose.model("Question", TournamentQuestion);
