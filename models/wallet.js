import mongoose from "mongoose";

const WalletSchema = mongoose.Schema({
    questionId: {type: mongoose.Schema.Types.ObjectId, ref: "Question"},
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    amount: {type: Number, deafult: 0}
}, {timstamps: true});

export default mongoose.model("Wallet", WalletSchema);