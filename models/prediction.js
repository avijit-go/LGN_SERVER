import mongoose from "mongoose";

const PredictionSchema = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId},
    user: {type: mongoose.Schema.Types.ObjectId, ref: "user", index: true},
    question: {type: mongoose.Schema.Types.ObjectId, ref: "Question"},
    answer: {type: String, deafult: ""},
    tournament: {type: mongoose.Schema.Types.ObjectId, ref: "Tournament"},
}, {timestamps: true});

export default mongoose.model("Prediction", PredictionSchema);