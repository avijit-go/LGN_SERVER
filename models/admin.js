import mongoose from "mongoose";
    const AdminSchema = mongoose.Schema({
    name:{
        type: String,
        required: [true, "Admin name is required"],
    },
    email:{
        type: String,
        required: [true, "Admin email is required"],
        unique: true
    },
    password: {
        type: String,
        required: true
    }
},{timestamps: true});

export default mongoose.model("Admin", AdminSchema);