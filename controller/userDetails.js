/** @format */

import { createError } from "../error.js";
import { isExistUser } from "../helper/userHelper.js";
import registerScheema from "../models/register.js";
import Notification from "../models/notification.js";
import mongoose from "mongoose";

export const getUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (userId === "" || !userId) {
      return next(createError(422, "Provide a user id"));
    }

    const existUser = await isExistUser(userId);
    const { password: password, ...others } = existUser._doc;
    if (existUser) {
      res.status(200).json({ sucess: true, userdetails: others });
    } else {
      return next(createError(403, "Requested user not found"));
    }
  } catch (error) {
    return next(createError(500, "Something went wrong"));
  }
};

// Start Edit User profile
export const editUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const updateData = req.body;
    if (!userId || !updateData) {
      return next(createError(422, "Provide a user id and update data"));
    }

    const updatedUser = await registerScheema.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return next(createError(403, "User not found or could not be updated"));
    }

    const { password, ...others } = updatedUser._doc;
    res.status(200).json({ success: true, userdetails: others });
  } catch (error) {
    console.log(error);
    return next(createError(500, "Something went wrong"));
  }
};

export const getSearchedUser = async (req, res, next) => {
  try {
    console.log("*****", req.body);
    if (req.body.name.trim()) {
      console.log("** Search user by name");
      const searchTerm = req.body.name
        ? {
            $or: [{ name: { $regex: req.body.name, $options: "i" } }],
          }
        : {};
      const users = await registerScheema
        .find(searchTerm)
        .find({
          isDelete: { $ne: true },
        })
        .select("-password");
      return res.status(200).json({ status: 200, users });
    } else if (req.body.email.trim()) {
      console.log("** Search user by email");
      const searchTerm = req.body.email
        ? {
            $or: [{ email: { $regex: req.body.email, $options: "i" } }],
          }
        : {};
      const users = await registerScheema
        .find(searchTerm)
        .find({
          isDelete: { $ne: true },
        })
        .select("-password");
      return res.status(200).json({ status: 200, users });
    } else if (req.body.mobile.trim()) {
      console.log("** Search user by mobile");
      const searchTerm = req.body.mobile
        ? {
            $or: [{ mobile: { $regex: req.body.mobile, $options: "i" } }],
          }
        : {};
      const users = await registerScheema.find(searchTerm).select("-password");
      return res.status(200).json({ status: 200, users });
    }
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const users = await registerScheema
      .find({ isDelete: { $ne: true } })
      .select("-password")
      .limit(limit)
      .skip(limit * (page - 1))
      .sort({ createdAt: -1 });
    return res.status(200).json({ status: 200, users });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    if (!req.params.userId) {
      return next(createError(422, "Provide a user id and update data"));
    } else if (!req.body.status) {
      return next(createError(422, "Status data is not provided"));
    }
    const user = await registerScheema.findById(req.params.userId);
    if (user.isDelete) {
      return next(createError(422, "User profile has already been deleted"));
    }
    const updatedUser = await registerScheema.findByIdAndUpdate(
      req.params.userId,
      { $set: { status: req.body.status } },
      { new: true, strict: false }
    );
    /* Create a notification for user */
    const notificationObj = Notification({
      _id: new mongoose.Types.ObjectId(),
      user: req.params.userId,
      type: req.body.status === "inactive" ? 1 : 2,
      fromAdmin: true,
    });
    const notificationData = await notificationObj.save();
    return res.status(200).json({
      message: "User status has been updated",
      status: 200,
      user: updatedUser,
      notification: notificationData,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProfile = async (req, res, next) => {
  try {
    if (!req.params.userId) {
      return next(createError(422, "Provide a user id and update data"));
    }
    const user = await registerScheema.findById(req.params.userId);
    if (user.isDelete === true) {
      return next(createError(422, "User profile has already been deleted"));
    }
    const updatedUser = await registerScheema.findByIdAndUpdate(
      req.params.userId,
      { $set: { isDelete: true } },
      { new: true, strict: false }
    );
    /* Create a notification for user */
    const notificationObj = Notification({
      _id: new mongoose.Types.ObjectId(),
      user: req.params.userId,
      type: 3,
      fromAdmin: true,
    });
    const notificationData = await notificationObj.save();
    return res.status(200).json({
      message: "User profile has been deleted",
      status: 200,
      user: updatedUser,
      notification: notificationData,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAccountType = async (req, res, next) => {
  try {
    if (!req.params.userId) {
      return next(createError(422, "Provide a user id and update data"));
    }
    if (!req.body.accountType) {
      return next(createError(422, "Body data is not provided"));
    }
    const user = await registerScheema.findById(req.params.userId);
    if (user.isDelete === true) {
      return next(createError(422, "User profile has already been deleted"));
    }
    const updatedUser = await registerScheema.findByIdAndUpdate(
      req.params.userId,
      { $set: { accountType: req.body.accountType } },
      { new: true, strict: false }
    );
    /* Create a notification for user */
    const notificationObj = Notification({
      _id: new mongoose.Types.ObjectId(),
      user: req.params.userId,
      type: req.body.accountType === "streamer" ? 4 : 5,
      fromAdmin: true,
      message: req.body.message,
      fromUser: req.body.fromUser 
    });
    const notificationData = await notificationObj.save();
    return res.status(200).json({
      message: "User account type has been updated",
      status: 200,
      user: updatedUser,
      notification: notificationData,
    });
  } catch (error) {
    next(error);
  }
};

export const getSearchedStreamers = async (req, res, next) => {
  try {
    const searchTerm = req.body.name
      ? {
          $or: [{ name: { $regex: req.body.name, $options: "i" } }],
        }
      : {};
    const users = await registerScheema
      .find(searchTerm)
      .find({
        accountType: { $ne: "user" },
      })
      .select("-password");
    return res.status(200).json({ status: 200, users });
  } catch (error) {
    next(error);
  }
};

export const subscribe = async (req, res, next) => {
  const { userId } = req.params;
  const { subscriberId } = req.body;

  try {
    // Find the user to subscribe to
    const user = await registerScheema.findById({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add the subscriber
    user.subscribers.push({ userId: subscriberId });
    await user.save();

    res.status(200).json({ message: "Subscribed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Adjust the path as necessary

export const follow = async (req, res, next) => {
  const { userId } = req.params;
  const { followerId } = req.body;

  // Validate userId and followerId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  if (!mongoose.Types.ObjectId.isValid(followerId)) {
    return res.status(400).json({ message: "Invalid follower ID" });
  }

  try {
    // Find the user to follow
    const user = await registerScheema.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isDuplicateFollower = user.followers.some(
      (follower) => follower.userId.toString() === followerId
    );

    if (isDuplicateFollower) {
      return next(createError(400, "You have already followed"));
    }

    // Add the follower
    user.followers.push({ userId: followerId });
    await user.save();
    await user.updateFollowerCount();

    res.status(200).json({ message: "Followed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
