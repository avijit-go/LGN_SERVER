import mongoose from "mongoose";
    const BannerSchema = mongoose.Schema({
    name:{
        type: String,
        required: [true, "Banner name is required"],
    },
    image:{
        type: String,
        required: [true, "Banner image url is required"],
        default: ""
    },
    link: {
        type: String,
        required: [true, "Banner redirection link is required"],
        default: ""
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
      },
    isDelete: {type: Boolean, default: false}
},{timestamps: true});

export default mongoose.model("Banner", BannerSchema);