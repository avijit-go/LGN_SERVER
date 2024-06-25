/** @format */

import mongoose from "mongoose";

const followerSchema =  mongoose.Schema({
    userId: { type: String, required: true }
});

const subscriberSchema = mongoose.Schema({
    userId: { type: String, required: true }
});

    const registerSchhema = mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    mobile:{
        type: String,
        required: true,
    },
    gender:{
        type: String,
    },
    age:{
        type: String,
    },
    dob:{
        type: String,
    },
    country:{
        type: String,
    },
    city: {
        type: String,
    },
    streaimingTime: {
        type: String,
    },
    status:{
        type: String,
        required: true,
        default: 'active',
    },
    accountType: {
        type: String,
        default: "user",
        required: true
    },
    password: {
        type: String,
        required: true
    },
    followers:{
        type: [followerSchema]
    },
    subscribers:{
        type: [subscriberSchema]
    },
    followerCount: { type: Number, default: 0 },
    subscriberCount: { type: Number, default: 0 }
},{timestamps: true});

registerSchhema.methods.updateFollowerCount = async function() {
    const user = this;
    user.followerCount = user.followers.length;
    await user.save();
};

registerSchhema.methods.updateSubscriberCount = async function() {
    const user = this;
    user.subscriberCount = user.subscribers.length;
    await user.save();
};

export default mongoose.model("User", registerSchhema);